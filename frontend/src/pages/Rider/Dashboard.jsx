import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Truck, MapPin, CheckCircle, Clock, Navigation } from 'lucide-react';
import { useToast } from '../../components/Toast';

const RiderDashboard = ({ user }) => {
  const { showToast } = useToast();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      const res = await axios.get(`/api/orders`); // For now just get all, but in real app filter by rider_id
      setDeliveries(res.data.filter(o => o.status === 'shipped'));
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.put(`/api/orders/${id}`, { status });
      showToast(`Order updated to ${status}`, 'success');
      fetchDeliveries();
    } catch (err) {
      showToast('Error updating order', 'error');
    }
  };

  return (
    <div className="rider-dashboard">
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Rider Terminal</h1>
        <p style={{ color: 'var(--text-muted)' }}>Welcome back, Courier {user.name}!</p>
      </header>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <div className="card" style={{ flex: 1, background: 'var(--primary)', color: '#fff' }}>
            <Truck size={24} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: '900', marginTop: '8px' }}>{deliveries.length}</h3>
            <p style={{ fontSize: '0.75rem', opacity: 0.8 }}>Active Deliveries</p>
        </div>
      </div>

      <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px' }}>Active Tasks</h2>
      
      {loading ? (
        <p>Loading tasks...</p>
      ) : deliveries.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          <CheckCircle size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
          <p>No active deliveries assigned to you.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {deliveries.map(order => (
            <div key={order.id} className="card" style={{ padding: '16px', borderLeft: '4px solid var(--primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontWeight: '800' }}>#ORD-{order.id}</span>
                    <span style={{ fontSize: '0.8rem', background: '#E8F5E9', color: 'var(--primary)', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>SHIPPED</span>
                </div>
                
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)' }} />
                        <div style={{ width: '2px', flex: 1, background: '#eee' }} />
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent)' }} />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pick-up Point</p>
                            <p style={{ fontSize: '0.9rem', fontWeight: '600' }}>{order.items?.[0]?.product?.farmer?.name}'s Farm</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Drop-off Point</p>
                            <p style={{ fontSize: '0.9rem', fontWeight: '600' }}>{order.delivery_address}</p>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => handleUpdateStatus(order.id, 'delivered')}
                      className="btn btn-primary" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                        <CheckCircle size={18} /> Mark Delivered
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(order.id, 'return')}
                      className="btn" style={{ flex: 1, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        Return
                    </button>
                </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RiderDashboard;
