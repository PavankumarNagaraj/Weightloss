import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { ShoppingBag, ShoppingCart, Package, DollarSign, BarChart3, Calendar, CheckCircle } from 'lucide-react';
import CafeOrders from './cafe/CafeOrders';
import CafeMenu from './cafe/CafeMenu';
import CafeInventory from './cafe/CafeInventory';
import CafePurchases from './cafe/CafePurchases';
import CafeDashboard from './cafe/CafeDashboard';
import CafeSubscriptionOrders from './cafe/CafeSubscriptionOrders';

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
    { path: '/cafe/subscription-orders', label: 'Subscription Orders', icon: Calendar },
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
      <div className="bg-white border-b-2 border-gray-200 shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <nav className="flex gap-1 sm:gap-2 overflow-x-auto scrollbar-hide">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || 
                              (item.path === '/cafe/orders' && location.pathname === '/cafe') ||
                              (item.path === '/cafe/dashboard' && location.pathname === '/cafe');
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-3 sm:py-4 border-b-4 transition whitespace-nowrap text-xs sm:text-base font-bold ${
                    isActive
                      ? 'border-purple-600 text-purple-600 bg-purple-50'
                      : 'border-transparent text-gray-600 hover:text-purple-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">{item.label}</span>
                  <span className="sm:hidden">{item.label.split(' ')[0]}</span>
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
