import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, Truck, Home } from 'lucide-react';

const OrderTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const steps = [
    { label: 'Order Placed', time: '10:30 AM', completed: true, icon: <Clock /> },
    { label: 'Payment Verified', time: '10:45 AM', completed: true, icon: <CheckCircle /> },
    { label: 'Out for Delivery', time: 'Pending', completed: false, icon: <Truck /> },
    { label: 'Delivered', time: 'Estimated 2:00 PM', completed: false, icon: <Home /> },
  ];

  return (
    <div className="order-tracking">
      <header style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <ArrowLeft onClick={() => navigate(-1)} style={{ cursor: 'pointer' }} />
        <h1 style={{ fontSize: '1.5rem' }}>Track Order</h1>
      </header>

      <div className="card" style={{ textAlign: 'center', marginBottom: '32px' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status for {id}</p>
        <h2 style={{ color: 'var(--primary)', marginTop: '4px' }}>In Transit</h2>
      </div>

      <div style={{ position: 'relative', paddingLeft: '40px' }}>
        {/* Progress Line */}
        <div style={{ position: 'absolute', left: '19px', top: '10px', bottom: '40px', width: '2px', background: '#eee' }}>
          <div style={{ height: '50%', width: '100%', background: 'var(--primary)' }}></div>
        </div>

        {steps.map((step, i) => (
          <div key={i} style={{ marginBottom: '40px', position: 'relative' }}>
            <div style={{ 
              position: 'absolute', left: '-36px', top: '0', 
              width: '32px', height: '32px', borderRadius: '50%', 
              background: step.completed ? 'var(--primary)' : '#fff', 
              border: step.completed ? 'none' : '2px solid #eee',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: step.completed ? '#fff' : '#ccc',
              zIndex: 2
            }}>
              {React.cloneElement(step.icon, { size: 16 })}
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', color: step.completed ? '#000' : '#999' }}>{step.label}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{step.time}</p>
            </div>
          </div>
        ))}
      </div>

      <button 
        className="btn btn-primary" 
        style={{ width: '100%', padding: '16px', borderRadius: '12px', marginTop: '20px' }}
        onClick={() => navigate('/')}
      >
        Back to Dashboard
      </button>
    </div>
  );
};

export default OrderTracking;
