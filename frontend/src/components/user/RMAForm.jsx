import React, { useState } from 'react';
import { Search, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import '../admin/AdminForms.css';

const RMAForm = () => {
  const [searchMethod, setSearchMethod] = useState('order');
  const [searchValue, setSearchValue] = useState('');
  const [isSearched, setIsSearched] = useState(false);
  const [reason, setReason] = useState('Defective / Does Not Power On');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSearch = () => {
    if (searchValue.trim() !== '') {
      setIsSearched(true);
    } else {
      alert('Please enter a value to search');
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
        alert('RMA Request submitted successfully!');
        setIsSearched(false);
        setSearchValue('');
        setDescription('');
      }
    } catch (error) {
      console.error("Error submitting RMA:", error);
      alert('Error submitting RMA');
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
            <div style={{ fontWeight: 600, color: '#0f172a' }}>iPhone 15 Pro Max - Pre-Owned (Grade A)</div>
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
      <style dangerouslySetInnerHTML={{ __html: `
        .search-options { display: flex; gap: 20px; margin-bottom: 15px; }
        .search-inputs { display: flex; gap: 15px; }
        @media (max-width: 768px) {
          .search-options { flex-direction: column; gap: 10px; }
          .search-inputs { flex-direction: column; }
        }
      `}} />
    </div>
  );
};

export default RMAForm;
