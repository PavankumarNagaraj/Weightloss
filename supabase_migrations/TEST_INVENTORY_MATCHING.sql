-- =====================================================
-- TEST QUERY - Verify cafe_inventory matching with nutrition_reference
-- Run this BEFORE running 99_add_micronutrients_to_dishes.sql
-- =====================================================

-- Test 1: Show which inventory items will match with nutrition_reference
SELECT 
  ci.name as inventory_name,
  nr.ingredient_name as nutrition_ref_name,
  CASE 
    WHEN LOWER(ci.name) = LOWER(nr.ingredient_name) THEN 'Exact match'
    WHEN LOWER(ci.name) = LOWER(nr.ingredient_name) || 's' THEN 'Plural added'
    WHEN LOWER(ci.name) || 's' = LOWER(nr.ingredient_name) THEN 'Plural removed'
    WHEN LOWER(ci.name) = LOWER(REGEXP_REPLACE(nr.ingredient_name, '\s*\([^)]*\)', '', 'g')) THEN 'Without parentheses'
    WHEN LOWER(ci.name) LIKE '%' || LOWER(REGEXP_REPLACE(nr.ingredient_name, '\s*\([^)]*\)', '', 'g')) || '%' THEN 'Partial match (inventory contains ref)'
    WHEN LOWER(nr.ingredient_name) LIKE '%' || LOWER(ci.name) || '%' THEN 'Partial match (ref contains inventory)'
    ELSE 'Manual mapping'
  END as match_type,
  nr.vitamin_c_mg,
  nr.calcium_mg,
  nr.iron_mg
FROM cafe_inventory ci
JOIN nutrition_reference nr ON (
  LOWER(ci.name) = LOWER(nr.ingredient_name)
  OR LOWER(ci.name) = LOWER(nr.ingredient_name) || 's'
  OR LOWER(ci.name) || 's' = LOWER(nr.ingredient_name)
  OR LOWER(ci.name) = LOWER(REGEXP_REPLACE(nr.ingredient_name, '\s*\([^)]*\)', '', 'g'))
  OR LOWER(ci.name) LIKE '%' || LOWER(REGEXP_REPLACE(nr.ingredient_name, '\s*\([^)]*\)', '', 'g')) || '%'
  OR LOWER(nr.ingredient_name) LIKE '%' || LOWER(ci.name) || '%'
  OR (LOWER(ci.name) = 'peanuts (raw)' AND LOWER(nr.ingredient_name) = 'peanuts')
  OR (LOWER(ci.name) = 'chana dal (cooked)' AND LOWER(nr.ingredient_name) = 'chickpeas (cooked)')
  OR (LOWER(ci.name) = 'onion' AND LOWER(nr.ingredient_name) = 'onions')
  OR (LOWER(ci.name) = 'carrot' AND LOWER(nr.ingredient_name) = 'carrots')
)
WHERE nr.vitamin_a_mcg IS NOT NULL
ORDER BY ci.name;

-- Test 2: Show inventory items that WON'T match
SELECT 
  ci.name as unmatched_inventory_item,
  ci.category
FROM cafe_inventory ci
WHERE NOT EXISTS (
  SELECT 1 FROM nutrition_reference nr
  WHERE (
    LOWER(ci.name) = LOWER(nr.ingredient_name)
    OR LOWER(ci.name) = LOWER(nr.ingredient_name) || 's'
    OR LOWER(ci.name) || 's' = LOWER(nr.ingredient_name)
    OR LOWER(ci.name) = LOWER(REGEXP_REPLACE(nr.ingredient_name, '\s*\([^)]*\)', '', 'g'))
    OR LOWER(ci.name) LIKE '%' || LOWER(REGEXP_REPLACE(nr.ingredient_name, '\s*\([^)]*\)', '', 'g')) || '%'
    OR LOWER(nr.ingredient_name) LIKE '%' || LOWER(ci.name) || '%'
    OR (LOWER(ci.name) = 'peanuts (raw)' AND LOWER(nr.ingredient_name) = 'peanuts')
    OR (LOWER(ci.name) = 'chana dal (cooked)' AND LOWER(nr.ingredient_name) = 'chickpeas (cooked)')
    OR (LOWER(ci.name) = 'onion' AND LOWER(nr.ingredient_name) = 'onions')
    OR (LOWER(ci.name) = 'carrot' AND LOWER(nr.ingredient_name) = 'carrots')
  )
  AND nr.vitamin_a_mcg IS NOT NULL
)
ORDER BY ci.name;

