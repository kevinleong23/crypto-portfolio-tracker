import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

function ProfileDropdown({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const handleToggle = () => setIsOpen(!isOpen)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={handleToggle} className="w-10 h-10 rounded-full bg-dark-border overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-card focus:ring-blue-500">
        {user.profilePictureUrl ? (
          <img src={`${API_URL.replace('/api', '')}${user.profilePictureUrl}`} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <span className="text-xl font-bold text-white">{user.username?.charAt(0).toUpperCase()}</span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-dark-card border border-dark-border rounded-lg shadow-lg z-50">
          <div className="py-1">
            <Link to="/settings" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-sm text-dark-text hover:bg-dark-bg">
              {user.username}
            </Link>
            <button onClick={onLogout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-dark-bg">
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfileDropdown