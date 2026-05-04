import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, Truck, ChevronLeft, CheckCircle, Minus, Plus, ShoppingBag, MapPin } from 'lucide-react';
import { useToast } from '../components/Toast';
import axios from 'axios';

// Coordinates for Butuan Barangays (Mock for simulation)
const barangayCoords = {
  'antongalon': [8.9322, 125.6025],
  'ampayon': [8.9500, 125.6000],
  'san vicente': [8.9400, 125.5000],
  'maguinda': [8.9000, 125.6000],
  'libertad': [8.9419, 125.5222],
  'ambago': [8.9556, 125.5111],
  'villakananga': [8.9278, 125.5389],
  'bayanihan': [8.9486, 125.5361],
  'holy redeemer': [8.9583, 125.5333],
  'leon kilat': [8.9472, 125.5417],
  'san ignacio': [8.9444, 125.5472],
  'doongan': [8.9500, 125.5500],
  'baan': [8.9600, 125.5600],
  'obrero': [8.9528, 125.5417],
  'default': [8.9475, 125.5406]
};

const getCoords = (name) => {
  const searchStr = (name || '').toLowerCase();
  for (let k in barangayCoords) {
      if (searchStr.includes(k)) return barangayCoords[k];
  }
  return barangayCoords['default'];
};

