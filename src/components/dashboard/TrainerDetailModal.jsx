import React from 'react';
import { X, Users, TrendingUp, Target, Mail, Phone, Award } from 'lucide-react';

const TrainerDetailModal = ({ trainer, users, onClose, onViewUser }) => {
  // Filter users assigned to this trainer
  const trainerUsers = users.filter(user => user.trainer === trainer.name);

  // Calculate trainer statistics
  const stats = {
    totalMembers: trainerUsers.length,
    onTrack: trainerUsers.filter(u => u.progressStatus === 'onTrack').length,
    atRisk: trainerUsers.filter(u => u.progressStatus === 'atRisk').length,
    struggling: trainerUsers.filter(u => u.progressStatus === 'struggling').length,
  };

  // Calculate average progress
  const avgProgress = trainerUsers.length > 0
    ? trainerUsers.reduce((sum, user) => {
        const daysPassed = Math.floor(
          (new Date() - new Date(user.startDate)) / (1000 * 60 * 60 * 24)
        );
        const totalDays = user.programType === '60-day' ? 60 : 90;
        return sum + Math.min((daysPassed / totalDays) * 100, 100);
      }, 0) / trainerUsers.length
    : 0;

  // Calculate average weight loss
  const avgWeightLoss = trainerUsers.length > 0
    ? trainerUsers.reduce((sum, user) => {
        const currentWeight = user.logs && user.logs.length > 0 
          ? user.logs[user.logs.length - 1].weight 
          : 0;
        const startWeight = user.logs && user.logs.length > 0 
          ? user.logs[0].weight 
          : 0;
        return sum + (startWeight - currentWeight);
      }, 0) / trainerUsers.length
    : 0;

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{trainer.name}</h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              {trainer.email && (
                <div className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  <span>{trainer.email}</span>
                </div>
              )}
              {trainer.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  <span>{trainer.phone}</span>
                </div>
              )}
              {trainer.specialization && (
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  <span>{trainer.specialization}</span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Performance Overview */}
          <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-4">Performance Overview</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm opacity-90">Total Members</p>
                <p className="text-3xl font-bold">{stats.totalMembers}</p>
              </div>
              <div>
                <p className="text-sm opacity-90">On Track</p>
                <p className="text-3xl font-bold">{stats.onTrack}</p>
              </div>
              <div>
                <p className="text-sm opacity-90">Avg Progress</p>
                <p className="text-3xl font-bold">{avgProgress.toFixed(0)}%</p>
              </div>
              <div>
                <p className="text-sm opacity-90">Avg Weight Loss</p>
                <p className="text-3xl font-bold">{avgWeightLoss.toFixed(1)} kg</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-600 font-medium">On Track</span>
              </div>
              <p className="text-2xl font-bold text-green-900">{stats.onTrack}</p>
              <p className="text-sm text-green-600">
                {stats.totalMembers > 0 ? ((stats.onTrack / stats.totalMembers) * 100).toFixed(0) : 0}% of members
              </p>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-yellow-600" />
                <span className="text-sm text-yellow-600 font-medium">At Risk</span>
              </div>
              <p className="text-2xl font-bold text-yellow-900">{stats.atRisk}</p>
              <p className="text-sm text-yellow-600">Need attention</p>
            </div>

            <div className="bg-red-50 rounded-lg p-4 border border-red-100">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-red-600" />
                <span className="text-sm text-red-600 font-medium">Struggling</span>
              </div>
              <p className="text-2xl font-bold text-red-900">{stats.struggling}</p>
              <p className="text-sm text-red-600">Require support</p>
            </div>
          </div>

          {/* Assigned Members */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Assigned Members ({trainerUsers.length})
            </h3>
            
            {trainerUsers.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No members assigned yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trainerUsers.map(user => {
                  const currentWeight = user.logs && user.logs.length > 0 
                    ? user.logs[user.logs.length - 1].weight 
                    : 0;
                  const startWeight = user.logs && user.logs.length > 0 
                    ? user.logs[0].weight 
                    : 0;
                  const weightLoss = startWeight - currentWeight;

                  const daysPassed = Math.floor(
                    (new Date() - new Date(user.startDate)) / (1000 * 60 * 60 * 24)
                  );
                  const totalDays = user.programType === '60-day' ? 60 : 90;
                  const progress = Math.min((daysPassed / totalDays) * 100, 100);

                  return (
                    <div
                      key={user.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                      onClick={() => onViewUser(user)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-800">{user.name}</h4>
                          <p className="text-sm text-gray-600">{user.programType}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(user.progressStatus)}`}>
                          {getStatusLabel(user.progressStatus)}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{progress.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary rounded-full h-2 transition-all"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
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
        </div>
      </div>
    </div>
  );
};

export default TrainerDetailModal;
