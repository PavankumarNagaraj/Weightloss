import React, { useState, useMemo } from 'react';
import {
  TrendingDown,
  Apple,
  Dumbbell,
  Award,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Star
} from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { Line, Bar, Pie } from 'react-chartjs-2';

const FoodExerciseAnalytics = ({ users, showToast }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [timeRange, setTimeRange] = useState('all'); // all, 30days, 60days, 90days

  // Calculate analytics for all users
  const analytics = useMemo(() => {
    const mealPlanStats = {};
    const exerciseStats = {};
    const userProgress = [];

    users.forEach(user => {
      if (!user.startWeight || !user.currentWeight) return;

      const weightLoss = user.startWeight - user.currentWeight;
      const daysSinceStart = user.startDate 
        ? differenceInDays(new Date(), parseISO(user.startDate))
        : 0;
      const weightLossPerDay = daysSinceStart > 0 ? weightLoss / daysSinceStart : 0;

      // Meal plan statistics
      const mealPlan = user.mealPlan || 'Unknown';
      if (!mealPlanStats[mealPlan]) {
        mealPlanStats[mealPlan] = {
          count: 0,
          totalWeightLoss: 0,
          avgWeightLoss: 0,
          avgDailyLoss: 0,
          users: []
        };
      }
      mealPlanStats[mealPlan].count++;
      mealPlanStats[mealPlan].totalWeightLoss += weightLoss;
      mealPlanStats[mealPlan].avgDailyLoss += weightLossPerDay;
      mealPlanStats[mealPlan].users.push(user);

      // Exercise statistics (from logs or user data)
      const exercises = user.exercises || user.workoutType || 'General';
      const exerciseType = Array.isArray(exercises) ? exercises.join(', ') : exercises;
      
      if (!exerciseStats[exerciseType]) {
        exerciseStats[exerciseType] = {
          count: 0,
          totalWeightLoss: 0,
          avgWeightLoss: 0,
          avgDailyLoss: 0,
          users: []
        };
      }
      exerciseStats[exerciseType].count++;
      exerciseStats[exerciseType].totalWeightLoss += weightLoss;
      exerciseStats[exerciseType].avgDailyLoss += weightLossPerDay;
      exerciseStats[exerciseType].users.push(user);

      // User progress
      userProgress.push({
        user,
        weightLoss,
        weightLossPerDay,
        daysSinceStart,
        mealPlan,
        exerciseType,
        effectiveness: weightLossPerDay * 100 // Score
      });
    });

    // Calculate averages
    Object.keys(mealPlanStats).forEach(plan => {
      const stats = mealPlanStats[plan];
      stats.avgWeightLoss = stats.totalWeightLoss / stats.count;
      stats.avgDailyLoss = stats.avgDailyLoss / stats.count;
    });

    Object.keys(exerciseStats).forEach(exercise => {
      const stats = exerciseStats[exercise];
      stats.avgWeightLoss = stats.totalWeightLoss / stats.count;
      stats.avgDailyLoss = stats.avgDailyLoss / stats.count;
    });

    // Sort by effectiveness
    const sortedMealPlans = Object.entries(mealPlanStats)
      .sort((a, b) => b[1].avgDailyLoss - a[1].avgDailyLoss);
    
    const sortedExercises = Object.entries(exerciseStats)
      .sort((a, b) => b[1].avgDailyLoss - a[1].avgDailyLoss);

    const sortedUsers = userProgress
      .sort((a, b) => b.effectiveness - a.effectiveness);

    return {
      mealPlanStats: sortedMealPlans,
      exerciseStats: sortedExercises,
      userProgress: sortedUsers,
      totalUsers: users.length
    };
  }, [users]);

  // Get personalized recommendations for a user
  const getRecommendations = (user) => {
    if (!user) return null;

    const currentMealPlan = user.mealPlan || 'Unknown';
    const currentExercise = user.exercises || user.workoutType || 'General';
    const userWeightLoss = user.startWeight && user.currentWeight 
      ? user.startWeight - user.currentWeight 
      : 0;

    const recommendations = {
      mealPlan: null,
      exercise: null,
      insights: []
    };

    // Find best performing meal plan
    const bestMealPlan = analytics.mealPlanStats[0];
    if (bestMealPlan && bestMealPlan[0] !== currentMealPlan) {
      recommendations.mealPlan = {
        current: currentMealPlan,
        recommended: bestMealPlan[0],
        avgWeightLoss: bestMealPlan[1].avgWeightLoss.toFixed(1),
        improvement: ((bestMealPlan[1].avgDailyLoss / 0.1) * 100).toFixed(0)
      };
    }

    // Find best performing exercise
    const bestExercise = analytics.exerciseStats[0];
    if (bestExercise && bestExercise[0] !== currentExercise) {
      recommendations.exercise = {
        current: currentExercise,
        recommended: bestExercise[0],
        avgWeightLoss: bestExercise[1].avgWeightLoss.toFixed(1),
        improvement: ((bestExercise[1].avgDailyLoss / 0.1) * 100).toFixed(0)
      };
    }

    // Generate insights
    if (userWeightLoss > 0) {
      recommendations.insights.push({
        type: 'success',
        message: `Great progress! You've lost ${userWeightLoss.toFixed(1)}kg so far.`
      });
    }

    const userRank = analytics.userProgress.findIndex(u => u.user.id === user.id) + 1;
    if (userRank <= 10) {
      recommendations.insights.push({
        type: 'success',
        message: `You're in the top ${userRank} performers! Keep it up!`
      });
    }

    return recommendations;
  };

  // Chart data for meal plans
  const mealPlanChartData = {
    labels: analytics.mealPlanStats.map(([plan]) => plan),
    datasets: [{
      label: 'Average Weight Loss (kg)',
      data: analytics.mealPlanStats.map(([, stats]) => stats.avgWeightLoss),
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(251, 146, 60, 0.8)',
      ],
      borderColor: [
        'rgb(34, 197, 94)',
        'rgb(59, 130, 246)',
        'rgb(168, 85, 247)',
        'rgb(251, 146, 60)',
      ],
      borderWidth: 2
    }]
  };

  // Chart data for exercises
  const exerciseChartData = {
    labels: analytics.exerciseStats.map(([exercise]) => exercise),
    datasets: [{
      label: 'Average Weight Loss (kg)',
      data: analytics.exerciseStats.map(([, stats]) => stats.avgWeightLoss),
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: 2
    }]
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-purple-600 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Food & Exercise Analytics</h1>
            <p className="text-lg text-white/90">
              Data-driven insights to optimize your transformation journey
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/80">Total Users Analyzed</p>
            <p className="text-5xl font-bold">{analytics.totalUsers}</p>
          </div>
        </div>
      </div>

      {/* User Selector */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Select User for Personalized Recommendations
        </label>
        <select
          value={selectedUser?.id || ''}
          onChange={(e) => {
            const user = users.find(u => u.id === e.target.value);
            setSelectedUser(user);
          }}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="">-- View Overall Analytics --</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.name} - {user.mealPlan || 'No meal plan'}
            </option>
          ))}
        </select>
      </div>

      {/* Personalized Recommendations */}
      {selectedUser && (() => {
        const recommendations = getRecommendations(selectedUser);
        return (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-lg p-6 border-2 border-purple-200">
            <div className="flex items-center gap-3 mb-6">
              <Star className="w-8 h-8 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-800">
                Personalized Recommendations for {selectedUser.name}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Meal Plan Recommendation */}
              {recommendations.mealPlan && (
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <div className="flex items-center gap-2 mb-4">
                    <Apple className="w-6 h-6 text-green-600" />
                    <h3 className="text-lg font-bold text-gray-800">Meal Plan Suggestion</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Current Plan</p>
                      <p className="text-lg font-semibold text-gray-800">{recommendations.mealPlan.current}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-sm text-gray-600">Recommended Plan</p>
                      <p className="text-lg font-semibold text-green-600">{recommendations.mealPlan.recommended}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 mt-3">
                      <p className="text-sm text-green-800">
                        <strong>Average Result:</strong> {recommendations.mealPlan.avgWeightLoss}kg weight loss
                      </p>
                      <p className="text-xs text-green-700 mt-1">
                        Based on {analytics.mealPlanStats.find(([plan]) => plan === recommendations.mealPlan.recommended)?.[1].count} users
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Exercise Recommendation */}
              {recommendations.exercise && (
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <div className="flex items-center gap-2 mb-4">
                    <Dumbbell className="w-6 h-6 text-blue-600" />
                    <h3 className="text-lg font-bold text-gray-800">Exercise Suggestion</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Current Exercise</p>
                      <p className="text-lg font-semibold text-gray-800">{recommendations.exercise.current}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-sm text-gray-600">Recommended Exercise</p>
                      <p className="text-lg font-semibold text-blue-600">{recommendations.exercise.recommended}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 mt-3">
                      <p className="text-sm text-blue-800">
                        <strong>Average Result:</strong> {recommendations.exercise.avgWeightLoss}kg weight loss
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        Based on {analytics.exerciseStats.find(([ex]) => ex === recommendations.exercise.recommended)?.[1].count} users
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Insights */}
            {recommendations.insights.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Insights</h3>
                {recommendations.insights.map((insight, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 p-4 rounded-lg ${
                      insight.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
                    }`}
                  >
                    {insight.type === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    )}
                    <p className={`text-sm ${insight.type === 'success' ? 'text-green-800' : 'text-yellow-800'}`}>
                      {insight.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {/* Overall Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Meal Plan Performance */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <Apple className="w-8 h-8 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-800">Meal Plan Performance</h2>
          </div>

          {/* Chart */}
          <div className="mb-6 h-64">
            <Bar
              data={mealPlanChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  title: {
                    display: true,
                    text: 'Average Weight Loss by Meal Plan'
                  }
                }
              }}
            />
          </div>

          {/* Stats Table */}
          <div className="space-y-3">
            {analytics.mealPlanStats.map(([plan, stats], index) => (
              <div
                key={plan}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    index === 0 ? 'bg-green-500' : index === 1 ? 'bg-blue-500' : 'bg-gray-400'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{plan}</p>
                    <p className="text-sm text-gray-600">{stats.count} users</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    {stats.avgWeightLoss.toFixed(1)}kg
                  </p>
                  <p className="text-xs text-gray-600">
                    {(stats.avgDailyLoss * 1000).toFixed(1)}g/day
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Exercise Performance */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <Dumbbell className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800">Exercise Performance</h2>
          </div>

          {/* Chart */}
          <div className="mb-6 h-64">
            <Bar
              data={exerciseChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  title: {
                    display: true,
                    text: 'Average Weight Loss by Exercise Type'
                  }
                }
              }}
            />
          </div>

          {/* Stats Table */}
          <div className="space-y-3">
            {analytics.exerciseStats.map(([exercise, stats], index) => (
              <div
                key={exercise}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-purple-500' : 'bg-gray-400'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{exercise}</p>
                    <p className="text-sm text-gray-600">{stats.count} users</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.avgWeightLoss.toFixed(1)}kg
                  </p>
                  <p className="text-xs text-gray-600">
                    {(stats.avgDailyLoss * 1000).toFixed(1)}g/day
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Award className="w-8 h-8 text-yellow-500" />
          <h2 className="text-2xl font-bold text-gray-800">Top Performers</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Rank</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">User</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Meal Plan</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Exercise</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Weight Loss</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Daily Rate</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Days</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {analytics.userProgress.slice(0, 10).map((progress, index) => (
                <tr key={progress.user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-800">{progress.user.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{progress.mealPlan}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{progress.exerciseType}</td>
                  <td className="px-4 py-3 text-lg font-bold text-green-600">
                    {progress.weightLoss.toFixed(1)}kg
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {(progress.weightLossPerDay * 1000).toFixed(1)}g/day
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{progress.daysSinceStart}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg p-6 border-2 border-blue-200">
        <div className="flex items-center gap-3 mb-6">
          <Zap className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Key Insights</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <p className="text-sm text-gray-600 mb-2">Most Effective Meal Plan</p>
            <p className="text-2xl font-bold text-green-600 mb-1">
              {analytics.mealPlanStats[0]?.[0] || 'N/A'}
            </p>
            <p className="text-sm text-gray-700">
              {analytics.mealPlanStats[0]?.[1].avgWeightLoss.toFixed(1)}kg avg loss
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <p className="text-sm text-gray-600 mb-2">Most Effective Exercise</p>
            <p className="text-2xl font-bold text-blue-600 mb-1">
              {analytics.exerciseStats[0]?.[0] || 'N/A'}
            </p>
            <p className="text-sm text-gray-700">
              {analytics.exerciseStats[0]?.[1].avgWeightLoss.toFixed(1)}kg avg loss
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <p className="text-sm text-gray-600 mb-2">Top Performer</p>
            <p className="text-2xl font-bold text-purple-600 mb-1">
              {analytics.userProgress[0]?.user.name || 'N/A'}
            </p>
            <p className="text-sm text-gray-700">
              {analytics.userProgress[0]?.weightLoss.toFixed(1)}kg lost
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodExerciseAnalytics;
