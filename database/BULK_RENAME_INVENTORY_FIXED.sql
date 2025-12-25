-- BULK RENAME INVENTORY ITEMS TO STANDARDIZED NUTRITION DATABASE NAMES
-- This script properly handles duplicates by deleting old variants first

-- Strategy: Delete all old name variants, keeping only the standardized name

-- Fruits
DELETE FROM cafe_inventory WHERE name = 'Apples';
DELETE FROM cafe_inventory WHERE name = 'Bananas';
DELETE FROM cafe_inventory WHERE name = 'Lemons';
DELETE FROM cafe_inventory WHERE name = 'Strawberries';

-- Vegetables
DELETE FROM cafe_inventory WHERE name = 'Capsicum';
DELETE FROM cafe_inventory WHERE name = 'Green Pepper';
DELETE FROM cafe_inventory WHERE name = 'Carrots';
DELETE FROM cafe_inventory WHERE name = 'Peeled Garlic';
DELETE FROM cafe_inventory WHERE name = 'Green Chillies';
DELETE FROM cafe_inventory WHERE name = 'Onions';
DELETE FROM cafe_inventory WHERE name = 'Peas';
DELETE FROM cafe_inventory WHERE name = 'Tomato';

-- Herbs
DELETE FROM cafe_inventory WHERE name = 'Corriander Leaves';
DELETE FROM cafe_inventory WHERE name = 'Fresh Parsely';
DELETE FROM cafe_inventory WHERE name = 'Parsley - Dry';
DELETE FROM cafe_inventory WHERE name = 'Fresh Rosemary';
DELETE FROM cafe_inventory WHERE name = 'Fresh thyme';

-- Proteins
DELETE FROM cafe_inventory WHERE name = 'Chicken';
DELETE FROM cafe_inventory WHERE name = 'Chicken Breast';
DELETE FROM cafe_inventory WHERE name = 'Egg';

-- Dairy
DELETE FROM cafe_inventory WHERE name = 'Milk';
DELETE FROM cafe_inventory WHERE name = 'Amul Cream';

-- Grains
DELETE FROM cafe_inventory WHERE name = 'Brown Rice';
DELETE FROM cafe_inventory WHERE name = 'Brown rice';
DELETE FROM cafe_inventory WHERE name = 'Bread (Brown)';
DELETE FROM cafe_inventory WHERE name = 'Brown Bread';

-- Pulses
DELETE FROM cafe_inventory WHERE name = 'Chickpeas';
DELETE FROM cafe_inventory WHERE name = 'White Channa';
DELETE FROM cafe_inventory WHERE name = 'Chana Dal';
DELETE FROM cafe_inventory WHERE name = 'Rajma';

-- Nuts & Seeds
DELETE FROM cafe_inventory WHERE name = 'Cashew nuts';
DELETE FROM cafe_inventory WHERE name = 'Wallnut';
DELETE FROM cafe_inventory WHERE name = 'Peanuts';
DELETE FROM cafe_inventory WHERE name = 'Roasted Peanuts';
DELETE FROM cafe_inventory WHERE name = 'Chia seeds';
DELETE FROM cafe_inventory WHERE name = 'Sesame';

-- Oils
DELETE FROM cafe_inventory WHERE name = 'Coconut oil';

-- Condiments
DELETE FROM cafe_inventory WHERE name = 'Balsamic vinegar';
DELETE FROM cafe_inventory WHERE name = 'Soya sauce';
DELETE FROM cafe_inventory WHERE name = 'Oyster Sauce - lee kum lee';
DELETE FROM cafe_inventory WHERE name = 'Siracha';
DELETE FROM cafe_inventory WHERE name = 'Tahini Paste';
DELETE FROM cafe_inventory WHERE name = 'Maple syrup ';
DELETE FROM cafe_inventory WHERE name = 'Dates Syrup';

-- Spices
DELETE FROM cafe_inventory WHERE name = 'Pepper Corn';
DELETE FROM cafe_inventory WHERE name = 'Red Chilli Powder';
DELETE FROM cafe_inventory WHERE name = 'Red Chilli Dry';
DELETE FROM cafe_inventory WHERE name = 'Chilli Flakes';
DELETE FROM cafe_inventory WHERE name = 'Cinnamon Powder';

-- Other
DELETE FROM cafe_inventory WHERE name = 'Sweet Corn';
DELETE FROM cafe_inventory WHERE name = 'Frozen Corn';
DELETE FROM cafe_inventory WHERE name = 'Jalapenos';
DELETE FROM cafe_inventory WHERE name = 'Green Tea';
DELETE FROM cafe_inventory WHERE name = 'Tea Powder';
DELETE FROM cafe_inventory WHERE name = 'Ice Berg';
DELETE FROM cafe_inventory WHERE name = 'Iceberg';
DELETE FROM cafe_inventory WHERE name = 'Mosambi';
DELETE FROM cafe_inventory WHERE name = 'Soya';

-- Now add the standardized names if they don't exist
INSERT INTO cafe_inventory (name, current_stock, min_stock, unit, category)
SELECT 'Apple', 0, 250, 'gm', 'Fruits'
WHERE NOT EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Apple');

