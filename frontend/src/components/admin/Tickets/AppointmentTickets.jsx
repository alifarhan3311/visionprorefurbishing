import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, User, Phone, CheckCircle, XCircle, 
  ChevronRight, Filter, Search, ClipboardList, 
  MessageSquare, Hash, ArrowUpRight, Activity,
  CheckCircle2, Info, Mail, Download, Zap
} from 'lucide-react';
import api from '../../../services/api';
import '../AdminForms.css';

const AppointmentTickets = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/appointments');
      if (response.data && response.data.success) {
        setAppointments(Array.isArray(response.data.data) ? response.data.data : []);
      } else {
        setAppointments(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    setUpdating(true);
    try {
      const response = await api.put(`/appointments/${id}/status`, { status: newStatus });
      if (response.data.success) {
        setAppointments(appointments.map(a => a._id === id ? { ...a, status: newStatus } : a));
        setSelectedApp(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const filteredApps = Array.isArray(appointments) ? appointments.filter(app => 
    app && ((app.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (app.serviceType || '').toLowerCase().includes(searchTerm.toLowerCase()))
  ) : [];

  const stats = {
    total: filteredApps.length,
    pending: filteredApps.filter(a => a?.status === 'Pending').length,
    completed: filteredApps.filter(a => a?.status === 'Completed').length
  };

  return (
    <div className="appointments-orchestrator animate-fade">
      {/* Editorial Header */}
      <div className="editorial-header">
        <div className="header-meta">
          <span className="badge-glow">Service Operations</span>
          <h1>Appointment Queue</h1>
          <p>Orchestrate and monitor your repair logistics and client consultations in real-time.</p>
        </div>

        <div className="glass-stats">
          <div className="stat-item">
            <div className="stat-label">Total Volume</div>
            <div className="stat-val-group">
              <span className="val">{stats.total}</span>
              <Activity size={16} className="trend-icon" />
            </div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-label">Pending Queue</div>
            <div className="stat-val-group">
              <span className="val yellow">{stats.pending}</span>
            </div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-label">Service Success</div>
            <div className="stat-val-group">
              <span className="val emerald">{stats.completed}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="queue-container-premium">
        <div className="queue-header">
          <div className="header-left">
            <div className="active-nodes">
              <Clock size={14} />
              <span>{filteredApps.length} Active Requests</span>
            </div>
          </div>
          <div className="header-actions">
            <div className="search-pill">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Find a client or service request..." 
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
                <th style={{ width: '15%' }}><Hash size={12} /> TICKET ID</th>
                <th style={{ width: '20%' }}>SCHEDULE</th>
                <th style={{ width: '25%' }}>CLIENT PROFILE</th>
                <th style={{ width: '20%' }}>SERVICE TYPE</th>
                <th style={{ width: '15%' }}>STATUS</th>
                <th style={{ textAlign: 'right', width: '100px' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="loading-state">Syncing Appointment Database...</td></tr>
              ) : filteredApps.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-state-row">
                    <div className="empty-state-content">
                      <ClipboardList size={48} />
                      <p>No service requests found in the current segment.</p>
                    </div>
                  </td>
                </tr>
              ) : filteredApps.map(app => (
                <tr key={app._id} className="premium-row" onClick={() => setSelectedApp(app)}>
                  <td>
                    <span className="id-tag-premium">#{app._id?.slice(-6).toUpperCase()}</span>
                  </td>
                  <td>
                    <div className="date-pill-premium">
                      <Calendar size={14} />
                      <div className="stack">
                        <span className="d">{app.date || 'N/A'}</span>
                        <span className="t">{app.time || 'Standard'}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="customer-cell-premium">
                      <div className="avatar-mini">{app.fullName?.charAt(0) || 'U'}</div>
                      <div className="meta-stack">
                        <span className="n">{app.fullName || 'Anonymous Client'}</span>
                        <span className="m"><Phone size={10} /> {app.phone || 'N/A'}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="service-pill-premium">
                      <ClipboardList size={14} />
                      <span>{app.serviceType || 'General Service'}</span>
                    </div>
                  </td>
                  <td>
                    <div className={`status-pill ${app.status?.toLowerCase() || 'pending'}`}>
                      <div className="dot"></div>
                      {app.status || 'Pending'}
                    </div>
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

      {/* Side-out Inspector Panel */}
      {selectedApp && (
        <div className="inspector-overlay" onClick={() => setSelectedApp(null)}>
          <div className="side-modal" onClick={e => e.stopPropagation()}>
            <div className="inspector-header">
              <div className="id-tag">UID-#{selectedApp._id?.slice(-6).toUpperCase()}</div>
              <button className="close-btn" onClick={() => setSelectedApp(null)}>&times;</button>
              <h3>Client Intake Data</h3>
            </div>

            <div className="inspector-body">
              <div className="inspector-section hero">
                <div className="avatar-large-premium">{selectedApp.fullName?.charAt(0) || 'U'}</div>
                <h3>{selectedApp.fullName}</h3>
                <p>{selectedApp.email}</p>
                <div className="badge-stack">
                  <span className={`status-pill ${selectedApp.status?.toLowerCase() || 'pending'}`}>{selectedApp.status || 'Pending'}</span>
                  <span className="service-pill-premium"><ClipboardList size={12} /> {selectedApp.serviceType}</span>
                </div>
              </div>

              <div className="inspector-section">
                <label>Appointment Context</label>
                <div className="context-grid">
                  <div className="ctx-item-premium">
                    <Calendar size={16} />
                    <div className="c">
                      <span className="l">Scheduled Date</span>
                      <span className="v">{selectedApp.date}</span>
                    </div>
                  </div>
                  <div className="ctx-item-premium">
                    <Clock size={16} />
                    <div className="c">
                      <span className="l">Arrival Window</span>
                      <span className="v">{selectedApp.time}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="inspector-section">
                <label>Client Narrative</label>
                <div className="narrative-card-premium">
                  <MessageSquare size={16} className="quote-icon" />
                  <p>{selectedApp.notes || "No detailed service notes provided by client."}</p>
                </div>
              </div>

              <div className="inspector-section">
                <div className="guideline-card warning">
                  <Info size={16} />
                  <div className="c">
                    <h5>Protocol Notice</h5>
                    <p>Finalizing an appointment will send a notification to the client and move the ticket to historical records.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer-custom">
              <button 
                className="save-btn"
                onClick={() => handleStatusUpdate(selectedApp._id, 'Completed')}
                disabled={updating || selectedApp.status === 'Completed'}
              >
                <CheckCircle2 size={18} /> Complete Service
              </button>
              <button 
                className="cancel-btn"
                onClick={() => handleStatusUpdate(selectedApp._id, 'Cancelled')}
                disabled={updating || selectedApp.status === 'Cancelled'}
                style={{ color: '#ef4444', borderColor: '#fee2e2' }}
              >
                <XCircle size={18} /> Cancel Appointment
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .appointments-orchestrator { padding: 40px; background: #f8fafc; min-height: 100vh; font-family: 'Inter', sans-serif; }
        
        .editorial-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; }
        .header-meta h1 { font-size: 32px; font-weight: 800; margin: 8px 0; letter-spacing: -0.02em; color: #0f172a; }
        .header-meta p { color: #64748b; font-size: 16px; max-width: 500px; }
        .badge-glow { background: #fef3c7; color: #92400e; padding: 6px 14px; border-radius: 100px; font-size: 12px; font-weight: 700; text-transform: uppercase; border: 1px solid rgba(146, 64, 14, 0.1); }

        .glass-stats { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 24px; display: flex; padding: 20px 30px; box-shadow: 0 10px 40px -10px rgba(0,0,0,0.05); }
        .stat-item { text-align: center; padding: 0 20px; }
        .stat-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
        .stat-val-group { display: flex; align-items: center; gap: 8px; justify-content: center; }
        .stat-val-group .val { font-size: 24px; font-weight: 800; color: #0f172a; }
        .val.yellow { color: #f59e0b; }
        .val.emerald { color: #10b981; }
        .stat-divider { width: 1px; background: #e2e8f0; height: 40px; }

        .queue-container-premium { background: white; border-radius: 32px; border: 1px solid #e2e8f0; box-shadow: 0 20px 50px -12px rgba(0,0,0,0.04); overflow: hidden; }
        .queue-header { padding: 30px 40px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; background: #fafafa; }
        .active-nodes { display: flex; align-items: center; gap: 8px; color: #64748b; font-size: 13px; font-weight: 600; }
        .active-nodes svg { color: #f59e0b; }
        
        .search-pill { background: white; border: 1px solid #cbd5e1; padding: 10px 18px; border-radius: 14px; display: flex; align-items: center; gap: 12px; width: 340px; transition: all 0.2s; }
        .search-pill:focus-within { border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.05); }
        .search-pill input { border: none; outline: none; font-size: 13px; width: 100%; font-weight: 600; background: transparent; }
        
        .utility-btn-premium { padding: 0 20px; border-radius: 14px; border: 1px solid #cbd5e1; background: white; font-size: 13px; font-weight: 700; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: all 0.2s; }
        .action-btn-premium { background: #0f172a; color: white; border: none; padding: 12px 20px; border-radius: 14px; font-size: 13px; font-weight: 700; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: all 0.2s; }

        .table-wrapper { width: 100%; overflow-x: auto; }
        .premium-table { width: 100%; border-collapse: collapse; min-width: 1100px; }
        .premium-table th { padding: 20px 40px; text-align: left; font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; background: #fcfcfc; white-space: nowrap; }
        .premium-row { border-bottom: 1px solid #f1f5f9; transition: all 0.2s; cursor: pointer; }
        .premium-row:hover { background: #f8fafc; }
        .premium-row td { padding: 25px 40px; }

        .id-tag-premium { font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 800; color: #3b82f6; background: #eff6ff; padding: 4px 10px; border-radius: 6px; }
        
        .date-pill-premium { display: flex; align-items: center; gap: 12px; }
        .date-pill-premium .stack { display: flex; flex-direction: column; }
        .date-pill-premium .d { font-weight: 700; color: #1e293b; font-size: 14px; }
        .date-pill-premium .t { font-size: 11px; color: #64748b; font-weight: 600; margin-top: 2px; }
        .date-pill-premium svg { color: #6366f1; }

        .customer-cell-premium { display: flex; align-items: center; gap: 15px; }
        .avatar-mini { width: 36px; height: 36px; border-radius: 10px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; font-weight: 800; color: #0f172a; font-size: 14px; border: 1px solid #e2e8f0; }
        .meta-stack { display: flex; flex-direction: column; white-space: normal; max-width: 220px; }
        .meta-stack .n { font-weight: 700; color: #1e293b; font-size: 14px; line-height: 1.4; }
        .meta-stack .m { font-size: 11px; color: #94a3b8; display: flex; align-items: center; gap: 4px; margin-top: 2px; }
        
        .service-pill-premium { display: flex; align-items: center; gap: 8px; background: #f1f5f9; padding: 6px 14px; border-radius: 10px; width: fit-content; font-size: 12px; font-weight: 700; color: #475569; }
        .service-pill-premium svg { color: #6366f1; }
        
        .status-pill { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 100px; font-size: 9px; font-weight: 800; text-transform: uppercase; width: fit-content; }
        .status-pill.pending { background: #fff7ed; color: #c2410c; }
        .status-pill.completed { background: #ecfdf5; color: #059669; }
        .status-pill .dot { width: 6px; height: 6px; border-radius: 50%; }
        .status-pill.pending .dot { background: #f97316; }
        .status-pill.completed .dot { background: #10b981; }

        .hub-icon-btn { width: 40px; height: 40px; border-radius: 12px; border: 1px solid #e2e8f0; background: white; color: #94a3b8; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .premium-row:hover .hub-icon-btn { background: #0f172a; color: white; border-color: #0f172a; }

        .loading-state, .empty-state-row { text-align: center; padding: 100px !important; color: #94a3b8; font-weight: 600; }
        .empty-state-content { display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .empty-state-content p { margin-top: 15px; }

        /* Side Modal */
        .inspector-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(8px); z-index: 2000; display: flex; justify-content: flex-end; }
        .side-modal { width: 480px; height: 100%; background: white; box-shadow: -20px 0 60px rgba(0,0,0,0.1); animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); display: flex; flex-direction: column; position: relative; }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        
        .inspector-header { padding: 40px; border-bottom: 1px solid #f1f5f9; }
        .id-tag { font-size: 11px; font-weight: 800; color: #3b82f6; background: #eff6ff; padding: 6px 12px; border-radius: 8px; width: fit-content; }
        .inspector-header h3 { margin: 15px 0 0; font-size: 22px; font-weight: 800; color: #0f172a; }
        .close-btn { position: absolute; right: 30px; top: 35px; background: none; border: none; font-size: 32px; color: #94a3b8; cursor: pointer; line-height: 1; }
        
        .inspector-body { padding: 40px; flex: 1; overflow-y: auto; }
        .inspector-section { margin-bottom: 40px; }
        .inspector-section.hero { text-align: center; }
        .avatar-large-premium { width: 80px; height: 80px; border-radius: 24px; background: #f8fafc; color: #0f172a; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 800; margin: 0 auto 20px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
        .hero h3 { font-size: 24px; font-weight: 800; margin: 0; color: #0f172a; }
        .hero p { color: #64748b; margin: 5px 0 20px; font-weight: 500; }
        .badge-stack { display: flex; gap: 8px; justify-content: center; }
        .inspector-section label { display: block; font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 15px; }

        .context-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .ctx-item-premium { display: flex; gap: 12px; background: #f8fafc; padding: 18px; border-radius: 18px; border: 1px solid #e2e8f0; }
        .ctx-item-premium svg { color: #6366f1; flex-shrink: 0; }
        .ctx-item-premium .c { display: flex; flex-direction: column; }
        .ctx-item-premium .l { font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
        .ctx-item-premium .v { font-size: 14px; font-weight: 700; color: #1e293b; margin-top: 2px; }

        .narrative-card-premium { position: relative; background: #fffbeb; border: 1px solid #fef3c7; padding: 25px; border-radius: 24px; }
        .quote-icon { position: absolute; right: 20px; top: 20px; color: #f59e0b; opacity: 0.2; }
        .narrative-card-premium p { margin: 0; font-size: 15px; color: #92400e; line-height: 1.6; font-weight: 500; }

        .guideline-card { display: flex; gap: 12px; background: #eff6ff; padding: 20px; border-radius: 20px; border: 1px solid #dbeafe; }
        .guideline-card svg { color: #3b82f6; flex-shrink: 0; }
        .guideline-card h5 { margin: 0 0 4px; font-size: 13px; color: #1e40af; font-weight: 800; }
        .guideline-card p { margin: 0; font-size: 12px; color: #1e40af; line-height: 1.5; font-weight: 500; }

        .modal-footer-custom { padding: 40px; border-top: 1px solid #f1f5f9; display: grid; gap: 12px; }
        .save-btn { padding: 18px; border-radius: 20px; border: none; font-weight: 800; font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer; transition: all 0.2s; background: #3b82f6; color: white; }
        .cancel-btn { padding: 18px; border-radius: 20px; border: 1px solid #e2e8f0; font-weight: 800; font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer; transition: all 0.2s; background: transparent; }
        .save-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(59, 130, 246, 0.2); }
        .save-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .animate-fade { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 768px) {
          .appointments-orchestrator { padding: 20px; }
          .editorial-header { flex-direction: column; align-items: flex-start; gap: 20px; }
          .glass-stats { flex-direction: column; width: 100%; gap: 15px; padding: 20px; }
          .stat-divider { width: 100%; height: 1px; }
          .queue-header { flex-direction: column; align-items: flex-start; gap: 15px; }
          .header-actions { flex-direction: column; width: 100%; }
          .search-pill { width: 100%; }
          .utility-btn-premium, .action-btn-premium { width: 100%; justify-content: center; }
          .side-modal { width: 100%; }
          .context-grid { grid-template-columns: 1fr; }
        }
      `}} />
    </div>
  );
};

export default AppointmentTickets;
