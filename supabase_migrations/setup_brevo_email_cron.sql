-- Setup pg_cron for automated daily email reports using existing Brevo function
-- This uses your existing daily-email-cron Edge Function
-- The cron time is dynamically read from cafe_settings table

-- Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a function that checks settings and sends email if conditions are met
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
  -- Get settings
  SELECT * INTO settings_record FROM cafe_settings WHERE id = 1;
  
  -- Check if auto-send is enabled
  IF settings_record.auto_send_enabled = false THEN
    RAISE NOTICE 'Auto-send is disabled';
    RETURN;
  END IF;
  
  -- Get current time in IST (UTC + 5:30)
  current_hour := EXTRACT(HOUR FROM (NOW() AT TIME ZONE 'UTC' + INTERVAL '5 hours 30 minutes'));
  current_minute := EXTRACT(MINUTE FROM (NOW() AT TIME ZONE 'UTC' + INTERVAL '5 hours 30 minutes'));
  
  -- Get target time from settings (default to 23:55 if not set)
  target_hour := COALESCE(SPLIT_PART(settings_record.cron_time, ':', 1)::INTEGER, 23);
  target_minute := COALESCE(SPLIT_PART(settings_record.cron_time, ':', 2)::INTEGER, 55);
  
  -- Check if current time matches target time (within 5 minute window)
  IF ABS((current_hour * 60 + current_minute) - (target_hour * 60 + target_minute)) <= 5 THEN
    -- Check if email already sent today
    today_date := (NOW() AT TIME ZONE 'UTC' + INTERVAL '5 hours 30 minutes')::DATE::TEXT;
    
    IF settings_record.last_email_sent::TEXT = today_date THEN
      RAISE NOTICE 'Email already sent today: %', today_date;
      RETURN;
    END IF;
    
    -- Send email by calling the Edge Function
    RAISE NOTICE 'Triggering email at IST %:%', current_hour, current_minute;
    
    PERFORM
      net.http_post(
        url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/daily-email-cron',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
        ),
        body := '{}'::jsonb
      );
    
    -- Update last_email_sent
    UPDATE cafe_settings 
    SET last_email_sent = today_date::DATE 
    WHERE id = 1;
    
    RAISE NOTICE 'Email triggered successfully';
  ELSE
    RAISE NOTICE 'Not time yet. Current: %:%, Target: %:%', current_hour, current_minute, target_hour, target_minute;
  END IF;
END;
$$;

-- Schedule the function to run every 5 minutes
-- It will check the cafe_settings.cron_time and only send if it matches
SELECT cron.schedule(
  'daily-cafe-email-check',
  '*/5 * * * *',  -- Every 5 minutes
  $$SELECT trigger_daily_email_if_enabled()$$
);

-- ==================== MANAGEMENT COMMANDS ====================

-- To view all scheduled jobs:
-- SELECT * FROM cron.job;

-- To view job run history:
-- SELECT * FROM cron.job_run_details 
-- WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'daily-cafe-email-check')
-- ORDER BY start_time DESC LIMIT 10;

-- To unschedule (if needed):
-- SELECT cron.unschedule('daily-cafe-email-check');

-- To test the function manually:
-- SELECT trigger_daily_email_if_enabled();

-- To check current settings:
-- SELECT cron_time, auto_send_enabled, last_email_sent FROM cafe_settings WHERE id = 1;

-- ==================== CHANGING EMAIL TIME ====================
-- NO SQL NEEDED! Just update via your Settings page UI:
-- 1. Go to Cafe Management → Settings
-- 2. Change "Daily Report Time" to your desired time (e.g., 22:00)
-- 3. Click "Save Settings"
-- 4. The cron job will automatically use the new time!
--
-- The function checks cafe_settings.cron_time every 5 minutes
-- and sends email when current time matches your setting.

-- ==================== HOW IT WORKS ====================
-- 1. Cron job runs every 5 minutes (*/5 * * * *)
-- 2. Function checks cafe_settings table:
--    - Is auto_send_enabled = true?
--    - What time is set in cron_time?
--    - Has email been sent today?
-- 3. If current IST time matches cron_time (±5 min window):
--    - Calls daily-email-cron Edge Function
--    - Updates last_email_sent to today
-- 4. Email sent! ✅
--
-- BENEFITS:
-- ✅ Change time from Settings UI (no SQL needed)
-- ✅ Enable/disable from Settings UI
-- ✅ Automatic duplicate prevention
-- ✅ Works in IST timezone
-- ✅ 5-minute window for reliability

-- ==================== SETUP INSTRUCTIONS ====================
-- 1. Replace YOUR_PROJECT_REF with your Supabase project reference
--    Example: If URL is https://abcdefgh.supabase.co, use 'abcdefgh'
--
-- 2. Replace YOUR_SERVICE_ROLE_KEY with your service role key
--    Get from: Supabase Dashboard → Settings → API → service_role (secret)
--
-- 3. Run this entire SQL file in Supabase SQL Editor
--
-- 4. Verify it's scheduled:
--    SELECT * FROM cron.job WHERE jobname = 'daily-cafe-email-check';
--
-- 5. Configure time in your Settings page:
--    - Set recipient email
--    - Set time (e.g., 23:55)
--    - Enable auto-send
--    - Click Save
--
-- 6. Done! Emails will send automatically at your chosen time

COMMENT ON EXTENSION pg_cron IS 'Job scheduler for PostgreSQL - enables automated daily email reports';
