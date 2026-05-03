import React from 'react';
import { LogOut, User, MapPin, Phone, Mail } from 'lucide-react';

const Profile = ({ user, onLogout }) => {
  return (
    <div className="profile-page">
      <header style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ width: '100px', height: '100px', background: 'var(--primary)', borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
          <User size={48} />
        </div>
        <h1 style={{ fontSize: '1.5rem' }}>{user.name || 'User'}</h1>
        <span className="badge" style={{ background: '#E8F5E9', color: 'var(--primary)', marginTop: '8px', display: 'inline-block' }}>
          {user.role.toUpperCase()}
        </span>
      </header>

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
            <p style={{ fontWeight: '500' }}>{user.location || 'Butuan City'}</p>
          </div>
        </div>

        <button className="btn" style={{ marginTop: '24px', background: '#FFEBEE', color: '#D32F2F' }} onClick={onLogout}>
          <LogOut size={20} /> Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
