import React from 'react';
import { TrendingUp, TrendingDown, Users, Calendar, Award, Target, Activity, AlertCircle, Zap, Heart, TrendingUp as Velocity } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, subDays } from 'date-fns';
import { Line, Bar, Doughnut, Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Reports = ({ users, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Get active batch ID and filter users
  const activeBatchId = localStorage.getItem('activeBatchId');
  const filteredUsers = activeBatchId 
    ? users.filter(user => user.batchId === activeBatchId)
    : users;

  // Calculate weekly summary
  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);

  const weeklyStats = {
    totalUsers: filteredUsers.length,
    activeUsers: filteredUsers.filter(u => {
      const lastLog = u.logs?.[u.logs.length - 1];
      if (!lastLog) return false;
      const daysSinceLog = Math.floor((now - new Date(lastLog.date)) / (1000 * 60 * 60 * 24));
      return daysSinceLog <= 7;
    }).length,
    avgWeightLoss: 0,
    completionRate: 0,
  };

  // Calculate average weight loss
  const usersWithWeightLoss = filteredUsers.filter(u => u.logs && u.logs.length >= 2);
  if (usersWithWeightLoss.length > 0) {
    const totalWeightLoss = usersWithWeightLoss.reduce((sum, user) => {
      const firstWeight = user.logs[0]?.weight || 0;
      const lastWeight = user.logs[user.logs.length - 1]?.weight || 0;
      return sum + (firstWeight - lastWeight);
    }, 0);
    weeklyStats.avgWeightLoss = (totalWeightLoss / usersWithWeightLoss.length).toFixed(1);
  }

  // Calculate completion rate
  const usersWithLogs = filteredUsers.filter(u => u.logs && u.logs.length > 0);
  if (usersWithLogs.length > 0) {
    const totalCompletionRate = usersWithLogs.reduce((sum, user) => {
      const daysPassed = Math.floor((now - new Date(user.startDate)) / (1000 * 60 * 60 * 24));
      const expectedLogs = Math.min(daysPassed, user.programType === '60-day' ? 60 : 90);
      const actualLogs = user.logs.length;
      return sum + (actualLogs / expectedLogs) * 100;
    }, 0);
    weeklyStats.completionRate = Math.round(totalCompletionRate / usersWithLogs.length);
  }

  // Top performers
  const topPerformers = [...users]
    .filter(u => u.logs && u.logs.length >= 2)
    .map(user => {
      const firstWeight = user.logs[0]?.weight || 0;
      const lastWeight = user.logs[user.logs.length - 1]?.weight || 0;
      const weightLoss = firstWeight - lastWeight;
      const daysPassed = Math.floor((now - new Date(user.startDate)) / (1000 * 60 * 60 * 24));
      const avgLossPerDay = daysPassed > 0 ? weightLoss / daysPassed : 0;
      
      return {
        ...user,
        weightLoss,
        avgLossPerDay,
      };
    })
    .sort((a, b) => b.weightLoss - a.weightLoss)
    .slice(0, 5);

  // Users needing attention
  const needsAttention = filteredUsers.filter(u => {
    if (!u.logs || u.logs.length === 0) return true;
    
    const lastLog = u.logs[u.logs.length - 1];
    const daysSinceLog = Math.floor((now - new Date(lastLog.date)) / (1000 * 60 * 60 * 24));
    
    // Check for no weight change in last 5 days
    if (u.logs.length >= 5) {
      const last5Logs = u.logs.slice(-5);
      const weights = last5Logs.map(l => l.weight);
      const noChange = weights.every(w => w === weights[0]);
      if (noChange) return true;
    }
    
    // Check for missed logs
    if (daysSinceLog > 3) return true;
    
    return false;
  }).slice(0, 5);

  // Calculate funnel categories
  const funnelStats = filteredUsers.reduce((acc, user) => {
    if (!user.logs || user.logs.length < 2) {
      acc.noData++;
      return acc;
    }
    const initialWeight = user.logs[0].weight;
    const latestWeight = user.logs[user.logs.length - 1].weight;
    const weightLost = latestWeight < initialWeight;
    const recentLogs = user.logs.slice(-5);
    const sizeReducedCount = recentLogs.filter(log => log.sizeReduced).length;
    const sizeReduced = sizeReducedCount > recentLogs.length / 2;
    
    if (weightLost && sizeReduced) acc.success++;
    else if (weightLost && !sizeReduced) acc.needsExercise++;
    else if (!weightLost && sizeReduced) acc.needsDiet++;
    else acc.noProgress++;
    return acc;
  }, { success: 0, needsExercise: 0, needsDiet: 0, noProgress: 0, noData: 0 });

  const reportCards = [
    {
      title: 'Total Users',
      value: weeklyStats.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      gradient: 'from-blue-500 to-blue-600',
      change: null,
    },
    {
      title: 'Active This Week',
      value: weeklyStats.activeUsers,
      icon: Calendar,
      color: 'bg-green-500',
      gradient: 'from-green-500 to-green-600',
      change: null,
    },
    {
      title: 'Avg Weight Loss',
      value: `${weeklyStats.avgWeightLoss} kg`,
      icon: TrendingDown,
      color: 'bg-purple-500',
      gradient: 'from-purple-500 to-purple-600',
      change: null,
    },
    {
      title: 'Completion Rate',
      value: `${weeklyStats.completionRate}%`,
      icon: TrendingUp,
      color: 'bg-orange-500',
      gradient: 'from-orange-500 to-orange-600',
      change: null,
    },
  ];

  // Chart data
  const last7Days = eachDayOfInterval({ 
    start: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000), 
    end: now 
  });

  // Calculate actual weight loss for each day
  const calculateDailyWeightLoss = () => {
    return last7Days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      let totalWeightLoss = 0;
      let count = 0;

      filteredUsers.forEach(user => {
        if (user.logs && user.logs.length >= 2) {
          // Find logs for this specific day
          const dayLog = user.logs.find(log => {
            const logDate = format(new Date(log.date), 'yyyy-MM-dd');
            return logDate === dayStr;
          });

          if (dayLog) {
            // Calculate weight loss from start
            const startWeight = user.logs[0].weight;
            const currentWeight = dayLog.weight;
            const weightLoss = startWeight - currentWeight;
            if (weightLoss > 0) {
              totalWeightLoss += weightLoss;
              count++;
            }
          }
        }
      });

      return count > 0 ? (totalWeightLoss / count).toFixed(1) : 0;
    });
  };

  const weightTrendData = {
    labels: last7Days.map(d => format(d, 'EEE')),
    datasets: [{
      label: 'Avg Weight Loss (kg)',
      data: calculateDailyWeightLoss(),
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      fill: true,
      tension: 0.4,
    }],
  };

  const funnelChartData = {
    labels: ['Success', 'Needs Exercise', 'Needs Diet', 'No Progress'],
    datasets: [{
      data: [funnelStats.success, funnelStats.needsExercise, funnelStats.needsDiet, funnelStats.noProgress],
      backgroundColor: ['#10b981', '#f59e0b', '#ea580c', '#ef4444'],
      borderWidth: 3,
      borderColor: '#fff',
    }],
  };

  const statusChartData = {
    labels: ['On Track', 'At Risk', 'Struggling'],
    datasets: [{
      data: [
        filteredUsers.filter(u => u.progressStatus === 'onTrack').length,
        filteredUsers.filter(u => u.progressStatus === 'atRisk').length,
        filteredUsers.filter(u => u.progressStatus === 'struggling').length,
      ],
      backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
      borderWidth: 3,
      borderColor: '#fff',
    }],
  };

  // Calculate actual attendance for each day
  const calculateDailyAttendance = () => {
    return last7Days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      let attended = 0;
      let total = 0;

      filteredUsers.forEach(user => {
        if (user.logs && user.logs.length > 0) {
          // Check if user has a log for this day
          const dayLog = user.logs.find(log => {
            const logDate = format(new Date(log.date), 'yyyy-MM-dd');
            return logDate === dayStr;
          });

          if (dayLog) {
            total++;
            // Consider attendance if they logged data (weight and calories)
            if (dayLog.weight && dayLog.calories) {
              attended++;
            }
          }
        }
      });

      return total > 0 ? Math.round((attended / total) * 100) : 0;
    });
  };

  const attendanceData = {
    labels: last7Days.map(d => format(d, 'EEE')),
    datasets: [{
      label: 'Attendance %',
      data: calculateDailyAttendance(),
      backgroundColor: '#3b82f6',
      borderRadius: 8,
    }],
  };

  const mealPlanData = {
    labels: ['Veg', 'Non-Veg', 'Detox', 'Custom'],
    datasets: [{
      data: [
        filteredUsers.filter(u => u.mealPlan === 'Veg').length,
        filteredUsers.filter(u => u.mealPlan === 'Non-Veg').length,
        filteredUsers.filter(u => u.mealPlan === 'Detox').length,
        filteredUsers.filter(u => u.mealPlan === 'Custom').length,
      ],
      backgroundColor: ['#10b981', '#f59e0b', '#8b5cf6', '#6366f1'],
      borderWidth: 3,
      borderColor: '#fff',
    }],
  };

  // Calculate recommended calories based on BMI and goal
  const calculateRecommendedCalories = (user) => {
    // Base metabolic rate calculation (simplified)
    const weight = user.logs?.[user.logs.length - 1]?.weight || user.logs?.[0]?.weight || 70;
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

  // Prepare calorie comparison data for users
  const usersWithCalories = users
    .filter(u => u.logs && u.logs.length > 0)
    .slice(0, 10) // Top 10 users for readability
    .map(user => {
      const latestLog = user.logs[user.logs.length - 1];
      const consumedCalories = latestLog.totalCalories || 0;
      const recommendedCalories = calculateRecommendedCalories(user);
      const bmi = latestLog.bmi || user.bmi || 0;
      
      return {
        name: user.name,
        consumed: consumedCalories,
        recommended: recommendedCalories,
        bmi: bmi,
      };
    });

  const calorieComparisonData = {
    labels: usersWithCalories.map(u => u.name.split(' ')[0]), // First name only
    datasets: [
      {
        label: 'Recommended Calories',
        data: usersWithCalories.map(u => u.recommended),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: '#3b82f6',
        borderWidth: 2,
      },
      {
        label: 'Consumed Calories',
        data: usersWithCalories.map(u => u.consumed),
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
        borderColor: '#ef4444',
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          padding: 15,
          font: { size: 12 },
        },
      },
    },
  };

  const calorieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          padding: 15,
          font: { size: 12 },
        },
      },
      tooltip: {
        callbacks: {
          afterLabel: function(context) {
            const index = context.dataIndex;
            const user = usersWithCalories[index];
            return `BMI: ${user.bmi.toFixed(1)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Calories (kcal)'
        }
      }
    }
  };

  // Weight Loss Velocity (kg per week)
  const velocityData = users
    .filter(u => u.logs && u.logs.length >= 7)
    .map(user => {
      const daysPassed = Math.floor((now - new Date(user.startDate)) / (1000 * 60 * 60 * 24));
      const weightLoss = user.logs[0].weight - user.logs[user.logs.length - 1].weight;
      const weeksElapsed = daysPassed / 7;
      const velocity = weeksElapsed > 0 ? (weightLoss / weeksElapsed).toFixed(2) : 0;
      return {
        name: user.name.split(' ')[0],
        velocity: parseFloat(velocity),
        status: user.progressStatus,
      };
    })
    .sort((a, b) => b.velocity - a.velocity)
    .slice(0, 10);

  const velocityChartData = {
    labels: velocityData.map(u => u.name),
    datasets: [{
      label: 'Weight Loss Rate (kg/week)',
      data: velocityData.map(u => u.velocity),
      backgroundColor: velocityData.map(u => 
        u.status === 'onTrack' ? '#10b981' : u.status === 'atRisk' ? '#f59e0b' : '#ef4444'
      ),
      borderRadius: 8,
    }],
  };

  // BMI Distribution
  const bmiCategories = filteredUsers.reduce((acc, user) => {
    const bmi = user.bmi || 0;
    if (bmi < 18.5) acc.underweight++;
    else if (bmi < 25) acc.normal++;
    else if (bmi < 30) acc.overweight++;
    else acc.obese++;
    return acc;
  }, { underweight: 0, normal: 0, overweight: 0, obese: 0 });

  const bmiDistributionData = {
    labels: ['Underweight (<18.5)', 'Normal (18.5-25)', 'Overweight (25-30)', 'Obese (>30)'],
    datasets: [{
      data: [bmiCategories.underweight, bmiCategories.normal, bmiCategories.overweight, bmiCategories.obese],
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
      borderWidth: 3,
      borderColor: '#fff',
    }],
  };

  // Consistency Score (% of days logged)
  const consistencyData = users
    .filter(u => u.logs && u.logs.length > 0)
    .map(user => {
      const daysPassed = Math.floor((now - new Date(user.startDate)) / (1000 * 60 * 60 * 24));
      const expectedLogs = Math.min(daysPassed, user.programType === '60-day' ? 60 : 90);
      const consistency = expectedLogs > 0 ? ((user.logs.length / expectedLogs) * 100).toFixed(0) : 0;
      return {
        name: user.name.split(' ')[0],
        consistency: parseInt(consistency),
      };
    })
    .sort((a, b) => b.consistency - a.consistency)
    .slice(0, 10);

  const consistencyChartData = {
    labels: consistencyData.map(u => u.name),
    datasets: [{
      label: 'Logging Consistency %',
      data: consistencyData.map(u => u.consistency),
      backgroundColor: consistencyData.map(u => 
        u.consistency >= 80 ? '#10b981' : u.consistency >= 60 ? '#f59e0b' : '#ef4444'
      ),
      borderRadius: 8,
    }],
  };

  // Trainer Performance
  const trainerStats = filteredUsers.reduce((acc, user) => {
    const trainer = user.trainer || 'Unassigned';
    if (!acc[trainer]) {
      acc[trainer] = { users: 0, totalWeightLoss: 0, avgAttendance: 0, attendanceCount: 0 };
    }
    acc[trainer].users++;
    
    if (user.logs && user.logs.length >= 2) {
      const weightLoss = user.logs[0].weight - user.logs[user.logs.length - 1].weight;
      acc[trainer].totalWeightLoss += weightLoss;
    }
    
    if (user.logs) {
      const attended = user.logs.filter(log => log.attended).length;
      const attendanceRate = user.logs.length > 0 ? (attended / user.logs.length) * 100 : 0;
      acc[trainer].avgAttendance += attendanceRate;
      acc[trainer].attendanceCount++;
    }
    
    return acc;
  }, {});

  const trainerPerformanceData = {
    labels: Object.keys(trainerStats),
    datasets: [
      {
        label: 'Avg Weight Loss (kg)',
        data: Object.values(trainerStats).map(t => 
          t.users > 0 ? (t.totalWeightLoss / t.users).toFixed(1) : 0
        ),
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderColor: '#10b981',
        borderWidth: 2,
      },
      {
        label: 'Avg Attendance %',
        data: Object.values(trainerStats).map(t => 
          t.attendanceCount > 0 ? (t.avgAttendance / t.attendanceCount).toFixed(0) : 0
        ),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: '#3b82f6',
        borderWidth: 2,
      },
    ],
  };

  // Goal Achievement Forecast
  const forecastData = users
    .filter(u => u.logs && u.logs.length >= 7)
    .map(user => {
      const daysPassed = Math.floor((now - new Date(user.startDate)) / (1000 * 60 * 60 * 24));
      const currentWeight = user.logs[user.logs.length - 1].weight;
      const weightLoss = user.logs[0].weight - currentWeight;
      const remainingWeight = currentWeight - user.goalWeight;
      
      if (weightLoss <= 0 || remainingWeight <= 0) return null;
      
      const avgLossPerDay = weightLoss / daysPassed;
      const daysToGoal = Math.ceil(remainingWeight / avgLossPerDay);
      const totalDays = user.programType === '60-day' ? 60 : 90;
      const willAchieve = daysToGoal <= (totalDays - daysPassed);
      
      return {
        name: user.name.split(' ')[0],
        daysToGoal,
        willAchieve,
        remainingDays: totalDays - daysPassed,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.daysToGoal - b.daysToGoal)
    .slice(0, 10);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Reports & Analytics</h1>
        <p className="text-gray-600 mt-2">
          Week of {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
        </p>
      </div>

      {/* Weekly Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {reportCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`bg-gradient-to-r ${card.gradient} p-3 rounded-xl shadow-md`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1 font-medium">{card.title}</p>
              <p className="text-4xl font-bold text-gray-800 mb-2">{card.value}</p>
              <div className={`h-1 bg-gradient-to-r ${card.gradient} rounded-full`}></div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Weight Loss Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-2 rounded-lg">
              <TrendingDown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Weight Loss Trend</h2>
              <p className="text-sm text-gray-600">Last 7 days average</p>
            </div>
          </div>
          <div style={{ height: '250px' }}>
            <Line data={weightTrendData} options={chartOptions} />
          </div>
        </div>

        {/* Funnel Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-2 rounded-lg">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Results Distribution</h2>
              <p className="text-sm text-gray-600">4-Quadrant breakdown</p>
            </div>
          </div>
          <div style={{ height: '250px' }}>
            <Doughnut data={funnelChartData} options={chartOptions} />
          </div>
        </div>

        {/* Attendance Rate */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-lg">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Attendance Rate</h2>
              <p className="text-sm text-gray-600">Daily attendance %</p>
            </div>
          </div>
          <div style={{ height: '250px' }}>
            <Bar data={attendanceData} options={chartOptions} />
          </div>
        </div>

        {/* Progress Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-2 rounded-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Progress Status</h2>
              <p className="text-sm text-gray-600">User status breakdown</p>
            </div>
          </div>
          <div style={{ height: '250px' }}>
            <Doughnut data={statusChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Calorie Intake Tiles for Admin */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-blue-100 text-sm font-medium">Avg Recommended</p>
              <p className="text-4xl font-bold mt-2">
                {filteredUsers.length > 0 
                  ? Math.round(usersWithCalories.reduce((sum, u) => sum + u.recommended, 0) / usersWithCalories.length)
                  : 0}
              </p>
              <p className="text-blue-100 text-xs mt-1">kcal/day</p>
            </div>
            <div className="bg-white/20 p-4 rounded-xl">
              <Target className="w-8 h-8" />
            </div>
          </div>
          <p className="text-sm text-blue-50">Average target for all users</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-red-100 text-sm font-medium">Avg Consumed</p>
              <p className="text-4xl font-bold mt-2">
                {filteredUsers.length > 0 
                  ? Math.round(usersWithCalories.reduce((sum, u) => sum + u.consumed, 0) / usersWithCalories.length)
                  : 0}
              </p>
              <p className="text-red-100 text-xs mt-1">kcal/day</p>
            </div>
            <div className="bg-white/20 p-4 rounded-xl">
              <Activity className="w-8 h-8" />
            </div>
          </div>
          <p className="text-sm text-red-50">Average intake across users</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-green-100 text-sm font-medium">Compliance Rate</p>
              <p className="text-4xl font-bold mt-2">
                {filteredUsers.length > 0 
                  ? Math.round((usersWithCalories.filter(u => u.consumed <= u.recommended).length / usersWithCalories.length) * 100)
                  : 0}%
              </p>
              <p className="text-green-100 text-xs mt-1">on target</p>
            </div>
            <div className="bg-white/20 p-4 rounded-xl">
              <Award className="w-8 h-8" />
            </div>
          </div>
          <p className="text-sm text-green-50">Users within calorie target</p>
        </div>
      </div>

      {/* Calorie Comparison Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gradient-to-r from-red-500 to-red-600 p-2 rounded-lg">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">Calorie Analysis by User</h2>
            <p className="text-sm text-gray-600">Recommended vs Consumed (Based on BMI & Activity)</p>
          </div>
        </div>
        {usersWithCalories.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No calorie data available yet</p>
          </div>
        ) : (
          <>
            <div style={{ height: '350px' }}>
              <Bar data={calorieComparisonData} options={calorieChartOptions} />
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-sm font-semibold text-gray-700">Recommended</span>
                </div>
                <p className="text-xs text-gray-600">Based on BMR, activity level, and weight loss goal (500 cal deficit)</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-sm font-semibold text-gray-700">Consumed</span>
                </div>
                <p className="text-xs text-gray-600">Total calories from logged food intake (latest day)</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-semibold text-gray-700">BMI Info</span>
                </div>
                <p className="text-xs text-gray-600">Hover over bars to see individual BMI values</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Meal Plan Distribution */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-2 rounded-lg">
            <Award className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">Meal Plan Distribution</h2>
            <p className="text-sm text-gray-600">User preferences</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div style={{ height: '300px' }}>
            <Doughnut data={mealPlanData} options={chartOptions} />
          </div>
          <div className="flex flex-col justify-center space-y-3">
            {['Veg', 'Non-Veg', 'Detox', 'Custom'].map((plan, i) => {
              const colors = ['#10b981', '#f59e0b', '#8b5cf6', '#6366f1'];
              const count = filteredUsers.filter(u => u.mealPlan === plan).length;
              const percentage = filteredUsers.length > 0 ? ((count / filteredUsers.length) * 100).toFixed(0) : 0;
              return (
                <div key={plan} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div style={{ backgroundColor: colors[i] }} className="w-4 h-4 rounded-full"></div>
                    <span className="font-medium text-gray-700">{plan}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-gray-800">{count}</span>
                    <span className="text-sm text-gray-600 ml-2">({percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Advanced Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Weight Loss Velocity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-2 rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Weight Loss Velocity</h2>
              <p className="text-sm text-gray-600">Rate of progress (kg/week)</p>
            </div>
          </div>
          {velocityData.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>Not enough data yet (need 7+ days)</p>
            </div>
          ) : (
            <div style={{ height: '300px' }}>
              <Bar data={velocityChartData} options={chartOptions} />
            </div>
          )}
        </div>

        {/* BMI Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-pink-500 to-pink-600 p-2 rounded-lg">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">BMI Distribution</h2>
              <p className="text-sm text-gray-600">Health category breakdown</p>
            </div>
          </div>
          <div style={{ height: '300px' }}>
            <Doughnut data={bmiDistributionData} options={chartOptions} />
          </div>
        </div>

        {/* Logging Consistency */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 p-2 rounded-lg">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Logging Consistency</h2>
              <p className="text-sm text-gray-600">Daily tracking adherence</p>
            </div>
          </div>
          {consistencyData.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No data available yet</p>
            </div>
          ) : (
            <div style={{ height: '300px' }}>
              <Bar data={consistencyChartData} options={chartOptions} />
            </div>
          )}
        </div>

        {/* Trainer Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-violet-500 to-violet-600 p-2 rounded-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Trainer Performance</h2>
              <p className="text-sm text-gray-600">Effectiveness comparison</p>
            </div>
          </div>
          <div style={{ height: '300px' }}>
            <Bar data={trainerPerformanceData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Goal Achievement Forecast */}
      {forecastData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-2 rounded-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Goal Achievement Forecast</h2>
              <p className="text-sm text-gray-600">Predicted timeline to reach target weight</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {forecastData.map((user, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg border-2 ${
                  user.willAchieve 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-orange-50 border-orange-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-800">{user.name}</span>
                  {user.willAchieve ? (
                    <span className="text-green-600 text-xl">✓</span>
                  ) : (
                    <span className="text-orange-600 text-xl">⚠</span>
                  )}
                </div>
                <div className="text-2xl font-bold text-gray-800 mb-1">
                  {user.daysToGoal} days
                </div>
                <div className="text-xs text-gray-600">
                  {user.willAchieve 
                    ? `Will achieve goal` 
                    : `Needs ${user.daysToGoal - user.remainingDays} extra days`
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-800">Top Performers</h2>
            <p className="text-sm text-gray-600 mt-1">Users with highest weight loss</p>
          </div>
          <div className="p-6">
            {topPerformers.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No data available yet</p>
            ) : (
              <div className="space-y-4">
                {topPerformers.map((user, index) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.programType}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{user.weightLoss.toFixed(1)} kg</p>
                      <p className="text-xs text-gray-600">lost</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Needs Attention */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-800">Needs Attention</h2>
            <p className="text-sm text-gray-600 mt-1">Users requiring follow-up</p>
          </div>
          <div className="p-6">
            {needsAttention.length === 0 ? (
              <p className="text-center text-gray-500 py-8">All users are on track!</p>
            ) : (
              <div className="space-y-4">
                {needsAttention.map((user) => {
                  const lastLog = user.logs?.[user.logs.length - 1];
                  const daysSinceLog = lastLog 
                    ? Math.floor((now - new Date(lastLog.date)) / (1000 * 60 * 60 * 24))
                    : 999;
                  
                  const reason = !user.logs || user.logs.length === 0
                    ? 'No logs yet'
                    : daysSinceLog > 3
                    ? `${daysSinceLog} days since last log`
                    : 'No weight change';

                  return (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
                      <div>
                        <p className="font-medium text-gray-800">{user.name}</p>
                        <p className="text-sm text-red-600">{reason}</p>
                      </div>
                      <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                        Action Required
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Program Distribution */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Program Distribution</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">
              {filteredUsers.filter(u => u.programType === '60-day').length}
            </p>
            <p className="text-sm text-gray-600 mt-1">60-Day Program</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-3xl font-bold text-purple-600">
              {filteredUsers.filter(u => u.programType === '90-day').length}
            </p>
            <p className="text-sm text-gray-600 mt-1">90-Day Program</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">
              {filteredUsers.filter(u => {
                const daysPassed = Math.floor((now - new Date(u.startDate)) / (1000 * 60 * 60 * 24));
                const totalDays = u.programType === '60-day' ? 60 : 90;
                return daysPassed >= totalDays;
              }).length}
            </p>
            <p className="text-sm text-gray-600 mt-1">Completed</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
