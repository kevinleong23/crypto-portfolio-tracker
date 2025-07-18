import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { userAPI } from '../services/api'
import { useApp } from '../App'

function Settings() {
  const navigate = useNavigate()
  const { showError, showSuccess, user, fetchUser } = useApp()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [twoFA, setTwoFA] = useState(false)
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteOtp, setDeleteOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const fileInputRef = useRef(null)
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

  useEffect(() => {
    if (user) {
      setUsername(user.username)
      setTwoFA(user.twoFactorEnabled)
      setLoading(false)
    } else {
      fetchUser()
    }
  }, [user, fetchUser])

  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('avatar', file)

    try {
      await userAPI.uploadProfilePicture(formData)
      fetchUser()
      showSuccess('Profile picture updated successfully')
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to upload profile picture')
    }
  }

  const handleSaveProfile = async () => {
    try {
      await userAPI.updateProfile({ username })
      fetchUser()
      showSuccess('Profile updated successfully')
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to update profile')
    }
  }

  const handleChangePassword = async () => {
    if (!currentPassword) {
      showError('Please enter your current password');
      return;
    }
    if (newPassword !== confirmPassword) {
      showError('New passwords do not match')
      return
    }
    try {
      await userAPI.changePassword(currentPassword, newPassword)
      showSuccess('Password changed successfully')
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
      showSuccess(`2FA ${response.data.twoFactorEnabled ? 'enabled' : 'disabled'}`)
    } catch (error) {
      showError('Failed to toggle 2FA')
    }
  }

  const handleRequestDeleteOtp = async () => {
    try {
        await userAPI.requestDeleteOtp();
        showSuccess('An OTP has been sent to your email.');
        setOtpSent(true);
    } catch (error) {
        setDeleteError(error.response?.data?.message || 'Failed to send OTP.');
    }
  };

  const handleDeleteAccount = async () => {
    const isGoogleAccount = !user.hasPassword;

    if (isGoogleAccount) {
      if (!deleteOtp) {
        setDeleteError('Please enter the OTP sent to your email.');
        return;
      }
    } else {
      if (!deletePassword) {
        setDeleteError('Please enter your password to confirm.');
        return;
      }
    }

    try {
      setDeleteError('');
      await userAPI.deleteAccount(deletePassword, deleteOtp);
      showSuccess('Account deleted successfully.');
      handleLogout();
    } catch (error) {
      setDeleteError(error.response?.data?.message || 'Failed to delete account. Please try again.');
    }
  };

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
      {/* ... (rest of the JSX is mostly the same, only the modal is updated) ... */}
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>

        {/* Profile Settings */}
        <div className="bg-dark-card p-6 rounded-lg border border-dark-border mb-6">
          <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>

          <div className="flex items-center gap-6 mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-dark-bg overflow-hidden flex items-center justify-center">
                {user.profilePictureUrl ? (
                  <img src={`${API_URL.replace('/api', '')}${user.profilePictureUrl}?${new Date().getTime()}`} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-dark-muted">{user.username?.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current.click()}
                className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 w-8 h-8 rounded-full flex items-center justify-center text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                  <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                </svg>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                hidden
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleProfilePictureUpload}
              />
            </div>

            <div className="space-y-4 flex-1">
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
              {!user.hasPassword ? (
                // OTP flow for Google accounts
                <div>
                  {!otpSent ? (
                    <button onClick={handleRequestDeleteOtp} className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition">
                      Send OTP to {user.email}
                    </button>
                  ) : (
                    <input
                      type="text"
                      placeholder="Enter OTP"
                      value={deleteOtp}
                      onChange={(e) => {
                        setDeleteOtp(e.target.value);
                        setDeleteError('');
                      }}
                      className={`w-full px-4 py-2 bg-dark-bg border rounded focus:outline-none ${
                        deleteError ? 'border-red-500 focus:border-red-500' : 'border-dark-border focus:border-blue-500'
                      }`}
                      autoFocus
                    />
                  )}
                </div>
              ) : (
                // Password flow for regular accounts
                <input
                  type="password"
                  placeholder="Enter your password to confirm"
                  value={deletePassword}
                  onChange={(e) => {
                    setDeletePassword(e.target.value);
                    setDeleteError('');
                  }}
                  className={`w-full px-4 py-2 bg-dark-bg border rounded focus:outline-none ${
                    deleteError ? 'border-red-500 focus:border-red-500' : 'border-dark-border focus:border-blue-500'
                  }`}
                  autoFocus
                />
              )}
              {deleteError && (
                <p className="text-red-500 text-sm">{deleteError}</p>
              )}
              <div className="flex justify-end gap-4 pt-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletePassword('');
                    setDeleteOtp('');
                    setOtpSent(false);
                    setDeleteError('');
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

export default Settings;