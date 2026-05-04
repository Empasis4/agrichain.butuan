import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, CheckCircle, Clock, Truck, Home, XCircle, DollarSign } from 'lucide-react';

const OrderTracking = () => {
  const { id } = useParams();
  const rawId = id?.replace('ORD-', '');
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 8000);
    return () => clearInterval(interval);
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

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Syncing tracking data...</div>;
  if (!order) return <div style={{ padding: '40px', textAlign: 'center' }}>Order not found.</div>;

  const isCompleted = (status) => {
    const sequence = ['pending', 'paid', 'shipped', 'delivered'];
    const currentIndex = sequence.indexOf(order.status);
    const targetIndex = sequence.indexOf(status);
    return currentIndex >= targetIndex;
  };

  const steps = [
    { label: 'Order Placed', status: 'pending', icon: <Clock /> },
    { label: 'Payment Verified', status: 'paid', icon: <DollarSign /> },
    { label: 'Out for Delivery', status: 'shipped', icon: <Truck /> },
    { label: 'Delivered', status: 'delivered', icon: <Home /> },
  ];

  return (
    <div className="order-tracking">
      <header style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <ArrowLeft onClick={() => navigate(-1)} style={{ cursor: 'pointer' }} />
        <h1 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Track Order</h1>
      </header>

      {order.status === 'cancelled' ? (
        <div className="card" style={{ textAlign: 'center', marginBottom: '32px', border: '1px solid #ffcdd2', background: '#fff5f5' }}>
          <XCircle size={48} color="var(--danger)" style={{ margin: '0 auto 12px', opacity: 0.8 }} />
          <h2 style={{ color: 'var(--danger)', fontSize: '1.2rem' }}>Order Cancelled</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>This order has been removed from fulfillment.</p>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', marginBottom: '32px', border: '1px solid var(--primary-light)' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Live Status for ORD-{order.id}</p>
          <h2 style={{ color: 'var(--primary)', marginTop: '4px', textTransform: 'uppercase', fontWeight: '800' }}>
            {order.status === 'paid' ? 'Processing' : order.status === 'shipped' ? 'In Transit' : order.status}
          </h2>
          {order.rider_name && <p style={{ fontSize: '0.85rem', color: 'var(--primary)', marginTop: '4px', fontWeight: '600' }}>Rider: {order.rider_name}</p>}
        </div>
      )}

      {order.status !== 'cancelled' && (
        <div style={{ position: 'relative', paddingLeft: '40px', maxWidth: '300px', margin: '0 auto' }}>
          {/* Progress Line */}
          <div style={{ position: 'absolute', left: '19px', top: '10px', bottom: '40px', width: '2px', background: '#eee' }}>
            <div style={{ 
              height: `${(steps.findIndex(s => s.status === order.status) / (steps.length - 1)) * 100}%`, 
              width: '100%', background: 'var(--primary)', transition: 'height 0.5s ease' 
            }}></div>
          </div>

          {steps.map((step, i) => {
            const completed = isCompleted(step.status);
            return (
              <div key={i} style={{ marginBottom: '40px', position: 'relative' }}>
                <div style={{ 
                  position: 'absolute', left: '-36px', top: '0', 
                  width: '32px', height: '32px', borderRadius: '50%', 
                  background: completed ? 'var(--primary)' : '#fff', 
                  border: completed ? 'none' : '2px solid #eee',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: completed ? '#fff' : '#ccc',
                  zIndex: 2,
                  transition: 'all 0.3s ease'
                }}>
                  {React.cloneElement(step.icon, { size: 16 })}
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', color: completed ? 'var(--text-main)' : '#ccc' }}>{step.label}</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {completed ? 'Completed' : 'Awaiting Step'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button 
        className="btn btn-primary" 
        style={{ width: '100%', padding: '16px', borderRadius: '16px', marginTop: '20px', fontWeight: '700' }}
        onClick={() => navigate('/')}
      >
        Back to Dashboard
      </button>
    </div>
  );
};

export default OrderTracking;
