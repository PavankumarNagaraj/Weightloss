# Daily Email Cron Job

This Supabase Edge Function automatically sends a daily cafe report email at 11:55pm IST every day.

## Setup Instructions

### 1. Deploy the Edge Function

```bash
# Deploy the function to Supabase
supabase functions deploy daily-email-cron
```

### 2. Set Environment Variables

Make sure these environment variables are set in your Supabase project:

```bash
BREVO_API_KEY=your_brevo_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Enable Cron Schedule

The cron job is configured to run at 11:55pm IST (18:25 UTC) daily via the `cron.yaml` file.

Supabase will automatically pick up the cron schedule when you deploy the function.

### 4. Create Required Database Tables

Since the app currently uses localStorage, you need to create Supabase tables to store the data:

```sql
-- Create cafe_orders table
CREATE TABLE cafe_orders (
  id TEXT PRIMARY KEY,
  order_number TEXT,
  customer_name TEXT,
  customer_type TEXT,
  items JSONB,
  total_amount NUMERIC,
  date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create cafe_inventory table
CREATE TABLE cafe_inventory (
  id TEXT PRIMARY KEY,
  name TEXT,
  current_stock NUMERIC,
  min_stock NUMERIC,
  unit TEXT,
  category TEXT,
  price_per_unit NUMERIC,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create cafe_expenses table
CREATE TABLE cafe_expenses (
  id TEXT PRIMARY KEY,
  category TEXT,
  description TEXT,
  amount NUMERIC,
  date DATE,
  purchase_id TEXT,
  order_number TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create cafe_purchases table
CREATE TABLE cafe_purchases (
  id TEXT PRIMARY KEY,
  order_number TEXT,
  supplier_name TEXT,
  items JSONB,
  total_amount NUMERIC,
  notes TEXT,
  date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 5. Sync LocalStorage to Supabase

You'll need to update your frontend code to sync data to Supabase tables instead of just localStorage.

## Schedule

- **Time:** 11:55pm IST (18:25 UTC)
- **Frequency:** Daily
- **Cron Expression:** `25 18 * * *`

## How It Works

1. Cron triggers the function at scheduled time
2. Function fetches data from Supabase tables
3. Generates daily report with orders, expenses, inventory
4. Sends email via Brevo API
5. Logs success/failure

## Testing

To manually trigger the function for testing:

```bash
# Invoke the function manually
supabase functions invoke daily-email-cron
```

Or test via HTTP:

```bash
curl -X POST https://your-project.supabase.co/functions/v1/daily-email-cron \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

## Monitoring

Check function logs in Supabase Dashboard:
1. Go to Edge Functions
2. Select `daily-email-cron`
3. View logs to see execution history

## Troubleshooting

- **Email not sending:** Check BREVO_API_KEY is correct
- **No data in report:** Ensure Supabase tables have data
- **Cron not running:** Verify cron.yaml is deployed with function
- **Wrong timezone:** Adjust cron schedule in cron.yaml

## Alternative: Keep Using LocalStorage

If you want to keep using localStorage without migrating to Supabase tables, you can:

1. Use a different approach with a backend service
2. Or use the client-side scheduling (requires app to be open)
3. Or store localStorage data in Supabase Storage as JSON files

Current implementation assumes data is in Supabase tables for proper server-side cron execution.
