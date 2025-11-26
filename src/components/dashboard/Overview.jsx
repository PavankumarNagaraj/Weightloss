import React, { useState } from 'react';
import { Users, TrendingUp, AlertTriangle, AlertCircle } from 'lucide-react';
import UserDetailModal from './UserDetailModal';

const Overview = ({ users, loading, onUpdateUser }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [filterTrainer, setFilterTrainer] = useState('all');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Get active batch ID
  const activeBatchId = localStorage.getItem('activeBatchId');

  // Filter users by active batch first
  let batchFilteredUsers = users;
  if (activeBatchId) {
    batchFilteredUsers = users.filter(user => user.batchId === activeBatchId);
  }

  // Get unique trainers from batch-filtered users
  const trainers = ['all', ...new Set(batchFilteredUsers.map(u => u.trainer).filter(Boolean))];

  // Filter users by trainer
  const filteredUsers = filterTrainer === 'all' 
    ? batchFilteredUsers 
    : batchFilteredUsers.filter(user => user.trainer === filterTrainer);

  const stats = {
    total: filteredUsers.length,
    onTrack: filteredUsers.filter(u => u.progressStatus === 'onTrack').length,
    atRisk: filteredUsers.filter(u => u.progressStatus === 'atRisk').length,
    struggling: filteredUsers.filter(u => u.progressStatus === 'struggling').length,
  };

  const avgProgress = filteredUsers.length > 0
    ? filteredUsers.reduce((sum, user) => {
        const daysPassed = Math.floor(
          (new Date() - new Date(user.startDate)) / (1000 * 60 * 60 * 24)
        );
        const totalDays = user.programType === '60-day' ? 60 : 90;
        return sum + (daysPassed / totalDays) * 100;
      }, 0) / filteredUsers.length
    : 0;

  const cards = [
    {
      title: 'Total Users',
      value: stats.total,
      icon: Users,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Average Progress',
      value: `${Math.round(avgProgress)}%`,
      icon: TrendingUp,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'At Risk',
      value: stats.atRisk,
      icon: AlertTriangle,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Struggling',
      value: stats.struggling,
      icon: AlertCircle,
      color: 'bg-red-500',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  const allUsers = filteredUsers
    .sort((a, b) => new Date(b.createdAt || b.startDate) - new Date(a.createdAt || a.startDate));

  const getStatusColor = (status) => {
    switch (status) {
      case 'onTrack':
        return 'bg-green-100 text-green-800';
      case 'atRisk':
        return 'bg-yellow-100 text-yellow-800';
      case 'struggling':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
          <p className="text-gray-600 mt-2">Monitor your weight loss program performance</p>
        </div>
        <div className="w-64">
          <select
            value={filterTrainer}
            onChange={(e) => setFilterTrainer(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
          >
            {trainers.map(trainer => (
              <option key={trainer} value={trainer}>
                {trainer === 'all' ? 'All Trainers' : trainer}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-800">{card.value}</p>
                </div>
                <div className={`${card.bgColor} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${card.textColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* All Users */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">All Users ({users.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trainer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Program
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Goal Weight
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Skipped Classes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No users yet. Click "Add User" or "Load Sample Data" to get started.
                  </td>
                </tr>
              ) : (
                allUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">BMI: {user.bmi || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.trainer || 'Not Assigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.programType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.goalWeight} kg
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={user.skippedClasses > 5 ? 'text-red-600 font-semibold' : 'text-gray-900'}>
                        {user.skippedClasses || 0} days
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(user.progressStatus)}`}>
                        {getStatusLabel(user.progressStatus)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="text-primary hover:text-primary/80 font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUpdate={onUpdateUser}
        />
      )}
    </div>
  );
};

export default Overview;
