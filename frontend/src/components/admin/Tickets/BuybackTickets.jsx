import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Package, Clock, CheckCircle, XCircle, 
  ChevronRight, Search, Filter, Layers, CreditCard, 
  User, Info, Activity, ArrowUpRight, BarChart3,
  Download, Briefcase, Calendar, Mail, Zap
} from 'lucide-react';
import api from '../../../services/api';
import '../AdminForms.css';

const BuybackTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await api.get('/buybacks');
      if (response.data && response.data.success) {
        setTickets(Array.isArray(response.data.data) ? response.data.data : []);
      } else {
        setTickets(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Error fetching buyback tickets:', error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    setUpdating(true);
    try {
      const response = await api.put(`/buybacks/${id}/status`, { status: newStatus });
      if (response.data.success) {
        setTickets(tickets.map(t => t._id === id ? { ...t, status: newStatus } : t));
        setSelectedTicket(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const filteredTickets = Array.isArray(tickets) ? tickets.filter(t => 
    t && ((t._id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.userId || '').toLowerCase().includes(searchTerm.toLowerCase()))
  ) : [];

  const stats = {
    totalValue: filteredTickets.reduce((sum, t) => sum + (t?.estimatedValue || 0), 0),
    pending: filteredTickets.filter(t => t?.status === 'Pending').length,
    paid: filteredTickets.filter(t => t?.status === 'Paid').length,
    rejected: filteredTickets.filter(t => t?.status === 'Rejected').length
  };

  return (
    <div className="buyback-orchestrator animate-fade">
      {/* Editorial Header */}
      <div className="editorial-header">
        <div className="header-meta">
          <span className="badge-glow">Refurbishing Revenue</span>
          <h1>Buyback Console</h1>
          <p>Monitor and process high-volume screen refurbishing batches from B2B dealers.</p>
        </div>

        <div className="glass-stats">
          <div className="stat-item">
            <div className="stat-label">Buyback Pool</div>
            <div className="stat-val-group">
              <span className="val">${stats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              <BarChart3 size={16} className="trend-icon" />
            </div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-label">Pending Review</div>
            <div className="stat-val-group">
              <span className="val yellow">{stats.pending}</span>
            </div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-label">Settled</div>
            <div className="stat-val-group">
              <span className="val emerald">{stats.paid}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="queue-container-premium">
        <div className="queue-header">
          <div className="header-left">
            <div className="active-nodes">
              <Activity size={14} />
              <span>{filteredTickets.length} Active Batches</span>
            </div>
          </div>
          <div className="header-actions">
            <div className="search-pill">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Search Ticket ID or User..." 
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
                <th style={{ width: '20%' }}>TICKET IDENTITY</th>
                <th style={{ width: '25%' }}>DEALER IDENTIFIER</th>
                <th style={{ width: '20%' }}>BATCH VOLUME</th>
                <th style={{ width: '15%' }}>EST. SETTLEMENT</th>
                <th style={{ width: '20%' }}>PIPELINE STATUS</th>
                <th style={{ textAlign: 'right', width: '100px' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="loading-state">Syncing Buyback Ledger...</td></tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-state-row">
                    <div className="empty-state-content">
                      <Package size={48} />
                      <p>No buyback records found in the current segment.</p>
                    </div>
                  </td>
                </tr>
              ) : filteredTickets.map(ticket => (
                <tr key={ticket._id} className="premium-row" onClick={() => setSelectedTicket(ticket)}>
                  <td>
                    <div className="ticket-meta-cell">
                      <div className="id">#{ticket._id?.substring(ticket._id.length - 8).toUpperCase()}</div>
                      <div className="date">{ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : 'N/A'}</div>
                    </div>
                  </td>
                  <td>
                    <div className="dealer-cell">
                      <div className="avatar-mini">{ticket.user?.name?.charAt(0) || 'U'}</div>
                      <div className="meta-stack">
                        <span className="n">{ticket.user?.name || 'Anonymous Dealer'}</span>
                        <span className="m">{ticket.user?.companyName || 'Private Associate'}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="volume-badge-premium">
                       <Layers size={14} />
                       <span>{ticket.screens?.length || 0} SKU Models</span>
                    </div>
                  </td>
                  <td>
                    <div className="price-tag">${(ticket.estimatedValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                  </td>
                  <td>
                    <span className={`status-pill ${ticket.status?.toLowerCase() || 'pending'}`}>
                      <div className="dot"></div>
                      {ticket.status || 'Pending'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="hub-icon-btn">
                      <ArrowUpRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-out Inspector */}
      {selectedTicket && (
        <div className="inspector-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="side-modal" onClick={e => e.stopPropagation()}>
            <div className="inspector-header">
              <div className="id-tag">BB-BATCH-#{selectedTicket._id?.slice(-6).toUpperCase()}</div>
              <button className="close-btn" onClick={() => setSelectedTicket(null)}>&times;</button>
              <h3>Batch Intelligence</h3>
            </div>

            <div className="inspector-body">
              <div className="inspector-section hero">
                <div className="value-payout-premium">
                  <span className="l">Estimated Settlement</span>
                  <span className="v">${(selectedTicket.estimatedValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="inspector-section">
                <label>Inventory Breakdown ({selectedTicket.screens?.length || 0} SKUs)</label>
                <div className="breakdown-grid">
                  {selectedTicket.screens?.map((screen, i) => (
                    <div key={i} className="breakdown-item-premium">
                      <div className="item-main">
                        <div className="name">{screen.brand} {screen.model}</div>
                        <div className="cond">{screen.condition}</div>
                      </div>
                      <div className="item-qty">x{screen.qty}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="inspector-section">
                <label>Operational Data</label>
                <div className="op-card-premium">
                  <div className="op-row"><User size={14} /> <span>Dealer ID: {selectedTicket.userId}</span></div>
                  <div className="op-row"><Clock size={14} /> <span>Submitted: {new Date(selectedTicket.createdAt).toLocaleString()}</span></div>
                </div>
              </div>
            </div>

            <div className="modal-footer-custom">
              <button 
                className="save-btn approve" 
                onClick={() => handleStatusUpdate(selectedTicket._id, 'Approved')}
                disabled={updating || selectedTicket.status === 'Approved'}
              >
                <CheckCircle size={18} /> Approve Batch
              </button>
              <button 
                className="save-btn payment" 
                onClick={() => handleStatusUpdate(selectedTicket._id, 'Paid')}
                disabled={updating || selectedTicket.status === 'Paid'}
              >
                <CreditCard size={18} /> Confirm Payment
              </button>
              <button 
                className="cancel-btn" 
                onClick={() => handleStatusUpdate(selectedTicket._id, 'Rejected')}
                disabled={updating || selectedTicket.status === 'Rejected'}
              >
                <XCircle size={18} /> Reject Batch
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .buyback-orchestrator { padding: 40px; background: var(--bg-deep); min-height: 100vh; font-family: 'Outfit', sans-serif; }
        
        .editorial-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; }
        .header-meta h1 { font-size: 32px; font-weight: 800; margin: 8px 0; letter-spacing: -0.02em; color: var(--text-primary); }
        .header-meta p { color: #64748b; font-size: 16px; max-width: 500px; }
        .badge-glow { background: #065f46; color: #d1fae5; padding: 6px 14px; border-radius: 100px; font-size: 12px; font-weight: 700; text-transform: uppercase; border: 1px solid rgba(16, 185, 129, 0.2); }

        .glass-stats { background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); border-radius: 24px; display: flex; padding: 20px 30px; box-shadow: 0 10px 40px -10px rgba(0,0,0,0.3); }
        .stat-item { text-align: center; padding: 0 20px; }
        .stat-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
        .stat-val-group { display: flex; align-items: center; gap: 8px; justify-content: center; }
        .stat-val-group .val { font-size: 24px; font-weight: 800; color: var(--text-primary); }
        .val.yellow { color: #f59e0b; }
        .val.emerald { color: #10b981; }
        .stat-divider { width: 1px; background: var(--border-color); height: 40px; }

        .queue-container-premium { background: var(--bg-card); border-radius: 32px; border: 1px solid var(--border-color); box-shadow: 0 20px 50px -12px rgba(0,0,0,0.3); overflow: hidden; }
        .queue-header { padding: 30px 40px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; background: var(--bg-elevated); }
        .active-nodes { display: flex; align-items: center; gap: 8px; color: #94a3b8; font-size: 13px; font-weight: 600; }
        .active-nodes svg { color: #3b82f6; }
        
        .search-pill { background: var(--bg-elevated); border: 1px solid var(--border-color); padding: 10px 18px; border-radius: 14px; display: flex; align-items: center; gap: 12px; width: 320px; transition: all 0.2s; }
        .search-pill:focus-within { border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }
        .search-pill input { border: none; outline: none; font-size: 13px; width: 100%; font-weight: 600; background: transparent; color: var(--text-primary); }
        
        .utility-btn-premium { padding: 0 20px; border-radius: 14px; border: 1px solid var(--border-color); background: var(--bg-elevated); font-size: 13px; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 8px; cursor: pointer; transition: all 0.2s; }
        .action-btn-premium { background: #0f172a; color: white; border: none; padding: 12px 20px; border-radius: 14px; font-size: 13px; font-weight: 700; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: all 0.2s; }

        .table-wrapper { width: 100%; overflow-x: auto; }
        .premium-table { width: 100%; border-collapse: collapse; min-width: 1000px; }
        .premium-table th { padding: 20px 40px; text-align: left; font-size: 10px; font-weight: 800; color: var(--text-primary); text-transform: uppercase; letter-spacing: 1px; background: var(--bg-elevated); white-space: nowrap; }
        .premium-row { border-bottom: 1px solid var(--border-color); transition: all 0.2s; cursor: pointer; }
        .premium-row:hover { background: var(--bg-elevated); }
        .premium-row td { padding: 25px 40px; }

        .ticket-meta-cell .id { font-weight: 800; color: var(--text-primary); font-size: 15px; }
        .ticket-meta-cell .date { font-size: 12px; color: #94a3b8; margin-top: 4px; font-weight: 600; }
        
        .dealer-cell { display: flex; align-items: center; gap: 15px; }
        .avatar-mini { width: 36px; height: 36px; border-radius: 10px; background: var(--bg-elevated); display: flex; align-items: center; justify-content: center; font-weight: 800; color: var(--text-primary); font-size: 14px; border: 1px solid var(--border-color); }
        .meta-stack { display: flex; flex-direction: column; white-space: normal; max-width: 200px; }
        .meta-stack .n { font-weight: 700; color: var(--text-primary); font-size: 14px; line-height: 1.4; }
        .meta-stack .m { font-size: 11px; color: #94a3b8; }
        
        .volume-badge-premium { display: flex; align-items: center; gap: 8px; background: var(--bg-elevated); padding: 6px 14px; border-radius: 10px; width: fit-content; font-size: 12px; font-weight: 700; color: #94a3b8; border: 1px solid var(--border-color); }
        .volume-badge-premium svg { color: #6366f1; }
        
        .price-tag { font-weight: 800; font-size: 17px; color: #10b981; white-space: nowrap; }
        
        .status-pill { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 100px; font-size: 9px; font-weight: 800; text-transform: uppercase; width: fit-content; }
        .status-pill.pending { background: #92400e; color: #fed7aa; }
        .status-pill.approved { background: #1e40af; color: #bfdbfe; }
        .status-pill.paid { background: #065f46; color: #d1fae5; }
        .status-pill.rejected { background: #7f1d1d; color: #fca5a5; }
        .status-pill .dot { width: 6px; height: 6px; border-radius: 50%; }
        .status-pill.pending .dot { background: #f97316; }
        .status-pill.approved .dot { background: #3b82f6; }
        .status-pill.paid .dot { background: #10b981; }
        .status-pill.rejected .dot { background: #ef4444; }

        .hub-icon-btn { width: 40px; height: 40px; border-radius: 12px; border: 1px solid var(--border-color); background: var(--bg-elevated); color: #94a3b8; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .premium-row:hover .hub-icon-btn { background: #0f172a; color: white; border-color: #0f172a; }

        .loading-state, .empty-state-row { text-align: center; padding: 100px !important; color: #94a3b8; font-weight: 600; }
        .empty-state-content { display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .empty-state-content p { margin-top: 15px; }

        /* Side Modal */
        .inspector-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(8px); z-index: 2000; display: flex; justify-content: flex-end; }
        .side-modal { width: 500px; height: 100%; background: var(--bg-card); box-shadow: -20px 0 60px rgba(0,0,0,0.3); animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); display: flex; flex-direction: column; position: relative; border-left: 1px solid var(--border-color); }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        
        .inspector-header { padding: 40px; border-bottom: 1px solid var(--border-color); }
        .id-tag { font-size: 11px; font-weight: 800; color: #3b82f6; background: #1e40af; padding: 6px 12px; border-radius: 8px; width: fit-content; }
        .inspector-header h3 { margin: 15px 0 0; font-size: 22px; font-weight: 800; color: var(--text-primary); }
        .close-btn { position: absolute; right: 30px; top: 35px; background: none; border: none; font-size: 32px; color: #94a3b8; cursor: pointer; line-height: 1; }
        
        .inspector-body { padding: 40px; flex: 1; overflow-y: auto; }
        .inspector-section { margin-bottom: 40px; }
        .inspector-section.hero { text-align: center; }
        .value-payout-premium { background: #10b981; padding: 35px; border-radius: 28px; color: white; display: flex; flex-direction: column; gap: 8px; box-shadow: 0 15px 35px -5px rgba(16, 185, 129, 0.3); }
        .value-payout-premium .l { font-size: 11px; font-weight: 700; opacity: 0.8; text-transform: uppercase; letter-spacing: 1px; }
        .value-payout-premium .v { font-size: 36px; font-weight: 800; }

        .inspector-section label { display: block; font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 20px; }
        .breakdown-grid { display: grid; gap: 12px; }
        .breakdown-item-premium { background: var(--bg-elevated); padding: 20px; border-radius: 18px; border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; }
        .item-main .name { font-weight: 700; color: var(--text-primary); font-size: 15px; }
        .item-main .cond { font-size: 10px; font-weight: 800; color: #6366f1; text-transform: uppercase; margin-top: 4px; }
        .item-qty { width: 38px; height: 38px; background: #0f172a; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px; }
        
        .op-card-premium { background: var(--bg-elevated); padding: 25px; border-radius: 20px; border: 1px solid var(--border-color); }
        .op-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; font-size: 13px; font-weight: 700; color: #94a3b8; }
        .op-row:last-child { margin-bottom: 0; }
        .op-row svg { color: #94a3b8; }

        .modal-footer-custom { padding: 30px; border-top: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 12px; background: var(--bg-elevated); }
        .save-btn { padding: 14px 20px; border-radius: 16px; border: none; font-weight: 700; font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 4px 12px rgba(79, 70, 229, 0.1); }
        .save-btn.approve { background: #4f46e5; color: white; }
        .save-btn.approve:hover:not(:disabled) { background: #4338ca; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(79, 70, 229, 0.25); }
        .save-btn.payment { background: #10b981; color: white; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1); }
        .save-btn.payment:hover:not(:disabled) { background: #059669; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(16, 185, 129, 0.25); }
        .cancel-btn { padding: 14px 20px; border-radius: 16px; border: 1px solid #7f1d1d; font-weight: 700; font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); background: transparent; color: #ef4444; }
        .cancel-btn:hover:not(:disabled) { background: #7f1d1d; color: #fca5a5; border-color: #ef4444; transform: translateY(-1px); }
        .save-btn:disabled, .cancel-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; box-shadow: none !important; }

        .animate-fade { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 768px) {
          .buyback-orchestrator { padding: 20px; }
          .editorial-header { flex-direction: column; align-items: flex-start; gap: 20px; }
          .glass-stats { flex-direction: column; width: 100%; gap: 15px; padding: 20px; }
          .stat-divider { width: 100%; height: 1px; }
          .queue-header { flex-direction: column; align-items: flex-start; gap: 15px; }
          .header-actions { flex-direction: column; width: 100%; }
          .search-pill { width: 100%; }
          .utility-btn-premium, .action-btn-premium { width: 100%; justify-content: center; }
          .side-modal { width: 100%; }
        }
      `}} />
    </div>
  );
};

export default BuybackTickets;
