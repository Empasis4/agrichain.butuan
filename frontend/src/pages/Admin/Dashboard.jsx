import React, { useState, useEffect } from 'react';
import { Users, CreditCard, ShieldCheck, ChevronRight, Bell, Package, TrendingUp, FileText, Star, X, Truck, CheckCircle } from 'lucide-react';
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
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [broadcastData, setBroadcastData] = useState({ title: '', message: '', role: 'all' });
  const [broadcasting, setBroadcasting] = useState(false);

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
    if (!user?.id) return;
    try {
      const res = await axios.get(`/api/notifications?user_id=${user.id}&limit=20`);
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Admin notif error:', err);
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    setBroadcasting(true);
    try {
      await axios.post('/api/admin/broadcast', broadcastData);
      setShowBroadcast(false);
      setBroadcastData({ title: '', message: '', role: 'all' });
      setShowSuccess(true);
    } catch (err) {
      alert('Failed to send announcement');
    } finally {
      setBroadcasting(false);
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
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Command Center</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4CAF50', boxShadow: '0 0 10px rgba(76, 175, 80, 0.5)' }}></span>
            Platform Status: Optimal • Operational Oversight
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={() => navigate('/notifications')} 
              style={{ 
                position: 'relative', cursor: 'pointer', background: 'none', border: 'none', padding: '0',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div style={{ width: '48px', height: '48px', background: '#fff', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)', border: '1px solid #eee' }}>
                  <Bell size={22} color="var(--primary)" />
              </div>
              {notifications.filter(n => !n.is_read).length > 0 && (
                  <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: 'var(--danger)', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', border: '2px solid #fff' }}>
                  {notifications.filter(n => !n.is_read).length}
                  </span>
              )}
            </button>
        </div>
      </header>

      {/* Modern KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, #1A237E 0%, #3F51B5 100%)', color: '#fff', border: 'none', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Users size={24} color="rgba(255,255,255,0.7)" />
            <TrendingUp size={16} color="rgba(255,255,255,0.5)" />
          </div>
          <p style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '12px', fontWeight: '600' }}>Total Accounts</p>
          <h3 style={{ fontSize: '1.75rem', fontWeight: '900', marginTop: '4px' }}>{stats.total_users}</h3>
        </div>
        <div className="card" style={{ background: 'linear-gradient(135deg, #1B5E20 0%, #4CAF50 100%)', color: '#fff', border: 'none', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <CreditCard size={24} color="rgba(255,255,255,0.7)" />
            <ShieldCheck size={16} color="rgba(255,255,255,0.5)" />
          </div>
          <p style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '12px', fontWeight: '600' }}>Gross Volume</p>
          <h3 style={{ fontSize: '1.75rem', fontWeight: '900', marginTop: '4px' }}>₱{parseFloat(stats.total_revenue || 0).toLocaleString()}</h3>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px' }}>
          <div className="card" style={{ padding: '16px', border: '1px solid #f0f0f0', borderRadius: '20px' }}>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Active Farmers</p>
              <h4 style={{ fontSize: '1.25rem', fontWeight: '800', marginTop: '4px', color: 'var(--primary)' }}>{stats.total_farmers}</h4>
          </div>
          <div className="card" style={{ padding: '16px', border: '1px solid #f0f0f0', borderRadius: '20px' }}>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Retailer Network</p>
              <h4 style={{ fontSize: '1.25rem', fontWeight: '800', marginTop: '4px', color: 'var(--accent)' }}>{stats.total_retailers}</h4>
          </div>
      </div>

      {/* Operational Hub */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: '900', marginBottom: '16px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} color="var(--primary)" /> Operational Hub
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          <div className="card"
            style={{ 
                display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', padding: '20px', 
                borderRadius: '24px', border: '1px solid #eee', transition: 'all 0.2s ease',
                background: stats.pending_verifications > 0 ? '#FFFDE7' : '#fff',
                borderColor: stats.pending_verifications > 0 ? '#FFF59D' : '#eee',
                boxShadow: 'var(--shadow-sm)'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
            onClick={() => navigate('/admin/users')}
          >
            <div style={{ width: '56px', height: '56px', background: stats.pending_verifications > 0 ? '#FBC02D' : '#E8F5E9', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <Users color="#fff" size={28} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '800' }}>User Management</h3>
              <p style={{ fontSize: '0.8rem', color: stats.pending_verifications > 0 ? '#F57F17' : 'var(--text-muted)', fontWeight: stats.pending_verifications > 0 ? '700' : '500', marginTop: '2px' }}>
                {stats.pending_verifications > 0 ? `${stats.pending_verifications} pending approvals` : 'Manage all platform accounts'}
              </p>
            </div>
            <ChevronRight size={20} color="#ccc" />
          </div>

          <div className="card"
            style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', padding: '20px', borderRadius: '24px', border: '1px solid #eee', transition: 'all 0.2s ease', boxShadow: 'var(--shadow-sm)' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
            onClick={() => navigate('/admin/logs')}
          >
            <div style={{ width: '56px', height: '56px', background: '#E3F2FD', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <FileText color="#1976D2" size={28} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '800' }}>Financial Audit</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Review transaction history
              </p>
            </div>
            <ChevronRight size={20} color="#ccc" />
          </div>

          <div className="card"
            style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', padding: '20px', borderRadius: '24px', border: '1px solid #eee', transition: 'all 0.2s ease', boxShadow: 'var(--shadow-sm)' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
            onClick={() => setShowBroadcast(true)}
          >
            <div style={{ width: '56px', height: '56px', background: 'var(--primary-light)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <Bell color="var(--primary)" size={28} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '800' }}>System Broadcast</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Notify all platform participants
              </p>
            </div>
            <ChevronRight size={20} color="#ccc" />
          </div>
        </div>
      </section>

      {/* Modern Broadcast Modal */}
      {showBroadcast && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div className="card page-transition" style={{ width: '100%', maxWidth: '480px', padding: '0', borderRadius: '32px', background: '#fff', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                {/* Modal Header */}
                <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #1B5E20 100%)', padding: '32px', color: '#fff', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '900', letterSpacing: '-0.5px' }}>System Broadcast</h2>
                            <p style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '4px' }}>Global communication terminal</p>
                        </div>
                        <button 
                            onClick={() => setShowBroadcast(false)}
                            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer', transition: 'all 0.2s ease' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleBroadcast} style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '10px', display: 'block', letterSpacing: '0.5px' }}>Target Audience</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                            {[
                                { id: 'all', label: 'All', icon: <Users size={16} /> },
                                { id: 'farmer', label: 'Farmer', icon: <Star size={16} /> },
                                { id: 'retailer', label: 'Retailer', icon: <Package size={16} /> },
                                { id: 'rider', label: 'Rider', icon: <Truck size={16} /> }
                            ].map(role => (
                                <button
                                    key={role.id}
                                    type="button"
                                    onClick={() => setBroadcastData({...broadcastData, role: role.id})}
                                    style={{
                                        padding: '12px 8px', borderRadius: '16px', border: '2px solid',
                                        borderColor: broadcastData.role === role.id ? 'var(--primary)' : '#f0f0f0',
                                        background: broadcastData.role === role.id ? 'var(--primary-light)' : '#fff',
                                        color: broadcastData.role === role.id ? 'var(--primary)' : 'var(--text-muted)',
                                        fontSize: '0.7rem', fontWeight: '800', cursor: 'pointer',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {role.icon}
                                    {role.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px', display: 'block', letterSpacing: '0.5px' }}>Announcement Title</label>
                        <input 
                            type="text" 
                            className="input" 
                            placeholder="Headline of your message..." 
                            style={{ borderRadius: '16px', height: '52px', border: '2px solid #f0f0f0', padding: '0 16px', fontSize: '0.95rem', fontWeight: '600' }}
                            required
                            value={broadcastData.title}
                            onChange={e => setBroadcastData({...broadcastData, title: e.target.value})}
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px', display: 'block', letterSpacing: '0.5px' }}>Content Body</label>
                        <textarea 
                            className="input" 
                            placeholder="Detailed description or instructions..." 
                            style={{ borderRadius: '16px', minHeight: '140px', padding: '16px', border: '2px solid #f0f0f0', fontSize: '0.95rem', lineHeight: '1.6' }}
                            required
                            value={broadcastData.message}
                            onChange={e => setBroadcastData({...broadcastData, message: e.target.value})}
                        ></textarea>
                    </div>

                    <button 
                        type="submit" 
                        className="btn btn-primary" 
                        disabled={broadcasting}
                        style={{ 
                            height: '60px', borderRadius: '20px', fontSize: '1.1rem', fontWeight: '900', marginTop: '8px',
                            boxShadow: '0 10px 20px -5px rgba(46, 125, 50, 0.4)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px'
                        }}
                    >
                        {broadcasting ? (
                            <div className="spin" style={{ width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }}></div>
                        ) : (
                            <>
                                <Bell size={20} /> Send Announcement
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
      )}

      {/* Modern Success Modal */}
      {showSuccess && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div className="card page-transition" style={{ width: '100%', maxWidth: '380px', padding: '40px', borderRadius: '32px', background: '#fff', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                <div style={{ width: '80px', height: '80px', background: 'var(--primary-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                    <div style={{ width: '60px', height: '60px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 8px 16px rgba(46, 125, 50, 0.3)' }}>
                        <CheckCircle size={32} />
                    </div>
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-main)', marginBottom: '12px' }}>Broadcast Sent!</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '32px' }}>
                    Your announcement has been successfully delivered to the targeted participants.
                </p>
                <button 
                    onClick={() => setShowSuccess(false)}
                    className="btn btn-primary" 
                    style={{ height: '56px', borderRadius: '18px', width: '100%', fontSize: '1rem', fontWeight: '900' }}
                >
                    Return to Dashboard
                </button>
            </div>
        </div>
      )}

      {/* Live Activity Feed */}
      <section style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--text-main)' }}>Live Intelligence Feed</h2>
          <span onClick={() => navigate('/notifications')} style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '700', cursor: 'pointer', background: 'var(--primary-light)', padding: '4px 12px', borderRadius: '20px' }}>View History</span>
        </div>
        {notifications.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px', background: '#fcfcfc', border: '2px dashed #eee', borderRadius: '24px' }}>
            <Bell size={32} style={{ opacity: 0.1, marginBottom: '12px' }} />
            <p style={{ fontSize: '0.85rem', color: '#999' }}>Awaiting system events...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {notifications.slice(0, 5).map(n => (
              <div key={n.id} className="card" style={{ padding: '16px 20px', display: 'flex', gap: '16px', alignItems: 'flex-start', borderRadius: '20px', border: '1px solid #f5f5f5', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: n.type === 'payment' ? 'var(--accent)' : 'var(--primary)', marginTop: '6px', flexShrink: 0 }}></div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: '800', fontSize: '0.9rem', color: 'var(--text-main)' }}>{n.title}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5', marginTop: '4px' }}>{n.message}</p>
                  <p style={{ fontSize: '0.7rem', color: '#aaa', marginTop: '8px', fontWeight: '600' }}>{timeAgo(n.created_at)}</p>
                </div>
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
