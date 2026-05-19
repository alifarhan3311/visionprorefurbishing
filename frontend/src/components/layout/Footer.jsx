import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Globe, Share2, MessageCircle, Info } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        {/* Company Info */}
        <div className="footer-col">
          <div className="footer-brand">
            <div className="footer-logo-container">
              <img src="/assets/visionpro-logo.png" alt="visionprorefurbishing" className="footer-logo-img" />
              <div className="footer-brand-name">
                Vision Pro <span>LCD</span>
              </div>
            </div>
          </div>
          <p className="footer-desc">
            Premium B2B partner for wholesale LCDs, mobile parts, and professional refurbishment tools. Quality you can trust.
          </p>
          <div className="social-links">
            <a href="#"><Globe size={20} /></a>
            <a href="#"><MessageCircle size={20} /></a>
            <a href="#"><Share2 size={20} /></a>
            <a href="#"><Info size={20} /></a>
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

        {/* Contact Info */}
        <div className="footer-col">
          <h4 className="footer-title">Contact Us</h4>
          <div className="footer-contact">
            <div className="contact-item">
              <MapPin size={22} className="contact-icon" />
              <span>7215 Goreway Dr #1c27,<br/>Mississauga, L4T2T9, Ontario</span>
            </div>
            <div className="contact-item">
              <Phone size={18} className="contact-icon" />
              <a href="https://wa.me/16472615077" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>(647) 261-5077</a>
            </div>
            <div className="contact-item">
              <Mail size={18} className="contact-icon" />
              <a href="mailto:Visionpro.lcd@gmail.com" style={{ color: 'inherit', textDecoration: 'none' }}>Visionpro.lcd@gmail.com</a>
            </div>
            <div className="contact-item">
              <Clock size={18} className="contact-icon" />
              <span>Mon - Fri: 9 AM - 5 PM<br/>Sat - Sun: Closed</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Vision Pro LCD. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
