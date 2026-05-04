import React, { useState, useEffect } from 'react';
import { Check, X, Search, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import { useToast } from '../../components/Toast';

const TransactionVerification = () => {
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingTransactions();
    const interval = setInterval(fetchPendingTransactions, 8000);
    return () => clearInterval(interval);
  }, []);

  const fetchPendingTransactions = async () => {
    try {
      const res = await axios.get('/api/orders?status=pending');
      setPendingTransactions(res.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const { showToast } = useToast();

  const handleVerify = async (id) => {
    try {
      await axios.post(`/api/orders/${id}/verify-payment`);
      setPendingTransactions(prev => prev.filter(t => t.id !== id));
      showToast('Payment Verified Successfully!', 'success');
      if (selectedTxn) setSelectedTxn(null);
    } catch (error) {
      console.error('Verification error:', error);
      showToast('Error verifying payment. Please try again.', 'error');
    }
  };

  const [selectedTxn, setSelectedTxn] = useState(null);

  return (
    <div className="admin-verification">
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800' }}>
          <ShieldCheck color="var(--primary)" /> Financial Hub
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Validate incoming GCash receipts.</p>
      </header>

      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
        <input 
          type="text" 
          placeholder="Search Reference #..." 
          className="input"
          style={{ paddingLeft: '48px' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Syncing with database...</div>
        ) : pendingTransactions.map((txn) => (
          <div key={txn.id} className="card" onClick={() => setSelectedTxn(txn)} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Ref: {txn.id}002</h3>
                <p style={{ fontWeight: '800', fontSize: '1.2rem' }}>₱{parseFloat(txn.total_price).toLocaleString()}</p>
              </div>
              <span className="badge badge-warning" style={{ background: '#FFF9C4', color: '#FBC02D' }}>{txn.payment_method.toUpperCase()}</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
              From: <span style={{ fontWeight: '700' }}>{txn.retailer?.name || 'Unknown Retailer'}</span>
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Click to view receipt</p>
          </div>
        ))}

        {!loading && pendingTransactions.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <ShieldCheck size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
            <p>All payments verified! 🚀</p>
          </div>
        )}
      </div>

      {/* GCash Receipt Modal */}
      {selectedTxn && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="card page-transition" style={{ width: '100%', maxWidth: '340px', background: '#0055D4', padding: '0', overflow: 'hidden', borderRadius: '24px' }}>
            <div style={{ padding: '24px', textAlign: 'center', color: '#fff' }}>
              <div style={{ width: '60px', height: '60px', background: '#fff', borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check color="#0055D4" size={32} />
              </div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Payment Sent</h2>
              <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>{new Date(selectedTxn.created_at).toLocaleString()}</p>
            </div>
            <div style={{ background: '#fff', borderRadius: '24px 24px 0 0', padding: '24px' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Amount</p>
                <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>₱{parseFloat(selectedTxn.total_price).toLocaleString()}</h1>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px dashed #ddd', paddingTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>To</span>
                  <span style={{ fontWeight: '700' }}>AgriChain Butuan</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>From</span>
                  <span style={{ fontWeight: '700' }}>{selectedTxn.retailer?.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Ref No.</span>
                  <span style={{ fontWeight: '700', color: '#0055D4' }}>{selectedTxn.id}002345</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                <button 
                  onClick={() => {
                    const text = `AgriChain Receipt\nRef: ${selectedTxn.id}002345\nAmount: ₱${parseFloat(selectedTxn.total_price).toLocaleString()}\nFrom: ${selectedTxn.retailer?.name}`;
                    if (navigator.share) {
                      navigator.share({ title: 'AgriChain Receipt', text: text });
                    } else {
                      navigator.clipboard.writeText(text);
                      alert('Receipt details copied to clipboard!');
                    }
                  }} 
                  className="btn" style={{ flex: 1, background: '#E3F2FD', color: '#0055D4' }}
                >
                  Share
                </button>
                <button onClick={() => { handleVerify(selectedTxn.id); setSelectedTxn(null); }} className="btn btn-primary" style={{ flex: 2 }}>Approve Payment</button>
              </div>
              <button onClick={() => setSelectedTxn(null)} style={{ width: '100%', marginTop: '12px', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionVerification;

