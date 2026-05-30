import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, X, User, ShieldCheck, Activity, FileText, Info, Zap, Megaphone, Search, SlidersHorizontal } from 'lucide-react';
import api, { getImageUrl } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import './Header.css';

const MegaMenu = ({ isOpen, onClose }) => {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeTier2, setActiveTier2] = useState(null);
  const [activeTier3, setActiveTier3] = useState(null);
  const [loading, setLoading] = useState(true);
  const timeoutRef = useRef(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // --- Catalog Filter State ---
  const [filterSearch, setFilterSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterProducts, setFilterProducts] = useState([]);
  const [filterLoading, setFilterLoading] = useState(false);
  const [allProducts, setAllProducts] = useState([]);         // full catalog (fallback)
  const [categoryProducts, setCategoryProducts] = useState(null); // products for selected category (null = not set)
  const [selectedFilterCat, setSelectedFilterCat] = useState(null); // the tier3/tier4 cat that was clicked
  const filterDebounceRef = useRef(null);

  // Fetch full catalog once on mount (used when no category is selected)
  useEffect(() => {
    const fetchAllProducts = async () => {
      setFilterLoading(true);
      try {
        const { data } = await api.get('/products');
        if (data.success) {
          setAllProducts(data.data || []);
        }
      } catch (err) {
        console.error('Filter products fetch error', err);
      } finally {
        setFilterLoading(false);
      }
    };
    fetchAllProducts();
  }, []);

  // When a tier3 category is selected, fetch its products
  useEffect(() => {
    if (!activeTier3) {
      setCategoryProducts(null);
      setSelectedFilterCat(null);
      setFilterSearch('');
      setFilterType('all');
      return;
    }
    setSelectedFilterCat(activeTier3);
    const fetchCategoryProducts = async () => {
      setFilterLoading(true);
      try {
        const { data } = await api.get(`/products?category=${activeTier3.slug}`);
        if (data.success) {
          setCategoryProducts(data.data || []);
        }
      } catch (err) {
        console.error('Category filter fetch error', err);
        setCategoryProducts([]);
      } finally {
        setFilterLoading(false);
      }
    };
    fetchCategoryProducts();
    setFilterSearch('');
    setFilterType('all');
  }, [activeTier3]);

  // The base pool: category products if a category is selected, otherwise full catalog
  const basePool = categoryProducts !== null ? categoryProducts : allProducts;

  // Apply search + type filter on top of the base pool
  useEffect(() => {
    clearTimeout(filterDebounceRef.current);
    filterDebounceRef.current = setTimeout(() => {
      let results = basePool;
      if (filterType !== 'all') {
        results = results.filter(p => (p.productType || '').toLowerCase() === filterType.toLowerCase());
      }
      if (filterSearch.trim()) {
        const q = filterSearch.toLowerCase();
        results = results.filter(p =>
          (p.name || '').toLowerCase().includes(q) ||
          (p.sku || '').toLowerCase().includes(q)
        );
      }
      setFilterProducts(results.slice(0, 8));
    }, 200);
  }, [filterSearch, filterType, basePool]);

  const productTypes = ['all', ...Array.from(new Set(basePool.map(p => p.productType).filter(Boolean)))];

  const handleFilterSearchSubmit = (e) => {
    e.preventDefault();
    if (filterSearch.trim()) {
      navigate(`/?search=${encodeURIComponent(filterSearch.trim())}`);
      setFilterSearch('');
      setActiveCategory(null);
    }
  };
  const isAdmin = user?.role === 'admin';

  const handleTier2Select = (item) => {
    setActiveTier2(item._id);
    setActiveTier3(item);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories/mega-menu');
        if (response.data.success) {
          setCategories(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryClick = (category, event) => {
    if (category.children?.length > 0) {
      event.preventDefault();
      setActiveCategory(category._id);
    }
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveCategory(null);
      setActiveTier3(null);
    }, 300);
  };

  useEffect(() => {
    const currentTier1 = categories.find(c => c._id === activeCategory);
    if (currentTier1 && currentTier1.children?.length > 0) {
      setActiveTier2(currentTier1.children[0]._id);
      setActiveTier3(currentTier1.children[0]);
    } else {
      setActiveTier2(null);
      setActiveTier3(null);
    }
  }, [activeCategory, categories]);

  const currentTier1 = categories.find(c => c._id === activeCategory);
  const currentTier2Items = currentTier1?.children || [];
  const currentTier2Data = currentTier2Items.find(c => c._id === activeTier2);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div className="mega-menu-overlay mobile-only" onClick={onClose}></div>}
      
      <div className={`mega-menu-wrapper ${isOpen ? 'mobile-open' : ''}`} onMouseLeave={handleMouseLeave}>
        <div className="container mega-menu-container">
          <div className="mobile-menu-header mobile-only">
            <h3>Menu</h3>
            <button className="mobile-close-btn" onClick={onClose}>
              <X size={24} />
            </button>
          </div>

          {/* Mobile Account Section */}
          <div className="mobile-account-section mobile-only">
            {user ? (
              <Link
                to={isAdmin ? '/admin' : '/dashboard'}
                className="mobile-account-link"
                onClick={onClose}
              >
                <div className="mobile-account-avatar">
                  {isAdmin ? <ShieldCheck size={18} /> : <User size={18} />}
                </div>
                <div className="mobile-account-info">
                  <span className="mobile-account-name">{user.name || user.email}</span>
                  <span className="mobile-account-role">{isAdmin ? 'Admin Panel' : 'My Dashboard'}</span>
                </div>
                <ChevronRight size={16} className="mobile-account-arrow" />
              </Link>
            ) : (
              <Link to="/login" className="mobile-account-link" onClick={onClose}>
                <div className="mobile-account-avatar">
                  <User size={18} />
                </div>
                <div className="mobile-account-info">
                  <span className="mobile-account-name">Sign In</span>
                  <span className="mobile-account-role">Login or Register</span>
                </div>
                <ChevronRight size={16} className="mobile-account-arrow" />
              </Link>
            )}
          </div>

          {/* Mobile Quick Links */}
          <div className="mobile-quick-links mobile-only">
            <Link to="/dashboard/buyback" className="mobile-quick-link" onClick={onClose}>
              <Activity size={15} />
              <span>LCD Buyback</span>
            </Link>
            <Link to="/quick-order" className="mobile-quick-link" onClick={onClose}>
              <Zap size={15} />
              <span>Quick Order</span>
            </Link>
            <Link to="/dashboard/marketing" className="mobile-quick-link" onClick={onClose}>
              <Megaphone size={15} />
              <span>Marketing</span>
            </Link>
            <Link to="/blog" className="mobile-quick-link" onClick={onClose}>
              <FileText size={15} />
              <span>Blog</span>
            </Link>
            <Link to="/support" className="mobile-quick-link" onClick={onClose}>
              <Info size={15} />
              <span>Support</span>
            </Link>
          </div>

          {/* Categories label */}
          <div className="mobile-section-label mobile-only">Categories</div>
          <ul className="mega-menu-list">
            <li className="mega-menu-item">
              <Link 
                to="/products" 
                onClick={onClose}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'inherit' }}
              >
                <span>All Products</span>
              </Link>
            </li>
            {categories.map(category => (
            <li 
              key={category._id}
              className={`mega-menu-item ${activeCategory === category._id ? 'active' : ''}`}
            >
              <Link 
                to={`/category/${category.slug}`} 
                onClick={(e) => handleCategoryClick(category, e)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'inherit' }}
              >
                {category.navIconUrl && (
                  <img 
                    src={getImageUrl(category.navIconUrl)} 
                    alt="" 
                    style={{ width: '20px', height: '20px', objectFit: 'contain', borderRadius: '4px' }} 
                  />
                )}
                <span>{category.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Dropdown Panel */}
      {activeCategory && currentTier1 && (
        <div className={`mega-dropdown show`}>
          <div className="container mega-dropdown-content">
            
            {/* Sidebar (Tier 2 - Brands/Sub-Categories) */}
            <div className="mega-sidebar">
              <div className="sidebar-header">Select Model</div>
              {currentTier2Items.map(item => (
                <div 
                  key={item._id} 
                  className={`sidebar-item ${activeTier2 === item._id ? 'active' : ''}`}
                  onClick={() => handleTier2Select(item)}
                >
                  <div className="sidebar-item-inner">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {item.navIconUrl && (
                        <img 
                          src={getImageUrl(item.navIconUrl)} 
                          alt="" 
                          style={{ width: '18px', height: '18px', objectFit: 'contain', borderRadius: '3px' }} 
                        />
                      )}
                      <span>{item.name}</span>
                    </div>
                    <ChevronRight size={14} className="sidebar-arrow" />
                  </div>
                </div>
              ))}
            </div>

            {/* Main Content (Tier 3 & Tier 4 Grid) */}
            <div className="mega-main-content">
              {currentTier2Data ? (
                <>
                  <div className="main-content-header">
                    <h3>{currentTier2Data.name} Parts</h3>
                  </div>
                  <div className="dropdown-columns">
                    {currentTier2Data.children?.map((tier3) => (
                      <div 
                        key={tier3._id} 
                        className="dropdown-col"
                        onClick={() => setActiveTier3(tier3)}
                      >
                        <Link to={`/category/${tier3.slug}`} className="tier3-title">
                          {tier3.name}
                        </Link>
                        <ul className="tier4-list">
                          {tier3.children?.map(tier4 => (
                            <li key={tier4._id}>
                              <Link
                                to={`/category/${tier4.slug}`}
                                className="tier4-item"
                                onClick={(e) => { e.stopPropagation(); setActiveTier3(tier4); }}
                              >
                                {tier4.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <p>Select a brand from the sidebar to view available parts and models.</p>
                </div>
              )}
            </div>
            
            {/* Catalog Filter Panel — context-aware: updates when a category is clicked */}
            <div className="dropdown-banner showcase-container catalog-filter-panel">
              <div className="filter-panel-header">
                <SlidersHorizontal size={15} className="filter-panel-icon" />
                <span>
                  {selectedFilterCat ? selectedFilterCat.name : 'Filter Catalog'}
                </span>
                {selectedFilterCat && (
                  <button
                    className="filter-clear-btn"
                    onClick={() => { setCategoryProducts(null); setSelectedFilterCat(null); setActiveTier3(null); setFilterSearch(''); setFilterType('all'); }}
                    title="Clear filter"
                    type="button"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Search input */}
              <form onSubmit={handleFilterSearchSubmit} className="filter-search-form">
                <div className="filter-search-wrap">
                  <Search size={14} className="filter-search-icon" />
                  <input
                    type="text"
                    placeholder="Search parts, SKU..."
                    value={filterSearch}
                    onChange={e => setFilterSearch(e.target.value)}
                    className="filter-search-input"
                  />
                </div>
              </form>

              {/* Product type chips */}
              <div className="filter-type-chips">
                {productTypes.map(type => (
                  <button
                    key={type}
                    className={`filter-chip ${filterType === type ? 'active' : ''}`}
                    onClick={() => setFilterType(type)}
                    type="button"
                  >
                    {type === 'all' ? 'All Types' : type}
                  </button>
                ))}
              </div>

              {/* Results list */}
              <div className="filter-results-list">
                {filterLoading ? (
                  <p className="filter-empty-msg">Loading...</p>
                ) : filterProducts.length === 0 ? (
                  <p className="filter-empty-msg">No products found.</p>
                ) : (
                  filterProducts.map(product => (
                    <Link
                      key={product._id}
                      to={`/product/${product._id}`}
                      className="showcase-item"
                      onClick={() => { onClose(); setActiveCategory(null); }}
                    >
                      <div className="showcase-img">
                        {product.imageUrl ? (
                          <img src={getImageUrl(product.imageUrl)} alt="" />
                        ) : (
                          <div className="showcase-placeholder">📦</div>
                        )}
                      </div>
                      <div className="showcase-details">
                        <span className="showcase-name">{product.name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                          <span className="showcase-price">${parseFloat(product.retailPrice || 0).toFixed(2)}</span>
                          {product.badge && <span className="showcase-badge">{product.badge}</span>}
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>

              <Link
                to={
                  selectedFilterCat
                    ? `/category/${selectedFilterCat.slug}`
                    : filterSearch.trim()
                    ? `/?search=${encodeURIComponent(filterSearch.trim())}`
                    : '/products'
                }
                className="showcase-more-btn"
                onClick={() => { onClose(); setActiveCategory(null); }}
              >
                {selectedFilterCat ? `All ${selectedFilterCat.name} Products` : 'View All Results'}
              </Link>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default MegaMenu;
