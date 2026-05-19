import React, { useContext, useState, useEffect } from 'react';
import { 
  Search, Bell, MessageSquare, LogOut, 
  Home, Globe, Zap, ShieldCheck, HelpCircle,
  Menu, Settings, Command
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './AdminLayout.css';

const AdminTopBar = ({ onMenuClick }) => {
  const { user, logout } = useContext(AuthContext);
  const [status, setStatus] = useState('Nominal');
  const [dotColor, setDotColor] = useState('#22c55e');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const statuses = ['Nominal', 'Active', 'Stable', 'Optimal'];
    const interval = setInterval(() => {
      const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
      setStatus(newStatus);
    }, 10000); // Change every 10s
    return () => clearInterval(interval);
  }, []);

  const handleSearchChange = (val) => {
    setSearchTerm(val);
    navigate(`/admin/products?search=${encodeURIComponent(val)}`);
  };

  return (
    <div className="glass-topbar">
      <div className="topbar-left">
        <button className="mobile-menu-btn" onClick={onMenuClick}>
          <Menu size={20} />
        </button>
        
        {/* Global Command Search */}
        <div className="topbar-search">
          <div className="search-pill">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search operational metadata..." 
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            <div className="search-hint">
               <kbd><Command size={10} /></kbd>
               <kbd>K</kbd>
            </div>
          </div>
        </div>
      </div>

      {/* Intelligence & Actions */}
      <div className="topbar-actions">
        {/* System Health */}
        <div className="system-health-pill hide-mobile">
          <div className="health-dot" style={{ backgroundColor: dotColor, boxShadow: `0 0 10px ${dotColor}` }}></div>
          <Zap size={14} className="health-icon" />
          <span>Cloud Relay: <strong className="status-text">{status}</strong></span>
        </div>

        <div className="actions-divider hide-mobile"></div>

        <button className="utility-btn notifications" title="Event Stream">
          <Bell size={20} />
          <div className="notification-ping"></div>
        </button>
        
        <div className="actions-divider"></div>

        <Link to="/" className="portal-jump-btn" title="Jump to Storefront">
          <Globe size={18} />
          <span className="hide-mobile">Live Site</span>
        </Link>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .topbar-left { display: flex; align-items: center; gap: 20px; flex: 1; }
        .mobile-menu-btn { display: none; background: none; border: none; color: #64748b; cursor: pointer; padding: 10px; border-radius: 12px; transition: all 0.2s; }
        .mobile-menu-btn:hover { background: #f1f5f9; color: #0f172a; }

        @media (max-width: 1024px) {
          .mobile-menu-btn { display: flex; }
        }

        @media (max-width: 768px) {
          .hide-mobile { display: none; }
          .topbar-search { display: none; }
        }
      `}} />
    </div>
  );
};

export default AdminTopBar;
