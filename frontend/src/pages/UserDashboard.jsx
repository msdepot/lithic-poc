import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import DashboardLayout from '../components/DashboardLayout'
import UsersView from '../components/views/UsersView'
import CardsView from '../components/views/CardsView'
import ProfilesView from '../components/views/ProfilesView'
import MyCardsView from '../components/views/MyCardsView'

function UserDashboard() {
  const [activeView, setActiveView] = useState('my-cards')
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Different menu items based on role
  const getMenuItems = () => {
    if (user?.role === 'admin') {
      return [
        { id: 'users', label: 'Users', icon: '👥' },
        { id: 'cards', label: 'All Cards', icon: '💳' },
        { id: 'my-cards', label: 'My Cards', icon: '🎫' },
        { id: 'profiles', label: 'Spending Profiles', icon: '📊' },
      ]
    } else {
      // Regular users only see their cards
      return [
        { id: 'my-cards', label: 'My Cards', icon: '🎫' },
      ]
    }
  }

  const renderView = () => {
    switch (activeView) {
      case 'users':
        return user?.role === 'admin' ? <UsersView /> : <MyCardsView />
      case 'cards':
        return user?.role === 'admin' ? <CardsView /> : <MyCardsView />
      case 'profiles':
        return user?.role === 'admin' ? <ProfilesView /> : <MyCardsView />
      case 'my-cards':
      default:
        return <MyCardsView />
    }
  }

  return (
    <DashboardLayout
      user={user}
      menuItems={getMenuItems()}
      activeView={activeView}
      onMenuClick={setActiveView}
      onLogout={handleLogout}
    >
      {renderView()}
    </DashboardLayout>
  )
}

export default UserDashboard