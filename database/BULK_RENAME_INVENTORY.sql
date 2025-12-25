-- BULK RENAME INVENTORY ITEMS TO STANDARDIZED NUTRITION DATABASE NAMES
-- Run this in Supabase SQL Editor
-- This script merges duplicate items and standardizes names

-- Fruits - Delete duplicates first, then rename
DELETE FROM cafe_inventory WHERE name = 'Apples' AND EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Apple');
UPDATE cafe_inventory SET name = 'Apple' WHERE name = 'Apples';

DELETE FROM cafe_inventory WHERE name = 'Bananas' AND EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Banana');
UPDATE cafe_inventory SET name = 'Banana' WHERE name = 'Bananas';

DELETE FROM cafe_inventory WHERE name = 'Lemons' AND EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Lemon');
UPDATE cafe_inventory SET name = 'Lemon' WHERE name = 'Lemons';

DELETE FROM cafe_inventory WHERE name = 'Strawberries' AND EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Strawberry');
UPDATE cafe_inventory SET name = 'Strawberry' WHERE name = 'Strawberries';

-- Vegetables
DELETE FROM cafe_inventory WHERE name = 'Capsicum' AND EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Bell Pepper (capsicum)');
DELETE FROM cafe_inventory WHERE name = 'Green Pepper' AND EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Bell Pepper (capsicum)');
UPDATE cafe_inventory SET name = 'Bell Pepper (capsicum)' WHERE name IN ('Capsicum', 'Green Pepper');

DELETE FROM cafe_inventory WHERE name = 'Carrot' AND EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Carrots');
UPDATE cafe_inventory SET name = 'Carrot' WHERE name = 'Carrots';

DELETE FROM cafe_inventory WHERE name = 'Peeled Garlic' AND EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Garlic');
UPDATE cafe_inventory SET name = 'Garlic' WHERE name = 'Peeled Garlic';

DELETE FROM cafe_inventory WHERE name = 'Green Chillies' AND EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Green Chili');
UPDATE cafe_inventory SET name = 'Green Chili' WHERE name = 'Green Chillies';

DELETE FROM cafe_inventory WHERE name = 'Onion' AND EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Onions');
UPDATE cafe_inventory SET name = 'Onion' WHERE name = 'Onions';

DELETE FROM cafe_inventory WHERE name = 'Peas' AND EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Green Peas');
UPDATE cafe_inventory SET name = 'Green Peas' WHERE name = 'Peas';

DELETE FROM cafe_inventory WHERE name = 'Tomato' AND EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Tomatoes');
UPDATE cafe_inventory SET name = 'Tomato' WHERE name = 'Tomatoes';

-- Herbs
DELETE FROM cafe_inventory WHERE name = 'Corriander Leaves' AND EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Coriander Leaves');
UPDATE cafe_inventory SET name = 'Coriander Leaves' WHERE name = 'Corriander Leaves';

DELETE FROM cafe_inventory WHERE name = 'Fresh Parsely' AND EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Parsley');
DELETE FROM cafe_inventory WHERE name = 'Parsley - Dry' AND EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Parsley');
UPDATE cafe_inventory SET name = 'Parsley' WHERE name IN ('Fresh Parsely', 'Parsley - Dry');

DELETE FROM cafe_inventory WHERE name = 'Fresh Rosemary' AND EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Rosemary');
UPDATE cafe_inventory SET name = 'Rosemary' WHERE name = 'Fresh Rosemary';

DELETE FROM cafe_inventory WHERE name = 'Fresh thyme' AND EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Thyme');
UPDATE cafe_inventory SET name = 'Thyme' WHERE name = 'Fresh thyme';

-- Proteins
DELETE FROM cafe_inventory WHERE name = 'Chicken' AND EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Chicken Breast (cooked)');
DELETE FROM cafe_inventory WHERE name = 'Chicken Breast' AND EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Chicken Breast (cooked)');
UPDATE cafe_inventory SET name = 'Chicken Breast (cooked)' WHERE name IN ('Chicken', 'Chicken Breast');

DELETE FROM cafe_inventory WHERE name = 'Egg' AND EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Eggs (whole)');
UPDATE cafe_inventory SET name = 'Eggs (whole)' WHERE name IN ('Eggs', 'Egg');

-- Dairy
DELETE FROM cafe_inventory WHERE name = 'Amul Cream' AND EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Milk (whole)');
UPDATE cafe_inventory SET name = 'Milk (whole)' WHERE name IN ('Milk', 'Amul Cream');

-- Grains & Cereals
DELETE FROM cafe_inventory WHERE name = 'Brown rice' AND EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Rice (brown, cooked)');
UPDATE cafe_inventory SET name = 'Rice (brown, cooked)' WHERE name IN ('Brown Rice', 'Brown rice');

DELETE FROM cafe_inventory WHERE name = 'Brown Bread' AND EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Bread (whole wheat)');
UPDATE cafe_inventory SET name = 'Bread (whole wheat)' WHERE name IN ('Bread (Brown)', 'Brown Bread');

-- Pulses & Legumes
DELETE FROM cafe_inventory WHERE name = 'White Channa' AND EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Chickpeas (cooked)');
UPDATE cafe_inventory SET name = 'Chickpeas (cooked)' WHERE name IN ('Chickpeas', 'White Channa');

DELETE FROM cafe_inventory WHERE name = 'Rajma' AND EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Kidney Beans (cooked)');
UPDATE cafe_inventory SET name = 'Kidney Beans (cooked)' WHERE name = 'Rajma';

-- Nuts & Seeds
DELETE FROM cafe_inventory WHERE name = 'Cashew nuts' AND EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Cashews');
UPDATE cafe_inventory SET name = 'Cashews' WHERE name = 'Cashew nuts';

