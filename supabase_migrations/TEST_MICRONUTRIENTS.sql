-- =====================================================
-- TEST QUERY - Run this to verify micronutrients are working
-- =====================================================

-- Test 1: Check if micronutrient columns exist
SELECT 
  'Micronutrient columns exist' as test_name,
  COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'nutrition_reference' 
AND column_name IN (
  'vitamin_a_mcg', 'vitamin_c_mg', 'calcium_mg', 'iron_mg', 
  'magnesium_mg', 'potassium_mg', 'zinc_mg'
);
-- Expected: 7 columns

-- Test 2: Check a specific ingredient (Rice)
SELECT 
  ingredient_name,
  calories,
  protein,
  carbs,
  fat,
  vitamin_a_mcg,
  vitamin_c_mg,
  calcium_mg,
  iron_mg,
  magnesium_mg,
  potassium_mg
FROM nutrition_reference
WHERE ingredient_name = 'Rice (white, cooked)';
-- Expected: Should show both macros AND micros

-- Test 3: Check how many items have micronutrient data
SELECT 
  'Items with micronutrients' as test_name,
  COUNT(*) as count
FROM nutrition_reference
WHERE vitamin_a_mcg IS NOT NULL OR calcium_mg IS NOT NULL;
-- Expected: Should be > 0 after running batch files

-- Test 4: Show sample of populated data
SELECT 
  ingredient_name,
  category,
  calories as cal,
  protein as pro,
  vitamin_c_mg as vit_c,
  calcium_mg as ca,
  iron_mg as fe
FROM nutrition_reference
WHERE vitamin_c_mg IS NOT NULL
ORDER BY vitamin_c_mg DESC
LIMIT 10;
-- Expected: Should show vegetables/fruits with high vitamin C

-- Test 5: Check if cafe_inventory has micronutrient columns (after running 99_)
SELECT 
  'Cafe inventory micronutrient columns' as test_name,
  COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'cafe_inventory' 
AND column_name IN ('vitamin_a_mcg', 'calcium_mg', 'iron_mg');
-- Expected: 3 columns (after running 99_add_micronutrients_to_dishes.sql)

-- Test 6: Verify ingredient name matching
SELECT 
  nr.ingredient_name,
  nr.calories,
  nr.vitamin_c_mg,
  nr.calcium_mg,
  nr.iron_mg
FROM nutrition_reference nr
WHERE nr.ingredient_name IN (
  'Rice (white, cooked)',
  'Tomatoes',
  'Chicken Breast (cooked)',
  'Spinach',
  'Banana',
  'Milk (whole)',
  'Eggs (whole)',
  'Almonds'
)
ORDER BY nr.ingredient_name;
-- Expected: Should show 8 items with their micronutrients
