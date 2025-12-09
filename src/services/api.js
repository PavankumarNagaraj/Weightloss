import supabase from '../config/supabaseClient';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Get authorization header with current session token
 */
const getAuthHeader = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('No active session');
  }

  return {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json'
  };
};

/**
 * Make API request
 */
const apiRequest = async (endpoint, options = {}) => {
  try {
    const headers = options.auth !== false ? await getAuthHeader() : {
      'Content-Type': 'application/json'
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// =====================================================
// AUTH API
// =====================================================

export const authAPI = {
  signUp: async (email, password, userData) => {
    return apiRequest('/auth/signup', {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ email, password, ...userData })
    });
  },

  signIn: async (email, password) => {
    return apiRequest('/auth/signin', {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ email, password })
    });
  },

  signOut: async () => {
    return apiRequest('/auth/signout', {
      method: 'POST'
    });
  },

  getCurrentUser: async () => {
    return apiRequest('/auth/me');
  },

  refreshToken: async (refreshToken) => {
    return apiRequest('/auth/refresh', {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ refreshToken })
    });
  },

  forgotPassword: async (email) => {
    return apiRequest('/auth/forgot-password', {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ email })
    });
  },

  resetPassword: async (newPassword) => {
    return apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ newPassword })
    });
  },

  // Google Fit
  connectGoogleFit: async () => {
    return apiRequest('/auth/google-fit/connect');
  },

  disconnectGoogleFit: async () => {
    return apiRequest('/auth/google-fit/disconnect', {
      method: 'POST'
    });
  }
};

// =====================================================
// PHOTOS API
// =====================================================

export const photosAPI = {
  upload: async (file, photoType, userId = null) => {
    const headers = await getAuthHeader();
    delete headers['Content-Type']; // Let browser set it for FormData

    const formData = new FormData();
    formData.append('photo', file);
    formData.append('photoType', photoType);
    if (userId) formData.append('userId', userId);

    const response = await fetch(`${API_URL}/photos/upload`, {
      method: 'POST',
      headers,
      body: formData
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  },

  uploadMultiple: async (files, userId = null) => {
    const headers = await getAuthHeader();
    delete headers['Content-Type'];

    const formData = new FormData();
    files.forEach(file => formData.append('photos', file));
    if (userId) formData.append('userId', userId);

    const response = await fetch(`${API_URL}/photos/upload-multiple`, {
      method: 'POST',
      headers,
      body: formData
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  },

  getUserPhotos: async (userId) => {
    return apiRequest(`/photos/${userId}`);
  },

  deletePhoto: async (photoId) => {
    return apiRequest(`/photos/${photoId}`, {
      method: 'DELETE'
    });
  }
};

// =====================================================
// USERS API (Direct Supabase)
// =====================================================

export const usersAPI = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  },

  getById: async (userId) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return { success: true, data };
  },

  update: async (userId, updates) => {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  },

  delete: async (userId) => {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) throw error;
    return { success: true };
  }
};

// =====================================================
// WEIGHT LOGS API
// =====================================================

export const weightLogsAPI = {
  create: async (userId, weight, date, notes = '') => {
    const { data, error } = await supabase
      .from('weight_logs')
      .insert({
        user_id: userId,
        weight,
        date,
        notes
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  },

  getByUser: async (userId) => {
    const { data, error } = await supabase
      .from('weight_logs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true });

    if (error) throw error;
    return { success: true, data };
  },

  update: async (logId, updates) => {
    const { data, error } = await supabase
      .from('weight_logs')
      .update(updates)
      .eq('id', logId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  },

  delete: async (logId) => {
    const { error } = await supabase
      .from('weight_logs')
      .delete()
      .eq('id', logId);

    if (error) throw error;
    return { success: true };
  }
};

// =====================================================
// WORKOUTS API
// =====================================================

export const workoutsAPI = {
  assign: async (userId, workoutData) => {
    const { data, error } = await supabase
      .from('assigned_workouts')
      .insert({
        user_id: userId,
        ...workoutData
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  },

  getByUser: async (userId) => {
    const { data, error } = await supabase
      .from('assigned_workouts')
      .select('*')
      .eq('user_id', userId)
      .order('assigned_date', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  },

  updateStatus: async (workoutId, status, completedDate = null) => {
    const { data, error } = await supabase
      .from('assigned_workouts')
      .update({
        status,
        completed_date: completedDate
      })
      .eq('id', workoutId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  },

  delete: async (workoutId) => {
    const { error } = await supabase
      .from('assigned_workouts')
      .delete()
      .eq('id', workoutId);

    if (error) throw error;
    return { success: true };
  }
};

// =====================================================
// GOOGLE FIT API
// =====================================================

export const googleFitAPI = {
  syncData: async (userId, startDate, endDate) => {
    return apiRequest('/google-fit/sync', {
      method: 'POST',
      body: JSON.stringify({ userId, startDate, endDate })
    });
  },

  getData: async (userId, startDate, endDate) => {
    const { data, error } = await supabase
      .from('google_fit_data')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) throw error;
    return { success: true, data };
  }
};

export default {
  authAPI,
  photosAPI,
  usersAPI,
  weightLogsAPI,
  workoutsAPI,
  googleFitAPI
};
