import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect, createContext, useContext } from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Integration from './pages/Integration'
import AssetDetails from './pages/AssetDetails'
import Settings from './pages/Settings'
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ErrorBanner from './components/common/ErrorBanner'
import SuccessBanner from './components/common/SuccessBanner' // Import SuccessBanner
import Navigation from './components/common/Navigation'
import { userAPI } from './services/api'

// App Context
export const AppContext = createContext()

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null) // State for success messages
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    setIsAuthenticated(!!token)
    if (token) {
      fetchUser();
    }
  }, [])

  const fetchUser = async () => {
    try {
      const response = await userAPI.getProfile();
      setUser(response.data);
    } catch (error) {
      console.error("Failed to fetch user for navigation", error);
    }
  };

  const showError = (message) => {
    setError(message)
    setSuccess(null) // Clear success message when an error occurs
  }

  const showSuccess = (message) => {
    setSuccess(message)
    setError(null) // Clear error message when a success message is shown
  }

  const clearError = () => {
    setError(null)
  }

  const clearSuccess = () => {
    setSuccess(null)
  }

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-client-id-here'

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AppContext.Provider value={{ user, fetchUser, showError, showSuccess, clearError, clearSuccess }}>
        <Router>
          <ErrorBanner 
            error={error} 
            onDismiss={clearError}
          />
          <SuccessBanner
            message={success}
            onDismiss={clearSuccess}
          />
          {isAuthenticated && <Navigation />}
          <Routes>
            <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
            <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/integration" element={isAuthenticated ? <Integration /> : <Navigate to="/login" />} />
            <Route path="/assets" element={isAuthenticated ? <AssetDetails /> : <Navigate to="/login" />} />
            <Route path="/settings" element={isAuthenticated ? <Settings /> : <Navigate to="/login" />} />
            <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
          </Routes>
        </Router>
      </AppContext.Provider>
    </GoogleOAuthProvider>
  )
}

export default App