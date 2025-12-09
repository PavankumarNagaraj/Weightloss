// Google Fit Integration Service
// Fetches step count and other health data from Google Fit API

import { getGoogleAccount, updateGoogleToken } from './userAuthService';

// Google Fit API Configuration
const GOOGLE_FIT_API = 'https://www.googleapis.com/fitness/v1/users/me';
const SCOPES = [
  'https://www.googleapis.com/auth/fitness.activity.read',
  'https://www.googleapis.com/auth/fitness.body.read',
  'https://www.googleapis.com/auth/fitness.location.read',
];

/**
 * Initialize Google OAuth (to be called when user clicks "Connect Google")
 * This will open Google's OAuth consent screen
 */
export const initGoogleAuth = () => {
  // TODO: Implement Google OAuth flow
  // 1. Redirect to Google OAuth consent screen
  // 2. Request fitness.activity.read permission
  // 3. Handle callback with access token
  // 4. Store token using linkGoogleAccount()
  
  console.log('Google OAuth initialization - To be implemented');
  
  // Example implementation:
  // const clientId = 'YOUR_GOOGLE_CLIENT_ID';
  // const redirectUri = window.location.origin + '/google-callback';
  // const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
  //   `client_id=${clientId}&` +
  //   `redirect_uri=${redirectUri}&` +
  //   `response_type=code&` +
  //   `scope=${SCOPES.join(' ')}&` +
  //   `access_type=offline`;
  // window.location.href = authUrl;
};

/**
 * Fetch step count for a specific date
 * @param {string} userId - User ID
 * @param {Date} date - Date to fetch steps for
 * @returns {Promise<number>} Step count
 */
export const getStepCount = async (userId, date = new Date()) => {
  try {
    const googleAccount = getGoogleAccount(userId);
    
    if (!googleAccount) {
      throw new Error('Google account not linked');
    }
    
    // Set time range for the day
    const startTime = new Date(date);
    startTime.setHours(0, 0, 0, 0);
    
    const endTime = new Date(date);
    endTime.setHours(23, 59, 59, 999);
    
    const startTimeNanos = startTime.getTime() * 1000000;
    const endTimeNanos = endTime.getTime() * 1000000;
    
    // Call Google Fit API
    const response = await fetch(
      `${GOOGLE_FIT_API}/dataset:aggregate`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${googleAccount.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aggregateBy: [{
            dataTypeName: 'com.google.step_count.delta',
            dataSourceId: 'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps'
          }],
          bucketByTime: { durationMillis: 86400000 }, // 1 day
          startTimeMillis: startTime.getTime(),
          endTimeMillis: endTime.getTime(),
        }),
      }
    );
    
    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, need to refresh
        throw new Error('Token expired');
      }
      throw new Error('Failed to fetch step count');
    }
    
    const data = await response.json();
    
    // Extract step count from response
    let totalSteps = 0;
    if (data.bucket && data.bucket.length > 0) {
      data.bucket.forEach(bucket => {
        if (bucket.dataset && bucket.dataset.length > 0) {
          bucket.dataset.forEach(dataset => {
            if (dataset.point && dataset.point.length > 0) {
              dataset.point.forEach(point => {
                if (point.value && point.value.length > 0) {
                  totalSteps += point.value[0].intVal || 0;
                }
              });
            }
          });
        }
      });
    }
    
    return totalSteps;
  } catch (error) {
    console.error('Error fetching step count:', error);
    throw error;
  }
};

/**
 * Fetch step count for a date range
 * @param {string} userId - User ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Array>} Array of {date, steps}
 */
export const getStepCountRange = async (userId, startDate, endDate) => {
  try {
    const googleAccount = getGoogleAccount(userId);
    
    if (!googleAccount) {
      throw new Error('Google account not linked');
    }
    
    const response = await fetch(
      `${GOOGLE_FIT_API}/dataset:aggregate`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${googleAccount.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aggregateBy: [{
            dataTypeName: 'com.google.step_count.delta',
          }],
          bucketByTime: { durationMillis: 86400000 }, // 1 day buckets
          startTimeMillis: startDate.getTime(),
          endTimeMillis: endDate.getTime(),
        }),
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch step count range');
    }
    
    const data = await response.json();
    
    // Parse response into array of {date, steps}
    const stepData = [];
    if (data.bucket) {
      data.bucket.forEach(bucket => {
        const date = new Date(parseInt(bucket.startTimeMillis));
        let steps = 0;
        
        if (bucket.dataset && bucket.dataset.length > 0) {
          bucket.dataset.forEach(dataset => {
            if (dataset.point && dataset.point.length > 0) {
              dataset.point.forEach(point => {
                if (point.value && point.value.length > 0) {
                  steps += point.value[0].intVal || 0;
                }
              });
            }
          });
        }
        
        stepData.push({
          date: date.toISOString().split('T')[0],
          steps,
        });
      });
    }
    
    return stepData;
  } catch (error) {
    console.error('Error fetching step count range:', error);
    throw error;
  }
};

