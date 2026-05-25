import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, X, User, ShieldCheck, Activity, FileText, Info, Zap, Megaphone } from 'lucide-react';
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
  const isAdmin = user?.role === 'admin';

  const handleTier2Select = (item) => {
    setActiveTier2(item._id);
    setActiveTier3(item);
  };

  // Recursively gather top products from leaf descendants (Tier 4)
  const getDescendantTopProducts = (cat) => {
    if (!cat) return [];
    let products = [];
    
    if (cat.topProducts && Array.isArray(cat.topProducts)) {
      products = [...products, ...cat.topProducts];
    }
    
    if (cat.children && Array.isArray(cat.children)) {
      cat.children.forEach(child => {
        products = [...products, ...getDescendantTopProducts(child)];
      });
    }
    
    return products;
  };

  // De-duplicate products by ID
  const getUniqueProducts = (products) => {
    const seen = new Set();
    return products.filter(p => {
      if (!p || !p._id) return false;
      const duplicate = seen.has(p._id.toString());
      seen.add(p._id.toString());
      return !duplicate;
    });
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

  const targetShowcaseCategory = activeTier3 || currentTier2Data;
  const showcaseProducts = targetShowcaseCategory 
    ? getUniqueProducts(getDescendantTopProducts(targetShowcaseCategory)).slice(0, 10)
    : [];

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
                              <Link to={`/category/${tier4.slug}`} className="tier4-item">
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
            
            {/* Showcase / Promo Area */}
            <div className="dropdown-banner showcase-container">
              {showcaseProducts.length > 0 ? (
                <div className="top-products-showcase">
                  <div className="showcase-header">
                    <h4>Top {targetShowcaseCategory.name}</h4>
                    <span className="showcase-subtitle">Featured Items</span>
                  </div>
                  <div className="showcase-list">
                    {showcaseProducts.map(product => (
                      <Link 
                        key={product._id} 
                        to={`/product/${product._id}`} 
                        className="showcase-item"
                        onClick={onClose}
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
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                            <span className="showcase-price">${(product.baseRetailPrice || 0).toFixed(2)}</span>
                            {product.badge && (
                              <span className="showcase-badge">{product.badge}</span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link 
                    to={`/category/${targetShowcaseCategory.slug}`} 
                    className="showcase-more-btn"
                    onClick={onClose}
                  >
                    Show More
                  </Link>
                </div>
              ) : currentTier1.promoBannerUrl ? (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <img 
                    src={getImageUrl(currentTier1.promoBannerUrl)} 
                    alt={currentTier1.name} 
                    style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', borderRadius: '8px', marginBottom: '15px' }} 
                  />
                  <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '5px' }}>{currentTier1.name} Accessories</h4>
                  <Link to={currentTier1.promoBannerLink || `/category/${currentTier1.slug}`} className="banner-link" style={{ marginTop: '5px' }}>Shop Collection</Link>
                </div>
              ) : (
                <div className="banner-card">
                  <h4>{currentTier1.name} Accessories</h4>
                  <p>Bulk discounts available on all {currentTier1.name} accessories.</p>
                  <Link to={`/category/${currentTier1.slug}`} className="banner-link">Shop Collection</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default MegaMenu;
