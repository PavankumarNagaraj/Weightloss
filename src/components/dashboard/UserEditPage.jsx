import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  X,
  User,
  TrendingDown,
  Image as ImageIcon,
  DollarSign,
  Calendar,
  FileText,
  Target,
  Phone,
  Mail,
  MapPin,
  Award,
  Activity,
  MessageCircle,
  Upload,
  Trash2,
  Eye,
  Edit3,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { Line } from 'react-chartjs-2';
import { getUserJourneyStage, getStageInfo } from '../../services/prioritiesService';
import PhotoProgress from './PhotoProgress';
import GoogleFitWidget from '../GoogleFitWidget';

const UserEditPage = ({ users, onUpdateUser, onDeleteUser, showToast }) => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');
  const [editMode, setEditMode] = useState(true); // Always in edit mode
  const [formData, setFormData] = useState(null);

  // Find user
  const user = users.find(u => u.id === userId);

  useEffect(() => {
    if (user) {
      setFormData({ ...user });
    }
  }, [user]);

  if (!user || !formData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">User Not Found</h2>
          <button
            onClick={() => navigate('/weightloss/dashboard/users')}
            className="text-primary hover:underline"
          >
            ← Back to Users
          </button>
        </div>
      </div>
    );
  }

  // Calculate stats
  const stage = getUserJourneyStage(user);
  const stageInfo = getStageInfo(stage);
  const weightLost = user.startWeight && user.currentWeight 
    ? (user.startWeight - user.currentWeight).toFixed(1)
    : 0;
  const progressPercent = user.startWeight && user.goalWeight
    ? ((user.startWeight - user.currentWeight) / (user.startWeight - user.goalWeight)) * 100
    : 0;
  const daysInProgram = user.startDate 
    ? differenceInDays(new Date(), parseISO(user.startDate))
    : 0;

  // Tabs configuration
  const tabs = [
    { id: 'details', name: 'User Details', icon: User },
    { id: 'progress', name: 'Progress & Goals', icon: TrendingDown },
    { id: 'photos', name: 'Photos', icon: ImageIcon },
    { id: 'workouts', name: 'Workouts', icon: Activity },
    { id: 'analysis', name: 'Analysis', icon: Target },
    { id: 'logs', name: 'Logs & History', icon: Calendar },
    { id: 'notes', name: 'Notes', icon: FileText }
  ];

  // Handle form changes
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle save
  const handleSave = () => {
    try {
      onUpdateUser(userId, formData);
      showToast('User updated successfully!', 'success');
      // Keep edit mode on - always editable
    } catch (error) {
      showToast('Failed to update user', 'error');
    }
  };

  // Handle reset - revert changes
  const handleCancel = () => {
    setFormData({ ...user });
    showToast('Changes reset', 'info');
  };


  // Add payment
  const handleAddPayment = (paymentData) => {
    const payments = user.payments || [];
    payments.push({
      id: `payment_${Date.now()}`,
      ...paymentData,
      date: new Date().toISOString()
    });

    const paidAmount = (user.paidAmount || 0) + parseFloat(paymentData.amount);
    const programFee = user.programFee || 0;
    
    let paymentStatus = 'pending';
    if (paidAmount >= programFee) {
      paymentStatus = 'paid';
    } else if (paidAmount > 0) {
      paymentStatus = 'partial';
    }

    onUpdateUser(userId, {
      payments,
      paidAmount,
      paymentStatus,
      lastPaymentDate: new Date().toISOString()
    });

    showToast('Payment added successfully!', 'success');
  };

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'details':
        return <UserDetailsTab 
          formData={formData} 
          handleChange={handleChange} 
          editMode={editMode}
          user={user}
          onAddPayment={handleAddPayment}
        />;
      case 'progress':
        return <ProgressTab formData={formData} handleChange={handleChange} editMode={editMode} user={user} />;
      case 'photos':
        return <PhotoProgress 
          users={[user]} 
          onUpdateUser={onUpdateUser}
          showToast={showToast}
        />;
      case 'workouts':
        return <WorkoutsTab 
          formData={formData} 
          handleChange={handleChange} 
          editMode={editMode}
          user={user}
          onUpdateUser={onUpdateUser}
          showToast={showToast}
        />;
      case 'analysis':
        return <AnalysisTab user={user} users={users} />;
      case 'logs':
        return <LogsTab user={user} />;
      case 'notes':
        return <NotesTab formData={formData} handleChange={handleChange} editMode={editMode} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/weightloss/dashboard/users')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {user.name}
                </h1>
                <p className="text-sm text-gray-600">Edit User Profile</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Reset
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* User Header Card */}
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="bg-gradient-to-r from-primary to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-primary text-3xl font-bold">
                {user.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-2">{user.name}</h2>
                <div className="flex items-center gap-4 text-blue-100">
                  <span className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {user.phone}
                  </span>
                </div>
                <div className="mt-2">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    {stageInfo.icon} {stageInfo.name}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-blue-100 text-sm">Weight Lost</p>
                <p className="text-3xl font-bold">{weightLost}kg</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm">Progress</p>
                <p className="text-3xl font-bold">{Math.round(progressPercent)}%</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm">Days In</p>
                <p className="text-3xl font-bold">{daysInProgram}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Tab Headers */}
          <div className="border-b border-gray-200 overflow-x-auto">
            <div className="flex">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-4 flex items-center gap-2 whitespace-nowrap transition-all border-b-2 ${
                      isActive
                        ? 'border-primary text-primary bg-blue-50'
                        : 'border-transparent text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-semibold">{tab.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

// User Details Tab Component (Merged Basic Info + Payments)
const UserDetailsTab = ({ formData, handleChange, editMode, user, onAddPayment }) => {
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    method: 'cash',
    notes: ''
  });

  const handleSubmit = () => {
    if (!paymentData.amount) return;
    onAddPayment(paymentData);
    setPaymentData({ amount: '', method: 'cash', notes: '' });
    setShowAddPayment(false);
  };

  return (
    <div className="space-y-8">
      {/* Basic Information Section */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              disabled={!editMode}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              disabled={!editMode}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
              disabled={!editMode}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Program Type</label>
            <select
              value={formData.programType || '60-day'}
              onChange={(e) => handleChange('programType', e.target.value)}
              disabled={!editMode}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
            >
              <option value="60-day">60 Day Program</option>
              <option value="90-day">90 Day Program</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={formData.startDate ? formData.startDate.split('T')[0] : ''}
              onChange={(e) => handleChange('startDate', e.target.value)}
              disabled={!editMode}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Trainer</label>
            <input
              type="text"
              value={formData.trainer || ''}
              onChange={(e) => handleChange('trainer', e.target.value)}
              disabled={!editMode}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
            />
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200"></div>

      {/* Payment Information Section */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Payment Information
        </h3>
        
        {/* Payment Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-blue-50 p-6 rounded-xl">
            <p className="text-sm text-gray-600 mb-1">Program Fee</p>
            <p className="text-3xl font-bold text-gray-800">₹{user.programFee || 0}</p>
          </div>
          <div className="bg-green-50 p-6 rounded-xl">
            <p className="text-sm text-gray-600 mb-1">Paid Amount</p>
            <p className="text-3xl font-bold text-gray-800">₹{user.paidAmount || 0}</p>
          </div>
          <div className="bg-orange-50 p-6 rounded-xl">
            <p className="text-sm text-gray-600 mb-1">Pending</p>
            <p className="text-3xl font-bold text-gray-800">
              ₹{(user.programFee || 0) - (user.paidAmount || 0)}
            </p>
          </div>
        </div>

        {/* Add Payment Section */}
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-semibold text-gray-800">Payment History</h4>
          <button
            onClick={() => setShowAddPayment(!showAddPayment)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
          >
            <DollarSign className="w-4 h-4" />
            Add Payment
          </button>
        </div>

        {showAddPayment && (
          <div className="bg-gray-50 p-6 rounded-xl space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="number"
                placeholder="Amount"
                value={paymentData.amount}
                onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
              <select
                value={paymentData.method}
                onChange={(e) => setPaymentData({ ...paymentData, method: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="bank">Bank Transfer</option>
              </select>
              <input
                type="text"
                placeholder="Notes (optional)"
                value={paymentData.notes}
                onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600"
              >
                Add Payment
              </button>
              <button
                onClick={() => setShowAddPayment(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Payment History Table */}
        {user.payments && user.payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Method</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {user.payments.map(payment => (
                  <tr key={payment.id}>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {format(parseISO(payment.date), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-600">
                      ₹{payment.amount}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 capitalize">
                      {payment.method}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {payment.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg">No payments recorded yet</p>
        )}
      </div>
    </div>
  );
};

// Progress Tab Component
const ProgressTab = ({ formData, handleChange, editMode, user }) => {
  const weightData = user.logs?.map(log => ({
    date: format(parseISO(log.date), 'MMM dd'),
    weight: log.weight
  })) || [];

  const chartData = {
    labels: weightData.map(d => d.date),
    datasets: [{
      label: 'Weight (kg)',
      data: weightData.map(d => d.weight),
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  return (
    <div className="space-y-6">
      {/* Google Fit Widget */}
      <GoogleFitWidget />
      
      {/* Editable Weight Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-6 rounded-xl">
          <label className="block text-sm text-gray-600 mb-2">Start Weight</label>
          <input
            type="number"
            step="0.1"
            value={formData.startWeight || ''}
            onChange={(e) => handleChange('startWeight', parseFloat(e.target.value))}
            disabled={!editMode}
            className="w-full text-3xl font-bold text-gray-800 bg-transparent border-b-2 border-blue-300 focus:border-primary focus:outline-none disabled:border-transparent"
            placeholder="0"
          />
          <span className="text-2xl font-bold text-gray-600 ml-1">kg</span>
        </div>
        <div className="bg-green-50 p-6 rounded-xl">
          <label className="block text-sm text-gray-600 mb-2">Current Weight</label>
          <input
            type="number"
            step="0.1"
            value={formData.currentWeight || ''}
            onChange={(e) => handleChange('currentWeight', parseFloat(e.target.value))}
            disabled={!editMode}
            className="w-full text-3xl font-bold text-gray-800 bg-transparent border-b-2 border-green-300 focus:border-primary focus:outline-none disabled:border-transparent"
            placeholder="0"
          />
          <span className="text-2xl font-bold text-gray-600 ml-1">kg</span>
        </div>
        <div className="bg-purple-50 p-6 rounded-xl">
          <label className="block text-sm text-gray-600 mb-2">Goal Weight</label>
          <input
            type="number"
            step="0.1"
            value={formData.goalWeight || ''}
            onChange={(e) => handleChange('goalWeight', parseFloat(e.target.value))}
            disabled={!editMode}
            className="w-full text-3xl font-bold text-gray-800 bg-transparent border-b-2 border-purple-300 focus:border-primary focus:outline-none disabled:border-transparent"
            placeholder="0"
          />
          <span className="text-2xl font-bold text-gray-600 ml-1">kg</span>
        </div>
      </div>

      {/* Additional Editable Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">BMI</label>
          <input
            type="number"
            step="0.1"
            value={formData.bmi || ''}
            onChange={(e) => handleChange('bmi', parseFloat(e.target.value))}
            disabled={!editMode}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
            placeholder="Enter BMI"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Height (cm)</label>
          <input
            type="number"
            value={formData.height || ''}
            onChange={(e) => handleChange('height', parseInt(e.target.value))}
            disabled={!editMode}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
            placeholder="Enter height"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Meal Plan</label>
          <select
            value={formData.mealPlan || 'Veg'}
            onChange={(e) => handleChange('mealPlan', e.target.value)}
            disabled={!editMode}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
          >
            <option value="Veg">Veg</option>
            <option value="Non-Veg">Non-Veg</option>
            <option value="Vegan">Vegan</option>
            <option value="Keto">Keto</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Progress Status</label>
          <select
            value={formData.progressStatus || 'on-track'}
            onChange={(e) => handleChange('progressStatus', e.target.value)}
            disabled={!editMode}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
          >
            <option value="on-track">On Track</option>
            <option value="ahead">Ahead</option>
            <option value="behind">Behind</option>
            <option value="at-risk">At Risk</option>
          </select>
        </div>
      </div>

      {weightData.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Weight Progress Chart</h3>
          <div className="h-64">
            <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      )}
    </div>
  );
};

// Logs Tab Component
const LogsTab = ({ user }) => {
  const logs = user.logs || [];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-gray-800">Weight Logs</h3>
      
      {logs.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No logs recorded yet</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Weight</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">BMI</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Attended</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs.sort((a, b) => new Date(b.date) - new Date(a.date)).map((log, index) => (
                <tr key={index}>
                  <td className="px-4 py-3 text-sm text-gray-800">
                    {format(parseISO(log.date), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-800">
                    {log.weight}kg
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {log.bmi || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {log.attended ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <X className="w-5 h-5 text-gray-400" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Notes Tab Component
const NotesTab = ({ formData, handleChange, editMode }) => (
  <div className="space-y-6">
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">Trainer Notes</label>
      <textarea
        value={formData.trainerNotes || ''}
        onChange={(e) => handleChange('trainerNotes', e.target.value)}
        disabled={!editMode}
        rows={6}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
        placeholder="Add notes about this user's progress, challenges, or goals..."
      />
    </div>

    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">User Goals</label>
      <textarea
        value={formData.goals || ''}
        onChange={(e) => handleChange('goals', e.target.value)}
        disabled={!editMode}
        rows={4}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
        placeholder="User's specific goals and targets..."
      />
    </div>
  </div>
);

// Workouts Tab Component
const WorkoutsTab = ({ formData, handleChange, editMode, user, onUpdateUser, showToast }) => {
  const [assignedWorkouts, setAssignedWorkouts] = useState(user.assignedWorkouts || []);
  const [workoutLibrary, setWorkoutLibrary] = useState([]);
  const [selectedDay, setSelectedDay] = useState('');
  const [customWorkout, setCustomWorkout] = useState({
    name: '',
    type: 'Cardio',
    duration: '',
    sets: '',
    reps: '',
    notes: ''
  });
  const [showCustomForm, setShowCustomForm] = useState(false);

  const workoutTypes = ['Cardio', 'Strength', 'HIIT', 'Yoga', 'Flexibility', 'Sports'];

  // Load workout library
  useEffect(() => {
    const loadWorkouts = async () => {
      try {
        const workoutsData = await import('../../data/workouts.json');
        setWorkoutLibrary(workoutsData.days || []);
      } catch (error) {
        console.error('Error loading workouts:', error);
      }
    };
    loadWorkouts();
  }, []);

  const handleAssignFromLibrary = () => {
    if (!selectedDay) {
      showToast('Please select a workout day', 'error');
      return;
    }

    const dayWorkout = workoutLibrary.find(w => w.day === parseInt(selectedDay));
    if (!dayWorkout) {
      showToast('Workout not found', 'error');
      return;
    }

    if (dayWorkout.rest) {
      showToast('This is a rest day', 'info');
      return;
    }

    const workout = {
      id: `workout_${Date.now()}`,
      name: `Day ${dayWorkout.day} - ${dayWorkout.intensity}`,
      type: dayWorkout.type,
      intensity: dayWorkout.intensity,
      warmup: dayWorkout.warmup,
      circuit_block_1: dayWorkout.circuit_block_1,
      circuit_block_2: dayWorkout.circuit_block_2,
      stretch: dayWorkout.stretch,
      assignedDate: new Date().toISOString(),
      status: 'pending',
      fromLibrary: true
    };

    const updatedWorkouts = [...assignedWorkouts, workout];
    setAssignedWorkouts(updatedWorkouts);
    onUpdateUser(user.id, { assignedWorkouts: updatedWorkouts });
    setSelectedDay('');
    showToast('Workout assigned successfully!', 'success');
  };

  const handleAddCustomWorkout = () => {
    if (!customWorkout.name) {
      showToast('Please enter workout name', 'error');
      return;
    }

    const workout = {
      id: `workout_${Date.now()}`,
      ...customWorkout,
      assignedDate: new Date().toISOString(),
      status: 'pending',
      fromLibrary: false
    };

    const updatedWorkouts = [...assignedWorkouts, workout];
    setAssignedWorkouts(updatedWorkouts);
    onUpdateUser(user.id, { assignedWorkouts: updatedWorkouts });
    
    setCustomWorkout({
      name: '',
      type: 'Cardio',
      duration: '',
      sets: '',
      reps: '',
      notes: ''
    });
    setShowCustomForm(false);
    showToast('Custom workout assigned successfully!', 'success');
  };

  const handleRemoveWorkout = (workoutId) => {
    const updatedWorkouts = assignedWorkouts.filter(w => w.id !== workoutId);
    setAssignedWorkouts(updatedWorkouts);
    onUpdateUser(user.id, { assignedWorkouts: updatedWorkouts });
    showToast('Workout removed', 'success');
  };

  const handleToggleStatus = (workoutId) => {
    const updatedWorkouts = assignedWorkouts.map(w => 
      w.id === workoutId 
        ? { ...w, status: w.status === 'completed' ? 'pending' : 'completed' }
        : w
    );
    setAssignedWorkouts(updatedWorkouts);
    onUpdateUser(user.id, { assignedWorkouts: updatedWorkouts });
  };

  return (
    <div className="space-y-6">
      {/* Assign From Library */}
      {editMode && (
        <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 border-2 border-green-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📚 Assign from 30-Day Program</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Select Workout Day</label>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">-- Select a day --</option>
                {workoutLibrary.map(day => (
                  <option key={day.day} value={day.day}>
                    Day {day.day} - {day.rest ? 'Rest Day' : `${day.intensity} (${day.type})`}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleAssignFromLibrary}
                className="w-full px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium"
              >
                Assign Workout
              </button>
            </div>
          </div>

          {/* Preview selected workout */}
          {selectedDay && (() => {
            const dayWorkout = workoutLibrary.find(w => w.day === parseInt(selectedDay));
            if (!dayWorkout || dayWorkout.rest) return null;
            return (
              <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                <h4 className="font-bold text-gray-800 mb-2">Preview:</h4>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Intensity:</strong> {dayWorkout.intensity} | <strong>Type:</strong> {dayWorkout.type}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="font-semibold text-gray-700">Warmup:</p>
                    <ul className="list-disc list-inside text-gray-600">
                      {dayWorkout.warmup?.slice(0, 3).map((ex, i) => (
                        <li key={i}>{ex}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700">Circuit 1:</p>
                    <ul className="list-disc list-inside text-gray-600">
                      {dayWorkout.circuit_block_1?.slice(0, 3).map((ex, i) => (
                        <li key={i}>{ex}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Custom Workout */}
      {editMode && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">✏️ Create Custom Workout</h3>
            <button
              onClick={() => setShowCustomForm(!showCustomForm)}
              className="px-4 py-2 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
            >
              {showCustomForm ? 'Hide Form' : 'Show Form'}
            </button>
          </div>

          {showCustomForm && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Workout Name</label>
                  <input
                    type="text"
                    value={customWorkout.name}
                    onChange={(e) => setCustomWorkout({ ...customWorkout, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., Morning Run, Push-ups"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                  <select
                    value={customWorkout.type}
                    onChange={(e) => setCustomWorkout({ ...customWorkout, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {workoutTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    value={customWorkout.duration}
                    onChange={(e) => setCustomWorkout({ ...customWorkout, duration: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Sets × Reps (optional)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={customWorkout.sets}
                      onChange={(e) => setCustomWorkout({ ...customWorkout, sets: e.target.value })}
                      className="w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Sets"
                    />
                    <input
                      type="number"
                      value={customWorkout.reps}
                      onChange={(e) => setCustomWorkout({ ...customWorkout, reps: e.target.value })}
                      className="w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Reps"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={customWorkout.notes}
                    onChange={(e) => setCustomWorkout({ ...customWorkout, notes: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Additional instructions..."
                  />
                </div>
              </div>

              <button
                onClick={handleAddCustomWorkout}
                className="mt-4 px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition font-medium"
              >
                Assign Custom Workout
              </button>
            </>
          )}
        </div>
      )}

      {/* Assigned Workouts List */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4">Assigned Workouts ({assignedWorkouts.length})</h3>
        
        {assignedWorkouts.length === 0 ? (
          <p className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg">
            No workouts assigned yet
          </p>
        ) : (
          <div className="space-y-4">
            {assignedWorkouts.map(workout => (
              <div
                key={workout.id}
                className={`p-4 rounded-lg border-2 ${
                  workout.status === 'completed'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-bold text-gray-800">{workout.name}</h4>
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                        {workout.type}
                      </span>
                      {workout.fromLibrary && (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                          📚 From Library
                        </span>
                      )}
                      {workout.status === 'completed' && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    
                    {/* Library workout details */}
                    {workout.fromLibrary ? (
                      <div className="space-y-2 mt-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          {workout.warmup && (
                            <div className="bg-gray-50 p-3 rounded">
                              <p className="font-semibold text-gray-700 mb-1">Warmup:</p>
                              <ul className="list-disc list-inside text-gray-600 text-xs">
                                {workout.warmup.slice(0, 3).map((ex, i) => (
                                  <li key={i}>{ex}</li>
                                ))}
                                {workout.warmup.length > 3 && <li>+ {workout.warmup.length - 3} more...</li>}
                              </ul>
                            </div>
                          )}
                          {workout.circuit_block_1 && (
                            <div className="bg-gray-50 p-3 rounded">
                              <p className="font-semibold text-gray-700 mb-1">Circuit 1:</p>
                              <ul className="list-disc list-inside text-gray-600 text-xs">
                                {workout.circuit_block_1.slice(0, 3).map((ex, i) => (
                                  <li key={i}>{ex}</li>
                                ))}
                                {workout.circuit_block_1.length > 3 && <li>+ {workout.circuit_block_1.length - 3} more...</li>}
                              </ul>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          📅 Assigned: {format(parseISO(workout.assignedDate), 'MMM dd, yyyy')} | 
                          Intensity: {workout.intensity}
                        </p>
                      </div>
                    ) : (
                      /* Custom workout details */
                      <>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
                          {workout.duration && (
                            <span>⏱️ {workout.duration} minutes</span>
                          )}
                          {workout.sets && workout.reps && (
                            <span>💪 {workout.sets} sets × {workout.reps} reps</span>
                          )}
                          <span>📅 Assigned: {format(parseISO(workout.assignedDate), 'MMM dd, yyyy')}</span>
                        </div>
                        
                        {workout.notes && (
                          <p className="text-sm text-gray-700 italic mt-2">{workout.notes}</p>
                        )}
                      </>
                    )}
                  </div>

                  {editMode && (
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleToggleStatus(workout.id)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                          workout.status === 'completed'
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                      >
                        {workout.status === 'completed' ? 'Mark Pending' : 'Mark Complete'}
                      </button>
                      <button
                        onClick={() => handleRemoveWorkout(workout.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Analysis Tab Component
const AnalysisTab = ({ user, users }) => {
  // Calculate user's analytics
  const userWeightLoss = user.startWeight && user.currentWeight 
    ? user.startWeight - user.currentWeight 
    : 0;
  
  const daysSinceStart = user.startDate 
    ? differenceInDays(new Date(), parseISO(user.startDate))
    : 0;
  
  const dailyWeightLoss = daysSinceStart > 0 ? userWeightLoss / daysSinceStart : 0;

  // Compare with other users
  const userProgress = users.map(u => {
    const weightLoss = u.startWeight && u.currentWeight ? u.startWeight - u.currentWeight : 0;
    const days = u.startDate ? differenceInDays(new Date(), parseISO(u.startDate)) : 0;
    const dailyLoss = days > 0 ? weightLoss / days : 0;
    return {
      user: u,
      weightLoss,
      dailyLoss,
      days
    };
  }).filter(p => p.weightLoss > 0).sort((a, b) => b.dailyLoss - a.dailyLoss);

  const userRank = userProgress.findIndex(p => p.user.id === user.id) + 1;
  const totalUsers = userProgress.length;
  const percentile = totalUsers > 0 ? ((totalUsers - userRank + 1) / totalUsers * 100).toFixed(0) : 0;

  // Same meal plan users
  const sameMealPlanUsers = users.filter(u => 
    u.mealPlan === user.mealPlan && u.id !== user.id && u.startWeight && u.currentWeight
  );
  
  const avgMealPlanLoss = sameMealPlanUsers.length > 0
    ? sameMealPlanUsers.reduce((sum, u) => sum + (u.startWeight - u.currentWeight), 0) / sameMealPlanUsers.length
    : 0;

  // Recommendations
  const bestPerformers = userProgress.slice(0, 3);
  const recommendations = [];

  if (userRank > 10 && bestPerformers.length > 0) {
    const topUser = bestPerformers[0].user;
    if (topUser.mealPlan !== user.mealPlan) {
      recommendations.push({
        type: 'meal',
        message: `Consider switching to ${topUser.mealPlan} diet - top performers are using it`,
        icon: '🍎'
      });
    }
  }

  if (dailyWeightLoss < 0.1 && daysSinceStart > 7) {
    recommendations.push({
      type: 'progress',
      message: 'Weight loss rate is below average. Consider consulting with your trainer.',
      icon: '⚠️'
    });
  }

  if (userWeightLoss > 0 && daysSinceStart > 30) {
    recommendations.push({
      type: 'success',
      message: 'Great progress! Keep up the consistency.',
      icon: '🎉'
    });
  }

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="bg-gradient-to-r from-primary to-purple-600 rounded-xl shadow-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-4">Performance Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <p className="text-sm text-white/80 mb-1">Weight Lost</p>
            <p className="text-3xl font-bold">{userWeightLoss.toFixed(1)}kg</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <p className="text-sm text-white/80 mb-1">Daily Rate</p>
            <p className="text-3xl font-bold">{(dailyWeightLoss * 1000).toFixed(0)}g</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <p className="text-sm text-white/80 mb-1">Your Rank</p>
            <p className="text-3xl font-bold">#{userRank}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <p className="text-sm text-white/80 mb-1">Percentile</p>
            <p className="text-3xl font-bold">Top {percentile}%</p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Recommendations</h3>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${
                  rec.type === 'success' ? 'bg-green-50 border-green-200' :
                  rec.type === 'progress' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-blue-50 border-blue-200'
                }`}
              >
                <p className="text-gray-800">
                  <span className="text-2xl mr-2">{rec.icon}</span>
                  {rec.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Meal Plan Comparison */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Meal Plan Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-2">Your Meal Plan</p>
            <p className="text-2xl font-bold text-primary">{user.mealPlan || 'Not set'}</p>
            <p className="text-sm text-gray-600 mt-2">Your Progress: {userWeightLoss.toFixed(1)}kg</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Average for {user.mealPlan}</p>
            <p className="text-2xl font-bold text-green-600">{avgMealPlanLoss.toFixed(1)}kg</p>
            <p className="text-sm text-gray-600 mt-2">Based on {sameMealPlanUsers.length} users</p>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Top Performers</h3>
        <div className="space-y-3">
          {bestPerformers.map((performer, index) => (
            <div
              key={performer.user.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                  index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-600'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    {performer.user.id === user.id ? 'You' : performer.user.name}
                  </p>
                  <p className="text-sm text-gray-600">{performer.user.mealPlan}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-green-600">{performer.weightLoss.toFixed(1)}kg</p>
                <p className="text-xs text-gray-600">{(performer.dailyLoss * 1000).toFixed(0)}g/day</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Timeline */}
      {user.logs && user.logs.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Progress Timeline</h3>
          <div className="space-y-2">
            {user.logs.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10).map((log, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">{format(parseISO(log.date), 'MMM dd, yyyy')}</span>
                <span className="text-lg font-bold text-gray-800">{log.weight}kg</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserEditPage;
