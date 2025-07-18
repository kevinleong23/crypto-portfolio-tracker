import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isDeleteProfileRequest =
      error.config.method === 'delete' && error.config.url.endsWith('/user/profile');
    
    const isChangePasswordRequest =
      error.config.method === 'post' && error.config.url.endsWith('/user/change-password');

    if (error.response?.status === 401 && !isDeleteProfileRequest && !isChangePasswordRequest) {
      localStorage.removeItem('authToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  login2FA: (userId, token) => api.post('/auth/login/2fa', { userId, token }),
  register: (username, email, password) => api.post('/auth/register', { username, email, password }),
  googleAuth: (googleData) => api.post('/auth/google', googleData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  verifyOtp: (email, otp) => api.post('/auth/verify-otp', { email, otp }),
  resetPassword: (email, otp, password) => api.post('/auth/reset-password', { email, otp, password }),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.patch('/user/profile', data),
  uploadProfilePicture: (formData) => api.post('/user/profile-picture', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  changePassword: (currentPassword, newPassword) =>
    api.post('/user/change-password', { currentPassword, newPassword }),
  generate2FA: () => api.post('/user/2fa/generate'),
  verify2FA: (token) => api.post('/user/2fa/verify', { token }),
  disable2FA: () => api.post('/user/2fa/disable'),
  deleteAccount: (password, otp) => api.delete('/user/profile', { data: { password, otp } }),
  requestDeleteOtp: () => api.post('/user/request-delete-otp'),
}

// Portfolio API
export const portfolioAPI = {
  getSummary: () => api.get('/portfolio/summary'),
  getPerformance: (timeframe) => api.get(`/portfolio/performance/${timeframe}`),
  getAssets: () => api.get('/portfolio/assets'),
  sync: () => api.post('/portfolio/sync')
}

// Integration API
export const integrationAPI = {
  getAll: () => api.get('/integration'),
  addExchange: (exchange, apiKey, apiSecret) => 
    api.post('/integration/exchange', { exchange, apiKey, apiSecret }),
  addWallet: (walletType, address) => 
    api.post('/integration/wallet', { walletType, address }),
  remove: (id) => api.delete(`/integration/${id}`),
  updateName: (id, displayName) => api.patch(`/integration/${id}`, { displayName })
}

// Transaction API
export const transactionAPI = {
  getRecent: () => api.get('/transactions/recent'),
  getRecentByWallet: (integrationId) => api.get(`/transactions/recent/${integrationId}`),
  getByAsset: (symbol, limit = 50, skip = 0) => 
    api.get(`/transactions/asset/${symbol}?limit=${limit}&skip=${skip}`),
  getStats: () => api.get('/transactions/stats'),
  create: (transaction) => api.post('/transactions', transaction)
}

export default api