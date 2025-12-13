import { supabase } from '../config/supabase';
import { getOrders, getInventory, getMenuItems, getPurchases, getExpenses, getInvestments } from './cafeService';

// ==================== ANALYTICS FUNCTIONS ====================

export const getDishPerformance = async (startDate, endDate) => {
  const orders = await getOrders();
  const menuItems = await getMenuItems();
  
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
  
  const dishArray = Object.values(dishStats).map(dish => {
    const revenueShare = totalRevenue > 0 ? (dish.revenue / totalRevenue) * 100 : 0;
    const avgQuantityPerOrder = dish.orders > 0 ? dish.quantitySold / dish.orders : 0;
    const ordersPercentage = totalOrders > 0 ? (dish.orders / totalOrders) * 100 : 0;
    
    return {
      ...dish,
      revenueShare: revenueShare.toFixed(1),
      avgQuantityPerOrder: avgQuantityPerOrder.toFixed(1),
      ordersPercentage: ordersPercentage.toFixed(1),
    };
  });
  
  return {
    dishes: dishArray.sort((a, b) => b.revenue - a.revenue),
    totalRevenue,
    totalOrders,
    totalDishes: dishArray.length,
  };
};

export const getDishTrend = async (dishName, days = 30) => {
  const orders = await getOrders();
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
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

export const getInventoryTrend = async (materialName, days = 30) => {
  const orders = await getOrders();
  const purchases = await getPurchases();
  const inventory = await getInventory();
  const menuItems = await getMenuItems();
  
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
  
  let runningStock = currentStock;
  
  for (let i = dateArray.length - 1; i >= 0; i--) {
    const dayData = dateArray[i];
    
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
    
    if (i === dateArray.length - 1) {
      dayData.stock = currentStock;
    } else {
      runningStock = runningStock + dayUsage - dayPurchase;
      dayData.stock = Math.max(0, runningStock);
    }
  }
  
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

export const getInventoryDepletionRate = async (days = 7) => {
  const orders = await getOrders();
  const inventory = await getInventory();
  const menuItems = await getMenuItems();
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const recentOrders = orders.filter(o => new Date(o.createdAt) >= startDate);
  
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

export const getCreditOrders = async () => {
  const orders = await getOrders();
  
  const creditOrders = orders.filter(o => 
    o.paymentMethod === 'Credit' && 
    (!o.paymentReceived || o.paymentReceived < o.totalAmount)
  );
  
  const totalPending = creditOrders.reduce((sum, o) => {
    const pending = o.totalAmount - (o.paymentReceived || 0);
    return sum + pending;
  }, 0);
  
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

export const getInventoryValuation = async () => {
  const inventory = await getInventory();
  
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

export const getCashReconciliation = async (date = new Date()) => {
  const orders = await getOrders();
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
