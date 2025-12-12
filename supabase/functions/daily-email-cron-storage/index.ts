import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Fetch data from Supabase Storage (JSON files synced from localStorage)
async function fetchCafeDataFromStorage() {
  const headers = {
    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  };

  try {
    // Fetch JSON files from Supabase Storage bucket 'cafe-data'
    const ordersRes = await fetch(`${SUPABASE_URL}/storage/v1/object/public/cafe-data/orders.json`, { headers });
    const inventoryRes = await fetch(`${SUPABASE_URL}/storage/v1/object/public/cafe-data/inventory.json`, { headers });
    const expensesRes = await fetch(`${SUPABASE_URL}/storage/v1/object/public/cafe-data/expenses.json`, { headers });
    const purchasesRes = await fetch(`${SUPABASE_URL}/storage/v1/object/public/cafe-data/purchases.json`, { headers });

    const orders = ordersRes.ok ? await ordersRes.json() : [];
    const inventory = inventoryRes.ok ? await inventoryRes.json() : [];
    const expenses = expensesRes.ok ? await expensesRes.json() : [];
    const purchases = purchasesRes.ok ? await purchasesRes.json() : [];

    return { orders, inventory, expenses, purchases };
  } catch (error) {
    console.error('Error fetching cafe data from storage:', error);
    return { orders: [], inventory: [], expenses: [], purchases: [] };
  }
}

// Generate daily report data
function generateDailyReport(data: any) {
  const today = new Date().toISOString().split('T')[0];
  const { orders, inventory, expenses, purchases } = data;

  const todayOrders = orders.filter((order: any) => order.date === today);
  const totalOrders = todayOrders.length;
  const totalRevenue = todayOrders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);

  const lowStockItems = inventory.filter((item: any) => {
    const currentStock = parseFloat(item.currentStock) || 0;
    const minStock = parseFloat(item.minStock) || 0;
    return currentStock <= minStock;
  });

  const itemsToOrder = inventory.filter((item: any) => {
    const currentStock = parseFloat(item.currentStock) || 0;
    const minStock = parseFloat(item.minStock) || 0;
    return currentStock <= (minStock * 0.5);
  }).map((item: any) => ({
    name: item.name,
    currentStock: item.currentStock,
    minStock: item.minStock,
    unit: item.unit,
    neededQty: Math.ceil(item.minStock - item.currentStock),
  }));

  const pendingCreditOrders = orders.filter((order: any) => {
    const totalAmount = order.totalAmount || 0;
    const paymentReceived = order.paymentReceived || 0;
    return order.paymentMethod === 'Credit' && paymentReceived < totalAmount;
  });

  const inventoryValue = inventory.reduce((sum: number, item: any) => {
    const stock = parseFloat(item.currentStock) || 0;
    const price = parseFloat(item.pricePerUnit) || 0;
    return sum + (stock * price);
  }, 0);

  const todayExpenses = expenses.filter((exp: any) => exp.date === today && !exp.purchaseId);
  const expensesTotal = todayExpenses.reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0);

  const todayPurchases = purchases.filter((purchase: any) => purchase.date === today);
  const purchasesTotal = todayPurchases.reduce((sum: number, purchase: any) => sum + (purchase.totalAmount || 0), 0);

  const totalExpenses = purchasesTotal + expensesTotal;

  return {
    date: today,
    orders: {
      total: totalOrders,
      revenue: totalRevenue,
      todayOrders: todayOrders.map((order: any) => ({
        orderNumber: order.orderNumber,
        customerName: order.customerName || 'Walk-in',
        customerType: order.customerType,
        items: order.items || [],
        totalAmount: order.totalAmount,
      })),
    },
    inventory: {
      totalValue: inventoryValue,
      lowStockCount: lowStockItems.length,
      lowStockItems: lowStockItems.slice(0, 10),
      itemsToOrder: itemsToOrder,
    },
    creditOrders: {
      count: pendingCreditOrders.length,
      totalPending: pendingCreditOrders.reduce((sum: number, o: any) => sum + (o.totalAmount - (o.paymentReceived || 0)), 0),
    },
    expenses: {
      total: totalExpenses,
      purchases: purchasesTotal,
      other: expensesTotal,
      todayPurchases: todayPurchases.map((purchase: any) => ({
        orderNumber: purchase.orderNumber,
        supplier: purchase.supplierName || 'N/A',
        totalCost: purchase.totalAmount,
        items: purchase.items || [],
      })),
      todayExpenses: todayExpenses.map((expense: any) => ({
        category: expense.category,
        description: expense.description,
        amount: expense.amount,
      })),
    },
  };
}

