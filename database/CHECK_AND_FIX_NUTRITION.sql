-- Check if nutrition_reference table exists and has data
SELECT COUNT(*) as total_ingredients FROM nutrition_reference;

-- Check sample data
SELECT ingredient_name, calories, protein, carbs, fat, fiber 
FROM nutrition_reference 
LIMIT 10;

-- Check if any inventory items match nutrition_reference
SELECT ci.name, nr.ingredient_name, nr.calories, nr.protein
FROM cafe_inventory ci
LEFT JOIN nutrition_reference nr ON ci.name = nr.ingredient_name
LIMIT 20;

-- If nutrition_reference is empty, you need to run NUTRITION_500_FINAL.sql first
-- Then run this UPDATE to populate nutrition data:

UPDATE cafe_inventory ci
SET 
  calories_per_100g = nr.calories,
  protein_per_100g = nr.protein,
  carbs_per_100g = nr.carbs,
  fat_per_100g = nr.fat,
  fiber_per_100g = nr.fiber
FROM nutrition_reference nr
WHERE ci.name = nr.ingredient_name;

-- Verify the updates worked
SELECT name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g
FROM cafe_inventory 
WHERE calories_per_100g IS NOT NULL
ORDER BY name
LIMIT 20;
