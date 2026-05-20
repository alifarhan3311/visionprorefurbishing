import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingCart, Smartphone, ArrowRight, Cpu, Box, 
  Search, Shield, Truck, RefreshCw, Calendar, Clock, 
  Mail, Phone, User, ChevronDown, ChevronUp, Zap, 
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
          <p style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading products...</p>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
            <Box size={48} style={{ color: '#cbd5e1', marginBottom: '15px' }} />
            <h3 style={{ color: '#475569' }}>No Products Found</h3>
            <p style={{ color: '#94a3b8' }}>Try refining your search terms.</p>
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
                <Link to={`/product/${product._id}`} className="product-image-container">
                  {product.imageUrl ? (
                    <img src={getImageUrl(product.imageUrl)} alt={product.name} className="product-image" />
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
                    navigate('/cart'); // redirect to cart instantly
                  }}
                >
                  <ShoppingCart size={16} /> Add to Cart
                </button>
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

      {/* NEW SECTION 2: B2B Dealer Pricing Tiers */}
      <section className="pricing-tiers-section">
        <div className="container">
          <div className="centered-header">
            <span className="premium-badge-glow">B2B Tiers</span>
            <h2>Volume Pricing Tiers</h2>
            <p>Unlock custom margins as your order volume scales. Register to view your real-time catalog pricing.</p>
          </div>

          <div className="tiers-grid">
            <div className="tier-card-premium">
              <div className="tier-header-wrap">
                <span className="tier-badge">Level 1</span>
                <h3>Bronze Member</h3>
              </div>
              <div className="tier-pricing-discount">Standard B2B Rates</div>
              <ul className="tier-features">
                <li>Access to full parts ledger</li>
                <li>Standard 12-Month warranty</li>
                <li>No monthly minimum volume</li>
                <li>Same-day dispatch option</li>
              </ul>
            </div>
            
            <div className="tier-card-premium featured-tier">
              <div className="featured-ribbon">Most Popular</div>
              <div className="tier-header-wrap">
                <span className="tier-badge-gold">Level 2</span>
                <h3>Silver Dealer</h3>
              </div>
              <div className="tier-pricing-discount">10% OFF base retail</div>
              <ul className="tier-features">
                <li>Requires $1,000 monthly volume</li>
                <li>Priority support queue</li>
                <li>Extended 14-day return window</li>
                <li>Free shipping on orders over $500</li>
              </ul>
            </div>

            <div className="tier-card-premium">
              <div className="tier-header-wrap">
                <span className="tier-badge">Level 3</span>
                <h3>Gold Partner</h3>
              </div>
              <div className="tier-pricing-discount">15% - 20% OFF base retail</div>
              <ul className="tier-features">
                <li>Requires $3,000 monthly volume</li>
                <li>Dedicated Account rep</li>
                <li>Custom parts pre-ordering</li>
                <li>Free priority shipping on all orders</li>
              </ul>
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
                  <Star size={24} style={{ color: '#eab308' }} />
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

      {/* NEW SECTION 4: Interactive FAQ Accordions */}
      <section className="faq-accordions-section">
        <div className="container" style={{ maxWidth: '800px' }}>
          <div className="centered-header">
            <span className="premium-badge-glow">FAQ</span>
            <h2>Frequently Asked Questions</h2>
            <p>Quick answers regarding parts quality, shipping protocols, and repair bookings.</p>
          </div>

          <div className="accordion-list">
            {faqData.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={index} className={`accordion-card ${isOpen ? 'active' : ''}`}>
                  <button onClick={() => toggleFaq(index)} className="accordion-toggle-btn">
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                  <div className={`accordion-content-panel ${isOpen ? 'open' : ''}`}>
                    <p>{faq.a}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* NEW SECTION 5: Customer Testimonials */}
      <section className="testimonials-section">
        <div className="container">
          <div className="centered-header">
            <span className="premium-badge-glow">Feedback</span>
            <h2>What B2B Clients Are Saying</h2>
            <p>Serving mobile repair shops and enterprise networks across North America.</p>
          </div>

          <div className="testimonials-grid">
            {loadingReviews ? (
              <p style={{ textAlign: 'center', color: '#64748b', gridColumn: '1 / -1' }}>Loading client testimonials...</p>
            ) : reviews.length === 0 ? (
              <>
                <div className="testimonial-card">
                  <div className="stars-row"><Star size={16} fill="#eab308" color="#eab308" /><Star size={16} fill="#eab308" color="#eab308" /><Star size={16} fill="#eab308" color="#eab308" /><Star size={16} fill="#eab308" color="#eab308" /><Star size={16} fill="#eab308" color="#eab308" /></div>
                  <p className="testimonial-text">"Vision Pro LCD has completely changed how we procure parts. Same day shipment to Montreal gets parts in our hands fast, and defect rates are near zero."</p>
                  <div className="testimonial-author">
                    <h4>Marc-Andre L.</h4>
                    <span>Mobile Tech Depot</span>
                  </div>
                </div>
                <div className="testimonial-card">
                  <div className="stars-row"><Star size={16} fill="#eab308" color="#eab308" /><Star size={16} fill="#eab308" color="#eab308" /><Star size={16} fill="#eab308" color="#eab308" /><Star size={16} fill="#eab308" color="#eab308" /><Star size={16} fill="#eab308" color="#eab308" /></div>
                  <p className="testimonial-text">"Outstanding customer service. Their 12-month replacement policy gives us huge peace of mind for high-value preowned devices."</p>
                  <div className="testimonial-author">
                    <h4>Sarah Jenkins</h4>
                    <span>iFix Smart Labs</span>
                  </div>
                </div>
                <div className="testimonial-card">
                  <div className="stars-row"><Star size={16} fill="#eab308" color="#eab308" /><Star size={16} fill="#eab308" color="#eab308" /><Star size={16} fill="#eab308" color="#eab308" /><Star size={16} fill="#eab308" color="#eab308" /><Star size={16} fill="#eab308" color="#eab308" /></div>
                  <p className="testimonial-text">"Being in the Gold pricing tier saves our business thousands of dollars every month. The team is friendly and RMA validation takes minutes."</p>
                  <div className="testimonial-author">
                    <h4>David K.</h4>
                    <span>Apex Cell Repairs</span>
                  </div>
                </div>
              </>
            ) : (
              reviews.map(r => (
                <div key={r._id} className="testimonial-card">
                  <div className="stars-row">
                    {[...Array(r.rating || 5)].map((_, idx) => (
                      <Star key={idx} size={16} fill="#eab308" color="#eab308" />
                    ))}
                  </div>
                  <p className="testimonial-text">"{r.comment}"</p>
                  <div className="testimonial-author">
                    <h4>{r.fullName}</h4>
                    {r.company && <span>{r.company}</span>}
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <button className="submit-booking-btn" onClick={() => setShowReviewModal(true)} style={{ display: 'inline-block', width: 'auto', padding: '12px 30px' }}>
              Submit a B2B Partner Review
            </button>
          </div>
        </div>
      </section>

      {/* NEW SECTION 6: Blog Insights Grid / Carousel */}
      <section className="homepage-blog-section">
        <div className="container">
          <div className="centered-header">
            <span className="premium-badge-glow">Insights</span>
            <h2>Industry News & Technical Insights</h2>
            <p>Get diagnostic advice, hardware tutorials, and pricing reports from our engineering division.</p>
          </div>

          {loadingBlogs ? (
            <p style={{ textAlign: 'center', color: '#64748b' }}>Syncing articles...</p>
          ) : blogs.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#94a3b8' }}>No blog articles published.</p>
          ) : (
            <div className="blog-posts-slider">
              {blogs.map((post) => (
                <div key={post._id} className="blog-post-card">
                  <div className="post-image-wrap">
                    <img src={post.image ? getImageUrl(post.image) : 'https://images.unsplash.com/photo-1601524909162-be87252be298?auto=format&fit=crop&w=400&q=80'} alt={post.title} />
                    <span className="post-category-tag">{post.category}</span>
                  </div>
                  <div className="post-info-stack">
                    <span className="post-date">{new Date(post.createdAt).toLocaleDateString()}</span>
                    <h3>{post.title}</h3>
                    <p>{post.excerpt}</p>
                    <Link to="/blog" className="post-learn-more">
                      Read Article <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Review Intake Modal */}
      {showReviewModal && (
        <div className="booking-modal-overlay">
          <div className="booking-modal-card" style={{ maxWidth: '500px' }}>
            <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '8px', color: '#0f172a' }}>Submit B2B Review</h3>
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
                        fill={star <= reviewForm.rating ? '#eab308' : 'none'} 
                        color={star <= reviewForm.rating ? '#eab308' : '#cbd5e1'} 
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

      {/* Embedded CSS Stylesheet for visual excellence */}
      <style dangerouslySetInnerHTML={{ __html: `
        .search-bar-premium { display: flex; align-items: center; background: white; border: 1px solid #e2e8f0; border-radius: 14px; padding: 10px 16px; width: 340px; transition: all 0.2s; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .search-bar-premium:focus-within { border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }
        .search-icon-live { color: #94a3b8; margin-right: 10px; }
        .search-bar-premium input { border: none; outline: none; font-size: 14px; font-weight: 600; width: 100%; color: #0f172a; }

        .centered-header { text-align: center; margin-bottom: 50px; }
        .centered-header h2 { font-size: 32px; font-weight: 800; color: #0f172a; margin: 10px 0; letter-spacing: -0.5px; }
        .centered-header p { color: #64748b; font-size: 16px; max-width: 600px; margin: 0 auto; }
        .premium-badge-glow { background: #eff6ff; color: #2563eb; padding: 6px 14px; border-radius: 100px; font-size: 12px; font-weight: 700; text-transform: uppercase; border: 1px solid rgba(37, 99, 235, 0.1); }

        .b2b-advantages-section { padding: 80px 0; background: #f8fafc; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; }
        .advantages-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 30px; }
        .advantage-card { background: white; padding: 35px 30px; border-radius: 24px; border: 1px solid #e2e8f0; transition: all 0.3s; }
        .advantage-card:hover { transform: translateY(-4px); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05); }
        .advantage-icon-wrapper { width: 56px; height: 56px; border-radius: 16px; background: #eff6ff; color: #2563eb; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }
        .advantage-card h3 { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
        .advantage-card p { color: #64748b; font-size: 14px; line-height: 1.6; }

        .pricing-tiers-section { padding: 80px 0; }
        .tiers-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; }
        .tier-card-premium { background: white; padding: 40px 30px; border-radius: 28px; border: 1px solid #e2e8f0; position: relative; transition: all 0.3s; }
        .tier-card-premium.featured-tier { border: 2px solid #2563eb; transform: scale(1.02); box-shadow: 0 20px 40px -15px rgba(37, 99, 235, 0.15); }
        .featured-ribbon { position: absolute; top: 15px; right: 20px; background: #2563eb; color: white; padding: 4px 12px; border-radius: 20px; font-size: 10px; font-weight: 800; text-transform: uppercase; }
        .tier-header-wrap { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .tier-badge { background: #f1f5f9; color: #475569; padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 700; }
        .tier-badge-gold { background: #fef3c7; color: #b45309; padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 700; }
        .tier-card-premium h3 { font-size: 22px; font-weight: 800; color: #0f172a; }
        .tier-pricing-discount { font-size: 18px; font-weight: 800; color: #2563eb; margin: 15px 0 25px 0; }
        .tier-features { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; border-top: 1px solid #f1f5f9; padding-top: 20px; }
        .tier-features li { font-size: 14px; color: #475569; font-weight: 600; display: flex; align-items: center; }
        .tier-features li::before { content: "✓"; color: #10b981; font-weight: 800; margin-right: 10px; }

        .homepage-booking-section { padding: 80px 0; background: #0f172a; color: white; border-radius: 40px; margin: 40px 20px; overflow: hidden; }
        .booking-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; padding: 0 40px; }
        .booking-info-block .premium-badge-glow { background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.1); }
        .booking-info-block h2 { font-size: 38px; font-weight: 800; margin: 20px 0; letter-spacing: -1px; }
        .booking-info-block p { color: #94a3b8; font-size: 16px; line-height: 1.6; margin-bottom: 40px; }
        .booking-features-list { display: flex; flex-direction: column; gap: 30px; }
        .booking-features-list .feat-item { display: flex; gap: 15px; }
        .booking-features-list .feat-item svg { color: #3b82f6; flex-shrink: 0; }
        .booking-features-list .feat-item h4 { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
        .booking-features-list .feat-item p { font-size: 14px; color: #94a3b8; margin: 0; }

        .booking-form-card { background: white; padding: 40px; border-radius: 28px; color: #0f172a; box-shadow: 0 20px 50px rgba(0,0,0,0.3); }
        .booking-form-card h3 { font-size: 22px; font-weight: 800; margin-bottom: 25px; color: #0f172a; }
        .homepage-form-grid { display: flex; flex-direction: column; gap: 15px; }
        .form-field-wrapper { display: flex; flex-direction: column; gap: 6px; }
        .form-field-wrapper label { font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
        .input-icon-wrap { position: relative; display: flex; align-items: center; }
        .input-icon-wrap svg { position: absolute; left: 14px; color: #94a3b8; }
        .input-icon-wrap input { padding-left: 40px !important; }
        .homepage-form-grid input, .homepage-form-grid select, .homepage-form-grid textarea { width: 100%; padding: 12px 16px; border: 1px solid #cbd5e1; border-radius: 12px; outline: none; font-size: 13px; font-weight: 600; font-family: inherit; transition: all 0.2s; }
        .homepage-form-grid input:focus, .homepage-form-grid select:focus, .homepage-form-grid textarea:focus { border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59,130,246,0.1); }
        .input-group-row { display: flex; gap: 15px; }
        .input-group-row.double > div { flex: 1; }
        .guest-warning { display: flex; align-items: center; gap: 8px; color: #ea580c; background: #fff7ed; padding: 10px 14px; border-radius: 10px; font-size: 12px; font-weight: 600; border: 1px solid #ffedd5; }
        .submit-booking-btn { background: #2563eb; color: white; border: none; padding: 14px; border-radius: 14px; font-weight: 800; font-size: 14px; cursor: pointer; transition: all 0.2s; }
        .submit-booking-btn:hover { background: #1d4ed8; transform: translateY(-1px); }
        .success-banner { text-align: center; padding: 40px 20px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 20px; }
        .success-banner h4 { font-size: 18px; font-weight: 800; color: #15803d; margin: 15px 0 8px 0; }
        .success-banner p { color: #166534; font-size: 14px; }

        .faq-accordions-section { padding: 80px 0; }
        .accordion-list { display: flex; flex-direction: column; gap: 15px; }
        .accordion-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; transition: all 0.2s; }
        .accordion-card.active { border-color: #3b82f6; background: white; box-shadow: 0 10px 20px rgba(59,130,246,0.03); }
        .accordion-toggle-btn { width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 22px 25px; border: none; background: transparent; cursor: pointer; text-align: left; font-size: 15px; font-weight: 700; color: #0f172a; transition: all 0.2s; }
        .accordion-toggle-btn:hover { color: #2563eb; }
        .accordion-content-panel { padding: 0 25px; max-height: 0; overflow: hidden; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        .accordion-content-panel.open { padding-bottom: 22px; max-height: 200px; }
        .accordion-content-panel p { color: #64748b; font-size: 14px; line-height: 1.6; margin: 0; }

        .testimonials-section { padding: 80px 0; background: #f8fafc; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; }
        .testimonials-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; }
        .testimonial-card { background: white; padding: 35px; border-radius: 24px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; transition: all 0.2s; }
        .testimonial-card:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,0,0,0.03); }
        .stars-row { display: flex; gap: 4px; margin-bottom: 15px; }
        .testimonial-text { font-size: 14px; color: #475569; font-weight: 600; line-height: 1.6; flex-grow: 1; font-style: italic; margin-bottom: 20px; }
        .testimonial-author h4 { font-size: 15px; font-weight: 800; color: #0f172a; margin-bottom: 2px; }
        .testimonial-author span { font-size: 12px; color: #94a3b8; font-weight: 600; }

        .homepage-blog-section { padding: 80px 0; }
        .blog-posts-slider { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; }
        .blog-post-card { background: white; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; display: flex; flex-direction: column; transition: all 0.2s; }
        .blog-post-card:hover { transform: translateY(-4px); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.05); }
        .post-image-wrap { height: 180px; position: relative; overflow: hidden; background: #cbd5e1; }
        .post-image-wrap img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
        .blog-post-card:hover .post-image-wrap img { transform: scale(1.05); }
        .post-category-tag { position: absolute; bottom: 15px; left: 15px; background: rgba(15,23,42,0.85); color: white; padding: 4px 10px; border-radius: 8px; font-size: 10px; font-weight: 800; text-transform: uppercase; }
        .post-info-stack { padding: 25px; display: flex; flex-direction: column; flex-grow: 1; }
        .post-date { font-size: 11px; color: #94a3b8; font-weight: 700; margin-bottom: 8px; }
        .blog-post-card h3 { font-size: 16px; font-weight: 800; color: #0f172a; margin-bottom: 10px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .blog-post-card p { font-size: 13px; color: #64748b; line-height: 1.5; margin-bottom: 20px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .post-learn-more { font-size: 13px; font-weight: 700; color: #2563eb; display: flex; align-items: center; gap: 6px; margin-top: auto; text-decoration: none; }
        .post-learn-more:hover { color: #1d4ed8; }

        @media (max-width: 1024px) {
          .booking-layout { grid-template-columns: 1fr; gap: 40px; }
        }
        @media (max-width: 768px) {
          .homepage-booking-section { margin: 20px 10px; border-radius: 20px; }
          .booking-layout { padding: 0; }
          .booking-form-card { padding: 20px; border-radius: 16px; }
          .input-group-row { flex-direction: column; gap: 15px; }
        }
      `}} />
    </div>
  );
};

export default Home;
