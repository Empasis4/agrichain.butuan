import React from 'react';
import { LogOut, User, MapPin, Phone, Mail, Edit2 } from 'lucide-react';

const Profile = ({ user, onLogout }) => {
  return (
    <div className="profile-page">
      <div className="profile-header" style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 12px' }}>
            <div style={{ 
            width: '100px', height: '100px', background: 'var(--primary)', borderRadius: '50%', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '2rem', fontWeight: '800',
            overflow: 'hidden'
            }}>
                {user.profile_picture ? <img src={user.profile_picture} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : user.name?.charAt(0) || 'U'}
            </div>
            <button 
                onClick={() => document.getElementById('profile-pic-upload').click()}
                style={{ position: 'absolute', bottom: '0', right: '0', background: '#fff', border: '1px solid #ddd', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
                <Edit2 size={16} color="var(--primary)" />
            </button>
            <input 
                id="profile-pic-upload" type="file" accept="image/*" hidden 
                onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            const updatedUser = {...user, profile_picture: reader.result};
                            localStorage.setItem('agrichain_user', JSON.stringify(updatedUser));
                            window.location.reload();
                        };
                        reader.readAsDataURL(file);
                    }
                }}
            />
        </div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: '800' }}>{user.name || 'User Name'}</h1>
        <p style={{ color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user.role} • Member since 2026</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Mail size={20} color="var(--text-muted)" />
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email</p>
            <p style={{ fontWeight: '500' }}>{user.email || 'user@example.com'}</p>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Phone size={20} color="var(--text-muted)" />
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Phone</p>
            <p style={{ fontWeight: '500' }}>{user.phone || '09XXXXXXXXX'}</p>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <MapPin size={20} color="var(--text-muted)" />
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Location</p>
            <p style={{ fontWeight: '500' }}>{user.barangay ? `${user.barangay}, ` : ''}{user.location || 'Butuan City'}</p>
          </div>
        </div>

        <div className="card" style={{ marginTop: '16px' }}>
            <h2 style={{ fontSize: '1rem', marginBottom: '16px', fontWeight: '700' }}>Settings & Preferences</h2>
            
            {user.role === 'farmer' && (
                <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)' }}>Payment Integration</p>
                    <div>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>GCash Mobile Number</label>
                        <input 
                            id="gcash-number-input"
                            type="text" 
                            placeholder="09XXXXXXXXX" 
                            defaultValue={user.gcash_number || ''} 
                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', marginTop: '4px', fontSize: '0.85rem' }} 
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>GCash QR Code</label>
                        <div 
                            onClick={() => document.getElementById('gcash-qr-upload').click()}
                            style={{ 
                                width: '100%', height: '140px', border: '2px dashed #ddd', borderRadius: '12px', 
                                marginTop: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', 
                                justifyContent: 'center', cursor: 'pointer', background: '#fcfcfc', overflow: 'hidden'
                            }}
                        >
                            {user.gcash_qr ? (
                                <img src={user.gcash_qr} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            ) : (
                                <span style={{ fontSize: '0.8rem', color: '#999' }}>Click to Attach QR Image</span>
                            )}
                        </div>
                        <input 
                            id="gcash-qr-upload" type="file" accept="image/*" hidden 
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                        const updatedUser = {...user, gcash_qr: reader.result};
                                        localStorage.setItem('agrichain_user', JSON.stringify(updatedUser));
                                        window.location.reload();
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }}
                        />
                    </div>
                    <button 
                        className="btn btn-primary" 
                        style={{ marginTop: '8px' }}
                        onClick={async () => {
                            const num = document.getElementById('gcash-number-input').value;
                            const updatedUser = {...user, gcash_number: num};
                            try {
                                await axios.put(`/api/users/${user.id}`, { gcash_number: num, gcash_qr: user.gcash_qr });
                                localStorage.setItem('agrichain_user', JSON.stringify(updatedUser));
                                alert('Payment information saved successfully!');
                            } catch (err) { 
                                console.error('Save error:', err.response?.data || err.message);
                                alert('Error saving info: ' + (err.response?.data?.message || err.message)); 
                            }
                        }}
                    >
                        Save Payment Settings
                    </button>
                </div>
            )}
            
            {user.role === 'retailer' && (
                <div style={{ marginBottom: '16px' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px' }}>Default Delivery Address</p>
                    <input type="text" placeholder="Enter default address..." defaultValue={user.default_delivery_address || ''} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.85rem' }} />
                    <button className="btn btn-primary" style={{ marginTop: '8px', padding: '8px 16px', fontSize: '0.8rem' }}>Save Address</button>
                </div>
            )}

            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #eee' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: '600', color: '#D32F2F', marginBottom: '8px' }}>Danger Zone</p>
                <button className="btn" style={{ background: '#FFEBEE', color: '#D32F2F', width: '100%', padding: '10px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '600' }} onClick={() => { if(window.confirm('Are you sure you want to deactivate your account?')) { onLogout(); } }}>
                    Deactivate / Soft Delete Account
                </button>
            </div>
        </div>

        <button className="btn" style={{ marginTop: '8px', background: '#f5f5f5', color: '#333' }} onClick={onLogout}>
          <LogOut size={20} /> Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
