# Centralized Pricing System

## ✅ Single Source of Truth

All pricing calculations now use **ONE FUNCTION** from `/src/utils/pricingUtils.js`

### The Single Function

```javascript
calculatePricing(planType, mealsPerDay, proteinPerMeal)
```

**Returns:**
```javascript
{
  pricePerMeal: 299,      // Price per individual meal
  mealsPerMonth: 25,      // Total meals in a month (30 days - 5 Sundays)
  mealsPerDay: 2,         // Meals per day
  totalMeals: 50,         // Total meals (mealsPerDay × mealsPerMonth)
  monthlyAmount: 14950,   // Total monthly cost
  perDayPrice: 498,       // Average cost per day
  dailyAmount: 498        // Alias for perDayPrice
}
```

---

## 📍 Where It's Used

### 1. **HomePage.jsx**
```javascript
import { calculatePricing, MEALS_PER_MONTH } from '../utils/pricingUtils';

const pricing = calculatePricing(key, selectedMeals, selectedProtein);
const { pricePerMeal, monthlyAmount, perDayPrice, totalMeals } = pricing;
```

### 2. **SubscriptionModal.jsx**
```javascript
import { calculatePricing } from '../utils/pricingUtils';

const pricing = calculatePricing(planType, mealsPerDay, proteinPerMeal);
// Uses pricing.pricePerMeal and pricing.monthlyAmount
```

### 3. **nutrientService.js**
```javascript
import { calculatePricing } from '../utils/pricingUtils';

// Re-exported for backward compatibility
export const calculateMealPlanPricing = calculatePricing;
```

---

## 💰 Pricing Logic

### Base Prices (30g protein)

| Plan Type | 1 Meal/Day | 2 Meals/Day | 3 Meals/Day |
|-----------|------------|-------------|-------------|
| **Non-Veg** | ₹279 | ₹269 | ₹259 |
| **Veg + Eggs** | ₹219 | ₹209 | ₹199 |
| **Pure Veg** | ₹239 | ₹229 | ₹219 |

### Protein Add-on
- **+₹30 for every 10g** of protein above 30g
- Example: 40g protein = base price + ₹30
- Example: 50g protein = base price + ₹60
- Example: 60g protein = base price + ₹90

### Monthly Calculation
- **25 meals per month** (30 days - 5 Sundays off)
- Monthly Amount = `pricePerMeal × mealsPerDay × 25`

---

## 🧮 Example Calculations

### Example 1: Non-Veg, 2 meals/day, 40g protein
```
Base price (2 meals, 30g): ₹269
Protein add-on (40g - 30g = 10g): +₹30
Price per meal: ₹299
Total meals: 2 × 25 = 50 meals
Monthly amount: ₹299 × 50 = ₹14,950
```

### Example 2: Pure Veg, 1 meal/day, 30g protein
```
Base price (1 meal, 30g): ₹239
Protein add-on: ₹0 (no extra)
Price per meal: ₹239
Total meals: 1 × 25 = 25 meals
Monthly amount: ₹239 × 25 = ₹5,975
```

### Example 3: Veg+Eggs, 3 meals/day, 60g protein
```
Base price (3 meals, 30g): ₹199
Protein add-on (60g - 30g = 30g): +₹90
Price per meal: ₹289
Total meals: 3 × 25 = 75 meals
Monthly amount: ₹289 × 75 = ₹21,675
```

---

## ✅ Benefits of Centralization

1. **Consistency** - Same price everywhere (HomePage, Modal, Dashboard)
2. **Maintainability** - Change pricing in ONE place only
3. **No Duplication** - DRY principle followed
4. **Easy Testing** - Single function to test
5. **Clear Logic** - All pricing rules in one file

---

## 🔧 How to Change Prices

**Only edit:** `/src/utils/pricingUtils.js`

```javascript
// Example: Increase Non-Veg 2-meal price
if (planType === 'non-veg') {
  if (mealsPerDay === 1) basePrice = 279;
  else if (mealsPerDay === 2) basePrice = 299; // Changed from 269
  else basePrice = 259;
}
```

**That's it!** The change applies everywhere automatically.

---

## 🚫 What NOT to Do

❌ Don't create separate pricing functions  
❌ Don't hardcode prices in components  
❌ Don't duplicate the calculation logic  
❌ Don't modify prices in multiple places  

✅ Always use `calculatePricing()` from `pricingUtils.js`

---

## 📝 Constants Available

```javascript
import { MEALS_PER_MONTH } from '../utils/pricingUtils';
// MEALS_PER_MONTH = 25
```

---

**Last Updated:** December 6, 2025  
**Status:** ✅ Fully Centralized
