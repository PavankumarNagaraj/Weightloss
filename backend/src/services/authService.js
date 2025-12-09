import { supabase, supabaseAdmin } from '../config/supabase.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

/**
 * Sign up new user
 */
export const signUp = async (email, password, userData) => {
  try {
    // Create auth user in Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: userData.name,
          role: userData.role || 'user'
        }
      }
    });

    if (authError) throw authError;

    // Create user profile in database
    const { data: user, error: dbError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        name: userData.name,
        phone: userData.phone,
        role: userData.role || 'user',
        height: userData.height,
        age: userData.age,
        gender: userData.gender,
        start_weight: userData.startWeight,
        current_weight: userData.startWeight,
        goal_weight: userData.goalWeight,
        meal_plan: userData.mealPlan,
        start_date: new Date().toISOString().split('T')[0]
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      session: authData.session
    };
  } catch (error) {
    console.error('Sign up error:', error);
    throw new Error(error.message || 'Failed to create account');
  }
};

/**
 * Sign in user
 */
export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    // Get user profile
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (userError) throw userError;

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone
      },
      session: data.session
    };
  } catch (error) {
    console.error('Sign in error:', error);
    throw new Error('Invalid email or password');
  }
};

/**
 * Sign out user
 */
export const signOut = async (accessToken) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    return { success: true, message: 'Signed out successfully' };
  } catch (error) {
    console.error('Sign out error:', error);
    throw new Error('Failed to sign out');
  }
};

/**
 * Get user from session
 */
export const getUserFromSession = async (accessToken) => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error) throw error;

    // Get full user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;

    return {
      success: true,
      user: profile
    };
  } catch (error) {
    console.error('Get user error:', error);
    throw new Error('Invalid session');
  }
};

/**
 * Refresh access token
 */
export const refreshToken = async (refreshToken) => {
  try {
    const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
    
    if (error) throw error;

    return {
      success: true,
      session: data.session
    };
  } catch (error) {
    console.error('Refresh token error:', error);
    throw new Error('Failed to refresh token');
  }
};

/**
 * Request password reset
 */
export const requestPasswordReset = async (email) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/reset-password`
    });

    if (error) throw error;

    return {
      success: true,
      message: 'Password reset email sent'
    };
  } catch (error) {
    console.error('Password reset error:', error);
    throw new Error('Failed to send password reset email');
  }
};

/**
 * Update password
 */
export const updatePassword = async (accessToken, newPassword) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;

    return {
      success: true,
      message: 'Password updated successfully'
    };
  } catch (error) {
    console.error('Update password error:', error);
    throw new Error('Failed to update password');
  }
};

/**
 * Verify email
 */
export const verifyEmail = async (token) => {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'email'
    });

    if (error) throw error;

    return {
      success: true,
      message: 'Email verified successfully'
    };
  } catch (error) {
    console.error('Verify email error:', error);
    throw new Error('Failed to verify email');
  }
};

/**
 * Create custom JWT token (for additional claims)
 */
export const createCustomToken = (user) => {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

/**
 * Verify custom JWT token
 */
export const verifyCustomToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

export default {
  signUp,
  signIn,
  signOut,
  getUserFromSession,
  refreshToken,
  requestPasswordReset,
  updatePassword,
  verifyEmail,
  createCustomToken,
  verifyCustomToken
};
