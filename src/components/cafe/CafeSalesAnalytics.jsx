import React, { useState, useEffect } from 'react';
import { TrendingUp, Award, Package, Calendar, DollarSign, ShoppingCart, AlertTriangle, TrendingDown, LineChart } from 'lucide-react';
import { getOrders, getMenuItems, getInventoryDepletionRate, getDishPerformance, getDishTrend, getInventoryTrend, getInventory } from '../../services/cafeService';

const CafeSalesAnalytics = ({ showToast }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
  const [analytics, setAnalytics] = useState(null);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [depletionData, setDepletionData] = useState([]);
  const [dishPerformance, setDishPerformance] = useState(null);
  const [selectedDish, setSelectedDish] = useState('');
  const [dishTrendData, setDishTrendData] = useState([]);
  const [selectedInventory, setSelectedInventory] = useState('');
  const [inventoryTrendData, setInventoryTrendData] = useState([]);

  useEffect(() => {
    calculateAnalytics();
    loadDepletionData();
    loadDishPerformance();
  }, [selectedPeriod, customStartDate, customEndDate]);

  const loadDepletionData = async () => {
    const data = await getInventoryDepletionRate(7);
    setDepletionData(data);
  };

  const loadDishPerformance = async () => {
    const dateRange = getDateRange();
    if (dateRange) {
      const performance = await getDishPerformance(dateRange.startDate, dateRange.endDate);
      setDishPerformance(performance);
    }
  };

  const handleDishSelect = async (dishName) => {
    setSelectedDish(dishName);
    if (dishName) {
      const trendData = await getDishTrend(dishName, 30);
      setDishTrendData(trendData);
    } else {
      setDishTrendData([]);
    }
  };

  const handleInventorySelect = async (materialName) => {
    setSelectedInventory(materialName);
    if (materialName) {
      const trendData = await getInventoryTrend(materialName, 30);
      setInventoryTrendData(trendData);
    } else {
      setInventoryTrendData([]);
    }
  };

  const getMaxValue = (data, key) => {
    return Math.max(...data.map(d => d[key]), 1);
  };

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

  const calculateAnalytics = async () => {
    const dateRange = getDateRange();
    if (!dateRange) return;

    const { startDate, endDate } = dateRange;
    const orders = await getOrders();
    const menuItems = await getMenuItems();

    // Filter orders by date range
    const filteredOrders = orders.filter(o => {
      const date = new Date(o.createdAt);
      return date >= startDate && date <= endDate;
    });

    // Calculate item sales
    const itemSales = {};
    let totalRevenue = 0;
    let totalOrders = filteredOrders.length;

    filteredOrders.forEach(order => {
      totalRevenue += order.totalAmount || 0;
      
      order.items?.forEach(item => {
        if (!itemSales[item.name]) {
          itemSales[item.name] = {
            name: item.name,
            quantity: 0,
            revenue: 0,
            orders: 0,
            price: item.price,
          };
        }
        itemSales[item.name].quantity += item.quantity;
        itemSales[item.name].revenue += item.price * item.quantity;
        itemSales[item.name].orders += 1;
      });
    });

    // Convert to array and sort
    const itemsArray = Object.values(itemSales);
    const bestSellers = [...itemsArray].sort((a, b) => b.quantity - a.quantity);
    const topRevenue = [...itemsArray].sort((a, b) => b.revenue - a.revenue);
    const slowMoving = [...itemsArray].sort((a, b) => a.quantity - b.quantity);

    // Calculate daily trends
    const dailySales = {};
    filteredOrders.forEach(order => {
      const date = new Date(order.createdAt).toLocaleDateString();
      if (!dailySales[date]) {
        dailySales[date] = { orders: 0, revenue: 0 };
      }
      dailySales[date].orders += 1;
      dailySales[date].revenue += order.totalAmount || 0;
    });

    // Average order value
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Items never sold
    const soldItemNames = new Set(itemsArray.map(i => i.name));
    const neverSold = menuItems.filter(item => !soldItemNames.has(item.name));

    setAnalytics({
      totalRevenue,
      totalOrders,
      avgOrderValue,
      bestSellers: bestSellers.slice(0, 10),
      topRevenue: topRevenue.slice(0, 10),
      slowMoving: slowMoving.slice(0, 5),
      neverSold,
      dailySales,
      totalItems: itemsArray.length,
      startDate,
      endDate,
    });
  };

  const getPeriodLabel = () => {
    if (!analytics) return '';
    
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    const start = analytics.startDate.toLocaleDateString('en-US', options);
    const end = analytics.endDate.toLocaleDateString('en-US', options);
    
    return `${start} - ${end}`;
  };

  if (!analytics) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Sales Analytics
          </h2>
          <p className="text-gray-600 font-semibold mt-1">{getPeriodLabel()}</p>
        </div>
        
        {/* Period Selector */}
        <div className="flex items-center gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-semibold"
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
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
          <div className="relative p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-green-500 rounded-xl shadow-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm font-semibold text-gray-600">Total Revenue</p>
            </div>
            <p className="text-3xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              ₹{analytics.totalRevenue.toLocaleString()}
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
        </div>

        {/* Total Orders */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
          <div className="relative p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm font-semibold text-gray-600">Total Orders</p>
            </div>
            <p className="text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {analytics.totalOrders}
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
        </div>

        {/* Avg Order Value */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
          <div className="relative p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-purple-500 rounded-xl shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm font-semibold text-gray-600">Avg Order Value</p>
            </div>
            <p className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              ₹{Math.round(analytics.avgOrderValue)}
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
        </div>

        {/* Items Sold */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
          <div className="relative p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-orange-500 rounded-xl shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm font-semibold text-gray-600">Items Sold</p>
            </div>
            <p className="text-3xl font-black bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              {analytics.totalItems}
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
        </div>
      </div>

      {/* Best Sellers */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-bold text-gray-900">Best Sellers (By Quantity)</h3>
          </div>
        </div>
        
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-16">Rank</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Item Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-32">Qty Sold</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-32">Revenue</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-32">Orders</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-32">Avg Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {analytics.bestSellers.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  No sales data available for this period
                </td>
              </tr>
            ) : (
              analytics.bestSellers.map((item, index) => (
                <tr key={item.name} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-white ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                      index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500' :
                      index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                      'bg-gradient-to-r from-blue-400 to-blue-600'
                    }`}>
                      {index + 1}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-900">{item.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      {item.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-gray-900">₹{item.revenue.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-600">{item.orders}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-600">₹{item.price}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Top Revenue Generators */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-bold text-gray-900">Top Revenue Generators</h3>
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-3">
            {analytics.topRevenue.slice(0, 5).map((item, index) => {
              const percentage = (item.revenue / analytics.totalRevenue) * 100;
              return (
                <div key={item.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">{item.name}</span>
                    <div className="text-right">
                      <span className="text-lg font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        ₹{item.revenue.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">({percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                  <div className="bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Slow Moving & Never Sold */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Slow Moving */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Slow Moving Items</h3>
            <p className="text-sm text-gray-600">Consider removing or promoting</p>
          </div>
          
          <div className="p-6">
            {analytics.slowMoving.length === 0 ? (
              <p className="text-gray-500 text-center py-4">All items selling well!</p>
            ) : (
              <div className="space-y-3">
                {analytics.slowMoving.map((item) => (
                  <div key={item.name} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <span className="font-semibold text-gray-900">{item.name}</span>
                    <div className="text-right">
                      <span className="text-sm text-orange-600 font-bold">Only {item.quantity} sold</span>
                      <p className="text-xs text-gray-500">₹{item.revenue}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Never Sold */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-red-50 to-pink-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Never Sold</h3>
            <p className="text-sm text-gray-600">Items with zero sales</p>
          </div>
          
          <div className="p-6">
            {analytics.neverSold.length === 0 ? (
              <p className="text-green-600 text-center py-4 font-semibold">All items have been sold! 🎉</p>
            ) : (
              <div className="space-y-2">
                {analytics.neverSold.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <span className="font-semibold text-gray-900">{item.name}</span>
                    <span className="text-sm text-red-600 font-bold">₹{item.price}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inventory Depletion Rate */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-red-50 to-orange-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="text-lg font-bold text-gray-900">Inventory Depletion Rate</h3>
              <p className="text-sm text-gray-600">Which items are emptying fast (Last 7 days)</p>
            </div>
          </div>
        </div>
        
        {depletionData.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-lg">No usage data available</p>
            <p className="text-sm mt-2">Create orders to track inventory depletion</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Material</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-32">Current Stock</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-32">Daily Usage</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-32">Days Left</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-24">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {depletionData.map((item) => (
                <tr key={item.name} className={`hover:bg-gray-50 ${
                  item.status === 'critical' ? 'bg-red-50' :
                  item.status === 'warning' ? 'bg-yellow-50' : ''
                }`}>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-900">{item.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-900">{item.currentStock} {item.unit}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-orange-600">{item.dailyUsage} {item.unit}/day</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xl font-black ${
                      item.status === 'critical' ? 'text-red-600' :
                      item.status === 'warning' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {item.daysUntilEmpty === Infinity ? '∞' : item.daysUntilEmpty} days
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      item.status === 'critical' ? 'bg-red-100 text-red-700' :
                      item.status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {item.status === 'critical' ? '🚨 Critical' :
                       item.status === 'warning' ? '⚠️ Low' :
                       '✅ OK'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Dish Performance */}
      {dishPerformance && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="text-lg font-bold text-gray-900">Dish Performance Metrics</h3>
                <p className="text-sm text-gray-600">How each dish is performing</p>
              </div>
            </div>
          </div>
          
          {dishPerformance.dishes.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-lg">No dish data available</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Dish Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-24">Qty Sold</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-32">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-24">% Share</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-24">Orders</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-24">Avg/Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {dishPerformance.dishes.map((dish, index) => (
                  <tr key={dish.name} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {index < 3 && (
                          <span className="text-xl">
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                          </span>
                        )}
                        <span className="font-semibold text-gray-900">{dish.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-lg font-black text-blue-600">{dish.quantitySold}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900">₹{dish.revenue.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <span className="text-sm font-bold text-blue-600">{dish.revenueShare}%</span>
                        <div className="bg-gray-200 rounded-full h-2 w-16">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                            style={{ width: `${Math.min(parseFloat(dish.revenueShare), 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600">{dish.orders}</span>
                      <p className="text-xs text-gray-500">{dish.ordersPercentage}%</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600">{dish.avgQuantityPerOrder}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Dish Trend Graph */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <LineChart className="w-6 h-6 text-green-600" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900">Dish Sales Trend (Last 30 Days)</h3>
              <p className="text-sm text-gray-600">Select a dish to see its sales pattern</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Dish</label>
            <select
              value={selectedDish}
              onChange={(e) => handleDishSelect(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-semibold"
            >
              <option value="">-- Choose a dish --</option>
              {analytics && analytics.bestSellers.map(dish => (
                <option key={dish.name} value={dish.name}>{dish.name}</option>
              ))}
            </select>
          </div>
          
          {selectedDish && dishTrendData.length > 0 && (
            <div>
              <div className="mb-4 grid grid-cols-3 gap-4">
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600">Total Sold</p>
                  <p className="text-2xl font-black text-green-600">
                    {dishTrendData.reduce((sum, d) => sum + d.quantity, 0)}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-black text-blue-600">
                    ₹{dishTrendData.reduce((sum, d) => sum + d.revenue, 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600">Avg/Day</p>
                  <p className="text-2xl font-black text-purple-600">
                    {(dishTrendData.reduce((sum, d) => sum + d.quantity, 0) / 30).toFixed(1)}
                  </p>
                </div>
              </div>
              
              <div className="relative h-64 bg-gray-50 rounded-lg p-4">
                <div className="absolute inset-0 p-4">
                  <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
                    {/* Grid lines */}
                    <line x1="0" y1="0" x2="800" y2="0" stroke="#e5e7eb" strokeWidth="1" />
                    <line x1="0" y1="50" x2="800" y2="50" stroke="#e5e7eb" strokeWidth="1" />
                    <line x1="0" y1="100" x2="800" y2="100" stroke="#e5e7eb" strokeWidth="1" />
                    <line x1="0" y1="150" x2="800" y2="150" stroke="#e5e7eb" strokeWidth="1" />
                    <line x1="0" y1="200" x2="800" y2="200" stroke="#e5e7eb" strokeWidth="1" />
                    
                    {/* Line graph */}
                    <polyline
                      points={dishTrendData.map((d, i) => {
                        const x = (i / (dishTrendData.length - 1)) * 800;
                        const maxQty = getMaxValue(dishTrendData, 'quantity');
                        const y = 200 - (d.quantity / maxQty) * 180;
                        return `${x},${y}`;
                      }).join(' ')}
                      fill="none"
                      stroke="url(#greenGradient)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    
                    {/* Area fill */}
                    <polygon
                      points={`0,200 ${dishTrendData.map((d, i) => {
                        const x = (i / (dishTrendData.length - 1)) * 800;
                        const maxQty = getMaxValue(dishTrendData, 'quantity');
                        const y = 200 - (d.quantity / maxQty) * 180;
                        return `${x},${y}`;
                      }).join(' ')} 800,200`}
                      fill="url(#greenGradientFill)"
                      opacity="0.2"
                    />
                    
                    {/* Data points */}
                    {dishTrendData.map((d, i) => {
                      const x = (i / (dishTrendData.length - 1)) * 800;
                      const maxQty = getMaxValue(dishTrendData, 'quantity');
                      const y = 200 - (d.quantity / maxQty) * 180;
                      return d.quantity > 0 ? (
                        <circle key={i} cx={x} cy={y} r="4" fill="#10b981" stroke="white" strokeWidth="2" />
                      ) : null;
                    })}
                    
                    <defs>
                      <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                      <linearGradient id="greenGradientFill" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#d1fae5" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
              
              <div className="mt-2 flex justify-between text-xs text-gray-500">
                <span>{dishTrendData[0]?.displayDate}</span>
                <span>30 Days Trend</span>
                <span>{dishTrendData[dishTrendData.length - 1]?.displayDate}</span>
              </div>
            </div>
          )}
          
          {selectedDish && dishTrendData.length === 0 && (
            <p className="text-center text-gray-500 py-8">No data available for this dish</p>
          )}
        </div>
      </div>

      {/* Inventory Trend Graph */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-50 to-red-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <LineChart className="w-6 h-6 text-orange-600" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900">Inventory Level Trend (Last 30 Days)</h3>
              <p className="text-sm text-gray-600">Select an item to see its stock pattern</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Inventory Item</label>
            <select
              value={selectedInventory}
              onChange={(e) => handleInventorySelect(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-semibold"
            >
              <option value="">-- Choose an item --</option>
              {depletionData.map(item => (
                <option key={item.name} value={item.name}>{item.name}</option>
              ))}
            </select>
          </div>
          
          {selectedInventory && inventoryTrendData.length > 0 && (
            <div>
              <div className="mb-4 grid grid-cols-3 gap-4">
                <div className="bg-orange-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600">Current Stock</p>
                  <p className="text-2xl font-black text-orange-600">
                    {inventoryTrendData[inventoryTrendData.length - 1]?.stock.toFixed(1)}
                  </p>
                </div>
                <div className="bg-red-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600">Total Used</p>
                  <p className="text-2xl font-black text-red-600">
                    {inventoryTrendData.reduce((sum, d) => sum + d.used, 0).toFixed(1)}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600">Total Purchased</p>
                  <p className="text-2xl font-black text-green-600">
                    {inventoryTrendData.reduce((sum, d) => sum + d.purchased, 0).toFixed(1)}
                  </p>
                </div>
              </div>
              
              <div className="relative h-64 bg-gray-50 rounded-lg p-4">
                <div className="absolute inset-0 p-4">
                  <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
                    {/* Grid lines */}
                    <line x1="0" y1="0" x2="800" y2="0" stroke="#e5e7eb" strokeWidth="1" />
                    <line x1="0" y1="50" x2="800" y2="50" stroke="#e5e7eb" strokeWidth="1" />
                    <line x1="0" y1="100" x2="800" y2="100" stroke="#e5e7eb" strokeWidth="1" />
                    <line x1="0" y1="150" x2="800" y2="150" stroke="#e5e7eb" strokeWidth="1" />
                    <line x1="0" y1="200" x2="800" y2="200" stroke="#e5e7eb" strokeWidth="1" />
                    
                    {/* Line graph */}
                    <polyline
                      points={inventoryTrendData.map((d, i) => {
                        const x = (i / (inventoryTrendData.length - 1)) * 800;
                        const maxStock = getMaxValue(inventoryTrendData, 'stock');
                        const y = 200 - (d.stock / maxStock) * 180;
                        return `${x},${y}`;
                      }).join(' ')}
                      fill="none"
                      stroke="url(#orangeGradient)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    
                    {/* Area fill */}
                    <polygon
                      points={`0,200 ${inventoryTrendData.map((d, i) => {
                        const x = (i / (inventoryTrendData.length - 1)) * 800;
                        const maxStock = getMaxValue(inventoryTrendData, 'stock');
                        const y = 200 - (d.stock / maxStock) * 180;
                        return `${x},${y}`;
                      }).join(' ')} 800,200`}
                      fill="url(#orangeGradientFill)"
                      opacity="0.2"
                    />
                    
                    {/* Data points */}
                    {inventoryTrendData.map((d, i) => {
                      const x = (i / (inventoryTrendData.length - 1)) * 800;
                      const maxStock = getMaxValue(inventoryTrendData, 'stock');
                      const y = 200 - (d.stock / maxStock) * 180;
                      return (
                        <circle key={i} cx={x} cy={y} r="4" fill="#f97316" stroke="white" strokeWidth="2" />
                      );
                    })}
                    
                    <defs>
                      <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f97316" />
                        <stop offset="100%" stopColor="#ea580c" />
                      </linearGradient>
                      <linearGradient id="orangeGradientFill" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#f97316" />
                        <stop offset="100%" stopColor="#fed7aa" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
              
              <div className="mt-2 flex justify-between text-xs text-gray-500">
                <span>{inventoryTrendData[0]?.displayDate}</span>
                <span>30 Days Trend</span>
                <span>{inventoryTrendData[inventoryTrendData.length - 1]?.displayDate}</span>
              </div>
            </div>
          )}
          
          {selectedInventory && inventoryTrendData.length === 0 && (
            <p className="text-center text-gray-500 py-8">No data available for this item</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CafeSalesAnalytics;
