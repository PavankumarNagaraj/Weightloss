// Email Service using Brevo SMTP
// Handles daily reports and notifications
import { getOrders, getInventory, getExpenses, getPurchases } from './cafeService';

const BREVO_CONFIG = {
  host: 'smtp-relay.brevo.com',
  port: 587,
  login: '9de95e001@smtp-brevo.com',
  password: 'yTcSL0hbzBF1Prqk',
  apiKey: 'yTcSL0hbzBF1Prqk',
  senderEmail: 'pavan@afterburn.fit',
  senderName: 'Afterburn Cafe',
};

// Generate daily report data
export const generateDailyReport = async () => {
  const today = new Date().toISOString().split('T')[0];
  
  // Get all data from Supabase database
  const orders = await getOrders();
  const inventoryData = await getInventory();
  const expenses = await getExpenses();
  const purchases = await getPurchases();
  
  // Map snake_case to camelCase
  const inventory = inventoryData.map(item => ({
    ...item,
    currentStock: item.current_stock ?? item.currentStock,
    minStock: item.min_stock ?? item.minStock,
    pricePerUnit: item.price_per_unit ?? item.pricePerUnit,
  }));
  
  // Filter today's orders
  const todayOrders = orders.filter(order => order.date === today);
  
  // Calculate order stats
  const totalOrders = todayOrders.length;
  const totalRevenue = todayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const cashOrders = todayOrders.filter(o => o.paymentMethod === 'Cash').length;
  const upiOrders = todayOrders.filter(o => o.paymentMethod === 'UPI').length;
  const cardOrders = todayOrders.filter(o => o.paymentMethod === 'Card').length;
  const creditOrders = todayOrders.filter(o => o.paymentMethod === 'Credit').length;
  
  // Calculate purchase recommendations based on history
  const calculatePurchaseRecommendation = (itemName) => {
    // Get all purchases for this item
    const itemPurchases = purchases
      .filter(purchase => {
        return purchase.items?.some(item => 
          item.materialName?.toLowerCase() === itemName.toLowerCase()
        );
      })
      .flatMap(purchase => 
        purchase.items
          .filter(item => item.materialName?.toLowerCase() === itemName.toLowerCase())
          .map(item => ({
            quantity: parseFloat(item.quantity) || 0,
            unit: item.unit,
            pricePerUnit: parseFloat(item.pricePerUnit) || 0,
            totalPrice: parseFloat(item.total) || parseFloat(item.totalPrice) || 0,
            date: purchase.date || purchase.createdAt,
          }))
      );

    if (itemPurchases.length === 0) {
      return null;
    }

    // Calculate average purchase quantity
    const avgQuantity = itemPurchases.reduce((sum, p) => sum + p.quantity, 0) / itemPurchases.length;
    
    // Get most recent purchase for price reference
    const recentPurchase = itemPurchases.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];

    // Calculate average price per unit
    const avgPricePerUnit = itemPurchases.reduce((sum, p) => sum + p.pricePerUnit, 0) / itemPurchases.length;

    return {
      recommendedQty: Math.ceil(avgQuantity),
      unit: recentPurchase.unit,
      estimatedCost: Math.ceil(avgQuantity * avgPricePerUnit),
      avgPricePerUnit: avgPricePerUnit.toFixed(2),
      lastPurchaseQty: recentPurchase.quantity,
      lastPurchaseDate: recentPurchase.date,
      purchaseCount: itemPurchases.length,
    };
  };

  // Get low stock items with purchase recommendations
  const lowStockItems = inventory.filter(item => {
    const currentStock = parseFloat(item.currentStock) || 0;
    const minStock = parseFloat(item.minStock) || 0;
    return currentStock <= minStock;
  }).map(item => {
    const recommendation = calculatePurchaseRecommendation(item.name);
    const neededQty = Math.ceil(item.minStock - item.currentStock);
    
    return {
      name: item.name,
      currentStock: item.currentStock,
      minStock: item.minStock,
      unit: item.unit,
      category: item.category,
      neededQty,
      pricePerUnit: item.pricePerUnit || 0,
      recommendation: recommendation || {
        recommendedQty: neededQty,
        unit: item.unit,
        estimatedCost: neededQty * (item.pricePerUnit || 0),
        avgPricePerUnit: (item.pricePerUnit || 0).toFixed(2),
        purchaseCount: 0,
      },
    };
  });
  
  // Get items that need to be ordered (stock below 50% of min)
  const itemsToOrder = inventory.filter(item => {
    const currentStock = parseFloat(item.currentStock) || 0;
    const minStock = parseFloat(item.minStock) || 0;
    return currentStock <= (minStock * 0.5);
  }).map(item => ({
    name: item.name,
    currentStock: item.currentStock,
    minStock: item.minStock,
    unit: item.unit,
    category: item.category,
    neededQty: Math.ceil(item.minStock - item.currentStock),
  }));
  
  // Get credit orders with pending payments
  const pendingCreditOrders = orders.filter(order => {
    const totalAmount = order.totalAmount || 0;
    const paymentReceived = order.paymentReceived || 0;
    return order.paymentMethod === 'Credit' && paymentReceived < totalAmount;
  }).map(order => ({
    id: order.id,
    customerName: order.customerName,
    totalAmount: order.totalAmount,
    paymentReceived: order.paymentReceived || 0,
    pending: order.totalAmount - (order.paymentReceived || 0),
    date: order.date,
  }));
  
  // Calculate inventory value
  const inventoryValue = inventory.reduce((sum, item) => {
    const stock = parseFloat(item.currentStock) || 0;
    const price = parseFloat(item.pricePerUnit) || 0;
    return sum + (stock * price);
  }, 0);
  
  // Today's expenses (excluding purchase-linked expenses to avoid duplication)
  const todayExpenses = expenses.filter(exp => exp.date === today && !exp.purchaseId);
  const expensesTotal = todayExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  
  // Today's purchases - map snake_case to camelCase
  const mappedPurchases = purchases.map(p => ({
    ...p,
    orderNumber: p.order_number ?? p.orderNumber,
    supplierName: p.supplier_name ?? p.supplierName,
    totalAmount: p.total_amount ?? p.totalAmount,
    createdAt: p.created_at ?? p.createdAt,
  }));
  
  const todayPurchases = mappedPurchases.filter(purchase => purchase.date === today);
  const purchasesTotal = todayPurchases.reduce((sum, purchase) => sum + (purchase.totalAmount || 0), 0);
  
  // Combined total expenses (purchases + other expenses)
  const totalExpenses = purchasesTotal + expensesTotal;
  
  return {
    date: today,
    orders: {
      total: totalOrders,
      revenue: totalRevenue,
      byPaymentMethod: {
        cash: cashOrders,
        upi: upiOrders,
        card: cardOrders,
        credit: creditOrders,
      },
      todayOrders: todayOrders.map(order => ({
        orderNumber: order.orderNumber,
        customerName: order.customerName || 'Walk-in',
        customerType: order.customerType,
        items: order.items || [],
        totalAmount: order.totalAmount,
        date: order.date,
      })),
    },
    inventory: {
      totalValue: inventoryValue,
      lowStockCount: lowStockItems.length,
      lowStockItems: lowStockItems,
      itemsToOrder,
    },
    creditOrders: {
      count: pendingCreditOrders.length,
      totalPending: pendingCreditOrders.reduce((sum, o) => sum + o.pending, 0),
      orders: pendingCreditOrders,
    },
    expenses: {
      total: totalExpenses,
      purchases: purchasesTotal,
      other: expensesTotal,
      todayPurchases: todayPurchases.map(purchase => ({
        orderNumber: purchase.orderNumber,
        date: purchase.date,
        createdAt: purchase.createdAt,
        supplier: purchase.supplierName || 'N/A',
        totalCost: purchase.totalAmount,
        items: purchase.items || [],
      })),
      todayExpenses: todayExpenses.map(expense => ({
        category: expense.category,
        description: expense.description,
        amount: expense.amount,
        orderNumber: expense.orderNumber,
        date: expense.date,
      })),
      count: todayExpenses.length,
    },
  };
};

