import React, { useState, useEffect } from 'react';
import { 
  Upload, Layers, Search, Filter, Plus, 
  ChevronRight, Edit3, Trash2, Layout, 
  GitBranch, Image as ImageIcon, CheckCircle2,
  Settings, FolderTree, Activity, ArrowUpRight, Rocket, AlertTriangle,
  Zap, Package
} from 'lucide-react';
import api from '../../../services/api';
import '../AdminForms.css';

const CategoriesManager = () => {
  const [tierLevel, setTierLevel] = useState('1');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [parentCategory, setParentCategory] = useState('');
  const [navIconUrl, setNavIconUrl] = useState('');
  const [promoBannerUrl, setPromoBannerUrl] = useState('');
  const [navIconFile, setNavIconFile] = useState(null);
  const [promoBannerFile, setPromoBannerFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [existingCategories, setExistingCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/categories');
      if (data && data.success) {
        setExistingCategories(Array.isArray(data.data) ? data.data : []);
      } else {
        setExistingCategories(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setExistingCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (category) => {
    if (!category) return;
    setEditingId(category._id);
    setTierLevel((category.tierLevel || 1).toString());
    setName(category.name || '');
    setSlug(category.slug || '');
    setParentCategory(category.parentCategory?._id || '');
    setNavIconUrl(category.navIconUrl || '');
    setPromoBannerUrl(category.promoBannerUrl || '');
    setNavIconFile(null);
    setPromoBannerFile(null);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingId(null);
    resetForm();
  };

  const resetForm = () => {
    setName(''); setSlug(''); setNavIconUrl(''); setPromoBannerUrl('');
    setNavIconFile(null); setPromoBannerFile(null);
    setParentCategory(''); setTierLevel('1');
  };

  const deleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to decommission this category branch? This may orphan linked products.')) {
      try {
        await api.delete(`/categories/${id}`);
        fetchCategories();
      } catch (err) {
        console.error('Error deleting category:', err);
      }
    }
  };

  const handleIconChange = (e) => {
    if (e.target.files[0]) setNavIconFile(e.target.files[0]);
  };

  const handleBannerChange = (e) => {
    if (e.target.files[0]) setPromoBannerFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMsg('Processing taxonomy change...');
    
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('slug', slug);
      formData.append('tierLevel', tierLevel);
      if (tierLevel !== '1' && parentCategory) {
        formData.append('parentCategory', parentCategory);
      }
      
      // If we aren't uploading a new file, we should pass the existing URL (or empty) so the backend knows
      formData.append('navIconUrl', navIconUrl);
      formData.append('promoBannerUrl', promoBannerUrl);

      if (navIconFile) formData.append('icon', navIconFile);
      if (promoBannerFile) formData.append('banner', promoBannerFile);

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };

      if (editingId) {
        await api.put(`/categories/${editingId}`, formData, config);
        setIsEditModalOpen(false);
        setEditingId(null);
      } else {
        await api.post('/categories', formData, config);
      }

      resetForm();
      fetchCategories();
      setStatusMsg('Configuration saved successfully!');
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setStatusMsg('Error applying configuration.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCategories = Array.isArray(existingCategories) ? existingCategories.filter(c => 
    c && (c.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const stats = {
    total: filteredCategories.length,
    root: filteredCategories.filter(c => (c?.tierLevel || 0) === 1).length,
    models: filteredCategories.filter(c => (c?.tierLevel || 0) === 4).length
  };

  return (
    <div className="taxonomy-orchestrator animate-fade">
      {/* Editorial Header */}
      <div className="editorial-header-premium">
        <div className="header-meta">
          <span className="badge-glow">Taxonomy Engine</span>
          <h1>System Topology</h1>
          <p>Orchestrate your site's hierarchical structure and navigation logic with polymorphic precision.</p>
        </div>

        <div className="glass-stats">
          <div className="stat-item">
            <div className="stat-label">Global Nodes</div>
            <div className="stat-val-group">
              <span className="val">{stats.total}</span>
              <Activity size={16} className="trend-icon" />
            </div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-label">Root Segments</div>
            <div className="stat-val-group">
              <span className="val indigo">{stats.root}</span>
            </div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-label">SKU Models</div>
            <div className="stat-val-group">
              <span className="val emerald">{stats.models}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="layout-grid">
        {/* Creator Panel */}
        <div className="composition-panel">
          <div className="panel-header">
            <Rocket size={20} />
            <h3>Node Configuration</h3>
          </div>

          <form onSubmit={handleSubmit} className="premium-form">
            <div className="form-section">
              <label>Structural Position</label>
              <select value={tierLevel} onChange={(e) => setTierLevel(e.target.value)} required>
                <option value="1">Tier 1 - Main Catalog Header</option>
                <option value="2">Tier 2 - Brand / Service Line</option>
                <option value="3">Tier 3 - Device Family</option>
                <option value="4">Tier 4 - Specific SKU Model</option>
              </select>
              
              {tierLevel !== '1' && (
                <div style={{ marginTop: '15px' }}>
                  <label>Parent Node</label>
                  <select value={parentCategory} onChange={(e) => setParentCategory(e.target.value)} required>
                    <option value="">Select Anchor Point...</option>
                    {Array.isArray(existingCategories) && existingCategories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name} (T{cat.tierLevel})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="form-section">
              <label>Basic Identification</label>
              <div className="form-stack">
                <input type="text" placeholder="Category Label" value={name} onChange={e => setName(e.target.value)} required />
                <input type="text" placeholder="slug-for-url" value={slug} onChange={e => setSlug(e.target.value)} required />
              </div>
            </div>

            {tierLevel === '1' && (
              <div className="form-section dynamic-fade">
                <label>Global Navigation Assets</label>
                <div className="asset-upload-row">
                  <div className="file-box-custom mini">
                    <input type="file" onChange={handleIconChange} accept="image/*" />
                    <div className="meta">
                       <ImageIcon size={14} />
                       <span>{navIconFile ? navIconFile.name : (navIconUrl ? "Icon ✓" : "Set Icon")}</span>
                    </div>
                  </div>
                  <div className="file-box-custom mini">
                    <input type="file" onChange={handleBannerChange} accept="image/*" />
                    <div className="meta">
                       <Layout size={14} />
                       <span>{promoBannerFile ? promoBannerFile.name : (promoBannerUrl ? "Banner ✓" : "Set Banner")}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="form-actions">
              <button type="submit" className="publish-btn" disabled={submitting}>
                <CheckCircle2 size={18} /> {submitting ? 'Transmitting...' : editingId ? 'Save Topology' : 'Deploy Category'}
              </button>
              {statusMsg && <div className="status-toast">{statusMsg}</div>}
            </div>
          </form>
        </div>

        {/* List View */}
        <div className="inventory-ledger">
          <div className="ledger-header">
            <div className="header-left">
              <div className="active-nodes">
                <FolderTree size={14} />
                <span>{filteredCategories.length} Taxonomy Nodes</span>
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
                  <th style={{ width: '45%' }}>TAXONOMY NODE</th>
                  <th style={{ width: '25%' }}>IDENTIFIER</th>
                  <th style={{ width: '15%' }}>HIERARCHY</th>
                  <th style={{ textAlign: 'right', width: '15%' }}>ENGAGE</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" className="loading-state">Syncing Taxonomy Ledger...</td></tr>
                ) : filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="empty-state-row">
                      <div className="empty-state-content">
                        <Package size={64} />
                        <p>No nodes match the current filter.</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredCategories.map(cat => (
                  <tr key={cat._id} className="ledger-row">
                    <td>
                      <div className="node-cell-premium">
                        <div className={`tier-marker-premium t${cat.tierLevel}`}>T{cat.tierLevel}</div>
                        <div className="meta-stack">
                          <span className="n">{cat.name || 'Unnamed Node'}</span>
                          <span className="parent-text">
                            {cat.parentCategory ? `Sub-node of ${cat.parentCategory.name}` : 'Root-level Segment'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="slug-tag">/{cat.slug || 'n-a'}</span>
                    </td>
                    <td>
                      <div className="hierarchy-preview">
                        {Array.from({ length: cat.tierLevel || 1 }).map((_, i) => (
                          <div key={i} className="dot" />
                        ))}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="row-actions">
                        <button className="icon-btn" onClick={() => openEditModal(cat)}><Edit3 size={16} /></button>
                        <button className="icon-btn delete" onClick={() => deleteCategory(cat._id)}><Trash2 size={16} /></button>
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
              <div className="id-tag">NODE: Tier {tierLevel}</div>
              <button className="close-btn" onClick={closeEditModal}>&times;</button>
              <h3>Node Overrides</h3>
            </div>
            <div className="inspector-body">
              <form onSubmit={handleSubmit} className="premium-form">
                <div className="inspector-section">
                  <label>Identity Overrides</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} required />
                  <input type="text" value={slug} onChange={e => setSlug(e.target.value)} required style={{ marginTop: '12px' }} />
                </div>
                
                {tierLevel !== '1' && (
                  <div className="inspector-section">
                    <label>Structural Anchor</label>
                    <select value={parentCategory} onChange={(e) => setParentCategory(e.target.value)} required>
                      {Array.isArray(existingCategories) && existingCategories.filter(c => c._id !== editingId).map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name} (T{cat.tierLevel})</option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div className="inspector-section">
                  <label>Node Icon Asset</label>
                  <div className="file-box-custom">
                    <input type="file" onChange={handleIconChange} accept="image/*" />
                    <div className="meta" style={{ textAlign: 'center', marginTop: '10px' }}>
                      {iconFile ? iconFile.name : (iconUrl ? "Icon Secured ✓" : "Upload new SVG/PNG")}
                    </div>
                  </div>
                  <input type="text" value={iconUrl} onChange={e => setIconUrl(e.target.value)} style={{ marginTop: '10px' }} placeholder="Or Remote Icon URL" />
                </div>

                <div className="modal-footer-custom">
                  <button type="submit" className="save-btn" disabled={submitting}>Commit Changes</button>
                  <button type="button" className="cancel-btn" onClick={closeEditModal}>Discard</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .taxonomy-orchestrator { padding: 40px; background: #f8fafc; min-height: 100vh; font-family: 'Inter', sans-serif; overflow-x: hidden; }
        
        .editorial-header-premium { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; gap: 20px; }
        .header-meta h1 { font-size: 32px; font-weight: 800; margin: 8px 0; letter-spacing: -0.02em; color: #0f172a; }
        .header-meta p { color: #64748b; font-size: 16px; max-width: 500px; }
        .badge-glow { background: #e0f2fe; color: #0369a1; padding: 6px 14px; border-radius: 100px; font-size: 12px; font-weight: 700; text-transform: uppercase; border: 1px solid rgba(3, 105, 161, 0.1); }

        .glass-stats { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 24px; display: flex; padding: 20px 30px; box-shadow: 0 10px 40px -10px rgba(0,0,0,0.05); flex-shrink: 0; }
        .stat-item { text-align: center; padding: 0 20px; }
        .stat-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
        .stat-val-group { display: flex; align-items: center; gap: 8px; justify-content: center; }
        .stat-val-group .val { font-size: 24px; font-weight: 800; color: #0f172a; }
        .val.indigo { color: #4f46e5; }
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
        
        .asset-upload-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .file-box-custom { border: 2px dashed #e2e8f0; border-radius: 16px; padding: 25px; text-align: center; position: relative; transition: all 0.2s; cursor: pointer; }
        .file-box-custom.mini { padding: 15px; }
        .file-box-custom:hover { border-color: #3b82f6; background: #eff6ff; }
        .file-box-custom input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
        .file-box-custom .meta { display: flex; flex-direction: column; align-items: center; gap: 6px; font-size: 10px; font-weight: 800; color: #64748b; pointer-events: none; }

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
        
        .node-cell-premium { display: flex; align-items: center; gap: 15px; }
        .tier-marker-premium { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800; flex-shrink: 0; }
        .tier-marker-premium.t1 { background: #eef2ff; color: #4f46e5; }
        .tier-marker-premium.t2 { background: #f5f3ff; color: #7c3aed; }
        .tier-marker-premium.t3 { background: #eff6ff; color: #3b82f6; }
        .tier-marker-premium.t4 { background: #ecfdf5; color: #10b981; }
        
        .meta-stack { display: flex; flex-direction: column; white-space: normal; min-width: 0; }
        .meta-stack .n { font-weight: 700; color: #1e293b; font-size: 14px; line-height: 1.4; }
        .parent-text { font-size: 11px; color: #94a3b8; margin-top: 4px; font-weight: 600; }
        
        .slug-tag { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #64748b; background: #f1f5f9; padding: 4px 8px; border-radius: 6px; font-weight: 600; white-space: nowrap; }
        
        .hierarchy-preview { display: flex; gap: 4px; }
        .hierarchy-preview .dot { width: 6px; height: 6px; border-radius: 50%; background: #e2e8f0; }
        .ledger-row:hover .hierarchy-preview .dot { background: #3b82f6; }

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

        .status-toast { position: fixed; bottom: 40px; right: 40px; background: #0f172a; color: white; padding: 12px 24px; border-radius: 12px; font-size: 13px; font-weight: 700; box-shadow: 0 10px 30px rgba(0,0,0,0.2); animation: fadeInUp 0.3s ease-out; z-index: 3000; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        .animate-fade { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 1400px) {
          .layout-grid { grid-template-columns: 1fr; }
          .composition-panel { position: static; margin-bottom: 40px; max-width: 100%; }
          .editorial-header-premium { flex-direction: column; align-items: flex-start; }
        }

        @media (max-width: 768px) {
          .taxonomy-orchestrator { padding: 20px; }
          .glass-stats { flex-direction: column; gap: 15px; width: 100%; padding: 20px; }
          .stat-divider { width: 100%; height: 1px; }
          .ledger-header { flex-direction: column; align-items: flex-start; gap: 15px; }
          .search-pill { width: 100%; }
          .side-modal { width: 100%; }
          .asset-upload-row { grid-template-columns: 1fr; }
        }
      `}} />
    </div>
  );
};

export default CategoriesManager;
