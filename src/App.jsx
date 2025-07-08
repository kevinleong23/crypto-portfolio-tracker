import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect, createContext, useContext } from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Integration from './pages/Integration'
import AssetDetails from './pages/AssetDetails'
import Settings from './pages/Settings'
import ErrorBanner from './components/common/ErrorBanner'
import Navigation from './components/common/Navigation'

// Error Context
export const ErrorContext = createContext()

export const useError = () => {
  const context = useContext(ErrorContext)
  if (!context) {
    throw new Error('useError must be used within ErrorProvider')
  }
  return context
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('authToken')
    setIsAuthenticated(!!token)
  }, [])

  const showError = (message) => {
    setError(message)
  }

  const clearError = () => {
    setError(null)
  }

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-client-id-here'

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <ErrorContext.Provider value={{ showError, clearError }}>
        <Router>
          <ErrorBanner 
            error={error} 
            onDismiss={clearError}
            onRetry={() => {
              clearError()
              // Implement retry logic based on error type
            }}
          />
          {isAuthenticated && <Navigation />}
          <Routes>
            <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
            <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/integration" element={isAuthenticated ? <Integration /> : <Navigate to="/login" />} />
            <Route path="/assets" element={isAuthenticated ? <AssetDetails /> : <Navigate to="/login" />} />
            <Route path="/settings" element={isAuthenticated ? <Settings /> : <Navigate to="/login" />} />
            <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
          </Routes>
        </Router>
      </ErrorContext.Provider>
    </GoogleOAuthProvider>
  )
}

export default App