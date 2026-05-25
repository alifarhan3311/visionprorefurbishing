import React, { createContext, useState, useEffect } from 'react';
import { CheckCircle2, X, Tag } from 'lucide-react';

export const CartContext = createContext();

// Helper: given qty and bulkPricingTiers, return the best applicable discount %
export const getBulkDiscount = (qty, bulkPricingTiers) => {
  // Only retailers should receive bulk discounts
  if (typeof window !== 'undefined') {
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'retailer') return 0;
  }
  if (!bulkPricingTiers || bulkPricingTiers.length === 0) return 0;
  const sorted = [...bulkPricingTiers].sort((a, b) => b.minQty - a.minQty);
  const match = sorted.find(t => qty >= t.minQty);
  return match ? match.discountPercent : 0;
};

// Helper: get effective unit price after bulk discount
export const getEffectivePrice = (basePrice, qty, bulkPricingTiers) => {
  const disc = getBulkDiscount(qty, bulkPricingTiers);
  return basePrice * (1 - disc / 100);
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', discount: 0 });

  useEffect(() => {
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart && savedCart !== "undefined" && savedCart !== "null") {
      try {
        const parsed = JSON.parse(savedCart);
        const items = Array.isArray(parsed) ? parsed : [];
        // Recalculate discountPercent based on current user role and tiers
        const normalized = items.map(it => ({
          ...it,
          discountPercent: getBulkDiscount(it.qty, it.bulkPricingTiers || [])
        }));
        setCartItems(normalized);
      } catch (e) {
        setCartItems([]);
      }
    }
  }, []);

  const addToCart = (product, qty) => {
    const existItem = cartItems.find(x => x.product === product._id);
    let newCartItems;
    const basePrice = product.retailPrice || product.baseRetailPrice || 0;
    const tiers = product.bulkPricingTiers || [];

    if (existItem) {
      const newQty = existItem.qty + parseInt(qty);
      const disc = getBulkDiscount(newQty, tiers);
      newCartItems = cartItems.map(x =>
        x.product === product._id
          ? { ...x, qty: newQty, bulkPricingTiers: tiers, discountPercent: disc }
          : x
      );
    } else {
      const disc = getBulkDiscount(parseInt(qty), tiers);
      newCartItems = [...cartItems, {
        product: product._id,
        name: product.name,
        image: product.imageUrl || '',
        price: basePrice,
        qty: parseInt(qty),
        stockQuantity: product.stockQuantity !== undefined ? product.stockQuantity : 10,
        bulkPricingTiers: tiers,
        discountPercent: disc
      }];
    }

    setCartItems(newCartItems);
    localStorage.setItem('cartItems', JSON.stringify(newCartItems));

    const disc = getBulkDiscount(parseInt(qty), tiers);
    setToast({ show: true, message: `${product.name} added to cart`, discount: disc });
    setTimeout(() => setToast({ show: false, message: '', discount: 0 }), 3500);
  };

  const removeFromCart = (id) => {
    const newCart = cartItems.filter(x => x.product !== id);
    setCartItems(newCart);
    localStorage.setItem('cartItems', JSON.stringify(newCart));
  };

  const updateCartQty = (id, qty) => {
    const newCart = cartItems.map(x => {
      if (x.product !== id) return x;
      const disc = getBulkDiscount(qty, x.bulkPricingTiers || []);
      return { ...x, qty: parseInt(qty), discountPercent: disc };
    });
    setCartItems(newCart);
    localStorage.setItem('cartItems', JSON.stringify(newCart));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cartItems');
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateCartQty, clearCart, getBulkDiscount, getEffectivePrice }}>
      {children}

      {/* Modern Toast Notification */}
      {toast.show && (
        <div style={{
          position: 'fixed',
          bottom: '40px',
          right: '40px',
          background: '#0f172a',
          color: 'white',
          padding: '16px 24px',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)',
          zIndex: 9999,
          animation: 'toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          fontFamily: "'Inter', sans-serif",
          fontWeight: 600,
          fontSize: '14px',
          maxWidth: '360px'
        }}>
          <CheckCircle2 size={20} color="#10b981" />
          <div style={{ flex: 1 }}>
            <div>{toast.message}</div>
            {toast.discount > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', color: '#10b981', fontSize: '12px', fontWeight: '700' }}>
                <Tag size={12} />
                {toast.discount}% bulk discount applied!
              </div>
            )}
          </div>
          <button
            onClick={() => setToast({ show: false, message: '', discount: 0 })}
            style={{
              background: 'none', border: 'none', color: '#94a3b8',
              cursor: 'pointer', marginLeft: '10px', display: 'flex'
            }}
          >
            <X size={16} />
          </button>
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes toastSlideIn {
              from { transform: translateX(100%) translateY(20px); opacity: 0; }
              to { transform: translateX(0) translateY(0); opacity: 1; }
            }
          `}} />
        </div>
      )}
    </CartContext.Provider>
  );
};
