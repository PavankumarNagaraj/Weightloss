# Manual Execution Guide - Supabase SQL Editor

Since direct database connection requires the database password (which is different from the service role key), please follow these simple steps:

## 🚀 Quick Execution (2 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to: https://supabase.com/dashboard/project/capvowxxembnycdonghv/sql
2. Login if needed

### Step 2: Run the Migration
1. Open the file: `supabase_migrations/RUN_THIS_ONCE.sql`
2. Copy ALL contents (Cmd+A, Cmd+C)
3. Paste into Supabase SQL Editor
4. Click **"Run"** button
5. Wait ~30 seconds for completion

### Step 3: Verify Results
1. Open the file: `supabase_migrations/VERIFY_RESULTS.sql`
2. Copy ALL contents
3. Paste into Supabase SQL Editor
4. Click **"Run"** button
5. Check the results

## ✅ Expected Results

### Query 1: nutrition_reference
```
total_items: 170+
items_with_micronutrients: 170+
percentage: ~100%
```

### Query 2: cafe_inventory
```
total_items: 125
items_with_micronutrients: ~95
percentage: ~76%
```

### Query 5: Items WITHOUT micronutrients
Should show ~30 non-food items (cleaning supplies, packaging, etc.)
**This is correct** - these items don't need nutritional data.

## 📊 What Gets Added

- **21 micronutrients** added to 170+ food items
- **Vitamins:** A, C, D, E, K, B1, B2, B3, B6, B12, Folate
- **Minerals:** Calcium, Iron, Magnesium, Phosphorus, Potassium, Sodium, Zinc, Copper, Manganese, Selenium

## 🎯 Files to Use

1. **`RUN_THIS_ONCE.sql`** - The complete migration (all 8 files combined)
2. **`VERIFY_RESULTS.sql`** - Verification queries

## ⏱️ Total Time: < 2 minutes

That's it! Your micronutrient data will be complete.

---

## 🔧 Alternative: Run Individual Files

If you prefer to run files one by one (for better error tracking):

```sql
-- Run in this exact order:
1. 00_add_micronutrient_columns.sql
2. add_micronutrients_batch_1.sql
3. add_micronutrients_batch_2.sql
4. add_micronutrients_batch_3.sql
5. add_micronutrients_batch_4.sql
6. add_micronutrients_batch_5.sql
7. add_micronutrients_batch_6_missing.sql
8. 99_add_micronutrients_to_dishes.sql
```

Then run `VERIFY_RESULTS.sql` to check.
