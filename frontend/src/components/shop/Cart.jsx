import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import { Trash2 } from 'lucide-react';
import '../user/UserLayout.css'; // Reusing some card styles

const Cart = () => {
  const { cartItems: contextCartItems, removeFromCart, updateCartQty } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const cartItems = (Array.isArray(contextCartItems) ? contextCartItems : []).filter(item => item !== null && typeof item === 'object');
  const cartTotal = cartItems.reduce((acc, item) => acc + (item.qty || 0) * (item.price || 0), 0).toFixed(2);

  const checkoutHandler = () => {
    // 1. Validate available stock quantities
    for (const item of cartItems) {
      const stock = item.stockQuantity !== undefined ? item.stockQuantity : 10;
      if (item.qty > stock) {
        alert(`Stock mismatch: Requested quantity for "${item.name}" exceeds current ledger availability. You can order a maximum of ${stock} units.`);
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
    </div>
  );
};

export default Cart;
