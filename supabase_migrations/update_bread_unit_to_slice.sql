-- Update bread inventory items from 'pcs' to 'slice'
-- This ensures consistency across all bread items in the system

-- Update Bread (White) unit from pcs to slice
UPDATE cafe_inventory 
SET unit = 'slice'
WHERE name ILIKE '%Bread (White)%' 
  AND unit = 'pcs';

-- Update Bread (Brown) unit from pcs to slice
UPDATE cafe_inventory 
SET unit = 'slice'
WHERE name ILIKE '%Bread (Brown)%' 
  AND unit = 'pcs';

-- Update any variations of white bread
UPDATE cafe_inventory 
SET unit = 'slice'
WHERE (name ILIKE '%white bread%' OR name ILIKE '%bread white%')
  AND unit = 'pcs';

-- Update any variations of brown bread
UPDATE cafe_inventory 
SET unit = 'slice'
WHERE (name ILIKE '%brown bread%' OR name ILIKE '%bread brown%' OR name ILIKE '%whole wheat bread%')
  AND unit = 'pcs';

-- Update bread items in menu rawMaterials (stored as JSONB)
-- This updates the unit field within the rawMaterials JSONB array
UPDATE cafe_menu
SET raw_materials = (
  SELECT jsonb_agg(
    CASE 
      WHEN elem->>'name' ILIKE '%Bread (White)%' OR 
           elem->>'name' ILIKE '%white bread%' OR
           elem->>'name' ILIKE '%Bread (Brown)%' OR
           elem->>'name' ILIKE '%brown bread%' OR
           elem->>'name' ILIKE '%whole wheat bread%'
      THEN jsonb_set(elem, '{unit}', '"slice"')
      ELSE elem
    END
  )
  FROM jsonb_array_elements(raw_materials) AS elem
)
WHERE raw_materials IS NOT NULL
  AND EXISTS (
    SELECT 1 
    FROM jsonb_array_elements(raw_materials) AS elem
    WHERE (elem->>'name' ILIKE '%bread%')
      AND (elem->>'unit' = 'pcs')
  );

-- Log the changes
DO $$
DECLARE
  inventory_count INTEGER;
  menu_count INTEGER;
BEGIN
  -- Count updated inventory items
  SELECT COUNT(*) INTO inventory_count
  FROM cafe_inventory
  WHERE (name ILIKE '%bread%') AND unit = 'slice';
  
  -- Count menu items with bread
  SELECT COUNT(*) INTO menu_count
  FROM cafe_menu
  WHERE raw_materials IS NOT NULL
    AND EXISTS (
      SELECT 1 
      FROM jsonb_array_elements(raw_materials) AS elem
      WHERE elem->>'name' ILIKE '%bread%'
    );
  
  RAISE NOTICE 'Updated % bread inventory items to use "slice" unit', inventory_count;
  RAISE NOTICE 'Found % menu items containing bread ingredients', menu_count;
END $$;

-- Add comment for documentation
COMMENT ON TABLE cafe_inventory IS 'Inventory tracking - Bread items use "slice" as unit instead of "pcs" to represent individual bread slices';
