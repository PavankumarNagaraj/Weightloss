-- Check current naming conventions in cafe_inventory vs nutrition_reference
-- This helps identify which form (singular/plural) to standardize to

-- Common items that might have singular/plural variations
WITH inventory_names AS (
  SELECT DISTINCT name, category
  FROM cafe_inventory
  WHERE LOWER(name) IN (
    'onion', 'onions', 
    'carrot', 'carrots', 
    'tomato', 'tomatoes',
    'strawberry', 'strawberries',
    'apple', 'apples',
    'lemon', 'lemons',
    'potato', 'potatoes',
    'cucumber', 'cucumbers'
  )
),
reference_names AS (
  SELECT DISTINCT ingredient_name, category
  FROM nutrition_reference
  WHERE LOWER(ingredient_name) IN (
    'onion', 'onions', 
    'carrot', 'carrots', 
    'tomato', 'tomatoes',
    'strawberry', 'strawberries',
    'apple', 'apples',
    'lemon', 'lemons',
    'potato', 'potatoes',
    'cucumber', 'cucumbers'
  )
)
SELECT 
  COALESCE(i.name, r.ingredient_name) as item_name,
  i.name as in_inventory,
  r.ingredient_name as in_reference,
  CASE 
    WHEN i.name IS NULL THEN 'Only in reference'
    WHEN r.ingredient_name IS NULL THEN 'Only in inventory'
    WHEN i.name = r.ingredient_name THEN 'Match'
    ELSE 'Mismatch'
  END as status
FROM inventory_names i
FULL OUTER JOIN reference_names r 
  ON LOWER(i.name) = LOWER(r.ingredient_name)
ORDER BY item_name;
