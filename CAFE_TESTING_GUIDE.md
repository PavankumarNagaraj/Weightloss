# 🧪 Cafe Management System - Complete Data Flow Testing Guide

## 📋 Test Execution Plan

This document guides you through testing the complete data flow from inventory creation to order completion.

---

## ✅ **TEST 1: Create Inventory Items Manually**

### Steps:
1. Navigate to **Inventory** tab
2. Click **"+ Add Item"** button
3. Create the following test items:

| Material Name | Current Stock | Min Stock | Unit | Category |
|--------------|---------------|-----------|------|----------|
| Tomato | 5000 | 1000 | gm | Fresh Produce |
| Onion | 3000 | 500 | gm | Fresh Produce |
| Chicken | 2000 | 500 | gm | Refrigerated |
| Rice | 10000 | 2000 | gm | Dry Store |
| Milk | 5000 | 1000 | ml | Refrigerated |
| Vegetable Oil | 3000 | 500 | ml | Dry Store |
| Salt | 1000 | 200 | gm | Dry Store |
| Eggs | 50 | 20 | pcs | Refrigerated |

### Expected Results:
- ✅ All items created successfully
- ✅ Items appear in inventory table
- ✅ Units show only gm, ml, pcs
- ✅ Stock levels display correctly
- ✅ Status indicators show (Low Stock/In Stock)

---

## ✅ **TEST 2: Import Inventory from Template**

### Steps:
1. In **Inventory** tab, click **"Bulk Import"** button
2. Search for items: "Coffee Powder", "Tea Powder", "Sugar"
3. Select 5-10 items from different categories
4. Click **"Import X Items"**

### Expected Results:
- ✅ Import modal opens with template items
- ✅ All units show as gm, ml, or pcs (NO kg or l)
- ✅ Search filters items correctly
- ✅ Category filter works
- ✅ Selected items import successfully
- ✅ Toast notification confirms import
- ✅ Items appear in inventory table

### ⚠️ Critical Check:
**VERIFY NO kg OR l UNITS APPEAR IN IMPORTED ITEMS**

---

## ✅ **TEST 3: Purchase Inventory Items**

### Steps:
1. Navigate to **Purchases** tab
2. Click **"+ Add Purchase"** button
3. Create a purchase with multiple items:

| Material | Quantity | Unit | Price |
|----------|----------|------|-------|
| Tomato | 5000 | gm | 250 |
| Chicken | 3000 | gm | 450 |
| Rice | 10000 | gm | 600 |
| Milk | 5000 | ml | 300 |

4. Add vendor name: "Test Supplier"
5. Click **"Add Purchase"**

### Expected Results:
- ✅ Purchase created successfully
- ✅ Inventory stock levels increase correctly
- ✅ Purchase appears in purchases list
- ✅ Total amount calculated correctly
- ✅ Date recorded properly
- ✅ Can view purchase details

### Verification:
- Check **Inventory** tab - stock should have increased
- Tomato: 5000 + 5000 = 10000 gm
- Chicken: 2000 + 3000 = 5000 gm
- Rice: 10000 + 10000 = 20000 gm
- Milk: 5000 + 5000 = 10000 ml

---

## ✅ **TEST 4: Create Menu Items with Ingredients**

### Steps:
1. Navigate to **Menu** tab
2. Click **"+ Add Item"** button
3. Create the following menu items:

#### Menu Item 1: Chicken Biryani
- **Name:** Chicken Biryani
- **Price:** 180
- **Category:** Main Course
- **Description:** Delicious chicken biryani
- **Raw Materials:**
  - Rice: 200 gm
  - Chicken: 150 gm
  - Onion: 50 gm
  - Tomato: 30 gm
  - Vegetable Oil: 20 ml
  - Salt: 5 gm

#### Menu Item 2: Masala Omelette
- **Name:** Masala Omelette
- **Price:** 60
- **Category:** Breakfast
- **Description:** Spicy omelette
- **Raw Materials:**
  - Eggs: 2 pcs
  - Onion: 20 gm
  - Tomato: 20 gm
  - Vegetable Oil: 10 ml
  - Salt: 2 gm

#### Menu Item 3: Tea
- **Name:** Tea
- **Price:** 20
- **Category:** Beverages
- **Description:** Hot tea
- **Raw Materials:**
  - Tea Powder: 5 gm (if imported, otherwise skip)
  - Milk: 100 ml
  - Sugar: 10 gm (if imported, otherwise skip)

