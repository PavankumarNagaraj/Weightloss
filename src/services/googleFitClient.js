import supabase from '../config/supabaseClient';

/**
 * Google Fit Client Service
 * Fetches fitness data directly from Google Fit API using Supabase OAuth token
 */

const GOOGLE_FIT_API = 'https://www.googleapis.com/fitness/v1';

/**
 * Get the current user's Google access token from Supabase session
 */
const getAccessToken = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session || !session.provider_token) {
    throw new Error('No Google access token found. Please sign in with Google.');
  }
  
  return session.provider_token;
};

/**
 * Fetch data from Google Fit API
 */
const fetchFitData = async (endpoint, options = {}) => {
  try {
    const token = await getAccessToken();
    
    const response = await fetch(`${GOOGLE_FIT_API}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Google Fit API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching Google Fit data:', error);
    throw error;
  }
};

/**
 * Get today's activity data (steps, calories, distance)
 * Query data sources directly instead of using aggregation
 */
export const getTodayActivity = async () => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const startTimeNanos = startOfDay.getTime() * 1000000; // Convert to nanoseconds
    const endTimeNanos = now.getTime() * 1000000;

    console.log('Fetching activity data:', { 
      start: startOfDay.toISOString(), 
      end: now.toISOString() 
    });

    // Query steps directly from merge_step_deltas
    const stepsDataSourceId = 'derived:com.google.step_count.delta:com.google.android.gms:merge_step_deltas';
    const stepsData = await fetchFitData(
      `/users/me/dataSources/${stepsDataSourceId}/datasets/${startTimeNanos}-${endTimeNanos}`
    );

    console.log('Steps data:', stepsData);

    // Sum all step points
    let steps = 0;
    if (stepsData.point) {
      stepsData.point.forEach(p => {
        steps += p.value?.[0]?.intVal || 0;
      });
    }

    // Query calories
    const caloriesDataSourceId = 'derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended';
    let calories = 0;
    try {
      const caloriesData = await fetchFitData(
        `/users/me/dataSources/${caloriesDataSourceId}/datasets/${startTimeNanos}-${endTimeNanos}`
      );
      if (caloriesData.point) {
        caloriesData.point.forEach(p => {
          calories += p.value?.[0]?.fpVal || 0;
        });
      }
    } catch (err) {
      console.log('No calories data available');
    }

    // Query distance
    const distanceDataSourceId = 'derived:com.google.distance.delta:com.google.android.gms:merge_distance_delta';
    let distance = 0;
    try {
      const distanceData = await fetchFitData(
        `/users/me/dataSources/${distanceDataSourceId}/datasets/${startTimeNanos}-${endTimeNanos}`
      );
      if (distanceData.point) {
        distanceData.point.forEach(p => {
          distance += p.value?.[0]?.fpVal || 0;
        });
      }
    } catch (err) {
      console.log('No distance data available');
    }

    // Query active minutes
    const activeDataSourceId = 'derived:com.google.active_minutes:com.google.android.gms:merge_active_minutes';
    let activeMinutes = 0;
    try {
      const activeData = await fetchFitData(
        `/users/me/dataSources/${activeDataSourceId}/datasets/${startTimeNanos}-${endTimeNanos}`
      );
      if (activeData.point) {
        activeData.point.forEach(p => {
          activeMinutes += p.value?.[0]?.intVal || 0;
        });
      }
    } catch (err) {
      console.log('No active minutes data available');
    }

    console.log('Parsed data:', { steps, calories, distance, activeMinutes });

    return {
      steps,
      calories: Math.round(calories),
      distance: Math.round(distance), // in meters
      activeMinutes,
      date: startOfDay.toISOString(),
    };
  } catch (error) {
    console.error('Error getting today activity:', error);
    console.error('Error details:', error.message);
    return { steps: 0, calories: 0, distance: 0, activeMinutes: 0 };
  }
};

/**
 * Get heart rate data for today
 */
export const getTodayHeartRate = async () => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    const startTimeMillis = startOfDay.getTime();
    const endTimeMillis = endOfDay.getTime();

    const requestBody = {
      aggregateBy: [
        { dataTypeName: 'com.google.heart_rate.bpm' },
      ],
      bucketByTime: { durationMillis: 86400000 },
      startTimeMillis,
      endTimeMillis,
    };

    const data = await fetchFitData('/users/me/dataset:aggregate', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const points = data.bucket?.[0]?.dataset?.[0]?.point || [];
    
    if (points.length === 0) {
      return { avg: 0, min: 0, max: 0 };
    }

    const heartRates = points.map(p => p.value?.[0]?.fpVal).filter(Boolean);
    
    return {
      avg: Math.round(heartRates.reduce((a, b) => a + b, 0) / heartRates.length),
      min: Math.round(Math.min(...heartRates)),
      max: Math.round(Math.max(...heartRates)),
    };
  } catch (error) {
    console.error('Error getting heart rate:', error);
    return { avg: 0, min: 0, max: 0 };
  }
};

/**
 * Get sleep data for last night
 */
export const getLastNightSleep = async () => {
  try {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const startTimeMillis = yesterday.getTime();
    const endTimeMillis = now.getTime();

    const requestBody = {
      aggregateBy: [
        { dataTypeName: 'com.google.sleep.segment' },
      ],
      startTimeMillis,
      endTimeMillis,
    };

    const data = await fetchFitData('/users/me/dataset:aggregate', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const points = data.bucket?.[0]?.dataset?.[0]?.point || [];
    
    if (points.length === 0) {
      return { duration: 0, hours: 0 };
    }

    // Calculate total sleep duration in minutes
    const totalMinutes = points.reduce((total, point) => {
      const start = parseInt(point.startTimeNanos) / 1000000;
      const end = parseInt(point.endTimeNanos) / 1000000;
      return total + (end - start) / 60000; // Convert to minutes
    }, 0);

    return {
      duration: Math.round(totalMinutes),
      hours: (totalMinutes / 60).toFixed(1),
    };
  } catch (error) {
    console.error('Error getting sleep data:', error);
    return { duration: 0, hours: 0 };
  }
};

/**
 * Get weekly summary
 */
export const getWeeklySummary = async () => {
  try {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const startTimeMillis = weekAgo.getTime();
    const endTimeMillis = now.getTime();

    const requestBody = {
      aggregateBy: [
        { dataTypeName: 'com.google.step_count.delta' },
        { dataTypeName: 'com.google.calories.expended' },
        { dataTypeName: 'com.google.distance.delta' },
        { dataTypeName: 'com.google.active_minutes' },
      ],
      bucketByTime: { durationMillis: 86400000 }, // 1 day buckets
      startTimeMillis,
      endTimeMillis,
    };

    const data = await fetchFitData('/users/me/dataset:aggregate', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    let totalSteps = 0;
    let totalCalories = 0;
    let totalDistance = 0;
    let totalActiveMinutes = 0;

    data.bucket?.forEach(bucket => {
      totalSteps += bucket.dataset?.[0]?.point?.[0]?.value?.[0]?.intVal || 0;
      totalCalories += bucket.dataset?.[1]?.point?.[0]?.value?.[0]?.fpVal || 0;
      totalDistance += bucket.dataset?.[2]?.point?.[0]?.value?.[0]?.fpVal || 0;
      totalActiveMinutes += bucket.dataset?.[3]?.point?.[0]?.value?.[0]?.intVal || 0;
    });

    return {
      totalSteps,
      totalCalories: Math.round(totalCalories),
      totalDistance: Math.round(totalDistance),
      totalActiveMinutes,
      avgStepsPerDay: Math.round(totalSteps / 7),
      avgCaloriesPerDay: Math.round(totalCalories / 7),
    };
  } catch (error) {
    console.error('Error getting weekly summary:', error);
    return {
      totalSteps: 0,
      totalCalories: 0,
      totalDistance: 0,
      totalActiveMinutes: 0,
      avgStepsPerDay: 0,
      avgCaloriesPerDay: 0,
    };
  }
};

/**
 * Check if user has Google Fit connected
 */
export const isConnected = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!(session?.provider_token && session?.user?.app_metadata?.provider === 'google');
  } catch (error) {
    return false;
  }
};

/**
 * Get all today's stats in one call
 */
export const getTodayStats = async () => {
  try {
    const [activity, heartRate, sleep] = await Promise.all([
      getTodayActivity(),
      getTodayHeartRate(),
      getLastNightSleep(),
    ]);

    return {
      ...activity,
      heartRate,
      sleep,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error getting today stats:', error);
    return null;
  }
};

export default {
  getTodayActivity,
  getTodayHeartRate,
  getLastNightSleep,
  getWeeklySummary,
  getTodayStats,
  isConnected,
};
