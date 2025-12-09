import { google } from 'googleapis';
import { supabaseAdmin } from '../config/supabase.js';
import dotenv from 'dotenv';

dotenv.config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

/**
 * Generate Google OAuth URL
 */
export const getAuthUrl = () => {
  const scopes = [
    'https://www.googleapis.com/auth/fitness.activity.read',
    'https://www.googleapis.com/auth/fitness.body.read',
    'https://www.googleapis.com/auth/fitness.location.read',
    'https://www.googleapis.com/auth/fitness.heart_rate.read',
    'https://www.googleapis.com/auth/fitness.sleep.read'
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });
};

/**
 * Exchange authorization code for tokens
 */
export const getTokensFromCode = async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
  } catch (error) {
    console.error('Error getting tokens:', error);
    throw new Error('Failed to exchange authorization code');
  }
};

/**
 * Save Google Fit tokens for user
 */
export const saveUserTokens = async (userId, tokens) => {
  try {
    const { error } = await supabaseAdmin
      .from('users')
      .update({
        google_fit_connected: true,
        google_fit_refresh_token: tokens.refresh_token,
        google_fit_last_sync: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error saving tokens:', error);
    throw new Error('Failed to save Google Fit connection');
  }
};

/**
 * Get user's Google Fit tokens
 */
export const getUserTokens = async (userId) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('google_fit_refresh_token')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data.google_fit_refresh_token;
  } catch (error) {
    console.error('Error getting tokens:', error);
    throw new Error('Failed to get Google Fit tokens');
  }
};

/**
 * Sync Google Fit data for user
 */
export const syncGoogleFitData = async (userId, startDate, endDate) => {
  try {
    // Get user's refresh token
    const refreshToken = await getUserTokens(userId);
    if (!refreshToken) {
      throw new Error('Google Fit not connected');
    }

    // Set credentials
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    const fitness = google.fitness({ version: 'v1', auth: oauth2Client });

    // Convert dates to milliseconds
    const startTimeMillis = new Date(startDate).getTime();
    const endTimeMillis = new Date(endDate).getTime();

    // Fetch different data types
    const [stepsData, caloriesData, distanceData, heartRateData, sleepData] = await Promise.allSettled([
      fetchSteps(fitness, startTimeMillis, endTimeMillis),
      fetchCalories(fitness, startTimeMillis, endTimeMillis),
      fetchDistance(fitness, startTimeMillis, endTimeMillis),
      fetchHeartRate(fitness, startTimeMillis, endTimeMillis),
      fetchSleep(fitness, startTimeMillis, endTimeMillis)
    ]);

    // Process and save data
    const processedData = processGoogleFitData({
      steps: stepsData.status === 'fulfilled' ? stepsData.value : null,
      calories: caloriesData.status === 'fulfilled' ? caloriesData.value : null,
      distance: distanceData.status === 'fulfilled' ? distanceData.value : null,
      heartRate: heartRateData.status === 'fulfilled' ? heartRateData.value : null,
      sleep: sleepData.status === 'fulfilled' ? sleepData.value : null
    });

    // Save to database
    for (const dayData of processedData) {
      await supabaseAdmin
        .from('google_fit_data')
        .upsert({
          user_id: userId,
          date: dayData.date,
          steps: dayData.steps,
          distance: dayData.distance,
          calories_burned: dayData.calories,
          active_minutes: dayData.activeMinutes,
          heart_rate_avg: dayData.heartRateAvg,
          heart_rate_min: dayData.heartRateMin,
          heart_rate_max: dayData.heartRateMax,
          sleep_duration: dayData.sleepDuration,
          raw_data: dayData.raw,
          synced_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,date'
        });
    }

    // Update last sync time
    await supabaseAdmin
      .from('users')
      .update({ google_fit_last_sync: new Date().toISOString() })
      .eq('id', userId);

    return { success: true, data: processedData };
  } catch (error) {
    console.error('Error syncing Google Fit data:', error);
    throw new Error('Failed to sync Google Fit data');
  }
};

/**
 * Fetch steps data
 */
const fetchSteps = async (fitness, startTimeMillis, endTimeMillis) => {
  const response = await fitness.users.dataset.aggregate({
    userId: 'me',
    requestBody: {
      aggregateBy: [{
        dataTypeName: 'com.google.step_count.delta',
        dataSourceId: 'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps'
      }],
      bucketByTime: { durationMillis: 86400000 }, // 1 day
      startTimeMillis,
      endTimeMillis
    }
  });
  return response.data;
};

/**
 * Fetch calories data
 */
const fetchCalories = async (fitness, startTimeMillis, endTimeMillis) => {
  const response = await fitness.users.dataset.aggregate({
    userId: 'me',
    requestBody: {
      aggregateBy: [{
        dataTypeName: 'com.google.calories.expended'
      }],
      bucketByTime: { durationMillis: 86400000 },
      startTimeMillis,
      endTimeMillis
    }
  });
  return response.data;
};

/**
 * Fetch distance data
 */
const fetchDistance = async (fitness, startTimeMillis, endTimeMillis) => {
  const response = await fitness.users.dataset.aggregate({
    userId: 'me',
    requestBody: {
      aggregateBy: [{
        dataTypeName: 'com.google.distance.delta'
      }],
      bucketByTime: { durationMillis: 86400000 },
      startTimeMillis,
      endTimeMillis
    }
  });
  return response.data;
};

