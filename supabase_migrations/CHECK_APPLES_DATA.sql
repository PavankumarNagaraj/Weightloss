-- Check if Apples has micronutrient data in cafe_inventory
SELECT 
  name,
  calories_per_100g,
  protein_per_100g,
  vitamin_a_mcg,
  vitamin_c_mg,
  calcium_mg,
  iron_mg
FROM cafe_inventory
WHERE name = 'Apples';

-- Also check nutrition_reference
SELECT 
  ingredient_name,
  calories,
  protein,
  vitamin_a_mcg,
  vitamin_c_mg,
  calcium_mg,
  iron_mg
FROM nutrition_reference
WHERE ingredient_name = 'Apples';
