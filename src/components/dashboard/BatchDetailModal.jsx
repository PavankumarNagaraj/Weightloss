import React, { useState } from 'react';
import { X, Users, Calendar, TrendingUp, Target, Activity } from 'lucide-react';
import { Line } from 'react-chartjs-2';

const BatchDetailModal = ({ batch, users, onClose, onViewUser }) => {
  const [selectedTab, setSelectedTab] = useState('overview');

  // Filter users in this batch
  const batchUsers = users.filter(user => user.batchId === batch.id);

  // Calculate batch statistics
  const stats = {
    totalMembers: batchUsers.length,
    activeMembers: batchUsers.filter(u => u.progressStatus === 'onTrack').length,
    atRisk: batchUsers.filter(u => u.progressStatus === 'atRisk').length,
    struggling: batchUsers.filter(u => u.progressStatus === 'struggling').length,
  };

  // Calculate average progress
  const avgProgress = batchUsers.length > 0
    ? batchUsers.reduce((sum, user) => {
        const daysPassed = Math.floor(
          (new Date() - new Date(user.startDate)) / (1000 * 60 * 60 * 24)
        );
        const totalDays = user.programType === '60-day' ? 60 : 90;
        return sum + Math.min((daysPassed / totalDays) * 100, 100);
      }, 0) / batchUsers.length
    : 0;

  // Calculate average weight loss
  const avgWeightLoss = batchUsers.length > 0
    ? batchUsers.reduce((sum, user) => {
        const currentWeight = user.logs && user.logs.length > 0 
          ? user.logs[user.logs.length - 1].weight 
          : 0;
        const startWeight = user.logs && user.logs.length > 0 
          ? user.logs[0].weight 
          : 0;
        return sum + (startWeight - currentWeight);
      }, 0) / batchUsers.length
    : 0;

  // Calculate batch duration
  const startDate = new Date(batch.startDate);
  const endDate = new Date(batch.endDate);
  const today = new Date();
  const totalDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
  const daysPassed = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
  const batchProgress = Math.min(Math.max((daysPassed / totalDays) * 100, 0), 100);

  // Weight loss trend data
  const weightLossTrendData = {
    labels: batchUsers.map(u => u.name.split(' ')[0]),
    datasets: [
      {
        label: 'Weight Loss (kg)',
        data: batchUsers.map(user => {
          const currentWeight = user.logs && user.logs.length > 0 
            ? user.logs[user.logs.length - 1].weight 
            : 0;
          const startWeight = user.logs && user.logs.length > 0 
            ? user.logs[0].weight 
            : 0;
          return (startWeight - currentWeight).toFixed(1);
        }),
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderColor: '#10b981',
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Member Weight Loss Progress',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Weight Loss (kg)',
        },
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

  const getStatusLabel = (status) => {
    switch (status) {
      case 'onTrack':
        return 'On Track';
      case 'atRisk':
        return 'At Risk';
      case 'struggling':
        return 'Struggling';
      default:
        return status;
    }
  };

  const getBatchStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'ended':
        return 'bg-gray-100 text-gray-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-800">{batch.name}</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getBatchStatusColor(batch.status)}`}>
                {batch.status}
              </span>
            </div>
            <p className="text-gray-600 mt-1">{batch.description}</p>
            <p className="text-sm text-gray-500 mt-1">
              {new Date(batch.startDate).toLocaleDateString()} - {new Date(batch.endDate).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex gap-4">
            <button
              onClick={() => setSelectedTab('overview')}
              className={`px-4 py-3 font-medium transition border-b-2 ${
                selectedTab === 'overview'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setSelectedTab('members')}
              className={`px-4 py-3 font-medium transition border-b-2 ${
                selectedTab === 'members'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Members ({batchUsers.length})
            </button>
            <button
              onClick={() => setSelectedTab('workouts')}
              className={`px-4 py-3 font-medium transition border-b-2 ${
                selectedTab === 'workouts'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Workouts
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {selectedTab === 'overview' && (
            <div className="space-y-6">
              {/* Batch Progress */}
              <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-6 text-white">
                <h3 className="text-lg font-semibold mb-4">Batch Progress</h3>
                <div className="flex items-center justify-between mb-2">
                  <span>Day {daysPassed} of {totalDays}</span>
                  <span>{batchProgress.toFixed(0)}% Complete</span>
                </div>
                <div className="w-full bg-white bg-opacity-20 rounded-full h-3">
                  <div
                    className="bg-white rounded-full h-3 transition-all"
                    style={{ width: `${batchProgress}%` }}
                  ></div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-blue-600 font-medium">Total Members</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">{stats.totalMembers}</p>
                </div>

                <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">On Track</span>
                  </div>
                  <p className="text-2xl font-bold text-green-900">{stats.activeMembers}</p>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-purple-600" />
                    <span className="text-sm text-purple-600 font-medium">Avg Progress</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-900">{avgProgress.toFixed(0)}%</p>
                </div>

                <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-5 h-5 text-orange-600" />
                    <span className="text-sm text-orange-600 font-medium">Avg Weight Loss</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-900">{avgWeightLoss.toFixed(1)} kg</p>
                </div>
              </div>

              {/* Weight Loss Chart */}
              {batchUsers.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Weight Loss Progress</h3>
                  <div style={{ height: '300px' }}>
                    <Line data={weightLossTrendData} options={chartOptions} />
                  </div>
                </div>
              )}

              {/* Status Distribution */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Member Status Distribution</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{stats.activeMembers}</div>
                    <div className="text-sm text-gray-600 mt-1">On Track</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600">{stats.atRisk}</div>
                    <div className="text-sm text-gray-600 mt-1">At Risk</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">{stats.struggling}</div>
                    <div className="text-sm text-gray-600 mt-1">Struggling</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'members' && (
            <div className="space-y-4">
              {batchUsers.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No members in this batch yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {batchUsers.map(user => {
                    const currentWeight = user.logs && user.logs.length > 0 
                      ? user.logs[user.logs.length - 1].weight 
                      : 0;
                    const startWeight = user.logs && user.logs.length > 0 
                      ? user.logs[0].weight 
                      : 0;
                    const weightLoss = startWeight - currentWeight;

                    return (
                      <div
                        key={user.id}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                        onClick={() => onViewUser(user)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-800">{user.name}</h4>
                            <p className="text-sm text-gray-600">👨‍🏫 {user.trainer || 'Unassigned'}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(user.progressStatus)}`}>
                            {getStatusLabel(user.progressStatus)}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <p className="text-gray-500">Weight Loss</p>
                            <p className="font-semibold text-green-600">{weightLoss.toFixed(1)} kg</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Current</p>
                            <p className="font-semibold">{currentWeight.toFixed(1)} kg</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Goal</p>
                            <p className="font-semibold">{user.goalWeight} kg</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {selectedTab === 'workouts' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Batch Workout Plan</h3>
                <p className="text-blue-700 mb-4">
                  Standard {batch.name} workout routine for all members
                </p>
                
                <div className="space-y-4">
                  {/* Week 1-2 */}
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Week 1-2: Foundation Phase</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>Cardio: 30 min walking/jogging (5 days/week)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>Strength: Bodyweight exercises - Push-ups, Squats, Planks (3 sets x 10 reps)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>Flexibility: 10 min stretching daily</span>
                      </li>
                    </ul>
                  </div>

                  {/* Week 3-4 */}
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Week 3-4: Building Phase</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>Cardio: 40 min mixed cardio (5 days/week)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>Strength: Resistance bands + Bodyweight (4 sets x 12 reps)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>Core: Dedicated ab workout (15 min, 3 days/week)</span>
                      </li>
                    </ul>
                  </div>

                  {/* Week 5-6 */}
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Week 5-6: Intensity Phase</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>Cardio: 45 min HIIT sessions (4 days/week)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>Strength: Full body circuit training (5 sets x 15 reps)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>Active Recovery: Yoga/Swimming (2 days/week)</span>
                      </li>
                    </ul>
                  </div>

                  {/* Week 7-8 */}
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Week 7-8: Peak Phase</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>Cardio: 50 min advanced HIIT (5 days/week)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>Strength: Progressive overload training (5 sets x 20 reps)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>Challenge: Weekly fitness assessments</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Individual modifications may be made by trainers based on member's fitness level and progress.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchDetailModal;
