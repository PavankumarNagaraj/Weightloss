# Admin User Guide - Creating Trainers & Users

## Overview
Admins have full access to create and manage both trainers and users within their tenant. All created users are automatically linked to the admin's tenant.

---

## 🎯 Admin Capabilities

### What Admins Can Do:
✅ Create trainers for their tenant
✅ Create users (program members)
✅ Manage batches
✅ View analytics and reports
✅ Access billing information
✅ Configure settings

### What Admins Cannot Do:
❌ View other tenants' data
❌ Create/manage other tenants
❌ Access super admin dashboard

---

## 👨‍🏫 Creating Trainers

### Step-by-Step:

1. **Navigate to Trainers**
   - Login as admin at `https://afterburn.fit/weightloss/auth`
   - Click "Trainers" in the sidebar

2. **Add New Trainer**
   - Click "Add Trainer" button (top right)
   - Fill in trainer details:
     - Name *
     - Email * (for login)
     - Phone
     - Specialization
   - Click "Add Trainer"

3. **Trainer Credentials**
   - System creates Supabase auth account
   - Generates temporary password: `name3chars + phone4digits + !`
   - Example: John with phone 9876543210 → `joh3210!`
   - **Important:** Share credentials with trainer securely

4. **Trainer Login**
   - Trainer logs in at `https://afterburn.fit/weightloss/auth`
   - Email: (provided email)
   - Password: (temporary password)
   - Redirected to trainer dashboard
   - Can only see users assigned to them

---

## 👥 Creating Users (Program Members)

### Step-by-Step:

1. **Navigate to Users**
   - Click "Users" in the sidebar
   - Click "Add User" button

2. **Fill User Details**
   - **Personal Info:**
     - Name *
     - Email * (for login)
     - Phone
     - Gender
     - Age
     - Height
     - Weight (start, current, goal)
   
   - **Program Details:**
     - Program Type (60-day, 90-day, unlimited)
     - Meal Plan (veg/non-veg)
     - Assigned Trainer
     - Batch
   
   - **Optional:**
     - Enroll in Cafe Subscription

3. **User Account Creation**
   - System automatically creates Supabase auth account
   - Generates temporary password
   - Creates user record linked to your tenant
   - **Success toast shows credentials** (displayed for 10 seconds)
   - Copy credentials immediately!

4. **Share Credentials**
   - Send to user via WhatsApp/Email/SMS
   - Login URL: `https://afterburn.fit/weightloss/user-login-new`
   - Email: (user's email)
   - Password: (temporary password)

5. **User Login**
   - User logs in at new login page
   - Redirected to their personal dashboard
   - Can view meal plans, progress, Google Fit data

---

## 🔐 Authentication Details

### Password Generation:
- **Format:** `first3letters + last4phone + !`
- **Examples:**
  - John Doe, phone 9876543210 → `joh3210!`
  - Sarah Smith, phone 5551234567 → `sar4567!`

### Email Requirements:
- Must be unique across entire system
- Valid email format required
- Used for login and password reset

### Tenant Isolation:
- All created trainers linked to your tenant
- All created users linked to your tenant
- Cannot see/manage other tenants' data
- RLS policies enforce isolation (when enabled)

---

## 📊 Data Flow

```
Admin Creates Trainer/User
         ↓
Supabase Auth Account Created
         ↓
User Record in Database
         ↓
Linked to Admin's Tenant (tenant_id)
         ↓
Credentials Generated & Displayed
         ↓
Admin Shares with Trainer/User
         ↓
Trainer/User Logs In
         ↓
Access Appropriate Dashboard
```

---

## 🎨 UI Navigation

### Admin Dashboard Sidebar:
- **Priorities** - Today's important tasks
- **Pipeline** - User journey stages
- **Overview** - Dashboard summary
- **Users** - Create/manage users ← **Create users here**
- **Check-ins** - Schedule user check-ins
- **Analytics** - View reports
- **Food & Exercise Analytics** - Nutrition tracking
- **Billing** - Payment management
- **Trainers** - Create/manage trainers ← **Create trainers here**
- **Batches** - Manage user batches
- **Foods & Workouts** - Meal plans
- **Advanced Exercises** - Exercise library
- **Attendance** - Track attendance
- **Reports** - Generate reports
- **Settings** - Configure system

---

## ⚠️ Important Notes

### For Trainers:
- Trainers can only view users assigned to them
- Cannot create other trainers
- Cannot access billing or settings
- Can manage their assigned users' progress

### For Users:
- Users can only see their own data
- Can connect Google Fit from profile
- Can view meal plans and progress
- Cannot access admin/trainer features

### Security:
- All passwords are hashed by Supabase
- Email verification can be enabled
- Password reset available
- Session management handled by Supabase

---

## 🚀 Quick Start Checklist

### For New Admin:
- [ ] Login at /weightloss/auth
- [ ] Create first trainer
- [ ] Create first batch
- [ ] Create first user
- [ ] Assign user to trainer and batch
- [ ] Share credentials with trainer and user
- [ ] Verify trainer can login
- [ ] Verify user can login

### Best Practices:
✅ Always copy credentials immediately
✅ Share credentials securely (not via public channels)
✅ Encourage users to change password after first login
✅ Assign users to appropriate trainers
✅ Organize users into batches
✅ Regularly check analytics and reports

---

## 🆘 Troubleshooting

### "Email already exists"
- Email must be unique across system
- Try different email address
- Check if user already created

### "Failed to create user"
- Check internet connection
- Verify all required fields filled
- Check browser console for errors
- Contact super admin if persists

### "Cannot see created user"
- Refresh the page
- Check if user assigned to correct batch
- Verify tenant context

### Credentials not showing
- Toast displays for 10 seconds
- Check browser notifications
- Recreate user if missed

---

## 📞 Support

For issues or questions:
- Contact Super Admin
- Check browser console for errors
- Verify Supabase connection
- Review this guide

---

**Last Updated:** January 1, 2026
**Version:** 2.0 (Multi-tenant with Supabase Auth)
