import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, X } from 'lucide-react';
import api from '../../services/api';
import './Header.css';

const MegaMenu = ({ isOpen, onClose }) => {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeTier2, setActiveTier2] = useState(null);
  const [loading, setLoading] = useState(true);
  const timeoutRef = useRef(null);

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
              <Link to={`/category/${category.slug}`}>{category.name}</Link>
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
                  onMouseEnter={() => setActiveTier2(item._id)}
                >
                  <div className="sidebar-item-inner">
                    <span>{item.name}</span>
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
                      <div key={tier3._id} className="dropdown-col">
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
            
            {/* Promo Area */}
            <div className="dropdown-banner">
              <div className="banner-card">
                <h4>{currentTier1.name} Accessories</h4>
                <p>Bulk discounts available on all {currentTier1.name} accessories.</p>
                <Link to={`/category/${currentTier1.slug}`} className="banner-link">Shop Collection</Link>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default MegaMenu;