INSERT INTO cafe_inventory (name, current_stock, min_stock, unit, category)
SELECT 'Banana', 0, 500, 'gm', 'Fruits'
WHERE NOT EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Banana');

INSERT INTO cafe_inventory (name, current_stock, min_stock, unit, category)
SELECT 'Lemon', 0, 3000, 'gm', 'Fruits'
WHERE NOT EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Lemon');

INSERT INTO cafe_inventory (name, current_stock, min_stock, unit, category)
SELECT 'Strawberry', 0, 2000, 'gm', 'Fruits'
WHERE NOT EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Strawberry');

INSERT INTO cafe_inventory (name, current_stock, min_stock, unit, category)
SELECT 'Bell Pepper (capsicum)', 0, 300, 'gm', 'Fresh Produce'
WHERE NOT EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Bell Pepper (capsicum)');

INSERT INTO cafe_inventory (name, current_stock, min_stock, unit, category)
SELECT 'Carrot', 0, 5000, 'gm', 'Fresh Produce'
WHERE NOT EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Carrot');

INSERT INTO cafe_inventory (name, current_stock, min_stock, unit, category)
SELECT 'Garlic', 0, 2000, 'gm', 'Fresh Produce'
WHERE NOT EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Garlic');

INSERT INTO cafe_inventory (name, current_stock, min_stock, unit, category)
SELECT 'Green Chili', 0, 1000, 'gm', 'Fresh Produce'
WHERE NOT EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Green Chili');

INSERT INTO cafe_inventory (name, current_stock, min_stock, unit, category)
SELECT 'Onion', 0, 200, 'gm', 'Fresh Produce'
WHERE NOT EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Onion');

INSERT INTO cafe_inventory (name, current_stock, min_stock, unit, category)
SELECT 'Green Peas', 0, 2000, 'gm', 'Fresh Produce'
WHERE NOT EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Green Peas');

INSERT INTO cafe_inventory (name, current_stock, min_stock, unit, category)
SELECT 'Tomatoes', 0, 200, 'gm', 'Fresh Produce'
WHERE NOT EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Tomatoes');

INSERT INTO cafe_inventory (name, current_stock, min_stock, unit, category)
SELECT 'Coriander Leaves', 0, 4, 'pcs', 'Fresh Produce'
WHERE NOT EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Coriander Leaves');

INSERT INTO cafe_inventory (name, current_stock, min_stock, unit, category)
SELECT 'Parsley', 0, 2, 'gm', 'Dry Store'
WHERE NOT EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Parsley');

INSERT INTO cafe_inventory (name, current_stock, min_stock, unit, category)
SELECT 'Rosemary', 0, 5, 'gm', 'Dry Store'
WHERE NOT EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Rosemary');

INSERT INTO cafe_inventory (name, current_stock, min_stock, unit, category)
SELECT 'Thyme', 0, 5, 'gm', 'Dry Store'
WHERE NOT EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Thyme');

INSERT INTO cafe_inventory (name, current_stock, min_stock, unit, category)
SELECT 'Chicken Breast (cooked)', 0, 1000, 'gm', 'Refrigerated'
WHERE NOT EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Chicken Breast (cooked)');

INSERT INTO cafe_inventory (name, current_stock, min_stock, unit, category)
SELECT 'Eggs (whole)', 0, 100, 'pcs', 'Refrigerated'
WHERE NOT EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Eggs (whole)');

INSERT INTO cafe_inventory (name, current_stock, min_stock, unit, category)
SELECT 'Milk (whole)', 0, 20000, 'ml', 'Refrigerated'
WHERE NOT EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Milk (whole)');

INSERT INTO cafe_inventory (name, current_stock, min_stock, unit, category)
SELECT 'Rice (brown, cooked)', 0, 500, 'gm', 'Dry Store'
WHERE NOT EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Rice (brown, cooked)');

INSERT INTO cafe_inventory (name, current_stock, min_stock, unit, category)
SELECT 'Bread (whole wheat)', 0, 10, 'pcs', 'Dry Store'
WHERE NOT EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Bread (whole wheat)');

INSERT INTO cafe_inventory (name, current_stock, min_stock, unit, category)
SELECT 'Chickpeas (cooked)', 0, 3000, 'gm', 'Dry Store'
WHERE NOT EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Chickpeas (cooked)');

INSERT INTO cafe_inventory (name, current_stock, min_stock, unit, category)
SELECT 'Chana Dal (cooked)', 0, 3000, 'gm', 'Dry Store'
WHERE NOT EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Chana Dal (cooked)');

INSERT INTO cafe_inventory (name, current_stock, min_stock, unit, category)
SELECT 'Kidney Beans (cooked)', 0, 2000, 'gm', 'Fresh Produce'
WHERE NOT EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Kidney Beans (cooked)');

INSERT INTO cafe_inventory (name, current_stock, min_stock, unit, category)
SELECT 'Cashews', 0, 20, 'gm', 'Dry Store'
WHERE NOT EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Cashews');

