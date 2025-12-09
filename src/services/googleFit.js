import { authAPI, googleFitAPI } from './api';
import supabase from '../config/supabaseClient';

/**
 * Google Fit Integration Service
 * Handles OAuth flow and data synchronization
 */

const GOOGLE_FIT_SCOPES = [
  'https://www.googleapis.com/auth/fitness.activity.read',
  'https://www.googleapis.com/auth/fitness.body.read',
  'https://www.googleapis.com/auth/fitness.location.read',
  'https://www.googleapis.com/auth/fitness.heart_rate.read',
  'https://www.googleapis.com/auth/fitness.sleep.read',
  'https://www.googleapis.com/auth/fitness.nutrition.read',
];

/**
 * Check if user has Google Fit connected
 */
export const isGoogleFitConnected = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('google_fit_connected, google_fit_last_sync')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return {
      connected: data.google_fit_connected || false,
      lastSync: data.google_fit_last_sync,
    };
  } catch (error) {
    console.error('Error checking Google Fit status:', error);
    return { connected: false, lastSync: null };
  }
};

/**
 * Initiate Google Fit OAuth flow
 */
export const connectGoogleFit = async () => {
  try {
    const response = await authAPI.connectGoogleFit();
    if (response.success && response.authUrl) {
      // Open OAuth URL in new window
      window.location.href = response.authUrl;
    }
    return response;
  } catch (error) {
    console.error('Error connecting Google Fit:', error);
    throw error;
  }
};

/**
 * Disconnect Google Fit
 */
export const disconnectGoogleFit = async () => {
  try {
    const response = await authAPI.disconnectGoogleFit();
    return response;
  } catch (error) {
    console.error('Error disconnecting Google Fit:', error);
    throw error;
  }
};

/**
 * Sync Google Fit data for a date range
 */
export const syncGoogleFitData = async (userId, startDate, endDate) => {
  try {
    // Call backend API to sync data
    const response = await googleFitAPI.syncData(userId, startDate, endDate);
    return response;
  } catch (error) {
    console.error('Error syncing Google Fit data:', error);
    throw error;
  }
};

/**
 * Get Google Fit data from database
 */
export const getGoogleFitData = async (userId, startDate, endDate) => {
  try {
    const response = await googleFitAPI.getData(userId, startDate, endDate);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching Google Fit data:', error);
    return [];
  }
};

/**
 * Get today's Google Fit stats
 */
export const getTodayStats = async (userId) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const data = await getGoogleFitData(userId, today, today);
    
    if (data.length > 0) {
      return data[0];
    }
    
    return {
      steps: 0,
      distance: 0,
      calories_burned: 0,
      active_minutes: 0,
      heart_rate_avg: 0,
      sleep_duration: 0,
    };
  } catch (error) {
    console.error('Error fetching today stats:', error);
    return null;
  }
};

/**
 * Get weekly Google Fit summary
 */
export const getWeeklySummary = async (userId) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const data = await getGoogleFitData(
      userId,
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );

    const summary = {
      totalSteps: 0,
      totalDistance: 0,
      totalCalories: 0,
      totalActiveMinutes: 0,
      avgHeartRate: 0,
      totalSleep: 0,
      days: data.length,
    };

    data.forEach((day) => {
      summary.totalSteps += day.steps || 0;
      summary.totalDistance += day.distance || 0;
      summary.totalCalories += day.calories_burned || 0;
      summary.totalActiveMinutes += day.active_minutes || 0;
      summary.totalSleep += day.sleep_duration || 0;
    });

    // Calculate averages
    if (data.length > 0) {
      const heartRates = data.filter((d) => d.heart_rate_avg).map((d) => d.heart_rate_avg);
      if (heartRates.length > 0) {
        summary.avgHeartRate = Math.round(
          heartRates.reduce((a, b) => a + b, 0) / heartRates.length
        );
      }
    }

    return summary;
  } catch (error) {
    console.error('Error fetching weekly summary:', error);
    return null;
  }
};

/**
 * Auto-sync Google Fit data (last 7 days)
 */
export const autoSyncGoogleFit = async (userId) => {
  try {
    const { connected } = await isGoogleFitConnected(userId);
    
    if (!connected) {
      return { success: false, message: 'Google Fit not connected' };
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const response = await syncGoogleFitData(
      userId,
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );

    return response;
  } catch (error) {
    console.error('Error auto-syncing Google Fit:', error);
    return { success: false, error: error.message };
  }
};

export default {
  isGoogleFitConnected,
  connectGoogleFit,
  disconnectGoogleFit,
  syncGoogleFitData,
  getGoogleFitData,
  getTodayStats,
  getWeeklySummary,
  autoSyncGoogleFit,
};
