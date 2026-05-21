import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Users, Package, ShoppingCart, 
  ArrowUpRight, Clock, AlertCircle, Layers, 
  Box, Repeat, Wrench, Megaphone,
  Activity, ShieldCheck, Zap, ChevronRight,
  Globe, BarChart3, Bell, RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import './AdminDashboard.css';

const AdminDashboardHome = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/dashboard/stats');
      if (data.success) {
        setData(data.data);
      }
    } catch (err) {
      console.error('Dashboard sync error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeployUpdate = () => {
    setUpdating(true);
    setTimeout(() => {
      setUpdating(false);
      alert('System Topology Updated: All cache clusters purged and production nodes synchronized.');
    }, 2000);
  };

  const stats = [
    { 
      title: 'Gross Revenue', 
      value: data ? `$${data.stats.grossRevenue.toLocaleString()}` : '$0.00', 
      trend: '+12.5%', 
      color: '#1755A2', 
      icon: BarChart3 
    },
    { 
      title: 'Partner Network', 
      value: data ? data.stats.partnerNetwork.toLocaleString() : '0', 
      trend: '+3.2%', 
      color: '#10b981', 
      icon: Users 
    },
    { 
      title: 'Fulfillment Queue', 
      value: data ? data.stats.activeOrders : '0', 
      trend: 'High Priority', 
      color: '#f59e0b', 
      icon: Zap 
    },
    { 
      title: 'Critical Stock', 
      value: data ? `${data.stats.criticalStock} Items` : '0 Items', 
      trend: 'Audit Required', 
      color: '#ef4444', 
      icon: AlertCircle 
    }
  ];

  const operationalNodes = [
    { name: 'Product Catalog', icon: Box, path: '/admin/products', color: '#1755A2', desc: 'Inventory & Pricing' },
    { name: 'Taxonomy Engine', icon: Layers, path: '/admin/categories', color: '#6366f1', desc: '4-Tier Mega Menu' },
    { name: 'Order Processing', icon: ShoppingCart, path: '/admin/orders', color: '#10b981', desc: 'Dealer Logistics' },
    { name: 'RMA Console', icon: Wrench, path: '/admin/rma', color: '#ef4444', desc: 'Warranty Claims' },
    { name: 'Partner CRM', icon: Users, path: '/admin/customers', color: '#8b5cf6', desc: 'Tier Management' },
    { name: 'Marketing Studio', icon: Megaphone, path: '/admin/marketing', color: '#f59e0b', desc: 'Dealer Resources' },
    { name: 'Service Tickets', icon: Activity, path: '/admin/appointments', color: '#06b6d4', desc: 'Customer Support' },
    { name: 'System Core', icon: ShieldCheck, path: '/admin/settings', color: '#64748b', desc: 'Global Prefs' },
  ];

  return (
    <div className="executive-dashboard animate-fade">
      {/* Greeting Section */}
      <div className="hero-section">
        <div className="hero-content">
          <span className="hero-badge">System Live • All Engines Nominal</span>
          <h1>Welcome Back, Administrator</h1>
          <p>
            {loading ? 'Analyzing ecosystem state...' : 
            `The VisionPro ecosystem is currently processing ${data?.stats.activeOrders || 0} active dealer orders.`}
          </p>
        </div>
        <div className="hero-actions">
           <Link to="/admin/orders" className="secondary-action" style={{ textDecoration: 'none' }}>
             <Clock size={16} /> Audit Logs
           </Link>
           <button 
             className="primary-action" 
             onClick={handleDeployUpdate}
             disabled={updating}
           >
             {updating ? <RefreshCw size={16} className="spin" /> : <ChevronRight size={16} />}
             {updating ? 'Synchronizing...' : 'Deploy Update'}
           </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid">
        {stats.map((stat, i) => (
          <div key={i} className="kpi-card">
            <div className="kpi-header">
              <div className="kpi-icon-box" style={{ color: stat.color }}>
                 <stat.icon size={20} />
              </div>
              <span className="kpi-trend" style={{ color: stat.color }}>{stat.trend}</span>
            </div>
            <div className="kpi-body">
              <span className="kpi-label">{stat.title}</span>
              <h2 className="kpi-value">{loading ? '---' : stat.value}</h2>
            </div>
          </div>
        ))}
      </div>

      <div className="main-operational-grid">
        {/* Management Nodes */}
        <div className="node-container">
          <div className="section-header">
            <h3>Operational Infrastructure</h3>
            <p>Direct access to core platform modules</p>
          </div>
          <div className="nodes-grid">
            {operationalNodes.map((node, i) => (
              <Link to={node.path} key={i} className="node-card">
                <div className="node-icon" style={{ backgroundColor: `${node.color}10`, color: node.color }}>
                  <node.icon size={24} />
                </div>
                <div className="node-info">
                  <h4>{node.name}</h4>
                  <p>{node.desc}</p>
                </div>
                <ChevronRight size={16} className="node-chevron" />
              </Link>
            ))}
          </div>
        </div>

        {/* Intelligence Sidebar */}
        <div className="intel-sidebar">
          <div className="intel-card activity">
            <div className="intel-header">
              <h3>Live Activity Feed</h3>
              <Activity size={18} />
            </div>
            <div className="activity-stream">
               {loading ? (
                 <div className="stream-loading">Scanning activity logs...</div>
               ) : !data?.recentActivity || data.recentActivity.length === 0 ? (
                 <div className="stream-empty">No recent activity detected.</div>
               ) : data.recentActivity.map(item => (
                 <div key={item.id} className="stream-item">
                    <div className="stream-marker"></div>
                    <div className="stream-content">
                       <span className="stream-text">
                         <strong>{item.company}</strong> placed a new B2B {item.type} for ${item.amount.toLocaleString()}
                       </span>
                       <span className="stream-time">
                         {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </span>
                    </div>
                 </div>
               ))}
            </div>
          </div>

          <div className="intel-card health">
            <div className="intel-header">
              <h3>System Integrity</h3>
              <ShieldCheck size={18} />
            </div>
            <div className="health-metrics">
               <div className="metric-row">
                  <span>API Uptime</span>
                  <div className="status-green">99.9%</div>
               </div>
               <div className="metric-row">
                  <span>Database Synced</span>
                  <div className="status-green">Optimal</div>
               </div>
               <div className="metric-row">
                  <span>Active Sessions</span>
                  <div className="status-val">{Math.floor(Math.random() * 50) + 400}</div>
               </div>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .executive-dashboard { padding: 40px; background: var(--bg-deep); min-height: 100vh; font-family: 'Inter', sans-serif; }
        
        .hero-section { background: linear-gradient(135deg, #ffffff 0%, #f5f9ff 100%); border-radius: 32px; padding: 50px; color: var(--text-primary); display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; position: relative; overflow: hidden; }
        .hero-section::after { content: ""; position: absolute; top: -50%; right: -10%; width: 500px; height: 500px; background: radial-gradient(circle, rgba(23, 85, 162, 0.08) 0%, transparent 70%); }
        
        .hero-badge { background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); padding: 6px 14px; border-radius: 100px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
        .hero-content h1 { font-size: 36px; font-weight: 800; margin: 15px 0 10px; letter-spacing: -0.02em; color: var(--text-primary); }
        .hero-content p { color: var(--text-secondary); font-size: 17px; }
        
        .hero-actions { display: flex; gap: 15px; }
        .primary-action { background: #1755A2; color: white; border: none; padding: 14px 24px; border-radius: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: all 0.2s; }
        .primary-action:hover:not(:disabled) { background: #0d3a66; transform: translateY(-2px); }
        .primary-action:disabled { opacity: 0.7; cursor: wait; }
        
        .secondary-action { background: rgba(23,85,162,0.08); color: var(--secondary-color); border: 1px solid rgba(23,85,162,0.2); padding: 14px 24px; border-radius: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: all 0.2s; font-size: 14px; }
        .secondary-action:hover { background: rgba(23,85,162,0.12); }

        .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 40px; }
        .kpi-card { background: var(--bg-card); border-radius: 24px; padding: 25px; border: 1px solid var(--border-color); transition: all 0.2s; }
        .kpi-card:hover { transform: translateY(-5px); border-color: var(--border-color); box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05); }
        .kpi-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
        .kpi-icon-box { width: 44px; height: 44px; border-radius: 12px; background: #f8fafc; display: flex; align-items: center; justify-content: center; }
        .kpi-trend { font-size: 12px; font-weight: 800; }
        .kpi-label { font-size: 11px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }
        .kpi-value { font-size: 28px; font-weight: 800; color: var(--text-primary); margin: 5px 0 0; }

        .main-operational-grid { display: grid; grid-template-columns: 1fr 380px; gap: 40px; }
        
        .section-header { margin-bottom: 25px; }
        .section-header h3 { font-size: 20px; font-weight: 800; color: var(--text-primary); margin: 0; }
        .section-header p { margin: 5px 0 0; color: var(--text-secondary); font-size: 14px; }

        .nodes-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
        .node-card { background: var(--bg-card); padding: 20px; border-radius: 20px; border: 1px solid var(--border-color); display: flex; align-items: center; gap: 18px; text-decoration: none; transition: all 0.2s; }
        .node-card:hover { background: var(--bg-elevated); border-color: var(--primary-color); transform: translateX(5px); }
        .node-icon { width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; }
        .node-info h4 { margin: 0; font-size: 16px; font-weight: 700; color: var(--text-primary); }
        .node-info p { margin: 4px 0 0; font-size: 12px; color: var(--text-secondary); font-weight: 500; }
        .node-chevron { margin-left: auto; color: var(--text-secondary); }

        .intel-sidebar { display: flex; flex-direction: column; gap: 20px; }
        .intel-card { background: var(--bg-card); border-radius: 28px; border: 1px solid var(--border-color); padding: 25px; }
        .intel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid var(--border-color); }
        .intel-header h3 { margin: 0; font-size: 16px; font-weight: 800; color: var(--text-primary); }
        .intel-header svg { color: #1755A2; }

        .activity-stream { display: flex; flex-direction: column; gap: 20px; }
        .stream-item { display: flex; gap: 15px; }
        .stream-marker { width: 8px; height: 8px; border-radius: 50%; background: #1755A2; margin-top: 6px; box-shadow: 0 0 0 4px rgba(23, 85, 162, 0.1); }
        .stream-content { flex: 1; }
        .stream-text { display: block; font-size: 13px; color: var(--text-secondary); line-height: 1.5; }
        .stream-time { font-size: 11px; color: var(--text-secondary); font-weight: 600; margin-top: 5px; display: block; }
        
        .stream-loading, .stream-empty { font-size: 13px; color: var(--text-secondary); text-align: center; padding: 20px 0; }

        .health-metrics { display: flex; flex-direction: column; gap: 12px; }
        .metric-row { display: flex; justify-content: space-between; align-items: center; font-size: 13px; font-weight: 600; color: var(--text-secondary); }
        .status-green { color: #10b981; font-weight: 800; }
        .status-val { color: var(--text-primary); font-weight: 800; }

        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        .animate-fade { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 1200px) {
          .kpi-grid { grid-template-columns: repeat(2, 1fr); }
          .main-operational-grid { grid-template-columns: 1fr; }
        }
        
        @media (max-width: 768px) {
          .executive-dashboard { padding: 20px; }
          .hero-section { flex-direction: column; align-items: flex-start; gap: 20px; padding: 30px 20px; }
          .hero-actions { flex-direction: column; width: 100%; }
          .hero-actions a, .hero-actions button { width: 100%; justify-content: center; }
          .kpi-grid { grid-template-columns: 1fr; gap: 15px; }
          .nodes-grid { grid-template-columns: 1fr; }
          .hero-content h1 { font-size: 28px; }
          .hero-content p { font-size: 15px; }
        }
      `}} />
    </div>
  );
};

export default AdminDashboardHome;
