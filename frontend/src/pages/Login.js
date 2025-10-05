import React, { useState } from 'react';
import { auth } from '../services/api';
import './Login.css';

function Login({ onLogin }) {
  const [loginType, setLoginType] = useState('admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await auth.adminLogin(username, password);
      onLogin(response.data.token, response.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUserLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await auth.userLogin(email);
      onLogin(response.data.token, response.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Lithic POC</h1>
        
        <div className="login-tabs">
          <button 
            className={loginType === 'admin' ? 'active' : ''}
            onClick={() => setLoginType('admin')}
          >
            Admin Login
          </button>
          <button 
            className={loginType === 'user' ? 'active' : ''}
            onClick={() => setLoginType('user')}
          >
            User Login
          </button>
        </div>

        {loginType === 'admin' ? (
          <form onSubmit={handleAdminLogin}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="admin@123"
                required
              />
            </div>
            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Login as Admin'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleUserLogin}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>
            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
            <p className="login-note">No password required for POC</p>
          </form>
        )}

        {error && <div className="error">{error}</div>}
      </div>
    </div>
  );
}

export default Login;
