import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import TrainerDashboard from './components/TrainerDashboard';
import UserDashboard from './components/UserDashboard';
import UserLogin from './components/UserLogin';
import UserLoginNew from './components/UserLoginNew';
import NutrientCalculator from './components/NutrientCalculator';
import CafeManagement from './components/CafeManagement';
import ProtectedRoute from './components/ProtectedRoute';
import UnifiedLogin from './components/UnifiedLogin';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import GoogleFitDashboard from './components/GoogleFitDashboard';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsConditions from './components/TermsConditions';
import { AuthProvider } from './contexts/AuthContext';
import { TenantProvider } from './contexts/TenantContext';
import { migrateOrderDates } from './services/cafeService';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check authentication on initial load
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  // Run migrations on app load
  useEffect(() => {
    migrateOrderDates();
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <AuthProvider>
        <TenantProvider>
          <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cafe/*" element={<CafeManagement />} />
        <Route path="/calculator" element={<NutrientCalculator />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-conditions" element={<TermsConditions />} />
        
        {/* Weight Loss Routes */}
        <Route path="/weightloss" element={<Navigate to="/weightloss/auth" replace />} />
        
        {/* Unified Authentication */}
        <Route path="/weightloss/auth" element={<UnifiedLogin />} />
        <Route path="/weightloss/login" element={<Navigate to="/weightloss/auth" replace />} />
        
        {/* Super Admin Dashboard */}
        <Route path="/weightloss/super-admin" element={<SuperAdminDashboard />} />
        
        {/* Admin/Trainer Dashboard */}
        <Route 
          path="/weightloss/dashboard/*" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <TrainerDashboard onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />
        
        {/* User Routes */}
        <Route path="/weightloss/user-login" element={<UserLogin />} /> {/* Legacy PIN login */}
        <Route path="/weightloss/user-login-new" element={<UserLoginNew />} /> {/* New Supabase login */}
        <Route path="/weightloss/user/:userId" element={<UserDashboard />} />
        <Route path="/weightloss/google-fit/:userId" element={<GoogleFitDashboard />} />
        
        {/* Legacy redirects for backward compatibility */}
        <Route path="/login" element={<Navigate to="/weightloss/auth" replace />} />
        <Route path="/user-login" element={<Navigate to="/weightloss/user-login" replace />} />
        <Route path="/dashboard/*" element={<Navigate to="/weightloss/dashboard" replace />} />
        <Route path="/user/:userId" element={<Navigate to="/weightloss/user/:userId" replace />} />
          </Routes>
        </TenantProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
