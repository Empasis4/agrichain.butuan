import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ClipboardList, CheckCircle, Package, Calendar, MapPin, TrendingUp, CreditCard, ChevronRight } from 'lucide-react';

const RiderOrders = ({ user }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get('/api/orders');
        const allOrders = Array.isArray(res.data) ? res.data : [];
        // Only show delivered orders for this rider
        const myHistory = allOrders.filter(o => o.rider_id === user.id && o.status === 'delivered');
        setHistory(myHistory.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)));
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user.id]);

  const totalEarnings = history.length * 50; // Assume 50 per delivery

  return (
    <div className="rider-history page-transition">
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--text-main)' }}>Delivery History</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Review your successful terminal operations</p>
      </header>

      {/* Rider Performance Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px' }}>
        <div className="card" style={{ background: 'var(--primary)', color: '#fff', border: 'none' }}>
          <CheckCircle size={20} color="rgba(255,255,255,0.7)" />
          <p style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '8px' }}>Total Deliveries</p>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '900' }}>{history.length}</h3>
        </div>
        <div className="card" style={{ background: 'var(--accent)', color: '#000', border: 'none' }}>
          <TrendingUp size={20} color="rgba(0,0,0,0.5)" />
          <p style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '8px' }}>Lifetime Earnings</p>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '900' }}>₱{totalEarnings.toLocaleString()}</h3>
        </div>
      </div>

      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ClipboardList size={18} color="var(--primary)" />
          <h2 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Recent Completions</h2>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="spin" style={{ width: '30px', height: '30px', border: '3px solid #eee', borderTopColor: 'var(--primary)', borderRadius: '50%', margin: '0 auto' }}></div>
        </div>
      ) : history.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px', background: '#fcfcfc', border: '2px dashed #eee' }}>
          <Package size={40} color="#eee" style={{ marginBottom: '16px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No completed deliveries yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {history.map(order => (
            <div key={order.id} className="card" style={{ padding: '16px', border: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '48px', height: '48px', background: 'var(--primary-light)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={20} color="var(--primary)" />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '800' }}>Order #ORD-{order.id}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} /> {new Date(order.updated_at).toLocaleDateString()}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '700' }}>+₱50.00</p>
                  </div>
                </div>
              </div>
              <ChevronRight size={20} color="#ccc" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RiderOrders;
