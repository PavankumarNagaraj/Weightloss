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
-- Migration: Add micronutrients for batch 1 (Basic Staples & Grains - 25 items)
-- Items: Rice, Wheat, Oats, Millets, Flours, Bread, etc.

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 0.11, vitamin_k_mcg = 0.1,
  vitamin_b1_mg = 0.07, vitamin_b2_mg = 0.015, vitamin_b3_mg = 1.6, vitamin_b6_mg = 0.16, vitamin_b12_mcg = 0,
  folate_mcg = 8, calcium_mg = 28, iron_mg = 0.8, magnesium_mg = 25, phosphorus_mg = 115,
  potassium_mg = 115, sodium_mg = 5, zinc_mg = 1.09, copper_mg = 0.22, manganese_mg = 1.09, selenium_mcg = 15.1
WHERE ingredient_name = 'Rice (white, cooked)';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 1.2, vitamin_k_mcg = 1.9,
  vitamin_b1_mg = 0.41, vitamin_b2_mg = 0.09, vitamin_b3_mg = 5.09, vitamin_b6_mg = 0.53, vitamin_b12_mcg = 0,
  folate_mcg = 20, calcium_mg = 23, iron_mg = 2.5, magnesium_mg = 143, phosphorus_mg = 333,
  potassium_mg = 223, sodium_mg = 7, zinc_mg = 2.77, copper_mg = 0.48, manganese_mg = 3.74, selenium_mcg = 23.4
WHERE ingredient_name = 'Rice (brown, cooked)';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 0.42, vitamin_k_mcg = 1.9,
  vitamin_b1_mg = 0.3, vitamin_b2_mg = 0.11, vitamin_b3_mg = 4.96, vitamin_b6_mg = 0.3, vitamin_b12_mcg = 0,
  folate_mcg = 38, calcium_mg = 29, iron_mg = 3.19, magnesium_mg = 126, phosphorus_mg = 288,
  potassium_mg = 363, sodium_mg = 2, zinc_mg = 2.68, copper_mg = 0.36, manganese_mg = 3.99, selenium_mcg = 28.9
WHERE ingredient_name = 'Wheat Flour (whole)';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 0.7, vitamin_k_mcg = 2,
  vitamin_b1_mg = 0.76, vitamin_b2_mg = 0.14, vitamin_b3_mg = 0.96, vitamin_b6_mg = 0.12, vitamin_b12_mcg = 0,
  folate_mcg = 56, calcium_mg = 54, iron_mg = 4.7, magnesium_mg = 177, phosphorus_mg = 523,
  potassium_mg = 429, sodium_mg = 2, zinc_mg = 3.97, copper_mg = 0.63, manganese_mg = 4.92, selenium_mcg = 28.9
WHERE ingredient_name = 'Oats';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 0.05, vitamin_k_mcg = 0.3,
  vitamin_b1_mg = 0.42, vitamin_b2_mg = 0.29, vitamin_b3_mg = 4.72, vitamin_b6_mg = 0.38, vitamin_b12_mcg = 0,
  folate_mcg = 45, calcium_mg = 8, iron_mg = 3, magnesium_mg = 114, phosphorus_mg = 285,
  potassium_mg = 195, sodium_mg = 5, zinc_mg = 1.68, copper_mg = 0.75, manganese_mg = 0.9, selenium_mcg = 2.7
WHERE ingredient_name = 'Bajra';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 0.25, vitamin_k_mcg = 0.9,
  vitamin_b1_mg = 0.38, vitamin_b2_mg = 0.21, vitamin_b3_mg = 3.2, vitamin_b6_mg = 0.4, vitamin_b12_mcg = 0,
  folate_mcg = 20, calcium_mg = 25, iron_mg = 3.9, magnesium_mg = 137, phosphorus_mg = 296,
  potassium_mg = 176, sodium_mg = 11, zinc_mg = 2.8, copper_mg = 0.47, manganese_mg = 1.1, selenium_mcg = 2.7
WHERE ingredient_name = 'Ragi';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 0.15, vitamin_k_mcg = 0.5,
  vitamin_b1_mg = 0.33, vitamin_b2_mg = 0.09, vitamin_b3_mg = 3.2, vitamin_b6_mg = 0.42, vitamin_b12_mcg = 0,
  folate_mcg = 20, calcium_mg = 20, iron_mg = 5, magnesium_mg = 153, phosphorus_mg = 290,
  potassium_mg = 308, sodium_mg = 3, zinc_mg = 2.3, copper_mg = 0.9, manganese_mg = 1.6, selenium_mcg = 3.1
WHERE ingredient_name = 'Jowar';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 0.49, vitamin_k_mcg = 1.3,
  vitamin_b1_mg = 0.26, vitamin_b2_mg = 0.19, vitamin_b3_mg = 5.7, vitamin_b6_mg = 0.17, vitamin_b12_mcg = 0,
  folate_mcg = 44, calcium_mg = 15, iron_mg = 1.46, magnesium_mg = 22, phosphorus_mg = 108,
  potassium_mg = 107, sodium_mg = 491, zinc_mg = 0.7, copper_mg = 0.08, manganese_mg = 0.55, selenium_mcg = 13.8
WHERE ingredient_name = 'Bread (white)';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 0.4, vitamin_k_mcg = 3.5,
  vitamin_b1_mg = 0.17, vitamin_b2_mg = 0.1, vitamin_b3_mg = 3.6, vitamin_b6_mg = 0.15, vitamin_b12_mcg = 0,
  folate_mcg = 44, calcium_mg = 59, iron_mg = 2.5, magnesium_mg = 75, phosphorus_mg = 188,
  potassium_mg = 230, sodium_mg = 447, zinc_mg = 1.8, copper_mg = 0.25, manganese_mg = 1.8, selenium_mcg = 28
WHERE ingredient_name = 'Bread (whole wheat)';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 0.53, vitamin_k_mcg = 0.3,
  vitamin_b1_mg = 0.44, vitamin_b2_mg = 0.25, vitamin_b3_mg = 3.6, vitamin_b6_mg = 0.14, vitamin_b12_mcg = 0,
  folate_mcg = 26, calcium_mg = 34, iron_mg = 2.51, magnesium_mg = 76, phosphorus_mg = 220,
  potassium_mg = 186, sodium_mg = 2, zinc_mg = 1.96, copper_mg = 0.34, manganese_mg = 1.43, selenium_mcg = 33.9
WHERE ingredient_name = 'Wheat Flour (whole)';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 0.06, vitamin_k_mcg = 0.1,
  vitamin_b1_mg = 0.11, vitamin_b2_mg = 0.04, vitamin_b3_mg = 1.2, vitamin_b6_mg = 0.04, vitamin_b12_mcg = 0,
  folate_mcg = 15, calcium_mg = 15, iron_mg = 1.2, magnesium_mg = 22, phosphorus_mg = 107,
  potassium_mg = 107, sodium_mg = 2, zinc_mg = 0.7, copper_mg = 0.15, manganese_mg = 0.68, selenium_mcg = 33.9
WHERE ingredient_name = 'Maida (refined flour)';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 0.11, vitamin_k_mcg = 0.3,
  vitamin_b1_mg = 0.06, vitamin_b2_mg = 0.02, vitamin_b3_mg = 0.4, vitamin_b6_mg = 0.16, vitamin_b12_mcg = 0,
  folate_mcg = 3, calcium_mg = 10, iron_mg = 0.35, magnesium_mg = 12, phosphorus_mg = 68,
  potassium_mg = 76, sodium_mg = 0, zinc_mg = 0.49, copper_mg = 0.04, manganese_mg = 0.47, selenium_mcg = 6.2
WHERE ingredient_name = 'Rice (white, cooked)';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 0.08, vitamin_k_mcg = 0.3,
  vitamin_b1_mg = 0.06, vitamin_b2_mg = 0.02, vitamin_b3_mg = 0.6, vitamin_b6_mg = 0.19, vitamin_b12_mcg = 0,
  folate_mcg = 4, calcium_mg = 7, iron_mg = 0.35, magnesium_mg = 35, phosphorus_mg = 98,
  potassium_mg = 76, sodium_mg = 4, zinc_mg = 0.8, copper_mg = 0.12, manganese_mg = 1.09, selenium_mcg = 15.1
WHERE ingredient_name = 'Rice (white, cooked)';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 0.11, vitamin_k_mcg = 0.3,
  vitamin_b1_mg = 0.07, vitamin_b2_mg = 0.015, vitamin_b3_mg = 1.6, vitamin_b6_mg = 0.16, vitamin_b12_mcg = 0,
  folate_mcg = 8, calcium_mg = 28, iron_mg = 0.8, magnesium_mg = 25, phosphorus_mg = 115,
  potassium_mg = 115, sodium_mg = 5, zinc_mg = 1.09, copper_mg = 0.22, manganese_mg = 1.09, selenium_mcg = 15.1
WHERE ingredient_name = 'Rice (white, cooked)';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 0.11, vitamin_k_mcg = 0.1,
  vitamin_b1_mg = 0.07, vitamin_b2_mg = 0.015, vitamin_b3_mg = 1.6, vitamin_b6_mg = 0.16, vitamin_b12_mcg = 0,
  folate_mcg = 8, calcium_mg = 28, iron_mg = 0.8, magnesium_mg = 25, phosphorus_mg = 115,
  potassium_mg = 115, sodium_mg = 5, zinc_mg = 1.09, copper_mg = 0.22, manganese_mg = 1.09, selenium_mcg = 15.1
WHERE ingredient_name = 'Basmati Rice (cooked)';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 0.42, vitamin_k_mcg = 1.9,
  vitamin_b1_mg = 0.3, vitamin_b2_mg = 0.11, vitamin_b3_mg = 4.96, vitamin_b6_mg = 0.3, vitamin_b12_mcg = 0,
  folate_mcg = 38, calcium_mg = 29, iron_mg = 3.19, magnesium_mg = 126, phosphorus_mg = 288,
  potassium_mg = 363, sodium_mg = 2, zinc_mg = 2.68, copper_mg = 0.36, manganese_mg = 3.99, selenium_mcg = 28.9
WHERE ingredient_name = 'Wheat Flour (whole)';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 0.08, vitamin_k_mcg = 1.9,
  vitamin_b1_mg = 0.23, vitamin_b2_mg = 0.06, vitamin_b3_mg = 3.09, vitamin_b6_mg = 0.18, vitamin_b12_mcg = 0,
  folate_mcg = 23, calcium_mg = 17, iron_mg = 1.88, magnesium_mg = 75, phosphorus_mg = 172,
  potassium_mg = 216, sodium_mg = 1, zinc_mg = 1.59, copper_mg = 0.21, manganese_mg = 2.37, selenium_mcg = 17.2
WHERE ingredient_name = 'Semolina';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 0.42, vitamin_k_mcg = 1.9,
  vitamin_b1_mg = 0.3, vitamin_b2_mg = 0.11, vitamin_b3_mg = 4.96, vitamin_b6_mg = 0.3, vitamin_b12_mcg = 0,
  folate_mcg = 38, calcium_mg = 29, iron_mg = 3.19, magnesium_mg = 126, phosphorus_mg = 288,
  potassium_mg = 363, sodium_mg = 2, zinc_mg = 2.68, copper_mg = 0.36, manganese_mg = 3.99, selenium_mcg = 28.9
WHERE ingredient_name = 'Wheat Flour (whole)';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 0.7, vitamin_k_mcg = 2,
  vitamin_b1_mg = 0.76, vitamin_b2_mg = 0.14, vitamin_b3_mg = 0.96, vitamin_b6_mg = 0.12, vitamin_b12_mcg = 0,
  folate_mcg = 56, calcium_mg = 54, iron_mg = 4.7, magnesium_mg = 177, phosphorus_mg = 523,
  potassium_mg = 429, sodium_mg = 2, zinc_mg = 3.97, copper_mg = 0.63, manganese_mg = 4.92, selenium_mcg = 28.9
WHERE ingredient_name = 'Oats';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 0.42, vitamin_k_mcg = 1.9,
  vitamin_b1_mg = 0.3, vitamin_b2_mg = 0.11, vitamin_b3_mg = 4.96, vitamin_b6_mg = 0.3, vitamin_b12_mcg = 0,
  folate_mcg = 38, calcium_mg = 29, iron_mg = 3.19, magnesium_mg = 126, phosphorus_mg = 288,
  potassium_mg = 363, sodium_mg = 2, zinc_mg = 2.68, copper_mg = 0.36, manganese_mg = 3.99, selenium_mcg = 28.9
WHERE ingredient_name = 'Wheat Flour (whole)';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 0.05, vitamin_k_mcg = 0.3,
  vitamin_b1_mg = 0.42, vitamin_b2_mg = 0.29, vitamin_b3_mg = 4.72, vitamin_b6_mg = 0.38, vitamin_b12_mcg = 0,
  folate_mcg = 45, calcium_mg = 8, iron_mg = 3, magnesium_mg = 114, phosphorus_mg = 285,
  potassium_mg = 195, sodium_mg = 5, zinc_mg = 1.68, copper_mg = 0.75, manganese_mg = 0.9, selenium_mcg = 2.7
WHERE ingredient_name = 'Bajra';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 0.25, vitamin_k_mcg = 0.9,
  vitamin_b1_mg = 0.38, vitamin_b2_mg = 0.21, vitamin_b3_mg = 3.2, vitamin_b6_mg = 0.4, vitamin_b12_mcg = 0,
  folate_mcg = 20, calcium_mg = 344, iron_mg = 3.9, magnesium_mg = 137, phosphorus_mg = 283,
  potassium_mg = 408, sodium_mg = 11, zinc_mg = 2.3, copper_mg = 0.47, manganese_mg = 5.49, selenium_mcg = 2.7
WHERE ingredient_name = 'Ragi';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 0.15, vitamin_k_mcg = 0.5,
  vitamin_b1_mg = 0.59, vitamin_b2_mg = 0.11, vitamin_b3_mg = 3.2, vitamin_b6_mg = 0.42, vitamin_b12_mcg = 0,
  folate_mcg = 15, calcium_mg = 31, iron_mg = 2.8, magnesium_mg = 81, phosphorus_mg = 153,
  potassium_mg = 250, sodium_mg = 4, zinc_mg = 1.4, copper_mg = 0.14, manganese_mg = 0.47, selenium_mcg = 2.8
WHERE ingredient_name = 'Jowar';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 0.15, vitamin_k_mcg = 0.5,
  vitamin_b1_mg = 0.59, vitamin_b2_mg = 0.11, vitamin_b3_mg = 3.2, vitamin_b6_mg = 0.42, vitamin_b12_mcg = 0,
  folate_mcg = 15, calcium_mg = 31, iron_mg = 2.8, magnesium_mg = 81, phosphorus_mg = 153,
  potassium_mg = 250, sodium_mg = 4, zinc_mg = 1.4, copper_mg = 0.14, manganese_mg = 0.47, selenium_mcg = 2.8
WHERE ingredient_name = 'Jowar';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 7, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 0.18, vitamin_k_mcg = 0.4,
  vitamin_b1_mg = 0.2, vitamin_b2_mg = 0.06, vitamin_b3_mg = 2.08, vitamin_b6_mg = 0.16, vitamin_b12_mcg = 0,
  folate_mcg = 19, calcium_mg = 13, iron_mg = 2.71, magnesium_mg = 143, phosphorus_mg = 358,
  potassium_mg = 563, sodium_mg = 1, zinc_mg = 3.1, copper_mg = 0.59, manganese_mg = 1.67, selenium_mcg = 8.8
