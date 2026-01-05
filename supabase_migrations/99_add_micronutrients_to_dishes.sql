-- =====================================================
-- Add micronutrient columns to cafe_inventory and cafe_menu tables
-- This allows tracking micronutrients for existing dishes and inventory items
-- =====================================================

-- Add micronutrient columns to cafe_inventory (raw materials)
ALTER TABLE cafe_inventory
ADD COLUMN IF NOT EXISTS vitamin_a_mcg NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS vitamin_c_mg NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS vitamin_d_mcg NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS vitamin_e_mg NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS vitamin_k_mcg NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS vitamin_b1_mg NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS vitamin_b2_mg NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS vitamin_b3_mg NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS vitamin_b6_mg NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS vitamin_b12_mcg NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS folate_mcg NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS calcium_mg NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS iron_mg NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS magnesium_mg NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS phosphorus_mg NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS potassium_mg NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS sodium_mg NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS zinc_mg NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS copper_mg NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS manganese_mg NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS selenium_mcg NUMERIC(10, 2);

-- Add micronutrient columns to cafe_menu (dishes)
ALTER TABLE cafe_menu
ADD COLUMN IF NOT EXISTS vitamin_a_mcg NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS vitamin_c_mg NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS vitamin_d_mcg NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS vitamin_e_mg NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS vitamin_k_mcg NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS vitamin_b1_mg NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS vitamin_b2_mg NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS vitamin_b3_mg NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS vitamin_b6_mg NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS vitamin_b12_mcg NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS folate_mcg NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS calcium_mg NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS iron_mg NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS magnesium_mg NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS phosphorus_mg NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS potassium_mg NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS sodium_mg NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS zinc_mg NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS copper_mg NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS manganese_mg NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS selenium_mcg NUMERIC(10, 2);

-- Populate cafe_inventory micronutrients from nutrition_reference
-- Match by ingredient name with fuzzy matching for plural/singular variations
UPDATE cafe_inventory ci
SET 
  vitamin_a_mcg = nr.vitamin_a_mcg,
  vitamin_c_mg = nr.vitamin_c_mg,
  vitamin_d_mcg = nr.vitamin_d_mcg,
  vitamin_e_mg = nr.vitamin_e_mg,
  vitamin_k_mcg = nr.vitamin_k_mcg,
  vitamin_b1_mg = nr.vitamin_b1_mg,
  vitamin_b2_mg = nr.vitamin_b2_mg,
  vitamin_b3_mg = nr.vitamin_b3_mg,
  vitamin_b6_mg = nr.vitamin_b6_mg,
  vitamin_b12_mcg = nr.vitamin_b12_mcg,
  folate_mcg = nr.folate_mcg,
  calcium_mg = nr.calcium_mg,
  iron_mg = nr.iron_mg,
  magnesium_mg = nr.magnesium_mg,
  phosphorus_mg = nr.phosphorus_mg,
  potassium_mg = nr.potassium_mg,
  sodium_mg = nr.sodium_mg,
  zinc_mg = nr.zinc_mg,
  copper_mg = nr.copper_mg,
  manganese_mg = nr.manganese_mg,
  selenium_mcg = nr.selenium_mcg
FROM nutrition_reference nr
WHERE (
  -- Exact match
  LOWER(ci.name) = LOWER(nr.ingredient_name)
  -- Match with 's' added (Apple -> Apples)
  OR LOWER(ci.name) = LOWER(nr.ingredient_name) || 's'
  -- Match with 's' removed (Onions -> Onion)
  OR LOWER(ci.name) || 's' = LOWER(nr.ingredient_name)
  -- Match without parentheses content (Chicken Breast (cooked) -> Chicken Breast)
  OR LOWER(ci.name) = LOWER(REGEXP_REPLACE(nr.ingredient_name, '\s*\([^)]*\)', '', 'g'))
  -- Partial match - inventory name contains reference name
  OR LOWER(ci.name) LIKE '%' || LOWER(REGEXP_REPLACE(nr.ingredient_name, '\s*\([^)]*\)', '', 'g')) || '%'
  -- Partial match - reference name contains inventory name
  OR LOWER(nr.ingredient_name) LIKE '%' || LOWER(ci.name) || '%'
)
AND nr.vitamin_a_mcg IS NOT NULL;

