import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import './App.css';

function App() {
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    const userData = localStorage.getItem('userData');

    if (token && userType) {
      setAuth({
        token,
        userType,
        user: userData ? JSON.parse(userData) : null
      });
    }
  }, []);

  const handleLogin = (token, userType, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userType', userType);
    if (user) {
      localStorage.setItem('userData', JSON.stringify(user));
    }
    setAuth({ token, userType, user });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('userData');
    setAuth(null);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            auth ? (
              <Navigate to={auth.userType === 'admin' ? '/admin' : '/dashboard'} />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/admin"
          element={
            auth && auth.userType === 'admin' ? (
              <AdminDashboard onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/dashboard/*"
          element={
            auth && auth.userType === 'user' ? (
              <UserDashboard auth={auth} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
