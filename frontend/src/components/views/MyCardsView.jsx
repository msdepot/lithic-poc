import { useState, useEffect } from 'react'
import api from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'

function MyCardsView() {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    fetchMyCards()
  }, [])

  const fetchMyCards = async () => {
    try {
      const response = await api.get('/cards')
      // Filter cards for current user
      const myCards = response.data.filter(card => card.users?.email === user.email)
      setCards(myCards)
    } catch (error) {
      console.error('Error fetching cards:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'closed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Cards</h1>

      {loading ? (
        <div className="bg-white shadow rounded-lg p-8">
          <div className="text-center">Loading...</div>
        </div>
      ) : cards.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8">
          <div className="text-center text-gray-500">
            <p className="mb-2">You don't have any cards yet.</p>
            <p className="text-sm">Ask an admin to create a card for you.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div key={card.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-gray-500">Card Type</p>
                  <p className="font-semibold capitalize">{card.type}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(card.status)}`}>
                  {card.status || 'Pending'}
                </span>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-500">Card Number</p>
                <p className="font-mono text-lg">**** **** **** {card.last_four || '****'}</p>
              </div>
              
              {card.spending_profiles && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Spending Profile</p>
                  <p className="font-medium">{card.spending_profiles.name}</p>
                </div>
              )}
              
              <div className="grid grid-cols-3 gap-2 text-sm">
                {card.custom_daily_limit && (
                  <div>
                    <p className="text-gray-500">Daily</p>
                    <p className="font-medium">${card.custom_daily_limit}</p>
                  </div>
                )}
                {card.custom_monthly_limit && (
                  <div>
                    <p className="text-gray-500">Monthly</p>
                    <p className="font-medium">${card.custom_monthly_limit}</p>
                  </div>
                )}
                {card.custom_transaction_limit && (
                  <div>
                    <p className="text-gray-500">Per Txn</p>
                    <p className="font-medium">${card.custom_transaction_limit}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Created on {new Date(card.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyCardsView