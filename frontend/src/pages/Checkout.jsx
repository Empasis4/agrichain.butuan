import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, Truck, ChevronLeft, CheckCircle, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useToast } from '../components/Toast';
import axios from 'axios';

const Checkout = ({ user: userProp }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentMethod, setPaymentMethod] = useState('gcash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState(userProp?.default_delivery_address || user?.default_delivery_address || 'Butuan Fresh Market, North Montilla Blvd');

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


  const [paymentReference, setPaymentReference] = useState('');
  const [paymentProof, setPaymentProof] = useState('');
  const shippingFee = 150;
  const subtotal = pricePerUnit * quantity;
  const total = subtotal + shippingFee;

  const changeQty = (delta) => {
    setQuantity(prev => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (next > maxQty) return maxQty;
      return next;
    });
  };

  const { showToast } = useToast();

  const handlePlaceOrder = async () => {
    if (!user?.id) { showToast('Please log in first.', 'error'); return; }
    if (quantity < 1 || quantity > maxQty) { 
      showToast(`Please choose between 1 and ${maxQty} ${product.unit}`, 'warning'); 
      return; 
    }
    if (paymentMethod === 'gcash' && !paymentReference && !paymentProof) {
        showToast('Please provide GCash reference number or proof image.', 'error');
        return;
    }

    setIsProcessing(true);
    try {
      const orderData = {
        retailer_id: user.id,
        total_price: total,
        payment_method: paymentMethod,
        delivery_address: deliveryAddress,
        shipping_fee: shippingFee,
        payment_reference: paymentReference,
        payment_proof_image: paymentProof,
        items: [{ product_id: product.id, quantity, price_at_time: pricePerUnit }]
      };

      const res = await axios.post('/api/orders', orderData);
      const orderId = res.data.id;

      await axios.post('/api/notifications', {
        user_id: product.farmer_id,
        title: '🛒 New Order Received!',
        message: `${user.name || 'A retailer'} ordered ${quantity} ${product.unit} of ${product.name}. Total: ₱${total.toLocaleString()}.`,
        type: 'order'
      });

      await axios.post('/api/notifications', {
        user_id: 1,
        title: '📦 New Transaction Pending',
        message: `Order #${orderId} by ${user.name || 'Retailer'}. Total: ₱${total.toLocaleString()}. Payment: ${paymentMethod.toUpperCase()}.`,
        type: 'order'
      });

      navigate('/order-success', { state: { orderId: `ORD-${orderId}` } });
    } catch (error) {
      console.error('Order error:', error);
      showToast('Order failed: ' + (error.response?.data?.message || 'Please check your connection.'), 'error');
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
            ? <img src={product.image_path.includes('[') ? JSON.parse(product.image_path)[0] : product.image_path} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
            style={{ width: '44px', height: '44px', borderRadius: '12px', border: '2px solid var(--primary)', background: '#fff', color: 'var(--primary)', fontSize: '1.5rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          ><Minus size={20} /></button>
          <div style={{ textAlign: 'center', minWidth: '80px' }}>
            <input type="number" min={1} max={maxQty} value={quantity} onChange={e => { const v = parseInt(e.target.value) || 1; setQuantity(Math.min(Math.max(v, 1), maxQty)); }} style={{ width: '80px', textAlign: 'center', fontSize: '1.5rem', fontWeight: '800', border: '2px solid var(--primary)', borderRadius: '12px', padding: '8px', color: 'var(--primary)', outline: 'none' }} />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{product.unit}</p>
          </div>
          <button
            onClick={() => changeQty(1)}
            style={{ width: '44px', height: '44px', borderRadius: '12px', border: 'none', background: 'var(--primary)', color: '#fff', fontSize: '1.5rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          ><Plus size={20} /></button>
        </div>
      </section>

      {/* Order Summary */}
      <section className="card" style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1rem', marginBottom: '12px', fontWeight: '700' }}>Order Summary</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '8px' }}>
          <span style={{ color: 'var(--text-muted)' }}>{quantity} {product.unit} × ₱{pricePerUnit.toLocaleString()}</span>
          <span style={{ fontWeight: '600' }}>₱{subtotal.toLocaleString()}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '8px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Shipping Fee (Fixed)</span>
          <span style={{ fontWeight: '600' }}>₱{shippingFee.toLocaleString()}</span>
        </div>
        <div style={{ borderTop: '1px dashed #ddd', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '1.1rem', color: 'var(--primary)' }}>
          <span>Total</span>
          <span>₱{total.toLocaleString()}</span>
        </div>
      </section>

      {/* Delivery Address & Map */}
      <section className="card" style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1rem', marginBottom: '8px', fontWeight: '700' }}>Delivery Address</h2>
        <input
          type="text"
          value={deliveryAddress}
          onChange={e => setDeliveryAddress(e.target.value)}
          style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.9rem', outline: 'none', marginBottom: '12px' }}
        />
        <div style={{ width: '100%', height: '150px', background: '#e0e0e0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', border: '1px solid #ccc', backgroundImage: 'url(https://maps.googleapis.com/maps/api/staticmap?center=Butuan+City&zoom=13&size=600x300&maptype=roadmap&markers=color:red%7CButuan+City)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
            {/* Simulated Live Map */}
        </div>
      </section>

      {/* Payment Method */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1rem', marginBottom: '12px', fontWeight: '700' }}>Payment Method</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { id: 'gcash', label: 'GCash', desc: 'Secure payment via wallet', bg: '#007DFE', icon: <CreditCard size={20} /> },
            { id: 'cod', label: 'Cash on Delivery', desc: 'Pay when harvest arrives', bg: 'var(--primary)', icon: <Truck size={20} /> }
          ].map(pm => (
            <div key={pm.id} className="card"
              style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', border: paymentMethod === pm.id ? '2px solid var(--primary)' : '1px solid #eee', flexDirection: 'column' }}
              onClick={() => setPaymentMethod(pm.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
                  <div style={{ width: '40px', height: '40px', background: pm.bg, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    {pm.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '0.95rem' }}>{pm.label}</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{pm.desc}</p>
                  </div>
                  {paymentMethod === pm.id && <CheckCircle size={20} color="var(--primary)" />}
              </div>
              
              {paymentMethod === 'gcash' && pm.id === 'gcash' && (
                  <div style={{ width: '100%', marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed #ddd', textAlign: 'left' }} onClick={e => e.stopPropagation()}>
                      <p style={{ fontSize: '0.85rem', marginBottom: '8px', fontWeight: '600' }}>Send GCash to: {product.farmer?.gcash_number || '09123456789'}</p>
                      {product.farmer?.gcash_qr && (
                          <div style={{ marginBottom: '12px' }}>
                              <img src={product.farmer.gcash_qr} alt="GCash QR" style={{ width: '100px', borderRadius: '8px' }} />
                          </div>
                      )}
                      <a href="https://m.gcash.com" target="_blank" rel="noreferrer" className="btn btn-primary" style={{ display: 'inline-block', marginBottom: '12px', padding: '8px 16px', fontSize: '0.8rem', background: '#007DFE', textDecoration: 'none' }}>
                          Open GCash App
                      </a>
                      <input type="text" placeholder="Reference Number (Optional)" value={paymentReference} onChange={e => setPaymentReference(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '8px', fontSize: '0.85rem' }} />
                      <input type="text" placeholder="Upload Proof Image URL / Base64" value={paymentProof} onChange={e => setPaymentProof(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.85rem' }} />
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>* Manual verification by Admin required</p>
                  </div>
              )}
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
