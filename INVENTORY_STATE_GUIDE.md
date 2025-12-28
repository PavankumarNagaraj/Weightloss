# 🥩 Raw vs Cooked Inventory Tracking Guide

## 📋 Problem Statement

When managing a cafe inventory, ingredients can be stored in different states:
- **Raw**: As purchased from suppliers (e.g., raw chicken breast)
- **Cooked**: Pre-cooked or processed (e.g., pre-cooked chicken)

This creates a critical mismatch:
1. **Inventory Deduction**: Recipe uses 200g cooked chicken, but inventory has raw chicken
2. **Calorie Calculation**: Raw vs cooked have different nutritional values per 100g

## ✅ Solution Implemented

### 1. Inventory State Field

Every inventory item now has an `inventoryState` field:
- **`raw`** - Ingredient stored as purchased (default)
- **`cooked`** - Ingredient stored pre-cooked

### 2. Smart Inventory Deduction

When an order is placed, the system automatically calculates the correct amount to deduct:

#### Example: Chicken Breast

**Scenario A: Raw Inventory → Grilled Recipe**
```
Inventory: 1000g raw chicken breast (inventoryState: 'raw')
Recipe: 200g grilled chicken (cookingMethod: 'grilled')

Calculation:
- Grilled chicken loses 20% weight during cooking
- Raw needed = 200g ÷ (1 - 0.20) = 250g
- Deduct: 250g from inventory ✓
- Remaining: 750g raw chicken
```

**Scenario B: Cooked Inventory → Cooked Recipe**
```
Inventory: 1000g cooked chicken (inventoryState: 'cooked')
Recipe: 200g cooked chicken

Calculation:
- No conversion needed
- Deduct: 200g from inventory ✓
- Remaining: 800g cooked chicken
```

**Scenario C: Raw Inventory → Raw Recipe**
```
Inventory: 1000g raw chicken (inventoryState: 'raw')
Recipe: 200g raw chicken (cookingMethod: 'raw')

Calculation:
- No conversion needed
- Deduct: 200g from inventory ✓
```

### 3. Cooking Weight Loss Factors

The system uses these weight loss percentages:

| Cooking Method | Weight Loss |
|---------------|-------------|
| Grilled | 20% |
| Boiled | 15% |
| Steamed | 10% |
| Baked | 18% |
| Fried | 10% |
| Sautéed | 12% |
| Microwave | 8% |
| Boiled + Sautéed | 25% |
| Steamed + Sautéed | 20% |
| Boiled + Fried | 22% |

## 📝 How to Use

### Setting Up Inventory

1. **Add/Edit Inventory Item**
2. **Set Inventory State**:
   - Select **🥩 Raw (As Purchased)** if you store it raw
   - Select **🍗 Cooked (Pre-cooked)** if you store it cooked

3. **Enter Nutritional Values** matching the inventory state:
   - If raw: Enter nutrition for raw ingredient (per 100g)
   - If cooked: Enter nutrition for cooked ingredient (per 100g)

### Creating Menu Items

1. **Add Ingredients** to your menu item
2. **Select Cooking Method** for each ingredient:
   - Raw, Grilled, Boiled, Steamed, etc.
3. **Enter Quantity** (the amount in the final dish)

### What Happens When Order is Placed

The system automatically:
1. Checks inventory state for each ingredient
2. Checks cooking method in recipe
3. Calculates raw equivalent if needed
4. Deducts correct amount from inventory
5. Calculates accurate calories for the dish

## 🔍 Real-World Example

### Menu Item: Grilled Chicken Salad

**Ingredients:**
- 200g grilled chicken breast (cookingMethod: 'grilled')
- 100g lettuce (cookingMethod: 'raw')
- 50g tomatoes (cookingMethod: 'raw')

**Inventory:**
- Chicken Breast: 5000g raw (inventoryState: 'raw')
- Lettuce: 2000g raw (inventoryState: 'raw')
- Tomatoes: 1000g raw (inventoryState: 'raw')

**When 1 Order is Placed:**

| Ingredient | Recipe Needs | Inventory State | Cooking Method | Raw Equivalent | Deducted |
|-----------|-------------|----------------|----------------|----------------|----------|
| Chicken | 200g | raw | grilled (20% loss) | 200g ÷ 0.8 = 250g | 250g |
| Lettuce | 100g | raw | raw | 100g | 100g |
| Tomatoes | 50g | raw | raw | 50g | 50g |

**Inventory After Order:**
- Chicken Breast: 4750g raw ✓
- Lettuce: 1900g raw ✓
- Tomatoes: 950g raw ✓

## 💡 Best Practices

### 1. Consistent Nutritional Data
- Always enter nutrition values that match your inventory state
- Use nutrition databases for raw or cooked values accordingly
- Example: USDA database has separate entries for "Chicken breast, raw" and "Chicken breast, grilled"

### 2. Common Inventory States
- **Raw**: Chicken, fish, vegetables, rice, lentils
- **Cooked**: Pre-cooked chicken, boiled eggs, canned beans

### 3. Handling Mixed States
If you have both raw and cooked versions:
- Create separate inventory items:
  - "Chicken Breast - Raw"
  - "Chicken Breast - Cooked"

### 4. Updating Existing Inventory
- Edit each inventory item
- Set the correct inventory state
- Verify nutritional values match the state

## 🧮 Technical Details

### Formula: Raw Equivalent Calculation

```javascript
if (inventoryState === 'raw' && cookingMethod !== 'raw') {
  rawWeight = cookedWeight / (1 - weightLoss)
}
```

### Example Calculations

**200g Grilled Chicken (20% loss):**
```
Raw needed = 200g / (1 - 0.20)
           = 200g / 0.80
           = 250g
```

**200g Boiled Chicken (15% loss):**
```
Raw needed = 200g / (1 - 0.15)
           = 200g / 0.85
           = 235.3g
```

**200g Steamed Chicken (10% loss):**
```
Raw needed = 200g / (1 - 0.10)
           = 200g / 0.90
           = 222.2g
```

## ⚠️ Important Notes

1. **Water Loss Only**: Weight loss is primarily from water evaporation
2. **Calories Remain**: Total calories stay roughly the same (just concentrated)
3. **Protein/Macros**: Macronutrients are conserved, just concentrated per gram
4. **Oil Addition**: Fried/sautéed methods add calories from oil (handled separately)

## 🚀 Files Modified

- `src/components/cafe/CafeInventory.jsx` - Added inventory state UI
- `src/components/cafe/CafeMenu.jsx` - Added helper function and state tracking
- `src/services/cafeService.js` - Integrated conversion into order processing

## 📞 Support

If you have questions about:
- Which state to use for an ingredient
- Nutritional values for raw vs cooked
- Cooking weight loss percentages

Refer to USDA FoodData Central or similar nutrition databases.
