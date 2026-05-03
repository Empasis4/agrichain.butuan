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
          <div style={{ position: 'relative' }}>
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
          <div key={product.id} className="card" style={{ display: 'flex', gap: '16px', padding: '12px', alignItems: 'center' }}>
            <div style={{ 
              width: '90px', height: '90px', 
              background: 'linear-gradient(135deg, #f9f9f9 0%, #f0f0f0 100%)', 
              borderRadius: '12px', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2.2rem',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
              overflow: 'hidden'
            }}>
              {product.image_path ? (
                <img src={product.image_path} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                (product.name || '').includes('Onion') ? '🧅' : (product.name || '').includes('Banana') ? '🍌' : (product.name || '').includes('Tomato') ? '🍅' : (product.name || '').includes('Sweet') ? '🌽' : '🍆'
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>{product.name}</h3>
                <span className={`badge badge-${product.badge || 'primary'}`}>{product.badge || 'Fresh'}</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                <MapPin size={12} /> {product.location || 'Butuan City'}
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600', marginBottom: '4px' }}>
                {typeof product.farmer === 'object' ? product.farmer?.name : (product.farmer || 'Local Farmer')}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Stock: <span style={{ color: 'var(--text-main)', fontWeight: '700' }}>{product.quantity_available} {product.unit}</span> available
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)' }}>
                  ₱{product.price || product.price_per_kg} <small style={{ fontWeight: '400', fontSize: '0.75rem', color: 'var(--text-muted)' }}>/{product.unit}</small>
                </span>
                <button 
                  onClick={() => navigate('/checkout', { state: { product: {
                    ...product,
                    farmer_id: product.farmer_id || product.farmer?.id
                  } } })}
                  className="btn btn-primary" 
                  style={{ width: 'auto', padding: '8px 14px', fontSize: '0.8rem', opacity: parseFloat(product.quantity_available) > 0 ? 1 : 0.4 }}
                  disabled={parseFloat(product.quantity_available) <= 0}
                >
                  {parseFloat(product.quantity_available) > 0 ? 'Buy' : 'Out of Stock'}
                </button>
              </div>
            </div>
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
