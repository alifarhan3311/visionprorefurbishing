import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { 
  LayoutDashboard, ShoppingCart, Users, Settings, 
  Wrench, Repeat, Activity, FileText, Megaphone, 
  Box, Layers, ClipboardList, ShieldCheck, 
  LogOut, ChevronRight, UserCircle, X
} from 'lucide-react';
import './AdminLayout.css';

const AdminSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const NavSection = ({ title }) => (
    <div className="nav-section-title">{title}</div>
  );

  const NavItem = ({ to, icon: Icon, label }) => (
    <Link to={to} className={`nav-link-item ${isActive(to)}`} onClick={() => {
      if (window.innerWidth <= 1024) onClose();
    }}>
      <div className="icon-wrapper"><Icon size={18} /></div>
      <span>{label}</span>
      {isActive(to) && <div className="active-glow"></div>}
    </Link>
  );

  return (
    <div className={`glass-sidebar ${isOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-brand">
        <div className="brand-logo">
           <div className="logo-cube">V</div>
           <div className="brand-text">
              <span className="main">VISIONPRO</span>
              <span className="sub">CONTROL PANEL</span>
           </div>
        </div>
        <button className="mobile-close-btn" onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      
      <div className="sidebar-scroll">
        <div className="nav-group">
          <NavItem to="/admin" icon={LayoutDashboard} label="General Overview" />
        </div>

        <NavSection title="Inventory & Catalog" />
        <div className="nav-group">
          <NavItem to="/admin/products" icon={Box} label="Product Inventory" />
          <NavItem to="/admin/categories" icon={Layers} label="Taxonomy Engine" />
          <NavItem to="/admin/stock-alerts" icon={Activity} label="Stock Surveillance" />
        </div>

        <NavSection title="Sales Operations" />
        <div className="nav-group">
          <NavItem to="/admin/orders" icon={ShoppingCart} label="B2B Order Desk" />
          <NavItem to="/admin/customers" icon={Users} label="Dealer Network" />
        </div>

        <NavSection title="Support & Service" />
        <div className="nav-group">
          <NavItem to="/admin/buyback" icon={Repeat} label="LCD Buyback" />
          <NavItem to="/admin/rma" icon={ShieldCheck} label="RMA Console" />
          <NavItem to="/admin/appointments" icon={ClipboardList} label="Service Queue" />
        </div>

        <NavSection title="Marketing & Settings" />
        <div className="nav-group">
          <NavItem to="/admin/marketing" icon={Megaphone} label="Media Hub" />
          <NavItem to="/admin/blog" icon={FileText} label="Industry News" />
          <NavItem to="/admin/settings" icon={Settings} label="System Config" />
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="avatar">
            <UserCircle size={32} />
          </div>
          <div className="user-info">
            <span className="name">{user?.name || 'Administrator'}</span>
            <span className="role">{user?.isAdmin ? 'Master Control' : 'Operator'}</span>
          </div>
          <button onClick={logout} className="signout-btn">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .sidebar-brand { display: flex; justify-content: space-between; align-items: center; }
        .mobile-close-btn { display: none; background: none; border: none; color: #94a3b8; cursor: pointer; padding: 5px; }
        .mobile-close-btn:hover { color: white; }

        @media (max-width: 1024px) {
          .mobile-close-btn { display: block; }
        }

        .signout-btn { margin-left: auto; background: none; border: none; color: #94a3b8; cursor: pointer; padding: 8px; border-radius: 8px; transition: all 0.2s; }
        .signout-btn:hover { color: #ef4444; background: rgba(239, 68, 68, 0.1); }
      `}} />
    </div>
  );
};

export default AdminSidebar;
