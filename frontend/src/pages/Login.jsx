import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LogIn, Lock, Mail } from 'lucide-react';
import { useToast } from '../components/Toast';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/login', { email, password });
      const user = response.data.user;
      if (user.status === 'pending') {
        showToast('Your account is still pending verification.', 'warning');
        return;
      }
      onLogin(user.role, user);
    } catch (error) {
      console.error('Login error:', error);
      if (error.response && error.response.status === 401) {
        showToast('Invalid credentials. Please try again.', 'error');
      } else {
        showToast('Server Error: ' + (error.response?.data?.message || error.message), 'error');
      }
    }
  };

  return (
    <div className="login-page" style={{ minHeight: '90vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '20px 0' }}>
      <header style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '8px' }}>AgriChain</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Butuan City Marketplace</p>
      </header>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ position: 'relative' }}>
          <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="email" 
            placeholder="Email Address" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '12px', border: '1px solid #ddd', outline: 'none', fontSize: '1rem' }}
          />
        </div>

        <div style={{ position: 'relative' }}>
          <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="password" 
            placeholder="Password" 
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '12px', border: '1px solid #ddd', outline: 'none', fontSize: '1rem' }}
          />
        </div>

        <button type="submit" className="btn btn-primary" style={{ padding: '16px', borderRadius: '12px', fontSize: '1.1rem' }}>
          <LogIn size={20} /> Sign In
        </button>

        <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Don't have an account? <span 
            onClick={() => navigate('/register')} 
            style={{ color: 'var(--primary)', fontWeight: '600', cursor: 'pointer' }}
          >
            Register
          </span>
        </p>
      </form>
    </div>
  );
};

export default Login;

