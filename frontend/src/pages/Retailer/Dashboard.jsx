import React from 'react';
import { TrendingUp, AlertTriangle, Package, ChevronRight, ShoppingCart, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const RetailerDashboard = ({ user }) => {
  const navigate = useNavigate();

  const [stats, setStats] = React.useState({ active_orders: 0 });
  const [trending, setTrending] = React.useState([]);
  const [recent, setRecent] = React.useState([]);
  const [notifications, setNotifications] = React.useState([]);

  React.useEffect(() => {
    if (!user?.id) return;
    fetchData();
    const pollInterval = setInterval(fetchData, 10000);
    return () => {
      clearInterval(pollInterval);
    };
  }, [user?.id]);

  const fetchData = async () => {
    if (!user?.id) return;
    try {
      // Fetch Orders
      const orderRes = await axios.get(`/api/orders/retailer/${user.id}`);
      const active = orderRes.data.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length;
      const totalSourced = orderRes.data
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0);
      setStats({ 
        active_orders: active, 
        total_sourced: totalSourced,
        total_orders: orderRes.data.length
      });
      setRecent(orderRes.data.slice(0, 3));

      // Fetch Trending Products
      const productRes = await axios.get('/api/products');
      setTrending(Array.isArray(productRes.data) ? productRes.data.slice(0, 5) : []);

      // Fetch Notifications for Badge
      const notifRes = await axios.get(`/api/notifications?user_id=${user.id}&limit=20`);
      setNotifications(Array.isArray(notifRes.data) ? notifRes.data : []);
    } catch (err) {
      console.error('Retailer data fetch error:', err);
    }
  };

  return (
    <div className="dashboard-retailer">
      <header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800' }}>AgriChain</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Welcome, {user?.name || 'Retailer'}!</p>
        </div>
        <div 
          onClick={() => navigate('/notifications')}
          style={{ width: '40px', height: '40px', background: '#fff', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)', cursor: 'pointer', position: 'relative', border: '1px solid #f0f0f0' }}
        >
          <Bell size={20} color="var(--primary)" />
          {notifications.filter(n => !n.is_read).length > 0 && (
            <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'var(--danger)', color: '#fff', borderRadius: '50%', width: '18px', height: '18px', fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', border: '2px solid #fff', boxShadow: '0 2px 4px rgba(244, 67, 54, 0.3)' }}>
              {notifications.filter(n => !n.is_read).length}
            </span>
          )}
        </div>
      </header>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <TrendingUp size={20} color="var(--primary)" />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Sourced</span>
          <span style={{ fontSize: '1.2rem', fontWeight: '800' }}>₱{stats.total_sourced?.toLocaleString() || '0'}</span>
        </div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Package size={20} color="var(--accent)" />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active Orders</span>
          <span style={{ fontSize: '1.2rem', fontWeight: '800' }}>{stats.active_orders}</span>
        </div>
      </div>



      {/* Market Price Hub */}
      <section style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Market Price Hub</h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer' }} onClick={() => navigate('/marketplace')}>View All</span>
        </div>
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '16px', background: 'var(--primary-light)', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>Trending Crops</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>Live Updates</span>
          </div>
          <div style={{ padding: '12px' }}>
            {trending.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {trending.map(p => {
                        let imgs = [];
                        try { imgs = JSON.parse(p.image_path || '[]'); } catch(e) { imgs = p.image_path ? [p.image_path] : []; }
                        return (
                            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #f0f0f0', paddingBottom: '8px' }}>
                                <div style={{ width: '50px', height: '50px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {(() => {
                                        let imgs = [];
                                        try {
                                          if (p.image_path) {
                                            imgs = p.image_path.startsWith('[') ? JSON.parse(p.image_path) : [p.image_path];
                                          }
                                        } catch (e) { imgs = [p.image_path]; }
                                        
                                        if (imgs.length > 0 && imgs[0]) {
                                          return <img src={imgs[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
                                        }
                                        return p.name.includes('Onion') ? '🧅' : p.name.includes('Banana') ? '🍌' : '🥦';
                                    })()}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: '0.9rem', fontWeight: '700' }}>{p.name}</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.farmer?.name || 'Farmer'} • {p.category}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--primary)' }}>₱{p.price_per_kg}/{p.unit}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <p style={{ fontSize: '0.85rem' }}>Listing is empty. Waiting for Farmer harvests...</p>
                </div>
            )}
          </div>
        </div>
      </section>

      {/* Critical Alerts */}
      <section style={{ marginBottom: '24px' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--primary)', background: 'var(--primary-light)', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <TrendingUp color="var(--primary)" size={24} />
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: '700' }}>Market Opportunity</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Butuan market is looking for fresh produce. Explore now!</p>
          </div>
          <button 
            onClick={() => navigate('/marketplace')}
            className="btn btn-primary" 
            style={{ width: 'auto', padding: '8px 12px', fontSize: '0.75rem' }}
          >
            Explore
          </button>
        </div>
      </section>

      {/* Recent Purchases */}
      <section style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Recent Purchases</h2>
          <ChevronRight size={20} color="var(--text-muted)" onClick={() => navigate('/orders')} style={{ cursor: 'pointer' }} />
        </div>
        <div className="card" style={{ padding: recent.length > 0 ? '12px' : '30px' }}>
            {recent.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {recent.map(o => (
                        <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #f0f0f0', paddingBottom: '8px' }} onClick={() => navigate('/orders')}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Package size={20} color="var(--primary)" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '0.85rem', fontWeight: '700' }}>Order #ORD-{o.id}</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(o.created_at).toLocaleDateString()} • {o.status.toUpperCase()}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: '0.85rem', fontWeight: '800' }}>₱{parseFloat(o.total_price).toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    <ShoppingCart size={40} style={{ opacity: 0.2, marginBottom: '12px' }} />
                    <p style={{ fontSize: '0.85rem' }}>No recent purchases. Start sourcing today!</p>
                    <button onClick={() => navigate('/marketplace')} className="btn btn-primary" style={{ marginTop: '12px', padding: '8px 16px', fontSize: '0.8rem' }}>Marketplace</button>
                </div>
            )}
        </div>
      </section>

      {/* Smart FAB - Shrinks on scroll */}
      <div style={{ height: '40px' }}></div>
    </div>
  );
};

export default RetailerDashboard;
