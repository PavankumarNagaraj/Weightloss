-- Find inventory items that don't have nutrition data
SELECT name, category, unit
FROM cafe_inventory 
WHERE calories_per_100g IS NULL
ORDER BY category, name;

-- Check if these items exist in nutrition_reference with similar names
SELECT ci.name as inventory_name, nr.ingredient_name as nutrition_name
FROM cafe_inventory ci
LEFT JOIN nutrition_reference nr ON LOWER(ci.name) LIKE '%' || LOWER(SPLIT_PART(nr.ingredient_name, ' ', 1)) || '%'
WHERE ci.calories_per_100g IS NULL
  AND nr.ingredient_name IS NOT NULL
LIMIT 50;
