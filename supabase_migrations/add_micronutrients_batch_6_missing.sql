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
