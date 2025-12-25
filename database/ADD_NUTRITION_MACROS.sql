-- Add comprehensive nutritional information to inventory and menu
-- For gym-focused cafe: calories, protein, carbs, fat, fiber (all per 100g)

-- Add macro nutrients to inventory items (per 100g)
ALTER TABLE cafe_inventory
ADD COLUMN IF NOT EXISTS protein_per_100g DECIMAL(10,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS carbs_per_100g DECIMAL(10,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS fat_per_100g DECIMAL(10,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS fiber_per_100g DECIMAL(10,2) DEFAULT NULL;

-- Add comments
COMMENT ON COLUMN cafe_inventory.protein_per_100g IS 'Protein in grams per 100g of ingredient';
COMMENT ON COLUMN cafe_inventory.carbs_per_100g IS 'Carbohydrates in grams per 100g of ingredient';
COMMENT ON COLUMN cafe_inventory.fat_per_100g IS 'Fat in grams per 100g of ingredient';
COMMENT ON COLUMN cafe_inventory.fiber_per_100g IS 'Fiber in grams per 100g of ingredient';

-- Add macro nutrients to menu items (per serving)
ALTER TABLE cafe_menu
ADD COLUMN IF NOT EXISTS protein DECIMAL(10,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS carbs DECIMAL(10,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS fat DECIMAL(10,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS fiber DECIMAL(10,2) DEFAULT NULL;

-- Add comments
COMMENT ON COLUMN cafe_menu.protein IS 'Total protein in grams per serving';
COMMENT ON COLUMN cafe_menu.carbs IS 'Total carbohydrates in grams per serving';
COMMENT ON COLUMN cafe_menu.fat IS 'Total fat in grams per serving';
COMMENT ON COLUMN cafe_menu.fiber IS 'Total fiber in grams per serving';

-- ============================================
-- NUTRITIONAL REFERENCE DATA (per 100g)
-- ============================================

-- PROTEINS
-- Chicken breast (cooked): 165 cal, 31g protein, 0g carbs, 3.6g fat, 0g fiber
-- Eggs (whole): 155 cal, 13g protein, 1.1g carbs, 11g fat, 0g fiber
-- Paneer: 265 cal, 18g protein, 1.2g carbs, 20g fat, 0g fiber
-- Tofu: 76 cal, 8g protein, 1.9g carbs, 4.8g fat, 0.3g fiber
-- Fish (salmon): 208 cal, 20g protein, 0g carbs, 13g fat, 0g fiber
-- Lentils (cooked): 116 cal, 9g protein, 20g carbs, 0.4g fat, 8g fiber

-- CARBS
-- Rice (cooked white): 130 cal, 2.7g protein, 28g carbs, 0.3g fat, 0.4g fiber
-- Rice (cooked brown): 112 cal, 2.6g protein, 24g carbs, 0.9g fat, 1.8g fiber
-- Wheat flour (whole): 340 cal, 13g protein, 72g carbs, 2.5g fat, 11g fiber
-- Oats: 389 cal, 17g protein, 66g carbs, 7g fat, 11g fiber
-- Quinoa (cooked): 120 cal, 4.4g protein, 21g carbs, 1.9g fat, 2.8g fiber
-- Potato (boiled): 87 cal, 2g protein, 20g carbs, 0.1g fat, 1.8g fiber

-- VEGETABLES
-- Broccoli: 34 cal, 2.8g protein, 7g carbs, 0.4g fat, 2.6g fiber
-- Spinach: 23 cal, 2.9g protein, 3.6g carbs, 0.4g fat, 2.2g fiber
-- Tomatoes: 18 cal, 0.9g protein, 3.9g carbs, 0.2g fat, 1.2g fiber
-- Onions: 40 cal, 1.1g protein, 9g carbs, 0.1g fat, 1.7g fiber
-- Carrots: 41 cal, 0.9g protein, 10g carbs, 0.2g fat, 2.8g fiber
-- Cucumber: 15 cal, 0.7g protein, 3.6g carbs, 0.1g fat, 0.5g fiber

-- FATS
-- Olive oil: 884 cal, 0g protein, 0g carbs, 100g fat, 0g fiber
-- Butter: 717 cal, 0.9g protein, 0.1g carbs, 81g fat, 0g fiber
-- Ghee: 900 cal, 0g protein, 0g carbs, 100g fat, 0g fiber
-- Almonds: 579 cal, 21g protein, 22g carbs, 50g fat, 12g fiber
-- Peanuts: 567 cal, 26g protein, 16g carbs, 49g fat, 9g fiber

-- DAIRY
-- Milk (whole): 61 cal, 3.2g protein, 4.8g carbs, 3.3g fat, 0g fiber
-- Yogurt (plain): 59 cal, 3.5g protein, 4.7g carbs, 3.3g fat, 0g fiber
-- Cheese (cheddar): 402 cal, 25g protein, 1.3g carbs, 33g fat, 0g fiber

-- FRUITS
-- Banana: 89 cal, 1.1g protein, 23g carbs, 0.3g fat, 2.6g fiber
-- Apple: 52 cal, 0.3g protein, 14g carbs, 0.2g fat, 2.4g fiber
-- Mango: 60 cal, 0.8g protein, 15g carbs, 0.4g fat, 1.6g fiber

-- CONDIMENTS
-- Honey: 304 cal, 0.3g protein, 82g carbs, 0g fat, 0.2g fiber
-- Sugar: 387 cal, 0g protein, 100g carbs, 0g fat, 0g fiber
