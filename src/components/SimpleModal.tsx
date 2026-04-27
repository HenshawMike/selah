'use client';

import { useDashboard } from './DashboardContext';
import { useState, useEffect } from 'react';
const BASE_URL = process.env.NEXT_PUBLIC_API_URL!;

export default function SimpleModal() {
  const { activeModal, closeModal, refresh, customers, defaultPrice } = useDashboard();
  const [val, setVal] = useState(''); // Used for Price, Name, or Typed Confirmation
  const [phone, setPhone] = useState('');
  const [qty, setQty] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [priceInput, setPriceInput] = useState('');

  // Sync internal state with activeModal when it opens
  useEffect(() => {
    if (activeModal?.type === 'rename') {
      setVal(activeModal.name || '');
    } else if (activeModal?.type === 'set_price') {
      setVal(activeModal.data?.price?.toString() || '');
    } else if (activeModal?.type === 'confirm_order') {
      setQty(activeModal.data?.qty?.toString() || '');
      setVal(activeModal.data?.price?.toString() || '');
    } else if (activeModal?.type === 'manual_order') {
      setPhone('');
      setVal('');
      setQty('');
      setPriceInput((defaultPrice || 5000).toString());
    } else if (activeModal?.type === 'bulk_delete_customers') {
      setVal('');
    }
  }, [activeModal, defaultPrice]);

  if (!activeModal) return null;

  const isRename = activeModal.type === 'rename';
  const isSetPrice = activeModal.type === 'set_price';
  const isConfirm = activeModal.type === 'confirm_order';
  const isDeleteOrder = activeModal.type === 'delete';
  const isManual = activeModal.type === 'manual_order';
  const isDeleteCustomer = activeModal.type === 'delete_customer';
  const isBulkDelete = activeModal.type === 'bulk_delete_customers';

  let title = 'Action';
  if (isRename) title = 'Rename Customer';
  if (isSetPrice) title = 'Update Global Price';
  if (isConfirm) title = 'Confirm Order';
  if (isDeleteOrder) title = 'Delete Order?';
  if (isManual) title = 'Add Manual Order';
  if (isDeleteCustomer) title = 'Delete Customer?';
  if (isBulkDelete) title = `Delete ${activeModal.data?.ids?.length} Customers?`;
  
  const handleConfirm = async () => {
    if (isBulkDelete && val !== 'DELETE') return;

    setIsProcessing(true);
    try {
      if (isRename) {
        await fetch(`${BASE_URL}/api/customers/${activeModal.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: val })
        });
      } else if (isSetPrice) {
        await fetch(`${BASE_URL}/api/settings`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ default_price: Number(val) })
        });
      } else if (isConfirm) {
        await fetch(`${BASE_URL}/api/dashboard/orders/${activeModal.id}/confirm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity: Number(qty), unit_price: Number(val) })
        });
      } else if (isManual) {
        await fetch(`${BASE_URL}/api/dashboard/orders/manual`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, name: val, quantity: Number(qty), unit_price: Number(priceInput) })
        });
      } else if (isDeleteOrder) {
        await fetch(`${BASE_URL}/api/dashboard/orders/${activeModal.id}`, { method: 'DELETE' });
      } else if (isDeleteCustomer) {
        await fetch(`${BASE_URL}/api/customers/${activeModal.id}`, { method: 'DELETE' });
      } else if (isBulkDelete) {
        await fetch(`${BASE_URL}/api/customers/bulk-delete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: activeModal.data.ids })
        });
      }
      
      await refresh();
      closeModal();
    } catch (err) {
      console.error(err);
      alert('Action failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !showAutocomplete) handleConfirm();
    if (e.key === 'Escape') closeModal();
  };

  const filteredCustomers = phone.length > 2 
    ? customers.filter(c => c.phone.includes(phone) || (c.name && c.name.toLowerCase().includes(phone.toLowerCase())))
    : [];

  const selectCustomer = (c: any) => {
    setPhone(c.phone);
    setVal(c.name || '');
    setShowAutocomplete(false);
  };

  const currentUnitPrice = isManual ? Number(priceInput) : Number(val);
  const total = (Number(qty) || 0) * (currentUnitPrice || 0);
  const deleteWarning = "This will permanently delete the customer and all associated orders and debts.";

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ width: (isManual || isBulkDelete) ? '360px' : '320px' }}>
        <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '18px' }}>{title}</h3>
        
        {(isDeleteCustomer || isBulkDelete) && (
          <p style={{ color: '#EF4444', fontSize: '14px', marginBottom: '1.5rem', lineHeight: '1.4', fontWeight: '500' }}>
            ⚠️ {deleteWarning}
          </p>
        )}

        {isBulkDelete && (
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
              Type "DELETE" to confirm
            </label>
            <input 
              autoFocus 
              value={val} 
              onChange={e => setVal(e.target.value)} 
              onKeyDown={handleKeyDown} 
              className="modal-input" 
              placeholder="DELETE" 
              style={{ borderBottomColor: val === 'DELETE' ? '#EF4444' : '#333' }}
            />
          </div>
        )}

        {isRename && (
          <input autoFocus value={val} onChange={e => setVal(e.target.value)} onKeyDown={handleKeyDown} className="modal-input" placeholder="Enter name..." disabled={isProcessing} />
        )}

        {isSetPrice && (
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>Default Price (₦)</label>
            <input autoFocus value={val} onChange={e => setVal(e.target.value)} onKeyDown={handleKeyDown} className="modal-input" type="number" disabled={isProcessing} />
          </div>
        )}

        {isConfirm && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>Quantity</label>
              <input autoFocus value={qty} onChange={e => setQty(e.target.value)} className="modal-input" type="number" disabled={isProcessing} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>Price (₦)</label>
              <input value={val} onChange={e => setVal(e.target.value)} className="modal-input" type="number" disabled={isProcessing} />
            </div>
            <div style={{ borderTop: '1px solid #333', paddingTop: '1rem', marginTop: '1rem' }}>
              <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>Total Price</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#22C55E' }}>₦{total.toLocaleString()}</div>
            </div>
          </div>
        )}

        {isManual && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ marginBottom: '1rem', position: 'relative' }}>
              <label style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>Phone Number</label>
              <input autoFocus value={phone} onChange={e => { setPhone(e.target.value); setShowAutocomplete(true); }} className="modal-input" placeholder="234..." disabled={isProcessing} />
              {showAutocomplete && filteredCustomers.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#1A1A1A', border: '1px solid #333', borderRadius: '4px', zIndex: 10, maxHeight: '150px', overflowY: 'auto' }}>
                  {filteredCustomers.map(c => (
                    <div key={c.id} onClick={() => selectCustomer(c)} style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #222', fontSize: '13px' }}>
                      <div style={{ fontWeight: 'bold' }}>{c.name || 'Unknown'}</div>
                      <div style={{ color: '#666', fontSize: '11px' }}>{c.phone}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>Name (Optional)</label>
              <input value={val} onChange={e => setVal(e.target.value)} className="modal-input" placeholder="John Doe" disabled={isProcessing} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>Qty</label>
                <input value={qty} onChange={e => setQty(e.target.value)} className="modal-input" type="number" placeholder="200" disabled={isProcessing} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>Price (₦)</label>
                <input value={priceInput} onChange={e => setPriceInput(e.target.value)} className="modal-input" type="number" disabled={isProcessing} />
              </div>
            </div>
            <div style={{ borderTop: '1px solid #333', paddingTop: '1rem', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '11px', color: '#666' }}>TOTAL</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#22C55E' }}>₦{total.toLocaleString()}</div>
            </div>
          </div>
        )}

        {isDeleteOrder && (
          <p style={{ color: '#888', fontSize: '14px', marginBottom: '1.5rem', lineHeight: '1.4' }}>This action cannot be undone. The order will be permanently removed.</p>
        )}
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1.5rem', alignItems: 'center' }}>
          <button onClick={closeModal} disabled={isProcessing} className="modal-btn" style={{ color: '#666' }}>CANCEL</button>
          <button 
            onClick={handleConfirm} 
            disabled={isProcessing || (isBulkDelete && val !== 'DELETE')} 
            className="modal-btn" 
            style={{ 
              color: '#EF4444', 
              opacity: (isProcessing || (isBulkDelete && val !== 'DELETE')) ? 0.3 : 1 
            }}
          >
            {isProcessing ? 'WAIT...' : ((isDeleteCustomer || isBulkDelete || isDeleteOrder) ? 'DELETE' : (isManual ? 'CREATE ORDER' : 'SAVE'))}
          </button>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 9999; animation: fadeIn 0.2s ease-out; }
        .modal-card { background: #111; border: 1px solid #333; padding: 2rem; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); animation: scaleUp 0.2s ease-out; }
        .modal-input { width: 100%; background: transparent; border: none; border-bottom: 2px solid #333; color: white; padding: 0.5rem 0; outline: none; margin-bottom: 0.5rem; font-size: 16px; transition: border-color 0.2s; }
        .modal-input:focus { border-bottom-color: #EF4444; }
        .modal-btn { background: none; border: none; cursor: pointer; font-weight: bold; font-size: 12px; letter-spacing: 1px; padding: 0.5rem 0; transition: opacity 0.2s; }
        .modal-btn:hover:not(:disabled) { opacity: 0.7; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}
