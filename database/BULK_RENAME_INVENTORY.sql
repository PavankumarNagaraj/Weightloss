-- BULK RENAME INVENTORY ITEMS TO STANDARDIZED NUTRITION DATABASE NAMES
-- Run this in Supabase SQL Editor

-- Update all inventory items to use standardized names from nutrition_reference table

-- Fruits
UPDATE cafe_inventory SET name = 'Apple' WHERE name IN ('Apples', 'Apple');
UPDATE cafe_inventory SET name = 'Banana' WHERE name IN ('Banana', 'Bananas');
UPDATE cafe_inventory SET name = 'Grapes' WHERE name = 'Grapes';
UPDATE cafe_inventory SET name = 'Lemon' WHERE name IN ('Lemons', 'Lemon');
UPDATE cafe_inventory SET name = 'Pineapple' WHERE name = 'Pineapple';
UPDATE cafe_inventory SET name = 'Pomegranate' WHERE name = 'Pomegranate';
UPDATE cafe_inventory SET name = 'Strawberry' WHERE name IN ('Strawberries', 'Strawberry');
UPDATE cafe_inventory SET name = 'Watermelon' WHERE name = 'Watermelon';
UPDATE cafe_inventory SET name = 'Papaya' WHERE name = 'Papaya';

-- Vegetables
UPDATE cafe_inventory SET name = 'Beetroot' WHERE name = 'Beetroot';
UPDATE cafe_inventory SET name = 'Broccoli' WHERE name = 'Broccoli';
UPDATE cafe_inventory SET name = 'Bell Pepper (capsicum)' WHERE name IN ('Capsicum', 'Green Pepper');
UPDATE cafe_inventory SET name = 'Carrots' WHERE name IN ('Carrots', 'Carrot');
UPDATE cafe_inventory SET name = 'Cauliflower' WHERE name = 'Cauliflower';
UPDATE cafe_inventory SET name = 'Cucumber' WHERE name = 'Cucumber';
UPDATE cafe_inventory SET name = 'Garlic' WHERE name IN ('Garlic', 'Peeled Garlic');
UPDATE cafe_inventory SET name = 'Ginger' WHERE name = 'Ginger';
UPDATE cafe_inventory SET name = 'Green Chili' WHERE name IN ('Green Chillies', 'Green Chili');
UPDATE cafe_inventory SET name = 'Onions' WHERE name IN ('Onions', 'Onion');
UPDATE cafe_inventory SET name = 'Green Peas' WHERE name IN ('Peas', 'Green Peas');
UPDATE cafe_inventory SET name = 'Spinach' WHERE name = 'Spinach';
UPDATE cafe_inventory SET name = 'Tomatoes' WHERE name IN ('Tomato', 'Tomatoes');
UPDATE cafe_inventory SET name = 'Cherry Tomato' WHERE name = 'Cherry Tomato';
UPDATE cafe_inventory SET name = 'Sweet Potato' WHERE name = 'Sweet Potato';
UPDATE cafe_inventory SET name = 'Celery' WHERE name = 'Celery';
UPDATE cafe_inventory SET name = 'Brussels Sprouts' WHERE name = 'Brussels Sprouts';

-- Herbs
UPDATE cafe_inventory SET name = 'Coriander Leaves' WHERE name IN ('Coriander Leaves', 'Corriander Leaves');
UPDATE cafe_inventory SET name = 'Mint Leaves' WHERE name = 'Mint Leaves';
UPDATE cafe_inventory SET name = 'Parsley' WHERE name IN ('Fresh Parsely', 'Parsley - Dry');
UPDATE cafe_inventory SET name = 'Rosemary' WHERE name = 'Fresh Rosemary';
UPDATE cafe_inventory SET name = 'Thyme' WHERE name IN ('Fresh thyme', 'Thyme');
UPDATE cafe_inventory SET name = 'Thai Basil' WHERE name = 'Thai Basil';
UPDATE cafe_inventory SET name = 'Curry Leaves' WHERE name = 'Curry Leaves';

-- Proteins
UPDATE cafe_inventory SET name = 'Chicken Breast (cooked)' WHERE name IN ('Chicken', 'Chicken Breast');
UPDATE cafe_inventory SET name = 'Eggs (whole)' WHERE name IN ('Eggs', 'Egg');
UPDATE cafe_inventory SET name = 'Paneer' WHERE name = 'Paneer';

-- Dairy
UPDATE cafe_inventory SET name = 'Milk (whole)' WHERE name IN ('Milk', 'Amul Cream');
UPDATE cafe_inventory SET name = 'Butter' WHERE name = 'Butter';

