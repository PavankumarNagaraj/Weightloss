-- =====================================================
-- CREATE SUPER ADMIN USER (PRE-CONFIRMED)
-- =====================================================
-- This creates a super admin user that's already confirmed
-- Run this AFTER the create_multi_tenant_schema.sql migration
-- =====================================================

-- Step 1: Create auth user (you'll need to set password via dashboard)
-- This is just a placeholder - Supabase requires password via API/Dashboard

-- Step 2: Insert into users table with super_admin role
INSERT INTO users (
  id,
  email, 
  name, 
  role, 
  tenant_id,
  created_at
) VALUES (
  gen_random_uuid(),
  'superadmin@weightloss.com',
  'Super Admin',
  'super_admin',
  NULL,
  NOW()
)
ON CONFLICT (email) 
DO UPDATE SET 
  role = 'super_admin',
  tenant_id = NULL;

-- =====================================================
-- IMPORTANT: After running this SQL
-- =====================================================
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Click "Invite User" or "Add User"
-- 3. Email: superadmin@weightloss.com
-- 4. Set a password
-- 5. Check "Auto Confirm User" ✅
-- 6. Click "Send Invite" or "Create User"
-- 
-- OR use the Supabase API to create with password:
-- 
-- const { data, error } = await supabase.auth.admin.createUser({
--   email: 'superadmin@weightloss.com',
--   password: 'your-secure-password',
--   email_confirm: true,
--   user_metadata: {
--     name: 'Super Admin'
--   }
-- })
-- =====================================================

-- Verify the user was created
SELECT id, email, name, role, tenant_id 
FROM users 
WHERE email = 'superadmin@weightloss.com';
