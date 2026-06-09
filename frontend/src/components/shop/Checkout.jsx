import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { getBulkDiscount, getEffectivePrice } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { CheckCircle2, Tag } from 'lucide-react';
import CloverPayment from './CloverPayment';
import '../user/UserLayout.css';

const CheckoutContent = () => {
  const { cartItems, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [shippingAddress, setShippingAddress] = useState({
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('Clover');
  const [loading, setLoading] = useState(false);
  const [cloverToken, setCloverToken] = useState('');
  const [cloverError, setCloverError] = useState(null);

  // Success state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [createdOrderId, setCreatedOrderId] = useState('');

  const cartSubtotal  = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);
  const totalDiscount = cartItems.reduce((acc, item) => {
    const disc = getBulkDiscount(item.qty, item.bulkPricingTiers || []);
    return acc + (item.qty * item.price * disc / 100);
  }, 0);
  const cartTotal  = cartSubtotal - totalDiscount;
  const tax        = cartTotal * 0.08;
  const shipping   = cartTotal > 500 ? 0 : 25;
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

  const submitOrder = async (paymentResult = {}) => {
    try {
      const response = await api.post('/orders', {
        orderItems: cartItems.map(item => ({
          name: item.name,
          qty: item.qty,
          price: getEffectivePrice(item.price, item.qty, item.bulkPricingTiers || []),
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
        paymentResult,
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
    setCloverError(null);

    try {
      if (paymentMethod === 'Clover') {
        if (!cloverToken) {
          setCloverError('Clover payment token is required for this payment method.');
          setLoading(false);
          return;
        }

        const paymentResponse = await api.post('/payment/clover-charge', {
          token: cloverToken,
          amount: finalTotal,
          currency: 'usd'
        });

        if (!paymentResponse.data.success) {
          setCloverError(paymentResponse.data.error || 'Clover payment failed.');
          setLoading(false);
          return;
        }

        const paymentResult = {
          id: paymentResponse.data.chargeId,
          status: paymentResponse.data.status,
          update_time: new Date().toISOString(),
          email_address: shippingAddress.email
        };

        await submitOrder(paymentResult);
      } else {
        await submitOrder();
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setCloverError(error.response?.data?.error || 'Checkout failed.');
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
                           (paymentMethod === 'Clover' && !cloverToken);

  console.log('Checkout Validation:', {
    loading,
    isFormValid: !!isFormValid,
    paymentMethod,
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
                  value="Clover" 
                  checked={paymentMethod === 'Clover'} 
                  onChange={(e) => setPaymentMethod(e.target.value)} 
                />
                Pay with Clover
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '15px', fontWeight: '500' }}>
                <input 
                  type="radio" 
                  value="Cash on Delivery" 
                  checked={paymentMethod === 'Cash on Delivery'} 
                  onChange={(e) => setPaymentMethod(e.target.value)} 
                />
                Cash on Delivery (COD)
              </label>
            </div>

{paymentMethod === 'Clover' && (
               <CloverPayment
                 amount={finalTotal}
                 onTokenGenerated={(token) => {
                   setCloverToken(token);
                   setCloverError(null);
                 }}
                 onError={(error) => setCloverError(error)}
                 disabled={loading}
               />
             )}
             {cloverError && <div style={{ color: '#ef4444', marginTop: '10px', fontSize: '13px', fontWeight: '500' }}>{cloverError}</div>}
           </form>
         </div>

        <div className="user-card" style={{ height: 'fit-content' }}>
          <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', marginBottom: '15px' }}>Order Summary</h3>
          
          <div style={{ marginBottom: '20px', maxHeight: '220px', overflowY: 'auto' }}>
            {cartItems.map((item, index) => {
              const disc      = getBulkDiscount(item.qty, item.bulkPricingTiers || []);
              const effPrice  = getEffectivePrice(item.price, item.qty, item.bulkPricingTiers || []);
              const lineTotal = effPrice * item.qty;
              return (
                <div key={index} style={{ marginBottom: '12px', fontSize: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '10px' }}>
                      {item.qty}× {item.name}
                    </span>
                    <span style={{ fontWeight: '600' }}>${lineTotal.toFixed(2)}</span>
                  </div>
                  {disc > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', fontSize: '11px', fontWeight: '700', marginTop: '2px' }}>
                      <Tag size={10} /> {disc}% bulk discount applied
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
            <span>Items:</span>
            <span>${cartSubtotal.toFixed(2)}</span>
          </div>
          {totalDiscount > 0.001 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px', color: '#10b981', fontWeight: '700' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Tag size={13} /> Bulk Discount:</span>
              <span>−${totalDiscount.toFixed(2)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
            <span>Shipping:</span>
            <span>{shipping === 0 ? <span style={{ color: '#10b981', fontWeight: '700' }}>FREE</span> : `$${shipping.toFixed(2)}`}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '14px' }}>
            <span>Tax (8%):</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '20px', fontWeight: '800', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
            <span>Total:</span>
            <span>${finalTotal.toFixed(2)}</span>
          </div>
          {totalDiscount > 0.001 && (
            <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '12px', padding: '10px 14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#10b981', fontWeight: '700' }}>
              <Tag size={14} /> You're saving ${totalDiscount.toFixed(2)} with bulk pricing!
            </div>
          )}
          
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
            {loading ? 'Processing...' : (paymentMethod === 'Clover' ? 'Pay with Clover' : 'Confirm COD Order')}
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
              {isFormValid && paymentMethod === 'Clover' && !cloverToken && <div>• Clover payment token is required</div>}
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
  return <CheckoutContent />;
};

export default Checkout;
