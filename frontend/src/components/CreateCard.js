import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CreateCard() {
  const [users, setUsers] = useState([]);
  const [spendingProfiles, setSpendingProfiles] = useState([]);
  const [formData, setFormData] = useState({
    userId: '',
    cardType: 'debit',
    spendingProfileId: '',
    spendLimit: '',
    spendLimitDuration: 'MONTHLY'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadUsers();
    loadSpendingProfiles();
  }, []);

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const loadSpendingProfiles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/spending-profiles', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSpendingProfiles(response.data);
    } catch (err) {
      console.error('Failed to load spending profiles:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const payload = {
        userId: parseInt(formData.userId),
        cardType: formData.cardType
      };

      if (formData.spendingProfileId) {
        payload.spendingProfileId = parseInt(formData.spendingProfileId);
      }

      if (formData.spendLimit) {
        payload.spendLimit = parseFloat(formData.spendLimit);
        payload.spendLimitDuration = formData.spendLimitDuration;
      }

      const response = await axios.post('/api/cards', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess(`Card created successfully! Last 4 digits: ${response.data.lastFour}`);
      setFormData({
        userId: '',
        cardType: 'debit',
        spendingProfileId: '',
        spendLimit: '',
        spendLimitDuration: 'MONTHLY'
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create card');
    }
  };

  return (
    <div className="card">
      <h3>Create New Card</h3>

      {success && <div className="success">{success}</div>}
      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>User</label>
          <select
            value={formData.userId}
            onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
            required
          >
            <option value="">Select a user</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.firstName} {user.lastName} ({user.email})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Card Type</label>
          <select
            value={formData.cardType}
            onChange={(e) => setFormData({ ...formData, cardType: e.target.value })}
          >
            <option value="debit">Debit Card</option>
            <option value="reloadable">Reloadable Card</option>
          </select>
        </div>

        <div className="form-group">
          <label>Spending Profile (Optional)</label>
          <select
            value={formData.spendingProfileId}
            onChange={(e) => setFormData({ ...formData, spendingProfileId: e.target.value })}
          >
            <option value="">None</option>
            {spendingProfiles.map(profile => (
              <option key={profile.id} value={profile.id}>
                {profile.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Spend Limit (Optional)</label>
          <input
            type="number"
            step="0.01"
            value={formData.spendLimit}
            onChange={(e) => setFormData({ ...formData, spendLimit: e.target.value })}
            placeholder="e.g., 1000"
          />
        </div>

        <div className="form-group">
          <label>Spend Limit Duration</label>
          <select
            value={formData.spendLimitDuration}
            onChange={(e) => setFormData({ ...formData, spendLimitDuration: e.target.value })}
          >
            <option value="MONTHLY">Monthly</option>
            <option value="DAILY">Daily</option>
            <option value="TRANSACTION">Per Transaction</option>
          </select>
        </div>

        <button type="submit">Create Card</button>
      </form>
    </div>
  );
}

export default CreateCard;
