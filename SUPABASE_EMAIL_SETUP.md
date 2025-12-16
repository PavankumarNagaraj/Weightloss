# 📧 Automated Daily Email Setup with Supabase

## 🎯 Overview

This guide sets up **TRUE automated emails** that send daily reports without requiring your browser to be open. Uses:
- **Supabase Edge Functions** - Serverless email sending
- **pg_cron** - Database-level cron scheduler
- **Resend API** - Reliable email delivery

---

## 🚀 Quick Setup

### **Step 1: Get Resend API Key**

1. Go to https://resend.com/
2. Sign up for free account (100 emails/day free)
3. Go to **API Keys** section
4. Create new API key
5. Copy the key (starts with `re_`)

---

### **Step 2: Install Supabase CLI**

```bash
# macOS
brew install supabase/tap/supabase

# Or use npm
npm install -g supabase
```

---

### **Step 3: Login to Supabase**

```bash
supabase login
```

This will open your browser to authenticate.

---

### **Step 4: Link to Your Supabase Project**

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

Find your project ref at: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/general

---

### **Step 5: Set Resend API Key as Secret**

```bash
supabase secrets set RESEND_API_KEY=re_YOUR_ACTUAL_API_KEY_HERE
```

---

### **Step 6: Deploy the Edge Function**

```bash
supabase functions deploy send-daily-report
```

This deploys the automated email function to Supabase!

---

### **Step 7: Enable pg_cron Extension**

In Supabase Dashboard → SQL Editor, run:

```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
```

---

### **Step 8: Setup Automated Cron Job**

Run the SQL migration file `setup_daily_email_cron.sql` in Supabase SQL Editor.

Or manually schedule the cron job:

```sql
-- Schedule daily email at 23:55 IST (18:25 UTC)
SELECT cron.schedule(
  'daily-cafe-report',
  '25 18 * * *',  -- 18:25 UTC = 23:55 IST
  $$
  SELECT
    net.http_post(
      url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-daily-report',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := '{}'
    );
  $$
);
```

**Note:** Adjust the cron time based on your `cafe_settings.cron_time`

---

### **Step 9: Configure Email in Settings**

In your cafe app:

1. Go to **Settings** page
2. Configure:
   - **Recipient Email:** Your email address
   - **Recipient Name:** Your name
   - **Daily Report Time:** 23:55 (or your preferred time)
   - **Enable Auto-Send:** ✅ Checked
3. Click **Save Settings**

---

## 🧪 Test the Function

### **Test Manually:**

```bash
curl -i --location --request POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-daily-report' \
  --header 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  --header 'Content-Type: application/json' \
  --data '{}'
```

Get your service role key from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api

### **Check Cron Jobs:**

```sql
-- View all scheduled jobs
SELECT * FROM cron.job;

-- View job run history
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
```

### **Test from Dashboard:**

Go to your cafe Dashboard and click the **"Email Report"** button to test immediately

---

## 📝 Environment Variables

### **Supabase Secrets (Production):**

```bash
supabase secrets set RESEND_API_KEY=re_YOUR_API_KEY_HERE
```

### **Local Testing:**

Create `supabase/.env.local`:

```bash
RESEND_API_KEY=re_YOUR_API_KEY_HERE
SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_ROLE_KEY=your_local_service_role_key
```

---

## 🔧 Configuration

### **Email Settings:**
- **Provider:** Resend API
- **Sender:** Configure in Resend dashboard
- **Recipient:** Set in cafe Settings page
- **Schedule:** Set in cafe Settings page (stored in `cafe_settings` table)

### **Supabase Function:**
- **Name:** send-daily-report
- **Runtime:** Deno
- **CORS:** Enabled for all origins
- **Trigger:** pg_cron (database-level scheduler)

### **Cron Schedule:**
- **Default:** 23:55 IST (18:25 UTC)
- **Frequency:** Daily
- **Adjustable:** Update cron expression in SQL

---

## 📊 How It Works

### **Automated Flow:**

