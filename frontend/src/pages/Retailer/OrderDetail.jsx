import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, MapPin, CreditCard, ShoppingBag, Truck, Calendar } from 'lucide-react';

const OrderDetail = () => {
  const { id } = useParams();
  const rawId = id?.replace('ORD-', '');
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [rawId]);

  const fetchOrder = async () => {
    try {
      const res = await axios.get(`/api/orders/${rawId}`);
      setOrder(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading transaction data...</div>;
  if (!order) return <div style={{ padding: '40px', textAlign: 'center' }}>Order not found.</div>;

  return (
    <div className="order-detail">
      <header style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <ArrowLeft onClick={() => navigate(-1)} style={{ cursor: 'pointer' }} />
        <h1 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Order Details</h1>
      </header>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Order ID</span>
          <span style={{ fontWeight: '700' }}>ORD-{order.id}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Status</span>
          <span className={`badge badge-${order.status === 'delivered' ? 'cheap' : 'fair'}`} style={{ textTransform: 'uppercase' }}>
            {order.status}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>Date</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={14} /> {new Date(order.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      <section style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '12px', fontWeight: '700' }}>Order Items</h2>
        <div className="card" style={{ padding: '0' }}>
          {order.items?.map((item, i) => (
            <div key={i} style={{ padding: '12px 16px', borderBottom: i < order.items.length - 1 ? '1px solid #eee' : 'none', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '0.9rem', fontWeight: '600' }}>{item.product?.name}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Qty: {item.quantity} {item.product?.unit || 'kg'}</p>
              </div>
              <span style={{ fontWeight: '600' }}>₱{(item.quantity * item.price_at_time).toLocaleString()}</span>
            </div>
          ))}
          <div style={{ padding: '16px', borderTop: '2px dashed #eee', display: 'flex', justifyContent: 'space-between', fontWeight: '800' }}>
            <span>Total Amount</span>
            <span style={{ color: 'var(--primary)', fontSize: '1.2rem' }}>₱{parseFloat(order.total_price).toLocaleString()}</span>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '12px', fontWeight: '700' }}>Logistics & Payment</h2>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <MapPin size={20} color="var(--primary)" />
            <div>
              <p style={{ fontSize: '0.9rem', fontWeight: '600' }}>Delivery Address</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{order.delivery_address}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <CreditCard size={20} color="var(--primary)" />
            <div>
              <p style={{ fontSize: '0.9rem', fontWeight: '600' }}>Payment Method</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {order.payment_method} {order.status !== 'pending' && order.payment_method === 'gcash' ? '(Verified)' : ''}
              </p>
            </div>
          </div>
          {order.rider_name && (
            <div style={{ display: 'flex', gap: '12px' }}>
              <Truck size={20} color="var(--primary)" />
              <div>
                <p style={{ fontSize: '0.9rem', fontWeight: '600' }}>Assigned Rider</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{order.rider_name}</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default OrderDetail;
