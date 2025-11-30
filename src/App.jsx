import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import TrainerLogin from './components/TrainerLogin';
import TrainerDashboard from './components/TrainerDashboard';
import UserDashboard from './components/UserDashboard';
import NutrientCalculator from './components/NutrientCalculator';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const authStatus = localStorage.getItem('isAuthenticated');
    setIsAuthenticated(authStatus === 'true');
    // Reduce loading time
    setTimeout(() => setLoading(false), 100);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <TrainerLogin onLogin={handleLogin} />} 
        />
        <Route 
          path="/dashboard/*" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <TrainerDashboard onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />
        <Route path="/user/:userId" element={<UserDashboard />} />
        <Route path="/calculator" element={<NutrientCalculator />} />
      </Routes>
    </Router>
  );
}

export default App;
