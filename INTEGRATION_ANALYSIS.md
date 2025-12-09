# AFTERBURN Integration Analysis
## Combining Meal Service + Nutrient Calculator + Weight Loss Tracking

**Date**: December 6, 2025  
**Status**: Ready for Implementation

---

## Current State Analysis

### 1. **Meal Service (HomePage.jsx)**
**What exists:**
- Interactive meal plan configurator
- 3 subscription plans: Non-Veg, Veg+Eggs, Pure Veg
- Dynamic pricing based on:
  - Meals per day (1, 2, or 3)
  - Protein per meal (30g, 40g, 50g, 60g)
- Monthly subscription pricing (25 meals/month, Sundays off)
- Marketing content, testimonials, features

**What's missing:**
- No actual subscription creation
- No user account creation from homepage
- No payment integration
- No meal delivery tracking
- No connection to backend data

**Current pricing logic:**
```javascript
Base prices per meal:
- Non-Veg: ₹150-220 (depending on protein)
- Veg+Eggs: ₹130-200
- Pure Veg: ₹110-180

Monthly = pricePerMeal × mealsPerDay × 25 days
```

---

### 2. **Nutrient Calculator (NutrientCalculator.jsx)**
**What exists:**
- Multi-step form collecting:
  - Personal: name, age, gender, height, weight
  - Goals: target weight, muscle mass, fat %, water content
  - Lifestyle: activity level, sleep, stress, meals/day
  - Diet: type (veg/non-veg/vegan), health conditions
- Calculates recommended nutrients
- Suggests meal packages

**What's missing:**
- No data persistence (calculations lost on refresh)
- No connection to user creation
- No automatic meal plan assignment
- Results not saved to database
- No "Start Subscription" from calculator results

---

### 3. **Weight Loss Tracking (TrainerDashboard + UserDashboard)**
**What exists:**
- **Trainer Dashboard:**
  - User management (CRUD)
  - Progress tracking via logs
  - Multiple views: Overview, Funnel, Users, Reports, Attendance
  - Batch & Trainer management
  - Foods & Workouts library
  - Advanced Exercises
  - Settings
  
- **User Dashboard:**
  - Public access via `/user/:userId`
  - Daily logging: weight, meals (breakfast/lunch/dinner)
  - Food intake tracking with calories
  - Attendance calendar
  - Progress charts (Chart.js)
  - Meal plan display

**Data Model (localStorage):**
```javascript
User {
  id, name, gender, age, phone,
  goalWeight, programType, mealPlan,
  progressStatus, startDate, createdAt,
  trainer, batchId,
  logs: [{
    date, weight, 
    meals: { breakfast, lunch, dinner },
    attended, sizeReduced, foodIntake: []
  }],
  notes: [{ text, date }]
}
```

**What's missing:**
- No subscription/billing tracking
- No meal delivery schedule
- No automatic meal plan generation from calculator
- No connection to homepage meal service
- No recurring billing logic

---

## Integration Gaps

| Component | Current State | Missing Link |
|-----------|--------------|--------------|
| **HomePage → User Creation** | Shows plans, pricing | No "Subscribe Now" flow |
| **Calculator → User Profile** | Calculates nutrients | Results not saved |
| **Calculator → Meal Plan** | Suggests meals | No auto-assignment |
| **Meal Service → Delivery** | Shows menu | No delivery tracking |
| **User → Subscription** | Tracks weight loss | No subscription status |
| **Billing** | None | No recurring payment tracking |

---

## Proposed Unified Data Model

### Extended User Schema
```javascript
User {
  // Existing fields
  id, name, gender, age, phone, email,
  goalWeight, programType, mealPlan,
  progressStatus, startDate, createdAt,
  trainer, batchId,
  
  // NEW: Subscription fields
  subscription: {
    id: string,                    // unique subscription ID
    status: 'active' | 'paused' | 'canceled' | 'expired',
    planType: 'non-veg' | 'veg-eggs' | 'pure-veg',
    mealsPerDay: 1 | 2 | 3,
    proteinPerMeal: 30 | 40 | 50 | 60,
    startDate: ISO string,
    endDate: ISO string,           // for fixed-term subscriptions
    renewalDate: ISO string,       // for monthly auto-renewal
    billingCycle: 'monthly' | '60-day' | '90-day',
    pricePerMeal: number,
    monthlyAmount: number,
    paymentStatus: 'paid' | 'pending' | 'failed',
    lastPaymentDate: ISO string,
    nextBillingDate: ISO string,
  },
  
  // NEW: Nutrient profile (from calculator)
  nutrientProfile: {
    calculatedDate: ISO string,
    height: number,
    currentWeight: number,
    targetWeight: number,
    muscleMass: number,
    fatPercentage: number,
    waterContent: number,
    activityLevel: string,
    sleepHours: number,
    stressLevel: string,
    healthConditions: [],
    recommendedCalories: number,
    recommendedProtein: number,
    recommendedCarbs: number,
    recommendedFats: number,
  },
  
  // NEW: Meal delivery tracking
  mealDeliveries: [{
    date: ISO string,
    status: 'scheduled' | 'delivered' | 'skipped' | 'canceled',
    meals: [{
      type: 'breakfast' | 'lunch' | 'dinner',
      dishName: string,
      calories: number,
      protein: number,
      delivered: boolean,
      deliveredAt: ISO string,
      feedback: string,
      rating: 1-5,
    }],
    deliveryAddress: string,
    deliveryTime: string,
    notes: string,
  }],
  
  // Existing fields
  logs: [...],
  notes: [...],
}
```

