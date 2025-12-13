// Clean Email Template for Daily Reports

export const generateCleanDailyEmail = (data) => {
  const { date, orders, inventory, creditOrders, expenses } = data;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { 
      font-family: Arial, sans-serif; 
      line-height: 1.6; 
      color: #333; 
      margin: 0; 
      padding: 0; 
      background-color: #f9fafb;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    .container { 
      max-width: 700px; 
      margin: 0 auto; 
      padding: 20px; 
      background-color: #f9fafb;
    }
    @media only screen and (max-width: 600px) {
      .container {
        padding: 10px !important;
      }
      .header {
        padding: 20px !important;
      }
      .section {
        padding: 15px !important;
        margin: 15px 0 !important;
      }
      .revenue-box {
        padding: 20px !important;
      }
      .revenue-value {
        font-size: 32px !important;
      }
      table {
        font-size: 13px !important;
      }
      th, td {
        padding: 8px !important;
      }
      .stat-table td {
        padding: 8px 0 !important;
      }
      .section-title {
        font-size: 16px !important;
      }
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

    <!-- 1. Revenue (Income - Expense) -->
    <div class="revenue-box">
      <div class="revenue-label">Net Revenue</div>
      <div class="revenue-value">₹ ${(orders.revenue - expenses.total).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
      <div style="font-size: 13px; opacity: 0.9; margin-top: 10px;">
        Income: ₹${orders.revenue.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})} • 
        Expenses: ₹${expenses.total.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
      </div>
    </div>

    <!-- 2. Order Details and Total -->
    <div class="section">
      <div class="section-title">📋 Today's Orders (${orders.total})</div>
      
      ${orders.todayOrders && orders.todayOrders.length > 0 ? `
        ${orders.todayOrders.map(order => `
          <div style="margin-bottom: 20px; padding: 15px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #10b981;">
            <table style="width: 100%; margin-bottom: 10px;">
              <tr>
                <td style="padding: 0;">
                  <strong style="color: #10b981; font-size: 14px;">Order #${order.orderNumber || 'N/A'}</strong>
                  <span style="color: #6b7280; font-size: 12px; margin-left: 10px;">
                    ${order.customerName} ${order.customerType ? `(${order.customerType})` : ''}
                  </span>
                </td>
                <td style="text-align: right; padding: 0;">
                  <strong style="color: #10b981; font-size: 16px;">₹${order.totalAmount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong>
                </td>
              </tr>
            </table>
            <table style="width: 100%; margin-top: 10px;">
              <thead>
                <tr style="background: #e5e7eb;">
                  <th style="padding: 8px; text-align: left; font-size: 11px;">Item</th>
                  <th style="padding: 8px; text-align: center; font-size: 11px;">Qty</th>
                  <th style="padding: 8px; text-align: right; font-size: 11px;">Price</th>
                  <th style="padding: 8px; text-align: right; font-size: 11px;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.items?.map(item => `
                  <tr>
                    <td style="padding: 6px; font-size: 12px;">${item.name}</td>
                    <td style="padding: 6px; text-align: center; font-size: 12px;">${item.quantity}</td>
                    <td style="padding: 6px; text-align: right; font-size: 12px;">₹${item.price?.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    <td style="padding: 6px; text-align: right; font-size: 12px; font-weight: bold;">₹${(item.price * item.quantity).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                  </tr>
                `).join('') || ''}
              </tbody>
            </table>
          </div>
        `).join('')}
        
        <div style="background: linear-gradient(to right, #d1fae5, #a7f3d0); padding: 15px; border-radius: 8px; border: 2px solid #10b981;">
          <table style="width: 100%;">
            <tr>
              <td style="padding: 0;">
                <span style="font-size: 16px; font-weight: bold; color: #065f46;">Total Orders Revenue</span>
              </td>
              <td style="text-align: right; padding: 0;">
                <span style="font-size: 24px; font-weight: 900; color: #047857;">₹${orders.revenue.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </td>
            </tr>
          </table>
        </div>
      ` : `
        <p style="color: #6b7280; margin: 0; text-align: center; padding: 20px;">No orders today</p>
      `}
    </div>

    <!-- 3. Expenses with Details -->
    <div class="section">
      <div class="section-title">💰 Today's Expenses</div>
      
      <div style="background: linear-gradient(to right, #fee2e2, #fecaca); padding: 15px; border-radius: 8px; border: 2px solid #ef4444; margin-bottom: 20px;">
        <table style="width: 100%;">
          <tr>
            <td style="padding: 0;">
              <span style="font-size: 16px; font-weight: bold; color: #991b1b;">Total Expenses</span>
            </td>
            <td style="text-align: right; padding: 0;">
              <span style="font-size: 24px; font-weight: 900; color: #dc2626;">₹${expenses.total.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </td>
          </tr>
        </table>
      </div>

      ${expenses.todayPurchases && expenses.todayPurchases.length > 0 ? `
        <h4 style="color: #667eea; font-size: 14px; margin: 20px 0 10px 0; font-weight: bold;">🛍️ Purchase Orders (₹${expenses.purchases.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})})</h4>
        ${expenses.todayPurchases.map(purchase => `
          <div style="margin-bottom: 15px; padding: 12px; background: #f9fafb; border-radius: 6px; border-left: 3px solid #667eea;">
            <table style="width: 100%; margin-bottom: 8px;">
              <tr>
                <td style="padding: 0;">
                  <strong style="color: #667eea; font-size: 13px;">PO #${purchase.orderNumber || 'N/A'}</strong>
                  <span style="color: #6b7280; font-size: 11px; margin-left: 8px;">${purchase.supplier}</span>
                </td>
                <td style="text-align: right; padding: 0;">
                  <strong style="color: #ef4444; font-size: 14px;">₹${purchase.totalCost.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong>
                </td>
              </tr>
            </table>
            <div style="font-size: 11px; color: #6b7280;">
              ${purchase.items?.map(item => `${item.materialName} (${item.quantity}${item.unit})`).join(', ') || ''}
            </div>
          </div>
        `).join('')}
      ` : ''}

      ${expenses.todayExpenses && expenses.todayExpenses.length > 0 ? `
        <h4 style="color: #f59e0b; font-size: 14px; margin: 20px 0 10px 0; font-weight: bold;">📝 Other Expenses (₹${expenses.other.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})})</h4>
        <table style="width: 100%;">
          <thead>
            <tr style="background: #f3f4f6;">
              <th style="padding: 8px; text-align: left; font-size: 11px;">Category</th>
              <th style="padding: 8px; text-align: left; font-size: 11px;">Description</th>
              <th style="padding: 8px; text-align: right; font-size: 11px;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${expenses.todayExpenses.map(expense => `
              <tr>
                <td style="padding: 6px; font-size: 12px; font-weight: 600;">${expense.category}</td>
                <td style="padding: 6px; font-size: 12px; color: #6b7280;">${expense.description || '-'}</td>
                <td style="padding: 6px; text-align: right; font-size: 12px; font-weight: bold; color: #ef4444;">₹${expense.amount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : ''}

      ${(!expenses.todayPurchases || expenses.todayPurchases.length === 0) && (!expenses.todayExpenses || expenses.todayExpenses.length === 0) ? `
        <p style="color: #6b7280; margin: 0; text-align: center; padding: 20px;">No expenses today</p>
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
            <th>Recommended Buy</th>
            <th>Est. Cost</th>
          </tr>
        </thead>
        <tbody>
          ${inventory.lowStockItems.slice(0, 10).map(item => {
            const rec = item.recommendation || {};
            const hasPurchaseHistory = rec.purchaseCount > 0;
            return `
            <tr>
              <td>${item.name}</td>
              <td style="color: #ef4444;">${item.currentStock} ${item.unit}</td>
              <td>${item.minStock} ${item.unit}</td>
              <td style="color: #10b981; font-weight: bold;">
                ${rec.recommendedQty || item.neededQty} ${rec.unit || item.unit}
                ${hasPurchaseHistory ? `<br><span style="font-size: 11px; color: #6b7280;">Avg from ${rec.purchaseCount} purchases</span>` : `<br><span style="font-size: 11px; color: #f59e0b;">No history</span>`}
              </td>
              <td style="color: #7c3aed; font-weight: bold;">
                ${rec.estimatedCost > 0 ? `₹${rec.estimatedCost.toLocaleString('en-IN')}` : '-'}
                ${rec.avgPricePerUnit > 0 ? `<br><span style="font-size: 11px; color: #6b7280;">@₹${rec.avgPricePerUnit}/${rec.unit}</span>` : ''}
              </td>
            </tr>
          `}).join('')}
          ${inventory.lowStockItems.length > 10 ? `
            <tr>
              <td colspan="5" style="text-align: center; color: #6b7280; font-size: 12px;">
                +${inventory.lowStockItems.length - 10} more items
              </td>
            </tr>
          ` : ''}
          ${inventory.lowStockItems.length > 0 ? `
            <tr style="background-color: #f3f4f6; font-weight: bold;">
              <td colspan="4" style="text-align: right; padding-right: 10px;">Total Estimated Cost:</td>
              <td style="color: #7c3aed; font-size: 16px;">
                ₹${inventory.lowStockItems.reduce((sum, item) => sum + ((item.recommendation?.estimatedCost || 0)), 0).toLocaleString('en-IN')}
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
