import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import OwnerDashboard from './pages/OwnerDashboard'
import UserDashboard from './pages/UserDashboard'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={
            <ProtectedRoute requiredType="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardRouter />
            </ProtectedRoute>
          } />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

// Route to appropriate dashboard based on user role
function DashboardRouter() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  
  if (user.role === 'owner') {
    return <OwnerDashboard />
  } else if (user.role === 'admin') {
    return <UserDashboard />
  } else {
    return <UserDashboard />
  }
}

export default App