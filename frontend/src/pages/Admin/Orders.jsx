import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Truck, CheckCircle, Clock, Search, Filter, Edit, User, Clipboard } from 'lucide-react';
import { useToast } from '../../components/Toast';

const AdminOrders = ({ user }) => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ status: '', rider_name: '' });

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('/api/admin/orders');
      setOrders(Array.isArray(res.data) ? res.data : []);
      setLoading(false);
    } catch (error) {
      console.error('Admin orders fetch error:', error);
      setLoading(false);
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      await axios.put(`/api/orders/${id}`, data);
      showToast(`Order #${id} updated successfully`, 'success');
      setEditingId(null);
      setEditData({ status: '', rider_name: '' }); // Reset
      fetchOrders();
    } catch (error) {
      showToast('Failed to update order', 'error');
    }
  };

  const filteredOrders = orders.filter(o => filter === 'all' || o.status === filter);

  return (
    <div className="admin-orders-page">
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '800' }}>System Transactions</h1>
        <p style={{ color: 'var(--text-muted)' }}>Monitor and manage all platform orders</p>
      </header>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '8px' }}>
        {['all', 'pending', 'paid', 'shipped', 'delivered', 'cancelled'].map(s => (
          <button 
            key={s}
            onClick={() => setFilter(s)}
            style={{ 
              padding: '8px 16px', borderRadius: '20px', border: 'none', fontSize: '0.8rem', whiteSpace: 'nowrap',
              background: filter === s ? 'var(--primary)' : '#eee',
              color: filter === s ? '#fff' : 'var(--text-muted)',
              fontWeight: filter === s ? '700' : '500',
              cursor: 'pointer'
            }}
          >
            {s.toUpperCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Accessing transaction records...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          <Package size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
          <p>No transactions found for this filter.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredOrders.map((order) => (
            <div key={order.id} className="card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>#ORD-{order.id}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(order.created_at).toLocaleDateString()}</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ width: '40px', height: '40px', background: '#f5f5f5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Truck size={20} color="#666" />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.9rem', fontWeight: '600' }}>{order.retailer?.name || 'Retailer'} → {order.items?.[0]?.product?.farmer?.name || 'Farmer'}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>₱{parseFloat(order.total_price).toLocaleString()} • {order.payment_method?.toUpperCase()}</p>
                </div>
                <div 
                  className={`badge badge-${order.status === 'delivered' ? 'cheap' : 'fair'}`}
                  onClick={() => {
                    setEditingId(order.id);
                    setEditData({ status: order.status, rider_name: order.rider_name || '' });
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {order.status.toUpperCase()} <Edit size={10} style={{ marginLeft: '4px' }} />
                </div>
              </div>

              {editingId === order.id ? (
                <div style={{ background: '#f0f7f0', padding: '16px', borderRadius: '12px', marginTop: '8px', animation: 'fadeIn 0.3s ease' }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: '800', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clipboard size={16} /> Fulfillment Actions
                  </p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Normalized Status Logic: treat 'approved' as 'paid' */}
                    {(order.status === 'pending' || order.status === 'approved') && (
                      <button 
                        onClick={() => handleUpdate(order.id, { status: 'paid' })}
                        className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '0.9rem' }}
                      >
                        {order.payment_method === 'cod' ? '✅ Confirm & Approve Order' : '💰 Verify GCash Payment'}
                      </button>
                    )}

                    {(order.status === 'paid' || order.status === 'approved') && (
                      <>
                        <div style={{ position: 'relative' }}>
                          <User size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                          <input 
                            type="text" placeholder="Assign Rider Name..." className="input" 
                            value={editData.rider_name} onChange={e => setEditData({...editData, rider_name: e.target.value})}
                            style={{ fontSize: '0.85rem', paddingLeft: '32px' }}
                          />
                        </div>
                        <button 
                          onClick={() => {
                            if (!editData.rider_name) { showToast('Please assign a rider first', 'warning'); return; }
                            handleUpdate(order.id, { status: 'shipped', rider_name: editData.rider_name });
                          }}
                          className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '0.9rem', background: 'var(--accent)' }}
                        >
                          🚚 Dispatch Rider
                        </button>
                      </>
                    )}

                    {order.status === 'shipped' && (
                      <button 
                        onClick={() => handleUpdate(order.id, { status: 'delivered' })}
                        className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '0.9rem', background: 'var(--primary)' }}
                      >
                        📦 Complete Delivery
                      </button>
                    )}

                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <button onClick={() => setEditingId(null)} className="btn" style={{ flex: 1, fontSize: '0.8rem', background: '#eee' }}>Back</button>
                      {order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <button 
                          onClick={() => handleUpdate(order.id, { status: 'cancelled' })}
                          className="btn" style={{ flex: 1, fontSize: '0.8rem', background: '#ffebee', color: 'var(--danger)', border: '1px solid #ffcdd2' }}
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ background: '#f9f9f9', padding: '10px', borderRadius: '8px', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>
                    <span style={{ color: 'var(--text-muted)' }}>From: <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{order.items?.[0]?.product?.farmer?.name || 'Farmer'}</span></span>
                    <span style={{ color: 'var(--text-muted)' }}>To: <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{order.retailer?.name || 'Retailer'}</span></span>
                  </div>
                  {order.items?.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>{item.quantity} {item.product.unit} {item.product.name}</span>
                      <span style={{ fontWeight: '600' }}>₱{(item.quantity * item.price_at_time).toLocaleString()}</span>
                    </div>
                  ))}
                  {order.rider_name && (
                    <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: '700' }}>
                      <Truck size={14} /> Rider: {order.rider_name}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
