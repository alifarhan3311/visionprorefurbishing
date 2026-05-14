import React, { useContext } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, RotateCcw, Wrench, Wallet, MapPin, LogOut } from 'lucide-react';
import Header from '../layout/Header';
import { AuthContext } from '../../context/AuthContext';
import './UserLayout.css';

const UserLayout = () => {
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <>
      <Header />
      <div className="user-dashboard-container container">
        
        {/* User Sidebar */}
        <div className="user-sidebar">
          <div className="user-sidebar-profile">
            <h3>{user?.companyName || user?.name || 'My Shop'}</h3>
            <p>{user?.email || 'user@example.com'}</p>
            <div className="user-badge">{user?.tier || 'Tier 1'} Member</div>
          </div>
          
          <nav>
            <Link to="/dashboard" className={`user-nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}>
              <LayoutDashboard size={18} />
              Dashboard Overview
            </Link>
            <Link to="/dashboard/orders" className={`user-nav-item ${isActive('/dashboard/orders')}`}>
              <ShoppingBag size={18} />
              My Orders
            </Link>
            <Link to="/dashboard/buyback" className={`user-nav-item ${isActive('/dashboard/buyback')}`}>
              <Wallet size={18} />
              LCD Buyback Program
            </Link>
            <Link to="/dashboard/rma" className={`user-nav-item ${isActive('/dashboard/rma')}`}>
              <RotateCcw size={18} />
              RMA & Returns
            </Link>
            <Link to="/dashboard/appointments" className={`user-nav-item ${isActive('/dashboard/appointments')}`}>
              <Wrench size={18} />
              Repair Appointments
            </Link>
            <Link to="/dashboard/addresses" className={`user-nav-item ${isActive('/dashboard/addresses')}`}>
              <MapPin size={18} />
              Address Book
            </Link>
            <button onClick={logout} className="user-nav-item" style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', marginTop: '20px', color: '#ef4444' }}>
              <LogOut size={18} />
              Logout
            </button>
          </nav>
        </div>

        {/* User Main Content */}
        <div className="user-content">
          <Outlet />
        </div>

      </div>
    </>
  );
};

export default UserLayout;
