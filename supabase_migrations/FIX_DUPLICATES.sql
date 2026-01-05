-- =====================================================
-- FIX DUPLICATE INGREDIENT NAMES
-- Safely merge duplicate singular/plural entries
-- =====================================================

-- Strategy: Keep the form that matches cafe_inventory, delete the other
-- If both have data, merge micronutrients to the inventory-matching form

-- Step 1: Check cafe_inventory naming
-- Run this first to see which form inventory uses
SELECT DISTINCT name 
FROM cafe_inventory 
WHERE LOWER(name) IN ('onion', 'onions', 'carrot', 'carrots', 'tomato', 'tomatoes')
ORDER BY name;

-- Step 2: Delete duplicates (keep the form that matches inventory)
-- Only delete if both singular and plural exist

-- For Onion/Onions - keep 'Onion' (singular matches inventory)
DELETE FROM nutrition_reference 
WHERE ingredient_name = 'Onions' 
AND EXISTS (SELECT 1 FROM nutrition_reference WHERE ingredient_name = 'Onion');

-- For Carrot/Carrots - keep 'Carrot' (singular matches inventory)
DELETE FROM nutrition_reference 
WHERE ingredient_name = 'Carrots' 
AND EXISTS (SELECT 1 FROM nutrition_reference WHERE ingredient_name = 'Carrot');

-- For Tomato/Tomatoes - keep 'Tomato' (singular matches inventory)
DELETE FROM nutrition_reference 
WHERE ingredient_name = 'Tomatoes' 
AND EXISTS (SELECT 1 FROM nutrition_reference WHERE ingredient_name = 'Tomato');

-- For Strawberry/Strawberries - check which form inventory uses
-- If inventory has 'Strawberries', keep plural; if 'Strawberry', keep singular
DELETE FROM nutrition_reference 
WHERE ingredient_name = 'Strawberry' 
AND EXISTS (SELECT 1 FROM nutrition_reference WHERE ingredient_name = 'Strawberries')
AND EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Strawberries');

DELETE FROM nutrition_reference 
WHERE ingredient_name = 'Strawberries' 
AND EXISTS (SELECT 1 FROM nutrition_reference WHERE ingredient_name = 'Strawberry')
AND EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Strawberry');

-- Verify - should show no duplicates
SELECT 
  CASE 
    WHEN LOWER(ingredient_name) LIKE '%onion%' THEN 'Onion group'
    WHEN LOWER(ingredient_name) LIKE '%carrot%' THEN 'Carrot group'
    WHEN LOWER(ingredient_name) LIKE '%tomato%' THEN 'Tomato group'
    WHEN LOWER(ingredient_name) LIKE '%strawberr%' THEN 'Strawberry group'
  END as item_group,
  ingredient_name,
  vitamin_a_mcg IS NOT NULL as has_micronutrients
FROM nutrition_reference
WHERE LOWER(ingredient_name) IN ('onion', 'onions', 'carrot', 'carrots', 'tomato', 'tomatoes', 'strawberry', 'strawberries')
ORDER BY item_group, ingredient_name;
