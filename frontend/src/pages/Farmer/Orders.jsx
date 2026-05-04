import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FarmerOrders = ({ user }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    fetchOrders();
    const interval = setInterval(fetchOrders, 8000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`/api/orders/farmer/${user.id}`);
      setOrders(Array.isArray(res.data) ? res.data : []);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setOrders([]);
      setLoading(false);
    }
  };

  return (
    <div className="orders-page">
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem' }}>Incoming Orders</h1>
        <p style={{ color: 'var(--text-muted)' }}>Sales and tracking from retailers</p>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Syncing with database...</div>
      ) : orders.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          <Package size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
          <p>No incoming orders yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {orders.map((order) => (
            <div key={order.id} className="card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>#ORD-{order.id}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(order.created_at).toLocaleDateString()}</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ width: '40px', height: '40px', background: 'var(--primary-light)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Truck size={20} color="var(--primary)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <p style={{ fontSize: '0.9rem', fontWeight: '600' }}>Buyer: {order.retailer?.name || 'Local Retailer'}</p>
                    <button 
                        onClick={() => navigate(`/chat/${order.retailer_id}`)}
                        style={{ 
                            display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', 
                            background: '#f0f7ff', color: '#007bff', border: '1px solid #cce5ff', 
                            borderRadius: '6px', fontSize: '0.7rem', fontWeight: '700', cursor: 'pointer' 
                        }}
                    >
                        Chat with Buyer
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>₱{order.total_price.toLocaleString()} •</p>
                    
                    {/* Payment Method Badge */}
                    <div style={{ 
                        display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '4px',
                        background: order.payment_method === 'gcash' ? '#E3F2FD' : '#E8F5E9',
                        color: order.payment_method === 'gcash' ? '#1976D2' : '#2E7D32',
                        fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase'
                    }}>
                        {order.payment_method === 'gcash' ? '💳 GCash' : '💵 COD'}
                    </div>

                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>• Status:</p>
                    <select 
                      value={order.status} 
                      onChange={async (e) => {
                        const newStatus = e.target.value;
                        try {
                          await axios.put(`/api/orders/${order.id}`, { status: newStatus });
                          // Notify Retailer
                          await axios.post('/api/notifications', {
                            user_id: order.retailer_id,
                            title: `Order Update: ${newStatus.toUpperCase()}`,
                            message: `Order #ORD-${order.id} is now ${newStatus}.`,
                            type: 'order'
                          });
                          fetchOrders();
                        } catch (err) {
                          console.error('Status update error:', err);
                        }
                      }}
                      style={{ 
                        fontSize: '0.8rem', 
                        padding: '2px 8px', 
                        borderRadius: '6px', 
                        border: '1px solid var(--primary)', 
                        background: '#fff',
                        color: 'var(--primary)',
                        fontWeight: '700',
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  {order.payment_method === 'cod' && (
                      <p style={{ fontSize: '0.7rem', color: '#666', marginTop: '4px', fontStyle: 'italic' }}>
                        * Rider will remit payment upon successful delivery.
                      </p>
                  )}
                </div>
              </div>

              <div style={{ background: '#f9f9f9', padding: '12px', borderRadius: '12px', fontSize: '0.85rem' }}>
                <p style={{ fontWeight: '700', marginBottom: '8px', color: '#666' }}>Ordered Items:</p>
                {order.items.map(item => (
                  <p key={item.id} style={{ marginBottom: '4px' }}>• {item.quantity} {item.product.unit} of {item.product.name}</p>
                ))}
              </div>

              {order.payment_proof_image && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed #eee' }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '8px' }}>💳 PROOF OF PAYMENT (GCASH)</p>
                    <div 
                        onClick={() => window.open(order.payment_proof_image, '_blank')}
                        style={{ width: '100px', height: '140px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #ddd', cursor: 'pointer', position: 'relative' }}
                    >
                        <img src={order.payment_proof_image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '0.6rem', textAlign: 'center', padding: '4px' }}>VIEW FULL</div>
                    </div>
                    {order.payment_reference && (
                        <p style={{ fontSize: '0.75rem', marginTop: '8px', color: '#666' }}>Ref: <span style={{ fontWeight: '700' }}>{order.payment_reference}</span></p>
                    )}
                </div>
              )}

              {/* Rider Connection Section */}
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ padding: '6px', background: '#f5f5f5', borderRadius: '50%' }}>
                            <Truck size={16} color="#666" />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.75rem', color: '#999', fontWeight: '600' }}>LOGISTICS PARTNER</p>
                            <p style={{ fontSize: '0.85rem', fontWeight: '700', color: '#333' }}>
                                {order.rider_name || (order.rider ? order.rider.name : 'Awaiting Rider Assignment...')}
                            </p>
                        </div>
                    </div>
                    {(order.rider_id || order.rider) && (
                        <button 
                            onClick={() => navigate(`/chat/${order.rider_id || order.rider.id}`)}
                            style={{ 
                                display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', 
                                background: 'var(--primary-light)', color: 'var(--primary)', 
                                border: 'none', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', 
                                cursor: 'pointer' 
                            }}
                        >
                            Chat with Rider
                        </button>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FarmerOrders;
