import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, X } from 'lucide-react';
import api, { getImageUrl } from '../../services/api';
import './Header.css';

const MegaMenu = ({ isOpen, onClose }) => {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeTier2, setActiveTier2] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const timeoutRef = useRef(null);

  const handleTier2Hover = (item) => {
    setActiveTier2(item._id);
    setHoveredCategory(item);
  };

  useEffect(() => {
    setHoveredCategory(null);
  }, [activeTier2]);

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

  const handleMouseEnter = (categoryId) => {
    setActiveCategory(categoryId);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveCategory(null);
    }, 300);
  };

  useEffect(() => {
    const currentTier1 = categories.find(c => c._id === activeCategory);
    if (currentTier1 && currentTier1.children?.length > 0) {
      setActiveTier2(currentTier1.children[0]._id);
    } else {
      setActiveTier2(null);
    }
  }, [activeCategory, categories]);

  const currentTier1 = categories.find(c => c._id === activeCategory);
  const currentTier2Items = currentTier1?.children || [];
  const currentTier2Data = currentTier2Items.find(c => c._id === activeTier2);

  const targetShowcaseCategory = hoveredCategory || currentTier2Data;
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
          <ul className="mega-menu-list">
            {categories.map(category => (
            <li 
              key={category._id}
              className={`mega-menu-item ${activeCategory === category._id ? 'active' : ''}`}
              onMouseEnter={() => handleMouseEnter(category._id)}
            >
              <Link 
                to={`/category/${category.slug}`} 
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
                  onMouseEnter={() => handleTier2Hover(item)}
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
                  <div className="dropdown-columns" onMouseLeave={() => setHoveredCategory(null)}>
                    {currentTier2Data.children?.map((tier3) => (
                      <div 
                        key={tier3._id} 
                        className="dropdown-col"
                        onMouseEnter={() => setHoveredCategory(tier3)}
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
