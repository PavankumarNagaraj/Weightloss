import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import TrainerLogin from './components/TrainerLogin';
import TrainerDashboard from './components/TrainerDashboard';
import UserDashboard from './components/UserDashboard';
import UserLogin from './components/UserLogin';
import NutrientCalculator from './components/NutrientCalculator';
import CafeManagement from './components/CafeManagement';
import ProtectedRoute from './components/ProtectedRoute';
import SupabaseLogin from './components/SupabaseLogin';
import SupabaseGoogleLogin from './components/SupabaseGoogleLogin';
import GoogleFitDashboard from './components/GoogleFitDashboard';
import { useAuth } from './contexts/AuthContext';

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
        <Route path="/cafe/*" element={<CafeManagement />} />
        <Route path="/calculator" element={<NutrientCalculator />} />
        
        {/* Weight Loss Routes */}
        <Route path="/weightloss" element={<Navigate to="/weightloss/auth" replace />} />
        
        {/* New Supabase Auth Routes with Google OAuth */}
        <Route path="/weightloss/auth" element={<SupabaseGoogleLogin />} />
        <Route path="/weightloss/google-fit/:userId" element={<GoogleFitDashboard />} />
        
        {/* Legacy Routes (still supported) */}
        <Route 
          path="/weightloss/login" 
          element={isAuthenticated ? <Navigate to="/weightloss/dashboard" /> : <TrainerLogin onLogin={handleLogin} />} 
        />
        <Route path="/weightloss/user-login" element={<UserLogin />} />
        <Route 
          path="/weightloss/dashboard/*" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <TrainerDashboard onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />
        <Route path="/weightloss/user/:userId" element={<UserDashboard />} />
        
        {/* Legacy redirects for backward compatibility */}
        <Route path="/login" element={<Navigate to="/weightloss/login" replace />} />
        <Route path="/user-login" element={<Navigate to="/weightloss/user-login" replace />} />
        <Route path="/dashboard/*" element={<Navigate to="/weightloss/dashboard" replace />} />
        <Route path="/user/:userId" element={<Navigate to="/weightloss/user/:userId" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
