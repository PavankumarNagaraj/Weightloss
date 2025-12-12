// Cafe Management Service
import { generateShortId } from '../utils/idGenerator';

const ORDERS_KEY = 'cafe_orders';
const INVENTORY_KEY = 'cafe_inventory';
const PURCHASES_KEY = 'cafe_purchases';
const MENU_KEY = 'cafe_menu';

// Migration: Add date field to existing orders
export const migrateOrderDates = () => {
  try {
    const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
    let migrated = false;
    
    const updatedOrders = orders.map(order => {
      if (!order.date && order.createdAt) {
        migrated = true;
        return {
          ...order,
          date: order.createdAt.split('T')[0] // Extract YYYY-MM-DD from ISO timestamp
        };
      }
      return order;
    });
    
    if (migrated) {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(updatedOrders));
      console.log('✅ Migrated orders with date field');
    }
  } catch (error) {
    console.error('Error migrating order dates:', error);
  }
};

// ==================== MENU MANAGEMENT ====================

export const getMenuItems = () => {
  try {
    return JSON.parse(localStorage.getItem(MENU_KEY) || '[]');
  } catch (error) {
    console.error('Error getting menu items:', error);
    return [];
  }
};

export const addMenuItem = (itemData) => {
  try {
    const items = getMenuItems();
    const newItem = {
      id: generateShortId(),
      ...itemData,
      createdAt: new Date().toISOString(),
      isActive: true,
    };
    items.push(newItem);
    localStorage.setItem(MENU_KEY, JSON.stringify(items));
    return newItem;
  } catch (error) {
    console.error('Error adding menu item:', error);
    throw error;
  }
};

export const updateMenuItem = (itemId, updates) => {
  try {
    const items = getMenuItems();
    const index = items.findIndex(item => item.id === itemId);
    if (index !== -1) {
      items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() };
      localStorage.setItem(MENU_KEY, JSON.stringify(items));
      return items[index];
    }
    throw new Error('Menu item not found');
  } catch (error) {
    console.error('Error updating menu item:', error);
    throw error;
  }
};