-- Grains & Cereals
UPDATE cafe_inventory SET name = 'Oats' WHERE name = 'Oats';
UPDATE cafe_inventory SET name = 'Basmati Rice (cooked)' WHERE name = 'Basmati Rice (cooked)';
UPDATE cafe_inventory SET name = 'Rice (brown, cooked)' WHERE name IN ('Brown Rice', 'Brown rice');
UPDATE cafe_inventory SET name = 'Quinoa (cooked)' WHERE name = 'Quinoa';
UPDATE cafe_inventory SET name = 'Bread (whole wheat)' WHERE name IN ('Bread (Brown)', 'Brown Bread');
UPDATE cafe_inventory SET name = 'Corn Starch' WHERE name = 'Corn Starch';
UPDATE cafe_inventory SET name = 'Rice Paper' WHERE name = 'Rice Paper';

-- Pulses & Legumes
UPDATE cafe_inventory SET name = 'Chickpeas (cooked)' WHERE name IN ('Chickpeas', 'White Channa');
UPDATE cafe_inventory SET name = 'Chana Dal (cooked)' WHERE name = 'Chana Dal';
UPDATE cafe_inventory SET name = 'Kidney Beans (cooked)' WHERE name IN ('Kidney Beans (cooked)', 'Rajma');

-- Nuts & Seeds
UPDATE cafe_inventory SET name = 'Almonds' WHERE name = 'Almonds';
UPDATE cafe_inventory SET name = 'Cashews' WHERE name IN ('Cashew nuts', 'Cashews');
UPDATE cafe_inventory SET name = 'Walnuts' WHERE name = 'Wallnut';
UPDATE cafe_inventory SET name = 'Peanuts' WHERE name IN ('Peanuts', 'Roasted Peanuts');
UPDATE cafe_inventory SET name = 'Chia Seeds' WHERE name IN ('Chia seeds', 'Chia Seeds');
UPDATE cafe_inventory SET name = 'Sesame Seeds' WHERE name = 'Sesame';

-- Oils & Fats
UPDATE cafe_inventory SET name = 'Olive Oil' WHERE name = 'Olive Oil';
UPDATE cafe_inventory SET name = 'Coconut Oil' WHERE name IN ('Coconut oil', 'Coconut Oil');
UPDATE cafe_inventory SET name = 'Sesame Oil' WHERE name = 'Sesame Oil';

-- Condiments & Sauces
UPDATE cafe_inventory SET name = 'Honey' WHERE name = 'Honey';
UPDATE cafe_inventory SET name = 'Salt' WHERE name = 'Salt';
UPDATE cafe_inventory SET name = 'Vinegar' WHERE name IN ('Vinegar', 'Balsamic vinegar');
UPDATE cafe_inventory SET name = 'Soy Sauce' WHERE name IN ('Soya sauce', 'Soy Sauce');
UPDATE cafe_inventory SET name = 'Oyster Sauce' WHERE name = 'Oyster Sauce - lee kum lee';
UPDATE cafe_inventory SET name = 'BBQ Sauce' WHERE name = 'BBQ Sauce';
UPDATE cafe_inventory SET name = 'Sriracha' WHERE name = 'Siracha';
UPDATE cafe_inventory SET name = 'Tahini' WHERE name = 'Tahini Paste';
UPDATE cafe_inventory SET name = 'Maple Syrup' WHERE name = 'Maple syrup ';
UPDATE cafe_inventory SET name = 'Date Syrup' WHERE name = 'Dates Syrup';
UPDATE cafe_inventory SET name = 'Brown Sugar' WHERE name = 'Brown Sugar';

-- Spices
UPDATE cafe_inventory SET name = 'Black Pepper' WHERE name IN ('Black Pepper', 'Pepper Corn');
UPDATE cafe_inventory SET name = 'Red Chili Powder' WHERE name IN ('Red Chilli Powder', 'Red Chilli Dry', 'Chilli Flakes');
UPDATE cafe_inventory SET name = 'Cumin Seeds' WHERE name = 'Cumin Seeds';
UPDATE cafe_inventory SET name = 'Cinnamon' WHERE name = 'Cinnamon Powder';
UPDATE cafe_inventory SET name = 'Cloves' WHERE name = 'Cloves';
UPDATE cafe_inventory SET name = 'Garam Masala' WHERE name = 'Garam Masala';
UPDATE cafe_inventory SET name = 'Oregano' WHERE name = 'Oregano';

-- Vegetables (continued)
UPDATE cafe_inventory SET name = 'Corn' WHERE name IN ('Sweet Corn', 'Frozen Corn');
UPDATE cafe_inventory SET name = 'Pickled Jalapenos' WHERE name = 'Jalapenos';

-- Beverages
UPDATE cafe_inventory SET name = 'Tea (green)' WHERE name = 'Green Tea';
UPDATE cafe_inventory SET name = 'Tea (black)' WHERE name = 'Tea Powder';

-- Other items that match database
UPDATE cafe_inventory SET name = 'Lettuce (Iceberg)' WHERE name IN ('Ice Berg', 'Iceberg');
UPDATE cafe_inventory SET name = 'Orange' WHERE name = 'Mosambi';
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
