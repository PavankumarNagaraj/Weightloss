import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Calendar, DollarSign, Users, Clock, Pause, Play, XCircle, CheckCircle } from 'lucide-react';
import { getCustomers, getSubscriptions, addSubscription, updateSubscription, deleteSubscription } from '../../services/cafeService';

const CafeSubscriptionManagement = ({ showToast }) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [subscriptionToDelete, setSubscriptionToDelete] = useState(null);
  const [formData, setFormData] = useState({
    customerId: '',
    planType: 'monthly',
    mealTypes: [],
    deliveryDays: [],
    startDate: '',
    endDate: '',
    monthlyAmount: '',
    deliveryTime: '8:00 AM',
    specialInstructions: '',
    status: 'active',
  });

  const mealTypeOptions = ['Breakfast', 'Lunch', 'Dinner'];
  const dayOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [subsData, custData] = await Promise.all([
      getSubscriptions(),
      getCustomers()
    ]);
    setSubscriptions(subsData);
    setCustomers(custData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.mealTypes.length === 0) {
      showToast('⚠️ Please select at least one meal type');
      return;
    }

    if (formData.deliveryDays.length === 0) {
      showToast('⚠️ Please select at least one delivery day');
      return;
    }

    try {
      if (editingSubscription) {
        await updateSubscription(editingSubscription.id, formData);
        showToast('✅ Subscription updated successfully');
      } else {
        await addSubscription(formData);
        showToast('✅ Subscription created successfully');
      }

      resetForm();
      await loadData();
    } catch (error) {
      showToast('❌ Error saving subscription');
      console.error(error);
    }
  };

  const handleEdit = (subscription) => {
    setEditingSubscription(subscription);
    setFormData({
      customerId: subscription.customer_id,
      planType: subscription.plan_type,
      mealTypes: subscription.meal_types || [],
      deliveryDays: subscription.delivery_days || [],
      startDate: subscription.start_date,
      endDate: subscription.end_date,
      monthlyAmount: subscription.monthly_amount,
      deliveryTime: subscription.delivery_time || '8:00 AM',
      specialInstructions: subscription.special_instructions || '',
      status: subscription.status,
    });
    setShowModal(true);
  };

  const handleDeleteClick = (subscription) => {
    setSubscriptionToDelete(subscription);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (subscriptionToDelete) {
      try {
        await deleteSubscription(subscriptionToDelete.id);
        showToast('🗑️ Subscription deleted successfully');
        setShowDeleteModal(false);
        setSubscriptionToDelete(null);
        await loadData();
      } catch (error) {
        showToast('❌ Error deleting subscription');
        console.error(error);
      }
    }
  };

  const handleStatusChange = async (subscription, newStatus) => {
    try {
      await updateSubscription(subscription.id, { status: newStatus });
      showToast(`✅ Subscription ${newStatus}`);
      await loadData();
    } catch (error) {
      showToast('❌ Error updating status');
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({
      customerId: '',
      planType: 'monthly',
      mealTypes: [],
      deliveryDays: [],
      startDate: '',
      endDate: '',
      monthlyAmount: '',
      deliveryTime: '8:00 AM',
      specialInstructions: '',
      status: 'active',
    });
    setEditingSubscription(null);
    setShowModal(false);
  };

  const toggleMealType = (meal) => {
    setFormData(prev => ({
      ...prev,
      mealTypes: prev.mealTypes.includes(meal)
        ? prev.mealTypes.filter(m => m !== meal)
        : [...prev.mealTypes, meal]
    }));
  };

  const toggleDeliveryDay = (day) => {
    setFormData(prev => ({
      ...prev,
      deliveryDays: prev.deliveryDays.includes(day)
        ? prev.deliveryDays.filter(d => d !== day)
        : [...prev.deliveryDays, day]
    }));
  };

  const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
  const totalMRR = activeSubscriptions.reduce((sum, s) => sum + parseFloat(s.monthly_amount || 0), 0);
  const expiringThisMonth = subscriptions.filter(s => {
    const endDate = new Date(s.end_date);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  });

  return (
    <div className="space-y-4 md:space-y-6 p-2 md:p-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Subscription Management
          </h2>
          <p className="text-sm md:text-base text-gray-600 font-semibold mt-1">
            Manage customer subscriptions and meal plans
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition shadow-lg text-sm md:text-base w-full md:w-auto"
        >
          <Plus className="w-4 h-4 md:w-5 md:h-5" />
          <span className="hidden sm:inline">New Subscription</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 md:p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-xs text-gray-600 font-semibold">Active</p>
              <p className="text-2xl md:text-3xl font-black text-green-600">{activeSubscriptions.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-4 md:p-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-xs text-gray-600 font-semibold">Monthly Revenue</p>
              <p className="text-2xl md:text-3xl font-black text-blue-600">₹{totalMRR.toFixed(0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl p-4 md:p-6">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-8 h-8 text-orange-600" />
            <div>
              <p className="text-xs text-gray-600 font-semibold">Expiring Soon</p>
              <p className="text-2xl md:text-3xl font-black text-orange-600">{expiringThisMonth.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4 md:p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-xs text-gray-600 font-semibold">Total</p>
              <p className="text-2xl md:text-3xl font-black text-purple-600">{subscriptions.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Plan</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Meals</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Days</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Period</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-32">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {subscriptions.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                  No subscriptions yet. Create your first subscription.
                </td>
              </tr>
            ) : (
              subscriptions.map((subscription) => (
                <tr key={subscription.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="font-semibold text-gray-900">{subscription.customer?.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500">{subscription.customer?.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-semibold">
                      {subscription.plan_type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(subscription.meal_types || []).map(meal => (
                        <span key={meal} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                          {meal}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">{(subscription.delivery_days || []).length} days/week</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="text-gray-900">{new Date(subscription.start_date).toLocaleDateString()}</p>
                      <p className="text-gray-500">to {new Date(subscription.end_date).toLocaleDateString()}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">₹{subscription.monthly_amount}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      subscription.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : subscription.status === 'paused'
                        ? 'bg-yellow-100 text-yellow-700'
                        : subscription.status === 'expired'
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {subscription.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {subscription.status === 'active' && (
                        <button
                          onClick={() => handleStatusChange(subscription, 'paused')}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
                          title="Pause subscription"
                        >
                          <Pause className="w-4 h-4" />
                        </button>
                      )}
                      {subscription.status === 'paused' && (
                        <button
                          onClick={() => handleStatusChange(subscription, 'active')}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                          title="Resume subscription"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(subscription)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Edit subscription"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(subscription)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete subscription"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Subscription Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-3xl my-8">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">
                  {editingSubscription ? 'Edit Subscription' : 'New Subscription'}
                </h3>
                <button onClick={resetForm}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer *
                  </label>
                  <select
                    required
                    value={formData.customerId}
                    onChange={(e) => setFormData({...formData, customerId: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select a customer</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} - {customer.phone}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Plan Type *
                    </label>
                    <select
                      required
                      value={formData.planType}
                      onChange={(e) => setFormData({...formData, planType: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monthly Amount (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.monthlyAmount}
                      onChange={(e) => setFormData({...formData, monthlyAmount: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="3000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meal Types *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {mealTypeOptions.map(meal => (
                      <button
                        key={meal}
                        type="button"
                        onClick={() => toggleMealType(meal)}
                        className={`px-4 py-2 rounded-lg font-semibold transition ${
                          formData.mealTypes.includes(meal)
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {meal}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Days *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {dayOptions.map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDeliveryDay(day)}
                        className={`px-3 py-2 rounded-lg font-semibold transition ${
                          formData.deliveryDays.includes(day)
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Delivery Time
                  </label>
                  <input
                    type="text"
                    value={formData.deliveryTime}
                    onChange={(e) => setFormData({...formData, deliveryTime: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="8:00 AM"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Instructions
                  </label>
                  <textarea
                    value={formData.specialInstructions}
                    onChange={(e) => setFormData({...formData, specialInstructions: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Any dietary restrictions or preferences"
                    rows="3"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition shadow-lg"
                  >
                    {editingSubscription ? 'Update Subscription' : 'Create Subscription'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && subscriptionToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-red-600">Delete Subscription</h3>
                <button onClick={() => setShowDeleteModal(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 mb-2">Are you sure you want to delete this subscription?</p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                  <p className="text-sm font-semibold text-gray-900">{subscriptionToDelete.customer?.name}</p>
                  <p className="text-sm text-gray-600">{subscriptionToDelete.plan_type} - ₹{subscriptionToDelete.monthly_amount}</p>
                </div>
                <p className="text-sm text-red-600 mt-3 font-semibold">⚠️ This action cannot be undone.</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition"
                >
                  Delete Subscription
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CafeSubscriptionManagement;
