import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, CheckCircle, Package, TrendingDown, 
  Search, Filter, Download, ChevronRight, 
  AlertCircle, ArrowDown, Activity, Info, Zap
} from 'lucide-react';
import api from '../../../services/api';
import '../AdminForms.css';

const StockMonitoring = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLow, setFilterLow] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const LOW_STOCK_THRESHOLD = 10;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/products');
      if (data && data.success) {
        setProducts(Array.isArray(data.data) ? data.data : []);
      } else {
        setProducts(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching stock:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = Array.isArray(products) ? products.filter(p => {
    if (!p) return false;
    const matchesSearch = (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.sku || '').toLowerCase().includes(searchTerm.toLowerCase());
    const isLow = (p.stockCount || 0) < LOW_STOCK_THRESHOLD;
    return matchesSearch && (!filterLow || isLow);
  }) : [];

  const stats = {
    total: products.length,
    critical: products.filter(p => p && (p.stockCount || 0) < LOW_STOCK_THRESHOLD).length,
    outOfStock: products.filter(p => p && (p.stockCount || 0) === 0).length,
    healthy: products.filter(p => p && (p.stockCount || 0) >= LOW_STOCK_THRESHOLD).length
  };

  return (
    <div className="stock-orchestrator animate-fade">
      {/* Header & Stats */}
      <div className="editorial-header">
        <div className="header-meta">
          <span className="badge-glow">Warehouse Intelligence</span>
          <h1>Inventory Health</h1>
          <p>Real-time surveillance of global stock levels and automated replenishment triggers.</p>
        </div>

        <div className="glass-stats">
          <div className="stat-item">
            <div className="stat-label">Critical SKUs</div>
            <div className="stat-val-group">
              <span className="val red">{stats.critical}</span>
              <AlertCircle size={16} className="trend-icon red" />
            </div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-label">Healthy Buffer</div>
            <div className="stat-val-group">
              <span className="val emerald">{stats.healthy}</span>
            </div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-label">Depleted</div>
            <div className="stat-val-group">
              <span className="val">{stats.outOfStock}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="queue-container-premium">
        <div className="queue-header">
          <div className="header-left">
            <div className="active-nodes">
              <Activity size={14} />
              <span>Surveillance active for {products.length} nodes</span>
            </div>
          </div>
          <div className="header-actions">
            <div className="search-pill">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Search inventory ledgers..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              className={`utility-btn-premium ${filterLow ? 'active-critical' : ''}`}
              onClick={() => setFilterLow(!filterLow)}
            >
              <AlertTriangle size={16} /> 
              {filterLow ? "Show All" : "Critical Segments"}
            </button>
            <button className="action-btn-premium"><Download size={16} /> Export Health Audit</button>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="premium-table">
            <thead>
              <tr>
                <th style={{ width: '35%' }}>PRODUCT / IDENTIFIER</th>
                <th style={{ width: '15%' }}>AVAILABLE UNITS</th>
                <th style={{ width: '25%' }}>STOCK HEALTH</th>
                <th style={{ width: '15%' }}>LAST AUDIT</th>
                <th style={{ textAlign: 'right', width: '100px' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="loading-state">Performing inventory audit...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-state-row">
                    <div className="empty-state-content">
                      <Package size={48} />
                      <p>No inventory records match current filter parameters.</p>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.map(product => {
                const stock = product.stockCount || 0;
                const isLow = stock < LOW_STOCK_THRESHOLD;
                const percentage = Math.min((stock / 50) * 100, 100); 

                return (
                  <tr key={product._id} className="premium-row">
                    <td>
                      <div className="product-meta-cell">
                        <div className="name">{product.name || 'Unknown Designation'}</div>
                        <div className="sku">SKU: {product.sku || 'N/A'}</div>
                      </div>
                    </td>
                    <td>
                      <div className="stock-count-cell">
                        <span className={`count ${isLow ? 'low' : ''}`}>{stock}</span>
                        <span className="unit">UNITS</span>
                      </div>
                    </td>
                    <td>
                      <div className="health-viz">
                        <div className="progress-bg-premium">
                          <div 
                            className={`progress-fill-premium ${isLow ? 'low' : 'optimal'}`} 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className={`status-text-pill ${isLow ? 'low' : 'optimal'}`}>
                          {isLow ? (stock === 0 ? 'DEPLETED' : 'CRITICAL') : 'OPTIMAL'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="date-pill-premium">
                        {product.updatedAt ? new Date(product.updatedAt).toLocaleDateString('en-US', { 
                          month: 'short', day: 'numeric', year: 'numeric' 
                        }) : 'Never Audited'}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="hub-icon-btn">
                        <ChevronRight size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .stock-orchestrator { padding: 40px; background: #f8fafc; min-height: 100vh; font-family: 'Inter', sans-serif; }
        
        .editorial-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; }
        .header-meta h1 { font-size: 32px; font-weight: 800; margin: 8px 0; letter-spacing: -0.02em; color: #0f172a; }
        .header-meta p { color: #64748b; font-size: 16px; max-width: 500px; }
        .badge-glow { background: #f0fdf4; color: #166534; padding: 6px 14px; border-radius: 100px; font-size: 12px; font-weight: 700; text-transform: uppercase; border: 1px solid rgba(22, 101, 52, 0.1); }

        .glass-stats { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 24px; display: flex; padding: 20px 30px; box-shadow: 0 10px 40px -10px rgba(0,0,0,0.05); }
        .stat-item { text-align: center; padding: 0 20px; }
        .stat-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
        .stat-val-group { display: flex; align-items: center; gap: 8px; justify-content: center; }
        .stat-val-group .val { font-size: 24px; font-weight: 800; color: #0f172a; }
        .val.red { color: #ef4444; }
        .val.emerald { color: #10b981; }
        .trend-icon.red { color: #ef4444; }
        .stat-divider { width: 1px; background: #e2e8f0; height: 40px; }

        .queue-container-premium { background: white; border-radius: 32px; border: 1px solid #e2e8f0; box-shadow: 0 20px 50px -12px rgba(0,0,0,0.04); overflow: hidden; }
        .queue-header { padding: 30px 40px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; background: #fafafa; }
        .active-nodes { display: flex; align-items: center; gap: 8px; color: #64748b; font-size: 13px; font-weight: 600; }
        
        .search-pill { background: white; border: 1px solid #cbd5e1; padding: 10px 18px; border-radius: 14px; display: flex; align-items: center; gap: 12px; width: 320px; transition: all 0.2s; }
        .search-pill:focus-within { border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.05); }
        .search-pill input { border: none; outline: none; font-size: 13px; width: 100%; font-weight: 600; background: transparent; }
        
        .utility-btn-premium { padding: 0 20px; border-radius: 14px; border: 1px solid #cbd5e1; background: white; font-size: 13px; font-weight: 700; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: all 0.2s; height: 46px; }
        .utility-btn-premium.active-critical { background: #fee2e2; border-color: #ef4444; color: #b91c1c; }
        .action-btn-premium { background: #0f172a; color: white; border: none; padding: 12px 20px; border-radius: 14px; font-size: 13px; font-weight: 700; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: all 0.2s; }

        .table-wrapper { width: 100%; overflow-x: auto; }
        .premium-table { width: 100%; border-collapse: collapse; min-width: 1000px; }
        .premium-table th { padding: 20px 40px; text-align: left; font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; background: #fcfcfc; white-space: nowrap; }
        .premium-row { border-bottom: 1px solid #f1f5f9; transition: all 0.2s; }
        .premium-row:hover { background: #f8fafc; }
        .premium-row td { padding: 25px 40px; }

        .product-meta-cell .name { font-weight: 700; color: #1e293b; font-size: 15px; line-height: 1.4; white-space: normal; max-width: 300px; }
        .product-meta-cell .sku { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #94a3b8; margin-top: 4px; font-weight: 600; }

        .stock-count-cell { display: flex; align-items: baseline; gap: 6px; }
        .stock-count-cell .count { font-size: 20px; font-weight: 800; color: #0f172a; }
        .stock-count-cell .count.low { color: #ef4444; }
        .stock-count-cell .unit { font-size: 10px; font-weight: 800; color: #94a3b8; }

        .health-viz { width: 180px; }
        .progress-bg-premium { width: 100%; height: 8px; background: #f1f5f9; border-radius: 10px; overflow: hidden; margin-bottom: 10px; border: 1px solid #e2e8f0; }
        .progress-fill-premium { height: 100%; border-radius: 10px; transition: width 1s cubic-bezier(0.1, 0, 0, 1); }
        .progress-fill-premium.optimal { background: linear-gradient(90deg, #10b981, #34d399); }
        .progress-fill-premium.low { background: linear-gradient(90deg, #ef4444, #f87171); }
        
        .status-text-pill { font-size: 9px; font-weight: 800; text-transform: uppercase; padding: 3px 8px; border-radius: 5px; }
        .status-text-pill.optimal { background: #ecfdf5; color: #059669; }
        .status-text-pill.low { background: #fee2e2; color: #b91c1c; }

        .date-pill-premium { font-size: 13px; font-weight: 700; color: #64748b; }
        
        .hub-icon-btn { width: 40px; height: 40px; border-radius: 12px; border: 1px solid #e2e8f0; background: white; color: #94a3b8; display: flex; align-items: center; justify-content: center; transition: all 0.2s; cursor: pointer; }
        .premium-row:hover .hub-icon-btn { background: #0f172a; color: white; border-color: #0f172a; }

        .loading-state, .empty-state-row { text-align: center; padding: 100px !important; color: #94a3b8; font-weight: 600; }
        .animate-fade { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
};

export default StockMonitoring;
