import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, ShoppingCart, Minus, X, Circle, Edit2 } from 'lucide-react';
import { getOrders, getMenuItems, createOrder, updateOrder, deleteOrder } from '../../services/cafeService';
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
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    const items = await getMenuItems();
    const { getInventory } = await import('../../services/cafeService');
    const inventory = await getInventory();
    
    // Map snake_case to camelCase and enrich with inventory prices
    const mappedItems = items.map(item => {
      const rawMaterials = item.raw_materials ?? item.rawMaterials ?? [];
      const enrichedMaterials = rawMaterials.map(material => {
        const inventoryItem = inventory.find(inv => 
          inv.name.toLowerCase() === material.name.toLowerCase()
        );
        return {
          ...material,
          pricePerUnit: inventoryItem?.price_per_unit || inventoryItem?.pricePerUnit || 0
        };
      });
      
      return {
        ...item,
        customerPrice: item.customer_price ?? item.customerPrice,
        trainerPrice: item.trainer_price ?? item.trainerPrice,
        isVeg: item.is_veg ?? item.isVeg,
        rawMaterials: enrichedMaterials,
        raw_materials: enrichedMaterials,
        isActive: item.is_active ?? item.isActive,
      };
    });
    setMenuItems(mappedItems);
  };

  const loadOrders = async () => {
    const allOrders = await getOrders();
    // Map snake_case to camelCase
    const mappedOrders = allOrders.map(order => ({
      ...order,
      orderNumber: order.order_number ?? order.orderNumber,
      customerName: order.customer_name ?? order.customerName,
      customerPhone: order.customer_phone ?? order.customerPhone,
      customerType: order.customer_type ?? order.customerType,
      paymentMethod: order.payment_method ?? order.paymentMethod,
      totalAmount: order.total_amount ?? order.totalAmount,
      paymentReceived: order.payment_received ?? order.paymentReceived,
      createdAt: order.created_at ?? order.createdAt,
    }));
    setOrders(mappedOrders.reverse()); // Show newest first
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
    // Determine price based on customer type
    const price = customerType === 'trainer' ? (item.trainerPrice || 0) : (item.customerPrice || 0);
    
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, price, quantity: 1, extraIngredients: [] }]);
    }
  };

  const updateExtraIngredient = (itemId, ingredientName, quantity, unit, pricePerUnit) => {
    setCart(cart.map(item => {
      if (item.id === itemId) {
        const existingExtras = item.extraIngredients || [];
        const existingIndex = existingExtras.findIndex(e => e.name === ingredientName);
        
        let newExtras;
        if (quantity === 0) {
          // Remove ingredient if quantity is 0
          newExtras = existingExtras.filter(e => e.name !== ingredientName);
        } else if (existingIndex >= 0) {
          // Update existing
          newExtras = [...existingExtras];
          newExtras[existingIndex] = { name: ingredientName, quantity, unit, pricePerUnit };
        } else {
          // Add new
          newExtras = [...existingExtras, { name: ingredientName, quantity, unit, pricePerUnit }];
        }
        
        return { ...item, extraIngredients: newExtras };
      }
      return item;
    }));
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
    return cart.reduce((sum, item) => {
      const basePrice = item.price * item.quantity;
      const extrasCost = (item.extraIngredients || []).reduce((extraSum, extra) => {
        return extraSum + (extra.quantity * extra.pricePerUnit);
      }, 0);
      return sum + basePrice + extrasCost;
    }, 0);
  };

  const calculateTotal = () => {
    if (customerType === 'trainer') {
      return 0; // Free for trainers
    }
    const subtotal = calculateSubtotal();
    return Math.max(0, subtotal - discount);
  };

  const handleCreateOrder = async () => {
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
      items: cart.map(item => {
        const extrasCost = (item.extraIngredients || []).reduce((sum, extra) => 
          sum + (extra.quantity * extra.pricePerUnit), 0
        );
        return {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          extraIngredients: item.extraIngredients || [],
          adjustedPrice: item.price + (extrasCost / item.quantity),
        };
      }),
      subtotal: subtotal,
      discount: customerType === 'trainer' ? subtotal : discount,
      totalAmount: total,
    };

    await createOrder(orderData);
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
    await loadOrders();
  };

  const handleDeleteOrder = async (orderId) => {
    if (confirm('Are you sure you want to delete this order?')) {
      await deleteOrder(orderId);
      await loadOrders();
      showToast('Order deleted successfully');
    }
  };

  const handleEditDiscount = (order) => {
    setEditingDiscount(order.id);
    setNewDiscount(order.discount || 0);
  };

  const handleSaveDiscount = async (orderId) => {
    const order = orders.find(o => o.id === orderId);
    
    if (order) {
      // Don't allow discount changes for trainer orders
      if (order.customerType === 'trainer') {
        showToast('Cannot change discount for trainer orders');
        setEditingDiscount(null);
        return;
      }
      
      // Calculate new total
      const subtotal = order.subtotal || order.totalAmount + (order.discount || 0);
      const newTotal = Math.max(0, subtotal - newDiscount);
      
      // Update order in database
      await updateOrder(orderId, {
        discount: newDiscount,
        totalAmount: newTotal,
        subtotal: subtotal,
        paymentReceived: order.paymentReceived,
      });
      
      await loadOrders();
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

  const handleSavePayment = async (orderId) => {
    const order = orders.find(o => o.id === orderId);
    
    if (order) {
      await updateOrder(orderId, {
        discount: order.discount,
        totalAmount: order.totalAmount,
        subtotal: order.subtotal,
        paymentReceived: paymentReceived,
      });
      
      await loadOrders();
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2">
          <div className="bg-white rounded-xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-3 border-b bg-gradient-to-r from-orange-500 to-red-600 text-white">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Create New Order</h3>
                <button onClick={() => setShowModal(false)} className="p-1 hover:bg-white/20 rounded-lg transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Menu Items - 2/3 width */}
                <div className="lg:col-span-2 space-y-2">
                  <h4 className="text-sm font-bold text-gray-900 mb-2">Select Dishes</h4>
                  
                  {menuItems.length === 0 ? (
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-500">No menu items available. Add items in Menu section first.</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-2 py-2 text-left text-xs font-bold text-gray-700 w-12">Type</th>
                            <th className="px-2 py-2 text-left text-xs font-bold text-gray-700">Dish Name</th>
                            <th className="px-2 py-2 text-left text-xs font-bold text-gray-700 w-24">Price</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {menuItems.map((item) => (
                            <tr 
                              key={item.id}
                              onClick={() => addToCart(item)}
                              className="hover:bg-orange-50 cursor-pointer transition-colors group"
                            >
                              <td className="px-2 py-2">
                                <div className="flex items-center justify-center">
                                  <Circle 
                                    className={`w-3 h-3 ${item.isVeg ? 'fill-green-600 text-green-600' : 'fill-red-600 text-red-600'}`}
                                  />
                                </div>
                              </td>
                              <td className="px-2 py-2">
                                <span className="text-sm font-semibold text-gray-900 group-hover:text-orange-600 transition">{item.name}</span>
                              </td>
                              <td className="px-2 py-2">
                                <span className="text-sm font-bold text-orange-600">
                                  ₹{customerType === 'trainer' ? (item.trainerPrice || 0) : (item.customerPrice || 0)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Cart - 1/3 width */}
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-gray-900">Order Cart</h4>
                  
                  {/* Customer Info */}
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Customer Name (optional)"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    
                    {/* Customer Type */}
                    <div className="bg-white border border-gray-200 rounded-lg p-2">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Customer Type</label>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setCustomerType('customer')}
                          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition ${
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
                          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition ${
                            customerType === 'trainer'
                              ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          Trainer
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Cart Items */}
                  <div className="bg-gray-50 rounded-lg p-2 space-y-2 max-h-80 overflow-y-auto">
                    {cart.length === 0 ? (
                      <p className="text-gray-500 text-center py-4 text-xs">Cart is empty</p>
                    ) : (
                      cart.map((item) => (
                        <div key={item.id} className="bg-white rounded-lg p-2 shadow-sm">
                          <div className="flex items-start justify-between mb-1">
                            <span className="font-semibold text-gray-900 text-xs">{item.name}</span>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          
                          {/* Extra Ingredients */}
                          {item.raw_materials && item.raw_materials.length > 0 && (
                            <div className="mb-2">
                              <label className="text-xs text-gray-600 font-semibold mb-1 block">Add Extra:</label>
                              <div className="space-y-1">
                                {item.raw_materials
                                  .filter(mat => ['Eggs', 'Chicken', 'Paneer', 'Mutton', 'Fish', 'Prawns'].some(main => 
                                    mat.name.toLowerCase().includes(main.toLowerCase())
                                  ))
                                  .map((material) => {
                                    const currentExtra = (item.extraIngredients || []).find(e => e.name === material.name);
                                    const extraQty = currentExtra ? currentExtra.quantity : 0;
                                    const pricePerUnit = material.pricePerUnit || 0;
                                    
                                    return (
                                      <div key={material.name} className="flex items-center gap-2 bg-orange-50 rounded px-2 py-1">
                                        <span className="text-xs font-medium text-gray-700 flex-1">{material.name}</span>
                                        <div className="flex items-center gap-1">
                                          <button
                                            onClick={() => updateExtraIngredient(item.id, material.name, Math.max(0, extraQty - (material.unit === 'pcs' ? 1 : 50)), material.unit, pricePerUnit)}
                                            className="w-5 h-5 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300 transition"
                                            disabled={extraQty === 0}
                                          >
                                            <Minus className="w-3 h-3" />
                                          </button>
                                          <span className="text-xs font-bold w-12 text-center">
                                            {extraQty > 0 ? `+${extraQty}${material.unit}` : '0'}
                                          </span>
                                          <button
                                            onClick={() => updateExtraIngredient(item.id, material.name, extraQty + (material.unit === 'pcs' ? 1 : 50), material.unit, pricePerUnit)}
                                            className="w-5 h-5 bg-orange-600 text-white rounded flex items-center justify-center hover:bg-orange-700 transition"
                                          >
                                            <Plus className="w-3 h-3" />
                                          </button>
                                        </div>
                                        {extraQty > 0 && pricePerUnit > 0 && (
                                          <span className="text-xs text-orange-600 font-semibold">+₹{(extraQty * pricePerUnit).toFixed(0)}</span>
                                        )}
                                      </div>
                                    );
                                  })}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => updateQuantity(item.id, -1)}
                                className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300 transition"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, 1)}
                                className="w-6 h-6 bg-orange-600 text-white rounded flex items-center justify-center hover:bg-orange-700 transition"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-500">
                                {item.quantity} × ₹{item.price}
                                {(item.extraIngredients || []).length > 0 && (
                                  <span className="text-orange-600"> + extras</span>
                                )}
                              </div>
                              <div className="text-sm font-bold text-gray-900">
                                ₹{(
                                  item.price * item.quantity + 
                                  (item.extraIngredients || []).reduce((sum, extra) => sum + (extra.quantity * extra.pricePerUnit), 0)
                                ).toFixed(0)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Total */}
                  <div className="space-y-2">
                    {/* Subtotal & Discount */}
                    {cart.length > 0 && (
                      <div className="bg-white border border-gray-200 rounded-lg p-2 space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-600">Subtotal</span>
                          <span className="font-bold text-gray-900">₹{calculateSubtotal()}</span>
                        </div>
                        
                        {customerType === 'trainer' ? (
                          <div className="flex justify-between items-center text-xs pt-1 border-t border-gray-200">
                            <span className="text-green-600 font-semibold">Trainer (Free)</span>
                            <span className="font-bold text-green-600">-₹{calculateSubtotal()}</span>
                          </div>
                        ) : (
                          <div className="pt-1 border-t border-gray-200">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Discount (Optional)</label>
                            <input
                              type="number"
                              placeholder="0"
                              value={discount}
                              onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className={`rounded-lg p-2 text-white ${
                      customerType === 'trainer' 
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600' 
                        : 'bg-gradient-to-r from-purple-600 to-indigo-600'
                    }`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold">Total Amount</span>
                        <span className="text-xl font-black">₹{calculateTotal()}</span>
                      </div>
                      <button
                        onClick={handleCreateOrder}
                        disabled={cart.length === 0}
                        className="w-full py-2 bg-white text-purple-600 rounded-lg text-sm font-bold hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
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
