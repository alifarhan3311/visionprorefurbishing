import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Shield, Truck, RefreshCw, Star, ChevronRight, Check } from 'lucide-react';
import Header from '../layout/Header';
import { CartContext } from '../../context/CartContext';
import api from '../../services/api';
import './ProductDetails.css';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('specs');
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products`);
        // Mock finding the specific product since we don't have a single GET yet
        const found = data.data.find(p => p._id === id);
        setProduct(found);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="product-details-loading">Loading Premium Catalog...</div>;
  if (!product) return <div className="product-details-error">Product not found</div>;

  return (
    <div className="product-details-page">
      <Header />
      
      <div className="container">
        {/* Breadcrumbs */}
        <div className="breadcrumbs">
          <Link to="/">Home</Link> <ChevronRight size={14} /> 
          <Link to={`/category/${product.category?.slug}`}>{product.category?.name}</Link> <ChevronRight size={14} /> 
          <span>{product.name}</span>
        </div>

        <div className="product-main-grid">
          {/* Left: Images & Zoom Area */}
          <div className="product-gallery">
            <div className="main-image-container">
              <img src={product.imageUrl || '/placeholder-product.png'} alt={product.name} className="main-product-image" />
              <div className="zoom-hint">Hover to Zoom</div>
            </div>
            {/* Thumbnails Placeholder */}
            <div className="thumbnail-strip">
              {[1, 2, 3].map(i => (
                <div key={i} className="thumb-item">
                  <img src={product.imageUrl || '/placeholder-product.png'} alt="thumb" />
                </div>
              ))}
            </div>
          </div>

          {/* Right: Info & Actions */}
          <div className="product-info-panel">
            <div className="badge-container">
              <div className="stock-badge">
                <Check size={14} /> In Stock & Ready to Ship
              </div>
              {product.badge && (
                <div className={`promo-badge ${product.badge.toLowerCase().replace(' ', '-')}`}>
                  {product.badge}
                </div>
              )}
            </div>
            <h1 className="product-title">{product.name}</h1>
            <div className="sku-label">SKU: {product.sku}</div>

            <div className="price-section">
              <div className="price-row">
                <span className="current-price">${product.retailPrice}</span>
                <span className="price-label">Retail Price</span>
              </div>
              <div className="b2b-highlight">
                <span className="b2b-price">${product.b2bPrice}</span>
                <span className="b2b-badge">GOLD TIER PRICE</span>
              </div>
            </div>

            {product.features && product.features.length > 0 && (
              <div className="product-features-bullets" style={{ margin: '20px 0', padding: '15px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.5px' }}>Highlights</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {product.features.map((feature, index) => (
                    <li key={index} style={{ fontSize: '13px', fontWeight: '600', color: '#334155', lineHeight: '1.4' }}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tiered Pricing Table */}
            <div className="tiered-pricing">
              <h3>Bulk Savings</h3>
              <table className="tier-table">
                <thead>
                  <tr>
                    <th>Quantity</th>
                    <th>Price Each</th>
                    <th>You Save</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>10+ units</td>
                    <td>${(product.baseRetailPrice * 0.9).toFixed(2)}</td>
                    <td className="save-green">10% Off</td>
                  </tr>
                  <tr>
                    <td>50+ units</td>
                    <td>${(product.baseRetailPrice * 0.8).toFixed(2)}</td>
                    <td className="save-green">20% Off</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="purchase-controls">
              <div className="qty-selector">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <input type="number" value={quantity} readOnly />
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
              <button 
                className="add-to-cart-premium"
                onClick={() => {
                  addToCart(product, quantity);
                  navigate('/cart');
                }}
              >
                <ShoppingCart size={20} /> Add to Cart
              </button>
            </div>

            <div className="trust-badges">
              <div className="trust-item"><Shield size={18} /> <span>Lifetime Warranty</span></div>
              <div className="trust-item"><Truck size={18} /> <span>Same Day Shipping</span></div>
              <div className="trust-item"><RefreshCw size={18} /> <span>Hassle-Free Returns</span></div>
            </div>
          </div>
        </div>

        {/* Technical Specs Tab Area */}
        <div className="product-tabs">
          <div className="tab-headers">
            <div className={`tab-item ${activeTab === 'specs' ? 'active' : ''}`} onClick={() => setActiveTab('specs')}>Specifications</div>
            <div className={`tab-item ${activeTab === 'warranty' ? 'active' : ''}`} onClick={() => setActiveTab('warranty')}>Warranty Info</div>
            <div className={`tab-item ${activeTab === 'compatibility' ? 'active' : ''}`} onClick={() => setActiveTab('compatibility')}>Compatible Models</div>
          </div>
          <div className="tab-content">
            {activeTab === 'specs' && (
              <table className="specs-table">
                <tbody>
                  <tr>
                    <td>Quality</td>
                    <td>Premium OEM Grade</td>
                  </tr>
                  <tr>
                    <td>Condition</td>
                    <td>Brand New</td>
                  </tr>
                  <tr>
                    <td>Type</td>
                    <td>{product.productType}</td>
                  </tr>
                  {product.partDetails && (
                    <>
                      <tr>
                        <td>Quality Type</td>
                        <td>{product.partDetails.qualityType}</td>
                      </tr>
                      <tr>
                        <td>Warranty</td>
                        <td>{product.partDetails.warrantyPeriod}</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            )}
            
            {activeTab === 'warranty' && (
              <div className="tab-text-content">
                <h3>Standard Warranty Policy</h3>
                <p>This product comes with a <strong>{product.partDetails?.warrantyPeriod || 'Lifetime'} Warranty</strong> covering manufacturing defects and functional failures under normal use.</p>
                <ul style={{ marginTop: '15px', paddingLeft: '20px', lineHeight: '1.6' }}>
                  <li>All parts must be tested prior to installation.</li>
                  <li>Physical damage, water damage, or modified parts are not covered.</li>
                  <li>Hassle-free RMA process for our B2B partners.</li>
                </ul>
              </div>
            )}

            {activeTab === 'compatibility' && (
              <div className="tab-text-content">
                <h3>Compatible Device Models</h3>
                {product.compatibility && product.compatibility.length > 0 ? (
                  <ul className="compatibility-list" style={{ marginTop: '15px', paddingLeft: '20px', lineHeight: '1.6' }}>
                    {product.compatibility.map((model, idx) => (
                      <li key={idx}>{model}</li>
                    ))}
                  </ul>
                ) : (
                  <p>Compatible with standard models associated with {product.name}.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
