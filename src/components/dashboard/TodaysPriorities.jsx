import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  AlertCircle, 
  Trophy, 
  TrendingUp, 
  Users, 
  DollarSign,
  Calendar,
  Flame,
  Target,
  Activity
} from 'lucide-react';
import { getPriorities, getEngagementScore, getUserJourneyStage, getStageInfo } from '../../services/prioritiesService';

const TodaysPriorities = ({ users }) => {
  const navigate = useNavigate();
  const [priorities, setPriorities] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPriorities();
  }, [users]);

  const loadPriorities = () => {
    try {
      const data = getPriorities();
      setPriorities(data);
    } catch (error) {
      console.error('Error loading priorities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (userId) => {
    navigate(`/weightloss/dashboard/users?userId=${userId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Today's Priorities</h1>
        <p className="text-gray-600 mt-2">Focus on what matters most</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Active Today</p>
              <p className="text-3xl font-bold mt-1">{priorities.stats.activeToday}</p>
            </div>
            <Activity className="w-12 h-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Avg Loss (Week)</p>
              <p className="text-3xl font-bold mt-1">{priorities.stats.avgWeightLossWeek}kg</p>
            </div>
            <TrendingUp className="w-12 h-12 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Users</p>
              <p className="text-3xl font-bold mt-1">{priorities.stats.totalUsers}</p>
            </div>
            <Users className="w-12 h-12 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Pending Payments</p>
              <p className="text-3xl font-bold mt-1">{priorities.stats.pendingPayments}</p>
            </div>
            <DollarSign className="w-12 h-12 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Critical Alerts */}
      {priorities.critical.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-bold text-gray-800">
              Critical Attention Needed ({priorities.critical.length})
            </h2>
          </div>
          <div className="space-y-3">
            {priorities.critical.map((item, index) => (
              <div
                key={index}
                onClick={() => handleUserClick(item.userId)}
                className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 cursor-pointer transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
                    {item.userName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{item.userName}</p>
                    <p className="text-sm text-red-600">{item.message}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500">
                    {item.lastActive && `Last active: ${item.lastActive}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {priorities.warnings.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-6 h-6 text-yellow-500" />
            <h2 className="text-xl font-bold text-gray-800">
              Needs Attention ({priorities.warnings.length})
            </h2>
          </div>
          <div className="space-y-3">
            {priorities.warnings.slice(0, 5).map((item, index) => (
              <div
                key={index}
                onClick={() => handleUserClick(item.userId)}
                className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 cursor-pointer transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
                    {item.userName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{item.userName}</p>
                    <p className="text-sm text-yellow-600">{item.message}</p>
                  </div>
                </div>
                <div className="text-right">
                  {item.type === 'plateau' && (
                    <span className="text-xs text-gray-500">
                      Current: {item.currentWeight}kg | Goal: {item.goalWeight}kg
                    </span>
                  )}
                  {item.lastActive && (
                    <span className="text-xs text-gray-500">
                      Last active: {item.lastActive}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          {priorities.warnings.length > 5 && (
            <button
              onClick={() => navigate('/weightloss/dashboard/users')}
              className="mt-4 text-sm text-primary hover:underline"
            >
              View all {priorities.warnings.length} warnings →
            </button>
          )}
        </div>
      )}

      {/* Celebrations */}
      {priorities.celebrations.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-6 h-6 text-green-500" />
            <h2 className="text-xl font-bold text-gray-800">
              Celebrate Success! ({priorities.celebrations.length})
            </h2>
          </div>
          <div className="space-y-3">
            {priorities.celebrations.map((item, index) => (
              <div
                key={index}
                onClick={() => handleUserClick(item.userId)}
                className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 cursor-pointer transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white text-xl">
                    {item.type === 'milestone' && '🏆'}
                    {item.type === 'goal_reached' && '🎯'}
                    {item.type === 'streak' && '🔥'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{item.userName}</p>
                    <p className="text-sm text-green-600">{item.message}</p>
                  </div>
                </div>
                <div className="text-right">
                  {item.weightLost && (
                    <span className="text-xs text-gray-500">
                      Lost: {item.weightLost}kg
                    </span>
                  )}
                  {item.streak && (
                    <span className="text-xs text-gray-500">
                      {item.streak} days
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {priorities.critical.length === 0 && 
       priorities.warnings.length === 0 && 
       priorities.celebrations.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">All Clear!</h3>
          <p className="text-gray-600">
            No urgent priorities at the moment. Great job! 🎉
          </p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-primary to-secondary text-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/weightloss/dashboard/users')}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-4 rounded-lg transition text-left"
          >
            <Users className="w-6 h-6 mb-2" />
            <p className="font-semibold">View All Users</p>
            <p className="text-sm text-white/80">Manage user profiles</p>
          </button>
          <button
            onClick={() => navigate('/weightloss/dashboard/funnel')}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-4 rounded-lg transition text-left"
          >
            <Target className="w-6 h-6 mb-2" />
            <p className="font-semibold">View Pipeline</p>
            <p className="text-sm text-white/80">See user progress stages</p>
          </button>
          <button
            onClick={() => navigate('/weightloss/dashboard/reports')}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-4 rounded-lg transition text-left"
          >
            <TrendingUp className="w-6 h-6 mb-2" />
            <p className="font-semibold">View Analytics</p>
            <p className="text-sm text-white/80">Detailed insights</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TodaysPriorities;
