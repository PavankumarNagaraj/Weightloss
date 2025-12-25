import dotenv from 'dotenv';

dotenv.config();

// Supabase configuration (from environment variables)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase environment variables. Please set SUPABASE_URL and SUPABASE_ANON_KEY in .env file');
}

/**
 * Send nutrition chart email via Supabase Edge Function
 * Uses the same Supabase function as daily reports, just with different content
 * @param {Object} params - Email parameters
 * @param {string} params.to - Recipient email
 * @param {string} params.dishName - Name of the dish
 * @param {number} params.totalCalories - Total calories
 * @param {Array} params.ingredients - Array of ingredients with calories
 * @param {Object} params.macros - Macro nutrients (protein, carbs, fat, fiber)
 * @returns {Promise<Object>} - Result of email send
 */
export const sendNutritionChartEmail = async ({ to, dishName, totalCalories, ingredients, macros }) => {
  try {
    // Format ingredients list for email
    const ingredientsList = ingredients
      .map(ing => `  • ${ing.name} (${ing.quantity}${ing.unit}): ${ing.calories} cal`)
      .join('\n');

    // Format macros
    const macrosList = `
  • Protein: ${macros.protein}g
  • Carbs: ${macros.carbs}g
  • Fat: ${macros.fat}g
  • Fiber: ${macros.fiber}g`;

    // Calculate percentages for visual bars
    const totalMacros = parseFloat(macros.protein) + parseFloat(macros.carbs) + parseFloat(macros.fat) + parseFloat(macros.fiber);
    const proteinPercent = totalMacros > 0 ? ((parseFloat(macros.protein) / totalMacros) * 100).toFixed(1) : 0;
    const carbsPercent = totalMacros > 0 ? ((parseFloat(macros.carbs) / totalMacros) * 100).toFixed(1) : 0;
    const fatPercent = totalMacros > 0 ? ((parseFloat(macros.fat) / totalMacros) * 100).toFixed(1) : 0;
    const fiberPercent = totalMacros > 0 ? ((parseFloat(macros.fiber) / totalMacros) * 100).toFixed(1) : 0;

    // Calculate max calories for bar width scaling
    const maxCalories = Math.max(...ingredients.map(ing => parseFloat(ing.calories) || 0));

    const subject = `Nutrition Analysis: ${dishName} - Afterburn`;
    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1f2937; background: #f3f4f6; margin: 0; padding: 20px; }
    .container { max-width: 650px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 50%, #dc2626 100%); color: white; padding: 40px 30px; text-align: center; position: relative; }
    .header::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" fill="rgba(255,255,255,0.05)"/></svg>') repeat; opacity: 0.3; }
    .header h1 { margin: 0; font-size: 32px; font-weight: 800; position: relative; z-index: 1; text-shadow: 2px 2px 4px rgba(0,0,0,0.2); }
    .header .brand { font-size: 14px; margin-top: 8px; opacity: 0.95; position: relative; z-index: 1; letter-spacing: 1px; }
    .content { padding: 0; }
    
    .calories-hero { background: linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%); padding: 40px 30px; text-align: center; border-bottom: 4px solid #f97316; position: relative; }
    .calories-hero::after { content: '🔥'; position: absolute; top: 10px; right: 20px; font-size: 60px; opacity: 0.2; }
    .calories-label { font-size: 12px; color: #9a3412; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; }
    .calories-number { font-size: 72px; font-weight: 900; color: #f97316; margin: 15px 0; text-shadow: 2px 2px 0 rgba(249, 115, 22, 0.2); line-height: 1; }
    .calories-unit { font-size: 14px; color: #9a3412; font-weight: 600; }
    
    .section { padding: 30px; border-bottom: 1px solid #e5e7eb; }
    .section:last-child { border-bottom: none; }
    .section-title { color: #f97316; font-size: 18px; font-weight: 700; margin: 0 0 20px 0; display: flex; align-items: center; gap: 10px; }
    .section-title::before { content: ''; width: 4px; height: 24px; background: linear-gradient(to bottom, #f97316, #ea580c); border-radius: 2px; }
    
    .ingredient-bar { margin-bottom: 20px; }
    .ingredient-info { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 13px; }
    .ingredient-name { font-weight: 600; color: #374151; }
    .ingredient-calories { font-weight: 700; color: #f97316; }
    .bar-container { background: #e5e7eb; height: 32px; border-radius: 16px; overflow: hidden; position: relative; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1); }
    .bar-fill { height: 100%; border-radius: 16px; display: flex; align-items: center; justify-content: flex-end; padding-right: 12px; font-size: 11px; font-weight: 700; color: white; text-shadow: 1px 1px 2px rgba(0,0,0,0.3); transition: width 0.5s ease; }
    
    .macro-visual { margin-top: 20px; }
    .macro-row { margin-bottom: 20px; }
    .macro-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .macro-label { font-size: 14px; font-weight: 700; display: flex; align-items: center; gap: 8px; }
    .macro-value { font-size: 18px; font-weight: 800; }
    .macro-bar-container { background: #f3f4f6; height: 24px; border-radius: 12px; overflow: hidden; position: relative; }
    .macro-bar { height: 100%; border-radius: 12px; display: flex; align-items: center; padding-left: 12px; font-size: 11px; font-weight: 700; color: white; }
    
    .protein-color { color: #3b82f6; } .protein-bg { background: linear-gradient(90deg, #3b82f6, #60a5fa); }
    .carbs-color { color: #f59e0b; } .carbs-bg { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
    .fat-color { color: #ef4444; } .fat-bg { background: linear-gradient(90deg, #ef4444, #f87171); }
    .fiber-color { color: #10b981; } .fiber-bg { background: linear-gradient(90deg, #10b981, #34d399); }
    
    .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 20px; }
    .summary-card { background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%); padding: 20px; border-radius: 12px; text-align: center; border: 2px solid #e5e7eb; }
    .summary-card-value { font-size: 28px; font-weight: 800; margin: 8px 0; }
    .summary-card-label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
    
    .footer { background: linear-gradient(to right, #1f2937, #374151); color: white; padding: 30px; text-align: center; }
    .footer p { margin: 5px 0; }
    .footer-brand { font-size: 16px; font-weight: 700; color: #f97316; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔥 ${dishName}</h1>
      <div class="brand">NUTRITION ANALYSIS BY <strong>AFTERBURN</strong></div>
    </div>
    
    <div class="calories-hero">
      <div class="calories-label">TOTAL CALORIES</div>
      <div class="calories-number">${totalCalories}</div>
      <div class="calories-unit">kcal per serving</div>
    </div>

    <div class="content">
      <div class="section">
        <h2 class="section-title">📊 Ingredient Breakdown</h2>
        ${ingredients.map((ing, index) => {
          const calories = parseFloat(ing.calories) || 0;
          const percentage = totalCalories > 0 ? ((calories / totalCalories) * 100).toFixed(1) : 0;
          const barWidth = maxCalories > 0 ? ((calories / maxCalories) * 100).toFixed(1) : 0;
          const colors = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4', '#ef4444'];
          const color = colors[index % colors.length];
          return `
          <div class="ingredient-bar">
            <div class="ingredient-info">
              <span class="ingredient-name">${ing.name} (${ing.quantity}${ing.unit})</span>
              <span class="ingredient-calories">${calories} cal • ${percentage}%</span>
            </div>
            <div class="bar-container">
              <div class="bar-fill" style="width: ${barWidth}%; background: linear-gradient(90deg, ${color}, ${color}dd);">
                ${barWidth > 20 ? percentage + '%' : ''}
              </div>
            </div>
          </div>`;
        }).join('')}
      </div>

      <div class="section">
        <h2 class="section-title">🥗 Macro Nutrients Distribution</h2>
        <div class="macro-visual">
          <div class="macro-row">
            <div class="macro-header">
              <span class="macro-label protein-color">💪 Protein</span>
              <span class="macro-value protein-color">${macros.protein}g</span>
            </div>
            <div class="macro-bar-container">
              <div class="macro-bar protein-bg" style="width: ${proteinPercent}%;">${proteinPercent}%</div>
            </div>
          </div>
          
          <div class="macro-row">
            <div class="macro-header">
              <span class="macro-label carbs-color">🍚 Carbs</span>
              <span class="macro-value carbs-color">${macros.carbs}g</span>
            </div>
            <div class="macro-bar-container">
              <div class="macro-bar carbs-bg" style="width: ${carbsPercent}%;">${carbsPercent}%</div>
            </div>
          </div>
          
          <div class="macro-row">
            <div class="macro-header">
              <span class="macro-label fat-color">🥑 Fat</span>
              <span class="macro-value fat-color">${macros.fat}g</span>
            </div>
            <div class="macro-bar-container">
              <div class="macro-bar fat-bg" style="width: ${fatPercent}%;">${fatPercent}%</div>
            </div>
          </div>
          
          <div class="macro-row">
            <div class="macro-header">
              <span class="macro-label fiber-color">🌾 Fiber</span>
              <span class="macro-value fiber-color">${macros.fiber}g</span>
            </div>
            <div class="macro-bar-container">
              <div class="macro-bar fiber-bg" style="width: ${fiberPercent}%;">${fiberPercent}%</div>
            </div>
          </div>
        </div>
        
        <div class="summary-grid">
          <div class="summary-card">
            <div class="summary-card-label">Total Macros</div>
            <div class="summary-card-value" style="color: #6b7280;">${totalMacros.toFixed(1)}g</div>
          </div>
          <div class="summary-card">
            <div class="summary-card-label">Calories</div>
            <div class="summary-card-value" style="color: #f97316;">${totalCalories}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="footer">
      <p class="footer-brand">AFTERBURN CAFE</p>
      <p style="font-size: 12px; opacity: 0.8; margin-top: 10px;">Professional Nutrition Tracking & Analysis</p>
      <p style="font-size: 11px; opacity: 0.6; margin-top: 15px;">Generated on ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
    </div>
  </div>
</body>
</html>`;

    const textBody = `
NUTRITION ANALYSIS: ${dishName}
By Afterburn

TOTAL CALORIES: ${totalCalories} kcal per serving

INGREDIENT BREAKDOWN:
${ingredientsList}

MACRO NUTRIENTS:
${macrosList}

---
This nutrition analysis was generated by Afterburn Cafe
`;

    // Send email via Supabase Edge Function (same as working daily reports)
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipientEmail: to,
        recipientName: to.split('@')[0],
        subject,
        htmlContent: htmlBody,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send email via Supabase function');
    }

    const result = await response.json();
    console.log('Email sent successfully to:', to, 'Message ID:', result.messageId);

    return {
      success: true,
      message: 'Email sent successfully',
      messageId: result.messageId
    };
  } catch (error) {
    console.error('Error in sendNutritionChartEmail:', error);
    throw error;
  }
};

export default {
  sendNutritionChartEmail
};
