-- Add operation mode columns to cafe_settings table
-- This allows cafes to configure which services they offer

ALTER TABLE cafe_settings
ADD COLUMN IF NOT EXISTS operation_mode_dine_in BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS operation_mode_pickup BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS operation_mode_delivery BOOLEAN DEFAULT true;

-- Add comment to explain the columns
COMMENT ON COLUMN cafe_settings.operation_mode_dine_in IS 'Enable dine-in service at the cafe';
COMMENT ON COLUMN cafe_settings.operation_mode_pickup IS 'Enable pickup/takeaway service';
COMMENT ON COLUMN cafe_settings.operation_mode_delivery IS 'Enable delivery service';

-- Update existing row to have all modes enabled by default
UPDATE cafe_settings 
SET 
  operation_mode_dine_in = COALESCE(operation_mode_dine_in, true),
  operation_mode_pickup = COALESCE(operation_mode_pickup, true),
  operation_mode_delivery = COALESCE(operation_mode_delivery, true)
WHERE id = 1;
