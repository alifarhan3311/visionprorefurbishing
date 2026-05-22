import React from 'react';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import { HelpCircle, Shield, Truck, RefreshCw, MessageCircle } from 'lucide-react';
import './Support.css';

const Support = () => {
  const faqs = [
    { q: "What is your warranty policy?", a: "We offer a lifetime warranty on most screens and batteries, provided they are not physically damaged." },
    { q: "How long does shipping take?", a: "Most B2B orders are processed within 24 hours and delivered within 1-3 business days across Canada." },
    { q: "Do you offer bulk discounts?", a: "Yes, our B2B accounts feature tiered pricing (Silver, Gold, Platinum) based on monthly order volume." },
    { q: "Can I return unused parts?", a: "Unused parts in original packaging can be returned within 30 days for a full credit to your account." }
  ];

  return (
    <div className="support-page">
      <Header />
      
      <div className="support-hero">
        <div className="container">
          <h1 className="reveal">Support Center</h1>
          <p className="reveal" style={{ transitionDelay: '100ms' }}>Everything you need to keep your repair business running smoothly.</p>
        </div>
      </div>

      <div className="container support-sections">
        {/* Support Cards */}
        <div className="support-cards-grid">
          <div className="support-card reveal">
            <Shield className="support-icon" />
            <h3>Warranty & RMA</h3>
            <p>File a claim for defective parts easily through your dashboard.</p>
          </div>
          <div className="support-card reveal" style={{ transitionDelay: '100ms' }}>
            <Truck className="support-icon" />
            <h3>Shipping Info</h3>
            <p>Track your orders and view local delivery schedules.</p>
          </div>
          <div className="support-card reveal" style={{ transitionDelay: '200ms' }}>
            <RefreshCw className="support-icon" />
            <h3>Returns Policy</h3>
            <p>Learn more about our 30-day return policy for partners.</p>
          </div>
          <div className="support-card reveal" style={{ transitionDelay: '300ms' }}>
            <MessageCircle className="support-icon" />
            <h3>Contact Support</h3>
            <p>Our experts are available Mon - Fri: 10am - 9pm, Sat: 10am - 9pm, Sun: 12pm - 6pm.</p>
          </div>
        </div>

        {/* FAQs */}
        <div className="faq-section reveal">
          <div className="user-card glass">
            <h2>Frequently Asked Questions</h2>
            <div className="faq-list">
              {faqs.map((faq, index) => (
                <div key={index} className="faq-item">
                  <h4><HelpCircle size={18} /> {faq.q}</h4>
                  <p>{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Support;