WHERE ingredient_name = 'Quinoa (cooked)';
-- Migration: Add micronutrients for batch 2 (Vegetables & Greens - 25 items)
-- Items: Tomato, Onion, Potato, Carrot, Spinach, etc.

UPDATE nutrition_reference SET
  vitamin_a_mcg = 833, vitamin_c_mg = 13.7, vitamin_d_mcg = 0, vitamin_e_mg = 0.54, vitamin_k_mcg = 7.9,
  vitamin_b1_mg = 0.037, vitamin_b2_mg = 0.019, vitamin_b3_mg = 0.594, vitamin_b6_mg = 0.08, vitamin_b12_mcg = 0,
  folate_mcg = 15, calcium_mg = 10, iron_mg = 0.27, magnesium_mg = 11, phosphorus_mg = 24,
  potassium_mg = 237, sodium_mg = 5, zinc_mg = 0.17, copper_mg = 0.059, manganese_mg = 0.114, selenium_mcg = 0.4
WHERE ingredient_name = 'Tomatoes';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 7.4, vitamin_d_mcg = 0, vitamin_e_mg = 0.02, vitamin_k_mcg = 0.4,
  vitamin_b1_mg = 0.046, vitamin_b2_mg = 0.027, vitamin_b3_mg = 0.116, vitamin_b6_mg = 0.12, vitamin_b12_mcg = 0,
  folate_mcg = 19, calcium_mg = 23, iron_mg = 0.21, magnesium_mg = 10, phosphorus_mg = 29,
  potassium_mg = 146, sodium_mg = 4, zinc_mg = 0.17, copper_mg = 0.039, manganese_mg = 0.129, selenium_mcg = 0.5
WHERE ingredient_name = 'Onions';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 19.7, vitamin_d_mcg = 0, vitamin_e_mg = 0.01, vitamin_k_mcg = 2,
  vitamin_b1_mg = 0.081, vitamin_b2_mg = 0.032, vitamin_b3_mg = 1.061, vitamin_b6_mg = 0.298, vitamin_b12_mcg = 0,
  folate_mcg = 15, calcium_mg = 12, iron_mg = 0.81, magnesium_mg = 23, phosphorus_mg = 57,
  potassium_mg = 421, sodium_mg = 6, zinc_mg = 0.3, copper_mg = 0.11, manganese_mg = 0.153, selenium_mcg = 0.4
WHERE ingredient_name = 'Potatoes (boiled)';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 835, vitamin_c_mg = 5.9, vitamin_d_mcg = 0, vitamin_e_mg = 0.66, vitamin_k_mcg = 13.2,
  vitamin_b1_mg = 0.066, vitamin_b2_mg = 0.058, vitamin_b3_mg = 0.983, vitamin_b6_mg = 0.138, vitamin_b12_mcg = 0,
  folate_mcg = 19, calcium_mg = 33, iron_mg = 0.3, magnesium_mg = 12, phosphorus_mg = 35,
  potassium_mg = 320, sodium_mg = 69, zinc_mg = 0.24, copper_mg = 0.045, manganese_mg = 0.143, selenium_mcg = 0.1
WHERE ingredient_name = 'Carrots';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 469, vitamin_c_mg = 28.1, vitamin_d_mcg = 0, vitamin_e_mg = 2.03, vitamin_k_mcg = 482.9,
  vitamin_b1_mg = 0.078, vitamin_b2_mg = 0.189, vitamin_b3_mg = 0.724, vitamin_b6_mg = 0.195, vitamin_b12_mcg = 0,
  folate_mcg = 194, calcium_mg = 99, iron_mg = 2.71, magnesium_mg = 79, phosphorus_mg = 49,
  potassium_mg = 558, sodium_mg = 79, zinc_mg = 0.53, copper_mg = 0.13, manganese_mg = 0.897, selenium_mcg = 1
WHERE ingredient_name = 'Spinach';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 623, vitamin_c_mg = 80.4, vitamin_d_mcg = 0, vitamin_e_mg = 0.8, vitamin_k_mcg = 101.6,
  vitamin_b1_mg = 0.101, vitamin_b2_mg = 0.115, vitamin_b3_mg = 1.143, vitamin_b6_mg = 0.281, vitamin_b12_mcg = 0,
  folate_mcg = 83, calcium_mg = 40, iron_mg = 1.03, magnesium_mg = 22, phosphorus_mg = 44,
  potassium_mg = 316, sodium_mg = 30, zinc_mg = 0.37, copper_mg = 0.041, manganese_mg = 0.2, selenium_mcg = 0.3
WHERE ingredient_name = 'Broccoli';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 337, vitamin_c_mg = 36.6, vitamin_d_mcg = 0, vitamin_e_mg = 0.15, vitamin_k_mcg = 76,
  vitamin_b1_mg = 0.05, vitamin_b2_mg = 0.04, vitamin_b3_mg = 0.6, vitamin_b6_mg = 0.16, vitamin_b12_mcg = 0,
  folate_mcg = 57, calcium_mg = 25, iron_mg = 0.47, magnesium_mg = 15, phosphorus_mg = 44,
  potassium_mg = 299, sodium_mg = 30, zinc_mg = 0.27, copper_mg = 0.042, manganese_mg = 0.156, selenium_mcg = 0.6
WHERE ingredient_name = 'Cauliflower';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 214, vitamin_c_mg = 18.4, vitamin_d_mcg = 0, vitamin_e_mg = 0.08, vitamin_k_mcg = 16.4,
  vitamin_b1_mg = 0.087, vitamin_b2_mg = 0.04, vitamin_b3_mg = 0.649, vitamin_b6_mg = 0.073, vitamin_b12_mcg = 0,
  folate_mcg = 68, calcium_mg = 16, iron_mg = 0.35, magnesium_mg = 14, phosphorus_mg = 38,
  potassium_mg = 325, sodium_mg = 8, zinc_mg = 0.2, copper_mg = 0.082, manganese_mg = 0.26, selenium_mcg = 0.4
WHERE ingredient_name = 'Bell Pepper (capsicum)';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 569, vitamin_c_mg = 9.2, vitamin_d_mcg = 0, vitamin_e_mg = 0.73, vitamin_k_mcg = 14.8,
  vitamin_b1_mg = 0.029, vitamin_b2_mg = 0.025, vitamin_b3_mg = 0.649, vitamin_b6_mg = 0.134, vitamin_b12_mcg = 0,
  folate_mcg = 49, calcium_mg = 18, iron_mg = 0.39, magnesium_mg = 17, phosphorus_mg = 25,
  potassium_mg = 262, sodium_mg = 2, zinc_mg = 0.2, copper_mg = 0.075, manganese_mg = 0.109, selenium_mcg = 0.3
WHERE ingredient_name = 'Cucumber';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 426, vitamin_c_mg = 22.2, vitamin_d_mcg = 0, vitamin_e_mg = 0.18, vitamin_k_mcg = 13.3,
  vitamin_b1_mg = 0.038, vitamin_b2_mg = 0.021, vitamin_b3_mg = 0.649, vitamin_b6_mg = 0.086, vitamin_b12_mcg = 0,
  folate_mcg = 22, calcium_mg = 24, iron_mg = 0.38, magnesium_mg = 14, phosphorus_mg = 25,
  potassium_mg = 229, sodium_mg = 2, zinc_mg = 0.23, copper_mg = 0.069, manganese_mg = 0.232, selenium_mcg = 0.4
WHERE ingredient_name = 'Eggplant';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 7, vitamin_c_mg = 11.4, vitamin_d_mcg = 0, vitamin_e_mg = 0.07, vitamin_k_mcg = 1.3,
  vitamin_b1_mg = 0.025, vitamin_b2_mg = 0.033, vitamin_b3_mg = 0.215, vitamin_b6_mg = 0.059, vitamin_b12_mcg = 0,
  folate_mcg = 24, calcium_mg = 21, iron_mg = 0.35, magnesium_mg = 17, phosphorus_mg = 20,
  potassium_mg = 147, sodium_mg = 3, zinc_mg = 0.2, copper_mg = 0.079, manganese_mg = 0.174, selenium_mcg = 0.2
WHERE ingredient_name = 'Bottle Gourd';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 16, vitamin_c_mg = 10.1, vitamin_d_mcg = 0, vitamin_e_mg = 0.12, vitamin_k_mcg = 4.1,
  vitamin_b1_mg = 0.029, vitamin_b2_mg = 0.022, vitamin_b3_mg = 0.32, vitamin_b6_mg = 0.04, vitamin_b12_mcg = 0,
  folate_mcg = 6, calcium_mg = 26, iron_mg = 0.7, magnesium_mg = 10, phosphorus_mg = 13,
  potassium_mg = 150, sodium_mg = 2, zinc_mg = 0.7, copper_mg = 0.034, manganese_mg = 0.089, selenium_mcg = 0.2
WHERE ingredient_name = 'Bottle Gourd';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 267, vitamin_c_mg = 5.3, vitamin_d_mcg = 0, vitamin_e_mg = 0.13, vitamin_k_mcg = 4.8,
  vitamin_b1_mg = 0.05, vitamin_b2_mg = 0.06, vitamin_b3_mg = 0.39, vitamin_b6_mg = 0.04, vitamin_b12_mcg = 0,
  folate_mcg = 12, calcium_mg = 20, iron_mg = 0.36, magnesium_mg = 14, phosphorus_mg = 13,
  potassium_mg = 139, sodium_mg = 2, zinc_mg = 0.71, copper_mg = 0.034, manganese_mg = 0.135, selenium_mcg = 0.2
WHERE ingredient_name = 'Bitter Gourd';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 426, vitamin_c_mg = 17.5, vitamin_d_mcg = 0, vitamin_e_mg = 0.13, vitamin_k_mcg = 1.1,
  vitamin_b1_mg = 0.05, vitamin_b2_mg = 0.11, vitamin_b3_mg = 0.6, vitamin_b6_mg = 0.043, vitamin_b12_mcg = 0,
  folate_mcg = 73, calcium_mg = 21, iron_mg = 0.38, magnesium_mg = 17, phosphorus_mg = 36,
  potassium_mg = 296, sodium_mg = 12, zinc_mg = 0.77, copper_mg = 0.034, manganese_mg = 0.126, selenium_mcg = 0.2
WHERE ingredient_name = 'Okra';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 13.2, vitamin_d_mcg = 0, vitamin_e_mg = 0.03, vitamin_k_mcg = 1.1,
  vitamin_b1_mg = 0.04, vitamin_b2_mg = 0.06, vitamin_b3_mg = 0.6, vitamin_b6_mg = 0.043, vitamin_b12_mcg = 0,
  folate_mcg = 14, calcium_mg = 48, iron_mg = 0.36, magnesium_mg = 65, phosphorus_mg = 50,
  potassium_mg = 148, sodium_mg = 5, zinc_mg = 0.42, copper_mg = 0.087, manganese_mg = 0.188, selenium_mcg = 0.7
WHERE ingredient_name = 'Green Beans';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 3, vitamin_c_mg = 7.7, vitamin_d_mcg = 0, vitamin_e_mg = 0.01, vitamin_k_mcg = 0.1,
  vitamin_b1_mg = 0.058, vitamin_b2_mg = 0.028, vitamin_b3_mg = 0.386, vitamin_b6_mg = 0.061, vitamin_b12_mcg = 0,
  folate_mcg = 16, calcium_mg = 37, iron_mg = 0.5, magnesium_mg = 21, phosphorus_mg = 52,
  potassium_mg = 278, sodium_mg = 251, zinc_mg = 0.27, copper_mg = 0.129, manganese_mg = 0.215, selenium_mcg = 0.7
WHERE ingredient_name = 'Carrots';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 17, vitamin_d_mcg = 0, vitamin_e_mg = 0.03, vitamin_k_mcg = 1.6,
  vitamin_b1_mg = 0.09, vitamin_b2_mg = 0.02, vitamin_b3_mg = 0.5, vitamin_b6_mg = 0.15, vitamin_b12_mcg = 0,
  folate_mcg = 16, calcium_mg = 50, iron_mg = 0.54, magnesium_mg = 23, phosphorus_mg = 46,
  potassium_mg = 305, sodium_mg = 14, zinc_mg = 0.24, copper_mg = 0.092, manganese_mg = 0.155, selenium_mcg = 0.7
WHERE ingredient_name = 'Sweet Potato';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 953, vitamin_c_mg = 139, vitamin_d_mcg = 0, vitamin_e_mg = 0.66, vitamin_k_mcg = 177.7,
  vitamin_b1_mg = 0.11, vitamin_b2_mg = 0.15, vitamin_b3_mg = 0.8, vitamin_b6_mg = 0.19, vitamin_b12_mcg = 0,
  folate_mcg = 194, calcium_mg = 150, iron_mg = 1.46, magnesium_mg = 22, phosphorus_mg = 58,
  potassium_mg = 296, sodium_mg = 42, zinc_mg = 0.42, copper_mg = 0.07, manganese_mg = 0.337, selenium_mcg = 0.9
WHERE ingredient_name = 'Spinach';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 509, vitamin_c_mg = 120, vitamin_d_mcg = 0, vitamin_e_mg = 1.46, vitamin_k_mcg = 817,
  vitamin_b1_mg = 0.16, vitamin_b2_mg = 0.13, vitamin_b3_mg = 1.1, vitamin_b6_mg = 0.27, vitamin_b12_mcg = 0,
  folate_mcg = 141, calcium_mg = 232, iron_mg = 2.47, magnesium_mg = 34, phosphorus_mg = 58,
  potassium_mg = 490, sodium_mg = 30, zinc_mg = 0.92, copper_mg = 0.074, manganese_mg = 0.659, selenium_mcg = 0.9
WHERE ingredient_name = 'Spinach';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 778, vitamin_c_mg = 93, vitamin_d_mcg = 0, vitamin_e_mg = 1.5, vitamin_k_mcg = 389.6,
  vitamin_b1_mg = 0.07, vitamin_b2_mg = 0.15, vitamin_b3_mg = 0.74, vitamin_b6_mg = 0.25, vitamin_b12_mcg = 0,
  folate_mcg = 166, calcium_mg = 105, iron_mg = 0.95, magnesium_mg = 18, phosphorus_mg = 56,
  potassium_mg = 447, sodium_mg = 43, zinc_mg = 0.44, copper_mg = 0.074, manganese_mg = 0.474, selenium_mcg = 0.9
WHERE ingredient_name = 'Fenugreek Leaves';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 292, vitamin_c_mg = 133, vitamin_d_mcg = 0, vitamin_e_mg = 0.44, vitamin_k_mcg = 310,
  vitamin_b1_mg = 0.058, vitamin_b2_mg = 0.162, vitamin_b3_mg = 1.114, vitamin_b6_mg = 0.09, vitamin_b12_mcg = 0,
  folate_mcg = 152, calcium_mg = 138, iron_mg = 6.2, magnesium_mg = 50, phosphorus_mg = 72,
  potassium_mg = 554, sodium_mg = 46, zinc_mg = 0.73, copper_mg = 0.161, manganese_mg = 0.426, selenium_mcg = 0.9
WHERE ingredient_name = 'Coriander Leaves';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 337, vitamin_c_mg = 120, vitamin_d_mcg = 0, vitamin_e_mg = 2.5, vitamin_k_mcg = 1640,
  vitamin_b1_mg = 0.11, vitamin_b2_mg = 0.26, vitamin_b3_mg = 2, vitamin_b6_mg = 0.27, vitamin_b12_mcg = 0,
  folate_mcg = 194, calcium_mg = 150, iron_mg = 2.9, magnesium_mg = 87, phosphorus_mg = 86,
  potassium_mg = 817, sodium_mg = 58, zinc_mg = 0.81, copper_mg = 0.29, manganese_mg = 1.668, selenium_mcg = 0.9
