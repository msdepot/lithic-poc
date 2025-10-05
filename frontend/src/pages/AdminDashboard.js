import React, { useState, useEffect } from 'react';
import { accounts } from '../services/api';

function AdminDashboard({ user, onLogout }) {
  const [view, setView] = useState('create-account');
  const [accountsList, setAccountsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [accountName, setAccountName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [initialBalance, setInitialBalance] = useState('');

  useEffect(() => {
    if (view === 'accounts') {
      loadAccounts();
    }
  }, [view]);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const response = await accounts.list();
      setAccountsList(response.data.accounts);
    } catch (err) {
      setError('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await accounts.create({
        accountName,
        ownerName,
        ownerEmail,
        initialBalance: parseFloat(initialBalance) || 0
      });

      setSuccess(`Account "${accountName}" created successfully! Owner can now login with: ${ownerEmail}`);
      setAccountName('');
      setOwnerName('');
      setOwnerEmail('');
      setInitialBalance('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Admin CRM</h2>
          <p>{user.username}</p>
        </div>
        
        <div className="sidebar-menu">
          <button 
            className={`menu-item ${view === 'create-account' ? 'active' : ''}`}
            onClick={() => setView('create-account')}
          >
            Create Account
          </button>
          <button 
            className={`menu-item ${view === 'accounts' ? 'active' : ''}`}
            onClick={() => setView('accounts')}
          >
            View Accounts
          </button>
        </div>

        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>

      <div className="main-content">
        <div className="content-header">
          <h1>{view === 'create-account' ? 'Create New Account' : 'All Accounts'}</h1>
          <p>{view === 'create-account' ? 'Onboard new business accounts' : 'Manage existing accounts'}</p>
        </div>

        <div className="content-body">
          {view === 'create-account' && (
            <div className="card">
              <h3>Account Information</h3>
              <form onSubmit={handleCreateAccount}>
                <div className="form-group">
                  <label>Business Name *</label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="e.g., MSD Cafe"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Owner Name *</label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="e.g., Eric Medina"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Owner Email *</label>
                  <input
                    type="email"
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    placeholder="e.g., eric@msdcafe.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Initial Balance (Optional)</label>
                  <input
                    type="number"
                    value={initialBalance}
                    onChange={(e) => setInitialBalance(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>

                <button type="submit" className="btn" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Account & Lithic Integration'}
                </button>

                {error && <div className="error">{error}</div>}
                {success && <div className="success">{success}</div>}
              </form>
            </div>
          )}

          {view === 'accounts' && (
            <div className="card">
              <h3>All Accounts</h3>
              {loading ? (
                <p>Loading...</p>
              ) : accountsList.length === 0 ? (
                <div className="empty-state">No accounts created yet</div>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Business Name</th>
                      <th>Owner Email</th>
                      <th>Balance</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accountsList.map((account) => (
                      <tr key={account.id}>
                        <td>{account.name}</td>
                        <td>{account.owner_email}</td>
                        <td>${parseFloat(account.balance).toFixed(2)}</td>
                        <td>{new Date(account.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