// Format report as HTML email
export const formatReportEmail = (reportData) => {
  const { date, orders, inventory, creditOrders, expenses } = reportData;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 800px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; }
    .section { background: #f9fafb; padding: 20px; margin: 20px 0; border-radius: 10px; border-left: 4px solid #667eea; }
    .section-title { font-size: 20px; font-weight: bold; color: #667eea; margin-bottom: 15px; }
    .stat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 15px 0; }
    .stat-card { background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .stat-label { font-size: 12px; color: #6b7280; text-transform: uppercase; }
    .stat-value { font-size: 24px; font-weight: bold; color: #1f2937; margin-top: 5px; }
    .alert { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; border-radius: 8px; margin: 10px 0; }
    .success { background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; border-radius: 8px; margin: 10px 0; }
    .warning { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 10px 0; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; background: white; }
    th { background: #667eea; color: white; padding: 12px; text-align: left; }
    td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; }
    .badge-red { background: #fee2e2; color: #991b1b; }
    .badge-green { background: #d1fae5; color: #065f46; }
    .badge-yellow { background: #fef3c7; color: #92400e; }
    .footer { text-align: center; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>☕ Daily Cafe Report</h1>
      <p style="font-size: 18px; margin: 10px 0 0 0;">${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>

    <!-- Orders Summary -->
    <div class="section">
      <div class="section-title">📊 Today's Orders</div>
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-label">Total Orders</div>
          <div class="stat-value">${orders.total}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Total Revenue</div>
          <div class="stat-value">₹${orders.revenue.toFixed(2)}</div>
        </div>
      </div>
      
      <div style="margin-top: 15px;">
        <strong>Payment Methods:</strong><br>
        💵 Cash: ${orders.byPaymentMethod.cash} orders<br>
        📱 UPI: ${orders.byPaymentMethod.upi} orders<br>
        💳 Card: ${orders.byPaymentMethod.card} orders<br>
        📝 Credit: ${orders.byPaymentMethod.credit} orders
      </div>
      
      ${orders.total === 0 ? '<div class="alert">⚠️ No orders recorded today</div>' : '<div class="success">✅ Orders processed successfully</div>'}
    </div>

    <!-- Inventory Status -->
    <div class="section">
      <div class="section-title">📦 Inventory Status</div>
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-label">Total Inventory Value</div>
          <div class="stat-value">₹${inventory.totalValue.toFixed(2)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Low Stock Items</div>
          <div class="stat-value" style="color: ${inventory.lowStockCount > 0 ? '#ef4444' : '#10b981'};">${inventory.lowStockCount}</div>
        </div>
      </div>
      
      ${inventory.lowStockCount > 0 ? `
        <div class="warning">
          <strong>⚠️ Low Stock Alert:</strong><br>
          ${inventory.lowStockItems.slice(0, 5).map(item => 
            `• ${item.name}: ${item.currentStock} ${item.unit} (Min: ${item.minStock} ${item.unit})`
          ).join('<br>')}
          ${inventory.lowStockCount > 5 ? `<br>...and ${inventory.lowStockCount - 5} more items` : ''}
        </div>
      ` : '<div class="success">✅ All items have sufficient stock</div>'}
    </div>

    <!-- Items to Purchase -->
    ${inventory.itemsToOrder.length > 0 ? `
    <div class="section">
      <div class="section-title">🛒 Items to Purchase (Urgent)</div>
      <div class="alert">
        <strong>⚠️ ${inventory.itemsToOrder.length} items need immediate ordering:</strong>
      </div>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Category</th>
            <th>Current</th>
            <th>Min Stock</th>
            <th>Need to Buy</th>
          </tr>
        </thead>
        <tbody>
          ${inventory.itemsToOrder.map(item => `
            <tr>
              <td><strong>${item.name}</strong></td>
              <td><span class="badge badge-yellow">${item.category}</span></td>
              <td>${item.currentStock} ${item.unit}</td>
              <td>${item.minStock} ${item.unit}</td>
              <td><strong>${item.neededQty} ${item.unit}</strong></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    ` : ''}

    <!-- Credit Orders / Vendor Dues -->
    ${creditOrders.count > 0 ? `
    <div class="section">
      <div class="section-title">💰 Pending Credit Orders</div>
      <div class="alert">
        <strong>⚠️ ${creditOrders.count} credit orders with pending payments</strong><br>
        Total Pending: ₹${creditOrders.totalPending.toFixed(2)}
      </div>
      <table>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Order Date</th>
            <th>Total Amount</th>
            <th>Received</th>
            <th>Pending</th>
          </tr>
        </thead>
        <tbody>
          ${creditOrders.orders.slice(0, 10).map(order => `
            <tr>
              <td><strong>${order.customerName}</strong></td>
              <td>${new Date(order.date).toLocaleDateString()}</td>
              <td>₹${order.totalAmount.toFixed(2)}</td>
              <td>₹${order.paymentReceived.toFixed(2)}</td>
              <td><span class="badge badge-red">₹${order.pending.toFixed(2)}</span></td>
            </tr>
          `).join('')}
          ${creditOrders.count > 10 ? `
            <tr>
              <td colspan="5" style="text-align: center; color: #6b7280;">
                ...and ${creditOrders.count - 10} more pending orders
              </td>
            </tr>
          ` : ''}
        </tbody>
      </table>
    </div>
    ` : '<div class="section"><div class="section-title">💰 Credit Orders</div><div class="success">✅ No pending credit orders</div></div>'}

    <!-- Expenses Summary -->
    <div class="section">
      <div class="section-title">💸 Today's Expenses</div>
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-label">Total Expenses</div>
          <div class="stat-value">₹${expenses.total.toFixed(2)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Expense Entries</div>
          <div class="stat-value">${expenses.count}</div>
        </div>
      </div>
    </div>

    <!-- Summary -->
    <div class="section" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none;">
      <div class="section-title" style="color: white;">📈 Daily Summary</div>
      <div style="font-size: 16px;">
        <strong>Net Cash Flow:</strong> ₹${(orders.revenue - expenses.total).toFixed(2)}<br>
        <strong>Action Items:</strong><br>
        ${inventory.itemsToOrder.length > 0 ? `• 🛒 Order ${inventory.itemsToOrder.length} inventory items urgently<br>` : ''}
        ${creditOrders.count > 0 ? `• 💰 Follow up on ${creditOrders.count} pending credit payments (₹${creditOrders.totalPending.toFixed(2)})<br>` : ''}
        ${inventory.lowStockCount > 0 ? `• ⚠️ Monitor ${inventory.lowStockCount} low stock items<br>` : ''}
        ${inventory.itemsToOrder.length === 0 && creditOrders.count === 0 && inventory.lowStockCount === 0 ? '• ✅ All systems running smoothly!' : ''}
      </div>
    </div>

    <div class="footer">
      <p>This is an automated daily report from your Cafe Management System</p>
      <p style="font-size: 12px; color: #9ca3af;">Generated at ${new Date().toLocaleTimeString()}</p>
    </div>
  </div>
</body>
</html>
  `;
};

// Send email via Supabase Edge Function
export const sendDailyReport = async (recipientEmail, recipientName = 'Cafe Manager') => {
  try {
    const reportData = await generateDailyReport();
    const { generateCleanDailyEmail } = await import('../utils/emailTemplates');
    const htmlContent = generateCleanDailyEmail(reportData);
    
    // Supabase configuration
    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || 'YOUR_SUPABASE_URL';
    const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY';
    
    // Try Supabase Edge Function first
    if (SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
      try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipientEmail,
            recipientName,
            subject: `☕ Daily Report - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
            htmlContent,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          return {
            success: true,
            messageId: result.messageId,
            message: 'Daily report sent successfully via Supabase',
          };
        }
      } catch (supabaseError) {
        console.log('Supabase function not available');
      }
    }
    
    // Fallback to local API only in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      try {
        const response = await fetch('http://localhost:3001/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipientEmail,
            recipientName,
            subject: `☕ Daily Report - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
            htmlContent,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          return {
            success: true,
            messageId: result.messageId,
            message: 'Daily report sent successfully via local API',
          };
        }
      } catch (apiError) {
        console.log('Local API not available');
      }
    }
    
    // Final fallback: Download the report HTML
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily-report-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return {
      success: true,
      message: 'Report downloaded. Setup Supabase or run: node send-clean-report.js',
    };
  } catch (error) {
    console.error('Error generating report:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Schedule daily report (to be called at end of day)
export const scheduleDailyReport = (recipientEmail) => {
  // Get current time
  const now = new Date();
  const endOfDay = new Date();
  endOfDay.setHours(23, 55, 0, 0); // 11:55 PM
  
  // Calculate time until end of day
  const timeUntilEndOfDay = endOfDay.getTime() - now.getTime();
  
  if (timeUntilEndOfDay > 0) {
    setTimeout(async () => {
      await sendDailyReport(recipientEmail);
      // Schedule next day's report
      scheduleDailyReport(recipientEmail);
    }, timeUntilEndOfDay);
    
    return {
      success: true,
      message: `Daily report scheduled for ${endOfDay.toLocaleTimeString()}`,
      nextRun: endOfDay,
    };
  } else {
    // If past end of day, schedule for tomorrow
    const tomorrow = new Date(endOfDay);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const timeUntilTomorrow = tomorrow.getTime() - now.getTime();
    
    setTimeout(async () => {
      await sendDailyReport(recipientEmail);
      scheduleDailyReport(recipientEmail);
    }, timeUntilTomorrow);
    
    return {
      success: true,
      message: `Daily report scheduled for tomorrow at ${tomorrow.toLocaleTimeString()}`,
      nextRun: tomorrow,
    };
  }
};

// Save email settings
export const saveEmailSettings = (settings) => {
  localStorage.setItem('cafe_email_settings', JSON.stringify(settings));
};

// Get email settings
export const getEmailSettings = () => {
  const settings = localStorage.getItem('cafe_email_settings');
  return settings ? JSON.parse(settings) : null;
};

// Test email connection
export const testEmailConnection = async (recipientEmail) => {
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_CONFIG.apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: 'Cafe Management System',
          email: '9de95e001@smtp-brevo.com',
        },
        to: [
          {
            email: recipientEmail,
            name: 'Test Recipient',
          },
        ],
        subject: '✅ Test Email - Cafe Management System',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #667eea;">✅ Email Configuration Test</h2>
            <p>This is a test email from your Cafe Management System.</p>
            <p>If you received this email, your email configuration is working correctly!</p>
            <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
              Sent at ${new Date().toLocaleString()}
            </p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send test email');
    }

    return {
      success: true,
      message: 'Test email sent successfully! Check your inbox.',
    };
  } catch (error) {
    console.error('Error sending test email:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};
