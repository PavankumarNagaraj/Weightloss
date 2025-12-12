// Supabase Client Configuration
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-application-name': 'afterburn-cafe',
    },
  },
});

// Helper function to handle Supabase errors
export const handleSupabaseError = (error, context = '') => {
  console.error(`Supabase Error ${context}:`, error);
  
  if (error.code === 'PGRST116') {
    return { error: 'No data found', details: error };
  }
  
  if (error.code === '23505') {
    return { error: 'Duplicate entry', details: error };
  }
  
  if (error.code === '23503') {
    return { error: 'Referenced record not found', details: error };
  }
  
  return { error: error.message || 'Database error occurred', details: error };
};

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey);
};