WHERE ingredient_name = 'Mint Leaves';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 421, vitamin_c_mg = 51.7, vitamin_d_mcg = 0, vitamin_e_mg = 0.29, vitamin_k_mcg = 108.6,
  vitamin_b1_mg = 0.055, vitamin_b2_mg = 0.086, vitamin_b3_mg = 0.525, vitamin_b6_mg = 0.149, vitamin_b12_mcg = 0,
  folate_mcg = 65, calcium_mg = 40, iron_mg = 1.47, magnesium_mg = 23, phosphorus_mg = 52,
  potassium_mg = 296, sodium_mg = 24, zinc_mg = 0.42, copper_mg = 0.091, manganese_mg = 0.337, selenium_mcg = 0.9
WHERE ingredient_name = 'Cabbage';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 436, vitamin_c_mg = 11.6, vitamin_d_mcg = 0, vitamin_e_mg = 0.22, vitamin_k_mcg = 29.3,
  vitamin_b1_mg = 0.041, vitamin_b2_mg = 0.025, vitamin_b3_mg = 0.321, vitamin_b6_mg = 0.124, vitamin_b12_mcg = 0,
  folate_mcg = 38, calcium_mg = 37, iron_mg = 0.47, magnesium_mg = 12, phosphorus_mg = 25,
  potassium_mg = 194, sodium_mg = 3, zinc_mg = 0.2, copper_mg = 0.041, manganese_mg = 0.142, selenium_mcg = 0.4
WHERE ingredient_name = 'Zucchini';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 10, vitamin_c_mg = 9, vitamin_d_mcg = 0, vitamin_e_mg = 0.01, vitamin_k_mcg = 1,
  vitamin_b1_mg = 0.05, vitamin_b2_mg = 0.11, vitamin_b3_mg = 1.5, vitamin_b6_mg = 0.298, vitamin_b12_mcg = 0,
  folate_mcg = 16, calcium_mg = 9, iron_mg = 0.52, magnesium_mg = 23, phosphorus_mg = 70,
  potassium_mg = 535, sodium_mg = 8, zinc_mg = 0.3, copper_mg = 0.15, manganese_mg = 0.273, selenium_mcg = 0.7
WHERE ingredient_name = 'Mushrooms';
-- Migration: Add micronutrients for batch 3 (Fruits & Dairy - 25 items)
-- Items: Banana, Apple, Mango, Milk, Yogurt, Paneer, etc.

UPDATE nutrition_reference SET
  vitamin_a_mcg = 64, vitamin_c_mg = 8.7, vitamin_d_mcg = 0, vitamin_e_mg = 0.1, vitamin_k_mcg = 0.5,
  vitamin_b1_mg = 0.031, vitamin_b2_mg = 0.073, vitamin_b3_mg = 0.665, vitamin_b6_mg = 0.367, vitamin_b12_mcg = 0,
  folate_mcg = 20, calcium_mg = 5, iron_mg = 0.26, magnesium_mg = 27, phosphorus_mg = 22,
  potassium_mg = 358, sodium_mg = 1, zinc_mg = 0.15, copper_mg = 0.078, manganese_mg = 0.27, selenium_mcg = 1
WHERE ingredient_name = 'Banana';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 54, vitamin_c_mg = 4.6, vitamin_d_mcg = 0, vitamin_e_mg = 0.18, vitamin_k_mcg = 2.2,
  vitamin_b1_mg = 0.017, vitamin_b2_mg = 0.026, vitamin_b3_mg = 0.091, vitamin_b6_mg = 0.041, vitamin_b12_mcg = 0,
  folate_mcg = 3, calcium_mg = 6, iron_mg = 0.12, magnesium_mg = 5, phosphorus_mg = 11,
  potassium_mg = 107, sodium_mg = 1, zinc_mg = 0.04, copper_mg = 0.027, manganese_mg = 0.035, selenium_mcg = 0
WHERE ingredient_name = 'Apple';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 1082, vitamin_c_mg = 36.4, vitamin_d_mcg = 0, vitamin_e_mg = 0.9, vitamin_k_mcg = 4.2,
  vitamin_b1_mg = 0.028, vitamin_b2_mg = 0.038, vitamin_b3_mg = 0.669, vitamin_b6_mg = 0.119, vitamin_b12_mcg = 0,
  folate_mcg = 43, calcium_mg = 11, iron_mg = 0.16, magnesium_mg = 10, phosphorus_mg = 14,
  potassium_mg = 168, sodium_mg = 1, zinc_mg = 0.09, copper_mg = 0.111, manganese_mg = 0.063, selenium_mcg = 0.6
WHERE ingredient_name = 'Mango';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 38, vitamin_c_mg = 53.2, vitamin_d_mcg = 0, vitamin_e_mg = 0.29, vitamin_k_mcg = 14.8,
  vitamin_b1_mg = 0.034, vitamin_b2_mg = 0.026, vitamin_b3_mg = 0.282, vitamin_b6_mg = 0.047, vitamin_b12_mcg = 0,
  folate_mcg = 24, calcium_mg = 18, iron_mg = 0.31, magnesium_mg = 12, phosphorus_mg = 11,
  potassium_mg = 153, sodium_mg = 1, zinc_mg = 0.07, copper_mg = 0.055, manganese_mg = 0.025, selenium_mcg = 0.4
WHERE ingredient_name = 'Orange';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 27, vitamin_c_mg = 10.2, vitamin_d_mcg = 0, vitamin_e_mg = 0.73, vitamin_k_mcg = 2.6,
  vitamin_b1_mg = 0.027, vitamin_b2_mg = 0.037, vitamin_b3_mg = 0.114, vitamin_b6_mg = 0.025, vitamin_b12_mcg = 0,
  folate_mcg = 5, calcium_mg = 16, iron_mg = 0.36, magnesium_mg = 13, phosphorus_mg = 24,
  potassium_mg = 152, sodium_mg = 1, zinc_mg = 0.14, copper_mg = 0.057, manganese_mg = 0.142, selenium_mcg = 0.4
WHERE ingredient_name = 'Papaya';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 64, vitamin_c_mg = 58.8, vitamin_d_mcg = 0, vitamin_e_mg = 0.87, vitamin_k_mcg = 40.3,
  vitamin_b1_mg = 0.027, vitamin_b2_mg = 0.021, vitamin_b3_mg = 0.386, vitamin_b6_mg = 0.063, vitamin_b12_mcg = 0,
  folate_mcg = 29, calcium_mg = 34, iron_mg = 0.29, magnesium_mg = 13, phosphorus_mg = 32,
  potassium_mg = 138, sodium_mg = 1, zinc_mg = 0.1, copper_mg = 0.103, manganese_mg = 0.061, selenium_mcg = 0.6
WHERE ingredient_name = 'Guava';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 3, vitamin_c_mg = 9.7, vitamin_d_mcg = 0, vitamin_e_mg = 0.15, vitamin_k_mcg = 2.2,
  vitamin_b1_mg = 0.024, vitamin_b2_mg = 0.026, vitamin_b3_mg = 0.386, vitamin_b6_mg = 0.048, vitamin_b12_mcg = 0,
  folate_mcg = 5, calcium_mg = 8, iron_mg = 0.28, magnesium_mg = 10, phosphorus_mg = 16,
  potassium_mg = 191, sodium_mg = 1, zinc_mg = 0.1, copper_mg = 0.039, manganese_mg = 0.052, selenium_mcg = 0.4
WHERE ingredient_name = 'Watermelon';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 169, vitamin_c_mg = 36.7, vitamin_d_mcg = 0, vitamin_e_mg = 0.05, vitamin_k_mcg = 2.5,
  vitamin_b1_mg = 0.02, vitamin_b2_mg = 0.03, vitamin_b3_mg = 0.5, vitamin_b6_mg = 0.04, vitamin_b12_mcg = 0,
  folate_mcg = 4, calcium_mg = 9, iron_mg = 0.21, magnesium_mg = 9, phosphorus_mg = 11,
  potassium_mg = 147, sodium_mg = 1, zinc_mg = 0.08, copper_mg = 0.037, manganese_mg = 0.04, selenium_mcg = 0.4
WHERE ingredient_name = 'Pineapple';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 3, vitamin_c_mg = 4.9, vitamin_d_mcg = 0, vitamin_e_mg = 0.22, vitamin_k_mcg = 2.6,
  vitamin_b1_mg = 0.019, vitamin_b2_mg = 0.032, vitamin_b3_mg = 0.418, vitamin_b6_mg = 0.047, vitamin_b12_mcg = 0,
  folate_mcg = 8, calcium_mg = 6, iron_mg = 0.3, magnesium_mg = 13, phosphorus_mg = 24,
  potassium_mg = 194, sodium_mg = 1, zinc_mg = 0.17, copper_mg = 0.092, manganese_mg = 0.3, selenium_mcg = 0.4
WHERE ingredient_name = 'Grapes';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 96, vitamin_c_mg = 10, vitamin_d_mcg = 0, vitamin_e_mg = 0.53, vitamin_k_mcg = 3.3,
  vitamin_b1_mg = 0.03, vitamin_b2_mg = 0.04, vitamin_b3_mg = 1.05, vitamin_b6_mg = 0.066, vitamin_b12_mcg = 0,
  folate_mcg = 9, calcium_mg = 6, iron_mg = 0.39, magnesium_mg = 10, phosphorus_mg = 23,
  potassium_mg = 232, sodium_mg = 1, zinc_mg = 0.14, copper_mg = 0.057, manganese_mg = 0.054, selenium_mcg = 0.4
WHERE ingredient_name = 'Pomegranate';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 46, vitamin_c_mg = 0.5, vitamin_d_mcg = 0.1, vitamin_e_mg = 0.07, vitamin_k_mcg = 0.3,
  vitamin_b1_mg = 0.046, vitamin_b2_mg = 0.183, vitamin_b3_mg = 0.089, vitamin_b6_mg = 0.036, vitamin_b12_mcg = 0.45,
  folate_mcg = 5, calcium_mg = 113, iron_mg = 0.03, magnesium_mg = 10, phosphorus_mg = 84,
  potassium_mg = 132, sodium_mg = 43, zinc_mg = 0.37, copper_mg = 0.01, manganese_mg = 0.004, selenium_mcg = 2.2
WHERE ingredient_name = 'Milk (whole)';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 2, vitamin_c_mg = 0.5, vitamin_d_mcg = 0, vitamin_e_mg = 0.01, vitamin_k_mcg = 0.2,
  vitamin_b1_mg = 0.04, vitamin_b2_mg = 0.14, vitamin_b3_mg = 0.08, vitamin_b6_mg = 0.03, vitamin_b12_mcg = 0.38,
  folate_mcg = 4, calcium_mg = 120, iron_mg = 0.02, magnesium_mg = 11, phosphorus_mg = 95,
  potassium_mg = 150, sodium_mg = 44, zinc_mg = 0.42, copper_mg = 0.01, manganese_mg = 0.004, selenium_mcg = 2.3
WHERE ingredient_name = 'Milk (skim)';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 5, vitamin_c_mg = 0.8, vitamin_d_mcg = 0, vitamin_e_mg = 0.01, vitamin_k_mcg = 0.2,
  vitamin_b1_mg = 0.029, vitamin_b2_mg = 0.142, vitamin_b3_mg = 0.075, vitamin_b6_mg = 0.032, vitamin_b12_mcg = 0.37,
  folate_mcg = 5, calcium_mg = 110, iron_mg = 0.05, magnesium_mg = 11, phosphorus_mg = 84,
  potassium_mg = 141, sodium_mg = 36, zinc_mg = 0.59, copper_mg = 0.009, manganese_mg = 0.004, selenium_mcg = 2.2
WHERE ingredient_name = 'Yogurt (plain)';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 0.3, vitamin_k_mcg = 2.8,
  vitamin_b1_mg = 0.04, vitamin_b2_mg = 0.19, vitamin_b3_mg = 0.4, vitamin_b6_mg = 0.05, vitamin_b12_mcg = 0.4,
  folate_mcg = 18, calcium_mg = 208, iron_mg = 0.82, magnesium_mg = 13, phosphorus_mg = 138,
  potassium_mg = 96, sodium_mg = 18, zinc_mg = 2.88, copper_mg = 0.04, manganese_mg = 0.023, selenium_mcg = 8.2
WHERE ingredient_name = 'Paneer';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 198, vitamin_c_mg = 0, vitamin_d_mcg = 0.5, vitamin_e_mg = 0.26, vitamin_k_mcg = 2.3,
  vitamin_b1_mg = 0.027, vitamin_b2_mg = 0.375, vitamin_b3_mg = 0.059, vitamin_b6_mg = 0.068, vitamin_b12_mcg = 1.54,
  folate_mcg = 27, calcium_mg = 721, iron_mg = 0.82, magnesium_mg = 28, phosphorus_mg = 512,
  potassium_mg = 98, sodium_mg = 621, zinc_mg = 3.11, copper_mg = 0.032, manganese_mg = 0.01, selenium_mcg = 14.5
WHERE ingredient_name = 'Cheddar Cheese';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 243, vitamin_c_mg = 0, vitamin_d_mcg = 0.5, vitamin_e_mg = 0.19, vitamin_k_mcg = 2.3,
  vitamin_b1_mg = 0.037, vitamin_b2_mg = 0.27, vitamin_b3_mg = 0.104, vitamin_b6_mg = 0.09, vitamin_b12_mcg = 2.28,
  folate_mcg = 7, calcium_mg = 505, iron_mg = 0.44, magnesium_mg = 11, phosphorus_mg = 354,
  potassium_mg = 76, sodium_mg = 1395, zinc_mg = 2.88, copper_mg = 0.032, manganese_mg = 0.011, selenium_mcg = 14.5
WHERE ingredient_name = 'Cheddar Cheese';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 449, vitamin_c_mg = 0, vitamin_d_mcg = 0.2, vitamin_e_mg = 0.71, vitamin_k_mcg = 7,
  vitamin_b1_mg = 0.081, vitamin_b2_mg = 0.537, vitamin_b3_mg = 0.418, vitamin_b6_mg = 0.175, vitamin_b12_mcg = 3.34,
  folate_mcg = 65, calcium_mg = 1184, iron_mg = 0.68, magnesium_mg = 41, phosphorus_mg = 816,
  potassium_mg = 136, sodium_mg = 1602, zinc_mg = 4.06, copper_mg = 0.04, manganese_mg = 0.015, selenium_mcg = 17
WHERE ingredient_name = 'Cheddar Cheese';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 337, vitamin_c_mg = 0, vitamin_d_mcg = 0.4, vitamin_e_mg = 2.32, vitamin_k_mcg = 2,
  vitamin_b1_mg = 0.021, vitamin_b2_mg = 0.343, vitamin_b3_mg = 0.288, vitamin_b6_mg = 0.235, vitamin_b12_mcg = 1.69,
  folate_mcg = 18, calcium_mg = 553, iron_mg = 0.5, magnesium_mg = 20, phosphorus_mg = 387,
  potassium_mg = 152, sodium_mg = 1500, zinc_mg = 2.88, copper_mg = 0.04, manganese_mg = 0.023, selenium_mcg = 14.5
