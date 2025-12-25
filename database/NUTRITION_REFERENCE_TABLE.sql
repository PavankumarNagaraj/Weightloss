-- Comprehensive Nutritional Reference Table for Cafe/Restaurant Ingredients
-- All values per 100g - Indian and International ingredients
-- For auto-suggestion and quick data entry

-- Create reference table
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

-- Add index for fast searching
CREATE INDEX IF NOT EXISTS idx_ingredient_name ON nutrition_reference(ingredient_name);
CREATE INDEX IF NOT EXISTS idx_category ON nutrition_reference(category);

-- Clear existing data
TRUNCATE TABLE nutrition_reference;

-- ============================================
-- PROTEINS - MEAT & POULTRY
-- ============================================
INSERT INTO nutrition_reference (ingredient_name, category, calories, protein, carbs, fat, fiber, common_unit, indian_name) VALUES
('Chicken Breast (cooked)', 'Protein', 165, 31, 0, 3.6, 0, 'gm', 'Chicken Breast'),
('Chicken Thigh (cooked)', 'Protein', 209, 26, 0, 11, 0, 'gm', 'Chicken Thigh'),
('Chicken Drumstick', 'Protein', 172, 28, 0, 6, 0, 'gm', 'Chicken Drumstick'),
('Mutton (cooked)', 'Protein', 294, 25, 0, 21, 0, 'gm', 'Mutton/Lamb'),
('Beef (lean, cooked)', 'Protein', 250, 26, 0, 15, 0, 'gm', 'Beef'),
('Pork (lean, cooked)', 'Protein', 242, 27, 0, 14, 0, 'gm', 'Pork'),
('Turkey Breast', 'Protein', 135, 30, 0, 1, 0, 'gm', 'Turkey'),

-- ============================================
-- PROTEINS - FISH & SEAFOOD
-- ============================================
('Salmon (cooked)', 'Protein', 208, 20, 0, 13, 0, 'gm', 'Salmon'),
('Tuna (cooked)', 'Protein', 132, 28, 0, 1, 0, 'gm', 'Tuna'),
('Prawns/Shrimp', 'Protein', 99, 24, 0, 0.3, 0, 'gm', 'Jhinga'),
('Fish (Rohu)', 'Protein', 97, 17, 0, 3, 0, 'gm', 'Rohu'),
('Fish (Pomfret)', 'Protein', 96, 19, 0, 2, 0, 'gm', 'Pomfret'),
('Fish (Hilsa)', 'Protein', 310, 22, 0, 25, 0, 'gm', 'Hilsa'),
('Mackerel', 'Protein', 205, 19, 0, 14, 0, 'gm', 'Bangda'),

-- ============================================
-- PROTEINS - DAIRY & EGGS
-- ============================================
('Eggs (whole)', 'Protein', 155, 13, 1.1, 11, 0, 'gm', 'Anda'),
('Egg White', 'Protein', 52, 11, 0.7, 0.2, 0, 'gm', 'Egg White'),
('Egg Yolk', 'Protein', 322, 16, 3.6, 27, 0, 'gm', 'Egg Yolk'),
('Paneer', 'Protein', 265, 18, 1.2, 20, 0, 'gm', 'Paneer'),
('Cottage Cheese', 'Protein', 98, 11, 3.4, 4.3, 0, 'gm', 'Cottage Cheese'),
('Cheddar Cheese', 'Protein', 402, 25, 1.3, 33, 0, 'gm', 'Cheddar'),
('Mozzarella Cheese', 'Protein', 280, 28, 2.2, 17, 0, 'gm', 'Mozzarella'),
('Greek Yogurt', 'Protein', 59, 10, 3.6, 0.4, 0, 'gm', 'Greek Yogurt'),
('Yogurt (plain)', 'Protein', 59, 3.5, 4.7, 3.3, 0, 'gm', 'Dahi'),
('Milk (whole)', 'Dairy', 61, 3.2, 4.8, 3.3, 0, 'ml', 'Doodh'),
('Milk (skim)', 'Dairy', 34, 3.4, 5, 0.1, 0, 'ml', 'Skim Milk'),
('Butter', 'Fat', 717, 0.9, 0.1, 81, 0, 'gm', 'Makhan'),
('Ghee', 'Fat', 900, 0, 0, 100, 0, 'gm', 'Ghee'),
('Cream', 'Dairy', 345, 2.2, 2.8, 37, 0, 'ml', 'Cream'),

