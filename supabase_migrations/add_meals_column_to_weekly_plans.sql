-- Add meals JSONB column to cafe_weekly_meal_plans table
-- This allows storing the entire meal structure as JSON for easier management

ALTER TABLE cafe_weekly_meal_plans 
ADD COLUMN IF NOT EXISTS meals JSONB DEFAULT '{}'::jsonb;

-- Add index for JSONB queries if needed
CREATE INDEX IF NOT EXISTS idx_cafe_weekly_meal_plans_meals 
ON cafe_weekly_meal_plans USING GIN (meals);

-- Add comment
COMMENT ON COLUMN cafe_weekly_meal_plans.meals IS 'JSON structure containing all meals organized by day and meal type';

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'cafe_weekly_meal_plans' 
AND column_name = 'meals';
