import React from 'react';
import { TrendingUp, AlertTriangle, Package, ChevronRight, ShoppingCart, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const RetailerDashboard = ({ user }) => {
  const navigate = useNavigate();

  const [isExpanded, setIsExpanded] = React.useState(true);
  const [stats, setStats] = React.useState({ active_orders: 0 });

  React.useEffect(() => {
    if (!user?.id) return;
    fetchRetailerStats();
    const pollInterval = setInterval(fetchRetailerStats, 8000);
    const handleScroll = () => {
      setIsExpanded(window.scrollY <= 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(pollInterval);
    };
  }, [user?.id]);

  const fetchRetailerStats = async () => {
    if (!user?.id) return;
    try {
      const res = await axios.get(`/api/orders/retailer/${user.id}`);
      const active = res.data.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length;
      const totalSourced = res.data
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0);
      setStats({ 
        active_orders: active, 
        total_sourced: totalSourced,
        total_orders: res.data.length
      });
    } catch (err) {
      console.error('Retailer stats error:', err);
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
          style={{ width: '40px', height: '40px', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)', cursor: 'pointer' }}
        >
          <Bell size={20} color="var(--primary)" />
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

      {/* Categories Horizontal Scroll */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '16px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {['All Products', 'Vegetables', 'Fruits', 'Root Crops', 'Livestock'].map((cat, i) => (
          <div 
            key={i} 
            onClick={() => navigate('/marketplace')}
            style={{ 
              padding: '10px 20px', background: i === 0 ? 'var(--primary)' : '#fff', 
              color: i === 0 ? '#fff' : 'var(--text-muted)', borderRadius: '24px',
              whiteSpace: 'nowrap', fontSize: '0.85rem', fontWeight: '700',
              boxShadow: 'var(--shadow-sm)', border: '1px solid #eee', cursor: 'pointer'
            }}
          >
            {cat}
          </div>
        ))}
      </div>

      {/* Market Price Hub */}
      <section style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Market Price Hub</h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600' }}>View All</span>
        </div>
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '16px', background: 'var(--primary-light)', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>Trending Crops</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>Live Updates</span>
          </div>
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '0.85rem' }}>Listing is empty. Waiting for Farmer harvests...</p>
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
          <ChevronRight size={20} color="var(--text-muted)" onClick={() => navigate('/orders')} />
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
          <ShoppingCart size={40} style={{ opacity: 0.2, marginBottom: '12px' }} />
          <p style={{ fontSize: '0.85rem' }}>No recent purchases. Start sourcing today!</p>
          <button onClick={() => navigate('/marketplace')} className="btn btn-primary" style={{ marginTop: '12px', padding: '8px 16px', fontSize: '0.8rem' }}>Marketplace</button>
        </div>
      </section>

      {/* Smart FAB - Shrinks on scroll */}
      <button 
        className="fab" 
        onClick={() => navigate('/marketplace')}
        style={{ 
          width: isExpanded ? 'calc(100% - 40px)' : '56px',
          borderRadius: isExpanded ? '16px' : '50%',
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          padding: isExpanded ? '14px 20px' : '0',
          justifyContent: isExpanded ? 'center' : 'center'
        }}
      >
        <ShoppingCart size={24} />
        {isExpanded && <span style={{ marginLeft: '12px' }}>Open Marketplace</span>}
      </button>

      <div style={{ height: '40px' }}></div>
    </div>
  );
};

export default RetailerDashboard;
