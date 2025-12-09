import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Calendar, DollarSign, Users, TrendingUp, 
  CheckCircle, XCircle, Pause, RefreshCw, Plus, Eye, Edit, Trash2,
  AlertCircle, Clock, ChevronDown, ChevronUp
} from 'lucide-react';
import {
  getActiveSubscriptions,
  getExpiringSubscriptions,
  getExpiredSubscriptions,
  getSubscriptionStats,
  renewSubscription,
  pauseSubscription,
  cancelSubscription,
  extendSubscription,
  updatePaymentStatus,
  getDaysRemaining,
} from '../../services/subscriptionService';
import {
  formatSubscriptionStatus,
  formatBillingCycle,
  formatPlanType,
  getStatusBadgeClass,
  formatDate,
  formatCurrency,
  getDaysRemainingText,
  getUrgencyLevel,
  getSubscriptionProgress,
} from '../../utils/subscriptionUtils';

const Subscriptions = ({ users, onUpdateUser, showToast }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('endDate'); // endDate, startDate, amount
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadStats();
  }, [users]);

  const loadStats = () => {
    const subscriptionStats = getSubscriptionStats();
    setStats(subscriptionStats);
  };

  // Filter users with subscriptions
  const usersWithSubscriptions = users.filter(u => u.subscription);

  // Apply filters
  const filteredUsers = usersWithSubscriptions.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone?.includes(searchTerm) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || user.subscription.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let compareA, compareB;
    
    switch (sortBy) {
      case 'endDate':
        compareA = new Date(a.subscription.endDate);
        compareB = new Date(b.subscription.endDate);
        break;
      case 'startDate':
        compareA = new Date(a.subscription.startDate);
        compareB = new Date(b.subscription.startDate);
        break;
      case 'amount':
        compareA = a.subscription.monthlyAmount || 0;
        compareB = b.subscription.monthlyAmount || 0;
        break;
      default:
        return 0;
    }
    
    return sortOrder === 'asc' ? compareA - compareB : compareB - compareA;
  });

  const handleRenew = async (userId) => {
    try {
      await renewSubscription(userId);
      loadStats();
      showToast('Subscription renewed successfully!', 'success');
    } catch (error) {
      showToast('Failed to renew subscription', 'error');
    }
  };

  const handlePause = async (userId) => {
    const reason = prompt('Reason for pausing (optional):');
    try {
      await pauseSubscription(userId, reason);
      loadStats();
      showToast('Subscription paused', 'success');
    } catch (error) {
      showToast('Failed to pause subscription', 'error');
    }
  };

  const handleCancel = async (userId) => {
    if (!confirm('Are you sure you want to cancel this subscription?')) return;
    
    const reason = prompt('Reason for cancellation (optional):');
    try {
      await cancelSubscription(userId, reason);
      loadStats();
      showToast('Subscription canceled', 'success');
    } catch (error) {
      showToast('Failed to cancel subscription', 'error');
    }
  };

  const handleExtend = async (userId) => {
    const days = prompt('Number of days to extend:');
    if (!days || isNaN(days)) return;
    
    try {
      await extendSubscription(userId, parseInt(days));
      loadStats();
      showToast(`Subscription extended by ${days} days`, 'success');
    } catch (error) {
      showToast('Failed to extend subscription', 'error');
    }
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscriptions</h1>
        <p className="text-gray-600">Manage all customer subscriptions and billing</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-600">Active Subscriptions</div>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.active}</div>
            <div className="text-xs text-gray-500 mt-1">Out of {stats.total} total</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-600">Expiring Soon</div>
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.expiringSoon}</div>
            <div className="text-xs text-gray-500 mt-1">Within 7 days</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-600">Monthly Revenue</div>
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{formatCurrency(stats.mrr)}</div>
            <div className="text-xs text-gray-500 mt-1">MRR from active subs</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-600">Expired</div>
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.expired}</div>
            <div className="text-xs text-gray-500 mt-1">Need renewal</div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="expired">Expired</option>
              <option value="canceled">Canceled</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            >
              <option value="endDate">Sort by End Date</option>
              <option value="startDate">Sort by Start Date</option>
              <option value="amount">Sort by Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => toggleSort('amount')}>
                  <div className="flex items-center gap-1">
                    Amount
                    {sortBy === 'amount' && (sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => toggleSort('endDate')}>
                  <div className="flex items-center gap-1">
                    End Date
                    {sortBy === 'endDate' && (sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    No subscriptions found
                  </td>
                </tr>
              ) : (
                sortedUsers.map((user) => {
                  const sub = user.subscription;
                  const daysRemaining = getDaysRemaining(sub);
                  const urgency = getUrgencyLevel(daysRemaining);
                  const progress = getSubscriptionProgress(sub);

                  return (
                    <tr key={user.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{formatPlanType(sub.planType)}</div>
                          <div className="text-xs text-gray-500">
                            {sub.mealsPerDay} meals/day • {sub.proteinPerMeal}g protein
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{formatCurrency(sub.monthlyAmount)}</div>
                        <div className="text-xs text-gray-500">{formatBillingCycle(sub.billingCycle)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(sub.endDate)}</div>
                        <div className={`text-xs ${
                          urgency === 'critical' ? 'text-red-600 font-semibold' :
                          urgency === 'warning' ? 'text-yellow-600 font-semibold' :
                          'text-gray-500'
                        }`}>
                          {getDaysRemainingText(daysRemaining)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusBadgeClass(sub.status)}`}>
                          {formatSubscriptionStatus(sub.status).label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              progress < 50 ? 'bg-green-500' :
                              progress < 80 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{progress}% complete</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {sub.status === 'active' && daysRemaining < 7 && (
                            <button
                              onClick={() => handleRenew(user.id)}
                              className="text-green-600 hover:text-green-900"
                              title="Renew"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          )}
                          {sub.status === 'active' && (
                            <button
                              onClick={() => handlePause(user.id)}
                              className="text-yellow-600 hover:text-yellow-900"
                              title="Pause"
                            >
                              <Pause className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleExtend(user.id)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Extend"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedSubscription(user);
                              setShowDetailsModal(true);
                            }}
                            className="text-primary hover:text-primary/80"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedSubscription && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-primary to-secondary p-6 text-white flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Subscription Details</h2>
                <p className="text-sm opacity-90">{selectedSubscription.name}</p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-semibold">{selectedSubscription.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-semibold">{selectedSubscription.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold">{selectedSubscription.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-semibold">{selectedSubscription.address || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Subscription Info */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Subscription Details</h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                  <div>
                    <p className="text-sm text-gray-600">Plan Type</p>
                    <p className="font-semibold">{formatPlanType(selectedSubscription.subscription.planType)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Meals per Day</p>
                    <p className="font-semibold">{selectedSubscription.subscription.mealsPerDay}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Protein per Meal</p>
                    <p className="font-semibold">{selectedSubscription.subscription.proteinPerMeal}g</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Billing Cycle</p>
                    <p className="font-semibold">{formatBillingCycle(selectedSubscription.subscription.billingCycle)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Start Date</p>
                    <p className="font-semibold">{formatDate(selectedSubscription.subscription.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">End Date</p>
                    <p className="font-semibold">{formatDate(selectedSubscription.subscription.endDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Monthly Amount</p>
                    <p className="font-semibold text-primary text-lg">{formatCurrency(selectedSubscription.subscription.monthlyAmount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusBadgeClass(selectedSubscription.subscription.status)}`}>
                      {formatSubscriptionStatus(selectedSubscription.subscription.status).label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    handleRenew(selectedSubscription.id);
                    setShowDetailsModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  Renew Subscription
                </button>
                <button
                  onClick={() => {
                    handleCancel(selectedSubscription.id);
                    setShowDetailsModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                >
                  Cancel Subscription
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscriptions;
