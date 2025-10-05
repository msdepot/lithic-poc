import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import CreateUser from '../components/CreateUser';
import CreateCard from '../components/CreateCard';
import CreateSpendingProfile from '../components/CreateSpendingProfile';
import UserList from '../components/UserList';
import CardList from '../components/CardList';

function UserDashboard({ auth, onLogout }) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState('home');

  const handleNavigation = (page, path) => {
    setCurrentPage(page);
    navigate(path);
  };

  return (
    <div className="layout">
      <div className="sidebar">
        <h2>{auth.user?.businessName}</h2>
        <nav>
          <button
            className={currentPage === 'home' ? 'active' : ''}
            onClick={() => handleNavigation('home', '/dashboard')}
          >
            Home
          </button>
          {['owner', 'admin'].includes(auth.user?.role) && (
            <button
              className={currentPage === 'create-user' ? 'active' : ''}
              onClick={() => handleNavigation('create-user', '/dashboard/create-user')}
            >
              Create User
            </button>
          )}
          <button
            className={currentPage === 'create-card' ? 'active' : ''}
            onClick={() => handleNavigation('create-card', '/dashboard/create-card')}
          >
            Create Card
          </button>
          <button
            className={currentPage === 'create-profile' ? 'active' : ''}
            onClick={() => handleNavigation('create-profile', '/dashboard/create-profile')}
          >
            Create Spending Profile
          </button>
          <button
            className={currentPage === 'users' ? 'active' : ''}
            onClick={() => handleNavigation('users', '/dashboard/users')}
          >
            User List
          </button>
          <button
            className={currentPage === 'cards' ? 'active' : ''}
            onClick={() => handleNavigation('cards', '/dashboard/cards')}
          >
            Card List
          </button>
          <button onClick={onLogout}>Logout</button>
        </nav>
      </div>

      <div className="main-content">
        <div className="header">
          <h1>Dashboard</h1>
          <div className="user-info">
            <span>{auth.user?.firstName} {auth.user?.lastName}</span>
            <span className="badge active">{auth.user?.role}</span>
          </div>
        </div>

        <Routes>
          <Route path="/" element={
            <div className="card">
              <h3>Welcome to Lithic POC</h3>
              <p style={{ color: '#666', marginTop: '10px' }}>
                Use the navigation menu to manage users, create cards, and configure spending profiles.
              </p>
            </div>
          } />
          <Route path="/create-user" element={<CreateUser />} />
          <Route path="/create-card" element={<CreateCard />} />
          <Route path="/create-profile" element={<CreateSpendingProfile />} />
          <Route path="/users" element={<UserList />} />
          <Route path="/cards" element={<CardList />} />
        </Routes>
      </div>
    </div>
  );
}

export default UserDashboard;
