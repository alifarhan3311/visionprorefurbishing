import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Smartphone, ArrowRight, Cpu, Box } from 'lucide-react';
import Header from '../layout/Header';
import { CartContext } from '../../context/CartContext';
import api from '../../services/api';
import './Home.css';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { addToCart } = useContext(CartContext);
  const { id: categoryId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const url = categoryId ? `/products?category=${categoryId}` : '/products';
        const response = await api.get(url);
        if (response.data.success) {
          setProducts(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching products", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId]);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const response = await api.get('/heroslider');
        if (response.data.success && Array.isArray(response.data.data)) {
          setSlides(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching hero slides", error);
      }
    };
    fetchSlides();
  }, []);

  // Auto-play slideshow timer
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides]);

  const getIcon = (type) => {
    switch (type) {
      case 'preowned': return <Smartphone size={40} />;
      case 'components': return <Cpu size={40} />;
      default: return <Box size={40} />;
    }
  };

  const handleCtaClick = (linkUrl) => {
    if (!linkUrl) return;
    if (linkUrl.startsWith('http')) {
      window.open(linkUrl, '_blank');
    } else {
      navigate(linkUrl);
    }
  };

  return (
    <div className="home-container">
      <Header />

      {/* Hero Section Dynamic Carousel */}
      <section className="hero-slider-container">
        {slides.length > 0 ? (
          slides.map((slide, idx) => (
            <div 
              key={slide._id} 
              className={`hero-slide ${idx === currentSlide ? 'active' : ''}`}
              style={{ backgroundImage: `url(${slide.imageUrl})` }}
            >
              <div className="hero-slide-overlay"></div>
              <div className="hero-slide-content">
                {slide.title && <h1 className="hero-title shimmer-text">{slide.title}</h1>}
                {slide.subtitle && <p className="hero-subtitle">{slide.subtitle}</p>}
                {slide.linkUrl && (
                  <button className="hero-btn" onClick={() => handleCtaClick(slide.linkUrl)}>
                    Shop The Catalog <ArrowRight size={18} style={{ verticalAlign: 'middle', marginLeft: '8px' }} />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          /* Fallback static slider */
          <div className="hero-slide active" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
            <div className="hero-slide-content" style={{ opacity: 1, transform: 'translateY(0)' }}>
              <h1 className="hero-title shimmer-text">Premium B2B Parts & Devices</h1>
              <p className="hero-subtitle">Wholesale pricing on Apple, Samsung, and more. Register for a B2B account to unlock tier-based bulk discounts.</p>
              <button className="hero-btn" onClick={() => navigate('/shop')}>
                Shop The Catalog <ArrowRight size={18} style={{ verticalAlign: 'middle', marginLeft: '8px' }} />
              </button>
            </div>
            <div style={{ position: 'absolute', right: '-5%', top: '10%', opacity: 0.05, transform: 'rotate(15deg)', zIndex: 1 }}>
              <Smartphone size={400} />
            </div>
          </div>
        )}

        {/* Carousel Dots */}
        {slides.length > 1 && (
          <div className="slider-dots">
            {slides.map((_, idx) => (
              <button 
                key={idx} 
                className={`slider-dot ${idx === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(idx)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Main Content */}
      <div className="container" style={{ padding: '0 20px' }}>

        <h2 className="section-title">Latest Inventory</h2>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading products...</p>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
            <Box size={48} style={{ color: '#cbd5e1', marginBottom: '15px' }} />
            <h3 style={{ color: '#475569' }}>No Products Available</h3>
            <p style={{ color: '#94a3b8' }}>Please add products from the Admin Panel to see them here.</p>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((product, index) => (
              <div
                className="product-card reveal"
                key={product._id}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {product.badge && (
                  <div className={`product-badge ${product.badge.toLowerCase().replace(' ', '-')}`}>
                    {product.badge}
                  </div>
                )}
                <Link to={`/product/${product._id}`} className="product-image-container">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="product-image" />
                  ) : (
                    getIcon(product.productType)
                  )}
                </Link>
                <div className="product-category">{product.productType}</div>
                <Link to={`/product/${product._id}`} className="product-name">{product.name}</Link>
                <div className="product-price">${product.retailPrice}</div>
                <button
                  className="add-to-cart-btn"
                  onClick={() => {
                    addToCart(product, 1);
                    // Minimal UI feedback instead of native alert could be added here in future
                  }}
                >
                  <ShoppingCart size={16} /> Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Home;
