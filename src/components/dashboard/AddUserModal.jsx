import React, { useState } from 'react';
import { X } from 'lucide-react';

const AddUserModal = ({ onClose, onSubmit, trainers = [], batches = [], editUser = null }) => {
  const [formData, setFormData] = useState(editUser ? {
    name: editUser.name || '',
    email: editUser.email || '',
    phone: editUser.phone || '',
    gender: editUser.gender || 'Male',
    age: editUser.age || '',
    height: editUser.height || '',
    goalWeight: editUser.goalWeight || '',
    programType: editUser.programType || '60-day',
    mealPlan: editUser.mealPlan || 'Veg',
    currentWeight: editUser.currentWeight || '',
    trainer: editUser.trainer || (trainers.length > 0 ? trainers[0].name : 'Unassigned'),
    batchId: editUser.batchId || (batches.length > 0 ? batches[0].id : ''),
    enrollInCafeSubscription: editUser.enrollInCafeSubscription || false,
  } : {
    name: '',
    email: '',
    phone: '',
    gender: 'Male',
    age: '',
    height: '',
    goalWeight: '',
    programType: '60-day',
    mealPlan: 'Veg',
    currentWeight: '',
    trainer: trainers.length > 0 ? trainers[0].name : 'Unassigned',
    batchId: batches.length > 0 ? batches[0].id : '',
    enrollInCafeSubscription: false,
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
    if (!formData.name || !formData.email || !formData.goalWeight || !formData.currentWeight || !formData.height) {
      alert('Please fill in all required fields (Name, Email, Height, Current Weight, Goal Weight)');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address');
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
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="user@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="9876543210"
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
                <option value="unlimited">Unlimited</option>
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
                <option value="Weightloss Mix">Weightloss Mix</option>
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

          {/* Cafe Subscription Enrollment */}
          <div className="border-t pt-6">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="enrollInCafeSubscription"
                  checked={formData.enrollInCafeSubscription}
                  onChange={(e) => setFormData({ ...formData, enrollInCafeSubscription: e.target.checked })}
                  className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-2 focus:ring-orange-500 mt-0.5"
                />
                <div className="flex-1">
                  <label htmlFor="enrollInCafeSubscription" className="block text-sm font-semibold text-gray-900 cursor-pointer">
                    🍽️ Enroll in Cafe Subscription
                  </label>
                  <p className="text-xs text-gray-600 mt-1">
                    Enable this to assign meals from the cafe menu and track calorie intake for this subscriber. 
                    This will create a linked cafe customer account for food management.
                  </p>
                  {formData.enrollInCafeSubscription && (
                    <div className="mt-3 p-3 bg-white rounded border border-orange-200">
                      <p className="text-xs font-semibold text-orange-700 mb-2">✅ Cafe Features Enabled:</p>
                      <ul className="text-xs text-gray-700 space-y-1">
                        <li>• Assign daily meals from cafe menu</li>
                        <li>• Track calorie consumption automatically</li>
                        <li>• Monitor macro nutrients (protein, carbs, fat)</li>
                        <li>• View meal history and progress</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
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
