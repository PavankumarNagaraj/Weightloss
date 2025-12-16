import React, { useState } from 'react';
import { Lock, Coffee, Eye, EyeOff } from 'lucide-react';

const CafeLogin = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Password: cafe2024 (you can change this)
    const CAFE_PASSWORD = 'cafe2024';
    
    if (password === CAFE_PASSWORD) {
      onLogin();
      setError('');
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-orange-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-amber-600 p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 shadow-lg">
              <Coffee className="w-10 h-10 text-orange-600" />
            </div>
            <h1 className="text-3xl font-black text-white mb-2">Cafe Management</h1>
            <p className="text-orange-100 font-semibold">Enter password to continue</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter cafe password"
                  className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition outline-none font-semibold"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-600 font-semibold">
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl font-bold hover:from-orange-600 hover:to-amber-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Access Cafe Management
            </button>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <p className="text-xs text-blue-800 text-center">
                🔒 This area is password protected. Contact the administrator if you need access.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CafeLogin;
