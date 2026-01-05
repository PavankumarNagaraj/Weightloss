-- =====================================================
-- VERIFICATION SCRIPT - Run after RUN_THIS_ONCE.sql
-- =====================================================

-- 1. Check nutrition_reference micronutrient coverage
SELECT 
  'nutrition_reference' as table_name,
  COUNT(*) as total_items,
  COUNT(CASE WHEN vitamin_a_mcg IS NOT NULL THEN 1 END) as items_with_micronutrients,
  ROUND(100.0 * COUNT(CASE WHEN vitamin_a_mcg IS NOT NULL THEN 1 END) / COUNT(*), 1) as percentage
FROM nutrition_reference;

-- 2. Check cafe_inventory micronutrient coverage
SELECT 
  'cafe_inventory' as table_name,
  COUNT(*) as total_items,
  COUNT(CASE WHEN vitamin_a_mcg IS NOT NULL THEN 1 END) as items_with_micronutrients,
  ROUND(100.0 * COUNT(CASE WHEN vitamin_a_mcg IS NOT NULL THEN 1 END) / COUNT(*), 1) as percentage
FROM cafe_inventory;

-- 3. Sample micronutrient data from nutrition_reference
SELECT 
  ingredient_name,
  calories,
  protein,
  vitamin_c_mg,
  calcium_mg,
  iron_mg,
  vitamin_a_mcg
FROM nutrition_reference
WHERE ingredient_name IN ('Apple', 'Tomatoes', 'Chicken Breast (cooked)', 'Rice (white, cooked)', 'Spinach')
ORDER BY ingredient_name;

-- 4. Sample micronutrient data from cafe_inventory
SELECT 
  name,
  category,
  vitamin_c_mg,
  calcium_mg,
  iron_mg,
  vitamin_a_mcg
FROM cafe_inventory
WHERE vitamin_a_mcg IS NOT NULL
ORDER BY name
LIMIT 10;

-- 5. List cafe_inventory items WITHOUT micronutrients (should be ~30 non-food items)
SELECT 
  name,
  category
FROM cafe_inventory
WHERE vitamin_a_mcg IS NULL
ORDER BY category, name;

-- 6. Count by category
SELECT 
  category,
  COUNT(*) as total,
  COUNT(CASE WHEN vitamin_a_mcg IS NOT NULL THEN 1 END) as with_micronutrients
FROM cafe_inventory
GROUP BY category
ORDER BY category;
