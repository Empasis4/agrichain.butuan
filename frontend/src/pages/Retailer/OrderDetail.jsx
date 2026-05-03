import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, CreditCard, ShoppingBag } from 'lucide-react';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="order-detail">
      <header style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <ArrowLeft onClick={() => navigate(-1)} style={{ cursor: 'pointer' }} />
        <h1 style={{ fontSize: '1.5rem' }}>Order Details</h1>
      </header>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Order ID</span>
          <span style={{ fontWeight: '700' }}>{id}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Status</span>
          <span className="badge badge-fair">PENDING</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>Date</span>
          <span>May 02, 2024</span>
        </div>
      </div>

      <section style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>Order Items</h2>
        <div className="card" style={{ padding: '0' }}>
          {[
            { name: 'Red Onions', qty: '10kg', price: 1200 },
            { name: 'Saba Banana', qty: '5 bundles', price: 175 },
          ].map((item, i) => (
            <div key={i} style={{ padding: '12px 16px', borderBottom: i === 0 ? '1px solid #eee' : 'none', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '0.9rem', fontWeight: '600' }}>{item.name}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Qty: {item.qty}</p>
              </div>
              <span style={{ fontWeight: '600' }}>₱{item.price}</span>
            </div>
          ))}
          <div style={{ padding: '16px', borderTop: '2px dashed #eee', display: 'flex', justifyContent: 'space-between', fontWeight: '700' }}>
            <span>Total Amount</span>
            <span style={{ color: 'var(--primary)', fontSize: '1.2rem' }}>₱1,375</span>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>Logistics & Payment</h2>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <MapPin size={20} color="var(--primary)" />
            <div>
              <p style={{ fontSize: '0.9rem', fontWeight: '600' }}>Delivery Address</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Baan, Riverside, Butuan City</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <CreditCard size={20} color="var(--primary)" />
            <div>
              <p style={{ fontSize: '0.9rem', fontWeight: '600' }}>Payment Method</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>GCash (Verified)</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OrderDetail;
