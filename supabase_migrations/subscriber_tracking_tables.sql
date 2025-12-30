-- Subscriber Meal Tracking Table
CREATE TABLE IF NOT EXISTS subscriber_meals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscriber_id UUID NOT NULL REFERENCES cafe_subscription_orders(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  meal_type VARCHAR(20) NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  dishes JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_calories DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriber Physical Measurements Table
CREATE TABLE IF NOT EXISTS subscriber_measurements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscriber_id UUID NOT NULL REFERENCES cafe_subscription_orders(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight DECIMAL(5,2),
  body_fat_percentage DECIMAL(5,2),
  muscle_mass DECIMAL(5,2),
  metabolic_age INTEGER,
  bmi DECIMAL(5,2),
  visceral_fat INTEGER,
  body_water_percentage DECIMAL(5,2),
  bone_mass DECIMAL(5,2),
  chest DECIMAL(5,2),
  waist DECIMAL(5,2),
  hips DECIMAL(5,2),
  thigh DECIMAL(5,2),
  arm DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_subscriber_meals_subscriber_date 
  ON subscriber_meals(subscriber_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_subscriber_meals_date 
  ON subscriber_meals(date DESC);

CREATE INDEX IF NOT EXISTS idx_subscriber_measurements_subscriber_date 
  ON subscriber_measurements(subscriber_id, date DESC);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscriber_meals_updated_at
  BEFORE UPDATE ON subscriber_meals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriber_measurements_updated_at
  BEFORE UPDATE ON subscriber_measurements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE subscriber_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriber_measurements ENABLE ROW LEVEL SECURITY;

-- RLS Policies (adjust based on your auth setup)
CREATE POLICY "Enable all access for authenticated users" ON subscriber_meals
  FOR ALL USING (true);

CREATE POLICY "Enable all access for authenticated users" ON subscriber_measurements
  FOR ALL USING (true);

-- Comments for documentation
COMMENT ON TABLE subscriber_meals IS 'Tracks meals served to subscribers with dishes and calorie information';
COMMENT ON TABLE subscriber_measurements IS 'Tracks physical measurements and body composition data for subscribers';
COMMENT ON COLUMN subscriber_meals.dishes IS 'JSON array of dishes: [{menu_item_id, name, calories, quantity}]';
