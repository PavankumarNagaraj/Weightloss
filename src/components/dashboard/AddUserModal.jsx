import React, { useState } from 'react';
import { X } from 'lucide-react';

const AddUserModal = ({ onClose, onSubmit, trainers = [], batches = [], editUser = null }) => {
  const [formData, setFormData] = useState(editUser ? {
    name: editUser.name || '',
    gender: editUser.gender || 'Male',
    age: editUser.age || '',
    height: editUser.height || '',
    goalWeight: editUser.goalWeight || '',
    programType: editUser.programType || '60-day',
    mealPlan: editUser.mealPlan || 'Veg',
    currentWeight: editUser.currentWeight || '',
    trainer: editUser.trainer || (trainers.length > 0 ? trainers[0].name : 'Unassigned'),
    batchId: editUser.batchId || (batches.length > 0 ? batches[0].id : ''),
  } : {
    name: '',
    gender: 'Male',
    age: '',
    height: '',
    goalWeight: '',
    programType: '60-day',
    mealPlan: 'Veg',
    currentWeight: '',
    trainer: trainers.length > 0 ? trainers[0].name : 'Unassigned',
    batchId: batches.length > 0 ? batches[0].id : '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate
    if (!formData.name || !formData.goalWeight || !formData.currentWeight || !formData.height) {
      alert('Please fill in all required fields');
      return;
    }

    // Calculate BMI
    const heightInMeters = parseFloat(formData.height) / 100;
    const currentWeight = parseFloat(formData.currentWeight);
    const bmi = (currentWeight / (heightInMeters * heightInMeters)).toFixed(1);

    // Add initial log with current weight
    const userData = {
      ...formData,
      age: parseInt(formData.age) || 0,
      height: parseFloat(formData.height),
      goalWeight: parseFloat(formData.goalWeight),
      bmi: parseFloat(bmi),
      attendance: [], // Track class attendance
      logs: [
        {
          date: new Date().toISOString(),
          weight: currentWeight,
          bmi: parseFloat(bmi),
          meals: {
            breakfast: '',
            lunch: '',
            dinner: '',
          },
          foodIntake: [], // Detailed food items with calories
          attended: true, // Attended class today
        },
      ],
    };

    delete userData.currentWeight;
    
    // If editing, pass the user ID
    if (editUser) {
      onSubmit(editUser.id, userData);
    } else {
      onSubmit(userData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">{editUser ? 'Edit User' : 'Add New User'}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Height (cm) *
              </label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="170"
                min="100"
                max="250"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                min="1"
                max="120"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Weight (kg) *
              </label>
              <input
                type="number"
                name="currentWeight"
                value={formData.currentWeight}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                step="0.1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Goal Weight (kg) *
              </label>
              <input
                type="number"
                name="goalWeight"
                value={formData.goalWeight}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                step="0.1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Program Type
              </label>
              <select
                name="programType"
                value={formData.programType}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              >
                <option value="60-day">60 Days</option>
                <option value="90-day">90 Days</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meal Plan
              </label>
              <select
                name="mealPlan"
                value={formData.mealPlan}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              >
                <option value="Veg">Vegetarian</option>
                <option value="Non-Veg">Non-Vegetarian</option>
                <option value="Detox">Detox</option>
                <option value="Custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned Trainer
              </label>
              <select
                name="trainer"
                value={formData.trainer}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              >
                <option value="Unassigned">Unassigned</option>
                {trainers.map(trainer => (
                  <option key={trainer.id} value={trainer.name}>{trainer.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Batch/Edition
              </label>
              <select
                name="batchId"
                value={formData.batchId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              >
                <option value="">No Batch</option>
                {batches.map(batch => (
                  <option key={batch.id} value={batch.id}>{batch.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium"
            >
              {editUser ? 'Update User' : 'Add User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
