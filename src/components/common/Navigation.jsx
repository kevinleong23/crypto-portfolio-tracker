import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { userAPI } from '../../services/api'
import ProfileDropdown from './ProfileDropdown'

function Navigation() {
  const location = useLocation()
  const [user, setUser] = useState({})

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await userAPI.getProfile()
        setUser(response.data)
      } catch (error) {
        console.error("Failed to fetch user for navigation", error)
      }
    }
    fetchUser()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    window.location.href = '/login'
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-dark-card border-b border-dark-border">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold">Crypto Portfolio</h1>
            <div className="flex gap-4">
              <Link
                to="/dashboard"
                className={`hover:text-blue-400 transition ${isActive('/dashboard') ? 'text-blue-400' : ''}`}
              >
                Dashboard
              </Link>
              <Link
                to="/assets"
                className={`hover:text-blue-400 transition ${isActive('/assets') ? 'text-blue-400' : ''}`}
              >
                Assets
              </Link>
              <Link
                to="/integration"
                className={`hover:text-blue-400 transition ${isActive('/integration') ? 'text-blue-400' : ''}`}
              >
                Integrations
              </Link>
              <Link
                to="/settings"
                className={`hover:text-blue-400 transition ${isActive('/settings') ? 'text-blue-400' : ''}`}
              >
                Settings
              </Link>
            </div>
          </div>
          <ProfileDropdown user={user} onLogout={handleLogout} />
        </div>
      </div>
    </nav>
  )
}

export default Navigation