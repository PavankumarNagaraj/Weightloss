# 📧 Automated Daily Email Setup (Using Your Existing Brevo Function)

## 🎯 Overview

You already have everything you need! This guide sets up **TRUE automated emails** using your existing `daily-email-cron` Edge Function with Brevo API.

**What you already have:**
- ✅ `daily-email-cron` Edge Function (fully functional)
- ✅ `send-email` Edge Function (generic sender)
- ✅ Brevo API integration
- ✅ Database tables with all your cafe data

**What we're adding:**
- 🔔 pg_cron (database scheduler) to trigger your function automatically

---

## 🚀 Super Simple Setup (3 Steps!)

### **Step 1: Enable pg_cron Extension**

In Supabase Dashboard → SQL Editor, run:

```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
```

---

### **Step 2: Get Your Supabase Details**

You need two things:

1. **Project Reference** - Get from Supabase URL:
   - URL format: `https://YOUR_PROJECT_REF.supabase.co`
   - Example: If URL is `https://abcdefgh.supabase.co`, then `YOUR_PROJECT_REF = abcdefgh`

2. **Service Role Key** - Get from:
   - Supabase Dashboard → Settings → API → `service_role` key (secret)
   - Starts with `eyJ...`

---

### **Step 3: Schedule the Cron Job**

Copy the SQL from `supabase_migrations/setup_brevo_email_cron.sql` and:

1. Replace `YOUR_PROJECT_REF` with your actual project reference
2. Replace `YOUR_SERVICE_ROLE_KEY` with your actual service role key
3. Run it in Supabase SQL Editor

**Or use this quick version:**

```sql
SELECT cron.schedule(
  'daily-cafe-email-report',
  '25 18 * * *',  -- 18:25 UTC = 23:55 IST
  $$
  SELECT
    net.http_post(
      url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/daily-email-cron',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
      ),
      body := '{}'::jsonb
    );
  $$
);
```

---

## ✅ That's It!

Your automated email system is now:
- ✅ Running on Supabase servers (no browser needed)
- ✅ Scheduled with pg_cron (database-level)
- ✅ Using your existing Brevo integration
- ✅ Sending to: pavankumar.nagaraj@gmail.com
- ✅ Completely free (within Brevo's free tier)

**Emails will now send automatically every day at 23:55 IST!** 📧

---

## 🔍 Verify It's Working

### **Check if cron job is scheduled:**

```sql
SELECT * FROM cron.job WHERE jobname = 'daily-cafe-email-report';
```

You should see your scheduled job with the cron expression `25 18 * * *`

### **Check execution history:**

```sql
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'daily-cafe-email-report')
ORDER BY start_time DESC LIMIT 5;
```

This shows the last 5 times the job ran.

### **Test manually:**

```bash
curl -i --location --request POST \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/daily-email-cron' \
  --header 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  --header 'Content-Type: application/json' \
  --data '{}'
```

---

## ⏰ Change the Time

To change when emails are sent:

1. **Unschedule the old job:**
```sql
SELECT cron.unschedule('daily-cafe-email-report');
```

2. **Schedule with new time:**
```sql
SELECT cron.schedule(
  'daily-cafe-email-report',
  '30 17 * * *',  -- Example: 23:00 IST = 17:30 UTC
  $$
  SELECT
    net.http_post(
      url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/daily-email-cron',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
      ),
      body := '{}'::jsonb
    );
  $$
);
```

### **Time Conversion Table (IST to UTC):**

| IST Time | UTC Time | Cron Expression |
|----------|----------|-----------------|
| 23:55 | 18:25 | `25 18 * * *` |
| 23:00 | 17:30 | `30 17 * * *` |
| 22:00 | 16:30 | `30 16 * * *` |
| 21:00 | 15:30 | `30 15 * * *` |
| 09:00 | 03:30 | `30 3 * * *` |
| 08:00 | 02:30 | `30 2 * * *` |

---

## 📊 What the Email Contains

Your `daily-email-cron` function already sends a beautiful email with:

- 📋 **Today's Orders** - Count and revenue
- 💰 **Net Revenue** - Income minus expenses
- 📦 **Low Stock Alerts** - Items that need restocking
- 💳 **Credit Orders** - Pending payments
- 💵 **Today's Expenses** - Purchases and other costs
- 📈 **Inventory Value** - Total stock value

All data is fetched live from your Supabase database!

---

## 🐛 Troubleshooting

### **Email not sending?**

1. **Check if Brevo API key is set:**
```bash
# Set it if not already set
supabase secrets set BREVO_API_KEY=xkeysib-YOUR_BREVO_KEY
```

2. **Check function logs:**
```bash
supabase functions logs daily-email-cron --tail
```

3. **Verify cron job is running:**
```sql
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'daily-cafe-email-report')
ORDER BY start_time DESC LIMIT 1;
```

Look at the `status` column - should be `succeeded`

### **Cron not triggering?**

- Make sure `pg_cron` extension is enabled
- Check the cron expression matches your desired time
- Remember: IST = UTC + 5:30
- Verify the function URL is correct

### **Wrong email recipient?**

The email is hardcoded in the function to: `pavankumar.nagaraj@gmail.com`

To change it, edit `supabase/functions/daily-email-cron/index.ts` line 384:
```typescript
const recipientEmail = 'your-new-email@example.com';
```

Then redeploy:
```bash
supabase functions deploy daily-email-cron
```

---

## 💰 Cost

**Completely FREE!**
- Brevo: 300 emails/day free tier ✅
- Supabase: 500K Edge Function calls/month free ✅
- pg_cron: Included with Supabase ✅

For 1 email/day, you'll never hit any limits!

---

## 🔐 Security

- ✅ Service role key only used server-side in pg_cron
- ✅ Brevo API key stored as Supabase secret (encrypted)
- ✅ No sensitive keys in frontend code
- ✅ Database access controlled by RLS policies

---

## 🎉 Summary

You don't need to install anything new! Just:

1. Enable `pg_cron` extension ✅
2. Schedule your existing `daily-email-cron` function ✅
3. Done! ✅

Your existing Brevo-based email system will now run automatically every day without any browser being open! 🚀📧
