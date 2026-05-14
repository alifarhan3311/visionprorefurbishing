import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const DashboardHome = () => {
  const { user } = useContext(AuthContext);

  return (
    <div>
      <h1 className="user-page-title">Welcome back, {user?.name?.split(' ')[0] || 'User'}!</h1>
      <p style={{ marginBottom: '25px', color: '#64748b' }}>Here is a summary of your B2B account activity.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div className="user-card wallet-card">
          <h4>Store Credit Balance</h4>
          <div className="amount">$0.00</div>
          <p style={{ fontSize: '12px', marginTop: '10px', opacity: 0.8 }}>Available to use on next checkout</p>
        </div>
        
        <div className="user-card">
          <h4 style={{ color: '#64748b' }}>Recent Orders</h4>
          <div style={{ fontSize: '24px', fontWeight: 700, margin: '10px 0' }}>0 Pending</div>
          <Link to="/dashboard/orders" style={{ fontSize: '13px', color: 'var(--primary-color)' }}>View all orders &rarr;</Link>
        </div>

        <div className="user-card">
          <h4 style={{ color: '#64748b' }}>Pending LCD Buybacks</h4>
          <div style={{ fontSize: '24px', fontWeight: 700, margin: '10px 0' }}>0 Tickets</div>
          <Link to="/dashboard/buyback" style={{ fontSize: '13px', color: 'var(--primary-color)' }}>View buybacks &rarr;</Link>
        </div>
      </div>

      <div className="user-card">
        <h3 style={{ fontSize: '18px', marginBottom: '15px' }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '15px' }}>
          <Link to="/dashboard/buyback" className="admin-btn-primary" style={{ textDecoration: 'none' }}>Start LCD Buyback</Link>
          <Link to="/quick-order" className="admin-btn-primary" style={{ backgroundColor: '#10b981', textDecoration: 'none' }}>Quick Order Upload</Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
