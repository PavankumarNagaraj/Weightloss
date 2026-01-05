-- =====================================================
-- STEP 0: Add micronutrient columns to nutrition_reference table
-- Run this FIRST before running any batch files
-- =====================================================

ALTER TABLE nutrition_reference
ADD COLUMN IF NOT EXISTS vitamin_a_mcg NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS vitamin_c_mg NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS vitamin_d_mcg NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS vitamin_e_mg NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS vitamin_k_mcg NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS vitamin_b1_mg NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS vitamin_b2_mg NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS vitamin_b3_mg NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS vitamin_b6_mg NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS vitamin_b12_mcg NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS folate_mcg NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS calcium_mg NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS iron_mg NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS magnesium_mg NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS phosphorus_mg NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS potassium_mg NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS sodium_mg NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS zinc_mg NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS copper_mg NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS manganese_mg NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS selenium_mcg NUMERIC(10, 2);

-- Add comments for documentation
COMMENT ON COLUMN nutrition_reference.vitamin_a_mcg IS 'Vitamin A content in micrograms per 100g';
COMMENT ON COLUMN nutrition_reference.vitamin_c_mg IS 'Vitamin C content in milligrams per 100g';
COMMENT ON COLUMN nutrition_reference.vitamin_d_mcg IS 'Vitamin D content in micrograms per 100g';
COMMENT ON COLUMN nutrition_reference.vitamin_e_mg IS 'Vitamin E content in milligrams per 100g';
COMMENT ON COLUMN nutrition_reference.vitamin_k_mcg IS 'Vitamin K content in micrograms per 100g';
COMMENT ON COLUMN nutrition_reference.vitamin_b1_mg IS 'Vitamin B1 (Thiamine) content in milligrams per 100g';
COMMENT ON COLUMN nutrition_reference.vitamin_b2_mg IS 'Vitamin B2 (Riboflavin) content in milligrams per 100g';
COMMENT ON COLUMN nutrition_reference.vitamin_b3_mg IS 'Vitamin B3 (Niacin) content in milligrams per 100g';
COMMENT ON COLUMN nutrition_reference.vitamin_b6_mg IS 'Vitamin B6 content in milligrams per 100g';
COMMENT ON COLUMN nutrition_reference.vitamin_b12_mcg IS 'Vitamin B12 content in micrograms per 100g';
COMMENT ON COLUMN nutrition_reference.folate_mcg IS 'Folate content in micrograms per 100g';
COMMENT ON COLUMN nutrition_reference.calcium_mg IS 'Calcium content in milligrams per 100g';
COMMENT ON COLUMN nutrition_reference.iron_mg IS 'Iron content in milligrams per 100g';
COMMENT ON COLUMN nutrition_reference.magnesium_mg IS 'Magnesium content in milligrams per 100g';
COMMENT ON COLUMN nutrition_reference.phosphorus_mg IS 'Phosphorus content in milligrams per 100g';
COMMENT ON COLUMN nutrition_reference.potassium_mg IS 'Potassium content in milligrams per 100g';
COMMENT ON COLUMN nutrition_reference.sodium_mg IS 'Sodium content in milligrams per 100g';
COMMENT ON COLUMN nutrition_reference.zinc_mg IS 'Zinc content in milligrams per 100g';
COMMENT ON COLUMN nutrition_reference.copper_mg IS 'Copper content in milligrams per 100g';
COMMENT ON COLUMN nutrition_reference.manganese_mg IS 'Manganese content in milligrams per 100g';
COMMENT ON COLUMN nutrition_reference.selenium_mcg IS 'Selenium content in micrograms per 100g';

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'nutrition_reference' 
AND column_name LIKE '%vitamin%' OR column_name LIKE '%calcium%' OR column_name LIKE '%iron%'
ORDER BY column_name;