export const deleteMenuItem = (itemId) => {
  try {
    const items = getMenuItems();
    const filtered = items.filter(item => item.id !== itemId);
    localStorage.setItem(MENU_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting menu item:', error);
    throw error;
  }
};

// ==================== INVENTORY MANAGEMENT ====================

export const getInventory = () => {
  try {
    return JSON.parse(localStorage.getItem(INVENTORY_KEY) || '[]');
  } catch (error) {
    console.error('Error getting inventory:', error);
    return [];
  }
};

export const addInventoryItem = (itemData) => {
  try {
    const inventory = getInventory();
    const newItem = {
      id: generateShortId(),
      ...itemData,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };
    inventory.push(newItem);
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
    return newItem;
  } catch (error) {
    console.error('Error adding inventory item:', error);
    throw error;
  }
};

export const updateInventoryStock = (itemId, quantity, type = 'add') => {
  try {
    const inventory = getInventory();
    const index = inventory.findIndex(item => item.id === itemId);
    
    if (index !== -1) {
      if (type === 'add') {
        inventory[index].currentStock += quantity;
      } else if (type === 'subtract') {
        inventory[index].currentStock -= quantity;
      } else {
        inventory[index].currentStock = quantity;
      }
      
      inventory[index].lastUpdated = new Date().toISOString();
      localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
      return inventory[index];
    }
    throw new Error('Inventory item not found');
  } catch (error) {
    console.error('Error updating inventory stock:', error);
    throw error;
  }
};

export const getLowStockItems = () => {
  const inventory = getInventory();
  
  // Helper to convert to grams
  const convertToGrams = (quantity, unit) => {
    const qty = parseFloat(quantity);
    switch(unit) {
      case 'kg': return qty * 1000;
      case 'l': return qty * 1000;
      case 'ml': return qty;
      case 'g': return qty;
      case 'pcs': return qty;
      default: return qty;
    }
  };
  
  return inventory.filter(item => {
    const currentStockInGrams = convertToGrams(item.currentStock, item.unit);
    return currentStockInGrams <= item.minStock;
  });
};

// ==================== PURCHASE MANAGEMENT ====================

export const getPurchases = () => {
  try {
    return JSON.parse(localStorage.getItem(PURCHASES_KEY) || '[]');
  } catch (error) {
    console.error('Error getting purchases:', error);
    return [];
  }
};

export const addPurchase = (purchaseData) => {
  try {
    const purchases = getPurchases();
    const inventory = getInventory();
    
    const newPurchase = {
      id: generateShortId(),
      ...purchaseData,
      date: new Date().toISOString(),
      status: 'completed',
    };
    
    purchases.push(newPurchase);
    localStorage.setItem(PURCHASES_KEY, JSON.stringify(purchases));
    
    // Update inventory stock based on purchased items
    if (purchaseData.items) {
      purchaseData.items.forEach(purchaseItem => {
        const inventoryItem = inventory.find(inv => 
          inv.name.toLowerCase() === purchaseItem.materialName.toLowerCase()
        );
        
        if (inventoryItem) {
          // Update existing inventory item
          const invIndex = inventory.findIndex(inv => inv.id === inventoryItem.id);
          if (invIndex !== -1) {
            // Update stock
            inventory[invIndex].currentStock = parseFloat(inventory[invIndex].currentStock) + parseFloat(purchaseItem.quantity);
            
            // Update price per unit (weighted average)
            const oldValue = parseFloat(inventory[invIndex].currentStock - purchaseItem.quantity) * (inventory[invIndex].pricePerUnit || 0);
            const newValue = parseFloat(purchaseItem.totalPrice);
            const totalValue = oldValue + newValue;
            const totalQuantity = parseFloat(inventory[invIndex].currentStock);
            inventory[invIndex].pricePerUnit = totalQuantity > 0 ? totalValue / totalQuantity : purchaseItem.pricePerUnit;
            
            inventory[invIndex].lastUpdated = new Date().toISOString();
            inventory[invIndex].lastPurchasePrice = purchaseItem.pricePerUnit;
          }
        }
      });
      
      // Save updated inventory
      localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
    }
    
    return newPurchase;
  } catch (error) {
    console.error('Error adding purchase:', error);
    throw error;
  }
};

export const getPurchaseStats = (startDate, endDate) => {
  const purchases = getPurchases();
  const filtered = purchases.filter(p => {
    const date = new Date(p.date);
    return date >= new Date(startDate) && date <= new Date(endDate);
  });
  
  const totalAmount = filtered.reduce((sum, p) => sum + p.totalAmount, 0);
  const totalItems = filtered.reduce((sum, p) => sum + (p.items?.length || 0), 0);
  
  return {
    totalPurchases: filtered.length,
    totalAmount,
    totalItems,
    purchases: filtered,
  };
};

// ==================== ORDER MANAGEMENT ====================

export const getOrders = () => {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
  } catch (error) {
    console.error('Error getting orders:', error);
    return [];
  }
};

