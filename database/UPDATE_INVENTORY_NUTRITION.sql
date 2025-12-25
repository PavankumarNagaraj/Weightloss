-- ============================================
-- UPDATE INVENTORY WITH NUTRITION DATA
-- ============================================
-- This copies nutrition values from nutrition_reference to cafe_inventory
-- for items where the names match exactly

UPDATE cafe_inventory ci
SET 
  calories_per_100g = nr.calories,
  protein_per_100g = nr.protein,
  carbs_per_100g = nr.carbs,
  fat_per_100g = nr.fat,
  fiber_per_100g = nr.fiber
FROM nutrition_reference nr
WHERE ci.name = nr.ingredient_name;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- 1. Check how many items got updated
SELECT 'Items with nutrition data:' as status, COUNT(*) as count 
FROM cafe_inventory 
WHERE calories_per_100g IS NOT NULL;

-- 2. Show sample updated items
SELECT name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g
FROM cafe_inventory 
WHERE calories_per_100g IS NOT NULL
ORDER BY name
LIMIT 10;

-- 3. Check if specific items got updated (test a few)
SELECT name, calories_per_100g, protein_per_100g 
FROM cafe_inventory 
WHERE name IN ('Apple', 'Banana', 'Chicken Breast (cooked)', 'Eggs (whole)', 'Oats')
ORDER BY name;
