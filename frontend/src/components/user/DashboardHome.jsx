import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const DashboardHome = () => {
  const { user } = useContext(AuthContext);

  return (
    <div>
      <h1 className="user-page-title">Welcome back, {user?.name?.split(' ')[0] || 'User'}!</h1>
      <p style={{ marginBottom: '25px', color: '#64748b' }}>Here is a summary of your B2B account activity.</p>
      
      <div className="dashboard-grid">
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
        <div className="quick-actions-flex">
          <Link to="/dashboard/buyback" className="admin-btn-primary" style={{ textDecoration: 'none' }}>Start LCD Buyback</Link>
          <Link to="/quick-order" className="admin-btn-primary" style={{ backgroundColor: '#10b981', textDecoration: 'none' }}>Quick Order Upload</Link>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .dashboard-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
        .quick-actions-flex { display: flex; gap: 15px; }
        
        @media (max-width: 992px) {
          .dashboard-grid { grid-template-columns: 1fr; }
          .quick-actions-flex { flex-direction: column; }
        }
      `}} />
    </div>
  );
};

export default DashboardHome;
