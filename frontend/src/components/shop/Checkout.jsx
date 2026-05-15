import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import api from '../../services/api';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CheckCircle2 } from 'lucide-react';
import '../user/UserLayout.css';

// Replace with your Stripe publishable key
const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

const StripeCheckoutForm = ({ clientSecret, handleOrderSubmit }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
      confirmParams: {
        return_url: window.location.origin + '/dashboard/orders',
      },
    });

    if (error) {
      setError(error.message);
      setProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      handleOrderSubmit();
    } else {
      setError('An unexpected error occurred.');
      setProcessing(false);
    }
  };

  return (
    <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
      <form onSubmit={handleSubmit}>
        <PaymentElement />
        <button disabled={!stripe || processing} className="admin-btn-primary" style={{ marginTop: '20px', width: '100%', backgroundColor: '#10b981', padding: '12px', fontSize: '16px' }}>
          {processing ? 'Processing Payment...' : 'Pay securely with Stripe'}
        </button>
        {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
      </form>
    </div>
  );
};

const Checkout = () => {
  const { cartItems, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState({
    address: '',
    city: '',
    postalCode: '',
    country: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('Store Credit / Invoice');
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const cartTotal = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);
  const tax = cartTotal * 0.08;
  const shipping = cartTotal > 500 ? 0 : 25;
  const finalTotal = cartTotal + tax + shipping;

  useEffect(() => {
    if (paymentMethod === 'Credit Card') {
      const getClientSecret = async () => {
        try {
          const res = await api.post('/payment/create-payment-intent', { amount: finalTotal });
          if (res.data.success) {
            setClientSecret(res.data.clientSecret);
          }
        } catch (err) {
          console.error("Failed to initialize Stripe", err);
        }
      };
      getClientSecret();
    } else {
      setClientSecret('');
    }
  }, [paymentMethod, finalTotal]);

  const handlePlaceOrder = async (e) => {
    if (e) e.preventDefault(); // Might be called programmatically by Stripe form
    setLoading(true);
    
    try {
      const response = await api.post('/orders', {
        orderItems: cartItems,
        shippingAddress,
        paymentMethod,
        itemsPrice: cartTotal,
        taxPrice: tax,
        shippingPrice: shipping,
        totalPrice: finalTotal
      });

      if (response.data.success) {
        clearCart();
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Error placing order');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
  };

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="container" style={{ padding: '40px 20px', minHeight: '60vh' }}>
      <h1 className="user-page-title">Checkout</h1>
      
      <div className="cart-grid">
        
        <div>
          <form id="checkout-address-form" onSubmit={(e) => { e.preventDefault(); if (paymentMethod === 'Store Credit / Invoice') handlePlaceOrder(); }} className="user-card" style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '15px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>Shipping Address</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
              <input type="text" name="address" value={shippingAddress.address} onChange={handleChange} placeholder="Address" required style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <input type="text" name="city" value={shippingAddress.city} onChange={handleChange} placeholder="City" required style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                <input type="text" name="postalCode" value={shippingAddress.postalCode} onChange={handleChange} placeholder="Postal Code" required style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
              </div>
              <input type="text" name="country" value={shippingAddress.country} onChange={handleChange} placeholder="Country" required style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
            </div>

            <h3 style={{ margin: '30px 0 15px 0', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>Payment Method</h3>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input type="radio" value="Store Credit / Invoice" checked={paymentMethod === 'Store Credit / Invoice'} onChange={(e) => setPaymentMethod(e.target.value)} />
                Pay via Store Credit / Net 30 Invoice
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px', cursor: 'pointer' }}>
                <input type="radio" value="Credit Card" checked={paymentMethod === 'Credit Card'} onChange={(e) => setPaymentMethod(e.target.value)} />
                Credit Card (Stripe)
              </label>
            </div>
          </form>

          {/* Stripe Elements wrapper - only show if CC selected and clientSecret fetched */}
          {paymentMethod === 'Credit Card' && clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <StripeCheckoutForm clientSecret={clientSecret} handleOrderSubmit={handlePlaceOrder} />
            </Elements>
          )}
        </div>

        <div className="user-card" style={{ height: 'fit-content' }}>
          <h3 style={{ fontSize: '18px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', marginBottom: '15px' }}>Order Summary</h3>
          
          <div style={{ marginBottom: '20px', maxHeight: '200px', overflowY: 'auto' }}>
            {cartItems.map((item, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
                <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '10px' }}>{item.qty}x {item.name}</span>
                <span>${(item.qty * item.price).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
            <span>Items:</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
            <span>Shipping:</span>
            <span>${shipping.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '14px' }}>
            <span>Tax (8%):</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '18px', fontWeight: '700', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
            <span>Total:</span>
            <span>${finalTotal.toFixed(2)}</span>
          </div>
          
          {paymentMethod === 'Store Credit / Invoice' && (
            <button 
              type="submit" 
              form="checkout-address-form"
              disabled={loading}
              className="admin-btn-primary" 
              style={{ width: '100%', padding: '12px', fontSize: '16px', backgroundColor: '#10b981' }}
            >
              {loading ? 'Processing...' : 'Place B2B Order'}
            </button>
          )}
          
        </div>
      </div>

      {showSuccessModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', padding: '40px', borderRadius: '24px', textAlign: 'center', maxWidth: '400px', width: '90%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', animation: 'modalPop 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            <div style={{ width: '80px', height: '80px', background: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
              <CheckCircle2 size={40} color="#10b981" />
            </div>
            <h2 style={{ margin: '0 0 12px 0', color: '#0f172a', fontSize: '24px', fontWeight: '700', fontFamily: "'Inter', sans-serif" }}>Order Confirmed!</h2>
            <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '15px', lineHeight: '1.5' }}>Your B2B order has been successfully placed. We're getting it ready for shipment.</p>
            <button 
              onClick={() => { setShowSuccessModal(false); navigate('/dashboard/orders'); }}
              className="admin-btn-primary"
              style={{ padding: '14px 24px', fontSize: '16px', width: '100%', backgroundColor: '#10b981', borderRadius: '12px', fontWeight: '600' }}
            >
              View My Orders
            </button>
          </div>
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes modalPop {
              0% { transform: scale(0.9) translateY(20px); opacity: 0; }
              100% { transform: scale(1) translateY(0); opacity: 1; }
            }
          `}} />
        </div>
      )}
    </div>
  );
};

export default Checkout;
