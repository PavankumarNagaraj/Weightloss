-- =====================================================
-- STANDARDIZE INGREDIENT NAMES
-- Match nutrition_reference names to cafe_inventory naming conventions
-- =====================================================

-- Update nutrition_reference to match inventory singular/plural forms
-- This ensures consistency across the database

-- Vegetables (match inventory)
UPDATE nutrition_reference SET ingredient_name = 'Onion' WHERE ingredient_name = 'Onions';
UPDATE nutrition_reference SET ingredient_name = 'Carrot' WHERE ingredient_name = 'Carrots';
UPDATE nutrition_reference SET ingredient_name = 'Tomato' WHERE ingredient_name = 'Tomatoes';

-- Fruits (match inventory - most are singular in inventory)
-- Apple, Banana, Mango, Orange, Papaya are already singular - no change needed
-- Grapes and Strawberries might need checking based on inventory

-- Check if inventory has "Strawberries" or "Strawberry"
-- If inventory has "Strawberries", update nutrition_reference
UPDATE nutrition_reference 
SET ingredient_name = 'Strawberries' 
WHERE ingredient_name = 'Strawberry'
AND EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Strawberries');

-- Proteins (remove parentheses to match simpler inventory names if needed)
-- Keep as is since inventory likely has the detailed names

-- Verify the changes
SELECT 
  'After standardization' as status,
  COUNT(*) as total_items,
  COUNT(CASE WHEN vitamin_a_mcg IS NOT NULL THEN 1 END) as items_with_micronutrients
FROM nutrition_reference;

-- Show sample of updated names
SELECT ingredient_name, category, calories, protein
FROM nutrition_reference
WHERE ingredient_name IN ('Onion', 'Carrot', 'Tomato', 'Apple', 'Strawberries')
ORDER BY ingredient_name;
