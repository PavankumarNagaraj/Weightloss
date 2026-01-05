-- =====================================================
-- SYNC ALL INGREDIENT NAMES
-- Update nutrition_reference to exactly match cafe_inventory
-- =====================================================

-- This script updates nutrition_reference ingredient names to match
-- the exact naming in cafe_inventory (including singular/plural)

-- First, remove duplicates that would cause conflicts
-- Delete plural forms if singular exists and inventory uses singular
DELETE FROM nutrition_reference 
WHERE ingredient_name = 'Onions' 
AND EXISTS (SELECT 1 FROM nutrition_reference WHERE ingredient_name = 'Onion')
AND EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Onion');

DELETE FROM nutrition_reference 
WHERE ingredient_name = 'Carrots' 
AND EXISTS (SELECT 1 FROM nutrition_reference WHERE ingredient_name = 'Carrot')
AND EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Carrot');

DELETE FROM nutrition_reference 
WHERE ingredient_name = 'Tomatoes' 
AND EXISTS (SELECT 1 FROM nutrition_reference WHERE ingredient_name = 'Tomato')
AND EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Tomato');

-- Delete singular forms if plural exists and inventory uses plural
DELETE FROM nutrition_reference 
WHERE ingredient_name = 'Apple' 
AND EXISTS (SELECT 1 FROM nutrition_reference WHERE ingredient_name = 'Apples')
AND EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Apples');

DELETE FROM nutrition_reference 
WHERE ingredient_name = 'Strawberry' 
AND EXISTS (SELECT 1 FROM nutrition_reference WHERE ingredient_name = 'Strawberries')
AND EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Strawberries');

-- Now update remaining items to match inventory naming
-- Change singular to plural where inventory uses plural
UPDATE nutrition_reference 
SET ingredient_name = 'Apples' 
WHERE ingredient_name = 'Apple'
AND EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Apples')
AND NOT EXISTS (SELECT 1 FROM nutrition_reference WHERE ingredient_name = 'Apples');

UPDATE nutrition_reference 
SET ingredient_name = 'Strawberries' 
WHERE ingredient_name = 'Strawberry'
AND EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Strawberries')
AND NOT EXISTS (SELECT 1 FROM nutrition_reference WHERE ingredient_name = 'Strawberries');

UPDATE nutrition_reference 
SET ingredient_name = 'Lemons' 
WHERE ingredient_name = 'Lemon'
AND EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Lemons')
AND NOT EXISTS (SELECT 1 FROM nutrition_reference WHERE ingredient_name = 'Lemons');

-- Verify the changes
SELECT 
  ci.name as inventory_name,
  nr.ingredient_name as reference_name,
  CASE WHEN ci.name = nr.ingredient_name THEN '✓ Match' ELSE '✗ Mismatch' END as status
FROM cafe_inventory ci
LEFT JOIN nutrition_reference nr ON ci.name = nr.ingredient_name
WHERE ci.vitamin_a_mcg IS NOT NULL
ORDER BY status, ci.name
LIMIT 20;
