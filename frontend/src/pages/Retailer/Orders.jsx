import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Package, Truck, CheckCircle, Clock, ChevronRight } from 'lucide-react';

const RetailerOrders = ({ user }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    fetchOrders();
    const interval = setInterval(fetchOrders, 8000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`/api/orders/retailer/${user.id}`);
      setOrders(res.data.map(o => ({
        id: `ORD-${o.id}`,
        rawId: o.id,
        date: new Date(o.created_at).toISOString().split('T')[0],
        total: parseFloat(o.total_price),
        status: o.status,
        items: o.items?.length || 0,
        farmer: o.items?.[0]?.product?.farmer?.name || 'Local Farmer'
      })));
      setLoading(false);
    } catch (error) {
      console.error(error);
      setOrders([]);
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return <CheckCircle size={18} color="var(--primary)" />;
      case 'pending': return <Clock size={18} color="var(--warning)" />;
      default: return <Truck size={18} color="var(--accent)" />;
    }
  };

  return (
    <div className="orders-page">
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem' }}>My Purchases</h1>
        <p style={{ color: 'var(--text-muted)' }}>Track and manage your orders</p>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading orders...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {orders.map((order) => (
            <div key={order.id} className="card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{order.id}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{order.date}</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ width: '40px', height: '40px', background: '#f5f5f5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={20} color="#666" />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.9rem', fontWeight: '600' }}>{order.farmer}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{order.items} items • ₱{order.total.toLocaleString()}</p>
                </div>
                <div className={`badge badge-${order.status === 'delivered' ? 'cheap' : 'fair'}`}>
                  {order.status.toUpperCase()}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #eee', paddingTop: '12px' }}>
                <button 
                  onClick={() => navigate(`/orders/${order.id}`)}
                  className="btn" style={{ flex: 1, padding: '8px', fontSize: '0.8rem', background: '#fff', border: '1px solid #ddd' }}
                >
                  View Details
                </button>
                {order.status === 'pending' && (
                  <button 
                    onClick={() => navigate(`/orders/${order.id}/track`)}
                    className="btn btn-primary" style={{ flex: 1, padding: '8px', fontSize: '0.8rem' }}
                  >
                    Track Order
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RetailerOrders;