INSERT INTO cafe_inventory (name, current_stock, min_stock, unit, category)
SELECT 'Walnuts', 0, 20, 'gm', 'Dry Store'
WHERE NOT EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Walnuts');

INSERT INTO cafe_inventory (name, current_stock, min_stock, unit, category)
SELECT 'Peanuts (raw)', 0, 20, 'gm', 'Dry Store'
WHERE NOT EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Peanuts (raw)');

INSERT INTO cafe_inventory (name, current_stock, min_stock, unit, category)
SELECT 'Chia Seeds', 0, 10, 'gm', 'Dry Store'
WHERE NOT EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Chia Seeds');

INSERT INTO cafe_inventory (name, current_stock, min_stock, unit, category)
SELECT 'Sesame Seeds', 0, 50, 'gm', 'Dry Store'
WHERE NOT EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Sesame Seeds');

INSERT INTO cafe_inventory (name, current_stock, min_stock, unit, category)
SELECT 'Coconut Oil', 0, 20, 'gm', 'Dry Store'
WHERE NOT EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Coconut Oil');

INSERT INTO cafe_inventory (name, current_stock, min_stock, unit, category)
SELECT 'Vinegar', 0, 50, 'ml', 'Dry Store'
WHERE NOT EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Vinegar');

INSERT INTO cafe_inventory (name, current_stock, min_stock, unit, category)
SELECT 'Soy Sauce', 0, 20, 'gm', 'Dry Store'
WHERE NOT EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Soy Sauce');

INSERT INTO cafe_inventory (name, current_stock, min_stock, unit, category)
SELECT 'Oyster Sauce', 0, 30, 'gm', 'Dry Store'
WHERE NOT EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Oyster Sauce');

INSERT INTO cafe_inventory (name, current_stock, min_stock, unit, category)
SELECT 'Sriracha', 0, 30, 'ml', 'Dry Store'
WHERE NOT EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Sriracha');

INSERT INTO cafe_inventory (name, current_stock, min_stock, unit, category)
SELECT 'Tahini', 0, 20, 'gm', 'Dry Store'
WHERE NOT EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Tahini');

INSERT INTO cafe_inventory (name, current_stock, min_stock, unit, category)
SELECT 'Maple Syrup', 0, 20, 'gm', 'Dry Store'
WHERE NOT EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Maple Syrup');

INSERT INTO cafe_inventory (name, current_stock, min_stock, unit, category)
SELECT 'Date Syrup', 0, 20, 'gm', 'Dry Store'
WHERE NOT EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Date Syrup');

INSERT INTO cafe_inventory (name, current_stock, min_stock, unit, category)
SELECT 'Black Pepper', 0, 25, 'gm', 'Dry Store'
WHERE NOT EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Black Pepper');

INSERT INTO cafe_inventory (name, current_stock, min_stock, unit, category)
SELECT 'Red Chili Powder', 0, 1000, 'gm', 'Dry Store'
WHERE NOT EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Red Chili Powder');

INSERT INTO cafe_inventory (name, current_stock, min_stock, unit, category)
SELECT 'Cinnamon', 0, 10, 'gm', 'Dry Store'
WHERE NOT EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Cinnamon');

INSERT INTO cafe_inventory (name, current_stock, min_stock, unit, category)
SELECT 'Corn', 0, 3000, 'gm', 'Frozen'
WHERE NOT EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Corn');

INSERT INTO cafe_inventory (name, current_stock, min_stock, unit, category)
SELECT 'Pickled Jalapenos', 0, 30, 'gm', 'Dry Store'
WHERE NOT EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Pickled Jalapenos');

INSERT INTO cafe_inventory (name, current_stock, min_stock, unit, category)
SELECT 'Tea (green)', 0, 3, 'pcs', 'Dry Store'
WHERE NOT EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Tea (green)');

INSERT INTO cafe_inventory (name, current_stock, min_stock, unit, category)
SELECT 'Tea (black)', 0, 50, 'gm', 'Dry Store'
WHERE NOT EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Tea (black)');

INSERT INTO cafe_inventory (name, current_stock, min_stock, unit, category)
SELECT 'Lettuce (Iceberg)', 0, 0, 'gm', 'Dry Store'
WHERE NOT EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Lettuce (Iceberg)');

INSERT INTO cafe_inventory (name, current_stock, min_stock, unit, category)
SELECT 'Orange', 0, 300, 'gm', 'Dry Store'
WHERE NOT EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Orange');

INSERT INTO cafe_inventory (name, current_stock, min_stock, unit, category)
SELECT 'Soy Chunks', 0, 200, 'gm', 'Dry Store'
WHERE NOT EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Soy Chunks');

-- Now update nutrition data from nutrition_reference table for all standardized items
UPDATE cafe_inventory ci
SET 
  calories_per_100g = nr.calories,
  protein_per_100g = nr.protein,
  carbs_per_100g = nr.carbs,
  fat_per_100g = nr.fat,
  fiber_per_100g = nr.fiber
FROM nutrition_reference nr
WHERE ci.name = nr.ingredient_name;

-- Verify the updates
SELECT name, current_stock, unit, category, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g
FROM cafe_inventory 
ORDER BY category, name;
