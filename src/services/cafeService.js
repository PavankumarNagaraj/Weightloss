// Production-Ready Cafe Service using Supabase Database
import { supabase } from '../config/supabase';

// ==================== MIGRATION UTILITIES ====================

export const migrateOrderDates = async () => {
  try {
    // This function is for backward compatibility with localStorage migration
    // In Supabase, all orders already have proper date fields
    // This is a no-op for the database version
    console.log('✅ Migration not needed - using Supabase database');
    return true;
  } catch (error) {
    console.error('Error in migration check:', error);
    return false;
  }
};

// ==================== MENU MANAGEMENT ====================

export const getMenuItems = async () => {
  try {
    const { data, error } = await supabase
      .from('cafe_menu')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting menu items:', error);
    return [];
  }
};

export const addMenuItem = async (itemData) => {
  try {
    const { data, error } = await supabase
      .from('cafe_menu')
      .insert([{
        name: itemData.name,
        category: itemData.category,
        customer_price: itemData.customerPrice,
        trainer_price: itemData.trainerPrice,
        description: itemData.description,
        is_veg: itemData.isVeg,
        raw_materials: itemData.rawMaterials || [],
        is_active: true,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding menu item:', error);
    throw error;
  }
};

export const updateMenuItem = async (itemId, updates) => {
  try {
    const updateData = {
      name: updates.name,
      category: updates.category,
      customer_price: updates.customerPrice,
      trainer_price: updates.trainerPrice,
      description: updates.description,
      is_veg: updates.isVeg,
      raw_materials: updates.rawMaterials,
    };

    const { data, error } = await supabase
      .from('cafe_menu')
      .update(updateData)
      .eq('id', itemId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating menu item:', error);
    throw error;
  }
};

export const deleteMenuItem = async (itemId) => {
  try {
    const { error } = await supabase
      .from('cafe_menu')
      .delete()
      .eq('id', itemId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting menu item:', error);
    throw error;
  }
};

// ==================== INVENTORY MANAGEMENT ====================

export const getInventory = async () => {
  try {
    const { data, error } = await supabase
      .from('cafe_inventory')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    
    // Map snake_case to camelCase for compatibility
    const mappedInventory = (data || []).map(item => ({
      ...item,
      currentStock: item.current_stock ?? item.currentStock,
      minStock: item.min_stock ?? item.minStock,
      maxStock: item.max_stock ?? item.maxStock,
      pricePerUnit: item.price_per_unit ?? item.pricePerUnit,
      lastPurchasePrice: item.last_purchase_price ?? item.lastPurchasePrice,
      lastPurchaseDate: item.last_purchase_date ?? item.lastPurchaseDate,
      createdAt: item.created_at ?? item.createdAt,
      updatedAt: item.updated_at ?? item.updatedAt,
    }));
    
    return mappedInventory;
  } catch (error) {
    console.error('Error getting inventory:', error);
    return [];
  }
};

export const addInventoryItem = async (itemData) => {
  try {
    const { data, error } = await supabase
      .from('cafe_inventory')
      .insert([{
        name: itemData.name,
        current_stock: itemData.currentStock || 0,
        min_stock: itemData.minStock || 0,
        unit: itemData.unit,
        category: itemData.category,
        price_per_unit: itemData.pricePerUnit || 0,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding inventory item:', error);
    throw error;
  }
};

export const updateInventoryStock = async (itemId, quantity, type = 'add') => {
  try {
    // First get current stock
    const { data: currentItem, error: fetchError } = await supabase
      .from('cafe_inventory')
      .select('current_stock')
      .eq('id', itemId)
      .single();

    if (fetchError) throw fetchError;

    let newStock;
    if (type === 'add') {
      newStock = parseFloat(currentItem.current_stock) + parseFloat(quantity);
    } else if (type === 'subtract') {
      newStock = parseFloat(currentItem.current_stock) - parseFloat(quantity);
    } else {
      newStock = parseFloat(quantity);
    }

    const { data, error } = await supabase
      .from('cafe_inventory')
      .update({ current_stock: newStock })
      .eq('id', itemId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating inventory stock:', error);
    throw error;
  }
};

export const updateInventoryItem = async (itemId, updates) => {
  try {
    const { data, error } = await supabase
      .from('cafe_inventory')
      .update({
        name: updates.name,
        current_stock: updates.currentStock,
        min_stock: updates.minStock,
        unit: updates.unit,
        category: updates.category,
        price_per_unit: updates.pricePerUnit,
      })
      .eq('id', itemId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating inventory item:', error);
    throw error;
  }
};

export const deleteInventoryItem = async (itemId) => {
  try {
    const { error } = await supabase
      .from('cafe_inventory')
      .delete()
      .eq('id', itemId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    throw error;
  }
};

export const getLowStockItems = async () => {
  try {
    const { data, error } = await supabase
      .from('cafe_low_stock_items')
      .select('*');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting low stock items:', error);
    return [];
  }
};

// ==================== PURCHASES MANAGEMENT ====================

export const getPurchases = async () => {
  try {
    const { data, error } = await supabase
      .from('cafe_purchases')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting purchases:', error);
    return [];
  }
};

export const addPurchase = async (purchaseData) => {
  try {
    const purchaseDate = new Date().toISOString();
    const purchaseDateOnly = purchaseDate.split('T')[0];

    // Insert purchase
    const { data: newPurchase, error: purchaseError } = await supabase
      .from('cafe_purchases')
      .insert([{
        order_number: `PO${Date.now().toString().slice(-6)}`,
        supplier_name: purchaseData.supplierName,
        items: purchaseData.items || [],
        total_amount: purchaseData.totalAmount,
        notes: purchaseData.notes,
        date: purchaseDateOnly,
        status: 'completed',
      }])
      .select()
      .single();

    if (purchaseError) throw purchaseError;

    // Create expense entry
    const { error: expenseError } = await supabase
      .from('cafe_expenses')
      .insert([{
        category: 'Inventory Purchase',
        description: `Purchase from ${purchaseData.supplierName} - ${purchaseData.items?.length || 0} items`,
        amount: purchaseData.totalAmount,
        date: purchaseDateOnly,
        purchase_id: newPurchase.id,
        order_number: newPurchase.order_number,
        notes: purchaseData.notes || '',
      }]);

    if (expenseError) throw expenseError;

    // Update inventory stock
    if (purchaseData.items && purchaseData.items.length > 0) {
      for (const item of purchaseData.items) {
        // Find inventory item by name
        const { data: inventoryItems, error: findError } = await supabase
          .from('cafe_inventory')
          .select('*')
          .ilike('name', item.materialName)
          .limit(1);

        if (findError) {
          console.error('Error finding inventory item:', findError);
          continue;
        }

        if (inventoryItems && inventoryItems.length > 0) {
          const inventoryItem = inventoryItems[0];
          const currentStock = parseFloat(inventoryItem.current_stock) || 0;
          const purchaseQty = parseFloat(item.quantity) || 0;
          const newStock = currentStock + purchaseQty;

          // Calculate weighted average price
          const currentValue = currentStock * (parseFloat(inventoryItem.price_per_unit) || 0);
          const purchaseValue = purchaseQty * (parseFloat(item.pricePerUnit) || 0);
          const totalValue = currentValue + purchaseValue;
          const totalQuantity = newStock;
          const newPricePerUnit = totalQuantity > 0 ? totalValue / totalQuantity : item.pricePerUnit;

          await supabase
            .from('cafe_inventory')
            .update({
              current_stock: newStock,
              price_per_unit: newPricePerUnit,
              last_purchase_price: item.pricePerUnit,
            })
            .eq('id', inventoryItem.id);
        }
      }
    }

    return newPurchase;
  } catch (error) {
    console.error('Error adding purchase:', error);
    throw error;
  }
};

export const updatePurchase = async (purchaseId, purchaseData) => {
  try {
    const { data, error } = await supabase
      .from('cafe_purchases')
      .update({
        supplier_name: purchaseData.supplierName,
        items: purchaseData.items || [],
        total_amount: purchaseData.totalAmount,
        notes: purchaseData.notes,
      })
      .eq('id', purchaseId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating purchase:', error);
    throw error;
  }
};

export const deletePurchase = async (purchaseId) => {
  try {
    const { error } = await supabase
      .from('cafe_purchases')
      .delete()
      .eq('id', purchaseId);

    if (error) throw error;
    
    // Also delete associated expense entry
    await supabase
      .from('cafe_expenses')
      .delete()
      .eq('purchase_id', purchaseId);
      
    return true;
  } catch (error) {
    console.error('Error deleting purchase:', error);
    throw error;
  }
};

export const getPurchaseStats = async (startDate, endDate) => {
  try {
    let query = supabase
      .from('cafe_purchases')
      .select('total_amount, date');

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    const total = data.reduce((sum, p) => sum + parseFloat(p.total_amount || 0), 0);
    return {
      total,
      count: data.length,
      purchases: data,
    };
  } catch (error) {
    console.error('Error getting purchase stats:', error);
    return { total: 0, count: 0, purchases: [] };
  }
};

// ==================== ORDERS MANAGEMENT ====================

export const getOrders = async () => {
  try {
    const { data, error } = await supabase
      .from('cafe_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Map snake_case to camelCase for compatibility
    const mappedOrders = (data || []).map(order => ({
      ...order,
      orderNumber: order.order_number ?? order.orderNumber,
      customerName: order.customer_name ?? order.customerName,
      customerType: order.customer_type ?? order.customerType,
      paymentMethod: order.payment_method ?? order.paymentMethod,
      totalAmount: order.total_amount ?? order.totalAmount,
      paymentReceived: order.payment_received ?? order.paymentReceived,
      createdAt: order.created_at ?? order.createdAt,
    }));
    
    return mappedOrders;
  } catch (error) {
    console.error('Error getting orders:', error);
    return [];
  }
};

export const createOrder = async (orderData) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Insert order
    const { data: newOrder, error: orderError } = await supabase
      .from('cafe_orders')
      .insert([{
        order_number: `ORD${Date.now().toString().slice(-6)}`,
        customer_name: orderData.customerName || 'Walk-in Customer',
        customer_type: orderData.customerType,
        user_id: orderData.userId || null,
        items: orderData.items || [],
        subtotal: orderData.subtotal,
        discount: orderData.discount || 0,
        total_amount: orderData.totalAmount,
        payment_method: orderData.paymentMethod,
        payment_received: orderData.paymentReceived || orderData.totalAmount,
        status: 'completed',
        date: today,
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    // Deduct inventory based on menu item raw materials
    if (orderData.items && orderData.items.length > 0) {
      // Get all menu items to find raw materials
      const { data: menuItems, error: menuError } = await supabase
        .from('cafe_menu')
        .select('*');

      if (menuError) {
        console.error('Error fetching menu items:', menuError);
      } else {
        for (const orderItem of orderData.items) {
          const menuItem = menuItems.find(m => m.id === orderItem.id || m.name === orderItem.name);

          if (menuItem && menuItem.raw_materials && menuItem.raw_materials.length > 0) {
            for (const material of menuItem.raw_materials) {
              // Find inventory item
              const { data: inventoryItems, error: invError } = await supabase
                .from('cafe_inventory')
                .select('*')
                .ilike('name', material.name)
                .limit(1);

              if (!invError && inventoryItems && inventoryItems.length > 0) {
                const inventoryItem = inventoryItems[0];
                // Base quantity deduction
                const baseQuantityToDeduct = parseFloat(material.quantity) * orderItem.quantity;
                
                // Check if this ingredient has extra quantity added
                const extraIngredient = (orderItem.extraIngredients || []).find(
                  e => e.name.toLowerCase() === material.name.toLowerCase()
                );
                const extraQuantity = extraIngredient ? parseFloat(extraIngredient.quantity) : 0;
                
                // Total deduction = base + extra
                const quantityToDeduct = baseQuantityToDeduct + extraQuantity;
                const newStock = parseFloat(inventoryItem.current_stock) - quantityToDeduct;

                await supabase
                  .from('cafe_inventory')
                  .update({ current_stock: Math.max(0, newStock) })
                  .eq('id', inventoryItem.id);
              }
            }
          }
        }
      }
    }

    return newOrder;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const updateOrder = async (orderId, orderData) => {
  try {
    const { data, error } = await supabase
      .from('cafe_orders')
      .update({
        discount: orderData.discount,
        total_amount: orderData.totalAmount,
        subtotal: orderData.subtotal,
        payment_received: orderData.paymentReceived,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
};

export const deleteOrder = async (orderId) => {
  try {
    const { error } = await supabase
      .from('cafe_orders')
      .delete()
      .eq('id', orderId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const updateData = {
      status,
      ...(status === 'delivered' && { delivered_at: new Date().toISOString() }),
    };

    const { data, error } = await supabase
      .from('cafe_orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

export const getOrdersByUser = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('cafe_orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting user orders:', error);
    return [];
  }
};

// ==================== EXPENSES MANAGEMENT ====================

export const getExpenses = async () => {
  try {
    const { data, error } = await supabase
      .from('cafe_expenses')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting expenses:', error);
    return [];
  }
};

export const addExpense = async (expenseData) => {
  try {
    const { data, error } = await supabase
      .from('cafe_expenses')
      .insert([{
        category: expenseData.category,
        description: expenseData.description,
        amount: expenseData.amount,
        payment_method: expenseData.paymentMethod,
        date: expenseData.date || new Date().toISOString().split('T')[0],
        notes: expenseData.notes,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding expense:', error);
    throw error;
  }
};

export const updateExpense = async (expenseId, updates) => {
  try {
    const { data, error } = await supabase
      .from('cafe_expenses')
      .update({
        category: updates.category,
        description: updates.description,
        amount: updates.amount,
        payment_method: updates.paymentMethod,
        date: updates.date,
        notes: updates.notes,
      })
      .eq('id', expenseId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating expense:', error);
    throw error;
  }
};

export const deleteExpense = async (expenseId) => {
  try {
    const { error } = await supabase
      .from('cafe_expenses')
      .delete()
      .eq('id', expenseId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
};

// ==================== DASHBOARD & STATS ====================

export const getDashboardStats = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Get today's orders
    const { data: todayOrders, error: ordersError } = await supabase
      .from('cafe_orders')
      .select('total_amount')
      .eq('date', today);

    if (ordersError) throw ordersError;

    // Get all orders count
    const { count: totalOrdersCount, error: countError } = await supabase
      .from('cafe_orders')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    // Get low stock count
    const { data: lowStock, error: lowStockError } = await supabase
      .from('cafe_low_stock_items')
      .select('*');

    if (lowStockError) throw lowStockError;

    const todayRevenue = todayOrders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);

    return {
      todayOrders: todayOrders.length,
      todayRevenue,
      totalOrders: totalOrdersCount || 0,
      lowStockCount: lowStock.length,
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return {
      todayOrders: 0,
      todayRevenue: 0,
      totalOrders: 0,
      lowStockCount: 0,
    };
  }
};

export const getCurrentBalance = async () => {
  try {
    // Get total revenue
    const { data: orders, error: ordersError } = await supabase
      .from('cafe_orders')
      .select('total_amount, payment_received');

    if (ordersError) throw ordersError;

    const revenue = orders.reduce((sum, o) => sum + parseFloat(o.payment_received || o.total_amount || 0), 0);

    // Get total purchases
    const { data: purchases, error: purchasesError } = await supabase
      .from('cafe_purchases')
      .select('total_amount');

    if (purchasesError) throw purchasesError;

    const purchasesTotal = purchases.reduce((sum, p) => sum + parseFloat(p.total_amount || 0), 0);

    // Get total expenses
    const { data: expenses, error: expensesError } = await supabase
      .from('cafe_expenses')
      .select('amount');

    if (expensesError) throw expensesError;

    const expensesTotal = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

    // Get total investments
    const { data: investments, error: investmentsError } = await supabase
      .from('cafe_investments')
      .select('amount');

    if (investmentsError) {
      console.error('Error getting investments:', investmentsError);
    }

    const investmentsTotal = investments ? investments.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0) : 0;

    const totalIncome = revenue + investmentsTotal;
    const totalCosts = purchasesTotal + expensesTotal;
    const currentBalance = totalIncome - totalCosts;

    return {
      currentBalance,
      totalIncome,
      totalCosts,
      breakdown: {
        revenue,
        investments: investmentsTotal,
        purchases: purchasesTotal,
        expenses: expensesTotal,
      },
    };
  } catch (error) {
    console.error('Error getting current balance:', error);
    return {
      currentBalance: 0,
      totalIncome: 0,
      totalCosts: 0,
      breakdown: {
        revenue: 0,
        investments: 0,
        purchases: 0,
        expenses: 0,
      },
    };
  }
};

// ==================== INVESTMENTS ====================

export const getInvestments = async () => {
  try {
    const { data, error } = await supabase
      .from('cafe_investments')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting investments:', error);
    return [];
  }
};

export const addInvestment = async (investmentData) => {
  try {
    const { data, error } = await supabase
      .from('cafe_investments')
      .insert([{
        partner_name: investmentData.partnerName,
        amount: investmentData.amount,
        date: investmentData.date || new Date().toISOString().split('T')[0],
        notes: investmentData.notes || '',
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding investment:', error);
    throw error;
  }
};

export const updateInvestment = async (id, investmentData) => {
  try {
    const { data, error } = await supabase
      .from('cafe_investments')
      .update({
        partner_name: investmentData.partnerName,
        amount: investmentData.amount,
        date: investmentData.date,
        notes: investmentData.notes || '',
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating investment:', error);
    throw error;
  }
};

export const deleteInvestment = async (id) => {
  try {
    const { error } = await supabase
      .from('cafe_investments')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting investment:', error);
    throw error;
  }
};

// ==================== DATA EXPORT/IMPORT ====================

export const exportAllData = async () => {
  try {
    const [orders, menu, inventory, purchases, expenses, investments] = await Promise.all([
      getOrders(),
      getMenuItems(),
      getInventory(),
      getPurchases(),
      getExpenses(),
      getInvestments(),
    ]);

    return {
      orders,
      menu,
      inventory,
      purchases,
      expenses,
      investments,
      exportedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error exporting data:', error);
    throw error;
  }
};

export const importAllData = async (data) => {
  try {
    const results = {
      orders: 0,
      menu: 0,
      inventory: 0,
      purchases: 0,
      expenses: 0,
      investments: 0,
      errors: [],
    };

    // Import menu items
    if (data.menu && Array.isArray(data.menu)) {
      for (const item of data.menu) {
        try {
          await addMenuItem(item);
          results.menu++;
        } catch (error) {
          results.errors.push(`Menu item ${item.name}: ${error.message}`);
        }
      }
    }

    // Import inventory items
    if (data.inventory && Array.isArray(data.inventory)) {
      for (const item of data.inventory) {
        try {
          await addInventoryItem(item);
          results.inventory++;
        } catch (error) {
          results.errors.push(`Inventory item ${item.name}: ${error.message}`);
        }
      }
    }

    // Import purchases
    if (data.purchases && Array.isArray(data.purchases)) {
      for (const purchase of data.purchases) {
        try {
          await addPurchase(purchase);
          results.purchases++;
        } catch (error) {
          results.errors.push(`Purchase ${purchase.orderNumber}: ${error.message}`);
        }
      }
    }

    // Import expenses
    if (data.expenses && Array.isArray(data.expenses)) {
      for (const expense of data.expenses) {
        try {
          await addExpense(expense);
          results.expenses++;
        } catch (error) {
          results.errors.push(`Expense: ${error.message}`);
        }
      }
    }

    // Import investments
    if (data.investments && Array.isArray(data.investments)) {
      for (const investment of data.investments) {
        try {
          await addInvestment(investment);
          results.investments++;
        } catch (error) {
          results.errors.push(`Investment: ${error.message}`);
        }
      }
    }

    // Import orders (last, as they depend on menu and inventory)
    if (data.orders && Array.isArray(data.orders)) {
      for (const order of data.orders) {
        try {
          await createOrder(order);
          results.orders++;
        } catch (error) {
          results.errors.push(`Order ${order.orderNumber}: ${error.message}`);
        }
      }
    }

    console.log('Import results:', results);
    return results.errors.length === 0;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};

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

// ==================== WEEKLY MEAL PLANS ====================

export const getWeeklyPlans = async () => {
  try {
    const { data, error } = await supabase
      .from('cafe_weekly_plans')
      .select('*')
      .order('week_start_date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting weekly plans:', error);
    return [];
  }
};

export const getWeeklyPlan = async (weekStartDate) => {
  try {
    const { data, error } = await supabase
      .from('cafe_weekly_plans')
      .select('*')
      .eq('week_start_date', weekStartDate)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
    return data;
  } catch (error) {
    console.error('Error getting weekly plan:', error);
    return null;
  }
};

export const saveWeeklyPlan = async (weekStartDate, planData) => {
  try {
    const { data, error } = await supabase
      .from('cafe_weekly_plans')
      .upsert({
        week_start_date: weekStartDate,
        plan_data: planData,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'week_start_date'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving weekly plan:', error);
    throw error;
  }
};

export const deleteWeeklyPlan = async (weekStartDate) => {
  try {
    const { error } = await supabase
      .from('cafe_weekly_plans')
      .delete()
      .eq('week_start_date', weekStartDate);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting weekly plan:', error);
    throw error;
  }
};

// ==================== SETTINGS ====================

export const getSettings = async () => {
  try {
    const { data, error } = await supabase
      .from('cafe_settings')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
    
    // Return default settings if none exist
    if (!data) {
      return {
        cron_time: '23:55',
        recipient_email: '',
        recipient_name: '',
        auto_send_enabled: true,
      };
    }
    
    return data;
  } catch (error) {
    console.error('Error getting settings:', error);
    return {
      cron_time: '23:55',
      recipient_email: '',
      recipient_name: '',
      auto_send_enabled: true,
    };
  }
};

export const saveSettings = async (settingsData) => {
  try {
    const { data, error } = await supabase
      .from('cafe_settings')
      .upsert({
        id: 1, // Single row for settings
        cron_time: settingsData.cronTime,
        recipient_email: settingsData.recipientEmail,
        recipient_name: settingsData.recipientName,
        auto_send_enabled: settingsData.autoSendEnabled,
        last_email_sent: settingsData.lastEmailSent || null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
};

// ==================== CLEAR ALL DATA ====================

// ==================== RECIPE MANAGEMENT ====================

export const getRecipes = async () => {
  try {
    const { data, error } = await supabase
      .from('cafe_recipes')
      .select(`
        *,
        menu_item:cafe_menu(id, name, price),
        ingredients:cafe_recipe_ingredients(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting recipes:', error);
    return [];
  }
};

export const addRecipe = async (recipeData) => {
  try {
    const { data: recipe, error: recipeError } = await supabase
      .from('cafe_recipes')
      .insert([{
        menu_item_id: recipeData.menuItemId,
        recipe_name: recipeData.recipeName,
        portion_size: recipeData.portionSize,
        portion_unit: recipeData.portionUnit,
        preparation_time: recipeData.preparationTime,
        cooking_time: recipeData.cookingTime,
        instructions: recipeData.instructions,
        notes: recipeData.notes,
      }])
      .select()
      .single();

    if (recipeError) throw recipeError;

    // Add ingredients
    if (recipeData.ingredients && recipeData.ingredients.length > 0) {
      const ingredients = recipeData.ingredients.map(ing => ({
        recipe_id: recipe.id,
        inventory_item_id: ing.inventoryItemId,
        ingredient_name: ing.ingredientName,
        quantity: ing.quantity,
        unit: ing.unit,
        cost_per_unit: ing.costPerUnit,
        total_cost: ing.quantity * ing.costPerUnit,
      }));

      const { error: ingredientsError } = await supabase
        .from('cafe_recipe_ingredients')
        .insert(ingredients);

      if (ingredientsError) throw ingredientsError;
    }

    return recipe;
  } catch (error) {
    console.error('Error adding recipe:', error);
    throw error;
  }
};

export const updateRecipe = async (recipeId, recipeData) => {
  try {
    const { data, error } = await supabase
      .from('cafe_recipes')
      .update({
        recipe_name: recipeData.recipeName,
        portion_size: recipeData.portionSize,
        portion_unit: recipeData.portionUnit,
        preparation_time: recipeData.preparationTime,
        cooking_time: recipeData.cookingTime,
        instructions: recipeData.instructions,
        notes: recipeData.notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', recipeId)
      .select()
      .single();

    if (error) throw error;

    // Update ingredients - delete old and insert new
    if (recipeData.ingredients) {
      await supabase
        .from('cafe_recipe_ingredients')
        .delete()
        .eq('recipe_id', recipeId);

      if (recipeData.ingredients.length > 0) {
        const ingredients = recipeData.ingredients.map(ing => ({
          recipe_id: recipeId,
          inventory_item_id: ing.inventoryItemId,
          ingredient_name: ing.ingredientName,
          quantity: ing.quantity,
          unit: ing.unit,
          cost_per_unit: ing.costPerUnit,
          total_cost: ing.quantity * ing.costPerUnit,
        }));

        await supabase
          .from('cafe_recipe_ingredients')
          .insert(ingredients);
      }
    }

    return data;
  } catch (error) {
    console.error('Error updating recipe:', error);
    throw error;
  }
};

export const deleteRecipe = async (recipeId) => {
  try {
    const { error } = await supabase
      .from('cafe_recipes')
      .delete()
      .eq('id', recipeId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting recipe:', error);
    throw error;
  }
};

export const getRecipeCost = async (recipeId) => {
  try {
    const { data, error } = await supabase
      .from('cafe_recipe_ingredients')
      .select('total_cost')
      .eq('recipe_id', recipeId);

    if (error) throw error;
    
    const totalCost = (data || []).reduce((sum, ing) => sum + (parseFloat(ing.total_cost) || 0), 0);
    return totalCost;
  } catch (error) {
    console.error('Error calculating recipe cost:', error);
    return 0;
  }
};

// ==================== WASTE MANAGEMENT ====================

export const getWasteLogs = async () => {
  try {
    const { data, error } = await supabase
      .from('cafe_waste_log')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting waste logs:', error);
    return [];
  }
};

export const addWasteLog = async (wasteData) => {
  try {
    const { data, error } = await supabase
      .from('cafe_waste_log')
      .insert([{
        inventory_item_id: wasteData.inventoryItemId,
        item_name: wasteData.itemName,
        quantity: wasteData.quantity,
        unit: wasteData.unit,
        cost_per_unit: wasteData.costPerUnit,
        total_cost: wasteData.quantity * wasteData.costPerUnit,
        waste_reason: wasteData.wasteReason,
        date: wasteData.date || new Date().toISOString().split('T')[0],
        notes: wasteData.notes,
        recorded_by: wasteData.recordedBy,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding waste log:', error);
    throw error;
  }
};

export const deleteWasteLog = async (wasteId) => {
  try {
    const { error } = await supabase
      .from('cafe_waste_log')
      .delete()
      .eq('id', wasteId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting waste log:', error);
    throw error;
  }
};

export const getWasteAnalytics = async (startDate, endDate) => {
  try {
    const { data, error } = await supabase
      .from('cafe_waste_log')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) throw error;

    const totalCost = (data || []).reduce((sum, log) => sum + (parseFloat(log.total_cost) || 0), 0);
    const totalQuantity = (data || []).reduce((sum, log) => sum + (parseFloat(log.quantity) || 0), 0);
    
    // Group by reason
    const byReason = {};
    (data || []).forEach(log => {
      if (!byReason[log.waste_reason]) {
        byReason[log.waste_reason] = { count: 0, cost: 0 };
      }
      byReason[log.waste_reason].count++;
      byReason[log.waste_reason].cost += parseFloat(log.total_cost) || 0;
    });

    return {
      totalCost,
      totalQuantity,
      totalLogs: data?.length || 0,
      byReason,
      logs: data || []
    };
  } catch (error) {
    console.error('Error getting waste analytics:', error);
    return { totalCost: 0, totalQuantity: 0, totalLogs: 0, byReason: {}, logs: [] };
  }
};

// ==================== COST ANALYSIS ====================

export const getMenuItemProfitMargin = async (menuItemId) => {
  try {
    // Get menu item price
    const { data: menuItem, error: menuError } = await supabase
      .from('cafe_menu')
      .select('price')
      .eq('id', menuItemId)
      .single();

    if (menuError) throw menuError;

    // Get recipe cost
    const { data: recipe, error: recipeError } = await supabase
      .from('cafe_recipes')
      .select('id')
      .eq('menu_item_id', menuItemId)
      .single();

    if (recipeError || !recipe) {
      return { hasRecipe: false, price: menuItem.price };
    }

    const recipeCost = await getRecipeCost(recipe.id);
    const price = parseFloat(menuItem.price) || 0;
    const profit = price - recipeCost;
    const profitMargin = price > 0 ? (profit / price) * 100 : 0;

    return {
      hasRecipe: true,
      price,
      cost: recipeCost,
      profit,
      profitMargin,
    };
  } catch (error) {
    console.error('Error calculating profit margin:', error);
    return { hasRecipe: false };
  }
};

export const getAllMenuItemsCostAnalysis = async () => {
  try {
    const menuItems = await getMenuItems();
    const analysis = [];

    for (const item of menuItems) {
      const profitData = await getMenuItemProfitMargin(item.id);
      analysis.push({
        ...item,
        ...profitData,
      });
    }

    return analysis;
  } catch (error) {
    console.error('Error getting cost analysis:', error);
    return [];
  }
};

// ==================== CLEAR ALL DATA ====================

export const clearAllCafeData = async (password) => {
  // Password verification (change this to your desired password)
  const ADMIN_PASSWORD = 'cafe2024';
  
  if (password !== ADMIN_PASSWORD) {
    throw new Error('Incorrect password');
  }

  try {
    const tables = [
      'cafe_orders',
      'cafe_menu',
      'cafe_inventory',
      'cafe_purchases',
      'cafe_expenses',
      'cafe_investments',
      'cafe_weekly_plans'
    ];

    const results = [];
    let totalDeleted = 0;
    
    console.log('🗑️ Starting Clear All Data operation...');
    
    for (const table of tables) {
      console.log(`\n📋 Processing table: ${table}`);
      
      // First get all records to count them
      const { data: records, error: fetchError } = await supabase
        .from(table)
        .select('id');
      
      if (fetchError) {
        console.error(`❌ Error fetching ${table}:`, fetchError);
        results.push({ table, success: false, error: fetchError.message, deleted: 0 });
        continue;
      }

      const recordCount = records?.length || 0;
      console.log(`   Found ${recordCount} records in ${table}`);

      if (recordCount === 0) {
        console.log(`   ⚠️ Table ${table} is already empty`);
        results.push({ table, success: true, deleted: 0 });
        continue;
      }

      // Delete all records using their IDs (works with UUID or integer IDs)
      console.log(`   🔄 Attempting to delete ${recordCount} records...`);
      
      const ids = records.map(r => r.id);
      
      const deleteResult = await supabase
        .from(table)
        .delete()
        .in('id', ids);
      
      if (deleteResult.error) {
        console.error(`❌ Delete failed for ${table}:`, deleteResult.error);
        results.push({ table, success: false, error: deleteResult.error.message, deleted: 0 });
      } else {
        // Verify deletion by checking if records still exist
        const { data: remainingRecords } = await supabase
          .from(table)
          .select('id')
          .limit(1);
        
        const actuallyDeleted = remainingRecords?.length === 0;
        console.log(`   ${actuallyDeleted ? '✅' : '❌'} Delete result for ${table}:`, {
          attempted: recordCount,
          remaining: remainingRecords?.length || 0,
          success: actuallyDeleted
        });
        
        totalDeleted += actuallyDeleted ? recordCount : 0;
        results.push({ 
          table, 
          success: actuallyDeleted, 
          deleted: actuallyDeleted ? recordCount : 0,
          error: actuallyDeleted ? null : 'Records still exist after delete'
        });
      }
    }

    console.log('\n📊 Clear All Data Summary:', {
      totalDeleted,
      results
    });

    return {
      success: totalDeleted > 0,
      results,
      totalDeleted,
      message: totalDeleted > 0 
        ? `Successfully deleted ${totalDeleted} records` 
        : 'No records were deleted. Check console for details.'
    };
  } catch (error) {
    console.error('❌ Error clearing all data:', error);
    throw error;
  }
};

// ==================== CUSTOMER MANAGEMENT ====================

export const getCustomers = async () => {
  try {
    const { data, error } = await supabase
      .from('cafe_customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting customers:', error);
    return [];
  }
};

export const getCustomerById = async (customerId) => {
  try {
    const { data, error } = await supabase
      .from('cafe_customers')
      .select('*')
      .eq('id', customerId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting customer:', error);
    return null;
  }
};

export const addCustomer = async (customerData) => {
  try {
    const { data, error } = await supabase
      .from('cafe_customers')
      .insert([{
        name: customerData.name,
        phone: customerData.phone,
        email: customerData.email || null,
        address: customerData.address || null,
        notes: customerData.notes || null,
        customer_type: customerData.customerType || 'regular',
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding customer:', error);
    throw error;
  }
};

export const updateCustomer = async (customerId, customerData) => {
  try {
    const { data, error } = await supabase
      .from('cafe_customers')
      .update({
        name: customerData.name,
        phone: customerData.phone,
        email: customerData.email,
        address: customerData.address,
        notes: customerData.notes,
        customer_type: customerData.customerType,
      })
      .eq('id', customerId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating customer:', error);
    throw error;
  }
};

export const deleteCustomer = async (customerId) => {
  try {
    const { error } = await supabase
      .from('cafe_customers')
      .delete()
      .eq('id', customerId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting customer:', error);
    throw error;
  }
};

// ==================== SUBSCRIPTION MANAGEMENT ====================

export const getSubscriptions = async () => {
  try {
    const { data, error } = await supabase
      .from('cafe_subscriptions')
      .select(`
        *,
        customer:cafe_customers(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting subscriptions:', error);
    return [];
  }
};

export const getActiveSubscriptions = async () => {
  try {
    const { data, error } = await supabase
      .from('cafe_subscriptions')
      .select(`
        *,
        customer:cafe_customers(*)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting active subscriptions:', error);
    return [];
  }
};

export const getSubscriptionById = async (subscriptionId) => {
  try {
    const { data, error } = await supabase
      .from('cafe_subscriptions')
      .select(`
        *,
        customer:cafe_customers(*)
      `)
      .eq('id', subscriptionId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting subscription:', error);
    return null;
  }
};

export const addSubscription = async (subscriptionData) => {
  try {
    const { data, error } = await supabase
      .from('cafe_subscriptions')
      .insert([{
        customer_id: subscriptionData.customerId,
        plan_type: subscriptionData.planType,
        meal_types: subscriptionData.mealTypes || [],
        delivery_days: subscriptionData.deliveryDays || [],
        start_date: subscriptionData.startDate,
        end_date: subscriptionData.endDate,
        monthly_amount: subscriptionData.monthlyAmount,
        status: subscriptionData.status || 'active',
        delivery_time: subscriptionData.deliveryTime || null,
        special_instructions: subscriptionData.specialInstructions || null,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding subscription:', error);
    throw error;
  }
};

export const updateSubscription = async (subscriptionId, subscriptionData) => {
  try {
    const { data, error } = await supabase
      .from('cafe_subscriptions')
      .update({
        plan_type: subscriptionData.planType,
        meal_types: subscriptionData.mealTypes,
        delivery_days: subscriptionData.deliveryDays,
        start_date: subscriptionData.startDate,
        end_date: subscriptionData.endDate,
        monthly_amount: subscriptionData.monthlyAmount,
        status: subscriptionData.status,
        delivery_time: subscriptionData.deliveryTime,
        special_instructions: subscriptionData.specialInstructions,
      })
      .eq('id', subscriptionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
};

export const deleteSubscription = async (subscriptionId) => {
  try {
    const { error } = await supabase
      .from('cafe_subscriptions')
      .delete()
      .eq('id', subscriptionId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting subscription:', error);
    throw error;
  }
};

// ==================== SUBSCRIPTION BILLING ====================

export const getSubscriptionPayments = async (subscriptionId) => {
  try {
    const { data, error } = await supabase
      .from('cafe_subscription_payments')
      .select('*')
      .eq('subscription_id', subscriptionId)
      .order('payment_date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting subscription payments:', error);
    return [];
  }
};

export const addSubscriptionPayment = async (paymentData) => {
  try {
    const { data, error } = await supabase
      .from('cafe_subscription_payments')
      .insert([{
        subscription_id: paymentData.subscriptionId,
        amount: paymentData.amount,
        payment_date: paymentData.paymentDate || new Date().toISOString(),
        payment_method: paymentData.paymentMethod || 'cash',
        status: paymentData.status || 'paid',
        notes: paymentData.notes || null,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding subscription payment:', error);
    throw error;
  }
};

// ==================== DELIVERY TRACKING ====================

export const updateOrderDeliveryStatus = async (orderId, deliveryData) => {
  try {
    const { data, error } = await supabase
      .from('cafe_orders')
      .update({
        delivery_status: deliveryData.deliveryStatus,
        delivery_person: deliveryData.deliveryPerson || null,
        delivery_time: deliveryData.deliveryTime || null,
        delivery_notes: deliveryData.deliveryNotes || null,
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating delivery status:', error);
    throw error;
  }
};

export const getDeliveryOrders = async (date) => {
  try {
    const { data, error } = await supabase
      .from('cafe_orders')
      .select('*')
      .eq('order_type', 'delivery')
      .gte('created_at', date)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting delivery orders:', error);
    return [];
  }
};

// ==================== AUTO-GENERATE SUBSCRIPTION ORDERS ====================

export const generateSubscriptionOrders = async (date) => {
  try {
    const targetDate = new Date(date);
    const dayOfWeek = targetDate.toLocaleDateString('en-US', { weekday: 'long' });
    
    // Get active subscriptions for this day
    const { data: subscriptions, error: subError } = await supabase
      .from('cafe_subscriptions')
      .select(`
        *,
        customer:cafe_customers(*)
      `)
      .eq('status', 'active')
      .lte('start_date', date)
      .gte('end_date', date);

    if (subError) throw subError;

    // Get weekly plan for this date
    const weekStart = getWeekStart(targetDate);
    const weekKey = weekStart.toISOString().split('T')[0];
    const { data: weeklyPlan, error: planError } = await supabase
      .from('cafe_weekly_plans')
      .select('*')
      .eq('week_start', weekKey)
      .single();

    if (planError && planError.code !== 'PGRST116') throw planError;

    const generatedOrders = [];

    for (const subscription of subscriptions || []) {
      // Check if this day is in delivery days
      if (!subscription.delivery_days?.includes(dayOfWeek)) continue;

      // Generate orders for each meal type
      for (const mealType of subscription.meal_types || []) {
        const meal = weeklyPlan?.plan_data?.[dayOfWeek]?.[mealType];
        
        if (meal) {
          // Create order
          const orderData = {
            order_type: 'delivery',
            customer_type: 'subscription',
            items: [{
              id: meal.id,
              name: meal.name,
              price: meal.price || 0,
              quantity: 1,
            }],
            total: meal.price || 0,
            payment_method: 'subscription',
            status: 'pending',
            customer_name: subscription.customer?.name || 'Subscription Customer',
            customer_phone: subscription.customer?.phone || '',
            delivery_address: subscription.customer?.address || '',
            subscription_id: subscription.id,
            delivery_status: 'pending',
            notes: `Subscription Order - ${mealType}`,
          };

          const { data: order, error: orderError } = await supabase
            .from('cafe_orders')
            .insert([orderData])
            .select()
            .single();

          if (!orderError) {
            generatedOrders.push(order);
          }
        }
      }
    }

    return generatedOrders;
  } catch (error) {
    console.error('Error generating subscription orders:', error);
    throw error;
  }
};

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}
