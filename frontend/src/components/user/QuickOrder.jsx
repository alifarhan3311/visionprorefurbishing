import React, { useState, useContext } from 'react';
import { Upload, Plus, ShoppingCart, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';
import api from '../../services/api';
import { CartContext } from '../../context/CartContext';
import '../admin/AdminForms.css';

const QuickOrder = () => {
  const { addToCart } = useContext(CartContext);
  const [rows, setRows] = useState([
    { id: 1, sku: '', qty: 1, desc: 'Waiting for SKU...', price: 0, status: 'idle' },
  ]);
  const [loading, setLoading] = useState(false);

  const handleAddRow = () => {
    setRows([...rows, { id: Date.now(), sku: '', qty: 1, desc: 'Waiting for SKU...', price: 0, status: 'idle' }]);
  };

  const handleRemoveRow = (id) => {
    setRows(rows.filter(r => r.id !== id));
  };

  const validateSKU = async (sku, index) => {
    if (!sku) return;
    try {
      const { data } = await api.post('/products/validate-skus', { skus: [sku] });
      const found = data.data[sku];
      
      const newRows = [...rows];
      if (found) {
        newRows[index] = { 
          ...newRows[index], 
          desc: found.name, 
          price: found.price, 
          status: 'valid',
          productId: found._id 
        };
      } else {
        newRows[index] = { ...newRows[index], desc: 'Invalid SKU', status: 'invalid', price: 0 };
      }
      setRows(newRows);
    } catch (error) {
      console.error('Validation error', error);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: async (results) => {
          const csvData = results.data.filter(row => row.SKU || row.sku);
          const skusToValidate = csvData.map(row => row.SKU || row.sku);
          
          setLoading(true);
          try {
            const { data } = await api.post('/products/validate-skus', { skus: skusToValidate });
            const validatedRows = csvData.map((row, idx) => {
              const sku = row.SKU || row.sku;
              const qty = parseInt(row.Quantity || row.qty) || 1;
              const found = data.data[sku];
              
              return {
                id: Date.now() + idx,
                sku: sku,
                qty: qty,
                desc: found ? found.name : 'Invalid SKU',
                price: found ? found.price : 0,
                status: found ? 'valid' : 'invalid',
                productId: found ? found._id : null
              };
            });
            setRows(validatedRows);
          } catch (error) {
            alert('Error validating file SKUs');
          } finally {
            setLoading(false);
          }
        }
      });
    }
  };

  const addAllToCart = () => {
    const validItems = rows.filter(r => r.status === 'valid');
    if (validItems.length === 0) return alert('No valid items to add');
    
    validItems.forEach(item => {
      addToCart({ _id: item.productId, name: item.desc, baseRetailPrice: item.price }, item.qty);
    });
    
    alert(`${validItems.length} items added to cart!`);
    setRows([{ id: 1, sku: '', qty: 1, desc: 'Waiting for SKU...', price: 0, status: 'idle' }]);
  };

  return (
    <div>
      <h1 className="user-page-title">Quick Order / Bulk Add</h1>
      <p style={{ marginBottom: '25px', color: '#64748b' }}>
        Instantly add multiple items by entering SKUs, or upload a CSV file.
      </p>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <div className="user-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px' }}>
          <Upload size={32} color="var(--primary-color)" style={{ marginBottom: '15px' }} />
          <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>Upload Order File</h3>
          <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '15px', textAlign: 'center' }}>
            Supports .csv (Columns: SKU, Quantity)
          </p>
          <input 
            type="file" 
            id="csvUpload" 
            hidden 
            accept=".csv" 
            onChange={handleFileUpload}
          />
          <label htmlFor="csvUpload" className="admin-btn-primary" style={{ cursor: 'pointer', backgroundColor: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1' }}>
            Choose CSV File
          </label>
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <h2 style={{ color: '#cbd5e1' }}>— OR —</h2>
        </div>
        <div style={{ flex: 1 }}></div>
      </div>

      <div className="user-card">
        <h3 style={{ fontSize: '16px', marginBottom: '20px' }}>Manual SKU Entry</h3>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
              <th style={{ padding: '12px', width: '25%' }}>SKU</th>
              <th style={{ padding: '12px', width: '10%' }}>Qty</th>
              <th style={{ padding: '12px', width: '40%' }}>Description</th>
              <th style={{ padding: '12px', width: '15%' }}>Price</th>
              <th style={{ padding: '12px', width: '10%' }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input 
                      type="text" 
                      value={row.sku}
                      onChange={(e) => {
                        const newRows = [...rows];
                        newRows[index].sku = e.target.value.toUpperCase();
                        setRows(newRows);
                      }}
                      onBlur={(e) => validateSKU(e.target.value, index)}
                      placeholder="Enter SKU..." 
                      style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} 
                    />
                    {row.status === 'valid' && <CheckCircle size={16} color="#10b981" />}
                    {row.status === 'invalid' && <AlertCircle size={16} color="#ef4444" />}
                  </div>
                </td>
                <td style={{ padding: '8px' }}>
                  <input 
                    type="number" 
                    value={row.qty} 
                    onChange={(e) => {
                      const newRows = [...rows];
                      newRows[index].qty = parseInt(e.target.value);
                      setRows(newRows);
                    }}
                    min="1" 
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} 
                  />
                </td>
                <td style={{ padding: '8px' }}>
                  <div style={{ fontSize: '13px', color: row.status === 'invalid' ? '#ef4444' : '#64748b' }}>
                    {row.desc}
                  </div>
                </td>
                <td style={{ padding: '8px', fontWeight: 600 }}>
                  ${(row.price * row.qty).toFixed(2)}
                </td>
                <td style={{ padding: '8px', textAlign: 'center' }}>
                  <button onClick={() => handleRemoveRow(row.id)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={handleAddRow} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 15px', border: '1px dashed #cbd5e1', background: 'transparent', cursor: 'pointer', borderRadius: '4px' }}>
            <Plus size={16} /> Add Row
          </button>
          
          <button 
            onClick={addAllToCart}
            disabled={loading}
            className="admin-btn-primary" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#10b981' }}
          >
            <ShoppingCart size={18} /> {loading ? 'Validating...' : 'Add All To Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickOrder;