---

## Implementation Roadmap

### Phase 1: Subscription System (Core)
**Goal:** Enable users to subscribe from homepage

**Tasks:**
1. Create `SubscriptionService` in `/src/services/subscriptionService.js`
   - `createSubscription(userId, planData)`
   - `updateSubscriptionStatus(subscriptionId, status)`
   - `checkSubscriptionExpiry(userId)`
   - `getActiveSubscriptions()`
   - `getExpiringSubscriptions(days)`

2. Add "Subscribe Now" flow to HomePage
   - Modal/form to collect: name, phone, email, address
   - Create user + subscription in one transaction
   - Generate unique user link
   - Show confirmation with link

3. Create Subscriptions tab in TrainerDashboard
   - List all subscriptions with filters
   - Status indicators (active/expiring/expired)
   - Quick actions: pause, cancel, extend
   - Billing history

4. Add subscription status to UserDashboard
   - Show subscription details
   - Days remaining
   - Renewal date
   - Payment status

---

### Phase 2: Calculator Integration
**Goal:** Use calculator results to auto-create personalized plans

**Tasks:**
1. Extend NutrientCalculator
   - Add "Save Profile & Subscribe" button at results
   - Store nutrient profile in user object
   - Auto-select meal plan based on:
     - Diet type → plan type
     - Recommended calories → meals/day
     - Recommended protein → protein/meal

2. Create `NutrientService` in `/src/services/nutrientService.js`
   - `calculateNutrients(formData)`
   - `recommendMealPlan(nutrientProfile)`
   - `saveNutrientProfile(userId, profile)`

3. Link calculator to user creation
   - Calculator results → pre-fill AddUserModal
   - Or directly create user with calculated plan
   - Store full nutrient profile

---

### Phase 3: Meal Delivery System
**Goal:** Track daily meal deliveries and schedules

**Tasks:**
1. Create `MealScheduleService`
   - `generateMonthlySchedule(userId, subscription)`
   - `markMealDelivered(userId, date, mealType)`
   - `skipMeal(userId, date, reason)`
   - `getMealSchedule(userId, startDate, endDate)`

2. Add Meal Schedule tab to TrainerDashboard
   - Calendar view of all deliveries
   - Filter by user, date, status
   - Bulk mark as delivered
   - Delivery notes

3. Enhance UserDashboard
   - Show today's meal schedule
   - Mark meals as received
   - Rate meals
   - Request meal changes

4. Use existing `foods.json` data
   - Rotate meals from 30-day program
   - Assign based on plan type (veg/non-veg)
   - Calculate calories per meal

---

### Phase 4: Unified Dashboard
**Goal:** Single view showing subscription + tracking + meals

**Tasks:**
1. Create new Overview cards:
   - Active Subscriptions count
   - Revenue this month
   - Meals delivered today
   - Upcoming renewals

2. Add Subscription Analytics to Reports
   - Monthly recurring revenue (MRR)
   - Churn rate
   - Average subscription length
   - Most popular plans

3. Create unified User Detail view
   - Tab 1: Subscription & Billing
   - Tab 2: Weight Loss Progress
   - Tab 3: Meal Delivery History
   - Tab 4: Nutrient Profile

---

### Phase 5: Automation & Notifications
**Goal:** Automate recurring tasks

**Tasks:**
1. Create utility functions:
   - `checkExpiringSubscriptions()` - daily cron
   - `generateMealSchedules()` - weekly
   - `updateSubscriptionStatuses()` - daily

2. Add notification system:
   - Subscription expiring in 3 days
   - Payment due reminder
   - Meal delivery confirmation
   - Weight loss milestones

3. Email/SMS templates (future)
   - Welcome email with user link
   - Subscription renewal reminder
   - Meal schedule for the week

---

## Quick Win: Minimal Viable Integration

**What to build first (1-2 days):**

### 1. Add Subscription to User Model
```javascript
// Extend dataService.js
export const createUserWithSubscription = (userData, subscriptionData) => {
  const user = addUser({
    ...userData,
    subscription: {
      ...subscriptionData,
      status: 'active',
      startDate: new Date().toISOString(),
    }
  });
  return user;
};
```

