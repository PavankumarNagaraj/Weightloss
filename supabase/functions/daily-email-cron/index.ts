import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

interface CafeData {
  orders: any[];
  inventory: any[];
  expenses: any[];
  purchases: any[];
}

// Fetch data from Supabase storage or use a custom table
async function fetchCafeData(): Promise<CafeData> {
  // Since we're using localStorage in the frontend, we need to store data in Supabase
  // For now, we'll use Supabase Storage or a custom table
  // This is a placeholder - you'll need to implement actual data fetching
  
  const headers = {
    'apikey': SUPABASE_SERVICE_ROLE_KEY!,
    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  };

  try {
    const ordersRes = await fetch(`${SUPABASE_URL}/rest/v1/cafe_orders?select=*`, { headers });
    const inventoryRes = await fetch(`${SUPABASE_URL}/rest/v1/cafe_inventory?select=*`, { headers });
    const expensesRes = await fetch(`${SUPABASE_URL}/rest/v1/cafe_expenses?select=*`, { headers });
    const purchasesRes = await fetch(`${SUPABASE_URL}/rest/v1/cafe_purchases?select=*`, { headers });

    if (!ordersRes.ok || !inventoryRes.ok || !expensesRes.ok || !purchasesRes.ok) {
      throw new Error('Failed to fetch data from database');
    }

    const orders = await ordersRes.json();
    const inventory = await inventoryRes.json();
    const expenses = await expensesRes.json();
    const purchases = await purchasesRes.json();

    return { orders, inventory, expenses, purchases };
  } catch (error) {
    console.error('Error fetching cafe data:', error);
    return { orders: [], inventory: [], expenses: [], purchases: [] };
  }
}

// Generate daily report data
function generateDailyReport(data: CafeData) {
  const today = new Date().toISOString().split('T')[0];
  const { orders, inventory, expenses, purchases } = data;

  // Map database fields to expected format
  const mappedOrders = orders.map((order: any) => ({
    ...order,
    orderNumber: order.order_number,
    customerName: order.customer_name,
    customerType: order.customer_type,
    totalAmount: order.total_amount,
    paymentMethod: order.payment_method,
    paymentReceived: order.payment_received,
  }));

  const mappedInventory = inventory.map((item: any) => ({
    ...item,
    currentStock: item.current_stock,
    minStock: item.min_stock,
    pricePerUnit: item.price_per_unit,
  }));

  const mappedPurchases = purchases.map((purchase: any) => ({
    ...purchase,
    orderNumber: purchase.order_number,
    supplierName: purchase.supplier_name,
    totalAmount: purchase.total_amount,
    createdAt: purchase.created_at,
  }));

  const mappedExpenses = expenses.map((expense: any) => ({
    ...expense,
    purchaseId: expense.purchase_id,
    orderNumber: expense.order_number,
    paymentMethod: expense.payment_method,
  }));

  // Filter today's orders
  const todayOrders = mappedOrders.filter((order: any) => order.date === today);

  // Calculate order stats
  const totalOrders = todayOrders.length;
  const totalRevenue = todayOrders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);

  // Calculate purchase recommendations based on history
  const calculatePurchaseRecommendation = (itemName: string) => {
    // Get all purchases for this item
    const itemPurchases = mappedPurchases
      .filter((purchase: any) => {
        return purchase.items?.some((item: any) => 
          item.materialName?.toLowerCase() === itemName.toLowerCase()
        );
      })
      .flatMap((purchase: any) => 
        purchase.items
          .filter((item: any) => item.materialName?.toLowerCase() === itemName.toLowerCase())
          .map((item: any) => ({
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
    const avgQuantity = itemPurchases.reduce((sum: number, p: any) => sum + p.quantity, 0) / itemPurchases.length;
    
    // Get most recent purchase for price reference
    const recentPurchase = itemPurchases.sort((a: any, b: any) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];

    // Calculate average price per unit
    const avgPricePerUnit = itemPurchases.reduce((sum: number, p: any) => sum + p.pricePerUnit, 0) / itemPurchases.length;

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

  // Get low stock items (simple list without recommendations)
  const lowStockItems = mappedInventory.filter((item: any) => {
    const currentStock = parseFloat(item.currentStock) || 0;
    const minStock = parseFloat(item.minStock) || 0;
    return currentStock <= minStock;
  }).map((item: any) => ({
    name: item.name,
    currentStock: item.currentStock,
    minStock: item.minStock,
    unit: item.unit,
    category: item.category,
  }));

  // Get items to order (critically low - below 50% of min stock) with purchase recommendations
  const itemsToOrder = mappedInventory.filter((item: any) => {
    const currentStock = parseFloat(item.currentStock) || 0;
    const minStock = parseFloat(item.minStock) || 0;
    return currentStock <= (minStock * 0.5);
  }).map((item: any) => {
    const recommendation = calculatePurchaseRecommendation(item.name);
    const neededQty = Math.ceil(item.minStock - item.currentStock);
    
    return {
      name: item.name,
      currentStock: item.currentStock,
      minStock: item.minStock,
      unit: item.unit,
      category: item.category,
      neededQty,
      recommendation: recommendation || {
        recommendedQty: neededQty,
        unit: item.unit,
        estimatedCost: 0,
        avgPricePerUnit: '0',
        purchaseCount: 0,
      },
    };
  });

  // Get credit orders
  const pendingCreditOrders = mappedOrders.filter((order: any) => {
    const totalAmount = order.totalAmount || 0;
    const paymentReceived = order.paymentReceived || 0;
    return order.paymentMethod === 'Credit' && paymentReceived < totalAmount;
  }).map((order: any) => ({
    id: order.id,
    customerName: order.customerName,
    totalAmount: order.totalAmount,
    paymentReceived: order.paymentReceived || 0,
    pending: order.totalAmount - (order.paymentReceived || 0),
    date: order.date,
  }));

  // Calculate inventory value
  const inventoryValue = mappedInventory.reduce((sum: number, item: any) => {
    const stock = parseFloat(item.currentStock) || 0;
    const price = parseFloat(item.pricePerUnit) || 0;
    return sum + (stock * price);
  }, 0);

  // Today's expenses (excluding purchase-linked expenses)
  const todayExpenses = mappedExpenses.filter((exp: any) => exp.date === today && !exp.purchaseId);
  const expensesTotal = todayExpenses.reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0);

  // Today's purchases
  const todayPurchases = mappedPurchases.filter((purchase: any) => purchase.date === today);
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
        date: order.date,
      })),
    },
    inventory: {
      totalValue: inventoryValue,
      lowStockCount: lowStockItems.length,
      lowStockItems: lowStockItems.map((item: any) => ({
        name: item.name,
        currentStock: item.currentStock,
        minStock: item.minStock,
        unit: item.unit,
        category: item.category,
      })),
      itemsToOrder: itemsToOrder,
    },
    creditOrders: {
      count: pendingCreditOrders.length,
      totalPending: pendingCreditOrders.reduce((sum: number, o: any) => sum + o.pending, 0),
      orders: pendingCreditOrders,
    },
    expenses: {
      total: totalExpenses,
      purchases: purchasesTotal,
      other: expensesTotal,
      todayPurchases: todayPurchases.map((purchase: any) => ({
        orderNumber: purchase.orderNumber,
        date: purchase.date,
        createdAt: purchase.createdAt,
        supplier: purchase.supplierName || 'N/A',
        totalCost: purchase.totalAmount,
        items: purchase.items || [],
      })),
      todayExpenses: todayExpenses.map((expense: any) => ({
        category: expense.category,
        description: expense.description,
        amount: expense.amount,
        orderNumber: expense.orderNumber,
        date: expense.date,
      })),
      count: todayExpenses.length,
    },
  };
}

