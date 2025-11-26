import React, { useState } from 'react';
import { X, TrendingDown, Calendar, Target } from 'lucide-react';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const UserDetailModal = ({ user, onClose, onUpdate, showToast }) => {
  const [notes, setNotes] = useState('');
  const [newStatus, setNewStatus] = useState(user.progressStatus);
  const [showChangeTrainer, setShowChangeTrainer] = useState(false);
  const [newTrainer, setNewTrainer] = useState(user.trainer || '');
  
  // Weight and food logging states
  const [showLogEntry, setShowLogEntry] = useState(false);
  const [logWeight, setLogWeight] = useState('');
  const [logBreakfast, setLogBreakfast] = useState('');
  const [logLunch, setLogLunch] = useState('');
  const [logDinner, setLogDinner] = useState('');
  const [logSnacks, setLogSnacks] = useState('');
  const [logCalories, setLogCalories] = useState('');
  const [logSizeReduced, setLogSizeReduced] = useState(false);

  // Get all trainers from localStorage
  const trainers = JSON.parse(localStorage.getItem('weightloss_trainers') || '[]');

  const handleUpdateStatus = () => {
    onUpdate(user.id, { progressStatus: newStatus });
  };

  const handleAddNote = () => {
    if (!notes.trim()) return;
    
    const updatedNotes = [...(user.notes || []), {
      text: notes,
      date: new Date().toISOString(),
    }];
    
    onUpdate(user.id, { notes: updatedNotes });
    setNotes('');
  };

  const handleChangeTrainer = () => {
    if (!newTrainer) {
      return;
    }
    onUpdate(user.id, { trainer: newTrainer });
    setShowChangeTrainer(false);
  };

  const handleAddLog = () => {
    if (!logWeight || !logCalories) {
      return;
    }

    const newLog = {
      date: new Date().toISOString(),
      weight: parseFloat(logWeight),
      breakfast: logBreakfast,
      lunch: logLunch,
      dinner: logDinner,
      snacks: logSnacks,
      calories: parseInt(logCalories),
      sizeReduced: logSizeReduced,
    };

    const updatedLogs = [...(user.logs || []), newLog];
    onUpdate(user.id, { logs: updatedLogs });
    
    // Show success notification
    if (showToast) {
      showToast('Log entry saved successfully!', 'success');
    }
    
    // Reset form
    setLogWeight('');
    setLogBreakfast('');
    setLogLunch('');
    setLogDinner('');
    setLogSnacks('');
    setLogCalories('');
    setLogSizeReduced(false);
    setShowLogEntry(false);
  };

  // Calculate stats
  const daysPassed = Math.floor(
    (new Date() - new Date(user.startDate)) / (1000 * 60 * 60 * 24)
  );
  const totalDays = user.programType === '60-day' ? 60 : 90;
  const progress = Math.min(Math.round((daysPassed / totalDays) * 100), 100);

  const currentWeight = user.logs && user.logs.length > 0 
    ? user.logs[user.logs.length - 1].weight 
    : 0;
  const weightLost = user.logs && user.logs.length > 0 
    ? user.logs[0].weight - currentWeight 
    : 0;
  const remainingWeight = user.goalWeight ? currentWeight - user.goalWeight : 0;
  
  // Calculate classes skipped from attendance logs
  const classesSkipped = user.logs && user.logs.length > 0
    ? user.logs.filter(log => log.attended === false).length
    : 0;

  // Calculate recommended calories using BMR formula
  const calculateRecommendedCalories = () => {
    const weight = currentWeight || 70;
    const height = user.height || 170;
    const age = user.age || 30;
    const gender = user.gender || 'Male';
    
    let bmr;
    if (gender === 'Male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
    
    const tdee = bmr * 1.55; // Moderate activity level
    return Math.round(tdee - 500); // 500 calorie deficit for weight loss
  };

  const recommendedCalories = calculateRecommendedCalories();

  // Weight trend chart data
  const weightChartData = {
    labels: user.logs?.map((log, i) => `Day ${i + 1}`) || [],
    datasets: [
      {
        label: 'Weight (kg)',
        data: user.logs?.map(log => log.weight) || [],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
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

  const weightChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Weight Progress Over Time',
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  // Meal compliance chart
  const totalMeals = user.logs?.length * 3 || 0;
  const loggedMeals = user.logs?.reduce((sum, log) => {
    let count = 0;
    if (log.meals?.breakfast) count++;
    if (log.meals?.lunch) count++;
    if (log.meals?.dinner) count++;
    return sum + count;
  }, 0) || 0;

  const mealComplianceData = {
    labels: ['Logged', 'Missed'],
    datasets: [
      {
        data: [loggedMeals, totalMeals - loggedMeals],
        backgroundColor: ['#10b981', '#ef4444'],
      },
    ],
  };

  const mealComplianceOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Meal Logging Compliance',
      },
    },
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'onTrack':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'atRisk':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'struggling':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
            <p className="text-gray-600">BMI: {user.bmi || 'N/A'} | Height: {user.height || 'N/A'} cm</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-primary font-medium">👨‍🏫 Trainer: {user.trainer || 'Not Assigned'}</p>
              <button
                onClick={() => setShowChangeTrainer(!showChangeTrainer)}
                className="text-xs text-blue-600 hover:text-blue-700 underline"
              >
                Change
              </button>
            </div>
            {showChangeTrainer && (
              <div className="mt-3 flex items-center gap-2">
                <select
                  value={newTrainer}
                  onChange={(e) => setNewTrainer(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                >
                  <option value="">Select Trainer</option>
                  {trainers.map(trainer => (
                    <option key={trainer.id} value={trainer.name}>{trainer.name}</option>
                  ))}
                </select>
                <button
                  onClick={handleChangeTrainer}
                  className="px-3 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition"
                >
                  Update
                </button>
                <button
                  onClick={() => setShowChangeTrainer(false)}
                  className="px-3 py-1.5 border border-gray-300 text-sm rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Recommended Calories Banner */}
          <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">Recommended Daily Calorie Intake</h3>
                <p className="text-sm opacity-90">Based on BMR calculation for weight loss</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold">{recommendedCalories}</p>
                <p className="text-sm opacity-90">calories/day</p>
              </div>
            </div>
            <div className="mt-3 text-xs opacity-75">
              Calculated using: Weight ({currentWeight.toFixed(1)}kg), Height ({user.height}cm), Age ({user.age}), Gender ({user.gender})
            </div>
          </div>

          {/* Log Entry Section for Admin/Trainer */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-blue-900">Log Entry for User</h3>
              <button
                onClick={() => setShowLogEntry(!showLogEntry)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
              >
                {showLogEntry ? 'Cancel' : '+ Add Log Entry'}
              </button>
            </div>

            {showLogEntry && (
              <div className="bg-white rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Weight (kg) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={logWeight}
                      onChange={(e) => setLogWeight(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      placeholder="e.g., 75.5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Calories *
                    </label>
                    <input
                      type="number"
                      value={logCalories}
                      onChange={(e) => setLogCalories(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      placeholder="e.g., 1500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Breakfast
                    </label>
                    <input
                      type="text"
                      value={logBreakfast}
                      onChange={(e) => setLogBreakfast(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      placeholder="e.g., Oatmeal with fruits"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lunch
                    </label>
                    <input
                      type="text"
                      value={logLunch}
                      onChange={(e) => setLogLunch(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      placeholder="e.g., Grilled chicken salad"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dinner
                    </label>
                    <input
                      type="text"
                      value={logDinner}
                      onChange={(e) => setLogDinner(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      placeholder="e.g., Vegetable soup"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Snacks
                    </label>
                    <input
                      type="text"
                      value={logSnacks}
                      onChange={(e) => setLogSnacks(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      placeholder="e.g., Apple, nuts"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="sizeReduced"
                    checked={logSizeReduced}
                    onChange={(e) => setLogSizeReduced(e.target.checked)}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <label htmlFor="sizeReduced" className="text-sm text-gray-700">
                    Size reduced today
                  </label>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleAddLog}
                    disabled={!logWeight || !logCalories}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save Log Entry
                  </button>
                  <button
                    onClick={() => setShowLogEntry(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-blue-600 font-medium">Progress</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">Day {daysPassed}/{totalDays}</p>
              <p className="text-sm text-blue-600">{progress}% Complete</p>
            </div>

            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-600 font-medium">Weight Loss</span>
              </div>
              <p className="text-2xl font-bold text-green-900">{weightLost.toFixed(1)} kg</p>
              <p className="text-sm text-green-600">Lost so far</p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-purple-600" />
                <span className="text-sm text-purple-600 font-medium">Current</span>
              </div>
              <p className="text-2xl font-bold text-purple-900">{currentWeight.toFixed(1)} kg</p>
              <p className="text-sm text-purple-600">Current weight</p>
            </div>

            <div className="bg-red-50 rounded-lg p-4 border border-red-100">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-red-600" />
                <span className="text-sm text-red-600 font-medium">Attendance</span>
              </div>
              <p className="text-2xl font-bold text-red-900">{classesSkipped}</p>
              <p className="text-sm text-red-600">Classes Skipped</p>
            </div>

            <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-orange-600" />
                <span className="text-sm text-orange-600 font-medium">Remaining</span>
              </div>
              <p className="text-2xl font-bold text-orange-900">{remainingWeight.toFixed(1)} kg</p>
              <p className="text-sm text-orange-600">To goal</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-4">
              <div style={{ height: '300px' }}>
                {user.logs && user.logs.length > 0 ? (
                  <Line data={weightChartData} options={weightChartOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No weight data available
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div style={{ height: '300px' }}>
                {totalMeals > 0 ? (
                  <Pie data={mealComplianceData} options={mealComplianceOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No meal data available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Food History & Attendance */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Food History & Attendance</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {user.logs && user.logs.length > 0 ? (
                [...user.logs].reverse().map((log, index) => {
                  const logDate = new Date(log.date);
                  const formattedDate = logDate.toLocaleDateString('en-IN', { 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric' 
                  });
                  
                  return (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-800">{formattedDate}</h4>
                          <p className="text-sm text-gray-600">Weight: {log.weight} kg | BMI: {log.bmi || 'N/A'}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          log.attended ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {log.attended ? '✓ Attended' : '✗ Absent'}
                        </span>
                      </div>
                      
                      {/* Meals */}
                      <div className="space-y-2 mb-3">
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">🍳 Breakfast:</span>
                          <span className="text-gray-600 ml-2">{log.meals?.breakfast || 'Not logged'}</span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">🍱 Lunch:</span>
                          <span className="text-gray-600 ml-2">{log.meals?.lunch || 'Not logged'}</span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">🍽️ Dinner:</span>
                          <span className="text-gray-600 ml-2">{log.meals?.dinner || 'Not logged'}</span>
                        </div>
                      </div>
                      
                      {/* Detailed Food Intake with Calories */}
                      {log.foodIntake && log.foodIntake.length > 0 && (
                        <div className="bg-blue-50 rounded-lg p-3 mt-3">
                          <h5 className="font-semibold text-sm text-blue-900 mb-2">📊 Detailed Food Intake:</h5>
                          <div className="space-y-1">
                            {log.foodIntake.map((food, foodIndex) => (
                              <div key={foodIndex} className="flex justify-between text-sm">
                                <span className="text-gray-700">
                                  <span className="text-blue-600 font-medium">{food.time}</span> - {food.item}
                                </span>
                                <span className="font-semibold text-blue-900">{food.calories} cal</span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-2 pt-2 border-t border-blue-200 flex justify-between font-bold text-sm">
                            <span className="text-blue-900">Total Calories:</span>
                            <span className="text-blue-900">{log.totalCalories || 0} cal</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-center py-4">No logs available</p>
              )}
            </div>
          </div>

          {/* User Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">User Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Gender:</span>
                  <span className="font-medium text-gray-800">{user.gender}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Age:</span>
                  <span className="font-medium text-gray-800">{user.age}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Height:</span>
                  <span className="font-medium text-gray-800">{user.height || 'N/A'} cm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">BMI:</span>
                  <span className="font-medium text-gray-800">{user.bmi || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Program:</span>
                  <span className="font-medium text-gray-800">{user.programType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Meal Plan:</span>
                  <span className="font-medium text-gray-800">{user.mealPlan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Goal Weight:</span>
                  <span className="font-medium text-gray-800">{user.goalWeight} kg</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Update Status</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Progress Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  >
                    <option value="onTrack">On Track</option>
                    <option value="atRisk">At Risk</option>
                    <option value="struggling">Struggling</option>
                  </select>
                </div>
                <button
                  onClick={handleUpdateStatus}
                  className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium"
                >
                  Update Status
                </button>
                <div className={`px-4 py-2 rounded-lg border text-center font-medium ${getStatusColor(user.progressStatus)}`}>
                  Current: {user.progressStatus === 'onTrack' ? 'On Track' : user.progressStatus === 'atRisk' ? 'At Risk' : 'Struggling'}
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Trainer Notes</h3>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add a note..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
                <button
                  onClick={handleAddNote}
                  className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition font-medium"
                >
                  Add Note
                </button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {user.notes && user.notes.length > 0 ? (
                  user.notes.map((note, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-800">{note.text}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(note.date).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No notes yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;
