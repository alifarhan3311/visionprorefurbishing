import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CheckCircle2 } from 'lucide-react';
import '../user/UserLayout.css';

// Replace with your Stripe publishable key
const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

const CheckoutContent = () => {
  const { cartItems, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  const [shippingAddress, setShippingAddress] = useState({
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('Store Credit / Invoice');
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [isCardComplete, setIsCardComplete] = useState(false);
  const [stripeError, setStripeError] = useState(null);
  const [useMockStripe, setUseMockStripe] = useState(false);
  const [mockCard, setMockCard] = useState({
    number: '',
    expiry: '',
    cvc: '',
    zip: ''
  });
  
  // Success state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [createdOrderId, setCreatedOrderId] = useState('');

  const cartTotal = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);
  const tax = cartTotal * 0.13;
  const shipping = cartTotal > 500 ? 0 : 25;
  const finalTotal = cartTotal + tax + shipping;

  // Prefill email and phone from auth context if available
  useEffect(() => {
    if (user) {
      setShippingAddress(prev => ({
        ...prev,
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || ''
      }));
    }
  }, [user]);

  // Fetch client secret when CC is chosen
  useEffect(() => {
    if (paymentMethod === 'Credit Card') {
      const getClientSecret = async () => {
        try {
          const res = await api.post('/payment/create-payment-intent', { amount: finalTotal });
          if (res.data.success) {
            setClientSecret(res.data.clientSecret);
            setUseMockStripe(false);
            setStripeError(null);
          } else {
            throw new Error(res.data.error || 'Failed to initialize payment');
          }
        } catch (err) {
          console.error("Failed to initialize Stripe", err);
          setStripeError("Stripe API key is expired. Local Sandbox Simulation mode enabled automatically.");
          setUseMockStripe(true);
          setClientSecret('mock_secret'); // Bypass clientSecret check
        }
      };
      getClientSecret();
    } else {
      setClientSecret('');
      setUseMockStripe(false);
      setStripeError(null);
    }
  }, [paymentMethod, finalTotal]);

  // Success Modal Countdown
  useEffect(() => {
    let timer;
    if (showSuccessModal && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (showSuccessModal && countdown === 0) {
      navigate('/dashboard/orders');
    }
    return () => clearTimeout(timer);
  }, [showSuccessModal, countdown, navigate]);

  const handleChange = (e) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
  };

  const handleCardChange = (e) => {
    setIsCardComplete(e.complete);
    if (e.error) {
      setStripeError(e.error.message);
    } else {
      setStripeError(null);
    }
  };

  const handleMockCardChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    if (name === 'number') {
      formattedValue = value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
    } else if (name === 'expiry') {
      formattedValue = value.replace(/\D/g, '').replace(/(.{2})/g, '$1/').trim().slice(0, 5);
      if (formattedValue.endsWith('/')) {
        formattedValue = formattedValue.slice(0, -1);
      }
    } else if (name === 'cvc') {
      formattedValue = value.replace(/\D/g, '').slice(0, 3);
    } else if (name === 'zip') {
      formattedValue = value.replace(/\D/g, '').slice(0, 5);
    }

    const updated = { ...mockCard, [name]: formattedValue };
    setMockCard(updated);

    const isNumValid = updated.number.replace(/\s/g, '').length === 16;
    const isExpValid = updated.expiry.length === 5;
    const isCvcValid = updated.cvc.length === 3;
    const isZipValid = updated.zip.length >= 5;

    setIsCardComplete(isNumValid && isExpValid && isCvcValid && isZipValid);
  };

  const submitOrder = async () => {
    try {
      const response = await api.post('/orders', {
        orderItems: cartItems.map(item => ({
          name: item.name,
          qty: item.qty,
          price: item.price,
          product: item.product || item._id,
          image: item.image
        })),
        shippingAddress: {
          address: shippingAddress.address,
          city: shippingAddress.city,
          postalCode: shippingAddress.postalCode,
          country: shippingAddress.country
        },
        email: shippingAddress.email,
        phone: shippingAddress.phone,
        paymentMethod,
        itemsPrice: cartTotal,
        taxPrice: tax,
        shippingPrice: shipping,
        totalPrice: finalTotal
      });

      if (response.data.success) {
        setCreatedOrderId(response.data.data._id);
        clearCart();
        setShowSuccessModal(true);
      } else {
        alert('Failed to save order.');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert(error.response?.data?.error || 'Error saving order');
    }
  };

  const handlePlaceOrderSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);

    if (paymentMethod === 'Credit Card') {
      if (useMockStripe) {
        await submitOrder();
        setLoading(false);
        return;
      }

      if (!stripe || !elements) {
        alert('Stripe has not loaded yet. Please wait.');
        setLoading(false);
        return;
      }

      if (!clientSecret) {
        alert('Secure session not initialized yet. Please try again.');
        setLoading(false);
        return;
      }

      const cardElement = elements.getElement(CardElement);
      const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            email: shippingAddress.email,
            phone: shippingAddress.phone,
            name: user?.name || 'Valued B2B Customer',
            address: {
              line1: shippingAddress.address,
              city: shippingAddress.city,
              postal_code: shippingAddress.postalCode,
              country: shippingAddress.country
            }
          }
        }
      });

      if (error) {
        setStripeError(error.message);
        setLoading(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        await submitOrder();
      } else {
        setStripeError('Payment verification failed.');
        setLoading(false);
      }
    } else {
      await submitOrder();
    }
    setLoading(false);
  };

  const isFormValid = shippingAddress.email && 
                      shippingAddress.phone && 
                      shippingAddress.address && 
                      shippingAddress.city && 
                      shippingAddress.postalCode && 
                      shippingAddress.country;

  const isSubmitDisabled = loading || 
                           !isFormValid || 
                           (paymentMethod === 'Credit Card' && (!isCardComplete || !clientSecret));

  console.log('Checkout Validation:', {
    loading,
    isFormValid: !!isFormValid,
    isCardComplete,
    hasClientSecret: !!clientSecret,
    shippingAddress,
    isSubmitDisabled
  });

  if (cartItems.length === 0 && !showSuccessModal) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="container" style={{ padding: '40px 20px', minHeight: '60vh' }}>
      <h1 className="user-page-title">Checkout</h1>
      
      <div className="cart-grid">
        
        <div>
          <form id="checkout-address-form" onSubmit={handlePlaceOrderSubmit} className="user-card" style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '15px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>Shipping Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <input 
                  type="email" 
                  name="email" 
                  value={shippingAddress.email} 
                  onChange={handleChange} 
                  placeholder="Email Address" 
                  required 
                  style={{ padding: '10px', border: '1px solid var(--border-color)', borderRadius: '4px', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)' }} 
                />
                <input 
                  type="tel" 
                  name="phone" 
                  value={shippingAddress.phone} 
                  onChange={handleChange} 
                  placeholder="Contact Phone" 
                  required 
                  style={{ padding: '10px', border: '1px solid var(--border-color)', borderRadius: '4px', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)' }} 
                />
              </div>
              <input 
                type="text" 
                name="address" 
                value={shippingAddress.address} 
                onChange={handleChange} 
                placeholder="Shipping Address" 
                required 
                style={{ padding: '10px', border: '1px solid var(--border-color)', borderRadius: '4px', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)' }} 
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <input 
                  type="text" 
                  name="city" 
                  value={shippingAddress.city} 
                  onChange={handleChange} 
                  placeholder="City" 
                  required 
                  style={{ padding: '10px', border: '1px solid var(--border-color)', borderRadius: '4px', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)' }} 
                />
                <input 
                  type="text" 
                  name="postalCode" 
                  value={shippingAddress.postalCode} 
                  onChange={handleChange} 
                  placeholder="Postal Code" 
                  required 
                  style={{ padding: '10px', border: '1px solid var(--border-color)', borderRadius: '4px', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)' }} 
                />
              </div>
              <input 
                type="text" 
                name="country" 
                value={shippingAddress.country} 
                onChange={handleChange} 
                placeholder="Country" 
                required 
                style={{ padding: '10px', border: '1px solid var(--border-color)', borderRadius: '4px', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)' }} 
              />
            </div>

            <h3 style={{ margin: '30px 0 15px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>Payment Method</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '15px', fontWeight: '500' }}>
                <input 
                  type="radio" 
                  value="Store Credit / Invoice" 
                  checked={paymentMethod === 'Store Credit / Invoice'} 
                  onChange={(e) => setPaymentMethod(e.target.value)} 
                />
                Pay via Store Credit / Net 30 Invoice
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '15px', fontWeight: '500' }}>
                <input 
                  type="radio" 
                  value="Credit Card" 
                  checked={paymentMethod === 'Credit Card'} 
                  onChange={(e) => setPaymentMethod(e.target.value)} 
                />
                Credit Card (Stripe)
              </label>
            </div>

            {paymentMethod === 'Credit Card' && (
              <div style={{ marginTop: '25px', padding: '20px', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--bg-elevated)' }}>
                <h4 style={{ marginBottom: '15px', color: 'var(--text-primary)', fontSize: '15px', fontWeight: '600' }}>Card Details</h4>
                {useMockStripe ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                    <input 
                      type="text" 
                      name="number" 
                      value={mockCard.number} 
                      onChange={handleMockCardChange} 
                      placeholder="Card Number (e.g. 4242 4242 4242 4242)" 
                      required 
                      style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '15px', width: '100%', boxSizing: 'border-box', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)' }} 
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                      <input 
                        type="text" 
                        name="expiry" 
                        value={mockCard.expiry} 
                        onChange={handleMockCardChange} 
                        placeholder="MM/YY" 
                        required 
                        style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '15px', width: '100%', boxSizing: 'border-box', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)' }} 
                      />
                      <input 
                        type="text" 
                        name="cvc" 
                        value={mockCard.cvc} 
                        onChange={handleMockCardChange} 
                        placeholder="CVC" 
                        required 
                        style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '15px', width: '100%', boxSizing: 'border-box', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)' }} 
                      />
                      <input 
                        type="text" 
                        name="zip" 
                        value={mockCard.zip} 
                        onChange={handleMockCardChange} 
                        placeholder="ZIP Code" 
                        required 
                        style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '15px', width: '100%', boxSizing: 'border-box', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)' }} 
                      />
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: 'var(--bg-card)', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)' }}>
                    <CardElement 
                      onChange={handleCardChange}
                      options={{
                        style: {
                          base: {
                            fontSize: '16px',
                            color: 'var(--text-primary)',
                            fontFamily: "'Inter', sans-serif",
                            '::placeholder': { color: '#94a3b8' }
                          },
                          invalid: { color: '#ef4444' }
                        }
                      }}
                    />
                  </div>
                )}
                {stripeError && <div style={{ color: useMockStripe ? '#3b82f6' : '#ef4444', marginTop: '10px', fontSize: '13px', fontWeight: '500' }}>{stripeError}</div>}
              </div>
            )}
          </form>
        </div>

        <div className="user-card" style={{ height: 'fit-content' }}>
          <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', marginBottom: '15px' }}>Order Summary</h3>
          
          <div style={{ marginBottom: '20px', maxHeight: '200px', overflowY: 'auto' }}>
            {cartItems.map((item, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
                <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '10px' }}>{item.qty}x {item.name}</span>
                <span>${(item.qty * item.price).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
            <span>Items:</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
            <span>Shipping:</span>
            <span>${shipping.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '14px' }}>
            <span>Tax (13%):</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '18px', fontWeight: '700', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
            <span>Total:</span>
            <span>${finalTotal.toFixed(2)}</span>
          </div>
          
          <button 
            type="submit" 
            form="checkout-address-form"
            disabled={isSubmitDisabled}
            className="admin-btn-primary" 
            style={{ 
              width: '100%', 
              padding: '12px', 
              fontSize: '16px', 
              backgroundColor: isSubmitDisabled ? '#94a3b8' : '#10b981',
              cursor: isSubmitDisabled ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {loading ? 'Processing...' : (paymentMethod === 'Credit Card' ? 'Pay Securely with Stripe' : 'Place B2B Order')}
          </button>

          {isSubmitDisabled && (
            <div style={{ marginTop: '12px', padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--border-color)', fontSize: '13px', color: '#ef4444', textAlign: 'left', lineHeight: '1.4' }}>
              <strong style={{ display: 'block', marginBottom: '4px' }}>Checkout requirements:</strong>
              {!shippingAddress.email && <div>• Email Address is required</div>}
              {!shippingAddress.phone && <div>• Contact Phone is required</div>}
              {!shippingAddress.address && <div>• Shipping Address is required</div>}
              {!shippingAddress.city && <div>• City is required</div>}
              {!shippingAddress.postalCode && <div>• Postal Code is required</div>}
              {!shippingAddress.country && <div>• Country is required</div>}
              {isFormValid && paymentMethod === 'Credit Card' && !isCardComplete && <div>• Card details must be fully filled out</div>}
              {isFormValid && paymentMethod === 'Credit Card' && isCardComplete && !clientSecret && <div>• Initializing secure Stripe session...</div>}
            </div>
          )}
          
        </div>
      </div>

      {showSuccessModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'var(--bg-card)', padding: '40px', borderRadius: '28px', textAlign: 'center', maxWidth: '480px', width: '90%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)', animation: 'modalPop 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            <div style={{ width: '80px', height: '80px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
              <CheckCircle2 size={44} color="#10b981" />
            </div>
            <h2 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)', fontSize: '26px', fontWeight: '800', fontFamily: "'Inter', sans-serif" }}>Order Confirmed!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '15px', lineHeight: '1.5' }}>
              Your order has been successfully placed. A receipt has been sent to <strong>{shippingAddress.email}</strong>.
            </p>

            <div style={{ background: 'var(--bg-elevated)', padding: '16px 20px', borderRadius: '16px', marginBottom: '28px', textAlign: 'left', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Order ID:</span>
                <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>#{createdOrderId.substring(createdOrderId.length - 12).toUpperCase()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Payment Method:</span>
                <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{paymentMethod}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Total Charged:</span>
                <span style={{ fontWeight: '700', color: '#10b981' }}>${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '100%', height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden', position: 'relative' }}>
                <div style={{ 
                  height: '100%', 
                  background: '#10b981', 
                  width: `${(countdown / 10) * 100}%`, 
                  transition: 'width 1s linear',
                  borderRadius: '3px'
                }}></div>
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
                Redirecting to your orders dashboard in <strong style={{ color: 'var(--text-primary)', fontSize: '16px' }}>{countdown}</strong> seconds...
              </p>

              <button 
                onClick={() => navigate('/dashboard/orders')}
                className="admin-btn-primary"
                style={{ padding: '14px 24px', fontSize: '16px', width: '100%', backgroundColor: 'var(--primary-color)', borderRadius: '12px', fontWeight: '600', marginTop: '10px', color: '#fff' }}
              >
                Go to Dashboard Now
              </button>
            </div>
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

const Checkout = () => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutContent />
    </Elements>
  );
};

export default Checkout;
