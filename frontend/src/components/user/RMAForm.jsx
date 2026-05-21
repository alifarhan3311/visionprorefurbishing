import React, { useState } from 'react';
import { Search, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import api from '../../services/api';
import '../admin/AdminForms.css';

const RMAForm = () => {
  const [searchMethod, setSearchMethod] = useState('order');
  const [searchValue, setSearchValue] = useState('');
  const [isSearched, setIsSearched] = useState(false);
  const [reason, setReason] = useState('Defective / Does Not Power On');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [alertConfig, setAlertConfig] = useState({
    show: false,
    type: 'success', // 'success', 'warning', 'error'
    title: '',
    message: ''
  });

  const showAlert = (type, title, message) => {
    setAlertConfig({ show: true, type, title, message });
  };

  const closeAlert = () => {
    setAlertConfig(prev => ({ ...prev, show: false }));
  };

  const handleSearch = () => {
    if (searchValue.trim() !== '') {
      setIsSearched(true);
    } else {
      showAlert('warning', 'Search Value Required', 'Please enter a valid Order ID or device IMEI to locate the item.');
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await api.post('/rmas', {
        searchMethod,
        searchValue,
        itemDetails: 'iPhone 15 Pro Max - Pre-Owned (Grade A)', // Mock item details
        reason,
        description
      });
      if (response.data.success) {
        showAlert(
          'success',
          'RMA Claim Submitted!',
          'Your order return request has been submitted successfully. The administrator has been notified and you will receive an email update once the status is updated.'
        );
        setIsSearched(false);
        setSearchValue('');
        setDescription('');
      }
    } catch (error) {
      console.error("Error submitting RMA:", error);
      showAlert(
        'error',
        'Submission Failed',
        'There was an unexpected error processing your RMA request. Please try again or reach out to our dealer support desk.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="user-page-title">RMA & Returns</h1>
      <p style={{ marginBottom: '25px', color: '#64748b' }}>
        Start a return process for defective parts or devices. Please provide your Order ID or IMEI number.
      </p>

      {/* Search Section */}
      <div className="user-card" style={{ marginBottom: '25px' }}>
        <div className="search-options">
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input 
              type="radio" 
              checked={searchMethod === 'order'} 
              onChange={() => setSearchMethod('order')} 
            /> Find by Order ID
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input 
              type="radio" 
              checked={searchMethod === 'imei'} 
              onChange={() => setSearchMethod('imei')} 
            /> Find by IMEI / Serial (Devices Only)
          </label>
        </div>

        <div className="search-inputs">
          <input 
            type="text" 
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={searchMethod === 'order' ? 'e.g. ORD-109283' : 'Enter 15-digit IMEI...'}
            style={{ flex: 1, padding: '10px 15px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
          />
          <button 
            className="admin-btn-primary" 
            onClick={handleSearch}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Search size={18} /> Locate Item
          </button>
        </div>
      </div>

      {/* Results Section (Simulated) */}
      {isSearched && (
        <div className="user-card" style={{ borderLeft: '4px solid var(--primary-color)' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '15px' }}>Item Found</h3>
          
          <div style={{ padding: '15px', backgroundColor: '#f8fafc', borderRadius: '6px', marginBottom: '20px' }}>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>iPhone 15 Pro Max - Pre-Owned (Grade A)</div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '5px' }}>IMEI: 358920193847291 • Purchased on: Oct 12, 2025</div>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label>Reason for Return</label>
              <select value={reason} onChange={(e) => setReason(e.target.value)}>
                <option value="Defective / Does Not Power On">Defective / Does Not Power On</option>
                <option value="Cosmetic Condition not as described">Cosmetic Condition not as described</option>
                <option value="Wrong item received">Wrong item received</option>
                <option value="Carrier locked">Carrier locked</option>
              </select>
            </div>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label>Detailed Description</label>
              <textarea 
                rows="4" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe the issue in detail. This helps our technicians verify the problem faster..."
              ></textarea>
            </div>
          </div>

          <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', padding: '15px', borderRadius: '6px', display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '20px' }}>
            <AlertTriangle size={20} color="#d97706" style={{ flexShrink: 0 }} />
            <p style={{ fontSize: '13px', color: '#92400e', margin: 0, lineHeight: 1.5 }}>
              <strong>Important:</strong> Devices must have iCloud/Google accounts removed before returning. Failure to remove activation locks will result in the package being returned to you at your expense.
            </p>
          </div>

          <button 
            className="admin-btn-primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit RMA Request'}
          </button>
        </div>
      )}
      {/* Premium Glassmorphism Alert Modal */}
      {alertConfig.show && (
        <div className="alert-overlay animate-fadeIn" onClick={closeAlert}>
          <div className="alert-card animate-scaleIn" onClick={e => e.stopPropagation()}>
            <div className={`alert-icon-wrapper ${alertConfig.type}`}>
              {alertConfig.type === 'success' && <CheckCircle2 size={40} className="alert-icon success-icon" />}
              {alertConfig.type === 'warning' && <AlertTriangle size={40} className="alert-icon warning-icon" />}
              {alertConfig.type === 'error' && <XCircle size={40} className="alert-icon error-icon" />}
            </div>
            <h2 className="alert-title">{alertConfig.title}</h2>
            <p className="alert-message">{alertConfig.message}</p>
            <button 
              className={`alert-close-btn ${alertConfig.type}`} 
              onClick={closeAlert}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .search-options { display: flex; gap: 20px; margin-bottom: 15px; }
        .search-inputs { display: flex; gap: 15px; }
        @media (max-width: 768px) {
          .search-options { flex-direction: column; gap: 10px; }
          .search-inputs { flex-direction: column; }
        }

        /* Premium Glassmorphism Alert Overlay */
        .alert-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Glassmorphism Alert Card */
        .alert-card {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 24px;
          padding: 45px 35px;
          max-width: 440px;
          width: 90%;
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.85);
          box-shadow: 0 25px 60px -15px rgba(15, 23, 42, 0.25);
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: all 0.3s ease;
        }

        /* Elegant Pulsing Icon Wrapper */
        .alert-icon-wrapper {
          width: 84px;
          height: 84px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
        }

        .alert-icon-wrapper.success {
          background-color: #ecfdf5;
          color: #10b981;
          animation: pulseSuccess 2.5s infinite;
        }

        .alert-icon-wrapper.warning {
          background-color: #fffbeb;
          color: #f59e0b;
          animation: pulseWarning 2.5s infinite;
        }

        .alert-icon-wrapper.error {
          background-color: #fff1f2;
          color: #f43f5e;
          animation: pulseError 2.5s infinite;
        }

        .alert-icon {
          stroke-width: 2.2px;
        }

        /* Bold Premium Typography */
        .alert-title {
          font-size: 24px;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0 0 12px 0;
          letter-spacing: -0.02em;
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        }

        .alert-message {
          font-size: 15px;
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0 0 32px 0;
          font-weight: 500;
        }

        /* Premium Interaction Button */
        .alert-close-btn {
          width: 100%;
          padding: 15px 28px;
          border-radius: 14px;
          font-size: 15px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          outline: none;
        }

        .alert-close-btn.success {
          background-color: #10b981;
          color: white;
        }
        .alert-close-btn.success:hover {
          background-color: #059669;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.35);
        }
        .alert-close-btn.success:active {
          transform: translateY(0);
        }

        .alert-close-btn.warning {
          background-color: #f59e0b;
          color: white;
        }
        .alert-close-btn.warning:hover {
          background-color: #d97706;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(245, 158, 11, 0.35);
        }
        .alert-close-btn.warning:active {
          transform: translateY(0);
        }

        .alert-close-btn.error {
          background-color: #f43f5e;
          color: white;
        }
        .alert-close-btn.error:hover {
          background-color: #e11d48;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(244, 63, 94, 0.35);
        }
        .alert-close-btn.error:active {
          transform: translateY(0);
        }

        /* Animation Keyframes */
        .animate-fadeIn {
          animation: alertFadeIn 0.3s ease-out forwards;
        }

        .animate-scaleIn {
          animation: alertScaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        @keyframes alertFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes alertScaleIn {
          from {
            transform: scale(0.92) translateY(15px);
            opacity: 0;
          }
          to {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }

        @keyframes pulseSuccess {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.45); }
          70% { box-shadow: 0 0 0 14px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        @keyframes pulseWarning {
          0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.45); }
          70% { box-shadow: 0 0 0 14px rgba(245, 158, 11, 0); }
          100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
        }

        @keyframes pulseError {
          0% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0.45); }
          70% { box-shadow: 0 0 0 14px rgba(244, 63, 94, 0); }
          100% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0); }
        }
      `}} />
    </div>
  );
};

export default RMAForm;
