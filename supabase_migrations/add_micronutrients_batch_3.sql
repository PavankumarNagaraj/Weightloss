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