-- Test 3: Count matching statistics
SELECT 
  'Total inventory items' as metric,
  COUNT(*) as count
FROM cafe_inventory
UNION ALL
SELECT 
  'Items that will match',
  COUNT(DISTINCT ci.name)
FROM cafe_inventory ci
WHERE EXISTS (
  SELECT 1 FROM nutrition_reference nr
  WHERE (
    LOWER(ci.name) = LOWER(nr.ingredient_name)
    OR LOWER(ci.name) = LOWER(nr.ingredient_name) || 's'
    OR LOWER(ci.name) || 's' = LOWER(nr.ingredient_name)
    OR LOWER(ci.name) = LOWER(REGEXP_REPLACE(nr.ingredient_name, '\s*\([^)]*\)', '', 'g'))
    OR LOWER(ci.name) LIKE '%' || LOWER(REGEXP_REPLACE(nr.ingredient_name, '\s*\([^)]*\)', '', 'g')) || '%'
    OR LOWER(nr.ingredient_name) LIKE '%' || LOWER(ci.name) || '%'
    OR (LOWER(ci.name) = 'peanuts (raw)' AND LOWER(nr.ingredient_name) = 'peanuts')
    OR (LOWER(ci.name) = 'chana dal (cooked)' AND LOWER(nr.ingredient_name) = 'chickpeas (cooked)')
    OR (LOWER(ci.name) = 'onion' AND LOWER(nr.ingredient_name) = 'onions')
    OR (LOWER(ci.name) = 'carrot' AND LOWER(nr.ingredient_name) = 'carrots')
  )
  AND nr.vitamin_a_mcg IS NOT NULL
)
UNION ALL
SELECT 
  'Items that WON''T match',
  COUNT(*)
FROM cafe_inventory ci
WHERE NOT EXISTS (
  SELECT 1 FROM nutrition_reference nr
  WHERE (
    LOWER(ci.name) = LOWER(nr.ingredient_name)
    OR LOWER(ci.name) = LOWER(nr.ingredient_name) || 's'
    OR LOWER(ci.name) || 's' = LOWER(nr.ingredient_name)
    OR LOWER(ci.name) = LOWER(REGEXP_REPLACE(nr.ingredient_name, '\s*\([^)]*\)', '', 'g'))
    OR LOWER(ci.name) LIKE '%' || LOWER(REGEXP_REPLACE(nr.ingredient_name, '\s*\([^)]*\)', '', 'g')) || '%'
    OR LOWER(nr.ingredient_name) LIKE '%' || LOWER(ci.name) || '%'
    OR (LOWER(ci.name) = 'peanuts (raw)' AND LOWER(nr.ingredient_name) = 'peanuts')
    OR (LOWER(ci.name) = 'chana dal (cooked)' AND LOWER(nr.ingredient_name) = 'chickpeas (cooked)')
    OR (LOWER(ci.name) = 'onion' AND LOWER(nr.ingredient_name) = 'onions')
    OR (LOWER(ci.name) = 'carrot' AND LOWER(nr.ingredient_name) = 'carrots')
  )
  AND nr.vitamin_a_mcg IS NOT NULL
);

-- Test 4: Specific test for "Apple" example
SELECT 
  ci.name as inventory_name,
  nr.ingredient_name as nutrition_ref_name,
  nr.vitamin_c_mg,
  nr.calcium_mg,
  nr.iron_mg
FROM cafe_inventory ci
JOIN nutrition_reference nr ON (
  LOWER(ci.name) = LOWER(nr.ingredient_name)
  OR LOWER(ci.name) = LOWER(nr.ingredient_name) || 's'
  OR LOWER(ci.name) || 's' = LOWER(nr.ingredient_name)
  OR LOWER(nr.ingredient_name) LIKE '%' || LOWER(ci.name) || '%'
)
WHERE LOWER(ci.name) = 'apple'
AND nr.vitamin_a_mcg IS NOT NULL;
