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

  const markAsRead = async (id) => {
    try {
      await axios.patch(`/api/notifications/${id}`, { is_read: true });
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch (err) {
      console.error('Mark as read error:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.post(`/api/notifications/mark-all-read?user_id=${user.id}`);
      setNotifications(notifications.map(n => ({ ...n, is_read: 1 })));
    } catch (err) {
      console.error('Mark all read error:', err);
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
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Activity Log</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>Real-time updates and system events</p>
        </div>
        <button 
          onClick={markAllAsRead}
          style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '700', border: 'none', cursor: 'pointer', padding: '8px 16px', borderRadius: '20px', background: 'var(--primary-light)', transition: 'all 0.2s' }}
        >
            Mark all read
        </button>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
              <div className="spin" style={{ width: '32px', height: '32px', border: '3px solid var(--primary-light)', borderTopColor: 'var(--primary)', borderRadius: '50%', margin: '0 auto' }}></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '80px 40px', background: '#fdfdfd', border: '2px dashed #eee', borderRadius: '24px' }}>
            <Bell size={48} style={{ opacity: 0.1, marginBottom: '20px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#999' }}>All Caught Up!</h3>
            <p style={{ fontSize: '0.85rem', color: '#aaa', marginTop: '8px' }}>Your notification feed is empty.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div 
              key={n.id} 
              onClick={() => !n.is_read && markAsRead(n.id)}
              className="card" 
              style={{ 
                display: 'flex', gap: '16px', alignItems: 'flex-start', padding: '20px', borderRadius: '20px',
                border: '1px solid',
                borderColor: n.is_read ? '#f0f0f0' : 'var(--primary-light)',
                boxShadow: n.is_read ? '0 4px 12px rgba(0,0,0,0.02)' : '0 8px 24px rgba(46, 125, 50, 0.05)',
                background: n.is_read ? '#fff' : 'linear-gradient(to right, #fff, var(--primary-light))',
                cursor: n.is_read ? 'default' : 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{
                width: '48px', height: '48px', borderRadius: '16px',
                background: n.type === 'order' ? 'var(--primary-light)' : n.type === 'system' ? 'var(--accent-light)' : '#f5f5f5', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, boxShadow: '0 4px 8px rgba(0,0,0,0.05)'
              }}>
                {getIcon(n.type)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: n.is_read ? '800' : '900', color: 'var(--text-main)' }}>{n.title}</h3>
                  <span style={{ fontSize: '0.7rem', color: '#aaa', fontWeight: '600' }}>{timeAgo(n.created_at)}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>{n.message}</p>
                {!n.is_read && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px' }}>
                        <div style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%' }}></div>
                        <span style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: '800', textTransform: 'uppercase' }}>New</span>
                    </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
