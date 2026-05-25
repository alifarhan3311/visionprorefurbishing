import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingCart, Smartphone, ArrowRight, Cpu, Box, 
  Search, Shield, Truck, RefreshCw, Calendar, Clock, 
  Mail, Phone, User, Zap, 
  Award, Users, BookOpen, Star, AlertCircle
} from 'lucide-react';
import Header from '../layout/Header';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import api, { getImageUrl } from '../../services/api';
import './Home.css';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { id: categoryId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const searchParam = queryParams.get('search') || '';
    setSearchTerm(searchParam);
  }, [location.search]);

  // Blog posts
  const [blogs, setBlogs] = useState([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(null);

  // Appointment Form State
  const [appointmentForm, setAppointmentForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    serviceType: 'Screen Repair',
    date: '',
    time: '',
    notes: ''
  });
  const [appointmentSubmitting, setAppointmentSubmitting] = useState(false);
  const [appointmentSuccess, setAppointmentSuccess] = useState(false);

  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewForm, setReviewForm] = useState({
    fullName: '',
    company: '',
    rating: 5,
    comment: ''
  });

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await api.get('/reviews');
        if (data.success) {
          setReviews(data.data || []);
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
      } finally {
        setLoadingReviews(false);
      }
    };
    fetchReviews();
  }, []);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    setReviewError('');
    setReviewSuccess('');
    try {
      const { data } = await api.post('/reviews', reviewForm);
      if (data.success) {
        setReviewSuccess('Your review has been submitted for moderation. It will appear on the site once approved by an admin.');
        setReviewForm({ fullName: '', company: '', rating: 5, comment: '' });
        setTimeout(() => {
          setShowReviewModal(false);
          setReviewSuccess('');
        }, 3000);
      }
    } catch (err) {
      setReviewError(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

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

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const { data } = await api.get('/blog');
        if (data.success) {
          setBlogs(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingBlogs(false);
      }
    };
    fetchBlogs();
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

  // Appointment submission gate
  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();
    setAppointmentSubmitting(true);

    if (!user) {
      // User is NOT logged in. Save form state in localStorage & redirect to login
      localStorage.setItem('pendingBooking', JSON.stringify(appointmentForm));
      alert('Authentication required: You will now be redirected to the login page to confirm your scheduled appointment.');
      navigate('/login');
      return;
    }

    try {
      const response = await api.post('/appointments', appointmentForm);
      if (response.data.success) {
        setAppointmentSuccess(true);
        setAppointmentForm({
          fullName: '',
          email: '',
          phone: '',
          serviceType: 'Screen Repair',
          date: '',
          time: '',
          notes: ''
        });
        setTimeout(() => setAppointmentSuccess(false), 5000);
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Could not schedule appointment. Please try again.');
    } finally {
      setAppointmentSubmitting(false);
    }
  };

  const handleAppointmentChange = (e) => {
    setAppointmentForm({ ...appointmentForm, [e.target.name]: e.target.value });
  };

  const filteredProducts = products.filter(p => 
    (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.sku || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.productType || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqData = [
    {
      q: "What is your standard turnaround time for repair services?",
      a: "Our certified technicians complete screen, battery, and basic port repairs within 24 to 48 hours. Board-level repairs and heavy micro-soldering tasks take 3 to 5 business days."
    },
    {
      q: "Do you offer warranty on repair parts and screen replacements?",
      a: "Yes, all repair components, refurbished parts, and IC chips purchased through Vision Pro LCD come with our industry-leading 12-month standard warranty."
    },
    {
      q: "How can I register for a B2B wholesale discount account?",
      a: "You can click on the Register page, enter your business registration details and verify your email. Once registered, your B2B account automatically unlocks Silver or Gold discount rates depending on order volume."
    },
    {
      q: "Where do you ship from and what are the carrier options?",
      a: "We ship directly from our fulfillment hubs in Canada. We partner with FedEx, Canada Post, and DHL to guarantee fast 1-2 day expedited B2B delivery."
    }
  ];

  return (
    <div className="home-container">
      <Header />

      {/* Hero Section Dynamic Carousel (STRICTLY PRESERVED) */}
      <section className="hero-slider-container">
        {slides.length > 0 ? (
          slides.map((slide, idx) => (
            <div 
              key={slide._id} 
              className={`hero-slide ${idx === currentSlide ? 'active' : ''}`}
              style={{ backgroundImage: `url(${getImageUrl(slide.imageUrl)})` }}
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
          <div className="hero-slide active" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f5f9ff 100%)' }}>
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

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <h2 className="section-title" style={{ borderBottom: 'none', margin: '50px 0 20px 0' }}>Latest Inventory</h2>
          
          {/* Live Search Input Bar */}
          <div className="search-bar-premium">
            <Search size={18} className="search-icon-live" />
            <input 
              type="text" 
              placeholder="Search catalog live..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading products...</p>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', backgroundColor: 'var(--bg-elevated)', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
            <Box size={48} style={{ color: 'var(--border-color)', marginBottom: '15px' }} />
            <h3 style={{ color: 'var(--text-primary)' }}>No Products Found</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Try refining your search terms.</p>
          </div>
        ) : (
          <div className="product-grid">
            {filteredProducts.map((product, index) => (
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
                {/* Out of stock overlay on image */}
                {(product.stockQuantity === 0) && (
                  <div className="card-out-of-stock-ribbon">Out of Stock</div>
                )}
                <Link to={`/product/${product._id}`} className="product-image-container">
                  {product.imageUrl ? (
                    <img src={getImageUrl(product.imageUrl)} alt={product.name} className="product-image" style={{ opacity: product.stockQuantity === 0 ? 0.45 : 1 }} />
                  ) : (
                    getIcon(product.productType)
                  )}
                </Link>
                <div className="product-category">{product.productType}</div>
                <Link to={`/product/${product._id}`} className="product-name">{product.name}</Link>
                <div className="product-price">${product.retailPrice}</div>

                {/* Button logic: admin → view only | out of stock → disabled | normal → add to cart */}
                {user?.role === 'admin' ? (
                  <button className="add-to-cart-btn" disabled style={{ opacity: 0.45, cursor: 'not-allowed' }}>
                    Admin View Only
                  </button>
                ) : product.stockQuantity === 0 ? (
                  <button className="add-to-cart-btn out-of-stock-btn" disabled>
                    Out of Stock
                  </button>
                ) : (
                  <button
                    className="add-to-cart-btn"
                    onClick={() => {
                      addToCart(product, 1);
                      navigate('/cart');
                    }}
                  >
                    <ShoppingCart size={16} /> Add to Cart
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* NEW SECTION 1: B2B Advantage / Benefits cards */}
      <section className="b2b-advantages-section">
        <div className="container">
          <div className="centered-header">
            <span className="premium-badge-glow">Wholesale Advantages</span>
            <h2>Why Partner with Vision Pro LCD?</h2>
            <p>Empowering cell phone repair businesses across Canada with premium OEM components and fast turnarounds.</p>
          </div>
          
          <div className="advantages-grid">
            <div className="advantage-card">
              <div className="advantage-icon-wrapper"><Shield size={28} /></div>
              <h3>12-Month Quality Guarantee</h3>
              <p>We source only high-tier parts. If any component displays defect under warranty, we offer immediate replacement options.</p>
            </div>
            <div className="advantage-card">
              <div className="advantage-icon-wrapper"><Truck size={28} /></div>
              <h3>Canada-Wide Express Delivery</h3>
              <p>Place orders before 3 PM EST for guaranteed same-day dispatch and overnight courier services directly to your workshop.</p>
            </div>
            <div className="advantage-card">
              <div className="advantage-icon-wrapper"><Zap size={28} /></div>
              <h3>Polymorphic SKU Logistics</h3>
              <p>Browse components, repair parts, and pre-owned devices in a single centralized inventory dashboard.</p>
            </div>
            <div className="advantage-card">
              <div className="advantage-icon-wrapper"><Users size={28} /></div>
              <h3>Dedicated Account Reps</h3>
              <p>Our sales support team resolves purchase queries, buyback valuations, and RMA tickets in real time.</p>
            </div>
          </div>
        </div>
      </section>

  
      {/* NEW SECTION 3: Appointment Booking Form */}
      <section className="homepage-booking-section" id="book-repair">
        <div className="container">
          <div className="booking-layout">
            <div className="booking-info-block">
              <span className="premium-badge-glow">Expert Service</span>
              <h2>Book a Premium Device Repair</h2>
              <p>Need micro-soldering, board level diagnosis, or OEM screen refurbishment? Book a scheduled time with our lab technicians in Richmond Hill, ON.</p>
              
              <div className="booking-features-list">
                <div className="feat-item">
                  <Award size={18} />
                  <div>
                    <h4>Certified Lab Engineers</h4>
                    <p>Expert diagnostic tools, dust-free chambers, and factory repair specs.</p>
                  </div>
                </div>
                <div className="feat-item">
                  <Clock size={18} />
                  <div>
                    <h4>Same-Day Service Options</h4>
                    <p>Most screen and battery swaps are resolved within hours of intake.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="booking-form-card">
              <h3>Schedule Repair Intake</h3>
              {appointmentSuccess ? (
                <div className="success-banner">
                  <Star size={24} style={{ color: 'var(--gold)' }} />
                  <h4>Appointment Scheduled!</h4>
                  <p>Your repair intake request has been successfully created. You can track this in your dashboard.</p>
                </div>
              ) : (
                <form onSubmit={handleAppointmentSubmit} className="homepage-form-grid">
                  <div className="input-group-row">
                    <div className="form-field-wrapper">
                      <label>Contact Name</label>
                      <div className="input-icon-wrap">
                        <User size={16} />
                        <input 
                          type="text" name="fullName" placeholder="John Doe" required 
                          value={appointmentForm.fullName} onChange={handleAppointmentChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="input-group-row double">
                    <div className="form-field-wrapper">
                      <label>Email Address</label>
                      <div className="input-icon-wrap">
                        <Mail size={16} />
                        <input 
                          type="email" name="email" placeholder="john@example.com" required 
                          value={appointmentForm.email} onChange={handleAppointmentChange}
                        />
                      </div>
                    </div>
                    <div className="form-field-wrapper">
                      <label>Phone Number</label>
                      <div className="input-icon-wrap">
                        <Phone size={16} />
                        <input 
                          type="tel" name="phone" placeholder="647-555-0199" required 
                          value={appointmentForm.phone} onChange={handleAppointmentChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-field-wrapper">
                    <label>Intake Repair Service Type</label>
                    <select 
                      name="serviceType" value={appointmentForm.serviceType} onChange={handleAppointmentChange}
                    >
                      <option value="Screen Repair">Screen Repair & Glass Refurbishment</option>
                      <option value="Battery Replacement">Battery Capacity Restoration</option>
                      <option value="Board Level Repair">Micro-Soldering & IC Board Diagnostics</option>
                      <option value="Heavy Machinery Service">Heavy Machinery Repair Calibration</option>
                      <option value="Other">Other Diagnostic Inquiry</option>
                    </select>
                  </div>

                  <div className="input-group-row double">
                    <div className="form-field-wrapper">
                      <label>Intake Date</label>
                      <input 
                        type="date" name="date" required 
                        value={appointmentForm.date} onChange={handleAppointmentChange}
                      />
                    </div>
                    <div className="form-field-wrapper">
                      <label>Intake Time</label>
                      <input 
                        type="time" name="time" required 
                        value={appointmentForm.time} onChange={handleAppointmentChange}
                      />
                    </div>
                  </div>

                  <div className="form-field-wrapper">
                    <label>Additional Intake Notes (Optional)</label>
                    <textarea 
                      name="notes" placeholder="Please specify device model, IMEI or symptoms..." rows="3"
                      value={appointmentForm.notes} onChange={handleAppointmentChange}
                    ></textarea>
                  </div>

                  {!user && (
                    <div className="guest-warning">
                      <AlertCircle size={14} />
                      <span>Note: You will be prompted to login to secure your booking.</span>
                    </div>
                  )}

                  <button 
                    type="submit" disabled={appointmentSubmitting}
                    className="submit-booking-btn"
                  >
                    {appointmentSubmitting ? 'Processing Booking...' : 'Confirm and Sync Booking'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>



      {/* Review Intake Modal */}
      {showReviewModal && (
        <div className="booking-modal-overlay">
          <div className="booking-modal-card" style={{ maxWidth: '500px' }}>
            <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '8px', color: '#f1f5f9' }}>Submit B2B Review</h3>
            <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>
              Share your business experience. Reviews are reviewed by our team prior to publishing.
            </p>
            <form onSubmit={handleReviewSubmit} className="homepage-form-grid" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="form-field-wrapper">
                <label>Full Name</label>
                <input 
                  type="text" 
                  required 
                  value={reviewForm.fullName}
                  onChange={(e) => setReviewForm({ ...reviewForm, fullName: e.target.value })}
                  placeholder="e.g., John Doe"
                />
              </div>
              <div className="form-field-wrapper">
                <label>Company / Shop Name</label>
                <input 
                  type="text" 
                  value={reviewForm.company}
                  onChange={(e) => setReviewForm({ ...reviewForm, company: e.target.value })}
                  placeholder="e.g., iPhone Repairs Inc."
                />
              </div>
              <div className="form-field-wrapper">
                <label>Rating</label>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
<Star 
                         size={28} 
                         fill={star <= reviewForm.rating ? '#c9a227' : 'none'} 
                         color={star <= reviewForm.rating ? '#c9a227' : '#64748b'} 
                       />
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-field-wrapper">
                <label>Comment / Feedback</label>
                <textarea 
                  required 
                  rows="4"
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder="Write your experience with our services/products..."
                  style={{ minHeight: '100px' }}
                ></textarea>
              </div>

              {reviewError && (
                <div className="guest-warning" style={{ color: '#ef4444', background: '#fef2f2', borderColor: '#fecaca' }}>
                  <span>{reviewError}</span>
                </div>
              )}

              {reviewSuccess && (
                <div className="success-banner" style={{ padding: '15px' }}>
                  <p style={{ margin: 0, fontWeight: '700', fontSize: '13px' }}>{reviewSuccess}</p>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button 
                  type="button" 
                  className="submit-booking-btn" 
                  onClick={() => setShowReviewModal(false)}
                  disabled={submittingReview}
                  style={{ background: '#64748b', width: 'auto', padding: '10px 20px' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="submit-booking-btn"
                  disabled={submittingReview}
                  style={{ width: 'auto', padding: '10px 25px' }}
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Embedded CSS Stylesheet - VIBRANT DARK FULL COLOR */}
      <style dangerouslySetInnerHTML={{ __html: `
        .search-bar-premium { display: flex; align-items: center; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 16px; padding: 12px 18px; width: 360px; transition: all 0.25s; box-shadow: 0 6px 20px rgba(0,0,0,0.25); }
        .search-bar-premium:focus-within { border-color: var(--primary-color); box-shadow: 0 0 0 5px rgba(37, 99, 235, 0.12); }
        .search-icon-live { color: #64748b; margin-right: 12px; }
        .search-bar-premium input { border: none; outline: none; font-size: 15px; font-weight: 600; width: 100%; color: #f1f5f9; background: transparent; letter-spacing: 0.2px; }

        /* Out of stock card styles */
        .card-out-of-stock-ribbon {
          position: absolute;
          top: 14px;
          left: 0;
          background: #ef4444;
          color: white;
          font-size: 10px;
          font-weight: 800;
          padding: 4px 12px 4px 10px;
          border-radius: 0 20px 20px 0;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          z-index: 3;
          box-shadow: 0 2px 8px rgba(239,68,68,0.35);
        }
        .add-to-cart-btn.out-of-stock-btn {
          background: #1e293b !important;
          color: #64748b !important;
          cursor: not-allowed !important;
          border: 1.5px solid #334155 !important;
          opacity: 1 !important;
        }

        .centered-header { text-align: center; margin-bottom: 60px; }
        .centered-header h2 { font-size: 34px; font-weight: 800; color: var(--text-primary); margin: 12px 0 8px; letter-spacing: -0.8px; line-height: 1.1; }
        .centered-header p { color: #94a3b8; font-size: 16px; max-width: 620px; margin: 0 auto; line-height: 1.6; }

        .premium-badge-glow { background: rgba(23,85,162,0.08); color: var(--secondary-color); padding: 6px 16px; border-radius: 999px; font-size: 11px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; border: 1px solid rgba(23,85,162,0.18); }

        .b2b-advantages-section { padding: 100px 0; background: var(--gradient-section); border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); }
        .advantages-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 28px; }
        .advantage-card { background: var(--bg-card); padding: 38px 32px; border-radius: 24px; border: 1px solid var(--border-color); transition: all 0.4s cubic-bezier(0.23,1,0.32,1); }
        .advantage-card:hover { transform: translateY(-6px); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.35); border-color: var(--primary-color); }
        .advantage-icon-wrapper { width: 60px; height: 60px; border-radius: 18px; background: rgba(201,162,39,0.12); color: var(--gold); display: flex; align-items: center; justify-content: center; margin-bottom: 22px; transition: all 0.3s ease; }
.advantage-card:hover .advantage-icon-wrapper {
  background: rgba(201,162,39,0.2);
  transform: scale(1.05);
}
        .advantage-card h3 { font-size: 19px; font-weight: 700; color: var(--text-primary); margin-bottom: 14px; letter-spacing: -0.3px; }
        .advantage-card p { color: #94a3b8; font-size: 14.5px; line-height: 1.65; }

        .pricing-tiers-section { padding: 100px 0; background: var(--bg-deep); }
        .tiers-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(290px, 1fr)); gap: 28px; }
        .tier-card-premium { background: var(--bg-card); padding: 42px 34px; border-radius: 28px; border: 1px solid var(--border-color); position: relative; transition: all 0.4s; }
        .tier-card-premium.featured-tier { border: 2px solid var(--gold); box-shadow: 0 25px 55px -12px rgba(201,162,39,0.2); }
        .featured-ribbon { position: absolute; top: 18px; right: 22px; background: var(--gradient-gold); color: #090e1a; padding: 5px 14px; border-radius: 999px; font-size: 10px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; }
        .tier-header-wrap { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
        .tier-badge { background: rgba(37,99,235,0.1); color: var(--primary-color); padding: 5px 12px; border-radius: 10px; font-size: 11px; font-weight: 700; }
        .tier-badge-gold { background: rgba(201,162,39,0.12); color: var(--gold); padding: 5px 12px; border-radius: 10px; font-size: 11px; font-weight: 700; }
        .tier-card-premium h3 { font-size: 23px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.4px; }
        .tier-pricing-discount { font-size: 19px; font-weight: 800; color: var(--gold); margin: 14px 0 26px; }
        .tier-features { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 13px; border-top: 1px solid var(--border-color); padding-top: 22px; }
        .tier-features li { font-size: 14.5px; color: #94a3b8; font-weight: 600; display: flex; align-items: center; }
        .tier-features li::before { content: "✓"; color: var(--teal); font-weight: 800; margin-right: 11px; }

        .homepage-booking-section { padding: 90px 0; background: var(--gradient-section); color: #f1f5f9; border-radius: 48px; margin: 50px 20px; overflow: hidden; border: 1px solid var(--border-color); box-shadow: 0 30px 70px -20px rgba(0,0,0,0.5); }
        .booking-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 70px; align-items: center; padding: 0 50px; }
        .booking-info-block .premium-badge-glow { background: rgba(201,162,39,0.1); color: var(--gold); border: 1px solid rgba(201,162,39,0.2); }
        .booking-info-block h2 { font-size: 40px; font-weight: 800; margin: 16px 0; letter-spacing: -1.2px; line-height: 1.05; color: var(--text-primary); }
        .booking-info-block p { color: #94a3b8; font-size: 16px; line-height: 1.65; margin-bottom: 42px; }
        .booking-features-list { display: flex; flex-direction: column; gap: 32px; }
        .booking-features-list .feat-item { display: flex; gap: 18px; }
        .booking-features-list .feat-item svg { color: var(--teal); flex-shrink: 0; margin-top: 2px; transition: transform 0.2s; }
.booking-features-list .feat-item:hover svg {
  transform: scale(1.1);
}
        .booking-features-list .feat-item h4 { font-size: 16px; font-weight: 700; margin-bottom: 5px; color: var(--text-primary); }
        .booking-features-list .feat-item p { font-size: 14.5px; color: #94a3b8; margin: 0; line-height: 1.5; }

        .booking-form-card { background: var(--bg-card); padding: 44px; border-radius: 32px; color: var(--text-primary); box-shadow: 0 30px 70px -15px rgba(0,0,0,0.45); border: 1px solid var(--border-color); }
        .booking-form-card h3 { font-size: 23px; font-weight: 800; margin-bottom: 28px; color: var(--text-primary); }
        .homepage-form-grid { display: flex; flex-direction: column; gap: 16px; }
        .form-field-wrapper { display: flex; flex-direction: column; gap: 7px; }
        .form-field-wrapper label { font-size: 11px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.6px; }
        .input-icon-wrap { position: relative; display: flex; align-items: center; }
        .input-icon-wrap svg { position: absolute; left: 16px; color: var(--text-secondary); }
        .input-icon-wrap input { padding-left: 46px !important; background: var(--bg-elevated); color: var(--text-primary); border: 1px solid var(--border-color); border-radius: 14px; }
        .homepage-form-grid input, .homepage-form-grid select, .homepage-form-grid textarea { width: 100%; padding: 14px 18px; border: 1px solid var(--border-color); border-radius: 16px; outline: none; font-size: 14.5px; font-weight: 500; transition: var(--transition); background: var(--bg-elevated); color: var(--text-primary); }
        .homepage-form-grid input:focus, .homepage-form-grid select:focus, .homepage-form-grid textarea:focus { border-color: var(--secondary-color); box-shadow: 0 0 0 5px rgba(23,85,162,0.13); background: var(--bg-card); }
        .input-group-row { display: flex; gap: 16px; }
        .input-group-row.double > div { flex: 1; }
        .guest-warning { display: flex; align-items: center; gap: 9px; color: var(--gold); background: rgba(201,162,39,0.07); padding: 11px 15px; border-radius: 12px; font-size: 12.5px; font-weight: 600; border: 1px solid rgba(201,162,39,0.18); }
        .submit-booking-btn { background: var(--gradient-primary); color: white; border: none; padding: 15px; border-radius: 14px; font-weight: 700; font-size: 14.5px; cursor: pointer; transition: all 0.2s; letter-spacing: 0.3px; }
        .submit-booking-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(37,99,235,0.35); }
        .success-banner { text-align: center; padding: 42px 24px; background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.25); border-radius: 22px; color: #10b981; }

        .faq-accordions-section { padding: 100px 0; background: var(--bg-deep); }
        .accordion-list { display: flex; flex-direction: column; gap: 14px; }
        .accordion-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 18px; overflow: hidden; transition: all 0.25s; }
        .accordion-card.active { border-color: var(--primary-color); background: var(--bg-elevated); }
        .accordion-toggle-btn { width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 24px 28px; border: none; background: transparent; cursor: pointer; text-align: left; font-size: 15.5px; font-weight: 700; color: var(--text-primary); }
        .accordion-toggle-btn:hover { color: var(--secondary-color); }
        .accordion-content-panel { padding: 0 28px; max-height: 0; overflow: hidden; transition: all 0.35s cubic-bezier(0.23,1,0.32,1); }
        .accordion-content-panel.open { padding-bottom: 24px; max-height: 220px; }
        .accordion-content-panel p { color: #94a3b8; font-size: 14.5px; line-height: 1.65; margin: 0; }

        .testimonials-section { padding: 100px 0; background: var(--gradient-section); border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); }
        .testimonials-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(290px, 1fr)); gap: 28px; }
        .testimonial-card { background: var(--bg-card); padding: 36px; border-radius: 24px; border: 1px solid var(--border-color); display: flex; flex-direction: column; transition: all 0.3s; }
        .testimonial-card:hover { transform: translateY(-6px); box-shadow: 0 25px 55px -12px rgba(0,0,0,0.35); border-color: var(--gold); }
        .stars-row { display: flex; gap: 6px; margin-bottom: 16px; }
.stars-row svg {
  fill: var(--secondary-color) !important;
  color: var(--secondary-color) !important;
  stroke: var(--secondary-color) !important;
  filter: drop-shadow(0 1px 2px rgba(23, 85, 162, 0.3));
  transition: transform 0.2s ease;
}
.stars-row svg:hover {
  transform: scale(1.15);
}
        .testimonial-text { font-size: 14.5px; color: var(--text-secondary); font-weight: 600; line-height: 1.65; flex-grow: 1; font-style: italic; margin-bottom: 22px; }
        .testimonial-author h4 { font-size: 15.5px; font-weight: 800; color: var(--text-primary); margin-bottom: 3px; }
        .testimonial-author span { font-size: 12.5px; color: #64748b; font-weight: 600; }

        .homepage-blog-section { padding: 100px 0; background: var(--bg-deep); }
        .blog-posts-slider { display: grid; grid-template-columns: repeat(auto-fit, minmax(310px, 1fr)); gap: 28px; }
        .blog-post-card { background: var(--bg-card); border-radius: 22px; border: 1px solid var(--border-color); overflow: hidden; display: flex; flex-direction: column; transition: all 0.3s; }
        .blog-post-card:hover { transform: translateY(-5px); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.35); border-color: var(--primary-color); }
        .post-image-wrap { height: 192px; position: relative; overflow: hidden; background: #242f45; }
        .post-image-wrap img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.35s; }
        .blog-post-card:hover .post-image-wrap img { transform: scale(1.06); }
        .post-category-tag { position: absolute; bottom: 16px; left: 16px; background: var(--secondary-color); color: white; padding: 5px 12px; border-radius: 10px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
        .post-info-stack { padding: 26px; display: flex; flex-direction: column; flex-grow: 1; }
        .post-date { font-size: 11.5px; color: #64748b; font-weight: 700; margin-bottom: 9px; }
        .blog-post-card h3 { font-size: 16.5px; font-weight: 800; color: var(--text-primary); margin-bottom: 11px; line-height: 1.35; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .blog-post-card p { font-size: 13.5px; color: #94a3b8; line-height: 1.55; margin-bottom: 18px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .post-learn-more { font-size: 13.5px; font-weight: 700; color: var(--secondary-color); display: flex; align-items: center; gap: 6px; margin-top: auto; }
        .post-learn-more:hover { color: var(--accent); }

        @media (max-width: 1024px) {
          .booking-layout { grid-template-columns: 1fr; gap: 48px; }
        }
        @media (max-width: 768px) {
          .homepage-booking-section { margin: 30px 12px; border-radius: 24px; }
          .booking-layout { padding: 0 20px; }
          .booking-form-card { padding: 26px; border-radius: 20px; }
          .input-group-row { flex-direction: column; gap: 14px; }
        }
      `}} />
    </div>
  );
};

export default Home;
