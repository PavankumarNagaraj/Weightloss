import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import TrainerLogin from './components/TrainerLogin';
import TrainerDashboard from './components/TrainerDashboard';
import UserDashboard from './components/UserDashboard';
import NutrientCalculator from './components/NutrientCalculator';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check authentication on initial load
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
  };

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