WHERE ingredient_name = 'Cheddar Cheese';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 220, vitamin_c_mg = 0, vitamin_d_mcg = 0.1, vitamin_e_mg = 0.11, vitamin_k_mcg = 2.3,
  vitamin_b1_mg = 0.036, vitamin_b2_mg = 0.27, vitamin_b3_mg = 0.104, vitamin_b6_mg = 0.09, vitamin_b12_mcg = 2.28,
  folate_mcg = 10, calcium_mg = 505, iron_mg = 0.44, magnesium_mg = 11, phosphorus_mg = 354,
  potassium_mg = 76, sodium_mg = 330, zinc_mg = 2.88, copper_mg = 0.032, manganese_mg = 0.011, selenium_mcg = 14.5
WHERE ingredient_name = 'Mozzarella Cheese';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 405, vitamin_c_mg = 0, vitamin_d_mcg = 1.1, vitamin_e_mg = 1.05, vitamin_k_mcg = 7,
  vitamin_b1_mg = 0.04, vitamin_b2_mg = 0.44, vitamin_b3_mg = 0.1, vitamin_b6_mg = 0.07, vitamin_b12_mcg = 1.5,
  folate_mcg = 11, calcium_mg = 714, iron_mg = 0.07, magnesium_mg = 22, phosphorus_mg = 490,
  potassium_mg = 77, sodium_mg = 629, zinc_mg = 3, copper_mg = 0.03, manganese_mg = 0.01, selenium_mcg = 14.5
WHERE ingredient_name = 'Butter';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 684, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 2.32, vitamin_k_mcg = 7,
  vitamin_b1_mg = 0.005, vitamin_b2_mg = 0.19, vitamin_b3_mg = 0.42, vitamin_b6_mg = 0.07, vitamin_b12_mcg = 0.17,
  folate_mcg = 3, calcium_mg = 123, iron_mg = 0.02, magnesium_mg = 2, phosphorus_mg = 95,
  potassium_mg = 26, sodium_mg = 90, zinc_mg = 0.42, copper_mg = 0.002, manganese_mg = 0, selenium_mcg = 1.8
WHERE ingredient_name = 'Ghee';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 263, vitamin_c_mg = 1, vitamin_d_mcg = 0.2, vitamin_e_mg = 0.3, vitamin_k_mcg = 0.3,
  vitamin_b1_mg = 0.04, vitamin_b2_mg = 0.15, vitamin_b3_mg = 0.1, vitamin_b6_mg = 0.05, vitamin_b12_mcg = 0.5,
  folate_mcg = 11, calcium_mg = 100, iron_mg = 0.1, magnesium_mg = 8, phosphorus_mg = 60,
  potassium_mg = 109, sodium_mg = 38, zinc_mg = 0.3, copper_mg = 0.008, manganese_mg = 0.001, selenium_mcg = 1.5
WHERE ingredient_name = 'Cream';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0.6, vitamin_d_mcg = 0, vitamin_e_mg = 0.09, vitamin_k_mcg = 0.1,
  vitamin_b1_mg = 0.02, vitamin_b2_mg = 0.055, vitamin_b3_mg = 0.05, vitamin_b6_mg = 0.014, vitamin_b12_mcg = 0.18,
  folate_mcg = 1, calcium_mg = 61, iron_mg = 0.05, magnesium_mg = 5, phosphorus_mg = 49,
  potassium_mg = 65, sodium_mg = 21, zinc_mg = 0.22, copper_mg = 0.006, manganese_mg = 0.002, selenium_mcg = 1.1
WHERE ingredient_name = 'Milk (whole)';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 38, vitamin_c_mg = 0.5, vitamin_d_mcg = 0.1, vitamin_e_mg = 0.03, vitamin_k_mcg = 0.3,
  vitamin_b1_mg = 0.04, vitamin_b2_mg = 0.16, vitamin_b3_mg = 0.09, vitamin_b6_mg = 0.04, vitamin_b12_mcg = 0.4,
  folate_mcg = 5, calcium_mg = 120, iron_mg = 0.03, magnesium_mg = 11, phosphorus_mg = 93,
  potassium_mg = 151, sodium_mg = 40, zinc_mg = 0.4, copper_mg = 0.01, manganese_mg = 0.004, selenium_mcg = 2.2
WHERE ingredient_name = 'Milk (whole)';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 0.01, vitamin_k_mcg = 0.1,
  vitamin_b1_mg = 0, vitamin_b2_mg = 0.017, vitamin_b3_mg = 0, vitamin_b6_mg = 0, vitamin_b12_mcg = 0.05,
  folate_mcg = 1, calcium_mg = 54, iron_mg = 0.01, magnesium_mg = 3, phosphorus_mg = 30,
  potassium_mg = 48, sodium_mg = 15, zinc_mg = 0.15, copper_mg = 0.004, manganese_mg = 0.001, selenium_mcg = 0.9
WHERE ingredient_name = 'Milk (whole)';
-- Migration: Add micronutrients for batch 4 (Proteins & Legumes - 25 items)
-- Items: Chicken, Fish, Eggs, Lentils, Beans, Chickpeas, etc.

UPDATE nutrition_reference SET
  vitamin_a_mcg = 16, vitamin_c_mg = 1.6, vitamin_d_mcg = 0.2, vitamin_e_mg = 0.27, vitamin_k_mcg = 2.2,
  vitamin_b1_mg = 0.07, vitamin_b2_mg = 0.12, vitamin_b3_mg = 9.91, vitamin_b6_mg = 0.6, vitamin_b12_mcg = 0.34,
  folate_mcg = 4, calcium_mg = 11, iron_mg = 0.9, magnesium_mg = 25, phosphorus_mg = 173,
  potassium_mg = 223, sodium_mg = 70, zinc_mg = 1.54, copper_mg = 0.048, manganese_mg = 0.019, selenium_mcg = 20.6
WHERE ingredient_name = 'Chicken Breast (cooked)';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 37, vitamin_c_mg = 0, vitamin_d_mcg = 0.1, vitamin_e_mg = 0.36, vitamin_k_mcg = 0.1,
  vitamin_b1_mg = 0.05, vitamin_b2_mg = 0.07, vitamin_b3_mg = 4.32, vitamin_b6_mg = 0.3, vitamin_b12_mcg = 0.37,
  folate_mcg = 4, calcium_mg = 13, iron_mg = 1.04, magnesium_mg = 20, phosphorus_mg = 147,
  potassium_mg = 204, sodium_mg = 77, zinc_mg = 2.45, copper_mg = 0.076, manganese_mg = 0.018, selenium_mcg = 13.7
WHERE ingredient_name = 'Chicken Thigh (cooked)';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 54, vitamin_c_mg = 1.2, vitamin_d_mcg = 1.1, vitamin_e_mg = 0.7, vitamin_k_mcg = 0.1,
  vitamin_b1_mg = 0.08, vitamin_b2_mg = 0.11, vitamin_b3_mg = 3.54, vitamin_b6_mg = 0.17, vitamin_b12_mcg = 4.8,
  folate_mcg = 5, calcium_mg = 13, iron_mg = 0.8, magnesium_mg = 29, phosphorus_mg = 204,
  potassium_mg = 363, sodium_mg = 74, zinc_mg = 0.64, copper_mg = 0.055, manganese_mg = 0.016, selenium_mcg = 36.5
WHERE ingredient_name = 'Salmon (cooked)';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 18, vitamin_c_mg = 0, vitamin_d_mcg = 0.5, vitamin_e_mg = 0.87, vitamin_k_mcg = 0.1,
  vitamin_b1_mg = 0.04, vitamin_b2_mg = 0.07, vitamin_b3_mg = 5.8, vitamin_b6_mg = 0.16, vitamin_b12_mcg = 1.8,
  folate_mcg = 5, calcium_mg = 10, iron_mg = 0.3, magnesium_mg = 29, phosphorus_mg = 203,
  potassium_mg = 417, sodium_mg = 54, zinc_mg = 0.37, copper_mg = 0.04, manganese_mg = 0.015, selenium_mcg = 36.5
WHERE ingredient_name = 'Tuna (cooked)';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 15, vitamin_c_mg = 1.4, vitamin_d_mcg = 0.2, vitamin_e_mg = 0.4, vitamin_k_mcg = 0.1,
  vitamin_b1_mg = 0.02, vitamin_b2_mg = 0.04, vitamin_b3_mg = 1.6, vitamin_b6_mg = 0.09, vitamin_b12_mcg = 1.5,
  folate_mcg = 6, calcium_mg = 39, iron_mg = 0.3, magnesium_mg = 32, phosphorus_mg = 210,
  potassium_mg = 259, sodium_mg = 119, zinc_mg = 0.5, copper_mg = 0.05, manganese_mg = 0.04, selenium_mcg = 38
WHERE ingredient_name = 'Prawns/Shrimp';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 160, vitamin_c_mg = 0, vitamin_d_mcg = 2, vitamin_e_mg = 1.05, vitamin_k_mcg = 0.3,
  vitamin_b1_mg = 0.04, vitamin_b2_mg = 0.457, vitamin_b3_mg = 0.075, vitamin_b6_mg = 0.17, vitamin_b12_mcg = 0.89,
  folate_mcg = 47, calcium_mg = 56, iron_mg = 1.75, magnesium_mg = 12, phosphorus_mg = 198,
  potassium_mg = 138, sodium_mg = 142, zinc_mg = 1.29, copper_mg = 0.072, manganese_mg = 0.028, selenium_mcg = 30.7
WHERE ingredient_name = 'Eggs (whole)';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 0, vitamin_k_mcg = 0,
  vitamin_b1_mg = 0.004, vitamin_b2_mg = 0.439, vitamin_b3_mg = 0.105, vitamin_b6_mg = 0.07, vitamin_b12_mcg = 0.52,
  folate_mcg = 13, calcium_mg = 5, iron_mg = 0.08, magnesium_mg = 11, phosphorus_mg = 15,
  potassium_mg = 126, sodium_mg = 166, zinc_mg = 0.03, copper_mg = 0.013, manganese_mg = 0.009, selenium_mcg = 20
WHERE ingredient_name = 'Egg White';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 520, vitamin_c_mg = 0, vitamin_d_mcg = 5.4, vitamin_e_mg = 2.58, vitamin_k_mcg = 0.7,
  vitamin_b1_mg = 0.18, vitamin_b2_mg = 0.528, vitamin_b3_mg = 0.024, vitamin_b6_mg = 0.35, vitamin_b12_mcg = 1.95,
  folate_mcg = 146, calcium_mg = 129, iron_mg = 5.54, magnesium_mg = 5, phosphorus_mg = 390,
  potassium_mg = 109, sodium_mg = 48, zinc_mg = 2.3, copper_mg = 0.077, manganese_mg = 0.055, selenium_mcg = 56
WHERE ingredient_name = 'Egg Yolk';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 4.5, vitamin_d_mcg = 0, vitamin_e_mg = 0.21, vitamin_k_mcg = 5,
  vitamin_b1_mg = 0.52, vitamin_b2_mg = 0.21, vitamin_b3_mg = 2.6, vitamin_b6_mg = 0.54, vitamin_b12_mcg = 0,
  folate_mcg = 479, calcium_mg = 38, iron_mg = 7.54, magnesium_mg = 122, phosphorus_mg = 281,
  potassium_mg = 955, sodium_mg = 6, zinc_mg = 4.78, copper_mg = 0.66, manganese_mg = 1.39, selenium_mcg = 8.2
WHERE ingredient_name = 'Red Lentils (cooked)';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 4, vitamin_d_mcg = 0, vitamin_e_mg = 0.15, vitamin_k_mcg = 9,
  vitamin_b1_mg = 0.48, vitamin_b2_mg = 0.22, vitamin_b3_mg = 1.35, vitamin_b6_mg = 0.28, vitamin_b12_mcg = 0,
  folate_mcg = 433, calcium_mg = 83, iron_mg = 4.56, magnesium_mg = 115, phosphorus_mg = 367,
  potassium_mg = 1246, sodium_mg = 12, zinc_mg = 3.27, copper_mg = 0.98, manganese_mg = 1.03, selenium_mcg = 8.2
WHERE ingredient_name = 'Moong Dal (cooked)';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 0.6, vitamin_k_mcg = 9,
  vitamin_b1_mg = 0.34, vitamin_b2_mg = 0.21, vitamin_b3_mg = 2.2, vitamin_b6_mg = 0.22, vitamin_b12_mcg = 0,
  folate_mcg = 173, calcium_mg = 56, iron_mg = 3.5, magnesium_mg = 183, phosphorus_mg = 406,
  potassium_mg = 1300, sodium_mg = 16, zinc_mg = 2.79, copper_mg = 0.78, manganese_mg = 1.43, selenium_mcg = 8.2
WHERE ingredient_name = 'Yellow Lentils (cooked)';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 3.5, vitamin_d_mcg = 0, vitamin_e_mg = 0.19, vitamin_k_mcg = 5.5,
  vitamin_b1_mg = 0.44, vitamin_b2_mg = 0.22, vitamin_b3_mg = 1.5, vitamin_b6_mg = 0.28, vitamin_b12_mcg = 0,
  folate_mcg = 437, calcium_mg = 202, iron_mg = 7.57, magnesium_mg = 138, phosphorus_mg = 367,
  potassium_mg = 1110, sodium_mg = 38, zinc_mg = 3.21, copper_mg = 0.75, manganese_mg = 1.03, selenium_mcg = 8.2
WHERE ingredient_name = 'Black Lentils (cooked)';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 4, vitamin_d_mcg = 0, vitamin_e_mg = 0.22, vitamin_k_mcg = 9,
  vitamin_b1_mg = 0.73, vitamin_b2_mg = 0.22, vitamin_b3_mg = 2.25, vitamin_b6_mg = 0.54, vitamin_b12_mcg = 0,
  folate_mcg = 557, calcium_mg = 57, iron_mg = 6.69, magnesium_mg = 189, phosphorus_mg = 367,
  potassium_mg = 1240, sodium_mg = 15, zinc_mg = 3.43, copper_mg = 0.98, manganese_mg = 1.03, selenium_mcg = 8.2
WHERE ingredient_name = 'Chickpeas (cooked)';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 67, vitamin_c_mg = 4, vitamin_d_mcg = 0, vitamin_e_mg = 0.82, vitamin_k_mcg = 9,
  vitamin_b1_mg = 0.48, vitamin_b2_mg = 0.21, vitamin_b3_mg = 1.54, vitamin_b6_mg = 0.54, vitamin_b12_mcg = 0,
  folate_mcg = 557, calcium_mg = 105, iron_mg = 6.24, magnesium_mg = 115, phosphorus_mg = 252,
  potassium_mg = 875, sodium_mg = 24, zinc_mg = 3.43, copper_mg = 0.66, manganese_mg = 2.2, selenium_mcg = 28.5
WHERE ingredient_name = 'Chickpeas (cooked)';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 4.5, vitamin_d_mcg = 0, vitamin_e_mg = 0.21, vitamin_k_mcg = 5,
  vitamin_b1_mg = 0.61, vitamin_b2_mg = 0.15, vitamin_b3_mg = 2.1, vitamin_b6_mg = 0.54, vitamin_b12_mcg = 0,
  folate_mcg = 394, calcium_mg = 143, iron_mg = 5.34, magnesium_mg = 138, phosphorus_mg = 352,
  potassium_mg = 1406, sodium_mg = 5, zinc_mg = 3.67, copper_mg = 0.98, manganese_mg = 1.46, selenium_mcg = 8.2
WHERE ingredient_name = 'Kidney Beans (cooked)';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 0.69, vitamin_k_mcg = 19,
  vitamin_b1_mg = 0.5, vitamin_b2_mg = 0.22, vitamin_b3_mg = 2.1, vitamin_b6_mg = 0.4, vitamin_b12_mcg = 0,
  folate_mcg = 394, calcium_mg = 240, iron_mg = 5.02, magnesium_mg = 171, phosphorus_mg = 407,
  potassium_mg = 1483, sodium_mg = 2, zinc_mg = 3.67, copper_mg = 0.98, manganese_mg = 1.46, selenium_mcg = 8.2
WHERE ingredient_name = 'Black Lentils (cooked)';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 0.69, vitamin_k_mcg = 19,
  vitamin_b1_mg = 0.44, vitamin_b2_mg = 0.06, vitamin_b3_mg = 0.48, vitamin_b6_mg = 0.07, vitamin_b12_mcg = 0,
  folate_mcg = 394, calcium_mg = 28, iron_mg = 2.94, magnesium_mg = 63, phosphorus_mg = 142,
  potassium_mg = 561, sodium_mg = 2, zinc_mg = 1.93, copper_mg = 0.41, manganese_mg = 0.58, selenium_mcg = 3.2
WHERE ingredient_name = 'Soy Chunks';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 0.85, vitamin_k_mcg = 24,
  vitamin_b1_mg = 0.2, vitamin_b2_mg = 0.29, vitamin_b3_mg = 0.4, vitamin_b6_mg = 0.22, vitamin_b12_mcg = 0,
  folate_mcg = 149, calcium_mg = 350, iron_mg = 5.36, magnesium_mg = 65, phosphorus_mg = 194,
  potassium_mg = 237, sodium_mg = 7, zinc_mg = 1.98, copper_mg = 0.13, manganese_mg = 0.82, selenium_mcg = 8.9
WHERE ingredient_name = 'Tofu';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 6.8, vitamin_d_mcg = 0, vitamin_e_mg = 0.02, vitamin_k_mcg = 33,
  vitamin_b1_mg = 0.39, vitamin_b2_mg = 0.18, vitamin_b3_mg = 1.46, vitamin_b6_mg = 0.62, vitamin_b12_mcg = 0,
  folate_mcg = 625, calcium_mg = 347, iron_mg = 8.86, magnesium_mg = 192, phosphorus_mg = 557,
  potassium_mg = 1797, sodium_mg = 30, zinc_mg = 4.89, copper_mg = 1.11, manganese_mg = 2.61, selenium_mcg = 8.2
WHERE ingredient_name = 'Peanuts';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 25.63, vitamin_k_mcg = 7.4,
  vitamin_b1_mg = 0.21, vitamin_b2_mg = 1.14, vitamin_b3_mg = 3.62, vitamin_b6_mg = 0.14, vitamin_b12_mcg = 0,
  folate_mcg = 44, calcium_mg = 269, iron_mg = 3.71, magnesium_mg = 270, phosphorus_mg = 481,
  potassium_mg = 733, sodium_mg = 1, zinc_mg = 3.12, copper_mg = 1.03, manganese_mg = 2.18, selenium_mcg = 25.2
WHERE ingredient_name = 'Almonds';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 1, vitamin_c_mg = 1, vitamin_d_mcg = 0, vitamin_e_mg = 0.7, vitamin_k_mcg = 2.7,
  vitamin_b1_mg = 0.64, vitamin_b2_mg = 0.06, vitamin_b3_mg = 1.17, vitamin_b6_mg = 0.54, vitamin_b12_mcg = 0,
  folate_mcg = 98, calcium_mg = 168, iron_mg = 6.68, magnesium_mg = 158, phosphorus_mg = 376,
  potassium_mg = 660, sodium_mg = 12, zinc_mg = 4.58, copper_mg = 1.3, manganese_mg = 1.67, selenium_mcg = 19.9
WHERE ingredient_name = 'Cashews';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 2, vitamin_c_mg = 1.4, vitamin_d_mcg = 0, vitamin_e_mg = 0.26, vitamin_k_mcg = 2.7,
  vitamin_b1_mg = 0.67, vitamin_b2_mg = 0.16, vitamin_b3_mg = 1.06, vitamin_b6_mg = 0.56, vitamin_b12_mcg = 0,
  folate_mcg = 57, calcium_mg = 62, iron_mg = 2.91, magnesium_mg = 121, phosphorus_mg = 168,
  potassium_mg = 441, sodium_mg = 2, zinc_mg = 2.2, copper_mg = 1.74, manganese_mg = 3.41, selenium_mcg = 3.8
WHERE ingredient_name = 'Walnuts';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 1, vitamin_c_mg = 0.7, vitamin_d_mcg = 0, vitamin_e_mg = 2.32, vitamin_k_mcg = 3.5,
  vitamin_b1_mg = 0.64, vitamin_b2_mg = 0.18, vitamin_b3_mg = 1.13, vitamin_b6_mg = 1.7, vitamin_b12_mcg = 0,
  folate_mcg = 51, calcium_mg = 61, iron_mg = 1.87, magnesium_mg = 92, phosphorus_mg = 490,
  potassium_mg = 718, sodium_mg = 1, zinc_mg = 2.92, copper_mg = 1.32, manganese_mg = 4.98, selenium_mcg = 4.1
WHERE ingredient_name = 'Pistachios';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 7.27, vitamin_k_mcg = 4,
  vitamin_b1_mg = 0.06, vitamin_b2_mg = 0.11, vitamin_b3_mg = 0.42, vitamin_b6_mg = 0.09, vitamin_b12_mcg = 0,
  folate_mcg = 25, calcium_mg = 16, iron_mg = 2.38, magnesium_mg = 292, phosphorus_mg = 593,
  potassium_mg = 346, sodium_mg = 9, zinc_mg = 4.53, copper_mg = 1.5, manganese_mg = 1.95, selenium_mcg = 25.4
WHERE ingredient_name = 'Pumpkin Seeds';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 1, vitamin_c_mg = 0.6, vitamin_d_mcg = 0, vitamin_e_mg = 0.25, vitamin_k_mcg = 0.4,
  vitamin_b1_mg = 1.64, vitamin_b2_mg = 0.25, vitamin_b3_mg = 8.33, vitamin_b6_mg = 0.6, vitamin_b12_mcg = 0,
  folate_mcg = 115, calcium_mg = 975, iron_mg = 14.55, magnesium_mg = 351, phosphorus_mg = 629,
  potassium_mg = 426, sodium_mg = 11, zinc_mg = 7.75, copper_mg = 1.59, manganese_mg = 2.46, selenium_mcg = 5.6
WHERE ingredient_name = 'Sesame Seeds';
-- Migration: Add micronutrients for batch 5 (Spices, Oils & Misc - 25 items)
-- Items: Turmeric, Cumin, Coriander, Oils, Coconut, Jaggery, etc.

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 25.9, vitamin_d_mcg = 0, vitamin_e_mg = 3.1, vitamin_k_mcg = 13.4,
  vitamin_b1_mg = 0.15, vitamin_b2_mg = 0.23, vitamin_b3_mg = 5.14, vitamin_b6_mg = 1.8, vitamin_b12_mcg = 0,
  folate_mcg = 39, calcium_mg = 183, iron_mg = 41.42, magnesium_mg = 193, phosphorus_mg = 268,
  potassium_mg = 2525, sodium_mg = 38, zinc_mg = 4.35, copper_mg = 0.6, manganese_mg = 7.83, selenium_mcg = 4.5
WHERE ingredient_name = 'Turmeric Powder';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 127, vitamin_c_mg = 7.7, vitamin_d_mcg = 0, vitamin_e_mg = 3.33, vitamin_k_mcg = 5.4,
  vitamin_b1_mg = 0.63, vitamin_b2_mg = 0.33, vitamin_b3_mg = 4.58, vitamin_b6_mg = 0.44, vitamin_b12_mcg = 0,
  folate_mcg = 10, calcium_mg = 931, iron_mg = 66.36, magnesium_mg = 366, phosphorus_mg = 499,
  potassium_mg = 1788, sodium_mg = 168, zinc_mg = 4.8, copper_mg = 0.87, manganese_mg = 3.33, selenium_mcg = 5.2
WHERE ingredient_name = 'Cumin Seeds';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 21, vitamin_d_mcg = 0, vitamin_e_mg = 2.5, vitamin_k_mcg = 310,
  vitamin_b1_mg = 0.24, vitamin_b2_mg = 0.29, vitamin_b3_mg = 2.13, vitamin_b6_mg = 0.47, vitamin_b12_mcg = 0,
  folate_mcg = 12, calcium_mg = 709, iron_mg = 16.32, magnesium_mg = 330, phosphorus_mg = 409,
  potassium_mg = 1267, sodium_mg = 35, zinc_mg = 4.7, copper_mg = 0.98, manganese_mg = 1.9, selenium_mcg = 26.9
WHERE ingredient_name = 'Coriander Powder';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 310, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 25, vitamin_k_mcg = 163,
  vitamin_b1_mg = 0.2, vitamin_b2_mg = 0.18, vitamin_b3_mg = 1.06, vitamin_b6_mg = 1.74, vitamin_b12_mcg = 0,
  folate_mcg = 58, calcium_mg = 1652, iron_mg = 37.8, magnesium_mg = 254, phosphorus_mg = 370,
  potassium_mg = 1119, sodium_mg = 80, zinc_mg = 4.72, copper_mg = 0.55, manganese_mg = 17.02, selenium_mcg = 4.4
WHERE ingredient_name = 'Fenugreek Leaves';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 416, vitamin_c_mg = 21.7, vitamin_d_mcg = 0, vitamin_e_mg = 1.69, vitamin_k_mcg = 1.7,
  vitamin_b1_mg = 0.11, vitamin_b2_mg = 0.29, vitamin_b3_mg = 2.86, vitamin_b6_mg = 0.29, vitamin_b12_mcg = 0,
  folate_mcg = 24, calcium_mg = 1346, iron_mg = 28.86, magnesium_mg = 171, phosphorus_mg = 178,
  potassium_mg = 1564, sodium_mg = 80, zinc_mg = 3.02, copper_mg = 0.83, manganese_mg = 8.38, selenium_mcg = 4.4
WHERE ingredient_name = 'Cumin Seeds';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 1.04, vitamin_k_mcg = 0.5,
  vitamin_b1_mg = 0.05, vitamin_b2_mg = 0.24, vitamin_b3_mg = 1.46, vitamin_b6_mg = 0.16, vitamin_b12_mcg = 0,
  folate_mcg = 16, calcium_mg = 443, iron_mg = 11.7, magnesium_mg = 135, phosphorus_mg = 173,
  potassium_mg = 813, sodium_mg = 20, zinc_mg = 2.79, copper_mg = 0.83, manganese_mg = 9.24, selenium_mcg = 4.4
WHERE ingredient_name = 'Cumin Seeds';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 524, vitamin_c_mg = 7.8, vitamin_d_mcg = 0, vitamin_e_mg = 2.69, vitamin_k_mcg = 80.3,
  vitamin_b1_mg = 0.11, vitamin_b2_mg = 0.14, vitamin_b3_mg = 1.39, vitamin_b6_mg = 0.28, vitamin_b12_mcg = 0,
  folate_mcg = 10, calcium_mg = 1059, iron_mg = 17.47, magnesium_mg = 60, phosphorus_mg = 46,
  potassium_mg = 1119, sodium_mg = 277, zinc_mg = 2.21, copper_mg = 0.34, manganese_mg = 0.48, selenium_mcg = 4.4
WHERE ingredient_name = 'Green Chili';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 0.18, vitamin_k_mcg = 2.8,
  vitamin_b1_mg = 0.01, vitamin_b2_mg = 0.01, vitamin_b3_mg = 0.06, vitamin_b6_mg = 0.01, vitamin_b12_mcg = 0,
  folate_mcg = 1, calcium_mg = 26, iron_mg = 0.88, magnesium_mg = 3, phosphorus_mg = 3,
  potassium_mg = 28, sodium_mg = 2, zinc_mg = 0.09, copper_mg = 0.02, manganese_mg = 0.26, selenium_mcg = 0.6
WHERE ingredient_name = 'Turmeric Powder';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0.2, vitamin_d_mcg = 0, vitamin_e_mg = 2.19, vitamin_k_mcg = 10.5,
  vitamin_b1_mg = 0.02, vitamin_b2_mg = 0.22, vitamin_b3_mg = 0.64, vitamin_b6_mg = 0.39, vitamin_b12_mcg = 0,
  folate_mcg = 5, calcium_mg = 1017, iron_mg = 11.09, magnesium_mg = 264, phosphorus_mg = 61,
  potassium_mg = 431, sodium_mg = 10, zinc_mg = 1.16, copper_mg = 0.34, manganese_mg = 17.46, selenium_mcg = 4.7
WHERE ingredient_name = 'Turmeric Powder';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 30, vitamin_c_mg = 0.6, vitamin_d_mcg = 0, vitamin_e_mg = 0.19, vitamin_k_mcg = 25,
  vitamin_b1_mg = 0.34, vitamin_b2_mg = 0.13, vitamin_b3_mg = 2.65, vitamin_b6_mg = 0.39, vitamin_b12_mcg = 0,
  folate_mcg = 25, calcium_mg = 646, iron_mg = 11.33, magnesium_mg = 260, phosphorus_mg = 440,
  potassium_mg = 1102, sodium_mg = 277, zinc_mg = 3.64, copper_mg = 0.47, manganese_mg = 60, selenium_mcg = 55.8
WHERE ingredient_name = 'Turmeric Powder';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 15, vitamin_c_mg = 2.4, vitamin_d_mcg = 0, vitamin_e_mg = 1.99, vitamin_k_mcg = 13.9,
  vitamin_b1_mg = 0.06, vitamin_b2_mg = 0.18, vitamin_b3_mg = 1.3, vitamin_b6_mg = 0.23, vitamin_b12_mcg = 0,
  folate_mcg = 10, calcium_mg = 689, iron_mg = 16.59, magnesium_mg = 270, phosphorus_mg = 113,
  potassium_mg = 1170, sodium_mg = 179, zinc_mg = 2.71, copper_mg = 0.55, manganese_mg = 3.67, selenium_mcg = 4.4
WHERE ingredient_name = 'Ginger';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 5, vitamin_d_mcg = 0, vitamin_e_mg = 0.26, vitamin_k_mcg = 0.1,
  vitamin_b1_mg = 0.025, vitamin_b2_mg = 0.034, vitamin_b3_mg = 0.75, vitamin_b6_mg = 0.16, vitamin_b12_mcg = 0,
  folate_mcg = 11, calcium_mg = 16, iron_mg = 0.6, magnesium_mg = 43, phosphorus_mg = 34,
  potassium_mg = 415, sodium_mg = 13, zinc_mg = 0.34, copper_mg = 0.23, manganese_mg = 0.23, selenium_mcg = 0.7
WHERE ingredient_name = 'Ginger';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 31.2, vitamin_d_mcg = 0, vitamin_e_mg = 0.18, vitamin_k_mcg = 1.7,
  vitamin_b1_mg = 0.25, vitamin_b2_mg = 0.09, vitamin_b3_mg = 0.52, vitamin_b6_mg = 1.24, vitamin_b12_mcg = 0,
  folate_mcg = 3, calcium_mg = 181, iron_mg = 1.7, magnesium_mg = 25, phosphorus_mg = 153,
  potassium_mg = 401, sodium_mg = 17, zinc_mg = 1.09, copper_mg = 0.3, manganese_mg = 1.67, selenium_mcg = 14.2
WHERE ingredient_name = 'Garlic';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 14.35, vitamin_k_mcg = 60.2,
  vitamin_b1_mg = 0, vitamin_b2_mg = 0, vitamin_b3_mg = 0, vitamin_b6_mg = 0, vitamin_b12_mcg = 0,
  folate_mcg = 0, calcium_mg = 0, iron_mg = 0.56, magnesium_mg = 0, phosphorus_mg = 0,
  potassium_mg = 0, sodium_mg = 0, zinc_mg = 0.01, copper_mg = 0, manganese_mg = 0, selenium_mcg = 0
WHERE ingredient_name = 'Olive Oil';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 15.69, vitamin_k_mcg = 24.7,
  vitamin_b1_mg = 0, vitamin_b2_mg = 0, vitamin_b3_mg = 0, vitamin_b6_mg = 0, vitamin_b12_mcg = 0,
  folate_mcg = 0, calcium_mg = 0, iron_mg = 0.07, magnesium_mg = 0, phosphorus_mg = 0,
  potassium_mg = 0, sodium_mg = 0, zinc_mg = 0.01, copper_mg = 0, manganese_mg = 0, selenium_mcg = 0
WHERE ingredient_name = 'Sunflower Oil';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 8.18, vitamin_k_mcg = 71.3,
  vitamin_b1_mg = 0, vitamin_b2_mg = 0, vitamin_b3_mg = 0, vitamin_b6_mg = 0, vitamin_b12_mcg = 0,
  folate_mcg = 0, calcium_mg = 0, iron_mg = 0.07, magnesium_mg = 0, phosphorus_mg = 0,
  potassium_mg = 0, sodium_mg = 0, zinc_mg = 0.01, copper_mg = 0, manganese_mg = 0, selenium_mcg = 0
WHERE ingredient_name = 'Vegetable Oil';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 0.26, vitamin_k_mcg = 0.5,
  vitamin_b1_mg = 0.07, vitamin_b2_mg = 0.01, vitamin_b3_mg = 0.54, vitamin_b6_mg = 0.05, vitamin_b12_mcg = 0,
  folate_mcg = 26, calcium_mg = 14, iron_mg = 2.43, magnesium_mg = 32, phosphorus_mg = 113,
  potassium_mg = 356, sodium_mg = 20, zinc_mg = 1.1, copper_mg = 0.44, manganese_mg = 1.5, selenium_mcg = 8.1
WHERE ingredient_name = 'Coconut (fresh)';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 3.3, vitamin_d_mcg = 0, vitamin_e_mg = 0.24, vitamin_k_mcg = 0.2,
  vitamin_b1_mg = 0.07, vitamin_b2_mg = 0.02, vitamin_b3_mg = 0.54, vitamin_b6_mg = 0.05, vitamin_b12_mcg = 0,
  folate_mcg = 26, calcium_mg = 14, iron_mg = 2.43, magnesium_mg = 32, phosphorus_mg = 113,
  potassium_mg = 356, sodium_mg = 20, zinc_mg = 1.1, copper_mg = 0.44, manganese_mg = 1.5, selenium_mcg = 8.1
WHERE ingredient_name = 'Coconut (fresh)';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 0.24, vitamin_k_mcg = 0.2,
  vitamin_b1_mg = 0.07, vitamin_b2_mg = 0.02, vitamin_b3_mg = 0.54, vitamin_b6_mg = 0.05, vitamin_b12_mcg = 0,
  folate_mcg = 26, calcium_mg = 14, iron_mg = 2.43, magnesium_mg = 32, phosphorus_mg = 113,
  potassium_mg = 356, sodium_mg = 20, zinc_mg = 1.1, copper_mg = 0.44, manganese_mg = 1.5, selenium_mcg = 8.1
WHERE ingredient_name = 'Coconut (fresh)';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 0.15, vitamin_k_mcg = 0.1,
  vitamin_b1_mg = 0.01, vitamin_b2_mg = 0, vitamin_b3_mg = 0.05, vitamin_b6_mg = 0.01, vitamin_b12_mcg = 0,
  folate_mcg = 0, calcium_mg = 4, iron_mg = 0.04, magnesium_mg = 1, phosphorus_mg = 1,
  potassium_mg = 6, sodium_mg = 1, zinc_mg = 0.02, copper_mg = 0.004, manganese_mg = 0.004, selenium_mcg = 0.1
WHERE ingredient_name = 'Coconut Oil';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 7.3, vitamin_d_mcg = 0, vitamin_e_mg = 0.11, vitamin_k_mcg = 0.2,
  vitamin_b1_mg = 0.01, vitamin_b2_mg = 0.04, vitamin_b3_mg = 0.2, vitamin_b6_mg = 0.04, vitamin_b12_mcg = 0,
  folate_mcg = 0, calcium_mg = 85, iron_mg = 11, magnesium_mg = 70, phosphorus_mg = 20,
  potassium_mg = 1056, sodium_mg = 30, zinc_mg = 0.3, copper_mg = 0.48, manganese_mg = 0.3, selenium_mcg = 1.4
WHERE ingredient_name = 'Jaggery';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 0, vitamin_k_mcg = 0,
  vitamin_b1_mg = 0.01, vitamin_b2_mg = 0.02, vitamin_b3_mg = 0.08, vitamin_b6_mg = 0, vitamin_b12_mcg = 0,
  folate_mcg = 0, calcium_mg = 83, iron_mg = 1.91, magnesium_mg = 29, phosphorus_mg = 22,
  potassium_mg = 346, sodium_mg = 39, zinc_mg = 0.18, copper_mg = 0.3, manganese_mg = 0.22, selenium_mcg = 1.2
WHERE ingredient_name = 'Sugar (white)';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 0, vitamin_k_mcg = 0,
  vitamin_b1_mg = 0, vitamin_b2_mg = 0.02, vitamin_b3_mg = 0, vitamin_b6_mg = 0, vitamin_b12_mcg = 0,
  folate_mcg = 0, calcium_mg = 1, iron_mg = 0.01, magnesium_mg = 0, phosphorus_mg = 0,
  potassium_mg = 2, sodium_mg = 1, zinc_mg = 0.01, copper_mg = 0.01, manganese_mg = 0, selenium_mcg = 0.6
WHERE ingredient_name = 'Sugar (white)';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 0, vitamin_k_mcg = 0,
  vitamin_b1_mg = 0, vitamin_b2_mg = 0, vitamin_b3_mg = 0, vitamin_b6_mg = 0, vitamin_b12_mcg = 0,
  folate_mcg = 0, calcium_mg = 0, iron_mg = 0.01, magnesium_mg = 1, phosphorus_mg = 4,
  potassium_mg = 13, sodium_mg = 11, zinc_mg = 0.01, copper_mg = 0.01, manganese_mg = 0.01, selenium_mcg = 0.6
WHERE ingredient_name = 'Honey';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 0, vitamin_k_mcg = 0,
  vitamin_b1_mg = 0, vitamin_b2_mg = 0, vitamin_b3_mg = 0, vitamin_b6_mg = 0, vitamin_b12_mcg = 0,
  folate_mcg = 0, calcium_mg = 0, iron_mg = 0.01, magnesium_mg = 0, phosphorus_mg = 0,
  potassium_mg = 2, sodium_mg = 38, zinc_mg = 0, copper_mg = 0, manganese_mg = 0, selenium_mcg = 0.1
WHERE ingredient_name = 'Salt';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 0, vitamin_k_mcg = 0,
  vitamin_b1_mg = 0, vitamin_b2_mg = 0.01, vitamin_b3_mg = 0, vitamin_b6_mg = 0, vitamin_b12_mcg = 0,
  folate_mcg = 0, calcium_mg = 1, iron_mg = 0.02, magnesium_mg = 1, phosphorus_mg = 4,
  potassium_mg = 12, sodium_mg = 6, zinc_mg = 0.01, copper_mg = 0.01, manganese_mg = 0.01, selenium_mcg = 0.6
WHERE ingredient_name = 'Vinegar';
-- Migration: Add micronutrients for batch 6 (Missing Items - 30+ items)
-- Items that were not included in batches 1-5

-- GRAINS & BREADS
UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 0.4, vitamin_k_mcg = 3.5,
  vitamin_b1_mg = 0.17, vitamin_b2_mg = 0.1, vitamin_b3_mg = 3.6, vitamin_b6_mg = 0.15, vitamin_b12_mcg = 0,
  folate_mcg = 44, calcium_mg = 59, iron_mg = 2.5, magnesium_mg = 75, phosphorus_mg = 188,
  potassium_mg = 230, sodium_mg = 447, zinc_mg = 1.8, copper_mg = 0.25, manganese_mg = 1.8, selenium_mcg = 28
WHERE ingredient_name = 'Roti/Chapati';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 0.4, vitamin_k_mcg = 3.5,
  vitamin_b1_mg = 0.17, vitamin_b2_mg = 0.1, vitamin_b3_mg = 3.6, vitamin_b6_mg = 0.15, vitamin_b12_mcg = 0,
  folate_mcg = 44, calcium_mg = 120, iron_mg = 2.5, magnesium_mg = 75, phosphorus_mg = 188,
  potassium_mg = 230, sodium_mg = 500, zinc_mg = 1.8, copper_mg = 0.25, manganese_mg = 1.8, selenium_mcg = 28
WHERE ingredient_name = 'Naan';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 0.11, vitamin_k_mcg = 0.1,
  vitamin_b1_mg = 0.09, vitamin_b2_mg = 0.03, vitamin_b3_mg = 1.7, vitamin_b6_mg = 0.14, vitamin_b12_mcg = 0,
  folate_mcg = 18, calcium_mg = 7, iron_mg = 1.3, magnesium_mg = 18, phosphorus_mg = 58,
  potassium_mg = 44, sodium_mg = 1, zinc_mg = 0.51, copper_mg = 0.1, manganese_mg = 0.32, selenium_mcg = 26.4
WHERE ingredient_name = 'Pasta (cooked)';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 0.13, vitamin_k_mcg = 0.1,
  vitamin_b1_mg = 0.06, vitamin_b2_mg = 0.03, vitamin_b3_mg = 0.98, vitamin_b6_mg = 0.05, vitamin_b12_mcg = 0,
  folate_mcg = 15, calcium_mg = 8, iron_mg = 0.38, magnesium_mg = 8, phosphorus_mg = 22,
  potassium_mg = 58, sodium_mg = 5, zinc_mg = 0.26, copper_mg = 0.04, manganese_mg = 0.08, selenium_mcg = 27.5
WHERE ingredient_name = 'Couscous (cooked)';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 0.11, vitamin_k_mcg = 0.1,
  vitamin_b1_mg = 0.07, vitamin_b2_mg = 0.015, vitamin_b3_mg = 1.6, vitamin_b6_mg = 0.16, vitamin_b12_mcg = 0,
  folate_mcg = 8, calcium_mg = 28, iron_mg = 0.8, magnesium_mg = 25, phosphorus_mg = 115,
  potassium_mg = 115, sodium_mg = 5, zinc_mg = 1.09, copper_mg = 0.22, manganese_mg = 1.09, selenium_mcg = 15.1
WHERE ingredient_name = 'Poha';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 0.08, vitamin_k_mcg = 1.9,
  vitamin_b1_mg = 0.23, vitamin_b2_mg = 0.06, vitamin_b3_mg = 3.09, vitamin_b6_mg = 0.18, vitamin_b12_mcg = 0,
  folate_mcg = 23, calcium_mg = 17, iron_mg = 1.88, magnesium_mg = 75, phosphorus_mg = 172,
  potassium_mg = 216, sodium_mg = 1, zinc_mg = 1.59, copper_mg = 0.21, manganese_mg = 2.37, selenium_mcg = 17.2
WHERE ingredient_name = 'Upma';

-- VEGETABLES
UPDATE nutrition_reference SET
  vitamin_a_mcg = 9990, vitamin_c_mg = 120, vitamin_d_mcg = 0, vitamin_e_mg = 1.54, vitamin_k_mcg = 704.8,
  vitamin_b1_mg = 0.11, vitamin_b2_mg = 0.13, vitamin_b3_mg = 1, vitamin_b6_mg = 0.27, vitamin_b12_mcg = 0,
  folate_mcg = 141, calcium_mg = 150, iron_mg = 1.47, magnesium_mg = 47, phosphorus_mg = 92,
  potassium_mg = 491, sodium_mg = 38, zinc_mg = 0.56, copper_mg = 0.29, manganese_mg = 0.66, selenium_mcg = 0.9
WHERE ingredient_name = 'Kale';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 370, vitamin_c_mg = 9.2, vitamin_d_mcg = 0, vitamin_e_mg = 0.22, vitamin_k_mcg = 126.3,
  vitamin_b1_mg = 0.07, vitamin_b2_mg = 0.08, vitamin_b3_mg = 0.38, vitamin_b6_mg = 0.09, vitamin_b12_mcg = 0,
  folate_mcg = 38, calcium_mg = 36, iron_mg = 0.86, magnesium_mg = 13, phosphorus_mg = 29,
  potassium_mg = 194, sodium_mg = 28, zinc_mg = 0.18, copper_mg = 0.03, manganese_mg = 0.25, selenium_mcg = 0.6
WHERE ingredient_name = 'Lettuce';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 14187, vitamin_c_mg = 2.4, vitamin_d_mcg = 0, vitamin_e_mg = 0.26, vitamin_k_mcg = 1.8,
  vitamin_b1_mg = 0.08, vitamin_b2_mg = 0.06, vitamin_b3_mg = 0.56, vitamin_b6_mg = 0.21, vitamin_b12_mcg = 0,
  folate_mcg = 11, calcium_mg = 30, iron_mg = 0.61, magnesium_mg = 25, phosphorus_mg = 47,
  potassium_mg = 337, sodium_mg = 55, zinc_mg = 0.3, copper_mg = 0.15, manganese_mg = 0.26, selenium_mcg = 0.6
WHERE ingredient_name = 'Sweet Potato';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 426, vitamin_c_mg = 9, vitamin_d_mcg = 0, vitamin_e_mg = 1.06, vitamin_k_mcg = 1.1,
  vitamin_b1_mg = 0.05, vitamin_b2_mg = 0.11, vitamin_b3_mg = 0.6, vitamin_b6_mg = 0.06, vitamin_b12_mcg = 0,
  folate_mcg = 16, calcium_mg = 21, iron_mg = 0.8, magnesium_mg = 12, phosphorus_mg = 44,
  potassium_mg = 340, sodium_mg = 1, zinc_mg = 0.32, copper_mg = 0.13, manganese_mg = 0.13, selenium_mcg = 0.3
WHERE ingredient_name = 'Pumpkin';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 187, vitamin_c_mg = 6.8, vitamin_d_mcg = 0, vitamin_e_mg = 0.07, vitamin_k_mcg = 0.3,
  vitamin_b1_mg = 0.16, vitamin_b2_mg = 0.06, vitamin_b3_mg = 1.77, vitamin_b6_mg = 0.09, vitamin_b12_mcg = 0,
  folate_mcg = 42, calcium_mg = 2, iron_mg = 0.52, magnesium_mg = 37, phosphorus_mg = 89,
  potassium_mg = 270, sodium_mg = 15, zinc_mg = 0.46, copper_mg = 0.05, manganese_mg = 0.16, selenium_mcg = 0.6
WHERE ingredient_name = 'Corn';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 38, vitamin_c_mg = 14.2, vitamin_d_mcg = 0, vitamin_e_mg = 0.41, vitamin_k_mcg = 14.5,
  vitamin_b1_mg = 0.08, vitamin_b2_mg = 0.11, vitamin_b3_mg = 0.73, vitamin_b6_mg = 0.14, vitamin_b12_mcg = 0,
  folate_mcg = 63, calcium_mg = 25, iron_mg = 1.47, magnesium_mg = 33, phosphorus_mg = 108,
  potassium_mg = 244, sodium_mg = 5, zinc_mg = 1.24, copper_mg = 0.07, manganese_mg = 0.21, selenium_mcg = 0.6
WHERE ingredient_name = 'Green Peas';

-- FRUITS
UPDATE nutrition_reference SET
  vitamin_a_mcg = 12, vitamin_c_mg = 58.8, vitamin_d_mcg = 0, vitamin_e_mg = 0.29, vitamin_k_mcg = 2.2,
  vitamin_b1_mg = 0.024, vitamin_b2_mg = 0.022, vitamin_b3_mg = 0.39, vitamin_b6_mg = 0.047, vitamin_b12_mcg = 0,
  folate_mcg = 24, calcium_mg = 16, iron_mg = 0.41, magnesium_mg = 13, phosphorus_mg = 24,
  potassium_mg = 153, sodium_mg = 1, zinc_mg = 0.14, copper_mg = 0.05, manganese_mg = 0.39, selenium_mcg = 0.4
WHERE ingredient_name = 'Strawberry';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 146, vitamin_c_mg = 10, vitamin_d_mcg = 0, vitamin_e_mg = 2.07, vitamin_k_mcg = 21,
  vitamin_b1_mg = 0.07, vitamin_b2_mg = 0.13, vitamin_b3_mg = 1.74, vitamin_b6_mg = 0.26, vitamin_b12_mcg = 0,
  folate_mcg = 81, calcium_mg = 12, iron_mg = 0.55, magnesium_mg = 29, phosphorus_mg = 52,
  potassium_mg = 485, sodium_mg = 7, zinc_mg = 0.64, copper_mg = 0.19, manganese_mg = 0.14, selenium_mcg = 0.4
WHERE ingredient_name = 'Avocado';

-- SEEDS
UPDATE nutrition_reference SET
  vitamin_a_mcg = 54, vitamin_c_mg = 1.6, vitamin_d_mcg = 0, vitamin_e_mg = 0.5, vitamin_k_mcg = 0.5,
  vitamin_b1_mg = 0.62, vitamin_b2_mg = 0.17, vitamin_b3_mg = 8.83, vitamin_b6_mg = 0.35, vitamin_b12_mcg = 0,
  folate_mcg = 49, calcium_mg = 631, iron_mg = 7.72, magnesium_mg = 335, phosphorus_mg = 860,
  potassium_mg = 407, sodium_mg = 16, zinc_mg = 4.58, copper_mg = 0.92, manganese_mg = 2.72, selenium_mcg = 55.2
WHERE ingredient_name = 'Chia Seeds';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0.6, vitamin_d_mcg = 0, vitamin_e_mg = 0.31, vitamin_k_mcg = 4.3,
  vitamin_b1_mg = 1.64, vitamin_b2_mg = 0.16, vitamin_b3_mg = 3.08, vitamin_b6_mg = 0.47, vitamin_b12_mcg = 0,
  folate_mcg = 87, calcium_mg = 255, iron_mg = 5.73, magnesium_mg = 392, phosphorus_mg = 642,
  potassium_mg = 813, sodium_mg = 30, zinc_mg = 4.34, copper_mg = 1.22, manganese_mg = 2.48, selenium_mcg = 25.4
WHERE ingredient_name = 'Flax Seeds';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 50, vitamin_c_mg = 1.4, vitamin_d_mcg = 0, vitamin_e_mg = 35.17, vitamin_k_mcg = 0.5,
  vitamin_b1_mg = 1.48, vitamin_b2_mg = 0.36, vitamin_b3_mg = 8.34, vitamin_b6_mg = 1.35, vitamin_b12_mcg = 0,
  folate_mcg = 227, calcium_mg = 78, iron_mg = 5.25, magnesium_mg = 325, phosphorus_mg = 660,
  potassium_mg = 645, sodium_mg = 9, zinc_mg = 5, copper_mg = 1.8, manganese_mg = 1.95, selenium_mcg = 53
WHERE ingredient_name = 'Sunflower Seeds';

-- OILS
UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 8.18, vitamin_k_mcg = 71.3,
  vitamin_b1_mg = 0, vitamin_b2_mg = 0, vitamin_b3_mg = 0, vitamin_b6_mg = 0, vitamin_b12_mcg = 0,
  folate_mcg = 0, calcium_mg = 0, iron_mg = 0.07, magnesium_mg = 0, phosphorus_mg = 0,
  potassium_mg = 0, sodium_mg = 0, zinc_mg = 0.01, copper_mg = 0, manganese_mg = 0, selenium_mcg = 0
WHERE ingredient_name = 'Mustard Oil';

-- CONDIMENTS
UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 0.02, vitamin_k_mcg = 0,
  vitamin_b1_mg = 0.01, vitamin_b2_mg = 0.15, vitamin_b3_mg = 1.52, vitamin_b6_mg = 0.15, vitamin_b12_mcg = 0,
  folate_mcg = 18, calcium_mg = 20, iron_mg = 2.15, magnesium_mg = 60, phosphorus_mg = 130,
  potassium_mg = 217, sodium_mg = 5586, zinc_mg = 0.52, copper_mg = 0.11, manganese_mg = 0.42, selenium_mcg = 0.9
WHERE ingredient_name = 'Soy Sauce';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 101, vitamin_c_mg = 4.1, vitamin_d_mcg = 0, vitamin_e_mg = 1.46, vitamin_k_mcg = 2.8,
  vitamin_b1_mg = 0.02, vitamin_b2_mg = 0.04, vitamin_b3_mg = 0.87, vitamin_b6_mg = 0.15, vitamin_b12_mcg = 0,
  folate_mcg = 9, calcium_mg = 11, iron_mg = 0.4, magnesium_mg = 13, phosphorus_mg = 19,
  potassium_mg = 281, sodium_mg = 907, zinc_mg = 0.2, copper_mg = 0.08, manganese_mg = 0.11, selenium_mcg = 0.4
WHERE ingredient_name = 'Tomato Ketchup';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 60, vitamin_c_mg = 0, vitamin_d_mcg = 0.4, vitamin_e_mg = 3.55, vitamin_k_mcg = 4.1,
  vitamin_b1_mg = 0.01, vitamin_b2_mg = 0.03, vitamin_b3_mg = 0.08, vitamin_b6_mg = 0.03, vitamin_b12_mcg = 0.3,
  folate_mcg = 9, calcium_mg = 19, iron_mg = 0.36, magnesium_mg = 2, phosphorus_mg = 24,
  potassium_mg = 37, sodium_mg = 597, zinc_mg = 0.16, copper_mg = 0.01, manganese_mg = 0.01, selenium_mcg = 0.6
WHERE ingredient_name = 'Mayonnaise';

-- PROTEINS - FISH
UPDATE nutrition_reference SET
  vitamin_a_mcg = 18, vitamin_c_mg = 0, vitamin_d_mcg = 0.5, vitamin_e_mg = 0.87, vitamin_k_mcg = 0.1,
  vitamin_b1_mg = 0.04, vitamin_b2_mg = 0.07, vitamin_b3_mg = 5.8, vitamin_b6_mg = 0.16, vitamin_b12_mcg = 1.8,
  folate_mcg = 5, calcium_mg = 10, iron_mg = 0.3, magnesium_mg = 29, phosphorus_mg = 203,
  potassium_mg = 417, sodium_mg = 54, zinc_mg = 0.37, copper_mg = 0.04, manganese_mg = 0.015, selenium_mcg = 36.5
WHERE ingredient_name = 'Fish (Rohu)';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 18, vitamin_c_mg = 0, vitamin_d_mcg = 0.5, vitamin_e_mg = 0.87, vitamin_k_mcg = 0.1,
  vitamin_b1_mg = 0.04, vitamin_b2_mg = 0.07, vitamin_b3_mg = 5.8, vitamin_b6_mg = 0.16, vitamin_b12_mcg = 1.8,
  folate_mcg = 5, calcium_mg = 10, iron_mg = 0.3, magnesium_mg = 29, phosphorus_mg = 203,
  potassium_mg = 417, sodium_mg = 54, zinc_mg = 0.37, copper_mg = 0.04, manganese_mg = 0.015, selenium_mcg = 36.5
WHERE ingredient_name = 'Fish (Pomfret)';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 54, vitamin_c_mg = 1.2, vitamin_d_mcg = 1.1, vitamin_e_mg = 0.7, vitamin_k_mcg = 0.1,
  vitamin_b1_mg = 0.08, vitamin_b2_mg = 0.11, vitamin_b3_mg = 3.54, vitamin_b6_mg = 0.17, vitamin_b12_mcg = 4.8,
  folate_mcg = 5, calcium_mg = 13, iron_mg = 0.8, magnesium_mg = 29, phosphorus_mg = 204,
  potassium_mg = 363, sodium_mg = 74, zinc_mg = 0.64, copper_mg = 0.055, manganese_mg = 0.016, selenium_mcg = 36.5
WHERE ingredient_name = 'Fish (Hilsa)';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 54, vitamin_c_mg = 1.2, vitamin_d_mcg = 1.1, vitamin_e_mg = 0.7, vitamin_k_mcg = 0.1,
  vitamin_b1_mg = 0.08, vitamin_b2_mg = 0.11, vitamin_b3_mg = 3.54, vitamin_b6_mg = 0.17, vitamin_b12_mcg = 4.8,
  folate_mcg = 5, calcium_mg = 13, iron_mg = 0.8, magnesium_mg = 29, phosphorus_mg = 204,
  potassium_mg = 363, sodium_mg = 74, zinc_mg = 0.64, copper_mg = 0.055, manganese_mg = 0.016, selenium_mcg = 36.5
WHERE ingredient_name = 'Mackerel';

-- PROTEINS - MEAT
UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0.1, vitamin_e_mg = 0.14, vitamin_k_mcg = 3.7,
  vitamin_b1_mg = 0.09, vitamin_b2_mg = 0.25, vitamin_b3_mg = 6.66, vitamin_b6_mg = 0.13, vitamin_b12_mcg = 2.64,
  folate_mcg = 5, calcium_mg = 9, iron_mg = 1.88, magnesium_mg = 22, phosphorus_mg = 188,
  potassium_mg = 310, sodium_mg = 72, zinc_mg = 4.46, copper_mg = 0.11, manganese_mg = 0.01, selenium_mcg = 26.4
WHERE ingredient_name = 'Mutton (cooked)';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0.1, vitamin_e_mg = 0.18, vitamin_k_mcg = 1.6,
  vitamin_b1_mg = 0.05, vitamin_b2_mg = 0.18, vitamin_b3_mg = 6.15, vitamin_b6_mg = 0.54, vitamin_b12_mcg = 2.64,
  folate_mcg = 9, calcium_mg = 18, iron_mg = 2.6, magnesium_mg = 21, phosphorus_mg = 175,
  potassium_mg = 318, sodium_mg = 72, zinc_mg = 6.31, copper_mg = 0.08, manganese_mg = 0.01, selenium_mcg = 26.4
WHERE ingredient_name = 'Beef (lean, cooked)';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 2, vitamin_c_mg = 0.7, vitamin_d_mcg = 0.5, vitamin_e_mg = 0.28, vitamin_k_mcg = 1.1,
  vitamin_b1_mg = 0.68, vitamin_b2_mg = 0.32, vitamin_b3_mg = 5.37, vitamin_b6_mg = 0.46, vitamin_b12_mcg = 0.7,
  folate_mcg = 5, calcium_mg = 23, iron_mg = 0.87, magnesium_mg = 28, phosphorus_mg = 246,
  potassium_mg = 423, sodium_mg = 62, zinc_mg = 2.39, copper_mg = 0.08, manganese_mg = 0.01, selenium_mcg = 42.5
WHERE ingredient_name = 'Pork (lean, cooked)';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0.1, vitamin_e_mg = 0.05, vitamin_k_mcg = 0.3,
  vitamin_b1_mg = 0.05, vitamin_b2_mg = 0.11, vitamin_b3_mg = 6.37, vitamin_b6_mg = 0.53, vitamin_b12_mcg = 0.37,
  folate_mcg = 6, calcium_mg = 11, iron_mg = 1.43, magnesium_mg = 27, phosphorus_mg = 212,
  potassium_mg = 249, sodium_mg = 55, zinc_mg = 1.7, copper_mg = 0.06, manganese_mg = 0.02, selenium_mcg = 30.2
WHERE ingredient_name = 'Turkey Breast';

-- DAIRY
UPDATE nutrition_reference SET
  vitamin_a_mcg = 5, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 0.01, vitamin_k_mcg = 0.2,
  vitamin_b1_mg = 0.04, vitamin_b2_mg = 0.23, vitamin_b3_mg = 0.19, vitamin_b6_mg = 0.05, vitamin_b12_mcg = 0.75,
  folate_mcg = 7, calcium_mg = 100, iron_mg = 0, magnesium_mg = 11, phosphorus_mg = 135,
  potassium_mg = 141, sodium_mg = 36, zinc_mg = 0.52, copper_mg = 0.009, manganese_mg = 0.004, selenium_mcg = 9.7
WHERE ingredient_name = 'Greek Yogurt';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 37, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 0.08, vitamin_k_mcg = 0.3,
  vitamin_b1_mg = 0.03, vitamin_b2_mg = 0.16, vitamin_b3_mg = 0.09, vitamin_b6_mg = 0.04, vitamin_b12_mcg = 0.43,
  folate_mcg = 12, calcium_mg = 83, iron_mg = 0.07, magnesium_mg = 8, phosphorus_mg = 159,
  potassium_mg = 104, sodium_mg = 406, zinc_mg = 0.38, copper_mg = 0.03, manganese_mg = 0.01, selenium_mcg = 9.7
WHERE ingredient_name = 'Cottage Cheese';

-- PLANT PROTEINS
UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 0.01, vitamin_k_mcg = 24.7,
  vitamin_b1_mg = 0.08, vitamin_b2_mg = 0.36, vitamin_b3_mg = 2.64, vitamin_b6_mg = 0.22, vitamin_b12_mcg = 0,
  folate_mcg = 24, calcium_mg = 111, iron_mg = 2.7, magnesium_mg = 81, phosphorus_mg = 266,
  potassium_mg = 412, sodium_mg = 9, zinc_mg = 1.14, copper_mg = 0.57, manganese_mg = 1.3, selenium_mcg = 0
WHERE ingredient_name = 'Tempeh';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 67, vitamin_c_mg = 4, vitamin_d_mcg = 0, vitamin_e_mg = 0.82, vitamin_k_mcg = 9,
  vitamin_b1_mg = 0.48, vitamin_b2_mg = 0.21, vitamin_b3_mg = 1.54, vitamin_b6_mg = 0.54, vitamin_b12_mcg = 0,
  folate_mcg = 557, calcium_mg = 105, iron_mg = 6.24, magnesium_mg = 115, phosphorus_mg = 252,
  potassium_mg = 875, sodium_mg = 24, zinc_mg = 3.43, copper_mg = 0.66, manganese_mg = 2.2, selenium_mcg = 28.5
WHERE ingredient_name = 'Black Chickpeas';

-- ADDITIONAL MISSING ITEMS FROM INVENTORY

-- INSERT NEW VEGETABLES (don't exist in nutrition_reference yet)
INSERT INTO nutrition_reference (ingredient_name, category, calories, protein, carbs, fat, fiber, unit, local_name,
  vitamin_a_mcg, vitamin_c_mg, vitamin_d_mcg, vitamin_e_mg, vitamin_k_mcg,
  vitamin_b1_mg, vitamin_b2_mg, vitamin_b3_mg, vitamin_b6_mg, vitamin_b12_mcg,
  folate_mcg, calcium_mg, iron_mg, magnesium_mg, phosphorus_mg,
  potassium_mg, sodium_mg, zinc_mg, copper_mg, manganese_mg, selenium_mcg)
VALUES 
('Beetroot', 'Vegetable', 43, 1.6, 10, 0.2, 2.8, 'gm', 'Chukandar',
  2, 4.9, 0, 0.04, 0.2,
  0.03, 0.04, 0.33, 0.07, 0,
  109, 16, 0.8, 23, 40,
  325, 78, 0.35, 0.08, 0.34, 0.7),
('Brussels Sprouts', 'Vegetable', 43, 3.4, 9, 0.3, 3.8, 'gm', 'Brussels Sprouts',
  0, 4.7, 0, 0.13, 0.7,
  0.04, 0.05, 0.74, 0.06, 0,
  61, 48, 1.64, 25, 38,
  194, 4, 0.42, 0.16, 0.11, 0.9),
('Lemon', 'Fruit', 29, 1.1, 9, 0.3, 2.8, 'gm', 'Nimbu',
  0, 93, 0, 0.27, 29.3,
  0.04, 0.09, 0.4, 0.04, 0,
  53, 40, 0.2, 11, 24,
  138, 1, 0.13, 0.04, 0.1, 0.1),
('Parsley', 'Herb', 36, 3, 6.3, 0.8, 3.3, 'gm', 'Parsley',
  8424, 133, 0, 0.75, 1640,
  0.08, 0.21, 1.57, 0.29, 0,
  110, 138, 6.2, 50, 58,
  554, 56, 0.93, 0.23, 0.16, 0.9),
('Curry Leaves', 'Herb', 108, 6.1, 18.7, 1, 6.4, 'gm', 'Kadi Patta',
  0, 4, 0, 0.3, 0.5,
  0.09, 0.18, 0.85, 0.09, 0,
  16, 50, 0.88, 13, 25,
  139, 2, 0.27, 0.08, 0.18, 0.6),
('Chilli Flakes', 'Spice', 282, 12, 50, 13, 28, 'gm', 'Chilli Flakes',
  0, 0, 0, 0.2, 0.3,
  0.02, 0.05, 0.5, 0.05, 0,
  5, 40, 1, 20, 30,
  80, 3, 0.4, 0.08, 0.2, 0.4)
ON CONFLICT (ingredient_name) DO NOTHING;

-- UPDATE EXISTING ITEMS (already in nutrition_reference, just add micronutrients)

UPDATE nutrition_reference SET
  vitamin_a_mcg = 2924, vitamin_c_mg = 21.8, vitamin_d_mcg = 0, vitamin_e_mg = 1.83, vitamin_k_mcg = 1714.5,
  vitamin_b1_mg = 0.05, vitamin_b2_mg = 0.43, vitamin_b3_mg = 0.91, vitamin_b6_mg = 0.35, vitamin_b12_mcg = 0,
  folate_mcg = 7, calcium_mg = 1280, iron_mg = 11.87, magnesium_mg = 220, phosphorus_mg = 70,
  potassium_mg = 955, sodium_mg = 26, zinc_mg = 3.6, copper_mg = 0.55, manganese_mg = 7.13, selenium_mcg = 4.5
WHERE ingredient_name = 'Rosemary';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 238, vitamin_c_mg = 160.1, vitamin_d_mcg = 0, vitamin_e_mg = 1.99, vitamin_k_mcg = 1714.5,
  vitamin_b1_mg = 0.05, vitamin_b2_mg = 0.47, vitamin_b3_mg = 1.82, vitamin_b6_mg = 0.35, vitamin_b12_mcg = 0,
  folate_mcg = 45, calcium_mg = 1890, iron_mg = 123.6, magnesium_mg = 220, phosphorus_mg = 201,
  potassium_mg = 814, sodium_mg = 55, zinc_mg = 6.18, copper_mg = 0.86, manganese_mg = 7.87, selenium_mcg = 4.5
WHERE ingredient_name = 'Thyme';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 5275, vitamin_c_mg = 26.2, vitamin_d_mcg = 0, vitamin_e_mg = 0.8, vitamin_k_mcg = 177,
  vitamin_b1_mg = 0.09, vitamin_b2_mg = 0.18, vitamin_b3_mg = 1.04, vitamin_b6_mg = 0.16, vitamin_b12_mcg = 0,
  folate_mcg = 68, calcium_mg = 177, iron_mg = 3.1, magnesium_mg = 64, phosphorus_mg = 56,
  potassium_mg = 295, sodium_mg = 4, zinc_mg = 1.03, copper_mg = 0.09, manganese_mg = 1.15, selenium_mcg = 0.3
WHERE ingredient_name = 'Thai Basil';

-- These items already exist in nutrition_reference, just add micronutrients
UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 0.5, vitamin_k_mcg = 0.5,
  vitamin_b1_mg = 0.1, vitamin_b2_mg = 0.2, vitamin_b3_mg = 1.5, vitamin_b6_mg = 0.2, vitamin_b12_mcg = 0,
  folate_mcg = 20, calcium_mg = 100, iron_mg = 3, magnesium_mg = 50, phosphorus_mg = 80,
  potassium_mg = 200, sodium_mg = 10, zinc_mg = 1, copper_mg = 0.2, manganese_mg = 0.5, selenium_mcg = 1
WHERE ingredient_name = 'Garam Masala';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 0.3, vitamin_k_mcg = 0.5,
  vitamin_b1_mg = 0.05, vitamin_b2_mg = 0.1, vitamin_b3_mg = 0.8, vitamin_b6_mg = 0.1, vitamin_b12_mcg = 0,
  folate_mcg = 10, calcium_mg = 80, iron_mg = 2, magnesium_mg = 40, phosphorus_mg = 60,
  potassium_mg = 150, sodium_mg = 5, zinc_mg = 0.8, copper_mg = 0.15, manganese_mg = 0.4, selenium_mcg = 0.8
WHERE ingredient_name = 'Oregano';

UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 0.1, vitamin_k_mcg = 0.2,
  vitamin_b1_mg = 0.01, vitamin_b2_mg = 0.02, vitamin_b3_mg = 0.3, vitamin_b6_mg = 0.02, vitamin_b12_mcg = 0,
  folate_mcg = 3, calcium_mg = 20, iron_mg = 0.5, magnesium_mg = 10, phosphorus_mg = 15,
  potassium_mg = 40, sodium_mg = 2, zinc_mg = 0.2, copper_mg = 0.04, manganese_mg = 0.1, selenium_mcg = 0.2
WHERE ingredient_name = 'Celery Seeds';

-- Horse Gram exists as 'Kulthi Dal' in the database
UPDATE nutrition_reference SET
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 0.3, vitamin_k_mcg = 5,
  vitamin_b1_mg = 0.4, vitamin_b2_mg = 0.2, vitamin_b3_mg = 2, vitamin_b6_mg = 0.4, vitamin_b12_mcg = 0,
  folate_mcg = 300, calcium_mg = 150, iron_mg = 5, magnesium_mg = 150, phosphorus_mg = 350,
  potassium_mg = 1000, sodium_mg = 10, zinc_mg = 3, copper_mg = 0.7, manganese_mg = 1.2, selenium_mcg = 8
WHERE ingredient_name = 'Kulthi Dal';
-- =====================================================
-- Add micronutrient columns to cafe_inventory and cafe_menu tables
-- This allows tracking micronutrients for existing dishes and inventory items
-- =====================================================

-- Add micronutrient columns to cafe_inventory (raw materials)
ALTER TABLE cafe_inventory
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

-- Add micronutrient columns to cafe_menu (dishes)
ALTER TABLE cafe_menu
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

-- Populate cafe_inventory micronutrients from nutrition_reference
-- Match by ingredient name with fuzzy matching for plural/singular variations
UPDATE cafe_inventory ci
SET 
  vitamin_a_mcg = nr.vitamin_a_mcg,
  vitamin_c_mg = nr.vitamin_c_mg,
  vitamin_d_mcg = nr.vitamin_d_mcg,
  vitamin_e_mg = nr.vitamin_e_mg,
  vitamin_k_mcg = nr.vitamin_k_mcg,
  vitamin_b1_mg = nr.vitamin_b1_mg,
  vitamin_b2_mg = nr.vitamin_b2_mg,
  vitamin_b3_mg = nr.vitamin_b3_mg,
  vitamin_b6_mg = nr.vitamin_b6_mg,
  vitamin_b12_mcg = nr.vitamin_b12_mcg,
  folate_mcg = nr.folate_mcg,
  calcium_mg = nr.calcium_mg,
  iron_mg = nr.iron_mg,
  magnesium_mg = nr.magnesium_mg,
  phosphorus_mg = nr.phosphorus_mg,
  potassium_mg = nr.potassium_mg,
  sodium_mg = nr.sodium_mg,
  zinc_mg = nr.zinc_mg,
  copper_mg = nr.copper_mg,
  manganese_mg = nr.manganese_mg,
  selenium_mcg = nr.selenium_mcg
FROM nutrition_reference nr
WHERE (
  -- Exact match
  LOWER(ci.name) = LOWER(nr.ingredient_name)
  -- Match with 's' added (Apple -> Apples)
  OR LOWER(ci.name) = LOWER(nr.ingredient_name) || 's'
  -- Match with 's' removed (Onions -> Onion)
  OR LOWER(ci.name) || 's' = LOWER(nr.ingredient_name)
  -- Match without parentheses content (Chicken Breast (cooked) -> Chicken Breast)
  OR LOWER(ci.name) = LOWER(REGEXP_REPLACE(nr.ingredient_name, '\s*\([^)]*\)', '', 'g'))
  -- Partial match - inventory name contains reference name
  OR LOWER(ci.name) LIKE '%' || LOWER(REGEXP_REPLACE(nr.ingredient_name, '\s*\([^)]*\)', '', 'g')) || '%'
  -- Partial match - reference name contains inventory name
  OR LOWER(nr.ingredient_name) LIKE '%' || LOWER(ci.name) || '%'
)
AND nr.vitamin_a_mcg IS NOT NULL;

-- Manual mappings for items that don't match automatically
-- Handle special cases where names differ significantly
UPDATE cafe_inventory ci
SET 
  vitamin_a_mcg = nr.vitamin_a_mcg,
  vitamin_c_mg = nr.vitamin_c_mg,
  vitamin_d_mcg = nr.vitamin_d_mcg,
  vitamin_e_mg = nr.vitamin_e_mg,
  vitamin_k_mcg = nr.vitamin_k_mcg,
  vitamin_b1_mg = nr.vitamin_b1_mg,
  vitamin_b2_mg = nr.vitamin_b2_mg,
  vitamin_b3_mg = nr.vitamin_b3_mg,
  vitamin_b6_mg = nr.vitamin_b6_mg,
  vitamin_b12_mcg = nr.vitamin_b12_mcg,
  folate_mcg = nr.folate_mcg,
  calcium_mg = nr.calcium_mg,
  iron_mg = nr.iron_mg,
  magnesium_mg = nr.magnesium_mg,
  phosphorus_mg = nr.phosphorus_mg,
  potassium_mg = nr.potassium_mg,
  sodium_mg = nr.sodium_mg,
  zinc_mg = nr.zinc_mg,
  copper_mg = nr.copper_mg,
  manganese_mg = nr.manganese_mg,
  selenium_mcg = nr.selenium_mcg
FROM nutrition_reference nr
WHERE ci.vitamin_a_mcg IS NULL  -- Only update items not already matched
AND (
  -- Original mappings
  (LOWER(ci.name) = 'peanuts (raw)' AND LOWER(nr.ingredient_name) = 'peanuts')
  OR (LOWER(ci.name) = 'chana dal (cooked)' AND LOWER(nr.ingredient_name) = 'chickpeas (cooked)')
  OR (LOWER(ci.name) = 'onion' AND LOWER(nr.ingredient_name) = 'onions')
  OR (LOWER(ci.name) = 'carrot' AND LOWER(nr.ingredient_name) = 'carrots')
  
  -- New mappings from unmatched list
  OR (LOWER(ci.name) = 'cherry tomato' AND LOWER(nr.ingredient_name) = 'tomatoes')
  OR (LOWER(ci.name) = 'red chilli powder' AND LOWER(nr.ingredient_name) = 'green chili')
  OR (LOWER(ci.name) = 'sesame oil' AND LOWER(nr.ingredient_name) = 'sesame seeds')
  OR (LOWER(ci.name) = 'lemons' AND LOWER(nr.ingredient_name) = 'lemon')
  OR (LOWER(ci.name) = 'strawberries' AND LOWER(nr.ingredient_name) = 'strawberry')
  OR (LOWER(ci.name) = 'frozen peas' AND LOWER(nr.ingredient_name) = 'green peas')
  OR (LOWER(ci.name) = 'brown channa' AND LOWER(nr.ingredient_name) = 'chickpeas (cooked)')
  OR (LOWER(ci.name) = 'beans sticks' AND LOWER(nr.ingredient_name) = 'green beans')
  OR (LOWER(ci.name) = 'horse gram' AND LOWER(nr.ingredient_name) = 'kulthi dal')
)
AND nr.vitamin_a_mcg IS NOT NULL;

-- Log how many inventory items were updated
DO $$
DECLARE
  updated_count INTEGER;
  total_count INTEGER;
  rec RECORD;
BEGIN
  SELECT COUNT(*) INTO updated_count
  FROM cafe_inventory
  WHERE vitamin_a_mcg IS NOT NULL;
  
  SELECT COUNT(*) INTO total_count
  FROM cafe_inventory;
  
  RAISE NOTICE 'Updated % out of % inventory items with micronutrient data', updated_count, total_count;
  
  -- Show items that didn't match
  RAISE NOTICE 'Items without micronutrient data:';
  FOR rec IN 
    SELECT name FROM cafe_inventory WHERE vitamin_a_mcg IS NULL ORDER BY name
  LOOP
    RAISE NOTICE '  - %', rec.name;
  END LOOP;
END $$;

-- Note: cafe_menu micronutrients should be calculated from raw_materials
-- This will be handled in the application layer (CafeMenu.jsx)
-- The raw_materials JSONB contains ingredient quantities, and we'll sum up
-- the micronutrients based on the quantities and nutrition_reference data

COMMENT ON COLUMN cafe_inventory.vitamin_a_mcg IS 'Vitamin A content in micrograms per 100g';
COMMENT ON COLUMN cafe_inventory.calcium_mg IS 'Calcium content in milligrams per 100g';
COMMENT ON COLUMN cafe_inventory.iron_mg IS 'Iron content in milligrams per 100g';

COMMENT ON COLUMN cafe_menu.vitamin_a_mcg IS 'Total Vitamin A content in micrograms per serving (calculated from raw_materials)';
COMMENT ON COLUMN cafe_menu.calcium_mg IS 'Total Calcium content in milligrams per serving (calculated from raw_materials)';
COMMENT ON COLUMN cafe_menu.iron_mg IS 'Total Iron content in milligrams per serving (calculated from raw_materials)';
