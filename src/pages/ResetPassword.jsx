import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useError } from '../App';

function ResetPassword() {
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const navigate = useNavigate();
  const { state } = useLocation();
  const { showError, showSuccess } = useError();

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.verifyOtp(state.email, otp);
      showSuccess('OTP verified successfully.');
      setOtpVerified(true);
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to verify OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await authAPI.resetPassword(state.email, otp, password);
      showSuccess('Password has been reset successfully.');
      navigate('/login');
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg">
      <div className="bg-dark-card p-8 rounded-lg border border-dark-border w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Reset Password</h2>
        {!otpVerified ? (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white py-2 rounded transition"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white py-2 rounded transition"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;