export const createOrder = (orderData) => {
  try {
    const orders = getOrders();
    const menuItems = getMenuItems();
    const inventory = getInventory();
    
    const newOrder = {
      id: generateShortId(),
      orderNumber: `ORD${Date.now().toString().slice(-6)}`,
      ...orderData,
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format for email filtering
      status: 'completed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    orders.push(newOrder);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    
    // Deduct inventory based on menu item raw materials
    if (orderData.items) {
      console.log('🔍 Processing order items:', orderData.items);
      
      orderData.items.forEach(orderItem => {
        // Find the menu item to get raw materials
        const menuItem = menuItems.find(m => m.id === orderItem.id || m.name === orderItem.name);
        console.log('📋 Menu item found:', menuItem?.name, 'Raw materials:', menuItem?.rawMaterials);
        
        if (menuItem && menuItem.rawMaterials && menuItem.rawMaterials.length > 0) {
          // Deduct each raw material based on order quantity
          menuItem.rawMaterials.forEach(material => {
            const inventoryItem = inventory.find(inv => 
              inv.name.toLowerCase() === material.name.toLowerCase()
            );
            
            if (inventoryItem) {
              const totalQuantityNeeded = parseFloat(material.quantity) * orderItem.quantity;
              console.log(`📦 Deducting ${material.name}: ${totalQuantityNeeded}${material.unit} (${material.quantity} × ${orderItem.quantity})`);
              
              // Update inventory - subtract the required quantity
              const invIndex = inventory.findIndex(inv => inv.id === inventoryItem.id);
              if (invIndex !== -1) {
                const oldStock = inventory[invIndex].currentStock;
                inventory[invIndex].currentStock = parseFloat(inventory[invIndex].currentStock) - totalQuantityNeeded;
                console.log(`✅ ${material.name}: ${oldStock}${inventory[invIndex].unit} → ${inventory[invIndex].currentStock}${inventory[invIndex].unit}`);
                inventory[invIndex].lastUpdated = new Date().toISOString();
              }
            } else {
              console.warn(`⚠️ Inventory item not found: ${material.name}`);
            }
          });
        } else {
          console.warn(`⚠️ Menu item has no raw materials: ${orderItem.name}`);
        }
      });
      
      // Save updated inventory
      localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
      console.log('💾 Inventory saved to localStorage');
    }
    
    // Record in user's meal log if userId provided
    if (orderData.userId) {
      recordOrderInUserLog(orderData.userId, newOrder);
    }
    
    return newOrder;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const updateOrderStatus = (orderId, status) => {
  try {
    const orders = getOrders();
    const index = orders.findIndex(order => order.id === orderId);
    
    if (index !== -1) {
      orders[index].status = status;
      orders[index].updatedAt = new Date().toISOString();
      
      if (status === 'delivered') {
        orders[index].deliveredAt = new Date().toISOString();
      }
      
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
      return orders[index];
    }
    throw new Error('Order not found');
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

export const getOrdersByUser = (userId) => {
  const orders = getOrders();
  return orders.filter(order => order.userId === userId);
};

export const getOrderStats = (startDate, endDate) => {
  const orders = getOrders();
  const filtered = orders.filter(o => {
    const date = new Date(o.createdAt);
    return date >= new Date(startDate) && date <= new Date(endDate);
  });
  
  const totalRevenue = filtered.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const byStatus = filtered.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});
  
  return {
    totalOrders: filtered.length,
    totalRevenue,
    byStatus,
    orders: filtered,
  };
};

// ==================== USER INTEGRATION ====================

const recordOrderInUserLog = (userId, order) => {
  try {
    const users = JSON.parse(localStorage.getItem('weightloss_users') || '[]');
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
      if (!users[userIndex].cafeOrders) {
        users[userIndex].cafeOrders = [];
      }
      
      users[userIndex].cafeOrders.push({
        orderId: order.id,
        orderNumber: order.orderNumber,
        date: order.createdAt,
        items: order.items,
        totalAmount: order.totalAmount,
        status: order.status,
      });
      
      localStorage.setItem('weightloss_users', JSON.stringify(users));
    }
  } catch (error) {
    console.error('Error recording order in user log:', error);
  }
};

export const getUserCafeOrders = (userId) => {
  try {
    const users = JSON.parse(localStorage.getItem('weightloss_users') || '[]');
    const user = users.find(u => u.id === userId);
    return user?.cafeOrders || [];
  } catch (error) {
    console.error('Error getting user cafe orders:', error);
    return [];
  }
};

// ==================== DASHBOARD STATS ====================

// ==================== INVENTORY VALUATION ====================

export const getInventoryValuation = () => {
  const inventory = getInventory();
  
  let totalValue = 0;
  const itemsWithValue = [];
  const itemsWithoutPrice = [];
  
  inventory.forEach(item => {
    const pricePerUnit = item.pricePerUnit || item.lastPurchasePrice || 0;
    const value = parseFloat(item.currentStock) * pricePerUnit;
    
    if (pricePerUnit > 0) {
      totalValue += value;
      itemsWithValue.push({
        name: item.name,
        stock: item.currentStock,
        unit: item.unit,
        pricePerUnit,
        value,
      });
    } else {
      itemsWithoutPrice.push(item.name);
    }
  });
  
  return {
    totalValue,
    itemsWithValue: itemsWithValue.sort((a, b) => b.value - a.value),
    itemsWithoutPrice,
  };
};

// ==================== CREDIT ORDERS ====================

export const getCreditOrders = () => {
  const orders = getOrders();
  
  const creditOrders = orders.filter(o => 
    o.paymentMethod === 'Credit' && 
    (!o.paymentReceived || o.paymentReceived < o.totalAmount)
  );
  
  const totalPending = creditOrders.reduce((sum, o) => {
    const pending = o.totalAmount - (o.paymentReceived || 0);
    return sum + pending;
  }, 0);
  
  // Add days pending
  const now = new Date();
  const ordersWithDays = creditOrders.map(o => {
    const orderDate = new Date(o.createdAt);
    const daysPending = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));
    const pendingAmount = o.totalAmount - (o.paymentReceived || 0);
    
    return {
      ...o,
      daysPending,
      pendingAmount,
    };
  });
  
  return {
    orders: ordersWithDays.sort((a, b) => b.daysPending - a.daysPending),
    totalPending,
    count: creditOrders.length,
  };
};

// ==================== CASH RECONCILIATION ====================

