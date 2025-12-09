import React, { useState } from 'react';
import { X, User, Phone, Mail, MapPin, Calendar, CreditCard, Check, Lock, Copy, LogIn } from 'lucide-react';
import { createUserWithSubscription } from '../services/dataService';
import { createSubscription } from '../services/subscriptionService';
import { initializeMealDeliveries } from '../services/mealScheduleService';
import { createUserLogin } from '../services/userAuthService';
import { calculatePricing } from '../utils/pricingUtils';

const SubscriptionModal = ({ onClose, planType, mealsPerDay, proteinPerMeal, onSuccess }) => {
  const [step, setStep] = useState(1); // 1: Details, 2: Confirmation, 3: Success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdUser, setCreatedUser] = useState(null);
  const [userCredentials, setUserCredentials] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    billingCycle: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
  });

  // Calculate pricing using centralized function
  const pricing = calculatePricing(planType, mealsPerDay, proteinPerMeal);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Please enter your name');
      return false;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      setError('Please enter a valid phone number');
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.address.trim()) {
      setError('Please enter your delivery address');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Create subscription object
      const subscriptionData = createSubscription({
        planType,
        mealsPerDay,
        proteinPerMeal,
        billingCycle: formData.billingCycle,
        pricePerMeal: pricing.pricePerMeal,
        monthlyAmount: pricing.monthlyAmount,
      });
      
      // Create user with subscription
      const userData = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        programType: formData.billingCycle === 'monthly' ? '30-day' : formData.billingCycle,
        mealPlan: planType,
        goalWeight: 0, // Can be updated later
        progressStatus: 'onTrack',
        startDate: formData.startDate,
        logs: [],
        notes: [],
      };
      
      const newUser = createUserWithSubscription(userData, subscriptionData);
      
      // Initialize meal deliveries
      initializeMealDeliveries(newUser.id, subscriptionData);
      
      // Create user login credentials
      const credentials = createUserLogin(newUser.id, formData.phone);
      
      setCreatedUser(newUser);
      setUserCredentials(credentials);
      setStep(3); // Success step
      
      if (onSuccess) {
        onSuccess(newUser);
      }
    } catch (err) {
      console.error('Error creating subscription:', err);
      setError('Failed to create subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyUserLink = () => {
    const link = `${window.location.origin}/user/${createdUser.id}`;
    navigator.clipboard.writeText(link);
    alert('Link copied to clipboard!');
  };

  const getPlanName = () => {
    const planNames = {
      'non-veg': 'Non-Vegetarian',
      'veg-eggs': 'Vegetarian + Eggs',
      'pure-veg': 'Pure Vegetarian',
    };
    return planNames[planType] || planType;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary to-secondary p-6 text-white flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Start Your Subscription</h2>
            <p className="text-sm opacity-90">Step {step} of 3</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 && (
            <>
              {/* Plan Summary */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Selected Plan</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Plan Type</p>
                    <p className="font-bold text-gray-900">{getPlanName()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Meals per Day</p>
                    <p className="font-bold text-gray-900">{mealsPerDay} meal{mealsPerDay > 1 ? 's' : ''}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Protein per Meal</p>
                    <p className="font-bold text-gray-900">{proteinPerMeal}g</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Monthly Cost</p>
                    <p className="font-bold text-primary text-xl">₹{pricing.monthlyAmount.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    placeholder="10-digit mobile number"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Delivery Address *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    placeholder="Enter your complete delivery address"
                    rows="3"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Billing Cycle
                  </label>
                  <select
                    name="billingCycle"
                    value={formData.billingCycle}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  >
                    <option value="monthly">Monthly (Auto-renew)</option>
                    <option value="60-day">60 Days (Fixed term)</option>
                    <option value="90-day">90 Days (Fixed term)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (validateForm()) {
                      setStep(2);
                    }
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-semibold hover:shadow-lg transition"
                >
                  Continue
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              {/* Confirmation */}
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Confirm Your Subscription</h3>
                  <p className="text-gray-600">Please review your details before proceeding</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-semibold">{formData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-semibold">{formData.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-semibold">{formData.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plan:</span>
                    <span className="font-semibold">{getPlanName()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Meals/Day:</span>
                    <span className="font-semibold">{mealsPerDay}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Billing Cycle:</span>
                    <span className="font-semibold capitalize">{formData.billingCycle.replace('-', ' ')}</span>
                  </div>
                  <div className="border-t pt-4 flex justify-between text-lg">
                    <span className="font-bold">Monthly Amount:</span>
                    <span className="font-bold text-primary">₹{pricing.monthlyAmount.toLocaleString()}</span>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                    disabled={loading}
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Confirm & Subscribe'}
                  </button>
                </div>
              </div>
            </>
          )}

          {step === 3 && createdUser && (
            <>
              {/* Success */}
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-12 h-12 text-green-600" />
                </div>
                
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">Subscription Created!</h3>
                  <p className="text-gray-600">Welcome to AFTERBURN, {createdUser.name}!</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                  <p className="text-sm text-gray-600 mb-2">Your Personal Dashboard Link:</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={`${window.location.origin}/user/${createdUser.id}`}
                      readOnly
                      className="flex-1 px-4 py-2 bg-white border border-green-300 rounded-lg text-sm"
                    />
                    <button
                      onClick={copyUserLink}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Save this link to track your progress and log daily meals
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 text-left space-y-3">
                  <h4 className="font-bold text-gray-900 mb-3">What's Next?</h4>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">1</div>
                    <p className="text-sm text-gray-700">Check your email for subscription details and payment instructions</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">2</div>
                    <p className="text-sm text-gray-700">Your meal deliveries will start on {new Date(formData.startDate).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">3</div>
                    <p className="text-sm text-gray-700">Use your dashboard link to log daily weight and track progress</p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="w-full px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-semibold hover:shadow-lg transition"
                >
                  Done
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
