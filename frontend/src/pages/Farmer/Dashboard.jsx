import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, TrendingUp, Plus, ChevronRight, Info, Calendar, Bell, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FarmerDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_products: 0,
    active_orders: 0
  });
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user?.id) return;
    fetchFarmerStats();
    fetchNotifications();
    const interval = setInterval(() => {
      fetchFarmerStats();
      fetchNotifications();
    }, 8000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`/api/notifications?user_id=${user.id}&limit=20`);
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Farmer notif error:', err);
    }
  };

  const fetchFarmerStats = async () => {
    if (!user?.id) return;
    try {
      console.log('Fetching stats for farmer:', user.id);
      const prodRes = await axios.get(`/api/products/farmer/${user.id}`);
      const orderRes = await axios.get(`/api/orders/farmer/${user.id}`);
      const orders = Array.isArray(orderRes.data) ? orderRes.data : [];
      
      const totalKg = prodRes.data.reduce((sum, p) => sum + (parseFloat(p.quantity_available) || 0), 0);
      
      const totalRevenue = orders
        .filter(o => o.status === 'delivered')
        .reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0);
        
      const pendingRevenue = orders
        .filter(o => o.status !== 'delivered' && o.status !== 'cancelled')
        .reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0);

      setStats({
        total_products: prodRes.data.length,
        total_kg: totalKg,
        active_orders: orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length,
        total_revenue: totalRevenue,
        pending_revenue: pendingRevenue
      });
    } catch (err) {
      console.error('Stats fetch error:', err);
    }
  };

  return (
    <div className="dashboard-farmer">
      <header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Farmer Hub</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Welcome, {user?.name || 'Farmer'}!</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div 
            onClick={() => navigate('/notifications')}
            style={{ width: '40px', height: '40px', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)', cursor: 'pointer', position: 'relative' }}
          >
            <Bell size={20} color="var(--primary)" />
            {notifications.filter(n => !n.is_read).length > 0 && (
                <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: 'var(--danger)', color: '#fff', borderRadius: '50%', width: '18px', height: '18px', fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', border: '2px solid #fff' }}>
                {notifications.filter(n => !n.is_read).length}
                </span>
            )}
          </div>
          <button 
            onClick={() => navigate('/farmer/manage')}
            style={{ width: '40px', height: '40px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)', cursor: 'pointer' }}
          >
            <Plus size={24} />
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <TrendingUp size={20} color="var(--primary)" />
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>Active Harvests</p>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>{stats.total_products}</h3>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--accent)' }}>
          <Package size={20} color="var(--accent)" />
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>Active Orders</p>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>{stats.active_orders}</h3>
        </div>
      </div>

      {/* Financial Overview Section */}
      <section style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '12px' }}>Financial Overview</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="card" style={{ background: '#E8F5E9', border: '1px solid #C8E6C9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ padding: '6px', background: '#4CAF50', borderRadius: '50%', color: '#fff' }}><TrendingUp size={14} /></div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#2E7D32' }}>Total Revenue</span>
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#1B5E20' }}>₱{stats.total_revenue?.toLocaleString() || '0'}</h3>
                <p style={{ fontSize: '0.65rem', color: '#666', marginTop: '4px' }}>Confirmed completed sales</p>
            </div>
            <div className="card" style={{ background: '#FFF3E0', border: '1px solid #FFE0B2' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ padding: '6px', background: '#FF9800', borderRadius: '50%', color: '#fff' }}><Clock size={14} /></div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#E65100' }}>Pending Payout</span>
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#BF360C' }}>₱{stats.pending_revenue?.toLocaleString() || '0'}</h3>
                <p style={{ fontSize: '0.65rem', color: '#666', marginTop: '4px' }}>Active/In-transit orders</p>
            </div>
        </div>
      </section>

      {/* Weekly Yield Analysis Visualization */}
      <section style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '12px' }}>Weekly Yield Analysis</h2>
        <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #1B5E20 100%)', color: '#fff', overflow: 'hidden', padding: '0' }}>
          <div style={{ padding: '20px' }}>
            <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>Estimated Production</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>{stats.total_kg?.toLocaleString() || '0'} kg</h3>
          </div>
          <div style={{ height: '60px', display: 'flex', alignItems: 'flex-end', gap: '4px', padding: '0 20px 20px' }}>
            {[20, 20, 20, 20, 20, 20, 20].map((h, i) => (
              <div key={i} style={{ flex: 1, height: `${h}%`, background: 'rgba(255,255,255,0.2)', borderRadius: '4px' }}></div>
            ))}
          </div>
        </div>
      </section>

      {/* Active Harvests */}
      <section style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Active Harvests</h2>
          <span 
            onClick={() => navigate('/farmer/manage')}
            style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer' }}
          >
            Manage All
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {stats.total_products === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
              <Package size={40} style={{ opacity: 0.2, marginBottom: '12px' }} />
              <p>No active harvests listed yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {stats.total_products > 0 && (
                <div className="card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', background: 'var(--primary-light)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Package size={20} color="var(--primary)" />
                    </div>
                    <div>
                      <p style={{ fontWeight: '700', fontSize: '0.9rem' }}>Main Stock</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{stats.total_products} active listings</p>
                    </div>
                  </div>
                  <ChevronRight size={18} color="#ccc" onClick={() => navigate('/farmer/manage')} style={{ cursor: 'pointer' }} />
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Market Opportunities */}
      <section style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '12px' }}>Market Demand</h2>
        <div className="card" style={{ borderLeft: '4px solid var(--warning)', background: '#FFF9C4' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Info size={24} color="var(--warning)" />
            <div>
              <p style={{ fontSize: '0.85rem', fontWeight: '700', color: '#827717' }}>High Demand Alert</p>
              <p style={{ fontSize: '0.8rem', color: '#9E9D24' }}>Retailers are looking for "Eggplants". Consider listing your stock now!</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FarmerDashboard;
