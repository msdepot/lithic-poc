import React, { useState } from 'react';
import axios from 'axios';

function CreateSpendingProfile() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    spendLimit: '',
    spendLimitDuration: 'MONTHLY',
    allowedCategories: '',
    blockedCategories: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const payload = {
        name: formData.name,
        description: formData.description
      };

      if (formData.spendLimit) {
        payload.spendLimit = parseFloat(formData.spendLimit);
        payload.spendLimitDuration = formData.spendLimitDuration;
      }

      if (formData.allowedCategories) {
        payload.allowedCategories = formData.allowedCategories.split(',').map(c => c.trim());
      }

      if (formData.blockedCategories) {
        payload.blockedCategories = formData.blockedCategories.split(',').map(c => c.trim());
      }

      const response = await axios.post('/api/spending-profiles', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess(`Spending profile "${response.data.name}" created successfully!`);
      setFormData({
        name: '',
        description: '',
        spendLimit: '',
        spendLimitDuration: 'MONTHLY',
        allowedCategories: '',
        blockedCategories: ''
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create spending profile');
    }
  };

  return (
    <div className="card">
      <h3>Create Spending Profile</h3>

      {success && <div className="success">{success}</div>}
      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Profile Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Basic User Profile"
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the spending restrictions..."
          />
        </div>

        <div className="form-group">
          <label>Spend Limit (Optional)</label>
          <input
            type="number"
            step="0.01"
            value={formData.spendLimit}
            onChange={(e) => setFormData({ ...formData, spendLimit: e.target.value })}
            placeholder="e.g., 500"
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

        <div className="form-group">
          <label>Allowed Categories (comma-separated MCCs)</label>
          <input
            type="text"
            value={formData.allowedCategories}
            onChange={(e) => setFormData({ ...formData, allowedCategories: e.target.value })}
            placeholder="e.g., 5411, 5812, 5814 (grocery, restaurants)"
          />
        </div>

        <div className="form-group">
          <label>Blocked Categories (comma-separated MCCs)</label>
          <input
            type="text"
            value={formData.blockedCategories}
            onChange={(e) => setFormData({ ...formData, blockedCategories: e.target.value })}
            placeholder="e.g., 7995, 7011 (gambling, hotels)"
          />
        </div>

        <button type="submit">Create Spending Profile</button>
      </form>
    </div>
  );
}

export default CreateSpendingProfile;
