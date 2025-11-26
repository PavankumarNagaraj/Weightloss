# 🏋️ Advanced Exercise Management System - Design Document

## 🎯 System Overview

A flexible exercise management system where:
- **Admin** creates exercise groups by difficulty level
- **Admin/Trainers** assign groups to customers weekly
- **Customers** see only assigned exercises (not the full library)
- **90-day planning** with ability to modify upcoming weeks

---

## 📊 Data Architecture

### **1. Exercise Library**
```javascript
{
  "id": "ex_001",
  "name": "Bodyweight Squats",
  "category": "Lower Body",
  "difficulty": "beginner", // beginner, intermediate, advanced
  "equipment": "none",
  "duration": "30s",
  "reps": "15",
  "sets": "3",
  "instructions": "Stand with feet shoulder-width apart...",
  "videoUrl": "https://...",
  "imageUrl": "https://...",
  "targetMuscles": ["Quadriceps", "Glutes", "Hamstrings"],
  "caloriesBurn": 5,
  "tags": ["warmup", "strength", "cardio"],
  "createdAt": "2025-11-23",
  "createdBy": "admin@weightloss.com"
}
```

### **2. Exercise Groups**
```javascript
{
  "id": "group_001",
  "name": "Beginner Full Body Week 1",
  "difficulty": "beginner",
  "weekNumber": 1,
  "totalDuration": 56, // minutes
  "structure": {
    "warmup": ["ex_001", "ex_002", "ex_003"],
    "circuit_block_1": ["ex_004", "ex_005", "ex_006"],
    "circuit_block_2": ["ex_007", "ex_008", "ex_009"],
    "stretch": ["ex_010", "ex_011"]
  },
  "breakDurations": {
    "break_1": 3,
    "break_2": 3
  },
  "description": "Low impact full body workout for beginners",
  "targetCalories": 300,
  "createdAt": "2025-11-23",
  "createdBy": "admin@weightloss.com",
  "isActive": true
}
```

### **3. Weekly Assignments**
```javascript
{
  "id": "assign_001",
  "batchId": "batch_001",
  "weekNumber": 1,
  "startDate": "2025-11-25",
  "endDate": "2025-12-01",
  "schedule": {
    "monday": "group_001",
    "tuesday": "group_002",
    "wednesday": "group_003",
    "thursday": "group_004",
    "friday": "group_005",
    "saturday": "group_006",
    "sunday": null // rest day
  },
  "assignedBy": "admin@weightloss.com",
  "assignedAt": "2025-11-23",
  "status": "active", // draft, active, completed
  "notes": "First week - focus on form"
}
```

### **4. User Exercise Access**
```javascript
{
  "userId": "user_001",
  "batchId": "batch_001",
  "currentWeek": 1,
  "assignedGroups": ["group_001", "group_002", ...],
  "completedExercises": [
    {
      "exerciseId": "ex_001",
      "completedAt": "2025-11-25T10:30:00Z",
      "duration": 30,
      "notes": "Felt good"
    }
  ],
  "preferences": {
    "hideCompleted": false,
    "showVideoByDefault": true
  }
}
```

---

## 🎨 User Interface Design

### **Admin View - Exercise Management Tab**

#### **Sub-tabs:**
1. **Exercise Library** - Manage all exercises
2. **Exercise Groups** - Create/edit groups
3. **Weekly Planner** - Assign groups to weeks
4. **Batch Assignments** - Assign to batches/users

---

### **1. Exercise Library Interface**