/**
 * Fetch heart rate data
 */
const fetchHeartRate = async (fitness, startTimeMillis, endTimeMillis) => {
  const response = await fitness.users.dataset.aggregate({
    userId: 'me',
    requestBody: {
      aggregateBy: [{
        dataTypeName: 'com.google.heart_rate.bpm'
      }],
      bucketByTime: { durationMillis: 86400000 },
      startTimeMillis,
      endTimeMillis
    }
  });
  return response.data;
};

/**
 * Fetch sleep data
 */
const fetchSleep = async (fitness, startTimeMillis, endTimeMillis) => {
  const response = await fitness.users.dataset.aggregate({
    userId: 'me',
    requestBody: {
      aggregateBy: [{
        dataTypeName: 'com.google.sleep.segment'
      }],
      bucketByTime: { durationMillis: 86400000 },
      startTimeMillis,
      endTimeMillis
    }
  });
  return response.data;
};

/**
 * Process Google Fit data into structured format
 */
const processGoogleFitData = (data) => {
  const processed = [];
  
  // Assuming all data sources have the same bucket structure
  const buckets = data.steps?.bucket || [];
  
  buckets.forEach((bucket, index) => {
    const date = new Date(parseInt(bucket.startTimeMillis)).toISOString().split('T')[0];
    
    const dayData = {
      date,
      steps: extractValue(data.steps?.bucket[index], 'intVal'),
      calories: extractValue(data.calories?.bucket[index], 'fpVal'),
      distance: extractValue(data.distance?.bucket[index], 'fpVal'),
      activeMinutes: calculateActiveMinutes(data.steps?.bucket[index]),
      heartRateAvg: calculateAvgHeartRate(data.heartRate?.bucket[index]),
      heartRateMin: extractMinValue(data.heartRate?.bucket[index], 'fpVal'),
      heartRateMax: extractMaxValue(data.heartRate?.bucket[index], 'fpVal'),
      sleepDuration: calculateSleepDuration(data.sleep?.bucket[index]),
      raw: {
        steps: data.steps?.bucket[index],
        calories: data.calories?.bucket[index],
        distance: data.distance?.bucket[index],
        heartRate: data.heartRate?.bucket[index],
        sleep: data.sleep?.bucket[index]
      }
    };
    
    processed.push(dayData);
  });
  
  return processed;
};

/**
 * Helper functions to extract values
 */
const extractValue = (bucket, valueType) => {
  if (!bucket || !bucket.dataset || !bucket.dataset[0] || !bucket.dataset[0].point) {
    return null;
  }
  const point = bucket.dataset[0].point[0];
  return point?.value?.[0]?.[valueType] || null;
};

const extractMinValue = (bucket, valueType) => {
  if (!bucket || !bucket.dataset || !bucket.dataset[0] || !bucket.dataset[0].point) {
    return null;
  }
  const values = bucket.dataset[0].point.map(p => p.value?.[0]?.[valueType]).filter(v => v != null);
  return values.length > 0 ? Math.min(...values) : null;
};

const extractMaxValue = (bucket, valueType) => {
  if (!bucket || !bucket.dataset || !bucket.dataset[0] || !bucket.dataset[0].point) {
    return null;
  }
  const values = bucket.dataset[0].point.map(p => p.value?.[0]?.[valueType]).filter(v => v != null);
  return values.length > 0 ? Math.max(...values) : null;
};

const calculateAvgHeartRate = (bucket) => {
  if (!bucket || !bucket.dataset || !bucket.dataset[0] || !bucket.dataset[0].point) {
    return null;
  }
  const values = bucket.dataset[0].point.map(p => p.value?.[0]?.fpVal).filter(v => v != null);
  return values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : null;
};

const calculateActiveMinutes = (bucket) => {
  // Simplified calculation - you can enhance this
  const steps = extractValue(bucket, 'intVal');
  return steps ? Math.round(steps / 100) : null; // Rough estimate
};

const calculateSleepDuration = (bucket) => {
  if (!bucket || !bucket.dataset || !bucket.dataset[0] || !bucket.dataset[0].point) {
    return null;
  }
  // Sleep duration in minutes
  const totalMillis = bucket.dataset[0].point.reduce((sum, point) => {
    const start = parseInt(point.startTimeNanos) / 1000000;
    const end = parseInt(point.endTimeNanos) / 1000000;
    return sum + (end - start);
  }, 0);
  return Math.round(totalMillis / 60000); // Convert to minutes
};

/**
 * Disconnect Google Fit
 */
export const disconnectGoogleFit = async (userId) => {
  try {
    const { error } = await supabaseAdmin
      .from('users')
      .update({
        google_fit_connected: false,
        google_fit_refresh_token: null
      })
      .eq('id', userId);

    if (error) throw error;
    return { success: true, message: 'Google Fit disconnected' };
  } catch (error) {
    console.error('Error disconnecting Google Fit:', error);
    throw new Error('Failed to disconnect Google Fit');
  }
};

export default {
  getAuthUrl,
  getTokensFromCode,
  saveUserTokens,
  syncGoogleFitData,
  disconnectGoogleFit
};