const Checkout = ({ user: userProp }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { product, quantity: initialQty } = location.state || {};
  const user = userProp;
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  const [paymentMethod, setPaymentMethod] = useState('gcash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [quantity, setQuantity] = useState(initialQty || 1);
  const [deliveryAddress, setDeliveryAddress] = useState(user?.default_delivery_address || user?.barangay || 'Butuan City');
  const [retailerPos, setRetailerPos] = useState(() => getCoords(user?.default_delivery_address || user?.barangay || 'Butuan City'));
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentProof, setPaymentProof] = useState('');

  const farmerPos = getCoords(product.barangay || product.location);
  
  const handleAddressSubmit = () => {
    const newPos = getCoords(deliveryAddress);
    setRetailerPos(newPos);
  };

  // Automated Shipping Fee Calculation
  // Base ₱100 + ₱20 per km (simulated) + ₱5 per quantity
  const distance = Math.sqrt(Math.pow(farmerPos[0]-retailerPos[0], 2) + Math.pow(farmerPos[1]-retailerPos[1], 2)) * 111; // Approx km
  const calculatedShipping = Math.max(120, Math.round(100 + (distance * 15) + (quantity * 2)));

  const shippingFee = calculatedShipping;
  const maxQty = parseFloat(product?.quantity_available) || 999;
  const pricePerUnit = parseFloat(product?.price_per_kg) || 0;
  const subtotal = pricePerUnit * quantity;
  const total = subtotal + shippingFee;

  const { showToast } = useToast();

  useEffect(() => {
    if (!product) return;

    // Initialize Leaflet Map
    if (window.L && !mapInstance.current) {
        mapInstance.current = window.L.map('checkout-map', { zoomControl: false }).setView([8.9475, 125.5406], 13);
        window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '© OpenStreetMap © CARTO'
        }).addTo(mapInstance.current);

        // Custom Icon for modern look
        const createIcon = (color) => window.L.divIcon({
            className: 'custom-map-marker',
            html: `<div style="background: ${color}; width: 12px; height: 12px; border: 3px solid #fff; border-radius: 50%; box-shadow: 0 0 10px ${color}88;"></div>`,
            iconSize: [18, 18],
            iconAnchor: [9, 9]
        });

        // Dynamic Markers
        const farmerMarker = window.L.marker(farmerPos, { icon: createIcon('var(--primary)') }).addTo(mapInstance.current)
            .bindPopup(`<b>Pick-up:</b> ${product.farmer?.name || 'Farmer'} (${product.barangay || 'Farm Area'})`).openPopup();
        
        const retailerMarker = window.L.marker(retailerPos, { icon: createIcon('#007DFE') }).addTo(mapInstance.current)
            .bindPopup(`<b>Drop-off:</b> ${user.name || 'You'} (${deliveryAddress})`);

        // Live Route Path with Animation
        const latlngs = [farmerPos, retailerPos];
        const route = window.L.polyline(latlngs, {
            color: 'var(--primary)', 
            weight: 4, 
            opacity: 0.8,
            dashArray: '10, 10',
            lineJoin: 'round',
            className: 'map-route-flow' // CSS animation target
        }).addTo(mapInstance.current);

        // --- INTERACTIVE LIVE MAP FEATURES ---
        mapInstance.current.on('click', (e) => {
            const { lat, lng } = e.latlng;
            updateDropoff(lat, lng);
        });

        const updateDropoff = (lat, lng) => {
            retailerMarker.setLatLng([lat, lng])
                .setPopupContent(`<b>New Drop-off:</b> Custom Pinned Location`)
                .openPopup();
            
            route.setLatLngs([farmerPos, [lat, lng]]);
            setDeliveryAddress(`Pinned Location: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
            
            const newBounds = window.L.latLngBounds([farmerPos, [lat, lng]]);
            mapInstance.current.fitBounds(newBounds, { padding: [50, 50] });
        };

        // Make marker draggable for precision
        retailerMarker.options.draggable = true;
        retailerMarker.on('dragend', (e) => {
            const { lat, lng } = e.target.getLatLng();
            updateDropoff(lat, lng);
        });

        // Add a global function for the "Locate Me" button to call
        window.agrichain_locate_user = () => {
            if (!navigator.geolocation) return alert('Geolocation not supported');
            navigator.geolocation.getCurrentPosition((pos) => {
                const { latitude, longitude } = pos.coords;
                updateDropoff(latitude, longitude);
            });
        };

        // Fit map to bounds
        const bounds = window.L.latLngBounds(latlngs);
        mapInstance.current.fitBounds(bounds, { padding: [50, 50] });
    }

    return () => {
        if (mapInstance.current) {
            mapInstance.current.remove();
            mapInstance.current = null;
        }
    };
  }, [product, retailerPos]);

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

  const changeQty = (delta) => {
    setQuantity(prev => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (next > maxQty) return maxQty;
      return next;
    });
  };

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
      // AUTO-ASSIGN RIDER LOGIC
      let assignedRider = null;
      try {
          const ridersRes = await axios.get('/api/admin/users?role=rider');
          const availableRiders = Array.isArray(ridersRes.data) ? ridersRes.data : [];
          if (availableRiders.length > 0) {
              assignedRider = availableRiders[Math.floor(Math.random() * availableRiders.length)];
          }
      } catch (e) {
          console.error('Rider fetch error:', e);
      }

      const orderData = {
        retailer_id: user.id,
        total_price: total,
        payment_method: paymentMethod,
        delivery_address: deliveryAddress,
        shipping_fee: shippingFee,
        payment_reference: paymentReference,
        payment_proof_image: paymentProof,
        rider_id: assignedRider?.id || null,
        rider_name: assignedRider?.name || 'AgriChain Logistics Partner',
        items: [{ product_id: product.id, quantity, price_at_time: pricePerUnit }]
      };

      const res = await axios.post('/api/orders', orderData);
      const orderId = res.data.id;

      // Notify Farmer
      await axios.post('/api/notifications', {
        user_id: product.farmer_id,
        title: '🛒 New Order Received!',
        message: `${user.name || 'A retailer'} ordered ${quantity} ${product.unit} of ${product.name}. Total: ₱${total.toLocaleString()}.`,
        type: 'order'
      });

      // Notify Admin
      await axios.post('/api/notifications', {
        user_id: 1,
        title: '📦 New Transaction Pending',
        message: `Order #${orderId} by ${user.name || 'Retailer'}. Total: ₱${total.toLocaleString()}. Payment: ${paymentMethod.toUpperCase()}.`,
        type: 'order'
      });

      // Special notification if payment proof uploaded
      if (paymentProof) {
          await axios.post('/api/notifications', {
            user_id: product.farmer_id,
            title: '💳 Payment Uploaded',
            message: `Retailer uploaded payment proof for Order #${orderId}. Please check for preparation.`,
            type: 'order'
          });
      }

      // Notify Rider
      if (assignedRider?.id) {
          await axios.post('/api/notifications', {
            user_id: assignedRider.id,
            title: '🚛 New Delivery Job Assigned!',
            message: `You have a new client: ${user.name || 'Retailer'}. Pickup harvest from: ${product.farmer?.name || 'Farmer'}.`,
            type: 'order'
          });
      }

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

      {/* Delivery Address & Map Section (Precision Design) */}
      <section className="card" style={{ marginBottom: '24px', padding: '24px', border: '1px solid #f0f0f0' }}>
        <div style={{ position: 'relative', marginBottom: '20px' }}>
            <MapPin size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
            <input
                type="text"
                value={deliveryAddress}
                onChange={e => setDeliveryAddress(e.target.value)}
                onKeyDown={e => {
                    if (e.key === 'Enter') {
                        handleAddressSubmit();
                        showToast('Location updated from text', 'success');
                    }
                }}
                onBlur={handleAddressSubmit}
                placeholder="Enter full address manually... [Press Enter to Pin]"
                style={{ 
                    width: '100%', 
                    padding: '16px 16px 16px 48px', 
                    borderRadius: '16px', 
                    border: '1px solid #eee', 
                    fontSize: '1rem', 
                    fontWeight: '600',
                    outline: 'none', 
                    background: '#fcfcfc',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                }}
            />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h2 style={{ fontSize: '0.75rem', fontWeight: '900', color: '#999', letterSpacing: '1px', textTransform: 'uppercase' }}>Pin Your Exact Location</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', background: '#FF9800', borderRadius: '50%', boxShadow: '0 0 8px #FF9800' }}></span>
                <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#8d6e63', letterSpacing: '0.5px' }}>PRECISION ROUTING ACTIVE</span>
            </div>
        </div>

        <div style={{ position: 'relative' }}>
            <div id="checkout-map" style={{ width: '100%', height: '280px', borderRadius: '24px', border: '1px solid #eee', zIndex: 0, overflow: 'hidden' }}></div>
            
            {/* Floating GPS Badge */}
            <div style={{ 
                position: 'absolute', bottom: '16px', left: '16px', zIndex: 1000,
                background: 'rgba(255,255,255,0.95)', padding: '8px 16px', borderRadius: '12px',
                display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                backdropFilter: 'blur(4px)'
            }}>
                <span style={{ width: '8px', height: '8px', background: '#4CAF50', borderRadius: '50%', boxShadow: '0 0 8px #4CAF50' }}></span>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '0.5px' }}>GPS ACTIVE</span>
            </div>
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
                  <div style={{ width: '100%', marginTop: '16px', paddingTop: '20px', borderTop: '1px solid #f0f0f0', textAlign: 'left' }} onClick={e => e.stopPropagation()}>
                      <div style={{ background: '#f8fbff', padding: '16px', borderRadius: '12px', border: '1px solid #e1efff', marginBottom: '16px' }}>
                          <p style={{ fontSize: '0.85rem', marginBottom: '4px', color: '#666', fontWeight: '600' }}>Recipient Details</p>
                          <p style={{ fontSize: '1.1rem', fontWeight: '800', color: '#007DFE' }}>{product.farmer?.gcash_number || '091030910931'}</p>
                          <p style={{ fontSize: '0.75rem', color: '#999', marginTop: '2px' }}>Name: {product.farmer?.name || 'AgriChain Farmer'}</p>
                      </div>

                      {product.farmer?.gcash_qr && (
                          <div style={{ textAlign: 'center', marginBottom: '20px', padding: '16px', background: '#fff', borderRadius: '16px', border: '1px dashed #ddd' }}>
                              <img src={product.farmer.gcash_qr} alt="GCash QR" style={{ width: '140px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                              <p style={{ fontSize: '0.7rem', color: '#999', marginTop: '8px', fontWeight: '600' }}>SCAN OR SAVE TO GALLERY</p>
                          </div>
                      )}

                      <a 
                        href="gcash://app" 
                        onClick={(e) => {
                            // Fallback logic for desktop/web
                            setTimeout(() => {
                                window.location.href = "https://www.gcash.com";
                            }, 500);
                        }}
                        className="btn" 
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px', padding: '14px', fontSize: '0.95rem', fontWeight: '800', background: '#007DFE', color: '#fff', borderRadius: '14px', textDecoration: 'none', boxShadow: '0 4px 14px rgba(0, 125, 254, 0.3)' }}
                      >
                          Open GCash App
                      </a>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div>
                            <label style={{ fontSize: '0.75rem', color: '#666', fontWeight: '700', marginBottom: '6px', display: 'block' }}>Reference Number</label>
                            <input 
                                type="text" 
                                placeholder="Enter 13-digit reference number" 
                                value={paymentReference} 
                                onChange={e => setPaymentReference(e.target.value)} 
                                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '0.9rem', fontWeight: '600', outline: 'none', background: '#fcfcfc' }} 
                            />
                          </div>
                          
                          <div>
                              <label style={{ fontSize: '0.75rem', color: '#666', fontWeight: '700', marginBottom: '6px', display: 'block' }}>Upload Proof of Payment</label>
                              <div 
                                onClick={() => document.getElementById('payment-proof-upload').click()}
                                style={{ width: '100%', minHeight: '100px', border: '2px dashed #e0e0e0', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#fafafa', overflow: 'hidden', transition: 'all 0.2s' }}
                              >
                                {paymentProof ? (
                                    <img src={paymentProof} style={{ width: '100%', maxHeight: '200px', objectFit: 'contain' }} />
                                ) : (
                                    <>
                                        <ShoppingBag size={24} color="#aaa" style={{ marginBottom: '8px' }} />
                                        <span style={{ fontSize: '0.8rem', color: '#999', fontWeight: '600' }}>Click to Upload Screenshot</span>
                                    </>
                                )}
                              </div>
                              <input 
                                id="payment-proof-upload" type="file" accept="image/*" hidden 
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => setPaymentProof(reader.result);
                                        reader.readAsDataURL(file);
                                    }
                                }}
                              />
                          </div>
                      </div>
                      <p style={{ fontSize: '0.7rem', color: '#999', marginTop: '16px', textAlign: 'center', fontStyle: 'italic' }}>* Our Admin will verify your payment within 15-30 minutes.</p>
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
