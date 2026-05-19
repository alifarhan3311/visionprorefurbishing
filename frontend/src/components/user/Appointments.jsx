import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Wrench } from 'lucide-react';
import api from '../../services/api';
import './UserLayout.css';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div>
      <div className="appointments-header">
        <div>
          <h1 className="user-page-title">Repair Appointments</h1>
          <p style={{ color: '#64748b' }}>Track the status of your booked repair appointments.</p>
        </div>
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
            <h3>No Scheduled Appointments</h3>
            <p>Go to the homepage to book a repair service appointment with our expert technicians.</p>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .appointments-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
        .appointment-card { display: flex; justify-content: space-between; align-items: center; padding: 15px; border: 1px solid #e2e8f0; border-radius: 8px; }
        @media (max-width: 768px) {
          .appointments-header { flex-direction: column; align-items: flex-start; gap: 15px; }
          .appointment-card { flex-direction: column; align-items: flex-start; gap: 15px; }
        }
      `}} />
    </div>
  );
};

export default Appointments;
