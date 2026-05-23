import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Shield, Truck, RefreshCw, ChevronRight, Check, AlertTriangle, Package } from 'lucide-react';
import Header from '../layout/Header';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import api, { getImageUrl } from '../../services/api';
import './ProductDetails.css';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('specs');
  const [activeImage, setActiveImage] = useState(0);
  const [stockAlert, setStockAlert] = useState(false);
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  // Scroll to top on mount / product change — also handled globally by ScrollToTop in App.jsx
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id]);

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

  const stockQty = product.stockQuantity ?? 0;
  const isOutOfStock = stockQty === 0;

  // Build gallery: use images array if available, fallback to imageUrl
  const galleryImages = (product.images && product.images.length > 0)
    ? product.images
    : product.imageUrl
      ? [product.imageUrl]
      : [];
  const mainImage = galleryImages[activeImage] || galleryImages[0] || null;

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
              <img
                src={mainImage ? getImageUrl(mainImage) : '/placeholder-product.png'}
                alt={product.name}
                className="main-product-image"
              />
              {galleryImages.length > 1 && (
                <>
                  <button
                    className="gallery-nav prev"
                    onClick={() => setActiveImage(i => (i - 1 + galleryImages.length) % galleryImages.length)}
                  >&#8249;</button>
                  <button
                    className="gallery-nav next"
                    onClick={() => setActiveImage(i => (i + 1) % galleryImages.length)}
                  >&#8250;</button>
                </>
              )}
            </div>
            {/* Thumbnails — real images from product.images */}
            {galleryImages.length > 1 && (
              <div className="thumbnail-strip">
                {galleryImages.map((img, i) => (
                  <div
                    key={i}
                    className={`thumb-item ${activeImage === i ? 'active' : ''}`}
                    onClick={() => setActiveImage(i)}
                  >
                    <img src={getImageUrl(img)} alt={`${product.name} view ${i + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info & Actions */}
          <div className="product-info-panel">
            <div className="badge-container">
              {isOutOfStock ? (
                <div className="out-of-stock-badge">
                  <AlertTriangle size={14} /> Out of Stock
                </div>
              ) : (
                <div className="stock-badge">
                  <Check size={14} /> In Stock &amp; Ready to Ship
                </div>
              )}
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
              {isOutOfStock ? (
                /* ── Out of Stock state ── */
                <div className="out-of-stock-block">
                  <AlertTriangle size={20} />
                  <div>
                    <strong>Out of Stock</strong>
                    <span>This item is currently unavailable. Check back soon.</span>
                  </div>
                </div>
              ) : (
                <>
                  {/* Quantity Selector */}
                  <div className="qty-wrapper">
                    <span className="qty-label">Qty</span>
                    <div className="qty-selector">
                      <button
                        className="qty-btn"
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        disabled={quantity <= 1}
                      >−</button>
                      <span className="qty-value">{quantity}</span>
                      <button
                        className="qty-btn"
                        onClick={() => {
                          if (quantity >= stockQty) {
                            setStockAlert(true);
                            return;
                          }
                          setQuantity(q => q + 1);
                        }}
                        disabled={quantity >= stockQty}
                      >+</button>
                    </div>
                    <span className="qty-stock-info">
                      <Package size={13} />
                      {stockQty} in stock
                    </span>
                  </div>

                  {isAdmin ? (
                    <div className="admin-order-block">
                      Admin accounts cannot place orders
                    </div>
                  ) : (
                    <button
                      className="add-to-cart-premium"
                      onClick={() => {
                        if (quantity > stockQty) {
                          setStockAlert(true);
                          return;
                        }
                        addToCart(product, quantity);
                        navigate('/cart');
                      }}
                    >
                      <ShoppingCart size={20} /> Add to Cart
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Stock limit alert */}
            {stockAlert && (
              <div className="pd-stock-alert" onClick={() => setStockAlert(false)}>
                <div className="pd-stock-alert-card" onClick={e => e.stopPropagation()}>
                  <div className="pd-alert-icon-wrap">
                    <AlertTriangle size={36} />
                  </div>
                  <h3>Stock Limit Reached</h3>
                  <p>Only <strong>{stockQty} units</strong> available for <strong>{product.name}</strong>. Please adjust your quantity.</p>
                  <button onClick={() => {
                    setStockAlert(false);
                    setQuantity(stockQty);
                  }}>Set Max Quantity</button>
                  <button className="dismiss" onClick={() => setStockAlert(false)}>Dismiss</button>
                </div>
              </div>
            )}

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
