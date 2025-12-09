# 🔍 Cafe Inventory Debug Guide

## Issue: Inventory Not Updating After Orders

### ✅ Changes Made:

1. **Default Order Status**: Changed from 'pending' to 'completed'
2. **Console Logging**: Added detailed logs to track inventory deduction
3. **Auto-Reload**: Inventory reloads when switching tabs
4. **Stock Update Fix**: Fixed 'set' parameter in updateInventoryStock

---

## 🧪 Step-by-Step Testing

### Test 1: Check Menu Item Has Raw Materials

**Go to Menu Tab:**
1. Find your dish (e.g., "Chicken Dish")
2. Click to view details
3. **Check**: Does it show raw materials?
   - ✅ Should show: "Chicken - 200g" (or similar)
   - ❌ If empty: Menu item has no raw materials linked!

**Fix if empty:**
1. Edit the menu item
2. Search for "Chicken" in raw materials dropdown
3. Add quantity: 200, unit: g
4. Save

---

### Test 2: Check Inventory Has the Material

**Go to Inventory Tab:**
1. Look for "Chicken" in the table
2. **Check**: Current Stock shows a number (e.g., 200g)
3. Note the exact name (case-sensitive matching)

**Fix if not found:**
1. Add inventory item
2. Name: **Chicken** (exact match with menu)
3. Quantity: 1000
4. Unit: g
5. Min Stock: 100

---

### Test 3: Create Order with Console Open

**Open Browser Console** (F12 or Cmd+Option+I):

1. Go to Orders Tab
2. Click "New Order"
3. Select your dish
4. Click "Create Order"

**Watch Console Logs:**
```
🔍 Processing order items: [...]
📋 Menu item found: Chicken Dish Raw materials: [...]
📦 Deducting Chicken: 200g (200 × 1)
✅ Chicken: 1000g → 800g
💾 Inventory saved to localStorage
```

**If you see:**
- ⚠️ "Menu item has no raw materials" → Go to Test 1
- ⚠️ "Inventory item not found" → Names don't match exactly
- ✅ All logs appear → Inventory should update!

---

### Test 4: Verify Inventory Updated

**After Creating Order:**
1. Go to Inventory Tab
2. **Check**: Chicken stock decreased
   - Before: 1000g
   - After: 800g (if ordered 1 dish with 200g)

**If not updated:**
1. Refresh the page (F5)
2. Check again
3. If still not updated, check console for errors

---

## 🔍 Common Issues & Fixes

### Issue 1: Names Don't Match
**Problem:** Menu says "chicken" but Inventory says "Chicken"
**Solution:** Names must match exactly (case-insensitive, but check spelling)

**Fix:**
1. Go to Menu → Edit dish
2. Remove raw material
3. Re-add using dropdown (auto-fills from inventory)
4. Save

---

### Issue 2: No Raw Materials in Menu
**Problem:** Menu item created without raw materials
**Solution:** Edit menu item and add raw materials

**Steps:**
1. Menu Tab → Click Edit on dish
2. Scroll to "Raw Materials" section
3. Search for material in dropdown
4. Enter quantity and unit
5. Click "Add Raw Material"
6. Save menu item

---

### Issue 3: Unit Mismatch
**Problem:** Menu uses "kg" but inventory uses "g"
**Solution:** System handles conversion, but ensure consistency

**Best Practice:**
- Store inventory in base units (g, ml, pcs)
- Menu can use any unit
- System converts automatically

**Example:**
- Inventory: Chicken 1kg (1000g)
- Menu: Chicken 200g per dish
- Order: 1 dish
- Result: 1000g - 200g = 800g ✅

---

### Issue 4: Inventory Not Refreshing
**Problem:** Stock updated in localStorage but UI doesn't show
**Solution:** Switch tabs or refresh page

**Auto-Refresh Added:**
- Inventory reloads when you switch browser tabs
- Or manually refresh page (F5)

---

## 📊 Debug Checklist

### Before Creating Order:
- [ ] Menu item exists
- [ ] Menu item has raw materials
- [ ] Raw materials show correct quantities
- [ ] Inventory has matching materials
- [ ] Material names match exactly
- [ ] Current stock is sufficient

