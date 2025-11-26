# Features Explained

Complete explanation of all features in the Weight Loss Tracker application.

---

## 1. Progress Funnel Logic

### How the Funnel is Decided

The funnel visualization shows users distributed across **5 stages** based on their program progress:

#### **Stage Calculation:**
```javascript
Days Passed = Current Date - Start Date
Program Duration = 60 or 90 days
Progress Percentage = (Days Passed / Program Duration) × 100
```

#### **5 Stages:**

1. **Onboarding (0-10% progress)**
   - Days: 1-6 for 60-day, 1-9 for 90-day
   - New users just starting
   - Color: Light blue background

2. **Early Active (11-35% progress)**
   - Days: 7-21 for 60-day, 10-31 for 90-day
   - Building momentum
   - Color: Blue background

3. **Mid Progress (36-70% progress)**
   - Days: 22-42 for 60-day, 32-63 for 90-day
   - Halfway through program
   - Color: Purple background

4. **Acceleration (71-90% progress)**
   - Days: 43-54 for 60-day, 64-81 for 90-day
   - Final push
   - Color: Orange background

5. **Final Phase (91-100% progress)**
   - Days: 55-60 for 60-day, 82-90 for 90-day
   - Almost complete
   - Color: Green background

#### **User Status Colors (within each stage):**
- 🟢 **Green bubble** = On Track (good progress)
- 🟡 **Yellow bubble** = At Risk (needs attention)
- 🔴 **Red bubble** = Struggling (urgent)

---

## 2. Food Intake Logging

### Where Users Can Log Food

**User Dashboard** (`/user/:userId`)

#### **Daily Food Logging Section:**
- **Weight Input**: Current weight in kg
- **Breakfast**: Text field for breakfast meal
- **Lunch**: Text field for lunch meal
- **Dinner**: Text field for dinner meal
- **Food Items with Calories**: Detailed food intake tracking

#### **Food Intake Structure:**
```javascript
foodIntake: [
  { item: 'Oats with milk', calories: 250, time: '08:00 AM' },
  { item: 'Banana', calories: 105, time: '10:30 AM' },
  { item: 'Rice and dal', calories: 350, time: '01:00 PM' },
  { item: 'Apple', calories: 95, time: '04:00 PM' },
  { item: 'Roti and vegetables', calories: 300, time: '08:00 PM' }
]
```

#### **Total Calories:**
Automatically calculated from all food items logged for the day.

---

## 3. Overview - All Users List

### What's Shown

The **Overview** tab now displays **ALL users** in a comprehensive table:

#### **Columns:**
1. **Name** - User's full name + BMI
2. **Trainer** - Assigned trainer (A, B, C, or D)
3. **Program** - 60-day or 90-day
4. **Goal Weight** - Target weight in kg
5. **Skipped Classes** - Number of days missed (red if > 5)
6. **Status** - Progress status badge
7. **Actions** - View Details button

#### **Features:**
- ✅ Shows all users (not just 5)
- ✅ Sortable by creation date
- ✅ Color-coded skipped classes (red warning if > 5)
- ✅ Click to view full details
- ✅ Total count in header

---

## 4. Users Page - Row View

### Changed from Tiles to Rows

**Users List** (`/dashboard/users`) now displays users in a **table format**:

#### **Table Columns:**
1. **Name** - With BMI and height
2. **Trainer** - Assigned trainer
3. **Program** - Duration
4. **Progress** - Day X/Y with progress bar
5. **Goal Weight** - Target
6. **Skipped Classes** - Days missed
7. **Status** - Badge
8. **Actions** - View, Copy Link, Delete

#### **Benefits:**
- ✅ More compact view
- ✅ Easier to scan
- ✅ Better for large datasets
- ✅ Sortable columns
- ✅ Quick comparison

---

## 5. Food History with Calories

### User Details Modal

When clicking on a user, the detail modal shows:

#### **Food History Tab:**
- **Date-wise food logs**
- **All meals for each day**
- **Detailed food items with calories**
- **Total calories per day**
- **Time of consumption**

#### **Display Format:**
```
Date: Nov 4, 2024
─────────────────────────────────
Breakfast: Oats with fruits
Food Items:
  • Oats with milk - 250 cal (08:00 AM)
  • Banana - 105 cal (10:30 AM)

Lunch: Rice and dal
Food Items:
  • Rice and dal - 350 cal (01:00 PM)
  • Apple - 95 cal (04:00 PM)

Dinner: Roti and vegetables
Food Items:
  • Roti and vegetables - 300 cal (08:00 PM)

Total Calories: 1,100 cal
─────────────────────────────────
```

#### **Features:**
- ✅ Complete food history
- ✅ Calorie tracking per item
- ✅ Time stamps
- ✅ Daily totals
- ✅ Scrollable history

---

## 6. Attendance Tracking

### Skipped Classes Counter

#### **How It Works:**
Each log entry has an `attended` field:
```javascript
{
  date: "2024-11-04",
  weight: 75,
  attended: true/false,  // Did they attend class?
  ...
}
```

#### **Calculation:**
```javascript
skippedClasses = logs.filter(log => !log.attended).length
```

#### **Display Locations:**
1. **Overview Table** - Skipped Classes column
2. **Users Table** - Skipped Classes column
3. **User Detail Modal** - Attendance statistics
4. **Reports** - Attention alerts for high skips

#### **Color Coding:**
- **Normal** (0-5 skips): Black text
- **Warning** (>5 skips): Red text, bold

#### **Attendance Rates (Sample Data):**
- **On Track users**: 90% attendance (10% skip)
- **At Risk users**: 70% attendance (30% skip)
- **Struggling users**: 50% attendance (50% skip)

---

## 7. Trainer Assignment

### How Trainers Are Assigned

#### **Trainer Options:**
- Trainer A
- Trainer B
- Trainer C
- Trainer D

#### **Assignment Methods:**

**1. During User Creation:**
- Select trainer from dropdown in Add User modal
- Default: Trainer A

**2. Sample Data:**
- Users distributed evenly across trainers
- User 1, 5, 9, 13, 17 → Trainer A
- User 2, 6, 10, 14, 18 → Trainer B
- User 3, 7, 11, 15, 19 → Trainer C
- User 4, 8, 12, 16, 20 → Trainer D

#### **Trainer Load:**
Each trainer manages approximately 5 users (for 20 sample users).

#### **Display:**
- **Overview Table**: Trainer column
- **Users Table**: Trainer column
- **User Detail Modal**: Trainer information
- **Reports**: Can filter by trainer (future feature)

#### **Benefits:**
- ✅ Balanced workload
- ✅ Clear responsibility
- ✅ Easy tracking
- ✅ Scalable system

---

## Complete Data Structure

### User Object:
```javascript
{
  id: "user_1234567890_abc123",
  name: "Rajesh Kumar",
  gender: "Male",
  age: 35,
  height: 175,                    // cm
  bmi: 24.5,                      // calculated
  goalWeight: 70,                 // kg
  programType: "60-day",
  mealPlan: "Veg",
  trainer: "Trainer A",           // NEW
  progressStatus: "onTrack",
  startDate: "2024-10-01T00:00:00.000Z",
  createdAt: "2024-10-01T00:00:00.000Z",
  skippedClasses: 3,              // NEW
  
  logs: [
    {
      date: "2024-11-04T00:00:00.000Z",
      weight: 75,
      bmi: 24.5,
      attended: true,             // NEW
      meals: {
        breakfast: "Oats with fruits",
        lunch: "Rice and dal",
        dinner: "Roti and vegetables"
      },
      foodIntake: [                // NEW
        { item: "Oats with milk", calories: 250, time: "08:00 AM" },
        { item: "Banana", calories: 105, time: "10:30 AM" },
        { item: "Rice and dal", calories: 350, time: "01:00 PM" },
        { item: "Apple", calories: 95, time: "04:00 PM" },
        { item: "Roti and vegetables", calories: 300, time: "08:00 PM" }
      ],
      totalCalories: 1100          // NEW
    }
  ],
  
  notes: [
    {
      text: "Great progress!",
      date: "2024-11-01T00:00:00.000Z"
    }
  ]
}
```

---

## Summary of Changes

### ✅ Implemented:
1. **Funnel Logic** - 5 stages based on progress percentage
2. **Food Logging** - User dashboard with detailed intake
3. **Overview** - All users table with trainer & skipped classes
4. **Users Page** - Row/table view instead of tiles
5. **Food History** - Complete history with calories in detail modal
6. **Attendance** - Skipped classes tracking and display
7. **Trainers** - Assignment system with 4 trainers

### 📊 New Fields:
- `trainer` - Assigned trainer name
- `attended` - Daily attendance boolean
- `skippedClasses` - Total missed classes
- `foodIntake` - Array of food items with calories
- `totalCalories` - Daily calorie sum

### 🎨 UI Updates:
- Overview shows all users in table
- Users page is now table format
- Added trainer column everywhere
- Added skipped classes column
- Color-coded warnings for high skips
- Food history with calorie details

---

## Testing the Features

### 1. Load Sample Data
```
Login → Click "Load Sample Data" → 20 users added
```

### 2. Check Funnel
```
Dashboard → Funnel tab → See users in 5 stages
```

### 3. View All Users
```
Dashboard → Overview → See all 20 users in table
```

### 4. Check Trainers
```
Overview → See Trainer column → Each user assigned
```

### 5. Check Attendance
```
Overview → See Skipped Classes column → Red if > 5
```

### 6. View Food History
```
Users → Click user → See food items with calories
```

### 7. Add New User with Trainer
```
Add User → Select Trainer → Fill form → Submit
```

---

**All features are now fully implemented and working!** 🎉
