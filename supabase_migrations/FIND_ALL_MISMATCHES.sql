-- Find ALL naming mismatches between cafe_inventory and nutrition_reference
-- This shows where inventory names don't exactly match reference names

WITH inventory_items AS (
  SELECT DISTINCT name FROM cafe_inventory WHERE vitamin_a_mcg IS NOT NULL
),
reference_items AS (
  SELECT DISTINCT ingredient_name FROM nutrition_reference WHERE vitamin_a_mcg IS NOT NULL
)
SELECT 
  i.name as inventory_name,
  r.ingredient_name as reference_name,
  CASE 
    WHEN i.name = r.ingredient_name THEN 'Exact Match'
    WHEN LOWER(i.name) = LOWER(r.ingredient_name) THEN 'Case Mismatch'
    WHEN LOWER(i.name) || 's' = LOWER(r.ingredient_name) THEN 'Inventory Singular, Reference Plural'
    WHEN LOWER(i.name) = LOWER(r.ingredient_name) || 's' THEN 'Inventory Plural, Reference Singular'
    ELSE 'Other Mismatch'
  END as mismatch_type
FROM inventory_items i
LEFT JOIN reference_items r ON LOWER(i.name) = LOWER(r.ingredient_name)
WHERE r.ingredient_name IS NULL
  OR i.name != r.ingredient_name
ORDER BY mismatch_type, i.name;
