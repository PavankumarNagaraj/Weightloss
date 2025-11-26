# Quick Start Guide

Get your Weight Loss Management System up and running in 2 minutes!

## ✅ What's Already Done

- ✅ React application with Vite
- ✅ Tailwind CSS configured
- ✅ All components created
- ✅ Routing set up
- ✅ Dependencies installed
- ✅ LocalStorage-based data storage (no backend needed!)
- ✅ Toast notifications
- ✅ Active batch filtering
- ✅ Fresh data state

## 🚀 Quick Start

### 1. Start Fresh (Recommended)

1. Open `clear-data.html` in your browser
2. Click "Clear All Data" button
3. See success message
4. Close the page

### 2. Start Development Server

```bash
npm run dev
```

Server will start at: `http://localhost:5173`

### 3. Login as Admin

1. Go to `http://localhost:5173/login`
2. Use default credentials:
   - **Email**: `admin@weightloss.com`
   - **Password**: `admin123`
3. Click "Login"
4. You're in! 🎉

### 4. Set Up Your System

#### Step 1: Add Trainers
1. Click **Trainers** tab in sidebar
2. Click "Add Trainer" button
3. Fill in details:
   - Name: John Trainer
   - Email: john@example.com
   - Phone: +1234567890
   - Password: trainer123
   - Specialization: Weight Loss
4. Click "Add Trainer"
5. See success toast notification! ✅

#### Step 2: Create a Batch
1. Click **Batches** tab in sidebar
2. Click "Add Batch" button
3. Fill in details:
   - Name: January Batch
   - Description: Weight Loss Program Q1 2025
   - Start Date: 2025-01-01
   - End Date: 2025-03-31
   - Status: active
4. Click "Add Batch"
5. See success toast! ✅

#### Step 3: Set Active Batch
1. Click **Settings** tab in sidebar
2. Select "January Batch" from dropdown
3. Click "Save Settings"
4. Page reloads automatically
5. Active batch is now set! ✅

#### Step 4: Add Users
1. Click **Users** tab in sidebar
2. Click "Add User" button
3. Fill in details:
   - Name: Test User
   - Phone: +1234567890
   - Age: 30
   - Gender: Male
   - Height: 175 cm
   - Current Weight: 80 kg
   - Goal Weight: 70 kg
   - Program: 60-day
   - Meal Plan: Veg
   - **Batch**: January Batch
   - **Trainer**: John Trainer
4. Click "Add User"
5. See success toast! ✅
6. Note the user ID: `january_batch_user_001`

### 5. Explore Features

#### Overview Dashboard
- See total users, on-track count, at-risk, struggling
- View average progress
- See all users with their stats
- Filter by trainer

#### Reports
- Weekly analytics
- Weight loss trends
- Top performers
- Users needing attention
- Attendance charts
- Meal plan distribution
- Advanced analytics

#### Attendance
- Mark attendance for all users
- Calendar view
- Individual user tracking
- Bulk operations

#### Batch Details
- Click eye icon (👁️) on any batch
- See batch progress
- View all members
- Check workout plans
- Click members for details

#### Trainer Details
- Click eye icon (👁️) on any trainer
- See assigned members
- View performance stats
- Track team progress

## 🎨 Key Features

### Toast Notifications
- ✅ Success (green) - Actions completed
- ❌ Error (red) - Failed operations
- ⚠️ Warning (yellow) - Validation issues
- ℹ️ Info (blue) - General information
- Auto-dismiss after 3 seconds
- Manual close button

### Active Batch System
- Only active batch data is displayed
- Set in Settings tab
- All views automatically filter
- Clean data isolation

### Batch-Based User IDs
- Format: `batch_name_user_001`
- Auto-incremented
- Easy to identify
- Unique per batch

### Trainer Login
- Trainers can login with their credentials
- See only their assigned members
- Limited access (no admin features)
- Track team performance

## 🐛 Troubleshooting

### Can't see any users
- Check if active batch is set (Settings tab)
- Verify users are assigned to active batch
- Check trainer filter is set to "all"

### User ID not in correct format
- Ensure batch is selected when adding user
- Batch must exist before adding users
- Format: `batch_name_user_001`

### Toast notifications not showing
- Check browser console for errors
- Verify React hooks are working
- Clear browser cache

### Trainer member count is 0
- Verify users are assigned to that trainer
- Check active batch filter
- Ensure users have batchId set

## 📚 Documentation

- **IMPROVEMENTS.md** - Recent improvements and changes
- **README.md** - Complete project documentation
- **This file** - Quick start guide

## 💡 Tips

1. **Start Fresh**: Use `clear-data.html` to reset anytime
2. **Active Batch**: Always set active batch first
3. **User IDs**: Batch-based IDs help organization
4. **Toast Notifications**: Professional UX, no popups
5. **Trainer Access**: Trainers see only their members

## 🎯 Workflow

```
1. Clear Data (optional)
   ↓
2. Login as Admin
   ↓
3. Add Trainers
   ↓
4. Create Batches
   ↓
5. Set Active Batch
   ↓
6. Add Users
   ↓
7. Track Progress
```

## 📞 Need Help?

Check the detailed guides:
- Recent changes → See `IMPROVEMENTS.md`
- General questions → See `README.md`
- Browser console → Check for error messages

---

**Current Status**: 
- ✅ Fresh data state
- ✅ Toast notifications working
- ✅ Active batch filtering enabled
- ✅ Batch-based user IDs implemented
- ✅ Ready to use!

**Next Action**: Start the dev server and login!
