import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, XCircle, Trash2, ShieldAlert, Sparkles } from 'lucide-react';
import api from '../../../services/api';
import '../AdminForms.css';

const ReviewsManager = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'approved'
  const [actionMsg, setActionMsg] = useState('');

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/reviews/admin');
      if (data.success) {
        setReviews(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching admin reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleToggleApproval = async (id) => {
    try {
      const { data } = await api.put(`/reviews/${id}/approve`);
      if (data.success) {
        setActionMsg('Review status updated successfully');
        fetchReviews();
        setTimeout(() => setActionMsg(''), 3000);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update review status');
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review permanently?')) return;
    try {
      const { data } = await api.delete(`/reviews/${id}`);
      if (data.success) {
        setActionMsg('Review deleted successfully');
        fetchReviews();
        setTimeout(() => setActionMsg(''), 3000);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete review');
    }
  };

  const pendingReviews = reviews.filter(r => !r.approved);
  const approvedReviews = reviews.filter(r => r.approved);
  const displayedReviews = activeTab === 'pending' ? pendingReviews : approvedReviews;

  return (
    <div className="container" style={{ padding: '30px 20px', minHeight: '80vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 className="user-page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={28} color="#3b82f6" /> Reviews Moderation Center
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
            Audit and approve business testimonials before publishing them live to the storefront.
          </p>
        </div>
      </div>

      {actionMsg && (
        <div style={{
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          color: '#166534',
          padding: '12px 20px',
          borderRadius: '12px',
          marginBottom: '20px',
          fontWeight: '600',
          fontSize: '13px'
        }}>
          {actionMsg}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('pending')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: '700',
            fontSize: '14px',
            cursor: 'pointer',
            backgroundColor: activeTab === 'pending' ? '#eff6ff' : 'transparent',
            color: activeTab === 'pending' ? '#2563eb' : '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          Pending Approvals
          <span style={{
            fontSize: '11px',
            padding: '2px 6px',
            borderRadius: '6px',
            backgroundColor: activeTab === 'pending' ? '#2563eb' : '#e2e8f0',
            color: activeTab === 'pending' ? 'white' : '#475569'
          }}>
            {pendingReviews.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('approved')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            fontWeight: '700',
            fontSize: '14px',
            cursor: 'pointer',
            backgroundColor: activeTab === 'approved' ? '#eff6ff' : 'transparent',
            color: activeTab === 'approved' ? '#2563eb' : '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          Approved Reviews
          <span style={{
            fontSize: '11px',
            padding: '2px 6px',
            borderRadius: '6px',
            backgroundColor: activeTab === 'approved' ? '#2563eb' : '#e2e8f0',
            color: activeTab === 'approved' ? 'white' : '#475569'
          }}>
            {approvedReviews.length}
          </span>
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>Loading records...</div>
      ) : displayedReviews.length === 0 ? (
        <div className="user-card" style={{ textAlign: 'center', padding: '50px 20px' }}>
          <ShieldAlert size={48} style={{ color: '#94a3b8', margin: '0 auto 15px auto' }} />
          <h3>No reviews found</h3>
          <p style={{ marginTop: '5px', color: '#64748b', fontSize: '14px' }}>
            {activeTab === 'pending' ? 'All reviews have been audited!' : 'No reviews approved yet.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {displayedReviews.map((review) => (
            <div key={review._id} className="user-card" style={{ display: 'flex', flexDirection: 'column', gap: '15px', position: 'relative' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>{review.fullName}</h4>
                  {review.company && (
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8' }}>
                      {review.company}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill={i < review.rating ? '#eab308' : 'none'}
                      color={i < review.rating ? '#eab308' : '#cbd5e1'}
                    />
                  ))}
                </div>
              </div>

              <p style={{
                color: '#475569',
                fontSize: '13.5px',
                lineHeight: '1.6',
                fontStyle: 'italic',
                background: '#f8fafc',
                padding: '12px',
                borderRadius: '8px',
                flexGrow: 1
              }}>
                "{review.comment}"
              </p>

              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700' }}>
                Submitted: {new Date(review.createdAt).toLocaleString()}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px', paddingTop: '15px', borderTop: '1px solid #f1f5f9' }}>
                <button
                  onClick={() => handleToggleApproval(review._id)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: '700',
                    fontSize: '12px',
                    cursor: 'pointer',
                    backgroundColor: review.approved ? '#fef2f2' : '#eff6ff',
                    color: review.approved ? '#ef4444' : '#2563eb',
                    transition: 'all 0.2s'
                  }}
                >
                  {review.approved ? (
                    <>
                      <XCircle size={14} /> Unapprove
                    </>
                  ) : (
                    <>
                      <CheckCircle size={14} /> Approve
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleDeleteReview(review._id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #fee2e2',
                    backgroundColor: '#fff5f5',
                    color: '#ef4444',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  title="Delete review permanently"
                >
                  <Trash2 size={15} />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsManager;
