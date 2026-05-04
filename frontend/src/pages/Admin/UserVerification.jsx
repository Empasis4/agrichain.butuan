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
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem' }}>User Approval Queue</h1>
        <p style={{ color: 'var(--text-muted)' }}>Review document and identity for new users</p>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Checking for pending requests...</div>
      ) : users.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          <UserCheck size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
          <p>No pending verification requests</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {users.map((u) => (
            <div key={u.id} className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '4px' }}>{u.name}</h3>
                  <span className={`badge badge-${u.role === 'farmer' ? 'primary' : 'fair'}`} style={{ fontSize: '0.65rem' }}>{u.role.toUpperCase()}</span>
                </div>
                <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '6px 12px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: '800' }}>
                  ID: {u.id}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', padding: '12px', background: '#f9f9f9', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '500' }}>
                  <Phone size={16} color="var(--primary)" /> {u.phone}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '500' }}>
                  <MapPin size={16} color="var(--primary)" /> {u.location}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '500' }}>
                  <FileText size={16} color="var(--primary)" /> Proof: <span style={{ color: 'var(--primary)', fontWeight: '700' }}>{u.verification_id || 'Not Provided'}</span>
                </div>
                {u.permit_image && (
                  <div style={{ marginTop: '10px' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Attached Permit/ID:</p>
                    <img 
                      src={u.permit_image} 
                      alt="User Permit" 
                      style={{ width: '100%', borderRadius: '8px', cursor: 'pointer', border: '1px solid #eee' }} 
                      onClick={() => window.open(u.permit_image, '_blank')}
                    />
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => handleVerify(u.id, 'rejected')}
                  className="btn" style={{ flex: 1, background: '#fff', border: '1.5px solid #eee', color: 'var(--danger)', padding: '12px', fontSize: '0.9rem' }}
                >
                  <UserX size={18} /> Reject
                </button>
                <button 
                  onClick={() => handleVerify(u.id, 'verified')}
                  className="btn btn-primary" style={{ flex: 2, padding: '12px', fontSize: '0.9rem' }}
                >
                  <UserCheck size={18} /> Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserVerification;
