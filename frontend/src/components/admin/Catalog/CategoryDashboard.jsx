import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FolderTree, Activity, Layers, ArrowRight,
  Shield, CheckCircle2, Bookmark, HelpCircle
} from 'lucide-react';
import api from '../../../services/api';
import '../AdminForms.css';

const CategoryDashboard = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/categories');
      if (data && data.success) {
        setCategories(Array.isArray(data.data) ? data.data : []);
      } else {
        setCategories(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTierCount = (tier) => {
    return categories.filter(c => (c.tierLevel || 1) === tier).length;
  };

  const tierMeta = [
    {
      level: 1,
      title: "Tier 1 - Brands / Root",
      desc: "Top-level segment headers (e.g. Apple, Samsung). Configures navigation icons & banners.",
      color: "var(--primary-color)",
      bg: "rgba(0, 85, 165, 0.05)"
    },
    {
      level: 2,
      title: "Tier 2 - Service Lines",
      desc: "Categorizes by product type / service division under root (e.g. iPhone, iPad, Watch).",
      color: "#f26522",
      bg: "rgba(242, 101, 34, 0.05)"
    },
    {
      level: 3,
      title: "Tier 3 - Device Families",
      desc: "Groups series of specific models under service line (e.g. iPhone 15 Series, iPhone 14 Series).",
      color: "#8b5cf6",
      bg: "rgba(139, 92, 246, 0.05)"
    },
    {
      level: 4,
      title: "Tier 4 - SKU Models",
      desc: "Specific target models required for precise product catalog mapping (e.g. iPhone 15 Pro Max).",
      color: "#10b981",
      bg: "rgba(16, 185, 129, 0.05)"
    }
  ];

  return (
    <div className="taxonomy-orchestrator animate-fade" style={{ padding: '40px', background: 'var(--bg-deep)', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="editorial-header-premium">
        <div className="header-meta">
          <span className="badge-glow">Taxonomy Engine</span>
          <h1>Category Control Center</h1>
          <p>Govern, map, and organize your catalog's multi-tier parent-child nodes to power navigation and product definitions.</p>
        </div>

        <div className="glass-stats">
          <div className="stat-item">
            <div className="stat-label">Total Nodes</div>
            <div className="stat-val-group">
              <span className="val">{categories.length}</span>
              <Activity size={16} className="trend-icon" />
            </div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-label">Product SKU Targets</div>
            <div className="stat-val-group">
              <span className="val emerald">{getTierCount(4)}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginTop: '30px' }}>
        {tierMeta.map(t => (
          <div 
            key={t.level} 
            className="glass" 
            style={{ 
              padding: '30px', 
              borderRadius: '20px', 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'space-between',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ position: 'absolute', top: '0', right: '0', width: '8px', height: '100%', background: t.color }}></div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Layers size={20} style={{ color: t.color }} />
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>{t.title}</h3>
                </div>
                <span style={{ fontSize: '12px', fontWeight: '800', padding: '4px 10px', borderRadius: '20px', background: t.bg, color: t.color }}>
                  {getTierCount(t.level)} Nodes
                </span>
              </div>
              <p style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.6', marginBottom: '25px' }}>{t.desc}</p>
            </div>
            <Link 
              to={`/admin/categories/tier${t.level}`} 
              className="publish-btn" 
              style={{ 
                background: t.color, 
                color: 'white', 
                textDecoration: 'none', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '8px',
                padding: '12px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: '700',
                transition: 'all 0.2s',
                boxShadow: `0 4px 14px ${t.bg}`
              }}
            >
              Manage Tier {t.level} <ArrowRight size={16} />
            </Link>
          </div>
        ))}
      </div>

      {/* Overview Grid showing Hierarchy Mapping summary */}
      <div className="glass" style={{ padding: '30px', borderRadius: '20px', marginTop: '40px', border: '1px solid rgba(0, 0, 0, 0.05)' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FolderTree size={20} style={{ color: 'var(--primary-color)' }} /> Taxonomy Hierarchy Visualizer
        </h3>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontWeight: '600' }}>Tracing Category Map...</div>
        ) : categories.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No categories registered. Get started by adding a Tier 1 Node.</div>
        ) : (
          <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
            {categories.filter(c => (c.tierLevel || 1) === 1).map(root => (
              <div key={root._id} style={{ borderLeft: '2px solid #cbd5e1', marginLeft: '10px', paddingLeft: '20px', marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', color: '#0f172a', fontSize: '14px' }}>
                  <span style={{ fontSize: '10px', background: 'rgba(0, 85, 165, 0.1)', color: 'var(--primary-color)', padding: '2px 6px', borderRadius: '4px' }}>T1</span>
                  {root.name} <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>({root.slug})</span>
                </div>
                {/* Find Tier 2 under this Tier 1 */}
                {categories.filter(c2 => c2.parentCategory?._id === root._id || c2.parentCategory === root._id).map(t2 => (
                  <div key={t2._id} style={{ borderLeft: '2px solid #e2e8f0', marginLeft: '15px', paddingLeft: '20px', marginTop: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', color: '#334155', fontSize: '13px' }}>
                      <span style={{ fontSize: '10px', background: 'rgba(242, 101, 34, 0.1)', color: '#f26522', padding: '2px 6px', borderRadius: '4px' }}>T2</span>
                      {t2.name}
                    </div>
                    {/* Find Tier 3 under this Tier 2 */}
                    {categories.filter(c3 => c3.parentCategory?._id === t2._id || c3.parentCategory === t2._id).map(t3 => (
                      <div key={t3._id} style={{ borderLeft: '2px solid #f1f5f9', marginLeft: '15px', paddingLeft: '20px', marginTop: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', color: '#475569', fontSize: '12px' }}>
                          <span style={{ fontSize: '10px', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', padding: '2px 6px', borderRadius: '4px' }}>T3</span>
                          {t3.name}
                        </div>
                        {/* Find Tier 4 under this Tier 3 */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginLeft: '15px', marginTop: '6px' }}>
                          {categories.filter(c4 => c4.parentCategory?._id === t3._id || c4.parentCategory === t3._id).map(t4 => (
                            <div key={t4._id} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--bg-elevated)', border: '1px solid #e2e8f0', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', color: '#64748b' }}>
                              <span style={{ fontSize: '8px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '1px 3px', borderRadius: '3px', fontWeight: '800' }}>T4</span>
                              {t4.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryDashboard;
