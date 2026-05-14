import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, User, Info, FileText, Activity } from 'lucide-react';
import './Header.css';

const TopBar = () => {
  return (
    <div className="top-bar">
      <div className="container top-bar-content">
        <div className="top-bar-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <a href="https://wa.me/16472615077" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'inherit', textDecoration: 'none' }}>
              <Phone size={13} /> (647) 261-5077
            </a>
            <span>Introducing the Genuine Apple Parts Program!</span>
          </div>
        </div>
        <div className="top-bar-links">
          <Link to="/dashboard/buyback"><Activity size={14} /> LCD Buyback</Link>
          <Link to="/blog"><FileText size={14} /> Blog</Link>
          <Link to="/support"><Info size={14} /> Support</Link>
          <Link to="/quick-order">Quick Order</Link>
          <Link to="/dashboard/marketing">Marketing Material</Link>
          <Link to="/dashboard"><User size={14} /> My Account</Link>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
