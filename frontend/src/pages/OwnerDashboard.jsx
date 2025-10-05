import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import DashboardLayout from '../components/DashboardLayout'
import UsersView from '../components/views/UsersView'
import CardsView from '../components/views/CardsView'
import ProfilesView from '../components/views/ProfilesView'
import MyCardsView from '../components/views/MyCardsView'

function OwnerDashboard() {
  const [activeView, setActiveView] = useState('users')
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const menuItems = [
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'cards', label: 'All Cards', icon: '💳' },
    { id: 'my-cards', label: 'My Cards', icon: '🎫' },
    { id: 'profiles', label: 'Spending Profiles', icon: '📊' },
  ]

  const renderView = () => {
    switch (activeView) {
      case 'users':
        return <UsersView />
      case 'cards':
        return <CardsView />
      case 'my-cards':
        return <MyCardsView />
      case 'profiles':
        return <ProfilesView />
      default:
        return <UsersView />
    }
  }

  return (
    <DashboardLayout
      user={user}
      menuItems={menuItems}
      activeView={activeView}
      onMenuClick={setActiveView}
      onLogout={handleLogout}
    >
      {renderView()}
    </DashboardLayout>
  )
}

export default OwnerDashboard