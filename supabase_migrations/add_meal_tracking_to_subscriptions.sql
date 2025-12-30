-- Add meal-based and time-based expiry tracking to subscriptions
-- This allows subscriptions to expire based on either:
-- 1. Total meals consumed (e.g., 25 meals)
-- 2. Maximum days from start date (e.g., 45 days)

DO $$ 
BEGIN
  -- Add total_meals_allowed column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cafe_subscriptions' AND column_name = 'total_meals_allowed'
  ) THEN
    ALTER TABLE cafe_subscriptions ADD COLUMN total_meals_allowed INTEGER DEFAULT 25;
  END IF;

  -- Add meals_consumed column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cafe_subscriptions' AND column_name = 'meals_consumed'
  ) THEN
    ALTER TABLE cafe_subscriptions ADD COLUMN meals_consumed INTEGER DEFAULT 0;
  END IF;

  -- Add max_validity_days column (maximum days from start_date)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cafe_subscriptions' AND column_name = 'max_validity_days'
  ) THEN
    ALTER TABLE cafe_subscriptions ADD COLUMN max_validity_days INTEGER DEFAULT 45;
  END IF;

  -- Add exclude_sundays column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cafe_subscriptions' AND column_name = 'exclude_sundays'
  ) THEN
    ALTER TABLE cafe_subscriptions ADD COLUMN exclude_sundays BOOLEAN DEFAULT TRUE;
  END IF;

  -- Add last_meal_date column (track when last meal was served)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cafe_subscriptions' AND column_name = 'last_meal_date'
  ) THEN
    ALTER TABLE cafe_subscriptions ADD COLUMN last_meal_date DATE;
  END IF;
END $$;

-- Create function to check if subscription should be expired
CREATE OR REPLACE FUNCTION check_subscription_expiry()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if meals consumed reached the limit
  IF NEW.meals_consumed >= NEW.total_meals_allowed THEN
    NEW.status = 'expired';
    RETURN NEW;
  END IF;

  -- Check if max validity days exceeded
  IF NEW.max_validity_days IS NOT NULL THEN
    IF (CURRENT_DATE - NEW.start_date) >= NEW.max_validity_days THEN
      NEW.status = 'expired';
      RETURN NEW;
    END IF;
  END IF;

  -- Check if end_date is passed
  IF CURRENT_DATE > NEW.end_date THEN
    NEW.status = 'expired';
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-expire subscriptions
DROP TRIGGER IF EXISTS trigger_check_subscription_expiry ON cafe_subscriptions;
CREATE TRIGGER trigger_check_subscription_expiry
  BEFORE UPDATE ON cafe_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION check_subscription_expiry();

-- Create function to increment meal count when meal is logged
CREATE OR REPLACE FUNCTION increment_subscription_meal_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Increment meals_consumed for the subscription
  UPDATE cafe_subscriptions
  SET 
    meals_consumed = meals_consumed + 1,
    last_meal_date = NEW.date
  WHERE id = NEW.subscriber_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-increment meal count
DROP TRIGGER IF EXISTS trigger_increment_meal_count ON subscriber_meals;
CREATE TRIGGER trigger_increment_meal_count
  AFTER INSERT ON subscriber_meals
  FOR EACH ROW
  EXECUTE FUNCTION increment_subscription_meal_count();

-- Add comments for documentation
COMMENT ON COLUMN cafe_subscriptions.total_meals_allowed IS 'Total number of meals allowed in this subscription (e.g., 25 meals)';
COMMENT ON COLUMN cafe_subscriptions.meals_consumed IS 'Number of meals already consumed/served';
COMMENT ON COLUMN cafe_subscriptions.max_validity_days IS 'Maximum days from start_date before subscription expires (e.g., 45 days)';
COMMENT ON COLUMN cafe_subscriptions.exclude_sundays IS 'Whether Sundays are excluded from meal count';
COMMENT ON COLUMN cafe_subscriptions.last_meal_date IS 'Date when the last meal was served';

-- Create view for subscription status with meal tracking
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
