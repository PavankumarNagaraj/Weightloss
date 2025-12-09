-- =====================================================
-- WEIGHT LOSS APP - SUPABASE DATABASE SCHEMA
-- =====================================================
-- Run this in Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USERS TABLE
-- =====================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'trainer', 'admin')),
  
  -- Physical attributes
  start_weight DECIMAL(5,2),
  current_weight DECIMAL(5,2),
  goal_weight DECIMAL(5,2),
  height DECIMAL(5,2), -- in cm
  age INTEGER,
  gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
  
  -- Program details
  meal_plan TEXT,
  workout_type TEXT,
  batch_id UUID,
  trainer_id UUID,
  
  -- Subscription
  subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'expired', 'trial')),
  subscription_start_date DATE,
  subscription_end_date DATE,
  subscription_amount DECIMAL(10,2),
  
  -- Google Fit integration
  google_fit_connected BOOLEAN DEFAULT false,
  google_fit_refresh_token TEXT,
  google_fit_last_sync TIMESTAMP,
  
  -- Metadata
  start_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT fk_trainer FOREIGN KEY (trainer_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_batch_id ON users(batch_id);
CREATE INDEX idx_users_trainer_id ON users(trainer_id);

-- =====================================================
-- 2. WEIGHT LOGS TABLE
-- =====================================================
CREATE TABLE weight_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  weight DECIMAL(5,2) NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  
  -- Additional metrics
  body_fat_percentage DECIMAL(4,2),
  muscle_mass DECIMAL(5,2),
  bmi DECIMAL(4,2),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

CREATE INDEX idx_weight_logs_user_id ON weight_logs(user_id);
CREATE INDEX idx_weight_logs_date ON weight_logs(date);

-- =====================================================
-- 3. PHOTOS TABLE
-- =====================================================
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Cloudinary details
  cloudinary_url TEXT NOT NULL,
  cloudinary_public_id TEXT NOT NULL,
  cloudinary_thumbnail_url TEXT,
  
  -- Photo metadata
  photo_type TEXT CHECK (photo_type IN ('front', 'side', 'back', 'other')),
  date DATE NOT NULL,
  weight_at_photo DECIMAL(5,2),
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(cloudinary_public_id)
);

CREATE INDEX idx_photos_user_id ON photos(user_id);
CREATE INDEX idx_photos_date ON photos(date);

-- =====================================================
-- 4. WORKOUTS TABLE
-- =====================================================
CREATE TABLE assigned_workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Workout details
  name TEXT NOT NULL,
  type TEXT, -- 'Cardio', 'Strength', 'HIIT', etc.
  intensity TEXT,
  duration INTEGER, -- in minutes
  
  -- Library or custom
  from_library BOOLEAN DEFAULT false,
  library_day INTEGER, -- Day number from 30-day program
  workout_data JSONB, -- Full workout details (warmup, circuits, etc.)
  
  -- Custom workout fields
  sets INTEGER,
  reps INTEGER,
  notes TEXT,
  
  -- Status
  assigned_date TIMESTAMP DEFAULT NOW(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'skipped')),
  completed_date TIMESTAMP,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_workouts_user_id ON assigned_workouts(user_id);
CREATE INDEX idx_workouts_status ON assigned_workouts(status);
CREATE INDEX idx_workouts_assigned_date ON assigned_workouts(assigned_date);

-- =====================================================
-- 5. BATCHES TABLE
-- =====================================================
CREATE TABLE batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  trainer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Batch details
  capacity INTEGER DEFAULT 30,
  current_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  
  -- Metadata
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_batches_trainer_id ON batches(trainer_id);
CREATE INDEX idx_batches_status ON batches(status);

-- Update users batch foreign key
ALTER TABLE users ADD CONSTRAINT fk_batch FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE SET NULL;

-- =====================================================
-- 6. PAYMENTS TABLE
-- =====================================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Payment details
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method TEXT, -- 'cash', 'upi', 'card', 'bank_transfer'
  transaction_id TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_date ON payments(payment_date);

-- =====================================================
-- 7. ATTENDANCE TABLE
-- =====================================================
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  attended BOOLEAN DEFAULT true,
  check_in_time TIME,
  check_out_time TIME,
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

CREATE INDEX idx_attendance_user_id ON attendance(user_id);
CREATE INDEX idx_attendance_date ON attendance(date);

-- =====================================================
-- 8. MEAL LOGS TABLE
-- =====================================================
CREATE TABLE meal_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Meal details
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  food_items JSONB, -- Array of {item, calories, time}
  total_calories INTEGER,
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_meal_logs_user_id ON meal_logs(user_id);
CREATE INDEX idx_meal_logs_date ON meal_logs(date);

