import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, Menu } from 'lucide-react';
import { CartContext } from '../../context/CartContext';
import api, { getImageUrl } from '../../services/api';
import './Header.css';

const MainHeader = ({ onMenuToggle }) => {
  const { cartItems } = useContext(CartContext);
  const cartItemCount = cartItems ? cartItems.reduce((acc, item) => acc + item.qty, 0) : 0;
  const navigate = useNavigate();
  const location = useLocation();
  
  // Initialize query state from URL search param if present
  const getSearchParam = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('search') || '';
  };

  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState(getSearchParam());
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [suggestions, setSuggestions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [isFocused, setIsFocused] = useState(false);
  
  const searchDebounceRef = useRef(null);
  const searchContainerRef = useRef(null);

  // Sync search input with URL query changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchVal = params.get('search') || '';
    setSearchQuery(searchVal);
  }, [location.search]);

  const fetchAllProducts = async () => {
    try {
      setSearchLoading(true);
      setFetchError(null);
      const { data } = await api.get('/products');
      if (data && data.success && Array.isArray(data.data)) {
        setAllProducts(data.data);
      } else {
        throw new Error('API response unsuccessful or invalid format');
      }
    } catch (err) {
      console.error('Error fetching all products', err);
      setFetchError('Failed to load products. Please try again.');
      setAllProducts([]);
    } finally {
      setSearchLoading(false);
    }
  };

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
    fetchAllProducts();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isMatch = (product, queryStr) => {
    if (!queryStr) return false;
    const query = queryStr.toLowerCase().trim();
    
    // Check 1: Gapless match (match without spaces/punctuation)
    const cleanQuery = query.replace(/[^a-z0-9]/g, '');
    if (cleanQuery) {
      const cleanName = (product.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanSku = (product.sku || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      if (cleanName.includes(cleanQuery) || cleanSku.includes(cleanQuery)) {
        return true;
      }
    }
    
    // Check 2: Word-by-word match (all query words present in target)
    const queryWords = query.split(/[^a-z0-9]+/).filter(Boolean);
    if (queryWords.length > 0) {
      const productName = (product.name || '').toLowerCase();
      const productSku = (product.sku || '').toLowerCase();
      
      const nameMatch = queryWords.every(word => productName.includes(word));
      const skuMatch = queryWords.every(word => productSku.includes(word));
      if (nameMatch || skuMatch) {
        return true;
      }
    }
    
    return false;
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      clearTimeout(searchDebounceRef.current);
      setSuggestions([]);
      return;
    }

    clearTimeout(searchDebounceRef.current);
    
    searchDebounceRef.current = setTimeout(() => {
      const filtered = allProducts.filter(p => {
        // Filter by category slug if not 'all'
        if (selectedCategory && selectedCategory !== 'all') {
          const catSlug = p.category?.slug || '';
          if (catSlug !== selectedCategory) return false;
        }
        
        // Match product by custom matching logic
        return isMatch(p, searchQuery);
      });
      setSuggestions(filtered);
    }, 250);

    return () => clearTimeout(searchDebounceRef.current);
  }, [searchQuery, selectedCategory, allProducts]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setSuggestions([]);
      setIsFocused(false);
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
            <img src="/assets/visionpro-logo.png" alt="Vision Pro LCD" className="header-logo-img" />
          </Link>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="search-container" style={{ position: 'relative', overflow: 'visible' }} ref={searchContainerRef}>
          <select 
            className="search-category-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
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
            onFocus={() => setIsFocused(true)}
          />
          <button type="submit" className="search-button">
            <Search size={20} />
          </button>

          {/* Autocomplete Dropdown */}
          {isFocused && (searchQuery.trim() !== '' || fetchError || searchLoading) && (
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
              maxHeight: '320px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {searchLoading && (
                <div style={{ padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '14px', fontWeight: '500' }}>
                  Loading products...
                </div>
              )}
              {fetchError && !searchLoading && (
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#ef4444', fontSize: '13px', fontWeight: '500', textAlign: 'center' }}>{fetchError}</span>
                  <button 
                    type="button" 
                    onClick={fetchAllProducts} 
                    style={{ 
                      padding: '6px 12px', 
                      backgroundColor: '#6366f1', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '6px', 
                      fontSize: '12px', 
                      fontWeight: '600', 
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#4f46e5'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#6366f1'}
                  >
                    Retry
                  </button>
                </div>
              )}
              {!searchLoading && !fetchError && suggestions.length === 0 && searchQuery.trim() !== '' && (
                <div style={{ padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                  No products found matching "{searchQuery}"
                </div>
              )}
              {!searchLoading && !fetchError && suggestions.map(p => (
                <Link 
                  key={p._id}
                  to={`/product/${p._id}`}
                  onClick={() => {
                    setSearchQuery('');
                    setSuggestions([]);
                    setIsFocused(false);
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
                  <span style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>
                    ${p.retailPrice || (p.baseRetailPrice ? Number(p.baseRetailPrice).toFixed(2) : '0.00')}
                  </span>
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
