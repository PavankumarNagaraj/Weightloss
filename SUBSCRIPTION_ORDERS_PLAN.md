# Subscription Orders - Implementation Plan

## 🎯 Overview

Subscription orders are recurring meal plans where users pay upfront for a set number of meals per day over a period (e.g., 30 days).

---

## 📋 Current System vs Subscription Needs

### Current System (Walk-in Orders):
- One-time orders
- Pay per order
- Immediate fulfillment
- No tracking of remaining meals

### Subscription System Needs:
- Pre-paid meal plans
- Daily meal tracking
- Remaining meal balance
- Subscription status (active/expired)
- Link to user accounts

---

## 🏗️ Proposed Architecture

### 1. Subscription Management (New)

**Data Structure:**
```javascript
subscription = {
  id: "SUB123",
  userId: "user_id",
  userName: "John Doe",
  planType: "2meals", // 2meals, 3meals, 4meals
  startDate: "2024-01-01",
  endDate: "2024-01-30",
  totalMeals: 60, // 2 meals × 30 days
  mealsConsumed: 15,
  mealsRemaining: 45,
  status: "active", // active, expired, paused
  paymentAmount: 15000,
  paymentStatus: "paid",
  createdAt: "2024-01-01T00:00:00Z"
}
```

### 2. Subscription Orders (Modified Order System)

**Enhanced Order Structure:**
```javascript
order = {
  id: "ORD123",
  orderNumber: "ORD123456",
  orderType: "subscription", // NEW: "walk-in" or "subscription"
  subscriptionId: "SUB123", // NEW: Link to subscription
  userId: "user_id", // Required for subscriptions
  customerName: "John Doe",
  customerType: "customer",
  items: [...],
  subtotal: 200,
  discount: 0,
  totalAmount: 0, // Always 0 for subscription orders
  paymentReceived: 0, // Already paid in subscription
  mealsDeducted: 1, // NEW: How many meals this order consumed
  status: "completed",
  createdAt: "2024-01-15T12:00:00Z"
}
```

---

## 🔄 Workflow

### A. Creating a Subscription

**Step 1: User Signs Up (HomePage)**
```
User selects:
- Plan: 2 meals/day, 3 meals/day, 4 meals/day
- Duration: 30 days
- Protein: 100g, 150g, 200g
- Price calculated automatically

Payment: ₹15,000 (example)
```

**Step 2: Create Subscription Record**
```javascript
// In cafeService.js
export const createSubscription = (subscriptionData) => {
  const subscription = {
    id: generateShortId(),
    subscriptionNumber: `SUB${Date.now()}`,
    ...subscriptionData,
    totalMeals: subscriptionData.mealsPerDay * subscriptionData.durationDays,
    mealsConsumed: 0,
    mealsRemaining: subscriptionData.mealsPerDay * subscriptionData.durationDays,
    status: 'active',
    createdAt: new Date().toISOString()
  };
  
  // Save to localStorage
  const subscriptions = getSubscriptions();
  subscriptions.push(subscription);
  localStorage.setItem('cafe_subscriptions', JSON.stringify(subscriptions));
  
  return subscription;
};
```

### B. Daily Order Fulfillment

**Step 1: Create Order from Subscription**
```
Cafe Staff:
1. Go to Orders tab
2. Click "New Order"
3. Select "Subscription Order" (new option)
4. Search for user by name/phone
5. System shows:
   - Active subscription
   - Meals remaining
   - Allowed meals for today
6. Add items to cart
7. Create order
```