DELETE FROM cafe_inventory WHERE name = 'Wallnut' AND EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Walnuts');
UPDATE cafe_inventory SET name = 'Walnuts' WHERE name = 'Wallnut';

DELETE FROM cafe_inventory WHERE name = 'Roasted Peanuts' AND EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Peanuts');
UPDATE cafe_inventory SET name = 'Peanuts (raw)' WHERE name IN ('Peanuts', 'Roasted Peanuts');

DELETE FROM cafe_inventory WHERE name = 'Chia seeds' AND EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Chia Seeds');
UPDATE cafe_inventory SET name = 'Chia Seeds' WHERE name = 'Chia seeds';

DELETE FROM cafe_inventory WHERE name = 'Sesame' AND EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Sesame Seeds');
UPDATE cafe_inventory SET name = 'Sesame Seeds' WHERE name = 'Sesame';

-- Oils & Fats
DELETE FROM cafe_inventory WHERE name = 'Coconut oil' AND EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Coconut Oil');
UPDATE cafe_inventory SET name = 'Coconut Oil' WHERE name = 'Coconut oil';

-- Condiments & Sauces
DELETE FROM cafe_inventory WHERE name = 'Balsamic vinegar' AND EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Vinegar');
UPDATE cafe_inventory SET name = 'Vinegar' WHERE name = 'Balsamic vinegar';

DELETE FROM cafe_inventory WHERE name = 'Soya sauce' AND EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Soy Sauce');
UPDATE cafe_inventory SET name = 'Soy Sauce' WHERE name = 'Soya sauce';

DELETE FROM cafe_inventory WHERE name = 'Oyster Sauce - lee kum lee' AND EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Oyster Sauce');
UPDATE cafe_inventory SET name = 'Oyster Sauce' WHERE name = 'Oyster Sauce - lee kum lee';

DELETE FROM cafe_inventory WHERE name = 'Siracha' AND EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Sriracha');
UPDATE cafe_inventory SET name = 'Sriracha' WHERE name = 'Siracha';

DELETE FROM cafe_inventory WHERE name = 'Tahini Paste' AND EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Tahini');
UPDATE cafe_inventory SET name = 'Tahini' WHERE name = 'Tahini Paste';

DELETE FROM cafe_inventory WHERE name = 'Maple syrup ' AND EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Maple Syrup');
UPDATE cafe_inventory SET name = 'Maple Syrup' WHERE name = 'Maple syrup ';

DELETE FROM cafe_inventory WHERE name = 'Dates Syrup' AND EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Date Syrup');
UPDATE cafe_inventory SET name = 'Date Syrup' WHERE name = 'Dates Syrup';

-- Spices
DELETE FROM cafe_inventory WHERE name = 'Pepper Corn' AND EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Black Pepper');
UPDATE cafe_inventory SET name = 'Black Pepper' WHERE name = 'Pepper Corn';

DELETE FROM cafe_inventory WHERE name = 'Red Chilli Dry' AND EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Red Chili Powder');
DELETE FROM cafe_inventory WHERE name = 'Chilli Flakes' AND EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Red Chili Powder');
UPDATE cafe_inventory SET name = 'Red Chili Powder' WHERE name IN ('Red Chilli Powder', 'Red Chilli Dry', 'Chilli Flakes');

DELETE FROM cafe_inventory WHERE name = 'Cinnamon Powder' AND EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Cinnamon');
UPDATE cafe_inventory SET name = 'Cinnamon' WHERE name = 'Cinnamon Powder';

-- Vegetables (continued)
DELETE FROM cafe_inventory WHERE name = 'Frozen Corn' AND EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Corn');
UPDATE cafe_inventory SET name = 'Corn' WHERE name IN ('Sweet Corn', 'Frozen Corn');

DELETE FROM cafe_inventory WHERE name = 'Jalapenos' AND EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Pickled Jalapenos');
UPDATE cafe_inventory SET name = 'Pickled Jalapenos' WHERE name = 'Jalapenos';

-- Beverages
DELETE FROM cafe_inventory WHERE name = 'Green Tea' AND EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Tea (green)');
UPDATE cafe_inventory SET name = 'Tea (green)' WHERE name = 'Green Tea';

DELETE FROM cafe_inventory WHERE name = 'Tea Powder' AND EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Tea (black)');
UPDATE cafe_inventory SET name = 'Tea (black)' WHERE name = 'Tea Powder';

-- Other items that match database
DELETE FROM cafe_inventory WHERE name = 'Iceberg' AND EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Lettuce (Iceberg)');
UPDATE cafe_inventory SET name = 'Lettuce (Iceberg)' WHERE name IN ('Ice Berg', 'Iceberg');

DELETE FROM cafe_inventory WHERE name = 'Mosambi' AND EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Orange');
UPDATE cafe_inventory SET name = 'Orange' WHERE name = 'Mosambi';

DELETE FROM cafe_inventory WHERE name = 'Soya' AND EXISTS (SELECT 1 FROM cafe_inventory WHERE name = 'Soy Chunks');
UPDATE cafe_inventory SET name = 'Soy Chunks' WHERE name = 'Soya';

-- Items that don't have exact matches in nutrition database (keep as is or closest match)
-- These are non-food items or brand-specific items:
-- Aluminum Foil, Cling Film, Dish Soap, Disposable Cups, Floor Cleaner, 
-- Garbage Bags, Hand Wash, Sponges, Takeaway Boxes, Tissue Paper
-- Pluckk mixed sprouts (brand-specific)

-- Verify the updates
SELECT name, current_stock, unit, category 
FROM cafe_inventory 
ORDER BY category, name;
