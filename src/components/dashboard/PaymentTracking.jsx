import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Search,
  Download,
  Send,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Receipt,
  TrendingUp,
  Users as UsersIcon
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import ConfirmModal from '../ConfirmModal';
import { useConfirm } from '../../hooks/useConfirm';

const PaymentTracking = ({ users, onUpdateUser, showToast }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showEditFee, setShowEditFee] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    method: 'cash',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [editFeeData, setEditFeeData] = useState({
    programFee: ''
  });
  const { confirmState, confirm, closeConfirm } = useConfirm();

  // Calculate payment stats
  const stats = {
    totalRevenue: 0,
    paidCount: 0,
    pendingCount: 0,
    partialCount: 0,
    pendingAmount: 0
  };

  users.forEach(user => {
    const programFee = user.programFee || 0;
    const paidAmount = user.paidAmount || 0;
    
    if (user.paymentStatus === 'paid') {
      stats.paidCount++;
      stats.totalRevenue += programFee;
    } else if (user.paymentStatus === 'pending') {
      stats.pendingCount++;
      stats.pendingAmount += programFee;
    } else if (user.paymentStatus === 'partial') {
      stats.partialCount++;
      stats.totalRevenue += paidAmount;
      stats.pendingAmount += (programFee - paidAmount);
    }
  });

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || user.paymentStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAddPayment = () => {
    if (!selectedUser || !paymentData.amount) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    const amount = parseFloat(paymentData.amount);
    const currentPaid = selectedUser.paidAmount || 0;
    const programFee = selectedUser.programFee || 0;
    const newPaidAmount = currentPaid + amount;

    // Determine new payment status
    let newStatus = 'pending';
    if (newPaidAmount >= programFee) {
      newStatus = 'paid';
    } else if (newPaidAmount > 0) {
      newStatus = 'partial';
    }

    // Create payment record
    const payment = {
      id: Date.now().toString(),
      amount,
      method: paymentData.method,
      date: paymentData.date,
      notes: paymentData.notes,
      recordedAt: new Date().toISOString()
    };

    // Update user
    const payments = selectedUser.payments || [];
    payments.push(payment);

    onUpdateUser(selectedUser.id, {
      paidAmount: newPaidAmount,
      paymentStatus: newStatus,
      payments,
      lastPaymentDate: paymentData.date
    });

    showToast('Payment recorded successfully!', 'success');
    setShowAddPayment(false);
    setSelectedUser(null);
    setPaymentData({
      amount: '',
      method: 'cash',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  const handleEditProgramFee = () => {
    if (!editFeeData.programFee || parseFloat(editFeeData.programFee) < 0) {
      showToast('Please enter a valid program fee', 'error');
      return;
    }

    const newProgramFee = parseFloat(editFeeData.programFee);
    const paidAmount = selectedUser.paidAmount || 0;
    
    // Recalculate payment status
    let newStatus = 'pending';
    if (paidAmount >= newProgramFee) {
      newStatus = 'paid';
    } else if (paidAmount > 0) {
      newStatus = 'partial';
    }

    onUpdateUser(selectedUser.id, {
      programFee: newProgramFee,
      paymentStatus: newStatus
    });

    showToast('Program fee updated successfully!', 'success');
    setShowEditFee(false);
    setSelectedUser(null);
    setEditFeeData({ programFee: '' });
  };

  const handleSendPaymentReminder = (user) => {
    const phone = user.phone?.replace(/\D/g, '');
    if (!phone) {
      showToast('Phone number not available', 'error');
      return;
    }

    const programFee = user.programFee || 0;
    const paidAmount = user.paidAmount || 0;
    const pendingAmount = programFee - paidAmount;

    let message = `Hi ${user.name}, `;
    
    if (user.paymentStatus === 'pending') {
      message += `this is a friendly reminder about your program fee of ₹${programFee}. Please complete the payment at your earliest convenience. Thank you!`;
    } else if (user.paymentStatus === 'partial') {
      message += `you have paid ₹${paidAmount} out of ₹${programFee}. The remaining amount is ₹${pendingAmount}. Please complete the payment. Thank you!`;
    }

    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            Paid
          </span>
        );
      case 'partial':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            <Clock className="w-4 h-4" />
            Partial
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
            <AlertCircle className="w-4 h-4" />
            Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
            Not Set
          </span>
        );
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Payment Tracking</h1>
        <p className="text-gray-600 mt-2">Manage user payments and track revenue</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Revenue</p>
              <p className="text-3xl font-bold mt-1">₹{stats.totalRevenue.toLocaleString()}</p>
            </div>
            <DollarSign className="w-12 h-12 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Paid Users</p>
              <p className="text-3xl font-bold mt-1">{stats.paidCount}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Partial Payments</p>
              <p className="text-3xl font-bold mt-1">{stats.partialCount}</p>
            </div>
            <Clock className="w-12 h-12 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Pending Amount</p>
              <p className="text-3xl font-bold mt-1">₹{stats.pendingAmount.toLocaleString()}</p>
            </div>
            <AlertCircle className="w-12 h-12 text-red-200" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {['all', 'paid', 'partial', 'pending'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-3 rounded-lg font-medium capitalize transition ${
                  filterStatus === status
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Program Fee</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Paid Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Pending</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Last Payment</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredUsers.map(user => {
                const programFee = user.programFee || 0;
                const paidAmount = user.paidAmount || 0;
                const pendingAmount = programFee - paidAmount;

                return (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-800">₹{programFee.toLocaleString()}</p>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setEditFeeData({ programFee: programFee.toString() });
                            setShowEditFee(true);
                          }}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                          title="Edit Program Fee"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-green-600">₹{paidAmount.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-red-600">₹{pendingAmount.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(user.paymentStatus)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">
                        {user.lastPaymentDate 
                          ? format(parseISO(user.lastPaymentDate), 'MMM dd, yyyy')
                          : 'No payment yet'
                        }
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowAddPayment(true);
                          }}
                          className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition"
                          title="Add Payment"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        {(user.paymentStatus === 'pending' || user.paymentStatus === 'partial') && (
                          <button
                            onClick={() => handleSendPaymentReminder(user)}
                            className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                            title="Send Reminder"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <DollarSign className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>No users found</p>
          </div>
        )}
      </div>

      {/* Add Payment Modal */}
      {showAddPayment && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Add Payment for {selectedUser.name}
            </h3>

            <div className="space-y-4">
              {/* Current Status */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Program Fee:</span>
                  <span className="font-semibold">₹{(selectedUser.programFee || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Already Paid:</span>
                  <span className="font-semibold text-green-600">₹{(selectedUser.paidAmount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Remaining:</span>
                  <span className="font-semibold text-red-600">
                    ₹{((selectedUser.programFee || 0) - (selectedUser.paidAmount || 0)).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Amount *
                </label>
                <input
                  type="number"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  value={paymentData.method}
                  onChange={(e) => setPaymentData({ ...paymentData, method: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="card">Card</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Date
                </label>
                <input
                  type="date"
                  value={paymentData.date}
                  onChange={(e) => setPaymentData({ ...paymentData, date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                  placeholder="Add any notes..."
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddPayment(false);
                  setSelectedUser(null);
                  setPaymentData({
                    amount: '',
                    method: 'cash',
                    date: new Date().toISOString().split('T')[0],
                    notes: ''
                  });
                }}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPayment}
                className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium"
              >
                Add Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Program Fee Modal */}
      {showEditFee && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Edit Program Fee - {selectedUser.name}
            </h3>

            <div className="space-y-4">
              {/* Current Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-blue-600 font-medium">Current Fee</p>
                    <p className="text-blue-900 font-bold text-lg">₹{(selectedUser.programFee || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-blue-600 font-medium">Paid Amount</p>
                    <p className="text-blue-900 font-bold text-lg">₹{(selectedUser.paidAmount || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* New Program Fee */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Program Fee (₹) *
                </label>
                <input
                  type="number"
                  value={editFeeData.programFee}
                  onChange={(e) => setEditFeeData({ programFee: e.target.value })}
                  placeholder="Enter new program fee"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  min="0"
                  step="100"
                />
              </div>

              {/* Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800">
                  ⚠️ <strong>Note:</strong> Changing the program fee will automatically recalculate the payment status based on the amount already paid.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditFee(false);
                  setSelectedUser(null);
                  setEditFeeData({ programFee: '' });
                }}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleEditProgramFee}
                className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium"
              >
                Update Fee
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={closeConfirm}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        type={confirmState.type}
      />
    </div>
  );
};

export default PaymentTracking;
