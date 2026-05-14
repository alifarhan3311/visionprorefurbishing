import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminTopBar from './AdminTopBar';
import './AdminLayout.css';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-container">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 999,
            backdropFilter: 'blur(4px)'
          }}
        />
      )}

      <div className="admin-main">
        <AdminTopBar onMenuClick={() => setSidebarOpen(true)} />
        <div className="admin-content-area">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
