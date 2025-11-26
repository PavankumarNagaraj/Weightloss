import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Target, TrendingDown, Calendar, Utensils, Activity, AlertCircle } from 'lucide-react';
import * as dataService from '../services/dataService';
import { Line } from 'react-chartjs-2';
import AttendanceCalendar from './dashboard/AttendanceCalendar';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const UserDashboard = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [todayLog, setTodayLog] = useState({
    weight: '',
    meals: {
      breakfast: '',
      lunch: '',
      dinner: '',
    },
    attended: true,
    sizeReduced: false,
    foodIntake: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [newFoodItem, setNewFoodItem] = useState({ item: '', calories: '', time: '' });

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const fetchUser = () => {
    try {
      const userData = dataService.getUserById(userId);
      if (userData) {
        setUser(userData);
        
        // Check if user already logged today
        const today = new Date().toISOString().split('T')[0];
        const todayLogEntry = userData.logs?.find(log => 
          log.date.split('T')[0] === today
        );
        
        if (todayLogEntry) {
          setTodayLog({
            weight: todayLogEntry.weight,
            meals: todayLogEntry.meals || { breakfast: '', lunch: '', dinner: '' },
            attended: todayLogEntry.attended !== undefined ? todayLogEntry.attended : true,
            sizeReduced: todayLogEntry.sizeReduced || false,
            foodIntake: todayLogEntry.foodIntake || [],
          });
        }
      } else {
        setError('User not found. Please check your link.');
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      setError('Failed to load user data.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFoodItem = () => {
    if (!newFoodItem.item || !newFoodItem.calories || !newFoodItem.time) {
      alert('Please fill in all food item fields');
      return;
    }
    
    setTodayLog({
      ...todayLog,
      foodIntake: [...todayLog.foodIntake, { ...newFoodItem, calories: parseInt(newFoodItem.calories) }]
    });
    setNewFoodItem({ item: '', calories: '', time: '' });
  };

  const handleRemoveFoodItem = (index) => {
    setTodayLog({
      ...todayLog,
      foodIntake: todayLog.foodIntake.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!todayLog.weight) {
      alert('Please enter your weight');
      return;
    }

    setSubmitting(true);

    try {
      const today = new Date().toISOString();
      const todayDate = today.split('T')[0];
      
      // Calculate BMI if height is available
      let bmi = null;
      if (user.height) {
        const heightInMeters = user.height / 100;
        const weight = parseFloat(todayLog.weight);
        bmi = parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
      }
      
      // Remove today's log if it exists
      const updatedLogs = user.logs?.filter(log => 
        log.date.split('T')[0] !== todayDate
      ) || [];
      
      // Calculate total calories
      const totalCalories = todayLog.foodIntake.reduce((sum, food) => sum + (parseInt(food.calories) || 0), 0);
      
      // Add new log
      updatedLogs.push({
        date: today,
        weight: parseFloat(todayLog.weight),
        bmi: bmi,
        meals: todayLog.meals,
        attended: todayLog.attended,
        sizeReduced: todayLog.sizeReduced,
        foodIntake: todayLog.foodIntake,
        totalCalories: totalCalories,
      });

      // Calculate skipped classes
      const skippedClasses = updatedLogs.filter(log => !log.attended).length;

      // Update user in localStorage
      dataService.updateUser(userId, { logs: updatedLogs, bmi: bmi, skippedClasses: skippedClasses });

      // Update local state
      setUser({ ...user, logs: updatedLogs, bmi: bmi, skippedClasses: skippedClasses });
      alert('Data saved successfully!');
    } catch (err) {
      console.error('Error saving data:', err);
      alert('Failed to save data. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-3xl">!</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  // Calculate stats
  const daysPassed = Math.floor(
    (new Date() - new Date(user.startDate)) / (1000 * 60 * 60 * 24)
  );
  const totalDays = user.programType === '60-day' ? 60 : 90;
  const progress = Math.min(Math.round((daysPassed / totalDays) * 100), 100);

  const currentWeight = user.logs && user.logs.length > 0 
    ? user.logs[user.logs.length - 1].weight 
    : 0;
  const startWeight = user.logs && user.logs.length > 0 
    ? user.logs[0].weight 
    : 0;
  const weightLoss = startWeight - currentWeight;
  const remainingWeight = currentWeight - user.goalWeight;

  // Calculate recommended calories
  const calculateRecommendedCalories = () => {
    const weight = currentWeight || 70;
    const height = user.height || 170;
    const age = user.age || 30;
    const gender = user.gender || 'Male';
    
    // BMR calculation (Mifflin-St Jeor Equation)
    let bmr;
    if (gender === 'Male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
    
    // Activity factor (moderate activity)
    const tdee = bmr * 1.55;
    
    // For weight loss, reduce by 500 calories
    return Math.round(tdee - 500);
  };

  const recommendedCalories = calculateRecommendedCalories();
  const todayCalories = todayLog.foodIntake.reduce((sum, food) => sum + (parseInt(food.calories) || 0), 0);

  // Weight Chart data
  const chartData = {
    labels: user.logs?.map((log, i) => `Day ${i + 1}`) || [],
    datasets: [
      {
        label: 'Your Weight (kg)',
        data: user.logs?.map(log => log.weight) || [],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Goal Weight',
        data: user.logs?.map(() => user.goalWeight) || [],
        borderColor: '#ef4444',
        borderDash: [5, 5],
        pointRadius: 0,
      },
    ],
  };

  // Calorie Timeline Chart data
  const calorieChartData = {
    labels: user.logs?.map((log, i) => {
      const date = new Date(log.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }) || [],
    datasets: [
      {
        label: 'Calories Consumed',
        data: user.logs?.map(log => log.totalCalories || 0) || [],
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Recommended Calories',
        data: user.logs?.map(() => recommendedCalories) || [],
        borderColor: '#3b82f6',
        borderDash: [5, 5],
        pointRadius: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Your Weight Progress',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  const calorieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Calorie Intake Timeline',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Calories (kcal)',
        },
      },
    },
  };

  const getMealPlanDetails = () => {
    const plans = {
      'Veg': {
        breakfast: 'Oats with fruits, Green tea',
        lunch: 'Brown rice, Dal, Salad, Vegetables',
        dinner: 'Roti, Paneer curry, Salad',
      },
      'Non-Veg': {
        breakfast: 'Eggs, Whole wheat toast, Green tea',
        lunch: 'Brown rice, Chicken curry, Salad',
        dinner: 'Roti, Fish curry, Vegetables',
      },
      'Detox': {
        breakfast: 'Green smoothie, Nuts',
        lunch: 'Quinoa salad, Grilled vegetables',
        dinner: 'Vegetable soup, Salad',
      },
      'Custom': {
        breakfast: 'As per trainer instructions',
        lunch: 'As per trainer instructions',
        dinner: 'As per trainer instructions',
      },
    };
    return plans[user.mealPlan] || plans['Custom'];
  };

  const mealPlan = getMealPlanDetails();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-800">Welcome, {user.name}!</h1>
          <p className="text-gray-600 mt-1">Track your weight loss journey</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Program Day</p>
                <p className="text-2xl font-bold text-gray-800">{daysPassed}/{totalDays}</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-600 mt-2">{progress}% Complete</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <TrendingDown className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Weight Loss</p>
                <p className="text-2xl font-bold text-green-600">{weightLoss.toFixed(1)} kg</p>
                <p className="text-xs text-gray-600">Lost so far</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Weight</p>
                <p className="text-2xl font-bold text-purple-600">{currentWeight.toFixed(1)} kg</p>
                <p className="text-xs text-gray-600">Today</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-3 rounded-lg">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">To Goal</p>
                <p className="text-2xl font-bold text-orange-600">{remainingWeight.toFixed(1)} kg</p>
                <p className="text-xs text-gray-600">Remaining</p>
              </div>
            </div>
          </div>
        </div>

        {/* Calorie Intake Tile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-blue-100 text-sm font-medium">Recommended Daily Calories</p>
                <p className="text-4xl font-bold mt-2">{recommendedCalories}</p>
                <p className="text-blue-100 text-xs mt-1">kcal/day</p>
              </div>
              <div className="bg-white/20 p-4 rounded-xl">
                <Activity className="w-8 h-8" />
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 mt-4">
              <p className="text-sm text-blue-50">Based on your BMR and activity level with 500 cal deficit for weight loss</p>
            </div>
          </div>

          <div className={`bg-gradient-to-br ${todayCalories > recommendedCalories ? 'from-red-500 to-red-600' : 'from-green-500 to-green-600'} rounded-xl shadow-lg p-6 text-white`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/90 text-sm font-medium">Today's Calorie Intake</p>
                <p className="text-4xl font-bold mt-2">{todayCalories}</p>
                <p className="text-white/90 text-xs mt-1">kcal consumed</p>
              </div>
              <div className="bg-white/20 p-4 rounded-xl">
                {todayCalories > recommendedCalories ? (
                  <AlertCircle className="w-8 h-8" />
                ) : (
                  <TrendingDown className="w-8 h-8" />
                )}
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  {todayCalories > recommendedCalories 
                    ? `Over by ${todayCalories - recommendedCalories} kcal` 
                    : `Under by ${recommendedCalories - todayCalories} kcal`}
                </span>
                <span className="text-sm font-semibold">
                  {((todayCalories / recommendedCalories) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                <div
                  className="bg-white h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((todayCalories / recommendedCalories) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Weight Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div style={{ height: '400px' }}>
              {user.logs && user.logs.length > 0 ? (
                <Line data={chartData} options={chartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Start logging your weight to see progress
                </div>
              )}
            </div>
          </div>

          {/* Calorie Timeline Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div style={{ height: '400px' }}>
              {user.logs && user.logs.length > 0 ? (
                <Line data={calorieChartData} options={calorieChartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Start logging your food to see calorie trends
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Log Form */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Today's Log</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (kg) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={todayLog.weight}
                  onChange={(e) => setTodayLog({ ...todayLog, weight: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="Enter your weight"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Breakfast
                </label>
                <input
                  type="text"
                  value={todayLog.meals.breakfast}
                  onChange={(e) => setTodayLog({
                    ...todayLog,
                    meals: { ...todayLog.meals, breakfast: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="What did you eat?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lunch
                </label>
                <input
                  type="text"
                  value={todayLog.meals.lunch}
                  onChange={(e) => setTodayLog({
                    ...todayLog,
                    meals: { ...todayLog.meals, lunch: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="What did you eat?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dinner
                </label>
                <input
                  type="text"
                  value={todayLog.meals.dinner}
                  onChange={(e) => setTodayLog({
                    ...todayLog,
                    meals: { ...todayLog.meals, dinner: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="What did you eat?"
                />
              </div>

              {/* Attendance Checkbox */}
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <input
                  type="checkbox"
                  id="attended"
                  checked={todayLog.attended}
                  onChange={(e) => setTodayLog({ ...todayLog, attended: e.target.checked })}
                  className="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="attended" className="text-sm font-medium text-gray-700 cursor-pointer">
                  ✓ I attended class today
                </label>
              </div>

              {/* Size Reduction Checkbox */}
              <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <input
                  type="checkbox"
                  id="sizeReduced"
                  checked={todayLog.sizeReduced}
                  onChange={(e) => setTodayLog({ ...todayLog, sizeReduced: e.target.checked })}
                  className="w-5 h-5 text-purple-600 focus:ring-purple-600 border-gray-300 rounded"
                />
                <label htmlFor="sizeReduced" className="text-sm font-medium text-gray-700 cursor-pointer">
                  📏 My size reduced (clothes feel looser)
                </label>
              </div>

              {/* Detailed Food Intake */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">📊 Detailed Food Intake (with Calories)</h3>
                
                {/* Add Food Item Form */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <input
                    type="text"
                    value={newFoodItem.item}
                    onChange={(e) => setNewFoodItem({ ...newFoodItem, item: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                    placeholder="Food item"
                  />
                  <input
                    type="number"
                    value={newFoodItem.calories}
                    onChange={(e) => setNewFoodItem({ ...newFoodItem, calories: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                    placeholder="Calories"
                  />
                  <input
                    type="time"
                    value={newFoodItem.time}
                    onChange={(e) => setNewFoodItem({ ...newFoodItem, time: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddFoodItem}
                  className="w-full mb-3 px-4 py-2 bg-secondary text-white rounded-lg text-sm font-medium hover:bg-secondary/90 transition"
                >
                  + Add Food Item
                </button>

                {/* Food Items List */}
                {todayLog.foodIntake.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {todayLog.foodIntake.map((food, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-700">{food.item}</span>
                          <span className="text-xs text-gray-500 ml-2">({food.time})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-primary">{food.calories} cal</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFoodItem(index)}
                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="p-2 bg-blue-50 rounded-lg border border-blue-200 flex justify-between font-bold text-sm">
                      <span className="text-blue-900">Total Calories:</span>
                      <span className="text-blue-900">
                        {todayLog.foodIntake.reduce((sum, food) => sum + (parseInt(food.calories) || 0), 0)} cal
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Saving...' : 'Save Today\'s Data'}
              </button>
            </form>
          </div>
        </div>

        {/* Attendance Calendar */}
        <div className="mt-6">
          <AttendanceCalendar users={[]} isAdmin={false} currentUser={user} />
        </div>

        {/* Meal Plan */}
        <div className="mt-6 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-primary/10 p-3 rounded-lg">
              <Utensils className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Your Meal Plan</h2>
              <p className="text-sm text-gray-600">{user.mealPlan} Plan</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
              <h3 className="font-bold text-gray-800 mb-2">🌅 Breakfast</h3>
              <p className="text-sm text-gray-700">{mealPlan.breakfast}</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
              <h3 className="font-bold text-gray-800 mb-2">☀️ Lunch</h3>
              <p className="text-sm text-gray-700">{mealPlan.lunch}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <h3 className="font-bold text-gray-800 mb-2">🌙 Dinner</h3>
              <p className="text-sm text-gray-700">{mealPlan.dinner}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
