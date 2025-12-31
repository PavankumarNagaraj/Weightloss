-- =====================================================
-- MULTI-TENANT SCHEMA MIGRATION
-- =====================================================
-- This migration adds multi-tenant support to the weight loss application
-- Run this in Supabase SQL Editor
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. CREATE TENANTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  domain TEXT UNIQUE,
  logo_url TEXT,
  
  -- Contact information
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  
  -- Subscription details
  subscription_plan TEXT DEFAULT 'basic' CHECK (subscription_plan IN ('basic', 'pro', 'enterprise')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'suspended', 'trial')),
  trial_ends_at TIMESTAMP,
  
  -- Settings
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for tenants
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_is_active ON tenants(is_active);

-- =====================================================
-- 2. UPDATE USERS TABLE
-- =====================================================

-- Add tenant_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'tenant_id') THEN
    ALTER TABLE users ADD COLUMN tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Update role constraint to include super_admin
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('super_admin', 'admin', 'trainer', 'user'));

-- Add index for tenant_id
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);

-- =====================================================
-- 3. CREATE DEFAULT SUPER ADMIN
-- =====================================================
-- Insert default super admin (no tenant_id - can manage all tenants)
INSERT INTO users (email, name, role, tenant_id) 
VALUES ('superadmin@weightloss.com', 'Super Admin', 'super_admin', NULL)
ON CONFLICT (email) DO UPDATE SET role = 'super_admin', tenant_id = NULL;

-- =====================================================
-- 4. CREATE DEFAULT TENANT (for existing data)
-- =====================================================
-- Create a default tenant for existing users
INSERT INTO tenants (name, slug, subscription_plan, subscription_status)
VALUES ('Default Gym', 'default-gym', 'pro', 'active')
ON CONFLICT (slug) DO NOTHING
RETURNING id;

-- Update existing users to belong to default tenant (if they don't have one)
UPDATE users 
SET tenant_id = (SELECT id FROM tenants WHERE slug = 'default-gym' LIMIT 1)
WHERE tenant_id IS NULL AND role != 'super_admin';

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on tenants table
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Super admins can see all tenants
CREATE POLICY "super_admin_all_tenants" ON tenants
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- Admins and trainers can see their own tenant
CREATE POLICY "users_own_tenant" ON tenants
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.tenant_id = tenants.id
    )
  );

-- Update users table RLS policies for tenant isolation
DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "users_insert_policy" ON users;
DROP POLICY IF EXISTS "users_update_policy" ON users;
DROP POLICY IF EXISTS "users_delete_policy" ON users;

-- Super admin can see all users
CREATE POLICY "super_admin_all_users" ON users
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'super_admin'
    )
  );

-- Users can see users in their tenant
CREATE POLICY "tenant_users_select" ON users
  FOR SELECT
  USING (
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.tenant_id = users.tenant_id
      AND u.role IN ('admin', 'trainer')
    )
  );

-- Admins can insert users in their tenant
CREATE POLICY "admin_insert_users" ON users
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.tenant_id = tenant_id
      AND u.role = 'admin'
    )
  );

-- Admins can update users in their tenant
CREATE POLICY "admin_update_users" ON users
  FOR UPDATE
  USING (
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.tenant_id = users.tenant_id
      AND u.role = 'admin'
    )
  );

-- Admins can delete users in their tenant
CREATE POLICY "admin_delete_users" ON users
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.tenant_id = users.tenant_id
      AND u.role = 'admin'
    )
  );

-- =====================================================
-- 6. UPDATE OTHER TABLES FOR TENANT ISOLATION
-- =====================================================

-- Add tenant_id to weight_logs
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'weight_logs' AND column_name = 'tenant_id') THEN
    ALTER TABLE weight_logs ADD COLUMN tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
    
    -- Populate tenant_id from user's tenant
    UPDATE weight_logs wl
    SET tenant_id = u.tenant_id
    FROM users u
    WHERE wl.user_id = u.id;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_weight_logs_tenant_id ON weight_logs(tenant_id);

-- Add tenant_id to photos
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'photos' AND column_name = 'tenant_id') THEN
    ALTER TABLE photos ADD COLUMN tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
    
    -- Populate tenant_id from user's tenant
    UPDATE photos p
    SET tenant_id = u.tenant_id
    FROM users u
    WHERE p.user_id = u.id;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_photos_tenant_id ON photos(tenant_id);

-- Add tenant_id to attendance
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'attendance' AND column_name = 'tenant_id') THEN
    ALTER TABLE attendance ADD COLUMN tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
    
    -- Populate tenant_id from user's tenant
    UPDATE attendance a
    SET tenant_id = u.tenant_id
    FROM users u
    WHERE a.user_id = u.id;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_attendance_tenant_id ON attendance(tenant_id);

-- =====================================================
-- 7. CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to get current user's tenant_id
CREATE OR REPLACE FUNCTION get_current_user_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- Function to check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'super_admin'
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- =====================================================
-- 8. CREATE UPDATED VIEWS
-- =====================================================

-- Drop and recreate user_progress view with tenant support
DROP VIEW IF EXISTS user_progress;

CREATE VIEW user_progress AS
SELECT 
  u.id,
  u.email,
  u.name,
  u.role,
  u.tenant_id,
  u.start_weight,
  u.current_weight,
  u.goal_weight,
  u.height,
  u.age,
  u.gender,
  u.meal_plan,
  u.trainer_id,
  u.batch_id,
  u.subscription_status,
  u.created_at,
  COUNT(DISTINCT wl.id) as total_weight_logs,
  COUNT(DISTINCT a.id) as total_attendance,
  (u.start_weight - u.current_weight) as weight_lost,
  CASE 
    WHEN u.start_weight IS NOT NULL AND u.current_weight IS NOT NULL AND u.goal_weight IS NOT NULL
    THEN ROUND(((u.start_weight - u.current_weight) / (u.start_weight - u.goal_weight) * 100)::numeric, 2)
    ELSE 0
  END as progress_percentage
FROM users u
LEFT JOIN weight_logs wl ON u.id = wl.user_id
LEFT JOIN attendance a ON u.id = a.user_id AND a.attended = true
WHERE u.role = 'user'
GROUP BY u.id;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Summary of changes:
-- 1. Created tenants table
-- 2. Added tenant_id to users table
-- 3. Added super_admin role
-- 4. Created default super admin user
-- 5. Created default tenant for existing data
-- 6. Updated RLS policies for tenant isolation
-- 7. Added tenant_id to related tables (weight_logs, photos, attendance)
-- 8. Created helper functions
-- 9. Updated views

COMMENT ON TABLE tenants IS 'Multi-tenant organizations (gyms, fitness centers)';
COMMENT ON COLUMN users.tenant_id IS 'Links user to their tenant organization. NULL for super_admin.';
