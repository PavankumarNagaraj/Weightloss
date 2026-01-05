-- List the 30 items without micronutrients
SELECT 
  name,
  category,
  current_stock,
  unit
FROM cafe_inventory
WHERE vitamin_a_mcg IS NULL
ORDER BY category, name;
