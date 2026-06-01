import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Phone, User, Info, FileText, Activity, ShieldCheck } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import './Header.css';

const TopBar = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';
  const accountPath = isAdmin ? '/admin' : '/dashboard';
  const accountLabel = isAdmin ? 'Admin Panel' : 'My Account';
  const AccountIcon = isAdmin ? ShieldCheck : User;

  return (
    <div className="top-bar">
      <div className="container top-bar-content">
        <div className="top-bar-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', whiteSpace: 'nowrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
              <a href="https://wa.me/14169197565" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'inherit', textDecoration: 'none' }}>
                <Phone size={13} /> +1 (416) 919-7565
              </a>
              <a href="https://wa.me/16472615077" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'inherit', textDecoration: 'none' }}>
                <Phone size={13} /> +1 (647) 261-5077
              </a>
            </div>
            <span>Introducing the Genuine Apple Parts Program!</span>
          </div>
        </div>
        <div className="top-bar-links">
          <Link to="/dashboard/buyback"><Activity size={14} /> LCD Buyback</Link>
          <Link to="/blog"><FileText size={14} /> Blog</Link>
          <Link to="/support"><Info size={14} /> Support</Link>
          <Link to="/quick-order">Quick Order</Link>
          <Link to="/dashboard/marketing">Marketing Material</Link>
          <Link to={accountPath} className={isAdmin ? 'top-bar-admin-link' : ''}>
            <AccountIcon size={14} /> {accountLabel}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
