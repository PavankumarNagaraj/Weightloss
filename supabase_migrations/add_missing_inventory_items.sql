-- Add missing inventory items with complete macro and micronutrient data
-- Items: Almond Milk, Spring Onion, Overnight Soaked Oats, Overnight Soaked Chia
-- Note: Yogurt and Walnut already exist in the database

-- Almond Milk (unsweetened, per 100ml)
INSERT INTO nutrition_reference (
  ingredient_name, category, common_unit,
  calories, protein, carbs, fat, fiber,
  vitamin_a_mcg, vitamin_c_mg, vitamin_d_mcg, vitamin_e_mg, vitamin_k_mcg,
  vitamin_b1_mg, vitamin_b2_mg, vitamin_b3_mg, vitamin_b6_mg, vitamin_b12_mcg,
  folate_mcg, calcium_mg, iron_mg, magnesium_mg, phosphorus_mg,
  potassium_mg, sodium_mg, zinc_mg, copper_mg, manganese_mg, selenium_mcg
) VALUES (
  'Almond Milk', 'Dairy Alternatives', 'ml',
  17, 0.4, 0.6, 1.1, 0.2,
  0, 0, 1.1, 3.2, 0,
  0.02, 0.18, 0.16, 0.01, 0.38,
  2, 184, 0.3, 7, 24,
  67, 63, 0.12, 0.03, 0.11, 0.9
) ON CONFLICT (ingredient_name) DO UPDATE SET
  category = EXCLUDED.category,
  common_unit = EXCLUDED.common_unit,
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

-- Spring Onion (per 100g)
INSERT INTO nutrition_reference (
  ingredient_name, category, common_unit,
  calories, protein, carbs, fat, fiber,
  vitamin_a_mcg, vitamin_c_mg, vitamin_d_mcg, vitamin_e_mg, vitamin_k_mcg,
  vitamin_b1_mg, vitamin_b2_mg, vitamin_b3_mg, vitamin_b6_mg, vitamin_b12_mcg,
  folate_mcg, calcium_mg, iron_mg, magnesium_mg, phosphorus_mg,
  potassium_mg, sodium_mg, zinc_mg, copper_mg, manganese_mg, selenium_mcg
) VALUES (
  'Spring Onion', 'Vegetable', 'gm',
  32, 1.8, 7.3, 0.2, 2.6,
  50, 18.8, 0, 0.55, 207,
  0.055, 0.08, 0.525, 0.061, 0,
  64, 72, 1.48, 20, 37,
  276, 16, 0.39, 0.083, 0.16, 0.6
) ON CONFLICT (ingredient_name) DO UPDATE SET
  category = EXCLUDED.category,
  common_unit = EXCLUDED.common_unit,
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

-- Overnight Soaked Oats (per 100g dry weight)
-- Note: Soaking doesn't significantly change nutritional values, just makes them more digestible
INSERT INTO nutrition_reference (
  ingredient_name, category, common_unit,
  calories, protein, carbs, fat, fiber,
  vitamin_a_mcg, vitamin_c_mg, vitamin_d_mcg, vitamin_e_mg, vitamin_k_mcg,
  vitamin_b1_mg, vitamin_b2_mg, vitamin_b3_mg, vitamin_b6_mg, vitamin_b12_mcg,
  folate_mcg, calcium_mg, iron_mg, magnesium_mg, phosphorus_mg,
  potassium_mg, sodium_mg, zinc_mg, copper_mg, manganese_mg, selenium_mcg
) VALUES (
  'Overnight Soaked Oats', 'Grain', 'gm',
  389, 16.9, 66.3, 6.9, 10.6,
  0, 0, 0, 0.42, 2,
  0.763, 0.139, 0.961, 0.119, 0,
  56, 54, 4.72, 177, 523,
  429, 2, 3.97, 0.626, 4.916, 28.9
) ON CONFLICT (ingredient_name) DO UPDATE SET
  category = EXCLUDED.category,
  common_unit = EXCLUDED.common_unit,
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

-- Overnight Soaked Chia Seeds (per 100g dry weight)
-- Note: Soaking expands chia seeds but doesn't change nutritional density per gram of dry seeds
INSERT INTO nutrition_reference (
  ingredient_name, category, common_unit,
  calories, protein, carbs, fat, fiber,
  vitamin_a_mcg, vitamin_c_mg, vitamin_d_mcg, vitamin_e_mg, vitamin_k_mcg,
  vitamin_b1_mg, vitamin_b2_mg, vitamin_b3_mg, vitamin_b6_mg, vitamin_b12_mcg,
  folate_mcg, calcium_mg, iron_mg, magnesium_mg, phosphorus_mg,
  potassium_mg, sodium_mg, zinc_mg, copper_mg, manganese_mg, selenium_mcg
) VALUES (
  'Overnight Soaked Chia', 'Seed', 'gm',
  486, 16.5, 42.1, 30.7, 34.4,
  54, 1.6, 0, 0.5, 0.5,
  0.62, 0.17, 8.83, 0.35, 0,
  49, 631, 7.72, 335, 860,
  407, 16, 4.58, 0.924, 2.723, 55.2
) ON CONFLICT (ingredient_name) DO UPDATE SET
  category = EXCLUDED.category,
  common_unit = EXCLUDED.common_unit,
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

-- Verify the insertions
SELECT ingredient_name, category, calories, protein, carbs, fat, fiber
FROM nutrition_reference
WHERE ingredient_name IN ('Almond Milk', 'Spring Onion', 'Overnight Soaked Oats', 'Overnight Soaked Chia')
ORDER BY ingredient_name;