```
┌─────────────────────────────────────────────────────────┐
│ 📚 Exercise Library                    [+ Add Exercise] │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ 🔍 Search: [________]  Difficulty: [All ▼]  Category: [All ▼] │
│                                                          │
│ ┌──────────────────────────────────────────────────┐   │
│ │ 💪 Bodyweight Squats          [Beginner] [Edit]  │   │
│ │ Lower Body • 30s • No Equipment                   │   │
│ │ Target: Quadriceps, Glutes • 5 cal/min           │   │
│ └──────────────────────────────────────────────────┘   │
│                                                          │
│ ┌──────────────────────────────────────────────────┐   │
│ │ 🏃 High Knees                [Intermediate] [Edit]│   │
│ │ Cardio • 40s • No Equipment                       │   │
│ │ Target: Cardio, Legs • 8 cal/min                 │   │
│ └──────────────────────────────────────────────────┘   │
│                                                          │
│ Showing 45 exercises                                     │
└─────────────────────────────────────────────────────────┘
```

---

### **2. Exercise Groups Interface**

```
┌─────────────────────────────────────────────────────────┐
│ 🎯 Exercise Groups                  [+ Create Group]    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Filter: [Beginner ▼]  Week: [All ▼]  Status: [Active ▼]│
│                                                          │
│ ┌──────────────────────────────────────────────────┐   │
│ │ 📦 Beginner Full Body Week 1    [Edit] [Duplicate]│   │
│ │ Difficulty: Beginner • Week 1 • 56 min            │   │
│ │ ├─ Warmup: 4 exercises (5 min)                   │   │
│ │ ├─ Circuit 1: 10 exercises (20 min)              │   │
│ │ ├─ Circuit 2: 10 exercises (20 min)              │   │
│ │ └─ Stretch: 4 exercises (5 min)                  │   │
│ │ Target: 300 cal • Used in 3 batches              │   │
│ └──────────────────────────────────────────────────┘   │
│                                                          │
│ ┌──────────────────────────────────────────────────┐   │
│ │ 📦 Intermediate HIIT Week 5  [Edit] [Duplicate]  │   │
│ │ Difficulty: Intermediate • Week 5 • 56 min        │   │
│ │ ├─ Warmup: 5 exercises (5 min)                   │   │
│ │ ├─ Circuit 1: 12 exercises (20 min)              │   │
│ │ ├─ Circuit 2: 12 exercises (20 min)              │   │
│ │ └─ Stretch: 5 exercises (5 min)                  │   │
│ │ Target: 450 cal • Used in 1 batch                │   │
│ └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

### **3. Weekly Planner Interface**

```
┌─────────────────────────────────────────────────────────┐
│ 📅 Weekly Planner - 90 Day Schedule                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Batch: [Batch Nov 2025 ▼]  [← Week 1 of 13 →]         │
│ Date Range: Nov 25 - Dec 1, 2025                        │
│                                                          │
│ ┌─────────────────────────────────────────────────┐    │
│ │ Monday    │ Beginner Full Body Week 1  [Change] │    │
│ │ Tuesday   │ Beginner Cardio Week 1     [Change] │    │
│ │ Wednesday │ Beginner Core Week 1       [Change] │    │
│ │ Thursday  │ Beginner Lower Body Week 1 [Change] │    │
│ │ Friday    │ Beginner Upper Body Week 1 [Change] │    │
│ │ Saturday  │ Outdoor Walk/Run           [Change] │    │
│ │ Sunday    │ 🌙 Rest Day                         │    │
│ └─────────────────────────────────────────────────┘    │
│                                                          │
│ [Copy to Next Week] [Apply to All Future Weeks]        │
│ [Save Changes] [Reset]                                  │
└─────────────────────────────────────────────────────────┘
```

---

### **4. Batch Assignment Interface**

```
┌─────────────────────────────────────────────────────────┐
│ 🎯 Batch Assignments                                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ┌─────────────────────────────────────────────────┐    │
│ │ Batch: Nov 2025 (45 users)                      │    │
│ │ Start Date: Nov 25, 2025                         │    │
│ │ Current Week: 1 of 13                            │    │
│ │                                                   │    │
│ │ Week 1: ✅ Assigned (Beginner Program)           │    │
│ │ Week 2: ✅ Assigned (Beginner Program)           │    │
│ │ Week 3: ⏳ Pending (Not assigned yet)            │    │
│ │ Week 4: ⏳ Pending                                │    │
│ │ ...                                               │    │
│ │                                                   │    │
│ │ [Bulk Assign Weeks 3-13] [Auto-Progress]        │    │
│ └─────────────────────────────────────────────────┘    │
│                                                          │
│ Quick Actions:                                           │
│ [Assign Beginner Program (Weeks 1-4)]                   │
│ [Assign Intermediate Program (Weeks 5-8)]               │
│ [Assign Advanced Program (Weeks 9-13)]                  │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 Permission System

