import React, { useState } from 'react';
import api from '../services/api';
import '../index.css';

export default function Login({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const endpoint = isLogin ? '/api/auth/signin' : '/api/auth/signup';
    const payload = isLogin ? { email, password } : { name, email, password };

    try {
      const response = await api.post(endpoint, payload);
      onLogin(response.data.token);
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    }
  };

  return (
    <div className="login-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' }}>
      <div className="glass" style={{ padding: '3rem', borderRadius: '1rem', width: '100%', maxWidth: '400px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem', textAlign: 'center', color: 'white' }}>
          {isLogin ? 'Sign in to Family' : 'Join Family'}
        </h2>
        
        {error && <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#fee2e2', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!isLogin && (
            <input 
              type="text" 
              placeholder="Full Name" 
              value={name} 
              onChange={e => setName(e.target.value)}
              style={{ padding: '0.75rem', borderRadius: '0.5rem', border: 'none', backgroundColor: 'rgba(255,255,255,0.9)' }}
              required 
            />
          )}
          <input 
            type="email" 
            placeholder="Email Address" 
            value={email} 
            onChange={e => setEmail(e.target.value)}
            style={{ padding: '0.75rem', borderRadius: '0.5rem', border: 'none', backgroundColor: 'rgba(255,255,255,0.9)' }}
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={e => setPassword(e.target.value)}
            style={{ padding: '0.75rem', borderRadius: '0.5rem', border: 'none', backgroundColor: 'rgba(255,255,255,0.9)' }}
            required 
          />
          
          <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem', fontSize: '1.1rem', marginTop: '0.5rem', background: 'var(--text-dark)' }}>
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.8)' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button" 
            onClick={() => setIsLogin(!isLogin)} 
            style={{ background: 'none', border: 'none', color: 'white', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </p>

        <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '1.5rem' }}>
          <button 
            type="button" 
            onClick={async () => {
              setEmail('admin@family.com');
              setPassword('password123');
              const response = await api.post('/api/auth/signin', { email: 'admin@family.com', password: 'password123' });
              onLogin(response.data.token);
            }} 
            className="btn" 
            style={{ width: '100%', background: 'rgba(255,255,255,0.2)', color: 'white' }}
          >
            🚀 Use Demo Account
          </button>
        </div>
      </div>
    </div>
  );
}
