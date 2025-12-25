// Nutrition Reference Service
// Provides nutritional data lookup and auto-suggestions for inventory items

import { supabase } from '../config/supabase';

// Get all nutrition reference data
export const getNutritionReference = async () => {
  try {
    const { data, error } = await supabase
      .from('nutrition_reference')
      .select('*')
      .order('ingredient_name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting nutrition reference:', error);
    return [];
  }
};

// Search nutrition reference by ingredient name
export const searchNutritionReference = async (searchTerm) => {
  try {
    const { data, error } = await supabase
      .from('nutrition_reference')
      .select('*')
      .ilike('ingredient_name', `%${searchTerm}%`)
      .limit(10);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching nutrition reference:', error);
    return [];
  }
};

// Get nutrition data by exact ingredient name
export const getNutritionByName = async (ingredientName) => {
  try {
    const { data, error } = await supabase
      .from('nutrition_reference')
      .select('*')
      .ilike('ingredient_name', ingredientName)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (error) {
    console.error('Error getting nutrition by name:', error);
    return null;
  }
};

// Get nutrition reference by category
export const getNutritionByCategory = async (category) => {
  try {
    const { data, error } = await supabase
      .from('nutrition_reference')
      .select('*')
      .eq('category', category)
      .order('ingredient_name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting nutrition by category:', error);
    return [];
  }
};

// Get all categories
export const getNutritionCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('nutrition_reference')
      .select('category')
      .order('category');

    if (error) throw error;
    
    // Get unique categories
    const categories = [...new Set(data.map(item => item.category))];
    return categories;
  } catch (error) {
    console.error('Error getting categories:', error);
    return [];
  }
};

// Add new nutrition reference entry
export const addNutritionReference = async (data) => {
  try {
    const { data: result, error } = await supabase
      .from('nutrition_reference')
      .insert([{
        ingredient_name: data.ingredientName,
        category: data.category,
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat,
        fiber: data.fiber,
        common_unit: data.commonUnit,
        indian_name: data.indianName,
      }])
      .select()
      .single();

    if (error) throw error;
    return result;
  } catch (error) {
    console.error('Error adding nutrition reference:', error);
    throw error;
  }
};