-- =====================================================
-- 9. NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Notification details
  type TEXT NOT NULL CHECK (type IN ('email', 'whatsapp', 'sms', 'push')),
  subject TEXT,
  message TEXT NOT NULL,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'read')),
  sent_at TIMESTAMP,
  read_at TIMESTAMP,
  
  -- Metadata
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_type ON notifications(type);

-- =====================================================
-- 10. CHECK-INS TABLE
-- =====================================================
CREATE TABLE checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Check-in details
  date DATE NOT NULL,
  time TIME,
  type TEXT CHECK (type IN ('weekly', 'biweekly', 'monthly', 'custom')),
  
  -- Status
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'missed', 'cancelled')),
  completed_at TIMESTAMP,
  
  -- Notes
  notes TEXT,
  trainer_notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_checkins_user_id ON checkins(user_id);
CREATE INDEX idx_checkins_date ON checkins(date);
CREATE INDEX idx_checkins_status ON checkins(status);

-- =====================================================
-- 11. GOOGLE FIT DATA TABLE
-- =====================================================
CREATE TABLE google_fit_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Date
  date DATE NOT NULL,
  
  -- Activity data
  steps INTEGER,
  distance DECIMAL(10,2), -- in meters
  calories_burned INTEGER,
  active_minutes INTEGER,
  
  -- Heart rate
  heart_rate_avg INTEGER,
  heart_rate_min INTEGER,
  heart_rate_max INTEGER,
  
  -- Sleep data
  sleep_duration INTEGER, -- in minutes
  
  -- Raw data
  raw_data JSONB,
  
  -- Metadata
  synced_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

CREATE INDEX idx_google_fit_user_id ON google_fit_data(user_id);
CREATE INDEX idx_google_fit_date ON google_fit_data(date);

-- =====================================================
-- 12. ACTIVITY LOGS (Audit Trail)
-- =====================================================
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Who performed the action
  
  -- Activity details
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'login', etc.
  entity_type TEXT NOT NULL, -- 'user', 'workout', 'payment', etc.
  entity_id UUID,
  
  -- Changes
  old_data JSONB,
  new_data JSONB,
  
  -- Metadata
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_actor_id ON activity_logs(actor_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weight_logs_updated_at BEFORE UPDATE ON weight_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workouts_updated_at BEFORE UPDATE ON assigned_workouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_batches_updated_at BEFORE UPDATE ON batches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meal_logs_updated_at BEFORE UPDATE ON meal_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checkins_updated_at BEFORE UPDATE ON checkins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate BMI
CREATE OR REPLACE FUNCTION calculate_bmi(weight DECIMAL, height DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
  IF height > 0 THEN
    RETURN ROUND((weight / ((height / 100) * (height / 100)))::DECIMAL, 2);
  ELSE
    RETURN NULL;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE assigned_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_fit_data ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Trainers can view their assigned users
CREATE POLICY "Trainers can view assigned users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role IN ('trainer', 'admin')
    )
  );

-- Users can view their own weight logs
CREATE POLICY "Users can view own weight logs" ON weight_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own weight logs
CREATE POLICY "Users can insert own weight logs" ON weight_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Similar policies for other tables
CREATE POLICY "Users can view own photos" ON photos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own photos" ON photos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own workouts" ON assigned_workouts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own workouts" ON assigned_workouts
  FOR UPDATE USING (auth.uid() = user_id);

-- Admin policies (full access)
CREATE POLICY "Admins have full access to users" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'admin'
    )
  );

-- =====================================================
-- INITIAL DATA (Optional)
-- =====================================================

-- Create default admin user (update with your email)
-- Password will be set during signup
INSERT INTO users (email, name, role) VALUES
  ('admin@weightloss.com', 'Admin User', 'admin')
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- VIEWS FOR ANALYTICS
-- =====================================================

-- User progress view
CREATE OR REPLACE VIEW user_progress AS
SELECT 
  u.id,
  u.name,
  u.email,
  u.start_weight,
  u.current_weight,
  u.goal_weight,
  (u.start_weight - u.current_weight) as weight_lost,
  CASE 
    WHEN u.start_date IS NOT NULL 
    THEN EXTRACT(DAY FROM (NOW() - u.start_date))
    ELSE 0 
  END as days_in_program,
  COUNT(DISTINCT wl.date) as days_logged,
  COUNT(DISTINCT a.date) as days_attended
FROM users u
LEFT JOIN weight_logs wl ON u.id = wl.user_id
LEFT JOIN attendance a ON u.id = a.user_id AND a.attended = true
WHERE u.role = 'user'
GROUP BY u.id;

-- =====================================================
-- COMPLETED!
-- =====================================================
-- Next steps:
-- 1. Run this schema in Supabase SQL Editor
-- 2. Configure authentication in Supabase dashboard
-- 3. Set up storage buckets for additional files
-- 4. Update RLS policies as needed
-- =====================================================
