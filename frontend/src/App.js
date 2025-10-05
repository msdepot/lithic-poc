import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import { auth } from './services/api';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    setLoading(false);
  }, []);

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            !user ? 
            <Login onLogin={handleLogin} /> : 
            user.type === 'admin' ? 
            <Navigate to="/admin" /> : 
            <Navigate to="/dashboard" />
          } 
        />
        <Route 
          path="/admin" 
          element={
            user && user.type === 'admin' ? 
            <AdminDashboard user={user} onLogout={handleLogout} /> : 
            <Navigate to="/" />
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            user && user.type !== 'admin' ? 
            <UserDashboard user={user} onLogout={handleLogout} /> : 
            <Navigate to="/" />
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
