import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Info, Calculator, FileText, CheckCircle2, XCircle } from 'lucide-react';
import api from '../../services/api';
import '../admin/AdminForms.css';

const LCDBuybackForm = () => {
  const [pricingData, setPricingData] = useState([]);
  const [rows, setRows] = useState([{ id: Date.now(), brand: '', modelId: '', condition: '', qty: 1, unitPrice: 0 }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [myBuybacks, setMyBuybacks] = useState([]);
  const [modal, setModal] = useState({
    show: false,
    type: 'success',
    title: '',
    message: '',
    subMessage: ''
  });

  const fetchMyBuybacks = async () => {
    try {
      const { data } = await api.get('/buybacks/mybuybacks');
      if (data.success) {
        setMyBuybacks(data.data);
      }
    } catch (error) {
      console.error('Error fetching user buybacks:', error);
    }
  };

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const { data } = await api.get('/buybacks/pricing');
        if (data.success) {
          setPricingData(data.data);
          // Set initial row values if data exists
          if (data.data.length > 0) {
            updateRow(0, 'brand', data.data[0].brand);
          }
        }
      } catch (error) {
        console.error('Error fetching buyback pricing:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPricing();
    fetchMyBuybacks();
  }, []);

  const addRow = () => {
    setRows([...rows, { id: Date.now(), brand: '', modelId: '', condition: '', qty: 1, unitPrice: 0 }]);
  };

  const removeRow = (id) => {
    if (rows.length > 1) {
      setRows(rows.filter(r => r.id !== id));
    }
  };

  const updateRow = (index, field, value) => {
    const newRows = [...rows];
    newRows[index][field] = value;

    // Auto-fill logic
    if (field === 'brand') {
      const firstModel = pricingData.find(p => p.brand === value);
      newRows[index].modelId = firstModel ? firstModel._id : '';
      newRows[index].condition = '';
      newRows[index].unitPrice = 0;
    }

    if (field === 'modelId') {
      const model = pricingData.find(p => p._id === value);
      newRows[index].condition = model && model.conditions.length > 0 ? model.conditions[0].grade : '';
      newRows[index].unitPrice = model && model.conditions.length > 0 ? model.conditions[0].price : 0;
    }

    if (field === 'condition') {
      const model = pricingData.find(p => p._id === newRows[index].modelId);
      const conditionData = model?.conditions.find(c => c.grade === value);
      newRows[index].unitPrice = conditionData ? conditionData.price : 0;
    }

    setRows(newRows);
  };

  const calculateTotal = () => {
    return rows.reduce((acc, row) => acc + (row.unitPrice * row.qty), 0);
  };

  const handleSubmit = async () => {
    if (calculateTotal() === 0) {
      setModal({
        show: true,
        type: 'error',
        title: 'Empty Request',
        message: 'Please add at least one valid screen before submitting.',
        subMessage: 'Ensure brand, model, and condition are selected correctly.'
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        screens: rows.map(r => ({
          brand: r.brand,
          model: pricingData.find(p => p._id === r.modelId)?.model,
          condition: r.condition,
          qty: r.qty
        })),
        estimatedValue: calculateTotal()
      };
      const response = await api.post('/buybacks', payload);
      if (response.data.success) {
        setModal({
          show: true,
          type: 'success',
          title: 'Ticket Created Successfully!',
          message: 'Your LCD Buyback Ticket has been registered in our database.',
          subMessage: 'Please prepare your package and print the wholesale shipping label from your dashboard.'
        });
        setRows([{ id: Date.now(), brand: '', modelId: '', condition: '', qty: 1, unitPrice: 0 }]);
        fetchMyBuybacks();
      }
    } catch (error) {
      setModal({
        show: true,
        type: 'error',
        title: 'Submission Failed',
        message: 'We encountered an error while creating your buyback ticket.',
        subMessage: error.response?.data?.error || 'Please check your connection and try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div style={{padding: '40px'}}>Loading Buyback Catalog...</div>;

  const uniqueBrands = [...new Set(pricingData.map(p => p.brand))];

  return (
    <div className="buyback-portal">
      <div className="admin-page-header">
        <h1 className="user-page-title">LCD Buyback Program</h1>
        <p style={{ color: '#64748b' }}>Convert your broken LCDs into instant store credit.</p>
      </div>

      <div className="user-card" style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
          <Info size={20} color="var(--primary-color)" />
          <p style={{ fontSize: '13px', color: '#475569' }}>
            Prices are based on current market value and are finalized after our technician's physical inspection.
          </p>
        </div>

        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
              <th style={{ padding: '12px' }}>Brand</th>
              <th style={{ padding: '12px' }}>Model</th>
              <th style={{ padding: '12px' }}>Condition</th>
              <th style={{ padding: '12px', width: '100px' }}>Qty</th>
              <th style={{ padding: '12px' }}>Subtotal</th>
              <th style={{ padding: '12px' }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '10px' }}>
                  <select 
                    value={row.brand} 
                    onChange={(e) => updateRow(index, 'brand', e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                  >
                    <option value="">Select Brand</option>
                    {uniqueBrands.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </td>
                <td style={{ padding: '10px' }}>
                  <select 
                    value={row.modelId} 
                    onChange={(e) => updateRow(index, 'modelId', e.target.value)}
                    disabled={!row.brand}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                  >
                    <option value="">Select Model</option>
                    {pricingData.filter(p => p.brand === row.brand).map(m => (
                      <option key={m._id} value={m._id}>{m.model}</option>
                    ))}
                  </select>
                </td>
                <td style={{ padding: '10px' }}>
                  <select 
                    value={row.condition} 
                    onChange={(e) => updateRow(index, 'condition', e.target.value)}
                    disabled={!row.modelId}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                  >
                    <option value="">Select Condition</option>
                    {pricingData.find(p => p._id === row.modelId)?.conditions.map(c => (
                      <option key={c.grade} value={c.grade}>{c.grade} (${c.price})</option>
                    ))}
                  </select>
                </td>
                <td style={{ padding: '10px' }}>
                  <input 
                    type="number" 
                    value={row.qty} 
                    min="1"
                    onChange={(e) => updateRow(index, 'qty', parseInt(e.target.value))}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                  />
                </td>
                <td style={{ padding: '10px', fontWeight: 700 }}>
                  ${(row.unitPrice * row.qty).toFixed(2)}
                </td>
                <td style={{ padding: '10px' }}>
                  <button onClick={() => removeRow(row.id)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        <button onClick={addRow} style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-color)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
          <Plus size={18} /> Add Another Screen
        </button>
      </div>

      <div className="user-card buyback-summary">
        <div className="summary-content">
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 800 }}>Estimated Buyback Value</h3>
            <p style={{ opacity: 0.9, fontSize: '14px' }}>Submission ID: {Date.now().toString().slice(-6)}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '42px', fontWeight: 900 }}>${calculateTotal().toFixed(2)}</div>
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="admin-btn-primary" 
              style={{ backgroundColor: 'white', color: '#059669', border: 'none', marginTop: '15px', fontWeight: 800, padding: '12px 30px' }}
            >
              {isSubmitting ? 'Processing...' : 'Submit Buyback Ticket'}
            </button>
          </div>
        </div>
      </div>

      {/* User's Buyback History Section */}
      <div className="user-card" style={{ marginTop: '40px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FileText size={20} color="var(--primary-color)" /> My Buyback History
        </h2>
        {myBuybacks.length === 0 ? (
          <p style={{ color: '#64748b', fontSize: '14px', textAlign: 'center', padding: '30px' }}>
            You haven't submitted any buyback tickets yet.
          </p>
        ) : (
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9', color: '#475569', fontSize: '13px' }}>
                  <th style={{ padding: '12px' }}>Date</th>
                  <th style={{ padding: '12px' }}>Ticket ID</th>
                  <th style={{ padding: '12px' }}>Items Details</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Est. Value</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {myBuybacks.map((bb) => (
                  <tr key={bb._id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '14px' }}>
                    <td style={{ padding: '12px', color: '#64748b' }}>
                      {new Date(bb.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '12px', fontWeight: 600, color: '#334155', fontFamily: 'monospace' }}>
                      #{bb._id.toString().slice(-6).toUpperCase()}
                    </td>
                    <td style={{ padding: '12px', color: '#475569', maxWidth: '300px', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                      {bb.screens?.map((s, idx) => (
                        <div key={idx} style={{ fontSize: '12px', margin: '2px 0' }}>
                          <span style={{ fontWeight: 600 }}>{s.brand}</span> {s.model} ({s.condition}) <span style={{ color: '#94a3b8' }}>x{s.qty}</span>
                        </div>
                      ))}
                    </td>
                    <td style={{ padding: '12px', fontWeight: 700, color: '#059669', textAlign: 'right' }}>
                      ${Number(bb.estimatedValue || 0).toFixed(2)}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span className={`status-pill ${bb.status?.toLowerCase().replace(' ', '-')}`}>
                        {bb.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Premium Modal Alert */}
      {modal.show && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-icon-container">
              <div className={`modal-icon-circle ${modal.type}`}>
                {modal.type === 'success' ? <CheckCircle2 size={38} /> : <XCircle size={38} />}
              </div>
            </div>
            <h2>{modal.title}</h2>
            <p className="msg">{modal.message}</p>
            {modal.subMessage && <p className="sub-msg">{modal.subMessage}</p>}
            <button 
              className={`modal-btn ${modal.type}`} 
              onClick={() => setModal({ ...modal, show: false })}
            >
              Okay, Got It
            </button>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .table-responsive { width: 100%; overflow-x: auto; }
        .buyback-summary { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; }
        .summary-content { display: flex; justify-content: space-between; align-items: center; }
        @media (max-width: 768px) {
          .summary-content { flex-direction: column; align-items: flex-start; gap: 20px; }
          .summary-content > div:last-child { text-align: left !important; }
        }

        /* Status Pills */
        .status-pill {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 100px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          white-space: nowrap;
        }
        .status-pill.pending {
          background: #fef3c7;
          color: #d97706;
          border: 1px solid #fde68a;
        }
        .status-pill.approved {
          background: #eff6ff;
          color: #2563eb;
          border: 1px solid #bfdbfe;
        }
        .status-pill.confirm-payment, .status-pill.payment-confirmed, .status-pill.paid {
          background: #ecfdf5;
          color: #059669;
          border: 1px solid #a7f3d0;
        }
        .status-pill.rejected, .status-pill.cancelled {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fca5a5;
        }

        /* Premium Modal Styles */
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 5000;
          animation: modalFadeIn 0.25s ease-out;
        }
        .modal-card {
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid rgba(226, 232, 240, 0.8);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 40px rgba(59, 130, 246, 0.03);
          border-radius: 24px;
          padding: 35px;
          width: 480px;
          max-width: 90%;
          text-align: center;
          transform: scale(1);
          animation: modalScaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .modal-icon-container {
          margin-bottom: 20px;
          display: flex;
          justify-content: center;
        }
        .modal-icon-circle {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: iconScale 0.4s 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
        }
        .modal-icon-circle.success {
          background: #ecfdf5;
          color: #10b981;
          border: 2px solid #a7f3d0;
        }
        .modal-icon-circle.error {
          background: #fef2f2;
          color: #ef4444;
          border: 2px solid #fca5a5;
        }
        .modal-card h2 {
          font-size: 20px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 12px;
          letter-spacing: -0.02em;
        }
        .modal-card .msg {
          font-size: 14px;
          color: #475569;
          font-weight: 500;
          line-height: 1.5;
          margin-bottom: 15px;
        }
        .modal-card .sub-msg {
          font-size: 12px;
          color: #64748b;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 12px 16px;
          border-radius: 12px;
          line-height: 1.5;
          margin-bottom: 25px;
        }
        .modal-btn {
          width: 100%;
          padding: 12px;
          border-radius: 14px;
          border: none;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .modal-btn.success {
          background: #0f172a;
          color: white;
        }
        .modal-btn.success:hover {
          background: #1e293b;
          transform: translateY(-1px);
        }
        .modal-btn.error {
          background: #ef4444;
          color: white;
        }
        .modal-btn.error:hover {
          background: #dc2626;
          transform: translateY(-1px);
        }
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalScaleIn {
          from { opacity: 0; transform: scale(0.9) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes iconScale {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }
      `}} />
    </div>
  );
};

export default LCDBuybackForm;
