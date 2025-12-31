import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../config/supabaseClient';
import { useAuth } from './AuthContext';

const TenantContext = createContext({});

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

export const TenantProvider = ({ children }) => {
  const { user, session } = useAuth();
  const [currentUser, setCurrentUser] = useState(null);
  const [currentTenant, setCurrentTenant] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && session) {
      fetchUserData();
    } else {
      setCurrentUser(null);
      setCurrentTenant(null);
      setUserRole(null);
      setLoading(false);
    }
  }, [user, session]);

  const fetchUserData = async () => {
    try {
      setLoading(true);

      // Fetch user data with tenant information
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
          *,
          tenant:tenants(*)
        `)
        .eq('id', user.id)
        .single();

      if (userError) throw userError;

      setCurrentUser(userData);
      setUserRole(userData.role);
      setCurrentTenant(userData.tenant);

      // Store in localStorage for backward compatibility
      localStorage.setItem('userRole', userData.role);
      localStorage.setItem('currentUser', JSON.stringify({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        tenantId: userData.tenant_id,
        tenantName: userData.tenant?.name
      }));

      if (userData.tenant_id) {
        localStorage.setItem('currentTenantId', userData.tenant_id);
      }

    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const switchTenant = async (tenantId) => {
    try {
      // Only super admins can switch tenants
      if (userRole !== 'super_admin') {
        throw new Error('Only super admins can switch tenants');
      }

      const { data: tenantData, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', tenantId)
        .single();

      if (error) throw error;

      setCurrentTenant(tenantData);
      localStorage.setItem('currentTenantId', tenantId);
    } catch (error) {
      console.error('Error switching tenant:', error);
      throw error;
    }
  };

  const value = {
    currentUser,
    currentTenant,
    userRole,
    loading,
    isSuperAdmin: userRole === 'super_admin',
    isAdmin: userRole === 'admin',
    isTrainer: userRole === 'trainer',
    isUser: userRole === 'user',
    switchTenant,
    refreshUserData: fetchUserData,
  };

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
};

export default TenantContext;
