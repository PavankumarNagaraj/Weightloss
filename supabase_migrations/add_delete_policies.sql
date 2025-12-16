-- Add DELETE policies to all cafe tables to enable Clear All Data functionality
-- Note: DROP IF EXISTS first to avoid conflicts, then CREATE

-- cafe_orders
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.cafe_orders;
CREATE POLICY "Enable delete access for all users" ON public.cafe_orders
    FOR DELETE USING (true);

-- cafe_menu
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.cafe_menu;
CREATE POLICY "Enable delete access for all users" ON public.cafe_menu
    FOR DELETE USING (true);

-- cafe_inventory
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.cafe_inventory;
CREATE POLICY "Enable delete access for all users" ON public.cafe_inventory
    FOR DELETE USING (true);

-- cafe_purchases
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.cafe_purchases;
CREATE POLICY "Enable delete access for all users" ON public.cafe_purchases
    FOR DELETE USING (true);

-- cafe_expenses
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.cafe_expenses;
CREATE POLICY "Enable delete access for all users" ON public.cafe_expenses
    FOR DELETE USING (true);

-- cafe_investments
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.cafe_investments;
CREATE POLICY "Enable delete access for all users" ON public.cafe_investments
    FOR DELETE USING (true);

-- cafe_settings
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.cafe_settings;
CREATE POLICY "Enable delete access for all users" ON public.cafe_settings
    FOR DELETE USING (true);

-- cafe_weekly_plans already has delete policy from previous migration
-- But we'll ensure it exists
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.cafe_weekly_plans;
CREATE POLICY "Enable delete access for all users" ON public.cafe_weekly_plans
    FOR DELETE USING (true);
