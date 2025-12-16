-- Setup pg_cron for automated daily email reports using existing Brevo function
-- This uses your existing daily-email-cron Edge Function

-- Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the cron job to run daily at 23:55 IST (18:25 UTC)
-- Adjust the time based on your cafe_settings.cron_time preference
-- IST is UTC+5:30, so 23:55 IST = 18:25 UTC

SELECT cron.schedule(
  'daily-cafe-email-report',           -- job name
  '25 18 * * *',                       -- cron expression (18:25 UTC = 23:55 IST)
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

-- ==================== MANAGEMENT COMMANDS ====================

-- To view all scheduled jobs:
-- SELECT * FROM cron.job;

-- To view job run history:
-- SELECT * FROM cron.job_run_details 
-- WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'daily-cafe-email-report')
-- ORDER BY start_time DESC LIMIT 10;

-- To unschedule (if needed):
-- SELECT cron.unschedule('daily-cafe-email-report');

-- To update the schedule time (e.g., change to 22:00 IST = 16:30 UTC):
-- SELECT cron.unschedule('daily-cafe-email-report');
-- SELECT cron.schedule(
--   'daily-cafe-email-report',
--   '30 16 * * *',  -- New time
--   $$
--   SELECT
--     net.http_post(
--       url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/daily-email-cron',
--       headers := jsonb_build_object(
--         'Content-Type', 'application/json',
--         'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
--       ),
--       body := '{}'::jsonb
--     );
--   $$
-- );

-- ==================== TIME ZONE CONVERSION ====================
-- IST (UTC+5:30) to UTC conversion table:
-- 
-- IST Time  | UTC Time  | Cron Expression
-- ----------|-----------|----------------
-- 23:55     | 18:25     | 25 18 * * *
-- 23:00     | 17:30     | 30 17 * * *
-- 22:00     | 16:30     | 30 16 * * *
-- 21:00     | 15:30     | 30 15 * * *
-- 09:00     | 03:30     | 30 3 * * *
-- 08:00     | 02:30     | 30 2 * * *

-- ==================== NOTES ====================
-- 1. Replace YOUR_PROJECT_REF with your actual Supabase project reference
-- 2. Replace YOUR_SERVICE_ROLE_KEY with your actual service role key
--    (Get it from: Supabase Dashboard → Settings → API → service_role key)
-- 3. The daily-email-cron function already:
--    - Fetches data from your database
--    - Generates beautiful HTML email
--    - Sends via Brevo API
--    - Sends to: pavankumar.nagaraj@gmail.com
-- 4. Make sure BREVO_API_KEY is set as a Supabase secret:
--    supabase secrets set BREVO_API_KEY=xkeysib-YOUR_KEY

COMMENT ON EXTENSION pg_cron IS 'Job scheduler for PostgreSQL - enables automated daily email reports';
