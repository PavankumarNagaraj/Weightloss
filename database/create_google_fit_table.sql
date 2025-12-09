-- =====================================================
-- CREATE GOOGLE FIT DATA TABLE
-- =====================================================
-- Run this in Supabase SQL Editor
-- https://capvowxxembnycdonghv.supabase.co/project/_/sql
-- =====================================================

-- Create google_fit_data table
CREATE TABLE IF NOT EXISTS google_fit_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_google_fit_user_id ON google_fit_data(user_id);
CREATE INDEX IF NOT EXISTS idx_google_fit_date ON google_fit_data(date);

-- Enable Row Level Security
ALTER TABLE google_fit_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own Google Fit data
CREATE POLICY "Users can view own Google Fit data" ON google_fit_data
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own Google Fit data
CREATE POLICY "Users can insert own Google Fit data" ON google_fit_data
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own Google Fit data
CREATE POLICY "Users can update own Google Fit data" ON google_fit_data
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own Google Fit data
CREATE POLICY "Users can delete own Google Fit data" ON google_fit_data
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trainers can view all Google Fit data (optional)
-- Uncomment if trainers need access
-- CREATE POLICY "Trainers can view all Google Fit data" ON google_fit_data
--   FOR SELECT
--   USING (
--     EXISTS (
--       SELECT 1 FROM auth.users
--       WHERE auth.users.id = auth.uid()
--       AND auth.users.raw_user_meta_data->>'role' = 'trainer'
--     )
--   );

-- =====================================================
-- DONE!
-- =====================================================
-- The google_fit_data table is now created and ready to use.
-- Your app will now be able to cache Google Fit data.
-- =====================================================
