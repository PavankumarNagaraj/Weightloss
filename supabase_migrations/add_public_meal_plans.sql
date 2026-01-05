-- Add is_public column to cafe_weekly_meal_plans table to allow public sharing

ALTER TABLE cafe_weekly_meal_plans 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;

-- Add index for faster public plan queries
CREATE INDEX IF NOT EXISTS idx_cafe_weekly_meal_plans_public 
ON cafe_weekly_meal_plans(is_public) 
WHERE is_public = TRUE;

-- Add comment
COMMENT ON COLUMN cafe_weekly_meal_plans.is_public IS 'Whether this meal plan is publicly accessible via shareable link';

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'cafe_weekly_meal_plans' 
AND column_name = 'is_public';
