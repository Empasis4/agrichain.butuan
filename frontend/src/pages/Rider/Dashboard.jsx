import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Truck, MapPin, CheckCircle, Clock, Navigation, Package, TrendingUp, ShieldCheck, CreditCard, ChevronRight, Filter, Search, AlertCircle, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/Toast';
import DeliveryMap from '../../components/DeliveryMap';

const RiderDashboard = ({ user }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('active'); // 'active', 'completed', 'all'
  const [stats, setStats] = useState({
      ready_for_pickup: 0,
      out_for_delivery: 0,
      delivered_today: 0,
      total_earnings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get(`/api/orders/rider/${user.id}`);
      const riderRelevant = Array.isArray(res.data) ? res.data : [];
      
      setOrders(riderRelevant);
      
      const today = new Date().toISOString().split('T')[0];
      setStats({
          ready_for_pickup: riderRelevant.filter(o => ['pending', 'approved', 'paid'].includes(o.status) && (o.rider_id === user.id || !o.rider_id)).length,
          out_for_delivery: riderRelevant.filter(o => o.status === 'shipped' && o.rider_id === user.id).length,
          delivered_today: riderRelevant.filter(o => o.status === 'delivered' && o.rider_id === user.id && o.updated_at.startsWith(today)).length,
          total_earnings: riderRelevant.filter(o => o.status === 'delivered' && o.rider_id === user.id).reduce((sum, o) => sum + 50, 0)
      });
      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err);
      setLoading(false);
    }
  };

  const extractCoords = (addressStr) => {
      if (!addressStr) return null;
      const match = addressStr.match(/Pinned Location:\s*([\d.-]+),\s*([\d.-]+)/);
      if (match) {
          return [parseFloat(match[1]), parseFloat(match[2])];
      }
      
      const searchStr = addressStr.toLowerCase();
      const bCoords = {
          'antongalon': [8.9322, 125.6025], 'ampayon': [8.9500, 125.6000], 'san vicente': [8.9400, 125.5000],
          'maguinda': [8.9000, 125.6000], 'libertad': [8.9419, 125.5222], 'ambago': [8.9556, 125.5111],
          'villakananga': [8.9278, 125.5389], 'bayanihan': [8.9486, 125.5361], 'holy redeemer': [8.9583, 125.5333],
          'leon kilat': [8.9472, 125.5417], 'san ignacio': [8.9444, 125.5472], 'doongan': [8.9500, 125.5500],
          'baan': [8.9600, 125.5600], 'obrero': [8.9528, 125.5417]
      };
      
      for (let k in bCoords) {
          if (searchStr.includes(k)) return bCoords[k];
      }
      return null;
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      // If accepting, set rider_id
      const payload = { status };
      if (status === 'shipped') payload.rider_id = user.id;
      
      await axios.put(`/api/orders/${id}`, payload);
      showToast(`Order updated to ${status}`, 'success');
      fetchData();
    } catch (err) {
      showToast('Error updating order', 'error');
    }
  };

  const filteredOrders = orders.filter(o => {
    if (filter === 'active') return ['pending', 'approved', 'paid', 'shipped'].includes(o.status);
    if (filter === 'completed') return o.status === 'delivered';
    return true;
  });

  return (
    <div className="rider-dashboard page-transition">
      <header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Courier Terminal</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Butuan Logistics Hub • <span style={{ color: 'var(--primary)', fontWeight: '700' }}>ID #{user.id}</span></p>
        </div>
        <div style={{ position: 'relative' }}>
            <div style={{ width: '48px', height: '48px', background: 'var(--primary-light)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Truck size={24} color="var(--primary)" />
            </div>
            {stats.ready_for_pickup > 0 && <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: 'var(--danger)', color: '#fff', fontSize: '0.6rem', padding: '2px 6px', borderRadius: '10px', fontWeight: '800' }}>{stats.ready_for_pickup}</span>}
        </div>
      </header>

      {/* Modern KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px' }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)', color: '#fff', border: 'none', padding: '20px' }}>
          <Package size={20} color="rgba(255,255,255,0.7)" />
          <p style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '8px', fontWeight: '600' }}>Pending Pickup</p>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '900', marginTop: '4px' }}>{stats.ready_for_pickup}</h3>
        </div>
        <div className="card" style={{ background: 'linear-gradient(135deg, #F9A825 0%, #FBC02D 100%)', color: '#fff', border: 'none', padding: '20px' }}>
          <Navigation size={20} color="rgba(255,255,255,0.7)" />
          <p style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '8px', fontWeight: '600' }}>On Delivery</p>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '900', marginTop: '4px' }}>{stats.out_for_delivery}</h3>
        </div>
        <div className="card" style={{ padding: '16px', border: '1px solid #eee' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <CheckCircle size={18} color="var(--primary)" />
            <span style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: '700', background: 'var(--primary-light)', padding: '2px 6px', borderRadius: '4px' }}>+50/ea</span>
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px' }}>Delivered (Today)</p>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>{stats.delivered_today}</h3>
        </div>
        <div className="card" style={{ padding: '16px', border: '1px solid #eee' }}>
          <CreditCard size={18} color="var(--accent)" />
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px' }}>Estimated Earnings</p>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>₱{stats.total_earnings.toLocaleString()}</h3>
        </div>
      </div>

      {/* Task Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
        {[
            { id: 'active', label: 'Active Tasks', icon: <Navigation size={14} /> },
            { id: 'completed', label: 'Completed', icon: <CheckCircle size={14} /> },
            { id: 'all', label: 'History', icon: <Filter size={14} /> }
        ].map(f => (
            <button 
                key={f.id}
                onClick={() => setFilter(f.id)}
                style={{ 
                    padding: '8px 16px', borderRadius: '24px', border: '1px solid #eee', 
                    background: filter === f.id ? 'var(--primary)' : '#fff',
                    color: filter === f.id ? '#fff' : 'var(--text-muted)',
                    fontSize: '0.85rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px',
                    whiteSpace: 'nowrap', transition: 'all 0.2s ease', cursor: 'pointer'
                }}
            >
                {f.icon} {f.label}
            </button>
        ))}
      </div>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
            <div className="spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary-light)', borderTopColor: 'var(--primary)', borderRadius: '50%', margin: '0 auto' }}></div>
            <p style={{ marginTop: '16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Connecting to logistics server...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px', background: '#fdfdfd', border: '2px dashed #eee', borderRadius: '24px' }}>
          <div style={{ width: '64px', height: '64px', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: 'var(--shadow-sm)' }}>
            {filter === 'completed' ? <CheckCircle size={32} color="#eee" /> : <AlertCircle size={32} color="#eee" />}
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px' }}>No {filter} orders</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Check back later or change your filter.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filteredOrders.map(order => (
            <div key={order.id} className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid #f0f0f0', borderRadius: '24px', boxShadow: '0 8px 24px rgba(0,0,0,0.04)' }}>
                {/* Delivery Map Integration */}
                {['pending', 'approved', 'paid', 'shipped'].includes(order.status) && (
                    <DeliveryMap 
                        pickup={{ name: order.product?.farmer?.name, coords: extractCoords(order.product?.farmer?.barangay || 'Butuan City') }} 
                        dropoff={{ name: order.retailer?.name || 'Customer', coords: extractCoords(order.delivery_address) }} 
                        orderId={order.id} 
                    />
                )}

                <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div>
                            <span style={{ fontWeight: '900', color: 'var(--text-main)', fontSize: '1.1rem' }}>#ORD-{order.id}</span>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Placed {new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                        <span style={{ 
                            fontSize: '0.7rem', 
                            background: order.status === 'delivered' ? 'var(--primary-light)' : order.status === 'shipped' ? 'var(--accent)' : '#f0f0f0', 
                            color: order.status === 'delivered' ? 'var(--primary)' : order.status === 'shipped' ? '#000' : '#666', 
                            padding: '6px 12px', 
                            borderRadius: '20px', 
                            fontWeight: '800',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>{order.status}</span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', padding: '16px', background: '#f9f9f9', borderRadius: '16px' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '12px', background: '#fff', flexShrink: 0, overflow: 'hidden', border: '1px solid #eee' }}>
                            {order.product?.image_path ? (
                                <img src={typeof order.product.image_path === 'string' && order.product.image_path.startsWith('[') ? JSON.parse(order.product.image_path)[0] : order.product.image_path} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>📦</div>
                            )}
                        </div>
                        <div style={{ flex: 1 }}>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-main)' }}>{order.product?.name || 'Agri Product'}</h4>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{order.quantity} {order.product?.unit || 'units'} • ₱{parseFloat(order.total_price).toLocaleString()}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                                <span className={`badge ${order.payment_method === 'gcash' ? 'badge-primary' : 'badge-accent'}`} style={{ fontSize: '0.65rem' }}>
                                    {order.payment_method === 'gcash' ? '💳 GCash' : '💵 Cash on Delivery'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center', paddingTop: '4px' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)' }} />
                            <div style={{ width: '2px', flex: 1, background: '#eee' }} />
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent)' }} />
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Pick-up Point</p>
                                    <p style={{ fontSize: '0.9rem', fontWeight: '700', marginTop: '2px' }}>{order.product?.farmer?.name || 'Local Farm'}</p>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{order.product?.farmer?.barangay || 'Butuan City'}</p>
                                </div>
                                {order.product?.farmer_id && (
                                    <button onClick={() => navigate(`/chat/${order.product.farmer_id}`)} style={{ background: 'var(--primary-light)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                        <MessageSquare size={16} color="var(--primary)" />
                                    </button>
                                )}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Delivery Address</p>
                                    <p style={{ fontSize: '0.9rem', fontWeight: '700', marginTop: '2px' }}>{order.delivery_address || 'Not specified'}</p>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Recipient: {order.user?.name || 'Customer'}</p>
                                </div>
                                {order.retailer_id && (
                                    <button onClick={() => navigate(`/chat/${order.retailer_id}`)} style={{ background: 'var(--accent-light)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                        <MessageSquare size={16} color="var(--accent)" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        {!order.rider_id ? (
                            <button 
                                onClick={() => handleUpdateStatus(order.id, 'shipped')}
                                className="btn btn-primary" style={{ width: '100%', borderRadius: '16px', height: '56px', fontSize: '1rem', background: 'var(--accent)', color: '#000', border: 'none', fontWeight: '900' }}
                            >
                                <Package size={20} /> Claim This Job
                            </button>
                        ) : order.status !== 'shipped' && order.status !== 'delivered' ? (
                            order.payment_method === 'gcash' && order.status === 'pending' ? (
                                <button className="btn" disabled style={{ width: '100%', borderRadius: '16px', height: '56px', fontSize: '0.9rem', color: '#999', background: '#f5f5f5', border: '1px dashed #ddd', fontWeight: '700' }}>
                                    Awaiting Payment Verification
                                </button>
                            ) : (
                                <button 
                                    onClick={() => handleUpdateStatus(order.id, 'shipped')}
                                    className="btn btn-primary" style={{ width: '100%', borderRadius: '16px', height: '56px', fontSize: '1rem', boxShadow: '0 8px 16px rgba(46, 125, 50, 0.2)' }}
                                >
                                    <Navigation size={20} /> Start Route
                                </button>
                            )
                        ) : order.status === 'shipped' ? (
                            <>
                                <button 
                                    onClick={() => handleUpdateStatus(order.id, 'delivered')}
                                    className="btn btn-primary" style={{ flex: 2, borderRadius: '16px', height: '56px' }}
                                >
                                    <CheckCircle size={20} /> Confirm Delivery
                                </button>
                                <button 
                                    onClick={() => handleUpdateStatus(order.id, 'return')}
                                    className="btn" style={{ flex: 1, background: '#FFF5F5', color: 'var(--danger)', border: '1px solid #FFE0E0', borderRadius: '16px' }}
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <div style={{ width: '100%', padding: '12px', background: '#f5f5f5', borderRadius: '12px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <ShieldCheck size={18} color="var(--primary)" />
                                <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-muted)' }}>Order Successfully Delivered</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RiderDashboard;
