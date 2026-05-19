import React, { createContext, useState, useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '' });

  useEffect(() => {
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart && savedCart !== "undefined" && savedCart !== "null") {
      try {
        const parsed = JSON.parse(savedCart);
        setCartItems(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        setCartItems([]);
      }
    }
  }, []);

  const addToCart = (product, qty) => {
    const existItem = cartItems.find(x => x.product === product._id);
    let newCartItems;

    if (existItem) {
      newCartItems = cartItems.map(x => 
        x.product === product._id ? { ...x, qty: x.qty + parseInt(qty) } : x
      );
    } else {
      newCartItems = [...cartItems, {
        product: product._id,
        name: product.name,
        image: product.imageUrl || '',
        price: product.retailPrice || product.baseRetailPrice || 0,
        qty: parseInt(qty),
        stockQuantity: product.stockQuantity !== undefined ? product.stockQuantity : 10
      }];
    }
    
    setCartItems(newCartItems);
    localStorage.setItem('cartItems', JSON.stringify(newCartItems));
    
    // Show modern toast
    setToast({ show: true, message: `${product.name} added to cart` });
    setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 3000);
  };

  const removeFromCart = (id) => {
    const newCart = cartItems.filter(x => x.product !== id);
    setCartItems(newCart);
    localStorage.setItem('cartItems', JSON.stringify(newCart));
  };

  const updateCartQty = (id, qty) => {
    const newCart = cartItems.map(x => 
      x.product === id ? { ...x, qty: parseInt(qty) } : x
    );
    setCartItems(newCart);
    localStorage.setItem('cartItems', JSON.stringify(newCart));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cartItems');
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateCartQty, clearCart }}>
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
          fontSize: '14px'
        }}>
          <CheckCircle2 size={20} color="#10b981" />
          {toast.message}
          <button 
            onClick={() => setToast({ show: false, message: '' })}
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
