'use client';

import { useState } from 'react';
import { useDashboard } from '@/components/DashboardContext';
import OrderActionButton from '@/components/OrderActionButton';
import EditableCustomerName from '@/components/EditableCustomerName';
import TableToolbar from '@/components/TableToolbar';

export default function Orders() {
  const { orders, loading, page, setPage, pagination, openModal } = useDashboard();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  if (loading && orders.length === 0) return <div style={{ padding: '2rem' }}>Loading Orders...</div>;

  const filteredOrders = orders.filter(order => {
    const query = searchQuery.toLowerCase();
    const customerName = (order.customers?.name || '').toLowerCase();
    const customerPhone = (order.customers?.phone || '');
    const productName = (order.product_name || '').toLowerCase();
    const matchesSearch = customerName.includes(query) || customerPhone.includes(query) || productName.includes(query);
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <h1 className="page-title">Orders</h1>

      <TableToolbar 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Search name, phone, or product..."
        showStatusFilter={true}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />
      
      {/* DESKTOP VIEW */}
      <div style={{ 
        backgroundColor: 'var(--color-surface)', 
        borderRadius: '8px', 
        border: '1px solid var(--color-border)', 
        maxHeight: '65vh',
        overflowY: 'auto'
      }} className="custom-scrollbar desktop-only">
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead style={{ position: 'sticky', top: 0, backgroundColor: '#111', zIndex: 10 }}>
            <tr>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--color-text-secondary)', fontWeight: 'normal', fontSize: '11px', textTransform: 'uppercase', borderBottom: '1px solid var(--color-border)' }}>Date</th>
              <th style={{ padding: '1rem 0', color: 'var(--color-text-secondary)', fontWeight: 'normal', fontSize: '11px', textTransform: 'uppercase', borderBottom: '1px solid var(--color-border)' }}>Customer</th>
              <th style={{ padding: '1rem 0', color: 'var(--color-text-secondary)', fontWeight: 'normal', fontSize: '11px', textTransform: 'uppercase', borderBottom: '1px solid var(--color-border)' }}>Product</th>
              <th style={{ padding: '1rem 0', color: 'var(--color-text-secondary)', fontWeight: 'normal', fontSize: '11px', textTransform: 'uppercase', borderBottom: '1px solid var(--color-border)' }}>Qty</th>
              <th style={{ padding: '1rem 2rem 1rem 1rem', color: 'var(--color-text-secondary)', fontWeight: 'normal', fontSize: '11px', textTransform: 'uppercase', borderBottom: '1px solid var(--color-border)' }}>Total</th>
              <th style={{ padding: '1rem 0', color: 'var(--color-text-secondary)', fontWeight: 'normal', fontSize: '11px', textTransform: 'uppercase', borderBottom: '1px solid var(--color-border)' }}>Status</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--color-text-secondary)', fontWeight: 'normal', fontSize: '11px', textTransform: 'uppercase', borderBottom: '1px solid var(--color-border)', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order: any) => (
              <tr key={order.id} className="table-row">
                <td style={{ padding: '1rem 1.5rem', fontSize: '12px', color: 'var(--color-text-secondary)' }}>{new Date(order.created_at).toLocaleDateString()}</td>
                <td style={{ padding: '1rem 0' }}>
                  <EditableCustomerName id={order.customer_id} name={order.customers?.name} phone={order.customers?.phone} />
                  {order.customers?.address && (
                    <div style={{ fontSize: '10px', color: '#555', marginTop: '2px' }}>📍 {order.customers.address}</div>
                  )}
                </td>
                <td style={{ padding: '1rem 0' }}>
                  <span className="product-tag">{order.product_name || 'Cement'}</span>
                </td>
                <td style={{ padding: '1rem 0', fontWeight: 'bold' }}>{order.quantity}</td>
                <td style={{ padding: '1rem 2rem 1rem 1rem', fontWeight: 'bold' }}>{order.total_price ? `₦${Number(order.total_price).toLocaleString()}` : '--'}</td>
                <td style={{ padding: '1rem 0' }}>
                  <span style={{ 
                    padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold',
                    backgroundColor: order.status === 'paid' ? 'rgba(34, 197, 94, 0.2)' : order.status === 'draft' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                    color: order.status === 'paid' ? 'var(--color-success)' : order.status === 'draft' ? '#3B82F6' : 'var(--color-warning)'
                  }}>{order.status.toUpperCase()}</span>
                </td>
                <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <OrderActionButton orderId={order.id} currentStatus={order.status} quantity={order.quantity} />
                    <button onClick={() => openModal('delete', order.id)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: '0.25rem' }}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE VIEW */}
      <div className="mobile-only">
        {filteredOrders.map((order: any) => (
          <div key={order.id} className="mobile-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>{order.customers?.name || 'New Customer'}</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{order.customers?.phone}</div>
                {order.customers?.address && (
                  <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>📍 {order.customers.address}</div>
                )}
              </div>
              <span style={{ 
                padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold',
                backgroundColor: order.status === 'paid' ? 'rgba(34, 197, 94, 0.2)' : order.status === 'draft' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                color: order.status === 'paid' ? 'var(--color-success)' : order.status === 'draft' ? '#3B82F6' : 'var(--color-warning)'
              }}>{order.status.toUpperCase()}</span>
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span className="product-tag">{order.product_name || 'Cement'}</span>
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', background: 'rgba(255,255,255,0.03)', padding: '2px 8px', borderRadius: '4px', fontStyle: 'italic' }}>
                {order.messages?.message_text || 'Manual Order'}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Qty: {order.quantity}</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>
                  {order.total_price ? `₦${Number(order.total_price).toLocaleString()}` : '--'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <OrderActionButton orderId={order.id} currentStatus={order.status} quantity={order.quantity} />
                <button 
                  onClick={() => openModal('delete', order.id)}
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', color: '#666', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer' }}
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .table-row { border-bottom: 1px solid var(--color-border); transition: background-color 0.2s; }
        .table-row:hover { background-color: rgba(255, 255, 255, 0.02); }
        .product-tag {
          display: inline-block;
          padding: 2px 8px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          color: #ddd;
          text-transform: uppercase;
        }
      `}</style>

      {/* Pagination (Simplified for mobile) */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem', marginBottom: '2rem', alignItems: 'center' }}>
        <button disabled={page === 1} onClick={() => setPage(page - 1)} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'transparent', color: 'var(--color-text)', cursor: page === 1 ? 'not-allowed' : 'pointer' }}>Prev</button>
        <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>{page}</span>
        <button disabled={!pagination.hasMore} onClick={() => setPage(page + 1)} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'transparent', color: 'var(--color-text)', cursor: !pagination.hasMore ? 'not-allowed' : 'pointer' }}>Next</button>
      </div>
    </div>
  );
}