1. **pg_cron** runs daily at scheduled time (e.g., 23:55 IST)
2. Cron job calls **send-daily-report** Edge Function
3. Function checks `cafe_settings` for:
   - Is auto-send enabled?
   - Has email been sent today?
   - What's the recipient email?
4. Function fetches data from database:
   - Today's orders and revenue
   - Low stock items
   - Other cafe metrics
5. Generates beautiful HTML email
6. Sends via **Resend API**
7. Updates `last_email_sent` in database
8. Email delivered to recipient ✅

### **Manual Sending:**

- Dashboard "Email Report" button
- Calls same Edge Function immediately
- No browser dependency
- Works anytime

---

## 🐛 Troubleshooting

### **"RESEND_API_KEY not configured" error:**
```bash
supabase secrets set RESEND_API_KEY=re_YOUR_KEY
supabase functions deploy send-daily-report
```

### **Email not sending automatically:**

1. Check if cron job is scheduled:
```sql
SELECT * FROM cron.job WHERE jobname = 'daily-cafe-report';
```

2. Check cron job execution history:
```sql
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'daily-cafe-report')
ORDER BY start_time DESC LIMIT 5;
```

3. Check if auto-send is enabled:
```sql
SELECT auto_send_enabled, recipient_email, cron_time, last_email_sent 
FROM cafe_settings WHERE id = 1;
```

### **Function logs:**
```bash
supabase functions logs send-daily-report --tail
```

### **Cron not triggering:**
- Verify pg_cron extension is enabled
- Check cron expression matches your timezone
- IST = UTC + 5:30 (e.g., 23:55 IST = 18:25 UTC)

### **Email already sent today:**
- Function prevents duplicate emails
- Check `last_email_sent` field in `cafe_settings`
- Resets automatically next day

---

## 🎯 Complete Setup Commands

```bash
# 1. Install Supabase CLI
brew install supabase/tap/supabase

# 2. Login
supabase login

# 3. Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# 4. Set Resend API key
supabase secrets set RESEND_API_KEY=re_YOUR_ACTUAL_KEY

# 5. Deploy Edge Function
supabase functions deploy send-daily-report

# 6. Enable pg_cron (in Supabase SQL Editor)
CREATE EXTENSION IF NOT EXISTS pg_cron;

# 7. Run the cron setup SQL (in Supabase SQL Editor)
# Copy contents of: supabase_migrations/setup_daily_email_cron.sql

# 8. Configure in your app Settings page
# - Set recipient email
# - Set time (e.g., 23:55)
# - Enable auto-send

# 9. Test manually
curl -i --location --request POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-daily-report' \
  --header 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  --data '{}'
```

---

## ✅ Benefits of This Setup

- ✅ **No browser dependency** - Runs on Supabase servers
- ✅ **True automation** - pg_cron triggers daily
- ✅ **Serverless** - Scales automatically
- ✅ **Secure** - API keys stored as Supabase secrets
- ✅ **Reliable** - Database-level scheduling
- ✅ **Free tier** - Resend: 100 emails/day, Supabase: generous limits
- ✅ **Easy debugging** - Function logs and cron history
- ✅ **Configurable** - Change time/recipient in Settings UI

---

## 🎉 You're All Set!

Your automated email system is now:
- ✅ Deployed to Supabase Edge Functions
- ✅ Scheduled with pg_cron (database-level)
- ✅ Using Resend API for reliable delivery
- ✅ Completely independent of browser
- ✅ Configurable via Settings page
- ✅ Production-ready and scalable!

**Emails will now send automatically every day at your scheduled time!** 📧🎉

---

## 📅 Time Zone Conversion

| IST Time | UTC Time | Cron Expression |
|----------|----------|----------------|
| 23:55 | 18:25 | `25 18 * * *` |
| 23:00 | 17:30 | `30 17 * * *` |
| 22:00 | 16:30 | `30 16 * * *` |
| 09:00 | 03:30 | `30 3 * * *` |

Use this table to convert your desired IST time to UTC for the cron expression.
