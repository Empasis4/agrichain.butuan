import React, { useState } from 'react';
import { Settings, Trash2, Archive, Shield, Bell, Database } from 'lucide-react';
import axios from 'axios';

const AdminSettings = ({ user }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('agrichain_admin_settings');
    return saved ? JSON.parse(saved) : {
      mandatory_farmer_id: true,
      mfa_enabled: false,
      default_shipping_fee: 150
    };
  });

  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('agrichain_admin_settings', JSON.stringify(newSettings));
  };

  return (
    <div className="admin-settings">
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Platform Configuration</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>Security, logistics, and account provisioning</p>
      </header>

      <div className="custom-scrollbar" style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {[
            { id: 'general', label: 'General', icon: <Database size={14} /> },
            { id: 'security', label: 'Security', icon: <Shield size={14} /> },
            { id: 'logistics', label: 'Logistics', icon: <Archive size={14} /> }
        ].map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id)}
            style={{ 
              padding: '10px 20px', borderRadius: '24px', border: '1px solid #eee', fontSize: '0.85rem', 
              whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px',
              background: activeTab === tab.id ? 'var(--primary)' : '#fff',
              color: activeTab === tab.id ? '#fff' : 'var(--text-muted)',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: activeTab === tab.id ? '0 4px 12px rgba(46, 125, 50, 0.2)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: '24px', borderRadius: '24px', border: '1px solid #f0f0f0' }}>
        {activeTab === 'general' && (
          <div className="page-transition" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: 'var(--primary-light)', padding: '16px', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '800', marginBottom: '4px' }}>System Instance</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600' }}>v2.1.0 Build Stable • AgriChain Butuan</p>
            </div>
            
          </div>
        )}

        {activeTab === 'security' && (
          <div className="page-transition" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '900' }}>Access Control</h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f5f5f5' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Mandatory Farmer ID Verification</span>
                <input 
                  type="checkbox" 
                  checked={settings.mandatory_farmer_id} 
                  onChange={(e) => updateSetting('mandatory_farmer_id', e.target.checked)}
                />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f5f5f5' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Multi-Factor Admin Login</span>
                <input 
                  type="checkbox" 
                  checked={settings.mfa_enabled}
                  onChange={(e) => updateSetting('mfa_enabled', e.target.checked)}
                />
            </div>
          </div>
        )}

        {activeTab === 'logistics' && (
          <div className="page-transition" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
                <h3 style={{ fontSize: '1rem', fontWeight: '900', marginBottom: '16px' }}>Add New Logistics Rider</h3>
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
                            alert('Rider terminal provisioned successfully!');
                            e.target.reset();
                        } catch (err) {
                            alert(err.response?.data?.message || 'Provisioning failed');
                        }
                    }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
                >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                        <input type="text" name="name" placeholder="Rider Full Name" required className="input" style={{ borderRadius: '12px', background: '#f9f9f9', height: '50px' }} />
                        <input type="email" name="email" placeholder="Email Address" required className="input" style={{ borderRadius: '12px', background: '#f9f9f9', height: '50px' }} />
                        <input type="tel" name="phone" placeholder="Contact Number (09...)" className="input" style={{ borderRadius: '12px', background: '#f9f9f9', height: '50px' }} />
                        <input type="password" name="password" placeholder="Temporary Terminal Password" required className="input" style={{ borderRadius: '12px', background: '#f9f9f9', height: '50px' }} />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ height: '54px', borderRadius: '14px', marginTop: '8px', fontSize: '1rem', fontWeight: '800', boxShadow: '0 8px 20px rgba(46, 125, 50, 0.2)' }}>
                        Provision Rider Terminal
                    </button>
                </form>
            </div>

            <div style={{ paddingTop: '24px', borderTop: '1px solid #f0f0f0' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '900', marginBottom: '12px' }}>Global Shipping</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.75rem', color: '#999', marginBottom: '4px', fontWeight: '700' }}>Default Fee</p>
                        <input 
                          type="number" 
                          value={settings.default_shipping_fee} 
                          onChange={(e) => updateSetting('default_shipping_fee', Number(e.target.value))}
                          className="input" style={{ height: '48px' }} 
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                         <p style={{ fontSize: '0.75rem', color: '#999', marginBottom: '4px', fontWeight: '700' }}>Status</p>
                         <div style={{ height: '48px', display: 'flex', alignItems: 'center', color: 'var(--primary)', fontWeight: '800', fontSize: '0.9rem' }}>Active</div>
                    </div>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;