-- Manual mappings for items that don't match automatically
-- Handle special cases where names differ significantly
UPDATE cafe_inventory ci
SET 
  vitamin_a_mcg = nr.vitamin_a_mcg,
  vitamin_c_mg = nr.vitamin_c_mg,
  vitamin_d_mcg = nr.vitamin_d_mcg,
  vitamin_e_mg = nr.vitamin_e_mg,
  vitamin_k_mcg = nr.vitamin_k_mcg,
  vitamin_b1_mg = nr.vitamin_b1_mg,
  vitamin_b2_mg = nr.vitamin_b2_mg,
  vitamin_b3_mg = nr.vitamin_b3_mg,
  vitamin_b6_mg = nr.vitamin_b6_mg,
  vitamin_b12_mcg = nr.vitamin_b12_mcg,
  folate_mcg = nr.folate_mcg,
  calcium_mg = nr.calcium_mg,
  iron_mg = nr.iron_mg,
  magnesium_mg = nr.magnesium_mg,
  phosphorus_mg = nr.phosphorus_mg,
  potassium_mg = nr.potassium_mg,
  sodium_mg = nr.sodium_mg,
  zinc_mg = nr.zinc_mg,
  copper_mg = nr.copper_mg,
  manganese_mg = nr.manganese_mg,
  selenium_mcg = nr.selenium_mcg
FROM nutrition_reference nr
WHERE ci.vitamin_a_mcg IS NULL  -- Only update items not already matched
AND (
  -- Original mappings
  (LOWER(ci.name) = 'peanuts (raw)' AND LOWER(nr.ingredient_name) = 'peanuts')
  OR (LOWER(ci.name) = 'chana dal (cooked)' AND LOWER(nr.ingredient_name) = 'chickpeas (cooked)')
  OR (LOWER(ci.name) = 'onion' AND LOWER(nr.ingredient_name) = 'onions')
  OR (LOWER(ci.name) = 'carrot' AND LOWER(nr.ingredient_name) = 'carrots')
  
  -- New mappings from unmatched list
  OR (LOWER(ci.name) = 'cherry tomato' AND LOWER(nr.ingredient_name) = 'tomatoes')
  OR (LOWER(ci.name) = 'red chilli powder' AND LOWER(nr.ingredient_name) = 'green chili')
  OR (LOWER(ci.name) = 'sesame oil' AND LOWER(nr.ingredient_name) = 'sesame seeds')
  OR (LOWER(ci.name) = 'lemons' AND LOWER(nr.ingredient_name) = 'lemon')
  OR (LOWER(ci.name) = 'strawberries' AND LOWER(nr.ingredient_name) = 'strawberry')
  OR (LOWER(ci.name) = 'frozen peas' AND LOWER(nr.ingredient_name) = 'green peas')
  OR (LOWER(ci.name) = 'brown channa' AND LOWER(nr.ingredient_name) = 'chickpeas (cooked)')
  OR (LOWER(ci.name) = 'beans sticks' AND LOWER(nr.ingredient_name) = 'green beans')
  OR (LOWER(ci.name) = 'horse gram' AND LOWER(nr.ingredient_name) = 'kulthi dal')
)
AND nr.vitamin_a_mcg IS NOT NULL;

-- Log how many inventory items were updated
DO $$
DECLARE
  updated_count INTEGER;
  total_count INTEGER;
  rec RECORD;
BEGIN
  SELECT COUNT(*) INTO updated_count
  FROM cafe_inventory
  WHERE vitamin_a_mcg IS NOT NULL;
  
  SELECT COUNT(*) INTO total_count
  FROM cafe_inventory;
  
  RAISE NOTICE 'Updated % out of % inventory items with micronutrient data', updated_count, total_count;
  
  -- Show items that didn't match
  RAISE NOTICE 'Items without micronutrient data:';
  FOR rec IN 
    SELECT name FROM cafe_inventory WHERE vitamin_a_mcg IS NULL ORDER BY name
  LOOP
    RAISE NOTICE '  - %', rec.name;
  END LOOP;
END $$;

-- Note: cafe_menu micronutrients should be calculated from raw_materials
-- This will be handled in the application layer (CafeMenu.jsx)
-- The raw_materials JSONB contains ingredient quantities, and we'll sum up
-- the micronutrients based on the quantities and nutrition_reference data

COMMENT ON COLUMN cafe_inventory.vitamin_a_mcg IS 'Vitamin A content in micrograms per 100g';
COMMENT ON COLUMN cafe_inventory.calcium_mg IS 'Calcium content in milligrams per 100g';
COMMENT ON COLUMN cafe_inventory.iron_mg IS 'Iron content in milligrams per 100g';

COMMENT ON COLUMN cafe_menu.vitamin_a_mcg IS 'Total Vitamin A content in micrograms per serving (calculated from raw_materials)';
COMMENT ON COLUMN cafe_menu.calcium_mg IS 'Total Calcium content in milligrams per serving (calculated from raw_materials)';
COMMENT ON COLUMN cafe_menu.iron_mg IS 'Total Iron content in milligrams per serving (calculated from raw_materials)';