-- ============================================
-- PROTEINS - PLANT-BASED
-- ============================================
('Tofu', 'Protein', 76, 8, 1.9, 4.8, 0.3, 'gm', 'Tofu'),
('Tempeh', 'Protein', 193, 19, 9, 11, 0, 'gm', 'Tempeh'),
('Soy Chunks', 'Protein', 345, 52, 33, 0.5, 13, 'gm', 'Soya Chunks'),

-- ============================================
-- LEGUMES & PULSES (COOKED)
-- ============================================
('Chickpeas (cooked)', 'Legume', 164, 9, 27, 2.6, 8, 'gm', 'Chana'),
('Black Chickpeas', 'Legume', 164, 9, 27, 2.6, 8, 'gm', 'Kala Chana'),
('Kidney Beans (cooked)', 'Legume', 127, 9, 23, 0.5, 7, 'gm', 'Rajma'),
('Black Lentils (cooked)', 'Legume', 116, 9, 20, 0.4, 8, 'gm', 'Urad Dal'),
('Red Lentils (cooked)', 'Legume', 116, 9, 20, 0.4, 8, 'gm', 'Masoor Dal'),
('Yellow Lentils (cooked)', 'Legume', 116, 9, 20, 0.4, 8, 'gm', 'Toor Dal'),
('Moong Dal (cooked)', 'Legume', 105, 7, 19, 0.4, 8, 'gm', 'Moong Dal'),
('Green Peas', 'Legume', 81, 5, 14, 0.4, 5, 'gm', 'Matar'),
('Peanuts', 'Nut', 567, 26, 16, 49, 9, 'gm', 'Moongfali'),

-- ============================================
-- GRAINS & CEREALS (COOKED)
-- ============================================
('Rice (white, cooked)', 'Grain', 130, 2.7, 28, 0.3, 0.4, 'gm', 'Chawal'),
('Rice (brown, cooked)', 'Grain', 112, 2.6, 24, 0.9, 1.8, 'gm', 'Brown Rice'),
('Basmati Rice (cooked)', 'Grain', 121, 3, 25, 0.4, 0.6, 'gm', 'Basmati'),
('Biryani Rice (cooked)', 'Grain', 130, 2.7, 28, 0.3, 0.4, 'gm', 'Biryani Rice'),
('Quinoa (cooked)', 'Grain', 120, 4.4, 21, 1.9, 2.8, 'gm', 'Quinoa'),
('Oats', 'Grain', 389, 17, 66, 7, 11, 'gm', 'Oats'),
('Wheat Flour (whole)', 'Grain', 340, 13, 72, 2.5, 11, 'gm', 'Atta'),
('Maida (refined flour)', 'Grain', 364, 10, 76, 1, 3, 'gm', 'Maida'),
('Semolina', 'Grain', 360, 13, 73, 1, 4, 'gm', 'Suji/Rava'),
('Bread (white)', 'Grain', 265, 9, 49, 3.2, 2.7, 'gm', 'Bread'),
('Bread (whole wheat)', 'Grain', 247, 13, 41, 3.4, 7, 'gm', 'Brown Bread'),
('Roti/Chapati', 'Grain', 297, 11, 51, 7, 7, 'gm', 'Roti'),
('Naan', 'Grain', 262, 9, 45, 5, 2, 'gm', 'Naan'),
('Pasta (cooked)', 'Grain', 131, 5, 25, 1.1, 1.8, 'gm', 'Pasta'),
('Couscous (cooked)', 'Grain', 112, 3.8, 23, 0.2, 1.4, 'gm', 'Couscous'),
('Poha', 'Grain', 130, 2, 28, 0.2, 0.3, 'gm', 'Poha'),
('Upma', 'Grain', 90, 2, 17, 1.5, 1, 'gm', 'Upma'),

