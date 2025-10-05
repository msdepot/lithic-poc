import React, { useState, useEffect } from 'react';
import { users, cards, spendingProfiles } from '../services/api';

function UserDashboard({ user, onLogout }) {
  const [view, setView] = useState('overview');
  const [usersList, setUsersList] = useState([]);
  const [cardsList, setCardsList] = useState([]);
  const [profilesList, setProfilesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('user');

  const [selectedUser, setSelectedUser] = useState('');
  const [cardType, setCardType] = useState('debit');
  const [selectedProfile, setSelectedProfile] = useState('');

  const [profileName, setProfileName] = useState('');
  const [dailyLimit, setDailyLimit] = useState('');
  const [monthlyLimit, setMonthlyLimit] = useState('');

  useEffect(() => {
    if (view === 'users' || view === 'create-card') {
      loadUsers();
    }
    if (view === 'cards') {
      loadCards();
    }
    if (view === 'create-card' || view === 'spending-profiles') {
      loadProfiles();
    }
  }, [view]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await users.list();
      setUsersList(response.data.users);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadCards = async () => {
    setLoading(true);
    try {
      const response = await cards.list();
      setCardsList(response.data.cards);
    } catch (err) {
      setError('Failed to load cards');
    } finally {
      setLoading(false);
    }
  };

  const loadProfiles = async () => {
    setLoading(true);
    try {
      const response = await spendingProfiles.list();
      setProfilesList(response.data.profiles);
    } catch (err) {
      setError('Failed to load spending profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await users.create({
        name: userName,
        email: userEmail,
        role: userRole
      });

      setSuccess(`User "${userName}" created successfully!`);
      setUserName('');
      setUserEmail('');
      setUserRole('user');
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCard = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await cards.create({
        userId: selectedUser,
        cardType: cardType,
        spendingProfileId: selectedProfile || null
      });

      const userObj = usersList.find(u => u.id === selectedUser);
      setSuccess(`${cardType} card created successfully for ${userObj?.name}!`);
      setSelectedUser('');
      setCardType('debit');
      setSelectedProfile('');
      loadCards();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create card');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await spendingProfiles.create({
        name: profileName,
        dailyLimit: parseFloat(dailyLimit) || null,
        monthlyLimit: parseFloat(monthlyLimit) || null,
        allowedCategories: [],
        blockedCategories: []
      });

      setSuccess(`Spending profile "${profileName}" created successfully!`);
      setProfileName('');
      setDailyLimit('');
      setMonthlyLimit('');
      loadProfiles();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create spending profile');
    } finally {
      setLoading(false);
    }
  };

  const canCreateUsers = ['owner', 'admin'].includes(user.role);
  const canCreateCards = ['owner', 'admin'].includes(user.role);
  const canCreateProfiles = ['owner', 'admin'].includes(user.role);

  return (
    <div className="dashboard">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>{user.accountName}</h2>
          <p>{user.name}</p>
          <span className={`badge ${user.role}`}>{user.role}</span>
        </div>
        
        <div className="sidebar-menu">
          <button 
            className={`menu-item ${view === 'overview' ? 'active' : ''}`}
            onClick={() => setView('overview')}
          >
            Overview
          </button>

          {canCreateUsers && (
            <button 
              className={`menu-item ${view === 'create-user' ? 'active' : ''}`}
              onClick={() => setView('create-user')}
            >
              Create User
            </button>
          )}

          <button 
            className={`menu-item ${view === 'users' ? 'active' : ''}`}
            onClick={() => setView('users')}
          >
            View Users
          </button>

          {canCreateCards && (
            <button 
              className={`menu-item ${view === 'create-card' ? 'active' : ''}`}
              onClick={() => setView('create-card')}
            >
              Create Card
            </button>
          )}

          <button 
            className={`menu-item ${view === 'cards' ? 'active' : ''}`}
            onClick={() => setView('cards')}
          >
            View Cards
          </button>

          {canCreateProfiles && (
            <>
              <button 
                className={`menu-item ${view === 'create-profile' ? 'active' : ''}`}
                onClick={() => setView('create-profile')}
              >
                Create Spending Profile
              </button>
              <button 
                className={`menu-item ${view === 'spending-profiles' ? 'active' : ''}`}
                onClick={() => setView('spending-profiles')}
              >
                View Spending Profiles
              </button>
            </>
          )}
        </div>

        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>

      <div className="main-content">
        <div className="content-header">
          <h1>
            {view === 'overview' && 'Dashboard Overview'}
            {view === 'create-user' && 'Create New User'}
            {view === 'users' && 'Users'}
            {view === 'create-card' && 'Create New Card'}
            {view === 'cards' && 'Cards'}
            {view === 'create-profile' && 'Create Spending Profile'}
            {view === 'spending-profiles' && 'Spending Profiles'}
          </h1>
          <p>
            {view === 'overview' && 'Welcome to your dashboard'}
            {view === 'create-user' && 'Add new users to your account'}
            {view === 'users' && 'Manage all users in your account'}
            {view === 'create-card' && 'Issue new cards to users'}
            {view === 'cards' && 'View all issued cards'}
            {view === 'create-profile' && 'Define custom spending limits'}
            {view === 'spending-profiles' && 'View all spending profiles'}
          </p>
        </div>

        <div className="content-body">
          {view === 'overview' && (
            <div className="card">
              <h3>Welcome, {user.name}!</h3>
              <p>Account: {user.accountName}</p>
              <p>Role: <span className={`badge ${user.role}`}>{user.role}</span></p>
              <p style={{ marginTop: '20px', color: '#666' }}>
                Use the left menu to navigate through different sections.
              </p>
            </div>
          )}

          {view === 'create-user' && canCreateUsers && (
            <div className="card">
              <h3>Create New User</h3>
              <form onSubmit={handleCreateUser}>
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g., Seth Medina"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="e.g., seth@msdcafe.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Role *</label>
                  <select value={userRole} onChange={(e) => setUserRole(e.target.value)} required>
                    {user.role === 'owner' && <option value="admin">Admin</option>}
                    <option value="user">User</option>
                    <option value="analyst">Analyst</option>
                  </select>
                </div>

                <button type="submit" className="btn" disabled={loading}>
                  {loading ? 'Creating...' : 'Create User'}
                </button>

                {error && <div className="error">{error}</div>}
                {success && <div className="success">{success}</div>}
              </form>
            </div>
          )}

          {view === 'users' && (
            <div className="card">
              <h3>All Users</h3>
              {loading ? (
                <p>Loading...</p>
              ) : usersList.length === 0 ? (
                <div className="empty-state">No users found</div>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((u) => (
                      <tr key={u.id}>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td><span className={`badge ${u.role}`}>{u.role}</span></td>
                        <td>{new Date(u.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {view === 'create-card' && canCreateCards && (
            <div className="card">
              <h3>Create New Card</h3>
              <form onSubmit={handleCreateCard}>
                <div className="form-group">
                  <label>User *</label>
                  <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} required>
                    <option value="">Select a user...</option>
                    {usersList.filter(u => u.role !== 'analyst').map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} - {u.email} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Card Type *</label>
                  <select value={cardType} onChange={(e) => setCardType(e.target.value)} required>
                    <option value="debit">Debit Card</option>
                    <option value="reloadable">Reloadable Card</option>
                    <option value="limit_based">Limit-Based Card</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Spending Profile (Optional)</label>
                  <select value={selectedProfile} onChange={(e) => setSelectedProfile(e.target.value)}>
                    <option value="">No spending profile</option>
                    {profilesList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} - ${p.daily_limit}/day
                      </option>
                    ))}
                  </select>
                </div>

                <button type="submit" className="btn" disabled={loading || !selectedUser}>
                  {loading ? 'Creating...' : 'Create Card'}
                </button>

                {error && <div className="error">{error}</div>}
                {success && <div className="success">{success}</div>}
              </form>
            </div>
          )}

          {view === 'cards' && (
            <div className="card">
              <h3>All Cards</h3>
              {loading ? (
                <p>Loading...</p>
              ) : cardsList.length === 0 ? (
                <div className="empty-state">No cards issued yet</div>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Card Type</th>
                      <th>Last 4</th>
                      <th>Status</th>
                      <th>Spending Profile</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cardsList.map((card) => (
                      <tr key={card.id}>
                        <td>{card.user.name}</td>
                        <td>{card.cardType}</td>
                        <td>{card.lastFour || 'N/A'}</td>
                        <td><span className={`badge ${card.status === 'ACTIVE' ? 'active' : ''}`}>{card.status}</span></td>
                        <td>{card.spendingProfile ? card.spendingProfile.name : 'None'}</td>
                        <td>{new Date(card.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {view === 'create-profile' && canCreateProfiles && (
            <div className="card">
              <h3>Create Spending Profile</h3>
              <form onSubmit={handleCreateProfile}>
                <div className="form-group">
                  <label>Profile Name *</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="e.g., Basic Spending Limits"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Daily Limit</label>
                  <input
                    type="number"
                    value={dailyLimit}
                    onChange={(e) => setDailyLimit(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>Monthly Limit</label>
                  <input
                    type="number"
                    value={monthlyLimit}
                    onChange={(e) => setMonthlyLimit(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>

                <button type="submit" className="btn" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Profile'}
                </button>

                {error && <div className="error">{error}</div>}
                {success && <div className="success">{success}</div>}
              </form>
            </div>
          )}

          {view === 'spending-profiles' && (
            <div className="card">
              <h3>Spending Profiles</h3>
              {loading ? (
                <p>Loading...</p>
              ) : profilesList.length === 0 ? (
                <div className="empty-state">No spending profiles created yet</div>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Daily Limit</th>
                      <th>Monthly Limit</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profilesList.map((profile) => (
                      <tr key={profile.id}>
                        <td>{profile.name}</td>
                        <td>${profile.daily_limit ? parseFloat(profile.daily_limit).toFixed(2) : 'N/A'}</td>
                        <td>${profile.monthly_limit ? parseFloat(profile.monthly_limit).toFixed(2) : 'N/A'}</td>
                        <td>{new Date(profile.created_at).toLocaleDateString()}</td>
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

export default UserDashboard;
