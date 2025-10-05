import React, { useState } from 'react';
import axios from 'axios';

function Login({ onLogin }) {
  const [loginType, setLoginType] = useState('user'); // 'admin' or 'user'
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const endpoint = loginType === 'admin' ? '/api/auth/admin/login' : '/api/auth/login';
      const payload = loginType === 'admin'
        ? { username: formData.username, password: formData.password }
        : { email: formData.email };

      const response = await axios.post(endpoint, payload);

      onLogin(response.data.token, response.data.type, response.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Lithic POC</h2>

        <div className="login-tabs">
          <button
            className={loginType === 'user' ? 'active' : ''}
            onClick={() => setLoginType('user')}
          >
            User Login
          </button>
          <button
            className={loginType === 'admin' ? 'active' : ''}
            onClick={() => setLoginType('admin')}
          >
            Admin CRM
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {loginType === 'admin' ? (
            <>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
            </>
          ) : (
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email"
                required
              />
            </div>
          )}

          {error && <div className="error">{error}</div>}

          <button type="submit" style={{ width: '100%', marginTop: '20px' }}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
