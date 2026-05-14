import React, { useState, useEffect } from 'react';
import { 
  Upload, Trash2, Plus, ExternalLink, Megaphone,
  FileText, Image as ImageIcon, Search, Filter,
  Download, ChevronRight, Edit3, CheckCircle2,
  Share2, FolderOpen, Briefcase, Info, Activity,
  ArrowUpRight, Rocket, Package, Zap
} from 'lucide-react';
import api from '../../../services/api';
import '../AdminForms.css';

const MarketingManager = () => {
  const [assets, setAssets] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Flyers');
  const [fileUrl, setFileUrl] = useState('');
  const [fileType, setFileType] = useState('PDF');
  const [fileSize, setFileSize] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/marketing');
      if (data && data.success) {
        setAssets(Array.isArray(data.data) ? data.data : []);
      } else {
        setAssets(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching assets:', err);
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);

    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      const { data } = await api.post('/upload', formData, config);
      setFileUrl(data.image);
      
      const extension = file.name.split('.').pop().toUpperCase();
      setFileType(extension);
      setFileSize((file.size / (1024 * 1024)).toFixed(1) + ' MB');
    } catch (error) {
      console.error(error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { title, description, category, fileUrl, fileType, fileSize };
      
      if (editingId) {
        await api.put(`/marketing/${editingId}`, payload);
        setIsEditModalOpen(false);
        setEditingId(null);
      } else {
        await api.post('/marketing', payload);
      }

      resetForm();
      fetchAssets();
    } catch (err) {
      console.error(err);
      alert('Failed to save asset.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle(''); setDescription(''); setFileUrl('');
    setCategory('Flyers'); setFileType('PDF'); setFileSize('');
  };

  const openEditModal = (asset) => {
    if (!asset) return;
    setEditingId(asset._id);
    setTitle(asset.title || '');
    setDescription(asset.description || '');
    setCategory(asset.category || 'Flyers');
    setFileUrl(asset.fileUrl || '');
    setFileType(asset.fileType || 'PDF');
    setFileSize(asset.fileSize || '');
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingId(null);
    resetForm();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Remove this resource from the B2B Dealer Hub?')) {
      try {
        await api.delete(`/marketing/${id}`);
        fetchAssets();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredAssets = Array.isArray(assets) ? assets.filter(a => 
    a && (a.title || '').toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const stats = {
    total: filteredAssets.length,
    media: filteredAssets.filter(a => ['JPG', 'PNG', 'JPEG'].includes(a?.fileType?.toUpperCase())).length,
    docs: filteredAssets.filter(a => a?.fileType?.toUpperCase() === 'PDF').length
  };

  return (
    <div className="marketing-orchestrator animate-fade">
      {/* Visual Header */}
      <div className="editorial-header-premium">
        <div className="header-meta">
          <span className="badge-glow">Dealer Enablement</span>
          <h1>Media Hub</h1>
          <p>Distribute high-fidelity marketing assets and technical documentation to the global partner network.</p>
        </div>

        <div className="glass-stats">
          <div className="stat-item">
            <div className="stat-label">Global Assets</div>
            <div className="stat-val-group">
              <span className="val">{stats.total}</span>
              <Activity size={16} className="trend-icon" />
            </div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-label">Visual Media</div>
            <div className="stat-val-group">
              <span className="val indigo">{stats.media}</span>
            </div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-label">Technical PDF</div>
            <div className="stat-val-group">
              <span className="val emerald">{stats.docs}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="layout-grid">
        {/* Provisioning Panel */}
        <div className="composition-panel">
          <div className="panel-header">
            <Rocket size={20} />
            <h3>Asset Provisioning</h3>
          </div>

          <form onSubmit={handleSave} className="premium-form">
            <div className="form-section">
              <label>Identification</label>
              <div className="form-stack">
                <input 
                  type="text" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  placeholder="Resource Title (e.g. Q4 Price Matrix)" 
                  required 
                />
                <select value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="Flyers">Flyers & Promotion</option>
                  <option value="Price Lists">B2B Price Matrix</option>
                  <option value="Social Media">Social Media Kits</option>
                  <option value="Banners">Web & Store Banners</option>
                  <option value="Technical Documents">Technical Manuals</option>
                </select>
              </div>
            </div>

            <div className="form-section">
              <label>File Distribution</label>
              <div className="file-box-custom">
                <input type="file" onChange={uploadFileHandler} />
                <div className="meta">
                  {uploading ? "Analyzing Payload..." : (fileUrl ? "Asset Secured ✓" : "Upload source file (PDF/IMG/ZIP)")}
                </div>
              </div>
              <input 
                type="text" 
                value={fileUrl} 
                onChange={e => setFileUrl(e.target.value)} 
                placeholder="Remote URL (Optional CDN link)" 
                style={{ marginTop: '12px' }}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="publish-btn" disabled={submitting}>
                <Megaphone size={18} /> {submitting ? 'Processing...' : editingId ? 'Update Resource' : 'Publish to Hub'}
              </button>
            </div>
          </form>
        </div>

        {/* Library Registry */}
        <div className="inventory-ledger">
          <div className="ledger-header">
            <div className="header-left">
              <div className="active-nodes">
                <FolderOpen size={14} />
                <span>{filteredAssets.length} Published Resources</span>
              </div>
            </div>
            <div className="search-pill">
              <Search size={16} />
              <input 
                type="text" 
                placeholder="Search registry..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="table-container">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th style={{ width: '45%' }}>RESOURCE IDENTITY</th>
                  <th style={{ width: '25%' }}>CLASSIFICATION</th>
                  <th style={{ width: '15%' }}>METRICS</th>
                  <th style={{ textAlign: 'right', width: '15%' }}>ENGAGE</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" className="loading-state">Syncing Dealer Hub Ledger...</td></tr>
                ) : filteredAssets.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="empty-state-row">
                      <div className="empty-state-content">
                        <Package size={64} />
                        <p>No resources match the current search scope.</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredAssets.map(asset => (
                  <tr key={asset._id} className="ledger-row">
                    <td>
                      <div className="resource-cell-premium">
                        <div className="icon-box-premium">
                          {asset.fileType?.toUpperCase() === 'PDF' ? <FileText size={20} /> : <ImageIcon size={20} />}
                        </div>
                        <div className="meta-stack">
                          <span className="n">{asset.title || 'Untitled Resource'}</span>
                          <span className="link-text-premium">{asset.fileUrl ? (asset.fileUrl.substring(0, 40) + '...') : 'No URL set'}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill-premium ${(asset.category || 'flyers').toLowerCase().replace(/ /g, '-')}`}>
                        {asset.category || 'General'}
                      </span>
                    </td>
                    <td>
                      <div className="metrics-cell-premium">
                        <span className="file-type">{asset.fileType || 'N/A'}</span>
                        <span className="file-size">{asset.fileSize || '---'}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="row-actions">
                        {asset.fileUrl && (
                          <a href={asset.fileUrl} target="_blank" rel="noreferrer" className="icon-btn">
                             <ExternalLink size={16} />
                          </a>
                        )}
                        <button className="icon-btn" onClick={() => openEditModal(asset)}><Edit3 size={16} /></button>
                        <button className="icon-btn delete" onClick={() => handleDelete(asset._id)}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Side Inspector */}
      {isEditModalOpen && (
        <div className="inspector-overlay" onClick={closeEditModal}>
          <div className="side-modal" onClick={e => e.stopPropagation()}>
            <div className="inspector-header">
              <div className="id-tag">ASSET CONFIG</div>
              <button className="close-btn" onClick={closeEditModal}>&times;</button>
              <h3>Asset Overrides</h3>
            </div>
            <div className="inspector-body">
              <form onSubmit={handleSave} className="premium-form">
                <div className="inspector-section">
                  <label>Asset Identity Overrides</label>
                  <div className="form-stack">
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} required />
                    <select value={category} onChange={e => setCategory(e.target.value)}>
                      <option value="Flyers">Flyers & Promotion</option>
                      <option value="Price Lists">B2B Price Matrix</option>
                      <option value="Social Media">Social Media Kits</option>
                      <option value="Banners">Web & Store Banners</option>
                      <option value="Technical Documents">Technical Manuals</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer-custom">
                  <button type="submit" className="save-btn" disabled={submitting}>
                    {submitting ? 'Saving...' : 'Commit Changes'}
                  </button>
                  <button type="button" className="cancel-btn" onClick={closeEditModal}>Discard</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .marketing-orchestrator { padding: 40px; background: #f8fafc; min-height: 100vh; font-family: 'Inter', sans-serif; overflow-x: hidden; }
        
        .editorial-header-premium { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; gap: 20px; }
        .header-meta h1 { font-size: 32px; font-weight: 800; margin: 8px 0; letter-spacing: -0.02em; color: #0f172a; }
        .header-meta p { color: #64748b; font-size: 16px; max-width: 500px; }
        .badge-glow { background: #eef2ff; color: #4f46e5; padding: 6px 14px; border-radius: 100px; font-size: 12px; font-weight: 700; text-transform: uppercase; border: 1px solid rgba(79, 70, 229, 0.1); }

        .glass-stats { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 24px; display: flex; padding: 20px 30px; box-shadow: 0 10px 40px -10px rgba(0,0,0,0.05); flex-shrink: 0; }
        .stat-item { text-align: center; padding: 0 20px; }
        .stat-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
        .stat-val-group { display: flex; align-items: center; gap: 8px; justify-content: center; }
        .stat-val-group .val { font-size: 24px; font-weight: 800; color: #0f172a; }
        .val.indigo { color: #6366f1; }
        .val.emerald { color: #10b981; }
        .stat-divider { width: 1px; background: #e2e8f0; height: 40px; }

        .layout-grid { display: grid; grid-template-columns: 380px 1fr; gap: 40px; align-items: start; }
        
        .composition-panel { background: white; border-radius: 32px; border: 1px solid #e2e8f0; padding: 35px; box-shadow: 0 20px 50px -12px rgba(0,0,0,0.04); position: sticky; top: 40px; }
        .panel-header { display: flex; align-items: center; gap: 12px; margin-bottom: 30px; color: #0f172a; }
        .panel-header h3 { margin: 0; font-size: 20px; font-weight: 800; }
        
        .premium-form .form-section { margin-bottom: 25px; }
        .premium-form label { display: block; font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.1em; }
        .premium-form input, .premium-form select { width: 100%; padding: 14px 18px; border-radius: 16px; border: 1px solid #e2e8f0; background: #f8fafc; font-size: 14px; font-weight: 700; outline: none; transition: all 0.2s; }
        .premium-form input:focus { border-color: #3b82f6; background: white; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.05); }
        .form-stack { display: flex; flex-direction: column; gap: 12px; }
        
        .file-box-custom { border: 2px dashed #e2e8f0; border-radius: 16px; padding: 25px; text-align: center; position: relative; transition: all 0.2s; cursor: pointer; }
        .file-box-custom:hover { border-color: #3b82f6; background: #eff6ff; }
        .file-box-custom input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
        .file-box-custom .meta { font-size: 12px; font-weight: 700; color: #64748b; pointer-events: none; }

        .publish-btn { width: 100%; padding: 18px; border-radius: 18px; background: #0f172a; color: white; border: none; font-weight: 800; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: all 0.2s; margin-top: 10px; }
        .publish-btn:hover:not(:disabled) { background: #1e293b; transform: translateY(-2px); box-shadow: 0 10px 20px -10px rgba(0,0,0,0.2); }

        .inventory-ledger { background: white; border-radius: 32px; border: 1px solid #e2e8f0; box-shadow: 0 20px 50px -12px rgba(0,0,0,0.04); overflow: hidden; display: flex; flex-direction: column; min-width: 0; }
        .ledger-header { padding: 30px 40px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; background: #fafafa; flex-wrap: wrap; gap: 20px; }
        .active-nodes { display: flex; align-items: center; gap: 8px; color: #64748b; font-size: 13px; font-weight: 600; }
        .active-nodes svg { color: #3b82f6; }
        .search-pill { background: white; border: 1px solid #cbd5e1; padding: 10px 18px; border-radius: 14px; display: flex; align-items: center; gap: 12px; width: 320px; transition: all 0.2s; }
        .search-pill:focus-within { border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.05); }
        .search-pill input { border: none; outline: none; font-size: 13px; width: 100%; font-weight: 600; background: transparent; }

        .table-container { width: 100%; overflow-x: auto; }
        .inventory-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
        .inventory-table th { padding: 20px 40px; text-align: left; font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; background: #fcfcfc; white-space: nowrap; }
        .ledger-row { border-bottom: 1px solid #f1f5f9; transition: all 0.2s; }
        .ledger-row:hover { background: #f8fafc; }
        .ledger-row td { padding: 25px 40px; vertical-align: middle; }
        
        .resource-cell-premium { display: flex; align-items: center; gap: 15px; }
        .icon-box-premium { width: 44px; height: 44px; border-radius: 12px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; color: #6366f1; border: 1px solid #e2e8f0; flex-shrink: 0; }
        .meta-stack { display: flex; flex-direction: column; white-space: normal; min-width: 0; }
        .meta-stack .n { font-weight: 700; color: #1e293b; font-size: 14px; line-height: 1.4; }
        .link-text-premium { font-size: 11px; color: #94a3b8; margin-top: 4px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        
        .status-pill-premium { font-size: 9px; font-weight: 800; text-transform: uppercase; padding: 4px 10px; border-radius: 6px; background: #f1f5f9; color: #475569; white-space: nowrap; }
        
        .metrics-cell-premium { display: flex; flex-direction: column; }
        .metrics-cell-premium .file-type { font-weight: 800; font-size: 14px; color: #0f172a; }
        .metrics-cell-premium .file-size { font-size: 11px; color: #94a3b8; font-weight: 600; }

        .row-actions { display: flex; gap: 8px; justify-content: flex-end; }
        .icon-btn { width: 38px; height: 38px; border-radius: 12px; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; background: white; color: #94a3b8; }
        .icon-btn:hover { background: #0f172a; color: white; border-color: #0f172a; transform: translateY(-2px); }
        .icon-btn.delete:hover { background: #ef4444; border-color: #ef4444; }

        .loading-state, .empty-state-row { text-align: center; padding: 100px !important; color: #94a3b8; font-weight: 600; }
        .empty-state-content { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; min-height: 300px; }
        .empty-state-content p { margin-top: 20px; font-size: 16px; font-weight: 700; }

        /* Inspector Panel */
        .inspector-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(8px); z-index: 2000; display: flex; justify-content: flex-end; }
        .side-modal { width: 480px; height: 100%; background: white; box-shadow: -20px 0 60px rgba(0,0,0,0.1); animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); display: flex; flex-direction: column; position: relative; }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        
        .inspector-header { padding: 40px; border-bottom: 1px solid #f1f5f9; }
        .id-tag { font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 800; color: #3b82f6; background: #eff6ff; padding: 6px 12px; border-radius: 8px; width: fit-content; }
        .inspector-header h3 { margin: 15px 0 0; font-size: 22px; font-weight: 800; color: #0f172a; }
        .close-btn { position: absolute; right: 30px; top: 35px; background: none; border: none; font-size: 32px; color: #94a3b8; cursor: pointer; line-height: 1; }
        
        .inspector-body { padding: 40px; flex: 1; overflow-y: auto; }
        .inspector-section { margin-bottom: 40px; }
        .inspector-section label { display: block; font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 15px; }

        .modal-footer-custom { padding: 30px 40px; border-top: 1px solid #f1f5f9; display: grid; gap: 12px; }
        .save-btn { background: #0f172a; color: white; border: none; padding: 18px; border-radius: 18px; font-weight: 800; cursor: pointer; transition: all 0.2s; }
        .cancel-btn { background: transparent; border: 1px solid #e2e8f0; padding: 16px; border-radius: 18px; color: #64748b; font-weight: 700; cursor: pointer; }

        .animate-fade { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 1400px) {
          .layout-grid { grid-template-columns: 1fr; }
          .composition-panel { position: static; margin-bottom: 40px; max-width: 100%; }
          .editorial-header-premium { flex-direction: column; align-items: flex-start; }
        }
      `}} />
    </div>
  );
};

export default MarketingManager;