### Expected Results:
- ✅ Menu items created successfully
- ✅ Ingredients linked correctly
- ✅ Items appear in menu list
- ✅ Can edit menu items
- ✅ Ingredient quantities saved properly
- ✅ Quick-add feature works for missing ingredients

### Test Quick-Add Feature:
- Try adding a non-existent ingredient (e.g., "Garam Masala")
- System should show hint: "💡 Type ingredient name and click 'Add' to create it"
- Add it and verify it's created in inventory

---

## ✅ **TEST 5: Create Order & Verify Inventory Deduction**

### Steps:

#### 5A: Record Current Stock Levels
Before ordering, note current stock:
- Rice: _____ gm
- Chicken: _____ gm
- Onion: _____ gm
- Tomato: _____ gm
- Eggs: _____ pcs
- Milk: _____ ml

#### 5B: Create Order
1. Navigate to **Orders** tab
2. Add items to cart:
   - **Chicken Biryani** x 2 (quantity: 2)
   - **Masala Omelette** x 1 (quantity: 1)
   - **Tea** x 3 (quantity: 3)

#### 5C: Test Portion Size Feature
1. For **Chicken Biryani**, change portion size to **1.5x (Large)**
2. Verify price updates in cart
3. For **Tea**, keep at **1x (Regular)**

#### 5D: Complete Order
1. Enter customer name: "Test Customer"
2. Select payment method: "Cash"
3. Click **"Place Order"**

### Expected Results:
- ✅ Order created successfully
- ✅ Order total calculated correctly
- ✅ Portion size affects price correctly
- ✅ Inventory deducted properly

### Verify Inventory Deductions:

**Expected Deductions:**

**Chicken Biryani x 2 (with 1.5x portion on one):**
- First item: 1x portion = 200g rice, 150g chicken, 50g onion, 30g tomato, 20ml oil, 5g salt
- Second item: 1.5x portion = 300g rice, 225g chicken, 75g onion, 45g tomato, 30ml oil, 7.5g salt
- **Total:** 500g rice, 375g chicken, 125g onion, 75g tomato, 50ml oil, 12.5g salt

**Masala Omelette x 1:**
- 2 pcs eggs, 20g onion, 20g tomato, 10ml oil, 2g salt

**Tea x 3:**
- 300ml milk (3 × 100ml)
- 15g tea powder (if used)
- 30g sugar (if used)

**Total Expected Deductions:**
- Rice: 500 gm
- Chicken: 375 gm
- Onion: 145 gm (125 + 20)
- Tomato: 95 gm (75 + 20)
- Eggs: 2 pcs
- Milk: 300 ml
- Vegetable Oil: 60 ml (50 + 10)
- Salt: 14.5 gm (12.5 + 2)

#### Check Inventory Tab:
Verify stock decreased by exact amounts above.

---

## ✅ **TEST 6: Test Other Functionalities**

### 6A: Dashboard
1. Navigate to **Dashboard** tab
2. Verify:
   - ✅ Today's orders count correct
   - ✅ Revenue shows correct total
   - ✅ Recent orders list displays
   - ✅ Low stock alerts (if any)
   - ✅ Charts render properly

### 6B: Suggestions Tab
1. Navigate to **Suggestions** tab
2. Verify:
   - ✅ Price suggestions load
   - ✅ Calculations based on purchase history
   - ✅ Recommendations make sense
   - ✅ No console errors

### 6C: Cost Analysis
1. Navigate to **Cost Analysis** tab
2. Verify:
   - ✅ Menu items show cost breakdown
   - ✅ Profit margins calculated
   - ✅ Ingredient costs accurate
   - ✅ Sorting works

### 6D: Credit Orders (if applicable)
1. Create a credit order:
   - Add items to cart
   - Select "Credit" payment
   - Enter customer name
   - Place order
2. Verify:
   - ✅ Order marked as credit
   - ✅ Shows in credit orders list
   - ✅ Can mark as paid
   - ✅ Inventory still deducted

### 6E: Order History
1. Navigate to **Orders** tab
2. View order history
3. Verify:
   - ✅ All orders listed
   - ✅ Can filter by date
   - ✅ Can search orders
   - ✅ Order details correct
   - ✅ Portion sizes recorded

### 6F: Purchase History
1. Navigate to **Purchases** tab
2. View purchase history
3. Verify:
   - ✅ All purchases listed
   - ✅ Can view details
   - ✅ Totals correct
   - ✅ Date filtering works