export const getCashReconciliation = (date = new Date()) => {
  const orders = getOrders();
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const todayOrders = orders.filter(o => {
    const orderDate = new Date(o.createdAt);
    return orderDate >= startOfDay && orderDate <= endOfDay;
  });
  
  const cashOrders = todayOrders.filter(o => o.paymentMethod === 'Cash');
  const expectedCash = cashOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  
  return {
    expectedCash,
    cashOrders: cashOrders.length,
    orders: cashOrders,
  };
};

// ==================== INVENTORY DEPLETION TRACKING ====================

export const getInventoryDepletionRate = (days = 7) => {
  const orders = getOrders();
  const inventory = getInventory();
  const menuItems = getMenuItems();
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const recentOrders = orders.filter(o => new Date(o.createdAt) >= startDate);
  
  // Calculate usage per material
  const materialUsage = {};
  
  recentOrders.forEach(order => {
    order.items?.forEach(orderItem => {
      const menuItem = menuItems.find(m => m.id === orderItem.id || m.name === orderItem.name);
      
      if (menuItem && menuItem.rawMaterials) {
        menuItem.rawMaterials.forEach(material => {
          const totalUsed = parseFloat(material.quantity) * orderItem.quantity;
          
          if (!materialUsage[material.name]) {
            materialUsage[material.name] = {
              name: material.name,
              unit: material.unit,
              totalUsed: 0,
              timesUsed: 0,
            };
          }
          
          materialUsage[material.name].totalUsed += totalUsed;
          materialUsage[material.name].timesUsed += 1;
        });
      }
    });
  });
  
  // Calculate depletion rate and days until empty
  const depletionData = Object.values(materialUsage).map(usage => {
    const inventoryItem = inventory.find(inv => 
      inv.name.toLowerCase() === usage.name.toLowerCase()
    );
    
    const dailyUsage = usage.totalUsed / days;
    const currentStock = inventoryItem ? parseFloat(inventoryItem.currentStock) : 0;
    const daysUntilEmpty = dailyUsage > 0 ? currentStock / dailyUsage : Infinity;
    
    return {
      ...usage,
      currentStock,
      dailyUsage: dailyUsage.toFixed(2),
      daysUntilEmpty: Math.floor(daysUntilEmpty),
      status: daysUntilEmpty < 3 ? 'critical' : daysUntilEmpty < 7 ? 'warning' : 'ok',
    };
  });
  
  return depletionData.sort((a, b) => a.daysUntilEmpty - b.daysUntilEmpty);
};

// ==================== DISH TREND (30 DAYS) ====================

export const getDishTrend = (dishName, days = 30) => {
  const orders = getOrders();
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  // Create array of dates
  const dateArray = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    dateArray.push({
      date: date.toISOString().split('T')[0],
      displayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      quantity: 0,
      revenue: 0,
      orders: 0,
    });
  }
  
  // Fill in actual data
  orders.forEach(order => {
    const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
    const dayData = dateArray.find(d => d.date === orderDate);
    
    if (dayData && order.items) {
      order.items.forEach(item => {
        if (item.name === dishName) {
          dayData.quantity += item.quantity;
          dayData.revenue += item.price * item.quantity;
          dayData.orders += 1;
        }
      });
    }
  });
  
  return dateArray;
};

// ==================== INVENTORY TREND (30 DAYS) ====================

