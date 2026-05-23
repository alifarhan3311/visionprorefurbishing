import React, { useState, useEffect } from 'react';
import { 
  Smartphone, Cpu, Box, Search, Filter, 
  Plus, Tag, DollarSign, Layers, Image as ImageIcon, 
  AlertCircle, ChevronRight, Edit3, Trash2, 
  Package, CheckCircle2, MoreVertical, Briefcase,
  Activity, ArrowUpRight, BarChart3, Rocket,
  Download, ExternalLink, ShieldCheck, Zap, Copy
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import api, { getImageUrl } from '../../../services/api';
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
  const [stockQuantity, setStockQuantity] = useState('10');
  const [categoryMode, setCategoryMode] = useState('tier4');

  useEffect(() => {
    const qParams = new URLSearchParams(location.search);
    const searchVal = qParams.get('search') || '';
    setSearchTerm(searchVal);
  }, [location.search]);
  
  // Product-type specific fields
  const [imei, setImei] = useState('');
  const [grade, setGrade] = useState('Grade A');
  const [batteryHealth, setBatteryHealth] = useState('');
  const [moq, setMoq] = useState('1');
  const [qualityType, setQualityType] = useState('Premium Aftermarket');
  const [warrantyPeriod, setWarrantyPeriod] = useState('');
  const [compatibilityText, setCompatibilityText] = useState('');
  // Bulk pricing tiers: [{minQty, discountPercent}]
  const [bulkTiers, setBulkTiers] = useState([{ minQty: '', discountPercent: '' }, { minQty: '', discountPercent: '' }]);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 4-image gallery slots: [{file, preview}]
  const [imageSlots, setImageSlots] = useState([
    { file: null, existing: '' },
    { file: null, existing: '' },
    { file: null, existing: '' },
    { file: null, existing: '' },
  ]);
  
  // Features Multi-line State
  const [featuresText, setFeaturesText] = useState('');

  // Form tab navigation: 'basic' | 'specs' | 'media'
  const [activeFormTab, setActiveFormTab] = useState('basic');

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

  const generateAutoSKU = () => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const prefix = productType === 'preowned' ? 'VPL-DEV' : productType === 'components' ? 'VPL-IC' : 'VPL-PRT';
    setSku(`${prefix}-${randomNum}`);
  };

  const handleDuplicateProduct = (product) => {
    if (!product) return;
    // Load into state
    setProductType(product.productType || 'parts');
    setName(`${product.name} (Copy)`);
    // Generate a fresh SKU automatically to avoid validation constraints
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const prefix = (product.productType || 'parts') === 'preowned' ? 'VPL-DEV' : (product.productType || 'parts') === 'components' ? 'VPL-IC' : 'VPL-PRT';
    setSku(`${prefix}-${randomNum}-DUP`);
    
    setBaseRetailPrice(product.baseRetailPrice || '');
    setSelectedCategory(product.category?._id || product.category || '');
    setBadge(product.badge || '');
    setImageUrl(product.imageUrl || '');
    setStockQuantity((product.stockQuantity || 10).toString());
    setFeaturesText(product.features ? product.features.join('\n') : '');
    setWarrantyPeriod(product.warrantyPeriod || '');
    setCompatibilityText(product.compatibility ? product.compatibility.join('\n') : '');
    setCategoryMode(product.category?.tierLevel === 3 ? 'tier3' : 'tier4');

    if (product.productType === 'preowned') {
      setImei(product.preOwnedDetails?.imei || '');
      setGrade(product.preOwnedDetails?.grade || 'Grade A');
      setBatteryHealth(product.preOwnedDetails?.batteryHealth || '');
    } else if (product.productType === 'components') {
      setMoq(product.componentDetails?.minimumOrderQuantity || '1');
    } else if (product.productType === 'parts') {
      setQualityType(product.partDetails?.qualityType || 'Premium Aftermarket');
    }
    
    // Bulk pricing tiers
    if (product.bulkPricingTiers && product.bulkPricingTiers.length > 0) {
      setBulkTiers(product.bulkPricingTiers.map(t => ({ minQty: t.minQty, discountPercent: t.discountPercent })));
    } else {
      setBulkTiers([{ minQty: '', discountPercent: '' }, { minQty: '', discountPercent: '' }]);
    }

    // Set to new mode (null editingId)
    setEditingId(null);
    setStatusMsg('Product duplicated! Please review & publish.');
    setActiveFormTab('basic');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setStatusMsg(''), 5000);
  };

  const openEditModal = (product) => {
    if (!product) return;
    setEditingId(product._id);
    setProductType(product.productType || 'parts');
    setName(product.name || '');
    setSku(product.sku || '');
    setBaseRetailPrice(product.baseRetailPrice || '');
    setSelectedCategory(product.category?._id || product.category || '');
    setBadge(product.badge || '');
    setImageUrl(product.imageUrl || '');
    setStockQuantity((product.stockQuantity || 10).toString());
    setFeaturesText(product.features ? product.features.join('\n') : '');
    setWarrantyPeriod(product.warrantyPeriod || '');
    setCompatibilityText(product.compatibility ? product.compatibility.join('\n') : '');
    setCategoryMode(product.category?.tierLevel === 3 ? 'tier3' : 'tier4');

    // Populate image slots from existing images array
    const existingImgs = product.images && product.images.length > 0
      ? product.images
      : product.imageUrl ? [product.imageUrl] : [];
    setImageSlots([0,1,2,3].map(i => ({ file: null, existing: existingImgs[i] || '' })));
    
    if (product.productType === 'preowned') {
      setImei(product.preOwnedDetails?.imei || '');
      setGrade(product.preOwnedDetails?.grade || 'Grade A');
      setBatteryHealth(product.preOwnedDetails?.batteryHealth || '');
    } else if (product.productType === 'components') {
      setMoq(product.componentDetails?.minimumOrderQuantity || '1');
    } else if (product.productType === 'parts') {
      setQualityType(product.partDetails?.qualityType || 'Premium Aftermarket');
    }

    // Populate bulk pricing tiers
    if (product.bulkPricingTiers && product.bulkPricingTiers.length > 0) {
      setBulkTiers(product.bulkPricingTiers.map(t => ({ minQty: t.minQty, discountPercent: t.discountPercent })));
    } else {
      setBulkTiers([{ minQty: '', discountPercent: '' }, { minQty: '', discountPercent: '' }]);
    }
    
    setIsEditModalOpen(true);
    setActiveFormTab('basic');
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingId(null);
    resetForm();
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) setImageUrl(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMsg('Synchronizing catalog...');
    
    try {
      const parsedFeatures = featuresText
        .split('\n')
        .map(f => f.trim())
        .filter(Boolean);

      const formData = new FormData();
      formData.append('name', name);
      formData.append('sku', sku);
      formData.append('baseRetailPrice', parseFloat(baseRetailPrice) || 0);
      formData.append('category', selectedCategory);
      formData.append('productType', productType);
      formData.append('badge', badge);
      formData.append('stockQuantity', parseInt(stockQuantity) || 10);
      formData.append('imageUrl', imageUrl);
      formData.append('warrantyPeriod', warrantyPeriod || '');
      // Compatibility — one entry per line
      const parsedCompatibility = compatibilityText
        .split('\n')
        .map(c => c.trim())
        .filter(Boolean);
      parsedCompatibility.forEach(c => formData.append('compatibility', c));
      if (currentCategoryObj?.tierLevel === 3) {
        formData.append('isSubTier', 'false');
      }

      // Append 4 image slots (image0..image3 — matches multer fields config)
      imageSlots.forEach((slot, i) => {
        if (slot.file) {
          formData.append(`image${i}`, slot.file);
        } else if (slot.existing) {
          formData.append(`existingImage${i}`, slot.existing);
        }
      });

      parsedFeatures.forEach((f) => {
        formData.append('features', f);
      });

      // Bulk pricing tiers — send as bulkTier_minQty_0, bulkTier_discount_0, etc.
      bulkTiers.forEach((tier, i) => {
        const qty = parseInt(tier.minQty);
        const disc = parseFloat(tier.discountPercent);
        if (!isNaN(qty) && qty > 0 && !isNaN(disc) && disc >= 0) {
          formData.append(`bulkTier_minQty_${i}`, qty);
          formData.append(`bulkTier_discount_${i}`, disc);
        }
      });

      if (productType === 'preowned') {
        formData.append('imei', imei);
        formData.append('grade', grade);
        formData.append('batteryHealth', parseInt(batteryHealth) || 0);
      } else if (productType === 'components') {
        formData.append('minimumOrderQuantity', parseInt(moq) || 1);
      } else if (productType === 'parts') {
        formData.append('qualityType', qualityType);
      }

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };

      if (editingId) {
        await api.put(`/products/${editingId}`, formData, config);
        setIsEditModalOpen(false);
        setEditingId(null);
      } else {
        await api.post('/products', formData, config);
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
    setName(''); 
    setSku(''); 
    setBaseRetailPrice('');
    setImei(''); 
    setBatteryHealth(''); 
    setImageUrl('');
    setImageSlots([
      { file: null, existing: '' },
      { file: null, existing: '' },
      { file: null, existing: '' },
      { file: null, existing: '' },
    ]);
    setSelectedCategory(''); 
    setBadge('');
    setProductType('parts');
    setGrade('Grade A');
    setMoq('1');
    setQualityType('Premium Aftermarket');
    setFeaturesText('');
    setWarrantyPeriod('');
    setCompatibilityText('');
    setStockQuantity('10');
    setCategoryMode('tier4');
    setActiveFormTab('basic');
    setBulkTiers([{ minQty: '', discountPercent: '' }, { minQty: '', discountPercent: '' }]);
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

  // Warning Checks for categories
  const currentCategoryObj = categories.find(c => c._id === selectedCategory);
  const isLegacyCategory = currentCategoryObj && currentCategoryObj.tierLevel !== 3 && currentCategoryObj.tierLevel !== 4;
  const tier4Categories = categories.filter(c => c.tierLevel === 4);
  const tier3Categories = categories.filter(c => c.tierLevel === 3);

  const handleCategorySelect = (value) => {
    setSelectedCategory(value);
    const category = categories.find(c => c._id === value);
    setCategoryMode(category?.tierLevel === 3 ? 'tier3' : 'tier4');
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
        {/* Creation Panel with Tabbed Interface */}
        <div className="composition-panel">
          <div className="panel-header">
            <Rocket size={20} />
            <h3>SKU Creator</h3>
          </div>

          {/* Form Tabs Navigation */}
          <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '24px', gap: '8px' }}>
            <button 
              type="button"
              onClick={() => setActiveFormTab('basic')}
              style={{
                flex: 1,
                padding: '12px 6px',
                border: 'none',
                borderBottom: activeFormTab === 'basic' ? '3px solid #3b82f6' : '3px solid transparent',
                background: 'transparent',
                fontWeight: '700',
                fontSize: '13px',
                color: activeFormTab === 'basic' ? '#0f172a' : '#94a3b8',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              1. Basic Info
            </button>
            <button 
              type="button"
              onClick={() => setActiveFormTab('specs')}
              style={{
                flex: 1,
                padding: '12px 6px',
                border: 'none',
                borderBottom: activeFormTab === 'specs' ? '3px solid #3b82f6' : '3px solid transparent',
                background: 'transparent',
                fontWeight: '700',
                fontSize: '13px',
                color: activeFormTab === 'specs' ? '#0f172a' : '#94a3b8',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              2. Specifications
            </button>
            <button 
              type="button"
              onClick={() => setActiveFormTab('media')}
              style={{
                flex: 1,
                padding: '12px 6px',
                border: 'none',
                borderBottom: activeFormTab === 'media' ? '3px solid #3b82f6' : '3px solid transparent',
                background: 'transparent',
                fontWeight: '700',
                fontSize: '13px',
                color: activeFormTab === 'media' ? '#0f172a' : '#94a3b8',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              3. Assets
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="premium-form">
            {/* TAB 1: Basic info */}
            {activeFormTab === 'basic' && (
              <div className="dynamic-fade">
                <div className="form-section">
                  <label>Structural Position</label>
                  <div className="form-stack">
                    <div className="form-grid-toggle" style={{ display: 'flex', gap: '8px', width: '100%', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className={`toggle-btn ${categoryMode === 'tier4' ? 'active' : ''}`}
                        onClick={() => {
                          setCategoryMode('tier4');
                          if (currentCategoryObj?.tierLevel !== 4) setSelectedCategory('');
                        }}
                        style={{ flex: 1, minWidth: '140px' }}
                      >
                        Tier 4 SKU Model
                      </button>
                      <button
                        type="button"
                        className={`toggle-btn ${categoryMode === 'tier3' ? 'active' : ''}`}
                        onClick={() => {
                          setCategoryMode('tier3');
                          if (currentCategoryObj?.tierLevel !== 3) setSelectedCategory('');
                        }}
                        style={{ flex: 1, minWidth: '140px' }}
                      >
                        Tier 3 Direct Product
                      </button>
                    </div>

                    <select value={selectedCategory} onChange={(e) => handleCategorySelect(e.target.value)} required>
                      <option value="">{categoryMode === 'tier4' ? 'Select Tier 4 SKU Model...' : 'Select Tier 3 Direct Category...'}</option>
                      {isLegacyCategory && currentCategoryObj && (
                        <option value={currentCategoryObj._id}>
                          {currentCategoryObj.name} (Tier {currentCategoryObj.tierLevel} - Legacy)
                        </option>
                      )}
                      {categoryMode === 'tier4' && tier4Categories.length > 0 && (
                        <optgroup label="Tier 4 SKU Models">
                          {tier4Categories.map(c => (
                            <option key={c._id} value={c._id}>{c.name}</option>
                          ))}
                        </optgroup>
                      )}
                      {categoryMode === 'tier3' && tier3Categories.length > 0 && (
                        <optgroup label="Tier 3 Direct Product Categories">
                          {tier3Categories.map(c => (
                            <option key={c._id} value={c._id}>{c.name}</option>
                          ))}
                        </optgroup>
                      )}
                    </select>

                    {isLegacyCategory && (
                      <div style={{ color: '#d97706', fontSize: '11px', fontWeight: '700', marginTop: '4px', background: '#fffbeb', padding: '8px 12px', borderRadius: '8px', border: '1px solid #fef3c7' }}>
                        ⚠️ Legacy category map detected ({currentCategoryObj.name} - Tier {currentCategoryObj.tierLevel}). Please remap to a Tier 4 SKU Model.
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-section">
                  <label>Core Identity</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Full Product Name" required style={{ marginBottom: '12px' }} />
                  
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <input type="text" value={sku} onChange={e => setSku(e.target.value)} placeholder="System SKU ID" required />
                    <button 
                      type="button" 
                      onClick={generateAutoSKU}
                      className="publish-btn"
                      style={{ margin: 0, padding: '10px 14px', width: 'auto', background: '#3b82f6', borderRadius: '12px', fontSize: '12px' }}
                    >
                      Auto
                    </button>
                  </div>

                  <div className="form-stack">
                    <div className="input-with-icon">
                      <DollarSign size={14} />
                      <input type="number" step="0.01" value={baseRetailPrice} onChange={e => setBaseRetailPrice(e.target.value)} placeholder="Price ($ CAD)" required />
                    </div>
                    <input type="number" value={stockQuantity} onChange={e => setStockQuantity(e.target.value)} placeholder="Available Stock Count" required />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: specs */}
            {activeFormTab === 'specs' && (
              <div className="dynamic-fade">
                {productType === 'preowned' && (
                  <div className="form-section">
                    <label>Engineering Spec</label>
                    <div className="form-stack">
                      <input type="text" value={imei} onChange={e => setImei(e.target.value)} placeholder="IMEI / Serial Number" required />
                      <input type="number" value={batteryHealth} onChange={e => setBatteryHealth(e.target.value)} placeholder="Battery Health %" required />
                    </div>
                    <select value={grade} onChange={e => setGrade(e.target.value)} style={{ marginTop: '12px' }}>
                      <option value="Grade A">Grade A (Pristine)</option>
                      <option value="Grade B">Grade B (Standard)</option>
                      <option value="Grade C">Grade C (Refurbished)</option>
                    </select>
                  </div>
                )}

                {productType === 'components' && (
                  <div className="form-section">
                    <label>Component MOQ</label>
                    <input type="number" value={moq} onChange={e => setMoq(e.target.value)} placeholder="Minimum Order Quantity" required />
                  </div>
                )}

                {productType === 'parts' && (
                  <div className="form-section">
                    <label>Part Quality Category</label>
                    <select value={qualityType} onChange={e => setQualityType(e.target.value)}>
                      <option value="Premium Aftermarket">Premium Aftermarket</option>
                      <option value="OEM Refurbished">OEM Refurbished</option>
                      <option value="Original Pulled">Original Pulled</option>
                    </select>
                  </div>
                )}

                <div className="form-section">
                  <label>Bullets / Highlights (One per line)</label>
                  <textarea 
                    value={featuresText} 
                    onChange={e => setFeaturesText(e.target.value)} 
                    placeholder="Enter highlights/specifications...&#10;Premium Grade Screen&#10;12-Month Warranty&#10;Zero Pixels Defect"
                    rows="5"
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0',
                      background: 'var(--bg-elevated)',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#0f172a',
                      fontFamily: 'inherit',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div className="form-section">
                  <label>Warranty Period</label>
                  <select value={warrantyPeriod} onChange={e => setWarrantyPeriod(e.target.value)}>
                    <option value="">No Warranty</option>
                    <option value="30 Days">30 Days</option>
                    <option value="90 Days">90 Days</option>
                    <option value="6 Months">6 Months</option>
                    <option value="1 Year">1 Year</option>
                    <option value="Lifetime">Lifetime</option>
                  </select>
                </div>

                <div className="form-section">
                  <label>Compatible Models (One per line)</label>
                  <textarea
                    value={compatibilityText}
                    onChange={e => setCompatibilityText(e.target.value)}
                    placeholder="iPhone 14 Pro&#10;iPhone 14 Pro Max&#10;iPhone 13 Pro"
                    rows="5"
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0',
                      background: 'var(--bg-elevated)',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#0f172a',
                      fontFamily: 'inherit',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                  />
                </div>

                {/* Bulk Order Pricing Tiers */}
                <div className="form-section">
                  <label>Bulk Order Pricing</label>
                  <p style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', margin: '0 0 14px 0' }}>
                    Set quantity thresholds — customers ordering at or above that qty get the discount automatically.
                  </p>
                  {bulkTiers.map((tier, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <input
                          type="number"
                          min="1"
                          value={tier.minQty}
                          onChange={e => {
                            const updated = [...bulkTiers];
                            updated[i] = { ...updated[i], minQty: e.target.value };
                            setBulkTiers(updated);
                          }}
                          placeholder={`Min Qty (e.g. ${i === 0 ? 10 : 50})`}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.5"
                          value={tier.discountPercent}
                          onChange={e => {
                            const updated = [...bulkTiers];
                            updated[i] = { ...updated[i], discountPercent: e.target.value };
                            setBulkTiers(updated);
                          }}
                          placeholder="Discount %"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setBulkTiers(bulkTiers.filter((_, idx) => idx !== i))}
                        style={{ background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '10px', padding: '10px 14px', fontWeight: '800', cursor: 'pointer', fontSize: '16px', lineHeight: 1 }}
                        title="Remove tier"
                      >×</button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setBulkTiers([...bulkTiers, { minQty: '', discountPercent: '' }])}
                    style={{ background: '#eff6ff', color: '#3b82f6', border: '1px dashed #93c5fd', borderRadius: '12px', padding: '10px 18px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', width: '100%', marginTop: '4px' }}
                  >
                    + Add Tier
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: media */}
            {activeFormTab === 'media' && (
              <div className="dynamic-fade">
                <div className="form-section">
                  <label>Product Images (up to 4)</label>
                  <div className="image-slots-grid">
                    {imageSlots.map((slot, i) => {
                      const preview = slot.file
                        ? URL.createObjectURL(slot.file)
                        : slot.existing ? getImageUrl(slot.existing) : null;
                      return (
                        <div key={i} className={`image-slot ${preview ? 'has-image' : ''} ${i === 0 ? 'primary-slot' : ''}`}>
                          <input
                            type="file"
                            accept="image/*"
                            id={`add-img-slot-${i}`}
                            style={{ display: 'none' }}
                            onChange={e => {
                              if (e.target.files[0]) {
                                const updated = [...imageSlots];
                                updated[i] = { file: e.target.files[0], existing: slot.existing };
                                setImageSlots(updated);
                                if (i === 0) setImageUrl('');
                              }
                            }}
                          />
                          {preview ? (
                            <div className="slot-filled">
                              <img src={preview} alt={`slot-${i}`} className="slot-preview-img" />
                              <div className="slot-overlay">
                                <label htmlFor={`add-img-slot-${i}`} className="slot-action-btn replace-btn" style={{ cursor: 'pointer' }}>Replace</label>
                                <button
                                  type="button"
                                  className="slot-action-btn remove-btn"
                                  onClick={() => {
                                    const updated = [...imageSlots];
                                    updated[i] = { file: null, existing: '' };
                                    setImageSlots(updated);
                                    if (i === 0) setImageUrl('');
                                  }}
                                >Remove</button>
                              </div>
                              {i === 0 && <span className="slot-primary-badge">⭐ Primary</span>}
                            </div>
                          ) : (
                            <label htmlFor={`add-img-slot-${i}`} className="slot-empty-state" style={{ cursor: 'pointer' }}>
                              <div className="slot-upload-icon">
                                <ImageIcon size={26} color="#3b82f6" />
                              </div>
                              <span className="slot-label">{i === 0 ? 'Main Image' : `Image ${i + 1}`}</span>
                              <span className="slot-hint">Click to upload</span>
                            </label>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '12px', fontWeight: '600' }}>
                    Slot 1 = primary listing image. Max 10MB per image. JPG, PNG, WEBP supported.
                  </p>
                </div>

                <div className="form-section">
                  <label>Status Badge</label>
                  <select value={badge} onChange={e => setBadge(e.target.value)}>
                    <option value="">No Special Badge</option>
                    <option value="New Arrival">New Arrival</option>
                    <option value="Hot Seller">Hot Seller</option>
                    <option value="Genuine">Genuine Brand</option>
                    <option value="Limited Stock">Limited Stock</option>
                  </select>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', gap: '10px' }}>
              {activeFormTab !== 'basic' && (
                <button 
                  type="button" 
                  onClick={() => setActiveFormTab(activeFormTab === 'media' ? 'specs' : 'basic')}
                  className="cancel-btn"
                  style={{ flex: '1', padding: '14px' }}
                >
                  Previous
                </button>
              )}
              
              {activeFormTab !== 'media' ? (
                <button 
                  type="button" 
                  onClick={() => setActiveFormTab(activeFormTab === 'basic' ? 'specs' : 'media')}
                  className="publish-btn"
                  style={{ flex: '1', margin: 0, padding: '14px', background: '#3b82f6' }}
                >
                  Next Tab
                </button>
              ) : (
                <button type="submit" className="publish-btn" disabled={submitting} style={{ flex: '1', margin: 0, padding: '14px' }}>
                  <CheckCircle2 size={18} /> {submitting ? 'Transmitting...' : editingId ? 'Update SKU' : 'Publish SKU'}
                </button>
              )}
            </div>

            {statusMsg && <div className="status-toast">{statusMsg}</div>}
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
                  <th>PRODUCT IDENTITY</th>
                  <th>IDENTIFIER</th>
                  <th style={{ whiteSpace: 'nowrap' }}>STOCK</th>
                  <th style={{ whiteSpace: 'nowrap' }}>VALUATION</th>
                  <th style={{ textAlign: 'right', whiteSpace: 'nowrap', width: '120px' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {loadingProducts ? (
                  <tr><td colSpan="5" className="loading-state">Syncing Inventory Ledger...</td></tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-state-row">
                      <div className="empty-state-content">
                        <Package size={64} />
                        <p>No records found in current segment.</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredProducts.map(product => {
                  const prodLegacy = product.category && product.category.tierLevel !== 4;
                  return (
                    <tr key={product._id} className="ledger-row">
                      <td>
                        <div className="product-cell">
                          <div className="prod-img">
                            {product.imageUrl ? <img src={getImageUrl(product.imageUrl)} alt="" /> : <ImageIcon size={20} />}
                          </div>
                          <div className="meta-stack">
                            <span className="n">{product.name || 'Untitled Product'}</span>
                            <span className={`cat-pill ${prodLegacy ? 'legacy-warning' : ''}`} style={{ background: prodLegacy ? '#fffbeb' : '#eef2ff', color: prodLegacy ? '#d97706' : '#6366f1' }}>
                              {product.category?.name || 'Unmapped'} {prodLegacy && ' (Legacy)'}
                            </span>
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
                        <span style={{ fontSize: '13px', fontWeight: '700', color: (product.stockQuantity || 0) < 5 ? '#ef4444' : '#475569' }}>
                          {product.stockQuantity ?? 10} Units
                        </span>
                      </td>
                      <td>
                        <div className="price-tag">${(product.baseRetailPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap', width: '120px' }}>
                        <div className="row-actions">
                          <button className="icon-btn edit" onClick={() => handleDuplicateProduct(product)} title="Duplicate SKU"><Copy size={16} /></button>
                          <button className="icon-btn edit" onClick={() => openEditModal(product)} title="Edit SKU"><Edit3 size={16} /></button>
                          <button className="icon-btn delete" onClick={() => deleteProduct(product._id)} title="Decommission"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Side Inspector Modal */}
      {isEditModalOpen && (
        <div className="inspector-overlay" onClick={closeEditModal}>
          <div className="side-modal" onClick={e => e.stopPropagation()}>
            <div className="inspector-header">
              <div className="id-tag">SKU: {sku}</div>
              <button className="close-btn" onClick={closeEditModal}>&times;</button>
              <h3>Resource Overrides</h3>
            </div>
            
            {/* Edit Modal Form Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', padding: '0 40px', gap: '8px' }}>
              <button 
                type="button"
                onClick={() => setActiveFormTab('basic')}
                style={{
                  flex: 1,
                  padding: '12px 6px',
                  border: 'none',
                  borderBottom: activeFormTab === 'basic' ? '3px solid #3b82f6' : '3px solid transparent',
                  background: 'transparent',
                  fontWeight: '700',
                  fontSize: '13px',
                  color: activeFormTab === 'basic' ? '#0f172a' : '#94a3b8',
                  cursor: 'pointer'
                }}
              >
                Basic
              </button>
              <button 
                type="button"
                onClick={() => setActiveFormTab('specs')}
                style={{
                  flex: 1,
                  padding: '12px 6px',
                  border: 'none',
                  borderBottom: activeFormTab === 'specs' ? '3px solid #3b82f6' : '3px solid transparent',
                  background: 'transparent',
                  fontWeight: '700',
                  fontSize: '13px',
                  color: activeFormTab === 'specs' ? '#0f172a' : '#94a3b8',
                  cursor: 'pointer'
                }}
              >
                Specs & Highlights
              </button>
              <button 
                type="button"
                onClick={() => setActiveFormTab('media')}
                style={{
                  flex: 1,
                  padding: '12px 6px',
                  border: 'none',
                  borderBottom: activeFormTab === 'media' ? '3px solid #3b82f6' : '3px solid transparent',
                  background: 'transparent',
                  fontWeight: '700',
                  fontSize: '13px',
                  color: activeFormTab === 'media' ? '#0f172a' : '#94a3b8',
                  cursor: 'pointer'
                }}
              >
                Assets
              </button>
            </div>

            <div className="inspector-body">
              <form onSubmit={handleSubmit} className="premium-form">
                {/* TAB 1 */}
                {activeFormTab === 'basic' && (
                  <div className="dynamic-fade">
                    <div className="inspector-section">
                      <label>Structural Position</label>
                      <div className="form-stack">
                        <div className="form-grid-toggle" style={{ display: 'flex', gap: '8px', width: '100%', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            className={`toggle-btn ${categoryMode === 'tier4' ? 'active' : ''}`}
                            onClick={() => {
                              setCategoryMode('tier4');
                              if (currentCategoryObj?.tierLevel !== 4) setSelectedCategory('');
                            }}
                            style={{ flex: 1, minWidth: '140px' }}
                          >
                            Tier 4 SKU Model
                          </button>
                          <button
                            type="button"
                            className={`toggle-btn ${categoryMode === 'tier3' ? 'active' : ''}`}
                            onClick={() => {
                              setCategoryMode('tier3');
                              if (currentCategoryObj?.tierLevel !== 3) setSelectedCategory('');
                            }}
                            style={{ flex: 1, minWidth: '140px' }}
                          >
                            Tier 3 Direct Product
                          </button>
                        </div>
                        <select value={selectedCategory} onChange={(e) => handleCategorySelect(e.target.value)} required>
                          <option value="">{categoryMode === 'tier4' ? 'Select Tier 4 SKU Model...' : 'Select Tier 3 Direct Category...'}</option>
                          {isLegacyCategory && currentCategoryObj && (
                            <option value={currentCategoryObj._id}>
                              {currentCategoryObj.name} (Tier {currentCategoryObj.tierLevel} - Legacy)
                            </option>
                          )}
                          {categoryMode === 'tier4' && tier4Categories.length > 0 && (
                            <optgroup label="Tier 4 SKU Models">
                              {tier4Categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </optgroup>
                          )}
                          {categoryMode === 'tier3' && tier3Categories.length > 0 && (
                            <optgroup label="Tier 3 Direct Product Categories">
                              {tier3Categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </optgroup>
                          )}
                        </select>
                        {isLegacyCategory && (
                          <div style={{ color: '#d97706', fontSize: '11px', fontWeight: '700', marginTop: '4px', background: '#fffbeb', padding: '8px 12px', borderRadius: '8px', border: '1px solid #fef3c7' }}>
                            ⚠️ Warning: Legacy category remapping recommended.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="inspector-section">
                      <label>Identity Overrides</label>
                      <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Product Name" required style={{ marginBottom: '12px' }} />
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                        <input type="text" value={sku} onChange={e => setSku(e.target.value)} placeholder="SKU Code" required />
                        <button 
                          type="button" 
                          onClick={generateAutoSKU}
                          className="publish-btn"
                          style={{ margin: 0, padding: '10px 14px', width: 'auto', background: '#3b82f6', borderRadius: '12px', fontSize: '12px' }}
                        >
                          Auto
                        </button>
                      </div>
                      <div className="form-stack">
                        <div className="input-with-icon">
                          <DollarSign size={14} />
                          <input type="number" step="0.01" value={baseRetailPrice} onChange={e => setBaseRetailPrice(e.target.value)} placeholder="Price" required />
                        </div>
                        <input type="number" value={stockQuantity} onChange={e => setStockQuantity(e.target.value)} placeholder="Available Stock" required />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2 */}
                {activeFormTab === 'specs' && (
                  <div className="dynamic-fade">
                    {productType === 'preowned' && (
                      <div className="inspector-section">
                        <label>Engineering Spec</label>
                        <div className="form-stack">
                          <input type="text" value={imei} onChange={e => setImei(e.target.value)} placeholder="IMEI" required />
                          <input type="number" value={batteryHealth} onChange={e => setBatteryHealth(e.target.value)} placeholder="Battery %" required />
                        </div>
                        <select value={grade} onChange={e => setGrade(e.target.value)} style={{ marginTop: '12px' }}>
                          <option value="Grade A">Grade A (Pristine)</option>
                          <option value="Grade B">Grade B (Standard)</option>
                          <option value="Grade C">Grade C (Refurbished)</option>
                        </select>
                      </div>
                    )}

                    {productType === 'components' && (
                      <div className="inspector-section">
                        <label>MOQ Level</label>
                        <input type="number" value={moq} onChange={e => setMoq(e.target.value)} placeholder="MOQ" required />
                      </div>
                    )}

                    {productType === 'parts' && (
                      <div className="inspector-section">
                        <label>Quality Type</label>
                        <select value={qualityType} onChange={e => setQualityType(e.target.value)}>
                          <option value="Premium Aftermarket">Premium Aftermarket</option>
                          <option value="OEM Refurbished">OEM Refurbished</option>
                          <option value="Original Pulled">Original Pulled</option>
                        </select>
                      </div>
                    )}

                    <div className="inspector-section">
                      <label>Product Features / Bullets (One per line)</label>
                      <textarea 
                        value={featuresText} 
                        onChange={e => setFeaturesText(e.target.value)} 
                        placeholder="Feature bullets..."
                        rows="5"
                        style={{
                          width: '100%',
                          padding: '14px 18px',
                          borderRadius: '16px',
                          border: '1px solid #e2e8f0',
                          background: 'var(--bg-elevated)',
                          fontSize: '13px',
                          fontWeight: '600',
                          color: '#0f172a',
                          fontFamily: 'inherit',
                          outline: 'none',
                          resize: 'vertical'
                        }}
                      />
                    </div>

                    <div className="inspector-section">
                      <label>Warranty Period</label>
                      <select value={warrantyPeriod} onChange={e => setWarrantyPeriod(e.target.value)}>
                        <option value="">No Warranty</option>
                        <option value="30 Days">30 Days</option>
                        <option value="90 Days">90 Days</option>
                        <option value="6 Months">6 Months</option>
                        <option value="1 Year">1 Year</option>
                        <option value="Lifetime">Lifetime</option>
                      </select>
                    </div>

                    <div className="inspector-section">
                      <label>Compatible Models (One per line)</label>
                      <textarea
                        value={compatibilityText}
                        onChange={e => setCompatibilityText(e.target.value)}
                        placeholder="iPhone 14 Pro&#10;iPhone 14 Pro Max&#10;iPhone 13 Pro"
                        rows="5"
                        style={{
                          width: '100%',
                          padding: '14px 18px',
                          borderRadius: '16px',
                          border: '1px solid #e2e8f0',
                          background: 'var(--bg-elevated)',
                          fontSize: '13px',
                          fontWeight: '600',
                          color: '#0f172a',
                          fontFamily: 'inherit',
                          outline: 'none',
                          resize: 'vertical'
                        }}
                      />
                    </div>

                    {/* Bulk Order Pricing Tiers */}
                    <div className="inspector-section">
                      <label>Bulk Order Pricing</label>
                      <p style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', margin: '0 0 14px 0' }}>
                        Set quantity thresholds — customers ordering at or above that qty get the discount automatically.
                      </p>
                      {bulkTiers.map((tier, i) => (
                        <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
                          <div style={{ flex: 1 }}>
                            <input
                              type="number"
                              min="1"
                              value={tier.minQty}
                              onChange={e => {
                                const updated = [...bulkTiers];
                                updated[i] = { ...updated[i], minQty: e.target.value };
                                setBulkTiers(updated);
                              }}
                              placeholder={`Min Qty (e.g. ${i === 0 ? 10 : 50})`}
                            />
                          </div>
                          <div style={{ flex: 1 }}>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.5"
                              value={tier.discountPercent}
                              onChange={e => {
                                const updated = [...bulkTiers];
                                updated[i] = { ...updated[i], discountPercent: e.target.value };
                                setBulkTiers(updated);
                              }}
                              placeholder="Discount %"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => setBulkTiers(bulkTiers.filter((_, idx) => idx !== i))}
                            style={{ background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '10px', padding: '10px 14px', fontWeight: '800', cursor: 'pointer', fontSize: '16px', lineHeight: 1 }}
                            title="Remove tier"
                          >×</button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setBulkTiers([...bulkTiers, { minQty: '', discountPercent: '' }])}
                        style={{ background: '#eff6ff', color: '#3b82f6', border: '1px dashed #93c5fd', borderRadius: '12px', padding: '10px 18px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', width: '100%', marginTop: '4px' }}
                      >
                        + Add Tier
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 3 */}
                {activeFormTab === 'media' && (
                  <div className="dynamic-fade">
                    <div className="inspector-section">
                      <label>Product Images (up to 4)</label>
                      <div className="image-slots-grid">
                        {imageSlots.map((slot, i) => {
                          const preview = slot.file
                            ? URL.createObjectURL(slot.file)
                            : slot.existing ? getImageUrl(slot.existing) : null;
                          return (
                            <div key={i} className={`image-slot ${preview ? 'has-image' : ''} ${i === 0 ? 'primary-slot' : ''}`}>
                              <input
                                type="file"
                                accept="image/*"
                                id={`edit-img-slot-${i}`}
                                style={{ display: 'none' }}
                                onChange={e => {
                                  if (e.target.files[0]) {
                                    const updated = [...imageSlots];
                                    updated[i] = { file: e.target.files[0], existing: slot.existing };
                                    setImageSlots(updated);
                                  }
                                }}
                              />
                              {preview ? (
                                <div className="slot-filled">
                                  <img src={preview} alt={`slot-${i}`} className="slot-preview-img" />
                                  <div className="slot-overlay">
                                    <label htmlFor={`edit-img-slot-${i}`} className="slot-action-btn replace-btn" style={{ cursor: 'pointer' }}>Replace</label>
                                    <button
                                      type="button"
                                      className="slot-action-btn remove-btn"
                                      onClick={() => {
                                        const updated = [...imageSlots];
                                        updated[i] = { file: null, existing: '' };
                                        setImageSlots(updated);
                                      }}
                                    >Remove</button>
                                  </div>
                                  {i === 0 && <span className="slot-primary-badge">⭐ Primary</span>}
                                </div>
                              ) : (
                                <label htmlFor={`edit-img-slot-${i}`} className="slot-empty-state" style={{ cursor: 'pointer' }}>
                                  <div className="slot-upload-icon">
                                    <ImageIcon size={26} color="#3b82f6" />
                                  </div>
                                  <span className="slot-label">{i === 0 ? 'Main Image' : `Image ${i + 1}`}</span>
                                  <span className="slot-hint">Click to upload</span>
                                </label>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '12px', fontWeight: '600' }}>
                        Slot 1 = primary listing image. Click any slot to replace. Max 10MB per image.
                      </p>
                    </div>

                    <div className="inspector-section">
                      <label>Badge Override</label>
                      <select value={badge} onChange={e => setBadge(e.target.value)}>
                        <option value="">No Badge</option>
                        <option value="New Arrival">New Arrival</option>
                        <option value="Hot Seller">Hot Seller</option>
                        <option value="Genuine">Genuine Brand</option>
                        <option value="Limited Stock">Limited Stock</option>
                      </select>
                    </div>
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
        .catalog-orchestrator { padding: 40px; background: var(--bg-deep); min-height: 100vh; font-family: 'Plus Jakarta Sans', sans-serif; overflow-x: hidden; }
        
        .editorial-header-premium { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; gap: 20px; }
        .header-meta h1 { font-size: 32px; font-weight: 800; margin: 8px 0; letter-spacing: -0.02em; color: var(--text-primary); }
        .header-meta p { color: #64748b; font-size: 16px; max-width: 500px; }
        .badge-glow { background: #0369a1; color: #cffafe; padding: 6px 14px; border-radius: 100px; font-size: 12px; font-weight: 700; text-transform: uppercase; border: 1px solid rgba(3, 105, 161, 0.3); }
 
        .glass-stats { background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); border-radius: 24px; display: flex; padding: 20px 30px; box-shadow: 0 10px 40px -10px rgba(0,0,0,0.05); flex-shrink: 0; }
        .stat-item { text-align: center; padding: 0 20px; }
        .stat-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
        .stat-val-group { display: flex; align-items: center; gap: 8px; justify-content: center; }
        .stat-val-group .val { font-size: 24px; font-weight: 800; color: var(--text-primary); }
        .val.indigo { color: #818cf8; }
        .val.emerald { color: #10b981; }
        .stat-divider { width: 1px; background: var(--border-color); height: 40px; }
 
        .layout-grid { display: grid; grid-template-columns: 400px 1fr; gap: 40px; align-items: start; }
        
        .composition-panel { background: var(--bg-card); border-radius: 32px; border: 1px solid var(--border-color); padding: 35px; box-shadow: 0 20px 50px -12px rgba(0,0,0,0.3); position: sticky; top: 30px; }
        .panel-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; color: var(--text-primary); }
        .panel-header h3 { margin: 0; font-size: 20px; font-weight: 800; }
        
        .premium-form .form-section { margin-bottom: 25px; }
        .premium-form label { display: block; font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.1em; }
        .premium-form input, .premium-form select { width: 100%; padding: 14px 18px; border-radius: 16px; border: 1px solid var(--border-color); background: var(--bg-elevated); font-size: 14px; font-weight: 700; outline: none; transition: all 0.2s; color: var(--text-primary); box-sizing: border-box; }
        .premium-form input:focus, .premium-form select:focus { border-color: var(--primary-color); background: var(--bg-card); box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15); }
        .form-stack { display: flex; flex-direction: column; gap: 12px; }
        .inspector-section input, .inspector-section select, .inspector-section textarea { box-sizing: border-box; max-width: 100%; }
        
        .file-box-custom { border: 2px dashed #e2e8f0; border-radius: 16px; padding: 25px; text-align: center; position: relative; transition: all 0.2s; cursor: pointer; }
        .file-box-custom:hover { border-color: #3b82f6; background: #1e40af; }
        .file-box-custom input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
        .file-box-custom .meta { font-size: 12px; font-weight: 700; color: #64748b; pointer-events: none; }
 
        .publish-btn { width: 100%; padding: 18px; border-radius: 18px; background: #0f172a; color: white; border: none; font-weight: 800; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: all 0.2s; margin-top: 10px; }
        .publish-btn:hover:not(:disabled) { background: #1e293b; transform: translateY(-2px); box-shadow: 0 10px 20px -10px rgba(0,0,0,0.2); }
        .publish-btn:disabled { opacity: 0.7; cursor: wait; }
 
        .inventory-ledger { background: var(--bg-card); border-radius: 32px; border: 1px solid var(--border-color); box-shadow: 0 20px 50px -12px rgba(0,0,0,0.3); overflow: hidden; display: flex; flex-direction: column; min-width: 0; }
        .ledger-header { padding: 30px 40px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; background: var(--bg-elevated); flex-wrap: wrap; gap: 20px; }
        .active-nodes { display: flex; align-items: center; gap: 8px; color: #64748b; font-size: 13px; font-weight: 600; }
        .active-nodes svg { color: #3b82f6; }
        .search-pill { background: var(--bg-elevated); border: 1px solid var(--border-color); padding: 10px 18px; border-radius: 14px; display: flex; align-items: center; gap: 12px; width: 340px; transition: all 0.2s; }
        .search-pill:focus-within { border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15); }
        .search-pill input { border: none; outline: none; font-size: 13px; width: 100%; font-weight: 600; background: transparent; color: var(--text-primary); }
 
        .table-container { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .inventory-table { width: 100%; min-width: 780px; border-collapse: collapse; table-layout: auto; }
        .inventory-table th { padding: 16px 20px; text-align: left; font-size: 10px; font-weight: 800; color: var(--text-primary); text-transform: uppercase; letter-spacing: 1px; background: var(--bg-elevated); white-space: nowrap; }
        .ledger-row { border-bottom: 1px solid var(--border-color); transition: all 0.2s; }
        .ledger-row:hover { background: var(--bg-elevated); }
        .ledger-row td { padding: 16px 20px; vertical-align: middle; }
        
        .product-cell { display: flex; align-items: center; gap: 15px; }
        .prod-img { width: 52px; height: 52px; border-radius: 14px; background: var(--bg-elevated); overflow: hidden; display: flex; align-items: center; justify-content: center; color: var(--text-secondary); border: 1px solid var(--border-color); flex-shrink: 0; }
        .prod-img img { width: 100%; height: 100%; object-fit: cover; }
        .meta-stack { display: flex; flex-direction: column; white-space: normal; min-width: 0; }
        .meta-stack .n { font-weight: 700; color: var(--text-primary); font-size: 14px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .cat-pill { font-size: 9px; font-weight: 800; color: #93c5fd; background: #1e40af; padding: 2px 8px; border-radius: 4px; margin-top: 4px; width: fit-content; text-transform: uppercase; }
        .cat-pill.legacy-warning { background: #92400e; color: #fed7aa; }
        
        .sku-cell { white-space: nowrap; }
        .sku-cell .sku { display: block; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; color: #64748b; }
        .status-pill { display: inline-flex; align-items: center; gap: 8px; padding: 3px 10px; border-radius: 6px; font-size: 9px; font-weight: 800; text-transform: uppercase; margin-top: 4px; }
        .status-pill.preowned { background: #92400e; color: #fed7aa; }
        .status-pill.parts { background: #065f46; color: #d1fae5; }
        
        .price-tag { font-weight: 800; font-size: 15px; color: #c9a227; white-space: nowrap; }
        .row-actions { display: flex; gap: 6px; justify-content: flex-end; flex-wrap: nowrap; white-space: nowrap; }
        .icon-btn { width: 34px; height: 34px; border-radius: 10px; border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; background: var(--bg-elevated); color: #94a3b8; flex-shrink: 0; }
        .icon-btn:hover { background: #0f172a; color: white; border-color: var(--text-primary); transform: translateY(-2px); }
        .icon-btn.delete:hover { background: #ef4444; border-color: #ef4444; }
 
        .loading-state, .empty-state-row { text-align: center; padding: 100px !important; color: #94a3b8; font-weight: 600; }
        .empty-state-content { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; min-height: 300px; }
        .empty-state-content p { margin-top: 20px; font-size: 16px; font-weight: 700; }
 
        /* Inspector Panel */
        .inspector-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(8px); z-index: 2000; display: flex; justify-content: flex-end; }
        .side-modal { width: 480px; max-width: 100vw; height: 100%; background: var(--bg-card); box-shadow: -20px 0 60px rgba(0,0,0,0.4); animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); display: flex; flex-direction: column; position: relative; overflow-x: hidden; }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        
        .inspector-header { padding: 40px; border-bottom: 1px solid var(--border-color); }
        .id-tag { font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 800; color: #93c5fd; background: #1e40af; padding: 6px 12px; border-radius: 8px; width: fit-content; }
        .inspector-header h3 { margin: 15px 0 0; font-size: 22px; font-weight: 800; color: var(--text-primary); }
        .close-btn { position: absolute; right: 30px; top: 35px; background: none; border: none; font-size: 32px; color: #94a3b8; cursor: pointer; line-height: 1; }
        
        .inspector-body { padding: 40px; flex: 1; overflow-y: auto; overflow-x: hidden; box-sizing: border-box; }
        .inspector-section { margin-bottom: 30px; }
        .inspector-section label { display: block; font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 15px; }
        .mt-3 { margin-top: 15px; }
        
        .input-with-icon { position: relative; display: flex; align-items: center; }
        .input-with-icon svg { position: absolute; left: 15px; color: #94a3b8; }
        .input-with-icon input { padding-left: 40px !important; }
 
        .modal-footer-custom { padding: 30px 40px; border-top: 1px solid var(--border-color); display: grid; gap: 12px; background: var(--bg-elevated); }
        .save-btn { background: #0f172a; color: white; border: none; padding: 18px; border-radius: 18px; font-weight: 800; cursor: pointer; transition: all 0.2s; }
        .cancel-btn { background: transparent; border: 1px solid #e2e8f0; padding: 16px; border-radius: 18px; color: #64748b; font-weight: 700; cursor: pointer; }
        
        .status-toast { position: fixed; bottom: 40px; right: 40px; background: #0f172a; color: white; padding: 12px 24px; border-radius: 12px; font-size: 13px; font-weight: 700; box-shadow: 0 10px 30px rgba(0,0,0,0.2); animation: fadeInUp 0.3s ease-out; z-index: 3000; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
 
        /* Tier Toggle Buttons */
        .toggle-btn {
          padding: 10px 16px;
          border-radius: 12px;
          border: 2px solid var(--border-color);
          background: var(--bg-elevated);
          color: #64748b;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
          white-space: nowrap;
        }
        .toggle-btn:hover {
          border-color: #3b82f6;
          color: #3b82f6;
          background: rgba(59,130,246,0.06);
        }
        .toggle-btn.active {
          background: #1e40af;
          border-color: #3b82f6;
          color: #fff;
          box-shadow: 0 4px 14px rgba(59,130,246,0.35);
        }
        .toggle-btn.active:hover {
          background: #1d4ed8;
          color: #fff;
        }

        /* Tier badge labels inside toggle */
        .toggle-btn .tier-badge {
          display: inline-block;
          font-size: 9px;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 4px;
          margin-right: 6px;
          vertical-align: middle;
        }
        .toggle-btn.active .tier-badge {
          background: rgba(255,255,255,0.2);
          color: #fff;
        }
        .toggle-btn:not(.active) .tier-badge {
          background: #e2e8f0;
          color: #475569;
        }

        .animate-fade { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        /* ── Image Slots Grid ── */
        .image-slots-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .image-slot {
          position: relative;
          border-radius: 16px;
          border: 2px dashed var(--border-color);
          background: var(--bg-elevated);
          aspect-ratio: 1 / 1;
          overflow: hidden;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .image-slot:hover {
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59,130,246,0.12);
        }
        .image-slot.primary-slot {
          border-color: #3b82f6;
          border-style: solid;
        }
        .image-slot.has-image {
          border-style: solid;
          border-color: var(--border-color);
        }

        /* Empty state */
        .slot-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          width: 100%;
          gap: 8px;
          padding: 12px;
          text-align: center;
        }
        .slot-upload-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: rgba(59,130,246,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .slot-label {
          font-size: 12px;
          font-weight: 700;
          color: var(--text-primary);
        }
        .slot-hint {
          font-size: 10px;
          font-weight: 600;
          color: #64748b;
        }

        /* Filled state */
        .slot-filled {
          position: relative;
          width: 100%;
          height: 100%;
        }
        .slot-preview-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .slot-overlay {
          position: absolute;
          inset: 0;
          background: rgba(15,23,42,0.65);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .image-slot:hover .slot-overlay {
          opacity: 1;
        }
        .slot-action-btn {
          padding: 7px 18px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.15s;
          display: inline-block;
          text-align: center;
        }
        .replace-btn {
          background: #3b82f6;
          color: white;
        }
        .replace-btn:hover {
          background: #2563eb;
        }
        .remove-btn {
          background: #ef4444;
          color: white;
        }
        .remove-btn:hover {
          background: #dc2626;
        }
        .slot-primary-badge {
          position: absolute;
          top: 8px;
          left: 8px;
          background: #1e40af;
          color: #93c5fd;
          font-size: 9px;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: 6px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          pointer-events: none;
        }
 
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
