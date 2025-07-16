import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { userAPI } from '../services/api'
import { useError } from '../App'

function Settings() {
  const navigate = useNavigate()
  const { showError } = useError()
  const [user, setUser] = useState({ username: '', email: '' })
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [twoFA, setTwoFA] = useState(false)
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteError, setDeleteError] = useState('') // New state for modal error
  const [loading, setLoading] = useState(true)

  // State for the editable username
  const [username, setUsername] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await userAPI.getProfile()
        setUser(response.data)
        setUsername(response.data.username)
        setTwoFA(response.data.twoFactorEnabled)
      } catch (error) {
        showError('Failed to load profile data')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [showError])

  const handleSaveProfile = async () => {
    try {
      await userAPI.updateProfile({ username })
      showError('Profile updated successfully')
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to update profile')
    }
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      showError('New passwords do not match')
      return
    }
    try {
      await userAPI.changePassword(currentPassword, newPassword)
      showError('Password changed successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setShowPasswordChange(false)
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to change password')
    }
  }

  const handleToggle2FA = async () => {
    try {
      const response = await userAPI.toggle2FA(!twoFA)
      setTwoFA(response.data.twoFactorEnabled)
      showError(`2FA ${response.data.twoFactorEnabled ? 'enabled' : 'disabled'}`)
    } catch (error) {
      showError('Failed to toggle 2FA')
    }
  }

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError('Please enter your password to confirm.')
      return
    }
    try {
      setDeleteError('') // Clear previous errors
      await userAPI.deleteAccount(deletePassword)
      showError('Account deleted successfully.')
      handleLogout()
    } catch (error) {
      // Set the specific error for the modal
      setDeleteError(error.response?.data?.message || 'Failed to delete account. Please try again.')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-xl">Loading settings...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-bg p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>

        {/* Profile Settings */}
        <div className="bg-dark-card p-6 rounded-lg border border-dark-border mb-6">
          <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email (non-editable)</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded opacity-50 cursor-not-allowed"
              />
            </div>

            <button
              onClick={handleSaveProfile}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
            >
              Save Changes
            </button>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-dark-card p-6 rounded-lg border border-dark-border mb-6">
          <h2 className="text-xl font-semibold mb-4">Security</h2>

          {/* Password Change */}
          <div className="mb-6">
            <button
              onClick={() => setShowPasswordChange(!showPasswordChange)}
              className="text-blue-500 hover:text-blue-400 mb-4"
            >
              {showPasswordChange ? 'Cancel' : 'Change Password'}
            </button>

            {showPasswordChange && (
              <div className="space-y-4 mt-4">
                <input
                  type="password"
                  placeholder="Current Password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded focus:outline-none focus:border-blue-500"
                />
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded focus:outline-none focus:border-blue-500"
                />
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={handleChangePassword}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
                >
                  Update Password
                </button>
              </div>
            )}
          </div>

          {/* 2FA Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Two-Factor Authentication</h3>
              <p className="text-sm text-dark-muted">Add an extra layer of security to your account</p>
            </div>
            <button
              onClick={handleToggle2FA}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                twoFA ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  twoFA ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
          <h2 className="text-xl font-semibold mb-4">Account Actions</h2>
          <div className="flex gap-4">
            <button
              onClick={handleLogout}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded transition"
            >
              Log Out
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded transition"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-dark-card p-8 rounded-lg border border-dark-border w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Confirm Account Deletion</h2>
            <p className="mb-4 text-dark-muted">Are you sure you want to delete your account? This action is permanent and cannot be undone.</p>
            <div className="space-y-2">
              <input
                type="password"
                placeholder="Enter your password to confirm"
                value={deletePassword}
                onChange={(e) => {
                  setDeletePassword(e.target.value)
                  setDeleteError('') // Clear error on new input
                }}
                className={`w-full px-4 py-2 bg-dark-bg border rounded focus:outline-none ${
                  deleteError
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-dark-border focus:border-blue-500'
                }`}
                autoFocus
              />
              {deleteError && (
                <p className="text-red-500 text-sm">{deleteError}</p>
              )}
              <div className="flex justify-end gap-4 pt-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setDeletePassword('')
                    setDeleteError('')
                  }}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings