# Micronutrient Migration Guide

## Problem
Micronutrients were not populating because the column names in the migration didn't match the actual ingredient names in the database.

## Solution - Run These Files in Order

### Step 1: Add Micronutrient Columns (REQUIRED FIRST)
```sql
-- Run this file first in Supabase SQL Editor
00_add_micronutrient_columns.sql
```
This creates all 21 micronutrient columns in the `nutrition_reference` table.

### Step 2: Populate Micronutrient Data (Run in Order)
Run these 6 files **one by one** in Supabase SQL Editor:

```sql
1. add_micronutrients_batch_1.sql  -- Grains & Staples (25 items)
2. add_micronutrients_batch_2.sql  -- Vegetables & Greens (25 items)
3. add_micronutrients_batch_3.sql  -- Fruits & Dairy (25 items)
4. add_micronutrients_batch_4.sql  -- Proteins & Legumes (25 items)
5. add_micronutrients_batch_5.sql  -- Spices, Oils & Misc (25 items)
6. add_micronutrients_batch_6_missing.sql  -- Missing Items (30+ items)
```

**Total Coverage:** 155+ food items with complete micronutrient data

### Step 3: Add Micronutrients to Existing Dishes (OPTIONAL)
```sql
-- Run this to add micronutrient columns to cafe_inventory and cafe_menu
99_add_micronutrients_to_dishes.sql
```
This automatically populates micronutrients for existing inventory items by matching names with nutrition_reference.

## What Gets Updated

### Batch 1 - Grains & Staples
- Rice (white, brown, basmati)
- Wheat Flour, Maida, Semolina
- Oats, Quinoa
- Bread (white, whole wheat)
- Bajra, Ragi, Jowar

### Batch 2 - Vegetables & Greens
- Tomatoes, Onions, Potatoes, Carrots
- Spinach, Broccoli, Cauliflower
- Bell Pepper, Cucumber, Eggplant
- Okra, Bitter Gourd, Bottle Gourd
- Fenugreek Leaves, Coriander Leaves, Mint Leaves
- Cabbage, Zucchini, Mushrooms

### Batch 3 - Fruits & Dairy
- Banana, Apple, Mango, Orange, Papaya
- Watermelon, Grapes, Pineapple, Pomegranate, Guava
- Milk (whole, skim), Yogurt
- Paneer, Cheddar Cheese, Mozzarella Cheese
- Butter, Ghee, Cream

### Batch 4 - Proteins & Legumes
- Chicken Breast, Chicken Thigh
- Salmon, Tuna, Prawns/Shrimp
- Eggs (whole, white, yolk)
- Lentils (Red, Moong Dal, Yellow, Black)
- Chickpeas, Kidney Beans
- Tofu, Soy Chunks
- Peanuts, Almonds, Cashews, Walnuts, Pistachios
- Pumpkin Seeds, Sesame Seeds

### Batch 5 - Spices, Oils & Misc
- Turmeric Powder, Cumin Seeds, Coriander Powder
- Fenugreek Leaves, Ginger, Garlic, Green Chili
- Olive Oil, Sunflower Oil, Vegetable Oil, Coconut Oil
- Coconut (fresh)
- Jaggery, Sugar, Honey, Salt, Vinegar

### Batch 6 - Missing Items (Previously Uncovered)
**Grains & Breads:**
- Roti/Chapati, Naan, Pasta, Couscous, Poha, Upma

**Vegetables:**
- Kale, Lettuce, Sweet Potato, Pumpkin, Corn, Green Peas

**Fruits:**
- Strawberry, Avocado

**Seeds:**
- Chia Seeds, Flax Seeds, Sunflower Seeds

**Oils:**
- Mustard Oil

**Condiments:**
- Soy Sauce, Tomato Ketchup, Mayonnaise

**Fish:**
- Rohu, Pomfret, Hilsa, Mackerel

**Meat:**
- Mutton, Beef, Pork, Turkey Breast

**Dairy:**
- Greek Yogurt, Cottage Cheese

**Plant Proteins:**
- Tempeh, Black Chickpeas

## Micronutrients Added (21 total)

### Vitamins (11)
- Vitamin A (mcg)
- Vitamin C (mg)
- Vitamin D (mcg)
- Vitamin E (mg)
- Vitamin K (mcg)
- Vitamin B1/Thiamine (mg)
- Vitamin B2/Riboflavin (mg)
- Vitamin B3/Niacin (mg)
- Vitamin B6 (mg)
- Vitamin B12 (mcg)
- Folate (mcg)

### Minerals (10)
- Calcium (mg)
- Iron (mg)
- Magnesium (mg)
- Phosphorus (mg)
- Potassium (mg)
- Sodium (mg)
- Zinc (mg)
- Copper (mg)
- Manganese (mg)
- Selenium (mcg)

## Verification

After running all migrations, verify with:

```sql
-- Check if columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'nutrition_reference' 
AND (column_name LIKE '%vitamin%' OR column_name LIKE '%calcium%' OR column_name LIKE '%iron%')
ORDER BY column_name;

-- Check if data is populated
SELECT ingredient_name, vitamin_a_mcg, vitamin_c_mg, calcium_mg, iron_mg
FROM nutrition_reference
WHERE vitamin_a_mcg IS NOT NULL
LIMIT 10;

-- Count how many items have micronutrient data
SELECT COUNT(*) as items_with_micronutrients
FROM nutrition_reference
WHERE vitamin_a_mcg IS NOT NULL;
-- Expected: 155+ items after running all 6 batches
```

## Notes

- All values are per 100g
- Data sourced from USDA FoodData Central and Indian Food Composition Tables
- Ingredient names match exactly with your database (e.g., "Rice (white, cooked)", "Tomatoes", "Chicken Breast (cooked)")
- For dishes in `cafe_menu`, micronutrients will be calculated automatically in the frontend based on raw_materials
- **Batch 6** covers items that were missing from the original 125-item list, including Indian breads, additional vegetables, fish varieties, and meat options
