import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserCheck, UserX, FileText, MapPin, Phone, Search, Filter, Shield, MoreVertical, Trash2 } from 'lucide-react';
import { useToast } from '../../components/Toast';

const UserManagement = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, verified, rejected
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/admin/users');
      setUsers(Array.isArray(res.data) ? res.data : []);
      setLoading(false);
    } catch (error) {
      console.error('Fetch users error:', error);
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await axios.post(`/api/admin/verify-user/${id}`, { status });
      showToast(`User status updated to ${status}`, 'success');
      fetchUsers();
    } catch (error) {
      showToast('Failed to update user status', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this user from the platform?')) return;
    try {
      await axios.delete(`/api/users/${id}`);
      showToast('User account removed', 'success');
      fetchUsers();
    } catch (error) {
      showToast('Deletion failed', 'error');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesFilter = filter === 'all' || u.status === filter;
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="user-management-page">
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>User Directory</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>Administrative oversight of all platform participants</p>
      </header>

      <div style={{ position: 'relative', marginBottom: '24px' }}>
        <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} size={18} />
        <input 
          type="text" 
          placeholder="Search by name or email..." 
          className="input" 
          style={{ paddingLeft: '48px', borderRadius: '16px', border: '1px solid #eee' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="custom-scrollbar" style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {[
            { id: 'all', label: 'All Users', icon: <UserCheck size={14} /> },
            { id: 'pending', label: 'Pending', icon: <Shield size={14} /> },
            { id: 'verified', label: 'Verified', icon: <UserCheck size={14} /> },
            { id: 'rejected', label: 'Rejected', icon: <UserX size={14} /> }
        ].map(s => (
          <button 
            key={s.id}
            onClick={() => setFilter(s.id)}
            style={{ 
              padding: '10px 20px', borderRadius: '24px', border: '1px solid #eee', fontSize: '0.85rem', 
              whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px',
              background: filter === s.id ? 'var(--primary)' : '#fff',
              color: filter === s.id ? '#fff' : 'var(--text-muted)',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
             <div className="spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary-light)', borderTopColor: 'var(--primary)', borderRadius: '50%', margin: '0 auto' }}></div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px', border: '2px dashed #eee', borderRadius: '24px' }}>
          <p style={{ color: '#999' }}>No users found matching your criteria.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredUsers.map((u) => (
            <div key={u.id} className="card" style={{ padding: '20px', borderRadius: '20px', border: '1px solid #f0f0f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: '900' }}>
                    {u.name.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: '800' }}>{u.name}</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email} • <span style={{ textTransform: 'capitalize', fontWeight: '700' }}>{u.role}</span></p>
                  </div>
                </div>
                <span style={{ 
                  fontSize: '0.65rem', fontWeight: '900', padding: '4px 10px', borderRadius: '20px',
                  background: u.status === 'verified' ? '#E8F5E9' : u.status === 'pending' ? '#FFF3E0' : '#FFEBEE',
                  color: u.status === 'verified' ? '#2E7D32' : u.status === 'pending' ? '#E65100' : '#D32F2F',
                  textTransform: 'uppercase'
                }}>
                  {u.status}
                </span>
              </div>

              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f9f9f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: (u.permit_image || u.farmer_id_image) ? '12px' : '0' }}>
                  <div style={{ display: 'flex', gap: '12px', color: '#999', fontSize: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={12} /> {u.phone || 'N/A'}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> {u.barangay ? `${u.barangay}, ` : ''}{u.location || 'Butuan'}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {u.status === 'pending' && (
                      <>
                        <button onClick={() => handleStatusUpdate(u.id, 'rejected')} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }} title="Reject"><UserX size={20} /></button>
                        <button onClick={() => handleStatusUpdate(u.id, 'verified')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '4px' }} title="Approve"><UserCheck size={20} /></button>
                      </>
                    )}
                    {u.role !== 'admin' && (
                      <button onClick={() => handleDelete(u.id)} style={{ background: 'none', border: 'none', color: '#ddd', cursor: 'pointer', padding: '4px' }} title="Delete Account"><Trash2 size={20} /></button>
                    )}
                  </div>
                </div>

                {(u.permit_image || u.farmer_id_image) && (
                    <div style={{ marginTop: '12px' }}>
                        <button 
                            onClick={() => {
                                const el = document.getElementById(`doc-${u.id}`);
                                el.style.display = el.style.display === 'none' ? 'block' : 'none';
                            }}
                            className="btn" 
                            style={{ width: '100%', background: 'var(--primary-light)', color: 'var(--primary)', border: 'none', fontSize: '0.75rem', fontWeight: '800', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                        >
                            <FileText size={14} /> {u.role === 'farmer' ? 'View Farmer ID' : 'View Business Permit'}
                        </button>
                        <div id={`doc-${u.id}`} style={{ display: 'none', marginTop: '12px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #eee' }}>
                            <img src={u.permit_image || u.farmer_id_image} style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', background: '#f9f9f9' }} />
                        </div>
                    </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserManagement;
