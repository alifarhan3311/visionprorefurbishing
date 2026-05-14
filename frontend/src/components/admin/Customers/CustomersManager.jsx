import React, { useState, useEffect } from 'react';
import { 
  Users, Mail, Building, Trash2, Edit, 
  Search, Filter, Shield, Award, Calendar, 
  ChevronRight, MoreHorizontal, UserPlus, Briefcase,
  Activity, ArrowUpRight, BarChart3, Info, CheckCircle,
  Phone, Zap, ExternalLink
} from 'lucide-react';
import api from '../../../services/api';
import '../AdminForms.css';

const CustomersManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ role: '', tier: '' });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users');
      if (data && data.success) {
        setUsers(Array.isArray(data.data) ? data.data : []);
      } else {
        setUsers(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    if (window.confirm('Are you sure you want to decommission this user account?')) {
      try {
        await api.delete(`/users/${id}`);
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleEditClick = (user) => {
    if (!user) return;
    setEditingUser(user);
    setEditForm({ role: user.role || 'user', tier: user.tier || 1 });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const { data } = await api.put(`/users/${editingUser._id}`, editForm);
      if (data.success) {
        fetchUsers();
        setEditingUser(null);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user profile.');
    } finally {
      setUpdating(false);
    }
  };

  const filteredUsers = Array.isArray(users) ? users.filter(user => 
    user && ((user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.companyName || '').toLowerCase().includes(searchTerm.toLowerCase()))
  ) : [];

  const stats = {
    total: filteredUsers.length,
    admins: filteredUsers.filter(u => u?.role === 'admin').length,
    b2b: filteredUsers.filter(u => u?.companyName).length,
    highTier: filteredUsers.filter(u => (u?.tier || 1) >= 3).length
  };

  return (
    <div className="customers-orchestrator animate-fade">
      {/* Editorial Header */}
      <div className="editorial-header">
        <div className="header-meta">
          <span className="badge-glow">Partner Network</span>
          <h1>Customer Registry</h1>
          <p>Monitor customer growth, manage pricing tiers, and orchestrate platform access privileges.</p>
        </div>

        <div className="glass-stats">
          <div className="stat-item">
            <div className="stat-label">Total Registry</div>
            <div className="stat-val-group">
              <span className="val">{stats.total}</span>
              <Activity size={16} className="trend-icon" />
            </div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-label">B2B Entities</div>
            <div className="stat-val-group">
              <span className="val indigo">{stats.b2b}</span>
            </div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-label">VIP Tier</div>
            <div className="stat-val-group">
              <span className="val gold">{stats.highTier}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="queue-container-premium">
        <div className="queue-header">
          <div className="header-left">
            <div className="active-nodes">
              <Users size={14} />
              <span>{filteredUsers.length} Registered Accounts</span>
            </div>
          </div>
          <div className="header-actions">
            <div className="search-pill">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Search Name, Company or Email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="utility-btn-premium"><Filter size={16} /> Filters</button>
            <button className="action-btn-premium"><UserPlus size={16} /> Add Partner</button>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="premium-table">
            <thead>
              <tr>
                <th style={{ width: '30%' }}>CUSTOMER PROFILE</th>
                <th style={{ width: '25%' }}>COMPANY / ENTITY</th>
                <th style={{ width: '20%' }}>CLASSIFICATION</th>
                <th style={{ width: '15%' }}>RELATIONSHIP AGE</th>
                <th style={{ textAlign: 'right', width: '100px' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="loading-state">Syncing Partner Database...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-state-row">
                    <div className="empty-state-content">
                      <Users size={48} />
                      <p>No partner records match the current search scope.</p>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.map(user => (
                <tr key={user._id} className="premium-row" onClick={() => handleEditClick(user)}>
                  <td>
                    <div className="customer-cell-premium">
                      <div className="avatar-mini">{user.name?.charAt(0) || 'U'}</div>
                      <div className="meta-stack">
                        <span className="n">{user.name || 'Anonymous User'}</span>
                        <span className="m"><Mail size={10} /> {user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="company-pill-premium">
                      <Building size={14} />
                      <span>{user.companyName || 'Private Retail'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="status-stack">
                      <span className={`status-pill ${user.role || 'user'}`}>
                        <div className="dot"></div>
                        {user.role || 'user'}
                      </span>
                      <span className={`tier-badge tier-${user.tier || 1}`}>
                        <Award size={10} /> Tier {user.tier || 1}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="date-pill-premium">
                      <Calendar size={14} />
                      <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}</span>
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

      {/* Side-out Configuration Inspector */}
      {editingUser && (
        <div className="inspector-overlay" onClick={() => setEditingUser(null)}>
          <div className="side-modal" onClick={e => e.stopPropagation()}>
            <div className="inspector-header">
              <div className="id-tag">UID-#{editingUser._id?.slice(-6).toUpperCase()}</div>
              <button className="close-btn" onClick={() => setEditingUser(null)}>&times;</button>
              <h3>Account Configuration</h3>
            </div>

            <div className="inspector-body">
              <div className="inspector-section hero">
                <div className="avatar-large-premium">{editingUser.name?.charAt(0) || 'U'}</div>
                <h3>{editingUser.name}</h3>
                <p>{editingUser.email}</p>
                <div className="badge-stack">
                  <span className={`status-pill ${editingUser.role || 'user'}`}>{editingUser.role || 'user'}</span>
                  <span className="tier-badge-premium"><Award size={12} /> Tier {editingUser.tier || 1}</span>
                </div>
              </div>

              <form onSubmit={handleUpdateUser} className="premium-form">
                <div className="inspector-section">
                  <label>System Privileges</label>
                  <div className="select-box-custom">
                    <Shield size={18} />
                    <select 
                      value={editForm.role} 
                      onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                      required
                    >
                      <option value="user">Dealer (Standard)</option>
                      <option value="admin">Platform Administrator</option>
                    </select>
                  </div>
                </div>

                <div className="inspector-section">
                  <label>B2B Pricing Tier</label>
                  <div className="select-box-custom">
                    <Award size={18} />
                    <select 
                      value={editForm.tier} 
                      onChange={(e) => setEditForm({...editForm, tier: parseInt(e.target.value)})}
                      required
                    >
                      <option value="1">Tier 1 - Bronze Partner</option>
                      <option value="2">Tier 2 - Silver Wholesale</option>
                      <option value="3">Tier 3 - Gold Distributor</option>
                      <option value="4">Tier 4 - Platinum Enterprise</option>
                    </select>
                  </div>
                </div>

                <div className="inspector-section">
                  <div className="guideline-card warning">
                    <Info size={16} />
                    <div className="c">
                      <h5>Relationship Impact</h5>
                      <p>Tier updates propagate instantly, recalculating all product pricing for this dealer.</p>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="modal-footer-custom">
              <button type="button" className="save-btn" onClick={handleUpdateUser} disabled={updating}>
                <CheckCircle size={18} /> {updating ? 'Synchronizing...' : 'Save Configuration'}
              </button>
              <button type="button" className="cancel-btn" onClick={() => deleteUser(editingUser._id)} style={{ color: '#ef4444', borderColor: '#fee2e2' }}>
                <Trash2 size={18} /> Decommission Account
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .customers-orchestrator { padding: 40px; background: #f8fafc; min-height: 100vh; font-family: 'Inter', sans-serif; }
        
        .editorial-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; }
        .header-meta h1 { font-size: 32px; font-weight: 800; margin: 8px 0; letter-spacing: -0.02em; color: #0f172a; }
        .header-meta p { color: #64748b; font-size: 16px; max-width: 500px; }
        .badge-glow { background: #e0f2fe; color: #0369a1; padding: 6px 14px; border-radius: 100px; font-size: 12px; font-weight: 700; text-transform: uppercase; border: 1px solid rgba(3, 105, 161, 0.1); }

        .glass-stats { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 24px; display: flex; padding: 20px 30px; box-shadow: 0 10px 40px -10px rgba(0,0,0,0.05); }
        .stat-item { text-align: center; padding: 0 20px; }
        .stat-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
        .stat-val-group { display: flex; align-items: center; gap: 8px; justify-content: center; }
        .stat-val-group .val { font-size: 24px; font-weight: 800; color: #0f172a; }
        .val.indigo { color: #4f46e5; }
        .val.gold { color: #d97706; }
        .stat-divider { width: 1px; background: #e2e8f0; height: 40px; }

        .queue-container-premium { background: white; border-radius: 32px; border: 1px solid #e2e8f0; box-shadow: 0 20px 50px -12px rgba(0,0,0,0.04); overflow: hidden; }
        .queue-header { padding: 30px 40px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; background: #fafafa; }
        .active-nodes { display: flex; align-items: center; gap: 8px; color: #64748b; font-size: 13px; font-weight: 600; }
        .active-nodes svg { color: #3b82f6; }
        
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

        .customer-cell-premium { display: flex; align-items: center; gap: 15px; }
        .avatar-mini { width: 36px; height: 36px; border-radius: 10px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; font-weight: 800; color: #0f172a; font-size: 14px; border: 1px solid #e2e8f0; }
        .meta-stack { display: flex; flex-direction: column; white-space: normal; max-width: 250px; }
        .meta-stack .n { font-weight: 700; color: #1e293b; font-size: 15px; line-height: 1.4; }
        .meta-stack .m { font-size: 11px; color: #94a3b8; display: flex; align-items: center; gap: 4px; margin-top: 2px; }
        
        .company-pill-premium { display: flex; align-items: center; gap: 10px; background: #f1f5f9; padding: 6px 14px; border-radius: 10px; width: fit-content; font-size: 12px; font-weight: 700; color: #475569; }
        .company-pill-premium svg { color: #6366f1; }
        
        .status-stack { display: flex; flex-direction: column; gap: 6px; }
        .status-pill { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 100px; font-size: 9px; font-weight: 800; text-transform: uppercase; width: fit-content; }
        .status-pill.admin { background: #fee2e2; color: #991b1b; }
        .status-pill.user { background: #e0f2fe; color: #0369a1; }
        .status-pill .dot { width: 6px; height: 6px; border-radius: 50%; }
        .status-pill.admin .dot { background: #ef4444; }
        .status-pill.user .dot { background: #3b82f6; }
        
        .tier-badge-premium { font-size: 11px; font-weight: 700; color: #64748b; display: flex; align-items: center; gap: 4px; }
        
        .date-pill-premium { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #94a3b8; font-weight: 700; }

        .hub-icon-btn { width: 40px; height: 40px; border-radius: 12px; border: 1px solid #e2e8f0; background: white; color: #94a3b8; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .premium-row:hover .hub-icon-btn { background: #0f172a; color: white; border-color: #0f172a; }

        .loading-state, .empty-state-row { text-align: center; padding: 100px !important; color: #94a3b8; font-weight: 600; }
        .empty-state-content { display: flex; flex-direction: column; align-items: center; justify-content: center; }

        /* Side Modal */
        .inspector-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(8px); z-index: 2000; display: flex; justify-content: flex-end; }
        .side-modal { width: 480px; height: 100%; background: white; box-shadow: -20px 0 60px rgba(0,0,0,0.1); animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); display: flex; flex-direction: column; position: relative; }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        
        .inspector-header { padding: 40px; border-bottom: 1px solid #f1f5f9; }
        .id-tag { font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 800; color: #3b82f6; background: #eff6ff; padding: 6px 12px; border-radius: 8px; width: fit-content; }
        .inspector-header h3 { margin: 15px 0 0; font-size: 22px; font-weight: 800; color: #0f172a; }
        .close-btn { position: absolute; right: 30px; top: 35px; background: none; border: none; font-size: 32px; color: #94a3b8; cursor: pointer; line-height: 1; }
        
        .inspector-body { padding: 40px; flex: 1; overflow-y: auto; }
        .inspector-section { margin-bottom: 40px; }
        .inspector-section.hero { text-align: center; }
        .avatar-large-premium { width: 80px; height: 80px; border-radius: 24px; background: #f8fafc; color: #0f172a; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 800; margin: 0 auto 20px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
        .hero h3 { font-size: 24px; font-weight: 800; margin: 0; color: #0f172a; }
        .hero p { color: #64748b; margin: 5px 0 20px; font-weight: 500; }
        .badge-stack { display: flex; gap: 8px; justify-content: center; }

        .inspector-section label { display: block; font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px; }
        .select-box-custom { display: flex; align-items: center; gap: 15px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 5px 20px; border-radius: 18px; transition: all 0.2s; }
        .select-box-custom:focus-within { border-color: #3b82f6; background: white; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }
        .select-box-custom select { border: none; background: transparent; width: 100%; padding: 15px 0; font-size: 14px; font-weight: 700; color: #1e293b; outline: none; }
        
        .guideline-card { display: flex; gap: 12px; background: #fff7ed; padding: 25px; border-radius: 24px; border: 1px solid #ffedd5; }
        .guideline-card svg { color: #f97316; flex-shrink: 0; }
        .guideline-card h5 { margin: 0 0 6px; font-size: 13px; color: #9a3412; font-weight: 800; }
        .guideline-card p { margin: 0; font-size: 12px; color: #c2410c; line-height: 1.6; font-weight: 500; }

        .modal-footer-custom { padding: 40px; border-top: 1px solid #f1f5f9; display: grid; gap: 12px; }
        .save-btn { padding: 18px; border-radius: 20px; border: none; font-weight: 800; font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer; transition: all 0.2s; background: #0f172a; color: white; }
        .cancel-btn { padding: 18px; border-radius: 20px; border: 1px solid #e2e8f0; font-weight: 800; font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer; transition: all 0.2s; background: transparent; }
        .save-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(0,0,0,0.15); }

        .animate-fade { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
};

export default CustomersManager;
