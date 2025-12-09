// Nutrient Calculation and Meal Plan Recommendation Service
import { calculatePricing } from '../utils/pricingUtils';

// Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
const calculateBMR = (weight, height, age, gender) => {
  // weight in kg, height in cm
  if (gender === 'male') {
    return (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else {
    return (10 * weight) + (6.25 * height) - (5 * age) - 161;
  }
};

// Calculate TDEE (Total Daily Energy Expenditure)
const calculateTDEE = (bmr, activityLevel) => {
  const activityMultipliers = {
    sedentary: 1.2,      // Little or no exercise
    light: 1.375,        // Light exercise 1-3 days/week
    moderate: 1.55,      // Moderate exercise 3-5 days/week
    active: 1.725,       // Heavy exercise 6-7 days/week
    veryActive: 1.9,     // Very heavy exercise, physical job
  };
  
  return bmr * (activityMultipliers[activityLevel] || 1.55);
};

// Calculate target calories based on goal
const calculateTargetCalories = (tdee, goal, targetWeight, currentWeight) => {
  const weightDiff = Math.abs(targetWeight - currentWeight);
  
  switch (goal) {
    case 'lose':
      // Create calorie deficit (500-750 cal/day for 0.5-1kg/week loss)
      return Math.round(tdee - 500);
    case 'gain':
      // Create calorie surplus (300-500 cal/day for lean muscle gain)
      return Math.round(tdee + 400);
    case 'maintain':
      return Math.round(tdee);
    default:
      return Math.round(tdee);
  }
};

// Calculate macronutrient distribution
const calculateMacros = (targetCalories, goal, dietType) => {
  let proteinPercentage, carbsPercentage, fatsPercentage;
  
  // Adjust based on goal
  switch (goal) {
    case 'lose':
      proteinPercentage = 0.35;  // Higher protein for muscle preservation
      carbsPercentage = 0.35;
      fatsPercentage = 0.30;
      break;
    case 'gain':
      proteinPercentage = 0.30;
      carbsPercentage = 0.45;    // Higher carbs for muscle building
      fatsPercentage = 0.25;
      break;
    case 'maintain':
      proteinPercentage = 0.30;
      carbsPercentage = 0.40;
      fatsPercentage = 0.30;
      break;
    default:
      proteinPercentage = 0.30;
      carbsPercentage = 0.40;
      fatsPercentage = 0.30;
  }
  
  // Adjust for diet type
  if (dietType === 'vegan' || dietType === 'veg') {
    carbsPercentage += 0.05;
    fatsPercentage -= 0.05;
  }
  
  return {
    protein: Math.round((targetCalories * proteinPercentage) / 4), // 4 cal/g
    carbs: Math.round((targetCalories * carbsPercentage) / 4),     // 4 cal/g
    fats: Math.round((targetCalories * fatsPercentage) / 9),       // 9 cal/g
  };
};

// Main nutrient calculation function
export const calculateNutrients = (formData) => {
  const {
    age,
    gender,
    height,
    weight,
    targetWeight,
    activityLevel,
    goal,
    dietType,
    sleepHours,
    stressLevel,
  } = formData;
  
  // Calculate BMR and TDEE
  const bmr = calculateBMR(weight, height, age, gender);
  const tdee = calculateTDEE(bmr, activityLevel);
  
  // Calculate target calories
  const targetCalories = calculateTargetCalories(tdee, goal, targetWeight, weight);
  
  // Calculate macros
  const macros = calculateMacros(targetCalories, goal, dietType);
  
  // Calculate water intake (ml)
  const waterIntake = Math.round(weight * 35); // 35ml per kg body weight
  
  // Estimate timeline (weeks to reach goal)
  const weightDiff = Math.abs(targetWeight - weight);
  const weeklyWeightChange = goal === 'lose' ? 0.5 : 0.3; // kg per week
  const estimatedWeeks = Math.ceil(weightDiff / weeklyWeightChange);
  
  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    targetCalories,
    protein: macros.protein,
    carbs: macros.carbs,
    fats: macros.fats,
    waterIntake,
    estimatedWeeks,
    calculatedAt: new Date().toISOString(),
  };
};

// Recommend meal plan based on nutrient profile
export const recommendMealPlan = (nutrientProfile, dietType) => {
  const { targetCalories, protein } = nutrientProfile;
  
  // Determine meals per day based on calories
  let mealsPerDay;
  if (targetCalories < 1500) {
    mealsPerDay = 2;
  } else if (targetCalories < 2200) {
    mealsPerDay = 2;
  } else {
    mealsPerDay = 3;
  }
  
  // Determine protein per meal
  const proteinPerMeal = Math.round(protein / mealsPerDay);
  let proteinLevel;
  if (proteinPerMeal < 35) {
    proteinLevel = 30;
  } else if (proteinPerMeal < 45) {
    proteinLevel = 40;
  } else if (proteinPerMeal < 55) {
    proteinLevel = 50;
  } else {
    proteinLevel = 60;
  }
  
  // Determine plan type based on diet
  let planType;
  if (dietType === 'non-veg') {
    planType = 'non-veg';
  } else if (dietType === 'veg') {
    planType = 'veg-eggs';
  } else {
    planType = 'pure-veg';
  }
  
  return {
    planType,
    mealsPerDay,
    proteinPerMeal: proteinLevel,
    recommendedFor: 'Based on your nutrient requirements',
  };
};

// Re-export centralized pricing function for backward compatibility
export const calculateMealPlanPricing = calculatePricing;

// Save nutrient profile to user
export const saveNutrientProfile = (userId, formData, nutrients, recommendation) => {
  const nutrientProfile = {
    calculatedDate: new Date().toISOString(),
    
    // Personal data
    height: formData.height,
    currentWeight: formData.weight,
    targetWeight: formData.targetWeight,
    muscleMass: formData.muscleMass || null,
    fatPercentage: formData.fatPercentage || null,
    waterContent: formData.waterContent || null,
    
    // Lifestyle
    activityLevel: formData.activityLevel,
    sleepHours: formData.sleepHours,
    stressLevel: formData.stressLevel,
    healthConditions: formData.healthConditions || [],
    
    // Calculated nutrients
    bmr: nutrients.bmr,
    tdee: nutrients.tdee,
    recommendedCalories: nutrients.targetCalories,
    recommendedProtein: nutrients.protein,
    recommendedCarbs: nutrients.carbs,
    recommendedFats: nutrients.fats,
    recommendedWater: nutrients.waterIntake,
    estimatedWeeks: nutrients.estimatedWeeks,
    
    // Meal plan recommendation
    recommendedPlan: recommendation,
  };
  
  return nutrientProfile;
};

// Get meal suggestions based on plan type
export const getMealSuggestions = (planType) => {
  const mealSuggestions = {
    'non-veg': [
      'Grilled Chicken Breast with Quinoa',
      'Chicken Salad with Olive Oil',
      'Egg White Omelette with Vegetables',
      'Grilled Fish with Brown Rice',
      'Chicken Stir-fry with Broccoli',
    ],
    'veg-eggs': [
      'Paneer Burji with Whole Wheat Toast',
      'Egg White Omelette with Spinach',
      'Greek Yogurt with Nuts and Berries',
      'Tofu Scramble with Vegetables',
      'Boiled Eggs with Avocado',
    ],
    'pure-veg': [
      'Paneer Tikka with Salad',
      'Sprouts Salad with Lemon',
      'Tofu Stir-fry with Vegetables',
      'Chickpea Salad with Olive Oil',
      'Quinoa Bowl with Mixed Vegetables',
    ],
  };
  
  return mealSuggestions[planType] || mealSuggestions['veg-eggs'];
};

// Validate nutrient profile data
export const validateNutrientData = (formData) => {
  const errors = [];
  
  if (!formData.age || formData.age < 15 || formData.age > 100) {
    errors.push('Age must be between 15 and 100');
  }
  
  if (!formData.weight || formData.weight < 30 || formData.weight > 300) {
    errors.push('Weight must be between 30 and 300 kg');
  }
  
  if (!formData.height || formData.height < 100 || formData.height > 250) {
    errors.push('Height must be between 100 and 250 cm');
  }
  
  if (!formData.targetWeight || formData.targetWeight < 30 || formData.targetWeight > 300) {
    errors.push('Target weight must be between 30 and 300 kg');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};
