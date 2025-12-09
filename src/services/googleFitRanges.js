import supabase from '../config/supabaseClient';
import { syncFitnessDataForDate } from './googleFitSync';

/**
 * Google Fit Date Range Queries
 * Get aggregated data for various time periods
 */

/**
 * Get date range for different periods
 */
export const getDateRange = (period) => {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  switch (period) {
    case 'today':
      return {
        start: startOfToday,
        end: new Date(),
        label: 'Today'
      };
      
    case 'yesterday':
      const yesterday = new Date(startOfToday);
      yesterday.setDate(yesterday.getDate() - 1);
      return {
        start: yesterday,
        end: startOfToday,
        label: 'Yesterday'
      };
      
    case 'last7days':
      const last7 = new Date(startOfToday);
      last7.setDate(last7.getDate() - 7);
      return {
        start: last7,
        end: today,
        label: 'Last 7 Days'
      };
      
    case 'last30days':
      const last30 = new Date(startOfToday);
      last30.setDate(last30.getDate() - 30);
      return {
        start: last30,
        end: today,
        label: 'Last 30 Days'
      };
      
    case 'currentMonth':
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      return {
        start: monthStart,
        end: today,
        label: 'This Month'
      };
      
    case 'lastMonth':
      const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
      return {
        start: lastMonthStart,
        end: lastMonthEnd,
        label: 'Last Month'
      };
      
    default:
      return {
        start: startOfToday,
        end: today,
        label: 'Today'
      };
  }
};

/**
 * Get aggregated stats for a date range from cache
 */
export const getRangeStats = async (userId, period) => {
  try {
    const { start, end, label } = getDateRange(period);
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('google_fit_data')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startStr)
      .lte('date', endStr)
      .order('date', { ascending: true });

    if (error) throw error;

    // Aggregate the data
    const stats = {
      period: label,
      startDate: startStr,
      endDate: endStr,
      totalSteps: 0,
      totalCalories: 0,
      totalDistance: 0,
      totalActiveMinutes: 0,
      avgSteps: 0,
      avgCalories: 0,
      avgDistance: 0,
      avgActiveMinutes: 0,
      avgHeartRate: 0,
      avgSleep: 0,
      days: data.length,
      dailyData: data,
    };

    let heartRateCount = 0;
    let sleepCount = 0;

    data.forEach(day => {
      stats.totalSteps += day.steps || 0;
      stats.totalCalories += day.calories_burned || 0;
      stats.totalDistance += day.distance || 0;
      stats.totalActiveMinutes += day.active_minutes || 0;
      
      if (day.heart_rate_avg) {
        stats.avgHeartRate += day.heart_rate_avg;
        heartRateCount++;
      }
      
      if (day.sleep_duration) {
        stats.avgSleep += day.sleep_duration;
        sleepCount++;
      }
    });

    // Calculate averages
    if (data.length > 0) {
      stats.avgSteps = Math.round(stats.totalSteps / data.length);
      stats.avgCalories = Math.round(stats.totalCalories / data.length);
      stats.avgDistance = Math.round(stats.totalDistance / data.length);
      stats.avgActiveMinutes = Math.round(stats.totalActiveMinutes / data.length);
    }

    if (heartRateCount > 0) {
      stats.avgHeartRate = Math.round(stats.avgHeartRate / heartRateCount);
    }

    if (sleepCount > 0) {
      stats.avgSleep = Math.round(stats.avgSleep / sleepCount);
    }

    return stats;
  } catch (error) {
    console.error('Error getting range stats:', error);
    return null;
  }
};

/**
 * Sync missing dates in a range
 */
export const syncDateRange = async (userId, period) => {
  try {
    const { start, end } = getDateRange(period);
    const results = [];
    
    const currentDate = new Date(start);
    while (currentDate <= end) {
      try {
        const data = await syncFitnessDataForDate(userId, new Date(currentDate));
        results.push({
          date: currentDate.toDateString(),
          success: true,
          data
        });
      } catch (error) {
        results.push({
          date: currentDate.toDateString(),
          success: false,
          error: error.message
        });
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return results;
  } catch (error) {
    console.error('Error syncing date range:', error);
    throw error;
  }
};

export default {
  getDateRange,
  getRangeStats,
  syncDateRange,
};
