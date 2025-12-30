-- DIAGNOSTIC: Check if bread items exist and their current units
-- Run this in Supabase SQL Editor to see what's in your database

-- 1. Check ALL inventory items (to see if table has data)
SELECT COUNT(*) as total_inventory_items FROM cafe_inventory;

-- 2. Check specifically for bread items
SELECT 
  name,
  unit,
  current_stock,
  category
FROM cafe_inventory
WHERE name ILIKE '%bread%'
ORDER BY name;

-- 3. If no bread items found, check what items DO exist
SELECT 
  name,
  unit,
  category
FROM cafe_inventory
ORDER BY name
LIMIT 20;

-- 4. Check if the column 'unit' exists in cafe_inventory
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'cafe_inventory' 
  AND column_name = 'unit';
