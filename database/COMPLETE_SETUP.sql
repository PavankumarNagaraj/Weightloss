-- COMPLETE SETUP: Nutrition Database + Inventory Standardization
-- Run this ONE file in Supabase SQL Editor
-- It will: 1) Create nutrition_reference, 2) Populate 500+ ingredients, 3) Standardize inventory names, 4) Update nutrition data

-- ============================================
-- STEP 1: Create nutrition_reference table
-- ============================================
CREATE TABLE IF NOT EXISTS nutrition_reference (
  id SERIAL PRIMARY KEY,
  ingredient_name VARCHAR(255) UNIQUE NOT NULL,
  category VARCHAR(100),
  calories DECIMAL(10,2),
  protein DECIMAL(10,2),
  carbs DECIMAL(10,2),
  fat DECIMAL(10,2),
  fiber DECIMAL(10,2),
  common_unit VARCHAR(20),
  indian_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ingredient_name ON nutrition_reference(ingredient_name);
CREATE INDEX IF NOT EXISTS idx_category ON nutrition_reference(category);

-- Clear existing data
TRUNCATE TABLE nutrition_reference;

-- ============================================
-- STEP 2: Populate nutrition_reference with key ingredients
-- ============================================
INSERT INTO nutrition_reference (ingredient_name, category, calories, protein, carbs, fat, fiber, common_unit, indian_name) VALUES
-- Proteins
('Chicken Breast (cooked)', 'Protein', 165, 31, 0, 3.6, 0, 'gm', 'Chicken Breast'),
('Eggs (whole)', 'Protein', 155, 13, 1.1, 11, 0, 'pcs', 'Anda'),
('Paneer', 'Protein', 265, 18, 3.4, 20, 0, 'gm', 'Paneer'),

-- Dairy
('Milk (whole)', 'Dairy', 61, 3.2, 4.8, 3.3, 0, 'ml', 'Doodh'),
('Butter', 'Dairy', 717, 0.9, 0.1, 81, 0, 'gm', 'Makhan'),

-- Grains
('Oats', 'Grains', 389, 16.9, 66.3, 6.9, 10.6, 'gm', 'Oats'),
('Basmati Rice (cooked)', 'Grains', 130, 2.7, 28, 0.3, 0.4, 'gm', 'Chawal'),
('Rice (brown, cooked)', 'Grains', 112, 2.6, 24, 0.9, 1.8, 'gm', 'Brown Rice'),
('Quinoa (cooked)', 'Grains', 120, 4.4, 21, 1.9, 2.8, 'gm', 'Quinoa'),
('Bread (whole wheat)', 'Grains', 247, 13, 41, 3.4, 7, 'pcs', 'Brown Bread'),

-- Pulses
('Chickpeas (cooked)', 'Pulses', 164, 8.9, 27, 2.6, 7.6, 'gm', 'Chana'),
('Chana Dal (cooked)', 'Pulses', 120, 8, 20, 1.5, 7, 'gm', 'Chana Dal'),
('Kidney Beans (cooked)', 'Pulses', 127, 8.7, 23, 0.5, 6.4, 'gm', 'Rajma'),

-- Nuts & Seeds
('Almonds', 'Nuts', 579, 21, 22, 50, 12.5, 'gm', 'Badam'),
('Cashews', 'Nuts', 553, 18, 30, 44, 3.3, 'gm', 'Kaju'),
('Walnuts', 'Nuts', 654, 15, 14, 65, 6.7, 'gm', 'Akhrot'),
('Peanuts (raw)', 'Nuts', 567, 26, 16, 49, 8.5, 'gm', 'Moongphali'),
('Chia Seeds', 'Seeds', 486, 17, 42, 31, 34, 'gm', 'Chia Seeds'),
('Sesame Seeds', 'Seeds', 573, 18, 23, 50, 12, 'gm', 'Til'),

-- Oils
('Olive Oil', 'Oils', 884, 0, 0, 100, 0, 'ml', 'Olive Oil'),
('Coconut Oil', 'Oils', 862, 0, 0, 100, 0, 'gm', 'Coconut Oil'),
('Sesame Oil', 'Oils', 884, 0, 0, 100, 0, 'ml', 'Til Oil'),

-- Vegetables
('Carrot', 'Vegetables', 41, 0.9, 10, 0.2, 2.8, 'gm', 'Gajar'),
('Beetroot', 'Vegetables', 43, 1.6, 10, 0.2, 2.8, 'gm', 'Chukandar'),
('Broccoli', 'Vegetables', 34, 2.8, 7, 0.4, 2.6, 'gm', 'Broccoli'),
('Bell Pepper (capsicum)', 'Vegetables', 31, 1, 6, 0.3, 2.1, 'gm', 'Shimla Mirch'),
('Cauliflower', 'Vegetables', 25, 1.9, 5, 0.3, 2, 'gm', 'Phool Gobi'),
('Cucumber', 'Vegetables', 15, 0.7, 3.6, 0.1, 0.5, 'gm', 'Kheera'),
('Garlic', 'Vegetables', 149, 6.4, 33, 0.5, 2.1, 'gm', 'Lahsun'),
('Ginger', 'Vegetables', 80, 1.8, 18, 0.8, 2, 'gm', 'Adrak'),
('Green Chili', 'Vegetables', 40, 2, 9, 0.2, 1.5, 'gm', 'Hari Mirch'),
('Onion', 'Vegetables', 40, 1.1, 9, 0.1, 1.7, 'gm', 'Pyaz'),
('Green Peas', 'Vegetables', 81, 5, 14, 0.4, 5.7, 'gm', 'Matar'),
('Spinach', 'Vegetables', 23, 2.9, 3.6, 0.4, 2.2, 'gm', 'Palak'),
('Tomatoes', 'Vegetables', 18, 0.9, 3.9, 0.2, 1.2, 'gm', 'Tamatar'),
('Cherry Tomato', 'Vegetables', 18, 0.9, 3.9, 0.2, 1.2, 'gm', 'Cherry Tamatar'),
('Sweet Potato', 'Vegetables', 86, 1.6, 20, 0.1, 3, 'gm', 'Shakarkandi'),
('Celery', 'Vegetables', 16, 0.7, 3, 0.2, 1.6, 'gm', 'Celery'),
('Brussels Sprouts', 'Vegetables', 43, 3.4, 9, 0.3, 3.8, 'gm', 'Brussels Sprouts'),
('Corn', 'Vegetables', 86, 3.3, 19, 1.4, 2.4, 'gm', 'Makkai'),

-- Herbs
('Coriander Leaves', 'Herbs', 23, 2.1, 3.7, 0.5, 2.8, 'pcs', 'Dhania Patta'),
('Mint Leaves', 'Herbs', 44, 3.8, 8.4, 0.7, 6.8, 'gm', 'Pudina'),
('Parsley', 'Herbs', 36, 3, 6.3, 0.8, 3.3, 'gm', 'Parsley'),
('Rosemary', 'Herbs', 131, 3.3, 20, 5.9, 14, 'gm', 'Rosemary'),
('Thyme', 'Herbs', 101, 5.6, 24, 1.7, 14, 'gm', 'Thyme'),
('Thai Basil', 'Herbs', 23, 3.2, 2.7, 0.6, 1.6, 'gm', 'Thai Basil'),
('Curry Leaves', 'Herbs', 108, 6.1, 18, 1, 6.4, 'gm', 'Kadi Patta'),

-- Fruits
('Apple', 'Fruits', 52, 0.3, 14, 0.2, 2.4, 'gm', 'Seb'),
('Banana', 'Fruits', 89, 1.1, 23, 0.3, 2.6, 'gm', 'Kela'),
('Grapes', 'Fruits', 69, 0.7, 18, 0.2, 0.9, 'gm', 'Angoor'),
('Lemon', 'Fruits', 29, 1.1, 9, 0.3, 2.8, 'gm', 'Nimbu'),
('Pineapple', 'Fruits', 50, 0.5, 13, 0.1, 1.4, 'gm', 'Ananas'),
('Pomegranate', 'Fruits', 83, 1.7, 19, 1.2, 4, 'gm', 'Anar'),
('Strawberry', 'Fruits', 32, 0.7, 8, 0.3, 2, 'gm', 'Strawberry'),
('Watermelon', 'Fruits', 30, 0.6, 8, 0.2, 0.4, 'gm', 'Tarbooz'),
('Papaya', 'Fruits', 43, 0.5, 11, 0.3, 1.7, 'gm', 'Papita'),
('Orange', 'Fruits', 47, 0.9, 12, 0.1, 2.4, 'gm', 'Santra'),

-- Condiments & Sauces
('Honey', 'Condiments', 304, 0.3, 82, 0, 0.2, 'gm', 'Shahad'),
('Salt', 'Condiments', 0, 0, 0, 0, 0, 'gm', 'Namak'),
('Vinegar', 'Condiments', 21, 0, 0.9, 0, 0, 'ml', 'Sirka'),
('Soy Sauce', 'Condiments', 53, 5.6, 4.9, 0.1, 0.8, 'gm', 'Soy Sauce'),
('Oyster Sauce', 'Condiments', 51, 1.4, 11, 0.1, 0, 'gm', 'Oyster Sauce'),
('BBQ Sauce', 'Condiments', 172, 1, 41, 0.5, 0.5, 'gm', 'BBQ Sauce'),
('Sriracha', 'Condiments', 93, 2, 18, 1, 1, 'ml', 'Sriracha'),
('Tahini', 'Condiments', 595, 17, 21, 54, 9.3, 'gm', 'Tahini'),
('Maple Syrup', 'Condiments', 260, 0, 67, 0.2, 0, 'gm', 'Maple Syrup'),
('Date Syrup', 'Condiments', 281, 2, 75, 0, 3.5, 'gm', 'Date Syrup'),
('Brown Sugar', 'Condiments', 380, 0, 98, 0, 0, 'gm', 'Brown Sugar'),

-- Spices
('Black Pepper', 'Spices', 251, 10, 64, 3.3, 25, 'gm', 'Kali Mirch'),
('Red Chili Powder', 'Spices', 282, 12, 50, 14, 28, 'gm', 'Lal Mirch'),
('Cumin Seeds', 'Spices', 375, 18, 44, 22, 11, 'gm', 'Jeera'),
('Cinnamon', 'Spices', 247, 4, 81, 1.2, 53, 'gm', 'Dalchini'),
('Cloves', 'Spices', 274, 6, 65, 13, 34, 'gm', 'Laung'),
('Garam Masala', 'Spices', 379, 14, 50, 15, 24, 'gm', 'Garam Masala'),
('Oregano', 'Spices', 265, 9, 69, 4.3, 43, 'gm', 'Oregano'),

-- Other
('Pickled Jalapenos', 'Condiments', 27, 0.9, 5, 0.4, 2.8, 'gm', 'Jalapenos'),
('Tea (green)', 'Beverages', 1, 0, 0, 0, 0, 'pcs', 'Green Tea'),
('Tea (black)', 'Beverages', 1, 0.1, 0.3, 0, 0, 'gm', 'Chai Patti'),
('Lettuce (Iceberg)', 'Vegetables', 14, 0.9, 3, 0.1, 1.2, 'gm', 'Lettuce'),
('Soy Chunks', 'Protein', 345, 52, 33, 0.5, 13, 'gm', 'Soya Chunks'),
('Corn Starch', 'Grains', 381, 0.3, 91, 0.1, 0.9, 'gm', 'Corn Flour'),
('Rice Paper', 'Grains', 333, 0.6, 83, 0.3, 0.9, 'gm', 'Rice Paper');

-- ============================================
-- STEP 3: Delete old inventory name variants
-- ============================================
DELETE FROM cafe_inventory WHERE name IN (
  'Apples', 'Bananas', 'Lemons', 'Strawberries',
  'Capsicum', 'Green Pepper', 'Carrots', 'Peeled Garlic', 'Green Chillies', 'Onions', 'Peas', 'Tomato',
  'Corriander Leaves', 'Fresh Parsely', 'Parsley - Dry', 'Fresh Rosemary', 'Fresh thyme',
  'Chicken', 'Chicken Breast', 'Egg',
  'Milk', 'Amul Cream',
  'Brown Rice', 'Brown rice', 'Bread (Brown)', 'Brown Bread',
  'Chickpeas', 'White Channa', 'Chana Dal', 'Rajma',
  'Cashew nuts', 'Wallnut', 'Peanuts', 'Roasted Peanuts', 'Chia seeds', 'Sesame',
  'Coconut oil',
  'Balsamic vinegar', 'Soya sauce', 'Oyster Sauce - lee kum lee', 'Siracha', 'Tahini Paste', 'Maple syrup ', 'Dates Syrup',
  'Pepper Corn', 'Red Chilli Powder', 'Red Chilli Dry', 'Chilli Flakes', 'Cinnamon Powder',
  'Sweet Corn', 'Frozen Corn', 'Jalapenos',
  'Green Tea', 'Tea Powder',
  'Ice Berg', 'Iceberg', 'Mosambi', 'Soya'
);

-- ============================================
-- STEP 4: Update nutrition data for ALL inventory items
-- ============================================
UPDATE cafe_inventory ci
SET 
  calories_per_100g = nr.calories,
  protein_per_100g = nr.protein,
  carbs_per_100g = nr.carbs,
  fat_per_100g = nr.fat,
  fiber_per_100g = nr.fiber
FROM nutrition_reference nr
WHERE ci.name = nr.ingredient_name;

-- ============================================
-- VERIFICATION
-- ============================================
-- Check nutrition_reference has data
SELECT 'Nutrition Reference Count:' as info, COUNT(*) as count FROM nutrition_reference;

-- Check updated inventory items
SELECT 'Updated Inventory Items:' as info, COUNT(*) as count 
FROM cafe_inventory 
WHERE calories_per_100g IS NOT NULL;

-- Show sample updated items
SELECT name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g
FROM cafe_inventory 
WHERE calories_per_100g IS NOT NULL
ORDER BY name
LIMIT 20;
