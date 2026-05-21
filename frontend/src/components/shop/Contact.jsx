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
        {/* Contact Info Cards */}
       <div className="contact-info-section">
           <div className="info-card reveal">
             <MapPin className="info-icon" />
             <h3>Visit Our Office</h3>
             <p>7215 Goreway Dr #1c27, Mississauga, L4T2T9, Ontario</p>
           </div>
           <div className="info-card reveal" style={{ transitionDelay: '100ms' }}>
             <MapPin className="info-icon" />
             <h3>Warehouse Location</h3>
             <p>O2 Lcd Refurbishing<br/>14 Automatic Rd, U34<br/>Brampton, ON L6S 5N5</p>
           </div>
           <div className="info-card reveal" style={{ transitionDelay: '200ms' }}>
             <Phone className="info-icon" />
             <h3>Call / WhatsApp</h3>
             <p>
               <a href="https://wa.me/16472615077" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>(647) 261-5077</a><br/>
               <a href="https://wa.me/16472615077" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>+1 (647) 261-5077</a>
             </p>
           </div>
           <div className="info-card reveal" style={{ transitionDelay: '300ms' }}>
             <Mail className="info-icon" />
             <h3>Email Us</h3>
             <p><a href="mailto:Visionpro.lcd@gmail.com" style={{ color: 'inherit', textDecoration: 'none' }}>Visionpro.lcd@gmail.com</a></p>
           </div>
           <div className="info-card reveal" style={{ transitionDelay: '400ms' }}>
             <Clock className="info-icon" />
             <h3>Working Hours</h3>
             <p>Mon - Fri: 9:00 AM - 5:00 PM<br/>Sat - Sun: Closed</p>
           </div>
         </div>

        {/* Contact Form Section */}
        <div className="contact-form-section reveal">
          {/* Google Map Integration */}
          <div className="user-card glass" style={{ padding: '0', overflow: 'hidden', height: '300px', marginBottom: '30px', boxShadow: 'var(--shadow-premium)' }}>
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
          <div className="user-card">
            <h2>Send us a Message</h2>
            <form onSubmit={(e) => { e.preventDefault(); alert('Message sent!'); }}>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Full Name</label>
                  <input type="text" placeholder="John Doe" required />
                </div>
                <div className="admin-form-group">
                  <label>Email Address</label>
                  <input type="email" placeholder="john@example.com" required />
                </div>
              </div>
              <div className="admin-form-group">
                <label>Subject</label>
                <input type="text" placeholder="Inquiry about..." required />
              </div>
              <div className="admin-form-group">
                <label>Message</label>
                <textarea rows="5" placeholder="How can we help you today?" required></textarea>
              </div>
              <button type="submit" className="admin-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                <Send size={18} /> Send Message
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
