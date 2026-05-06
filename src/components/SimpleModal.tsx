'use client';

import { useDashboard } from './DashboardContext';
import { useState, useEffect } from 'react';
import ProductSelector from './ProductSelector';
import ProductsModal from './ProductsModal';

export default function SimpleModal() {
  const { activeModal, closeModal, refresh, customers, defaultPrice } = useDashboard();
  const [val, setVal] = useState(''); 
  const [phone, setPhone] = useState('');
  const [qty, setQty] = useState('');
  const [address, setAddress] = useState('');
  const [productId, setProductId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [priceInput, setPriceInput] = useState('');

  // Sync internal state with activeModal when it opens
  useEffect(() => {
    if (activeModal?.type === 'rename') {
      setVal(activeModal.name || '');
      setAddress(activeModal.data?.address || '');
    } else if (activeModal?.type === 'set_price') {
      setVal(activeModal.data?.price?.toString() || '');
    } else if (activeModal?.type === 'confirm_order') {
      setQty(activeModal.data?.qty?.toString() || '');
      setPriceInput(activeModal.data?.price?.toString() || '');
      setProductId('');
    } else if (activeModal?.type === 'manual_order') {
      setPhone('');
      setVal('');
      setQty('');
      setAddress('');
      setProductId('');
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
  const isManageProducts = activeModal.type === 'manage_products';

  let title = 'Action';
  if (isRename) title = 'Edit Customer';
  if (isSetPrice) title = 'Update Global Price';
  if (isConfirm) title = 'Confirm Order';
  if (isDeleteOrder) title = 'Delete Order?';
  if (isManual) title = 'Add Manual Order';
  if (isDeleteCustomer) title = 'Delete Customer?';
  if (isBulkDelete) title = `Delete ${activeModal.data?.ids?.length} Customers?`;
  if (isManageProducts) title = 'Products & Pricing';
  
  const handleConfirm = async () => {
    if (isBulkDelete && val !== 'DELETE') return;
    if ((isConfirm || isManual) && (!productId || Number(priceInput || val) <= 0)) {
      alert('Please select a product and enter a valid price.');
      return;
    }

    setIsProcessing(true);
    try {
      if (isRename) {
        await fetch(`/api/customers/${activeModal.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: val, address })
        });
      } else if (isConfirm) {
        await fetch(`/api/dashboard/orders/${activeModal.id}/confirm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, quantity: Number(qty), unit_price: Number(priceInput || val) })
        });
      } else if (isManual) {
        await fetch(`/api/orders/manual`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, name: val, productId, quantity: Number(qty), unit_price: Number(priceInput), address })
        });
      } else if (isDeleteOrder) {
        await fetch(`/api/orders/${activeModal.id}`, { method: 'DELETE' });
      } else if (isDeleteCustomer) {
        await fetch(`/api/customers/${activeModal.id}`, { method: 'DELETE' });
      } else if (isBulkDelete) {
        await fetch(`/api/customers/bulk-delete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: activeModal.data.ids })
        });
      }
      
      await refresh();
      closeModal();
    } catch (err) {
      console.error(err);
      alert('Action failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !showAutocomplete && !isManageProducts) handleConfirm();
    if (e.key === 'Escape') closeModal();
  };

  const currentUnitPrice = isManual ? Number(priceInput) : (isConfirm ? Number(priceInput || val) : Number(val));
  const total = (Number(qty) || 0) * (currentUnitPrice || 0);

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-inner">
          <h3 className="modal-title">{title}</h3>
          
          <div className="modal-body">
            {isManageProducts && <ProductsModal />}

            {(isDeleteCustomer || isBulkDelete) && (
              <p className="warning-text">⚠️ This will permanently delete the customer and all associated data.</p>
            )}

            {isRename && (
              <div className="compact-form">
                <div className="input-group">
                  <label>Name</label>
                  <input autoFocus value={val} onChange={e => setVal(e.target.value)} onKeyDown={handleKeyDown} className="modal-input" placeholder="Name" />
                </div>
                <div className="input-group">
                  <label>Address</label>
                  <input value={address} onChange={e => setAddress(e.target.value)} onKeyDown={handleKeyDown} className="modal-input" placeholder="Address" />
                </div>
              </div>
            )}

            {isConfirm && (
              <div className="compact-form">
                <ProductSelector value={productId} onChange={(p) => { setProductId(p.id); setPriceInput(p.default_price.toString()); }} />
                <div className="grid-2">
                  <div className="input-group">
                    <label>Qty</label>
                    <input autoFocus value={qty} onChange={e => setQty(e.target.value)} className="modal-input" type="number" />
                  </div>
                  <div className="input-group">
                    <label>Price (₦)</label>
                    <input value={priceInput} onChange={e => setPriceInput(e.target.value)} className="modal-input" type="number" />
                  </div>
                </div>
                <div className="total-display">
                  <span className="total-label">TOTAL</span>
                  <span className="total-value">₦{total.toLocaleString()}</span>
                </div>
              </div>
            )}

            {isManual && (
              <div className="compact-form">
                <div className="input-group" style={{ position: 'relative' }}>
                  <label>Phone Number</label>
                  <input autoFocus value={phone} onChange={e => { setPhone(e.target.value); setShowAutocomplete(true); }} className="modal-input" placeholder="234..." />
                  {showAutocomplete && phone.length > 2 && (
                    <div className="autocomplete-dropdown">
                      {customers.filter(c => c.phone.includes(phone)).map(c => (
                        <div key={c.id} className="autocomplete-item" onClick={() => { setPhone(c.phone); setVal(c.name || ''); setAddress(c.address || ''); setShowAutocomplete(false); }}>
                          <strong>{c.name}</strong> <span>{c.phone}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="grid-2">
                  <div className="input-group"><label>Customer Name</label><input value={val} onChange={e => setVal(e.target.value)} className="modal-input" placeholder="Optional" /></div>
                  <div className="input-group"><label>Address</label><input value={address} onChange={e => setAddress(e.target.value)} className="modal-input" placeholder="Optional" /></div>
                </div>
                
                <div style={{ margin: '0.5rem 0' }}>
                  <ProductSelector value={productId} onChange={(p) => { setProductId(p.id); setPriceInput(p.default_price.toString()); }} />
                </div>

                <div className="grid-2">
                  <div className="input-group"><label>Quantity</label><input value={qty} onChange={e => setQty(e.target.value)} className="modal-input" type="number" /></div>
                  <div className="input-group"><label>Unit Price (₦)</label><input value={priceInput} onChange={e => setPriceInput(e.target.value)} className="modal-input" type="number" /></div>
                </div>
                <div className="total-display">
                  <span className="total-label">ORDER TOTAL</span>
                  <span className="total-value">₦{total.toLocaleString()}</span>
                </div>
              </div>
            )}

            {isDeleteOrder && <p className="help-text">Permanently remove this order?</p>}
          </div>
          
          <div className="modal-footer">
            <button onClick={closeModal} disabled={isProcessing} className="btn-secondary">{isManageProducts ? 'CLOSE' : 'CANCEL'}</button>
            {!isManageProducts && (
              <button onClick={handleConfirm} disabled={isProcessing} className="btn-primary" style={{ color: (isDeleteCustomer || isBulkDelete || isDeleteOrder) ? '#EF4444' : '#22C55E' }}>
                {isProcessing ? '...' : ((isDeleteCustomer || isBulkDelete || isDeleteOrder) ? 'DELETE' : 'SAVE')}
              </button>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 1rem; }
        .modal-card { background: #111; border: 1px solid #333; border-radius: 12px; width: 100%; max-width: 400px; animation: modalIn 0.2s ease-out; }
        .modal-inner { padding: 1.5rem; }
        .modal-title { margin: 0 0 1.25rem 0; font-size: 16px; font-weight: bold; color: #fff; text-transform: uppercase; letter-spacing: 0.5px; }
        
        .modal-body { display: flex; flex-direction: column; gap: 1rem; }
        
        .input-group { margin-bottom: 0.5rem; }
        .input-group label { display: block; font-size: 10px; color: #666; text-transform: uppercase; margin-bottom: 4px; }
        .modal-input { width: 100%; background: #0a0a0a; border: 1px solid #222; border-radius: 4px; color: #fff; padding: 8px 10px; font-size: 14px; outline: none; }
        .modal-input:focus { border-color: #EF4444; }
        
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
        .compact-form { display: flex; flex-direction: column; gap: 0.5rem; }
        
        .total-display { display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem; padding: 0.75rem; background: #0c0c0c; border-radius: 6px; border: 1px solid #222; }
        .total-label { font-size: 11px; color: #666; }
        .total-value { font-size: 18px; font-weight: bold; color: #22C55E; }
        
        .warning-text { color: #EF4444; font-size: 12px; margin-bottom: 1rem; line-height: 1.4; }
        .help-text { color: #888; font-size: 13px; margin-bottom: 1rem; }
        
        .modal-footer { display: flex; justify-content: flex-end; gap: 1.5rem; margin-top: 1.5rem; }
        .btn-secondary { background: none; border: none; color: #666; font-size: 11px; font-weight: bold; cursor: pointer; }
        .btn-primary { background: none; border: none; font-size: 11px; font-weight: bold; cursor: pointer; letter-spacing: 0.5px; }
        
        .autocomplete-dropdown { position: absolute; top: 100%; left: 0; right: 0; background: #111; border: 1px solid #333; border-radius: 4px; z-index: 100; max-height: 120px; overflow-y: auto; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
        .autocomplete-item { padding: 8px; border-bottom: 1px solid #222; cursor: pointer; font-size: 12px; }
        .autocomplete-item strong { display: block; }
        .autocomplete-item span { font-size: 10px; color: #666; }

        @keyframes modalIn { from { opacity: 0; transform: scale(0.98) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>
    </div>
  );
}
