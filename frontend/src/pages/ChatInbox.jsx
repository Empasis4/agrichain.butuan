import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, User, ChevronRight, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ChatInbox = ({ user }) => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user?.id) return;
    fetchInbox();
    const interval = setInterval(fetchInbox, 10000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const fetchInbox = async () => {
    try {
      const res = await axios.get(`/api/messages/inbox/${user.id}`);
      setConversations(Array.isArray(res.data) ? res.data : []);
      setLoading(false);
    } catch (err) {
      console.error('Inbox fetch error:', err);
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const timeAgo = (dateStr) => {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h`;
    return `${Math.floor(diff / 1440)}d`;
  };

  return (
    <div className="chat-inbox-page page-transition">
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--text-main)' }}>Messages</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage your ongoing conversations</p>
      </header>

      <div style={{ position: 'relative', marginBottom: '24px' }}>
        <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
        <input 
          type="text" 
          placeholder="Search conversations..." 
          className="input"
          style={{ paddingLeft: '48px', borderRadius: '16px' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
              <div className="spin" style={{ width: '32px', height: '32px', border: '3px solid var(--primary-light)', borderTopColor: 'var(--primary)', borderRadius: '50%', margin: '0 auto' }}></div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px 20px', background: '#fdfdfd', border: '2px dashed #eee', borderRadius: '24px' }}>
            <MessageSquare size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#999' }}>No Messages Yet</h3>
            <p style={{ fontSize: '0.85rem', color: '#aaa', marginTop: '8px' }}>Start a conversation from your orders or the marketplace.</p>
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <div 
              key={conv.id} 
              onClick={() => navigate(`/chat/${conv.id}`)}
              className="card" 
              style={{ 
                display: 'flex', gap: '16px', alignItems: 'center', padding: '16px', borderRadius: '18px',
                cursor: 'pointer', transition: 'all 0.2s ease', border: '1px solid #f5f5f5'
              }}
              onMouseOver={e => e.currentTarget.style.background = '#f9f9f9'}
              onMouseOut={e => e.currentTarget.style.background = '#fff'}
            >
              <div style={{
                width: '52px', height: '52px', borderRadius: '16px',
                background: conv.role === 'rider' ? 'var(--accent-light)' : 'var(--primary-light)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
              }}>
                <User size={24} color={conv.role === 'rider' ? 'var(--accent)' : 'var(--primary)'} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>{conv.name}</h3>
                  <span style={{ fontSize: '0.7rem', color: '#aaa' }}>{timeAgo(conv.last_message_time)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80%' }}>
                        {conv.last_message}
                    </p>
                    <span style={{ fontSize: '0.65rem', background: '#eee', color: '#666', padding: '2px 8px', borderRadius: '10px', textTransform: 'capitalize' }}>
                        {conv.role}
                    </span>
                </div>
              </div>
              <ChevronRight size={18} color="#ccc" />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatInbox;
