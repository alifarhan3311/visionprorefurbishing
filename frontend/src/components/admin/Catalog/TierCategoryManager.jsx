import React, { useState, useEffect } from 'react';
import { 
  Upload, Layers, Search, Filter, 
  ChevronRight, Edit3, Trash2, Layout, 
  GitBranch, Image as ImageIcon, CheckCircle2,
  FolderTree, Activity, Rocket, Package, ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api, { getImageUrl } from '../../../services/api';
import '../AdminForms.css';

const TierCategoryManager = ({ tierLevel }) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [parentCategory, setParentCategory] = useState('');
  const [navIconUrl, setNavIconUrl] = useState('');
  const [navIconFile, setNavIconFile] = useState(null);
  const [promoBannerUrl, setPromoBannerUrl] = useState('');
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

  // For Tier 4 Top Products selection
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [selectedTopProducts, setSelectedTopProducts] = useState([]);
  const [fetchingProducts, setFetchingProducts] = useState(false);

  const fetchCategoryProducts = async (catId) => {
    setFetchingProducts(true);
    try {
      const { data } = await api.get(`/products?category=${catId}`);
      if (data && data.success) {
        setCategoryProducts(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching category products:', err);
    } finally {
      setFetchingProducts(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    resetForm();
  }, [tierLevel]);

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
    setName(category.name || '');
    setSlug(category.slug || '');
    setParentCategory(category.parentCategory?._id || category.parentCategory || '');
    setNavIconUrl(category.navIconUrl || '');
    setPromoBannerUrl(category.promoBannerUrl || '');

    if (parseInt(tierLevel) === 4) {
      fetchCategoryProducts(category._id);
      const topProds = category.topProducts || [];
      setSelectedTopProducts(topProds.map(id => typeof id === 'object' && id ? id._id : id));
    } else {
      setCategoryProducts([]);
      setSelectedTopProducts([]);
    }

    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingId(null);
    resetForm();
  };

  const resetForm = () => {
    setName(''); 
    setSlug(''); 
    setNavIconUrl(''); 
    setNavIconFile(null);
    setPromoBannerUrl('');
    setPromoBannerFile(null);
    setParentCategory('');
    setCategoryProducts([]);
    setSelectedTopProducts([]);
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
      const tierNumber = parseInt(tierLevel, 10);
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      const formData = new FormData();

      formData.append('name', name);
      formData.append('slug', slug);
      formData.append('tierLevel', tierNumber);
      if (tierNumber !== 1 && parentCategory) {
        formData.append('parentCategory', parentCategory);
      }
      formData.append('navIconUrl', navIconUrl);
      formData.append('promoBannerUrl', promoBannerUrl);
      if (navIconFile) formData.append('icon', navIconFile);
      if (promoBannerFile) formData.append('banner', promoBannerFile);
      if (tierNumber === 4) {
        formData.append('topProducts', JSON.stringify(selectedTopProducts));
      }

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
      setStatusMsg('Error applying configuration. Check if slug is unique or required fields are set.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter categories shown in the table to ONLY matching this specific tierLevel
  const currentTierCategories = Array.isArray(existingCategories) ? existingCategories.filter(c => 
    c && (c.tierLevel || 1) === parseInt(tierLevel)
  ) : [];

  // Filter categories based on search term
  const filteredCategories = currentTierCategories.filter(c => 
    c && (c.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter allowed parent categories (must belong strictly to tierLevel - 1)
  const allowedParentCategories = Array.isArray(existingCategories) ? existingCategories.filter(c => 
    c && (c.tierLevel || 1) === parseInt(tierLevel) - 1
  ) : [];

  return (
    <div className="taxonomy-orchestrator animate-fade">
      {/* Back button and Meta Header */}
      <div style={{ marginBottom: '20px' }}>
        <Link to="/admin/categories" className="cancel-btn" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#e2e8f0', borderRadius: '8px', color: '#475569', fontSize: '13px', fontWeight: '700' }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>

      <div className="editorial-header-premium">
        <div className="header-meta">
          <span className="badge-glow" style={{ textTransform: 'uppercase' }}>Tier {tierLevel} Registry</span>
          <h1>Manage Tier {tierLevel} Categories</h1>
          <p>
            {tierLevel === 1 && "Create top-level brand segmentation nodes. Configure brand logo vectors and promo showcase headers."}
            {tierLevel === 2 && "Configure structural service divisions under Tier 1 roots (e.g. iPhone components under Apple Brand)."}
            {tierLevel === 3 && "Configure specific model lineups or device series families under service lines (e.g. iPhone 15 Series under iPhone)."}
            {tierLevel === 4 && "Configure the final SKU target models representing precise physical items for catalog linking."}
          </p>
        </div>

        <div className="glass-stats">
          <div className="stat-item">
            <div className="stat-label">Active Nodes</div>
            <div className="stat-val-group">
              <span className="val">{currentTierCategories.length}</span>
              <Activity size={16} className="trend-icon" />
            </div>
          </div>
        </div>
      </div>

      <div className="layout-grid">
        {/* Creator Panel */}
        <div className="composition-panel">
          <div className="panel-header">
            <Rocket size={20} />
            <h3>Create Tier {tierLevel} Node</h3>
          </div>

          <form onSubmit={handleSubmit} className="premium-form">
            {parseInt(tierLevel) > 1 && (
              <div className="form-section">
                <label>Parent Node (Tier {parseInt(tierLevel) - 1} Target Only) <span style={{ color: '#ef4444' }}>*</span></label>
                <select value={parentCategory} onChange={(e) => setParentCategory(e.target.value)} required>
                  <option value="">Choose Parent Category...</option>
                  {allowedParentCategories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            )}


            <div className="form-section">
              <label>Node Identification</label>
              <div className="form-stack">
                <input 
                  type="text" 
                  placeholder="Category Name (e.g. iPhone 15 Pro Max)" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required 
                />
                <input 
                  type="text" 
                  placeholder="slug-url-endpoint (e.g. iphone-15-pro-max)" 
                  value={slug} 
                  onChange={e => setSlug(e.target.value)} 
                  required 
                />
              </div>
            </div>


            <div className="form-actions">
              <button type="submit" className="publish-btn" disabled={submitting}>
                <CheckCircle2 size={18} /> {submitting ? 'Deploying...' : 'Deploy Category'}
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
                <span>{filteredCategories.length} Items in Tier {tierLevel}</span>
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
                  <th style={{ width: '45%' }}>CATEGORY NODE</th>
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
                        <p>No categories in Tier {tierLevel} match search.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <>
                    {filteredCategories.map(cat => (
                      <tr key={cat._id} className="ledger-row">
                        <td>
                          <div className="node-cell-premium">
                            <div className={`tier-marker-premium t${cat.tierLevel}`}>T{cat.tierLevel}</div>
                            <div className="meta-stack">
                              <span className="n">{cat.name || 'Unnamed Node'}</span>
                              <span className="parent-text">
                                {cat.parentCategory?.name ? `Sub-node of ${cat.parentCategory.name}` : cat.parentCategory ? 'Linked Sub-node' : 'Root-level Segment'}
                              </span>
                              {cat.tierLevel === 4 && cat.isSubTier === false && (
                                <span className="badge-inline">Product (skip Tier 4)</span>
                              )}
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
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Overlay Modal */}
      {isEditModalOpen && (
        <div className="inspector-overlay" onClick={closeEditModal}>
          <div className="side-modal" onClick={e => e.stopPropagation()}>
            <div className="inspector-header">
              <div className="id-tag">EDIT: Tier {tierLevel}</div>
              <button className="close-btn" onClick={closeEditModal}>&times;</button>
              <h3>Edit Taxonomy Node</h3>
            </div>
            <div className="inspector-body">
              <form onSubmit={handleSubmit} className="premium-form">
                {parseInt(tierLevel) > 1 && (
                  <div className="inspector-section">
                    <label>Structural Anchor (Tier {parseInt(tierLevel) - 1})</label>
                    <select value={parentCategory} onChange={(e) => setParentCategory(e.target.value)} required>
                      <option value="">Select Anchor Point...</option>
                      {allowedParentCategories.map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="inspector-section">
                  <label>Node Identity</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} required />
                  <input type="text" value={slug} onChange={e => setSlug(e.target.value)} required style={{ marginTop: '12px' }} />
                </div>

                {parseInt(tierLevel) === 4 && (
                  <div className="inspector-section">
                    <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Featured Top Products (Max 10)</span>
                      <span style={{ fontSize: '11px', color: '#6366f1', textTransform: 'none', fontWeight: '700' }}>
                        {selectedTopProducts.length}/10 Selected
                      </span>
                    </label>
                    
                    {fetchingProducts ? (
                      <div style={{ fontSize: '12px', color: '#64748b', padding: '10px 0' }}>
                        Loading category products...
                      </div>
                    ) : categoryProducts.length === 0 ? (
                      <div style={{ fontSize: '12px', color: '#64748b', background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
                        No products linked to this category yet.
                      </div>
                    ) : (
                      <div style={{ 
                        maxHeight: '220px', 
                        overflowY: 'auto', 
                        border: '1px solid #cbd5e1', 
                        borderRadius: '12px', 
                        background: '#f8fafc', 
                        padding: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}>
                        {categoryProducts.map(product => {
                          const isChecked = selectedTopProducts.includes(product._id);
                          return (
                            <div 
                              key={product._id} 
                              style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '10px', 
                                background: 'white', 
                                padding: '8px 12px', 
                                borderRadius: '8px', 
                                border: isChecked ? '1px solid #3b82f6' : '1px solid #e2e8f0',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                              onClick={() => {
                                if (isChecked) {
                                  setSelectedTopProducts(selectedTopProducts.filter(id => id !== product._id));
                                } else {
                                  if (selectedTopProducts.length >= 10) {
                                    alert('You can select a maximum of 10 featured products for a category.');
                                    return;
                                  }
                                  setSelectedTopProducts([...selectedTopProducts, product._id]);
                                }
                              }}
                            >
                              <input 
                                type="checkbox" 
                                checked={isChecked} 
                                readOnly
                                style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                              />
                              <div style={{ width: '32px', height: '32px', borderRadius: '6px', overflow: 'hidden', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {product.imageUrl ? (
                                  <img 
                                    src={getImageUrl(product.imageUrl)} 
                                    alt="" 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                  />
                                ) : (
                                  <Package size={16} style={{ color: '#94a3b8' }} />
                                )}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {product.name}
                                </div>
                                <div style={{ fontSize: '10px', color: '#64748b', fontFamily: 'monospace' }}>
                                  {product.sku} | ${product.baseRetailPrice}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {parseInt(tierLevel) === 1 && (
                  <div className="inspector-section">
                    <label>Logo & Banner URL Override</label>
                    <div className="asset-upload-row" style={{ marginBottom: '12px' }}>
                      <div className="file-box-custom mini">
                        <input type="file" onChange={handleIconChange} accept="image/*" />
                        <div className="meta">
                          <ImageIcon size={14} />
                          <span>{navIconFile ? navIconFile.name : (navIconUrl ? "Icon Loaded ✓" : "Upload Icon")}</span>
                        </div>
                      </div>
                      <div className="file-box-custom mini">
                        <input type="file" onChange={handleBannerChange} accept="image/*" />
                        <div className="meta">
                          <Layout size={14} />
                          <span>{promoBannerFile ? promoBannerFile.name : (promoBannerUrl ? "Banner Loaded ✓" : "Upload Banner")}</span>
                        </div>
                      </div>
                    </div>
                    <input type="text" placeholder="Or Icon URL" value={navIconUrl} onChange={e => setNavIconUrl(e.target.value)} style={{ marginBottom: '12px' }} />
                    <input type="text" placeholder="Or Banner URL" value={promoBannerUrl} onChange={e => setPromoBannerUrl(e.target.value)} />
                  </div>
                )}

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
        .taxonomy-orchestrator { padding: 40px; background: var(--bg-deep); min-height: 100vh; font-family: 'Plus Jakarta Sans', sans-serif; overflow-x: hidden; }
        .editorial-header-premium { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; }
        .header-meta h1 { font-size: 32px; font-weight: 800; color: #0f172a; margin: 10px 0 6px 0; letter-spacing: -0.5px; }
        .header-meta p { color: #64748b; font-size: 14px; font-weight: 500; }
        .badge-glow { background: #eff6ff; color: #3b82f6; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; padding: 6px 12px; border-radius: 8px; border: 1px solid #dbeafe; display: inline-block; }
        
        .glass-stats { display: flex; background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(0, 0, 0, 0.05); padding: 15px 30px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.02); }
        .stat-item { display: flex; flex-direction: column; gap: 4px; }
        .stat-label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; }
        .stat-val-group { display: flex; align-items: center; gap: 8px; }
        .stat-val-group .val { font-size: 24px; font-weight: 800; color: #0f172a; }
        .stat-val-group .val.indigo { color: #6366f1; }
        .stat-val-group .val.emerald { color: #10b981; }
        .stat-divider { width: 1px; background: #e2e8f0; margin: 0 24px; height: 35px; align-self: center; }

        .layout-grid { display: grid; grid-template-columns: 360px 1fr; gap: 30px; }
        .composition-panel { background: var(--bg-card); border-radius: 20px; border: 1px solid var(--border-color); padding: 24px; height: fit-content; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3); }
        .panel-header { display: flex; align-items: center; gap: 10px; padding-bottom: 16px; border-bottom: 1px solid #f1f5f9; margin-bottom: 20px; }
        .panel-header h3 { font-size: 15px; font-weight: 800; color: #0f172a; }
        .panel-header svg { color: #3b82f6; }

        .premium-form .form-section { margin-bottom: 20px; }
        .premium-form label { display: block; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 8px; letter-spacing: 0.5px; }
        .premium-form select, .premium-form input[type="text"] { width: 100%; padding: 12px 16px; border-radius: 12px; border: 1px solid var(--border-color); font-size: 13px; font-weight: 600; color: var(--text-primary); outline: none; background: var(--bg-elevated); transition: all 0.2s; }
        .premium-form select:focus, .premium-form input[type="text"]:focus { border-color: var(--primary-color); background: var(--bg-card); box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15); }
        .form-stack { display: flex; flex-direction: column; gap: 12px; }

        .asset-upload-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .file-box-custom.mini { position: relative; border: 2px dashed var(--border-color); border-radius: 12px; padding: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; overflow: hidden; height: 50px; background: var(--bg-elevated); }
        .file-box-custom.mini:hover { border-color: #3b82f6; background: #eff6ff; }
        .file-box-custom.mini input[type="file"] { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; }
        .file-box-custom.mini .meta { display: flex; align-items: center; gap: 6px; color: #64748b; font-size: 11px; font-weight: 700; pointer-events: none; }

        .publish-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; background: #0f172a; color: white; border: none; padding: 12px; border-radius: 12px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .publish-btn:hover { background: #3b82f6; }
        .status-toast { margin-top: 12px; font-size: 11px; font-weight: 700; color: #10b981; text-align: center; }

        .inventory-ledger { background: var(--bg-card); border-radius: 20px; border: 1px solid var(--border-color); padding: 24px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3); }
        .ledger-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; gap: 15px; }
        .active-nodes { display: flex; align-items: center; gap: 8px; color: #64748b; font-size: 13px; font-weight: 700; }
        .search-pill { background: var(--bg-elevated); border: 1px solid var(--border-color); padding: 10px 18px; border-radius: 14px; display: flex; align-items: center; gap: 12px; width: 320px; transition: all 0.2s; }
        .search-pill:focus-within { border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.05); }
        .search-pill input { border: none; outline: none; font-size: 13px; width: 100%; font-weight: 600; background: transparent; }
        .table-container { overflow-x: auto; }
        .inventory-table { width: 100%; border-collapse: collapse; }
        .inventory-table th { font-size: 10px; font-weight: 800; color: var(--text-primary); text-transform: uppercase; padding: 12px 16px; border-bottom: 1px solid var(--border-color); letter-spacing: 0.5px; text-align: left; }
        .inventory-table td { padding: 16px; border-bottom: 1px solid #cbd5e1; vertical-align: middle; }
        .ledger-row { transition: background 0.2s; }
        .ledger-row:hover { background: var(--bg-elevated); }

        .node-cell-premium { display: flex; align-items: center; gap: 12px; }
        .tier-marker-premium { font-size: 9px; font-weight: 900; color: white; padding: 3px 6px; border-radius: 6px; }
        .tier-marker-premium.t1 { background: var(--primary-color); }
        .tier-marker-premium.t2 { background: #f26522; }
        .tier-marker-premium.t3 { background: #8b5cf6; }
        .tier-marker-premium.t4 { background: #10b981; }
        
        .meta-stack { display: flex; flex-direction: column; gap: 2px; }
        .meta-stack .n { font-size: 14px; font-weight: 700; color: #0f172a; }
        .meta-stack .parent-text { font-size: 11px; color: #64748b; font-weight: 500; }
        .slug-tag { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #64748b; background: #f1f5f9; padding: 4px 8px; border-radius: 6px; font-weight: 600; white-space: nowrap; }

        .hierarchy-preview { display: flex; gap: 4px; }
        .hierarchy-preview .dot { width: 6px; height: 6px; border-radius: 50%; background: #e2e8f0; }
        .ledger-row:hover .hierarchy-preview .dot { background: #3b82f6; }

        .row-actions { display: flex; justify-content: flex-end; gap: 8px; }
        .icon-btn { width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: center; background: var(--bg-elevated); color: var(--text-secondary); cursor: pointer; transition: all 0.2s; }
        .icon-btn:hover { color: var(--text-primary); border-color: var(--primary-color); background: var(--bg-card); }
        .icon-btn.delete:hover { color: #ef4444; border-color: #fee2e2; background: #fef2f2; }

        .inspector-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(8px); z-index: 2000; display: flex; justify-content: flex-end; }
        .side-modal { width: 420px; height: 100vh; background: var(--bg-card); display: flex; flex-direction: column; box-shadow: -10px 0 50px rgba(0,0,0,0.4); animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        
        .inspector-header { padding: 30px; border-bottom: 1px solid #f1f5f9; position: relative; }
        .inspector-header h3 { font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 10px; }
        .inspector-header .close-btn { position: absolute; top: 30px; right: 30px; font-size: 28px; border: none; background: transparent; cursor: pointer; color: #94a3b8; line-height: 0.5; }
        .inspector-header .close-btn:hover { color: #0f172a; }
        .id-tag { font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 800; color: #3b82f6; background: #eff6ff; padding: 6px 12px; border-radius: 8px; width: fit-content; }
        
        .inspector-body { padding: 30px; flex: 1; overflow-y: auto; }
        .inspector-section { margin-bottom: 25px; }
        .inspector-section label { display: block; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 8px; }
        .inspector-section select, .inspector-section input[type="text"] { width: 100%; padding: 12px 16px; border-radius: 12px; border: 1px solid var(--border-color); font-size: 13px; font-weight: 600; color: var(--text-primary); outline: none; background: var(--bg-elevated); }
        
        .modal-footer-custom { display: flex; gap: 12px; margin-top: 30px; }
        .modal-footer-custom .save-btn { flex: 1; background: #3b82f6; color: white; border: none; padding: 12px; border-radius: 12px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .modal-footer-custom .save-btn:hover { background: #2563eb; }
        .modal-footer-custom .cancel-btn { background: var(--bg-elevated); color: var(--text-secondary); border: none; padding: 12px 20px; border-radius: 12px; font-size: 13px; font-weight: 700; cursor: pointer; }

        @media (max-width: 1024px) {
          .layout-grid { grid-template-columns: 1fr; }
          .search-pill { width: 100%; }
        }
      \n` }} />
    </div>
  );
};

export default TierCategoryManager;
