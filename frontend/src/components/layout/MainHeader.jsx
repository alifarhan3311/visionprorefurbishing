import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, Menu } from 'lucide-react';
import { CartContext } from '../../context/CartContext';
import api from '../../services/api';
import './Header.css';

const MainHeader = ({ onMenuToggle }) => {
  const { cartItems } = useContext(CartContext);
  const cartItemCount = cartItems ? cartItems.reduce((acc, item) => acc + item.qty, 0) : 0;
  
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/categories/mega-menu');
        if (data.success) {
          setCategories(data.data);
        }
      } catch (err) {
        console.error('Error fetching categories for search', err);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="main-header">
      <div className="container main-header-content">
        <div className="logo-section">
          <button className="mobile-menu-toggle" onClick={onMenuToggle}>
            <Menu size={24} />
          </button>
          {/* Logo */}
          <Link to="/" className="main-logo">
          <img src="/assets/visionpro-logo.png" alt="visionprorefurbishing" style={{ height: '48px' }} />
        </Link>
        </div>

        {/* Search Bar */}
        <div className="search-container">
          <select className="search-category-select">
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat.slug}>{cat.name}</option>
            ))}
          </select>
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search parts, tools, or pre-owned devices (e.g., iPhone 15 Pro Max Screen)..."
          />
          <button className="search-button">
            <Search size={20} />
          </button>
        </div>

        {/* Actions */}
        <div className="header-actions">
          <Link to="/cart" className="cart-btn" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <ShoppingCart size={24} />
            <span className="badge">{cartItemCount}</span>
            <span style={{ fontSize: '12px', marginTop: '4px', fontWeight: 500 }}>Cart</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MainHeader;
