// Clean Email Template for Daily Reports

export const generateCleanDailyEmail = (data) => {
  const { date, orders, inventory, creditOrders, expenses } = data;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 700px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 10px; text-align: center; margin-bottom: 25px; }
    .section { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border: 1px solid #e5e7eb; }
    .section-title { font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #667eea; }
    .revenue-box { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 25px; }
    .revenue-label { font-size: 14px; opacity: 0.9; }
    .revenue-value { font-size: 36px; font-weight: bold; margin: 10px 0; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    th { background: #f3f4f6; padding: 10px; text-align: left; font-size: 13px; color: #6b7280; font-weight: 600; }
    td { padding: 10px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
    .stat-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
    .stat-label { color: #6b7280; font-size: 14px; }
    .stat-value { font-weight: bold; color: #1f2937; font-size: 14px; }
    .footer { text-align: center; color: #9ca3af; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; }
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
      
      <div class="stat-row">
        <div class="stat-label">Total Orders</div>
        <div class="stat-value">${orders.total}</div>
      </div>
      
      <div class="stat-row">
        <div class="stat-label">Cash</div>
        <div class="stat-value">${orders.byPaymentMethod.cash} orders</div>
      </div>
      
      <div class="stat-row">
        <div class="stat-label">UPI</div>
        <div class="stat-value">${orders.byPaymentMethod.upi} orders</div>
      </div>
      
      <div class="stat-row">
        <div class="stat-label">Card</div>
        <div class="stat-value">${orders.byPaymentMethod.card} orders</div>
      </div>
      
      <div class="stat-row">
        <div class="stat-label">Credit</div>
        <div class="stat-value">${orders.byPaymentMethod.credit} orders</div>
      </div>
      
      <div class="stat-row" style="border-bottom: none; margin-top: 10px; padding-top: 10px; border-top: 2px solid #e5e7eb;">
        <div class="stat-label">Total Expenses</div>
        <div class="stat-value" style="color: #ef4444;">₹ ${expenses.total.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
      </div>
      
      ${creditOrders.count > 0 ? `
      <div class="stat-row" style="border-bottom: none;">
        <div class="stat-label">Pending Credit</div>
        <div class="stat-value" style="color: #f59e0b;">₹ ${creditOrders.totalPending.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})} (${creditOrders.count} orders)</div>
      </div>
      ` : ''}
    </div>

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
      
      <div class="stat-row">
        <div class="stat-label">Total Inventory Value</div>
        <div class="stat-value">₹ ${inventory.totalValue.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
      </div>
      
      <div class="stat-row" style="border-bottom: none;">
        <div class="stat-label">Low Stock Items</div>
        <div class="stat-value" style="color: ${inventory.lowStockCount > 0 ? '#ef4444' : '#10b981'};">${inventory.lowStockCount}</div>
      </div>
      
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
