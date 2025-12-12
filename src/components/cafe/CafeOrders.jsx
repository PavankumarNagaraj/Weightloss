import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, ShoppingCart, Minus, X, Circle, Edit2 } from 'lucide-react';
import { getOrders, createOrder } from '../../services/cafeService';
import { getMenuItems } from '../../services/cafeService';
import { getUsers } from '../../services/dataService';

const CafeOrders = ({ showToast }) => {
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [newDiscount, setNewDiscount] = useState(0);
  const [editingPayment, setEditingPayment] = useState(null);
  const [paymentReceived, setPaymentReceived] = useState(0);
  const [dateFilter, setDateFilter] = useState('today');
  
  // New Order Form
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [customerType, setCustomerType] = useState('customer'); // 'customer' or 'trainer'
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [cart, setCart] = useState([]);

  useEffect(() => {
    loadOrders();
    setUsers(getUsers());
    setMenuItems(getMenuItems());
  }, []);

  const loadOrders = () => {
    const allOrders = getOrders();
    setOrders(allOrders.reverse()); // Show newest first
  };

  const getDateRange = (filter) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch(filter) {
      case 'today':
        return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
      
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return { start: yesterday, end: today };
      
      case 'thisWeek':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
        return { start: weekStart, end: new Date() };
      
      case 'lastWeek':
        const lastWeekEnd = new Date(today);
        lastWeekEnd.setDate(today.getDate() - today.getDay());
        const lastWeekStart = new Date(lastWeekEnd);
        lastWeekStart.setDate(lastWeekEnd.getDate() - 7);
        return { start: lastWeekStart, end: lastWeekEnd };
      
      case 'thisMonth':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return { start: monthStart, end: new Date() };
      
      case 'last30Days':
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        return { start: thirtyDaysAgo, end: new Date() };
      
      default:
        return null;
    }
  };

  const filteredOrders = orders.filter(order => {
    // Search filter
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      order.orderNumber?.toLowerCase().includes(searchLower) ||
      order.customerName?.toLowerCase().includes(searchLower)
    );
    
    // Date filter
    if (dateFilter === 'all') {
      return matchesSearch;
    }
    
    const dateRange = getDateRange(dateFilter);
    if (!dateRange) return matchesSearch;
    
    const orderDate = new Date(order.createdAt);
    const matchesDate = orderDate >= dateRange.start && orderDate < dateRange.end;
    
    return matchesSearch && matchesDate;
  });

  // Calculate totals for filtered orders
  const filteredStats = {
    totalOrders: filteredOrders.length,
    totalReceived: filteredOrders.reduce((sum, order) => sum + (order.paymentReceived !== undefined ? order.paymentReceived : order.totalAmount), 0),
    totalDiscount: filteredOrders.reduce((sum, order) => sum + (order.discount || 0), 0),
    customerOrders: filteredOrders.filter(order => order.customerType !== 'trainer').length,
    trainerOrders: filteredOrders.filter(order => order.customerType === 'trainer').length,
  };

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId, change) => {
    setCart(cart.map(item => {
      if (item.id === itemId) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTotal = () => {
    if (customerType === 'trainer') {
      return 0; // Free for trainers
    }
    const subtotal = calculateSubtotal();
    return Math.max(0, subtotal - discount);
  };

  const handleCreateOrder = () => {
    if (cart.length === 0) {
      alert('Please add items to cart');
      return;
    }

    const subtotal = calculateSubtotal();
    const total = calculateTotal();
    
    const orderData = {
      customerName: customerName || 'Walk-in Customer',
      customerPhone: customerPhone || '',
      userId: selectedUser || null,
      customerType: customerType,
      paymentMethod: paymentMethod,
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      subtotal: subtotal,
      discount: customerType === 'trainer' ? subtotal : discount,
      totalAmount: total,
    };

    createOrder(orderData);
    showToast(`Order created successfully! ${customerType === 'trainer' ? '(Trainer - Free)' : ''}`);
    
    // Reset form
    setCustomerName('');
    setCustomerPhone('');
    setSelectedUser('');
    setCustomerType('customer');
    setDiscount(0);
    setPaymentMethod('Cash');
    setCart([]);
    setShowModal(false);
    loadOrders();
  };

  const handleDeleteOrder = (orderId) => {
    if (confirm('Are you sure you want to delete this order?')) {
      const orders = getOrders();
      const updatedOrders = orders.filter(order => order.id !== orderId);
      localStorage.setItem('cafe_orders', JSON.stringify(updatedOrders));
      loadOrders();
      showToast('Order deleted successfully');
    }
  };

  const handleEditDiscount = (order) => {
    setEditingDiscount(order.id);
    setNewDiscount(order.discount || 0);
  };

  const handleSaveDiscount = (orderId) => {
    const orders = getOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex !== -1) {
      const order = orders[orderIndex];
      
      // Don't allow discount changes for trainer orders
      if (order.customerType === 'trainer') {
        showToast('Cannot change discount for trainer orders');
        setEditingDiscount(null);
        return;
      }
      
      // Calculate new total
      const subtotal = order.subtotal || order.totalAmount + (order.discount || 0);
      const newTotal = Math.max(0, subtotal - newDiscount);
      
      // Update order
      orders[orderIndex] = {
        ...order,
        discount: newDiscount,
        totalAmount: newTotal,
        subtotal: subtotal,
        updatedAt: new Date().toISOString(),
      };
      
      localStorage.setItem('cafe_orders', JSON.stringify(orders));
      loadOrders();
      setEditingDiscount(null);
      showToast(`Discount updated to ₹${newDiscount}`);
    }
  };

  const handleCancelEditDiscount = () => {
    setEditingDiscount(null);
    setNewDiscount(0);
  };

  const handleEditPayment = (order) => {
    setEditingPayment(order.id);
    setPaymentReceived(order.paymentReceived || order.totalAmount);
  };

  const handleSavePayment = (orderId) => {
    const orders = getOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex !== -1) {
      orders[orderIndex] = {
        ...orders[orderIndex],
        paymentReceived: paymentReceived,
        updatedAt: new Date().toISOString(),
      };
      
      localStorage.setItem('cafe_orders', JSON.stringify(orders));
      loadOrders();
      setEditingPayment(null);
      showToast(`Payment updated to ₹${paymentReceived}`);
    }
  };

  const handleCancelEditPayment = () => {
    setEditingPayment(null);
    setPaymentReceived(0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Orders</h2>
          <p className="text-gray-600 font-semibold mt-1">Manage cafe orders</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-indigo-700 transition shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          New Order
        </button>
      </div>

      {/* Filters and Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders by number or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          {/* Date Filter */}
          <div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-semibold"
            >
              <option value="all">All Orders</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="thisWeek">This Week</option>
              <option value="lastWeek">Last Week</option>
              <option value="thisMonth">This Month</option>
              <option value="last30Days">Last 30 Days</option>
            </select>
          </div>
        </div>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-lg p-3">
            <p className="text-xs font-semibold text-gray-600 mb-1">Total Orders</p>
            <p className="text-2xl font-black text-purple-600">{filteredStats.totalOrders}</p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg p-3">
            <p className="text-xs font-semibold text-gray-600 mb-1">Customer Orders</p>
            <p className="text-2xl font-black text-blue-600">{filteredStats.customerOrders}</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-3">
            <p className="text-xs font-semibold text-gray-600 mb-1">Trainer Orders</p>
            <p className="text-2xl font-black text-green-600">{filteredStats.trainerOrders}</p>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-lg p-3">
            <p className="text-xs font-semibold text-gray-600 mb-1">Total Discount</p>
            <p className="text-2xl font-black text-orange-600">₹{filteredStats.totalDiscount}</p>
          </div>
        </div>
        
        {/* Received Amount - Larger Display */}
        <div className="mt-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold">Money Received</p>
            <p className="text-4xl font-black">₹{filteredStats.totalReceived}</p>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Order #</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Items</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-32">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-24">Payment</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-32">Received</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-40">Date</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                  <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-lg">No orders yet</p>
                  <p className="text-sm text-gray-400">Create your first order to get started</p>
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="font-bold text-gray-900">{order.orderNumber}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">{order.customerName || 'Walk-in Customer'}</p>
                        {order.customerType === 'trainer' && (
                          <span className="px-2 py-0.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs font-bold rounded-full">
                            TRAINER
                          </span>
                        )}
                      </div>
                      {order.customerPhone && (
                        <p className="text-sm text-gray-500">{order.customerPhone}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
                      {order.items?.map((item, index) => (
                        <div key={index}>
                          {item.name} × {item.quantity}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {editingDiscount === order.id ? (
                      <div className="space-y-2">
                        <div className="text-xs text-gray-600 font-semibold">
                          Subtotal: ₹{order.subtotal || order.totalAmount + (order.discount || 0)}
                        </div>
                        <input
                          type="number"
                          value={newDiscount}
                          onChange={(e) => setNewDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-24 px-2 py-1 border-2 border-purple-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Discount"
                        />
                        <div className="text-xs font-bold text-purple-600">
                          New Total: ₹{Math.max(0, (order.subtotal || order.totalAmount + (order.discount || 0)) - newDiscount)}
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleSaveDiscount(order.id)}
                            className="px-2 py-1 bg-green-600 text-white rounded text-xs font-bold hover:bg-green-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEditDiscount}
                            className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs font-bold hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        {order.subtotal && order.discount > 0 && (
                          <div className="text-xs text-gray-500 line-through mb-1">₹{order.subtotal}</div>
                        )}
                        <span className={`text-lg font-bold ${
                          order.customerType === 'trainer' 
                            ? 'text-green-600' 
                            : 'bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent'
                        }`}>
                          ₹{order.totalAmount}
                        </span>
                        {order.discount > 0 && order.customerType !== 'trainer' && (
                          <div className="text-xs text-purple-600 font-semibold">-₹{order.discount} off</div>
                        )}
                        {order.customerType === 'trainer' && (
                          <div className="text-xs text-green-600 font-semibold">FREE</div>
                        )}
                        {order.customerType !== 'trainer' && (
                          <button
                            onClick={() => handleEditDiscount(order)}
                            className="mt-1 text-xs text-purple-600 hover:text-purple-800 font-semibold underline"
                          >
                            Edit Discount
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      order.paymentMethod === 'Cash' ? 'bg-green-100 text-green-700' :
                      order.paymentMethod === 'UPI' ? 'bg-blue-100 text-blue-700' :
                      order.paymentMethod === 'Card' ? 'bg-purple-100 text-purple-700' :
                      order.paymentMethod === 'Credit' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {order.paymentMethod || 'Cash'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {editingPayment === order.id ? (
                      <div className="space-y-2">
                        <input
                          type="number"
                          value={paymentReceived}
                          onChange={(e) => setPaymentReceived(Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-24 px-2 py-1 border-2 border-green-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Received"
                        />
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleSavePayment(order.id)}
                            className="px-2 py-1 bg-green-600 text-white rounded text-xs font-bold hover:bg-green-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEditPayment}
                            className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs font-bold hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-lg font-bold text-green-600">
                          ₹{order.paymentReceived !== undefined ? order.paymentReceived : order.totalAmount}
                        </div>
                        {order.paymentReceived !== undefined && order.paymentReceived !== order.totalAmount && (
                          <div className="text-xs font-semibold">
                            {order.paymentReceived > order.totalAmount ? (
                              <span className="text-blue-600">+₹{(order.paymentReceived - order.totalAmount).toFixed(2)} change</span>
                            ) : (
                              <span className="text-red-600">-₹{(order.totalAmount - order.paymentReceived).toFixed(2)} pending</span>
                            )}
                          </div>
                        )}
                        <button
                          onClick={() => handleEditPayment(order)}
                          className="mt-1 text-xs text-green-600 hover:text-green-800 font-semibold underline"
                        >
                          Edit Payment
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDeleteOrder(order.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete Order"
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

      {/* New Order Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b bg-gradient-to-r from-orange-500 to-red-600 text-white">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">Create New Order</h3>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Menu Items - 2/3 width */}
                <div className="lg:col-span-2 space-y-4">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Select Dishes</h4>
                  
                  {menuItems.length === 0 ? (
                    <div className="bg-gray-50 rounded-xl p-8 text-center">
                      <p className="text-gray-500">No menu items available. Add items in Menu section first.</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b-2 border-gray-200">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 w-20">Type</th>
                            <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Dish Name</th>
                            <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 w-32">Price</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {menuItems.map((item) => (
                            <tr 
                              key={item.id}
                              onClick={() => addToCart(item)}
                              className="hover:bg-orange-50 cursor-pointer transition-colors group"
                            >
                              <td className="px-4 py-4">
                                <div className="flex items-center justify-center">
                                  <Circle 
                                    className={`w-4 h-4 ${item.isVeg ? 'fill-green-600 text-green-600' : 'fill-red-600 text-red-600'}`}
                                  />
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <span className="font-semibold text-gray-900 group-hover:text-orange-600 transition">{item.name}</span>
                              </td>
                              <td className="px-4 py-4">
                                <span className="text-lg font-bold text-orange-600">₹{item.price}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Cart - 1/3 width */}
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-gray-900">Order Cart</h4>
                  
                  {/* Customer Info */}
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Customer Name (optional)"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number (optional)"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    
                    {/* Customer Type */}
                    <div className="bg-white border-2 border-gray-200 rounded-lg p-3">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Customer Type</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setCustomerType('customer')}
                          className={`flex-1 py-2 px-3 rounded-lg font-semibold transition ${
                            customerType === 'customer'
                              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          Customer
                        </button>
                        <button
                          type="button"
                          onClick={() => setCustomerType('trainer')}
                          className={`flex-1 py-2 px-3 rounded-lg font-semibold transition ${
                            customerType === 'trainer'
                              ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          Trainer
                        </button>
                      </div>
                    </div>
                    
                    {/* Payment Method */}
                    {customerType !== 'trainer' && (
                      <div className="bg-white border-2 border-gray-200 rounded-lg p-3">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Method</label>
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-semibold"
                        >
                          <option value="Cash">Cash</option>
                          <option value="UPI">UPI</option>
                          <option value="Card">Card</option>
                          <option value="Credit">Credit (Pay Later)</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Cart Items */}
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3 max-h-96 overflow-y-auto">
                    {cart.length === 0 ? (
                      <p className="text-gray-500 text-center py-8 text-sm">Cart is empty</p>
                    ) : (
                      cart.map((item) => (
                        <div key={item.id} className="bg-white rounded-lg p-3 shadow-sm">
                          <div className="flex items-start justify-between mb-2">
                            <span className="font-semibold text-gray-900 text-sm">{item.name}</span>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.id, -1)}
                                className="w-7 h-7 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300 transition"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-8 text-center font-bold">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, 1)}
                                className="w-7 h-7 bg-orange-600 text-white rounded-lg flex items-center justify-center hover:bg-orange-700 transition"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            <span className="font-bold text-gray-900">₹{item.price * item.quantity}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Total */}
                  <div className="space-y-3">
                    {/* Subtotal & Discount */}
                    {cart.length > 0 && (
                      <div className="bg-white border-2 border-gray-200 rounded-lg p-3 space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Subtotal</span>
                          <span className="font-bold text-gray-900">₹{calculateSubtotal()}</span>
                        </div>
                        
                        {customerType === 'trainer' ? (
                          <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-200">
                            <span className="text-green-600 font-semibold">Trainer (Free)</span>
                            <span className="font-bold text-green-600">-₹{calculateSubtotal()}</span>
                          </div>
                        ) : (
                          <div className="pt-2 border-t border-gray-200">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Discount (Optional)</label>
                            <input
                              type="number"
                              placeholder="Enter discount"
                              value={discount}
                              onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                            />
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className={`rounded-xl p-4 text-white ${
                      customerType === 'trainer' 
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600' 
                        : 'bg-gradient-to-r from-purple-600 to-indigo-600'
                    }`}>
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-semibold">Total Amount</span>
                        <span className="text-3xl font-black">₹{calculateTotal()}</span>
                      </div>
                      <button
                        onClick={handleCreateOrder}
                        disabled={cart.length === 0}
                        className="w-full py-3 bg-white text-purple-600 rounded-lg font-bold hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                      >
                        {customerType === 'trainer' ? 'Create Order (Free)' : 'Create Order'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CafeOrders;
