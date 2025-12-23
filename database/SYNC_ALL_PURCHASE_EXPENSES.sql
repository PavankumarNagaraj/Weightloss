-- ============================================================
-- Sync ALL Purchase-Expense Amounts
-- Run this ONCE to fix all existing mismatches
-- ============================================================

-- Update all expenses to match their purchase amounts
UPDATE cafe_expenses e
SET amount = p.total_amount
FROM cafe_purchases p
WHERE e.purchase_id = p.id
  AND e.purchase_id IS NOT NULL;

-- Verify all are now synced
SELECT 
  p.order_number,
  p.supplier_name,
  p.total_amount as purchase_amount,
  e.amount as expense_amount,
  CASE 
    WHEN p.total_amount = e.amount THEN '✅ SYNCED'
    ELSE '❌ STILL MISMATCH'
  END as status,
  p.date
FROM cafe_purchases p
LEFT JOIN cafe_expenses e ON e.purchase_id = p.id
ORDER BY p.date DESC;
