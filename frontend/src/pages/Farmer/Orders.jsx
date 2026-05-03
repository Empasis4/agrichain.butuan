import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';

const FarmerOrders = ({ user }) => {
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
      const res = await axios.get(`/api/orders/farmer/${user.id}`);
      setOrders(Array.isArray(res.data) ? res.data : []);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setOrders([]);
      setLoading(false);
    }
  };

  return (
    <div className="orders-page">
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem' }}>Incoming Orders</h1>
        <p style={{ color: 'var(--text-muted)' }}>Sales and tracking from retailers</p>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Syncing with database...</div>
      ) : orders.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          <Package size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
          <p>No incoming orders yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {orders.map((order) => (
            <div key={order.id} className="card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>#ORD-{order.id}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(order.created_at).toLocaleDateString()}</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ width: '40px', height: '40px', background: 'var(--primary-light)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Truck size={20} color="var(--primary)" />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.9rem', fontWeight: '600' }}>Buyer: {order.retailer?.name || 'Local Retailer'}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>₱{order.total_price.toLocaleString()} • Status: <span style={{ color: 'var(--primary)', fontWeight: '600' }}>{order.status}</span></p>
                </div>
              </div>

              <div style={{ background: '#f9f9f9', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem' }}>
                {order.items.map(item => (
                  <p key={item.id}>• {item.quantity} {item.product.unit} of {item.product.name}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FarmerOrders;
