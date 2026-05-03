import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Tag, Info } from 'lucide-react';

const ManageHarvests = ({ user }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Vegetables',
    price_per_kg: '',
    quantity_available: '',
    unit: 'kg',
    harvest_date: new Date().toISOString().split('T')[0],
    description: '',
    image_path: ''
  });

  useEffect(() => {
    if (!user?.id) return;
    fetchProducts();
    const interval = setInterval(fetchProducts, 8000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`/api/products/farmer/${user.id}`);
      setProducts(Array.isArray(res.data) ? res.data : []);
      setLoading(false);
    } catch (error) {
      setProducts([]);
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const res = await axios.put(`/api/products/${editingId}`, newProduct);
        setProducts(products.map(p => p.id === editingId ? res.data : p));
        setEditingId(null);
      } else {
        const res = await axios.post('/api/products', { 
          ...newProduct, 
          farmer_id: user.id || 1 
        });
        setProducts([...products, res.data]);
      }
      setShowAddForm(false);
      setNewProduct({ name: '', category: 'Vegetables', price_per_kg: '', quantity_available: '', unit: 'kg', harvest_date: new Date().toISOString().split('T')[0], description: '', image_path: '' });
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this harvest?')) return;
    try {
      await axios.delete(`/api/products/${id}`);
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      alert('Error deleting product');
    }
  };

  const [editingId, setEditingId] = useState(null);
  const handleEdit = (p) => {
    setEditingId(p.id);
    setNewProduct(p);
    setShowAddForm(true);
  };

  return (
    <div className="manage-harvests">
      <header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem' }}>My Harvests</h1>
          <p style={{ color: 'var(--text-muted)' }}>Inventory control & pricing</p>
        </div>
        <button 
          onClick={() => { setEditingId(null); setShowAddForm(true); }}
          className="btn btn-primary" 
          style={{ width: '40px', height: '40px', borderRadius: '50%', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Plus size={24} />
        </button>
      </header>

      {showAddForm && (
        <div className="card" style={{ marginBottom: '24px', border: '1px solid var(--primary)' }}>
          <h3 style={{ marginBottom: '16px' }}>{editingId ? 'Edit Harvest' : 'List New Harvest'}</h3>
          <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input 
              type="text" placeholder="Product Name (e.g. Red Onions)" required className="input" 
              value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="number" placeholder="Price" required className="input" 
                value={newProduct.price_per_kg} onChange={e => setNewProduct({...newProduct, price_per_kg: e.target.value})}
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
              />
              <select 
                className="input" value={newProduct.unit} onChange={e => setNewProduct({...newProduct, unit: e.target.value})}
                style={{ width: '80px', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
              >
                <option value="kg">kg</option>
                <option value="bundle">bundle</option>
                <option value="sack">sack</option>
              </select>
            </div>
            <input 
              type="number" placeholder="Available Quantity" required className="input" 
              value={newProduct.quantity_available} onChange={e => setNewProduct({...newProduct, quantity_available: e.target.value})}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
            />
            <input 
              type="text" placeholder="Product Image URL (e.g. https://example.com/onions.jpg)" className="input" 
              value={newProduct.image_path} onChange={e => setNewProduct({...newProduct, image_path: e.target.value})}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={() => setShowAddForm(false)} className="btn" style={{ flex: 1, background: '#eee' }}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>{editingId ? 'Update Harvest' : 'Publish Harvest'}</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading inventory...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {products.map((p) => (
            <div key={p.id} className="card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{p.name}</h3>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', fontWeight: '600' }}>
                      <Tag size={14} /> ₱{p.price_per_kg}/{p.unit}
                    </span>
                    <span style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
                      <Info size={14} /> {p.quantity_available} {p.unit} left
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleEdit(p)} style={{ background: '#f5f5f5', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(p.id)} style={{ background: '#ffebee', border: 'none', padding: '8px', borderRadius: '8px', color: 'var(--danger)', cursor: 'pointer' }}><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageHarvests;
