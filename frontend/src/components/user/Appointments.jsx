import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Wrench, X, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import './UserLayout.css';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    serviceType: 'Screen Repair',
    date: '',
    time: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/appointments/my');
      if (response.data.success) {
        setAppointments(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await api.post('/appointments', formData);
      if (response.data.success) {
        setAppointments([response.data.data, ...appointments]);
        setShowModal(false);
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          serviceType: 'Screen Repair',
          date: '',
          time: '',
          notes: ''
        });
        alert('Appointment booked successfully!');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="appointments-header">
        <div>
          <h1 className="user-page-title">Repair Appointments</h1>
          <p style={{ color: '#64748b' }}>Book and manage in-store repair service appointments.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="admin-btn-primary" 
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Calendar size={18} /> Book New Appointment
        </button>
      </div>

      <div className="user-card">
        {loading ? (
          <p>Loading appointments...</p>
        ) : appointments.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
            {appointments.map((app) => (
              <div key={app._id} className="appointment-card">
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <div style={{ backgroundColor: '#f1f5f9', padding: '10px', borderRadius: '8px', color: '#3b82f6' }}>
                    <Clock size={24} />
                  </div>
                  <div>
                    <h4 style={{ fontWeight: '600', marginBottom: '2px' }}>{app.serviceType}</h4>
                    <p style={{ fontSize: '13px', color: '#64748b' }}>
                      <Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} /> {app.date} at {app.time}
                    </p>
                  </div>
                </div>
                <div>
                  <span style={{ 
                    backgroundColor: app.status === 'Scheduled' ? '#dbeafe' : '#dcfce7', 
                    color: app.status === 'Scheduled' ? '#1e40af' : '#166534', 
                    padding: '4px 10px', 
                    borderRadius: '12px', 
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {app.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            <Wrench size={48} style={{ color: '#cbd5e1', marginBottom: '15px' }} />
            <h3>No Upcoming Appointments</h3>
            <p>You do not have any scheduled repair appointments.</p>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content" style={{ maxWidth: '500px' }}>
            <div className="admin-modal-header">
              <h2>Book Repair Appointment</h2>
              <button className="admin-close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="admin-modal-body">
              <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                <input 
                  type="text" name="fullName" placeholder="Full Name" required 
                  value={formData.fullName} onChange={handleInputChange}
                  style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                />
                <div className="form-grid">
                  <input 
                    type="email" name="email" placeholder="Email" required 
                    value={formData.email} onChange={handleInputChange}
                    style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                  />
                  <input 
                    type="tel" name="phone" placeholder="Phone" required 
                    value={formData.phone} onChange={handleInputChange}
                    style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                  />
                </div>
                <select 
                  name="serviceType" value={formData.serviceType} onChange={handleInputChange}
                  style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                >
                  <option value="Screen Repair">Screen Repair</option>
                  <option value="Battery Replacement">Battery Replacement</option>
                  <option value="Board Level Repair">Board Level Repair</option>
                  <option value="Heavy Machinery Service">Heavy Machinery Service</option>
                  <option value="Other">Other</option>
                </select>
                <div className="form-grid">
                  <input 
                    type="date" name="date" required 
                    value={formData.date} onChange={handleInputChange}
                    style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                  />
                  <input 
                    type="time" name="time" required 
                    value={formData.time} onChange={handleInputChange}
                    style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                  />
                </div>
                <textarea 
                  name="notes" placeholder="Additional Notes (Optional)" rows="3"
                  value={formData.notes} onChange={handleInputChange}
                  style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                ></textarea>
                <button 
                  type="submit" disabled={submitting}
                  className="admin-btn-primary" 
                  style={{ marginTop: '10px', backgroundColor: '#3b82f6' }}
                >
                  {submitting ? 'Booking...' : 'Confirm Appointment'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      <style dangerouslySetInnerHTML={{ __html: `
        .appointments-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
        .appointment-card { display: flex; justify-content: space-between; align-items: center; padding: 15px; border: 1px solid #e2e8f0; border-radius: 8px; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; }
        @media (max-width: 768px) {
          .appointments-header { flex-direction: column; align-items: flex-start; gap: 15px; }
          .appointment-card { flex-direction: column; align-items: flex-start; gap: 15px; }
          .form-grid { grid-template-columns: 1fr; }
        }
      `}} />
    </div>
  );
};

export default Appointments;
