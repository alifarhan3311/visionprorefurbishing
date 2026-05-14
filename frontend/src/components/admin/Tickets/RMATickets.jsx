import React, { useState, useEffect } from 'react';
import { 
  Package, Clock, CheckCircle, XCircle, ChevronRight, 
  Search, Filter, AlertCircle, RefreshCw, User, 
  Info, Activity, ArrowUpRight, BarChart3
} from 'lucide-react';
import api from '../../../services/api';
import '../AdminForms.css';

const RMATickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await api.get('/rmas');
      if (response.data.success) {
        setTickets(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching RMA tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    setUpdating(true);
    try {
      const response = await api.put(`/rmas/${id}/status`, { status: newStatus });
      if (response.data.success) {
        setTickets(tickets.map(t => t._id === id ? { ...t, status: newStatus } : t));
        setSelectedTicket(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error('Error updating RMA status:', error);
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const filteredTickets = tickets.filter(t => 
    t._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.userId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: tickets.length,
    processing: tickets.filter(t => t.status === 'Processing').length,
    completed: tickets.filter(t => t.status === 'Completed').length,
    rejected: tickets.filter(t => t.status === 'Rejected').length
  };

  return (
    <div className="rma-manager animate-fade">
      {/* Editorial Header */}
      <div className="editorial-header">
        <div className="header-meta">
          <span className="badge-glow">Returns & Warranty</span>
          <h1>RMA Console</h1>
          <p>Manage product returns, warranty claims, and refurbishing requests from the partner network.</p>
        </div>

        <div className="glass-stats">
          <div className="stat-item">
            <div className="stat-label">Total Claims</div>
            <div className="stat-val-group">
              <span className="val">{stats.total}</span>
              <BarChart3 size={16} className="trend-icon" />
            </div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-label">In Processing</div>
            <div className="stat-val-group">
              <span className="val yellow">{stats.processing}</span>
            </div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-label">Resolved</div>
            <div className="stat-val-group">
              <span className="val green">{stats.completed}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="queue-container">
        <div className="queue-header">
          <div className="header-left">
            <div className="active-nodes">
              <Activity size={14} />
              <span>{tickets.length} Active Tickets</span>
            </div>
          </div>
          <div className="header-actions">
            <div className="search-box">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Search RMA ID, Reason or Dealer..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="filter-btn"><Filter size={16} /> Filters</button>
            <button className="add-btn">Export Log</button>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="queue-table">
            <thead>
              <tr>
                <th>RMA ID / DATE</th>
                <th>DEALER IDENTITY</th>
                <th>RETURN REASON</th>
                <th>WORKFLOW STATUS</th>
                <th style={{ textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="loading-state">Syncing Return Records...</td></tr>
              ) : filteredTickets.map(ticket => (
                <tr key={ticket._id} className="queue-row" onClick={() => setSelectedTicket(ticket)}>
                  <td>
                    <div className="ticket-meta-cell">
                      <div className="id">#RMA-{ticket._id.substring(ticket._id.length - 8).toUpperCase()}</div>
                      <div className="date">{new Date(ticket.createdAt).toLocaleDateString()}</div>
                    </div>
                  </td>
                  <td>
                    <div className="dealer-cell">
                      <User size={14} />
                      <div className="meta-stack">
                        <span className="n">{ticket.userId.substring(ticket.userId.length - 10)}...</span>
                        <span className="m">{ticket.searchMethod.toUpperCase()}: {ticket.searchValue}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="reason-pill">
                      <AlertCircle size={12} />
                      <span>{ticket.reason}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill ${ticket.status.toLowerCase()}`}>
                      <div className="dot"></div>
                      {ticket.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="action-row-btn">
                      <ArrowUpRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && filteredTickets.length === 0 && (
                <tr>
                  <td colSpan="5" className="empty-state">
                    <Package size={48} />
                    <p>No return records match your search criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side Inspector */}
      {selectedTicket && (
        <div className="inspector-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="inspector-panel" onClick={e => e.stopPropagation()}>
            <div className="inspector-header">
              <div className="id-tag">RMA-TICKET-#{selectedTicket._id.slice(-6).toUpperCase()}</div>
              <button className="close-btn" onClick={() => setSelectedTicket(null)}>&times;</button>
            </div>

            <div className="inspector-body">
              <div className="inspector-section">
                <label>Verification Data</label>
                <div className="op-card">
                  <div className="op-row"><Info size={14} /> <span>Method: {selectedTicket.searchMethod.toUpperCase()}</span></div>
                  <div className="op-row"><Search size={14} /> <span>Value: {selectedTicket.searchValue}</span></div>
                </div>
              </div>

              <div className="inspector-section">
                <label>Item Description</label>
                <div className="narrative-box blue">
                  {selectedTicket.itemDetails}
                </div>
              </div>

              <div className="inspector-section">
                <label>Claim Context</label>
                <div className="reason-hero">
                  <AlertCircle size={20} />
                  <span>{selectedTicket.reason}</span>
                </div>
                <div className="narrative-box mt-3">
                  {selectedTicket.description}
                </div>
              </div>
            </div>

            <div className="inspector-footer">
              <button 
                className="control-btn secondary" 
                onClick={() => handleStatusUpdate(selectedTicket._id, 'Processing')}
                disabled={updating || selectedTicket.status === 'Processing'}
              >
                <RefreshCw size={18} /> Move to Processing
              </button>
              <button 
                className="control-btn primary" 
                onClick={() => handleStatusUpdate(selectedTicket._id, 'Completed')}
                disabled={updating || selectedTicket.status === 'Completed'}
              >
                <CheckCircle size={18} /> Approve & Close
              </button>
              <button 
                className="control-btn ghost" 
                onClick={() => handleStatusUpdate(selectedTicket._id, 'Rejected')}
                disabled={updating || selectedTicket.status === 'Rejected'}
              >
                <XCircle size={18} /> Reject Claim
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .rma-manager { padding: 40px; background: #f8fafc; min-height: 100vh; font-family: 'Inter', sans-serif; }
        
        .editorial-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; }
        .header-meta h1 { font-size: 32px; font-weight: 800; margin: 8px 0; letter-spacing: -0.02em; color: #0f172a; }
        .header-meta p { color: #64748b; font-size: 16px; max-width: 500px; }
        .badge-glow { background: #fee2e2; color: #991b1b; padding: 6px 14px; border-radius: 100px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; border: 1px solid rgba(153, 27, 27, 0.1); }

        .glass-stats { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 24px; display: flex; padding: 20px 30px; box-shadow: 0 10px 40px -10px rgba(0,0,0,0.05); }
        .stat-item { text-align: center; padding: 0 20px; }
        .stat-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
        .stat-val-group { display: flex; align-items: center; gap: 8px; justify-content: center; }
        .stat-val-group .val { font-size: 24px; font-weight: 800; color: #0f172a; }
        .val.yellow { color: #f59e0b; }
        .val.green { color: #10b981; }
        .stat-divider { width: 1px; background: #e2e8f0; height: 40px; }

        .queue-container { background: white; border-radius: 32px; border: 1px solid #e2e8f0; box-shadow: 0 20px 50px -12px rgba(0,0,0,0.04); overflow: hidden; }
        .queue-header { padding: 25px 35px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; background: #fafafa; }
        .active-nodes { display: flex; align-items: center; gap: 8px; color: #64748b; font-size: 13px; font-weight: 600; }
        .active-nodes svg { color: #6366f1; }
        
        .header-actions { display: flex; gap: 15px; }
        .search-box { background: white; border: 1px solid #cbd5e1; padding: 8px 15px; border-radius: 12px; display: flex; align-items: center; gap: 10px; width: 280px; }
        .search-box input { border: none; outline: none; font-size: 13px; width: 100%; font-weight: 500; }
        
        .filter-btn { padding: 0 18px; border-radius: 12px; border: 1px solid #cbd5e1; background: white; font-size: 13px; font-weight: 700; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: all 0.2s; }
        .add-btn { background: #0f172a; color: white; border: none; padding: 10px 18px; border-radius: 12px; font-size: 13px; font-weight: 700; cursor: pointer; }

        .queue-table { width: 100%; border-collapse: collapse; min-width: 1000px; }
        .queue-table th { padding: 20px 35px; text-align: left; font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; background: #fcfcfc; }
        .queue-row { border-bottom: 1px solid #f1f5f9; transition: all 0.2s; cursor: pointer; }
        .queue-row:hover { background: #f8fafc; }
        .queue-row td { padding: 25px 35px; }

        .ticket-meta-cell .id { font-weight: 800; color: #0f172a; font-size: 15px; }
        .ticket-meta-cell .date { font-size: 12px; color: #94a3b8; margin-top: 4px; }
        
        .dealer-cell { display: flex; align-items: center; gap: 10px; }
        .dealer-cell svg { color: #6366f1; }
        .meta-stack { display: flex; flex-direction: column; }
        .meta-stack .n { font-weight: 700; color: #1e293b; font-size: 14px; }
        .meta-stack .m { font-size: 11px; color: #94a3b8; font-weight: 500; }
        
        .reason-pill { display: flex; align-items: center; gap: 8px; background: #fef2f2; padding: 6px 12px; border-radius: 8px; width: fit-content; font-size: 12px; font-weight: 700; color: #991b1b; }
        
        .status-pill { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 100px; font-size: 10px; font-weight: 800; text-transform: uppercase; }
        .status-pill.pending { background: #fff7ed; color: #c2410c; }
        .status-pill.processing { background: #eff6ff; color: #1e40af; }
        .status-pill.completed { background: #ecfdf5; color: #059669; }
        .status-pill.rejected { background: #fee2e2; color: #b91c1c; }
        .status-pill .dot { width: 6px; height: 6px; border-radius: 50%; }
        .status-pill.processing .dot { background: #3b82f6; }
        .status-pill.completed .dot { background: #10b981; }

        .action-row-btn { width: 40px; height: 40px; border-radius: 12px; border: 1px solid #e2e8f0; background: white; color: #94a3b8; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .queue-row:hover .action-row-btn { background: #0f172a; color: white; border-color: #0f172a; }

        /* Inspector Panel */
        .inspector-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(8px); z-index: 2000; display: flex; justify-content: flex-end; }
        .inspector-panel { width: 500px; height: 100%; background: white; box-shadow: -20px 0 60px rgba(0,0,0,0.1); animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); display: flex; flex-direction: column; }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        
        .inspector-header { padding: 40px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; }
        .id-tag { font-size: 12px; font-weight: 800; color: #6366f1; background: #eef2ff; padding: 6px 12px; border-radius: 8px; }
        .close-btn { font-size: 32px; color: #94a3b8; background: none; border: none; cursor: pointer; }
        
        .inspector-body { padding: 40px; flex: 1; overflow-y: auto; }
        .inspector-section { margin-bottom: 40px; }
        .inspector-section label { display: block; font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 15px; }
        
        .op-card { background: #f8fafc; padding: 20px; border-radius: 16px; border: 1px solid #e2e8f0; }
        .op-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; font-size: 13px; font-weight: 600; color: #1e293b; }
        .op-row:last-child { margin-bottom: 0; }
        
        .narrative-box { background: #f1f5f9; padding: 20px; border-radius: 20px; color: #475569; font-size: 14px; line-height: 1.6; }
        .narrative-box.blue { background: #eff6ff; color: #1e40af; border: 1px solid rgba(59, 130, 246, 0.2); }
        .reason-hero { display: flex; align-items: center; gap: 12px; background: #fee2e2; color: #991b1b; padding: 20px; border-radius: 20px; font-weight: 800; }
        .mt-3 { margin-top: 15px; }

        .inspector-footer { padding: 40px; border-top: 1px solid #f1f5f9; display: grid; gap: 12px; }
        .control-btn { padding: 16px; border-radius: 16px; border: none; font-weight: 800; font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer; transition: all 0.2s; }
        .control-btn.primary { background: #10b981; color: white; }
        .control-btn.secondary { background: #3b82f6; color: white; }
        .control-btn.ghost { background: transparent; border: 1px solid #e2e8f0; color: #ef4444; }
        .control-btn:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.1); }
        .control-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .loading-state { text-align: center; padding: 100px !important; color: #94a3b8; font-weight: 600; }
        .empty-state { text-align: center; padding: 80px !important; color: #94a3b8; }
        .empty-state svg { margin-bottom: 15px; opacity: 0.3; }
        .animate-fade { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
};

export default RMATickets;