### 6G: Inventory Management
1. Test inventory features:
   - ✅ Edit an item
   - ✅ Update stock manually
   - ✅ Change min stock level
   - ✅ Delete an item (test item only)
   - ✅ Search inventory
   - ✅ Filter by category
   - ✅ Low stock indicators

### 6H: Menu Management
1. Test menu features:
   - ✅ Edit menu item
   - ✅ Update price
   - ✅ Modify ingredients
   - ✅ Change category
   - ✅ Delete menu item (test item only)
   - ✅ Search menu

---

## 🔍 **Critical Data Flow Checks**

### Flow 1: Purchase → Inventory → Menu → Order
```
Purchase (Add Stock) 
  ↓
Inventory (Stock Increases)
  ↓
Menu (Uses Inventory Items)
  ↓
Order (Deducts from Inventory)
  ↓
Inventory (Stock Decreases)
```

### Flow 2: Portion Size Impact
```
Order with 1.5x Portion
  ↓
Price = Base Price × 1.5
  ↓
Inventory Deduction = Base Qty × 1.5
```

### Flow 3: Quick-Add Inventory
```
Menu Creation (Type New Ingredient)
  ↓
System Detects Not in Inventory
  ↓
Auto-Create Inventory Item
  ↓
Link to Menu Item
```

---

## 🐛 **Known Issues to Watch For**

1. **Unit Consistency:**
   - ❌ Check for any kg or l units appearing
   - ✅ Should only see gm, ml, pcs

2. **Inventory Deduction:**
   - ❌ Stock not decreasing after order
   - ❌ Incorrect deduction amounts
   - ❌ Portion size not affecting deduction

3. **Price Calculations:**
   - ❌ Portion size not updating price
   - ❌ Order total incorrect
   - ❌ Tax/discount issues

4. **Data Persistence:**
   - ❌ Data lost on refresh
   - ❌ Supabase sync issues
   - ❌ Duplicate entries

---

## 📊 **Test Results Template**

### Test Summary:
- **Date:** _____________
- **Tester:** _____________
- **Environment:** Development (localhost:5174)

### Results:

| Test | Status | Notes |
|------|--------|-------|
| 1. Create Inventory | ⬜ Pass / ⬜ Fail | |
| 2. Import Inventory | ⬜ Pass / ⬜ Fail | |
| 3. Purchase Items | ⬜ Pass / ⬜ Fail | |
| 4. Create Menu | ⬜ Pass / ⬜ Fail | |
| 5. Create Order | ⬜ Pass / ⬜ Fail | |
| 6. Inventory Deduction | ⬜ Pass / ⬜ Fail | |
| 7. Portion Size | ⬜ Pass / ⬜ Fail | |
| 8. Dashboard | ⬜ Pass / ⬜ Fail | |
| 9. Suggestions | ⬜ Pass / ⬜ Fail | |
| 10. Cost Analysis | ⬜ Pass / ⬜ Fail | |

### Issues Found:
1. _____________________________________________
2. _____________________________________________
3. _____________________________________________

### Overall Status: ⬜ PASS / ⬜ FAIL

---

## 🎯 **Quick Test Checklist**

- [ ] Server running on http://localhost:5174
- [ ] Login to Cafe Management
- [ ] Create 8 inventory items manually
- [ ] Import 5-10 items from template
- [ ] Verify NO kg or l units
- [ ] Create purchase with 4 items
- [ ] Verify inventory stock increased
- [ ] Create 3 menu items with ingredients
- [ ] Test quick-add for missing ingredient
- [ ] Create order with 3 items
- [ ] Test portion size (1.5x)
- [ ] Verify inventory deducted correctly
- [ ] Check dashboard displays
- [ ] Test suggestions tab
- [ ] Test cost analysis
- [ ] Test all CRUD operations
- [ ] Check browser console for errors
- [ ] Verify data persists on refresh

---

## 💡 **Tips for Testing**

1. **Keep Browser Console Open:** Watch for errors
2. **Use Incognito Mode:** Test fresh state
3. **Take Screenshots:** Document issues
4. **Test Edge Cases:** 
   - Zero stock
   - Large quantities
   - Decimal values
   - Special characters
5. **Refresh Between Tests:** Ensure data persists
6. **Check Network Tab:** Verify API calls

---

## 🚀 **Ready to Test!**

Open your browser to: **http://localhost:5174**

Follow each test step carefully and document any issues found.

Good luck! 🎉
