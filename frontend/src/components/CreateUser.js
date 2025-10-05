import React, { useState } from 'react';
import axios from 'axios';

function CreateUser() {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'user',
    phone: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/users', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess(`User created successfully! ${response.data.firstName} can now login with email: ${response.data.email}`);
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        role: 'user',
        phone: ''
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create user');
    }
  };

  return (
    <div className="card">
      <h3>Create New User</h3>

      {success && <div className="success">{success}</div>}
      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="e.g., seth@msdcafe.com"
            required
          />
        </div>

        <div className="form-group">
          <label>First Name</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            placeholder="e.g., Seth"
            required
          />
        </div>

        <div className="form-group">
          <label>Last Name</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            placeholder="e.g., Medina"
            required
          />
        </div>

        <div className="form-group">
          <label>Role</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="analyst">Analyst</option>
          </select>
        </div>

        <div className="form-group">
          <label>Phone (E164 format)</label>
          <input
            type="text"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="e.g., +15555551234"
            required
          />
        </div>

        <button type="submit">Create User</button>
      </form>
    </div>
  );
}

export default CreateUser;
