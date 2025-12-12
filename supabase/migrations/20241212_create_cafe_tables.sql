-- =====================================================
-- CAFE MANAGEMENT SYSTEM - DATABASE SCHEMA
-- Production-ready Supabase tables
-- =====================================================

-- Enable pgcrypto extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- MENU ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS cafe_menu (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  customer_price NUMERIC(10, 2) NOT NULL,
  trainer_price NUMERIC(10, 2) NOT NULL,
  description TEXT,
  is_veg BOOLEAN DEFAULT true,
  raw_materials JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_cafe_menu_category ON cafe_menu(category);
CREATE INDEX IF NOT EXISTS idx_cafe_menu_active ON cafe_menu(is_active);

-- =====================================================
-- INVENTORY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS cafe_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  current_stock NUMERIC(10, 2) NOT NULL DEFAULT 0,
  min_stock NUMERIC(10, 2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  category TEXT NOT NULL,
  price_per_unit NUMERIC(10, 2) NOT NULL DEFAULT 0,
  last_purchase_price NUMERIC(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cafe_inventory_category ON cafe_inventory(category);
CREATE INDEX IF NOT EXISTS idx_cafe_inventory_stock ON cafe_inventory(current_stock);

-- =====================================================
-- PURCHASES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS cafe_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  supplier_name TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_amount NUMERIC(10, 2) NOT NULL,
  notes TEXT,
  date DATE NOT NULL,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cafe_purchases_date ON cafe_purchases(date DESC);
CREATE INDEX IF NOT EXISTS idx_cafe_purchases_supplier ON cafe_purchases(supplier_name);
CREATE INDEX IF NOT EXISTS idx_cafe_purchases_order_number ON cafe_purchases(order_number);

-- =====================================================
-- EXPENSES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS cafe_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  description TEXT,
  amount NUMERIC(10, 2) NOT NULL,
  payment_method TEXT,
  date DATE NOT NULL,
  purchase_id UUID REFERENCES cafe_purchases(id) ON DELETE SET NULL,
  order_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cafe_expenses_date ON cafe_expenses(date DESC);
CREATE INDEX IF NOT EXISTS idx_cafe_expenses_category ON cafe_expenses(category);
CREATE INDEX IF NOT EXISTS idx_cafe_expenses_purchase_id ON cafe_expenses(purchase_id);

-- =====================================================
-- ORDERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS cafe_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_type TEXT NOT NULL,
  user_id UUID,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC(10, 2) NOT NULL,
  discount NUMERIC(10, 2) DEFAULT 0,
  total_amount NUMERIC(10, 2) NOT NULL,
  payment_method TEXT,
  payment_received NUMERIC(10, 2) DEFAULT 0,
  status TEXT DEFAULT 'completed',
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cafe_orders_date ON cafe_orders(date DESC);
CREATE INDEX IF NOT EXISTS idx_cafe_orders_customer_type ON cafe_orders(customer_type);
CREATE INDEX IF NOT EXISTS idx_cafe_orders_status ON cafe_orders(status);
CREATE INDEX IF NOT EXISTS idx_cafe_orders_user_id ON cafe_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_cafe_orders_order_number ON cafe_orders(order_number);

-- =====================================================
-- INVESTMENTS TABLE (for tracking capital)
-- =====================================================
CREATE TABLE IF NOT EXISTS cafe_investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount NUMERIC(10, 2) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_cafe_investments_date ON cafe_investments(date DESC);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for cafe_menu
DROP TRIGGER IF EXISTS update_cafe_menu_updated_at ON cafe_menu;
CREATE TRIGGER update_cafe_menu_updated_at
  BEFORE UPDATE ON cafe_menu
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for cafe_orders
DROP TRIGGER IF EXISTS update_cafe_orders_updated_at ON cafe_orders;
CREATE TRIGGER update_cafe_orders_updated_at
  BEFORE UPDATE ON cafe_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update last_updated for inventory
CREATE OR REPLACE FUNCTION update_inventory_last_updated()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for cafe_inventory
DROP TRIGGER IF EXISTS update_cafe_inventory_last_updated ON cafe_inventory;
CREATE TRIGGER update_cafe_inventory_last_updated
  BEFORE UPDATE ON cafe_inventory
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_last_updated();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE cafe_menu ENABLE ROW LEVEL SECURITY;
ALTER TABLE cafe_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE cafe_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE cafe_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE cafe_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE cafe_investments ENABLE ROW LEVEL SECURITY;

-- Public read/write policies (adjust based on your auth requirements)
-- For now, allowing all operations for authenticated users

-- Menu policies
CREATE POLICY "Allow all operations on cafe_menu" ON cafe_menu
  FOR ALL USING (true) WITH CHECK (true);

-- Inventory policies
CREATE POLICY "Allow all operations on cafe_inventory" ON cafe_inventory
  FOR ALL USING (true) WITH CHECK (true);

-- Purchases policies
CREATE POLICY "Allow all operations on cafe_purchases" ON cafe_purchases
  FOR ALL USING (true) WITH CHECK (true);

-- Expenses policies
CREATE POLICY "Allow all operations on cafe_expenses" ON cafe_expenses
  FOR ALL USING (true) WITH CHECK (true);

-- Orders policies
CREATE POLICY "Allow all operations on cafe_orders" ON cafe_orders
  FOR ALL USING (true) WITH CHECK (true);

-- Investments policies
CREATE POLICY "Allow all operations on cafe_investments" ON cafe_investments
  FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for low stock items
CREATE OR REPLACE VIEW cafe_low_stock_items AS
SELECT 
  id,
  name,
  current_stock,
  min_stock,
  unit,
  category,
  price_per_unit,
  (min_stock - current_stock) as stock_deficit
FROM cafe_inventory
WHERE current_stock <= min_stock
ORDER BY (min_stock - current_stock) DESC;

-- View for today's orders
CREATE OR REPLACE VIEW cafe_today_orders AS
SELECT *
FROM cafe_orders
WHERE date = CURRENT_DATE
ORDER BY created_at DESC;

-- View for today's revenue
CREATE OR REPLACE VIEW cafe_today_revenue AS
SELECT 
  COUNT(*) as total_orders,
  SUM(total_amount) as total_revenue,
  SUM(CASE WHEN customer_type = 'customer' THEN total_amount ELSE 0 END) as customer_revenue,
  SUM(CASE WHEN customer_type = 'trainer' THEN total_amount ELSE 0 END) as trainer_revenue
FROM cafe_orders
WHERE date = CURRENT_DATE;

-- View for today's expenses
CREATE OR REPLACE VIEW cafe_today_expenses AS
SELECT 
  e.*,
  p.order_number as purchase_order_number,
  p.supplier_name
FROM cafe_expenses e
LEFT JOIN cafe_purchases p ON e.purchase_id = p.id
WHERE e.date = CURRENT_DATE
ORDER BY e.created_at DESC;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE cafe_menu IS 'Menu items with pricing for customers and trainers';
COMMENT ON TABLE cafe_inventory IS 'Inventory management with stock levels and pricing';
COMMENT ON TABLE cafe_purchases IS 'Purchase orders from suppliers';
COMMENT ON TABLE cafe_expenses IS 'All expenses including purchases and other costs';
COMMENT ON TABLE cafe_orders IS 'Customer orders with items and payment details';
COMMENT ON TABLE cafe_investments IS 'Capital investments and funding';

COMMENT ON COLUMN cafe_menu.raw_materials IS 'JSONB array of {name, quantity, unit} for recipe ingredients';
COMMENT ON COLUMN cafe_orders.items IS 'JSONB array of {id, name, price, quantity} for ordered items';
COMMENT ON COLUMN cafe_purchases.items IS 'JSONB array of {materialName, quantity, unit, pricePerUnit, total} for purchased items';
