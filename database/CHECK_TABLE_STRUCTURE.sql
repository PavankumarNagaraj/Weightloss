-- Check the actual column names in cafe_inventory table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'cafe_inventory' 
  AND column_name LIKE '%calor%' 
   OR column_name LIKE '%protein%' 
   OR column_name LIKE '%carb%' 
   OR column_name LIKE '%fat%' 
   OR column_name LIKE '%fiber%'
ORDER BY ordinal_position;

-- Also check what columns exist in the table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'cafe_inventory'
ORDER BY ordinal_position;

-- Check a sample row to see actual column names and values
SELECT * FROM cafe_inventory WHERE name = 'Broccoli' LIMIT 1;
