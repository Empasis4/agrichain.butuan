import React, { useState, useEffect } from 'react';
import { Users, CreditCard, ShieldCheck, ChevronRight, Bell, Package, TrendingUp } from 'lucide-react';
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
    pending_payments: 0
  });
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchNotifications();
    const interval = setInterval(() => {
      fetchStats();
      fetchNotifications();
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

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/api/notifications?user_id=1');
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

  return (
    <div className="admin-dashboard">
      <header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Admin Control Hub</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Platform Health: <span style={{ color: 'var(--primary)', fontWeight: '600' }}>Excellent</span>
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

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
        <div className="card">
          <Users size={20} color="var(--primary)" />
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>Total Users</p>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>{stats.total_users}</h3>
        </div>
        <div className="card">
          <CreditCard size={20} color="var(--warning)" />
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>Gross Revenue</p>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>₱{parseFloat(stats.total_revenue || 0).toLocaleString()}</h3>
        </div>
        <div className="card">
          <TrendingUp size={20} color="var(--primary)" />
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>Farmers</p>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>{stats.total_farmers}</h3>
        </div>
        <div className="card">
          <Package size={20} color="var(--accent)" />
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>Retailers</p>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>{stats.total_retailers}</h3>
        </div>
      </div>

      {/* Verification Hub */}
      <section style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px' }}>Verification Hub</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="card"
            style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', padding: '16px', borderLeft: `5px solid ${stats.pending_payments > 0 ? 'var(--warning)' : '#ddd'}` }}
            onClick={() => navigate('/admin/verify')}
          >
            <div style={{ width: '56px', height: '56px', background: '#FFF9C4', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ShieldCheck color="var(--warning)" size={28} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700' }}>Financial Verification</h3>
              <p style={{ fontSize: '0.85rem', color: stats.pending_payments > 0 ? 'var(--warning)' : 'var(--text-muted)', fontWeight: stats.pending_payments > 0 ? '700' : '400' }}>
                {stats.pending_payments} Pending Payment{stats.pending_payments !== 1 ? 's' : ''}
              </p>
            </div>
            <ChevronRight size={20} color="#ccc" />
          </div>

          <div className="card"
            style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', padding: '16px', borderLeft: `5px solid ${stats.pending_verifications > 0 ? 'var(--primary)' : '#ddd'}` }}
            onClick={() => navigate('/admin/users')}
          >
            <div style={{ width: '56px', height: '56px', background: '#E8F5E9', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Users color="var(--primary)" size={28} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700' }}>User Verification</h3>
              <p style={{ fontSize: '0.85rem', color: stats.pending_verifications > 0 ? 'var(--primary)' : 'var(--text-muted)', fontWeight: stats.pending_verifications > 0 ? '700' : '400' }}>
                {stats.pending_verifications} User{stats.pending_verifications !== 1 ? 's' : ''} awaiting approval
              </p>
            </div>
            <ChevronRight size={20} color="#ccc" />
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
