import React, { useState, useEffect } from 'react';
import { Plus, Calendar, TrendingUp, Scale, Activity, Utensils, X, Edit, Trash2, Search } from 'lucide-react';
import {
  logMeal,
  getMealsBySubscriber,
  logPhysicalMeasurement,
  getMeasurementsBySubscriber,
  getSubscriberProgress,
  deleteMeal,
  deleteMeasurement,
} from '../../services/subscriberTrackingService';
import { getMenuItems } from '../../services/cafeService';

const CafeSubscriberTracking = ({ showToast }) => {
  const [activeTab, setActiveTab] = useState('meals');
  const [subscribers, setSubscribers] = useState([]);
  const [selectedSubscriber, setSelectedSubscriber] = useState(null);
  const [meals, setMeals] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [showMealModal, setShowMealModal] = useState(false);
  const [showMeasurementModal, setShowMeasurementModal] = useState(false);
  const [progress, setProgress] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Meal form state
  const [mealForm, setMealForm] = useState({
    date: new Date().toISOString().split('T')[0],
    mealType: 'breakfast',
    dishes: [],
    notes: '',
  });

  // Measurement form state
  const [measurementForm, setMeasurementForm] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: '',
    bodyFatPercentage: '',
    muscleMass: '',
    metabolicAge: '',
    bmi: '',
    visceralFat: '',
    bodyWaterPercentage: '',
    boneMass: '',
    chest: '',
    waist: '',
    hips: '',
    thigh: '',
    arm: '',
    notes: '',
  });

  useEffect(() => {
    loadMenuItems();
    loadSubscribers();
  }, []);

  useEffect(() => {
    if (selectedSubscriber) {
      loadSubscriberData();
    }
  }, [selectedSubscriber]);

  const loadMenuItems = async () => {
    const items = await getMenuItems();
    setMenuItems(items.filter(item => item.is_active));
  };

  const loadSubscribers = async () => {
    // This would load from your subscription orders table
    // For now, using a placeholder - you'll need to implement getActiveSubscribers
    setSubscribers([]);
  };

  const loadSubscriberData = async () => {
    if (!selectedSubscriber) return;

    const mealsData = await getMealsBySubscriber(selectedSubscriber.id);
    setMeals(mealsData);

    const measurementsData = await getMeasurementsBySubscriber(selectedSubscriber.id);
    setMeasurements(measurementsData);

    const progressData = await getSubscriberProgress(selectedSubscriber.id, 30);
    setProgress(progressData);
  };

  const handleAddDish = (menuItem) => {
    const newDish = {
      menu_item_id: menuItem.id,
      name: menuItem.name,
      calories: menuItem.calories || 0,
      quantity: 1,
    };
    setMealForm({
      ...mealForm,
      dishes: [...mealForm.dishes, newDish],
    });
  };

  const handleRemoveDish = (index) => {
    setMealForm({
      ...mealForm,
      dishes: mealForm.dishes.filter((_, i) => i !== index),
    });
  };

  const handleUpdateDishQuantity = (index, quantity) => {
    const updatedDishes = [...mealForm.dishes];
    updatedDishes[index].quantity = parseInt(quantity) || 1;
    setMealForm({
      ...mealForm,
      dishes: updatedDishes,
    });
  };

  const calculateTotalCalories = () => {
    return mealForm.dishes.reduce((total, dish) => {
      return total + (dish.calories * dish.quantity);
    }, 0);
  };

  const handleSaveMeal = async () => {
    try {
      if (!selectedSubscriber) {
        showToast('Please select a subscriber');
        return;
      }

      if (mealForm.dishes.length === 0) {
        showToast('Please add at least one dish');
        return;
      }

      await logMeal({
        subscriberId: selectedSubscriber.id,
        date: mealForm.date,
        mealType: mealForm.mealType,
        dishes: mealForm.dishes,
        totalCalories: calculateTotalCalories(),
        notes: mealForm.notes,
      });

      showToast('Meal logged successfully!');
      setShowMealModal(false);
      setMealForm({
        date: new Date().toISOString().split('T')[0],
        mealType: 'breakfast',
        dishes: [],
        notes: '',
      });
      loadSubscriberData();
    } catch (error) {
      showToast('Error logging meal');
      console.error(error);
    }
  };

  const handleSaveMeasurement = async () => {
    try {
      if (!selectedSubscriber) {
        showToast('Please select a subscriber');
        return;
      }

      await logPhysicalMeasurement({
        subscriberId: selectedSubscriber.id,
        ...measurementForm,
      });

      showToast('Measurement logged successfully!');
      setShowMeasurementModal(false);
      setMeasurementForm({
        date: new Date().toISOString().split('T')[0],
        weight: '',
        bodyFatPercentage: '',
        muscleMass: '',
        metabolicAge: '',
        bmi: '',
        visceralFat: '',
        bodyWaterPercentage: '',
        boneMass: '',
        chest: '',
        waist: '',
        hips: '',
        thigh: '',
        arm: '',
        notes: '',
      });
      loadSubscriberData();
    } catch (error) {
      showToast('Error logging measurement');
      console.error(error);
    }
  };

  const handleDeleteMeal = async (mealId) => {
    if (window.confirm('Are you sure you want to delete this meal log?')) {
      try {
        await deleteMeal(mealId);
        showToast('Meal deleted successfully');
        loadSubscriberData();
      } catch (error) {
        showToast('Error deleting meal');
      }
    }
  };

  const handleDeleteMeasurement = async (measurementId) => {
    if (window.confirm('Are you sure you want to delete this measurement?')) {
      try {
        await deleteMeasurement(measurementId);
        showToast('Measurement deleted successfully');
        loadSubscriberData();
      } catch (error) {
        showToast('Error deleting measurement');
      }
    }
  };

  const filteredMenuItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-black text-white mb-2">
          📊 Subscriber Tracking
        </h2>
        <p className="text-green-100">Track meals, calories, and physical measurements</p>
      </div>

      {/* Subscriber Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Select Subscriber
        </label>
        <select
          value={selectedSubscriber?.id || ''}
          onChange={(e) => {
            const sub = subscribers.find(s => s.id === e.target.value);
            setSelectedSubscriber(sub);
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
        >
          <option value="">Choose a subscriber...</option>
          {subscribers.map(sub => (
            <option key={sub.id} value={sub.id}>
              {sub.customer_name} - {sub.phone}
            </option>
          ))}
        </select>
      </div>

      {selectedSubscriber && (
        <>
          {/* Progress Summary */}
          {progress && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-4 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Utensils className="w-5 h-5" />
                  <span className="text-sm font-semibold">Total Meals</span>
                </div>
                <div className="text-3xl font-black">{progress.totalMeals}</div>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl p-4 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5" />
                  <span className="text-sm font-semibold">Avg Calories/Day</span>
                </div>
                <div className="text-3xl font-black">{Math.round(progress.averageCalories)}</div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-4 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Scale className="w-5 h-5" />
                  <span className="text-sm font-semibold">Measurements</span>
                </div>
                <div className="text-3xl font-black">{measurements.length}</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-4 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-sm font-semibold">Weight Trend</span>
                </div>
                <div className="text-3xl font-black">
                  {progress.weightTrend.length > 0 
                    ? `${progress.weightTrend[progress.weightTrend.length - 1].weight} kg`
                    : '-'}
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1 inline-flex gap-1">
            <button
              onClick={() => setActiveTab('meals')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
                activeTab === 'meals'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Utensils className="w-4 h-4" />
              Meals
            </button>
            <button
              onClick={() => setActiveTab('measurements')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
                activeTab === 'measurements'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Scale className="w-4 h-4" />
              Measurements
            </button>
          </div>

          {/* Content */}
          {activeTab === 'meals' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Meal History</h3>
                <button
                  onClick={() => setShowMealModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                >
                  <Plus className="w-4 h-4" />
                  Log Meal
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {meals.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    No meals logged yet
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {meals.map(meal => (
                      <div key={meal.id} className="p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-lg font-bold text-gray-900">
                                {meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1)}
                              </span>
                              <span className="text-sm text-gray-500">{meal.date}</span>
                              <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-sm font-semibold">
                                {meal.total_calories} cal
                              </span>
                            </div>
                            <div className="space-y-1">
                              {meal.dishes.map((dish, idx) => (
                                <div key={idx} className="text-sm text-gray-600">
                                  • {dish.name} x{dish.quantity} ({dish.calories * dish.quantity} cal)
                                </div>
                              ))}
                            </div>
                            {meal.notes && (
                              <p className="text-sm text-gray-500 mt-2 italic">{meal.notes}</p>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteMeal(meal.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'measurements' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Measurement History</h3>
                <button
                  onClick={() => setShowMeasurementModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                >
                  <Plus className="w-4 h-4" />
                  Log Measurement
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {measurements.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    No measurements logged yet
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {measurements.map(measurement => (
                      <div key={measurement.id} className="p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="text-lg font-bold text-gray-900">{measurement.date}</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {measurement.weight && (
                                <div className="bg-blue-50 rounded p-2">
                                  <div className="text-xs text-blue-600 font-semibold">Weight</div>
                                  <div className="text-lg font-bold text-blue-900">{measurement.weight} kg</div>
                                </div>
                              )}
                              {measurement.body_fat_percentage && (
                                <div className="bg-orange-50 rounded p-2">
                                  <div className="text-xs text-orange-600 font-semibold">Body Fat</div>
                                  <div className="text-lg font-bold text-orange-900">{measurement.body_fat_percentage}%</div>
                                </div>
                              )}
                              {measurement.muscle_mass && (
                                <div className="bg-green-50 rounded p-2">
                                  <div className="text-xs text-green-600 font-semibold">Muscle Mass</div>
                                  <div className="text-lg font-bold text-green-900">{measurement.muscle_mass} kg</div>
                                </div>
                              )}
                              {measurement.metabolic_age && (
                                <div className="bg-purple-50 rounded p-2">
                                  <div className="text-xs text-purple-600 font-semibold">Metabolic Age</div>
                                  <div className="text-lg font-bold text-purple-900">{measurement.metabolic_age} yrs</div>
                                </div>
                              )}
                            </div>
                            {measurement.notes && (
                              <p className="text-sm text-gray-500 mt-2 italic">{measurement.notes}</p>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteMeasurement(measurement.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Meal Modal */}
      {showMealModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Log Meal</h3>
              <button
                onClick={() => setShowMealModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={mealForm.date}
                    onChange={(e) => setMealForm({ ...mealForm, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Meal Type</label>
                  <select
                    value={mealForm.mealType}
                    onChange={(e) => setMealForm({ ...mealForm, mealType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Selected Dishes</label>
                {mealForm.dishes.length === 0 ? (
                  <div className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded-lg">
                    No dishes added yet
                  </div>
                ) : (
                  <div className="space-y-2">
                    {mealForm.dishes.map((dish, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{dish.name}</div>
                          <div className="text-sm text-gray-600">{dish.calories} cal per serving</div>
                        </div>
                        <input
                          type="number"
                          min="1"
                          value={dish.quantity}
                          onChange={(e) => handleUpdateDishQuantity(idx, e.target.value)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                        />
                        <button
                          onClick={() => handleRemoveDish(idx)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-sm font-semibold text-green-700">Total Calories</div>
                      <div className="text-2xl font-black text-green-900">{calculateTotalCalories()} cal</div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Add Dishes</label>
                <input
                  type="text"
                  placeholder="Search menu items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 mb-2"
                />
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                  {filteredMenuItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => handleAddDish(item)}
                      className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-600">{item.calories || 0} cal</div>
                        </div>
                        <Plus className="w-4 h-4 text-green-600" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notes (Optional)</label>
                <textarea
                  value={mealForm.notes}
                  onChange={(e) => setMealForm({ ...mealForm, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  rows="3"
                  placeholder="Any special notes..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSaveMeal}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                >
                  Save Meal
                </button>
                <button
                  onClick={() => setShowMealModal(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Measurement Modal */}
      {showMeasurementModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Log Physical Measurement</h3>
              <button
                onClick={() => setShowMeasurementModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={measurementForm.date}
                  onChange={(e) => setMeasurementForm({ ...measurementForm, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={measurementForm.weight}
                    onChange={(e) => setMeasurementForm({ ...measurementForm, weight: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Body Fat %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={measurementForm.bodyFatPercentage}
                    onChange={(e) => setMeasurementForm({ ...measurementForm, bodyFatPercentage: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Muscle Mass (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={measurementForm.muscleMass}
                    onChange={(e) => setMeasurementForm({ ...measurementForm, muscleMass: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Metabolic Age</label>
                  <input
                    type="number"
                    value={measurementForm.metabolicAge}
                    onChange={(e) => setMeasurementForm({ ...measurementForm, metabolicAge: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">BMI</label>
                  <input
                    type="number"
                    step="0.1"
                    value={measurementForm.bmi}
                    onChange={(e) => setMeasurementForm({ ...measurementForm, bmi: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Visceral Fat</label>
                  <input
                    type="number"
                    value={measurementForm.visceralFat}
                    onChange={(e) => setMeasurementForm({ ...measurementForm, visceralFat: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Waist (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={measurementForm.waist}
                    onChange={(e) => setMeasurementForm({ ...measurementForm, waist: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Hips (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={measurementForm.hips}
                    onChange={(e) => setMeasurementForm({ ...measurementForm, hips: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notes (Optional)</label>
                <textarea
                  value={measurementForm.notes}
                  onChange={(e) => setMeasurementForm({ ...measurementForm, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  rows="3"
                  placeholder="Any observations..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSaveMeasurement}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                >
                  Save Measurement
                </button>
                <button
                  onClick={() => setShowMeasurementModal(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CafeSubscriberTracking;
