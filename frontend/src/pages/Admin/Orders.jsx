import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Truck, CheckCircle, Clock, Search, Filter } from 'lucide-react';

const AdminOrders = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      // Admin fetches ALL orders in the system
      const res = await axios.get('/api/admin/orders');
      setOrders(Array.isArray(res.data) ? res.data : []);
      setLoading(false);
    } catch (error) {
      console.error('Admin orders fetch error:', error);
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(o => filter === 'all' || o.status === filter);

  return (
    <div className="admin-orders-page">
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '800' }}>System Transactions</h1>
        <p style={{ color: 'var(--text-muted)' }}>Monitor and manage all platform orders</p>
      </header>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '8px' }}>
        {['all', 'pending', 'paid', 'shipped', 'delivered', 'cancelled'].map(s => (
          <button 
            key={s}
            onClick={() => setFilter(s)}
            style={{ 
              padding: '8px 16px', borderRadius: '20px', border: 'none', fontSize: '0.8rem', whiteSpace: 'nowrap',
              background: filter === s ? 'var(--primary)' : '#eee',
              color: filter === s ? '#fff' : 'var(--text-muted)',
              fontWeight: filter === s ? '700' : '500',
              cursor: 'pointer'
            }}
          >
            {s.toUpperCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Accessing transaction records...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          <Package size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
          <p>No transactions found for this filter.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredOrders.map((order) => (
            <div key={order.id} className="card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>#ORD-{order.id}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(order.created_at).toLocaleDateString()}</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ width: '40px', height: '40px', background: '#f5f5f5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Truck size={20} color="#666" />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.9rem', fontWeight: '600' }}>{order.retailer?.name || 'Retailer'} → {order.items?.[0]?.product?.farmer?.name || 'Farmer'}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>₱{parseFloat(order.total_price).toLocaleString()} • {order.payment_method?.toUpperCase()}</p>
                </div>
                <div className={`badge badge-${order.status === 'delivered' ? 'cheap' : 'fair'}`}>
                  {order.status.toUpperCase()}
                </div>
              </div>

              <div style={{ background: '#f9f9f9', padding: '10px', borderRadius: '8px', fontSize: '0.85rem' }}>
                {order.items?.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>{item.quantity} {item.product.unit} {item.product.name}</span>
                    <span style={{ fontWeight: '600' }}>₱{(item.quantity * item.price_at_time).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
