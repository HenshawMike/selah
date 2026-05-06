'use client';

import { useDashboard } from '@/components/DashboardContext';
import OrderActionButton from '@/components/OrderActionButton';
import EditableCustomerName from '@/components/EditableCustomerName';

export default function Dashboard() {
  const { summary, orders, loading, error, openModal } = useDashboard();

  if (loading && !summary) {
    return (
      <div style={{ padding: '2rem', color: 'var(--color-text-secondary)' }}>
        Loading Dashboard...
      </div>
    );
  }

  const stats = summary || { totalDebt: 0, unpaidCount: 0, todayCount: 0 };
  const recentOrders = orders.slice(0, 5); // Just show top 5 on dashboard

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="page-title">Dashboard</h1>
        {error && (
          <span style={{ 
            color: 'var(--color-danger)', 
            fontSize: '11px', 
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            padding: '0.25rem 0.75rem',
            borderRadius: '20px',
            border: '1px solid var(--color-danger)',
            textTransform: 'uppercase',
            fontWeight: 'bold'
          }}>
            Offline
          </span>
        )}
      </div>
      
      {/* STATS GRID */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Outstanding</div>
          <div className="stat-value highlight">₦{stats.totalDebt.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Unpaid Orders</div>
          <div className="stat-value">{stats.unpaidCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Today</div>
          <div className="stat-value">{stats.todayCount}</div>
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border)', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '18px', margin: 0 }}>Recent Activity</h2>
          <span style={{ fontSize: '12px', color: '#666' }}>Showing last 5 orders</span>
        </div>
        
        {recentOrders.length > 0 ? (
          <>
            {/* DESKTOP VIEW */}
            <div className="desktop-only">
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <th style={{ padding: '0.75rem 0', color: 'var(--color-text-secondary)', fontWeight: 'normal', fontSize: '13px' }}>Customer</th>
                    <th style={{ padding: '0.75rem 0', color: 'var(--color-text-secondary)', fontWeight: 'normal', fontSize: '13px' }}>Product</th>
                    <th style={{ padding: '0.75rem 0', color: 'var(--color-text-secondary)', fontWeight: 'normal', fontSize: '13px' }}>Qty</th>
                    <th style={{ padding: '0.75rem 0', color: 'var(--color-text-secondary)', fontWeight: 'normal', fontSize: '13px' }}>Total</th>
                    <th style={{ padding: '0.75rem 0', color: 'var(--color-text-secondary)', fontWeight: 'normal', fontSize: '13px' }}>Status</th>
                    <th style={{ padding: '0.75rem 0', color: 'var(--color-text-secondary)', fontWeight: 'normal', fontSize: '13px', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order: any) => (
                    <tr key={order.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '1rem 0' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <EditableCustomerName id={order.customer_id} name={order.customers?.name} phone={order.customers?.phone} />
                          {order.customers?.address && (
                            <span style={{ fontSize: '10px', color: '#666', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              📍 {order.customers.address}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '1rem 0' }}>
                        <span className="product-tag">{order.product_name || 'Cement'}</span>
                        {order.messages?.message_text && (
                          <div style={{ fontSize: '11px', color: '#555', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '4px' }}>
                            "{order.messages.message_text}"
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '1rem 0' }}>{order.quantity}</td>
                      <td style={{ padding: '1rem 0' }}>{order.total_price ? `₦${Number(order.total_price).toLocaleString()}` : '--'}</td>
                      <td style={{ padding: '1rem 0' }}>
                        <span style={{ 
                          padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold',
                          backgroundColor: order.status === 'paid' ? 'rgba(34, 197, 94, 0.2)' : order.status === 'draft' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                          color: order.status === 'paid' ? 'var(--color-success)' : order.status === 'draft' ? '#3B82F6' : 'var(--color-warning)'
                        }}>{order.status.toUpperCase()}</span>
                      </td>
                      <td style={{ padding: '1rem 0', textAlign: 'right' }}>
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
              {recentOrders.map((order: any) => (
                <div key={order.id} className="mobile-card" style={{ border: 'none', borderBottom: '1px solid var(--color-border)', borderRadius: 0, padding: '1rem 0', margin: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <EditableCustomerName id={order.customer_id} name={order.customers?.name} phone={order.customers?.phone} />
                      {order.customers?.address && (
                        <span style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>📍 {order.customers.address}</span>
                      )}
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: 'bold', color: order.status === 'paid' ? 'var(--color-success)' : order.status === 'draft' ? '#3B82F6' : 'var(--color-warning)' }}>{order.status.toUpperCase()}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span className="product-tag">{order.product_name || 'Cement'}</span>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Qty: {order.quantity}</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '16px', fontWeight: 'bold' }}>₦{Number(order.total_price || 0).toLocaleString()}</div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <OrderActionButton orderId={order.id} currentStatus={order.status} quantity={order.quantity} />
                      <button onClick={() => openModal('delete', order.id)} style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', borderRadius: '6px', color: '#666' }}>🗑️</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ color: 'var(--color-text-secondary)' }}>No recent activity.</div>
        )}
      </div>

      <style jsx>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .stat-card {
          padding: 1.5rem;
          background-color: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 12px;
        }
        .stat-label {
          color: var(--color-text-secondary);
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 0.5rem;
        }
        .stat-value {
          font-size: 1.8rem;
          font-weight: bold;
        }
        .stat-value.highlight {
          color: var(--color-danger);
        }

        .product-tag {
          display: inline-block;
          padding: 2px 8px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
          color: #bbb;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
          .stat-value {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}
