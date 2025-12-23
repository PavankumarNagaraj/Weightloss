-- ============================================================
-- Fix Purchase-Expense Amount Mismatches
-- This script syncs all expense amounts to match their purchases
-- ============================================================

-- Step 1: Check current mismatches
SELECT 
  p.order_number,
  p.supplier_name,
  p.total_amount as purchase_amount,
  e.amount as expense_amount,
  (p.total_amount - e.amount) as difference,
  e.id as expense_id,
  p.id as purchase_id
FROM cafe_purchases p
LEFT JOIN cafe_expenses e ON e.purchase_id = p.id
WHERE p.total_amount != e.amount;

-- Step 2: Fix all mismatched expenses to match purchases
UPDATE cafe_expenses e
SET amount = p.total_amount
FROM cafe_purchases p
WHERE e.purchase_id = p.id
  AND e.amount != p.total_amount;

-- Step 3: Verify the fix
SELECT 
  p.order_number,
  p.total_amount as purchase_amount,
  e.amount as expense_amount,
  CASE 
    WHEN p.total_amount = e.amount THEN '✅ SYNCED'
    ELSE '❌ MISMATCH'
  END as status
FROM cafe_purchases p
LEFT JOIN cafe_expenses e ON e.purchase_id = p.id
ORDER BY p.date DESC
LIMIT 20;
