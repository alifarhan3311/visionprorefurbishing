import React from 'react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import './Contact.css';

const Contact = () => {
  return (
    <div className="contact-page">
      <Header />

      <div className="contact-hero">
        <div className="container">
          <h1>Get In Touch</h1>
          <p>We're here to help with your wholesale parts and refurbishment needs.</p>
        </div>
      </div>

      <div className="container contact-grid">

        {/* LEFT: Info Cards */}
        <div className="contact-info-section">

          <div className="info-card reveal">
            <div className="info-card-icon"><MapPin size={20} /></div>
            <div className="info-card-body">
              <h3>Store Address</h3>
              <p><strong>Vision Pro Lcd</strong><br />7215 Goreway Dr #1c27,<br />Mississauga, ON L4T 2T9</p>
            </div>
          </div>

          <div className="info-card reveal" style={{ transitionDelay: '100ms' }}>
            <div className="info-card-icon"><Phone size={20} /></div>
            <div className="info-card-body">
              <h3>Call / WhatsApp</h3>
              <a href="https://wa.me/14169197565" target="_blank" rel="noreferrer">+1 (416) 919-7565</a>
            </div>
          </div>

          <div className="info-card reveal" style={{ transitionDelay: '200ms' }}>
            <div className="info-card-icon"><Mail size={20} /></div>
            <div className="info-card-body">
              <h3>Email Us</h3>
              <a href="mailto:Visionpro.lcd@gmail.com">Visionpro.lcd@gmail.com</a>
            </div>
          </div>

          <div className="info-card reveal" style={{ transitionDelay: '300ms' }}>
            <div className="info-card-icon"><Clock size={20} /></div>
            <div className="info-card-body">
              <h3>Working Hours</h3>
              <p>Mon – Fri: 10:00 AM – 9:00 PM<br />Sat: 10:00 AM – 9:00 PM<br />Sun: 12:00 PM – 6:00 PM</p>
            </div>
          </div>

          <div className="info-card reveal" style={{ transitionDelay: '400ms' }}>
            <div className="info-card-body" style={{ width: '100%' }}>
              <h3>Follow Us</h3>
              <div className="contact-social-row">
                <a href="https://www.facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="contact-social-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
                <a href="https://www.instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="contact-social-btn instagram">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </a>
                <a href="https://wa.me/14169197565" target="_blank" rel="noreferrer" aria-label="WhatsApp" className="contact-social-btn whatsapp">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT: Map + Form */}
        <div className="contact-form-section reveal">

          {/* Google Map */}
          <div className="contact-map-wrap">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2888.225330384752!2d-79.645700!3d43.708800!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x882b39556d555555%3A0x5555555555555555!2s7215%20Goreway%20Dr%20%231c27%2C%20Mississauga%2C%20ON%20L4T%202T9!5e0!3m2!1sen!2sca!4v1715431234567!5m2!1sen!2sca"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>

          {/* Contact Form */}
          <div className="contact-form-card">
            <h2>Send us a Message</h2>
            <p className="form-subtitle">Fill out the form below and we'll get back to you shortly.</p>

            <form onSubmit={(e) => { e.preventDefault(); alert('Message sent!'); }} className="contact-form-grid">

              <div className="contact-form-row">
                <div className="contact-field">
                  <label>Full Name</label>
                  <input type="text" placeholder="John Doe" required />
                </div>
                <div className="contact-field">
                  <label>Email Address</label>
                  <input type="email" placeholder="john@example.com" required />
                </div>
              </div>

              <div className="contact-field">
                <label>Subject</label>
                <input type="text" placeholder="Inquiry about..." required />
              </div>

              <div className="contact-field">
                <label>Message</label>
                <textarea rows="5" placeholder="How can we help you today?" required></textarea>
              </div>

              <button type="submit" className="contact-submit-btn">
                <Send size={17} /> Send Message
              </button>

            </form>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;
