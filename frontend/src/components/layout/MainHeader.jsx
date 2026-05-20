import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Menu } from 'lucide-react';
import { CartContext } from '../../context/CartContext';
import api, { getImageUrl } from '../../services/api';
import './Header.css';

const MainHeader = ({ onMenuToggle }) => {
  const { cartItems } = useContext(CartContext);
  const cartItemCount = cartItems ? cartItems.reduce((acc, item) => acc + item.qty, 0) : 0;
  const navigate = useNavigate();
  
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [allProducts, setAllProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

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

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const { data } = await api.get('/products');
        if (data.success) {
          setAllProducts(data.data || []);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchAllProducts();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }
    const filtered = allProducts.filter(p => 
      (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sku || '').toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 6);
    setSuggestions(filtered);
  }, [searchQuery, allProducts]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setSuggestions([]);
    }
  };

  return (
    <div className="main-header" style={{ position: 'relative' }}>
      <div className="container main-header-content">
        <div className="logo-section">
          <button className="mobile-menu-toggle" onClick={onMenuToggle}>
            <Menu size={24} />
          </button>
          {/* Logo */}
          <Link to="/" className="main-logo">
            <img src="/assets/visionpro-logo.png" alt="Vision Pro LCD" style={{ height: '48px' }} />
          </Link>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="search-container" style={{ position: 'relative' }}>
          <select className="search-category-select">
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat.slug}>{cat.name}</option>
            ))}
          </select>
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search parts, tools, or pre-owned devices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="search-button">
            <Search size={20} />
          </button>

          {/* Autocomplete Dropdown */}
          {suggestions.length > 0 && (
            <div className="search-suggestions-dropdown" style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 20px 45px rgba(15, 23, 42, 0.15)',
              border: '1px solid #e2e8f0',
              zIndex: 1000,
              marginTop: '8px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {suggestions.map(p => (
                <Link 
                  key={p._id}
                  to={`/product/${p._id}`}
                  onClick={() => {
                    setSearchQuery('');
                    setSuggestions([]);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    textDecoration: 'none',
                    borderBottom: '1px solid #f1f5f9',
                    transition: 'background 0.2s'
                  }}
                  className="suggestion-item"
                >
                  <img 
                    src={p.imageUrl ? getImageUrl(p.imageUrl) : 'https://images.unsplash.com/photo-1601524909162-be87252be298?auto=format&fit=crop&w=40&q=80'} 
                    alt="" 
                    style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'contain', background: '#f8fafc', border: '1px solid #e2e8f0' }} 
                  />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
                    <span style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', fontFamily: 'monospace' }}>{p.sku}</span>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>${p.retailPrice}</span>
                </Link>
              ))}
            </div>
          )}
        </form>

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