### **Admin:**
- ✅ View all exercises
- ✅ Create/edit/delete exercises
- ✅ Create/edit/delete groups
- ✅ Assign groups to weeks
- ✅ Assign groups to batches
- ✅ View all user progress

### **Trainer:**
- ✅ View all exercises
- ✅ View all groups
- ✅ Assign groups to their batches
- ✅ View their users' progress
- ❌ Create/edit/delete exercises
- ❌ Create/edit/delete groups

### **Customer:**
- ✅ View only assigned exercises for current week
- ✅ Mark exercises as completed
- ✅ View exercise instructions/videos
- ❌ View full exercise library
- ❌ View other weeks' exercises
- ❌ View exercise groups

---

## 🚀 Key Features

### **1. Smart Group Creation**
- Drag-and-drop exercise builder
- Auto-calculate total duration
- Auto-calculate calorie burn
- Template library (beginner, intermediate, advanced)
- Duplicate existing groups
- Preview mode

### **2. Bulk Operations**
- Assign same group to multiple weeks
- Copy week schedule to future weeks
- Apply template to entire 90-day period
- Bulk edit multiple groups

### **3. Progressive Difficulty**
- Auto-suggest next difficulty level
- Gradual progression tracking
- Difficulty transition alerts
- Performance-based recommendations

### **4. Analytics**
- Most used exercises
- Group effectiveness
- User completion rates
- Calorie burn tracking
- Progress trends

### **5. Scheduling Intelligence**
- Auto-fill 90 days with progression
- Rest day management
- Variety optimization (avoid repetition)
- Recovery period suggestions

---

## 📱 Customer Mobile View

```
┌─────────────────────────────────┐
│ 🏋️ Today's Workout              │
│ Monday, Nov 25, 2025            │
├─────────────────────────────────┤
│                                  │
│ 📊 Beginner Full Body Week 1    │
│ 56 minutes • 300 calories       │
│                                  │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│ Progress: 0/28 exercises         │
│                                  │
│ 🔥 Warmup (5 min)               │
│ ┌─────────────────────────┐    │
│ │ ☐ Neck Circles - 30s    │    │
│ │ ☐ Shoulder Rolls - 30s  │    │
│ │ ☐ March in Place - 2min │    │
│ └─────────────────────────┘    │
│                                  │
│ 💪 Circuit Block 1 (20 min)     │
│ ┌─────────────────────────┐    │
│ │ ☐ Squats - 30s          │    │
│ │ ☐ Side Steps - 30s      │    │
│ │   [Show Video] [Mark ✓] │    │
│ └─────────────────────────┘    │
│                                  │
│ [Start Workout] [View Schedule] │
└─────────────────────────────────┘
```

---

## 🎯 Workflow Examples

### **Scenario 1: Initial 90-Day Setup**

1. **Admin creates exercise library** (one-time)
   - Add 100+ exercises
   - Categorize by difficulty
   - Add instructions/videos

2. **Admin creates exercise groups** (one-time)
   - Week 1-4: Beginner groups
   - Week 5-8: Intermediate groups
   - Week 9-13: Advanced groups

3. **Admin assigns to batch**
   - Select batch "Nov 2025"
   - Use "Auto-Progress" template
   - System assigns beginner → intermediate → advanced
   - Review and adjust
   - Save

