// Cafe Management Service
import { generateShortId } from '../utils/idGenerator';

const ORDERS_KEY = 'cafe_orders';
const INVENTORY_KEY = 'cafe_inventory';
const PURCHASES_KEY = 'cafe_purchases';
const MENU_KEY = 'cafe_menu';

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
            inventory[invIndex].currentStock = parseFloat(inventory[invIndex].currentStock) + parseFloat(purchaseItem.quantity);
            inventory[invIndex].lastUpdated = new Date().toISOString();
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
  
  return {
    todayOrders: todayOrders.length,
    todayRevenue,
    totalOrders: orders.length,
    lowStockCount: lowStock.length,
    pendingOrders,
    totalInventoryItems: inventory.length,
    totalPurchases: purchases.length,
  };
};
