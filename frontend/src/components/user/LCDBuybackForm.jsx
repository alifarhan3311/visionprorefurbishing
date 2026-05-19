import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Info, Calculator, FileText } from 'lucide-react';
import api from '../../services/api';
import '../admin/AdminForms.css';

const LCDBuybackForm = () => {
  const [pricingData, setPricingData] = useState([]);
  const [rows, setRows] = useState([{ id: Date.now(), brand: '', modelId: '', condition: '', qty: 1, unitPrice: 0 }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

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
    if (calculateTotal() === 0) return alert('Please add at least one valid screen');
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
        alert('LCD Buyback Ticket Created! Please print your shipping label.');
        setRows([{ id: Date.now(), brand: '', modelId: '', condition: '', qty: 1, unitPrice: 0 }]);
      }
    } catch (error) {
      alert('Failed to submit buyback request');
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
      <style dangerouslySetInnerHTML={{ __html: `
        .table-responsive { width: 100%; overflow-x: auto; }
        .buyback-summary { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; }
        .summary-content { display: flex; justify-content: space-between; align-items: center; }
        @media (max-width: 768px) {
          .summary-content { flex-direction: column; align-items: flex-start; gap: 20px; }
          .summary-content > div:last-child { text-align: left !important; }
        }
      `}} />
    </div>
  );
};

export default LCDBuybackForm;
