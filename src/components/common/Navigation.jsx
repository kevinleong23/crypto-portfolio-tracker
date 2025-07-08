import { Link, useNavigate, useLocation } from 'react-router-dom'

function Navigation() {
  const navigate = useNavigate()
  const location = useLocation()
  
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
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navigation