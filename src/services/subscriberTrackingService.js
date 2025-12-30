// Subscriber Meal and Physical Measurement Tracking Service
import { supabase } from '../config/supabase';

// ==================== SUBSCRIBER MANAGEMENT ====================

export const getActiveSubscribersForTracking = async () => {
  try {
    const { data, error } = await supabase
      .from('cafe_subscriptions')
      .select(`
        *,
        customer:cafe_customers(*)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting active subscribers:', error);
    return [];
  }
};

// ==================== MEAL LOGGING ====================

export const logMeal = async (mealData) => {
  try {
    const { data, error } = await supabase
      .from('subscriber_meals')
      .insert([{
        subscriber_id: mealData.subscriberId,
        date: mealData.date,
        meal_type: mealData.mealType, // 'breakfast', 'lunch', 'dinner', 'snack'
        dishes: mealData.dishes, // Array of {menu_item_id, name, calories, quantity}
        total_calories: mealData.totalCalories,
        notes: mealData.notes || null,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error logging meal:', error);
    throw error;
  }
};

export const getMealsBySubscriber = async (subscriberId, startDate, endDate) => {
  try {
    let query = supabase
      .from('subscriber_meals')
      .select('*')
      .eq('subscriber_id', subscriberId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting meals:', error);
    return [];
  }
};

export const getMealsByDate = async (date) => {
  try {
    const { data, error } = await supabase
      .from('subscriber_meals')
      .select(`
        *,
        subscriber:cafe_subscriptions(
          id,
          customer:cafe_customers(name, phone)
        )
      `)
      .eq('date', date)
      .order('meal_type', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting meals by date:', error);
    return [];
  }
};

export const updateMeal = async (mealId, updates) => {
  try {
    const { data, error } = await supabase
      .from('subscriber_meals')
      .update(updates)
      .eq('id', mealId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating meal:', error);
    throw error;
  }
};

export const deleteMeal = async (mealId) => {
  try {
    const { error } = await supabase
      .from('subscriber_meals')
      .delete()
      .eq('id', mealId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting meal:', error);
    throw error;
  }
};

// ==================== PHYSICAL MEASUREMENTS ====================

export const logPhysicalMeasurement = async (measurementData) => {
  try {
    const { data, error } = await supabase
      .from('subscriber_measurements')
      .insert([{
        subscriber_id: measurementData.subscriberId,
        date: measurementData.date,
        weight: measurementData.weight || null,
        body_fat_percentage: measurementData.bodyFatPercentage || null,
        muscle_mass: measurementData.muscleMass || null,
        metabolic_age: measurementData.metabolicAge || null,
        bmi: measurementData.bmi || null,
        visceral_fat: measurementData.visceralFat || null,
        body_water_percentage: measurementData.bodyWaterPercentage || null,
        bone_mass: measurementData.boneMass || null,
        chest: measurementData.chest || null,
        waist: measurementData.waist || null,
        hips: measurementData.hips || null,
        thigh: measurementData.thigh || null,
        arm: measurementData.arm || null,
        notes: measurementData.notes || null,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error logging measurement:', error);
    throw error;
  }
};

export const getMeasurementsBySubscriber = async (subscriberId, startDate, endDate) => {
  try {
    let query = supabase
      .from('subscriber_measurements')
      .select('*')
      .eq('subscriber_id', subscriberId)
      .order('date', { ascending: false });

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting measurements:', error);
    return [];
  }
};

export const getLatestMeasurement = async (subscriberId) => {
  try {
    const { data, error } = await supabase
      .from('subscriber_measurements')
      .select('*')
      .eq('subscriber_id', subscriberId)
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return data || null;
  } catch (error) {
    console.error('Error getting latest measurement:', error);
    return null;
  }
};

export const updateMeasurement = async (measurementId, updates) => {
  try {
    const { data, error } = await supabase
      .from('subscriber_measurements')
      .update(updates)
      .eq('id', measurementId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating measurement:', error);
    throw error;
  }
};

export const deleteMeasurement = async (measurementId) => {
  try {
    const { error } = await supabase
      .from('subscriber_measurements')
      .delete()
      .eq('id', measurementId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting measurement:', error);
    throw error;
  }
};

// ==================== ANALYTICS ====================

export const getSubscriberProgress = async (subscriberId, days = 30) => {
  try {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Get meals
    const meals = await getMealsBySubscriber(subscriberId, startDate, endDate);
    
    // Get measurements
    const measurements = await getMeasurementsBySubscriber(subscriberId, startDate, endDate);

    // Calculate daily calorie intake
    const dailyCalories = meals.reduce((acc, meal) => {
      const date = meal.date;
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += meal.total_calories || 0;
      return acc;
    }, {});

    // Get weight trend
    const weightTrend = measurements
      .filter(m => m.weight)
      .map(m => ({ date: m.date, weight: m.weight }))
      .reverse();

    return {
      meals,
      measurements,
      dailyCalories,
      weightTrend,
      totalMeals: meals.length,
      averageCalories: Object.values(dailyCalories).length > 0 
        ? Object.values(dailyCalories).reduce((a, b) => a + b, 0) / Object.values(dailyCalories).length 
        : 0,
    };
  } catch (error) {
    console.error('Error getting subscriber progress:', error);
    return null;
  }
};

export const getDailyMealSummary = async (subscriberId, date) => {
  try {
    const meals = await getMealsBySubscriber(subscriberId, date, date);
    
    const summary = {
      breakfast: meals.filter(m => m.meal_type === 'breakfast'),
      lunch: meals.filter(m => m.meal_type === 'lunch'),
      dinner: meals.filter(m => m.meal_type === 'dinner'),
      snacks: meals.filter(m => m.meal_type === 'snack'),
      totalCalories: meals.reduce((sum, m) => sum + (m.total_calories || 0), 0),
    };

    return summary;
  } catch (error) {
    console.error('Error getting daily meal summary:', error);
    return null;
  }
};