-- ============================================
-- VEGETABLES - LEAFY GREENS
-- ============================================
('Spinach', 'Vegetable', 23, 2.9, 3.6, 0.4, 2.2, 'gm', 'Palak'),
('Kale', 'Vegetable', 35, 2.9, 4.4, 1.5, 4.1, 'gm', 'Kale'),
('Lettuce', 'Vegetable', 15, 1.4, 2.9, 0.2, 1.3, 'gm', 'Lettuce'),
('Cabbage', 'Vegetable', 25, 1.3, 5.8, 0.1, 2.5, 'gm', 'Patta Gobi'),
('Fenugreek Leaves', 'Vegetable', 49, 4.4, 6, 0.9, 0, 'gm', 'Methi'),
('Coriander Leaves', 'Vegetable', 23, 2.1, 3.7, 0.5, 2.8, 'gm', 'Dhania Patta'),
('Mint Leaves', 'Vegetable', 44, 3.8, 8, 0.7, 6.8, 'gm', 'Pudina'),

-- ============================================
-- VEGETABLES - COMMON
-- ============================================
('Tomatoes', 'Vegetable', 18, 0.9, 3.9, 0.2, 1.2, 'gm', 'Tamatar'),
('Onions', 'Vegetable', 40, 1.1, 9, 0.1, 1.7, 'gm', 'Pyaz'),
('Potatoes (boiled)', 'Vegetable', 87, 2, 20, 0.1, 1.8, 'gm', 'Aloo'),
('Sweet Potato', 'Vegetable', 86, 1.6, 20, 0.1, 3, 'gm', 'Shakarkandi'),
('Carrots', 'Vegetable', 41, 0.9, 10, 0.2, 2.8, 'gm', 'Gajar'),
('Broccoli', 'Vegetable', 34, 2.8, 7, 0.4, 2.6, 'gm', 'Broccoli'),
('Cauliflower', 'Vegetable', 25, 1.9, 5, 0.3, 2, 'gm', 'Phool Gobi'),
('Bell Pepper (capsicum)', 'Vegetable', 31, 1, 6, 0.3, 2.1, 'gm', 'Shimla Mirch'),
('Cucumber', 'Vegetable', 15, 0.7, 3.6, 0.1, 0.5, 'gm', 'Kheera'),
('Zucchini', 'Vegetable', 17, 1.2, 3.1, 0.3, 1, 'gm', 'Zucchini'),
('Eggplant', 'Vegetable', 25, 1, 6, 0.2, 3, 'gm', 'Baingan'),
('Okra', 'Vegetable', 33, 1.9, 7, 0.2, 3.2, 'gm', 'Bhindi'),
('Pumpkin', 'Vegetable', 26, 1, 6.5, 0.1, 0.5, 'gm', 'Kaddu'),
('Bottle Gourd', 'Vegetable', 14, 0.6, 3.4, 0, 0.5, 'gm', 'Lauki'),
('Bitter Gourd', 'Vegetable', 17, 1, 3.7, 0.2, 2.8, 'gm', 'Karela'),
('Mushrooms', 'Vegetable', 22, 3.1, 3.3, 0.3, 1, 'gm', 'Mushroom'),
('Corn', 'Vegetable', 86, 3.3, 19, 1.4, 2.7, 'gm', 'Makka'),
('Green Beans', 'Vegetable', 31, 1.8, 7, 0.1, 3.4, 'gm', 'French Beans'),

-- ============================================
-- FRUITS
-- ============================================
('Banana', 'Fruit', 89, 1.1, 23, 0.3, 2.6, 'gm', 'Kela'),
('Apple', 'Fruit', 52, 0.3, 14, 0.2, 2.4, 'gm', 'Seb'),
('Mango', 'Fruit', 60, 0.8, 15, 0.4, 1.6, 'gm', 'Aam'),
('Orange', 'Fruit', 47, 0.9, 12, 0.1, 2.4, 'gm', 'Santra'),
('Papaya', 'Fruit', 43, 0.5, 11, 0.3, 1.7, 'gm', 'Papita'),
('Watermelon', 'Fruit', 30, 0.6, 8, 0.2, 0.4, 'gm', 'Tarbooz'),
('Grapes', 'Fruit', 69, 0.7, 18, 0.2, 0.9, 'gm', 'Angoor'),
('Strawberry', 'Fruit', 32, 0.7, 7.7, 0.3, 2, 'gm', 'Strawberry'),
('Pineapple', 'Fruit', 50, 0.5, 13, 0.1, 1.4, 'gm', 'Ananas'),
('Pomegranate', 'Fruit', 83, 1.7, 19, 1.2, 4, 'gm', 'Anar'),
('Guava', 'Fruit', 68, 2.6, 14, 1, 5.4, 'gm', 'Amrood'),
('Avocado', 'Fruit', 160, 2, 9, 15, 7, 'gm', 'Avocado'),
('Coconut (fresh)', 'Fruit', 354, 3.3, 15, 33, 9, 'gm', 'Nariyal'),

