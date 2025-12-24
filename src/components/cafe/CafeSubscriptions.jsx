import React, { useState } from 'react';
import { Calendar, CreditCard } from 'lucide-react';
import CafeSubscriptionManagement from './CafeSubscriptionManagement';
import CafeSubscriptionBilling from './CafeSubscriptionBilling';

const CafeSubscriptions = ({ showToast }) => {
  const [activeTab, setActiveTab] = useState('management');

  return (
    <div className="space-y-6 p-2 sm:p-0">
      {/* Header with Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Subscriptions
          </h2>
          <p className="text-sm sm:text-base text-gray-600 font-semibold mt-1">
            Manage subscription plans and billing
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1 inline-flex gap-1">
        <button
          onClick={() => setActiveTab('management')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
            activeTab === 'management'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Management
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
            activeTab === 'billing'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Billing
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'management' && <CafeSubscriptionManagement showToast={showToast} />}
        {activeTab === 'billing' && <CafeSubscriptionBilling showToast={showToast} />}
      </div>
    </div>
  );
};

export default CafeSubscriptions;
