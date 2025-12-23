-- ============================================================
-- Check Purchase vs Expense Amount Discrepancy
-- Run this to find mismatches between purchases and expenses
-- ============================================================

-- Check specific order PO559390
SELECT 
  'PURCHASE' as source,
  p.order_number,
  p.supplier_name,
  p.total_amount,
  p.date,
  p.id as purchase_id
FROM cafe_purchases p
WHERE p.order_number = 'PO559390'

UNION ALL

SELECT 
  'EXPENSE' as source,
  e.order_number,
  e.description,
  e.amount as total_amount,
  e.date,
  e.purchase_id
FROM cafe_expenses e
WHERE e.order_number = 'PO559390';

-- Find all mismatches
SELECT 
  p.order_number,
  p.supplier_name,
  p.total_amount as purchase_amount,
  e.amount as expense_amount,
  (p.total_amount - e.amount) as difference,
  p.date
FROM cafe_purchases p
LEFT JOIN cafe_expenses e ON e.purchase_id = p.id
WHERE p.total_amount != e.amount
ORDER BY p.date DESC;
