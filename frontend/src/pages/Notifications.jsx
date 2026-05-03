import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, CheckCircle, AlertTriangle, Info, ShieldCheck } from 'lucide-react';

const Notifications = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 8000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`/api/notifications?user_id=${user.id}`);
      setNotifications(Array.isArray(res.data) ? res.data : []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const getIcon = (type) => {
    if (type === 'order') return <ShieldCheck color="var(--primary)" />;
    if (type === 'system') return <Info color="var(--accent)" />;
    return <Bell color="var(--warning)" />;
  };

  const timeAgo = (dateStr) => {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff} min ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)} hr ago`;
    return `${Math.floor(diff / 1440)} days ago`;
  };

  return (
    <div className="notifications-page">
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem' }}>Notifications</h1>
        <p style={{ color: 'var(--text-muted)' }}>Stay updated with your activities</p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <Bell size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
            <p>No notifications yet.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className="card" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '12px',
                background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
              }}>
                {getIcon(n.type)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: '700' }}>{n.title}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{timeAgo(n.created_at)}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{n.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
