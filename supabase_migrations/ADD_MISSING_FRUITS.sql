-- =====================================================
-- ADD MISSING FRUITS WITH COMPLETE NUTRITION DATA
-- Mosambi, Sapota (Chikoo), and other common Indian fruits
-- =====================================================

-- Add Mosambi (Sweet Lime) - per 100g
INSERT INTO nutrition_reference (
  ingredient_name, category, calories, protein, carbs, fat, fiber, common_unit, indian_name,
  vitamin_a_mcg, vitamin_c_mg, vitamin_d_mcg, vitamin_e_mg, vitamin_k_mcg,
  vitamin_b1_mg, vitamin_b2_mg, vitamin_b3_mg, vitamin_b6_mg, vitamin_b12_mcg, folate_mcg,
  calcium_mg, iron_mg, magnesium_mg, phosphorus_mg, potassium_mg, sodium_mg,
  zinc_mg, copper_mg, manganese_mg, selenium_mcg
) VALUES (
  'Mosambi', 'Fruit', 43, 0.8, 9.3, 0.3, 0.5, 'gm', 'Mosambi (Sweet Lime)',
  -- Vitamins
  10, 50, 0, 0.2, 0, 0.04, 0.02, 0.2, 0.04, 0, 10,
  -- Minerals
  40, 0.7, 8, 21, 490, 2, 0.1, 0.04, 0.02, 0.1
) ON CONFLICT (ingredient_name) DO UPDATE SET
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  vitamin_a_mcg = EXCLUDED.vitamin_a_mcg,
  vitamin_c_mg = EXCLUDED.vitamin_c_mg,
  vitamin_d_mcg = EXCLUDED.vitamin_d_mcg,
  vitamin_e_mg = EXCLUDED.vitamin_e_mg,
  vitamin_k_mcg = EXCLUDED.vitamin_k_mcg,
  vitamin_b1_mg = EXCLUDED.vitamin_b1_mg,
  vitamin_b2_mg = EXCLUDED.vitamin_b2_mg,
  vitamin_b3_mg = EXCLUDED.vitamin_b3_mg,
  vitamin_b6_mg = EXCLUDED.vitamin_b6_mg,
  vitamin_b12_mcg = EXCLUDED.vitamin_b12_mcg,
  folate_mcg = EXCLUDED.folate_mcg,
  calcium_mg = EXCLUDED.calcium_mg,
  iron_mg = EXCLUDED.iron_mg,
  magnesium_mg = EXCLUDED.magnesium_mg,
  phosphorus_mg = EXCLUDED.phosphorus_mg,
  potassium_mg = EXCLUDED.potassium_mg,
  sodium_mg = EXCLUDED.sodium_mg,
  zinc_mg = EXCLUDED.zinc_mg,
  copper_mg = EXCLUDED.copper_mg,
  manganese_mg = EXCLUDED.manganese_mg,
  selenium_mcg = EXCLUDED.selenium_mcg;

