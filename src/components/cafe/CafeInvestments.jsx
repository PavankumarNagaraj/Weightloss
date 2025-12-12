import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, Users, X, Trash2, Edit } from 'lucide-react';

const CafeInvestments = ({ showToast }) => {
  const [investments, setInvestments] = useState([]);
  const [stats, setStats] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState(null);
  const [formData, setFormData] = useState({
    partnerName: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    loadInvestments();
  }, []);

  const loadInvestments = () => {
    const stored = localStorage.getItem('cafe_investments');
    const allInvestments = stored ? JSON.parse(stored) : [];
    setInvestments(allInvestments);
    calculateStats(allInvestments);
  };

  const calculateStats = (allInvestments) => {
    const now = new Date();
    const thisMonth = allInvestments.filter(inv => {
      const invDate = new Date(inv.date);
      return invDate.getMonth() === now.getMonth() && invDate.getFullYear() === now.getFullYear();
    });

    // Group by partner
    const byPartner = {};
    allInvestments.forEach(inv => {
      if (!byPartner[inv.partnerName]) {
        byPartner[inv.partnerName] = 0;
      }
      byPartner[inv.partnerName] += parseFloat(inv.amount);
    });

    setStats({
      totalInvestment: allInvestments.reduce((sum, inv) => sum + parseFloat(inv.amount), 0),
      thisMonthInvestment: thisMonth.reduce((sum, inv) => sum + parseFloat(inv.amount), 0),
      totalPartners: Object.keys(byPartner).length,
      byPartner: byPartner,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const stored = localStorage.getItem('cafe_investments');
    const allInvestments = stored ? JSON.parse(stored) : [];

    if (editingInvestment) {
      // Update existing
      const updated = allInvestments.map(inv => 
        inv.id === editingInvestment.id ? { ...formData, id: inv.id } : inv
      );
      localStorage.setItem('cafe_investments', JSON.stringify(updated));
      showToast('Investment updated successfully');
    } else {
      // Add new
      const newInvestment = {
        ...formData,
        id: Date.now().toString(),
        amount: parseFloat(formData.amount),
      };
      allInvestments.push(newInvestment);
      localStorage.setItem('cafe_investments', JSON.stringify(allInvestments));
      showToast('Investment recorded successfully');
    }

    resetForm();
    loadInvestments();
  };

  const handleDelete = (id) => {
    if (confirm('Delete this investment record?')) {
      const stored = localStorage.getItem('cafe_investments');
      const allInvestments = stored ? JSON.parse(stored) : [];
      const updated = allInvestments.filter(inv => inv.id !== id);
      localStorage.setItem('cafe_investments', JSON.stringify(updated));
      showToast('Investment deleted');
      loadInvestments();
    }
  };

  const handleEdit = (investment) => {
    setEditingInvestment(investment);
    setFormData({
      partnerName: investment.partnerName,
      amount: investment.amount,
      date: investment.date,
      notes: investment.notes || '',
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      partnerName: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setEditingInvestment(null);
    setShowModal(false);
  };

  // Group investments by month
  const groupedInvestments = investments.reduce((groups, inv) => {
    const date = new Date(inv.date);
    const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!groups[monthYear]) {
      groups[monthYear] = [];
    }
    groups[monthYear].push(inv);
    return groups;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Partner Investments
          </h2>
          <p className="text-gray-600 font-semibold mt-1">Track capital investments from partners</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-cyan-700 transition shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          Add Investment
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Investment */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"></div>
            </div>
            <div className="relative p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-semibold text-gray-600">Total Investment</p>
              </div>
              <p className="text-4xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                ₹{stats.totalInvestment.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">All Time</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
          </div>

          {/* This Month */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"></div>
            </div>
            <div className="relative p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-green-500 rounded-xl shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-semibold text-gray-600">This Month</p>
              </div>
              <p className="text-4xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                ₹{stats.thisMonthInvestment.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">Current Month</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
          </div>

          {/* Partners */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"></div>
            </div>
            <div className="relative p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-purple-500 rounded-xl shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-semibold text-gray-600">Active Partners</p>
              </div>
              <p className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {stats.totalPartners}
              </p>
              <p className="text-xs text-gray-500 mt-1">Total Partners</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
          </div>
        </div>
      )}

      {/* Partner Summary */}
      {stats && stats.totalPartners > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Investment by Partner</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(stats.byPartner).map(([partner, amount]) => (
              <div key={partner} className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border-2 border-blue-100">
                <p className="text-sm font-semibold text-gray-600">{partner}</p>
                <p className="text-2xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  ₹{amount.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Investments Table - Grouped by Month */}
      <div className="space-y-6">
        {Object.keys(groupedInvestments).length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-semibold">No investments recorded yet</p>
            <p className="text-gray-400 text-sm mt-2">Start tracking partner investments</p>
          </div>
        ) : (
          Object.entries(groupedInvestments).reverse().map(([monthYear, monthInvestments]) => {
            const monthTotal = monthInvestments.reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
            
            return (
              <div key={monthYear} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900">{monthYear}</h3>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Month Total</p>
                      <p className="text-2xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                        ₹{monthTotal.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Partner</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-32">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Notes</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-24">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {monthInvestments.map((investment) => (
                      <tr key={investment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900">
                            {new Date(investment.date).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-gray-900">{investment.partnerName}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                            ₹{parseFloat(investment.amount).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">{investment.notes || '-'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(investment)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(investment.id)}
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

      {/* Add/Edit Investment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">
                  {editingInvestment ? 'Edit' : 'Add'} Investment
                </h3>
                <button onClick={resetForm}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Partner Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.partnerName}
                      onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Partner 1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount (₹) <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="25000"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add any notes about this investment..."
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
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-bold hover:from-blue-700 hover:to-cyan-700 transition shadow-lg"
                  >
                    {editingInvestment ? 'Update' : 'Add'} Investment
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

export default CafeInvestments;
