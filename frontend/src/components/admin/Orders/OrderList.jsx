import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Download, User, Calendar, CheckCircle, 
  Clock, Search, Filter, DollarSign, Package, 
  Truck, ChevronRight, Activity, ArrowUpRight, BarChart3,
  CheckCircle2, Info, ExternalLink, Mail, Zap
} from 'lucide-react';
import api from '../../../services/api';
import '../AdminForms.css';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/orders');
      if (data && data.success) {
        setOrders(Array.isArray(data.data) ? data.data : []);
      } else {
        setOrders(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}/invoice`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert('Failed to download invoice');
    }
  };

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      fetchOrders();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update order status');
    }
  };

  const filteredOrders = Array.isArray(orders) ? orders.filter(order => 
    order && ((order._id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase()))
  ) : [];

  const stats = {
    totalRevenue: filteredOrders.filter(o => o?.isPaid).reduce((sum, o) => sum + (o?.totalPrice || 0), 0),
    paidOrders: filteredOrders.filter(o => o?.isPaid).length,
    pendingShipment: filteredOrders.filter(o => o?.isPaid && !o?.isDelivered).length
  };

  return (
    <div className="orders-orchestrator animate-fade">
      {/* Editorial Header */}
      <div className="editorial-header">
        <div className="header-meta">
          <span className="badge-glow">Dealer Transactions</span>
          <h1>Fulfillment Center</h1>
          <p>Monitor transaction ledger, manage shipping logistics, and distribute digital invoices.</p>
        </div>

        <div className="glass-stats">
          <div className="stat-item">
            <div className="stat-label">Gross Revenue</div>
            <div className="stat-val-group">
              <span className="val emerald">${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              <BarChart3 size={16} className="trend-icon" />
            </div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-label">Settled Batches</div>
            <div className="stat-val-group">
              <span className="val">{stats.paidOrders}</span>
            </div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-label">In Transit</div>
            <div className="stat-val-group">
              <span className="val yellow">{stats.pendingShipment}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="queue-container-premium">
        <div className="queue-header">
          <div className="header-left">
            <div className="active-nodes">
              <Activity size={14} />
              <span>{filteredOrders.length} Transactional Records</span>
            </div>
          </div>
          <div className="header-actions">
            <div className="search-pill">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Search Order ID, Name or Email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="utility-btn-premium"><Filter size={16} /> Filters</button>
            <button className="action-btn-premium"><Download size={16} /> Export Ledger</button>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="premium-table">
            <thead>
              <tr>
                <th style={{ width: '25%' }}>ORDER IDENTITY</th>
                <th style={{ width: '30%' }}>DEALER PROFILE</th>
                <th style={{ width: '15%' }}>TIMESTAMP</th>
                <th style={{ width: '10%' }}>SETTLEMENT</th>
                <th style={{ width: '20%' }}>PIPELINE STATUS</th>
                <th style={{ textAlign: 'right', width: '100px' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="loading-state">Syncing Transaction Ledger...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-state-row">
                    <div className="empty-state-content">
                      <Package size={48} />
                      <p>No transactions match the current filters.</p>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.map(order => (
                <tr key={order._id} className="premium-row">
                  <td>
                    <div className="ticket-meta-cell">
                      <div className="id">#{order._id?.substring(order._id.length - 8).toUpperCase()}</div>
                      <div className="method-tag">{order.paymentMethod || 'Standard'}</div>
                    </div>
                  </td>
                  <td>
                    <div className="dealer-cell">
                      <div className="avatar-mini">{order.user?.name?.charAt(0) || 'D'}</div>
                      <div className="meta-stack">
                        <span className="n">{order.user?.name || 'Refurb Dealer'}</span>
                        <span className="m"><Mail size={10} /> {order.user?.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="date-pill">
                      <Calendar size={14} />
                      <span>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="price-tag">${(order.totalPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                  </td>
                  <td>
                    <div className="status-stack">
                      <span className={`status-pill ${order.isPaid ? 'paid' : 'pending'}`}>
                        <div className="dot"></div>
                        {order.isPaid ? 'Settled' : 'Unpaid'}
                      </span>
                      <span className={`status-pill ${order.isDelivered ? 'approved' : 'processing'}`}>
                        <div className="dot"></div>
                        {order.isDelivered ? 'Shipped' : 'In Queue'}
                      </span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="action-hub-premium">
                      <button className="hub-icon-btn" onClick={() => downloadInvoice(order._id)} title="Download Invoice">
                        <Download size={16} />
                      </button>
                      
                      {!order.isPaid && (
                        <button className="hub-text-btn green" onClick={() => handleStatusUpdate(order._id, 'Paid')}>
                          Set Paid
                        </button>
                      )}
                      
                      {order.isPaid && !order.isDelivered && (
                        <button className="hub-text-btn blue" onClick={() => handleStatusUpdate(order._id, 'Delivered')}>
                          Ship
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .orders-orchestrator { padding: 40px; background: var(--bg-deep); min-height: 100vh; font-family: 'Inter', sans-serif; }
        
        .editorial-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; }
        .header-meta h1 { font-size: 32px; font-weight: 800; margin: 8px 0; letter-spacing: -0.02em; color: var(--text-primary); }
        .header-meta p { color: #64748b; font-size: 16px; max-width: 500px; }
        .badge-glow { background: #065f46; color: #d1fae5; padding: 6px 14px; border-radius: 100px; font-size: 12px; font-weight: 700; text-transform: uppercase; border: 1px solid rgba(16, 185, 129, 0.2); }

        .glass-stats { background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); border-radius: 24px; display: flex; padding: 20px 30px; box-shadow: 0 10px 40px -10px rgba(0,0,0,0.3); }
        .stat-item { text-align: center; padding: 0 20px; }
        .stat-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
        .stat-val-group { display: flex; align-items: center; gap: 8px; justify-content: center; }
        .stat-val-group .val { font-size: 24px; font-weight: 800; color: var(--text-primary); }
        .val.emerald { color: #10b981; }
        .val.yellow { color: #f59e0b; }
        .stat-divider { width: 1px; background: var(--border-color); height: 40px; }

        .queue-container-premium { background: var(--bg-card); border-radius: 32px; border: 1px solid var(--border-color); box-shadow: 0 20px 50px -12px rgba(0,0,0,0.3); overflow: hidden; }
        .queue-header { padding: 30px 40px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; background: var(--bg-elevated); }
        .active-nodes { display: flex; align-items: center; gap: 8px; color: #94a3b8; font-size: 13px; font-weight: 600; }
        .active-nodes svg { color: #10b981; }
        
        .header-actions { display: flex; gap: 15px; }
        .search-pill { background: var(--bg-elevated); border: 1px solid var(--border-color); padding: 10px 18px; border-radius: 14px; display: flex; align-items: center; gap: 12px; width: 320px; transition: all 0.2s; }
        .search-pill:focus-within { border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }
        .search-pill input { border: none; outline: none; font-size: 13px; width: 100%; font-weight: 600; background: transparent; color: var(--text-primary); }
        
        .utility-btn-premium { padding: 0 20px; border-radius: 14px; border: 1px solid var(--border-color); background: var(--bg-elevated); font-size: 13px; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 8px; cursor: pointer; transition: all 0.2s; }
        .action-btn-premium { background: #0f172a; color: white; border: none; padding: 12px 20px; border-radius: 14px; font-size: 13px; font-weight: 700; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: all 0.2s; }
        .action-btn-premium:hover { background: #1e293b; transform: translateY(-2px); }

        .table-wrapper { width: 100%; overflow-x: auto; }
        .premium-table { width: 100%; border-collapse: collapse; min-width: 1100px; }
        .premium-table th { padding: 20px 40px; text-align: left; font-size: 10px; font-weight: 800; color: var(--text-primary); text-transform: uppercase; letter-spacing: 1px; background: var(--bg-elevated); white-space: nowrap; }
        .premium-row { border-bottom: 1px solid var(--border-color); transition: all 0.2s; }
        .premium-row:hover { background: var(--bg-elevated); }
        .premium-row td { padding: 25px 40px; }

        .ticket-meta-cell .id { font-weight: 800; color: var(--text-primary); font-size: 15px; }
        .method-tag { font-size: 9px; font-weight: 800; color: #93c5fd; text-transform: uppercase; margin-top: 4px; background: #1e40af; padding: 3px 8px; border-radius: 4px; width: fit-content; }
        
        .dealer-cell { display: flex; align-items: center; gap: 15px; }
        .avatar-mini { width: 36px; height: 36px; border-radius: 10px; background: var(--bg-elevated); display: flex; align-items: center; justify-content: center; font-weight: 800; color: var(--text-primary); font-size: 14px; border: 1px solid var(--border-color); }
        .meta-stack { display: flex; flex-direction: column; white-space: normal; max-width: 200px; }
        .meta-stack .n { font-weight: 700; color: var(--text-primary); font-size: 14px; line-height: 1.4; }
        .meta-stack .m { font-size: 11px; color: #94a3b8; display: flex; align-items: center; gap: 4px; margin-top: 2px; }
        
        .date-pill { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #94a3b8; font-weight: 700; }
        .date-pill svg { color: var(--border-color); }
        
        .price-tag { font-weight: 800; font-size: 17px; color: var(--text-primary); white-space: nowrap; }
        
        .status-stack { display: flex; flex-direction: column; gap: 6px; }
        .status-pill { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 100px; font-size: 9px; font-weight: 800; text-transform: uppercase; width: fit-content; }
        .status-pill.pending { background: #92400e; color: #fed7aa; }
        .status-pill.paid { background: #065f46; color: #d1fae5; }
        .status-pill.approved { background: #1e40af; color: #bfdbfe; }
        .status-pill.processing { background: var(--bg-elevated); color: #94a3b8; }
        .status-pill .dot { width: 6px; height: 6px; border-radius: 50%; }
        .status-pill.paid .dot { background: #10b981; }
        .status-pill.approved .dot { background: #3b82f6; }

        .action-hub-premium { display: flex; align-items: center; justify-content: flex-end; gap: 10px; }
        .hub-icon-btn { width: 40px; height: 40px; border-radius: 12px; border: 1px solid var(--border-color); background: var(--bg-elevated); color: #94a3b8; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
        .hub-icon-btn:hover { background: #0f172a; color: white; border-color: #0f172a; }
        
        .hub-text-btn { padding: 10px 16px; border-radius: 10px; border: none; font-size: 11px; font-weight: 800; text-transform: uppercase; cursor: pointer; transition: all 0.2s; }
        .hub-text-btn.green { background: #065f46; color: #d1fae5; }
        .hub-text-btn.blue { background: #1e40af; color: #bfdbfe; }
        .hub-text-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.3); }

        .loading-state, .empty-state-row { text-align: center; padding: 100px !important; color: #94a3b8; font-weight: 600; }
        .empty-state-content { display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .empty-state-content p { margin-top: 15px; }
        
        .animate-fade { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 768px) {
          .orders-orchestrator { padding: 20px; }
          .editorial-header { flex-direction: column; align-items: flex-start; gap: 20px; }
          .glass-stats { flex-direction: column; width: 100%; gap: 15px; padding: 20px; }
          .stat-divider { width: 100%; height: 1px; }
          .queue-header { flex-direction: column; align-items: flex-start; gap: 15px; }
          .header-actions { flex-direction: column; width: 100%; }
          .search-pill { width: 100%; }
          .utility-btn-premium, .action-btn-premium { width: 100%; justify-content: center; }
        }
      `}} />
    </div>
  );
};

export default OrderList;
