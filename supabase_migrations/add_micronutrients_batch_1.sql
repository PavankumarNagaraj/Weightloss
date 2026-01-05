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
