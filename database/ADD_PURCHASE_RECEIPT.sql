-- ============================================================
-- Add receipt/image field to cafe_purchases table
-- Run this to enable image upload for purchase orders
-- ============================================================

-- Add receipt_url column to store image URLs
ALTER TABLE cafe_purchases 
ADD COLUMN IF NOT EXISTS receipt_url TEXT;

-- Add receipt_filename column to store original filename
ALTER TABLE cafe_purchases 
ADD COLUMN IF NOT EXISTS receipt_filename TEXT;

-- Verify the addition
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'cafe_purchases' 
  AND column_name IN ('receipt_url', 'receipt_filename');