export const getInventoryTrend = (materialName, days = 30) => {
  const orders = getOrders();
  const purchases = getPurchases();
  const inventory = getInventory();
  const menuItems = getMenuItems();
  
  const inventoryItem = inventory.find(inv => 
    inv.name.toLowerCase() === materialName.toLowerCase()
  );
  
  if (!inventoryItem) {
    return [];
  }
  
  const currentStock = parseFloat(inventoryItem.currentStock);
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  // Create array of dates
  const dateArray = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    dateArray.push({
      date: date.toISOString().split('T')[0],
      displayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      stock: 0,
      used: 0,
      purchased: 0,
    });
  }
  
  // Calculate usage from orders (going backwards from today)
  let runningStock = currentStock;
  
  // First, go forward to calculate usage and purchases
  for (let i = dateArray.length - 1; i >= 0; i--) {
    const dayData = dateArray[i];
    
    // Calculate usage for this day
    let dayUsage = 0;
    orders.forEach(order => {
      const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
      if (orderDate === dayData.date && order.items) {
        order.items.forEach(orderItem => {
          const menuItem = menuItems.find(m => m.id === orderItem.id || m.name === orderItem.name);
          if (menuItem && menuItem.rawMaterials) {
            menuItem.rawMaterials.forEach(material => {
              if (material.name.toLowerCase() === materialName.toLowerCase()) {
                dayUsage += parseFloat(material.quantity) * orderItem.quantity;
              }
            });
          }
        });
      }
    });
    
    // Calculate purchases for this day
    let dayPurchase = 0;
    purchases.forEach(purchase => {
      const purchaseDate = new Date(purchase.date).toISOString().split('T')[0];
      if (purchaseDate === dayData.date && purchase.items) {
        purchase.items.forEach(item => {
          if (item.materialName.toLowerCase() === materialName.toLowerCase()) {
            dayPurchase += parseFloat(item.quantity);
          }
        });
      }
    });
    
    dayData.used = dayUsage;
    dayData.purchased = dayPurchase;
    
    // Calculate stock level (working backwards)
    if (i === dateArray.length - 1) {
      dayData.stock = currentStock;
    } else {
      // Previous day's stock = current day's stock + current day's usage - current day's purchases
      runningStock = runningStock + dayUsage - dayPurchase;
      dayData.stock = Math.max(0, runningStock);
    }
  }
  
  // Reverse to show correct stock progression
  dateArray.reverse();
  for (let i = 0; i < dateArray.length; i++) {
    if (i === 0) {
      dateArray[i].stock = Math.max(0, dateArray[i].stock);
    } else {
      dateArray[i].stock = Math.max(0, dateArray[i - 1].stock - dateArray[i - 1].used + dateArray[i - 1].purchased);
    }
  }
  dateArray.reverse();
  
  return dateArray;
};

// ==================== DISH PERFORMANCE ====================

export const getDishPerformance = (startDate, endDate) => {
  const orders = getOrders();
  const menuItems = getMenuItems();
  
  const filteredOrders = orders.filter(o => {
    const date = new Date(o.createdAt);
    return date >= new Date(startDate) && date <= new Date(endDate);
  });
  
  const dishStats = {};
  let totalRevenue = 0;
  let totalOrders = filteredOrders.length;
  
  filteredOrders.forEach(order => {
    totalRevenue += order.totalAmount || 0;
    
    order.items?.forEach(item => {
      if (!dishStats[item.name]) {
        const menuItem = menuItems.find(m => m.name === item.name);
        dishStats[item.name] = {
          name: item.name,
          quantitySold: 0,
          revenue: 0,
          orders: 0,
          price: item.price,
          isVeg: menuItem?.isVeg,
          rawMaterials: menuItem?.rawMaterials || [],
        };
      }
      
      dishStats[item.name].quantitySold += item.quantity;
      dishStats[item.name].revenue += item.price * item.quantity;
      dishStats[item.name].orders += 1;
    });
  });
  
  // Calculate performance metrics
  const dishArray = Object.values(dishStats).map(dish => {
    const revenueShare = totalRevenue > 0 ? (dish.revenue / totalRevenue) * 100 : 0;
    const avgQuantityPerOrder = dish.orders > 0 ? dish.quantitySold / dish.orders : 0;
    const ordersPercentage = totalOrders > 0 ? (dish.orders / totalOrders) * 100 : 0;
    
    // Calculate cost if raw materials have prices
    let estimatedCost = 0;
    dish.rawMaterials.forEach(material => {
      // This would need inventory price data
      estimatedCost += 0; // Placeholder
    });
    
    return {
      ...dish,
      revenueShare: revenueShare.toFixed(1),
      avgQuantityPerOrder: avgQuantityPerOrder.toFixed(1),
      ordersPercentage: ordersPercentage.toFixed(1),
      estimatedCost,
      estimatedProfit: dish.price - estimatedCost,
      profitMargin: dish.price > 0 ? ((dish.price - estimatedCost) / dish.price * 100).toFixed(1) : 0,
    };
  });
  
  return {
    dishes: dishArray.sort((a, b) => b.revenue - a.revenue),
    totalRevenue,
    totalOrders,
    totalDishes: dishArray.length,
  };
};

// ==================== CASH FLOW & BALANCE ====================

