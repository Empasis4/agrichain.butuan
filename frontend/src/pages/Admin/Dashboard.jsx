import React, { useState, useEffect } from 'react';
import { Users, CreditCard, ShieldCheck, ChevronRight, Bell, Package, TrendingUp, FileText, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_users: 0,
    pending_verifications: 0,
    total_farmers: 0,
    total_retailers: 0,
    total_revenue: 0,
    ready_for_pickup: 0,
    out_for_delivery: 0,
    delivered_today: 0
  });
  const [notifications, setNotifications] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchNotifications();
    fetchOrders();
    const interval = setInterval(() => {
      fetchStats();
      fetchNotifications();
      fetchOrders();
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/admin/stats');
      setStats(res.data);
    } catch (error) {
      console.error('Admin stats error:', error);
    }
  };

  const fetchOrders = async () => {
    try {
        const res = await axios.get('/api/admin/orders');
        setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error(err); }
  }

  const fetchNotifications = async () => {
    if (!user?.id) return;
    try {
      const res = await axios.get(`/api/notifications?user_id=${user.id}`);
      setNotifications(Array.isArray(res.data) ? res.data.slice(0, 5) : []);
    } catch (err) {
      console.error('Admin notif error:', err);
    }
  };

  const timeAgo = (dateStr) => {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  const readyOrders = orders.filter(o => ['approved', 'paid'].includes(o.status)).slice(0, 3);
  const activeDeliveries = orders.filter(o => o.status === 'shipped').slice(0, 3);

  return (
    <div className="admin-dashboard">
      <header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Admin Control Hub</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Logistics Status: <span style={{ color: 'var(--primary)', fontWeight: '600' }}>{stats.out_for_delivery} Active</span>
          </p>
        </div>
        <div onClick={() => navigate('/notifications')} style={{ position: 'relative', cursor: 'pointer' }}>
          <div style={{ width: '40px', height: '40px', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
            <Bell size={20} color="var(--primary)" />
          </div>
          {notifications.length > 0 && (
            <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: 'var(--danger)', color: '#fff', borderRadius: '50%', width: '18px', height: '18px', fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
              {notifications.length}
            </span>
          )}
        </div>
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
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>₱{parseFloat(stats.total_revenue || 0).toLocaleString()}</h3>
        </div>
      </div>

      {/* Ready for Pick Up Section */}
      <section style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Ready for Pick Up</h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer' }} onClick={() => navigate('/admin/logs')}>View History</span>
        </div>
        <div className="card" style={{ padding: readyOrders.length > 0 ? '12px' : '24px' }}>
            {readyOrders.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {readyOrders.map(o => (
                        <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0', paddingBottom: '8px' }}>
                            <div>
                                <p style={{ fontSize: '0.85rem', fontWeight: '700' }}>#ORD-{o.id} • {o.product?.name || 'Produce'}</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>From: {o.product?.farmer?.name || 'Local Farmer'}</p>
                            </div>
                            <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>{o.status.toUpperCase()}</span>
                        </div>
                    ))}
                </div>
            ) : (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No orders ready for pickup.</p>
            )}
        </div>
      </section>

      {/* Active Deliveries */}
      <section style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '12px' }}>Active Deliveries</h2>
        <div className="card" style={{ padding: activeDeliveries.length > 0 ? '12px' : '24px' }}>
            {activeDeliveries.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {activeDeliveries.map(o => (
                        <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0', paddingBottom: '8px' }}>
                            <div>
                                <p style={{ fontSize: '0.85rem', fontWeight: '700' }}>#ORD-{o.id} • To {o.user?.name || 'Retailer'}</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status: On the way</p>
                            </div>
                            <span className="badge" style={{ background: '#E3F2FD', color: '#1976D2' }}>IN TRANSIT</span>
                        </div>
                    ))}
                </div>
            ) : (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No active deliveries.</p>
            )}
        </div>
      </section>

      {/* Navigation Hub */}
      <section style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '16px' }}>System Control</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="card" onClick={() => navigate('/admin/users')} style={{ cursor: 'pointer', textAlign: 'center' }}>
            <Users size={24} color="var(--primary)" style={{ margin: '0 auto 8px' }} />
            <p style={{ fontSize: '0.8rem', fontWeight: '700' }}>Verify Users</p>
          </div>
          <div className="card" onClick={() => navigate('/admin/logs')} style={{ cursor: 'pointer', textAlign: 'center' }}>
            <FileText size={24} color="var(--accent)" style={{ margin: '0 auto 8px' }} />
            <p style={{ fontSize: '0.8rem', fontWeight: '700' }}>Audit Logs</p>
          </div>
          <div className="card" onClick={() => navigate('/admin/settings')} style={{ cursor: 'pointer', textAlign: 'center' }}>
            <Star size={24} color="var(--warning)" style={{ margin: '0 auto 8px' }} />
            <p style={{ fontSize: '0.8rem', fontWeight: '700' }}>Platform Settings</p>
          </div>
          <div className="card" onClick={() => navigate('/notifications')} style={{ cursor: 'pointer', textAlign: 'center' }}>
            <Bell size={24} color="var(--danger)" style={{ margin: '0 auto 8px' }} />
            <p style={{ fontSize: '0.8rem', fontWeight: '700' }}>Live Feed</p>
          </div>
        </div>
      </section>

      {/* Live Notifications Feed */}
      <section style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Live Activity Feed</h2>
          <span onClick={() => navigate('/notifications')} style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer' }}>View All</span>
        </div>
        {notifications.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
            <Bell size={32} style={{ opacity: 0.2, marginBottom: '8px' }} />
            <p style={{ fontSize: '0.85rem' }}>No recent activity. Waiting for transactions...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {notifications.map(n => (
              <div key={n.id} className="card" style={{ padding: '12px 16px', display: 'flex', gap: '12px', alignItems: 'flex-start', borderLeft: '4px solid var(--primary)' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: '700', fontSize: '0.85rem' }}>{n.title}</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.4', marginTop: '2px' }}>{n.message}</p>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>{timeAgo(n.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Platform Stats */}
      <section style={{ marginBottom: '24px' }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #1B5E20 100%)', color: '#fff' }}>
          <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>Total Platform Volume</p>
          <h3 style={{ fontSize: '2rem', fontWeight: '900', marginTop: '4px' }}>₱{parseFloat(stats.total_revenue || 0).toLocaleString()}</h3>
          <p style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '8px' }}>
            {stats.total_farmers} Farmers · {stats.total_retailers} Retailers · AgriChain Butuan
          </p>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
