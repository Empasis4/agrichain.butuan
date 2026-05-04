import React, { useState } from 'react';
import { Settings, Trash2, Archive, Shield, Bell, Database } from 'lucide-react';
import axios from 'axios';

const AdminSettings = ({ user }) => {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="admin-settings">
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Platform Settings</h1>
        <p style={{ color: 'var(--text-muted)' }}>Configure system behavior and security</p>
      </header>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' }}>
        {['general', 'security', 'logistics', 'maintenance'].map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            className="btn" 
            style={{ 
              width: 'auto', 
              background: activeTab === tab ? 'var(--primary)' : '#fff',
              color: activeTab === tab ? '#fff' : 'var(--text-main)',
              padding: '8px 16px',
              textTransform: 'capitalize'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="card">
        {activeTab === 'general' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '8px' }}>System Info</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Platform Version: 2.1.0-stable</p>
            </div>
            <div style={{ paddingTop: '16px', borderTop: '1px solid #eee' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '8px', color: 'var(--danger)' }}>Data Management</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button className="btn" style={{ background: '#FFEBEE', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Archive size={18} /> Archive Old Transactions
                    </button>
                    <button className="btn" style={{ background: '#FFEBEE', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Trash2 size={18} /> Purge Inactive Accounts (Soft Delete)
                    </button>
                </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>Security Protocols</h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Require Document Upload for Farmers</span>
                <input type="checkbox" defaultChecked />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Two-Factor Authentication for Admin</span>
                <input type="checkbox" />
            </div>
          </div>
        )}

        {activeTab === 'logistics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>Shipping Configuration</h3>
            <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Default Shipping Fee (₱)</label>
                <input type="number" defaultValue="150" className="input" style={{ marginTop: '4px' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Auto-assign nearest Rider</span>
                <input type="checkbox" defaultChecked />
            </div>

            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #eee' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '16px' }}>Add New Rider</h3>
                <form 
                    onSubmit={async (e) => {
                        e.preventDefault();
                        const data = {
                            name: e.target.name.value,
                            email: e.target.email.value,
                            phone: e.target.phone.value,
                            password: e.target.password.value
                        };
                        try {
                            await axios.post('/api/admin/riders', data);
                            alert('Rider account created successfully!');
                            e.target.reset();
                        } catch (err) {
                            alert(err.response?.data?.message || 'Error creating rider');
                        }
                    }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
                >
                    <input type="text" name="name" placeholder="Rider Name" required className="input" />
                    <input type="email" name="email" placeholder="Rider Email" required className="input" />
                    <input type="tel" name="phone" placeholder="Phone Number" className="input" />
                    <input type="password" name="password" placeholder="Temporary Password" required className="input" />
                    <button type="submit" className="btn btn-primary">Create Rider Account</button>
                </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;
