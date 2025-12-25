-- Add calorie information to inventory and menu tables
-- This allows tracking nutritional information for ingredients and dishes

-- Add calories per 100g to inventory items
ALTER TABLE cafe_inventory
ADD COLUMN IF NOT EXISTS calories_per_100g DECIMAL(10,2) DEFAULT NULL;

-- Add comment to explain the column
COMMENT ON COLUMN cafe_inventory.calories_per_100g IS 'Calories per 100 grams/ml of the ingredient';

-- Add total calories to menu items
ALTER TABLE cafe_menu
ADD COLUMN IF NOT EXISTS calories DECIMAL(10,2) DEFAULT NULL;

-- Add comment to explain the column
COMMENT ON COLUMN cafe_menu.calories IS 'Total calories per serving of the dish';

-- Examples of common ingredient calories (optional - for reference):
-- Rice (cooked): 130 cal/100g
-- Chicken breast: 165 cal/100g
-- Olive oil: 884 cal/100g
-- Milk: 42 cal/100g
-- Eggs: 155 cal/100g
-- Tomatoes: 18 cal/100g
-- Onions: 40 cal/100g
