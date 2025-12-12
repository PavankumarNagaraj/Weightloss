// Clean Email Template for Daily Reports

export const generateCleanDailyEmail = (data) => {
  const { date, orders, inventory, creditOrders, expenses } = data;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      line-height: 1.6; 
      color: #333; 
      margin: 0; 
      padding: 0; 
      background-color: #f9fafb;
    }
    .container { 
      max-width: 700px; 
      margin: 0 auto; 
      padding: 20px; 
      background-color: #f9fafb;
    }
    .header { 
      background: #667eea; 
      color: white; 
      padding: 30px; 
      border-radius: 10px; 
      text-align: center; 
      margin-bottom: 30px; 
    }
    .section { 
      background: white; 
      padding: 25px; 
      margin: 20px 0; 
      border-radius: 8px; 
      border: 1px solid #e5e7eb; 
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .section-title { 
      font-size: 18px; 
      font-weight: bold; 
      color: #1f2937; 
      margin: 0 0 20px 0; 
      padding-bottom: 12px; 
      border-bottom: 2px solid #667eea; 
    }
    .revenue-box { 
      background: #10b981; 
      color: white; 
      padding: 30px; 
      border-radius: 10px; 
      text-align: center; 
      margin-bottom: 30px; 
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .revenue-label { 
      font-size: 14px; 
      margin-bottom: 10px;
    }
    .revenue-value { 
      font-size: 42px; 
      font-weight: bold; 
      margin: 15px 0; 
    }
    table { 
      width: 100%; 
      border-collapse: collapse; 
      margin: 15px 0; 
    }
    th { 
      background: #f3f4f6; 
      padding: 12px; 
      text-align: left; 
      font-size: 13px; 
      color: #6b7280; 
      font-weight: 600; 
      border-bottom: 2px solid #e5e7eb;
    }
    td { 
      padding: 12px; 
      border-bottom: 1px solid #e5e7eb; 
      font-size: 14px; 
    }
    .stat-table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
    }
    .stat-table td {
      padding: 10px 0;
      border-bottom: 1px solid #f3f4f6;
    }
    .stat-label { 
      color: #6b7280; 
      font-size: 14px; 
      width: 60%;
    }
    .stat-value { 
      font-weight: bold; 
      color: #1f2937; 
      font-size: 14px; 
      text-align: right;
      width: 40%;
    }
    .footer { 
      text-align: center; 
      color: #9ca3af; 
      margin-top: 40px; 
      padding-top: 20px; 
      border-top: 1px solid #e5e7eb; 
      font-size: 12px; 
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">☕ Afterburn Cafe</h1>
      <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">${new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
    </div>

    <!-- Total Revenue -->
    <div class="revenue-box">
      <div class="revenue-label">Total Revenue</div>
      <div class="revenue-value">₹ ${orders.revenue.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
      <div style="font-size: 13px; opacity: 0.9;">Net: ₹ ${(orders.revenue - expenses.total).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})} (after expenses)</div>
    </div>

    <!-- Orders and Cost -->
    <div class="section">
      <div class="section-title">📊 Orders & Cost</div>
      
      <table class="stat-table">
        <tr>
          <td class="stat-label">Total Orders</td>
          <td class="stat-value">${orders.total}</td>
        </tr>
        <tr>
          <td class="stat-label" style="padding-top: 15px; border-top: 2px solid #e5e7eb;">Total Expenses</td>
          <td class="stat-value" style="color: #ef4444; padding-top: 15px; border-top: 2px solid #e5e7eb;">₹ ${expenses.total.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
        </tr>
        ${expenses.purchases > 0 ? `
        <tr>
          <td class="stat-label" style="padding-left: 20px;">• Inventory Purchases</td>
          <td class="stat-value" style="color: #6b7280;">₹ ${expenses.purchases.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
        </tr>
        ` : ''}
        ${expenses.other > 0 ? `
        <tr>
          <td class="stat-label" style="padding-left: 20px;">• Other Expenses</td>
          <td class="stat-value" style="color: #6b7280;">₹ ${expenses.other.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
        </tr>
        ` : ''}
        ${creditOrders.count > 0 ? `
        <tr>
          <td class="stat-label" style="border-bottom: none;">Pending Credit</td>
          <td class="stat-value" style="color: #f59e0b; border-bottom: none;">₹ ${creditOrders.totalPending.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})} (${creditOrders.count} orders)</td>
        </tr>
        ` : ''}
      </table>
    </div>

    <!-- Today's Purchases -->
    ${expenses.todayPurchases && expenses.todayPurchases.length > 0 ? `
    <div class="section">
      <div class="section-title">🛍️ Today's Purchases</div>
      <table>
        <thead>
          <tr>
            <th>Material</th>
            <th>Quantity</th>
            <th>Price/Unit</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${expenses.todayPurchases.map(purchase => `
            <tr>
              <td><strong>${purchase.materialName}</strong></td>
              <td>${purchase.quantity} ${purchase.unit}</td>
              <td>₹${purchase.pricePerUnit.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
              <td style="color: #ef4444; font-weight: bold;">₹${purchase.totalCost.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    ` : ''}

    <!-- Items to Buy -->
    ${inventory.itemsToOrder.length > 0 ? `
    <div class="section">
      <div class="section-title">🛒 Items to Buy</div>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Current</th>
            <th>Need</th>
          </tr>
        </thead>
        <tbody>
          ${inventory.itemsToOrder.map(item => `
            <tr>
              <td><strong>${item.name}</strong></td>
              <td>${item.currentStock} ${item.unit}</td>
              <td style="color: #ef4444; font-weight: bold;">${item.neededQty} ${item.unit}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    ` : `
    <div class="section">
      <div class="section-title">🛒 Items to Buy</div>
      <p style="color: #6b7280; margin: 0;">No urgent purchases needed</p>
    </div>
    `}

    <!-- Current Stock -->
    <div class="section">
      <div class="section-title">📦 Current Stock</div>
      
      <table class="stat-table">
        <tr>
          <td class="stat-label">Total Inventory Value</td>
          <td class="stat-value">₹ ${inventory.totalValue.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
        </tr>
        <tr>
          <td class="stat-label" style="border-bottom: none;">Low Stock Items</td>
          <td class="stat-value" style="color: ${inventory.lowStockCount > 0 ? '#ef4444' : '#10b981'}; border-bottom: none;">${inventory.lowStockCount}</td>
        </tr>
      </table>
      
      ${inventory.lowStockItems.length > 0 ? `
      <table style="margin-top: 15px;">
        <thead>
          <tr>
            <th>Item</th>
            <th>Current</th>
            <th>Min Required</th>
          </tr>
        </thead>
        <tbody>
          ${inventory.lowStockItems.slice(0, 10).map(item => `
            <tr>
              <td>${item.name}</td>
              <td style="color: #ef4444;">${item.currentStock} ${item.unit}</td>
              <td>${item.minStock} ${item.unit}</td>
            </tr>
          `).join('')}
          ${inventory.lowStockItems.length > 10 ? `
            <tr>
              <td colspan="3" style="text-align: center; color: #6b7280; font-size: 12px;">
                +${inventory.lowStockItems.length - 10} more items
              </td>
            </tr>
          ` : ''}
        </tbody>
      </table>
      ` : ''}
    </div>

    <div class="footer">
      <p>Afterburn Cafe • Daily Report</p>
      <p style="margin: 5px 0 0 0;">${new Date().toLocaleString()}</p>
    </div>
  </div>
</body>
</html>
  `;
};
