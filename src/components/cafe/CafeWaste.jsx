import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, TrendingDown, AlertCircle, PieChart } from 'lucide-react';
import { getWasteLogs, addWasteLog, deleteWasteLog, getWasteAnalytics, getInventory } from '../../services/cafeService';

const CafeWaste = ({ showToast }) => {
  const [wasteLogs, setWasteLogs] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [formData, setFormData] = useState({
    inventoryItemId: '',
    itemName: '',
    quantity: '',
    unit: '',
    costPerUnit: '',
    wasteReason: 'expired',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    recordedBy: '',
  });

  const wasteReasons = [
    { value: 'expired', label: '📅 Expired', color: 'red' },
    { value: 'damaged', label: '💔 Damaged', color: 'orange' },
    { value: 'spoiled', label: '🦠 Spoiled', color: 'purple' },
    { value: 'overproduction', label: '📈 Overproduction', color: 'blue' },
    { value: 'contaminated', label: '☣️ Contaminated', color: 'red' },
    { value: 'other', label: '❓ Other', color: 'gray' },
  ];

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const loadData = async () => {
    const [logs, inventoryData, analyticsData] = await Promise.all([
      getWasteLogs(),
      getInventory(),
      getWasteAnalytics(dateRange.start, dateRange.end),
    ]);
    setWasteLogs(logs);
    setInventory(inventoryData);
    setAnalytics(analyticsData);
  };

  const resetForm = () => {
    setFormData({
      inventoryItemId: '',
      itemName: '',
      quantity: '',
      unit: '',
      costPerUnit: '',
      wasteReason: 'expired',
      date: new Date().toISOString().split('T')[0],
      notes: '',
      recordedBy: '',
    });
  };

  const handleInventorySelect = (itemId) => {
    const item = inventory.find(inv => inv.id === itemId);
    if (item) {
      setFormData({
        ...formData,
        inventoryItemId: itemId,
        itemName: item.name,
        unit: item.unit,
        costPerUnit: item.pricePerUnit || 0,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.itemName || !formData.quantity) {
      showToast('⚠️ Please fill in required fields');
      return;
    }

    try {
      await addWasteLog(formData);
      showToast('✅ Waste log added successfully');
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error) {
      showToast('❌ Error adding waste log: ' + error.message);
    }
  };

  const handleDelete = async (wasteId) => {
    if (!window.confirm('Delete this waste log?')) return;

    try {
      await deleteWasteLog(wasteId);
      showToast('✅ Waste log deleted');
      loadData();
    } catch (error) {
      showToast('❌ Error deleting waste log: ' + error.message);
    }
  };

  const getReasonColor = (reason) => {
    const reasonObj = wasteReasons.find(r => r.value === reason);
    return reasonObj?.color || 'gray';
  };

  const getReasonLabel = (reason) => {
    const reasonObj = wasteReasons.find(r => r.value === reason);
    return reasonObj?.label || reason;
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
            Waste Management
          </h2>
          <p className="text-sm sm:text-base text-gray-600 font-semibold mt-1">
            Track and analyze daily waste
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl">
            <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-bold hover:from-red-700 hover:to-rose-700 transition shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Log Waste</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Calendar className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-semibold text-gray-700">Date Range:</span>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm"
          />
          <span className="text-gray-500">to</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm"
          />
        </div>
      </div>

      {/* Analytics Summary */}
      {analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-red-600" />
              <p className="text-xs sm:text-sm font-semibold text-gray-600">Total Waste Cost</p>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-red-600">₹{analytics.totalCost.toFixed(0)}</p>
            <p className="text-xs text-gray-500 mt-1">{analytics.totalLogs} entries</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <p className="text-xs sm:text-sm font-semibold text-gray-600">Avg Per Day</p>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-gray-900">
              ₹{(analytics.totalCost / 30).toFixed(0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <PieChart className="w-5 h-5 text-purple-600" />
              <p className="text-xs sm:text-sm font-semibold text-gray-600">Top Reason</p>
            </div>
            <p className="text-lg sm:text-xl font-black text-gray-900">
              {Object.keys(analytics.byReason).length > 0
                ? Object.entries(analytics.byReason).sort((a, b) => b[1].cost - a[1].cost)[0][0]
                : 'None'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Most common</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Trash2 className="w-5 h-5 text-gray-600" />
              <p className="text-xs sm:text-sm font-semibold text-gray-600">Total Quantity</p>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-gray-900">
              {analytics.totalQuantity.toFixed(1)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Units wasted</p>
          </div>
        </div>
      )}

      {/* Waste by Reason */}
      {analytics && Object.keys(analytics.byReason).length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-4 sm:p-6">
          <h3 className="text-lg font-black text-gray-900 mb-4">Waste by Reason</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(analytics.byReason)
              .sort((a, b) => b[1].cost - a[1].cost)
              .map(([reason, data]) => (
                <div key={reason} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">{getReasonLabel(reason)}</span>
                    <span className="text-xs text-gray-500">{data.count} entries</span>
                  </div>
                  <p className="text-2xl font-black text-gray-900">₹{data.cost.toFixed(0)}</p>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div
                      className={`bg-${getReasonColor(reason)}-500 h-2 rounded-full`}
                      style={{ width: `${(data.cost / analytics.totalCost) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Waste Logs Table */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-red-600 to-rose-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-bold">Date</th>
                <th className="px-4 py-3 text-left text-sm font-bold">Item</th>
                <th className="px-4 py-3 text-right text-sm font-bold">Quantity</th>
                <th className="px-4 py-3 text-right text-sm font-bold">Cost</th>
                <th className="px-4 py-3 text-left text-sm font-bold">Reason</th>
                <th className="px-4 py-3 text-center text-sm font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {wasteLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    No waste logs yet. Start tracking waste to reduce costs.
                  </td>
                </tr>
              ) : (
                wasteLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(log.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900">{log.item_name}</div>
                      {log.notes && (
                        <div className="text-xs text-gray-500">{log.notes}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      {log.quantity} {log.unit}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-red-600">
                      ₹{parseFloat(log.total_cost || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm">{getReasonLabel(log.waste_reason)}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleDelete(log.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Waste Log Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-2xl font-black text-gray-900">Log Waste</h3>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <Trash2 className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Inventory Item</label>
                  <select
                    value={formData.inventoryItemId}
                    onChange={(e) => handleInventorySelect(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 transition outline-none"
                  >
                    <option value="">Select from inventory (optional)</option>
                    {inventory.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.name} - ₹{item.pricePerUnit}/{item.unit}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Item Name *</label>
                  <input
                    type="text"
                    value={formData.itemName}
                    onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 transition outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 transition outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Quantity *</label>
                  <input
                    type="number"
                    step="0.001"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 transition outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Unit *</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 transition outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Cost Per Unit *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.costPerUnit}
                    onChange={(e) => setFormData({ ...formData, costPerUnit: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 transition outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Waste Reason *</label>
                  <select
                    value={formData.wasteReason}
                    onChange={(e) => setFormData({ ...formData, wasteReason: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 transition outline-none"
                    required
                  >
                    {wasteReasons.map(reason => (
                      <option key={reason.value} value={reason.value}>{reason.label}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows="2"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 transition outline-none"
                    placeholder="Additional details..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Recorded By</label>
                  <input
                    type="text"
                    value={formData.recordedBy}
                    onChange={(e) => setFormData({ ...formData, recordedBy: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 transition outline-none"
                    placeholder="Staff name"
                  />
                </div>

                <div className="flex items-end">
                  <div className="w-full p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                    <p className="text-sm font-semibold text-red-900">Total Cost:</p>
                    <p className="text-2xl font-black text-red-900">
                      ₹{((parseFloat(formData.quantity) || 0) * (parseFloat(formData.costPerUnit) || 0)).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-bold hover:from-red-700 hover:to-rose-700 transition shadow-lg"
                >
                  Log Waste
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CafeWaste;
