import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, Eye, Download, Share2, Link, Globe, Printer, Save, ChevronDown, ChevronUp } from 'lucide-react';
import { getMenuItems, getInventory } from '../../services/cafeService';
import { generateWeeklyPlanPDF } from '../../utils/pdfGenerator';
import { supabase } from '../../config/supabaseClient';

const CafeWeeklyMealPlan = ({ showToast }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [weeklyPlans, setWeeklyPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [showPrintView, setShowPrintView] = useState(false);
  const [selectedPlanForPrint, setSelectedPlanForPrint] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

  // Cooking method adjustments (same as CafeMenu)
  const COOKING_ADJUSTMENTS = {
    raw: { weightLoss: 0, calorieAdd: 0 },
    boiled: { weightLoss: 0, calorieAdd: 0 },
    steamed: { weightLoss: 0.05, calorieAdd: 0 },
    grilled: { weightLoss: 0.15, calorieAdd: 0.05 },
    baked: { weightLoss: 0.10, calorieAdd: 0.05 },
    fried: { weightLoss: 0.10, calorieAdd: 0.20 },
    sauteed: { weightLoss: 0.05, calorieAdd: 0.10 },
    roasted: { weightLoss: 0.15, calorieAdd: 0.05 }
  };

  // Calculate macros from raw materials (same logic as CafeMenu)
  const calculateMacros = (materials) => {
    let totals = { protein: 0, carbs: 0, fat: 0, fiber: 0, calories: 0 };

    materials.forEach(material => {
      const inventoryItem = inventoryItems.find(item => 
        item.name.toLowerCase() === material.name.toLowerCase()
      );
      
      if (inventoryItem) {
        const quantity = parseFloat(material.quantity) || 0;
        const cookingMethod = material.cookingMethod || 'raw';
        
        let quantityInGrams = quantity;
        if (material.unit === 'ml') {
          quantityInGrams = quantity;
        } else if (material.unit === 'pcs') {
          const isEgg = material.name.toLowerCase().includes('egg');
          quantityInGrams = quantity * (isEgg ? 45 : 100);
        } else if (material.unit === 'slice') {
          quantityInGrams = quantity * 30;
        }
        
        let protein = inventoryItem.proteinPer100g ? (inventoryItem.proteinPer100g * quantityInGrams) / 100 : 0;
        let carbs = inventoryItem.carbsPer100g ? (inventoryItem.carbsPer100g * quantityInGrams) / 100 : 0;
        let fat = inventoryItem.fatPer100g ? (inventoryItem.fatPer100g * quantityInGrams) / 100 : 0;
        let fiber = inventoryItem.fiberPer100g ? (inventoryItem.fiberPer100g * quantityInGrams) / 100 : 0;
        let calories = inventoryItem.caloriesPer100g ? (inventoryItem.caloriesPer100g * quantityInGrams) / 100 : 0;
        
        const adjustment = COOKING_ADJUSTMENTS[cookingMethod] || COOKING_ADJUSTMENTS.raw;
        if (adjustment.calorieAdd > 0) {
          calories *= (1 + adjustment.calorieAdd);
          fat *= (1 + adjustment.calorieAdd);
        }
        
        totals.protein += protein;
        totals.carbs += carbs;
        totals.fat += fat;
        totals.fiber += fiber;
        totals.calories += calories;
      }
    });

    return { 
      protein: totals.protein.toFixed(1),
      carbs: totals.carbs.toFixed(1),
      fat: totals.fat.toFixed(1),
      fiber: totals.fiber.toFixed(1),
      calories: totals.calories.toFixed(1)
    };
  };

  useEffect(() => {
    loadMenuItems();
    loadInventory();
    loadWeeklyPlans();
  }, []);

  const loadMenuItems = async () => {
    try {
      const items = await getMenuItems();
      setMenuItems(items || []);
    } catch (error) {
      console.error('Error loading menu items:', error);
      showToast?.('Failed to load menu items', 'error');
    }
  };

  const loadInventory = async () => {
    try {
      const items = await getInventory();
      setInventoryItems(items || []);
    } catch (error) {
      console.error('Error loading inventory:', error);
    }
  };

  const loadWeeklyPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('cafe_weekly_meal_plans')
        .select('*')
        .order('week_start_date', { ascending: false });

      if (error) throw error;
      setWeeklyPlans(data || []);
    } catch (error) {
      console.error('Error loading weekly plans:', error);
      showToast?.('Failed to load weekly plans', 'error');
    }
  };

  const createNewPlan = () => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1); // Monday
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // Sunday

    const newPlan = {
      plan_name: `Week ${weekStart.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} - ${weekEnd.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`,
      week_start_date: weekStart.toISOString().split('T')[0],
      week_end_date: weekEnd.toISOString().split('T')[0],
      status: 'draft',
      meals: {},
      notes: '',
      is_public: false
    };

    // Initialize empty meals for each day - now supports multiple items per meal
    daysOfWeek.forEach(day => {
      newPlan.meals[day] = {};
      mealTypes.forEach(type => {
        newPlan.meals[day][type] = []; // Array to hold multiple items
      });
    });

    setCurrentPlan(newPlan);
  };

  const addMealToSlot = (day, mealType, menuItemId) => {
    if (!currentPlan || !menuItemId) return;

    const menuItem = menuItems.find(item => item.id === menuItemId);
    if (!menuItem) return;

    // Calculate macros from raw materials
    const raw_materials = menuItem.raw_materials || [];
    const calculatedMacros = calculateMacros(raw_materials);
    
    // Enrich raw_materials with micronutrient data from inventory
    const enrichedRawMaterials = raw_materials.map(material => {
      const inventoryItem = inventoryItems.find(item => 
        item.name.toLowerCase() === material.name.toLowerCase()
      );
      
      if (inventoryItem) {
        return {
          ...material,
          vitamin_a_mcg: inventoryItem.vitamin_a_mcg || 0,
          vitamin_c_mg: inventoryItem.vitamin_c_mg || 0,
          vitamin_d_mcg: inventoryItem.vitamin_d_mcg || 0,
          vitamin_e_mg: inventoryItem.vitamin_e_mg || 0,
          vitamin_k_mcg: inventoryItem.vitamin_k_mcg || 0,
          vitamin_b1_mg: inventoryItem.vitamin_b1_mg || 0,
          vitamin_b2_mg: inventoryItem.vitamin_b2_mg || 0,
          vitamin_b3_mg: inventoryItem.vitamin_b3_mg || 0,
          vitamin_b6_mg: inventoryItem.vitamin_b6_mg || 0,
          vitamin_b12_mcg: inventoryItem.vitamin_b12_mcg || 0,
          folate_mcg: inventoryItem.folate_mcg || 0,
          calcium_mg: inventoryItem.calcium_mg || 0,
          iron_mg: inventoryItem.iron_mg || 0,
          magnesium_mg: inventoryItem.magnesium_mg || 0,
          phosphorus_mg: inventoryItem.phosphorus_mg || 0,
          potassium_mg: inventoryItem.potassium_mg || 0,
          sodium_mg: inventoryItem.sodium_mg || 0,
          zinc_mg: inventoryItem.zinc_mg || 0,
          copper_mg: inventoryItem.copper_mg || 0,
          manganese_mg: inventoryItem.manganese_mg || 0,
          selenium_mcg: inventoryItem.selenium_mcg || 0
        };
      }
      return material;
    });
    
    const mappedItem = {
      id: menuItem.id,
      name: menuItem.name,
      category: menuItem.category,
      calories: parseFloat(calculatedMacros.calories) || menuItem.calories || 0,
      protein: parseFloat(calculatedMacros.protein) || 0,
      carbs: parseFloat(calculatedMacros.carbs) || 0,
      fat: parseFloat(calculatedMacros.fat) || 0,
      fiber: parseFloat(calculatedMacros.fiber) || 0,
      raw_materials: enrichedRawMaterials,
      customer_price: menuItem.customer_price,
      trainer_price: menuItem.trainer_price,
      is_veg: menuItem.is_veg
    };

    setCurrentPlan(prev => ({
      ...prev,
      meals: {
        ...prev.meals,
        [day]: {
          ...prev.meals[day],
          [mealType]: [...(prev.meals[day][mealType] || []), mappedItem]
        }
      }
    }));
  };

  const removeMealFromSlot = (day, mealType, itemIndex) => {
    if (!currentPlan) return;

    setCurrentPlan(prev => ({
      ...prev,
      meals: {
        ...prev.meals,
        [day]: {
          ...prev.meals[day],
          [mealType]: prev.meals[day][mealType].filter((_, idx) => idx !== itemIndex)
        }
      }
    }));
  };

  const setReplacementMeal = (menuItemId) => {
    const menuItem = menuItems.find(item => item.id === menuItemId);
    if (!menuItem) return;

    // Calculate macros from raw materials
    const raw_materials = menuItem.raw_materials || [];
    const calculatedMacros = calculateMacros(raw_materials);
    
    const mappedItem = {
      id: menuItem.id,
      name: menuItem.name,
      calories: parseFloat(calculatedMacros.calories) || menuItem.calories || 0,
      protein: parseFloat(calculatedMacros.protein) || 0,
      carbs: parseFloat(calculatedMacros.carbs) || 0,
      fat: parseFloat(calculatedMacros.fat) || 0,
      fiber: parseFloat(calculatedMacros.fiber) || 0
    };

    setCurrentPlan(prev => ({
      ...prev,
      replacementMeal: mappedItem
    }));
  };

  const savePlan = async () => {
    if (!currentPlan) return;

    try {
      if (currentPlan.id) {
        // Update existing plan
        const { error } = await supabase
          .from('cafe_weekly_meal_plans')
          .update({
            plan_name: currentPlan.plan_name,
            week_start_date: currentPlan.week_start_date,
            week_end_date: currentPlan.week_end_date,
            status: currentPlan.status,
            meals: currentPlan.meals,
            notes: currentPlan.notes
          })
          .eq('id', currentPlan.id);

        if (error) throw error;
      } else {
        // Insert new plan
        const { data, error } = await supabase
          .from('cafe_weekly_meal_plans')
          .insert([{
            plan_name: currentPlan.plan_name,
            week_start_date: currentPlan.week_start_date,
            week_end_date: currentPlan.week_end_date,
            status: currentPlan.status,
            meals: currentPlan.meals,
            notes: currentPlan.notes,
            is_public: false
          }])
          .select()
          .single();

        if (error) throw error;
        setCurrentPlan(data);
      }

      await loadWeeklyPlans();
      showToast?.('Weekly meal plan saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving plan:', error);
      showToast?.('Failed to save meal plan', 'error');
    }
  };

  const deletePlan = async (planId) => {
    if (!confirm('Are you sure you want to delete this weekly plan? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('cafe_weekly_meal_plans')
        .delete()
        .eq('id', planId);

      if (error) throw error;

      if (currentPlan?.id === planId) {
        setCurrentPlan(null);
      }

      await loadWeeklyPlans();
      showToast?.('Weekly plan deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting plan:', error);
      showToast?.('Failed to delete meal plan', 'error');
    }
  };

  const handleDownloadPDF = () => {
    if (!selectedPlanForPrint) return;
    
    setIsGeneratingPDF(true);
    const summary = calculateNutritionSummary(selectedPlanForPrint);
    generateWeeklyPlanPDF(selectedPlanForPrint, summary, inventoryItems, showToast);
    setIsGeneratingPDF(false);
  };

  const handleViewPlan = (plan) => {
    setCurrentPlan(plan);
  };

  const togglePublicVisibility = async (planId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('cafe_weekly_meal_plans')
        .update({ is_public: !currentStatus })
        .eq('id', planId);

      if (error) throw error;

      setWeeklyPlans(prev => prev.map(plan => 
        plan.id === planId ? { ...plan, is_public: !currentStatus } : plan
      ));

      showToast?.(`Meal plan is now ${!currentStatus ? 'public' : 'private'}`, 'success');
    } catch (error) {
      console.error('Error toggling public visibility:', error);
      showToast?.('Failed to update visibility', 'error');
    }
  };

  const generateShareLink = (planId) => {
    const link = `${window.location.origin}/cafe/weekly-menu/${planId}`;
    setShareLink(link);
    setShowShareModal(true);
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    showToast?.('Link copied to clipboard!', 'success');
  };

  const calculateNutritionSummary = (plan) => {
    if (!plan) return null;

    const summary = {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      totalFiber: 0,
      micronutrients: {
        vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0, vitaminK: 0,
        vitaminB1: 0, vitaminB2: 0, vitaminB3: 0, vitaminB6: 0, vitaminB12: 0, folate: 0,
        calcium: 0, iron: 0, magnesium: 0, phosphorus: 0, potassium: 0, sodium: 0,
        zinc: 0, copper: 0, manganese: 0, selenium: 0
      },
      mealCount: 0,
      itemCount: 0,
      dailyTotals: {},
      mealTotals: {}
    };

    daysOfWeek.forEach(day => {
      summary.dailyTotals[day] = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
      
      mealTypes.forEach(type => {
        const mealKey = `${day}-${type}`;
        summary.mealTotals[mealKey] = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
        
        const mealItems = plan.meals[day]?.[type] || [];
        if (mealItems.length > 0) {
          summary.mealCount++;
          
          mealItems.forEach(meal => {
            const calories = parseFloat(meal.calories) || 0;
            const protein = parseFloat(meal.protein) || 0;
            const carbs = parseFloat(meal.carbs) || 0;
            const fat = parseFloat(meal.fat) || 0;
            const fiber = parseFloat(meal.fiber) || 0;
            
            summary.totalCalories += calories;
            summary.totalProtein += protein;
            summary.totalCarbs += carbs;
            summary.totalFat += fat;
            summary.totalFiber += fiber;
            summary.itemCount++;
            
            summary.dailyTotals[day].calories += calories;
            summary.dailyTotals[day].protein += protein;
            summary.dailyTotals[day].carbs += carbs;
            summary.dailyTotals[day].fat += fat;
            summary.dailyTotals[day].fiber += fiber;
            
            summary.mealTotals[mealKey].calories += calories;
            summary.mealTotals[mealKey].protein += protein;
            summary.mealTotals[mealKey].carbs += carbs;
            summary.mealTotals[mealKey].fat += fat;
            summary.mealTotals[mealKey].fiber += fiber;
            
            // Calculate micronutrients from raw materials
            if (meal.raw_materials && Array.isArray(meal.raw_materials)) {
              meal.raw_materials.forEach(material => {
                const inventoryItem = inventoryItems.find(inv => inv.name === material.name);
                if (inventoryItem) {
                  const qty = parseFloat(material.quantity) || 0;
                  const factor = qty / 100;
                  
                  summary.micronutrients.vitaminA += (inventoryItem.vitamin_a_mcg || 0) * factor;
                  summary.micronutrients.vitaminC += (inventoryItem.vitamin_c_mg || 0) * factor;
                  summary.micronutrients.vitaminD += (inventoryItem.vitamin_d_mcg || 0) * factor;
                  summary.micronutrients.vitaminE += (inventoryItem.vitamin_e_mg || 0) * factor;
                  summary.micronutrients.vitaminK += (inventoryItem.vitamin_k_mcg || 0) * factor;
                  summary.micronutrients.vitaminB1 += (inventoryItem.vitamin_b1_mg || 0) * factor;
                  summary.micronutrients.vitaminB2 += (inventoryItem.vitamin_b2_mg || 0) * factor;
                  summary.micronutrients.vitaminB3 += (inventoryItem.vitamin_b3_mg || 0) * factor;
                  summary.micronutrients.vitaminB6 += (inventoryItem.vitamin_b6_mg || 0) * factor;
                  summary.micronutrients.vitaminB12 += (inventoryItem.vitamin_b12_mcg || 0) * factor;
                  summary.micronutrients.folate += (inventoryItem.folate_mcg || 0) * factor;
                  summary.micronutrients.calcium += (inventoryItem.calcium_mg || 0) * factor;
                  summary.micronutrients.iron += (inventoryItem.iron_mg || 0) * factor;
                  summary.micronutrients.magnesium += (inventoryItem.magnesium_mg || 0) * factor;
                  summary.micronutrients.phosphorus += (inventoryItem.phosphorus_mg || 0) * factor;
                  summary.micronutrients.potassium += (inventoryItem.potassium_mg || 0) * factor;
                  summary.micronutrients.sodium += (inventoryItem.sodium_mg || 0) * factor;
                  summary.micronutrients.zinc += (inventoryItem.zinc_mg || 0) * factor;
                  summary.micronutrients.copper += (inventoryItem.copper_mg || 0) * factor;
                  summary.micronutrients.manganese += (inventoryItem.manganese_mg || 0) * factor;
                  summary.micronutrients.selenium += (inventoryItem.selenium_mcg || 0) * factor;
                }
              });
            }
          });
        }
      });
    });

    return summary;
  };

  const getMealCalories = (plan, day, mealType) => {
    const mealItems = plan?.meals[day]?.[mealType] || [];
    return mealItems.reduce((sum, item) => sum + (parseFloat(item.calories) || 0), 0);
  };

  const getDayCalories = (plan, day) => {
    let total = 0;
    mealTypes.forEach(type => {
      total += getMealCalories(plan, day, type);
    });
    return total;
  };

  const PrintView = ({ plan }) => {
    const summary = calculateNutritionSummary(plan);

    return (
      <>
        {/* Print-specific styles */}
        <style>{`
          @media print {
            /* Reset page margins and set landscape */
            @page {
              margin: 0.4in;
              size: A4 landscape;
            }
            
            /* Ensure proper page breaks */
            .page-break-avoid {
              page-break-inside: avoid;
              break-inside: avoid;
            }
            
            /* Preserve colors */
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            /* Hide non-print elements */
            .print\\:hidden {
              display: none !important;
            }
            
            /* Hide everything except print content */
            body * {
              visibility: hidden;
            }
            
            .print-container, .print-container * {
              visibility: visible;
            }
            
            .print-container {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          }
        `}</style>
        
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto print:relative print-container">
          <div className="max-w-7xl mx-auto p-8 print:p-0">
            {/* Header */}
            <div className="flex justify-between items-start mb-6 print:mb-4 page-break-avoid">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 print:text-2xl">{plan.plan_name}</h1>
                <p className="text-gray-600 mt-1">Weekly Meal Schedule & Nutrition Summary</p>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(plan.week_start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })} - {new Date(plan.week_end_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="flex gap-2 print:hidden">
                <button
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4" />
                  {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
                </button>
                <button
                  onClick={() => setShowPrintView(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Weekly Summary */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-lg p-4 mb-6 page-break-avoid">
            <h2 className="text-xl font-bold text-gray-900 mb-3">📊 Weekly Nutrition Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{summary.totalCalories.toFixed(0)}</div>
                <div className="text-xs text-gray-600">Total Calories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{summary.totalProtein.toFixed(1)}g</div>
                <div className="text-xs text-gray-600">Protein</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{summary.totalCarbs.toFixed(1)}g</div>
                <div className="text-xs text-gray-600">Carbs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{summary.totalFat.toFixed(1)}g</div>
                <div className="text-xs text-gray-600">Fat</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{summary.totalFiber.toFixed(1)}g</div>
                <div className="text-xs text-gray-600">Fiber</div>
              </div>
            </div>
            <div className="mt-3 text-center text-sm text-gray-600">
              Total Meals: <span className="font-bold">{summary.mealCount}</span> | 
              Avg Calories/Meal: <span className="font-bold">{summary.mealCount > 0 ? (summary.totalCalories / summary.mealCount).toFixed(0) : 0}</span>
            </div>
            
            {/* Weekly Micronutrients Summary */}
            <div className="mt-4 pt-4 border-t-2 border-orange-200">
              <h3 className="text-lg font-bold text-gray-900 mb-3">💊 Weekly Micronutrients Total</h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Vitamins */}
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-2 uppercase">Vitamins</h4>
                  <div className="space-y-1">
                    {[
                      { name: '🥕 Vitamin A', value: summary.micronutrients.vitaminA, unit: 'mcg' },
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
                
                {/* Minerals */}
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

            {/* Weekly Schedule */}
            <div className="mb-6 page-break-avoid">
            <h2 className="text-xl font-bold text-gray-900 mb-3">📅 Weekly Meal Schedule</h2>
            <table className="w-full border-collapse border border-gray-300">
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

            {/* Detailed Nutrition Breakdown - All Items */}
            <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">🍽️ Detailed Nutrition Breakdown - All Items</h2>
            <div className="space-y-6">
              {daysOfWeek.map(day => {
                const dayItems = [];
                mealTypes.forEach(type => {
                  const items = plan.meals[day]?.[type] || [];
                  items.forEach(item => {
                    dayItems.push({ ...item, mealType: type });
                  });
                });
                
                if (dayItems.length === 0) return null;
                
                return (
                  <div key={day} className="border border-gray-300 rounded-lg p-2 bg-white page-break-avoid print:p-1.5">
                    <h3 className="font-bold text-base text-gray-900 mb-2 pb-1 border-b border-gray-200 print:text-sm print:mb-1">{day} - {getDayCalories(plan, day).toFixed(0)} cal</h3>
                    <div className="space-y-3 print:space-y-2">
                      {dayItems.map((item, idx) => {
                        const totalMacros = (parseFloat(item.protein) || 0) + (parseFloat(item.carbs) || 0) + (parseFloat(item.fat) || 0);
                        const proteinPct = totalMacros > 0 ? ((parseFloat(item.protein) || 0) / totalMacros * 100).toFixed(1) : 0;
                        const carbsPct = totalMacros > 0 ? ((parseFloat(item.carbs) || 0) / totalMacros * 100).toFixed(1) : 0;
                        const fatPct = totalMacros > 0 ? ((parseFloat(item.fat) || 0) / totalMacros * 100).toFixed(1) : 0;
                        const fiberPct = totalMacros > 0 ? ((parseFloat(item.fiber) || 0) / totalMacros * 100).toFixed(1) : 0;
                        
                        // Calculate micronutrients from raw materials
                        const micronutrients = {
                          vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0, vitaminK: 0,
                          vitaminB1: 0, vitaminB2: 0, vitaminB3: 0, vitaminB6: 0, vitaminB12: 0, folate: 0,
                          calcium: 0, iron: 0, magnesium: 0, phosphorus: 0, potassium: 0, sodium: 0,
                          zinc: 0, copper: 0, manganese: 0, selenium: 0
                        };
                        
                        // Sum up micronutrients from raw materials if available
                        if (item.raw_materials && Array.isArray(item.raw_materials)) {
                          item.raw_materials.forEach(material => {
                            // Find the inventory item with micronutrient data
                            const inventoryItem = inventoryItems.find(inv => inv.name === material.name);
                            if (inventoryItem) {
                              const qty = parseFloat(material.quantity) || 0;
                              const factor = qty / 100; // Assuming nutrition data is per 100g
                              
                              micronutrients.vitaminA += (inventoryItem.vitamin_a_mcg || 0) * factor;
                              micronutrients.vitaminC += (inventoryItem.vitamin_c_mg || 0) * factor;
                              micronutrients.vitaminD += (inventoryItem.vitamin_d_mcg || 0) * factor;
                              micronutrients.vitaminE += (inventoryItem.vitamin_e_mg || 0) * factor;
                              micronutrients.vitaminK += (inventoryItem.vitamin_k_mcg || 0) * factor;
                              micronutrients.vitaminB1 += (inventoryItem.vitamin_b1_mg || 0) * factor;
                              micronutrients.vitaminB2 += (inventoryItem.vitamin_b2_mg || 0) * factor;
                              micronutrients.vitaminB3 += (inventoryItem.vitamin_b3_mg || 0) * factor;
                              micronutrients.vitaminB6 += (inventoryItem.vitamin_b6_mg || 0) * factor;
                              micronutrients.vitaminB12 += (inventoryItem.vitamin_b12_mcg || 0) * factor;
                              micronutrients.folate += (inventoryItem.folate_mcg || 0) * factor;
                              micronutrients.calcium += (inventoryItem.calcium_mg || 0) * factor;
                              micronutrients.iron += (inventoryItem.iron_mg || 0) * factor;
                              micronutrients.magnesium += (inventoryItem.magnesium_mg || 0) * factor;
                              micronutrients.phosphorus += (inventoryItem.phosphorus_mg || 0) * factor;
                              micronutrients.potassium += (inventoryItem.potassium_mg || 0) * factor;
                              micronutrients.sodium += (inventoryItem.sodium_mg || 0) * factor;
                              micronutrients.zinc += (inventoryItem.zinc_mg || 0) * factor;
                              micronutrients.copper += (inventoryItem.copper_mg || 0) * factor;
                              micronutrients.manganese += (inventoryItem.manganese_mg || 0) * factor;
                              micronutrients.selenium += (inventoryItem.selenium_mcg || 0) * factor;
                            }
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
                        
                        const normalizeToMg = (value, unit) => unit === 'mcg' ? value / 1000 : value;
                        
                        return (
                          <div key={idx} className="border border-gray-200 rounded p-2 bg-gray-50 page-break-avoid print:p-1.5">
                            {/* Header */}
                            <div className="mb-2 print:mb-1">
                              <div className="flex items-center justify-between mb-1">
                                <div>
                                  <h4 className="font-bold text-sm text-gray-900 print:text-xs">{item.name}</h4>
                                  <p className="text-xs text-gray-500 print:text-[10px]">({item.mealType})</p>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold text-orange-600 print:text-base">{parseFloat(item.calories).toFixed(0)}</div>
                                  <div className="text-xs text-gray-600 print:text-[10px]">cal</div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Macro Nutrients */}
                            <div className="mb-2 print:mb-1">
                              <h5 className="font-semibold text-xs text-gray-700 mb-1 print:text-[10px]">🍴 Macros</h5>
                              <div className="grid grid-cols-2 gap-2 print:gap-1">
                                <div className="bg-white rounded p-1.5 border border-gray-200 print:p-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-gray-700 print:text-[10px]">🥩 Protein</span>
                                    <span className="text-xs font-bold text-gray-900 print:text-[10px]">{item.protein}g ({proteinPct}%)</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1 print:h-1">
                                    <div
                                      className={`h-1.5 rounded-full bg-blue-500 print:h-1`}
                                      style={{ width: `${proteinPct}%` }}
                                    ></div>
                                  </div>
                                </div>
                                <div className="bg-white rounded p-1.5 border border-gray-200 print:p-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-gray-700 print:text-[10px]">🍞 Carbs</span>
                                    <span className="text-xs font-bold text-gray-900 print:text-[10px]">{item.carbs}g ({carbsPct}%)</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1 print:h-1">
                                    <div
                                      className={`h-1.5 rounded-full bg-yellow-500 print:h-1`}
                                      style={{ width: `${carbsPct}%` }}
                                    ></div>
                                  </div>
                                </div>
                                <div className="bg-white rounded p-1.5 border border-gray-200 print:p-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-gray-700 print:text-[10px]">🥑 Fat</span>
                                    <span className="text-xs font-bold text-gray-900 print:text-[10px]">{item.fat}g ({fatPct}%)</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1 print:h-1">
                                    <div
                                      className={`h-1.5 rounded-full bg-red-500 print:h-1`}
                                      style={{ width: `${fatPct}%` }}
                                    ></div>
                                  </div>
                                </div>
                                <div className="bg-white rounded p-1.5 border border-gray-200 print:p-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-gray-700 print:text-[10px]">🌾 Fiber</span>
                                    <span className="text-xs font-bold text-gray-900 print:text-[10px]">{item.fiber || 0}g ({fiberPct}%)</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1 print:h-1">
                                    <div
                                      className={`h-1.5 rounded-full bg-green-500 print:h-1`}
                                      style={{ width: `${fiberPct}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Micronutrients */}
                            <div>
                              <h5 className="font-semibold text-xs text-gray-700 mb-1 print:text-[10px]">💊 Vitamins & Minerals</h5>
                              <div className="grid grid-cols-2 gap-2 print:gap-1">
                                {/* Vitamins */}
                                <div>
                                  <h6 className="font-semibold text-xs text-gray-700 mb-1 uppercase print:text-[10px]">Vitamins</h6>
                                  <div className="space-y-0.5">
                                    {vitamins
                                      .filter(v => v.value > 0.01)
                                      .sort((a, b) => normalizeToMg(b.value, b.unit) - normalizeToMg(a.value, a.unit))
                                      .map((vitamin, vIdx) => (
                                        <div key={vIdx} className="flex justify-between items-center text-xs bg-white rounded px-1.5 py-0.5 border border-gray-100 print:text-[10px] print:px-1">
                                          <span className={`font-medium ${vitamin.color}`}>{vitamin.name}</span>
                                          <span className="font-bold text-gray-900">{vitamin.value.toFixed(1)} {vitamin.unit}</span>
                                        </div>
                                      ))}
                                    {vitamins.filter(v => v.value > 0.01).length === 0 && (
                                      <p className="text-xs text-gray-500 italic print:text-[10px]">No data</p>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Minerals */}
                                <div>
                                  <h6 className="font-semibold text-xs text-gray-700 mb-1 uppercase print:text-[10px]">Minerals</h6>
                                  <div className="space-y-0.5">
                                    {minerals
                                      .filter(m => m.value > 0.01)
                                      .sort((a, b) => normalizeToMg(b.value, b.unit) - normalizeToMg(a.value, a.unit))
                                      .map((mineral, mIdx) => (
                                        <div key={mIdx} className="flex justify-between items-center text-xs bg-white rounded px-1.5 py-0.5 border border-gray-100 print:text-[10px] print:px-1">
                                          <span className={`font-medium ${mineral.color}`}>{mineral.name}</span>
                                          <span className="font-bold text-gray-900">{mineral.value.toFixed(1)} {mineral.unit}</span>
                                        </div>
                                      ))}
                                    {minerals.filter(m => m.value > 0.01).length === 0 && (
                                      <p className="text-xs text-gray-500 italic print:text-[10px]">No data</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

            {/* Replacement Meal */}
            {plan.replacementMeal && (
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-6 page-break-avoid print:mb-3 print:p-2">
              <h2 className="text-lg font-bold text-gray-900 mb-2">🔄 Replacement Meal (Use once per week if needed)</h2>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="font-semibold">{plan.replacementMeal.name}</div>
                  <div className="text-sm text-gray-600">
                    {plan.replacementMeal.calories} cal | 
                    P: {plan.replacementMeal.protein}g | 
                    C: {plan.replacementMeal.carbs}g | 
                    F: {plan.replacementMeal.fat}g
                  </div>
                </div>
              </div>
            </div>
          )}

            {/* Notes */}
            {plan.notes && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 page-break-avoid print:mb-3 print:p-2">
              <h2 className="text-lg font-bold text-gray-900 mb-2">📝 Notes</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{plan.notes}</p>
            </div>
          )}

            {/* Footer */}
            <div className="text-center text-sm text-gray-500 mt-8 pt-4 border-t border-gray-300 page-break-avoid print:mt-4 print:pt-2">
              <p className="font-bold">AfterBurn Gym Cafe by Sutra Fitness</p>
              <p>Prepared on {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            </div>

            {/* Print Button */}
            <div className="flex justify-center gap-4 mt-6 print:hidden">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
            >
              <Printer className="w-5 h-5" />
              Print / Save as PDF
            </button>
          </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Weekly Meal Plans</h2>
          <p className="text-gray-600">Create and manage weekly meal schedules for subscriptions</p>
        </div>
        <button
          onClick={createNewPlan}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
        >
          <Plus className="w-5 h-5" />
          New Plan
        </button>
      </div>

      {/* Existing Plans List */}
      {weeklyPlans.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Saved Plans</h3>
          <div className="space-y-2">
            {weeklyPlans.map(plan => (
              <div key={plan.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                <div>
                  <div className="font-medium">{plan.plan_name}</div>
                  <div className="text-sm text-gray-600">
                    {calculateNutritionSummary(plan)?.mealCount || 0} meals | Status: {plan.status}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPlan(plan)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPlanForPrint(plan);
                      setShowPrintView(true);
                    }}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  >
                    Print
                  </button>
                  <button
                    onClick={() => handleViewPlan(plan)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="View Plan"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => togglePublicVisibility(plan.id, plan.is_public)}
                    className={`p-2 rounded-lg ${plan.is_public ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'}`}
                    title={plan.is_public ? 'Make Private' : 'Make Public'}
                  >
                    <Globe className="w-4 h-4" />
                  </button>
                  {plan.is_public && (
                    <button
                      onClick={() => generateShareLink(plan.id)}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                      title="Get Share Link"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deletePlan(plan.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Delete Plan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Plan Editor */}
      {currentPlan && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">{currentPlan.plan_name}</h3>
            <div className="flex gap-2">
              <button
                onClick={savePlan}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Save className="w-4 h-4" />
                Save Plan
              </button>
              <button
                onClick={() => {
                  setSelectedPlanForPrint(currentPlan);
                  setShowPrintView(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Printer className="w-4 h-4" />
                Preview & Print
              </button>
            </div>
          </div>

          {/* Meal Assignment Grid */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
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
                  <tr key={day}>
                    <td className="border border-gray-300 px-3 py-2 font-semibold bg-gray-50">{day}</td>
                    {mealTypes.map(type => {
                      const assignedItems = currentPlan.meals[day]?.[type] || [];
                      const mealCal = getMealCalories(currentPlan, day, type);
                      return (
                        <td key={type} className="border border-gray-300 px-2 py-2">
                          <div className="space-y-2">
                            {/* Existing Items */}
                            {assignedItems.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-1 bg-blue-50 p-1 rounded">
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-medium truncate">{item.name}</div>
                                  <div className="text-xs text-gray-600">{item.calories} cal</div>
                                </div>
                                <button
                                  onClick={() => removeMealFromSlot(day, type, idx)}
                                  className="p-1 hover:bg-red-100 rounded"
                                  title="Remove"
                                >
                                  <Trash2 className="w-3 h-3 text-red-600" />
                                </button>
                              </div>
                            ))}
                            
                            {/* Add Item Dropdown */}
                            <select
                              value=""
                              onChange={(e) => {
                                addMealToSlot(day, type, e.target.value);
                                e.target.value = ''; // Reset
                              }}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                            >
                              <option value="">+ Add Item</option>
                              {menuItems.map(item => (
                                <option key={item.id} value={item.id}>
                                  {item.name} ({item.calories} cal)
                                </option>
                              ))}
                            </select>
                            
                            {/* Meal Total */}
                            {assignedItems.length > 1 && (
                              <div className="text-xs font-bold text-orange-600 pt-1 border-t border-gray-200">
                                Meal: {mealCal.toFixed(0)} cal
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                    <td className="border border-gray-300 px-3 py-2 text-center bg-orange-50">
                      <div className="font-bold text-orange-600">{getDayCalories(currentPlan, day).toFixed(0)}</div>
                      <div className="text-xs text-gray-600">cal</div>
                    </td>
                  </tr>
                ))}
                <tr className="bg-gradient-to-r from-orange-100 to-red-100 font-bold">
                  <td className="border border-gray-300 px-3 py-2" colSpan={mealTypes.length + 1}>Week Total</td>
                  <td className="border border-gray-300 px-3 py-2 text-center">
                    <div className="text-xl text-orange-600">{calculateNutritionSummary(currentPlan)?.totalCalories.toFixed(0) || 0}</div>
                    <div className="text-xs text-gray-700">cal</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Replacement Meal Section */}
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">🔄 Replacement Meal (Optional - Use once per week if needed)</h4>
            <select
              value={currentPlan.replacementMeal?.id || ''}
              onChange={(e) => setReplacementMeal(e.target.value)}
              className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded"
            >
              <option value="">-- Select Replacement Dish --</option>
              {menuItems.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.calories} cal)
                </option>
              ))}
            </select>
            {currentPlan.replacementMeal && (
              <div className="mt-2 text-sm text-gray-700">
                Selected: <span className="font-semibold">{currentPlan.replacementMeal.name}</span> - 
                {currentPlan.replacementMeal.calories} cal | 
                P: {currentPlan.replacementMeal.protein}g | 
                C: {currentPlan.replacementMeal.carbs}g | 
                F: {currentPlan.replacementMeal.fat}g
              </div>
            )}
          </div>

          {/* Notes Section */}
          <div className="mt-4">
            <label className="block font-semibold text-gray-900 mb-2">Notes (Optional)</label>
            <textarea
              value={currentPlan.notes}
              onChange={(e) => setCurrentPlan(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Add any special instructions or notes for this week..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows="3"
            />
          </div>
        </div>
      )}

      {/* Print View Modal */}
      {showPrintView && selectedPlanForPrint && (
        <PrintView plan={selectedPlanForPrint} />
      )}

      {/* Share Link Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-purple-600" />
                Share Meal Plan
              </h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Anyone with this link can view this meal plan (read-only)
            </p>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
              />
              <button
                onClick={copyShareLink}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2"
              >
                <Link className="w-4 h-4" />
                Copy
              </button>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-800">
                💡 <strong>Tip:</strong> Share this link with your clients or on social media. 
                They can view the meal plan with full nutrition information without needing to log in.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CafeWeeklyMealPlan;
