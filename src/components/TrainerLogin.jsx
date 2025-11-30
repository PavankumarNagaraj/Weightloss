import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ADMIN_CREDENTIALS } from '../FirebaseConfig';
import { Lock, User, AlertCircle, Calculator } from 'lucide-react';

const TrainerLogin = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate async operation for better UX
    setTimeout(() => {
      // Check admin credentials
      if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', 'admin');
        localStorage.setItem('currentUser', JSON.stringify({ username, role: 'admin' }));
        onLogin();
        navigate('/dashboard');
      } else {
        // Check trainer credentials
        const trainers = JSON.parse(localStorage.getItem('weightloss_trainers') || '[]');
        const trainer = trainers.find(t => t.email === username && t.password === password);
        
        if (trainer) {
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('userRole', 'trainer');
          localStorage.setItem('currentUser', JSON.stringify({ 
            id: trainer.id,
            name: trainer.name,
            email: trainer.email,
            role: 'trainer' 
          }));
          onLogin();
          navigate('/dashboard');
        } else {
          setError('Invalid username or password. Please try again.');
        }
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Login</h1>
          <p className="text-gray-600 mt-2">Admin & Trainer Access</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                placeholder="admin"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                placeholder="Weightloss001"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Admin & Trainer Access</p>
          <p className="mt-2 text-xs text-gray-500">Admin - Username: admin | Password: Weightloss001</p>
          <p className="text-xs text-gray-500">Trainers - Use your email & password</p>
        </div>

        {/* Nutrient Calculator Button */}
        <div className="mt-6">
          <button
            onClick={() => navigate('/calculator')}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition flex items-center justify-center gap-2"
          >
            <Calculator className="w-5 h-5" />
            Nutrient Calculator
          </button>
          <p className="text-xs text-gray-500 text-center mt-2">Calculate your daily nutrient requirements</p>
        </div>
      </div>
    </div>
  );
};

export default TrainerLogin;
