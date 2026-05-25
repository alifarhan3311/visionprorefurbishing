import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">

        {/* ── TOP ROW: Brand + Quick Links + Support ── */}
        <div className="footer-top-row">

          {/* Brand */}
          <div className="footer-col footer-col-brand">
            <div className="footer-brand">
              <div className="footer-logo-container">
                <img src="/assets/visionpro-logo.png" alt="visionprorefurbishing" className="footer-logo-img" />
                <div className="footer-brand-name">Vision Pro <span>LCD</span></div>
              </div>
            </div>
            <p className="footer-desc">
              Premium B2B partner for wholesale LCDs, mobile parts, and professional refurbishment tools. Quality you can trust.
            </p>
            <div className="social-links">
              <a href="https://www.facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="https://www.instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="https://wa.me/14169197565" target="_blank" rel="noreferrer" aria-label="WhatsApp">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 className="footer-title">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Shop Catalog</Link></li>
              <li><Link to="/quick-order">Bulk Ordering</Link></li>
              <li><Link to="/lcd-buyback">LCD Buyback</Link></li>
              <li><Link to="/dashboard/rma">RMA & Warranty</Link></li>
              <li><Link to="/marketing">Marketing Hub</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="footer-col">
            <h4 className="footer-title">Support</h4>
            <ul className="footer-links">
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/faq">FAQs</Link></li>
              <li><Link to="/shipping">Shipping Policy</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
            </ul>
          </div>

        </div>

        {/* ── DIVIDER ── */}
        <div className="footer-mid-divider"></div>

        {/* ── BOTTOM ROW: Contact Us full width ── */}
        <div className="footer-contact-row">
          <h4 className="footer-title">Contact Us</h4>
          <div className="footer-contact-grid">

            <div className="footer-contact-item">
              <div className="footer-contact-icon"><MapPin size={16} /></div>
              <div>
                <span className="footer-contact-label">Store Address</span>
                <span>Vision Pro Lcd — 7215 Goreway Dr #1c27, Mississauga, ON L4T 2T9</span>
              </div>
            </div>

            <div className="footer-contact-item">
              <div className="footer-contact-icon"><MapPin size={16} /></div>
              <div>
                <span className="footer-contact-label">Warehouse</span>
                <span>O2 Lcd Refurbishing — 14 Automatic Rd #34, Brampton, ON L6S 5N5</span>
              </div>
            </div>

            <div className="footer-contact-item">
              <div className="footer-contact-icon"><Phone size={16} /></div>
              <div>
                <span className="footer-contact-label">Phone / WhatsApp</span>
                <a href="https://wa.me/14169197565" target="_blank" rel="noreferrer">+1 (647) 261-5077</a>
              </div>
            </div>

            <div className="footer-contact-item">
              <div className="footer-contact-icon"><Mail size={16} /></div>
              <div>
                <span className="footer-contact-label">Email</span>
                <a href="mailto:Visionpro.lcd@gmail.com">Visionpro.lcd@gmail.com</a>
              </div>
            </div>

            <div className="footer-contact-item">
              <div className="footer-contact-icon"><Clock size={16} /></div>
              <div>
                <span className="footer-contact-label">Working Hours</span>
                <span>Mon – Fri: 10 AM – 9 PM &nbsp;|&nbsp; Sat: 10 AM – 9 PM &nbsp;|&nbsp; Sun: 12 PM – 6 PM</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* ── BOTTOM BAR ── */}
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>&copy; {new Date().getFullYear()} Vision Pro LCD. All rights reserved.</p>
          <div className="footer-bottom-links">
            <Link to="/terms">Terms</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>
      </div>

    </footer>
  );
};

export default Footer;
