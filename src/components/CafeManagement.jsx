import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { ShoppingBag, ShoppingCart, Package, DollarSign, BarChart3, Calendar, CheckCircle, TrendingUp, Wallet, TrendingDown, BarChart2, FileText, Settings, Menu, X, Calculator, ChefHat, Trash, Lightbulb, Users, CreditCard, Truck } from 'lucide-react';
import { getSettings } from '../services/cafeService';
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
import CafeSettings from './cafe/CafeSettings';
import CafeLogin from './cafe/CafeLogin';
import CafeCostAnalysis from './cafe/CafeCostAnalysis';
import CafeRecipes from './cafe/CafeRecipes';
import CafeWaste from './cafe/CafeWaste';
import CafeSuggestions from './cafe/CafeSuggestions';
import CafeCustomers from './cafe/CafeCustomers';
import CafeSubscriptions from './cafe/CafeSubscriptions';
import CafeDeliveryTracking from './cafe/CafeDeliveryTracking';
import CafeMenuBooklet from './cafe/CafeMenuBooklet';

const CafeManagement = () => {
  const location = useLocation();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [operationModes, setOperationModes] = useState({
    dineIn: true,
    pickup: true,
    delivery: true,
  });

  useEffect(() => {
    // Check if user is already authenticated
    const authStatus = sessionStorage.getItem('cafe_authenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      loadOperationModes();
    }
  }, []);

  const loadOperationModes = async () => {
    try {
      const settings = await getSettings();
      setOperationModes({
        dineIn: settings.operation_mode_dine_in !== false,
        pickup: settings.operation_mode_pickup !== false,
        delivery: settings.operation_mode_delivery !== false,
      });
    } catch (error) {
      console.error('Error loading operation modes:', error);
    }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem('cafe_authenticated', 'true');
  };

  const handleToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  if (!isAuthenticated) {
    return <CafeLogin onLogin={handleLogin} />;
  }

  const allNavItems = [
    { path: '/cafe/dashboard', label: 'Dashboard', icon: BarChart3, alwaysShow: true },
    { path: '/cafe/orders', label: 'Orders', icon: ShoppingCart, alwaysShow: true },
    { path: '/cafe/customers', label: 'Customers', icon: Users, requiresMode: ['dineIn', 'pickup', 'delivery'] },
    { path: '/cafe/subscriptions', label: 'Subscriptions', icon: Calendar, requiresMode: ['delivery'] },
    { path: '/cafe/delivery', label: 'Delivery', icon: Truck, requiresMode: ['delivery'] },
    { path: '/cafe/menu', label: 'Menu', icon: ShoppingBag, alwaysShow: true },
    { path: '/cafe/menu-booklet', label: 'Menu Booklet', icon: FileText, alwaysShow: true },
    { path: '/cafe/inventory', label: 'Inventory', icon: Package, alwaysShow: true },
    { path: '/cafe/purchases', label: 'Purchases', icon: DollarSign, alwaysShow: true },
    { path: '/cafe/expenses', label: 'Expenses', icon: Wallet, alwaysShow: true },
    { path: '/cafe/investments', label: 'Investments', icon: TrendingUp, alwaysShow: true },
    { path: '/cafe/profit-loss', label: 'P&L', icon: TrendingDown, alwaysShow: true },
    { path: '/cafe/recipes', label: 'Recipes', icon: ChefHat, alwaysShow: true },
    { path: '/cafe/waste', label: 'Waste Tracking', icon: Trash, alwaysShow: true },
    { path: '/cafe/cost-analysis', label: 'Cost Analysis', icon: Calculator, alwaysShow: true },
    { path: '/cafe/suggestions', label: 'Suggestions', icon: Lightbulb, alwaysShow: true },
    { path: '/cafe/analytics', label: 'Analytics', icon: BarChart2, alwaysShow: true },
    { path: '/cafe/reports', label: 'Reports', icon: FileText, alwaysShow: true },
    { path: '/cafe/settings', label: 'Settings', icon: Settings, alwaysShow: true },
  ];

  // Filter navigation items based on operation modes
  const navItems = allNavItems.filter(item => {
    if (item.alwaysShow) return true;
    if (!item.requiresMode) return true;
    
    // Check if any of the required modes is enabled
    return item.requiresMode.some(mode => operationModes[mode]);
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="no-print bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 border-b-4 border-purple-700 z-20 shadow-xl">
        <div className="px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition"
              >
                {sidebarOpen ? (
                  <X className="w-6 h-6 text-white" />
                ) : (
                  <Menu className="w-6 h-6 text-white" />
                )}
              </button>
              
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg shadow-lg">
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black text-white">Cafe Management</h1>
                <p className="text-xs text-purple-100 font-semibold hidden sm:block">AFTERBURN Cafe</p>
              </div>
            </div>
            
            <Link
              to="/"
              className="px-3 py-2 sm:px-4 bg-white/20 backdrop-blur-sm text-white rounded-lg text-xs sm:text-sm font-bold hover:bg-white/30 transition shadow-lg"
            >
              <span className="hidden sm:inline">← Back to Main</span>
              <span className="sm:hidden">← Back</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Sidebar + Content Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar Navigation */}
        <div className={`
          no-print
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-white border-r-2 border-gray-200 shadow-lg overflow-y-auto
          transform transition-transform duration-300 ease-in-out
          lg:transform-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <nav className="p-3 space-y-1 mt-16 lg:mt-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || 
                              (item.path === '/cafe/orders' && location.pathname === '/cafe');
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition font-semibold ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm sm:text-base">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main Content - Full Width */}
        <div className="flex-1 overflow-y-auto w-full">
          <div className="p-3 sm:p-4 lg:p-6 max-w-full">
            <Routes>
              <Route index element={<CafeOrders showToast={handleToast} />} />
              <Route path="/orders" element={<CafeOrders showToast={handleToast} />} />
              <Route path="/customers" element={<CafeCustomers showToast={handleToast} />} />
              <Route path="/subscriptions" element={<CafeSubscriptions showToast={handleToast} />} />
              <Route path="/delivery" element={<CafeDeliveryTracking showToast={handleToast} />} />
              <Route path="/menu" element={<CafeMenu showToast={handleToast} />} />
              <Route path="/menu-booklet" element={<CafeMenuBooklet showToast={handleToast} />} />
              <Route path="/inventory" element={<CafeInventory showToast={handleToast} />} />
              <Route path="/purchases" element={<CafePurchases showToast={handleToast} />} />
              <Route path="/expenses" element={<CafeExpenses showToast={handleToast} />} />
              <Route path="/investments" element={<CafeInvestments showToast={handleToast} />} />
              <Route path="/profit-loss" element={<CafeProfitLoss showToast={handleToast} />} />
              <Route path="/recipes" element={<CafeRecipes showToast={handleToast} />} />
              <Route path="/waste" element={<CafeWaste showToast={handleToast} />} />
              <Route path="/cost-analysis" element={<CafeCostAnalysis showToast={handleToast} />} />
              <Route path="/suggestions" element={<CafeSuggestions showToast={handleToast} />} />
              <Route path="/analytics" element={<CafeSalesAnalytics showToast={handleToast} />} />
              <Route path="/reports" element={<CafeReports showToast={handleToast} />} />
              <Route path="/subscription-orders" element={<CafeSubscriptionOrders showToast={handleToast} />} />
              <Route path="/dashboard" element={<CafeDashboard showToast={handleToast} />} />
              <Route path="/settings" element={<CafeSettings showToast={handleToast} />} />
            </Routes>
          </div>
        </div>
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
