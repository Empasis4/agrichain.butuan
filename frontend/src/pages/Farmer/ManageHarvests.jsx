import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Tag, Info, AlertTriangle } from 'lucide-react';
import { useToast } from '../../components/Toast';
import Modal from '../../components/Modal';

const ManageHarvests = ({ user }) => {
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
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
      const imagesArr = Array.isArray(newProduct.image_path) ? newProduct.image_path : (newProduct.image_path ? [newProduct.image_path] : []);
      if (imagesArr.length < 3 || imagesArr.length > 5) {
          showToast('Please upload exactly 3 to 5 images for the product.', 'warning');
          return;
      }
      
      const payload = {
          ...newProduct,
          image_path: JSON.stringify(imagesArr),
          farmer_id: user.id || 1 
      };

      if (editingId) {
        const res = await axios.put(`/api/products/${editingId}`, payload);
        setProducts(products.map(p => p.id === editingId ? res.data : p));
        setEditingId(null);
        showToast('Harvest updated successfully!', 'success');
      } else {
        const res = await axios.post('/api/products', payload);
        setProducts([...products, res.data]);
        showToast('Harvest listed successfully!', 'success');
      }
      setShowAddForm(false);
      setNewProduct({ name: '', category: 'Vegetables', price_per_kg: '', quantity_available: '', unit: 'kg', harvest_date: new Date().toISOString().split('T')[0], description: '', image_path: [] });
    } catch (error) {
      showToast('Error: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const confirmDelete = (id) => {
    setProductToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/products/${productToDelete}`);
      setProducts(products.filter(p => p.id !== productToDelete));
      showToast('Harvest deleted successfully', 'success');
      setShowDeleteModal(false);
    } catch (error) {
      showToast('Error deleting product', 'error');
    }
  };

  const [editingId, setEditingId] = useState(null);
  const handleEdit = (p) => {
    let imgs = [];
    try {
        if (p.image_path) {
            imgs = p.image_path.startsWith('[') ? JSON.parse(p.image_path) : [p.image_path];
        }
    } catch (e) { imgs = [p.image_path]; }
    
    setEditingId(p.id);
    setNewProduct({
        ...p,
        image_path: imgs
    });
    setShowAddForm(true);
  };

  return (
    <div className="manage-harvests">
      <header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800' }}>My Harvests</h1>
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
        <div className="card" style={{ marginBottom: '24px', border: '1px solid var(--primary)', animation: 'slideUp 0.4s ease' }}>
          <h3 style={{ marginBottom: '16px', fontWeight: '800' }}>{editingId ? 'Edit Harvest' : 'List New Harvest'}</h3>
          <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input 
              type="text" placeholder="Product Name (e.g. Red Onions)" required className="input" 
              value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})}
            />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', paddingLeft: '4px' }}>Crop Category</label>
                <select 
                    className="input" required
                    value={['Vegetables', 'Fruits', 'Root Crops'].includes(newProduct.category) ? newProduct.category : 'Other'} 
                    onChange={e => {
                        const val = e.target.value;
                        if(val === 'Other') {
                            setNewProduct({...newProduct, category: ''});
                        } else {
                            setNewProduct({...newProduct, category: val});
                        }
                    }}
                >
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Root Crops">Root Crops</option>
                    <option value="Other">Other (Specify)</option>
                </select>
                
                {!['Vegetables', 'Fruits', 'Root Crops'].includes(newProduct.category) && (
                    <input 
                        type="text" 
                        placeholder="Enter custom category (e.g. Spices, Grains)" 
                        className="input" 
                        required
                        style={{ marginTop: '4px', background: '#fff8f0', borderColor: '#ffe0b2' }}
                        value={newProduct.category} 
                        onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                    />
                )}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="number" placeholder="Price" required className="input" 
                value={newProduct.price_per_kg} onChange={e => setNewProduct({...newProduct, price_per_kg: e.target.value})}
                style={{ flex: 1 }}
              />
              <select 
                className="input" value={newProduct.unit} onChange={e => setNewProduct({...newProduct, unit: e.target.value})}
                style={{ width: '100px' }}
              >
                <option value="kg">kg</option>
                <option value="bundle">bundle</option>
                <option value="sack">sack</option>
              </select>
            </div>
            
            <input 
              type="number" placeholder="Available Quantity" required className="input" 
              value={newProduct.quantity_available} onChange={e => setNewProduct({...newProduct, quantity_available: e.target.value})}
            />

            <textarea 
                placeholder="Product Details (e.g. Organic, Freshly Picked, etc.)" 
                className="input" 
                value={newProduct.description} 
                onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                style={{ minHeight: '80px', resize: 'vertical' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', paddingLeft: '4px' }}>Harvest Date</label>
                <input 
                  type="date" required className="input" 
                  value={newProduct.harvest_date} onChange={e => setNewProduct({...newProduct, harvest_date: e.target.value})}
                />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <input 
                  type="checkbox" 
                  id="is_preorder"
                  checked={newProduct.is_preorder || false}
                  onChange={e => setNewProduct({...newProduct, is_preorder: e.target.checked})}
                />
                <label htmlFor="is_preorder" style={{ fontSize: '0.9rem', fontWeight: '600' }}>Enable Advance Booking (Next Month Harvest)</label>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)' }}>Product Photos (3 to 5 images required)</label>
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
                  {(Array.isArray(newProduct.image_path) ? newProduct.image_path : (newProduct.image_path ? [newProduct.image_path] : [])).map((img, idx) => (
                    <div key={idx} style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0, borderRadius: '8px', overflow: 'hidden', border: '1px solid #eee' }}>
                        <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button 
                            type="button"
                            onClick={() => {
                                const newImgs = [...(Array.isArray(newProduct.image_path) ? newProduct.image_path : [newProduct.image_path])];
                                newImgs.splice(idx, 1);
                                setNewProduct({...newProduct, image_path: newImgs});
                            }}
                            style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        >
                            ×
                        </button>
                    </div>
                ))}
                {(Array.isArray(newProduct.image_path) ? newProduct.image_path : (newProduct.image_path ? [newProduct.image_path] : [])).length < 5 && (
                    <div 
                        onClick={() => document.getElementById('product-image-upload').click()}
                        style={{ width: '80px', height: '80px', flexShrink: 0, border: '2px dashed #ddd', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#fcfcfc' }}
                    >
                        <Plus size={24} color="#aaa" />
                    </div>
                )}
              </div>
              <input 
                  id="product-image-upload" type="file" accept="image/*" multiple hidden 
                  onChange={(e) => {
                    const files = Array.from(e.target.files);
                    const currentImages = Array.isArray(newProduct.image_path) ? newProduct.image_path : (newProduct.image_path ? [newProduct.image_path] : []);
                    
                    if (currentImages.length + files.length > 5) {
                        showToast('Maximum of 5 photos allowed', 'warning');
                        return;
                    }
                    
                    files.forEach(file => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            setNewProduct(prev => {
                                const prevArr = Array.isArray(prev.image_path) ? prev.image_path : (prev.image_path ? [prev.image_path] : []);
                                return {...prev, image_path: [...prevArr, reader.result]};
                            });
                        };
                        reader.readAsDataURL(file);
                    });
                  }}
                />
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button type="button" onClick={() => setShowAddForm(false)} className="btn" style={{ flex: 1, background: '#eee', color: 'var(--text-main)' }}>Cancel</button>
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
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ 
                  width: '60px', height: '60px', background: '#f5f5f5', borderRadius: '12px', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', overflow: 'hidden' 
                }}>
                  {p.image_path ? <img src={p.image_path.includes('[') ? JSON.parse(p.image_path)[0] : p.image_path} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '📦'}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '4px' }}>{p.name}</h3>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', fontWeight: '700' }}>
                      ₱{p.price_per_kg}/{p.unit}
                    </span>
                    <span style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
                      {p.quantity_available} {p.unit} left
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleEdit(p)} style={{ background: '#f5f5f5', border: 'none', padding: '10px', borderRadius: '10px', cursor: 'pointer' }}><Edit2 size={16} /></button>
                  <button onClick={() => confirmDelete(p.id)} style={{ background: '#ffebee', border: 'none', padding: '10px', borderRadius: '10px', color: 'var(--danger)', cursor: 'pointer' }}><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal 
        isOpen={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)}
        title="Delete Harvest?"
        footer={<>
          <button onClick={() => setShowDeleteModal(false)} className="btn" style={{ width: 'auto', background: '#eee' }}>Cancel</button>
          <button onClick={handleDelete} className="btn btn-primary" style={{ width: 'auto', background: 'var(--danger)' }}>Delete</button>
        </>}
      >
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <AlertTriangle size={48} color="var(--danger)" style={{ marginBottom: '16px', opacity: 0.8 }} />
          <p style={{ color: 'var(--text-muted)' }}>This action cannot be undone. Are you sure you want to remove this harvest listing?</p>
        </div>
      </Modal>
    </div>
  );
};

export default ManageHarvests;
