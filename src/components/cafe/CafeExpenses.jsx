import React, { useState, useEffect } from 'react';
import { Plus, Wallet, TrendingDown, X, Trash2, Edit, Calendar } from 'lucide-react';
import { getPurchases } from '../../services/cafeService';

const EXPENSE_CATEGORIES = [
  'Rent',
  'Electricity',
  'Water',
  'Gas/Fuel',
  'Staff Salaries',
  'Maintenance',
  'Marketing',
  'Transportation',
  'Packaging',
  'Cleaning Supplies',
  'Internet/Phone',
  'Insurance',
  'Licenses/Permits',
  'Miscellaneous'
];

const CafeExpenses = ({ showToast }) => {
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPurchaseDetailModal, setShowPurchaseDetailModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    paymentMethod: 'Cash',
  });

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = () => {
    const stored = localStorage.getItem('cafe_expenses');
    const allExpenses = stored ? JSON.parse(stored) : [];
    setExpenses(allExpenses);
    calculateStats(allExpenses);
  };

  const calculateStats = (allExpenses) => {
    const now = new Date();
    const thisMonth = allExpenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
    });

    const today = allExpenses.filter(exp => {
      const expDate = new Date(exp.date);
      const todayDate = new Date();
      return expDate.toDateString() === todayDate.toDateString();
    });

    // Group by category
    const byCategory = {};
    thisMonth.forEach(exp => {
      if (!byCategory[exp.category]) {
        byCategory[exp.category] = 0;
      }
      byCategory[exp.category] += parseFloat(exp.amount);
    });

    setStats({
      totalExpenses: allExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0),
      thisMonthExpenses: thisMonth.reduce((sum, exp) => sum + parseFloat(exp.amount), 0),
      todayExpenses: today.reduce((sum, exp) => sum + parseFloat(exp.amount), 0),
      byCategory: byCategory,
      expenseCount: allExpenses.length,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const stored = localStorage.getItem('cafe_expenses');
    const allExpenses = stored ? JSON.parse(stored) : [];

    if (editingExpense) {
      // Update existing
      const updated = allExpenses.map(exp => 
        exp.id === editingExpense.id ? { ...formData, id: exp.id } : exp
      );
      localStorage.setItem('cafe_expenses', JSON.stringify(updated));
      showToast('Expense updated successfully');
    } else {
      // Add new
      const newExpense = {
        ...formData,
        id: Date.now().toString(),
        amount: parseFloat(formData.amount),
        createdAt: new Date().toISOString(),
      };
      allExpenses.push(newExpense);
      localStorage.setItem('cafe_expenses', JSON.stringify(allExpenses));
      showToast('Expense recorded successfully');
    }

    resetForm();
    loadExpenses();
  };

  const handleDelete = (id) => {
    if (confirm('Delete this expense record?')) {
      const stored = localStorage.getItem('cafe_expenses');
      const allExpenses = stored ? JSON.parse(stored) : [];
      const updated = allExpenses.filter(exp => exp.id !== id);
      localStorage.setItem('cafe_expenses', JSON.stringify(updated));
      showToast('Expense deleted');
      loadExpenses();
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      category: expense.category,
      amount: expense.amount,
      date: expense.date,
      description: expense.description || '',
      paymentMethod: expense.paymentMethod || 'Cash',
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      category: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      paymentMethod: 'Cash',
    });
    setEditingExpense(null);
    setShowModal(false);
  };

  // Group expenses by month
  const groupedExpenses = expenses.reduce((groups, exp) => {
    const date = new Date(exp.date);
    const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!groups[monthYear]) {
      groups[monthYear] = [];
    }
    groups[monthYear].push(exp);
    return groups;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            Expenses
          </h2>
          <p className="text-gray-600 font-semibold mt-1">Track all business expenses</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-bold hover:from-red-700 hover:to-orange-700 transition shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          Add Expense
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Today's Expenses */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 border-2 border-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"></div>
            </div>
            <div className="relative p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-red-500 rounded-xl shadow-lg">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-semibold text-gray-600">Today's Expenses</p>
              </div>
              <p className="text-4xl font-black bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                ₹{stats.todayExpenses.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">Today</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
          </div>

          {/* This Month */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"></div>
            </div>
            <div className="relative p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-orange-500 rounded-xl shadow-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-semibold text-gray-600">This Month</p>
              </div>
              <p className="text-4xl font-black bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                ₹{stats.thisMonthExpenses.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">Current Month</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
          </div>

          {/* Total Expenses */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"></div>
            </div>
            <div className="relative p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-purple-500 rounded-xl shadow-lg">
                  <TrendingDown className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-semibold text-gray-600">Total Expenses</p>
              </div>
              <p className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                ₹{stats.totalExpenses.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">All Time</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      {stats && Object.keys(stats.byCategory).length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">This Month by Category</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(stats.byCategory)
              .sort((a, b) => b[1] - a[1])
              .map(([category, amount]) => (
                <div key={category} className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-4 border-2 border-red-100">
                  <p className="text-sm font-semibold text-gray-600">{category}</p>
                  <p className="text-2xl font-black bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                    ₹{amount.toLocaleString()}
                  </p>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full"
                      style={{ width: `${(amount / stats.thisMonthExpenses) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {((amount / stats.thisMonthExpenses) * 100).toFixed(1)}% of total
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Expenses Table - Grouped by Month */}
      <div className="space-y-6">
        {Object.keys(groupedExpenses).length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-semibold">No expenses recorded yet</p>
            <p className="text-gray-400 text-sm mt-2">Start tracking your business expenses</p>
          </div>
        ) : (
          Object.entries(groupedExpenses).reverse().map(([monthYear, monthExpenses]) => {
            const monthTotal = monthExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
            
            return (
              <div key={monthYear} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-red-50 to-orange-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900">{monthYear}</h3>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Month Total</p>
                      <p className="text-2xl font-black bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                        ₹{monthTotal.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Order #</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-32">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Payment</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-24">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {monthExpenses.map((expense) => (
                      <tr key={expense.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900">
                            {new Date(expense.date).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-gray-900">{expense.category}</span>
                        </td>
                        <td className="px-6 py-4">
                          {expense.orderNumber ? (
                            <button
                              onClick={() => {
                                const purchases = getPurchases();
                                const purchase = purchases.find(p => p.id === expense.purchaseId);
                                if (purchase) {
                                  setSelectedPurchase(purchase);
                                  setShowPurchaseDetailModal(true);
                                }
                              }}
                              className="text-sm font-bold text-purple-600 hover:text-purple-800 hover:underline cursor-pointer"
                            >
                              {expense.orderNumber}
                            </button>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xl font-black bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                            ₹{parseFloat(expense.amount).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                            {expense.paymentMethod}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">{expense.description || '-'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(expense)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(expense.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })
        )}
      </div>

      {/* Add/Edit Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">
                  {editingExpense ? 'Edit' : 'Add'} Expense
                </h3>
                <button onClick={resetForm}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select category</option>
                      {EXPENSE_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount (₹) <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="1000"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    >
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI</option>
                      <option value="Card">Card</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Add details about this expense..."
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
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg font-bold hover:from-red-700 hover:to-orange-700 transition shadow-lg"
                  >
                    {editingExpense ? 'Update' : 'Add'} Expense
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Purchase Detail Modal */}
      {showPurchaseDetailModal && selectedPurchase && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold">Purchase Order Details</h3>
                  <p className="text-sm text-gray-500 mt-1">Order #{selectedPurchase.orderNumber}</p>
                </div>
                <button onClick={() => setShowPurchaseDetailModal(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Date</p>
                    <p className="text-sm font-semibold">{new Date(selectedPurchase.date || selectedPurchase.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Supplier</p>
                    <p className="text-sm font-semibold">{selectedPurchase.supplierName || 'N/A'}</p>
                  </div>
                </div>

                {/* Items Table */}
                <div>
                  <h4 className="text-lg font-bold mb-3">Items Purchased</h4>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Material</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Quantity</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Price</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedPurchase.items?.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3 text-sm font-medium">{item.materialName}</td>
                            <td className="px-4 py-3 text-sm">{item.quantity} {item.unit}</td>
                            <td className="px-4 py-3 text-sm text-right font-semibold">₹{item.totalPrice?.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Total */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border-2 border-purple-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-700">Total Amount</span>
                    <span className="text-2xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                      ₹{selectedPurchase.totalAmount?.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Notes */}
                {selectedPurchase.notes && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Notes</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedPurchase.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CafeExpenses;
