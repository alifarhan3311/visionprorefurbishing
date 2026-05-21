import React, { useState, useEffect } from 'react';
import { Package, FileText, Download } from 'lucide-react';
import api from '../../services/api';
import './UserLayout.css';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/myorders');
        if (data.success) {
          setOrders(data.data);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const downloadInvoice = async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}/invoice`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert('Failed to download invoice');
    }
  };

  return (
    <div>
      <h1 className="user-page-title">Order History</h1>
      <p style={{ marginBottom: '25px', color: '#64748b' }}>
        Track your recent orders and download invoices for your records.
      </p>

      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <div className="user-card">
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            <Package size={48} style={{ color: '#cbd5e1', marginBottom: '15px' }} />
            <h3>No Orders Found</h3>
            <p>You haven't placed any orders yet.</p>
          </div>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="user-card" style={{ marginBottom: '20px' }}>
              <div className="order-card-header">
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 700 }}>Order ID: {order._id}</h4>
                  <p style={{ fontSize: '13px', color: '#64748b' }}>Placed on: {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary-color)' }}>
                    ${order.totalPrice.toFixed(2)}
                  </div>
                  <span style={{ 
                    fontSize: '11px', 
                    padding: '2px 8px', 
                    borderRadius: '10px', 
                    backgroundColor: order.isPaid ? '#dcfce7' : '#fee2e2',
                    color: order.isPaid ? '#166534' : '#991b1b',
                    fontWeight: 600
                  }}>
                    {order.isPaid ? 'PAID' : 'PAYMENT PENDING'}
                  </span>
                </div>
              </div>

              <div className="order-card-footer">
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  {order.orderItems.length} items • Status: {order.isDelivered ? 'Delivered' : 'Processing'}
                </div>
                <button 
                  onClick={() => downloadInvoice(order._id)}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    background: 'none', 
                    border: '1px solid var(--primary-color)', 
                    color: 'var(--primary-color)',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 600
                  }}
                >
                  <Download size={14} /> Download Invoice
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <style dangerouslySetInnerHTML={{ __html: `
        .order-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; }
        .order-card-footer { border-top: 1px solid #f1f5f9; padding-top: 15px; display: flex; justify-content: space-between; align-items: center; }
        @media (max-width: 768px) {
          .order-card-header { flex-direction: column; gap: 10px; }
          .order-card-header > div:last-child { text-align: left !important; }
          .order-card-footer { flex-direction: column; gap: 15px; align-items: flex-start; }
        }
      `}} />
    </div>
  );
};

export default MyOrders;