### 2. Add "Start Subscription" to HomePage
- Simple modal with form
- Collects: name, phone, plan selection
- Creates user + subscription
- Shows success with user link

### 3. Add Subscriptions Tab to Dashboard
- List all users with subscription status
- Filter: active, expiring (< 7 days), expired
- Show: name, plan, start date, end date, status
- Actions: extend, pause, cancel

### 4. Show Subscription in UserDashboard
- Card showing subscription details
- Status badge
- Days remaining
- Renewal date

---

## Data Flow Diagram

```
┌─────────────────┐
│   HomePage      │
│  (Marketing)    │
└────────┬────────┘
         │ User clicks "Subscribe"
         ▼
┌─────────────────┐
│ Subscription    │
│    Modal        │◄──────────┐
└────────┬────────┘           │
         │                    │
         │ Fills form         │ OR from Calculator
         ▼                    │
┌─────────────────┐           │
│  dataService    │           │
│ createUser +    │◄──────────┘
│ subscription    │
└────────┬────────┘
         │
         ├──────────────┬──────────────┬─────────────┐
         ▼              ▼              ▼             ▼
┌──────────────┐ ┌──────────────┐ ┌──────────┐ ┌──────────┐
│ localStorage │ │ Generate     │ │ Create   │ │ Send     │
│ (users)      │ │ user link    │ │ meal     │ │ welcome  │
│              │ │ /user/:id    │ │ schedule │ │ message  │
└──────────────┘ └──────────────┘ └──────────┘ └──────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│        Trainer Dashboard                │
│  ┌─────────┬──────────┬──────────────┐ │
│  │Overview │Users List│Subscriptions │ │
│  └─────────┴──────────┴──────────────┘ │
│  - Manage subscriptions                │
│  - Track deliveries                    │
│  - Monitor progress                    │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│         User Dashboard                  │
│  ┌──────────┬──────────┬─────────────┐ │
│  │Progress  │Meals     │Subscription │ │
│  └──────────┴──────────┴─────────────┘ │
│  - Log weight daily                    │
│  - View meal schedule                  │
│  - Track subscription                  │
└─────────────────────────────────────────┘
```

---

## Key Questions to Answer

Before implementation, decide:

1. **Subscription Duration:**
   - Monthly auto-renew?
   - Fixed 30/60/90 day programs?
   - Both options?

2. **Payment Tracking:**
   - Manual entry by admin?
   - Integration with payment gateway?
   - Just track status (paid/pending)?

3. **Meal Delivery:**
   - Track actual deliveries?
   - Or just show schedule?
   - Allow user to mark received?

4. **Calculator Integration:**
   - Mandatory before subscription?
   - Optional enhancement?
   - Auto-fill or manual override?

5. **Data Storage:**
   - Keep localStorage for now?
   - Move to Firebase/backend?
   - Hybrid approach?

---

## Recommended Next Steps

### Option A: Quick MVP (Recommended)
**Time: 1-2 days**

1. Add subscription object to user model
2. Create simple subscription form on HomePage
3. Add Subscriptions tab to TrainerDashboard
4. Show subscription status in UserDashboard
5. Basic expiry tracking

**Result:** You can demo the full flow end-to-end

---

### Option B: Full Integration
**Time: 1 week**

1. All of Option A
2. Deep calculator integration
3. Meal delivery tracking
4. Automated scheduling
5. Advanced analytics

**Result:** Production-ready system

---

## Files to Create/Modify

### New Files:
- `/src/services/subscriptionService.js`
- `/src/services/nutrientService.js`
- `/src/services/mealScheduleService.js`
- `/src/components/SubscriptionModal.jsx`
- `/src/components/dashboard/Subscriptions.jsx`
- `/src/components/dashboard/MealSchedule.jsx`
- `/src/utils/subscriptionUtils.js`

### Files to Modify:
- `/src/services/dataService.js` - extend user model
- `/src/components/HomePage.jsx` - add subscription flow
- `/src/components/NutrientCalculator.jsx` - add save & subscribe
- `/src/components/TrainerDashboard.jsx` - add subscriptions tab
- `/src/components/UserDashboard.jsx` - show subscription
- `/src/components/dashboard/Overview.jsx` - subscription stats
- `/src/components/dashboard/Reports.jsx` - subscription analytics

---

## Summary

**Current State:**
- 3 separate systems working independently
- No data flow between them
- No subscription/billing tracking

**After Integration:**
- Unified customer journey: Browse → Calculate → Subscribe → Track
- Single source of truth for user data
- Subscription management with status tracking
- Meal delivery scheduling
- Comprehensive analytics

**Business Value:**
- Can actually sell subscriptions from website
- Track recurring revenue
- Manage meal deliveries
- Monitor customer health progress
- All in one system

---

**Ready to implement?** 

Tell me which option you prefer (A or B), and I'll start building the code!
