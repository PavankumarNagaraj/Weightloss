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
