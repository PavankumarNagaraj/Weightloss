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
