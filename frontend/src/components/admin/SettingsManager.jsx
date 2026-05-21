import React, { useState, useEffect } from 'react';
import { 
  Settings, Save, Shield, Globe, Bell, Truck,
  Lock, Zap, Database, Activity, ChevronRight,
  Eye, RefreshCcw, HardDrive, Cpu
} from 'lucide-react';
import api from '../../services/api';
import './AdminForms.css';

const SettingsManager = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    siteName: 'Vision Pro LCD',
    contactEmail: 'support@visionprolcd.com',
    currency: 'CAD',
    maintenanceMode: false,
    freeShippingThreshold: 500,
     taxRate: 8,
    footerText: '© 2026 Vision Pro LCD. All Rights Reserved.',
    apiCache: true,
    twoFactor: true
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  
  // Real-time simulated stats
  const [performance, setPerformance] = useState({ latency: 24, storage: 42, load: 12 });

  useEffect(() => {
    fetchSettings();
    const interval = setInterval(() => {
      setPerformance(prev => ({
        latency: Math.max(18, Math.min(45, prev.latency + (Math.random() * 4 - 2))),
        storage: Math.max(40, Math.min(45, prev.storage + (Math.random() * 0.2 - 0.1))),
        load: Math.max(8, Math.min(25, prev.load + (Math.random() * 6 - 3)))
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/settings');
      if (data.success) {
        setSettings(data.data);
      }
    } catch (err) {
      console.error('Settings sync error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg('Synchronizing global preferences...');
    
    try {
      const { data } = await api.put('/settings', settings);
      if (data.success) {
        setStatusMsg('System state updated successfully.');
        setTimeout(() => setStatusMsg(''), 3000);
      }
    } catch (err) {
      console.error('Save settings error:', err);
      setStatusMsg('Failed to propagate system state.');
    } finally {
      setSaving(false);
    }
  };

  const NavItem = ({ id, icon: Icon, label, desc }) => (
    <button 
      className={`settings-nav-item ${activeTab === id ? 'active' : ''}`}
      onClick={() => setActiveTab(id)}
    >
      <div className="nav-icon"><Icon size={20} /></div>
      <div className="nav-text">
        <span className="label">{label}</span>
        <span className="desc">{desc}</span>
      </div>
      <ChevronRight size={16} className="nav-arrow" />
    </button>
  );

  return (
    <div className="command-center animate-fade">
      {/* Editorial Header */}
      <div className="editorial-header">
        <div className="header-meta">
          <span className="badge-glow">Command Console</span>
          <h1>System Orchestration</h1>
          <p>Global architecture and operational parameters for the VisionPro ecosystem.</p>
        </div>

        <div className="glass-stats">
          <div className="stat-item">
            <div className="stat-label">API Latency</div>
            <div className="val-group">
              <Zap size={14} className="blue" /> 
              <span>{performance.latency.toFixed(0)}ms</span>
            </div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-label">Storage Usage</div>
            <div className="val-group">
              <HardDrive size={14} className="indigo" /> 
              <span>{performance.storage.toFixed(1)}%</span>
            </div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-label">Core Load</div>
            <div className="val-group">
              <Cpu size={14} className="emerald" /> 
              <span>{performance.load.toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-layout">
        {/* Sidebar Nav */}
        <div className="settings-sidebar">
          <NavItem 
            id="general" icon={Globe} 
            label="General Identity" desc="Portal naming & brand metadata" 
          />
          <NavItem 
            id="commercial" icon={Truck} 
            label="Commercial Engine" desc="Taxation & logistics logic" 
          />
          <NavItem 
            id="system" icon={Settings} 
            label="Core Infrastructure" desc="Maintenance & cache controls" 
          />
          <NavItem 
            id="security" icon={Shield} 
            label="Security & Access" desc="Auth policies & encryption" 
          />
        </div>

        {/* Configuration Panel */}
        <div className="config-panel">
          <form onSubmit={handleSave}>
            {loading ? (
              <div className="panel-loading">
                <RefreshCcw className="spin" size={32} />
                <p>Establishing secure handshake with core config...</p>
              </div>
            ) : (
              <>
                {activeTab === 'general' && (
                  <div className="panel-content animate-fade">
                    <div className="panel-header">
                      <h3>Portal Identity</h3>
                      <p>How your platform presents itself to the world.</p>
                    </div>
                    <div className="input-block">
                      <label>Service Display Name</label>
                      <input type="text" name="siteName" value={settings.siteName} onChange={handleChange} />
                    </div>
                    <div className="input-block">
                      <label>Global Support Address</label>
                      <input type="email" name="contactEmail" value={settings.contactEmail} onChange={handleChange} />
                    </div>
                    <div className="input-block">
                      <label>Legal Copyright String</label>
                      <textarea name="footerText" value={settings.footerText} onChange={handleChange} rows="3" />
                    </div>
                  </div>
                )}

                {activeTab === 'commercial' && (
                  <div className="panel-content animate-fade">
                    <div className="panel-header">
                      <h3>Commerce Engine</h3>
                      <p>Logistics and financial calculation parameters.</p>
                    </div>
                    <div className="grid-2">
                      <div className="input-block">
                        <label>Settlement Currency</label>
                        <select name="currency" value={settings.currency} onChange={handleChange}>
                          <option value="CAD">CAD - Canadian Dollar</option>
                          <option value="USD">USD - US Dollar</option>
                        </select>
                      </div>
                      <div className="input-block">
                        <label>HST/GST Tax Rate (%)</label>
                        <input type="number" name="taxRate" value={settings.taxRate} onChange={handleChange} />
                      </div>
                    </div>
                    <div className="input-block">
                      <label>Free Logistics Threshold ($)</label>
                      <input type="number" name="freeShippingThreshold" value={settings.freeShippingThreshold} onChange={handleChange} />
                      <span className="field-hint">Orders above this amount will trigger the free shipping logic for dealers.</span>
                    </div>
                  </div>
                )}

                {activeTab === 'system' && (
                  <div className="panel-content animate-fade">
                    <div className="panel-header">
                      <h3>Infrastructure Controls</h3>
                      <p>Manage performance and system availability.</p>
                    </div>
                    <div className="control-row">
                      <div className="row-text">
                        <span className="title">Maintenance Mode</span>
                        <span className="desc">Take the portal offline for scheduled updates.</span>
                      </div>
                      <label className="neo-switch">
                        <input type="checkbox" name="maintenanceMode" checked={settings.maintenanceMode} onChange={handleChange} />
                        <span className="neo-slider"></span>
                      </label>
                    </div>
                    <div className="control-row">
                      <div className="row-text">
                        <span className="title">High-Velocity Cache</span>
                        <span className="desc">Enable Redis-level caching for product catalogs.</span>
                      </div>
                      <label className="neo-switch">
                        <input type="checkbox" name="apiCache" checked={settings.apiCache} onChange={handleChange} />
                        <span className="neo-slider"></span>
                      </label>
                    </div>
                    <div className="action-card mt-20">
                      <RefreshCcw size={18} />
                      <div className="card-text">
                          <h4>Flush Global Cache</h4>
                          <p>Invalidate all cached responses and force re-sync with DB.</p>
                      </div>
                      <button type="button" className="card-btn">Execute</button>
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="panel-content animate-fade">
                    <div className="panel-header">
                      <h3>Governance & Auth</h3>
                      <p>Enforce security protocols across the administrative layer.</p>
                    </div>
                    <div className="control-row">
                      <div className="row-text">
                        <span className="title">2FA Enforcement</span>
                        <span className="desc">Require OTP for all administrative logins.</span>
                      </div>
                      <label className="neo-switch">
                        <input type="checkbox" name="twoFactor" checked={settings.twoFactor} onChange={handleChange} />
                        <span className="neo-slider"></span>
                      </label>
                    </div>
                    <div className="action-card mt-20 warning">
                      <Lock size={18} />
                      <div className="card-text">
                          <h4>Administrative Audit Log</h4>
                          <p>View detailed trail of all configuration changes.</p>
                      </div>
                      <button type="button" className="card-btn">Access Log</button>
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="panel-footer">
              <div className="footer-left">
                {statusMsg && (
                  <div className="status-badge">
                    <Activity size={14} />
                    <span>{statusMsg}</span>
                  </div>
                )}
              </div>
              <button type="submit" className="commit-btn" disabled={saving || loading}>
                <Save size={18} />
                {saving ? 'Propagating...' : 'Commit System State'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .command-center { padding: 40px; background: var(--bg-deep); min-height: 100vh; font-family: 'Inter', sans-serif; }
        
        .editorial-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; }
        .header-meta h1 { font-size: 32px; font-weight: 800; margin: 8px 0; letter-spacing: -0.02em; color: var(--text-primary); }
        .header-meta p { color: #94a3b8; font-size: 16px; max-width: 500px; }
        .badge-glow { background: var(--bg-elevated); color: #94a3b8; padding: 6px 14px; border-radius: 100px; font-size: 12px; font-weight: 700; text-transform: uppercase; border: 1px solid var(--border-color); }

        .glass-stats { background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid rgba(148, 163, 184, 0.16); border-radius: 24px; display: flex; padding: 20px 30px; box-shadow: 0 10px 40px -10px rgba(0,0,0,0.25); }
        .stat-item .stat-label { font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 5px; }
        .val-group { display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 18px; color: var(--text-primary); min-width: 80px; }
        .val-group .blue { color: #3b82f6; }
        .val-group .indigo { color: #6366f1; }
        .val-group .emerald { color: #10b981; }
        .stat-divider { width: 1px; background: var(--border-color); height: 35px; margin: 0 20px; }

        .settings-layout { display: grid; grid-template-columns: 320px 1fr; gap: 40px; }
        
        .settings-sidebar { display: flex; flex-direction: column; gap: 8px; }
        .settings-nav-item { border: none; background: var(--bg-card); padding: 20px; border-radius: 20px; display: flex; align-items: center; gap: 15px; cursor: pointer; transition: all 0.2s; border: 1px solid var(--border-color); text-align: left; width: 100%; color: var(--text-primary); }
        .settings-nav-item:hover { transform: translateX(5px); border-color: var(--border-color); }
        .settings-nav-item.active { background: #0f172a; border-color: #0f172a; color: white; }
        
        .nav-icon { width: 44px; height: 44px; border-radius: 12px; background: var(--bg-elevated); display: flex; align-items: center; justify-content: center; color: #64748b; }
        .settings-nav-item.active .nav-icon { background: rgba(255, 255, 255, 0.1); color: white; }
        
        .nav-text .label { display: block; font-weight: 700; font-size: 15px; }
        .nav-text .desc { font-size: 11px; color: #94a3b8; }
        .settings-nav-item.active .nav-text .desc { color: rgba(255, 255, 255, 0.5); }
        .nav-arrow { margin-left: auto; opacity: 0.3; }

        .config-panel { background: var(--bg-card); border-radius: 32px; border: 1px solid var(--border-color); display: flex; flex-direction: column; overflow: hidden; min-height: 550px; }
        .panel-content { padding: 45px; flex: 1; }
        .panel-header { margin-bottom: 35px; border-bottom: 1px solid var(--border-color); padding-bottom: 25px; }
        .panel-header h3 { margin: 0; font-size: 22px; font-weight: 800; color: var(--text-primary); }
        .panel-header p { margin: 8px 0 0; color: #94a3b8; font-size: 15px; }

        .panel-loading { height: 400px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #94a3b8; gap: 15px; }

        .input-block { margin-bottom: 25px; }
        .input-block label { display: block; font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 10px; letter-spacing: 0.5px; }
        .input-block input, .input-block select, .input-block textarea { width: 100%; padding: 14px 18px; border-radius: 14px; border: 1px solid var(--border-color); background: var(--bg-elevated); font-size: 14px; font-weight: 600; outline: none; transition: all 0.2s; color: var(--text-primary); }
        .input-block input:focus, .input-block select:focus, .input-block textarea:focus { border-color: #3b82f6; background: var(--bg-card); box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15); }
        .field-hint { display: block; font-size: 11px; color: #94a3b8; margin-top: 8px; }

        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        
        .control-row { display: flex; align-items: center; justify-content: space-between; padding: 20px; background: var(--bg-elevated); border-radius: 20px; margin-bottom: 15px; }
        .row-text .title { display: block; font-weight: 700; color: var(--text-primary); }
        .row-text .desc { font-size: 12px; color: #94a3b8; }

        /* Neo Switch */
        .neo-switch { position: relative; width: 44px; height: 24px; flex-shrink: 0; }
        .neo-switch input { opacity: 0; width: 0; height: 0; }
        .neo-slider { position: absolute; inset: 0; background: #475569; border-radius: 100px; cursor: pointer; transition: 0.3s; }
        .neo-slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: 0.3s; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .neo-switch input:checked + .neo-slider { background: #3b82f6; }
        .neo-switch input:checked + .neo-slider:before { transform: translateX(20px); }

        .action-card { display: flex; align-items: center; gap: 20px; padding: 25px; background: var(--bg-elevated); border-radius: 24px; }
        .action-card.warning { background: #1c1917; border: 1px solid #78350f; }
        .action-card svg { color: #94a3b8; }
        .card-text h4 { margin: 0; font-size: 14px; font-weight: 800; color: var(--text-primary); }
        .card-text p { margin: 4px 0 0; font-size: 12px; color: #94a3b8; }
        .card-btn { margin-left: auto; padding: 8px 20px; border-radius: 10px; border: 1px solid var(--border-color); background: var(--bg-card); font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s; color: var(--text-primary); }
        .card-btn:hover { background: #0f172a; color: white; border-color: #0f172a; }

        .panel-footer { padding: 30px 45px; background: var(--bg-elevated); border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; }
        .commit-btn { background: #0f172a; color: white; border: none; padding: 15px 30px; border-radius: 16px; font-weight: 800; display: flex; align-items: center; gap: 10px; cursor: pointer; transition: all 0.2s; }
        .commit-btn:hover:not(:disabled) { background: #1e293b; transform: translateY(-2px); }
        .commit-btn:disabled { opacity: 0.5; cursor: wait; }

        .status-badge { display: flex; align-items: center; gap: 8px; color: #d1fae5; font-weight: 700; font-size: 13px; background: #064e3b; padding: 6px 14px; border-radius: 100px; }
        .animate-fade { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .mt-20 { margin-top: 20px; }
        .spin { animation: spin 2s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        @media (max-width: 1024px) {
          .settings-layout { grid-template-columns: 1fr; }
          .settings-sidebar { flex-direction: row; flex-wrap: wrap; }
          .settings-nav-item { width: auto; flex: 1; min-width: 200px; }
        }
        @media (max-width: 768px) {
          .command-center { padding: 20px; }
          .editorial-header { flex-direction: column; align-items: flex-start; gap: 20px; }
          .glass-stats { flex-direction: column; width: 100%; gap: 15px; padding: 20px; }
          .stat-divider { width: 100%; height: 1px; margin: 0; }
          .grid-2 { grid-template-columns: 1fr; }
          .panel-content { padding: 25px; }
          .control-row { flex-direction: column; align-items: flex-start; gap: 15px; }
          .action-card { flex-direction: column; align-items: flex-start; gap: 15px; }
          .card-btn { margin-left: 0; width: 100%; }
          .panel-footer { flex-direction: column; gap: 15px; padding: 25px; }
          .commit-btn { width: 100%; justify-content: center; }
        }
      `}} />
    </div>
  );
};

export default SettingsManager;
