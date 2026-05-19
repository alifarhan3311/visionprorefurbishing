import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, FileText, Image as ImageIcon, 
  Search, Filter, BookOpen, Clock, 
  ChevronRight, Edit3, CheckCircle2,
  Globe, Layout, Type, Send, Activity,
  Calendar, Share2, MoreVertical, AlertTriangle,
  Package, Zap
} from 'lucide-react';
import api from '../../../services/api';
import '../AdminForms.css';

const BlogManager = () => {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Technology');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/blog');
      if (data && data.success) {
        setPosts(Array.isArray(data.data) ? data.data : []);
      } else {
        setPosts(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching blog posts:', err);
      setPosts([]);
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
      setImageUrl(data.image);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const slug = title.toLowerCase().trim().replace(/ /g, '-').replace(/[^\w-]+/g, '');
      const payload = { title, excerpt, content, category, image: imageUrl, slug };
      
      if (editingId) {
        await api.put(`/blog/${editingId}`, payload);
        setIsEditModalOpen(false);
        setEditingId(null);
      } else {
        await api.post('/blog', payload);
      }

      resetForm();
      fetchPosts();
    } catch (err) {
      console.error('Submit error:', err);
      alert('Failed to save article. Check console for details.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle(''); setExcerpt(''); setContent('');
    setImageUrl(''); setCategory('Technology');
  };

  const openEditModal = (post) => {
    if (!post) return;
    setEditingId(post._id);
    setTitle(post.title || '');
    setExcerpt(post.excerpt || '');
    setContent(post.content || '');
    setCategory(post.category || 'Technology');
    setImageUrl(post.image || '');
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingId(null);
    resetForm();
  };

  const deletePost = async (id) => {
    if (window.confirm('Retract this article from publication?')) {
      try {
        await api.delete(`/blog/${id}`);
        fetchPosts();
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
  };

  const filteredPosts = Array.isArray(posts) ? posts.filter(p => 
    p && (p.title || '').toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const stats = {
    total: filteredPosts.length,
    published: filteredPosts.length,
    categories: [...new Set(filteredPosts.map(p => p?.category || 'General'))].length
  };

  return (
    <div className="blog-orchestrator animate-fade">
      {/* Editorial Header */}
      <div className="editorial-header-premium">
        <div className="header-meta">
          <span className="badge-glow">Content Strategy</span>
          <h1>Editorial Engine</h1>
          <p>Orchestrating high-impact narratives and industry insights for the VisionPro audience.</p>
        </div>

        <div className="glass-stats">
          <div className="stat-item">
            <div className="stat-label">Total Articles</div>
            <div className="stat-val-group">
              <span className="val">{stats.total}</span>
              <Activity size={16} className="trend-icon" />
            </div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-label">Live Broadcasts</div>
            <div className="stat-val-group">
              <span className="val emerald">{stats.published}</span>
            </div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-label">Channels</div>
            <div className="stat-val-group">
              <span className="val indigo">{stats.categories}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="layout-grid">
        {/* Composition Panel */}
        <div className="composition-panel">
          <div className="panel-header">
            <Plus size={20} />
            <h3>Draft New Article</h3>
          </div>

          <form onSubmit={handleSubmit} className="premium-form">
            <div className="form-section">
              <label><Type size={14} /> Identity & Title</label>
              <input 
                type="text" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder="Hook the reader with a strong headline..."
                required 
              />
              <div className="form-stack mt-3">
                <select value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="Technology">Technology</option>
                  <option value="Business">Business</option>
                  <option value="Tutorial">Tutorial</option>
                  <option value="Industry News">Industry News</option>
                </select>
                <div className="file-box-custom">
                   <input type="file" onChange={uploadFileHandler} />
                   <div className="meta">
                      <ImageIcon size={14} />
                      <span>{uploading ? "Uploading..." : imageUrl ? "Image Set ✓" : "Set Hero Image"}</span>
                   </div>
                </div>
              </div>
            </div>

            <div className="form-section">
              <label><Layout size={14} /> Synopsis & Teaser</label>
              <textarea 
                value={excerpt} 
                onChange={e => setExcerpt(e.target.value)} 
                placeholder="A compelling summary for the catalog..."
                rows="3"
                required
              />
            </div>

            <div className="form-section">
              <label><BookOpen size={14} /> Narrative Content</label>
              <textarea 
                value={content} 
                onChange={e => setContent(e.target.value)} 
                placeholder="The story starts here..."
                rows="8"
                className="manuscript-input"
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="publish-btn" disabled={submitting}>
                <Send size={18} /> {submitting ? 'Transmitting...' : 'Publish Article'}
              </button>
            </div>
          </form>
        </div>

        {/* Registry */}
        <div className="inventory-ledger">
          <div className="ledger-header">
            <div className="header-left">
              <div className="active-nodes">
                <BookOpen size={14} />
                <span>Editorial Archive</span>
              </div>
            </div>
            <div className="search-pill">
              <Search size={16} />
              <input 
                type="text" 
                placeholder="Search archive..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="posts-grid-premium">
            {loading ? (
              <div className="loading-state-blog">
                <Activity className="spin" size={48} />
                <p>Syncing with Editorial servers...</p>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="empty-state-blog">
                <Package size={64} />
                <p>No articles found in this segment.</p>
              </div>
            ) : filteredPosts.map(post => (
              <div key={post._id} className="post-card-premium">
                <div className="post-visual">
                  <img src={post.image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=800&auto=format&fit=crop'} alt="" />
                  <div className="post-status-tag">Published</div>
                  <div className="post-actions-overlay">
                    <button className="action-circle" onClick={() => openEditModal(post)}><Edit3 size={18} /></button>
                    <button className="action-circle delete" onClick={() => deletePost(post._id)}><Trash2 size={18} /></button>
                  </div>
                </div>
                
                <div className="post-content-area">
                  <div className="post-meta-top">
                    <span className="category-tag-premium">{post.category || 'Technology'}</span>
                    <span className="read-time"><Clock size={12} /> {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <h3 className="post-title">{post.title || 'Untitled Article'}</h3>
                  <p className="post-excerpt">{post.excerpt ? (post.excerpt.substring(0, 80) + '...') : 'No summary provided.'}</p>
                  <div className="post-footer-premium">
                    <div className="author-group">
                       <div className="author-avatar">{post.author?.name?.charAt(0) || 'A'}</div>
                       <span className="author-name">{post.author?.name || 'Admin'}</span>
                    </div>
                    <Share2 size={14} className="jump-icon" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Side Editor Modal */}
      {isEditModalOpen && (
        <div className="inspector-overlay" onClick={closeEditModal}>
          <div className="side-modal manuscript-editor" onClick={e => e.stopPropagation()}>
            <div className="inspector-header">
              <div className="id-tag">COMPOSITION MODE</div>
              <button className="close-btn" onClick={closeEditModal}>&times;</button>
              <h3>Refine Narrative</h3>
            </div>
            <div className="inspector-body">
              <form onSubmit={handleSubmit} className="premium-form">
                <div className="inspector-section">
                  <label>Article Headline</label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)} required />
                </div>
                <div className="inspector-section">
                  <label>Manuscript Content</label>
                  <textarea 
                    value={content} 
                    onChange={e => setContent(e.target.value)} 
                    rows="15" 
                    className="manuscript-input-premium"
                    required
                  />
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
        .blog-orchestrator { padding: 40px; background: #f8fafc; min-height: 100vh; font-family: 'Inter', sans-serif; overflow-x: hidden; }
        
        .editorial-header-premium { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; gap: 20px; }
        .header-meta h1 { font-size: 32px; font-weight: 800; margin: 8px 0; letter-spacing: -0.02em; color: #0f172a; }
        .header-meta p { color: #64748b; font-size: 16px; max-width: 500px; }
        .badge-glow { background: #f0fdf4; color: #166534; padding: 6px 14px; border-radius: 100px; font-size: 12px; font-weight: 700; text-transform: uppercase; border: 1px solid rgba(22,101,52,0.1); }

        .glass-stats { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 24px; display: flex; padding: 20px 30px; box-shadow: 0 10px 40px -10px rgba(0,0,0,0.05); flex-shrink: 0; }
        .stat-item { text-align: center; padding: 0 20px; }
        .stat-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
        .stat-val-group { display: flex; align-items: center; gap: 8px; justify-content: center; }
        .stat-val-group .val { font-size: 24px; font-weight: 800; color: #0f172a; }
        .val.emerald { color: #10b981; }
        .val.indigo { color: #6366f1; }
        .stat-divider { width: 1px; background: #e2e8f0; height: 40px; }

        .layout-grid { display: grid; grid-template-columns: 420px 1fr; gap: 40px; align-items: start; }
        
        .composition-panel { background: white; border-radius: 32px; border: 1px solid #e2e8f0; padding: 35px; box-shadow: 0 20px 50px -12px rgba(0,0,0,0.04); position: sticky; top: 40px; }
        .panel-header { display: flex; align-items: center; gap: 12px; margin-bottom: 30px; color: #0f172a; }
        .panel-header h3 { margin: 0; font-size: 20px; font-weight: 800; }

        .premium-form .form-section { margin-bottom: 25px; }
        .premium-form label { display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.5px; }
        .premium-form input, .premium-form select, .premium-form textarea { width: 100%; padding: 14px 18px; border-radius: 14px; border: 1px solid #e2e8f0; background: #f8fafc; font-size: 14px; font-weight: 600; outline: none; transition: all 0.2s; }
        .premium-form input:focus, .premium-form textarea:focus { border-color: #3b82f6; background: white; }
        .manuscript-input { font-family: 'Inter', sans-serif; line-height: 1.6; font-size: 14px; resize: vertical; }
        .form-stack { display: flex; flex-direction: column; gap: 12px; }

        .file-box-custom { border: 1px dashed #cbd5e1; border-radius: 14px; position: relative; display: flex; align-items: center; justify-content: center; background: white; overflow: hidden; height: 48px; transition: all 0.2s; cursor: pointer; }
        .file-box-custom:hover { border-color: #3b82f6; background: #eff6ff; }
        .file-box-custom input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
        .file-box-custom .meta { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700; color: #64748b; pointer-events: none; }

        .publish-btn { width: 100%; padding: 18px; border-radius: 16px; background: #0f172a; color: white; border: none; font-weight: 800; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: all 0.2s; }
        .publish-btn:hover:not(:disabled) { background: #1e293b; transform: translateY(-2px); }

        .inventory-ledger { background: white; border-radius: 32px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; overflow: hidden; min-height: 600px; min-width: 0; }
        .ledger-header { padding: 30px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; background: #fafafa; flex-wrap: wrap; gap: 20px; }
        .active-nodes { display: flex; align-items: center; gap: 8px; color: #64748b; font-size: 13px; font-weight: 600; }
        .active-nodes svg { color: #3b82f6; }
        .search-pill { background: white; border: 1px solid #cbd5e1; padding: 8px 16px; border-radius: 12px; display: flex; align-items: center; gap: 10px; width: 300px; transition: all 0.2s; }
        .search-pill:focus-within { border-color: #3b82f6; }
        .search-pill input { border: none; background: transparent; outline: none; font-size: 13px; font-weight: 600; width: 100%; }

        .posts-grid-premium { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 25px; padding: 30px; flex: 1; }
        .post-card-premium { background: white; border-radius: 24px; border: 1px solid #f1f5f9; overflow: hidden; transition: all 0.3s; display: flex; flex-direction: column; position: relative; }
        .post-card-premium:hover { transform: translateY(-8px); box-shadow: 0 20px 40px -15px rgba(0,0,0,0.1); border-color: #e2e8f0; }
        
        .post-visual { height: 180px; background: #f8fafc; position: relative; overflow: hidden; }
        .post-visual img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
        .post-card-premium:hover .post-visual img { transform: scale(1.1); }
        .post-status-tag { position: absolute; top: 15px; left: 15px; background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(4px); color: white; padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: 800; text-transform: uppercase; }
        
        .post-actions-overlay { position: absolute; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; gap: 12px; opacity: 0; transition: all 0.3s; }
        .post-visual:hover .post-actions-overlay { opacity: 1; }
        .action-circle { width: 44px; height: 44px; border-radius: 50%; background: white; border: none; color: #0f172a; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
        .action-circle:hover { transform: scale(1.1); background: #3b82f6; color: white; }
        .action-circle.delete:hover { background: #ef4444; }

        .post-content-area { padding: 25px; flex: 1; display: flex; flex-direction: column; }
        .post-meta-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .category-tag-premium { font-size: 9px; font-weight: 800; color: #3b82f6; text-transform: uppercase; background: #eff6ff; padding: 3px 8px; border-radius: 5px; }
        .read-time { font-size: 11px; color: #94a3b8; font-weight: 600; display: flex; align-items: center; gap: 4px; }
        
        .post-title { margin: 0 0 10px; font-size: 16px; font-weight: 800; color: #0f172a; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .post-excerpt { margin: 0 0 20px; font-size: 13px; color: #64748b; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        
        .post-footer-premium { padding-top: 15px; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; margin-top: auto; }
        .author-group { display: flex; align-items: center; gap: 8px; }
        .author-avatar { width: 24px; height: 24px; border-radius: 50%; background: #f1f5f9; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800; border: 1px solid #e2e8f0; }
        .author-name { font-size: 11px; font-weight: 700; color: #1e293b; }
        .jump-icon { color: #cbd5e1; }

        /* Side Modal */
        .inspector-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(8px); z-index: 2000; display: flex; justify-content: flex-end; }
        .side-modal { width: 480px; height: 100%; background: white; box-shadow: -20px 0 60px rgba(0,0,0,0.1); animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); display: flex; flex-direction: column; position: relative; }
        .side-modal.manuscript-editor { width: 680px; }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        
        .inspector-header { padding: 40px; border-bottom: 1px solid #f1f5f9; }
        .id-tag { font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 800; color: #3b82f6; background: #eff6ff; padding: 6px 12px; border-radius: 8px; width: fit-content; }
        .inspector-header h3 { margin: 15px 0 0; font-size: 22px; font-weight: 800; color: #0f172a; }
        .close-btn { position: absolute; right: 30px; top: 35px; background: none; border: none; font-size: 32px; color: #94a3b8; cursor: pointer; line-height: 1; }
        
        .inspector-body { padding: 40px; flex: 1; overflow-y: auto; }
        .inspector-section { margin-bottom: 40px; }
        .inspector-section label { display: block; font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 15px; }
        .manuscript-input-premium { font-family: 'Inter', sans-serif; line-height: 1.6; font-size: 15px; resize: vertical; min-height: 300px; }

        .modal-footer-custom { padding: 30px 40px; border-top: 1px solid #f1f5f9; display: grid; gap: 12px; }
        .save-btn { background: #0f172a; color: white; border: none; padding: 18px; border-radius: 18px; font-weight: 800; cursor: pointer; transition: all 0.2s; }
        .cancel-btn { background: transparent; border: 1px solid #e2e8f0; padding: 16px; border-radius: 18px; color: #64748b; font-weight: 700; cursor: pointer; }

        .loading-state-blog, .empty-state-blog { grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; color: #94a3b8; }
        .loading-state-blog p, .empty-state-blog p { margin-top: 15px; font-weight: 700; }
        .spin { animation: spin 2s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        .animate-fade { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 1400px) {
          .layout-grid { grid-template-columns: 1fr; }
          .composition-panel { position: static; margin-bottom: 40px; max-width: 100%; }
          .editorial-header-premium { flex-direction: column; align-items: flex-start; }
        }

        @media (max-width: 768px) {
          .blog-orchestrator { padding: 20px; }
          .glass-stats { flex-direction: column; gap: 15px; width: 100%; padding: 20px; }
          .stat-divider { width: 100%; height: 1px; }
          .ledger-header { flex-direction: column; align-items: flex-start; gap: 15px; }
          .search-pill { width: 100%; }
          .side-modal { width: 100%; }
          .side-modal.manuscript-editor { width: 100%; }
          .posts-grid-premium { grid-template-columns: 1fr; padding: 15px; }
        }
      `}} />
    </div>
  );
};

export default BlogManager;
