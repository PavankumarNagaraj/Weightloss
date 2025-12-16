-- Setup pg_cron for automated daily email reports using existing Brevo function
-- This uses your existing daily-email-cron Edge Function
-- The cron time is dynamically read from cafe_settings table
-- CONFIGURED FOR: capvowxxembnycdonghv project

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
    
    IF settings_record.last_email_sent = today_date THEN
      RAISE NOTICE 'Email already sent today: %', today_date;
      RETURN;
    END IF;
    
    -- Send email by calling the Edge Function
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
    
    -- Update last_email_sent
    UPDATE cafe_settings 
    SET last_email_sent = today_date 
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

-- Verify the cron job was created
SELECT * FROM cron.job WHERE jobname = 'daily-cafe-email-check';
