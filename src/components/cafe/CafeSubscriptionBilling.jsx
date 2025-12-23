import React, { useState, useEffect } from 'react';
import { Plus, DollarSign, Calendar, CreditCard, CheckCircle, Clock, X, FileText } from 'lucide-react';
import { getSubscriptions, getSubscriptionPayments, addSubscriptionPayment } from '../../services/cafeService';

const CafeSubscriptionBilling = ({ showToast }) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [payments, setPayments] = useState({});
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const subsData = await getSubscriptions();
    setSubscriptions(subsData);

    // Load payment history for each subscription
    const paymentsData = {};
    for (const sub of subsData) {
      const subPayments = await getSubscriptionPayments(sub.id);
      paymentsData[sub.id] = subPayments;
    }
    setPayments(paymentsData);
  };

  const handleAddPayment = (subscription) => {
    setSelectedSubscription(subscription);
    setFormData({
      amount: subscription.monthly_amount,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash',
      notes: '',
    });
    setShowPaymentModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await addSubscriptionPayment({
        subscriptionId: selectedSubscription.id,
        amount: parseFloat(formData.amount),
        paymentDate: formData.paymentDate,
        paymentMethod: formData.paymentMethod,
        status: 'paid',
        notes: formData.notes,
      });

      showToast('✅ Payment recorded successfully');
      setShowPaymentModal(false);
      setSelectedSubscription(null);
      await loadData();
    } catch (error) {
      showToast('❌ Error recording payment');
      console.error(error);
    }
  };

  const calculateTotalPaid = (subscriptionId) => {
    const subPayments = payments[subscriptionId] || [];
    return subPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
  };

  const getPaymentStatus = (subscription) => {
    const totalPaid = calculateTotalPaid(subscription.id);
    const monthlyAmount = parseFloat(subscription.monthly_amount || 0);
    
    const startDate = new Date(subscription.start_date);
    const endDate = new Date(subscription.end_date);
    const today = new Date();
    
    const monthsElapsed = Math.max(1, Math.ceil((today - startDate) / (1000 * 60 * 60 * 24 * 30)));
    const expectedAmount = monthlyAmount * monthsElapsed;
    
    if (totalPaid >= expectedAmount) return 'paid';
    if (totalPaid > 0) return 'partial';
    return 'pending';
  };

  const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
  const totalRevenue = Object.values(payments).flat().reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
  const pendingPayments = activeSubscriptions.filter(s => getPaymentStatus(s) === 'pending').length;
  const thisMonthPayments = Object.values(payments).flat().filter(p => {
    const paymentDate = new Date(p.payment_date);
    const today = new Date();
    return paymentDate.getMonth() === today.getMonth() && paymentDate.getFullYear() === today.getFullYear();
  });
  const thisMonthRevenue = thisMonthPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

  return (
    <div className="space-y-4 md:space-y-6 p-2 md:p-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Subscription Billing
          </h2>
          <p className="text-sm md:text-base text-gray-600 font-semibold mt-1">
            Track payments and billing for subscriptions
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 md:p-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-xs text-gray-600 font-semibold">Total Revenue</p>
              <p className="text-2xl md:text-3xl font-black text-green-600">₹{totalRevenue.toFixed(0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-4 md:p-6">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-xs text-gray-600 font-semibold">This Month</p>
              <p className="text-2xl md:text-3xl font-black text-blue-600">₹{thisMonthRevenue.toFixed(0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl p-4 md:p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-8 h-8 text-orange-600" />
            <div>
              <p className="text-xs text-gray-600 font-semibold">Pending</p>
              <p className="text-2xl md:text-3xl font-black text-orange-600">{pendingPayments}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4 md:p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-xs text-gray-600 font-semibold">Payments</p>
              <p className="text-2xl md:text-3xl font-black text-purple-600">{thisMonthPayments.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscriptions Billing Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Plan</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Monthly Amount</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total Paid</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Last Payment</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-32">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {activeSubscriptions.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                  No active subscriptions found.
                </td>
              </tr>
            ) : (
              activeSubscriptions.map((subscription) => {
                const subPayments = payments[subscription.id] || [];
                const totalPaid = calculateTotalPaid(subscription.id);
                const lastPayment = subPayments.length > 0 ? subPayments[subPayments.length - 1] : null;
                const paymentStatus = getPaymentStatus(subscription);

                return (
                  <tr key={subscription.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{subscription.customer?.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500">{subscription.customer?.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-semibold">
                        {subscription.plan_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">₹{subscription.monthly_amount}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-green-600">₹{totalPaid.toFixed(0)}</p>
                      <p className="text-xs text-gray-500">{subPayments.length} payments</p>
                    </td>
                    <td className="px-6 py-4">
                      {lastPayment ? (
                        <div className="text-sm">
                          <p className="text-gray-900">₹{lastPayment.amount}</p>
                          <p className="text-gray-500">{new Date(lastPayment.payment_date).toLocaleDateString()}</p>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">No payments</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        paymentStatus === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : paymentStatus === 'partial'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleAddPayment(subscription)}
                        className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-semibold"
                      >
                        <Plus className="w-4 h-4" />
                        Pay
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Recent Payments */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Recent Payments
        </h3>
        <div className="space-y-3">
          {Object.entries(payments)
            .flatMap(([subId, subPayments]) => 
              subPayments.map(payment => ({
                ...payment,
                subscription: subscriptions.find(s => s.id === subId)
              }))
            )
            .sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date))
            .slice(0, 10)
            .map((payment, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{payment.subscription?.customer?.name || 'Unknown'}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(payment.payment_date).toLocaleDateString()} • {payment.payment_method}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">₹{payment.amount}</p>
                  {payment.notes && <p className="text-xs text-gray-500">{payment.notes}</p>}
                </div>
              </div>
            ))}
          {Object.values(payments).flat().length === 0 && (
            <p className="text-center text-gray-500 py-8">No payments recorded yet.</p>
          )}
        </div>
      </div>

      {/* Add Payment Modal */}
      {showPaymentModal && selectedSubscription && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">Record Payment</h3>
                <button onClick={() => setShowPaymentModal(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="font-semibold text-gray-900">{selectedSubscription.customer?.name}</p>
                <p className="text-sm text-gray-600">{selectedSubscription.plan_type} - ₹{selectedSubscription.monthly_amount}/month</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="3000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.paymentDate}
                    onChange={(e) => setFormData({...formData, paymentDate: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method *
                  </label>
                  <select
                    required
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="card">Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Payment notes"
                    rows="3"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-bold hover:from-green-700 hover:to-emerald-700 transition shadow-lg"
                  >
                    Record Payment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CafeSubscriptionBilling;
