-- Update subscription schema for meal time preferences
-- Remove delivery_time, add breakfast/lunch/dinner times, make meals configurable

DO $$ 
BEGIN
  -- Remove delivery_time column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cafe_subscriptions' AND column_name = 'delivery_time'
  ) THEN
    ALTER TABLE cafe_subscriptions DROP COLUMN delivery_time;
  END IF;

  -- Add breakfast_time column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cafe_subscriptions' AND column_name = 'breakfast_time'
  ) THEN
    ALTER TABLE cafe_subscriptions ADD COLUMN breakfast_time TIME;
  END IF;

  -- Add lunch_time column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cafe_subscriptions' AND column_name = 'lunch_time'
  ) THEN
    ALTER TABLE cafe_subscriptions ADD COLUMN lunch_time TIME;
  END IF;

  -- Add dinner_time column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cafe_subscriptions' AND column_name = 'dinner_time'
  ) THEN
    ALTER TABLE cafe_subscriptions ADD COLUMN dinner_time TIME;
  END IF;

  -- Update total_meals_allowed to remove default (make it required/configurable)
  -- This allows different subscriptions to have different meal counts
  ALTER TABLE cafe_subscriptions ALTER COLUMN total_meals_allowed DROP DEFAULT;
  
END $$;

-- Add comments for documentation
COMMENT ON COLUMN cafe_subscriptions.breakfast_time IS 'Preferred time for breakfast delivery (e.g., 08:00:00)';
COMMENT ON COLUMN cafe_subscriptions.lunch_time IS 'Preferred time for lunch delivery (e.g., 12:30:00)';
COMMENT ON COLUMN cafe_subscriptions.dinner_time IS 'Preferred time for dinner delivery (e.g., 19:00:00)';
COMMENT ON COLUMN cafe_subscriptions.total_meals_allowed IS 'Total number of meals allowed - configurable per subscription (e.g., 25, 30, 50)';

-- Update the subscription status view to include meal times
DROP VIEW IF EXISTS subscription_status_view;
CREATE OR REPLACE VIEW subscription_status_view AS
SELECT 
  s.*,
  c.name as customer_name,
  c.phone as customer_phone,
  s.meals_consumed || ' / ' || s.total_meals_allowed as meals_progress,
  (s.total_meals_allowed - s.meals_consumed) as meals_remaining,
  (CURRENT_DATE - s.start_date) as days_elapsed,
  (s.max_validity_days - (CURRENT_DATE - s.start_date)) as days_remaining,
  CASE 
    WHEN s.breakfast_time IS NOT NULL THEN 'Breakfast: ' || s.breakfast_time::TEXT
    ELSE ''
  END || 
  CASE 
    WHEN s.lunch_time IS NOT NULL THEN ' | Lunch: ' || s.lunch_time::TEXT
    ELSE ''
  END || 
  CASE 
    WHEN s.dinner_time IS NOT NULL THEN ' | Dinner: ' || s.dinner_time::TEXT
    ELSE ''
  END as meal_schedule,
  CASE 
    WHEN s.meals_consumed >= s.total_meals_allowed THEN 'Meals Exhausted'
    WHEN (CURRENT_DATE - s.start_date) >= s.max_validity_days THEN 'Time Expired'
    WHEN CURRENT_DATE > s.end_date THEN 'End Date Passed'
    WHEN s.status = 'active' THEN 'Active'
    ELSE s.status
  END as expiry_reason
FROM cafe_subscriptions s
JOIN cafe_customers c ON s.customer_id = c.id;

-- Grant access to the view
GRANT SELECT ON subscription_status_view TO authenticated, anon;

-- Note: The system already supports multiple meals per day
-- The subscriber_meals table allows multiple entries for the same date with different meal_types
-- Each meal logged will increment the meals_consumed counter
