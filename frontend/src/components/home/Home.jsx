import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ShoppingCart, Smartphone, ArrowRight, Cpu, Box } from 'lucide-react';
import Header from '../layout/Header';
import { CartContext } from '../../context/CartContext';
import api from '../../services/api';
import './Home.css';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useContext(CartContext);
  const { id: categoryId } = useParams();

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


  const getIcon = (type) => {
    switch(type) {
      case 'preowned': return <Smartphone size={40} />;
      case 'components': return <Cpu size={40} />;
      default: return <Box size={40} />;
    }
  };

  return (
    <div className="home-container">
      <Header />
      
      {/* Hero Section */}
      <section className="hero-slider">
        <div className="hero-content reveal">
          <h1 className="hero-title shimmer-text">Premium B2B Parts & Devices</h1>
          <p className="hero-subtitle">Wholesale pricing on Apple, Samsung, and more. Register for a B2B account to unlock tier-based bulk discounts.</p>
          <button className="hero-btn">Shop The Catalog <ArrowRight size={18} style={{ verticalAlign: 'middle', marginLeft: '8px' }} /></button>
        </div>
        
        {/* Placeholder for slider background graphics */}
        <div style={{ position: 'absolute', right: '-5%', top: '10%', opacity: 0.05, transform: 'rotate(15deg)' }}>
          <Smartphone size={400} />
        </div>
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
