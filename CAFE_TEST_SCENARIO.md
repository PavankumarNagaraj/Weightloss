# Cafe Management - Complete Test Scenario

## 🧪 Test the Complete Flow

Follow this step-by-step to verify all connections work:

---

## Step 1: Add Inventory (Purchases Tab)

### Purchase 1:
- Material: **Paneer**
- Quantity: **5**
- Unit: **kg**
- Total Price: **₹1000**
- Click "Add" → "Record Purchase"

**Expected Result:**
- ✅ Purchase recorded
- ✅ Inventory shows: Paneer 5kg
- ✅ Dashboard: Total Purchases = 1

---

## Step 2: Check Inventory (Inventory Tab)

**Expected to See:**
- ✅ Paneer: 5kg current stock
- ✅ Min Stock: (whatever you set)
- ✅ Status: OK (if above minimum)

---

## Step 3: Create Menu Item (Menu Tab)

### Dish: Paneer Tikka
- Name: **Paneer Tikka**
- Price: **₹200**
- Type: **Non-Veg**
- Raw Materials:
  - Search "Paneer" → Select from dropdown
  - Quantity: **200**
  - Unit: **g** (auto-filled)
  - Click "Add Raw Material"
- Click "Add Menu Item"

**Expected Result:**
- ✅ Menu item created
- ✅ Shows raw materials: Paneer 200g
- ✅ Price: ₹200

---

## Step 4: Create Order (Orders Tab)

### Order 1: Regular Customer
- Click "New Order"
- Customer Name: **John Doe**
- Customer Type: **Customer** (purple)
- Click on "Paneer Tikka" (add 2 items)
- Quantity: **2**
- Subtotal: **₹400**
- Discount: **₹0** (or add ₹50 to test)
- Click "Create Order"

**Expected Result:**
- ✅ Order created
- ✅ Order shows in table
- ✅ Amount: ₹400 (or ₹350 if discount)

---

## Step 5: Check Inventory Deduction

**Go to Inventory Tab:**
- ✅ Paneer: 5kg → **4.6kg** (deducted 400g)
- ✅ Calculation: 200g × 2 orders = 400g = 0.4kg
- ✅ 5kg - 0.4kg = 4.6kg ✅

---

## Step 6: Create Trainer Order

### Order 2: Trainer (Free)
- Click "New Order"
- Customer Name: **Trainer Mike**
- Customer Type: **Trainer** (green)
- Add "Paneer Tikka" × 1
- Subtotal: **₹200**
- Discount: **Automatic -₹200**
- Total: **₹0**
- Click "Create Order (Free)"

**Expected Result:**
- ✅ Order created with "TRAINER" badge
- ✅ Amount shows: ₹0 (FREE)
- ✅ Green color in table

---

## Step 7: Check Inventory Again

**Go to Inventory Tab:**
- ✅ Paneer: 4.6kg → **4.4kg** (deducted another 200g)
- ✅ Calculation: 200g × 1 order = 200g = 0.2kg
- ✅ 4.6kg - 0.2kg = 4.4kg ✅

---

## Step 8: Check Dashboard

**Go to Dashboard Tab:**

### Today's Stats:
- ✅ Today's Orders: **2**
- ✅ Today's Revenue: **₹400** (or ₹350 if discount)
  - Note: Trainer order = ₹0, not counted in revenue ✅
- ✅ Pending Orders: **2**

### Recent Orders:
- ✅ Shows last 2 orders
- ✅ John Doe - ₹400
- ✅ Trainer Mike - ₹0 (with TRAINER badge)

### Low Stock Alerts:
- ✅ If Paneer (4.4kg) < Min Stock → Shows alert
- ✅ Otherwise: "All Stock Levels Good!"

### Overall Statistics:
- ✅ Total Orders: 2
- ✅ Inventory Items: 1 (Paneer)
- ✅ Total Purchases: 1

---

## Step 9: Add More Purchases

**Go to Purchases Tab:**
- Add Paneer: 3kg @ ₹600
- Click "Record Purchase"

**Expected Result:**
- ✅ Inventory: 4.4kg → **7.4kg** ✅
- ✅ Dashboard: Total Purchases = 2

---

## Step 10: Test Low Stock Alert

**Go to Inventory Tab:**
- Edit Paneer
- Set Min Stock: **8000** (8kg in grams)
- Save

**Go to Dashboard:**
- ✅ Low Stock Alert appears! ⚠️
- ✅ Shows: Paneer - Current: 7.4kg, Min: 8kg

---

## ✅ All Connections Verified!

If all steps work as expected, your system is **fully integrated**:

1. ✅ **Purchases → Inventory**: Stock increases
2. ✅ **Inventory → Menu**: Materials linked
3. ✅ **Menu → Orders**: Dishes selectable
4. ✅ **Orders → Inventory**: Stock deducts automatically
5. ✅ **Orders → Revenue**: Money tracked (respects customer type)
6. ✅ **Inventory → Alerts**: Low stock detected
7. ✅ **Dashboard → Everything**: All data visible

---

## 🎯 Quick Verification Checklist

- [ ] Purchase increases inventory ✅
- [ ] Inventory items appear in menu dropdown ✅
- [ ] Menu items appear in orders ✅
- [ ] Orders deduct inventory automatically ✅
- [ ] Customer orders charge money ✅
- [ ] Trainer orders are free ✅
- [ ] Discounts work correctly ✅
- [ ] Dashboard shows today's revenue ✅
- [ ] Dashboard shows order count ✅
- [ ] Low stock alerts appear ✅
- [ ] Recent orders display ✅
- [ ] Purchase stats update ✅

---

## 🚨 If Something Doesn't Work

**Check:**
1. Material names match exactly (case-insensitive)
2. Units are consistent
3. Raw materials are added to menu items
4. Browser console for errors
5. LocalStorage has data

**Common Issues:**
- Menu item has no raw materials → Won't deduct inventory
- Material name mismatch → Won't find inventory item
- Unit conversion → Check convertToGrams function

---

## 💡 Pro Tips

1. **Round Figures**: Use discount to make totals round (₹347 → ₹350 discount ₹3)
2. **Trainer Orders**: Always free, great for staff meals
3. **Low Stock**: Set realistic minimums (e.g., 500g for daily items)
4. **Bulk Purchases**: Buy in kg, use in grams - system handles conversion
5. **Dashboard**: Check daily for low stock alerts

---

**Your cafe management system is production-ready! 🎉**
