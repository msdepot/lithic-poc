import { useState, useEffect } from 'react'
import api from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'

function ProfilesView() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dailyLimit: '',
    monthlyLimit: '',
    transactionLimit: '',
    allowedCategories: '',
    blockedCategories: ''
  })
  const [error, setError] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    fetchProfiles()
  }, [])

  const fetchProfiles = async () => {
    try {
      const response = await api.get('/profiles')
      setProfiles(response.data)
    } catch (error) {
      console.error('Error fetching profiles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProfile = async (e) => {
    e.preventDefault()
    setError('')
    
    try {
      const payload = {
        ...formData,
        dailyLimit: formData.dailyLimit || null,
        monthlyLimit: formData.monthlyLimit || null,
        transactionLimit: formData.transactionLimit || null,
        allowedCategories: formData.allowedCategories ? formData.allowedCategories.split(',').map(c => c.trim()) : [],
        blockedCategories: formData.blockedCategories ? formData.blockedCategories.split(',').map(c => c.trim()) : []
      }
      
      const response = await api.post('/profiles', payload)
      setProfiles([response.data.profile, ...profiles])
      setShowCreateForm(false)
      setFormData({
        name: '',
        description: '',
        dailyLimit: '',
        monthlyLimit: '',
        transactionLimit: '',
        allowedCategories: '',
        blockedCategories: ''
      })
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create profile')
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Spending Profiles</h1>
        {(user?.role === 'owner' || user?.role === 'admin') && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700"
          >
            {showCreateForm ? 'Cancel' : 'Create Profile'}
          </button>
        )}
      </div>

      {showCreateForm && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Create Spending Profile</h2>
          <form onSubmit={handleCreateProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Profile Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                  placeholder="Teen Allowance"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                  placeholder="Limited spending for teenagers"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Daily Limit ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.dailyLimit}
                  onChange={(e) => setFormData({...formData, dailyLimit: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                  placeholder="50.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Monthly Limit ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.monthlyLimit}
                  onChange={(e) => setFormData({...formData, monthlyLimit: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                  placeholder="500.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Transaction Limit ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.transactionLimit}
                  onChange={(e) => setFormData({...formData, transactionLimit: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                  placeholder="25.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Allowed Categories (MCC codes, comma-separated)
              </label>
              <input
                type="text"
                value={formData.allowedCategories}
                onChange={(e) => setFormData({...formData, allowedCategories: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                placeholder="5812, 5814 (Restaurants, Fast Food)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Blocked Categories (MCC codes, comma-separated)
              </label>
              <input
                type="text"
                value={formData.blockedCategories}
                onChange={(e) => setFormData({...formData, blockedCategories: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                placeholder="5921, 7995 (Liquor, Gambling)"
              />
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
              Create Profile
            </button>
          </form>
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No spending profiles created yet</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {profiles.map((profile) => (
              <div key={profile.id} className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-medium text-gray-900">{profile.name}</h3>
                  <span className="text-sm text-gray-500">
                    Created by {profile.created_by?.first_name} {profile.created_by?.last_name}
                  </span>
                </div>
                
                {profile.description && (
                  <p className="text-sm text-gray-600 mb-3">{profile.description}</p>
                )}
                
                <div className="grid grid-cols-3 gap-4 mb-3">
                  {profile.daily_limit && (
                    <div>
                      <p className="text-sm text-gray-500">Daily Limit</p>
                      <p className="font-medium">${profile.daily_limit}</p>
                    </div>
                  )}
                  {profile.monthly_limit && (
                    <div>
                      <p className="text-sm text-gray-500">Monthly Limit</p>
                      <p className="font-medium">${profile.monthly_limit}</p>
                    </div>
                  )}
                  {profile.transaction_limit && (
                    <div>
                      <p className="text-sm text-gray-500">Per Transaction</p>
                      <p className="font-medium">${profile.transaction_limit}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-4 text-sm">
                  {profile.allowed_categories?.length > 0 && (
                    <div>
                      <span className="text-gray-500">Allowed:</span>{' '}
                      <span className="text-green-600">{profile.allowed_categories.join(', ')}</span>
                    </div>
                  )}
                  {profile.blocked_categories?.length > 0 && (
                    <div>
                      <span className="text-gray-500">Blocked:</span>{' '}
                      <span className="text-red-600">{profile.blocked_categories.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfilesView