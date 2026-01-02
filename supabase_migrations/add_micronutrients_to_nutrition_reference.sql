-- =====================================================
-- ADD MICRONUTRIENTS TO NUTRITION REFERENCE DATABASE
-- Adds vitamin and mineral columns and populates with actual data
-- =====================================================

-- Step 1: Add micronutrient columns to nutrition_reference table
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

-- Step 2: Update existing ingredients with micronutrient data (per 100g)
-- Data sourced from USDA FoodData Central and Indian Food Composition Tables

-- PROTEINS - Chicken
UPDATE nutrition_reference SET 
  vitamin_a_mcg = 16, vitamin_c_mg = 1.6, vitamin_d_mcg = 0.1, vitamin_e_mg = 0.27, vitamin_k_mcg = 0.3,
  vitamin_b1_mg = 0.07, vitamin_b2_mg = 0.12, vitamin_b3_mg = 11.2, vitamin_b6_mg = 0.6, vitamin_b12_mcg = 0.34,
  folate_mcg = 4, calcium_mg = 11, iron_mg = 0.9, magnesium_mg = 25, phosphorus_mg = 196,
  potassium_mg = 256, sodium_mg = 74, zinc_mg = 1.0, copper_mg = 0.05, manganese_mg = 0.02, selenium_mcg = 20.6
WHERE LOWER(ingredient_name) LIKE '%chicken breast%' OR LOWER(ingredient_name) = 'chicken';

UPDATE nutrition_reference SET 
  vitamin_a_mcg = 18, vitamin_c_mg = 1.2, vitamin_d_mcg = 0.1, vitamin_e_mg = 0.3, vitamin_k_mcg = 0.4,
  vitamin_b1_mg = 0.08, vitamin_b2_mg = 0.15, vitamin_b3_mg = 8.5, vitamin_b6_mg = 0.45, vitamin_b12_mcg = 0.3,
  folate_mcg = 5, calcium_mg = 13, iron_mg = 1.1, magnesium_mg = 22, phosphorus_mg = 180,
  potassium_mg = 240, sodium_mg = 80, zinc_mg = 1.3, copper_mg = 0.06, manganese_mg = 0.02, selenium_mcg = 18.5
WHERE LOWER(ingredient_name) LIKE '%chicken thigh%';

-- PROTEINS - Fish
UPDATE nutrition_reference SET 
  vitamin_a_mcg = 54, vitamin_c_mg = 0, vitamin_d_mcg = 10.3, vitamin_e_mg = 0.7, vitamin_k_mcg = 0.1,
  vitamin_b1_mg = 0.23, vitamin_b2_mg = 0.38, vitamin_b3_mg = 8.5, vitamin_b6_mg = 0.47, vitamin_b12_mcg = 3.2,
  folate_mcg = 5, calcium_mg = 13, iron_mg = 0.8, magnesium_mg = 29, phosphorus_mg = 252,
  potassium_mg = 363, sodium_mg = 54, zinc_mg = 0.64, copper_mg = 0.09, manganese_mg = 0.02, selenium_mcg = 36.5
WHERE LOWER(ingredient_name) LIKE '%salmon%';

UPDATE nutrition_reference SET 
  vitamin_a_mcg = 15, vitamin_c_mg = 0, vitamin_d_mcg = 1.1, vitamin_e_mg = 0.4, vitamin_k_mcg = 0.1,
  vitamin_b1_mg = 0.04, vitamin_b2_mg = 0.07, vitamin_b3_mg = 5.8, vitamin_b6_mg = 0.16, vitamin_b12_mcg = 1.8,
  folate_mcg = 5, calcium_mg = 18, iron_mg = 0.3, magnesium_mg = 32, phosphorus_mg = 203,
  potassium_mg = 417, sodium_mg = 119, zinc_mg = 0.37, copper_mg = 0.04, manganese_mg = 0.02, selenium_mcg = 36.5
WHERE LOWER(ingredient_name) LIKE '%tuna%';

-- PROTEINS - Eggs
UPDATE nutrition_reference SET 
  vitamin_a_mcg = 160, vitamin_c_mg = 0, vitamin_d_mcg = 2.0, vitamin_e_mg = 1.05, vitamin_k_mcg = 0.3,
  vitamin_b1_mg = 0.04, vitamin_b2_mg = 0.46, vitamin_b3_mg = 0.08, vitamin_b6_mg = 0.17, vitamin_b12_mcg = 0.89,
  folate_mcg = 47, calcium_mg = 56, iron_mg = 1.75, magnesium_mg = 12, phosphorus_mg = 198,
  potassium_mg = 138, sodium_mg = 142, zinc_mg = 1.29, copper_mg = 0.07, manganese_mg = 0.03, selenium_mcg = 30.7
WHERE LOWER(ingredient_name) = 'egg' OR LOWER(ingredient_name) LIKE '%whole egg%';

-- PROTEINS - Paneer
UPDATE nutrition_reference SET 
  vitamin_a_mcg = 195, vitamin_c_mg = 0, vitamin_d_mcg = 0.2, vitamin_e_mg = 0.3, vitamin_k_mcg = 2.5,
  vitamin_b1_mg = 0.04, vitamin_b2_mg = 0.28, vitamin_b3_mg = 0.09, vitamin_b6_mg = 0.08, vitamin_b12_mcg = 0.44,
  folate_mcg = 15, calcium_mg = 480, iron_mg = 0.4, magnesium_mg = 19, phosphorus_mg = 340,
  potassium_mg = 104, sodium_mg = 18, zinc_mg = 2.3, copper_mg = 0.03, manganese_mg = 0.01, selenium_mcg = 14.5
WHERE LOWER(ingredient_name) = 'paneer' OR LOWER(ingredient_name) LIKE '%cottage cheese%';

-- PROTEINS - Tofu
UPDATE nutrition_reference SET 
  vitamin_a_mcg = 5, vitamin_c_mg = 0.1, vitamin_d_mcg = 0, vitamin_e_mg = 0.01, vitamin_k_mcg = 2.4,
  vitamin_b1_mg = 0.08, vitamin_b2_mg = 0.05, vitamin_b3_mg = 0.2, vitamin_b6_mg = 0.05, vitamin_b12_mcg = 0,
  folate_mcg = 15, calcium_mg = 350, iron_mg = 5.4, magnesium_mg = 30, phosphorus_mg = 97,
  potassium_mg = 121, sodium_mg = 7, zinc_mg = 0.8, copper_mg = 0.19, manganese_mg = 0.61, selenium_mcg = 8.9
WHERE LOWER(ingredient_name) = 'tofu';

-- DAIRY - Milk
UPDATE nutrition_reference SET 
  vitamin_a_mcg = 46, vitamin_c_mg = 0, vitamin_d_mcg = 1.3, vitamin_e_mg = 0.07, vitamin_k_mcg = 0.3,
  vitamin_b1_mg = 0.04, vitamin_b2_mg = 0.18, vitamin_b3_mg = 0.09, vitamin_b6_mg = 0.04, vitamin_b12_mcg = 0.45,
  folate_mcg = 5, calcium_mg = 113, iron_mg = 0.03, magnesium_mg = 10, phosphorus_mg = 84,
  potassium_mg = 132, sodium_mg = 40, zinc_mg = 0.37, copper_mg = 0.01, manganese_mg = 0.004, selenium_mcg = 3.7
WHERE LOWER(ingredient_name) = 'milk' OR LOWER(ingredient_name) LIKE '%whole milk%';

UPDATE nutrition_reference SET 
  vitamin_a_mcg = 98, vitamin_c_mg = 0, vitamin_d_mcg = 0.6, vitamin_e_mg = 0.26, vitamin_k_mcg = 2.1,
  vitamin_b1_mg = 0.03, vitamin_b2_mg = 0.34, vitamin_b3_mg = 0.1, vitamin_b6_mg = 0.07, vitamin_b12_mcg = 0.83,
  folate_mcg = 11, calcium_mg = 721, iron_mg = 0.14, magnesium_mg = 22, phosphorus_mg = 455,
  potassium_mg = 98, sodium_mg = 629, zinc_mg = 2.66, copper_mg = 0.03, manganese_mg = 0.01, selenium_mcg = 14.5
WHERE LOWER(ingredient_name) = 'cheddar' OR LOWER(ingredient_name) LIKE '%cheddar cheese%';

-- VEGETABLES - Spinach
UPDATE nutrition_reference SET 
  vitamin_a_mcg = 469, vitamin_c_mg = 28.1, vitamin_d_mcg = 0, vitamin_e_mg = 2.03, vitamin_k_mcg = 482.9,
  vitamin_b1_mg = 0.08, vitamin_b2_mg = 0.19, vitamin_b3_mg = 0.72, vitamin_b6_mg = 0.2, vitamin_b12_mcg = 0,
  folate_mcg = 194, calcium_mg = 99, iron_mg = 2.71, magnesium_mg = 79, phosphorus_mg = 49,
  potassium_mg = 558, sodium_mg = 79, zinc_mg = 0.53, copper_mg = 0.13, manganese_mg = 0.9, selenium_mcg = 1.0
WHERE LOWER(ingredient_name) = 'spinach' OR LOWER(ingredient_name) LIKE '%palak%';

-- VEGETABLES - Broccoli
UPDATE nutrition_reference SET 
  vitamin_a_mcg = 31, vitamin_c_mg = 89.2, vitamin_d_mcg = 0, vitamin_e_mg = 0.78, vitamin_k_mcg = 101.6,
  vitamin_b1_mg = 0.07, vitamin_b2_mg = 0.12, vitamin_b3_mg = 0.64, vitamin_b6_mg = 0.18, vitamin_b12_mcg = 0,
  folate_mcg = 63, calcium_mg = 47, iron_mg = 0.73, magnesium_mg = 21, phosphorus_mg = 66,
  potassium_mg = 316, sodium_mg = 33, zinc_mg = 0.41, copper_mg = 0.05, manganese_mg = 0.21, selenium_mcg = 2.5
WHERE LOWER(ingredient_name) = 'broccoli';

-- VEGETABLES - Tomato
UPDATE nutrition_reference SET 
  vitamin_a_mcg = 42, vitamin_c_mg = 13.7, vitamin_d_mcg = 0, vitamin_e_mg = 0.54, vitamin_k_mcg = 7.9,
  vitamin_b1_mg = 0.04, vitamin_b2_mg = 0.02, vitamin_b3_mg = 0.59, vitamin_b6_mg = 0.08, vitamin_b12_mcg = 0,
  folate_mcg = 15, calcium_mg = 10, iron_mg = 0.27, magnesium_mg = 11, phosphorus_mg = 24,
  potassium_mg = 237, sodium_mg = 5, zinc_mg = 0.17, copper_mg = 0.06, manganese_mg = 0.11, selenium_mcg = 0.0
WHERE LOWER(ingredient_name) = 'tomato';

-- VEGETABLES - Carrot
UPDATE nutrition_reference SET 
  vitamin_a_mcg = 835, vitamin_c_mg = 5.9, vitamin_d_mcg = 0, vitamin_e_mg = 0.66, vitamin_k_mcg = 13.2,
  vitamin_b1_mg = 0.07, vitamin_b2_mg = 0.06, vitamin_b3_mg = 0.98, vitamin_b6_mg = 0.14, vitamin_b12_mcg = 0,
  folate_mcg = 19, calcium_mg = 33, iron_mg = 0.3, magnesium_mg = 12, phosphorus_mg = 35,
  potassium_mg = 320, sodium_mg = 69, zinc_mg = 0.24, copper_mg = 0.05, manganese_mg = 0.14, selenium_mcg = 0.1
WHERE LOWER(ingredient_name) = 'carrot';

-- GRAINS - Rice
UPDATE nutrition_reference SET 
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 0.11, vitamin_k_mcg = 0.1,
  vitamin_b1_mg = 0.07, vitamin_b2_mg = 0.05, vitamin_b3_mg = 1.6, vitamin_b6_mg = 0.16, vitamin_b12_mcg = 0,
  folate_mcg = 8, calcium_mg = 28, iron_mg = 0.8, magnesium_mg = 25, phosphorus_mg = 115,
  potassium_mg = 115, sodium_mg = 5, zinc_mg = 1.09, copper_mg = 0.22, manganese_mg = 1.09, selenium_mcg = 15.1
WHERE LOWER(ingredient_name) = 'rice' OR LOWER(ingredient_name) LIKE '%white rice%';

UPDATE nutrition_reference SET 
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 1.2, vitamin_k_mcg = 1.9,
  vitamin_b1_mg = 0.4, vitamin_b2_mg = 0.09, vitamin_b3_mg = 5.1, vitamin_b6_mg = 0.51, vitamin_b12_mcg = 0,
  folate_mcg = 20, calcium_mg = 23, iron_mg = 1.47, magnesium_mg = 143, phosphorus_mg = 333,
  potassium_mg = 223, sodium_mg = 7, zinc_mg = 2.02, copper_mg = 0.28, manganese_mg = 3.74, selenium_mcg = 23.4
WHERE LOWER(ingredient_name) LIKE '%brown rice%';

-- GRAINS - Oats
UPDATE nutrition_reference SET 
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 0.42, vitamin_k_mcg = 2.0,
  vitamin_b1_mg = 0.76, vitamin_b2_mg = 0.14, vitamin_b3_mg = 0.96, vitamin_b6_mg = 0.12, vitamin_b12_mcg = 0,
  folate_mcg = 56, calcium_mg = 54, iron_mg = 4.72, magnesium_mg = 177, phosphorus_mg = 523,
  potassium_mg = 429, sodium_mg = 2, zinc_mg = 3.97, copper_mg = 0.63, manganese_mg = 4.92, selenium_mcg = 28.9
WHERE LOWER(ingredient_name) = 'oats' OR LOWER(ingredient_name) LIKE '%oatmeal%';

-- GRAINS - Wheat Flour
UPDATE nutrition_reference SET 
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 0.71, vitamin_k_mcg = 1.9,
  vitamin_b1_mg = 0.5, vitamin_b2_mg = 0.12, vitamin_b3_mg = 4.96, vitamin_b6_mg = 0.34, vitamin_b12_mcg = 0,
  folate_mcg = 44, calcium_mg = 34, iron_mg = 3.6, magnesium_mg = 138, phosphorus_mg = 357,
  potassium_mg = 363, sodium_mg = 5, zinc_mg = 2.93, copper_mg = 0.41, manganese_mg = 3.99, selenium_mcg = 61.8
WHERE LOWER(ingredient_name) LIKE '%wheat flour%' OR LOWER(ingredient_name) = 'atta';

-- FRUITS - Banana
UPDATE nutrition_reference SET 
  vitamin_a_mcg = 3, vitamin_c_mg = 8.7, vitamin_d_mcg = 0, vitamin_e_mg = 0.1, vitamin_k_mcg = 0.5,
  vitamin_b1_mg = 0.03, vitamin_b2_mg = 0.07, vitamin_b3_mg = 0.67, vitamin_b6_mg = 0.37, vitamin_b12_mcg = 0,
  folate_mcg = 20, calcium_mg = 5, iron_mg = 0.26, magnesium_mg = 27, phosphorus_mg = 22,
  potassium_mg = 358, sodium_mg = 1, zinc_mg = 0.15, copper_mg = 0.08, manganese_mg = 0.27, selenium_mcg = 1.0
WHERE LOWER(ingredient_name) = 'banana';

-- FRUITS - Apple
UPDATE nutrition_reference SET 
  vitamin_a_mcg = 3, vitamin_c_mg = 4.6, vitamin_d_mcg = 0, vitamin_e_mg = 0.18, vitamin_k_mcg = 2.2,
  vitamin_b1_mg = 0.02, vitamin_b2_mg = 0.03, vitamin_b3_mg = 0.09, vitamin_b6_mg = 0.04, vitamin_b12_mcg = 0,
  folate_mcg = 3, calcium_mg = 6, iron_mg = 0.12, magnesium_mg = 5, phosphorus_mg = 11,
  potassium_mg = 107, sodium_mg = 1, zinc_mg = 0.04, copper_mg = 0.03, manganese_mg = 0.04, selenium_mcg = 0.0
WHERE LOWER(ingredient_name) = 'apple';

