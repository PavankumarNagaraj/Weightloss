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
