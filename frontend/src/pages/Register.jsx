import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserPlus, User, Store, ArrowLeft, ChevronRight } from 'lucide-react';

const Register = ({ onRegister }) => {
  const navigate = useNavigate();
  const [role, setRole] = useState('retailer');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    verification_id: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/register', {
        ...formData,
        role: role
      });
      
      alert(response.data.message);
      // Don't auto-login, wait for admin verification
      navigate('/login');
    } catch (error) {
      alert(error.response?.data?.message || 'Registration failed. Please check your details.');
    }
  };

  return (
    <div className="register-page" style={{ padding: '20px 0' }}>
      <header style={{ textAlign: 'center', marginBottom: '32px', position: 'relative' }}>
        <ArrowLeft 
          onClick={() => navigate('/login')} 
          style={{ position: 'absolute', left: '0', top: '5px', cursor: 'pointer' }} 
        />
        <h1 style={{ fontSize: '1.8rem' }}>Create Account</h1>
        <p style={{ color: 'var(--text-muted)' }}>Join the AgriChain community</p>
      </header>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
        <button 
          className={`btn ${role === 'retailer' ? 'btn-primary' : ''}`} 
          style={{ flex: 1, flexDirection: 'column', height: '100px', background: role === 'retailer' ? 'var(--primary)' : '#fff', border: role === 'retailer' ? 'none' : '1px solid #ddd' }}
          onClick={() => setRole('retailer')}
        >
          <Store size={24} />
          <span>Retailer</span>
        </button>
        <button 
          className={`btn ${role === 'farmer' ? 'btn-primary' : ''}`} 
          style={{ flex: 1, flexDirection: 'column', height: '100px', background: role === 'farmer' ? 'var(--primary)' : '#fff', border: role === 'farmer' ? 'none' : '1px solid #ddd' }}
          onClick={() => setRole('farmer')}
        >
          <User size={24} />
          <span>Farmer</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <input 
          type="text" 
          placeholder="Full Name" 
          required
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #ddd', outline: 'none' }}
        />
        <input 
          type="email" 
          placeholder="Email Address" 
          required
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #ddd', outline: 'none' }}
        />
        <input 
          type="tel" 
          placeholder="Phone Number" 
          required
          value={formData.phone}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
          style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #ddd', outline: 'none' }}
        />
        <input 
          type="text" 
          placeholder="Barangay (Type your barangay)" 
          required
          value={formData.barangay || ''}
          onChange={(e) => setFormData({...formData, barangay: e.target.value})}
          style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #ddd', outline: 'none' }}
        />
        <input 
          type="text" 
          placeholder={role === 'farmer' ? "Farmer RSBSA / ID Number" : "DTI / Business Permit Number"} 
          required
          value={formData.verification_id}
          onChange={(e) => setFormData({...formData, verification_id: e.target.value})}
          style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #ddd', outline: 'none' }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {role === 'farmer' ? "Upload Farmer ID (Image URL/Base64)" : "Upload Business Permit (Image URL/Base64)"}
            </label>
            <input 
              type="text" 
              placeholder="Enter Image URL or attach later" 
              value={role === 'farmer' ? (formData.farmer_id_image || '') : (formData.permit_image || '')}
              onChange={(e) => {
                  if (role === 'farmer') {
                      setFormData({...formData, farmer_id_image: e.target.value});
                  } else {
                      setFormData({...formData, permit_image: e.target.value});
                  }
              }}
              style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #ddd', outline: 'none' }}
            />
        </div>
        <input 
          type="password" 
          placeholder="Password" 
          required
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #ddd', outline: 'none' }}
        />
        
        <button type="submit" className="btn btn-primary" style={{ padding: '16px', borderRadius: '12px', marginTop: '16px' }}>
          <UserPlus size={20} /> Register as {role.charAt(0).toUpperCase() + role.slice(1)}
        </button>

        <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '16px' }}>
          Already have an account? <span 
            onClick={() => navigate('/login')} 
            style={{ color: 'var(--primary)', fontWeight: '600', cursor: 'pointer' }}
          >
            Sign In
          </span>
        </p>
      </form>
    </div>
  );
};

export default Register;

