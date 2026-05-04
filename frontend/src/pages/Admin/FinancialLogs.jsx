import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CreditCard, AlertCircle, FileText, Filter } from 'lucide-react';

const FinancialLogs = ({ user }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

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

      <div className="card" style={{ padding: '0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead style={{ background: '#f5f5f5', textAlign: 'left' }}>
                <tr>
                    <th style={{ padding: '12px' }}>Order</th>
                    <th style={{ padding: '12px' }}>Method</th>
                    <th style={{ padding: '12px' }}>Status</th>
                    <th style={{ padding: '12px' }}>Alerts</th>
                </tr>
            </thead>
            <tbody>
                {logs.map(log => (
                    <tr key={log.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px' }}>#ORD-{log.id}</td>
                        <td style={{ padding: '12px' }}>{log.payment_method?.toUpperCase()}</td>
                        <td style={{ padding: '12px' }}>
                            <span className={`badge badge-${log.status === 'delivered' ? 'cheap' : 'fair'}`}>
                                {log.status.toUpperCase()}
                            </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                            {log.payment_proof_image && <span style={{ color: 'var(--primary)', fontWeight: '600' }}>Proof Uploaded</span>}
                            {!log.payment_proof_image && log.payment_method === 'gcash' && <span style={{ color: 'var(--danger)' }}>Missing Proof</span>}
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
