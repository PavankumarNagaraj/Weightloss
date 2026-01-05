-- Update RLS policy to allow anonymous access to public meal plans
-- This allows visitors to view public meal plans without authentication

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON cafe_weekly_meal_plans;

-- Create new policies:
-- 1. Allow authenticated users full access
CREATE POLICY "Allow authenticated users full access" ON cafe_weekly_meal_plans
  FOR ALL 
  USING (auth.role() = 'authenticated');

-- 2. Allow anonymous users to read public plans only
CREATE POLICY "Allow anonymous read access to public plans" ON cafe_weekly_meal_plans
  FOR SELECT
  USING (is_public = true);

-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'cafe_weekly_meal_plans';
