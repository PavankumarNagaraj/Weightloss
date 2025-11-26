import React, { useState } from 'react';
import { Search, ExternalLink, Trash2, Edit } from 'lucide-react';
import UserDetailModal from './UserDetailModal';

const UsersList = ({ users, loading, onUpdateUser, onDeleteUser, showToast, onEditUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTrainer, setFilterTrainer] = useState('all');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Filter by active batch first
  const activeBatchId = localStorage.getItem('activeBatchId');
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

  const filteredUsersBySearch = filteredUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || user.progressStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

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

  const copyUserLink = (userId) => {
    const link = `${window.location.origin}/user/${userId}`;
    navigator.clipboard.writeText(link);
    if (showToast) {
      showToast('User link copied to clipboard!', 'success');
    }
  };

  const calculateProgress = (user) => {
    const daysPassed = Math.floor(
      (new Date() - new Date(user.startDate)) / (1000 * 60 * 60 * 24)
    );
    const totalDays = user.programType === '60-day' ? 60 : 90;
    return Math.min(Math.round((daysPassed / totalDays) * 100), 100);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Users Management</h1>
        <p className="text-gray-600 mt-2">Manage all program participants</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
            <div className="w-full md:w-48">
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
          <div className="flex gap-2 flex-wrap">
            {['all', 'onTrack', 'atRisk', 'struggling'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterStatus === status
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'All' : getStatusLabel(status)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            {searchTerm || filterStatus !== 'all' 
              ? 'No users match your filters.' 
              : 'No users yet. Click "Add User" or "Load Sample Data" to get started.'}
          </div>
        ) : (
          filteredUsers.map((user) => {
            const progress = calculateProgress(user);
            const daysPassed = Math.floor(
              (new Date() - new Date(user.startDate)) / (1000 * 60 * 60 * 24)
            );
            const totalDays = user.programType === '60-day' ? 60 : 90;

            return (
              <div key={user.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{user.name}</h3>
                    <p className="text-sm text-gray-600">BMI: {user.bmi || 'N/A'} | Height: {user.height || 'N/A'} cm</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.progressStatus)}`}>
                    {getStatusLabel(user.progressStatus)}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Program:</span>
                    <span className="font-medium text-gray-800">{user.programType}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Goal Weight:</span>
                    <span className="font-medium text-gray-800">{user.goalWeight} kg</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Meal Plan:</span>
                    <span className="font-medium text-gray-800">{user.mealPlan}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress:</span>
                    <span className="font-medium text-gray-800">Day {daysPassed}/{totalDays}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedUser(user)}
                    className="flex-1 px-3 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition text-sm font-medium"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => onEditUser && onEditUser(user)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition text-sm font-medium"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => copyUserLink(user.id)}
                    className="px-3 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition"
                    title="Copy user link"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteUser(user.id)}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    title="Delete user"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUpdate={onUpdateUser}
          showToast={showToast}
        />
      )}
    </div>
  );
};

export default UsersList;
