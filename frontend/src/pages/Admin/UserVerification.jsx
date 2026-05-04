import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserCheck, UserX, FileText, MapPin, Phone } from 'lucide-react';

const UserVerification = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingUsers();
    const interval = setInterval(fetchPendingUsers, 8000);
    return () => clearInterval(interval);
  }, []);

  const fetchPendingUsers = async () => {
    try {
      const res = await axios.get('/api/admin/pending-users');
      setUsers(res.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleVerify = async (id, status) => {
    try {
      await axios.post(`/api/admin/verify-user/${id}`, { status });
      setUsers(users.filter(u => u.id !== id));
      alert(`User ${status === 'verified' ? 'Approved ✅' : 'Rejected ❌'} successfully!`);
    } catch (error) {
      alert('Error updating user status');
    }
  };

  return (
    <div className="verification-page">
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Identity Queue</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Vetting new Farmer and Retailer applications</p>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
             <div className="spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary-light)', borderTopColor: 'var(--primary)', borderRadius: '50%', margin: '0 auto' }}></div>
        </div>
      ) : users.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '80px 40px', background: '#fdfdfd', border: '2px dashed #eee', borderRadius: '24px' }}>
          <UserCheck size={64} style={{ opacity: 0.1, marginBottom: '24px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#999' }}>Queue Clear!</h3>
          <p style={{ fontSize: '0.85rem', color: '#aaa', marginTop: '8px' }}>No pending verification requests.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {users.map((u) => (
            <div key={u.id} className="card" style={{ padding: '0', overflow: 'hidden', borderRadius: '24px', border: '1px solid #f0f0f0', boxShadow: '0 8px 24px rgba(0,0,0,0.03)' }}>
              <div style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{ width: '56px', height: '56px', background: 'var(--primary-light)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontSize: '1.5rem', fontWeight: '900' }}>
                            {u.name.charAt(0)}
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--text-main)' }}>{u.name}</h3>
                          <span style={{ fontSize: '0.65rem', background: u.role === 'farmer' ? 'var(--primary-light)' : 'var(--accent-light)', color: u.role === 'farmer' ? 'var(--primary)' : 'var(--accent)', padding: '4px 10px', borderRadius: '20px', fontWeight: '800', textTransform: 'uppercase' }}>{u.role}</span>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '0.65rem', color: '#999', fontWeight: '700', textTransform: 'uppercase' }}>User ID</p>
                        <p style={{ fontSize: '0.9rem', fontWeight: '800' }}>#{u.id}</p>
                    </div>
                  </div>
    
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px', padding: '20px', background: '#f9f9f9', borderRadius: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
                      <Phone size={16} color="var(--primary)" /> <span style={{ fontWeight: '600' }}>{u.phone}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
                      <MapPin size={16} color="var(--primary)" /> <span style={{ fontWeight: '600' }}>{u.location}</span>
                    </div>
                    <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', paddingTop: '8px', borderTop: '1px solid #eee' }}>
                      <FileText size={16} color="var(--primary)" /> <span style={{ color: '#666' }}>ID / Permit:</span> <span style={{ fontWeight: '800', color: 'var(--primary)' }}>{u.verification_id || 'NOT_SPECIFIED'}</span>
                    </div>
                  </div>
    
                  {u.permit_image && (
                      <div style={{ marginBottom: '24px' }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: '900', color: '#999', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Document Evidence</p>
                        <div style={{ position: 'relative', width: '100%', borderRadius: '20px', overflow: 'hidden', border: '1px solid #eee', background: '#fff' }}>
                            <img 
                              src={u.permit_image} 
                              alt="Document" 
                              style={{ width: '100%', maxHeight: '400px', objectFit: 'contain' }} 
                            />
                            <div 
                                onClick={() => window.open(u.permit_image, '_blank')}
                                style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)', opacity: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'opacity 0.2s' }}
                                onMouseOver={e => e.currentTarget.style.opacity = 1}
                                onMouseOut={e => e.currentTarget.style.opacity = 0}
                            >
                                <span style={{ background: '#fff', color: '#000', padding: '10px 20px', borderRadius: '30px', fontWeight: '700', fontSize: '0.8rem' }}>Click to View Full Size</span>
                            </div>
                        </div>
                      </div>
                  )}
    
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                      onClick={() => handleVerify(u.id, 'rejected')}
                      className="btn" style={{ flex: 1, background: '#fff', border: '1px solid #ffcdd2', color: 'var(--danger)', height: '52px', borderRadius: '16px', fontWeight: '700' }}
                    >
                      Decline
                    </button>
                    <button 
                      onClick={() => handleVerify(u.id, 'verified')}
                      className="btn btn-primary" style={{ flex: 2, height: '52px', borderRadius: '16px', fontWeight: '900', boxShadow: '0 8px 16px rgba(46, 125, 50, 0.2)' }}
                    >
                      Verify & Approve Access
                    </button>
                  </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserVerification;
