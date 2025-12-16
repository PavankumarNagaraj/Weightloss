-- Setup pg_cron for automated daily email reports
-- This will trigger the Edge Function automatically every day

-- Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a function to call the Edge Function
CREATE OR REPLACE FUNCTION trigger_daily_email_report()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  settings_record RECORD;
  function_url TEXT;
  service_role_key TEXT;
BEGIN
  -- Get settings to check if auto-send is enabled
  SELECT * INTO settings_record FROM cafe_settings WHERE id = 1;
  
  -- Only proceed if auto-send is enabled
  IF settings_record.auto_send_enabled = true THEN
    -- Get the Supabase URL and service role key from environment
    -- Note: You'll need to set these as Supabase secrets
    function_url := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-daily-report';
    service_role_key := current_setting('app.settings.service_role_key', true);
    
    -- Call the Edge Function using http extension
    PERFORM
      net.http_post(
        url := function_url,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || service_role_key
        ),
        body := '{}'::jsonb
      );
  END IF;
END;
$$;

-- Schedule the cron job to run daily at 23:55 IST (18:25 UTC)
-- Note: Adjust the time based on your settings.cron_time
-- IST is UTC+5:30, so 23:55 IST = 18:25 UTC
SELECT cron.schedule(
  'daily-cafe-report',           -- job name
  '25 18 * * *',                 -- cron expression (18:25 UTC = 23:55 IST)
  $$SELECT trigger_daily_email_report()$$
);

-- To view scheduled jobs:
-- SELECT * FROM cron.job;

-- To unschedule (if needed):
-- SELECT cron.unschedule('daily-cafe-report');

-- To update the schedule time:
-- SELECT cron.unschedule('daily-cafe-report');
-- SELECT cron.schedule('daily-cafe-report', 'NEW_CRON_EXPRESSION', $$SELECT trigger_daily_email_report()$$);

COMMENT ON FUNCTION trigger_daily_email_report IS 'Triggers the send-daily-report Edge Function for automated email reports';
