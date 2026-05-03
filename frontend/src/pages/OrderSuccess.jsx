import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Share2, Download } from 'lucide-react';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderId = location.state?.orderId || 'ORD-UNKNOWN';

  return (
    <div className="order-success-page" style={{ textAlign: 'center', paddingTop: '40px' }}>
      <div style={{ marginBottom: '32px' }}>
        <CheckCircle size={80} color="var(--primary)" style={{ margin: '0 auto 20px' }} />
        <h1 style={{ fontSize: '1.8rem', color: 'var(--primary-dark)' }}>Order Successful!</h1>
        <p style={{ color: 'var(--text-muted)' }}>Your harvest request has been sent to the farmer.</p>
      </div>

      <div className="card" style={{ marginBottom: '32px', textAlign: 'left' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #eee' }}>
          <span style={{ color: 'var(--text-muted)' }}>Order ID</span>
          <span style={{ fontWeight: '700' }}>{orderId}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Status</span>
          <span className="badge badge-fair" style={{ textTransform: 'capitalize' }}>Pending Approval</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>Est. Delivery</span>
          <span style={{ fontWeight: '600' }}>Tomorrow, 8AM - 11AM</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button className="btn btn-primary" onClick={() => navigate('/orders')} style={{ padding: '16px' }}>
          Track My Order <ArrowRight size={18} />
        </button>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn" style={{ flex: 1, background: '#fff', border: '1px solid #ddd' }}>
            <Download size={18} /> Receipt
          </button>
          <button className="btn" style={{ flex: 1, background: '#fff', border: '1px solid #ddd' }}>
            <Share2 size={18} /> Share
          </button>
        </div>

        <button className="btn" style={{ marginTop: '12px', background: 'transparent', color: 'var(--text-muted)' }} onClick={() => navigate('/')}>
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default OrderSuccess;
