-- Advanced Cost Analysis System
-- Tables: cafe_recipes, cafe_recipe_ingredients, cafe_waste_log

-- ==================== RECIPES TABLE ====================
CREATE TABLE IF NOT EXISTS public.cafe_recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id UUID REFERENCES public.cafe_menu(id) ON DELETE CASCADE,
    recipe_name TEXT NOT NULL,
    portion_size DECIMAL(10,2),
    portion_unit TEXT DEFAULT 'serving',
    preparation_time INTEGER, -- in minutes
    cooking_time INTEGER, -- in minutes
    instructions TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==================== RECIPE INGREDIENTS TABLE ====================
CREATE TABLE IF NOT EXISTS public.cafe_recipe_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID REFERENCES public.cafe_recipes(id) ON DELETE CASCADE,
    inventory_item_id UUID REFERENCES public.cafe_inventory(id) ON DELETE CASCADE,
    ingredient_name TEXT NOT NULL,
    quantity DECIMAL(10,3) NOT NULL,
    unit TEXT NOT NULL,
    cost_per_unit DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==================== WASTE LOG TABLE ====================
CREATE TABLE IF NOT EXISTS public.cafe_waste_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_item_id UUID REFERENCES public.cafe_inventory(id) ON DELETE SET NULL,
    item_name TEXT NOT NULL,
    quantity DECIMAL(10,3) NOT NULL,
    unit TEXT NOT NULL,
    cost_per_unit DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    waste_reason TEXT NOT NULL, -- expired, damaged, spoiled, overproduction, etc.
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    recorded_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==================== INDEXES ====================
CREATE INDEX IF NOT EXISTS idx_cafe_recipes_menu_item ON public.cafe_recipes(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_cafe_recipe_ingredients_recipe ON public.cafe_recipe_ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_cafe_recipe_ingredients_inventory ON public.cafe_recipe_ingredients(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_cafe_waste_log_date ON public.cafe_waste_log(date);
CREATE INDEX IF NOT EXISTS idx_cafe_waste_log_inventory ON public.cafe_waste_log(inventory_item_id);

-- ==================== RLS POLICIES ====================
ALTER TABLE public.cafe_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cafe_recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cafe_waste_log ENABLE ROW LEVEL SECURITY;

-- Recipes policies
CREATE POLICY "Enable read access for all users" ON public.cafe_recipes FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.cafe_recipes FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.cafe_recipes FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.cafe_recipes FOR DELETE USING (true);

-- Recipe ingredients policies
CREATE POLICY "Enable read access for all users" ON public.cafe_recipe_ingredients FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.cafe_recipe_ingredients FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.cafe_recipe_ingredients FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.cafe_recipe_ingredients FOR DELETE USING (true);

-- Waste log policies
CREATE POLICY "Enable read access for all users" ON public.cafe_waste_log FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.cafe_waste_log FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.cafe_waste_log FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.cafe_waste_log FOR DELETE USING (true);

-- ==================== COMMENTS ====================
COMMENT ON TABLE public.cafe_recipes IS 'Stores recipes for menu items with preparation details';
COMMENT ON TABLE public.cafe_recipe_ingredients IS 'Stores ingredients and quantities for each recipe';
COMMENT ON TABLE public.cafe_waste_log IS 'Tracks daily waste for cost analysis and reduction';
COMMENT ON COLUMN public.cafe_recipes.preparation_time IS 'Preparation time in minutes';
COMMENT ON COLUMN public.cafe_recipes.cooking_time IS 'Cooking time in minutes';
COMMENT ON COLUMN public.cafe_waste_log.waste_reason IS 'Reason for waste: expired, damaged, spoiled, overproduction, etc.';
