import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserPlus, User, Store, ArrowLeft, ChevronRight, MapPin } from 'lucide-react';

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

  const [barangaySearch, setBarangaySearch] = useState('');
  const [showBarangayOptions, setShowBarangayOptions] = useState(false);

  const barangays = [
    "Agusan Pequeño", "Amago", "Ampayon", "Anticala", "Baan KM 3", "Baan Proper", "Babag", "Bading", 
    "Bancasi", "Banza", "Baobaoan", "Basag", "Bayanihan", "Bilay", "Bit-os", "Bitan-agan", "Bobon", 
    "Bonbon", "Bugabus", "Buhangin", "Butuan City Proper", "Cabcabon", "Camayahan", "Dagohoy", 
    "Dankias", "De Oro", "Diego Silang", "Doongan", "Dulag", "Dumalagan", "Florida", "Golden Ribbon", 
    "Holy Redeemer", "Humabon", "Imadejas", "J.P. Rizal", "Kinamlutan", "Lapu-Lapu", "Lemon", 
    "Leon Kilat", "Libertad", "Limaha", "Los Angeles", "Lumbocan", "Maguinda", "Mahay", "Maibu", 
    "Mandamo", "Manila de Oro", "Maon", "Masao", "Maug", "Obrero", "Ong Yiu", "Pagatpatan", 
    "Pangabugan", "Pantalan", "Pigdaulan", "Pinamanculan", "Port Poyohon", "Quezon", "Rajah Soliman", 
    "San Ignacio", "San Jose", "San Vicente", "Santa Cruz", "Santa Lucia", "Santo Niño", "Sikatuna", 
    "Siluman", "Tagabaca", "Taguibo", "Taligaman", "Tiniwisan", "Tungao", "Urduja", "Villa Kananga"
  ];

  const filteredBarangays = barangays.filter(b => b.toLowerCase().includes(barangaySearch.toLowerCase()));

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

      <div style={{ display: 'flex', gap: '10px', marginBottom: '32px', overflowX: 'auto', padding: '4px' }}>
        <button 
          type="button"
          className={`btn ${role === 'retailer' ? 'btn-primary' : ''}`} 
          style={{ flex: 1, minWidth: '100px', flexDirection: 'column', height: '100px', background: role === 'retailer' ? 'var(--primary)' : '#fff', border: role === 'retailer' ? 'none' : '1px solid #ddd', gap: '8px' }}
          onClick={() => setRole('retailer')}
        >
          <Store size={24} />
          <span style={{ fontSize: '0.8rem' }}>Retailer</span>
        </button>
        <button 
          type="button"
          className={`btn ${role === 'farmer' ? 'btn-primary' : ''}`} 
          style={{ flex: 1, minWidth: '100px', flexDirection: 'column', height: '100px', background: role === 'farmer' ? 'var(--primary)' : '#fff', border: role === 'farmer' ? 'none' : '1px solid #ddd', gap: '8px' }}
          onClick={() => setRole('farmer')}
        >
          <User size={24} />
          <span style={{ fontSize: '0.8rem' }}>Farmer</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input 
              type="text" 
              placeholder="Full Name" 
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="input"
            />
            <input 
              type="email" 
              placeholder="Email Address" 
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="input"
            />
            <input 
              type="tel" 
              placeholder="Phone Number" 
              required
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="input"
            />
        </div>

        <div style={{ position: 'relative' }}>
          <input 
            type="text" 
            placeholder="Search Barangay (Butuan City)" 
            required
            value={barangaySearch}
            onChange={(e) => {
              setBarangaySearch(e.target.value);
              setShowBarangayOptions(true);
            }}
            onFocus={() => setShowBarangayOptions(true)}
            className="input"
          />
          {showBarangayOptions && barangaySearch && (
            <div style={{ 
              position: 'absolute', top: '100%', left: '0', width: '100%', zIndex: 100, 
              background: '#fff', border: '1px solid #ddd', borderRadius: '12px', 
              boxShadow: 'var(--shadow-md)', maxHeight: '200px', overflowY: 'auto', marginTop: '4px'
            }}>
              {filteredBarangays.map(b => (
                <div 
                  key={b} 
                  onClick={() => {
                    setBarangaySearch(b);
                    setFormData({...formData, barangay: b});
                    setShowBarangayOptions(false);
                  }}
                  style={{ padding: '12px 16px', borderBottom: '1px solid #eee', cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  {b}
                </div>
              ))}
            </div>
          )}
          {formData.barangay && (
            <p style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '6px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
               <MapPin size={12} /> Selected: {formData.barangay}, Butuan City
            </p>
          )}
        </div>

        <input 
          type="text" 
          placeholder={role === 'farmer' ? "Farmer RSBSA / ID Number" : role === 'rider' ? "Driver's License Number" : "DTI / Business Permit Number"} 
          required
          value={formData.verification_id}
          onChange={(e) => setFormData({...formData, verification_id: e.target.value})}
          className="input"
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '4px' }}>
                {role === 'farmer' ? "Government Issued Farmer ID" : role === 'rider' ? "Driver's License Photo" : "Business Document (DTI/Permit)"}
            </label>
            <div 
              onClick={() => document.getElementById('verification-file-upload').click()}
              style={{ 
                width: '100%', height: '140px', border: '2px dashed #ddd', borderRadius: '16px', 
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                cursor: 'pointer', background: '#fcfcfc', overflow: 'hidden', position: 'relative',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={e => e.currentTarget.style.borderColor = 'var(--primary)'}
              onMouseOut={e => e.currentTarget.style.borderColor = '#ddd'}
            >
                {(role === 'farmer' ? formData.farmer_id_image : formData.permit_image) ? (
                    <img 
                        src={role === 'farmer' ? formData.farmer_id_image : formData.permit_image} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                ) : (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <ChevronRight size={24} color="#aaa" style={{ transform: 'rotate(90deg)', marginBottom: '8px' }} />
                        <span style={{ fontSize: '0.85rem', color: '#999', display: 'block' }}>Upload clear photo of your ID</span>
                    </div>
                )}
                <input 
                  id="verification-file-upload" type="file" accept="image/*" hidden 
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        if (role === 'farmer') {
                          setFormData({...formData, farmer_id_image: reader.result});
                        } else {
                          setFormData({...formData, permit_image: reader.result});
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
            </div>
        </div>

        <input 
          type="password" 
          placeholder="Password" 
          required
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          className="input"
        />
        
        <button type="submit" className="btn btn-primary" style={{ padding: '16px', borderRadius: '14px', marginTop: '16px', boxShadow: '0 8px 20px rgba(46, 125, 50, 0.25)' }}>
          <UserPlus size={20} /> Register as {role.charAt(0).toUpperCase() + role.slice(1)}
        </button>

        <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '20px' }}>
          Already have an account? <span 
            onClick={() => navigate('/login')} 
            style={{ color: 'var(--primary)', fontWeight: '700', cursor: 'pointer' }}
          >
            Sign In
          </span>
        </p>
      </form>
    </div>
  );
};

export default Register;

