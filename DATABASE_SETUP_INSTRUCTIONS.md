# Database Setup Instructions

## Missing Tables Error Fix

You're seeing this error because the `cafe_settings` and `cafe_weekly_plans` tables don't exist in your Supabase database yet.

## How to Fix

### Option 1: Run SQL in Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the entire contents of `supabase_migrations/create_cafe_settings_and_weekly_plans.sql`
6. Click **Run** or press `Ctrl+Enter`

### Option 2: Use Supabase CLI

```bash
# If you have Supabase CLI installed
supabase db push
```

## What Gets Created

### 1. cafe_settings Table
Stores application settings:
- `id` - Always 1 (single row table)
- `cron_time` - Time for daily email (default: 23:55)
- `recipient_email` - Email recipient
- `recipient_name` - Recipient name
- `auto_send_enabled` - Enable/disable auto emails
- `last_email_sent` - Last email sent date
- `created_at`, `updated_at` - Timestamps

### 2. cafe_weekly_plans Table
Stores weekly meal plans:
- `id` - Auto-incrementing ID
- `week_start_date` - Monday date (unique)
- `plan_data` - JSON with meal plans
- `created_at`, `updated_at` - Timestamps

## Security

Both tables have Row Level Security (RLS) enabled with policies that allow:
- ✅ Read access for all users
- ✅ Insert access for all users
- ✅ Update access for all users
- ✅ Delete access for all users (weekly_plans only)

## After Running the Migration

1. Refresh your application
2. The Settings page should now work
3. The Subscription Orders page should now work
4. All data will persist in the database

## Verification

To verify the tables were created successfully:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('cafe_settings', 'cafe_weekly_plans');

-- Check cafe_settings default row
SELECT * FROM cafe_settings;

-- Check cafe_weekly_plans structure
SELECT * FROM cafe_weekly_plans LIMIT 1;
```

## Troubleshooting

**Error: "relation already exists"**
- This is fine, it means the tables are already created

**Error: "permission denied"**
- Make sure you're logged in as the database owner
- Check RLS policies are correctly set

**Tables created but app still shows error**
- Clear browser cache
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Check Supabase connection in browser console