**Step 2: Deduct from Subscription**
```javascript
// When creating subscription order
export const createSubscriptionOrder = (orderData, subscriptionId) => {
  // Create order with totalAmount = 0
  const order = createOrder({
    ...orderData,
    orderType: 'subscription',
    subscriptionId: subscriptionId,
    totalAmount: 0,
    paymentReceived: 0
  });
  
  // Deduct meals from subscription
  const subscriptions = getSubscriptions();
  const subIndex = subscriptions.findIndex(s => s.id === subscriptionId);
  
  if (subIndex !== -1) {
    const mealsInOrder = orderData.items.length; // Or custom count
    subscriptions[subIndex].mealsConsumed += mealsInOrder;
    subscriptions[subIndex].mealsRemaining -= mealsInOrder;
    
    // Check if subscription should expire
    if (subscriptions[subIndex].mealsRemaining <= 0) {
      subscriptions[subIndex].status = 'completed';
    }
    
    localStorage.setItem('cafe_subscriptions', JSON.stringify(subscriptions));
  }
  
  return order;
};
```

---

## 🎨 UI Changes Needed

### 1. Orders Tab - New Order Modal

**Add Subscription Mode:**
```
┌─────────────────────────────────────┐
│ Order Type:                         │
│ ○ Walk-in Order                     │
│ ● Subscription Order                │
└─────────────────────────────────────┘

[If Subscription selected]
┌─────────────────────────────────────┐
│ Search User: [John Doe_________]    │
│                                     │
│ Active Subscription:                │
│ Plan: 2 Meals/Day                   │
│ Remaining: 45 meals                 │
│ Today's Limit: 2 meals              │
│ Already Used Today: 0 meals         │
└─────────────────────────────────────┘
```

### 2. New Tab: Subscriptions

**Subscriptions Management Tab:**
```
┌─────────────────────────────────────────────────────┐
│ Subscriptions                    [+ New Subscription]│
├─────────────────────────────────────────────────────┤
│ Filters: [Active] [Expired] [All]                   │
├─────────────────────────────────────────────────────┤
│ User        Plan      Start      End      Remaining  │
│ John Doe    2/day    01-Jan    30-Jan      45/60    │
│ Jane Smith  3/day    05-Jan    04-Feb      78/90    │
│ Mike Ross   4/day    10-Jan    09-Feb     110/120   │
└─────────────────────────────────────────────────────┘
```

### 3. Orders Tab - Enhanced Display

**Show Subscription Orders Differently:**
```
Order #    Customer    Type          Items    Amount    Received
ORD123     John Doe    [SUB 2/day]   2 items  ₹0       ₹0
ORD124     Walk-in     [Walk-in]     1 item   ₹200     ₹200
```

---

## 📊 Dashboard Integration

### New Metrics:

**Subscription Stats:**
- Active Subscriptions: 25
- Total Subscription Revenue: ₹3,75,000
- Meals Served Today (Subscription): 48
- Meals Remaining (All Active): 1,250

**Combined View:**
```
Today's Orders: 35
├─ Walk-in Orders: 10 (₹4,000)
├─ Subscription Orders: 25 (₹0 - Pre-paid)
└─ Total Cash Received: ₹4,000
```

---

## 🔍 Key Features to Implement

### 1. Subscription Creation
- [ ] Create subscription form
- [ ] Link to user account
- [ ] Calculate total meals
- [ ] Set start/end dates
- [ ] Record payment

### 2. Subscription Tracking
- [ ] View active subscriptions
- [ ] Track meals consumed
- [ ] Show remaining balance
- [ ] Daily usage limits
- [ ] Expiry notifications

### 3. Order Integration
- [ ] Subscription order type
- [ ] User search/selection
- [ ] Meal deduction logic
- [ ] Zero-cost orders
- [ ] Inventory still deducts

### 4. Reporting
- [ ] Subscription revenue
- [ ] Meal consumption rate
- [ ] Active vs expired
- [ ] User-wise reports

---

## 🚀 Implementation Phases

### Phase 1: Data Structure (Week 1)
1. Create subscription data model
2. Add subscription storage (localStorage)
3. Create basic CRUD functions
4. Update order model for subscription type

### Phase 2: Subscription Management (Week 2)
1. Create Subscriptions tab
2. Add subscription creation form
3. List active/expired subscriptions
4. View subscription details
5. Edit/pause/cancel subscriptions

