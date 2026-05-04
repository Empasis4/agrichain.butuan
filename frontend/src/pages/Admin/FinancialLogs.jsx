import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CreditCard, AlertCircle, FileText, Filter } from 'lucide-react';

const FinancialLogs = ({ user }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await axios.get('/api/admin/orders'); // We'll derive logs from orders
      setLogs(res.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  return (
    <div className="financial-logs">
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Financial Ledger</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Comprehensive audit trail of all platform revenue</p>
      </header>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
        <div className="card" style={{ flex: 1, border: 'none', background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)', color: '#fff', padding: '20px', borderRadius: '24px' }}>
            <AlertCircle size={22} style={{ opacity: 0.8 }} />
            <p style={{ fontSize: '0.75rem', marginTop: '12px', fontWeight: '600', opacity: 0.9 }}>Pending Verification</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '900', marginTop: '4px' }}>{logs.filter(l => l.status === 'pending' || l.status === 'paid').length}</h3>
        </div>
        <div className="card" style={{ flex: 1, border: 'none', background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)', color: '#fff', padding: '20px', borderRadius: '24px' }}>
            <CreditCard size={22} style={{ opacity: 0.8 }} />
            <p style={{ fontSize: '0.75rem', marginTop: '12px', fontWeight: '600', opacity: 0.9 }}>Settled Orders</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '900', marginTop: '4px' }}>{logs.filter(l => l.status === 'delivered').length}</h3>
        </div>
      </div>

      <div className="custom-scrollbar" style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {['all', 'pending', 'paid', 'shipped', 'delivered', 'cancelled'].map(filter => (
          <button 
            key={filter} 
            onClick={() => setActiveFilter(filter)}
            style={{ 
              padding: '8px 16px', borderRadius: '20px', border: '1px solid #eee', fontSize: '0.75rem', 
              whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px',
              background: activeFilter === filter ? 'var(--text-main)' : '#fff',
              color: activeFilter === filter ? '#fff' : 'var(--text-muted)',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {filter.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: '0', overflowX: 'auto', borderRadius: '24px', border: '1px solid #f0f0f0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead style={{ background: '#fcfcfc', textAlign: 'left', borderBottom: '1px solid #eee' }}>
                <tr>
                    <th style={{ padding: '20px 16px', fontWeight: '800', color: '#999', fontSize: '0.7rem', textTransform: 'uppercase' }}>Reference</th>
                    <th style={{ padding: '20px 16px', fontWeight: '800', color: '#999', fontSize: '0.7rem', textTransform: 'uppercase' }}>Date</th>
                    <th style={{ padding: '20px 16px', fontWeight: '800', color: '#999', fontSize: '0.7rem', textTransform: 'uppercase' }}>Volume</th>
                    <th style={{ padding: '20px 16px', fontWeight: '800', color: '#999', fontSize: '0.7rem', textTransform: 'uppercase' }}>Workflow</th>
                    <th style={{ padding: '20px 16px', fontWeight: '800', color: '#999', fontSize: '0.7rem', textTransform: 'uppercase' }}>Audit Proof</th>
                </tr>
            </thead>
            <tbody>
                {logs.filter(l => activeFilter === 'all' || l.status === activeFilter).map(log => (
                    <tr key={log.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                        <td style={{ padding: '16px', fontWeight: '800' }}>ORD-{log.id}</td>
                        <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{new Date(log.created_at).toLocaleDateString()}</td>
                        <td style={{ padding: '16px', fontWeight: '900', color: 'var(--primary)' }}>₱{parseFloat(log.total_price).toLocaleString()}</td>
                        <td style={{ padding: '16px' }}>
                            <span style={{ 
                                padding: '4px 10px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: '800',
                                background: log.status === 'delivered' ? 'var(--primary-light)' : log.status === 'cancelled' ? '#FFF5F5' : '#E3F2FD',
                                color: log.status === 'delivered' ? 'var(--primary)' : log.status === 'cancelled' ? 'var(--danger)' : '#1976D2'
                            }}>
                                {log.status.toUpperCase()}
                            </span>
                        </td>
                        <td style={{ padding: '16px' }}>
                            {log.payment_proof_image ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: '700' }}>
                                    <FileText size={14} /> <span>E-Receipt</span>
                                </div>
                            ) : log.payment_method === 'gcash' ? (
                                <span style={{ color: 'var(--warning)', fontWeight: '800' }}>Missing Proof</span>
                            ) : <span style={{ color: '#aaa' }}>Cash Transit</span>}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        {logs.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>No ledger entries found.</div>
        )}
      </div>

    </div>
  );
};

export default FinancialLogs;