-- Add Sapota/Chikoo - per 100g
INSERT INTO nutrition_reference (
  ingredient_name, category, calories, protein, carbs, fat, fiber, common_unit, indian_name,
  vitamin_a_mcg, vitamin_c_mg, vitamin_d_mcg, vitamin_e_mg, vitamin_k_mcg,
  vitamin_b1_mg, vitamin_b2_mg, vitamin_b3_mg, vitamin_b6_mg, vitamin_b12_mcg, folate_mcg,
  calcium_mg, iron_mg, magnesium_mg, phosphorus_mg, potassium_mg, sodium_mg,
  zinc_mg, copper_mg, manganese_mg, selenium_mcg
) VALUES (
  'Sapota', 'Fruit', 83, 0.4, 20, 1.1, 5.3, 'gm', 'Sapota (Chikoo)',
  -- Vitamins
  3, 14.7, 0, 0.5, 0, 0.06, 0.02, 0.2, 0.04, 0, 14,
  -- Minerals
  21, 0.8, 12, 12, 193, 12, 0.1, 0.09, 0.2, 0.6
) ON CONFLICT (ingredient_name) DO UPDATE SET
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  vitamin_a_mcg = EXCLUDED.vitamin_a_mcg,
  vitamin_c_mg = EXCLUDED.vitamin_c_mg,
  vitamin_d_mcg = EXCLUDED.vitamin_d_mcg,
  vitamin_e_mg = EXCLUDED.vitamin_e_mg,
  vitamin_k_mcg = EXCLUDED.vitamin_k_mcg,
  vitamin_b1_mg = EXCLUDED.vitamin_b1_mg,
  vitamin_b2_mg = EXCLUDED.vitamin_b2_mg,
  vitamin_b3_mg = EXCLUDED.vitamin_b3_mg,
  vitamin_b6_mg = EXCLUDED.vitamin_b6_mg,
  vitamin_b12_mcg = EXCLUDED.vitamin_b12_mcg,
  folate_mcg = EXCLUDED.folate_mcg,
  calcium_mg = EXCLUDED.calcium_mg,
  iron_mg = EXCLUDED.iron_mg,
  magnesium_mg = EXCLUDED.magnesium_mg,
  phosphorus_mg = EXCLUDED.phosphorus_mg,
  potassium_mg = EXCLUDED.potassium_mg,
  sodium_mg = EXCLUDED.sodium_mg,
  zinc_mg = EXCLUDED.zinc_mg,
  copper_mg = EXCLUDED.copper_mg,
  manganese_mg = EXCLUDED.manganese_mg,
  selenium_mcg = EXCLUDED.selenium_mcg;

-- Add Guava - per 100g (if not already present)
INSERT INTO nutrition_reference (
  ingredient_name, category, calories, protein, carbs, fat, fiber, common_unit, indian_name,
  vitamin_a_mcg, vitamin_c_mg, vitamin_d_mcg, vitamin_e_mg, vitamin_k_mcg,
  vitamin_b1_mg, vitamin_b2_mg, vitamin_b3_mg, vitamin_b6_mg, vitamin_b12_mcg, folate_mcg,
  calcium_mg, iron_mg, magnesium_mg, phosphorus_mg, potassium_mg, sodium_mg,
  zinc_mg, copper_mg, manganese_mg, selenium_mcg
) VALUES (
  'Guava', 'Fruit', 68, 2.6, 14.3, 1, 5.4, 'gm', 'Guava',
  -- Vitamins
  31, 228.3, 0, 0.73, 2.6, 0.07, 0.04, 1.08, 0.11, 0, 49,
  -- Minerals
  18, 0.26, 22, 40, 417, 2, 0.23, 0.23, 0.15, 0.6
) ON CONFLICT (ingredient_name) DO UPDATE SET
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  vitamin_a_mcg = EXCLUDED.vitamin_a_mcg,
  vitamin_c_mg = EXCLUDED.vitamin_c_mg,
  vitamin_d_mcg = EXCLUDED.vitamin_d_mcg,
  vitamin_e_mg = EXCLUDED.vitamin_e_mg,
  vitamin_k_mcg = EXCLUDED.vitamin_k_mcg,
  vitamin_b1_mg = EXCLUDED.vitamin_b1_mg,
  vitamin_b2_mg = EXCLUDED.vitamin_b2_mg,
  vitamin_b3_mg = EXCLUDED.vitamin_b3_mg,
  vitamin_b6_mg = EXCLUDED.vitamin_b6_mg,
  vitamin_b12_mcg = EXCLUDED.vitamin_b12_mcg,
  folate_mcg = EXCLUDED.folate_mcg,
  calcium_mg = EXCLUDED.calcium_mg,
  iron_mg = EXCLUDED.iron_mg,
  magnesium_mg = EXCLUDED.magnesium_mg,
  phosphorus_mg = EXCLUDED.phosphorus_mg,
  potassium_mg = EXCLUDED.potassium_mg,
  sodium_mg = EXCLUDED.sodium_mg,
  zinc_mg = EXCLUDED.zinc_mg,
  copper_mg = EXCLUDED.copper_mg,
  manganese_mg = EXCLUDED.manganese_mg,
  selenium_mcg = EXCLUDED.selenium_mcg;