### Phase 3: Order Integration (Week 3)
1. Add subscription order type to order modal
2. User search and selection
3. Show subscription details
4. Meal deduction on order creation
5. Prevent over-usage

### Phase 4: Dashboard & Reports (Week 4)
1. Add subscription stats to dashboard
2. Subscription revenue tracking
3. Meal consumption analytics
4. User-wise reports
5. Expiry alerts

---

## 💡 Business Logic

### Daily Meal Limits
```javascript
// Check if user can order today
const canOrderToday = (subscription, todaysOrders) => {
  const mealsToday = todaysOrders
    .filter(o => o.subscriptionId === subscription.id)
    .reduce((sum, o) => sum + o.mealsDeducted, 0);
  
  return mealsToday < subscription.mealsPerDay;
};
```

### Subscription Status
```javascript
const updateSubscriptionStatus = (subscription) => {
  const now = new Date();
  const endDate = new Date(subscription.endDate);
  
  if (now > endDate || subscription.mealsRemaining <= 0) {
    subscription.status = 'expired';
  } else if (subscription.status === 'paused') {
    // Keep paused
  } else {
    subscription.status = 'active';
  }
  
  return subscription;
};
```

---

## 🎯 User Experience

### For Cafe Staff:

**Walk-in Order:**
1. Click "New Order"
2. Select "Walk-in"
3. Add items
4. Collect payment
5. Done

**Subscription Order:**
1. Click "New Order"
2. Select "Subscription"
3. Search user: "John Doe"
4. See: "2 meals/day, 45 remaining"
5. Add items (max 2 today)
6. Create order (₹0)
7. Meals deducted automatically

### For Users:

**Subscription Purchase:**
1. Visit homepage
2. Select plan (2/3/4 meals)
3. Pay ₹15,000
4. Receive subscription ID
5. Visit cafe daily
6. Show ID/name
7. Get meals (no payment)

---

## 📱 Integration with Existing System

### HomePage.jsx
- Add subscription creation flow
- Payment integration
- Generate subscription ID
- Link to user account

### CafeOrders.jsx
- Add order type selector
- User search for subscriptions
- Show subscription details
- Meal limit validation

### CafeDashboard.jsx
- Add subscription metrics
- Show active subscriptions
- Revenue breakdown
- Meal consumption stats

### cafeService.js
- Add subscription CRUD functions
- Update order creation logic
- Add meal deduction logic
- Status management

---

## 🔐 Validation Rules

1. **Subscription Creation:**
   - User must exist
   - Payment must be confirmed
   - Valid date range
   - Meals > 0

2. **Subscription Order:**
   - Subscription must be active
   - Within date range
   - Meals remaining > 0
   - Daily limit not exceeded

3. **Inventory:**
   - Still deduct raw materials
   - Even for ₹0 orders
   - Track actual consumption

---

## 📈 Reporting Needs

### Daily Reports:
- Subscription orders served
- Walk-in orders served
- Cash collected (walk-in only)
- Meals remaining (all subscriptions)

### Monthly Reports:
- New subscriptions
- Expired subscriptions
- Subscription revenue
- Average meals per day
- Renewal rate

---

## 🎨 Color Coding

- 🟣 Walk-in Orders - Purple
- 🔵 Subscription Orders - Blue
- 🟢 Active Subscriptions - Green
- 🟠 Expiring Soon - Orange
- 🔴 Expired - Red

---

## ✅ Next Steps

**Immediate:**
1. Review this plan
2. Confirm business logic
3. Decide on Phase 1 start

**Questions to Answer:**
1. Can users have multiple active subscriptions?
2. What happens to unused meals after expiry?
3. Can subscriptions be paused/resumed?
4. Refund policy for cancelled subscriptions?
5. Can users upgrade/downgrade mid-subscription?

---

**This plan provides a complete subscription management system integrated with your existing cafe orders!** 🎉
