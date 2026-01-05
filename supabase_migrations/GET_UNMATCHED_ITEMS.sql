-- Get the list of unmatched inventory items with suggestions
SELECT 
  ci.name as unmatched_inventory_item,
  ci.category,
  -- Try to find close matches in nutrition_reference
  (
    SELECT STRING_AGG(nr2.ingredient_name, ', ')
    FROM nutrition_reference nr2
    WHERE (
      LOWER(nr2.ingredient_name) LIKE '%' || LOWER(SPLIT_PART(ci.name, ' ', 1)) || '%'
      OR LOWER(ci.name) LIKE '%' || LOWER(SPLIT_PART(nr2.ingredient_name, ' ', 1)) || '%'
    )
    AND nr2.vitamin_a_mcg IS NOT NULL
    LIMIT 3
  ) as possible_matches
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
ORDER BY ci.category, ci.name;
