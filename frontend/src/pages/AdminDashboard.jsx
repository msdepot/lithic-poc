import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import Layout from '../components/Layout'

function AdminDashboard() {
  const [accounts, setAccounts] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    accountName: '',
    ownerEmail: '',
    ownerFirstName: '',
    ownerLastName: ''
  })
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { logout } = useAuth()

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      const response = await api.get('/admin/accounts')
      setAccounts(response.data)
    } catch (error) {
      console.error('Error fetching accounts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAccount = async (e) => {
    e.preventDefault()
    setError('')
    
    try {
      const response = await api.post('/admin/accounts', formData)
      setAccounts([response.data.account, ...accounts])
      setShowCreateForm(false)
      setFormData({
        accountName: '',
        ownerEmail: '',
        ownerFirstName: '',
        ownerLastName: ''
      })
      alert(`Account created successfully! Owner can now login with: ${formData.ownerEmail}`)
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create account')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin CRM Dashboard</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Logout
        </button>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Business Accounts</h2>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700"
          >
            {showCreateForm ? 'Cancel' : 'Create New Account'}
          </button>
        </div>

        {showCreateForm && (
          <form onSubmit={handleCreateAccount} className="mb-6 space-y-4 border-t pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Account Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.accountName}
                  onChange={(e) => setFormData({...formData, accountName: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                  placeholder="MSD Cafe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Owner Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.ownerEmail}
                  onChange={(e) => setFormData({...formData, ownerEmail: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                  placeholder="owner@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Owner First Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.ownerFirstName}
                  onChange={(e) => setFormData({...formData, ownerFirstName: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                  placeholder="Eric"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Owner Last Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.ownerLastName}
                  onChange={(e) => setFormData({...formData, ownerLastName: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                  placeholder="Medina"
                />
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
              Create Account
            </button>
          </form>
        )}

        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : accounts.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No accounts created yet</p>
        ) : (
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lithic ID
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {accounts.map((account) => {
                  const owner = account.users?.find(u => u.role === 'owner')
                  return (
                    <tr key={account.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {account.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {owner ? `${owner.first_name} ${owner.last_name}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {account.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(account.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {account.lithic_account_holder_id?.slice(0, 8)}...
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default AdminDashboard