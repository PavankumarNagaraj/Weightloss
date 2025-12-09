import React, { useState, useEffect } from 'react';
import {
  ShoppingCart, Package, DollarSign, TrendingUp, AlertTriangle,
  Users, Calendar, ArrowUp, ArrowDown, Clock
} from 'lucide-react';
import { getDashboardStats, getOrders, getLowStockItems } from '../../services/cafeService';

const CafeDashboard = ({ showToast }) => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStock, setLowStock] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const dashboardStats = getDashboardStats();
    setStats(dashboardStats);

    const orders = getOrders();
    setRecentOrders(orders.slice(-5).reverse());

    const lowStockItems = getLowStockItems();
    setLowStock(lowStockItems);
  };

  if (!stats) {
    return <div>Loading...</div>;
  }

  const statCards = [
    {
      title: "Today's Orders",
      value: stats.todayOrders,
      icon: ShoppingCart,
      gradient: 'from-blue-500 via-blue-600 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-50',
      iconBg: 'bg-blue-500',
      change: '+12%',
      trend: 'up',
    },
    {
      title: "Today's Revenue",
      value: `₹${stats.todayRevenue.toLocaleString()}`,
      icon: DollarSign,
      gradient: 'from-green-500 via-emerald-600 to-teal-600',
      bgGradient: 'from-green-50 to-emerald-50',
      iconBg: 'bg-green-500',
      change: '+8%',
      trend: 'up',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      gradient: 'from-purple-500 via-indigo-600 to-blue-600',
      bgGradient: 'from-purple-50 to-indigo-50',
      iconBg: 'bg-purple-500',
      change: 'All Time',
      trend: 'up',
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStockCount,
      icon: AlertTriangle,
      gradient: 'from-red-500 via-rose-600 to-pink-600',
      bgGradient: 'from-red-50 to-rose-50',
      iconBg: 'bg-red-500',
      change: stats.lowStockCount > 0 ? 'Action Needed' : 'All Good',
      trend: stats.lowStockCount > 0 ? 'up' : 'down',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid - Modern Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index} 
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.bgGradient} border-2 border-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group`}
            >
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"></div>
              </div>
              
              <div className="relative p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 ${stat.iconBg} rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                    stat.trend === 'up' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {stat.trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {stat.change}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2">{stat.title}</p>
                  <p className={`text-4xl font-black bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                    {stat.value}
                  </p>
                </div>
              </div>
              
              {/* Hover Effect Line */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}></div>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-6 hover:shadow-2xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Recent Orders</h3>
            </div>
            <span className="text-sm text-gray-500 font-medium">Last 5</span>
          </div>
          
          {recentOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                    <p className="text-sm text-gray-600">
                      {order.customerName || 'Walk-in Customer'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">₹{order.totalAmount}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'preparing' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-6 hover:shadow-2xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg animate-pulse">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Low Stock Alerts</h3>
            </div>
            {lowStock.length > 0 && (
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                {lowStock.length}
              </span>
            )}
          </div>
          
          {lowStock.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Package className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-gray-600 font-semibold">All Stock Levels Good!</p>
              <p className="text-sm text-gray-500">No items below minimum stock</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lowStock.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">{item.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Current: <span className="font-bold text-red-600">{item.currentStock}</span></p>
                    <p className="text-xs text-gray-500">Min: {item.minStock} {item.unit}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats - Modern Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 shadow-2xl p-8 text-white">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-black/10">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        </div>
        
        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-black">Overall Statistics</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <p className="text-white/80 text-sm font-semibold mb-2">Total Orders</p>
              <p className="text-4xl font-black">{stats.totalOrders}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <p className="text-white/80 text-sm font-semibold mb-2">Inventory Items</p>
              <p className="text-4xl font-black">{stats.totalInventoryItems}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <p className="text-white/80 text-sm font-semibold mb-2">Total Purchases</p>
              <p className="text-4xl font-black">{stats.totalPurchases}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <p className="text-white/80 text-sm font-semibold mb-2">Revenue</p>
              <p className="text-4xl font-black">₹{stats.todayRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CafeDashboard;
