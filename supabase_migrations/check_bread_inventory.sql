-- Check current bread inventory items
SELECT 
  id,
  name,
  unit,
  current_stock,
  min_stock,
  category,
  last_updated
FROM cafe_inventory
WHERE name ILIKE '%bread%'
ORDER BY name;

-- Check if any bread items exist at all
SELECT COUNT(*) as total_bread_items
FROM cafe_inventory
WHERE name ILIKE '%bread%';

-- Check menu items with bread in rawMaterials
SELECT 
  id,
  name,
  raw_materials
FROM cafe_menu
WHERE raw_materials::text ILIKE '%bread%'
LIMIT 5;
