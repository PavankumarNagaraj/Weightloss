-- ============================================================
-- QUICK SETUP: Copy this ENTIRE file and paste into Supabase SQL Editor
-- Then click RUN. That's it!
-- ============================================================

-- Step 1: Create Customers Table
CREATE TABLE IF NOT EXISTS cafe_customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  notes TEXT,
  customer_type TEXT DEFAULT 'regular',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cafe_customers_phone ON cafe_customers(phone);
CREATE INDEX IF NOT EXISTS idx_cafe_customers_type ON cafe_customers(customer_type);

-- Step 2: Create Subscriptions Table
CREATE TABLE IF NOT EXISTS cafe_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES cafe_customers(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL,
  meal_types TEXT[] DEFAULT '{}',
  delivery_days TEXT[] DEFAULT '{}',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  monthly_amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'active',
  delivery_time TEXT,
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cafe_subscriptions_customer ON cafe_subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_cafe_subscriptions_status ON cafe_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_cafe_subscriptions_dates ON cafe_subscriptions(start_date, end_date);

-- Step 3: Create Subscription Payments Table
CREATE TABLE IF NOT EXISTS cafe_subscription_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID NOT NULL REFERENCES cafe_subscriptions(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method TEXT DEFAULT 'cash',
  status TEXT DEFAULT 'paid',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cafe_subscription_payments_sub ON cafe_subscription_payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_cafe_subscription_payments_date ON cafe_subscription_payments(payment_date);

-- Step 4: Add Delivery Fields to Orders Table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cafe_orders' AND column_name = 'order_type') THEN
    ALTER TABLE cafe_orders ADD COLUMN order_type TEXT DEFAULT 'walk-in';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cafe_orders' AND column_name = 'delivery_status') THEN
    ALTER TABLE cafe_orders ADD COLUMN delivery_status TEXT DEFAULT 'pending';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cafe_orders' AND column_name = 'delivery_person') THEN
    ALTER TABLE cafe_orders ADD COLUMN delivery_person TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cafe_orders' AND column_name = 'delivery_time') THEN
    ALTER TABLE cafe_orders ADD COLUMN delivery_time TIMESTAMP WITH TIME ZONE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cafe_orders' AND column_name = 'delivery_notes') THEN
    ALTER TABLE cafe_orders ADD COLUMN delivery_notes TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cafe_orders' AND column_name = 'subscription_id') THEN
    ALTER TABLE cafe_orders ADD COLUMN subscription_id UUID REFERENCES cafe_subscriptions(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cafe_orders' AND column_name = 'delivery_address') THEN
    ALTER TABLE cafe_orders ADD COLUMN delivery_address TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cafe_orders' AND column_name = 'customer_phone') THEN
    ALTER TABLE cafe_orders ADD COLUMN customer_phone TEXT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_cafe_orders_order_type ON cafe_orders(order_type);
CREATE INDEX IF NOT EXISTS idx_cafe_orders_delivery_status ON cafe_orders(delivery_status);
CREATE INDEX IF NOT EXISTS idx_cafe_orders_subscription ON cafe_orders(subscription_id) WHERE subscription_id IS NOT NULL;

-- Step 5: Enable Row Level Security
ALTER TABLE cafe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cafe_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cafe_subscription_payments ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS Policies
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON cafe_customers;
CREATE POLICY "Allow all operations for authenticated users" ON cafe_customers FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON cafe_subscriptions;
CREATE POLICY "Allow all operations for authenticated users" ON cafe_subscriptions FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON cafe_subscription_payments;
CREATE POLICY "Allow all operations for authenticated users" ON cafe_subscription_payments FOR ALL USING (true);

-- Step 7: Create Triggers for Updated_At
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_cafe_customers_updated_at ON cafe_customers;
CREATE TRIGGER update_cafe_customers_updated_at BEFORE UPDATE ON cafe_customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cafe_subscriptions_updated_at ON cafe_subscriptions;
CREATE TRIGGER update_cafe_subscriptions_updated_at BEFORE UPDATE ON cafe_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- DONE! Your database is now ready for subscription management
-- ============================================================

-- Verify tables were created (optional - check output)
SELECT 'cafe_customers' as table_name, COUNT(*) as row_count FROM cafe_customers
UNION ALL
SELECT 'cafe_subscriptions', COUNT(*) FROM cafe_subscriptions
UNION ALL
SELECT 'cafe_subscription_payments', COUNT(*) FROM cafe_subscription_payments;
