import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Calendar, Users, CheckCircle, Clock, XCircle, Eye } from 'lucide-react';
import BatchDetailModal from './BatchDetailModal';
import UserDetailModal from './UserDetailModal';

const BatchManagement = ({ batches, users, onAddBatch, onUpdateBatch, onDeleteBatch, onUpdateUser, showToast }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    description: '',
    status: 'active',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingBatch) {
      onUpdateBatch(editingBatch.id, formData);
      setEditingBatch(null);
    } else {
      onAddBatch({
        ...formData,
        id: 'batch_' + Date.now(),
        createdAt: new Date().toISOString(),
        userCount: 0,
      });
    }
    
    setFormData({
      name: '',
      startDate: '',
      endDate: '',
      description: '',
      status: 'active',
    });
    setShowAddModal(false);
  };

  const handleEdit = (batch) => {
    setEditingBatch(batch);
    setFormData({
      name: batch.name,
      startDate: batch.startDate.split('T')[0],
      endDate: batch.endDate.split('T')[0],
      description: batch.description,
      status: batch.status,
    });
    setShowAddModal(true);
  };

  const getBatchStatus = (batch) => {
    const now = new Date();
    const start = new Date(batch.startDate);
    const end = new Date(batch.endDate);

    if (batch.status === 'completed') return 'completed';
    if (now < start) return 'upcoming';
    if (now > end) return 'ended';
    return 'active';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'upcoming': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'ended': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'completed': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'upcoming': return <Clock className="w-4 h-4" />;
      case 'ended': return <XCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getUsersInBatch = (batchId) => {
    return users.filter(user => user.batchId === batchId);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Batch Management</h1>
          <p className="text-gray-600 mt-2">Organize programs into batches/editions</p>
        </div>
        <button
          onClick={() => {
            setEditingBatch(null);
            setFormData({
              name: '',
              startDate: '',
              endDate: '',
              description: '',
              status: 'active',
            });
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition"
        >
          <Plus className="w-5 h-5" />
          Create Batch
        </button>
      </div>

      {/* Batches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {batches.map(batch => {
          const status = getBatchStatus(batch);
          const batchUsers = getUsersInBatch(batch.id);
          
          return (
            <div key={batch.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-lg mb-2">{batch.name}</h3>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                      {getStatusIcon(status)}
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedBatch(batch)}
                      className="px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition text-sm font-medium"
                      title="View Details"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => {
                        setEditingBatch(batch);
                        setFormData({
                          name: batch.name,
                          startDate: batch.startDate,
                          endDate: batch.endDate,
                          description: batch.description || '',
                          status: batch.status,
                        });
                        setShowAddModal(true);
                      }}
                      className="p-2 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Edit2 className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete ${batch.name}?`)) {
                          onDeleteBatch(batch.id);
                        }
                      }}
                      className="p-2 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>

                {batch.description && (
                  <p className="text-sm text-gray-600 mb-4">{batch.description}</p>
                )}

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(batch.startDate).toLocaleDateString()} - {new Date(batch.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{batchUsers.length} Members</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Created {new Date(batch.createdAt).toLocaleDateString()}</span>
                  {status === 'active' && (
                    <span className="text-green-600 font-medium">● Live</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {batches.length === 0 && (
        <div className="text-center py-20">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No batches yet</p>
          <p className="text-gray-400 text-sm mt-2">Create your first batch to organize your programs</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingBatch ? 'Edit Batch' : 'Create New Batch'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Batch Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="e.g., Batch 1 - Winter 2025"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="Brief description of this batch"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                >
                  <option value="active">Active</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingBatch(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
                >
                  {editingBatch ? 'Update' : 'Create'} Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Batch Detail Modal */}
      {selectedBatch && (
        <BatchDetailModal
          batch={selectedBatch}
          users={users}
          onClose={() => setSelectedBatch(null)}
          onViewUser={(user) => {
            setSelectedUser(user);
            setSelectedBatch(null);
          }}
        />
      )}

      {/* User Detail Modal */}
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

export default BatchManagement;
