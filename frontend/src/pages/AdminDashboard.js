import React, { useState } from 'react';
import axios from 'axios';

function AdminDashboard({ onLogout }) {
  const [formData, setFormData] = useState({
    businessName: '',
    ownerEmail: '',
    ownerFirstName: '',
    ownerLastName: '',
    ownerPhone: ''
  });
  const [fundData, setFundData] = useState({
    accountId: '',
    amount: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/accounts', {
        businessName: formData.businessName,
        ownerEmail: formData.ownerEmail,
        ownerFirstName: formData.ownerFirstName,
        ownerLastName: formData.ownerLastName,
        ownerPhone: formData.ownerPhone
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess(`Account created successfully! Account ID: ${response.data.account.id}. Owner can now login with email: ${response.data.owner.email}`);
      setFormData({
        businessName: '',
        ownerEmail: '',
        ownerFirstName: '',
        ownerLastName: '',
        ownerPhone: ''
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create account');
    }
  };

  const handleFundAccount = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`/api/accounts/${fundData.accountId}/fund`, {
        amount: fundData.amount
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess(`Account funded successfully! New balance: $${response.data.newBalance}`);
      setFundData({ accountId: '', amount: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fund account');
    }
  };

  return (
    <div className="layout">
      <div className="sidebar">
        <h2>Admin CRM</h2>
        <nav>
          <button className="active">Create Account</button>
          <button onClick={onLogout}>Logout</button>
        </nav>
      </div>

      <div className="main-content">
        <div className="header">
          <h1>Account Management</h1>
          <div className="user-info">
            <span>Admin User</span>
          </div>
        </div>

        {success && <div className="success">{success}</div>}
        {error && <div className="error">{error}</div>}

        <div className="card">
          <h3>Create New Account</h3>
          <form onSubmit={handleCreateAccount}>
            <div className="form-group">
              <label>Business Name</label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="e.g., MSD Cafe"
                required
              />
            </div>

            <div className="form-group">
              <label>Owner Email</label>
              <input
                type="email"
                value={formData.ownerEmail}
                onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                placeholder="e.g., eric@msdcafe.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Owner First Name</label>
              <input
                type="text"
                value={formData.ownerFirstName}
                onChange={(e) => setFormData({ ...formData, ownerFirstName: e.target.value })}
                placeholder="e.g., Eric"
                required
              />
            </div>

            <div className="form-group">
              <label>Owner Last Name</label>
              <input
                type="text"
                value={formData.ownerLastName}
                onChange={(e) => setFormData({ ...formData, ownerLastName: e.target.value })}
                placeholder="e.g., Medina"
                required
              />
            </div>

            <div className="form-group">
              <label>Owner Phone (E164 format)</label>
              <input
                type="text"
                value={formData.ownerPhone}
                onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                placeholder="e.g., +15555551234"
                required
              />
            </div>

            <button type="submit">Create Account</button>
          </form>
        </div>

        <div className="card">
          <h3>Fund Account</h3>
          <form onSubmit={handleFundAccount}>
            <div className="form-group">
              <label>Account ID</label>
              <input
                type="number"
                value={fundData.accountId}
                onChange={(e) => setFundData({ ...fundData, accountId: e.target.value })}
                placeholder="e.g., 1"
                required
              />
            </div>

            <div className="form-group">
              <label>Amount</label>
              <input
                type="number"
                step="0.01"
                value={fundData.amount}
                onChange={(e) => setFundData({ ...fundData, amount: e.target.value })}
                placeholder="e.g., 15000"
                required
              />
            </div>

            <button type="submit">Fund Account</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
