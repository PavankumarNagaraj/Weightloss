import React, { useState, useEffect } from 'react';
import { Download, Upload, DollarSign, AlertCircle, Package, FileText } from 'lucide-react';
import { getCreditOrders, getInventoryValuation, getCashReconciliation, exportAllData, importAllData } from '../../services/cafeService';

const CafeReports = ({ showToast }) => {
  const [creditOrders, setCreditOrders] = useState(null);
  const [inventoryVal, setInventoryVal] = useState(null);
  const [cashRecon, setCashRecon] = useState(null);
  const [actualCash, setActualCash] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = () => {
    setCreditOrders(getCreditOrders());
    setInventoryVal(getInventoryValuation());
    setCashRecon(getCashReconciliation(new Date(selectedDate)));
  };

  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cafe-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data exported successfully!');
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (confirm('This will replace all current data. Are you sure?')) {
          const success = importAllData(data);
          if (success) {
            showToast('Data imported successfully!');
            loadData();
          } else {
            showToast('Error importing data');
          }
        }
      } catch (error) {
        showToast('Invalid file format');
      }
    };
    reader.readAsText(file);
  };

  const calculateVariance = () => {
    if (!actualCash || !cashRecon) return null;
    const variance = parseFloat(actualCash) - cashRecon.expectedCash;
    return variance;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
            Reports & Tools
          </h2>
          <p className="text-gray-600 font-semibold mt-1">Credit orders, inventory value, reconciliation & backup</p>
        </div>
        
        {/* Export/Import Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-bold hover:from-green-700 hover:to-emerald-700 transition shadow-lg"
          >
            <Download className="w-5 h-5" />
            Export Backup
          </button>
          <label className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-bold hover:from-blue-700 hover:to-cyan-700 transition shadow-lg cursor-pointer">
            <Upload className="w-5 h-5" />
            Import Data
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Credit Orders */}
      {creditOrders && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <h3 className="text-lg font-bold text-gray-900">Credit Orders (Pending Payments)</h3>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Pending</p>
                <p className="text-2xl font-black bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  ₹{creditOrders.totalPending.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          
          {creditOrders.count === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-lg font-semibold">No pending credit orders! 🎉</p>
              <p className="text-sm mt-2">All payments are up to date</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Order #</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-32">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-32">Pending</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-24">Days</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {creditOrders.orders.map((order) => (
                  <tr key={order.id} className={`hover:bg-gray-50 ${order.daysPending > 7 ? 'bg-red-50' : ''}`}>
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900">{order.orderNumber}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{order.customerName}</p>
                        {order.customerPhone && (
                          <p className="text-sm text-gray-500">{order.customerPhone}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900">₹{order.totalAmount}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xl font-black bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                        ₹{order.pendingAmount}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        order.daysPending > 7 ? 'bg-red-100 text-red-700' :
                        order.daysPending > 3 ? 'bg-orange-100 text-orange-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.daysPending}d
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Inventory Valuation */}
      {inventoryVal && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-6 h-6 text-purple-600" />
                <h3 className="text-lg font-bold text-gray-900">Inventory Valuation</h3>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  ₹{inventoryVal.totalValue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {inventoryVal.itemsWithValue.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No inventory items with price data</p>
            ) : (
              <div className="space-y-3">
                {inventoryVal.itemsWithValue.slice(0, 10).map((item) => (
                  <div key={item.name} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        {item.stock} {item.unit} × ₹{item.pricePerUnit.toFixed(2)}/{item.unit}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        ₹{item.value.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {inventoryVal.itemsWithoutPrice.length > 0 && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm font-semibold text-yellow-800 mb-2">
                  ⚠️ Items without price data ({inventoryVal.itemsWithoutPrice.length}):
                </p>
                <p className="text-xs text-yellow-700">
                  {inventoryVal.itemsWithoutPrice.join(', ')}
                </p>
                <p className="text-xs text-yellow-600 mt-2">
                  Purchase these items to track their value
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cash Reconciliation */}
      {cashRecon && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-bold text-gray-900">Cash Reconciliation</h3>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Expected Cash</p>
                <p className="text-2xl font-black text-blue-600">₹{cashRecon.expectedCash.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">{cashRecon.cashOrders} cash orders</p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <label className="block text-sm text-gray-600 mb-2">Actual Cash in Drawer</label>
                <input
                  type="number"
                  value={actualCash}
                  onChange={(e) => setActualCash(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 font-bold text-xl"
                />
              </div>
              
              {actualCash && (
                <div className={`rounded-lg p-4 ${
                  calculateVariance() === 0 ? 'bg-green-50' :
                  calculateVariance() > 0 ? 'bg-blue-50' :
                  'bg-red-50'
                }`}>
                  <p className="text-sm text-gray-600 mb-1">Variance</p>
                  <p className={`text-2xl font-black ${
                    calculateVariance() === 0 ? 'text-green-600' :
                    calculateVariance() > 0 ? 'text-blue-600' :
                    'text-red-600'
                  }`}>
                    {calculateVariance() >= 0 ? '+' : ''}₹{calculateVariance()}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {calculateVariance() === 0 ? '✅ Perfect match!' :
                     calculateVariance() > 0 ? '💰 Extra cash' :
                     '⚠️ Cash short'}
                  </p>
                </div>
              )}
            </div>
            
            {actualCash && Math.abs(calculateVariance()) > 0 && (
              <div className={`p-4 rounded-lg ${
                calculateVariance() > 0 ? 'bg-blue-100 border border-blue-200' :
                'bg-red-100 border border-red-200'
              }`}>
                <p className="text-sm font-semibold">
                  {calculateVariance() > 0 ? 
                    '💡 You have extra cash. Possible reasons: Received payment for old credit order, or counting error.' :
                    '⚠️ Cash is short. Possible reasons: Theft, wrong change given, or counting error.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Backup Info */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <FileText className="w-6 h-6 text-cyan-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Data Backup & Recovery</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p>• <strong>Export Backup:</strong> Download all your data as JSON file</p>
              <p>• <strong>Import Data:</strong> Restore from a previous backup</p>
              <p>• <strong>Recommendation:</strong> Export backup daily or weekly</p>
              <p>• <strong>Storage:</strong> Keep backups in Google Drive, Dropbox, or email to yourself</p>
            </div>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm font-semibold text-yellow-800">
                ⚠️ Important: All data is stored in browser. Clearing browser data will delete everything!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CafeReports;
