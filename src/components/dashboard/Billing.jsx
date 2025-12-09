import React, { useState, useMemo } from 'react';
import { DollarSign, CreditCard, Calendar, TrendingUp } from 'lucide-react';
import PaymentTracking from './PaymentTracking';
import Subscriptions from './Subscriptions';

const Billing = ({ users, onUpdateUser, showToast }) => {
  const [activeTab, setActiveTab] = useState('programs'); // 'programs' or 'subscriptions'

  // Calculate combined stats (memoized for performance and proper updates)
  const combinedStats = useMemo(() => {
    const stats = {
      totalRevenue: 0,
      activeSubscriptions: 0,
      pendingPayments: 0,
      monthlyRecurring: 0
    };

    // Single loop for both program fees and subscriptions
    users.forEach(user => {
      // Program fees
      const programFee = user.programFee || 0;
      const paidAmount = user.paidAmount || 0;
      
      if (user.paymentStatus === 'paid') {
        stats.totalRevenue += programFee;
      } else if (user.paymentStatus === 'partial') {
        stats.totalRevenue += paidAmount;
        stats.pendingPayments += (programFee - paidAmount);
      } else if (user.paymentStatus === 'pending') {
        stats.pendingPayments += programFee;
      }

      // Subscriptions
      if (user.subscription && user.subscription.status === 'active') {
        stats.activeSubscriptions++;
        stats.monthlyRecurring += (user.subscription.monthlyAmount || 0);
      }
    });

    return stats;
  }, [users]);

  const tabs = [
    {
      id: 'programs',
      name: 'Program Fees',
      icon: DollarSign,
      description: 'Fixed-term program payments'
    },
    {
      id: 'subscriptions',
      name: 'Monthly Plans',
      icon: Calendar,
      description: 'Recurring subscriptions'
    }
  ];

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Billing & Revenue</h1>
        <p className="text-gray-600 mt-2">Manage program fees and monthly subscriptions</p>
      </div>

      {/* Combined Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-green-200" />
            <TrendingUp className="w-5 h-5 text-green-200" />
          </div>
          <p className="text-green-100 text-sm">Total Revenue</p>
          <p className="text-3xl font-bold">₹{combinedStats.totalRevenue.toLocaleString()}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-8 h-8 text-blue-200" />
          </div>
          <p className="text-blue-100 text-sm">Active Subscriptions</p>
          <p className="text-3xl font-bold">{combinedStats.activeSubscriptions}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <CreditCard className="w-8 h-8 text-purple-200" />
          </div>
          <p className="text-purple-100 text-sm">Monthly Recurring</p>
          <p className="text-3xl font-bold">₹{combinedStats.monthlyRecurring.toLocaleString()}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-orange-200" />
          </div>
          <p className="text-orange-100 text-sm">Pending Payments</p>
          <p className="text-3xl font-bold">₹{combinedStats.pendingPayments.toLocaleString()}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Tab Headers */}
        <div className="border-b border-gray-200">
          <div className="flex">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-6 py-4 flex items-center justify-center gap-3 transition-all ${
                    isActive
                      ? 'bg-primary text-white border-b-4 border-primary'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <div className="text-left">
                    <p className={`font-semibold ${isActive ? 'text-white' : 'text-gray-800'}`}>
                      {tab.name}
                    </p>
                    <p className={`text-xs ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>
                      {tab.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-gray-50">
          {activeTab === 'programs' && (
            <PaymentTracking 
              users={users}
              onUpdateUser={onUpdateUser}
              showToast={showToast}
            />
          )}

          {activeTab === 'subscriptions' && (
            <Subscriptions 
              users={users}
              onUpdateUser={onUpdateUser}
              showToast={showToast}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Billing;
