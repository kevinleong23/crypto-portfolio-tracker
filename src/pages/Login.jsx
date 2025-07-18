import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import { useApp } from '../App'
import GoogleLogin from '../components/GoogleLogin'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { showError } = useApp()

  // 2FA State
  const [needs2FA, setNeeds2FA] = useState(false)
  const [userId, setUserId] = useState(null)
  const [twoFAToken, setTwoFAToken] = useState('')


  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await authAPI.login(email, password)
      if (response.data.twoFactorEnabled) {
        setNeeds2FA(true);
        setUserId(response.data.userId);
      } else {
        localStorage.setItem('authToken', response.data.token)
        window.location.href = '/dashboard' // Force reload to update auth state
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handle2FASubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authAPI.login2FA(userId, twoFAToken);
      localStorage.setItem('authToken', response.data.token);
      window.location.href = '/dashboard';
    } catch (error) {
      showError(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const handleGoogleLogin = () => {
    // Handled by GoogleLogin component
  }

  if (needs2FA) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg">
        <div className="bg-dark-card p-8 rounded-lg border border-dark-border w-full max-w-md">
          <h2 className="text-2xl font-bold text-center mb-6">Enter Verification Code</h2>
          <form onSubmit={handle2FASubmit} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="2FA Token"
                value={twoFAToken}
                onChange={(e) => setTwoFAToken(e.target.value)}
                className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white py-2 rounded transition"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg">
      <div className="bg-dark-card p-8 rounded-lg border border-dark-border w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white py-2 rounded transition"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        
        <GoogleLogin text="Log In with Google" />
        
        <div className="mt-6 text-center space-y-2">
          <Link to="/forgot-password" className="text-blue-500 hover:text-blue-400 text-sm">
            Forgot Password?
          </Link>
          <p className="text-dark-muted">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-500 hover:text-blue-400">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login