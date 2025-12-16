import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get settings from database
    const { data: settings, error: settingsError } = await supabaseClient
      .from('cafe_settings')
      .select('*')
      .single()

    if (settingsError) {
      console.error('Error fetching settings:', settingsError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch settings' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Check if auto-send is enabled
    if (!settings.auto_send_enabled) {
      return new Response(
        JSON.stringify({ message: 'Auto-send is disabled' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Check if email already sent today
    const today = new Date().toISOString().split('T')[0]
    if (settings.last_email_sent === today) {
      return new Response(
        JSON.stringify({ message: 'Email already sent today' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Fetch dashboard data
    const { data: orders } = await supabaseClient
      .from('cafe_orders')
      .select('*')
      .order('created_at', { ascending: false })

    const { data: inventory } = await supabaseClient
      .from('cafe_inventory')
      .select('*')

    const { data: purchases } = await supabaseClient
      .from('cafe_purchases')
      .select('*')

    const { data: expenses } = await supabaseClient
      .from('cafe_expenses')
      .select('*')

    const { data: investments } = await supabaseClient
      .from('cafe_investments')
      .select('*')

    // Calculate stats
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    
    const todayOrders = orders?.filter(o => new Date(o.created_at) >= todayStart) || []
    const todayRevenue = todayOrders.reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0)
    
    const lowStockItems = inventory?.filter(item => 
      (item.current_stock || 0) <= (item.min_stock || 0)
    ) || []

    // Generate email HTML
    const emailHTML = generateEmailHTML({
      todayOrders: todayOrders.length,
      todayRevenue,
      lowStockCount: lowStockItems.length,
      lowStockItems,
      date: new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    })

    // Send email using Resend
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured')
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Cafe Management <noreply@yourdomain.com>',
        to: [settings.recipient_email],
        subject: `☕ Daily Report - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        html: emailHTML,
      }),
    })

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text()
      console.error('Resend API error:', errorText)
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: errorText }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Update last_email_sent in database
    await supabaseClient
      .from('cafe_settings')
      .update({ last_email_sent: today })
      .eq('id', settings.id)

    const result = await emailResponse.json()

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Daily report sent successfully',
        emailId: result.id 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('Error in send-daily-report function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

function generateEmailHTML(data: any): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; }
    .header p { margin: 5px 0 0 0; opacity: 0.9; }
    .content { padding: 30px; }
    .stat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
    .stat-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; border-left: 4px solid #667eea; }
    .stat-card h3 { margin: 0 0 10px 0; color: #667eea; font-size: 14px; text-transform: uppercase; }
    .stat-card p { margin: 0; font-size: 32px; font-weight: bold; color: #333; }
    .alert { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .alert h3 { margin: 0 0 10px 0; color: #856404; }
    .item-list { list-style: none; padding: 0; margin: 10px 0; }
    .item-list li { padding: 8px; background: white; margin: 5px 0; border-radius: 4px; border: 1px solid #dee2e6; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>☕ Daily Cafe Report</h1>
      <p>${data.date}</p>
    </div>
    
    <div class="content">
      <h2 style="color: #667eea; margin-top: 0;">Today's Summary</h2>
      
      <div class="stat-grid">
        <div class="stat-card">
          <h3>Orders</h3>
          <p>${data.todayOrders}</p>
        </div>
        <div class="stat-card">
          <h3>Revenue</h3>
          <p>₹${data.todayRevenue.toFixed(0)}</p>
        </div>
      </div>
      
      ${data.lowStockCount > 0 ? `
      <div class="alert">
        <h3>⚠️ Low Stock Alert</h3>
        <p><strong>${data.lowStockCount}</strong> item(s) need restocking:</p>
        <ul class="item-list">
          ${data.lowStockItems.slice(0, 5).map((item: any) => `
            <li><strong>${item.name}</strong> - Current: ${item.current_stock} ${item.unit} (Min: ${item.min_stock})</li>
          `).join('')}
          ${data.lowStockCount > 5 ? `<li>...and ${data.lowStockCount - 5} more items</li>` : ''}
        </ul>
      </div>
      ` : '<p style="color: #28a745; font-weight: bold;">✅ All inventory levels are good!</p>'}
    </div>
    
    <div class="footer">
      <p>Generated automatically by Cafe Management System</p>
      <p>Sent at ${new Date().toLocaleTimeString()}</p>
    </div>
  </div>
</body>
</html>
  `
}
