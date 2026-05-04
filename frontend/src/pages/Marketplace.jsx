import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, MapPin, ShoppingBag, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Marketplace = ({ user }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarketplace();
    const interval = setInterval(fetchMarketplace, 8000);
    return () => clearInterval(interval);
  }, []);

  const fetchMarketplace = async () => {
    try {
      const res = await axios.get('/api/products');
      // Ensure we have an array even if API returns something else
      const data = Array.isArray(res.data) ? res.data : [];
      setFilteredProducts(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching marketplace:', error);
      // Fallback mock data if server is down so user never sees a blank screen
      setFilteredProducts([
        { id: 1, name: 'Red Onions', price: 120, unit: 'kg', farmer: { name: 'Mang Jose' }, location: 'Barangay Libertad', category: 'Vegetables', badge: 'fair' },
      ]);
      setLoading(false);
    }
  };

  const displayProducts = React.useMemo(() => {
    if (!searchTerm && activeCategory === 'All') return filteredProducts;
    
    return filteredProducts.filter(product => {
      const farmerName = typeof product.farmer === 'object' ? product.farmer?.name : product.farmer;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           (farmerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (product.location || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'All' || activeCategory === 'Nearby' || product.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory, filteredProducts]);

  return (
    <div className="marketplace">
      <header style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Marketplace</h1>
          <div 
            onClick={() => navigate('/orders')}
            style={{ position: 'relative', cursor: 'pointer' }}
          >
            <ShoppingBag size={24} color="var(--primary)" />
            <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--danger)', color: '#fff', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>2</span>
          </div>
        </div>
        
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
          <input 
            type="text" 
            placeholder="Search produce, farm, or barangay..." 
            className="input"
            style={{ paddingLeft: '48px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <X 
              size={18} 
              style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', cursor: 'pointer' }} 
              onClick={() => setSearchTerm('')}
            />
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
          {['All', 'Nearby', 'Vegetables', 'Fruits', 'Root Crops'].map((cat) => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="btn" 
              style={{ 
                width: 'auto', 
                background: activeCategory === cat ? 'var(--primary)' : '#fff', 
                color: activeCategory === cat ? '#fff' : 'var(--text-main)',
                border: '1px solid #eee', 
                padding: '8px 16px', 
                fontSize: '0.85rem', 
                boxShadow: 'var(--shadow-sm)',
                whiteSpace: 'nowrap'
              }}
            >
              {cat === 'Nearby' ? <><MapPin size={14} /> Nearby</> : cat}
            </button>
          ))}
        </div>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Harvesting fresh data...</div>
        ) : displayProducts.length > 0 ? displayProducts.map((product) => (
          <div key={product.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px' }} onClick={() => setSelectedProduct(product)}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ 
                  width: '100px', height: '100px', 
                  background: 'linear-gradient(135deg, #f9f9f9 0%, #f0f0f0 100%)', 
                  borderRadius: '12px', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2.5rem',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
                  overflow: 'hidden'
                }}>
                  {product.image_path ? (
                    <img src={product.image_path.includes('[') ? JSON.parse(product.image_path)[0] : product.image_path} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    (product.name || '').includes('Onion') ? '🧅' : (product.name || '').includes('Banana') ? '🍌' : (product.name || '').includes('Tomato') ? '🍅' : (product.name || '').includes('Sweet') ? '🌽' : '🍆'
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>{product.name}</h3>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        {product.is_preorder && <span className="badge" style={{ background: '#E3F2FD', color: '#1976D2' }}>Advance Booking</span>}
                        <span className={`badge badge-${product.badge || 'primary'}`}>{product.badge || 'Fresh'}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '700' }}>
                      {product.farmer?.name || 'AgriChain Farmer'} • ⭐ 4.8
                    </p>
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate(`/chat/${product.farmer_id || product.farmer?.id}`); }}
                      style={{ background: 'var(--primary-light)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                      <Send size={14} color="var(--primary)" />
                    </button>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    Harvested: {product.harvest_date || 'Recent'}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)' }}>
                      ₱{product.price || product.price_per_kg} <small style={{ fontWeight: '400', fontSize: '0.8rem', color: 'var(--text-muted)' }}>/{product.unit}</small>
                    </span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate('/checkout', { state: { product: { ...product, farmer_id: product.farmer_id || product.farmer?.id } } }); }}
                      className="btn btn-primary" 
                      style={{ width: 'auto', padding: '8px 16px', fontSize: '0.85rem' }}
                      disabled={parseFloat(product.quantity_available) <= 0}
                    >
                      {parseFloat(product.quantity_available) > 0 ? 'Buy Now' : 'Out of Stock'}
                    </button>
                  </div>
                </div>
            </div>
            {selectedProduct?.id === product.id && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #eee', animation: 'slideUp 0.3s ease' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '12px' }}>{product.description || 'Freshly harvested produce from our local farms.'}</p>
                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
                        {(product.image_path?.includes('[') ? JSON.parse(product.image_path) : (product.image_path ? [product.image_path] : [])).map((img, i) => (
                            <img key={i} src={img} style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                        ))}
                    </div>
                    <div style={{ background: '#f9f9f9', padding: '12px', borderRadius: '8px', marginTop: '12px' }}>
                        <p style={{ fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>Feedback & Reviews</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>"Very fresh and fast delivery! Highly recommended." - ⭐⭐⭐⭐⭐</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>"Great quality vegetables." - ⭐⭐⭐⭐⭐</p>
                    </div>
                </div>
            )}
          </div>
        )) : (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <Search size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
            <p>No produce found matching "{searchTerm}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
