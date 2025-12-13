-- Create cafe_settings table
CREATE TABLE IF NOT EXISTS public.cafe_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    cron_time TEXT NOT NULL DEFAULT '23:55',
    recipient_email TEXT,
    recipient_name TEXT,
    auto_send_enabled BOOLEAN NOT NULL DEFAULT true,
    last_email_sent DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT cafe_settings_single_row CHECK (id = 1)
);

-- Add RLS policies for cafe_settings
ALTER TABLE public.cafe_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.cafe_settings
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON public.cafe_settings
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON public.cafe_settings
    FOR UPDATE USING (true);

-- Create cafe_weekly_plans table
CREATE TABLE IF NOT EXISTS public.cafe_weekly_plans (
    id BIGSERIAL PRIMARY KEY,
    week_start_date DATE NOT NULL UNIQUE,
    plan_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on week_start_date for faster lookups
CREATE INDEX IF NOT EXISTS idx_cafe_weekly_plans_week_start_date 
    ON public.cafe_weekly_plans(week_start_date);

-- Add RLS policies for cafe_weekly_plans
ALTER TABLE public.cafe_weekly_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.cafe_weekly_plans
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON public.cafe_weekly_plans
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON public.cafe_weekly_plans
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON public.cafe_weekly_plans
    FOR DELETE USING (true);

-- Insert default settings row
INSERT INTO public.cafe_settings (id, cron_time, recipient_email, recipient_name, auto_send_enabled)
VALUES (1, '23:55', '', '', true)
ON CONFLICT (id) DO NOTHING;

-- Add comments for documentation
COMMENT ON TABLE public.cafe_settings IS 'Stores cafe application settings including email cron job configuration';
COMMENT ON TABLE public.cafe_weekly_plans IS 'Stores weekly meal plans for cafe subscription orders';
COMMENT ON COLUMN public.cafe_settings.cron_time IS 'Time in HH:MM format (IST) when daily email should be sent';
COMMENT ON COLUMN public.cafe_settings.last_email_sent IS 'Date when the last automated email was sent';
COMMENT ON COLUMN public.cafe_weekly_plans.week_start_date IS 'Monday date for the start of the week';
COMMENT ON COLUMN public.cafe_weekly_plans.plan_data IS 'JSON object containing meal plans for each day and meal type';
