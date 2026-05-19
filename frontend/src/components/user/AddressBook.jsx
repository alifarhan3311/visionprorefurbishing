import React from 'react';
import { MapPin, Plus } from 'lucide-react';
import './UserLayout.css';

const AddressBook = () => {
  return (
    <div>
      <div className="address-header">
        <div>
          <h1 className="user-page-title">Address Book</h1>
          <p style={{ color: '#64748b' }}>Manage your shipping and billing addresses.</p>
        </div>
        <button className="admin-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Add New Address
        </button>
      </div>

      <div className="address-grid">
        <div className="user-card" style={{ border: '2px solid var(--primary-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={18} color="var(--primary-color)" /> Default Shipping
            </h3>
            <span style={{ fontSize: '12px', background: '#dbeafe', color: '#1e40af', padding: '4px 8px', borderRadius: '12px', fontWeight: 600 }}>Default</span>
          </div>
          <div style={{ fontSize: '14px', color: '#334155', lineHeight: '1.6' }}>
            <strong>My Repair Shop</strong><br />
            John Doe<br />
            123 Tech Lane, Suite 100<br />
            New York, NY 10001<br />
            United States<br />
            Phone: (555) 123-4567
          </div>
          <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
            <button className="admin-btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }}>Edit</button>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .address-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
        .address-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        @media (max-width: 768px) {
          .address-header { flex-direction: column; align-items: flex-start; gap: 15px; }
          .address-grid { grid-template-columns: 1fr; }
        }
      `}} />
    </div>
  );
};

export default AddressBook;
