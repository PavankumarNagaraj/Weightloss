-- =====================================================
-- WEEKLY MEAL PLANS FOR SUBSCRIPTIONS
-- Allows creating weekly meal schedules with nutrition summaries
-- =====================================================

-- Table to store weekly meal plans
CREATE TABLE IF NOT EXISTS cafe_weekly_meal_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID REFERENCES cafe_subscriptions(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  plan_name TEXT, -- e.g., "Week 1 - Jan 2026"
  status TEXT DEFAULT 'draft', -- draft, active, completed
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table to store individual meal assignments for each day
CREATE TABLE IF NOT EXISTS cafe_weekly_meal_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  weekly_plan_id UUID NOT NULL REFERENCES cafe_weekly_meal_plans(id) ON DELETE CASCADE,
  day_of_week TEXT NOT NULL, -- Monday, Tuesday, etc.
  meal_type TEXT NOT NULL, -- Breakfast, Lunch, Dinner, Snack
  menu_item_id UUID REFERENCES cafe_menu(id) ON DELETE SET NULL,
  menu_item_name TEXT, -- Store name in case menu item is deleted
  is_replacement BOOLEAN DEFAULT FALSE, -- Mark if this is a replacement meal
  replacement_for_day TEXT, -- Which day this replaces (if used)
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_weekly_plans_subscription ON cafe_weekly_meal_plans(subscription_id);
CREATE INDEX IF NOT EXISTS idx_weekly_plans_dates ON cafe_weekly_meal_plans(week_start_date, week_end_date);
CREATE INDEX IF NOT EXISTS idx_weekly_meal_items_plan ON cafe_weekly_meal_items(weekly_plan_id);
CREATE INDEX IF NOT EXISTS idx_weekly_meal_items_day ON cafe_weekly_meal_items(day_of_week);

-- Enable RLS
ALTER TABLE cafe_weekly_meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE cafe_weekly_meal_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all operations for authenticated users" ON cafe_weekly_meal_plans
  FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Allow all operations for authenticated users" ON cafe_weekly_meal_items
  FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_cafe_weekly_meal_plans_updated_at ON cafe_weekly_meal_plans;
CREATE TRIGGER update_cafe_weekly_meal_plans_updated_at
  BEFORE UPDATE ON cafe_weekly_meal_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- HELPER VIEW: Weekly Plan with Nutrition Summary
-- =====================================================
CREATE OR REPLACE VIEW cafe_weekly_plan_summary AS
SELECT 
  wmp.id as plan_id,
  wmp.subscription_id,
  wmp.week_start_date,
  wmp.week_end_date,
  wmp.plan_name,
  wmp.status,
  COUNT(DISTINCT wmi.id) as total_meals,
  COUNT(DISTINCT wmi.id) FILTER (WHERE wmi.is_replacement = TRUE) as replacement_meals,
  -- Aggregate nutrition data from menu items
  SUM(m.calories) as total_calories,
  SUM(m.protein) as total_protein,
  SUM(m.carbs) as total_carbs,
  SUM(m.fat) as total_fat,
  SUM(m.fiber) as total_fiber
FROM cafe_weekly_meal_plans wmp
LEFT JOIN cafe_weekly_meal_items wmi ON wmp.id = wmi.weekly_plan_id
LEFT JOIN cafe_menu m ON wmi.menu_item_id = m.id
GROUP BY wmp.id, wmp.subscription_id, wmp.week_start_date, wmp.week_end_date, wmp.plan_name, wmp.status;

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- SELECT * FROM cafe_weekly_meal_plans;
-- SELECT * FROM cafe_weekly_meal_items;
-- SELECT * FROM cafe_weekly_plan_summary;
