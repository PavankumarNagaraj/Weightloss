-- Subscription Management Tables for Cafe System
-- Run this in your Supabase SQL Editor

-- ==================== CUSTOMERS TABLE ====================
CREATE TABLE IF NOT EXISTS cafe_customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  notes TEXT,
  customer_type TEXT DEFAULT 'regular', -- regular, subscription, vip
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_cafe_customers_phone ON cafe_customers(phone);
CREATE INDEX IF NOT EXISTS idx_cafe_customers_type ON cafe_customers(customer_type);

-- ==================== SUBSCRIPTIONS TABLE ====================
CREATE TABLE IF NOT EXISTS cafe_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES cafe_customers(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL, -- daily, weekly, monthly
  meal_types TEXT[] DEFAULT '{}', -- ['Breakfast', 'Lunch', 'Dinner']
  delivery_days TEXT[] DEFAULT '{}', -- ['Monday', 'Tuesday', etc.]
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  monthly_amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'active', -- active, paused, canceled, expired
  delivery_time TEXT, -- e.g., "8:00 AM", "12:00 PM"
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_cafe_subscriptions_customer ON cafe_subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_cafe_subscriptions_status ON cafe_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_cafe_subscriptions_dates ON cafe_subscriptions(start_date, end_date);

-- ==================== SUBSCRIPTION PAYMENTS TABLE ====================
CREATE TABLE IF NOT EXISTS cafe_subscription_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID NOT NULL REFERENCES cafe_subscriptions(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method TEXT DEFAULT 'cash', -- cash, upi, card, bank_transfer
  status TEXT DEFAULT 'paid', -- paid, pending, failed
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_cafe_subscription_payments_sub ON cafe_subscription_payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_cafe_subscription_payments_date ON cafe_subscription_payments(payment_date);

-- ==================== ADD DELIVERY FIELDS TO ORDERS TABLE ====================
-- Add new columns to existing cafe_orders table if they don't exist
DO $$ 
BEGIN
  -- Add order_type column (for delivery, dine-in, takeaway)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cafe_orders' AND column_name = 'order_type'
  ) THEN
    ALTER TABLE cafe_orders ADD COLUMN order_type TEXT DEFAULT 'walk-in';
  END IF;

  -- Add delivery_status column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cafe_orders' AND column_name = 'delivery_status'
  ) THEN
    ALTER TABLE cafe_orders ADD COLUMN delivery_status TEXT DEFAULT 'pending';
  END IF;

  -- Add delivery_person column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cafe_orders' AND column_name = 'delivery_person'
  ) THEN
    ALTER TABLE cafe_orders ADD COLUMN delivery_person TEXT;
  END IF;

  -- Add delivery_time column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cafe_orders' AND column_name = 'delivery_time'
  ) THEN
    ALTER TABLE cafe_orders ADD COLUMN delivery_time TIMESTAMP WITH TIME ZONE;
  END IF;

  -- Add delivery_notes column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cafe_orders' AND column_name = 'delivery_notes'
  ) THEN
    ALTER TABLE cafe_orders ADD COLUMN delivery_notes TEXT;
  END IF;

  -- Add subscription_id column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cafe_orders' AND column_name = 'subscription_id'
  ) THEN
    ALTER TABLE cafe_orders ADD COLUMN subscription_id UUID REFERENCES cafe_subscriptions(id) ON DELETE SET NULL;
  END IF;

  -- Add delivery_address column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cafe_orders' AND column_name = 'delivery_address'
  ) THEN
    ALTER TABLE cafe_orders ADD COLUMN delivery_address TEXT;
  END IF;

  -- Add customer_phone column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cafe_orders' AND column_name = 'customer_phone'
  ) THEN
    ALTER TABLE cafe_orders ADD COLUMN customer_phone TEXT;
  END IF;
END $$;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_cafe_orders_order_type ON cafe_orders(order_type);
CREATE INDEX IF NOT EXISTS idx_cafe_orders_delivery_status ON cafe_orders(delivery_status);
CREATE INDEX IF NOT EXISTS idx_cafe_orders_subscription ON cafe_orders(subscription_id) WHERE subscription_id IS NOT NULL;

-- ==================== ENABLE ROW LEVEL SECURITY ====================
-- Enable RLS on all tables
ALTER TABLE cafe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cafe_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cafe_subscription_payments ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all operations for authenticated users)
CREATE POLICY "Allow all operations for authenticated users" ON cafe_customers
  FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Allow all operations for authenticated users" ON cafe_subscriptions
  FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Allow all operations for authenticated users" ON cafe_subscription_payments
  FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- ==================== TRIGGERS FOR UPDATED_AT ====================
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS update_cafe_customers_updated_at ON cafe_customers;
CREATE TRIGGER update_cafe_customers_updated_at
  BEFORE UPDATE ON cafe_customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cafe_subscriptions_updated_at ON cafe_subscriptions;
CREATE TRIGGER update_cafe_subscriptions_updated_at
  BEFORE UPDATE ON cafe_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==================== SAMPLE DATA (OPTIONAL) ====================
-- Uncomment to insert sample data for testing

-- INSERT INTO cafe_customers (name, phone, email, address, customer_type) VALUES
-- ('John Doe', '9876543210', 'john@example.com', '123 Main St, Bangalore', 'subscription'),
-- ('Jane Smith', '9876543211', 'jane@example.com', '456 Park Ave, Bangalore', 'subscription'),
-- ('Bob Wilson', '9876543212', 'bob@example.com', '789 Lake Rd, Bangalore', 'regular');

-- INSERT INTO cafe_subscriptions (customer_id, plan_type, meal_types, delivery_days, start_date, end_date, monthly_amount, delivery_time) VALUES
-- ((SELECT id FROM cafe_customers WHERE phone = '9876543210'), 'monthly', ARRAY['Breakfast', 'Lunch'], ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 3000.00, '8:00 AM'),
-- ((SELECT id FROM cafe_customers WHERE phone = '9876543211'), 'monthly', ARRAY['Lunch', 'Dinner'], ARRAY['Monday', 'Wednesday', 'Friday'], CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 4500.00, '12:00 PM');

-- ==================== VERIFICATION QUERIES ====================
-- Run these to verify tables were created successfully

-- SELECT 'cafe_customers' as table_name, COUNT(*) as row_count FROM cafe_customers
-- UNION ALL
-- SELECT 'cafe_subscriptions', COUNT(*) FROM cafe_subscriptions
-- UNION ALL
-- SELECT 'cafe_subscription_payments', COUNT(*) FROM cafe_subscription_payments;

-- ==================== NOTES ====================
-- 1. Run this entire script in Supabase SQL Editor
-- 2. Tables will be created if they don't exist
-- 3. Existing data will not be affected
-- 4. RLS policies allow all operations (adjust as needed for production)
-- 5. Indexes are created for better query performance
-- 6. Triggers automatically update the updated_at timestamp