/**
 * Fetch other health metrics (calories burned, distance, heart rate)
 * @param {string} userId - User ID
 * @param {Date} date - Date to fetch data for
 * @returns {Promise<Object>} Health metrics
 */
export const getHealthMetrics = async (userId, date = new Date()) => {
  try {
    const googleAccount = getGoogleAccount(userId);
    
    if (!googleAccount) {
      throw new Error('Google account not linked');
    }
    
    const startTime = new Date(date);
    startTime.setHours(0, 0, 0, 0);
    
    const endTime = new Date(date);
    endTime.setHours(23, 59, 59, 999);
    
    const response = await fetch(
      `${GOOGLE_FIT_API}/dataset:aggregate`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${googleAccount.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aggregateBy: [
            { dataTypeName: 'com.google.step_count.delta' },
            { dataTypeName: 'com.google.calories.expended' },
            { dataTypeName: 'com.google.distance.delta' },
            { dataTypeName: 'com.google.heart_rate.bpm' },
          ],
          bucketByTime: { durationMillis: 86400000 },
          startTimeMillis: startTime.getTime(),
          endTimeMillis: endTime.getTime(),
        }),
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch health metrics');
    }
    
    const data = await response.json();
    
    // Parse metrics
    const metrics = {
      steps: 0,
      calories: 0,
      distance: 0, // in meters
      heartRate: 0,
      date: date.toISOString().split('T')[0],
    };
    
    // Extract data from response
    // (Simplified - actual implementation would parse the bucket structure)
    
    return metrics;
  } catch (error) {
    console.error('Error fetching health metrics:', error);
    throw error;
  }
};

/**
 * Save step count to user's daily log
 * @param {string} userId - User ID
 * @param {Date} date - Date
 * @param {number} steps - Step count
 */
export const saveStepCountToLog = (userId, date, steps) => {
  try {
    // Get user data
    const users = JSON.parse(localStorage.getItem('weightloss_users') || '[]');
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    const user = users[userIndex];
    const dateStr = date.toISOString().split('T')[0];
    
    // Find or create log for this date
    if (!user.logs) {
      user.logs = [];
    }
    
    const logIndex = user.logs.findIndex(log => log.date === dateStr);
    
    if (logIndex !== -1) {
      // Update existing log
      user.logs[logIndex].steps = steps;
      user.logs[logIndex].stepsSource = 'google_fit';
      user.logs[logIndex].stepsSyncedAt = new Date().toISOString();
    } else {
      // Create new log
      user.logs.push({
        date: dateStr,
        steps,
        stepsSource: 'google_fit',
        stepsSyncedAt: new Date().toISOString(),
      });
    }
    
    // Save back to localStorage
    users[userIndex] = user;
    localStorage.setItem('weightloss_users', JSON.stringify(users));
    
    return true;
  } catch (error) {
    console.error('Error saving step count:', error);
    throw error;
  }
};

/**
 * Sync step count for today
 * @param {string} userId - User ID
 * @returns {Promise<number>} Step count
 */
export const syncTodaySteps = async (userId) => {
  try {
    const today = new Date();
    const steps = await getStepCount(userId, today);
    
    // Save to user's log
    saveStepCountToLog(userId, today, steps);
    
    return steps;
  } catch (error) {
    console.error('Error syncing today steps:', error);
    throw error;
  }
};

/**
 * Sync step count for last N days
 * @param {string} userId - User ID
 * @param {number} days - Number of days to sync
 */
export const syncStepHistory = async (userId, days = 7) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const stepData = await getStepCountRange(userId, startDate, endDate);
    
    // Save each day's steps
    stepData.forEach(({ date, steps }) => {
      saveStepCountToLog(userId, new Date(date), steps);
    });
    
    return stepData;
  } catch (error) {
    console.error('Error syncing step history:', error);
    throw error;
  }
};
