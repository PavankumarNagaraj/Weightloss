# 🎉 Final Setup Steps - Almost Done!

## ✅ What's Already Complete:

1. ✅ **Edge Function Deployed** - `daily-email-cron` is live on Supabase
2. ✅ **Brevo API Key Set** - Already configured as Supabase secret
3. ✅ **Project Linked** - Connected to `capvowxxembnycdonghv`

---

## 🚀 Last Step - Enable Automated Scheduling:

### **Run This SQL in Supabase Dashboard:**

1. Go to: https://supabase.com/dashboard/project/capvowxxembnycdonghv/sql/new

2. Copy and paste this entire SQL:

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create the trigger function
CREATE OR REPLACE FUNCTION trigger_daily_email_if_enabled()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  settings_record RECORD;
  current_hour INTEGER;
  current_minute INTEGER;
  target_hour INTEGER;
  target_minute INTEGER;
  today_date TEXT;
BEGIN
  SELECT * INTO settings_record FROM cafe_settings WHERE id = 1;
  
  IF settings_record.auto_send_enabled = false THEN
    RAISE NOTICE 'Auto-send is disabled';
    RETURN;
  END IF;
  
  current_hour := EXTRACT(HOUR FROM (NOW() AT TIME ZONE 'UTC' + INTERVAL '5 hours 30 minutes'));
  current_minute := EXTRACT(MINUTE FROM (NOW() AT TIME ZONE 'UTC' + INTERVAL '5 hours 30 minutes'));
  
  target_hour := COALESCE(SPLIT_PART(settings_record.cron_time, ':', 1)::INTEGER, 23);
  target_minute := COALESCE(SPLIT_PART(settings_record.cron_time, ':', 2)::INTEGER, 55);
  
  IF ABS((current_hour * 60 + current_minute) - (target_hour * 60 + target_minute)) <= 5 THEN
    today_date := (NOW() AT TIME ZONE 'UTC' + INTERVAL '5 hours 30 minutes')::DATE::TEXT;
    
    IF settings_record.last_email_sent::TEXT = today_date THEN
      RAISE NOTICE 'Email already sent today: %', today_date;
      RETURN;
    END IF;
    
    RAISE NOTICE 'Triggering email at IST %:%', current_hour, current_minute;
    
    PERFORM
      net.http_post(
        url := 'https://capvowxxembnycdonghv.supabase.co/functions/v1/daily-email-cron',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhcHZvd3h4ZW1ibnljZG9uZ2h2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTI3NzUwOSwiZXhwIjoyMDgwODUzNTA5fQ.mYDzucrg1MrN51BGZ5W09nL6ohrHv6j3-2xsA-m6G2E'
        ),
        body := '{}'::jsonb
      );
    
    UPDATE cafe_settings 
    SET last_email_sent = today_date::DATE 
    WHERE id = 1;
    
    RAISE NOTICE 'Email triggered successfully';
  ELSE
    RAISE NOTICE 'Not time yet. Current: %:%, Target: %:%', current_hour, current_minute, target_hour, target_minute;
  END IF;
END;
$$;

-- Schedule to run every 5 minutes
SELECT cron.schedule(
  'daily-cafe-email-check',
  '*/5 * * * *',
  $$SELECT trigger_daily_email_if_enabled()$$
);
```

3. Click **"Run"** button

4. You should see: "Success. No rows returned"

---

## ✅ Verify It's Working:

Run this in SQL Editor:

```sql
-- Check if cron job is scheduled
SELECT * FROM cron.job WHERE jobname = 'daily-cafe-email-check';
```

You should see 1 row with your scheduled job.

---

## 🎨 Configure Email Time:

1. Go to your Cafe Management app → **Settings**
2. Set **"Daily Report Time"** (e.g., 23:55)
3. Set **"Recipient Email"** (e.g., pavankumar.nagaraj@gmail.com)
4. Enable **"Auto-Send"** ✅
5. Click **"Save Settings"**

---

## 🧪 Test It Now:

To test immediately, run this in SQL Editor:

```sql
SELECT trigger_daily_email_if_enabled();
```

This will trigger the email function right now (if auto-send is enabled).

---

## 📊 Monitor Execution:

Check cron job history:

```sql
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'daily-cafe-email-check')
ORDER BY start_time DESC LIMIT 10;
```

---

## 🎉 That's It!

Once you run the SQL, your automated email system will be:
- ✅ Running every 5 minutes
- ✅ Checking your Settings for the configured time
- ✅ Sending emails automatically at your chosen time
- ✅ No browser needed!

**Emails will now send automatically every day!** 📧🎉
