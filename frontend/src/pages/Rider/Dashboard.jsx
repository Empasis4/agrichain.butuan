import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Truck, MapPin, CheckCircle, Clock, Navigation, Package, TrendingUp, ShieldCheck, CreditCard } from 'lucide-react';
import { useToast } from '../../components/Toast';

const RiderDashboard = ({ user }) => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
      ready_for_pickup: 0,
      out_for_delivery: 0,
      delivered_today: 0,
      total_earnings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get(`/api/orders`);
      const allOrders = res.data;
      setOrders(allOrders);
      
      const today = new Date().toISOString().split('T')[0];
      const riderOrders = allOrders.filter(o => o.rider_id === user.id || !o.rider_id); // Simplified logic

      setStats({
          ready_for_pickup: allOrders.filter(o => ['approved', 'paid'].includes(o.status)).length,
          out_for_delivery: allOrders.filter(o => o.status === 'shipped').length,
          delivered_today: allOrders.filter(o => o.status === 'delivered' && o.updated_at.startsWith(today)).length,
          total_earnings: allOrders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + 50, 0) // Assume 50 per delivery
      });
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.put(`/api/orders/${id}`, { status });
      showToast(`Order updated to ${status}`, 'success');
      fetchData();
    } catch (err) {
      showToast('Error updating order', 'error');
    }
  };

  const tasks = orders.filter(o => ['approved', 'paid', 'shipped'].includes(o.status));

  return (
    <div className="rider-dashboard">
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Rider Terminal</h1>
        <p style={{ color: 'var(--text-muted)' }}>Welcome back, Courier {user.name}!</p>
      </header>

      {/* Logistics KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
        <div className="card" style={{ borderBottom: '3px solid var(--primary)' }}>
          <Package size={20} color="var(--primary)" />
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>Ready for Pick Up</p>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>{stats.ready_for_pickup}</h3>
        </div>
        <div className="card" style={{ borderBottom: '3px solid var(--accent)' }}>
          <TrendingUp size={20} color="var(--accent)" />
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>Out for Delivery</p>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>{stats.out_for_delivery}</h3>
        </div>
        <div className="card" style={{ borderBottom: '3px solid var(--primary)' }}>
          <ShieldCheck size={20} color="var(--primary)" />
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>Delivered Today</p>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>{stats.delivered_today}</h3>
        </div>
        <div className="card" style={{ borderBottom: '3px solid var(--warning)' }}>
          <CreditCard size={20} color="var(--warning)" />
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>Total Earnings</p>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>₱{stats.total_earnings.toLocaleString()}</h3>
        </div>
      </div>

      <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px' }}>Active Tasks</h2>
      
      {loading ? (
        <p>Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          <CheckCircle size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
          <p>No active deliveries assigned to you.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {tasks.map(order => (
            <div key={order.id} className="card" style={{ padding: '16px', borderLeft: `4px solid ${order.status === 'shipped' ? 'var(--accent)' : 'var(--primary)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontWeight: '800' }}>#ORD-{order.id}</span>
                    <span style={{ fontSize: '0.8rem', background: '#E8F5E9', color: 'var(--primary)', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>{order.status.toUpperCase()}</span>
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
                            <p style={{ fontSize: '0.9rem', fontWeight: '600' }}>{order.product?.farmer?.name || 'Local Farm'}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Drop-off Point</p>
                            <p style={{ fontSize: '0.9rem', fontWeight: '600' }}>{order.delivery_address || 'No address'}</p>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    {order.status !== 'shipped' ? (
                        <button 
                            onClick={() => handleUpdateStatus(order.id, 'shipped')}
                            className="btn btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                            <Navigation size={18} /> Accept & Start Delivery
                        </button>
                    ) : (
                        <>
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
                        </>
                    )}
                </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RiderDashboard;
