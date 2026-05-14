import React from 'react';
import Header from '../layout/Header';
import Footer from '../layout/Footer';

const PolicyPage = ({ title, content }) => {
  return (
    <div className="policy-page">
      <Header />
      <div className="support-hero" style={{ padding: '60px 0' }}>
        <div className="container">
          <h1 className="reveal">{title}</h1>
        </div>
      </div>
      <div className="container reveal" style={{ padding: '80px 20px', maxWidth: '900px', lineHeight: '1.8' }}>
        <div className="user-card glass" style={{ padding: '40px' }}>
          {content}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PolicyPage;
