// Production-Ready Cafe Service using Supabase Database
import { supabase, handleSupabaseError } from '../config/supabase';

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
    return data || [];
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
    return data || [];
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
                const quantityToDeduct = parseFloat(material.quantity) * orderItem.quantity;
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

    const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.payment_received || o.total_amount || 0), 0);

    // Get total expenses
    const { data: expenses, error: expensesError } = await supabase
      .from('cafe_expenses')
      .select('amount');

    if (expensesError) throw expensesError;

    const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

    // Get total investments
    const { data: investments, error: investmentsError } = await supabase
      .from('cafe_investments')
      .select('amount');

    if (investmentsError) {
      console.error('Error getting investments:', investmentsError);
    }

    const totalInvestments = investments ? investments.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0) : 0;

    return {
      totalRevenue,
      totalExpenses,
      totalInvestments,
      currentBalance: totalRevenue - totalExpenses + totalInvestments,
    };
  } catch (error) {
    console.error('Error getting current balance:', error);
    return {
      totalRevenue: 0,
      totalExpenses: 0,
      totalInvestments: 0,
      currentBalance: 0,
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
        amount: investmentData.amount,
        description: investmentData.description,
        date: investmentData.date || new Date().toISOString().split('T')[0],
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

// ==================== DATA EXPORT ====================

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
