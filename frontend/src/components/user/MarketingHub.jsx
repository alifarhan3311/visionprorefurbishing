import React, { useState, useEffect } from 'react';
import { Download, FileText, Image, FileArchive, Search, Filter } from 'lucide-react';
import api, { getImageUrl } from '../../services/api';
import '../admin/AdminForms.css';

const MarketingHub = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const { data } = await api.get('/marketing');
        if (data.success) {
          setAssets(data.data);
        }
      } catch (error) {
        console.error('Error fetching assets:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssets();
  }, []);

  const getFileIcon = (type) => {
    switch(type?.toUpperCase()) {
      case 'PDF': return <FileText size={40} color="#ef4444" />;
      case 'JPG':
      case 'PNG': return <Image size={40} color="#3b82f6" />;
      case 'ZIP': return <FileArchive size={40} color="#f59e0b" />;
      default: return <FileText size={40} color="#94a3b8" />;
    }
  };

  const categories = ['All', 'Flyers', 'Price Lists', 'Social Media', 'Banners', 'Technical Documents'];
  const filteredAssets = filter === 'All' ? assets : assets.filter(a => a.category === filter);

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="user-page-title">Marketing Hub & B2B Resources</h1>
        <p style={{ color: '#64748b' }}>Download promotional assets, price lists, and technical documentation.</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', overflowX: 'auto', paddingBottom: '10px' }}>
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setFilter(cat)}
            style={{
              padding: '8px 20px',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              backgroundColor: filter === cat ? 'var(--primary-color)' : 'white',
              color: filter === cat ? 'white' : '#475569',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading resources...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' }}>
          {filteredAssets.map(asset => (
            <div key={asset._id} className="user-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '160px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #f1f5f9' }}>
                {asset.thumbnailUrl ? (
                  <img src={getImageUrl(asset.thumbnailUrl)} alt={asset.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  getFileIcon(asset.fileType)
                )}
              </div>
              <div style={{ padding: '20px', flexGrow: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary-color)', textTransform: 'uppercase', marginBottom: '8px' }}>{asset.category}</div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>{asset.title}</h3>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '15px', lineHeigh: '1.4' }}>{asset.description}</p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '15px', borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>{asset.fileType} • {asset.fileSize || 'N/A'}</div>
                  <a 
                    href={getImageUrl(asset.fileUrl)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '5px', 
                      color: 'var(--primary-color)', 
                      fontWeight: 700, 
                      fontSize: '14px',
                      textDecoration: 'none'
                    }}
                  >
                    <Download size={16} /> Download
                  </a>
                </div>
              </div>
            </div>
          ))}
          {filteredAssets.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
              No assets found in this category.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MarketingHub;
