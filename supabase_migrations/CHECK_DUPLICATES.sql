-- Check for existing singular/plural forms in nutrition_reference
SELECT 
  ingredient_name,
  category,
  calories,
  protein,
  vitamin_a_mcg IS NOT NULL as has_micronutrients
FROM nutrition_reference
WHERE LOWER(ingredient_name) IN (
  'onion', 'onions',
  'carrot', 'carrots',
  'tomato', 'tomatoes',
  'strawberry', 'strawberries',
  'potato', 'potatoes',
  'cucumber', 'cucumbers',
  'lemon', 'lemons'
)
ORDER BY 
  CASE 
    WHEN LOWER(ingredient_name) LIKE '%onion%' THEN 1
    WHEN LOWER(ingredient_name) LIKE '%carrot%' THEN 2
    WHEN LOWER(ingredient_name) LIKE '%tomato%' THEN 3
    WHEN LOWER(ingredient_name) LIKE '%strawberr%' THEN 4
    WHEN LOWER(ingredient_name) LIKE '%potato%' THEN 5
    WHEN LOWER(ingredient_name) LIKE '%cucumber%' THEN 6
    WHEN LOWER(ingredient_name) LIKE '%lemon%' THEN 7
  END,
  ingredient_name;
