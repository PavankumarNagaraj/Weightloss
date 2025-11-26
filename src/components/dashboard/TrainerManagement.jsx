import React, { useState } from 'react';
import { UserPlus, Edit2, Trash2, Users, Mail, Phone, Shield, Eye } from 'lucide-react';
import TrainerDetailModal from './TrainerDetailModal';
import UserDetailModal from './UserDetailModal';

const TrainerManagement = ({ trainers, users, onAddTrainer, onUpdateTrainer, onDeleteTrainer, onUpdateUser, showToast }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState(null);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    specialization: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingTrainer) {
      onUpdateTrainer(editingTrainer.id, formData);
      setEditingTrainer(null);
    } else {
      onAddTrainer({
        ...formData,
        id: 'trainer_' + Date.now(),
        createdAt: new Date().toISOString(),
        assignedUsers: [],
      });
    }
    
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      specialization: '',
    });
    setShowAddModal(false);
  };

  const handleEdit = (trainer) => {
    setEditingTrainer(trainer);
    setFormData({
      name: trainer.name,
      email: trainer.email,
      phone: trainer.phone,
      password: '',
      specialization: trainer.specialization,
    });
    setShowAddModal(true);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Trainer Management</h1>
          <p className="text-gray-600 mt-2">Manage trainers and their access</p>
        </div>
        <button
          onClick={() => {
            setEditingTrainer(null);
            setFormData({
              name: '',
              email: '',
              phone: '',
              password: '',
              specialization: '',
            });
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition"
        >
          <UserPlus className="w-5 h-5" />
          Add Trainer
        </button>
      </div>

      {/* Trainers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trainers.map(trainer => {
          // Count members assigned to this trainer from active batch
          // Get all users directly from localStorage to avoid double filtering
          const allUsers = JSON.parse(localStorage.getItem('weightloss_users') || '[]');
          const activeBatchId = localStorage.getItem('activeBatchId');
          
          let trainerMemberCount = 0;
          if (allUsers && allUsers.length > 0) {
            trainerMemberCount = allUsers.filter(u => {
              const matchesTrainer = u.trainer === trainer.name;
              const matchesBatch = !activeBatchId || u.batchId === activeBatchId;
              return matchesTrainer && matchesBatch;
            }).length;
          }
          
          return (
          <div key={trainer.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{trainer.name}</h3>
                  <p className="text-sm text-gray-500">{trainer.specialization}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedTrainer(trainer)}
                  className="px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition text-sm font-medium"
                  title="View Members"
                >
                  Details
                </button>
                <button
                  onClick={() => handleEdit(trainer)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <Edit2 className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this trainer?')) {
                      onDeleteTrainer(trainer.id);
                    }
                  }}
                  className="p-2 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{trainer.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{trainer.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>{trainerMemberCount} Members</span>
              </div>
            </div>
          </div>
          );
        })}
      </div>

      {trainers.length === 0 && (
        <div className="text-center py-20">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No trainers yet</p>
          <p className="text-gray-400 text-sm mt-2">Add your first trainer to get started</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingTrainer ? 'Edit Trainer' : 'Add New Trainer'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="Enter trainer name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="trainer@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="+1 234 567 8900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password {!editingTrainer && '*'}
                </label>
                <input
                  type="password"
                  required={!editingTrainer}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder={editingTrainer ? 'Leave blank to keep current' : 'Enter password'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialization
                </label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="e.g., Weight Loss, Strength Training"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingTrainer(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
                >
                  {editingTrainer ? 'Update' : 'Add'} Trainer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Trainer Detail Modal */}
      {selectedTrainer && (
        <TrainerDetailModal
          trainer={selectedTrainer}
          users={users}
          onClose={() => setSelectedTrainer(null)}
          onViewUser={(user) => {
            setSelectedUser(user);
            setSelectedTrainer(null);
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

export default TrainerManagement;