4. **Customers see only their week**
   - Week 1 users see only Week 1 exercises
   - Exercises unlock week by week

---

### **Scenario 2: Mid-Program Adjustment**

1. **Admin reviews Week 5 performance**
   - Users struggling with intensity
   - Need to reduce difficulty

2. **Admin modifies Week 6-13**
   - Select Week 6
   - Change from "Intermediate HIIT" to "Intermediate Moderate"
   - Click "Apply to All Future Weeks"
   - Save

3. **Users automatically get updated schedule**
   - Week 6 onwards shows new groups
   - Past weeks remain unchanged

---

### **Scenario 3: Trainer Custom Assignment**

1. **Trainer views their batch**
   - Batch "Nov 2025" - 45 users
   - Currently on Week 3

2. **Trainer notices 10 users need easier workouts**
   - Select those 10 users
   - Assign "Beginner Extended" group
   - Other 35 users continue normal progression

3. **System tracks individual assignments**
   - 10 users get easier exercises
   - 35 users get standard exercises
   - All in same batch

---

## 💾 Data Storage

### **LocalStorage Structure:**
```javascript
{
  "weightloss_exercises": [...], // Exercise library
  "weightloss_exercise_groups": [...], // Exercise groups
  "weightloss_weekly_assignments": [...], // Week assignments
  "weightloss_user_exercise_progress": [...] // User progress
}
```

---

## 🔄 Migration from Current System

### **Step 1: Import Current Workouts**
- Parse `workouts.json`
- Convert to exercise library
- Create groups from existing days
- Preserve all data

### **Step 2: Create Initial Assignments**
- Map Day 1-7 → Week 1
- Map Day 8-14 → Week 2
- Continue for 90 days

### **Step 3: Enable New System**
- Switch to new interface
- Old data still accessible
- Gradual transition

---

## 📊 Benefits

### **For Admin:**
- ✅ Create once, reuse forever
- ✅ Easy bulk modifications
- ✅ Template library
- ✅ Better organization
- ✅ Analytics insights

### **For Trainers:**
- ✅ Flexible assignment
- ✅ Custom per-user adjustments
- ✅ Progress tracking
- ✅ Performance insights

### **For Customers:**
- ✅ Clear weekly goals
- ✅ Progressive difficulty
- ✅ Video instructions
- ✅ Completion tracking
- ✅ Motivational progress bars

---

## 🎨 UI Components Needed

1. **ExerciseLibrary.jsx** - Browse/manage exercises
2. **ExerciseForm.jsx** - Add/edit exercise
3. **ExerciseGroupBuilder.jsx** - Create groups
4. **WeeklyPlanner.jsx** - Assign groups to weeks
5. **BatchAssignment.jsx** - Assign to batches
6. **CustomerWorkoutView.jsx** - Customer view
7. **ExerciseCard.jsx** - Display exercise
8. **ProgressTracker.jsx** - Track completion

---

## 🚀 Implementation Priority

### **Phase 1: Core System** (Week 1)
- [ ] Exercise library data structure
- [ ] Exercise CRUD operations
- [ ] Basic admin interface
- [ ] Exercise group creation

### **Phase 2: Assignment System** (Week 2)
- [ ] Weekly planner
- [ ] Batch assignment
- [ ] User access control
- [ ] Customer view

### **Phase 3: Advanced Features** (Week 3)
- [ ] Bulk operations
- [ ] Templates
- [ ] Analytics
- [ ] Progress tracking

### **Phase 4: Polish** (Week 4)
- [ ] Video integration
- [ ] Mobile optimization
- [ ] Performance optimization
- [ ] Testing

---

## ✅ Success Metrics

- Admin can set up 90 days in < 30 minutes
- Trainers can adjust weekly in < 5 minutes
- Customers see only relevant exercises
- 100% data accuracy
- Zero permission leaks

---

**Ready to implement?** Let me know and I'll start building! 🚀
