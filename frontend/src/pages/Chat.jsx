import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, User } from 'lucide-react';
import axios from 'axios';

const Chat = ({ user }) => {
  const { otherUserId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const scrollRef = useRef();

  useEffect(() => {
    if (!user?.id || !otherUserId) return;
    
    fetchOtherUser();
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [user?.id, otherUserId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchOtherUser = async () => {
    try {
      const res = await axios.get(`/api/user`); // This might need a specific user endpoint
      // For demo purposes, we'll assume we can get user info
      // Or we can just use the otherUserId
    } catch (err) {}
  };

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`/api/messages/${user.id}/${otherUserId}`);
      setMessages(res.data);
    } catch (err) {
      console.error('Chat error:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const res = await axios.post('/api/messages', {
        sender_id: user.id,
        receiver_id: otherUserId,
        message: newMessage
      });
      setMessages([...messages, res.data]);
      setNewMessage('');
    } catch (err) {
      console.error('Send message error:', err);
    }
  };

  return (
    <div className="chat-page" style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '0' }}>
      <header style={{ padding: '16px', background: '#fff', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <ArrowLeft onClick={() => navigate(-1)} style={{ cursor: 'pointer' }} />
        <div style={{ width: '32px', height: '32px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <User size={18} />
        </div>
        <h1 style={{ fontSize: '1rem', fontWeight: '700' }}>Chat Support</h1>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ 
            alignSelf: msg.sender_id === user.id ? 'flex-end' : 'flex-start',
            maxWidth: '75%',
            padding: '10px 14px',
            borderRadius: msg.sender_id === user.id ? '18px 18px 0 18px' : '18px 18px 18px 0',
            background: msg.sender_id === user.id ? 'var(--primary)' : '#f0f0f0',
            color: msg.sender_id === user.id ? '#fff' : 'var(--text-main)',
            fontSize: '0.9rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            {msg.message}
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={handleSendMessage} style={{ padding: '16px', background: '#fff', borderTop: '1px solid #eee', display: 'flex', gap: '8px' }}>
        <input 
          type="text" 
          placeholder="Type a message..." 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          style={{ flex: 1, padding: '12px 16px', borderRadius: '24px', border: '1px solid #ddd', outline: 'none' }}
        />
        <button type="submit" className="btn btn-primary" style={{ width: '48px', height: '48px', borderRadius: '50%', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default Chat;