-- ============================================
-- NUTS & SEEDS
-- ============================================
('Almonds', 'Nut', 579, 21, 22, 50, 12, 'gm', 'Badam'),
('Cashews', 'Nut', 553, 18, 30, 44, 3.3, 'gm', 'Kaju'),
('Walnuts', 'Nut', 654, 15, 14, 65, 7, 'gm', 'Akhrot'),
('Pistachios', 'Nut', 560, 20, 28, 45, 10, 'gm', 'Pista'),
('Chia Seeds', 'Seed', 486, 17, 42, 31, 34, 'gm', 'Chia Seeds'),
('Flax Seeds', 'Seed', 534, 18, 29, 42, 27, 'gm', 'Alsi'),
('Pumpkin Seeds', 'Seed', 559, 30, 11, 49, 6, 'gm', 'Kaddu Beej'),
('Sunflower Seeds', 'Seed', 584, 21, 20, 51, 9, 'gm', 'Surajmukhi Beej'),
('Sesame Seeds', 'Seed', 573, 18, 23, 50, 12, 'gm', 'Til'),

-- ============================================
-- OILS & FATS
-- ============================================
('Olive Oil', 'Fat', 884, 0, 0, 100, 0, 'ml', 'Olive Oil'),
('Coconut Oil', 'Fat', 862, 0, 0, 100, 0, 'ml', 'Coconut Oil'),
('Mustard Oil', 'Fat', 884, 0, 0, 100, 0, 'ml', 'Sarson Ka Tel'),
('Sunflower Oil', 'Fat', 884, 0, 0, 100, 0, 'ml', 'Sunflower Oil'),
('Vegetable Oil', 'Fat', 884, 0, 0, 100, 0, 'ml', 'Vegetable Oil'),

-- ============================================
-- CONDIMENTS & SPICES
-- ============================================
('Honey', 'Condiment', 304, 0.3, 82, 0, 0.2, 'gm', 'Shahad'),
('Sugar (white)', 'Condiment', 387, 0, 100, 0, 0, 'gm', 'Cheeni'),
('Jaggery', 'Condiment', 383, 0.4, 98, 0.1, 0, 'gm', 'Gur'),
('Salt', 'Condiment', 0, 0, 0, 0, 0, 'gm', 'Namak'),
('Soy Sauce', 'Condiment', 53, 5.6, 4.9, 0.1, 0.8, 'ml', 'Soy Sauce'),
('Tomato Ketchup', 'Condiment', 112, 1.2, 27, 0.1, 0.3, 'gm', 'Ketchup'),
('Mayonnaise', 'Condiment', 680, 1.1, 0.6, 75, 0, 'gm', 'Mayonnaise'),
('Vinegar', 'Condiment', 18, 0, 0.04, 0, 0, 'ml', 'Sirka'),
('Ginger', 'Spice', 80, 1.8, 18, 0.8, 2, 'gm', 'Adrak'),
('Garlic', 'Spice', 149, 6.4, 33, 0.5, 2.1, 'gm', 'Lehsun'),
('Green Chili', 'Spice', 40, 2, 9, 0.2, 1.5, 'gm', 'Hari Mirch'),
('Turmeric Powder', 'Spice', 312, 9.7, 67, 3.2, 22.7, 'gm', 'Haldi'),
('Cumin Seeds', 'Spice', 375, 18, 44, 22, 11, 'gm', 'Jeera'),
('Coriander Powder', 'Spice', 298, 12, 55, 18, 42, 'gm', 'Dhania Powder');

-- Add comment
COMMENT ON TABLE nutrition_reference IS 'Comprehensive nutritional reference data for cafe ingredients - all values per 100g';
