import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext, getBulkDiscount, getEffectivePrice } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import { Trash2, AlertTriangle, Tag, Minus, Plus } from 'lucide-react';
import '../user/UserLayout.css';

const Cart = () => {
  const { cartItems: contextCartItems, removeFromCart, updateCartQty } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [alertConfig, setAlertConfig] = useState({ show: false, title: '', message: '' });

  const showAlert = (title, message) => setAlertConfig({ show: true, title, message });
  const closeAlert = () => setAlertConfig(prev => ({ ...prev, show: false }));

  const cartItems = (Array.isArray(contextCartItems) ? contextCartItems : [])
    .filter(item => item !== null && typeof item === 'object');

  // Per-item calculations
  const getItemDisc    = (item) => getBulkDiscount(item.qty, item.bulkPricingTiers || []);
  const getItemPrice   = (item) => getEffectivePrice(item.price, item.qty, item.bulkPricingTiers || []);
  const getLineTotal   = (item) => getItemPrice(item) * item.qty;
  const getLineSaving  = (item) => (item.price - getItemPrice(item)) * item.qty;

  const cartSubtotal  = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);
  const totalDiscount = cartItems.reduce((acc, item) => acc + getLineSaving(item), 0);
  const cartTotal     = cartSubtotal - totalDiscount;

  // Next tier hint for an item
  const getNextTier = (item) => {
    const tiers = (item.bulkPricingTiers || []).slice().sort((a, b) => a.minQty - b.minQty);
    return tiers.find(t => t.minQty > item.qty) || null;
  };

  const isRetailer = user?.role === 'retailer';

  const checkoutHandler = () => {
    if (user?.role === 'admin') {
      showAlert('Admin Account', 'Admin accounts cannot place orders. Please use a customer account.');
      return;
    }
    for (const item of cartItems) {
      const stock = item.stockQuantity !== undefined ? item.stockQuantity : 10;
      if (item.qty > stock) {
        showAlert('Stock Mismatch', `"${item.name}" — max available is ${stock} units.`);
        return;
      }
    }
    if (!user) navigate('/login?redirect=checkout');
    else navigate('/checkout');
  };

  return (
    <div className="container" style={{ padding: '40px 20px', minHeight: '60vh' }}>
      <h1 className="text-white">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="user-card mt-3" style={{ textAlign: 'center', padding: '40px' }}>
          <h3>Your cart is empty</h3>
          <p style={{ marginTop: '10px', color: '#64748b' }}>Start adding items from our catalog.</p>
          <Link to="/" className="admin-btn-primary" style={{ display: 'inline-block', marginTop: '20px', textDecoration: 'none' }}>
            Browse Catalog
          </Link>
        </div>
      ) : (
        <div className="cart-grid">

          {/* ── Items Table ── */}
          <div className="user-card" style={{ padding: '0', overflowX: 'auto' }}>
            <table className="admin-table" style={{ minWidth: '660px' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left',   padding: '16px 20px' }}>Product</th>
                  <th style={{ textAlign: 'center', padding: '16px 20px' }}>Unit Price</th>
                  <th style={{ textAlign: 'center', padding: '16px 20px' }}>Quantity</th>
                  <th style={{ textAlign: 'center', padding: '16px 20px' }}>Line Total</th>
                  <th style={{ textAlign: 'center', padding: '16px 20px' }}></th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map(item => {
                  const disc       = getItemDisc(item);
                  const effPrice   = getItemPrice(item);
                  const lineTotal  = getLineTotal(item);
                  const lineSaving = getLineSaving(item);
                  const nextTier   = getNextTier(item);

                  return (
                    <tr key={item.product} style={{ borderBottom: '1px solid var(--border-color)' }}>

                      {/* Name + discount badge + next-tier hint */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '14px' }}>
                          {item.name}
                        </div>
                        {disc > 0 && (
                          <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            marginTop: '6px', background: 'rgba(16,185,129,0.1)',
                            color: '#10b981', fontSize: '11px', fontWeight: '800',
                            padding: '3px 8px', borderRadius: '20px', border: '1px solid rgba(16,185,129,0.25)'
                          }}>
                            <Tag size={10} /> {disc}% BULK DISCOUNT APPLIED
                          </div>
                        )}
                        {isRetailer && nextTier && (
                          <div style={{
                            marginTop: '5px', fontSize: '11px', color: '#f59e0b', fontWeight: '600'
                          }}>
                            Add {nextTier.minQty - item.qty} more → unlock {nextTier.discountPercent}% off
                          </div>
                        )}
                      </td>

                      {/* Unit price — strikethrough if discounted */}
                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        {disc > 0 ? (
                          <div>
                            <div style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '12px' }}>
                              ${Number(item.price).toFixed(2)}
                            </div>
                            <div style={{ color: '#10b981', fontWeight: '800', fontSize: '15px' }}>
                              ${effPrice.toFixed(2)}
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontWeight: '600', fontSize: '14px' }}>
                            ${Number(item.price).toFixed(2)}
                          </span>
                        )}
                      </td>

                      {/* Qty stepper */}
                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0', border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
                          <button
                            onClick={() => updateCartQty(item.product, Math.max(1, item.qty - 1))}
                            disabled={item.qty <= 1}
                            style={{ padding: '7px 11px', background: 'var(--bg-elevated)', border: 'none', cursor: item.qty <= 1 ? 'not-allowed' : 'pointer', color: item.qty <= 1 ? '#cbd5e1' : 'var(--text-primary)', display: 'flex', alignItems: 'center' }}
                          >
                            <Minus size={13} />
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.qty}
                            onChange={e => updateCartQty(item.product, Math.max(1, parseInt(e.target.value) || 1))}
                            style={{ width: '52px', textAlign: 'center', border: 'none', borderLeft: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)', padding: '7px 4px', fontWeight: '700', fontSize: '14px', background: 'var(--bg-card)', color: 'var(--text-primary)', outline: 'none' }}
                          />
                          <button
                            onClick={() => {
                              const stock = item.stockQuantity !== undefined ? item.stockQuantity : 999;
                              if (item.qty < stock) updateCartQty(item.product, item.qty + 1);
                            }}
                            style={{ padding: '7px 11px', background: 'var(--bg-elevated)', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', display: 'flex', alignItems: 'center' }}
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      </td>

                      {/* Line total + savings */}
                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        <div style={{ fontWeight: '800', fontSize: '15px', color: 'var(--text-primary)' }}>
                          ${lineTotal.toFixed(2)}
                        </div>
                        {lineSaving > 0.001 && (
                          <div style={{ color: '#10b981', fontSize: '11px', fontWeight: '700', marginTop: '3px' }}>
                            saving ${lineSaving.toFixed(2)}
                          </div>
                        )}
                      </td>

                      {/* Remove */}
                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        <button
                          onClick={() => removeFromCart(item.product)}
                          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '7px 9px', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── Order Summary ── */}
          <div className="user-card" style={{ height: 'fit-content' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', marginBottom: '18px' }}>
              Order Summary
            </h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px', color: 'var(--text-secondary)' }}>
              <span>Items ({cartItems.reduce((a, i) => a + i.qty, 0)}):</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>${cartSubtotal.toFixed(2)}</span>
            </div>

            {totalDiscount > 0.001 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#10b981', fontWeight: '700' }}>
                  <Tag size={13} /> Bulk Discount:
                </span>
                <span style={{ color: '#10b981', fontWeight: '700' }}>−${totalDiscount.toFixed(2)}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '18px', fontSize: '14px', color: 'var(--text-secondary)' }}>
              <span>Shipping:</span>
              <span>Calculated at checkout</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: '800', borderTop: '1px solid var(--border-color)', paddingTop: '15px', marginBottom: '18px' }}>
              <span>Subtotal:</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>

            {totalDiscount > 0.001 && (
              <div style={{
                background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)',
                borderRadius: '12px', padding: '11px 14px', marginBottom: '18px',
                display: 'flex', alignItems: 'center', gap: '8px',
                fontSize: '13px', color: '#10b981', fontWeight: '700'
              }}>
                <Tag size={14} />
                You're saving ${totalDiscount.toFixed(2)} with bulk pricing!
              </div>
            )}

            <button
              onClick={checkoutHandler}
              className="admin-btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '16px', fontWeight: '700', borderRadius: '12px' }}
            >
              Proceed to Checkout
            </button>
          </div>

        </div>
      )}

      {/* Alert Modal */}
      {alertConfig.show && (
        <div className="cart-alert-overlay animate-fadeIn" onClick={closeAlert}>
          <div className="cart-alert-card animate-scaleIn" onClick={e => e.stopPropagation()}>
            <div className="cart-alert-icon-wrapper">
              <AlertTriangle size={40} className="cart-alert-icon" />
            </div>
            <h2 className="cart-alert-title">{alertConfig.title}</h2>
            <p className="cart-alert-message">{alertConfig.message}</p>
            <button className="cart-alert-close-btn" onClick={closeAlert}>Got it</button>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .cart-alert-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.5); backdrop-filter: blur(12px); z-index: 99999; display: flex; align-items: center; justify-content: center; }
        .cart-alert-card { background: var(--bg-card); border-radius: 24px; padding: 45px 35px; max-width: 440px; width: 90%; text-align: center; border: 1px solid var(--border-color); box-shadow: 0 25px 60px -15px rgba(0,0,0,0.45); display: flex; flex-direction: column; align-items: center; }
        .cart-alert-icon-wrapper { width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 22px; background: rgba(245,158,11,0.12); color: #f59e0b; animation: cartPulse 2.5s infinite; }
        .cart-alert-title { font-size: 22px; font-weight: 800; color: var(--text-primary); margin: 0 0 12px 0; }
        .cart-alert-message { font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin: 0 0 28px 0; font-weight: 500; }
        .cart-alert-close-btn { width: 100%; padding: 14px; border-radius: 12px; font-size: 15px; font-weight: 700; border: none; cursor: pointer; background: #f59e0b; color: white; transition: all 0.2s; }
        .cart-alert-close-btn:hover { background: #d97706; transform: translateY(-1px); }
        .animate-fadeIn { animation: cartFadeIn 0.25s ease forwards; }
        .animate-scaleIn { animation: cartScaleIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        @keyframes cartFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes cartScaleIn { from { transform: scale(0.9) translateY(16px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
        @keyframes cartPulse { 0% { box-shadow: 0 0 0 0 rgba(245,158,11,0.4); } 70% { box-shadow: 0 0 0 12px rgba(245,158,11,0); } 100% { box-shadow: 0 0 0 0 rgba(245,158,11,0); } }
        input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
      `}} />
    </div>
  );
};

export default Cart;