export const getCashFlow = (startDate, endDate) => {
  const orders = getOrders();
  const purchases = getPurchases();
  const expenses = JSON.parse(localStorage.getItem('cafe_expenses') || '[]');
  const investments = JSON.parse(localStorage.getItem('cafe_investments') || '[]');
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Filter by date range
  const filteredOrders = orders.filter(o => {
    const date = new Date(o.createdAt);
    return date >= start && date <= end;
  });
  
  const filteredPurchases = purchases.filter(p => {
    const date = new Date(p.date);
    return date >= start && date <= end;
  });
  
  const filteredExpenses = expenses.filter(e => {
    const date = new Date(e.date);
    return date >= start && date <= end;
  });
  
  const filteredInvestments = investments.filter(i => {
    const date = new Date(i.date);
    return date >= start && date <= end;
  });
  
  // Calculate totals
  const revenue = filteredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const purchaseCosts = filteredPurchases.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
  const operatingExpenses = filteredExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  const totalInvestments = filteredInvestments.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
  
  // Cash breakdown by payment method
  const cashRevenue = filteredOrders
    .filter(o => o.paymentMethod === 'Cash')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  
  const cashExpenses = filteredExpenses
    .filter(e => e.paymentMethod === 'Cash')
    .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  
  const cashPurchases = filteredPurchases
    .filter(p => p.paymentMethod === 'Cash')
    .reduce((sum, p) => sum + (p.totalAmount || 0), 0);
  
  // Calculate balance
  const totalIncome = revenue + totalInvestments;
  const totalExpenses = purchaseCosts + operatingExpenses;
  const netBalance = totalIncome - totalExpenses;
  const cashBalance = cashRevenue + totalInvestments - cashExpenses - cashPurchases;
  
  return {
    income: {
      revenue,
      investments: totalInvestments,
      total: totalIncome,
    },
    expenses: {
      purchases: purchaseCosts,
      operating: operatingExpenses,
      total: totalExpenses,
    },
    balance: {
      net: netBalance,
      cash: cashBalance,
    },
    breakdown: {
      cashRevenue,
      cashExpenses,
      cashPurchases,
    },
  };
};

export const getCurrentBalance = () => {
  // Get all-time cash flow
  const allOrders = getOrders();
  const allPurchases = getPurchases();
  const allExpenses = JSON.parse(localStorage.getItem('cafe_expenses') || '[]');
  const allInvestments = JSON.parse(localStorage.getItem('cafe_investments') || '[]');
  
  const totalRevenue = allOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalPurchases = allPurchases.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
  const totalExpenses = allExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  const totalInvestments = allInvestments.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
  
  const totalIncome = totalRevenue + totalInvestments;
  const totalCosts = totalPurchases + totalExpenses;
  const currentBalance = totalIncome - totalCosts;
  
  return {
    totalIncome,
    totalCosts,
    currentBalance,
    breakdown: {
      revenue: totalRevenue,
      investments: totalInvestments,
      purchases: totalPurchases,
      expenses: totalExpenses,
    },
  };
};

// ==================== DATA EXPORT ====================

export const exportAllData = () => {
  return {
    orders: getOrders(),
    menu: getMenuItems(),
    inventory: getInventory(),
    purchases: getPurchases(),
    expenses: JSON.parse(localStorage.getItem('cafe_expenses') || '[]'),
    investments: JSON.parse(localStorage.getItem('cafe_investments') || '[]'),
    exportDate: new Date().toISOString(),
    version: '1.0',
  };
};

export const importAllData = (data) => {
  try {
    if (data.orders) localStorage.setItem(ORDERS_KEY, JSON.stringify(data.orders));
    if (data.menu) localStorage.setItem(MENU_KEY, JSON.stringify(data.menu));
    if (data.inventory) localStorage.setItem(INVENTORY_KEY, JSON.stringify(data.inventory));
    if (data.purchases) localStorage.setItem(PURCHASES_KEY, JSON.stringify(data.purchases));
    if (data.expenses) localStorage.setItem('cafe_expenses', JSON.stringify(data.expenses));
    if (data.investments) localStorage.setItem('cafe_investments', JSON.stringify(data.investments));
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};

export const getDashboardStats = () => {
  const orders = getOrders();
  const inventory = getInventory();
  const purchases = getPurchases();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayOrders = orders.filter(o => new Date(o.createdAt) >= today);
  const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  
  const lowStock = getLowStockItems();
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const creditInfo = getCreditOrders();
  const inventoryVal = getInventoryValuation();
  
  return {
    todayOrders: todayOrders.length,
    todayRevenue,
    totalOrders: orders.length,
    lowStockCount: lowStock.length,
    pendingOrders,
    totalInventoryItems: inventory.length,
    totalPurchases: purchases.length,
    creditOrdersCount: creditInfo.count,
    creditOrdersPending: creditInfo.totalPending,
    inventoryValue: inventoryVal.totalValue,
  };
};
