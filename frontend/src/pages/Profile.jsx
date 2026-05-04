import React from 'react';
import axios from 'axios';
import { LogOut, User, MapPin, Phone, Mail, Edit2, FileText, ShieldCheck, CreditCard, Plus } from 'lucide-react';

const Profile = ({ user, onLogout }) => {
  const handleInstantSave = async (key, value) => {
    try {
      await axios.put(`/api/users/${user.id}`, { [key]: value });
      const updatedUser = { ...user, [key]: value };
      localStorage.setItem('agrichain_user', JSON.stringify(updatedUser));
      setTimeout(() => window.location.reload(), 500);
    } catch (err) {
      console.error('Update error:', err);
    }
  };

  return (
    <div className="profile-page">
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Account Profile</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>Personal information and security settings</p>
      </header>

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

        <div className="card" style={{ padding: '24px', marginBottom: '8px' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '20px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={20} color="var(--primary)" /> Account Information
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="input-group">
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Full Name</label>
                    <div style={{ position: 'relative' }}>
                        <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#ccc' }} />
                        <input 
                            id="edit-name" type="text" defaultValue={user.name} 
                            style={{ paddingLeft: '36px', width: '100%', borderRadius: '12px', border: '1px solid #eee', height: '44px', fontSize: '0.9rem', fontWeight: '600' }} 
                        />
                    </div>
                </div>

                <div className="input-group">
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Phone Number</label>
                    <div style={{ position: 'relative' }}>
                        <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#ccc' }} />
                        <input 
                            id="edit-phone" type="text" defaultValue={user.phone} 
                            style={{ paddingLeft: '36px', width: '100%', borderRadius: '12px', border: '1px solid #eee', height: '44px', fontSize: '0.9rem', fontWeight: '600' }} 
                        />
                    </div>
                </div>

                <div className="input-group">
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>Barangay / Neighborhood</label>
                    <div style={{ position: 'relative' }}>
                        <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#ccc' }} />
                        <input 
                            id="edit-barangay" type="text" defaultValue={user.barangay} 
                            style={{ paddingLeft: '36px', width: '100%', borderRadius: '12px', border: '1px solid #eee', height: '44px', fontSize: '0.9rem', fontWeight: '600' }} 
                        />
                    </div>
                </div>

                <button 
                    className="btn btn-primary" 
                    style={{ width: '100%', marginTop: '8px', borderRadius: '12px' }}
                    onClick={async () => {
                        const name = document.getElementById('edit-name').value;
                        const phone = document.getElementById('edit-phone').value;
                        const barangay = document.getElementById('edit-barangay').value;
                        try {
                            await axios.put(`/api/users/${user.id}`, { name, phone, barangay });
                            const updatedUser = { ...user, name, phone, barangay };
                            localStorage.setItem('agrichain_user', JSON.stringify(updatedUser));
                            alert('Profile updated successfully!');
                            window.location.reload();
                        } catch (err) {
                            alert('Failed to update profile.');
                        }
                    }}
                >
                    Save Personal Details
                </button>
            </div>
        </div>

        <div style={{ display: 'none' }}>
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'linear-gradient(135deg, #fff 0%, #fcfcfc 100%)' }}>
              <div style={{ width: '40px', height: '40px', background: 'var(--primary-light)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mail size={20} color="var(--primary)" />
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email Address</p>
                <p style={{ fontWeight: '700', fontSize: '0.95rem' }}>{user.email || 'user@example.com'}</p>
              </div>
            </div>
        </div>

        {/* --- ROLE SPECIFIC SECTIONS --- */}

        {/* ADMIN SECTION: No deactivation, just status */}
        {user.role === 'admin' && (
            <div className="card" style={{ marginTop: '8px', padding: '24px', background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)', color: '#fff', border: 'none' }}>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <div style={{ width: '64px', height: '64px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                        <ShieldCheck size={28} color="#fff" />
                    </div>
                    <span style={{ fontSize: '1rem', color: '#fff', fontWeight: '800' }}>Root Administrator</span>
                    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>System Security active. Self-deactivation disabled.</p>
                </div>
            </div>
        )}

        {/* RIDER SECTION: Verified badge + Deactivation */}
        {user.role === 'rider' && (
            <div className="card" style={{ marginTop: '8px', padding: '24px' }}>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <div style={{ width: '64px', height: '64px', background: 'var(--primary-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                        <ShieldCheck size={28} color="var(--primary)" />
                    </div>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '800' }}>Verified Rider</span>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Account verified by Admin.</p>
                </div>
                
                <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #f0f0f0' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px' }}>Danger Zone</p>
                    <div style={{ background: '#FFF5F5', padding: '16px', borderRadius: '12px', border: '1px solid #FFE0E0', marginBottom: '12px' }}>
                        <p style={{ fontSize: '0.75rem', color: '#C62828', fontWeight: '600', lineHeight: '1.4' }}>
                            <strong>Note:</strong> Deactivating will suspend your terminal access.
                        </p>
                    </div>
                    <button 
                        className="btn" 
                        style={{ background: '#FFF5F5', color: 'var(--danger)', width: '100%', border: '1px solid #FFE0E0', borderRadius: '12px', fontSize: '0.9rem', fontWeight: '700' }} 
                        onClick={async () => { 
                            if(window.confirm('Deactivate your Rider account?')) { 
                                try {
                                    await axios.delete(`/api/users/${user.id}`);
                                    alert('Account deactivated.');
                                    onLogout(); 
                                } catch (err) {
                                    alert('Error.');
                                }
                            } 
                        }}
                    >
                        Deactivate Rider Account
                    </button>
                </div>
            </div>
        )}

        {/* RETAILER/FARMER SECTION: Documents + GCash + Deactivation */}
        {(user.role === 'retailer' || user.role === 'farmer') && (
            <div className="card" style={{ marginTop: '8px', padding: '24px' }}>
                <div style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.1rem', marginBottom: '20px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ShieldCheck size={20} color="var(--primary)" /> Verification Status
                    </h2>
                    
                    {user.status === 'verified' ? (
                        <div style={{ 
                            background: 'linear-gradient(135deg, var(--primary) 0%, #1B5E20 100%)', 
                            padding: '32px', borderRadius: '24px', textAlign: 'center', color: '#fff',
                            boxShadow: '0 12px 24px rgba(46, 125, 50, 0.2)'
                        }}>
                            <div style={{ width: '64px', height: '64px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                <ShieldCheck size={32} color="#fff" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '900', letterSpacing: '-0.5px' }}>Verified {user.role.charAt(0).toUpperCase() + user.role.slice(1)}</h3>
                            <p style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '4px' }}>Your operational documents have been officially approved.</p>
                        </div>
                    ) : (
                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <p style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)' }}>
                                    {user.role === 'farmer' ? "Farmer ID Card" : "Business Permit / ID"}
                                </p>
                                <span style={{ fontSize: '0.65rem', fontWeight: '800', padding: '4px 10px', borderRadius: '12px', background: '#FFF9C4', color: '#827717' }}>
                                    ⏳ PENDING REVIEW
                                </span>
                            </div>

                            <div 
                                onClick={() => document.getElementById('permit-upload').click()}
                                style={{ 
                                    width: '100%', height: '180px', border: '2px dashed #e0e0e0', borderRadius: '16px', 
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', 
                                    justifyContent: 'center', cursor: 'pointer', background: '#fdfdfd', overflow: 'hidden'
                                }}
                            >
                                {(user.permit_image || user.farmer_id_image) ? (
                                    <img src={user.permit_image || user.farmer_id_image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ textAlign: 'center' }}>
                                        <FileText size={28} color="#999" />
                                        <span style={{ fontSize: '0.85rem', color: '#666', display: 'block', marginTop: '8px' }}>Upload Document</span>
                                    </div>
                                )}
                            </div>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'center' }}>
                                Please ensure your documents are valid and clear for Admin review.
                            </p>
                            <input 
                                id="permit-upload" type="file" accept="image/*" hidden 
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = async () => {
                                            try {
                                                const key = user.role === 'farmer' ? 'farmer_id_image' : 'permit_image';
                                                await axios.put(`/api/users/${user.id}`, { [key]: reader.result });
                                                const updatedUser = {...user, [key]: reader.result};
                                                localStorage.setItem('agrichain_user', JSON.stringify(updatedUser));
                                                window.location.reload();
                                            } catch (err) {}
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                        </div>
                    )}
                </div>

                {user.role === 'farmer' && (
                    <div style={{ padding: '24px', background: 'var(--primary-light)', borderRadius: '24px', marginBottom: '24px', border: '1px solid var(--primary-light)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CreditCard size={18} /> Payment Integration
                        </h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '6px', display: 'block' }}>GCash Number</label>
                                <input 
                                    id="gcash-number-input"
                                    type="text" 
                                    placeholder="e.g. 09123456789" 
                                    defaultValue={user.gcash_number || ''} 
                                    className="input"
                                    style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '14px' }}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '6px', display: 'block' }}>Payment QR Code (GCash)</label>
                                <div 
                                    onClick={() => document.getElementById('qr-upload').click()}
                                    style={{ 
                                        width: '100%', height: '200px', background: '#fff', borderRadius: '16px', 
                                        border: '2px dashed var(--primary-light)', display: 'flex', alignItems: 'center', 
                                        justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', position: 'relative'
                                    }}
                                >
                                    {user.gcash_qr ? (
                                        <img src={user.gcash_qr} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    ) : (
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ width: '48px', height: '48px', background: 'var(--primary-light)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                                                <Plus size={24} color="var(--primary)" />
                                            </div>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600' }}>Upload GCash QR</span>
                                        </div>
                                    )}
                                </div>
                                <input 
                                    id="qr-upload" type="file" accept="image/*" hidden 
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                const preview = document.querySelector('#qr-preview');
                                                if(preview) preview.src = reader.result;
                                                // We'll save it when they click the main Save button or instantly
                                                // Let's do instant save for consistency with permit upload
                                                handleInstantSave('gcash_qr', reader.result);
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                            </div>

                             <button 
                                className="btn btn-primary" 
                                style={{ 
                                    width: '100%', 
                                    borderRadius: '14px', 
                                    marginTop: '8px', 
                                    boxShadow: '0 4px 12px rgba(46, 125, 50, 0.2)',
                                    background: (user.gcash_number || user.gcash_qr) ? '#2E7D32' : 'var(--primary)'
                                }}
                                onClick={async () => {
                                    const num = document.getElementById('gcash-number-input').value;
                                    try {
                                        await axios.put(`/api/users/${user.id}`, { gcash_number: num });
                                        const updatedUser = {...user, gcash_number: num};
                                        localStorage.setItem('agrichain_user', JSON.stringify(updatedUser));
                                        alert('Payment details updated successfully!');
                                        window.location.reload();
                                    } catch (err) {}
                                }}
                            >
                                {(user.gcash_number || user.gcash_qr) ? 'Update Payment Settings' : 'Save Payment Settings'}
                            </button>
                        </div>
                    </div>
                )}
                
                <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid #f0f0f0' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '12px' }}>Danger Zone</p>
                    <button className="btn" style={{ background: '#FFF5F5', color: 'var(--danger)', width: '100%', border: '1px solid #FFE0E0', borderRadius: '12px' }} onClick={() => { if(window.confirm('Deactivate?')) { onLogout(); } }}>
                        Deactivate Account
                    </button>
                </div>
            </div>
        )}

        <button className="btn" style={{ marginTop: '12px', background: '#fff', color: 'var(--text-main)', border: '1px solid #eee', boxShadow: 'var(--shadow-sm)' }} onClick={onLogout}>
          <LogOut size={20} color="var(--danger)" /> Sign Out
        </button>
    </div>
  );
};

export default Profile;
