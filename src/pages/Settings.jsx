import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { userAPI } from '../services/api'
import { useError } from '../App'

function Settings() {
  const navigate = useNavigate()
  const { showError } = useError()
  const [username, setUsername] = useState('JohnDoe')
  const [email] = useState('john@example.com') // Non-editable
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [twoFA, setTwoFA] = useState(false)
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')

  const handleSaveProfile = () => {
    // TODO: Implement API call to update username
    console.log('Saving profile:', { username })
    alert('Profile updated successfully')
  }

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match')
      return
    }
    // TODO: Implement API call to change password
    console.log('Changing password')
    alert('Password changed successfully')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setShowPasswordChange(false)
  }

  const handleToggle2FA = () => {
    // TODO: Implement 2FA toggle
    setTwoFA(!twoFA)
    console.log('2FA toggled:', !twoFA)
  }

  const handleDeleteAccount = async () => {
    try {
      await userAPI.deleteAccount(deletePassword)
      handleLogout()
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to delete account')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    navigate('/login')
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
                value={email}
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
              Change Password
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
          <button
            onClick={handleLogout}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition mb-4"
          >
            Log Out
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded transition"
          >
            Delete Account
          </button>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
            <h2 className="text-xl font-semibold mb-4">Delete Account</h2>
            <p className="mb-4">Are you sure you want to delete your account? This action cannot be undone.</p>
            <input
              type="password"
              placeholder="Enter your password to confirm"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded focus:outline-none focus:border-blue-500 mb-4"
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition"
              >
                No
              </button>
              <button
                onClick={handleDeleteAccount}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings