import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../config/supabaseClient';

const PublicMealPlan = () => {
  const { planId } = useParams();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedDays, setExpandedDays] = useState({});

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

  useEffect(() => {
    fetchPublicMealPlan();
  }, [planId]);

  const fetchPublicMealPlan = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('cafe_weekly_meal_plans')
        .select('*')
        .eq('is_public', true);
      
      if (planId === 'this-week') {
        // Fetch current week's plan based on today's date
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        query = query
          .lte('week_start_date', todayStr)
          .gte('week_end_date', todayStr)
          .order('week_start_date', { ascending: false })
          .limit(1)
          .single();
      } else {
        // Fetch by specific plan ID
        query = query.eq('id', planId).single();
      }
      
      const { data, error } = await query;

      if (error) throw error;
      
      if (!data) {
        setError(planId === 'this-week' 
          ? 'No public meal plan available for this week' 
          : 'Meal plan not found or not available publicly');
        return;
      }

      setPlan(data);
    } catch (err) {
      console.error('Error fetching public meal plan:', err);
      setError('Failed to load meal plan');
    } finally {
      setLoading(false);
    }
  };

  const calculateNutritionSummary = (plan) => {
    if (!plan || !plan.meals) return null;

    const summary = {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      totalFiber: 0,
      mealCount: 0,
      micronutrients: {
        vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0, vitaminK: 0,
        vitaminB1: 0, vitaminB2: 0, vitaminB3: 0, vitaminB6: 0, vitaminB12: 0,
        folate: 0, calcium: 0, iron: 0, magnesium: 0, phosphorus: 0,
        potassium: 0, sodium: 0, zinc: 0, copper: 0, manganese: 0, selenium: 0
      }
    };

    daysOfWeek.forEach(day => {
      mealTypes.forEach(type => {
        const items = plan.meals[day]?.[type] || [];
        items.forEach(item => {
          summary.totalCalories += parseFloat(item.calories) || 0;
          summary.totalProtein += parseFloat(item.protein) || 0;
          summary.totalCarbs += parseFloat(item.carbs) || 0;
          summary.totalFat += parseFloat(item.fat) || 0;
          summary.totalFiber += parseFloat(item.fiber) || 0;
          summary.mealCount++;

          if (item.raw_materials && Array.isArray(item.raw_materials)) {
            item.raw_materials.forEach(material => {
              const qty = parseFloat(material.quantity) || 0;
              const factor = qty / 100;

              summary.micronutrients.vitaminA += (material.vitamin_a_mcg || 0) * factor;
              summary.micronutrients.vitaminC += (material.vitamin_c_mg || 0) * factor;
              summary.micronutrients.vitaminD += (material.vitamin_d_mcg || 0) * factor;
              summary.micronutrients.vitaminE += (material.vitamin_e_mg || 0) * factor;
              summary.micronutrients.vitaminK += (material.vitamin_k_mcg || 0) * factor;
              summary.micronutrients.vitaminB1 += (material.vitamin_b1_mg || 0) * factor;
              summary.micronutrients.vitaminB2 += (material.vitamin_b2_mg || 0) * factor;
              summary.micronutrients.vitaminB3 += (material.vitamin_b3_mg || 0) * factor;
              summary.micronutrients.vitaminB6 += (material.vitamin_b6_mg || 0) * factor;
              summary.micronutrients.vitaminB12 += (material.vitamin_b12_mcg || 0) * factor;
              summary.micronutrients.folate += (material.folate_mcg || 0) * factor;
              summary.micronutrients.calcium += (material.calcium_mg || 0) * factor;
              summary.micronutrients.iron += (material.iron_mg || 0) * factor;
              summary.micronutrients.magnesium += (material.magnesium_mg || 0) * factor;
              summary.micronutrients.phosphorus += (material.phosphorus_mg || 0) * factor;
              summary.micronutrients.potassium += (material.potassium_mg || 0) * factor;
              summary.micronutrients.sodium += (material.sodium_mg || 0) * factor;
              summary.micronutrients.zinc += (material.zinc_mg || 0) * factor;
              summary.micronutrients.copper += (material.copper_mg || 0) * factor;
              summary.micronutrients.manganese += (material.manganese_mg || 0) * factor;
              summary.micronutrients.selenium += (material.selenium_mcg || 0) * factor;
            });
          }
        });
      });
    });

    return summary;
  };

  const getDayCalories = (plan, day) => {
    if (!plan || !plan.meals || !plan.meals[day]) return 0;
    let total = 0;
    mealTypes.forEach(type => {
      const items = plan.meals[day][type] || [];
      items.forEach(item => {
        total += parseFloat(item.calories) || 0;
      });
    });
    return total;
  };

  const getMealCalories = (plan, day, mealType) => {
    if (!plan || !plan.meals || !plan.meals[day] || !plan.meals[day][mealType]) return 0;
    const items = plan.meals[day][mealType] || [];
    return items.reduce((sum, item) => sum + (parseFloat(item.calories) || 0), 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading meal plan...</p>
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md border border-gray-200">
          <div className="text-red-500 text-center">
            <h2 className="text-2xl font-bold mb-2">Oops!</h2>
            <p>{error || 'Meal plan not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  const summary = calculateNutritionSummary(plan);

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto p-3 sm:p-6 md:p-8">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{plan.plan_name}</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Weekly Meal Schedule & Nutrition Summary</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {new Date(plan.week_start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })} - {new Date(plan.week_end_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">📊 Weekly Nutrition Summary</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-orange-600">{summary.totalCalories.toFixed(0)}</div>
              <div className="text-xs sm:text-sm text-gray-600">Total Calories</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">{summary.totalProtein.toFixed(1)}g</div>
              <div className="text-xs sm:text-sm text-gray-600">Protein</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-yellow-600">{summary.totalCarbs.toFixed(1)}g</div>
              <div className="text-xs sm:text-sm text-gray-600">Carbs</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-red-600">{summary.totalFat.toFixed(1)}g</div>
              <div className="text-xs sm:text-sm text-gray-600">Fat</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-green-600">{summary.totalFiber.toFixed(1)}g</div>
              <div className="text-xs sm:text-sm text-gray-600">Fiber</div>
            </div>
          </div>
          <div className="mt-3 text-center text-sm text-gray-600">
            Total Meals: <span className="font-bold">{summary.mealCount}</span> | 
            Avg Calories/Meal: <span className="font-bold">{summary.mealCount > 0 ? (summary.totalCalories / summary.mealCount).toFixed(0) : 0}</span>
          </div>
          
          <div className="mt-4 pt-4 border-t-2 border-orange-200">
            <h3 className="text-lg font-bold text-gray-900 mb-3">💎 Weekly Micronutrients Total</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2 uppercase">Vitamins</h4>
                <div className="space-y-1">
                  {[
                    { name: '�� Vitamin A', value: summary.micronutrients.vitaminA, unit: 'mcg' },
                    { name: '🍊 Vitamin C', value: summary.micronutrients.vitaminC, unit: 'mg' },
                    { name: '☀️ Vitamin D', value: summary.micronutrients.vitaminD, unit: 'mcg' },
                    { name: '🌰 Vitamin E', value: summary.micronutrients.vitaminE, unit: 'mg' },
                    { name: '🥬 Vitamin K', value: summary.micronutrients.vitaminK, unit: 'mcg' },
                    { name: '🌾 Vitamin B1', value: summary.micronutrients.vitaminB1, unit: 'mg' },
                    { name: '🥛 Vitamin B2', value: summary.micronutrients.vitaminB2, unit: 'mg' },
                    { name: '🍗 Vitamin B3', value: summary.micronutrients.vitaminB3, unit: 'mg' },
                    { name: '🥑 Vitamin B6', value: summary.micronutrients.vitaminB6, unit: 'mg' },
                    { name: '🥩 Vitamin B12', value: summary.micronutrients.vitaminB12, unit: 'mcg' },
                    { name: '🥗 Folate', value: summary.micronutrients.folate, unit: 'mcg' },
                  ].filter(v => v.value > 0.01).map((vitamin, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs bg-white/70 rounded px-2 py-1">
                      <span className="font-medium">{vitamin.name}</span>
                      <span className="font-bold text-gray-900">{vitamin.value.toFixed(2)} {vitamin.unit}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2 uppercase">Minerals</h4>
                <div className="space-y-1">
                  {[
                    { name: '🦴 Calcium', value: summary.micronutrients.calcium, unit: 'mg' },
                    { name: '🩸 Iron', value: summary.micronutrients.iron, unit: 'mg' },
                    { name: '💪 Magnesium', value: summary.micronutrients.magnesium, unit: 'mg' },
                    { name: '🧠 Phosphorus', value: summary.micronutrients.phosphorus, unit: 'mg' },
                    { name: '❤️ Potassium', value: summary.micronutrients.potassium, unit: 'mg' },
                    { name: '🧂 Sodium', value: summary.micronutrients.sodium, unit: 'mg' },
                    { name: '🛡️ Zinc', value: summary.micronutrients.zinc, unit: 'mg' },
                    { name: '🔶 Copper', value: summary.micronutrients.copper, unit: 'mg' },
                    { name: '🌿 Manganese', value: summary.micronutrients.manganese, unit: 'mg' },
                    { name: '⚡ Selenium', value: summary.micronutrients.selenium, unit: 'mcg' },
                  ].filter(m => m.value > 0.01).map((mineral, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs bg-white/70 rounded px-2 py-1">
                      <span className="font-medium">{mineral.name}</span>
                      <span className="font-bold text-gray-900">{mineral.value.toFixed(2)} {mineral.unit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">📅 Weekly Meal Schedule</h2>
          <div className="overflow-x-auto -mx-3 sm:mx-0">
          <table className="w-full border-collapse border border-gray-300 min-w-[640px]">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Day</th>
                {mealTypes.map(type => (
                  <th key={type} className="border border-gray-300 px-3 py-2 text-left font-semibold">{type}</th>
                ))}
                <th className="border border-gray-300 px-3 py-2 text-center font-semibold bg-orange-100">Day Total</th>
              </tr>
            </thead>
            <tbody>
              {daysOfWeek.map(day => (
                <tr key={day} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-3 py-2 font-semibold bg-gray-50">{day}</td>
                  {mealTypes.map(type => {
                    const mealItems = plan.meals[day]?.[type] || [];
                    const mealCal = getMealCalories(plan, day, type);
                    return (
                      <td key={type} className="border border-gray-300 px-3 py-2">
                        {mealItems.length > 0 ? (
                          <div className="space-y-1">
                            {mealItems.map((item, idx) => (
                              <div key={idx} className="text-sm">
                                <div className="font-medium">{item.name}</div>
                                <div className="text-xs text-gray-600">{item.calories} cal</div>
                              </div>
                            ))}
                            {mealItems.length > 1 && (
                              <div className="text-xs font-bold text-orange-600 pt-1 border-t border-gray-200">
                                Meal: {mealCal.toFixed(0)} cal
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400 italic">Not assigned</div>
                        )}
                      </td>
                    );
                  })}
                  <td className="border border-gray-300 px-3 py-2 text-center bg-orange-50">
                    <div className="font-bold text-orange-600">{getDayCalories(plan, day).toFixed(0)}</div>
                    <div className="text-xs text-gray-600">cal</div>
                  </td>
                </tr>
              ))}
              <tr className="bg-gradient-to-r from-orange-100 to-red-100 font-bold">
                <td className="border border-gray-300 px-3 py-2" colSpan={mealTypes.length + 1}>Week Total</td>
                <td className="border border-gray-300 px-3 py-2 text-center">
                  <div className="text-xl text-orange-600">{summary.totalCalories.toFixed(0)}</div>
                  <div className="text-xs text-gray-700">cal</div>
                </td>
              </tr>
            </tbody>
          </table>
          </div>
        </div>

        {/* Detailed Nutrition Breakdown - All Items */}
        <div className="mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">🍽️ Detailed Nutrition Breakdown - All Items</h2>
          <div className="space-y-3 sm:space-y-6">
            {daysOfWeek.map(day => {
              const dayItems = [];
              mealTypes.forEach(type => {
                const items = plan.meals[day]?.[type] || [];
                items.forEach(item => {
                  dayItems.push({ ...item, mealType: type });
                });
              });
              
              if (dayItems.length === 0) return null;
              
              const isExpanded = expandedDays[day];
              const toggleDay = () => {
                setExpandedDays(prev => ({ ...prev, [day]: !prev[day] }));
              };
              
              return (
                <div key={day} className="border border-gray-300 rounded-lg bg-white">
                  <button
                    onClick={toggleDay}
                    className="w-full flex items-center justify-between p-2 sm:p-3 hover:bg-gray-50 transition-colors">
                    <h3 className="font-bold text-base sm:text-lg text-gray-900">
                      {day} - {getDayCalories(plan, day).toFixed(0)} cal
                    </h3>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="space-y-3 sm:space-y-4 p-2 sm:p-3 pt-0 border-t border-gray-200">
                    {dayItems.map((item, idx) => {
                      const totalMacros = (parseFloat(item.protein) || 0) + (parseFloat(item.carbs) || 0) + (parseFloat(item.fat) || 0);
                      const proteinPct = totalMacros > 0 ? ((parseFloat(item.protein) || 0) / totalMacros * 100).toFixed(1) : 0;
                      const carbsPct = totalMacros > 0 ? ((parseFloat(item.carbs) || 0) / totalMacros * 100).toFixed(1) : 0;
                      const fatPct = totalMacros > 0 ? ((parseFloat(item.fat) || 0) / totalMacros * 100).toFixed(1) : 0;
                      const fiberPct = totalMacros > 0 ? ((parseFloat(item.fiber) || 0) / totalMacros * 100).toFixed(1) : 0;
                      
                      const micronutrients = {
                        vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0, vitaminK: 0,
                        vitaminB1: 0, vitaminB2: 0, vitaminB3: 0, vitaminB6: 0, vitaminB12: 0, folate: 0,
                        calcium: 0, iron: 0, magnesium: 0, phosphorus: 0, potassium: 0, sodium: 0,
                        zinc: 0, copper: 0, manganese: 0, selenium: 0
                      };
                      
                      if (item.raw_materials && Array.isArray(item.raw_materials)) {
                        item.raw_materials.forEach(material => {
                          const qty = parseFloat(material.quantity) || 0;
                          const factor = qty / 100;
                          
                          micronutrients.vitaminA += (material.vitamin_a_mcg || 0) * factor;
                          micronutrients.vitaminC += (material.vitamin_c_mg || 0) * factor;
                          micronutrients.vitaminD += (material.vitamin_d_mcg || 0) * factor;
                          micronutrients.vitaminE += (material.vitamin_e_mg || 0) * factor;
                          micronutrients.vitaminK += (material.vitamin_k_mcg || 0) * factor;
                          micronutrients.vitaminB1 += (material.vitamin_b1_mg || 0) * factor;
                          micronutrients.vitaminB2 += (material.vitamin_b2_mg || 0) * factor;
                          micronutrients.vitaminB3 += (material.vitamin_b3_mg || 0) * factor;
                          micronutrients.vitaminB6 += (material.vitamin_b6_mg || 0) * factor;
                          micronutrients.vitaminB12 += (material.vitamin_b12_mcg || 0) * factor;
                          micronutrients.folate += (material.folate_mcg || 0) * factor;
                          micronutrients.calcium += (material.calcium_mg || 0) * factor;
                          micronutrients.iron += (material.iron_mg || 0) * factor;
                          micronutrients.magnesium += (material.magnesium_mg || 0) * factor;
                          micronutrients.phosphorus += (material.phosphorus_mg || 0) * factor;
                          micronutrients.potassium += (material.potassium_mg || 0) * factor;
                          micronutrients.sodium += (material.sodium_mg || 0) * factor;
                          micronutrients.zinc += (material.zinc_mg || 0) * factor;
                          micronutrients.copper += (material.copper_mg || 0) * factor;
                          micronutrients.manganese += (material.manganese_mg || 0) * factor;
                          micronutrients.selenium += (material.selenium_mcg || 0) * factor;
                        });
                      }
                      
                      const vitamins = [
                        { name: '🥕 Vitamin A', value: micronutrients.vitaminA, unit: 'mcg', color: 'text-orange-600' },
                        { name: '🍊 Vitamin C', value: micronutrients.vitaminC, unit: 'mg', color: 'text-orange-500' },
                        { name: '☀️ Vitamin D', value: micronutrients.vitaminD, unit: 'mcg', color: 'text-yellow-600' },
                        { name: '🌰 Vitamin E', value: micronutrients.vitaminE, unit: 'mg', color: 'text-amber-600' },
                        { name: '🥬 Vitamin K', value: micronutrients.vitaminK, unit: 'mcg', color: 'text-green-600' },
                        { name: '🌾 Vitamin B1', value: micronutrients.vitaminB1, unit: 'mg', color: 'text-yellow-700' },
                        { name: '🥛 Vitamin B2', value: micronutrients.vitaminB2, unit: 'mg', color: 'text-blue-600' },
                        { name: '🍗 Vitamin B3', value: micronutrients.vitaminB3, unit: 'mg', color: 'text-red-600' },
                        { name: '🥑 Vitamin B6', value: micronutrients.vitaminB6, unit: 'mg', color: 'text-green-700' },
                        { name: '🥩 Vitamin B12', value: micronutrients.vitaminB12, unit: 'mcg', color: 'text-red-700' },
                        { name: '🥗 Folate', value: micronutrients.folate, unit: 'mcg', color: 'text-green-500' },
                      ];
                      
                      const minerals = [
                        { name: '🦴 Calcium', value: micronutrients.calcium, unit: 'mg', color: 'text-gray-600' },
                        { name: '🩸 Iron', value: micronutrients.iron, unit: 'mg', color: 'text-red-800' },
                        { name: '💪 Magnesium', value: micronutrients.magnesium, unit: 'mg', color: 'text-purple-600' },
                        { name: '🧠 Phosphorus', value: micronutrients.phosphorus, unit: 'mg', color: 'text-indigo-600' },
                        { name: '❤️ Potassium', value: micronutrients.potassium, unit: 'mg', color: 'text-pink-600' },
                        { name: '🧂 Sodium', value: micronutrients.sodium, unit: 'mg', color: 'text-blue-400' },
                        { name: '🛡️ Zinc', value: micronutrients.zinc, unit: 'mg', color: 'text-cyan-600' },
                        { name: '🔶 Copper', value: micronutrients.copper, unit: 'mg', color: 'text-orange-700' },
                        { name: '🌿 Manganese', value: micronutrients.manganese, unit: 'mg', color: 'text-lime-600' },
                        { name: '⚡ Selenium', value: micronutrients.selenium, unit: 'mcg', color: 'text-teal-600' },
                      ];
                      
                      return (
                        <div key={idx} className="border border-gray-200 rounded p-2 sm:p-3 bg-gray-50">
                          <div className="mb-2 sm:mb-3">
                            <div className="flex items-center justify-between mb-1">
                              <div>
                                <h4 className="font-bold text-sm sm:text-base text-gray-900">{item.name}</h4>
                                <p className="text-xs sm:text-sm text-gray-500">({item.mealType})</p>
                              </div>
                              <div className="text-right">
                                <div className="text-lg sm:text-xl font-bold text-orange-600">{parseFloat(item.calories).toFixed(0)}</div>
                                <div className="text-xs text-gray-600">cal</div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mb-2 sm:mb-3">
                            <h5 className="font-semibold text-xs sm:text-sm text-gray-700 mb-1 sm:mb-2">🍴 Macros</h5>
                            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                              <div className="bg-white rounded p-2 border border-gray-200">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-medium text-gray-700">🥩 Protein</span>
                                  <span className="text-xs font-bold text-gray-900">{item.protein}g ({proteinPct}%)</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                  <div className="h-2 rounded-full bg-blue-500" style={{ width: `${proteinPct}%` }}></div>
                                </div>
                              </div>
                              <div className="bg-white rounded p-2 border border-gray-200">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-medium text-gray-700">🍞 Carbs</span>
                                  <span className="text-xs font-bold text-gray-900">{item.carbs}g ({carbsPct}%)</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                  <div className="h-2 rounded-full bg-yellow-500" style={{ width: `${carbsPct}%` }}></div>
                                </div>
                              </div>
                              <div className="bg-white rounded p-2 border border-gray-200">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-medium text-gray-700">🥑 Fat</span>
                                  <span className="text-xs font-bold text-gray-900">{item.fat}g ({fatPct}%)</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                  <div className="h-2 rounded-full bg-red-500" style={{ width: `${fatPct}%` }}></div>
                                </div>
                              </div>
                              <div className="bg-white rounded p-2 border border-gray-200">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-medium text-gray-700">🌾 Fiber</span>
                                  <span className="text-xs font-bold text-gray-900">{item.fiber || 0}g ({fiberPct}%)</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                  <div className="h-2 rounded-full bg-green-500" style={{ width: `${fiberPct}%` }}></div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h5 className="font-semibold text-xs sm:text-sm text-gray-700 mb-1 sm:mb-2">💊 Vitamins & Minerals</h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                              <div>
                                <h6 className="font-semibold text-xs text-gray-700 mb-1 uppercase">Vitamins</h6>
                                <div className="space-y-1">
                                  {vitamins.filter(v => v.value > 0.01).map((vitamin, vIdx) => (
                                    <div key={vIdx} className="flex justify-between items-center text-xs bg-white rounded px-2 py-1 border border-gray-100">
                                      <span className={`font-medium ${vitamin.color}`}>{vitamin.name}</span>
                                      <span className="font-bold text-gray-900">{vitamin.value.toFixed(1)} {vitamin.unit}</span>
                                    </div>
                                  ))}
                                  {vitamins.filter(v => v.value > 0.01).length === 0 && (
                                    <p className="text-xs text-gray-500 italic">No data</p>
                                  )}
                                </div>
                              </div>
                              
                              <div>
                                <h6 className="font-semibold text-xs text-gray-700 mb-1 uppercase">Minerals</h6>
                                <div className="space-y-1">
                                  {minerals.filter(m => m.value > 0.01).map((mineral, mIdx) => (
                                    <div key={mIdx} className="flex justify-between items-center text-xs bg-white rounded px-2 py-1 border border-gray-100">
                                      <span className={`font-medium ${mineral.color}`}>{mineral.name}</span>
                                      <span className="font-bold text-gray-900">{mineral.value.toFixed(1)} {mineral.unit}</span>
                                    </div>
                                  ))}
                                  {minerals.filter(m => m.value > 0.01).length === 0 && (
                                    <p className="text-xs text-gray-500 italic">No data</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center text-xs sm:text-sm text-gray-500 mt-6 sm:mt-8 pt-3 sm:pt-4 border-t border-gray-300">
          <p className="font-bold">AfterBurn Gym Cafe by Sutra Fitness</p>
          <p>Prepared on {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>
    </div>
  );
};

export default PublicMealPlan;
