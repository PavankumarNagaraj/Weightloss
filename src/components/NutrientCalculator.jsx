import React, { useState } from 'react';
import {
  Calculator,
  User,
  Ruler,
  Weight,
  Calendar,
  Target,
  Droplets,
  Activity,
  TrendingDown,
  TrendingUp,
  Minus,
  ChevronDown,
  ChevronUp,
  Apple,
  Beef,
  Leaf,
  Heart,
  Zap,
  Clock,
  Download,
  Share2,
  RotateCcw,
  Info,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Flame,
  Moon,
  Sun
} from 'lucide-react';

const NutrientCalculator = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'male',
    height: '',
    weight: '',
    targetWeight: '',
    muscleMass: '',
    fatPercentage: '',
    waterContent: '',
    activityLevel: 'moderate',
    goal: 'lose', // lose, gain, maintain
    dietType: 'non-veg', // non-veg, veg, vegan
    healthConditions: [],
    sleepHours: '7',
    stressLevel: 'moderate',
    mealsPerDay: '3'
  });
  
  const [results, setResults] = useState(null);
  const [showFoodSuggestions, setShowFoodSuggestions] = useState(true);
  const [showMealPlan, setShowMealPlan] = useState(false);
  const [showHealthTips, setShowHealthTips] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateNutrients = () => {
    const age = parseFloat(formData.age);
    const height = parseFloat(formData.height);
    const weight = parseFloat(formData.weight);
    const targetWeight = parseFloat(formData.targetWeight);
    const muscleMass = parseFloat(formData.muscleMass) || (weight * 0.35);
    const fatPercentage = parseFloat(formData.fatPercentage) || 25;
    const waterContent = parseFloat(formData.waterContent) || 60;

    // Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
    let bmr;
    if (formData.gender === 'male') {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }

    // Activity multiplier
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };

    // TDEE (Total Daily Energy Expenditure)
    const tdee = bmr * activityMultipliers[formData.activityLevel];

    // Calculate calories based on goal
    let targetCalories;
    let weeklyWeightChange;
    
    if (formData.goal === 'lose') {
      targetCalories = tdee - 500; // 500 calorie deficit
      weeklyWeightChange = -0.5; // kg per week
    } else if (formData.goal === 'gain') {
      targetCalories = tdee + 500; // 500 calorie surplus
      weeklyWeightChange = 0.5; // kg per week
    } else {
      targetCalories = tdee;
      weeklyWeightChange = 0;
    }

    // Calculate macros
    const proteinGrams = weight * 2.2; // 2.2g per kg for muscle maintenance/growth
    const proteinCalories = proteinGrams * 4;
    
    const fatGrams = (targetCalories * 0.25) / 9; // 25% of calories from fat
    const fatCalories = fatGrams * 9;
    
    const carbCalories = targetCalories - proteinCalories - fatCalories;
    const carbGrams = carbCalories / 4;

    // Calculate water intake
    const waterIntake = weight * 35; // 35ml per kg

    // Calculate time to reach goal
    const weightDifference = Math.abs(targetWeight - weight);
    const weeksToGoal = weightDifference / Math.abs(weeklyWeightChange) || 0;

    setResults({
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      maintenanceCalories: Math.round(tdee),
      targetCalories: Math.round(targetCalories),
      protein: Math.round(proteinGrams),
      carbs: Math.round(carbGrams),
      fats: Math.round(fatGrams),
      water: Math.round(waterIntake),
      weeklyWeightChange,
      weeksToGoal: Math.round(weeksToGoal),
      currentBMI: (weight / ((height / 100) ** 2)).toFixed(1),
      targetBMI: (targetWeight / ((height / 100) ** 2)).toFixed(1),
      muscleMass,
      fatPercentage,
      waterContent
    });

    setStep(2);
  };

  const getFoodSuggestions = () => {
    const suggestions = {
      'non-veg': {
        breakfast: [
          { name: 'Scrambled Eggs (3 eggs)', protein: 18, carbs: 2, fats: 15, calories: 210 },
          { name: 'Oatmeal with Milk', protein: 10, carbs: 45, fats: 5, calories: 260 },
          { name: 'Chicken Sausage (2)', protein: 14, carbs: 3, fats: 8, calories: 140 },
          { name: 'Whole Wheat Toast (2 slices)', protein: 8, carbs: 30, fats: 2, calories: 160 }
        ],
        lunch: [
          { name: 'Grilled Chicken Breast (200g)', protein: 60, carbs: 0, fats: 8, calories: 320 },
          { name: 'Brown Rice (1 cup)', protein: 5, carbs: 45, fats: 2, calories: 215 },
          { name: 'Mixed Vegetables', protein: 3, carbs: 15, fats: 1, calories: 80 },
          { name: 'Fish Curry (150g)', protein: 35, carbs: 5, fats: 10, calories: 250 }
        ],
        dinner: [
          { name: 'Grilled Salmon (150g)', protein: 35, carbs: 0, fats: 15, calories: 280 },
          { name: 'Quinoa (1 cup)', protein: 8, carbs: 40, fats: 4, calories: 220 },
          { name: 'Turkey Breast (150g)', protein: 45, carbs: 0, fats: 3, calories: 210 },
          { name: 'Sweet Potato (medium)', protein: 2, carbs: 25, fats: 0, calories: 110 }
        ],
        snacks: [
          { name: 'Greek Yogurt (200g)', protein: 20, carbs: 10, fats: 5, calories: 160 },
          { name: 'Protein Shake', protein: 25, carbs: 5, fats: 3, calories: 150 },
          { name: 'Boiled Eggs (2)', protein: 12, carbs: 1, fats: 10, calories: 140 },
          { name: 'Tuna Salad', protein: 30, carbs: 5, fats: 8, calories: 210 }
        ]
      },
      'veg': {
        breakfast: [
          { name: 'Paneer Bhurji (150g)', protein: 20, carbs: 5, fats: 15, calories: 240 },
          { name: 'Oatmeal with Nuts', protein: 12, carbs: 45, fats: 10, calories: 310 },
          { name: 'Greek Yogurt with Berries', protein: 15, carbs: 20, fats: 5, calories: 180 },
          { name: 'Whole Wheat Paratha (2)', protein: 8, carbs: 40, fats: 8, calories: 260 }
        ],
        lunch: [
          { name: 'Dal (Lentils) - 1 cup', protein: 18, carbs: 40, fats: 1, calories: 230 },
          { name: 'Brown Rice (1 cup)', protein: 5, carbs: 45, fats: 2, calories: 215 },
          { name: 'Paneer Tikka (150g)', protein: 25, carbs: 8, fats: 18, calories: 300 },
          { name: 'Mixed Vegetable Curry', protein: 5, carbs: 20, fats: 8, calories: 160 }
        ],
        dinner: [
          { name: 'Chickpea Curry (1 cup)', protein: 15, carbs: 45, fats: 4, calories: 270 },
          { name: 'Quinoa Salad', protein: 10, carbs: 35, fats: 8, calories: 240 },
          { name: 'Cottage Cheese (200g)', protein: 28, carbs: 6, fats: 8, calories: 200 },
          { name: 'Vegetable Stir-fry', protein: 6, carbs: 25, fats: 10, calories: 200 }
        ],
        snacks: [
          { name: 'Paneer Cubes (100g)', protein: 18, carbs: 3, fats: 13, calories: 200 },
          { name: 'Protein Smoothie', protein: 20, carbs: 25, fats: 5, calories: 220 },
          { name: 'Roasted Chickpeas', protein: 8, carbs: 20, fats: 3, calories: 135 },
          { name: 'Cheese & Crackers', protein: 12, carbs: 15, fats: 10, calories: 190 }
        ]
      },
      'vegan': {
        breakfast: [
          { name: 'Tofu Scramble (200g)', protein: 20, carbs: 4, fats: 10, calories: 180 },
          { name: 'Oatmeal with Almond Milk', protein: 8, carbs: 45, fats: 8, calories: 280 },
          { name: 'Chia Pudding', protein: 6, carbs: 30, fats: 12, calories: 250 },
          { name: 'Whole Grain Toast with Avocado', protein: 8, carbs: 35, fats: 15, calories: 300 }
        ],
        lunch: [
          { name: 'Lentil Soup (2 cups)', protein: 18, carbs: 40, fats: 2, calories: 240 },
          { name: 'Quinoa Bowl', protein: 12, carbs: 50, fats: 8, calories: 320 },
          { name: 'Tempeh Stir-fry (150g)', protein: 25, carbs: 15, fats: 12, calories: 280 },
          { name: 'Brown Rice & Beans', protein: 15, carbs: 55, fats: 3, calories: 300 }
        ],
        dinner: [
          { name: 'Chickpea Curry (1.5 cups)', protein: 20, carbs: 60, fats: 6, calories: 360 },
          { name: 'Tofu & Vegetable Stir-fry', protein: 22, carbs: 20, fats: 14, calories: 300 },
          { name: 'Black Bean Burger', protein: 18, carbs: 40, fats: 8, calories: 300 },
          { name: 'Seitan with Vegetables', protein: 30, carbs: 15, fats: 5, calories: 220 }
        ],
        snacks: [
          { name: 'Hummus with Veggies', protein: 8, carbs: 20, fats: 10, calories: 200 },
          { name: 'Vegan Protein Shake', protein: 25, carbs: 10, fats: 5, calories: 190 },
          { name: 'Almond Butter & Apple', protein: 7, carbs: 25, fats: 16, calories: 270 },
          { name: 'Edamame (1 cup)', protein: 17, carbs: 15, fats: 8, calories: 190 }
        ]
      }
    };

    return suggestions[formData.dietType];
  };

  const resetCalculator = () => {
    setStep(1);
    setResults(null);
    setFormData({
      name: '',
      age: '',
      gender: 'male',
      height: '',
      weight: '',
      targetWeight: '',
      muscleMass: '',
      fatPercentage: '',
      waterContent: '',
      activityLevel: 'moderate',
      goal: 'lose',
      dietType: 'non-veg'
    });
  };

  if (!isOpen && !isStandalone) return null;

  return (
    <div className={`${isStandalone ? '' : 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'}`}>
      <div className={`bg-white rounded-xl shadow-2xl ${isStandalone ? 'w-full h-full' : 'max-w-4xl w-full max-h-[90vh]'} overflow-hidden flex flex-col`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calculator className="w-6 h-6" />
            <h2 className="text-2xl font-bold">Nutrient Calculator</h2>
          </div>
          {!isStandalone && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 ? (
            // Input Form
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Years"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
                    <input
                      type="number"
                      name="height"
                      value={formData.height}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="e.g., 170"
                    />
                  </div>
                </div>
              </div>

              {/* Body Composition */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Body Composition
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Weight (kg)</label>
                    <input
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="e.g., 75"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Weight (kg)</label>
                    <input
                      type="number"
                      name="targetWeight"
                      value={formData.targetWeight}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="e.g., 70"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Muscle Mass (kg) - Optional</label>
                    <input
                      type="number"
                      name="muscleMass"
                      value={formData.muscleMass}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Leave empty for estimate"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Body Fat (%) - Optional</label>
                    <input
                      type="number"
                      name="fatPercentage"
                      value={formData.fatPercentage}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Leave empty for estimate"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Body Water (%) - Optional</label>
                    <input
                      type="number"
                      name="waterContent"
                      value={formData.waterContent}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Leave empty for estimate"
                    />
                  </div>
                </div>
              </div>

              {/* Goals & Preferences */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Goals & Preferences
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Activity Level</label>
                    <select
                      name="activityLevel"
                      value={formData.activityLevel}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="sedentary">Sedentary (little/no exercise)</option>
                      <option value="light">Light (1-3 days/week)</option>
                      <option value="moderate">Moderate (3-5 days/week)</option>
                      <option value="active">Active (6-7 days/week)</option>
                      <option value="very_active">Very Active (2x per day)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Goal</label>
                    <select
                      name="goal"
                      value={formData.goal}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="lose">Lose Weight</option>
                      <option value="maintain">Maintain Weight</option>
                      <option value="gain">Gain Weight</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Diet Type</label>
                    <select
                      name="dietType"
                      value={formData.dietType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="non-veg">Non-Vegetarian</option>
                      <option value="veg">Vegetarian</option>
                      <option value="vegan">Vegan</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Calculate Button */}
              <button
                onClick={calculateNutrients}
                disabled={!formData.age || !formData.height || !formData.weight || !formData.targetWeight}
                className="w-full bg-primary text-white py-3 rounded-lg font-bold text-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Calculator className="w-5 h-5" />
                Calculate Nutrients
              </button>
            </div>
          ) : (
            // Results
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm opacity-90">Current BMI</span>
                    <Weight className="w-5 h-5" />
                  </div>
                  <div className="text-3xl font-bold">{results.currentBMI}</div>
                  <div className="text-xs opacity-75 mt-1">
                    {results.currentBMI < 18.5 ? 'Underweight' : 
                     results.currentBMI < 25 ? 'Normal' : 
                     results.currentBMI < 30 ? 'Overweight' : 'Obese'}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm opacity-90">Target BMI</span>
                    <Target className="w-5 h-5" />
                  </div>
                  <div className="text-3xl font-bold">{results.targetBMI}</div>
                  <div className="text-xs opacity-75 mt-1">
                    {results.targetBMI < 18.5 ? 'Underweight' : 
                     results.targetBMI < 25 ? 'Normal' : 
                     results.targetBMI < 30 ? 'Overweight' : 'Obese'}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm opacity-90">Time to Goal</span>
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="text-3xl font-bold">{results.weeksToGoal}</div>
                  <div className="text-xs opacity-75 mt-1">weeks</div>
                </div>
              </div>

              {/* Calorie Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Calorie Requirements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Maintenance Calories</span>
                      <Minus className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="text-2xl font-bold text-gray-800">{results.maintenanceCalories}</div>
                    <div className="text-xs text-gray-500 mt-1">To maintain current weight</div>
                  </div>

                  <div className="bg-primary/10 rounded-lg p-4 border-2 border-primary">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-primary">Target Calories</span>
                      {formData.goal === 'lose' ? <TrendingDown className="w-4 h-4 text-primary" /> : 
                       formData.goal === 'gain' ? <TrendingUp className="w-4 h-4 text-primary" /> : 
                       <Minus className="w-4 h-4 text-primary" />}
                    </div>
                    <div className="text-2xl font-bold text-primary">{results.targetCalories}</div>
                    <div className="text-xs text-primary/70 mt-1">
                      To {formData.goal} weight ({results.weeklyWeightChange > 0 ? '+' : ''}{results.weeklyWeightChange} kg/week)
                    </div>
                  </div>
                </div>
              </div>

              {/* Macronutrients */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Daily Macronutrients</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-red-600">{results.protein}g</div>
                    <div className="text-sm text-gray-600 mt-1">Protein</div>
                    <div className="text-xs text-gray-400 mt-1">{Math.round((results.protein * 4 / results.targetCalories) * 100)}%</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-yellow-600">{results.carbs}g</div>
                    <div className="text-sm text-gray-600 mt-1">Carbs</div>
                    <div className="text-xs text-gray-400 mt-1">{Math.round((results.carbs * 4 / results.targetCalories) * 100)}%</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-orange-600">{results.fats}g</div>
                    <div className="text-sm text-gray-600 mt-1">Fats</div>
                    <div className="text-xs text-gray-400 mt-1">{Math.round((results.fats * 9 / results.targetCalories) * 100)}%</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-blue-600">{results.water}ml</div>
                    <div className="text-sm text-gray-600 mt-1">Water</div>
                    <div className="text-xs text-gray-400 mt-1">Daily intake</div>
                  </div>
                </div>
              </div>

              {/* Food Suggestions */}
              <div className="bg-gray-50 rounded-lg p-6">
                <button
                  onClick={() => setShowFoodSuggestions(!showFoodSuggestions)}
                  className="w-full flex items-center justify-between text-xl font-bold text-gray-800 mb-4"
                >
                  <span className="flex items-center gap-2">
                    {formData.dietType === 'non-veg' ? <Beef className="w-5 h-5 text-primary" /> :
                     formData.dietType === 'veg' ? <Apple className="w-5 h-5 text-primary" /> :
                     <Leaf className="w-5 h-5 text-primary" />}
                    Food Suggestions ({formData.dietType === 'non-veg' ? 'Non-Vegetarian' : 
                                       formData.dietType === 'veg' ? 'Vegetarian' : 'Vegan'})
                  </span>
                  {showFoodSuggestions ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>

                {showFoodSuggestions && (
                  <div className="space-y-4">
                    {Object.entries(getFoodSuggestions()).map(([mealType, foods]) => (
                      <div key={mealType} className="bg-white rounded-lg p-4">
                        <h4 className="font-bold text-gray-800 mb-3 capitalize">{mealType}</h4>
                        <div className="space-y-2">
                          {foods.map((food, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span className="text-sm font-medium text-gray-700">{food.name}</span>
                              <div className="flex gap-3 text-xs">
                                <span className="text-red-600">P: {food.protein}g</span>
                                <span className="text-yellow-600">C: {food.carbs}g</span>
                                <span className="text-orange-600">F: {food.fats}g</span>
                                <span className="text-gray-600 font-bold">{food.calories} cal</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={resetCalculator}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-bold hover:bg-gray-300 transition"
                >
                  New Calculation
                </button>
                {!isStandalone && (
                  <button
                    onClick={onClose}
                    className="flex-1 bg-primary text-white py-3 rounded-lg font-bold hover:bg-primary/90 transition"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NutrientCalculator;
