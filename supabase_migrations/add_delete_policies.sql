-- Add DELETE policies to all cafe tables to enable Clear All Data functionality

-- cafe_orders
CREATE POLICY IF NOT EXISTS "Enable delete access for all users" ON public.cafe_orders
    FOR DELETE USING (true);

-- cafe_menu
CREATE POLICY IF NOT EXISTS "Enable delete access for all users" ON public.cafe_menu
    FOR DELETE USING (true);

-- cafe_inventory
CREATE POLICY IF NOT EXISTS "Enable delete access for all users" ON public.cafe_inventory
    FOR DELETE USING (true);

-- cafe_purchases
CREATE POLICY IF NOT EXISTS "Enable delete access for all users" ON public.cafe_purchases
    FOR DELETE USING (true);

-- cafe_expenses
CREATE POLICY IF NOT EXISTS "Enable delete access for all users" ON public.cafe_expenses
    FOR DELETE USING (true);

-- cafe_investments
CREATE POLICY IF NOT EXISTS "Enable delete access for all users" ON public.cafe_investments
    FOR DELETE USING (true);

-- cafe_settings (add delete policy)
CREATE POLICY IF NOT EXISTS "Enable delete access for all users" ON public.cafe_settings
    FOR DELETE USING (true);

-- cafe_weekly_plans already has delete policy from previous migration

-- Verify all policies are in place
DO $$
BEGIN
    RAISE NOTICE 'Delete policies added successfully to all cafe tables';
END $$;
