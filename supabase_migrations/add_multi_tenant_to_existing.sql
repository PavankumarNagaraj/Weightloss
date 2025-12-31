-- =====================================================
-- ADD MULTI-TENANT TO EXISTING DATABASE
-- =====================================================
-- Use this if your database already has tables created
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
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  subscription_plan TEXT DEFAULT 'basic' CHECK (subscription_plan IN ('basic', 'pro', 'enterprise')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'suspended', 'trial')),
  trial_ends_at TIMESTAMP,
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_is_active ON tenants(is_active);

-- =====================================================
-- 2. CREATE USERS TABLE IF NOT EXISTS
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  start_weight DECIMAL(5,2),
  current_weight DECIMAL(5,2),
  goal_weight DECIMAL(5,2),
  height DECIMAL(5,2),
  age INTEGER,
  gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
  meal_plan TEXT,
  workout_type TEXT,
  batch_id UUID,
  trainer_id UUID,
  subscription_status TEXT DEFAULT 'inactive',
  subscription_start_date DATE,
  subscription_end_date DATE,
  subscription_amount DECIMAL(10,2),
  google_fit_connected BOOLEAN DEFAULT false,
  google_fit_refresh_token TEXT,
  google_fit_last_sync TIMESTAMP,
  start_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 3. ADD TENANT_ID TO USERS TABLE
-- =====================================================
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'tenant_id') THEN
    ALTER TABLE users ADD COLUMN tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
  END IF;
END $$;

-- =====================================================
-- 4. UPDATE ROLE CONSTRAINT
-- =====================================================
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('super_admin', 'admin', 'trainer', 'user'));

-- =====================================================
-- 5. CREATE INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- =====================================================
-- 6. CREATE DEFAULT TENANT
-- =====================================================
INSERT INTO tenants (name, slug, subscription_plan, subscription_status)
VALUES ('Afterburn Fitness', 'afterburn-fitness', 'pro', 'active')
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- 7. ASSIGN EXISTING USERS TO DEFAULT TENANT
-- =====================================================
UPDATE users 
SET tenant_id = (SELECT id FROM tenants WHERE slug = 'afterburn-fitness' LIMIT 1)
WHERE tenant_id IS NULL AND role != 'super_admin';

-- =====================================================
-- 8. ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "super_admin_all_tenants" ON tenants;
DROP POLICY IF EXISTS "users_own_tenant" ON tenants;
DROP POLICY IF EXISTS "super_admin_all_users" ON users;
DROP POLICY IF EXISTS "tenant_users_select" ON users;
DROP POLICY IF EXISTS "admin_insert_users" ON users;
DROP POLICY IF EXISTS "admin_update_users" ON users;
DROP POLICY IF EXISTS "admin_delete_users" ON users;

-- Tenant policies
CREATE POLICY "super_admin_all_tenants" ON tenants
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

CREATE POLICY "users_own_tenant" ON tenants
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.tenant_id = tenants.id
    )
  );

-- User policies
CREATE POLICY "super_admin_all_users" ON users
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'super_admin'
    )
  );

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
-- DONE!
-- =====================================================
-- Now you can create the super admin user
