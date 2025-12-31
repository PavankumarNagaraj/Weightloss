-- =====================================================
-- CREATE SUPER ADMIN FOR AFTERBURN.FIT
-- =====================================================
-- Email: superadmin@afterburn.fit
-- Password: superadmin
-- =====================================================

-- IMPORTANT: You cannot set passwords via SQL for security reasons.
-- You must create the auth user via Supabase Dashboard or Admin API.

-- Step 1: Create the auth user via Supabase Dashboard
-- Go to: Authentication → Users → Add User
-- Email: superadmin@afterburn.fit
-- Password: superadmin
-- Auto Confirm User: ✅ (check this box)

-- Step 2: After creating the auth user, run this SQL to create the database record
-- This will link the auth user to the users table with super_admin role

INSERT INTO users (
  id,
  email, 
  name, 
  role, 
  tenant_id,
  created_at
)
SELECT 
  id,
  email,
  'Super Admin',
  'super_admin',
  NULL,
  NOW()
FROM auth.users
WHERE email = 'superadmin@afterburn.fit'
ON CONFLICT (email) 
DO UPDATE SET 
  role = 'super_admin',
  tenant_id = NULL,
  name = 'Super Admin';

-- Verify the super admin was created
SELECT 
  u.id,
  u.email,
  u.name,
  u.role,
  u.tenant_id,
  au.email_confirmed_at
FROM users u
JOIN auth.users au ON u.id = au.id
WHERE u.email = 'superadmin@afterburn.fit';

-- =====================================================
-- ALTERNATIVE: Use Supabase Admin API (if you have access)
-- =====================================================
-- 
-- const { data, error } = await supabase.auth.admin.createUser({
--   email: 'superadmin@afterburn.fit',
--   password: 'superadmin',
--   email_confirm: true,
--   user_metadata: {
--     name: 'Super Admin'
--   }
-- })
-- 
-- Then run the INSERT SQL above to create the users table record
-- =====================================================
