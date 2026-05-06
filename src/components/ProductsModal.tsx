'use client';

import { useDashboard } from './DashboardContext';
import { useState } from 'react';

export default function ProductsModal() {
  const { products, refreshProducts } = useDashboard();
  const [showInactive, setShowInactive] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleToggleInactive = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setShowInactive(checked);
    refreshProducts(checked);
  };

  const handleSaveProduct = async (id?: string) => {
    if (!newName || !newPrice) return;
    setIsSaving(true);
    try {
      const res = await fetch(id ? `/api/products/${id}` : '/api/products', {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, default_price: Number(newPrice) })
      });
      if (!res.ok) throw new Error('Failed to save product');
      
      await refreshProducts(showInactive);
      setIsEditing(null);
      setNewName('');
      setNewPrice('');
    } catch (err) {
      console.error(err);
      alert('Failed to save product');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      if (!res.ok) throw new Error('Failed to toggle status');
      await refreshProducts(showInactive);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="compact-modal">
      <div className="modal-header">
        <h4 style={{ margin: 0, fontSize: '14px', color: '#999', textTransform: 'uppercase' }}>Manage Inventory</h4>
        <label className="show-inactive-label">
          <input type="checkbox" checked={showInactive} onChange={handleToggleInactive} />
          <span>Show Inactive</span>
        </label>
      </div>

      <div className="product-list-container">
        <table className="compact-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className={p.is_active ? '' : 'inactive-row'}>
                <td>{p.name}</td>
                <td style={{ whiteSpace: 'nowrap' }}>₦{Number(p.default_price).toLocaleString()}</td>
                <td style={{ textAlign: 'right' }}>
                  <div className="action-btns">
                    <button 
                      onClick={() => { setIsEditing(p.id); setNewName(p.name); setNewPrice(p.default_price.toString()); }}
                      className="text-btn edit-btn"
                    >
                      EDIT
                    </button>
                    <button 
                      onClick={() => handleToggleStatus(p.id, p.is_active)}
                      className="text-btn status-btn"
                      style={{ color: p.is_active ? '#EF4444' : '#22C55E' }}
                    >
                      {p.is_active ? 'OFF' : 'ON'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="add-form">
        <h5 style={{ margin: '0 0 0.75rem 0', fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>
          {isEditing ? 'Modify Product' : 'Quick Add'}
        </h5>
        <div className="form-grid">
          <input 
            value={newName} 
            onChange={e => setNewName(e.target.value)} 
            placeholder="Name" 
            className="compact-input"
          />
          <input 
            type="number" 
            value={newPrice} 
            onChange={e => setNewPrice(e.target.value)} 
            placeholder="Price (₦)" 
            className="compact-input"
          />
        </div>
        <div className="form-actions">
          {isEditing && (
            <button onClick={() => { setIsEditing(null); setNewName(''); setNewPrice(''); }} className="cancel-btn">CANCEL</button>
          )}
          <button 
            disabled={isSaving || !newName || !newPrice} 
            onClick={() => handleSaveProduct(isEditing || undefined)}
            className="save-btn"
          >
            {isSaving ? '...' : (isEditing ? 'UPDATE' : 'ADD')}
          </button>
        </div>
      </div>

      <style jsx>{`
        .compact-modal { width: 100%; max-width: 100%; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .show-inactive-label { font-size: 11px; color: '#666'; display: flex; align-items: center; gap: 4px; cursor: pointer; }
        
        .product-list-container { max-height: 180px; overflow-y: auto; margin-bottom: 1rem; border: 1px solid #222; border-radius: 4px; }
        .compact-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .compact-table th { padding: 8px; color: #555; font-weight: normal; font-size: 11px; text-transform: uppercase; border-bottom: 1px solid #222; position: sticky; top: 0; background: #111; z-index: 1; }
        .compact-table td { padding: 8px; border-bottom: 1px solid #1a1a1a; }
        .inactive-row { opacity: 0.4; background: rgba(255,255,255,0.02); }
        
        .action-btns { display: flex; justify-content: flex-end; gap: 8px; }
        .text-btn { background: none; border: none; cursor: pointer; font-size: 10px; font-weight: bold; letter-spacing: 0.5px; padding: 4px; }
        .edit-btn { color: #3B82F6; }
        
        .add-form { background: #0c0c0c; padding: 0.75rem; border-radius: 6px; border: 1px solid #222; }
        .form-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 8px; margin-bottom: 8px; }
        .compact-input { background: #1a1a1a; border: 1px solid #333; color: white; padding: 6px 10px; border-radius: 4px; font-size: 13px; width: 100%; outline: none; transition: border-color 0.2s; }
        .compact-input:focus { border-color: #EF4444; }
        
        .form-actions { display: flex; justify-content: flex-end; gap: 12px; align-items: center; }
        .cancel-btn { background: none; border: none; color: #555; cursor: pointer; font-size: 11px; }
        .save-btn { background: #EF4444; border: none; color: #000; padding: 6px 16px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 11px; }
        .save-btn:disabled { opacity: 0.3; cursor: not-allowed; }

        @media (max-width: 480px) {
          .form-grid { grid-template-columns: 1fr; }
          .compact-table { font-size: 12px; }
          .action-btns { gap: 4px; }
        }
      `}</style>
    </div>
  );
}