// Generate email HTML (simplified)
function generateEmailHTML(reportData: any): string {
  const { date, orders, inventory, expenses } = reportData;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
    .section { padding: 20px; border-bottom: 1px solid #e5e7eb; }
    .revenue-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; margin: 20px; border-radius: 12px; }
    .revenue-value { font-size: 36px; font-weight: bold; margin: 10px 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    td { padding: 8px; border-bottom: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">☕ Afterburn Cafe</h1>
      <p style="margin: 5px 0 0 0;">${new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
    </div>

    <div class="revenue-box">
      <div style="font-size: 14px; opacity: 0.9;">Net Revenue</div>
      <div class="revenue-value">₹ ${(orders.revenue - expenses.total).toLocaleString('en-IN')}</div>
      <div style="font-size: 13px; opacity: 0.9; margin-top: 10px;">
        Income: ₹${orders.revenue.toLocaleString('en-IN')} • Expenses: ₹${expenses.total.toLocaleString('en-IN')}
      </div>
    </div>

    <div class="section">
      <h3>📋 Today's Orders (${orders.total})</h3>
      ${orders.todayOrders && orders.todayOrders.length > 0 ? 
        `<table>
          ${orders.todayOrders.map((order: any) => `
            <tr>
              <td><strong>${order.orderNumber}</strong></td>
              <td>${order.customerName}</td>
              <td style="text-align: right;"><strong>₹${order.totalAmount.toLocaleString('en-IN')}</strong></td>
            </tr>
          `).join('')}
        </table>
        <div style="margin-top: 15px; padding: 12px; background: #d1fae5; border-radius: 8px;">
          <table style="margin: 0;">
            <tr>
              <td style="border: none; padding: 0;"><strong>Total Revenue</strong></td>
              <td style="border: none; padding: 0; text-align: right;"><strong style="font-size: 20px; color: #047857;">₹${orders.revenue.toLocaleString('en-IN')}</strong></td>
            </tr>
          </table>
        </div>`
        : '<p>No orders today</p>'
      }
    </div>

    <div class="section">
      <h3>💰 Today's Expenses</h3>
      <div style="padding: 12px; background: #fee2e2; border-radius: 8px; margin-bottom: 15px;">
        <table style="margin: 0;">
          <tr>
            <td style="border: none; padding: 0;"><strong>Total Expenses</strong></td>
            <td style="border: none; padding: 0; text-align: right;"><strong style="font-size: 20px; color: #dc2626;">₹${expenses.total.toLocaleString('en-IN')}</strong></td>
          </tr>
        </table>
      </div>
      
      ${expenses.todayPurchases && expenses.todayPurchases.length > 0 ? `
        <p><strong>🛍️ Purchase Orders: ₹${expenses.purchases.toLocaleString('en-IN')}</strong></p>
        ${expenses.todayPurchases.map((purchase: any) => `
          <div style="margin-bottom: 10px; padding: 10px; background: #f9fafb; border-radius: 6px; border-left: 3px solid #667eea;">
            <table style="margin: 0;">
              <tr>
                <td style="border: none; padding: 0;"><strong>PO #${purchase.orderNumber}</strong> - ${purchase.supplier}</td>
                <td style="border: none; padding: 0; text-align: right;"><strong style="color: #ef4444;">₹${purchase.totalCost.toLocaleString('en-IN')}</strong></td>
              </tr>
            </table>
          </div>
        `).join('')}
      ` : ''}

      ${expenses.todayExpenses && expenses.todayExpenses.length > 0 ? `
        <p style="margin-top: 20px;"><strong>📝 Other Expenses: ₹${expenses.other.toLocaleString('en-IN')}</strong></p>
        <table>
          ${expenses.todayExpenses.map((expense: any) => `
            <tr>
              <td><strong>${expense.category}</strong></td>
              <td>${expense.description || '-'}</td>
              <td style="text-align: right;"><strong style="color: #ef4444;">₹${expense.amount.toLocaleString('en-IN')}</strong></td>
            </tr>
          `).join('')}
        </table>
      ` : ''}
    </div>

    ${inventory.itemsToOrder.length > 0 ? `
    <div class="section">
      <h3>🛒 Items to Buy</h3>
      <table>
        ${inventory.itemsToOrder.map((item: any) => `
          <tr>
            <td><strong>${item.name}</strong></td>
            <td>Current: ${item.currentStock} ${item.unit}</td>
            <td style="text-align: right; color: #ef4444;"><strong>Need: ${item.neededQty} ${item.unit}</strong></td>
          </tr>
        `).join('')}
      </table>
    </div>
    ` : ''}

    <div class="section">
      <h3>📦 Current Stock</h3>
      <p><strong>Total Inventory Value:</strong> ₹${inventory.totalValue.toLocaleString('en-IN')}</p>
      <p><strong>Low Stock Items:</strong> ${inventory.lowStockCount}</p>
    </div>

    <div style="text-align: center; color: #9ca3af; margin-top: 20px; padding: 20px; font-size: 12px;">
      <p>Afterburn Cafe • Daily Report</p>
      <p>${new Date().toLocaleString()}</p>
    </div>
  </div>
</body>
</html>
  `;
}

// Send email via Brevo
async function sendEmail(recipientEmail: string, recipientName: string, htmlContent: string) {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': BREVO_API_KEY!,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: {
        name: 'Afterburn Cafe',
        email: 'pavan@afterburn.fit',
      },
      to: [{ email: recipientEmail, name: recipientName }],
      subject: `Daily Cafe Report - ${new Date().toLocaleDateString()}`,
      htmlContent: htmlContent,
    }),
  });

  return response;
}

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Starting daily email cron job (Storage version)...');

    const cafeData = await fetchCafeDataFromStorage();
    console.log('Data fetched:', { 
      orders: cafeData.orders.length, 
      inventory: cafeData.inventory.length,
      expenses: cafeData.expenses.length,
      purchases: cafeData.purchases.length
    });

    const reportData = generateDailyReport(cafeData);
    console.log('Report generated:', { 
      todayOrders: reportData.orders.total,
      revenue: reportData.orders.revenue 
    });

    const emailHTML = generateEmailHTML(reportData);

    const recipientEmail = 'pavankumar.nagaraj@gmail.com';
    const recipientName = 'Cafe Manager';
    
    const emailResponse = await sendEmail(recipientEmail, recipientName, emailHTML);
    
    if (emailResponse.ok) {
      console.log('Daily email sent successfully');
      return new Response(
        JSON.stringify({ success: true, message: 'Daily email sent successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    } else {
      const error = await emailResponse.text();
      console.error('Failed to send email:', error);
      return new Response(
        JSON.stringify({ success: false, error: error }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in daily email cron:', error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
