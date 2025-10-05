import { useState, useEffect } from 'react'
import api from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'

function CardsView() {
  const [cards, setCards] = useState([])
  const [users, setUsers] = useState([])
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    userId: '',
    type: 'virtual',
    spendingProfileId: '',
    customDailyLimit: '',
    customMonthlyLimit: '',
    customTransactionLimit: ''
  })
  const [error, setError] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [cardsRes, usersRes, profilesRes] = await Promise.all([
        api.get('/cards'),
        api.get('/users'),
        api.get('/profiles')
      ])
      setCards(cardsRes.data)
      setUsers(usersRes.data)
      setProfiles(profilesRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCard = async (e) => {
    e.preventDefault()
    setError('')
    
    try {
      const payload = {
        ...formData,
        customDailyLimit: formData.customDailyLimit || null,
        customMonthlyLimit: formData.customMonthlyLimit || null,
        customTransactionLimit: formData.customTransactionLimit || null,
        spendingProfileId: formData.spendingProfileId || null
      }
      
      const response = await api.post('/cards', payload)
      setCards([response.data.card, ...cards])
      setShowCreateForm(false)
      setFormData({
        userId: '',
        type: 'virtual',
        spendingProfileId: '',
        customDailyLimit: '',
        customMonthlyLimit: '',
        customTransactionLimit: ''
      })
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create card')
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Cards</h1>
        {(user?.role === 'owner' || user?.role === 'admin') && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700"
          >
            {showCreateForm ? 'Cancel' : 'Create Card'}
          </button>
        )}
      </div>

      {showCreateForm && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Create New Card</h2>
          <form onSubmit={handleCreateCard} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  User
                </label>
                <select
                  required
                  value={formData.userId}
                  onChange={(e) => setFormData({...formData, userId: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                >
                  <option value="">Select a user</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.first_name} {user.last_name} ({user.role})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Card Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                >
                  <option value="virtual">Virtual</option>
                  <option value="physical">Physical</option>
                  <option value="reloadable">Reloadable</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Spending Profile (Optional)
                </label>
                <select
                  value={formData.spendingProfileId}
                  onChange={(e) => setFormData({...formData, spendingProfileId: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                >
                  <option value="">No profile (use custom limits)</option>
                  {profiles.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Custom Limits (Optional)</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-600">Daily Limit</label>
                  <input
                    type="number"
                    value={formData.customDailyLimit}
                    onChange={(e) => setFormData({...formData, customDailyLimit: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600">Monthly Limit</label>
                  <input
                    type="number"
                    value={formData.customMonthlyLimit}
                    onChange={(e) => setFormData({...formData, customMonthlyLimit: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600">Transaction Limit</label>
                  <input
                    type="number"
                    value={formData.customTransactionLimit}
                    onChange={(e) => setFormData({...formData, customTransactionLimit: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
            
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
            
            <button
              type="submit"
              className="w-full px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700"
            >
              Create Card
            </button>
          </form>
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : cards.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No cards created yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Card Holder
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last 4
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Spending Profile
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created By
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cards.map((card) => (
                  <tr key={card.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {card.users?.first_name} {card.users?.last_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {card.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                      {card.last_four || '****'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(card.status)}`}>
                        {card.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {card.spending_profiles?.name || 'Custom Limits'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {card.created_by?.first_name} {card.created_by?.last_name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default CardsView