-- NUTS - Almonds
UPDATE nutrition_reference SET 
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 25.63, vitamin_k_mcg = 0,
  vitamin_b1_mg = 0.21, vitamin_b2_mg = 1.14, vitamin_b3_mg = 3.62, vitamin_b6_mg = 0.14, vitamin_b12_mcg = 0,
  folate_mcg = 44, calcium_mg = 269, iron_mg = 3.71, magnesium_mg = 270, phosphorus_mg = 481,
  potassium_mg = 733, sodium_mg = 1, zinc_mg = 3.12, copper_mg = 1.03, manganese_mg = 2.18, selenium_mcg = 4.1
WHERE LOWER(ingredient_name) = 'almond' OR LOWER(ingredient_name) = 'almonds' OR LOWER(ingredient_name) = 'badam';

-- NUTS - Walnuts
UPDATE nutrition_reference SET 
  vitamin_a_mcg = 1, vitamin_c_mg = 1.3, vitamin_d_mcg = 0, vitamin_e_mg = 0.7, vitamin_k_mcg = 2.7,
  vitamin_b1_mg = 0.34, vitamin_b2_mg = 0.15, vitamin_b3_mg = 1.13, vitamin_b6_mg = 0.54, vitamin_b12_mcg = 0,
  folate_mcg = 98, calcium_mg = 98, iron_mg = 2.91, magnesium_mg = 158, phosphorus_mg = 346,
  potassium_mg = 441, sodium_mg = 2, zinc_mg = 3.09, copper_mg = 1.59, manganese_mg = 3.41, selenium_mcg = 4.9
WHERE LOWER(ingredient_name) = 'walnut' OR LOWER(ingredient_name) = 'walnuts' OR LOWER(ingredient_name) = 'akhrot';

-- LEGUMES - Chickpeas
UPDATE nutrition_reference SET 
  vitamin_a_mcg = 3, vitamin_c_mg = 4.0, vitamin_d_mcg = 0, vitamin_e_mg = 0.82, vitamin_k_mcg = 9.0,
  vitamin_b1_mg = 0.48, vitamin_b2_mg = 0.21, vitamin_b3_mg = 1.54, vitamin_b6_mg = 0.54, vitamin_b12_mcg = 0,
  folate_mcg = 557, calcium_mg = 105, iron_mg = 6.24, magnesium_mg = 115, phosphorus_mg = 366,
  potassium_mg = 875, sodium_mg = 24, zinc_mg = 3.43, copper_mg = 0.85, manganese_mg = 2.2, selenium_mcg = 8.2
WHERE LOWER(ingredient_name) = 'chickpea' OR LOWER(ingredient_name) = 'chickpeas' OR LOWER(ingredient_name) = 'chana';

-- LEGUMES - Lentils
UPDATE nutrition_reference SET 
  vitamin_a_mcg = 2, vitamin_c_mg = 4.5, vitamin_d_mcg = 0, vitamin_e_mg = 0.49, vitamin_k_mcg = 5.0,
  vitamin_b1_mg = 0.87, vitamin_b2_mg = 0.21, vitamin_b3_mg = 2.6, vitamin_b6_mg = 0.54, vitamin_b12_mcg = 0,
  folate_mcg = 479, calcium_mg = 56, iron_mg = 7.54, magnesium_mg = 122, phosphorus_mg = 451,
  potassium_mg = 955, sodium_mg = 6, zinc_mg = 4.78, copper_mg = 1.0, manganese_mg = 1.39, selenium_mcg = 0.1
WHERE LOWER(ingredient_name) = 'lentil' OR LOWER(ingredient_name) = 'lentils' OR LOWER(ingredient_name) = 'dal';

-- OILS - Olive Oil
UPDATE nutrition_reference SET 
  vitamin_a_mcg = 0, vitamin_c_mg = 0, vitamin_d_mcg = 0, vitamin_e_mg = 14.35, vitamin_k_mcg = 60.2,
  vitamin_b1_mg = 0, vitamin_b2_mg = 0, vitamin_b3_mg = 0, vitamin_b6_mg = 0, vitamin_b12_mcg = 0,
  folate_mcg = 0, calcium_mg = 1, iron_mg = 0.56, magnesium_mg = 0, phosphorus_mg = 0,
  potassium_mg = 1, sodium_mg = 2, zinc_mg = 0, copper_mg = 0, manganese_mg = 0, selenium_mcg = 0
WHERE LOWER(ingredient_name) LIKE '%olive oil%';

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
