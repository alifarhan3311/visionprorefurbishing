import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import { Trash2, AlertTriangle } from 'lucide-react';
import '../user/UserLayout.css'; // Reusing some card styles

const Cart = () => {
  const { cartItems: contextCartItems, removeFromCart, updateCartQty } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [alertConfig, setAlertConfig] = useState({
    show: false,
    title: '',
    message: ''
  });

  const showAlert = (title, message) => {
    setAlertConfig({ show: true, title, message });
  };

  const closeAlert = () => {
    setAlertConfig(prev => ({ ...prev, show: false }));
  };

  const cartItems = (Array.isArray(contextCartItems) ? contextCartItems : []).filter(item => item !== null && typeof item === 'object');
  const cartTotal = cartItems.reduce((acc, item) => acc + (item.qty || 0) * (item.price || 0), 0).toFixed(2);

  const checkoutHandler = () => {
    // 1. Validate available stock quantities
    for (const item of cartItems) {
      const stock = item.stockQuantity !== undefined ? item.stockQuantity : 10;
      if (item.qty > stock) {
        showAlert(
          'Stock Mismatch',
          `Requested quantity for "${item.name}" exceeds current ledger availability. You can order a maximum of ${stock} units.`
        );
        return;
      }
    }

    // 2. Redirect check
    if (!user) {
      navigate('/login?redirect=checkout');
    } else {
      navigate('/checkout');
    }
  };

  return (
    <div className="container" style={{ padding: '40px 20px', minHeight: '60vh' }}>
      <h1 className="user-page-title">Shopping Cart</h1>
      
      {cartItems.length === 0 ? (
        <div className="user-card" style={{ textAlign: 'center', padding: '40px' }}>
          <h3>Your cart is empty</h3>
          <p style={{ marginTop: '10px', color: '#64748b' }}>Start adding items from our extensive catalog.</p>
          <Link to="/" className="admin-btn-primary" style={{ display: 'inline-block', marginTop: '20px', textDecoration: 'none' }}>Go Back</Link>
        </div>
      ) : (
        <div className="cart-grid">
          
          <div className="user-card" style={{ padding: '0', overflowX: 'auto' }}>
            <table className="admin-table" style={{ minWidth: '600px' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '15px' }}>Item</th>
                  <th style={{ textAlign: 'center', padding: '15px' }}>Price</th>
                  <th style={{ textAlign: 'center', padding: '15px' }}>Quantity</th>
                  <th style={{ textAlign: 'center', padding: '15px' }}>Remove</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map(item => (
                  <tr key={item.product} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '15px', fontWeight: '500' }}>{item.name}</td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>${Number(item.price || 0).toFixed(2)}</td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      <input 
                        type="number" 
                        min="1"
                        value={item.qty} 
                        onChange={(e) => updateCartQty(item.product, Math.max(1, parseInt(e.target.value) || 1))}
                        style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', width: '80px', textAlign: 'center', fontWeight: '600' }}
                      />
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      <button onClick={() => removeFromCart(item.product)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="user-card" style={{ height: 'fit-content' }}>
            <h3 style={{ fontSize: '18px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', marginBottom: '15px' }}>Order Summary</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '14px' }}>
              <span>Items ({cartItems.reduce((acc, item) => acc + item.qty, 0)}):</span>
              <span>${cartTotal}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '14px' }}>
              <span>Shipping:</span>
              <span>Calculated at checkout</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '18px', fontWeight: '700', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
              <span>Subtotal:</span>
              <span>${cartTotal}</span>
            </div>
            <button onClick={checkoutHandler} className="admin-btn-primary" style={{ width: '100%', padding: '12px', fontSize: '16px' }}>
              Proceed to Checkout
            </button>
          </div>

        </div>
      )}

      {/* Premium Glassmorphism Alert Modal */}
      {alertConfig.show && (
        <div className="cart-alert-overlay animate-fadeIn" onClick={closeAlert}>
          <div className="cart-alert-card animate-scaleIn" onClick={e => e.stopPropagation()}>
            <div className="cart-alert-icon-wrapper">
              <AlertTriangle size={40} className="cart-alert-icon" />
            </div>
            <h2 className="cart-alert-title">{alertConfig.title}</h2>
            <p className="cart-alert-message">{alertConfig.message}</p>
            <button 
              className="cart-alert-close-btn" 
              onClick={closeAlert}
            >
              Adjust Quantity
            </button>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        /* Premium Glassmorphism Alert Overlay */
        .cart-alert-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Glassmorphism Alert Card */
        .cart-alert-card {
          background: rgba(255, 255, 255, 0.96);
          border-radius: 24px;
          padding: 45px 35px;
          max-width: 460px;
          width: 90%;
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.85);
          box-shadow: 0 25px 60px -15px rgba(15, 23, 42, 0.3);
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: all 0.3s ease;
        }

        /* Elegant Pulsing Icon Wrapper */
        .cart-alert-icon-wrapper {
          width: 84px;
          height: 84px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
          background-color: #fffbeb;
          color: #f59e0b;
          animation: cartPulseWarning 2.5s infinite;
        }

        .cart-alert-icon {
          stroke-width: 2.2px;
        }

        /* Bold Premium Typography */
        .cart-alert-title {
          font-size: 24px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 14px 0;
          letter-spacing: -0.025em;
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        }

        .cart-alert-message {
          font-size: 15px;
          color: #475569;
          line-height: 1.6;
          margin: 0 0 32px 0;
          font-weight: 500;
        }

        /* Premium Interaction Button */
        .cart-alert-close-btn {
          width: 100%;
          padding: 15px 28px;
          border-radius: 14px;
          font-size: 15px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.15);
          outline: none;
          background-color: #f59e0b;
          color: white;
        }
        .cart-alert-close-btn:hover {
          background-color: #d97706;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(245, 158, 11, 0.35);
        }
        .cart-alert-close-btn:active {
          transform: translateY(0);
        }

        /* Animation Keyframes */
        .animate-fadeIn {
          animation: cartFadeIn 0.3s ease-out forwards;
        }

        .animate-scaleIn {
          animation: cartScaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        @keyframes cartFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes cartScaleIn {
          from {
            transform: scale(0.92) translateY(15px);
            opacity: 0;
          }
          to {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }

        @keyframes cartPulseWarning {
          0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.45); }
          70% { box-shadow: 0 0 0 14px rgba(245, 158, 11, 0); }
          100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
        }
      `}} />
    </div>
  );
};

export default Cart;