### After Creating Order:
- [ ] Console shows processing logs
- [ ] Console shows deduction logs
- [ ] Console shows save confirmation
- [ ] No error messages in console
- [ ] Inventory tab shows updated stock
- [ ] Dashboard shows order count

---

## 🛠️ Manual Testing Script

### Complete Flow Test:

```
1. SETUP
   ✓ Add Inventory: Chicken, 1000g, min 100g
   ✓ Create Menu: Chicken Tikka, ₹200
   ✓ Add Raw Material: Chicken 200g
   ✓ Save menu item

2. CHECK BEFORE
   ✓ Inventory shows: Chicken 1000g
   ✓ Menu shows: Chicken Tikka with raw materials

3. CREATE ORDER
   ✓ Open console (F12)
   ✓ New Order → Select Chicken Tikka
   ✓ Quantity: 1
   ✓ Create Order
   ✓ Watch console logs

4. VERIFY AFTER
   ✓ Console shows: "✅ Chicken: 1000g → 800g"
   ✓ Go to Inventory tab
   ✓ Chicken shows: 800g
   ✓ Dashboard shows: 1 order, ₹200 revenue

5. CREATE ANOTHER ORDER
   ✓ Repeat step 3
   ✓ Verify: 800g → 600g
```

---

## 🔧 Advanced Debugging

### Check localStorage Directly:

**Open Console and run:**
```javascript
// Check inventory
JSON.parse(localStorage.getItem('cafe_inventory'))

// Check menu
JSON.parse(localStorage.getItem('cafe_menu'))

// Check orders
JSON.parse(localStorage.getItem('cafe_orders'))
```

**Look for:**
1. Inventory item with your material name
2. Menu item with rawMaterials array
3. Recent orders with items array

---

### Clear All Data (Nuclear Option):

**If everything is broken:**
```javascript
// Clear all cafe data
localStorage.removeItem('cafe_inventory');
localStorage.removeItem('cafe_menu');
localStorage.removeItem('cafe_orders');
localStorage.removeItem('cafe_purchases');

// Refresh page
location.reload();
```

**Then start fresh:**
1. Add inventory items
2. Create menu items with raw materials
3. Test orders

---

## 📝 Expected Console Output

### Successful Order Creation:
```
🔍 Processing order items: [{id: "abc123", name: "Chicken Tikka", quantity: 1, price: 200}]
📋 Menu item found: Chicken Tikka Raw materials: [{name: "Chicken", quantity: "200", unit: "g"}]
📦 Deducting Chicken: 200g (200 × 1)
✅ Chicken: 1000g → 800g
💾 Inventory saved to localStorage
```

### Problem: No Raw Materials:
```
🔍 Processing order items: [...]
📋 Menu item found: Chicken Tikka Raw materials: undefined
⚠️ Menu item has no raw materials: Chicken Tikka
```
**Fix:** Add raw materials to menu item

### Problem: Material Not Found:
```
🔍 Processing order items: [...]
📋 Menu item found: Chicken Tikka Raw materials: [{name: "Chicken", ...}]
⚠️ Inventory item not found: Chicken
```
**Fix:** Add "Chicken" to inventory or check name spelling

---

## ✅ Quick Fix Summary

1. **Inventory not updating?**
   - Check console logs
   - Verify raw materials in menu
   - Check name matching
   - Refresh page

2. **Order created but no deduction?**
   - Menu item missing raw materials
   - Add raw materials to menu item

3. **Can't find material in dropdown?**
   - Add to inventory first
   - Then add to menu

4. **Stock shows wrong number?**
   - Check unit conversion
   - Verify calculation in console

---

## 🎯 Success Criteria

### Everything Working When:
- ✅ Console shows deduction logs
- ✅ Inventory decreases after order
- ✅ Dashboard shows correct revenue
- ✅ Low stock alerts appear when needed
- ✅ Multiple orders work correctly
- ✅ Trainer orders deduct inventory (but ₹0)

---

**Follow this guide and check console logs to identify the exact issue! 🔍**
