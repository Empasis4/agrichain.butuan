import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Truck, CheckCircle, Clock, Search, Filter, Edit, User, Clipboard, CreditCard } from 'lucide-react';
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
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Transaction Manager</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>Comprehensive oversight of all platform logistics</p>
      </header>

      <div className="custom-scrollbar" style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {[
            { id: 'all', label: 'All', icon: <Clipboard size={14} /> },
            { id: 'pending', label: 'Pending', icon: <Clock size={14} /> },
            { id: 'paid', label: 'Paid', icon: <CreditCard size={14} /> },
            { id: 'shipped', label: 'Dispatch', icon: <Truck size={14} /> },
            { id: 'delivered', label: 'Done', icon: <CheckCircle size={14} /> }
        ].map(s => (
          <button 
            key={s.id}
            onClick={() => setFilter(s.id)}
            style={{ 
              padding: '10px 20px', borderRadius: '24px', border: '1px solid #eee', fontSize: '0.85rem', 
              whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px',
              background: filter === s.id ? 'var(--primary)' : '#fff',
              color: filter === s.id ? '#fff' : 'var(--text-muted)',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: filter === s.id ? '0 4px 12px rgba(46, 125, 50, 0.2)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
            <div className="spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary-light)', borderTopColor: 'var(--primary)', borderRadius: '50%', margin: '0 auto' }}></div>
            <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Syncing records...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px', background: '#fdfdfd', border: '2px dashed #eee', borderRadius: '24px' }}>
          <Package size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1rem', color: '#999' }}>No matching records found</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredOrders.map((order) => (
            <div key={order.id} className="card" style={{ padding: '0', overflow: 'hidden', borderRadius: '24px', border: '1px solid #f0f0f0', boxShadow: '0 8px 24px rgba(0,0,0,0.02)' }}>
              <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: '900', fontSize: '1.1rem', color: 'var(--text-main)' }}>#ORD-{order.id}</span>
                            <span style={{ fontSize: '0.65rem', background: '#f0f0f0', padding: '2px 8px', borderRadius: '4px', color: '#666', fontWeight: '700' }}>{order.payment_method?.toUpperCase()}</span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{new Date(order.created_at).toLocaleString()}</p>
                    </div>
                    <div 
                      onClick={() => {
                        setEditingId(editingId === order.id ? null : order.id);
                        setEditData({ status: order.status, rider_name: order.rider_name || '' });
                      }}
                      style={{ 
                        fontSize: '0.7rem', fontWeight: '800', cursor: 'pointer',
                        padding: '6px 12px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px',
                        background: order.status === 'delivered' ? 'var(--primary-light)' : order.status === 'shipped' ? 'var(--accent-light)' : '#f5f5f5',
                        color: order.status === 'delivered' ? 'var(--primary)' : order.status === 'shipped' ? 'var(--accent)' : '#666'
                      }}
                    >
                      {order.status.toUpperCase()} <Edit size={12} />
                    </div>
                  </div>
                  
                  <div style={{ background: '#f9f9f9', borderRadius: '16px', padding: '16px', marginBottom: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '32px', height: '32px', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                  <User size={16} color="var(--primary)" />
                              </div>
                              <div>
                                  <p style={{ fontSize: '0.6rem', color: '#999', textTransform: 'uppercase', fontWeight: '700' }}>Purchaser</p>
                                  <p style={{ fontSize: '0.85rem', fontWeight: '800' }}>{order.retailer?.name || 'Retailer'}</p>
                              </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                              <p style={{ fontSize: '0.6rem', color: '#999', textTransform: 'uppercase', fontWeight: '700' }}>Total Price</p>
                              <p style={{ fontSize: '1rem', fontWeight: '900', color: 'var(--primary)' }}>₱{parseFloat(order.total_price).toLocaleString()}</p>
                          </div>
                      </div>
                      <div style={{ paddingTop: '12px', borderTop: '1px dashed #ddd' }}>
                           <p style={{ fontSize: '0.6rem', color: '#999', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>Items</p>
                           {order.items?.map(item => (
                             <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '2px' }}>
                               <span>{item.quantity} {item.product.unit} {item.product.name}</span>
                               <span style={{ fontWeight: '700' }}>₱{(item.quantity * item.price_at_time).toLocaleString()}</span>
                             </div>
                           ))}
                      </div>
                  </div>

                  {editingId === order.id ? (
                    <div className="page-transition" style={{ background: 'var(--primary-light)', padding: '20px', borderRadius: '20px', border: '1px solid rgba(46, 125, 50, 0.1)' }}>
                      <p style={{ fontSize: '0.85rem', fontWeight: '900', marginBottom: '16px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clipboard size={18} /> Order Fulfillment Actions
                      </p>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {(order.status === 'pending' || order.status === 'approved') && (
                          <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '12px', fontSize: '0.8rem', color: '#666', textAlign: 'center', border: '1px dashed #ccc' }}>
                             Waiting for financial clearance (Retailer/System)
                          </div>
                        )}

                        {(order.status === 'paid' || order.status === 'approved') && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ position: 'relative' }}>
                              <User size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                              <input 
                                type="text" placeholder="Assign Logistics Personnel..." className="input" 
                                value={editData.rider_name} onChange={e => setEditData({...editData, rider_name: e.target.value})}
                                style={{ paddingLeft: '44px', borderRadius: '14px', height: '52px', background: '#fff' }}
                              />
                            </div>
                            <button 
                              onClick={() => {
                                if (!editData.rider_name) { showToast('Assign a rider first', 'warning'); return; }
                                handleUpdate(order.id, { status: 'shipped', rider_name: editData.rider_name });
                              }}
                              className="btn btn-primary" style={{ width: '100%', borderRadius: '14px', height: '52px', background: 'var(--accent)', color: '#000' }}
                            >
                              🚚 Dispatch Order
                            </button>
                          </div>
                        )}

                        {order.status === 'shipped' && (
                          <button 
                            onClick={() => handleUpdate(order.id, { status: 'delivered' })}
                            className="btn btn-primary" style={{ width: '100%', borderRadius: '14px', height: '52px' }}
                          >
                            📦 Finalize Completion
                          </button>
                        )}

                        <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                          <button onClick={() => setEditingId(null)} className="btn" style={{ flex: 1, height: '48px', borderRadius: '12px', background: '#fff', border: '1px solid #eee' }}>Dismiss</button>
                          {['pending', 'paid', 'approved', 'shipped'].includes(order.status) && (
                            <button 
                              onClick={() => { if(window.confirm('Cancel this transaction?')) handleUpdate(order.id, { status: 'cancelled' }); }}
                              className="btn" style={{ flex: 1, height: '48px', borderRadius: '12px', background: '#FFF5F5', color: 'var(--danger)', border: '1px solid #FFE0E0' }}
                            >
                              Terminate
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    order.rider_name && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: '800', fontSize: '0.85rem' }}>
                            <Truck size={16} /> <span>Logistics: {order.rider_name}</span>
                        </div>
                    )
                  )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
