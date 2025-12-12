import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Download, ArrowUp, ArrowDown } from 'lucide-react';
import { getOrders, getPurchases } from '../../services/cafeService';

const CafeProfitLoss = ({ showToast }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
  const [plData, setPlData] = useState(null);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  useEffect(() => {
    calculatePL();
  }, [selectedPeriod, customStartDate, customEndDate]);

  const getDateRange = () => {
    const now = new Date();
    let startDate, endDate;

    switch (selectedPeriod) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date(now.setHours(23, 59, 59, 999));
        break;
      case 'thisWeek':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        startDate = weekStart;
        endDate = new Date();
        break;
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date();
        break;
      case 'lastMonth':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          startDate = new Date(customStartDate);
          endDate = new Date(customEndDate);
        } else {
          return null;
        }
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date();
    }

    return { startDate, endDate };
  };

  const calculatePL = () => {
    const dateRange = getDateRange();
    if (!dateRange) return;

    const { startDate, endDate } = dateRange;

    // Get all data
    const orders = getOrders();
    const purchases = getPurchases();
    const expenses = JSON.parse(localStorage.getItem('cafe_expenses') || '[]');
    const investments = JSON.parse(localStorage.getItem('cafe_investments') || '[]');

    // Filter by date range
    const filteredOrders = orders.filter(o => {
      const date = new Date(o.createdAt);
      return date >= startDate && date <= endDate;
    });

    const filteredPurchases = purchases.filter(p => {
      const date = new Date(p.date);
      return date >= startDate && date <= endDate;
    });

    const filteredExpenses = expenses.filter(e => {
      const date = new Date(e.date);
      return date >= startDate && date <= endDate;
    });

    const filteredInvestments = investments.filter(i => {
      const date = new Date(i.date);
      return date >= startDate && date <= endDate;
    });

    // Calculate totals
    const revenue = filteredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const purchasesTotal = filteredPurchases.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
    const expensesTotal = filteredExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const investmentsTotal = filteredInvestments.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);

    const totalExpenses = purchasesTotal + expensesTotal;
    const grossProfit = revenue - purchasesTotal;
    const netProfit = revenue - totalExpenses;
    const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

    // Payment method breakdown
    const paymentBreakdown = filteredOrders.reduce((acc, o) => {
      const method = o.paymentMethod || 'Cash';
      acc[method] = (acc[method] || 0) + (o.totalAmount || 0);
      return acc;
    }, {});

    // Expense category breakdown
    const expenseBreakdown = filteredExpenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + parseFloat(e.amount);
      return acc;
    }, {});

    setPlData({
      revenue,
      purchasesTotal,
      expensesTotal,
      totalExpenses,
      grossProfit,
      netProfit,
      profitMargin,
      investmentsTotal,
      orderCount: filteredOrders.length,
      paymentBreakdown,
      expenseBreakdown,
      startDate,
      endDate,
    });
  };

  const getPeriodLabel = () => {
    if (!plData) return '';
    
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    const start = plData.startDate.toLocaleDateString('en-US', options);
    const end = plData.endDate.toLocaleDateString('en-US', options);
    
    return `${start} - ${end}`;
  };

  if (!plData) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Profit & Loss Statement
          </h2>
          <p className="text-gray-600 font-semibold mt-1">{getPeriodLabel()}</p>
        </div>
        
        {/* Period Selector */}
        <div className="flex items-center gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-semibold"
          >
            <option value="today">Today</option>
            <option value="thisWeek">This Week</option>
            <option value="thisMonth">This Month</option>
            <option value="lastMonth">Last Month</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
      </div>

      {/* Custom Date Range */}
      {selectedPeriod === 'custom' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Revenue */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
          <div className="relative p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm font-semibold text-gray-600">Revenue</p>
            </div>
            <p className="text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              ₹{plData.revenue.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">{plData.orderCount} orders</p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
        </div>

        {/* Total Expenses */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 border-2 border-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
          <div className="relative p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-red-500 rounded-xl shadow-lg">
                <TrendingDown className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm font-semibold text-gray-600">Total Expenses</p>
            </div>
            <p className="text-3xl font-black bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              ₹{plData.totalExpenses.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Purchases: ₹{plData.purchasesTotal.toLocaleString()} | 
              Other: ₹{plData.expensesTotal.toLocaleString()}
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
        </div>

        {/* Net Profit */}
        <div className={`relative overflow-hidden rounded-2xl ${
          plData.netProfit >= 0 
            ? 'bg-gradient-to-br from-green-50 to-emerald-50' 
            : 'bg-gradient-to-br from-red-50 to-pink-50'
        } border-2 border-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group`}>
          <div className="relative p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-3 ${plData.netProfit >= 0 ? 'bg-green-500' : 'bg-red-500'} rounded-xl shadow-lg`}>
                {plData.netProfit >= 0 ? (
                  <TrendingUp className="w-6 h-6 text-white" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-white" />
                )}
              </div>
              <p className="text-sm font-semibold text-gray-600">Net Profit</p>
            </div>
            <p className={`text-3xl font-black ${
              plData.netProfit >= 0 
                ? 'bg-gradient-to-r from-green-600 to-emerald-600' 
                : 'bg-gradient-to-r from-red-600 to-pink-600'
            } bg-clip-text text-transparent`}>
              ₹{Math.abs(plData.netProfit).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {plData.netProfit >= 0 ? 'Profit' : 'Loss'}
            </p>
          </div>
          <div className={`absolute bottom-0 left-0 right-0 h-1 ${
            plData.netProfit >= 0 
              ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
              : 'bg-gradient-to-r from-red-500 to-pink-600'
          } transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}></div>
        </div>

        {/* Profit Margin */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
          <div className="relative p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-purple-500 rounded-xl shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm font-semibold text-gray-600">Profit Margin</p>
            </div>
            <p className="text-3xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              {plData.profitMargin.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">Net margin</p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
        </div>
      </div>

      {/* Detailed P&L Statement */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Detailed Statement</h3>
        </div>
        
        <div className="p-6 space-y-4">
          {/* Revenue Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 border-b-2 border-gray-200">
              <span className="text-lg font-bold text-gray-900">REVENUE</span>
              <span className="text-xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                ₹{plData.revenue.toLocaleString()}
              </span>
            </div>
            
            {/* Payment Method Breakdown */}
            {Object.keys(plData.paymentBreakdown).length > 0 && (
              <div className="pl-4 space-y-1">
                {Object.entries(plData.paymentBreakdown).map(([method, amount]) => (
                  <div key={method} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">• {method}</span>
                    <span className="font-semibold text-gray-700">₹{amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Expenses Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 border-b-2 border-gray-200">
              <span className="text-lg font-bold text-gray-900">EXPENSES</span>
              <span className="text-xl font-black bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                ₹{plData.totalExpenses.toLocaleString()}
              </span>
            </div>
            
            {/* Purchases */}
            <div className="pl-4 flex items-center justify-between">
              <span className="text-gray-700 font-semibold">Raw Material Purchases</span>
              <span className="font-bold text-gray-900">₹{plData.purchasesTotal.toLocaleString()}</span>
            </div>
            
            {/* Other Expenses */}
            {Object.keys(plData.expenseBreakdown).length > 0 && (
              <>
                <div className="pl-4 pt-2">
                  <span className="text-gray-700 font-semibold">Other Expenses:</span>
                </div>
                <div className="pl-8 space-y-1">
                  {Object.entries(plData.expenseBreakdown).map(([category, amount]) => (
                    <div key={category} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">• {category}</span>
                      <span className="font-semibold text-gray-700">₹{amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="pl-4 flex items-center justify-between border-t pt-2">
                  <span className="text-gray-700 font-semibold">Total Other Expenses</span>
                  <span className="font-bold text-gray-900">₹{plData.expensesTotal.toLocaleString()}</span>
                </div>
              </>
            )}
          </div>

          {/* Gross Profit */}
          <div className="flex items-center justify-between py-3 border-y-2 border-gray-300 bg-blue-50">
            <span className="text-lg font-bold text-gray-900">GROSS PROFIT</span>
            <span className={`text-2xl font-black ${
              plData.grossProfit >= 0 
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600' 
                : 'bg-gradient-to-r from-red-600 to-orange-600'
            } bg-clip-text text-transparent`}>
              ₹{Math.abs(plData.grossProfit).toLocaleString()}
            </span>
          </div>

          {/* Net Profit */}
          <div className={`flex items-center justify-between py-4 border-2 rounded-lg ${
            plData.netProfit >= 0 
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
              : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
          }`}>
            <div>
              <span className="text-xl font-black text-gray-900">NET PROFIT/LOSS</span>
              <p className="text-sm text-gray-600 mt-1">
                {plData.netProfit >= 0 ? '✅ Profitable' : '⚠️ Loss'}
              </p>
            </div>
            <div className="text-right">
              <span className={`text-3xl font-black ${
                plData.netProfit >= 0 
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600' 
                  : 'bg-gradient-to-r from-red-600 to-pink-600'
              } bg-clip-text text-transparent`}>
                {plData.netProfit >= 0 ? '+' : '-'}₹{Math.abs(plData.netProfit).toLocaleString()}
              </span>
              <p className="text-sm text-gray-600 mt-1">
                Margin: {plData.profitMargin.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Investment Info */}
          {plData.investmentsTotal > 0 && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Capital Investment (This Period)</p>
                  <p className="text-xs text-gray-600 mt-1">Not included in P&L calculation</p>
                </div>
                <span className="text-xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  ₹{plData.investmentsTotal.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ROI Calculation (if investments exist) */}
      {plData.investmentsTotal > 0 && plData.netProfit > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Return on Investment (ROI)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Investment</p>
              <p className="text-2xl font-black text-gray-900">₹{plData.investmentsTotal.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Profit</p>
              <p className="text-2xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                ₹{plData.netProfit.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">ROI</p>
              <p className="text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {((plData.netProfit / plData.investmentsTotal) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CafeProfitLoss;