-- Add Pomegranate - per 100g (if not already present)
INSERT INTO nutrition_reference (
  ingredient_name, category, calories, protein, carbs, fat, fiber, common_unit, indian_name,
  vitamin_a_mcg, vitamin_c_mg, vitamin_d_mcg, vitamin_e_mg, vitamin_k_mcg,
  vitamin_b1_mg, vitamin_b2_mg, vitamin_b3_mg, vitamin_b6_mg, vitamin_b12_mcg, folate_mcg,
  calcium_mg, iron_mg, magnesium_mg, phosphorus_mg, potassium_mg, sodium_mg,
  zinc_mg, copper_mg, manganese_mg, selenium_mcg
) VALUES (
  'Pomegranate', 'Fruit', 83, 1.7, 18.7, 1.2, 4, 'gm', 'Pomegranate',
  -- Vitamins
  0, 10.2, 0, 0.6, 16.4, 0.07, 0.05, 0.29, 0.08, 0, 38,
  -- Minerals
  10, 0.3, 12, 36, 236, 3, 0.35, 0.16, 0.12, 0.5
) ON CONFLICT (ingredient_name) DO UPDATE SET
  calories = EXCLUDED.calories,
  protein = EXCLUDED.protein,
  carbs = EXCLUDED.carbs,
  fat = EXCLUDED.fat,
  fiber = EXCLUDED.fiber,
  vitamin_a_mcg = EXCLUDED.vitamin_a_mcg,
  vitamin_c_mg = EXCLUDED.vitamin_c_mg,
  vitamin_d_mcg = EXCLUDED.vitamin_d_mcg,
  vitamin_e_mg = EXCLUDED.vitamin_e_mg,
  vitamin_k_mcg = EXCLUDED.vitamin_k_mcg,
  vitamin_b1_mg = EXCLUDED.vitamin_b1_mg,
  vitamin_b2_mg = EXCLUDED.vitamin_b2_mg,
  vitamin_b3_mg = EXCLUDED.vitamin_b3_mg,
  vitamin_b6_mg = EXCLUDED.vitamin_b6_mg,
  vitamin_b12_mcg = EXCLUDED.vitamin_b12_mcg,
  folate_mcg = EXCLUDED.folate_mcg,
  calcium_mg = EXCLUDED.calcium_mg,
  iron_mg = EXCLUDED.iron_mg,
  magnesium_mg = EXCLUDED.magnesium_mg,
  phosphorus_mg = EXCLUDED.phosphorus_mg,
  potassium_mg = EXCLUDED.potassium_mg,
  sodium_mg = EXCLUDED.sodium_mg,
  zinc_mg = EXCLUDED.zinc_mg,
  copper_mg = EXCLUDED.copper_mg,
  manganese_mg = EXCLUDED.manganese_mg,
  selenium_mcg = EXCLUDED.selenium_mcg;

-- Update cafe_inventory with micronutrient data from nutrition_reference
UPDATE cafe_inventory ci
SET 
  calories_per_100g = nr.calories,
  protein_per_100g = nr.protein,
  carbs_per_100g = nr.carbs,
  fat_per_100g = nr.fat,
  fiber_per_100g = nr.fiber,
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
WHERE ci.name = nr.ingredient_name
  AND ci.name IN ('Mosambi', 'Sapota', 'Guava', 'Pomegranate');

-- Verify the additions
SELECT 
  ingredient_name,
  calories,
  protein,
  vitamin_c_mg,
  calcium_mg,
  iron_mg
FROM nutrition_reference
WHERE ingredient_name IN ('Mosambi', 'Sapota', 'Guava', 'Pomegranate')
ORDER BY ingredient_name;
