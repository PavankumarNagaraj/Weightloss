# Multi-Tenant Architecture Setup Guide

## Overview
The weight loss application now supports multi-tenant architecture with role-based access control.

## Role Hierarchy

```
Super Admin (Platform Owner)
    ↓ Creates & Manages
Tenant (Gym/Business)
    ↓ Has
Admin (Tenant Owner)
    ↓ Manages
Trainers (Employees)
    ↓ Train
Users (Clients/Members)
```

## Database Setup

### 1. Run Migration
Execute the migration in Supabase SQL Editor:
```bash
supabase_migrations/create_multi_tenant_schema.sql
```

This creates:
- `tenants` table
- Updates `users` table with `tenant_id` and `super_admin` role
- Adds tenant isolation to related tables
- Sets up Row Level Security (RLS) policies
- Creates helper functions

### 2. Default Accounts Created
- **Super Admin**: `superadmin@weightloss.com`
- **Default Tenant**: "Default Gym" (for existing data)

## User Roles

### Super Admin
- **Access**: All tenants
- **Capabilities**:
  - Create/edit/delete tenants
  - View all tenant data
  - Switch between tenants
  - Platform-wide analytics
- **tenant_id**: NULL

### Admin
- **Access**: Own tenant only
- **Capabilities**:
  - Manage trainers
  - Manage users
  - View tenant analytics
  - Tenant settings
- **tenant_id**: Required

### Trainer
- **Access**: Own tenant only
- **Capabilities**:
  - View assigned users
  - Add/edit users
  - Track progress
  - Limited to own tenant
- **tenant_id**: Required

### User
- **Access**: Own profile only
- **Capabilities**:
  - View own progress
  - Log meals/weight
  - Connect Google Fit (optional)
- **tenant_id**: Required

## Authentication Flow

### Login Process
1. User enters email/password at `/weightloss/auth`
2. Supabase authenticates
3. System fetches user role and tenant from database
4. Routes based on role:
   - `super_admin` → `/weightloss/super-admin`
   - `admin` or `trainer` → `/weightloss/dashboard`
   - `user` → `/weightloss/user/:userId`

### Sign Up Process
1. User selects role during signup
2. Account created in Supabase Auth
3. User record created in `users` table
4. Email verification sent
5. After verification, user can login

## Tenant Isolation

### Data Filtering
All queries automatically filter by `tenant_id`:
- Users see only their tenant's data
- Super admins can view all tenants
- RLS policies enforce isolation at database level

### Creating New Tenant
1. Super admin logs in
2. Goes to Super Admin Dashboard
3. Clicks "Add Tenant"
4. Fills in:
   - Tenant name
   - Slug (URL-friendly)
   - Contact info
   - Subscription plan
5. Tenant created with unique ID

### Assigning Users to Tenant
When creating a new user:
- Admin/Trainer: User automatically assigned to their tenant
- Super Admin: Can assign to any tenant

## Google Fit Integration

### Previous Behavior
- Google Fit connection at login

### New Behavior
- Google Fit connection moved to user profile page
- Optional feature for users
- Accessed via "Connect Google Fit" button in user edit page

## API Endpoints

### Tenants
- `GET /tenants` - List all tenants (super admin only)
- `POST /tenants` - Create tenant (super admin only)
- `PUT /tenants/:id` - Update tenant (super admin only)
- `DELETE /tenants/:id` - Delete tenant (super admin only)

### Users
- `GET /users` - List users (filtered by tenant)
- `POST /users` - Create user (admin/trainer in own tenant)
- `PUT /users/:id` - Update user (admin/trainer in own tenant)
- `DELETE /users/:id` - Delete user (admin in own tenant)

## Testing

### Test Super Admin Access
1. Login as `superadmin@weightloss.com`
2. Verify access to Super Admin Dashboard
3. Create a test tenant
4. View all tenants

### Test Admin Access
1. Create admin user for a tenant
2. Login as admin
3. Verify can only see own tenant's data
4. Try to access super admin routes (should fail)

### Test Trainer Access
1. Create trainer user for a tenant
2. Login as trainer
3. Verify limited dashboard access
4. Verify can only see assigned users

### Test User Access
1. Create regular user
2. Login as user
3. Verify redirects to user dashboard
4. Verify can only see own data

## Migration from Old System

### Existing Users
- All existing users assigned to "Default Gym" tenant
- Roles preserved (admin, trainer, user)
- No data loss

### Backward Compatibility
- Old login routes redirect to new unified login
- localStorage authentication still supported
- Gradual migration path

## Security

### Row Level Security (RLS)
- Enabled on all tables
- Tenant isolation enforced at database level
- Super admin bypass for platform management

### Authentication
- Supabase Auth for secure authentication
- JWT tokens for session management
- Email verification required

### Authorization
- Role-based access control
- Tenant-based data isolation
- API endpoint protection

## Troubleshooting

### User Can't See Data
- Check `tenant_id` is set correctly
- Verify RLS policies are enabled
- Check user role permissions

### Super Admin Can't Create Tenant
- Verify user role is `super_admin`
- Check database permissions
- Review Supabase logs

### Login Redirects Wrong
- Clear browser cache
- Check user role in database
- Verify routing configuration

## Future Enhancements

### Planned Features
- Tenant-specific branding
- Custom domains per tenant
- Tenant analytics dashboard
- Billing integration
- Multi-language support
- White-label options

### Scalability
- Database partitioning by tenant
- Tenant-specific caching
- Load balancing
- CDN integration

## Support

For issues or questions:
1. Check this documentation
2. Review Supabase logs
3. Check browser console for errors
4. Contact system administrator
