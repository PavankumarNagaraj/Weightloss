import supabase from '../config/supabaseClient';
import { getActivityForDate } from './googleFitClient';

/**
 * Google Fit Data Sync Service
 * Caches Google Fit data in Supabase for faster access
 */

/**
 * Get cached fitness data from Supabase for a specific date
 */
export const getCachedFitnessData = async (userId, date) => {
  try {
    const dateStr = new Date(date).toISOString().split('T')[0]; // YYYY-MM-DD
    
    const { data, error } = await supabase
      .from('google_fit_data')
      .select('*')
      .eq('user_id', userId)
      .eq('date', dateStr)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching cached fitness data:', error);
    return null;
  }
};

/**
 * Sync Google Fit data for a specific date and store in Supabase
 */
export const syncFitnessDataForDate = async (userId, date) => {
  try {
    console.log('Syncing fitness data for:', date);
    
    // Fetch from Google Fit
    const googleData = await getActivityForDate(date);
    
    if (!googleData) {
      console.log('No data from Google Fit');
      return null;
    }

    const dateStr = new Date(date).toISOString().split('T')[0];

    // Prepare data for Supabase
    const fitnessData = {
      user_id: userId,
      date: dateStr,
      steps: googleData.steps || 0,
      distance: googleData.distance || 0,
      calories_burned: googleData.calories || 0,
      active_minutes: googleData.activeMinutes || 0,
      heart_rate_avg: googleData.heartRate?.avg || null,
      heart_rate_min: googleData.heartRate?.min || null,
      heart_rate_max: googleData.heartRate?.max || null,
      sleep_duration: googleData.sleep?.duration || null,
      synced_at: new Date().toISOString(),
    };

    // Upsert (insert or update) in Supabase
    const { data, error } = await supabase
      .from('google_fit_data')
      .upsert(fitnessData, {
        onConflict: 'user_id,date',
      })
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Fitness data synced to Supabase:', data);
    return data;
  } catch (error) {
    console.error('Error syncing fitness data:', error);
    throw error;
  }
};

/**
 * Get fitness data - from cache first, only sync once per day
 */
export const getFitnessData = async (userId, date = new Date(), forceSync = false) => {
  try {
    const dateStr = new Date(date).toISOString().split('T')[0];
    const isToday = dateStr === new Date().toISOString().split('T')[0];
    
    // First, try to get from cache
    const cached = await getCachedFitnessData(userId, date);
    
    if (cached && !forceSync) {
      const cacheAge = Date.now() - new Date(cached.synced_at).getTime();
      const oneDay = 24 * 60 * 60 * 1000;
      
      // For today: sync only once per day (at end of day or manual)
      // For past dates: use cache indefinitely (data won't change)
      if (!isToday || cacheAge < oneDay) {
        console.log('✅ Using cached data (age:', Math.round(cacheAge / 60000), 'minutes)');
        return {
          ...cached,
          fromCache: true,
          cacheAge: Math.round(cacheAge / 60000),
        };
      }
    }

    // Only sync if:
    // 1. No cache exists
    // 2. It's today and cache is > 24 hours old
    // 3. Force sync requested (manual refresh)
    if (!cached || forceSync || (isToday && !cached)) {
      console.log('🔄 Syncing from Google Fit...');
      const synced = await syncFitnessDataForDate(userId, date);
      
      return {
        ...synced,
        fromCache: false,
      };
    }

    // Return cached data
    return {
      ...cached,
      fromCache: true,
      cacheAge: Math.round((Date.now() - new Date(cached.synced_at).getTime()) / 60000),
    };
  } catch (error) {
    console.error('Error getting fitness data:', error);
    
    // If sync fails but we have cached data, return it anyway
    const cached = await getCachedFitnessData(userId, date);
    if (cached) {
      console.log('⚠️ Using stale cache due to sync error');
      return {
        ...cached,
        fromCache: true,
        stale: true,
      };
    }
    
    throw error;
  }
};

/**
 * Sync last 7 days of data
 */
export const syncLastWeek = async (userId) => {
  try {
    const results = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      try {
        const data = await syncFitnessDataForDate(userId, date);
        results.push({ date: date.toDateString(), success: true, data });
      } catch (error) {
        results.push({ date: date.toDateString(), success: false, error: error.message });
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error syncing last week:', error);
    throw error;
  }
};

/**
 * Get weekly summary from cached data
 */
export const getWeeklySummaryFromCache = async (userId) => {
  try {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    const startDateStr = startDate.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('google_fit_data')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDateStr)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) throw error;

    // Calculate totals
    const summary = {
      totalSteps: 0,
      totalCalories: 0,
      totalDistance: 0,
      totalActiveMinutes: 0,
      avgStepsPerDay: 0,
      avgCaloriesPerDay: 0,
      days: data.length,
    };

    data.forEach(day => {
      summary.totalSteps += day.steps || 0;
      summary.totalCalories += day.calories_burned || 0;
      summary.totalDistance += day.distance || 0;
      summary.totalActiveMinutes += day.active_minutes || 0;
    });

    if (data.length > 0) {
      summary.avgStepsPerDay = Math.round(summary.totalSteps / data.length);
      summary.avgCaloriesPerDay = Math.round(summary.totalCalories / data.length);
    }

    return summary;
  } catch (error) {
    console.error('Error getting weekly summary:', error);
    return null;
  }
};

/**
 * Schedule automatic end-of-day sync
 * Call this once when user logs in
 */
export const scheduleEndOfDaySync = (userId) => {
  // Calculate time until 11:59 PM
  const now = new Date();
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 0);
  const timeUntilEndOfDay = endOfDay.getTime() - now.getTime();

  if (timeUntilEndOfDay > 0) {
    console.log('📅 Scheduled end-of-day sync in', Math.round(timeUntilEndOfDay / 60000), 'minutes');
    
    setTimeout(async () => {
      console.log('🌙 Running end-of-day sync...');
      try {
        await syncFitnessDataForDate(userId, new Date());
        console.log('✅ End-of-day sync complete');
      } catch (error) {
        console.error('❌ End-of-day sync failed:', error);
      }
    }, timeUntilEndOfDay);
  }
};

export default {
  getCachedFitnessData,
  syncFitnessDataForDate,
  getFitnessData,
  syncLastWeek,
  getWeeklySummaryFromCache,
  scheduleEndOfDaySync,
};
