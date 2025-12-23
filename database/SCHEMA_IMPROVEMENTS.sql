-- ============================================================
-- SCHEMA IMPROVEMENTS: Add missing indexes and constraints
-- Run this AFTER the main QUICK_SETUP.sql
-- ============================================================

-- Add customer_id foreign key to orders table (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cafe_orders' AND column_name = 'customer_id'
  ) THEN
    ALTER TABLE cafe_orders ADD COLUMN customer_id UUID REFERENCES cafe_customers(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add better indexes for performance
CREATE INDEX IF NOT EXISTS idx_cafe_orders_customer_id ON cafe_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_cafe_orders_date ON cafe_orders(date);
CREATE INDEX IF NOT EXISTS idx_cafe_orders_status ON cafe_orders(status);
CREATE INDEX IF NOT EXISTS idx_cafe_orders_customer_type ON cafe_orders(customer_type);

-- Add check constraints for valid status values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'cafe_subscriptions_status_check'
  ) THEN
    ALTER TABLE cafe_subscriptions 
    ADD CONSTRAINT cafe_subscriptions_status_check 
    CHECK (status IN ('active', 'paused', 'canceled', 'expired'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'cafe_orders_delivery_status_check'
  ) THEN
    ALTER TABLE cafe_orders 
    ADD CONSTRAINT cafe_orders_delivery_status_check 
    CHECK (delivery_status IN ('pending', 'in_transit', 'delivered', 'failed') OR delivery_status IS NULL);
  END IF;
END $$;

-- Add check constraint for subscription dates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'cafe_subscriptions_dates_check'
  ) THEN
    ALTER TABLE cafe_subscriptions 
    ADD CONSTRAINT cafe_subscriptions_dates_check 
    CHECK (end_date >= start_date);
  END IF;
END $$;

-- Add check constraint for positive amounts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'cafe_subscriptions_amount_check'
  ) THEN
    ALTER TABLE cafe_subscriptions 
    ADD CONSTRAINT cafe_subscriptions_amount_check 
    CHECK (monthly_amount > 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'cafe_subscription_payments_amount_check'
  ) THEN
    ALTER TABLE cafe_subscription_payments 
    ADD CONSTRAINT cafe_subscription_payments_amount_check 
    CHECK (amount > 0);
  END IF;
END $$;

-- Add unique constraint to prevent duplicate subscription orders
CREATE UNIQUE INDEX IF NOT EXISTS idx_cafe_orders_subscription_unique 
ON cafe_orders(subscription_id, date, notes) 
WHERE subscription_id IS NOT NULL;

-- Add composite index for better query performance
CREATE INDEX IF NOT EXISTS idx_cafe_subscriptions_status_dates 
ON cafe_subscriptions(status, start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_cafe_orders_subscription_date 
ON cafe_orders(subscription_id, date) 
WHERE subscription_id IS NOT NULL;

-- Add index for payment queries
CREATE INDEX IF NOT EXISTS idx_cafe_subscription_payments_status 
ON cafe_subscription_payments(status);

-- Verify improvements
SELECT 
  'Schema improvements applied successfully!' as message,
  (SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'cafe_orders') as orders_indexes,
  (SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'cafe_subscriptions') as subscriptions_indexes,
  (SELECT COUNT(*) FROM pg_constraint WHERE conrelid = 'cafe_subscriptions'::regclass) as subscription_constraints;
