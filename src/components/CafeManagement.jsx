import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { ShoppingBag, ShoppingCart, Package, DollarSign, BarChart3, Calendar, CheckCircle, TrendingUp, Wallet, TrendingDown, BarChart2, FileText } from 'lucide-react';
import CafeOrders from './cafe/CafeOrders';
import CafeMenu from './cafe/CafeMenu';
import CafeInventory from './cafe/CafeInventory';
import CafePurchases from './cafe/CafePurchases';
import CafeDashboard from './cafe/CafeDashboard';
import CafeSubscriptionOrders from './cafe/CafeSubscriptionOrders';
import CafeInvestments from './cafe/CafeInvestments';
import CafeExpenses from './cafe/CafeExpenses';
import CafeProfitLoss from './cafe/CafeProfitLoss';
import CafeSalesAnalytics from './cafe/CafeSalesAnalytics';
import CafeReports from './cafe/CafeReports';

const CafeManagement = () => {
  const location = useLocation();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const navItems = [
    { path: '/cafe/orders', label: 'Orders', icon: ShoppingCart },
    { path: '/cafe/menu', label: 'Menu', icon: ShoppingBag },
    { path: '/cafe/inventory', label: 'Inventory', icon: Package },
    { path: '/cafe/purchases', label: 'Purchases', icon: DollarSign },
    { path: '/cafe/expenses', label: 'Expenses', icon: Wallet },
    { path: '/cafe/investments', label: 'Investments', icon: TrendingUp },
    { path: '/cafe/profit-loss', label: 'P&L', icon: TrendingDown },
    { path: '/cafe/analytics', label: 'Analytics', icon: BarChart2 },
    { path: '/cafe/reports', label: 'Reports', icon: FileText },
    { path: '/cafe/subscription-orders', label: 'Subscriptions', icon: Calendar },
    { path: '/cafe/dashboard', label: 'Dashboard', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 border-b-4 border-purple-700 sticky top-0 z-10 shadow-xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-lg">
                <ShoppingBag className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-black text-white">Cafe Management</h1>
                <p className="text-xs sm:text-sm text-purple-100 font-semibold hidden sm:block">AFTERBURN Cafe</p>
              </div>
            </div>
            
            <Link
              to="/"
              className="px-3 py-2 sm:px-6 sm:py-3 bg-white/20 backdrop-blur-sm text-white rounded-lg sm:rounded-xl text-sm sm:text-base font-bold hover:bg-white/30 transition shadow-lg"
            >
              <span className="hidden sm:inline">← Back to Main</span>
              <span className="sm:hidden">← Back</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b-2 border-gray-200 shadow-md sticky top-16 sm:top-20 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <nav className="flex gap-1 overflow-x-auto pb-px" style={{ scrollbarWidth: 'thin' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || 
                              (item.path === '/cafe/orders' && location.pathname === '/cafe') ||
                              (item.path === '/cafe/dashboard' && location.pathname === '/cafe');
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-3 border-b-4 transition whitespace-nowrap text-sm font-bold flex-shrink-0 ${
                    isActive
                      ? 'border-purple-600 text-purple-600 bg-purple-50'
                      : 'border-transparent text-gray-600 hover:text-purple-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Routes>
          <Route index element={<CafeDashboard showToast={handleToast} />} />
          <Route path="/orders" element={<CafeOrders showToast={handleToast} />} />
          <Route path="/menu" element={<CafeMenu showToast={handleToast} />} />
          <Route path="/inventory" element={<CafeInventory showToast={handleToast} />} />
          <Route path="/purchases" element={<CafePurchases showToast={handleToast} />} />
          <Route path="/expenses" element={<CafeExpenses showToast={handleToast} />} />
          <Route path="/investments" element={<CafeInvestments showToast={handleToast} />} />
          <Route path="/profit-loss" element={<CafeProfitLoss showToast={handleToast} />} />
          <Route path="/analytics" element={<CafeSalesAnalytics showToast={handleToast} />} />
          <Route path="/reports" element={<CafeReports showToast={handleToast} />} />
          <Route path="/subscription-orders" element={<CafeSubscriptionOrders showToast={handleToast} />} />
          <Route path="/dashboard" element={<CafeDashboard showToast={handleToast} />} />
        </Routes>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-up z-50">
          <CheckCircle className="w-5 h-5" />
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default CafeManagement;
