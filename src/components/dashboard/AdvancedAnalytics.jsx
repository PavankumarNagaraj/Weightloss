import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown,
  Users,
  Target,
  Award,
  Calendar,
  Activity,
  Zap,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import { format, subDays, differenceInDays, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
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
  Filler
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

const AdvancedAnalytics = ({ users }) => {
  const [timeRange, setTimeRange] = useState('30'); // days
  const [selectedMetric, setSelectedMetric] = useState('weight');

  // Calculate analytics
  const analytics = useMemo(() => {
    const now = new Date();
    const rangeStart = subDays(now, parseInt(timeRange));

    // Active users (logged in last 7 days)
    const activeUsers = users.filter(user => {
      if (!user.logs || user.logs.length === 0) return false;
      const lastLog = user.logs.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
      return differenceInDays(now, parseISO(lastLog.date)) <= 7;
    });

    // Total weight lost
    const totalWeightLost = users.reduce((sum, user) => {
      if (user.startWeight && user.currentWeight) {
        return sum + (user.startWeight - user.currentWeight);
      }
      return sum;
    }, 0);

    // Average weight loss
    const usersWithProgress = users.filter(u => u.startWeight && u.currentWeight && u.startWeight > u.currentWeight);
    const avgWeightLoss = usersWithProgress.length > 0
      ? totalWeightLost / usersWithProgress.length
      : 0;

    // Goal achievement rate
    const usersWithGoals = users.filter(u => u.goalWeight);
    const usersReachedGoal = users.filter(u => 
      u.goalWeight && u.currentWeight && u.currentWeight <= u.goalWeight
    );
    const goalAchievementRate = usersWithGoals.length > 0
      ? (usersReachedGoal.length / usersWithGoals.length) * 100
      : 0;

    // Retention rate (users active in last 30 days)
    const retentionRate = users.length > 0
      ? (activeUsers.length / users.length) * 100
      : 0;

    // Revenue metrics
    const totalRevenue = users.reduce((sum, user) => sum + (user.paidAmount || 0), 0);
    const pendingRevenue = users.reduce((sum, user) => {
      const programFee = user.programFee || 0;
      const paidAmount = user.paidAmount || 0;
      return sum + Math.max(0, programFee - paidAmount);
    }, 0);

    // Journey stage distribution
    const stageDistribution = {
      onboarding: 0,
      foundation: 0,
      momentum: 0,
      transformation: 0,
      maintenance: 0
    };

    users.forEach(user => {
      const daysSinceStart = user.startDate 
        ? differenceInDays(now, parseISO(user.startDate))
        : 0;
      
      if (daysSinceStart <= 7) stageDistribution.onboarding++;
      else if (daysSinceStart <= 21) stageDistribution.foundation++;
      else if (daysSinceStart <= 45) stageDistribution.momentum++;
      else if (daysSinceStart <= 90) stageDistribution.transformation++;
      else stageDistribution.maintenance++;
    });

    // Payment status distribution
    const paymentDistribution = {
      paid: users.filter(u => u.paymentStatus === 'paid').length,
      partial: users.filter(u => u.paymentStatus === 'partial').length,
      pending: users.filter(u => u.paymentStatus === 'pending' || !u.paymentStatus).length
    };

    // Weight loss trend (last 30 days)
    const weightLossTrend = [];
    for (let i = 29; i >= 0; i--) {
      const date = subDays(now, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      let totalLoss = 0;
      let count = 0;
      
      users.forEach(user => {
        if (user.logs) {
          const logsUpToDate = user.logs.filter(log => 
            new Date(log.date) <= date
          ).sort((a, b) => new Date(b.date) - new Date(a.date));
          
          if (logsUpToDate.length > 0 && user.startWeight) {
            const currentWeight = logsUpToDate[0].weight;
            totalLoss += user.startWeight - currentWeight;
            count++;
          }
        }
      });
      
      weightLossTrend.push({
        date: format(date, 'MMM dd'),
        value: count > 0 ? (totalLoss / count).toFixed(2) : 0
      });
    }

    // User activity trend
    const activityTrend = [];
    for (let i = 29; i >= 0; i--) {
      const date = subDays(now, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      const activeCount = users.filter(user => {
        if (!user.logs) return false;
        return user.logs.some(log => log.date === dateStr);
      }).length;
      
      activityTrend.push({
        date: format(date, 'MMM dd'),
        value: activeCount
      });
    }

    return {
      totalUsers: users.length,
      activeUsers: activeUsers.length,
      totalWeightLost: totalWeightLost.toFixed(1),
      avgWeightLoss: avgWeightLoss.toFixed(1),
      goalAchievementRate: goalAchievementRate.toFixed(1),
      retentionRate: retentionRate.toFixed(1),
      totalRevenue,
      pendingRevenue,
      stageDistribution,
      paymentDistribution,
      weightLossTrend,
      activityTrend,
      usersReachedGoal: usersReachedGoal.length
    };
  }, [users, timeRange]);

  // Chart configurations
  const weightLossChartData = {
    labels: analytics.weightLossTrend.map(d => d.date),
    datasets: [
      {
        label: 'Avg Weight Loss (kg)',
        data: analytics.weightLossTrend.map(d => d.value),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const activityChartData = {
    labels: analytics.activityTrend.map(d => d.date),
    datasets: [
      {
        label: 'Active Users',
        data: analytics.activityTrend.map(d => d.value),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1
      }
    ]
  };

  const stageChartData = {
    labels: ['Onboarding', 'Foundation', 'Momentum', 'Transformation', 'Maintenance'],
    datasets: [
      {
        data: [
          analytics.stageDistribution.onboarding,
          analytics.stageDistribution.foundation,
          analytics.stageDistribution.momentum,
          analytics.stageDistribution.transformation,
          analytics.stageDistribution.maintenance
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(168, 85, 247, 0.8)'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  };

  const paymentChartData = {
    labels: ['Paid', 'Partial', 'Pending'],
    datasets: [
      {
        data: [
          analytics.paymentDistribution.paid,
          analytics.paymentDistribution.partial,
          analytics.paymentDistribution.pending
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Advanced Analytics</h1>
          <p className="text-gray-600 mt-2">Comprehensive insights and performance metrics</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-10 h-10 text-blue-200" />
            <div className="text-right">
              <p className="text-blue-100 text-sm">Total Users</p>
              <p className="text-3xl font-bold">{analytics.totalUsers}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Activity className="w-4 h-4" />
            <span>{analytics.activeUsers} active</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <TrendingDown className="w-10 h-10 text-green-200" />
            <div className="text-right">
              <p className="text-green-100 text-sm">Total Weight Lost</p>
              <p className="text-3xl font-bold">{analytics.totalWeightLost}kg</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Target className="w-4 h-4" />
            <span>Avg: {analytics.avgWeightLoss}kg/user</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Award className="w-10 h-10 text-purple-200" />
            <div className="text-right">
              <p className="text-purple-100 text-sm">Goal Achievement</p>
              <p className="text-3xl font-bold">{analytics.goalAchievementRate}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>{analytics.usersReachedGoal} users reached goal</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Zap className="w-10 h-10 text-orange-200" />
            <div className="text-right">
              <p className="text-orange-100 text-sm">Retention Rate</p>
              <p className="text-3xl font-bold">{analytics.retentionRate}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Activity className="w-4 h-4" />
            <span>Active in last 7 days</span>
          </div>
        </div>
      </div>

      {/* Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-800">₹{analytics.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-green-600"
              style={{ width: '100%' }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Revenue</p>
              <p className="text-2xl font-bold text-gray-800">₹{analytics.pendingRevenue.toLocaleString()}</p>
            </div>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-red-500 to-red-600"
              style={{ 
                width: `${analytics.totalRevenue > 0 ? (analytics.pendingRevenue / (analytics.totalRevenue + analytics.pendingRevenue)) * 100 : 0}%` 
              }}
            />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weight Loss Trend */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <LineChart className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold text-gray-800">Weight Loss Trend</h3>
          </div>
          <div className="h-64">
            <Line data={weightLossChartData} options={chartOptions} />
          </div>
        </div>

        {/* User Activity */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold text-gray-800">Daily Active Users</h3>
          </div>
          <div className="h-64">
            <Bar data={activityChartData} options={chartOptions} />
          </div>
        </div>

        {/* Journey Stage Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold text-gray-800">Journey Stage Distribution</h3>
          </div>
          <div className="h-64">
            <Doughnut data={stageChartData} options={doughnutOptions} />
          </div>
        </div>

        {/* Payment Status */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold text-gray-800">Payment Status</h3>
          </div>
          <div className="h-64">
            <Doughnut data={paymentChartData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <p className="font-semibold text-gray-800">Best Performers</p>
            </div>
            <p className="text-sm text-gray-600">
              {analytics.usersReachedGoal} users have reached their goal weight
            </p>
          </div>

          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <p className="font-semibold text-gray-800">Engagement</p>
            </div>
            <p className="text-sm text-gray-600">
              {analytics.retentionRate}% of users are actively logging
            </p>
          </div>

          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <p className="font-semibold text-gray-800">Revenue</p>
            </div>
            <p className="text-sm text-gray-600">
              ₹{analytics.pendingRevenue.toLocaleString()} pending from {analytics.paymentDistribution.pending + analytics.paymentDistribution.partial} users
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;
