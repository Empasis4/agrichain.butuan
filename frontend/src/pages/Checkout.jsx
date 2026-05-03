import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, Truck, ChevronLeft, CheckCircle, Minus, Plus, ShoppingBag } from 'lucide-react';
import axios from 'axios';

const Checkout = ({ user: userProp }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentMethod, setPaymentMethod] = useState('gcash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [deliveryAddress, setDeliveryAddress] = useState('Butuan Fresh Market, North Montilla Blvd');

  const product = location.state?.product;
  const user = userProp || JSON.parse(localStorage.getItem('agrichain_user') || '{}');

  // Redirect if no product
  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <ShoppingBag size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
        <p style={{ color: 'var(--text-muted)' }}>No product selected.</p>
        <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => navigate('/marketplace')}>
          Go to Marketplace
        </button>
      </div>
    );
  }

  const maxQty = parseFloat(product.quantity_available) || 999;
  const pricePerUnit = parseFloat(product.price_per_kg) || 0;
  const total = pricePerUnit * quantity;

  const changeQty = (delta) => {
    setQuantity(prev => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (next > maxQty) return maxQty;
      return next;
    });
  };

  const handlePlaceOrder = async () => {
    if (!user?.id) { alert('Please log in first.'); return; }
    if (quantity < 1 || quantity > maxQty) { alert(`Please choose between 1 and ${maxQty} ${product.unit}`); return; }

    setIsProcessing(true);
    try {
      const orderData = {
        retailer_id: user.id,
        total_price: total,
        payment_method: paymentMethod,
        delivery_address: deliveryAddress,
        items: [{ product_id: product.id, quantity, price_at_time: pricePerUnit }]
      };

      const res = await axios.post('/api/orders', orderData);
      const orderId = res.data.id;

      // Notify farmer
      await axios.post('/api/notifications', {
        user_id: product.farmer_id,
        title: '🛒 New Order Received!',
        message: `${user.name || 'A retailer'} ordered ${quantity} ${product.unit} of ${product.name}. Total: ₱${total.toLocaleString()}. Awaiting payment verification.`,
        type: 'order'
      });

      // Notify admin
      await axios.post('/api/notifications', {
        user_id: 1,
        title: '📦 New Transaction Pending',
        message: `Order #${orderId}: ${quantity} ${product.unit} of ${product.name} by ${user.name || 'Retailer'}. Total: ₱${total.toLocaleString()}. Payment: ${paymentMethod.toUpperCase()}.`,
        type: 'order'
      });

      navigate('/order-success', { state: { orderId: `ORD-${orderId}` } });
    } catch (error) {
      console.error('Order error:', error);
      alert('Order failed: ' + (error.response?.data?.message || 'Please check your connection.'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="checkout-page">
      <header style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <ChevronLeft onClick={() => navigate(-1)} style={{ cursor: 'pointer' }} size={24} />
        <h1 style={{ fontSize: '1.25rem' }}>Checkout</h1>
      </header>

      {/* Product Card */}
      <section className="card" style={{ marginBottom: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{
          width: '60px', height: '60px', borderRadius: '12px', background: '#f0f4f0',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem',
          overflow: 'hidden', flexShrink: 0
        }}>
          {product.image_path
            ? <img src={product.image_path} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : '🌿'}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: '800', fontSize: '1rem' }}>{product.name}</p>
          <p style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '0.9rem' }}>
            ₱{pricePerUnit.toLocaleString()} / {product.unit}
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Available: {maxQty} {product.unit}
          </p>
        </div>
      </section>

      {/* Quantity Selector */}
      <section className="card" style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1rem', marginBottom: '16px', fontWeight: '700' }}>Select Quantity</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'center' }}>
          <button
            onClick={() => changeQty(-1)}
            style={{
              width: '44px', height: '44px', borderRadius: '12px', border: '2px solid var(--primary)',
              background: '#fff', color: 'var(--primary)', fontSize: '1.5rem', fontWeight: '700',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
            }}
          >
            <Minus size={20} />
          </button>

          <div style={{ textAlign: 'center', minWidth: '80px' }}>
            <input
              type="number"
              min={1}
              max={maxQty}
              value={quantity}
              onChange={e => {
                const v = parseInt(e.target.value) || 1;
                setQuantity(Math.min(Math.max(v, 1), maxQty));
              }}
              style={{
                width: '80px', textAlign: 'center', fontSize: '1.5rem', fontWeight: '800',
                border: '2px solid var(--primary)', borderRadius: '12px', padding: '8px',
                color: 'var(--primary)', outline: 'none'
              }}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{product.unit}</p>
          </div>

          <button
            onClick={() => changeQty(1)}
            style={{
              width: '44px', height: '44px', borderRadius: '12px', border: 'none',
              background: 'var(--primary)', color: '#fff', fontSize: '1.5rem', fontWeight: '700',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
            }}
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Quick select buttons */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[5, 10, 25, 50].filter(v => v <= maxQty).map(v => (
            <button
              key={v}
              onClick={() => setQuantity(v)}
              style={{
                padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', cursor: 'pointer',
                border: quantity === v ? '2px solid var(--primary)' : '1px solid #ddd',
                background: quantity === v ? 'var(--primary-light)' : '#fff',
                color: quantity === v ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: quantity === v ? '700' : '500'
              }}
            >
              {v} {product.unit}
            </button>
          ))}
          <button
            onClick={() => setQuantity(maxQty)}
            style={{
              padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', cursor: 'pointer',
              border: quantity === maxQty ? '2px solid var(--primary)' : '1px solid #ddd',
              background: quantity === maxQty ? 'var(--primary-light)' : '#fff',
              color: quantity === maxQty ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: '500'
            }}
          >
            All ({maxQty})
          </button>
        </div>
      </section>

      {/* Order Summary */}
      <section className="card" style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1rem', marginBottom: '12px', fontWeight: '700' }}>Order Summary</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '8px' }}>
          <span style={{ color: 'var(--text-muted)' }}>{quantity} {product.unit} × ₱{pricePerUnit.toLocaleString()}</span>
          <span style={{ fontWeight: '600' }}>₱{total.toLocaleString()}</span>
        </div>
        <div style={{ borderTop: '1px dashed #ddd', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '1.1rem', color: 'var(--primary)' }}>
          <span>Total</span>
          <span>₱{total.toLocaleString()}</span>
        </div>
      </section>

      {/* Delivery Address */}
      <section className="card" style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1rem', marginBottom: '8px', fontWeight: '700' }}>Delivery Address</h2>
        <input
          type="text"
          value={deliveryAddress}
          onChange={e => setDeliveryAddress(e.target.value)}
          style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.9rem', outline: 'none' }}
        />
      </section>

      {/* Payment Method */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1rem', marginBottom: '12px', fontWeight: '700' }}>Payment Method</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { id: 'gcash', label: 'GCash', desc: 'Instant payment via wallet', bg: '#007DFE', icon: <CreditCard size={20} /> },
            { id: 'cod', label: 'Cash on Delivery', desc: 'Pay when harvest arrives', bg: 'var(--primary)', icon: <Truck size={20} /> }
          ].map(pm => (
            <div key={pm.id} className="card"
              style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', border: paymentMethod === pm.id ? '2px solid var(--primary)' : '1px solid #eee' }}
              onClick={() => setPaymentMethod(pm.id)}
            >
              <div style={{ width: '40px', height: '40px', background: pm.bg, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                {pm.icon}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '0.95rem' }}>{pm.label}</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{pm.desc}</p>
              </div>
              {paymentMethod === pm.id && <CheckCircle size={20} color="var(--primary)" />}
            </div>
          ))}
        </div>
      </section>

      <button
        className="btn btn-primary"
        style={{ width: '100%', padding: '16px', borderRadius: '16px', fontSize: '1.1rem', fontWeight: '700' }}
        disabled={isProcessing}
        onClick={handlePlaceOrder}
      >
        {isProcessing ? 'Confirming Order...' : `Place Order • ₱${total.toLocaleString()}`}
      </button>
    </div>
  );
};

export default Checkout;
