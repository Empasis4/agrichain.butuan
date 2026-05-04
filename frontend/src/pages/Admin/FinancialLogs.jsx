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
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Financial Audit Logs</h1>
        <p style={{ color: 'var(--text-muted)' }}>Transaction history and payment alerts</p>
      </header>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <div className="card" style={{ flex: 1, borderLeft: '4px solid var(--warning)' }}>
            <AlertCircle size={20} color="var(--warning)" />
            <p style={{ fontSize: '0.75rem', marginTop: '4px' }}>Unverified Payments</p>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>{logs.filter(l => l.status === 'pending' || l.status === 'paid').length}</h3>
        </div>
        <div className="card" style={{ flex: 1, borderLeft: '4px solid var(--primary)' }}>
            <CreditCard size={20} color="var(--primary)" />
            <p style={{ fontSize: '0.75rem', marginTop: '4px' }}>Completed Payouts</p>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>{logs.filter(l => l.status === 'delivered').length}</h3>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '16px' }}>
        {['all', 'pending', 'paid', 'shipped', 'delivered', 'return', 'cancelled'].map(filter => (
          <button 
            key={filter} 
            onClick={() => setActiveFilter(filter)}
            className="btn" 
            style={{ 
              width: 'auto', 
              padding: '6px 12px', fontSize: '0.75rem', 
              background: activeFilter === filter ? 'var(--primary)' : '#fff',
              color: activeFilter === filter ? '#fff' : 'var(--text-muted)',
              textTransform: 'capitalize',
              whiteSpace: 'nowrap'
            }}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: '0', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead style={{ background: '#f5f5f5', textAlign: 'left' }}>
                <tr>
                    <th style={{ padding: '12px' }}>Order</th>
                    <th style={{ padding: '12px' }}>Date</th>
                    <th style={{ padding: '12px' }}>Amount</th>
                    <th style={{ padding: '12px' }}>Status</th>
                    <th style={{ padding: '12px' }}>Audit</th>
                </tr>
            </thead>
            <tbody>
                {logs.filter(l => activeFilter === 'all' || l.status === activeFilter).map(log => (
                    <tr key={log.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px' }}>#ORD-{log.id}</td>
                        <td style={{ padding: '12px' }}>{new Date(log.created_at).toLocaleDateString()}</td>
                        <td style={{ padding: '12px', fontWeight: '700' }}>₱{parseFloat(log.total_price).toLocaleString()}</td>
                        <td style={{ padding: '12px' }}>
                            <span className="badge" style={{ 
                                background: log.status === 'delivered' ? '#E8F5E9' : log.status === 'cancelled' ? '#FFEBEE' : '#E3F2FD',
                                color: log.status === 'delivered' ? '#2E7D32' : log.status === 'cancelled' ? '#C62828' : '#1976D2'
                            }}>
                                {log.status.toUpperCase()}
                            </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                            {log.payment_proof_image ? (
                                <span style={{ color: 'var(--primary)', fontWeight: '600', cursor: 'pointer' }} onClick={() => alert('View proof coming soon')}>Verified</span>
                            ) : log.payment_method === 'gcash' ? (
                                <span style={{ color: 'var(--danger)' }}>Alert</span>
                            ) : 'COD'}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

    </div>
  );
};

export default FinancialLogs;