// Generate HTML email (simplified version - you can import the full template)
function generateEmailHTML(reportData: any): string {
  const { date, orders, inventory, creditOrders, expenses } = reportData;
  
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
    .section-title { font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 15px; }
    .revenue-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; margin: 20px; border-radius: 12px; }
    .revenue-label { font-size: 14px; opacity: 0.9; margin-bottom: 10px; }
    .revenue-value { font-size: 36px; font-weight: bold; margin: 10px 0; }
    table { width: 100%; border-collapse: collapse; }
    th { padding: 12px; text-align: left; background: #f3f4f6; color: #6b7280; font-weight: 600; border-bottom: 2px solid #e5e7eb; }
    td { padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">☕ Afterburn Cafe</h1>
      <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">${new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
    </div>

    <div class="revenue-box">
      <div class="revenue-label">Net Revenue</div>
      <div class="revenue-value">₹ ${(orders.revenue - expenses.total).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
      <div style="font-size: 13px; opacity: 0.9; margin-top: 10px;">
        Income: ₹${orders.revenue.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})} • 
        Expenses: ₹${expenses.total.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
      </div>
    </div>

    <div class="section">
      <div class="section-title">📋 Today's Orders (${orders.total})</div>
      ${orders.todayOrders && orders.todayOrders.length > 0 ? 
        orders.todayOrders.map((order: any) => `
          <div style="margin-bottom: 15px; padding: 12px; background: #f9fafb; border-radius: 6px; border-left: 3px solid #10b981;">
            <strong>${order.orderNumber}</strong> - ${order.customerName} - ₹${order.totalAmount.toLocaleString('en-IN')}
          </div>
        `).join('') : '<p>No orders today</p>'
      }
    </div>

    <div class="section">
      <div class="section-title">💰 Today's Expenses (₹${expenses.total.toLocaleString('en-IN')})</div>
      ${expenses.todayPurchases && expenses.todayPurchases.length > 0 ? `
        <p><strong>Purchase Orders:</strong> ₹${expenses.purchases.toLocaleString('en-IN')}</p>
      ` : ''}
      ${expenses.todayExpenses && expenses.todayExpenses.length > 0 ? `
        <p><strong>Other Expenses:</strong> ₹${expenses.other.toLocaleString('en-IN')}</p>
      ` : ''}
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
      to: [
        {
          email: recipientEmail,
          name: recipientName,
        },
      ],
      subject: `Daily Cafe Report - ${new Date().toLocaleDateString()}`,
      htmlContent: htmlContent,
    }),
  });

  return response;
}

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Starting daily email cron job...');

    // Fetch cafe data
    const cafeData = await fetchCafeData();
    console.log('Cafe data fetched:', { 
      orders: cafeData.orders.length, 
      inventory: cafeData.inventory.length 
    });

    // Generate report
    const reportData = generateDailyReport(cafeData);
    console.log('Report generated:', { 
      todayOrders: reportData.orders.total,
      revenue: reportData.orders.revenue 
    });

    // Generate email HTML
    const emailHTML = generateEmailHTML(reportData);

    // Send email
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
