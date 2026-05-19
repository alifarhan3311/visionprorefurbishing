import React, { useState, useEffect } from 'react';
import { 
  Smartphone, Cpu, Box, Search, Filter, 
  Plus, Tag, DollarSign, Layers, Image as ImageIcon, 
  AlertCircle, ChevronRight, Edit3, Trash2, 
  Package, CheckCircle2, MoreVertical, Briefcase,
  Activity, ArrowUpRight, BarChart3, Rocket,
  Download, ExternalLink, ShieldCheck, Zap
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import api from '../../../services/api';
import '../AdminForms.css';

const ProductsManager = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get('search') || '';

  const [productType, setProductType] = useState('parts');
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [baseRetailPrice, setBaseRetailPrice] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [badge, setBadge] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  
  // Product-type specific fields
  const [imei, setImei] = useState('');
  const [grade, setGrade] = useState('Grade A');
  const [batteryHealth, setBatteryHealth] = useState('');
  const [moq, setMoq] = useState('1');
  const [qualityType, setQualityType] = useState('Premium Aftermarket');
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data.success ? (data.data || []) : (Array.isArray(data) ? data : []));
    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategories([]);
    }
  };

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const { data } = await api.get('/products');
      if (data && data.success) {
        setProducts(Array.isArray(data.data) ? data.data : []);
      } else {
        setProducts(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const deleteProduct = async (id) => {
    if (window.confirm('Decommission this SKU from active inventory?')) {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts();
      } catch (err) {
        console.error('Error deleting product:', err);
      }
    }
  };

  const openEditModal = (product) => {
    if (!product) return;
    setEditingId(product._id);
    setProductType(product.productType || 'parts');
    setName(product.name || '');
    setSku(product.sku || '');
    setBaseRetailPrice(product.baseRetailPrice || '');
    setSelectedCategory(product.category?._id || '');
    setBadge(product.badge || '');
    setImageUrl(product.imageUrl || '');
    
    if (product.productType === 'preowned') {
      setImei(product.preOwnedDetails?.imei || '');
      setGrade(product.preOwnedDetails?.grade || 'Grade A');
      setBatteryHealth(product.preOwnedDetails?.batteryHealth || '');
    } else if (product.productType === 'components') {
      setMoq(product.componentDetails?.minimumOrderQuantity || '1');
    } else if (product.productType === 'parts') {
      setQualityType(product.partDetails?.qualityType || 'Premium Aftermarket');
    }
    
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingId(null);
    resetForm();
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
      setImageUrl(data.image);
    } catch (error) {
      console.error(error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMsg('Synchronizing catalog...');
    
    try {
      const payload = {
        name, sku,
        baseRetailPrice: parseFloat(baseRetailPrice) || 0,
        category: selectedCategory, 
        productType, imageUrl, badge
      };

      if (productType === 'preowned') {
        payload.preOwnedDetails = { imei, grade, batteryHealth: parseInt(batteryHealth) || 0 };
      } else if (productType === 'components') {
        payload.componentDetails = { minimumOrderQuantity: parseInt(moq) || 1 };
      } else if (productType === 'parts') {
        payload.partDetails = { qualityType };
      }

      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        setIsEditModalOpen(false);
        setEditingId(null);
      } else {
        await api.post('/products', payload);
      }

      resetForm();
      fetchProducts();
      setStatusMsg('Inventory state updated!');
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setStatusMsg('Protocol failure. Check logs.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setName(''); setSku(''); setBaseRetailPrice('');
    setImei(''); setBatteryHealth(''); setImageUrl('');
    setSelectedCategory(''); setBadge('');
    setProductType('parts');
    setGrade('Grade A');
    setMoq('1');
    setQualityType('Premium Aftermarket');
  };

  const filteredProducts = Array.isArray(products) ? products.filter(p => 
    p && ((p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.sku || '').toLowerCase().includes(searchTerm.toLowerCase()))
  ) : [];

  const stats = {
    total: products.length,
    categories: categories.length,
    preowned: products.filter(p => p && p.productType === 'preowned').length,
    parts: products.filter(p => p && p.productType === 'parts').length
  };

  return (
    <div className="catalog-orchestrator animate-fade">
      {/* Editorial Header */}
      <div className="editorial-header-premium">
        <div className="header-meta">
          <span className="badge-glow">Catalog Intelligence</span>
          <h1>Inventory Ledger</h1>
          <p>Orchestrate global inventory, manage polymorphic specifications, and optimize B2B valuations.</p>
        </div>

        <div className="glass-stats">
          <div className="stat-item">
            <div className="stat-label">Total SKUs</div>
            <div className="stat-val-group">
              <span className="val">{stats.total}</span>
              <Activity size={16} className="trend-icon" />
            </div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-label">Pre-Owned</div>
            <div className="stat-val-group">
              <span className="val indigo">{stats.preowned}</span>
            </div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-label">Parts & IC</div>
            <div className="stat-val-group">
              <span className="val emerald">{stats.parts}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="layout-grid">
        {/* Creation Panel */}
        <div className="composition-panel">
          <div className="panel-header">
            <Rocket size={20} />
            <h3>SKU Definition</h3>
          </div>
          
          <form onSubmit={handleSubmit} className="premium-form">
            <div className="form-section">
              <label>Structural Position</label>
              <div className="form-stack">
                <select value={productType} onChange={(e) => setProductType(e.target.value)}>
                  <option value="parts">Repair Parts</option>
                  <option value="preowned">Pre-Owned Device</option>
                  <option value="components">IC Components</option>
                </select>
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} required>
                  <option value="">Category...</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div className="form-section">
              <label>Core Identity</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Full Product Designation" required />
              <div className="form-stack mt-3">
                <input type="text" value={sku} onChange={e => setSku(e.target.value)} placeholder="System SKU" required />
                <div className="input-with-icon">
                  <DollarSign size={14} />
                  <input type="number" step="0.01" value={baseRetailPrice} onChange={e => setBaseRetailPrice(e.target.value)} placeholder="Unit Valuation" required />
                </div>
              </div>
            </div>

            <div className="form-section">
              <label>Asset Management</label>
              <div className="file-box-custom">
                <input type="file" onChange={uploadFileHandler} />
                <div className="meta">
                  {uploading ? "Transmitting..." : (imageUrl ? "Verified ✓" : "Upload High-Res Asset")}
                </div>
              </div>
            </div>

            {productType === 'preowned' && (
              <div className="form-section dynamic-fade">
                <label>Engineering Spec</label>
                <div className="form-stack">
                  <input type="text" value={imei} onChange={e => setImei(e.target.value)} placeholder="IMEI / Serial" required />
                  <input type="number" value={batteryHealth} onChange={e => setBatteryHealth(e.target.value)} placeholder="Health %" required />
                </div>
                <select value={grade} onChange={e => setGrade(e.target.value)} style={{ marginTop: '12px' }}>
                  <option value="Grade A">Grade A (Pristine)</option>
                  <option value="Grade B">Grade B (Standard)</option>
                  <option value="Grade C">Grade C (Refurbished)</option>
                </select>
              </div>
            )}

            <div className="form-actions">
              <button type="submit" className="publish-btn" disabled={submitting}>
                <CheckCircle2 size={18} /> {submitting ? 'Transmitting...' : editingId ? 'Update Catalog' : 'Publish to Ledger'}
              </button>
              {statusMsg && <div className="status-toast">{statusMsg}</div>}
            </div>
          </form>
        </div>

        {/* Inventory Queue */}
        <div className="inventory-ledger">
          <div className="ledger-header">
            <div className="header-left">
              <div className="active-nodes">
                <Activity size={14} />
                <span>{filteredProducts.length} Active Records</span>
              </div>
            </div>
            <div className="search-pill">
              <Search size={16} />
              <input 
                type="text" 
                placeholder="Search inventory ledger..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="table-container">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th style={{ width: '45%' }}>PRODUCT IDENTITY</th>
                  <th style={{ width: '25%' }}>IDENTIFIER</th>
                  <th style={{ width: '15%' }}>VALUATION</th>
                  <th style={{ textAlign: 'right', width: '15%' }}>ENGAGE</th>
                </tr>
              </thead>
              <tbody>
                {loadingProducts ? (
                  <tr><td colSpan="4" className="loading-state">Syncing Inventory Ledger...</td></tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="empty-state-row">
                      <div className="empty-state-content">
                        <Package size={64} />
                        <p>No records found in current segment.</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredProducts.map(product => (
                  <tr key={product._id} className="ledger-row">
                    <td>
                      <div className="product-cell">
                        <div className="prod-img">
                          {product.imageUrl ? <img src={product.imageUrl} alt="" /> : <ImageIcon size={20} />}
                        </div>
                        <div className="meta-stack">
                          <span className="n">{product.name || 'Untitled Product'}</span>
                          <span className="cat-pill">{product.category?.name || 'Unmapped'}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="sku-cell">
                        <span className="sku">{product.sku || 'N/A'}</span>
                        <span className={`status-pill ${product.productType || 'parts'}`}>{product.productType || 'Standard'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="price-tag">${(product.baseRetailPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="row-actions">
                        <button className="icon-btn edit" onClick={() => openEditModal(product)} title="Edit Resource"><Edit3 size={16} /></button>
                        <button className="icon-btn delete" onClick={() => deleteProduct(product._id)} title="Decommission"><Trash2 size={16} /></button>
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
              <div className="id-tag">SKU: {sku}</div>
              <button className="close-btn" onClick={closeEditModal}>&times;</button>
              <h3>Resource Overrides</h3>
            </div>
            <div className="inspector-body">
              <form onSubmit={handleSubmit} className="premium-form">
                <div className="inspector-section">
                  <label>Structural Position</label>
                  <div className="form-stack">
                    <select value={productType} onChange={(e) => setProductType(e.target.value)}>
                      <option value="parts">Repair Parts</option>
                      <option value="preowned">Pre-Owned Device</option>
                      <option value="components">IC Components</option>
                    </select>
                    <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} required>
                      <option value="">Category...</option>
                      {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="inspector-section">
                  <label>Identity Transformation</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Full Product Designation" required />
                  <div className="form-stack mt-3">
                    <input type="text" value={sku} onChange={e => setSku(e.target.value)} placeholder="System SKU" required />
                    <div className="input-with-icon">
                      <DollarSign size={14} />
                      <input type="number" step="0.01" value={baseRetailPrice} onChange={e => setBaseRetailPrice(e.target.value)} placeholder="Unit Valuation" required />
                    </div>
                    <select value={badge} onChange={e => setBadge(e.target.value)}>
                      <option value="">No Status Badge</option>
                      <option value="New Arrival">New Arrival</option>
                      <option value="Hot Seller">Hot Seller</option>
                      <option value="Certified">Certified</option>
                    </select>
                  </div>
                </div>

                <div className="inspector-section">
                  <label>Asset Management</label>
                  <div className="file-box-custom">
                    <input type="file" onChange={uploadFileHandler} />
                    <div className="meta">
                      {uploading ? "Transmitting..." : (imageUrl ? "Verified ✓" : "Upload High-Res Asset")}
                    </div>
                  </div>
                </div>

                {productType === 'preowned' && (
                  <div className="inspector-section dynamic-fade">
                    <label>Engineering Spec</label>
                    <div className="form-stack">
                      <input type="text" value={imei} onChange={e => setImei(e.target.value)} placeholder="IMEI / Serial" required />
                      <input type="number" value={batteryHealth} onChange={e => setBatteryHealth(e.target.value)} placeholder="Health %" required />
                    </div>
                    <select value={grade} onChange={e => setGrade(e.target.value)} style={{ marginTop: '12px' }}>
                      <option value="Grade A">Grade A (Pristine)</option>
                      <option value="Grade B">Grade B (Standard)</option>
                      <option value="Grade C">Grade C (Refurbished)</option>
                    </select>
                  </div>
                )}

                <div className="modal-footer-custom">
                  <button type="submit" className="save-btn" disabled={submitting}>
                    {submitting ? 'Propagating...' : 'Commit Changes'}
                  </button>
                  <button type="button" className="cancel-btn" onClick={closeEditModal}>Discard</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .catalog-orchestrator { padding: 40px; background: #f8fafc; min-height: 100vh; font-family: 'Inter', sans-serif; overflow-x: hidden; }
        
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
        
        .composition-panel { background: white; border-radius: 32px; border: 1px solid #e2e8f0; padding: 35px; box-shadow: 0 20px 50px -12px rgba(0,0,0,0.04); position: sticky; top: 120px; }
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
        .publish-btn:disabled { opacity: 0.7; cursor: wait; }

        .inventory-ledger { background: white; border-radius: 32px; border: 1px solid #e2e8f0; box-shadow: 0 20px 50px -12px rgba(0,0,0,0.04); overflow: hidden; display: flex; flex-direction: column; min-width: 0; }
        .ledger-header { padding: 30px 40px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; background: #fafafa; flex-wrap: wrap; gap: 20px; }
        .active-nodes { display: flex; align-items: center; gap: 8px; color: #64748b; font-size: 13px; font-weight: 600; }
        .active-nodes svg { color: #3b82f6; }
        .search-pill { background: white; border: 1px solid #cbd5e1; padding: 10px 18px; border-radius: 14px; display: flex; align-items: center; gap: 12px; width: 340px; transition: all 0.2s; }
        .search-pill:focus-within { border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.05); }
        .search-pill input { border: none; outline: none; font-size: 13px; width: 100%; font-weight: 600; background: transparent; }

        .table-container { width: 100%; overflow-x: auto; }
        .inventory-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
        .inventory-table th { padding: 20px 40px; text-align: left; font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; background: #fcfcfc; white-space: nowrap; }
        .ledger-row { border-bottom: 1px solid #f1f5f9; transition: all 0.2s; }
        .ledger-row:hover { background: #f8fafc; }
        .ledger-row td { padding: 25px 40px; vertical-align: middle; }
        
        .product-cell { display: flex; align-items: center; gap: 15px; }
        .prod-img { width: 52px; height: 52px; border-radius: 14px; background: #f1f5f9; overflow: hidden; display: flex; align-items: center; justify-content: center; color: #94a3b8; border: 1px solid #e2e8f0; flex-shrink: 0; }
        .prod-img img { width: 100%; height: 100%; object-fit: cover; }
        .meta-stack { display: flex; flex-direction: column; white-space: normal; min-width: 0; }
        .meta-stack .n { font-weight: 700; color: #1e293b; font-size: 14px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .cat-pill { font-size: 9px; font-weight: 800; color: #6366f1; background: #eef2ff; padding: 2px 8px; border-radius: 4px; margin-top: 4px; width: fit-content; text-transform: uppercase; }
        
        .sku-cell { white-space: nowrap; }
        .sku-cell .sku { display: block; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; color: #64748b; }
        .status-pill { display: inline-flex; align-items: center; gap: 8px; padding: 3px 10px; border-radius: 6px; font-size: 9px; font-weight: 800; text-transform: uppercase; margin-top: 4px; }
        .status-pill.preowned { background: #fff7ed; color: #c2410c; }
        .status-pill.parts { background: #ecfdf5; color: #059669; }
        
        .price-tag { font-weight: 800; font-size: 16px; color: #0f172a; white-space: nowrap; }
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
        .mt-3 { margin-top: 15px; }
        
        .input-with-icon { position: relative; display: flex; align-items: center; }
        .input-with-icon svg { position: absolute; left: 15px; color: #94a3b8; }
        .input-with-icon input { padding-left: 40px !important; }

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
          .catalog-orchestrator { padding: 20px; }
          .glass-stats { flex-direction: column; gap: 15px; width: 100%; padding: 20px; }
          .stat-divider { width: 100%; height: 1px; }
          .ledger-header { flex-direction: column; align-items: flex-start; gap: 15px; }
          .search-pill { width: 100%; }
          .side-modal { width: 100%; }
          .form-stack { flex-direction: column; }
          .input-with-icon { width: 100%; }
        }
      `}} />
    </div>
  );
};

export default ProductsManager;
