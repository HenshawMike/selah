'use client';

import { useDashboard } from './DashboardContext';

export default function TopBar() {
  const { openModal } = useDashboard();

  return (
    <div style={{ 
      height: '60px', 
      borderBottom: '1px solid var(--color-border)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      padding: '0 2rem',
      backgroundColor: 'rgba(11, 11, 11, 0.8)',
      backdropFilter: 'blur(10px)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Left Side: Actions */}
      <div>
        <button 
          onClick={() => openModal('manual_order', 'manual')}
          style={{ 
            backgroundColor: '#EF4444', 
            border: 'none', 
            color: '#0B0B0B', 
            padding: '6px 16px', 
            borderRadius: '4px', 
            fontSize: '12px', 
            cursor: 'pointer',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
          }}
          className="add-order-btn"
        >
          <span style={{ fontSize: '16px' }}>+</span> ADD ORDER
        </button>
      </div>

      {/* Right Side: Global Settings */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button 
          onClick={() => openModal('manage_products', 'products')}
          style={{ 
            background: 'none', 
            border: '1px solid #333', 
            color: 'var(--color-text)', 
            padding: '6px 16px', 
            borderRadius: '4px', 
            fontSize: '12px', 
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.2s',
            letterSpacing: '0.5px'
          }}
          className="manage-products-btn"
        >
          PRODUCTS & PRICES
        </button>
      </div>
      <style jsx>{`
        .manage-products-btn:hover {
          border-color: #EF4444;
          color: #EF4444;
          background-color: rgba(239, 68, 68, 0.05);
        }
        .add-order-btn:hover {
          background-color: #D43F3F !important;
          transform: translateY(-1px);
        }
        .add-order-btn:active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}
