import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Phone, Lock, LogIn, ArrowLeft } from 'lucide-react';
import { loginUser, isUserLoggedIn, getCurrentUserId } from '../services/userAuthService';

const UserLogin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [phone, setPhone] = useState(searchParams.get('phone') || '');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If already logged in, redirect to dashboard
    if (isUserLoggedIn()) {
      const userId = getCurrentUserId();
      navigate(`/user/${userId}`);
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate inputs
      if (!phone || phone.length < 10) {
        throw new Error('Please enter a valid 10-digit phone number');
      }

      if (!pin || pin.length !== 6) {
        throw new Error('Please enter your 6-digit PIN');
      }

      // Login
      const { userId } = loginUser(phone, pin);
      
      // Redirect to user dashboard
      navigate(`/user/${userId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <button
          onClick={() => navigate('/')}
          className="mb-6 flex items-center gap-2 text-white/70 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">User Login</h1>
            <p className="text-gray-600">Access your meal plan dashboard</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value.replace(/\D/g, ''));
                  setError('');
                }}
                placeholder="Enter your 10-digit phone number"
                maxLength="10"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-lg"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Use the phone number you registered with
              </p>
            </div>

            {/* PIN */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Lock className="w-4 h-4 inline mr-2" />
                6-Digit PIN
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value.replace(/\D/g, ''));
                  setError('');
                }}
                placeholder="Enter your 6-digit PIN"
                maxLength="6"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-lg tracking-widest"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Your PIN is the last 6 digits of your phone number
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 font-medium mb-2">First time logging in?</p>
            <p className="text-xs text-blue-700">
              Your PIN is automatically set to the <strong>last 6 digits of your phone number</strong>.
              For example, if your phone is 9876543210, your PIN is 543210.
            </p>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/')}
                className="text-primary font-semibold hover:underline"
              >
                Subscribe Now
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
