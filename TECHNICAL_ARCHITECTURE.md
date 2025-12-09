# 🏗️ TECHNICAL ARCHITECTURE
## Cloudflare Pages + Supabase Backend

---

## 📚 TECH STACK

### Frontend (Cloudflare Pages)
```
React 18 + Vite
├─ Routing: React Router v6
├─ State Management: 
│  ├─ React Context (simple state)
│  └─ Zustand (complex global state)
├─ Styling: TailwindCSS v3
├─ UI Components: Headless UI / Radix UI
├─ Charts: Recharts / Chart.js
├─ Forms: React Hook Form + Zod validation
├─ Notifications: React Hot Toast
├─ Date Handling: date-fns
├─ Icons: Lucide React
├─ HTTP Client: Supabase JS Client
├─ Real-time: Supabase Realtime
└─ Build Tool: Vite (fast HMR)

Deployment:
• Cloudflare Pages (Git-based deployments)
• Automatic builds on push
• Preview deployments for PRs
• Edge caching for static assets
• Global CDN (200+ locations)
• Custom domains + SSL
• Web Analytics built-in
```

### Backend (Supabase)
```
PostgreSQL 15
├─ Authentication: Supabase Auth
│  ├─ JWT tokens
│  ├─ Email/Password
│  ├─ Magic Links
│  └─ Social OAuth (Google, etc.)
├─ Database: PostgreSQL
│  ├─ Row Level Security (RLS)
│  ├─ Triggers & Functions
│  └─ Full-text search
├─ Storage: Supabase Storage
│  ├─ User profile photos
│  ├─ Before/After images
│  ├─ Meal photos
│  └─ Documents
├─ Realtime: WebSocket subscriptions
│  ├─ Live notifications
│  ├─ Chat messages
│  └─ Dashboard updates
├─ Edge Functions: Deno runtime
│  ├─ Automated alerts
│  ├─ Scheduled jobs
│  ├─ Email notifications
│  └─ WhatsApp integration
└─ Vector Search: pgvector (AI features)
```

---

## 🗄️ DATABASE SCHEMA

### Core Tables

#### 1. USERS
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID REFERENCES auth.users(id),
  role VARCHAR(20) CHECK (role IN ('admin', 'trainer', 'user')),
  
  -- Personal Info
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  date_of_birth DATE,
  gender VARCHAR(10),
  
  -- Physical Metrics
  current_weight DECIMAL(5,2),
  goal_weight DECIMAL(5,2),
  height DECIMAL(5,2),
  bmi DECIMAL(4,2),
  body_fat_percentage DECIMAL(4,2),
  
  -- Program Details
  program_type VARCHAR(20), -- '60-day', '90-day'
  start_date DATE,
  end_date DATE,
  batch_id UUID REFERENCES batches(id),
  trainer_id UUID REFERENCES trainers(id),
  subscription_tier VARCHAR(20), -- 'basic', 'premium', 'vip'
  
  -- Engagement
  archetype VARCHAR(50), -- 'athlete', 'foodie', 'busy_professional', etc.
  engagement_score INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_active_at TIMESTAMP,
  
  -- Journey Stage
  journey_stage VARCHAR(50) DEFAULT 'onboarding',
  progress_status VARCHAR(20) DEFAULT 'onTrack',
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_users_trainer ON users(trainer_id);
CREATE INDEX idx_users_batch ON users(batch_id);
CREATE INDEX idx_users_stage ON users(journey_stage);
```

#### 2. LOGS (Weight & Food Tracking)
```sql
CREATE TABLE logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  
  -- Weight Tracking
  weight DECIMAL(5,2),
  
  -- Measurements
  waist_cm DECIMAL(5,2),
  chest_cm DECIMAL(5,2),
  hips_cm DECIMAL(5,2),
  arms_cm DECIMAL(5,2),
  thighs_cm DECIMAL(5,2),
  
  -- Food Logging
  breakfast TEXT,
  lunch TEXT,
  dinner TEXT,
  snacks TEXT,
  total_calories INTEGER,
  protein_g INTEGER,
  carbs_g INTEGER,
  fats_g INTEGER,
  water_liters DECIMAL(3,1),
  
  -- Progress Indicators
  size_reduced BOOLEAN DEFAULT false,
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 5),
  mood INTEGER CHECK (mood BETWEEN 1 AND 5),
  
  -- Activity
  steps INTEGER,
  workout_completed BOOLEAN DEFAULT false,
  workout_duration_mins INTEGER,
  
  -- Notes
  notes TEXT,
  photos JSONB, -- Array of photo URLs
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, log_date)
);

CREATE INDEX idx_logs_user_date ON logs(user_id, log_date DESC);
```

#### 3. TRAINERS
```sql
CREATE TABLE trainers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID REFERENCES auth.users(id),
  
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  
  -- Specialization
  specialization VARCHAR(100), -- 'diet', 'exercise', 'motivation', 'all'
  certifications TEXT[],
  experience_years INTEGER,
  
  -- Performance Metrics
  success_rate DECIMAL(5,2) DEFAULT 0,
  avg_rating DECIMAL(3,2) DEFAULT 0,
  total_users_trained INTEGER DEFAULT 0,
  active_users_count INTEGER DEFAULT 0,
  
  -- Capacity
  max_capacity INTEGER DEFAULT 30,
  
  -- Availability
  available_days TEXT[], -- ['monday', 'tuesday', ...]
  available_hours JSONB, -- {start: '09:00', end: '18:00'}
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 4. BATCHES
```sql
CREATE TABLE batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  capacity INTEGER DEFAULT 50,
  active_users_count INTEGER DEFAULT 0,
  
  primary_trainer_id UUID REFERENCES trainers(id),
  
  -- Schedule
  class_days TEXT[], -- ['monday', 'wednesday', 'friday']
  class_time TIME,
  
  -- Status
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'cancelled'
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 5. ACHIEVEMENTS
```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  badge_type VARCHAR(50) NOT NULL, -- 'first_week', '5kg_club', etc.
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50), -- emoji or icon name
  
  earned_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, badge_type)
);

CREATE INDEX idx_achievements_user ON achievements(user_id);
```

#### 6. MESSAGES
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  from_user_id UUID REFERENCES users(id),
  to_user_id UUID REFERENCES users(id),
  
  content TEXT NOT NULL,
  attachments JSONB, -- Array of file URLs
  
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  
  -- Thread support
  thread_id UUID,
  reply_to_id UUID REFERENCES messages(id),
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  CHECK (from_user_id != to_user_id)
);

CREATE INDEX idx_messages_to_user ON messages(to_user_id, created_at DESC);
CREATE INDEX idx_messages_thread ON messages(thread_id);
```

#### 7. NOTIFICATIONS
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  type VARCHAR(50) NOT NULL, -- 'alert', 'milestone', 'reminder', etc.
  priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  action_url VARCHAR(500),
  
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, read) WHERE read = false;
```

#### 8. CHALLENGES
```sql
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  type VARCHAR(50), -- 'individual', 'team', 'batch'
  category VARCHAR(50), -- 'weight_loss', 'consistency', 'steps', etc.
  
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  goal JSONB, -- {type: 'weight_loss', target: 5, unit: 'kg'}
  
  -- Participants
  participants UUID[], -- Array of user IDs
  teams JSONB, -- For team challenges
  
  -- Leaderboard
  leaderboard JSONB,
  
  -- Rewards
  rewards TEXT,
  
  status VARCHAR(20) DEFAULT 'upcoming', -- 'upcoming', 'active', 'completed'
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 9. MEAL_PLANS
```sql
CREATE TABLE meal_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  plan_date DATE NOT NULL,
  meal_type VARCHAR(20), -- 'breakfast', 'lunch', 'dinner', 'snack'
  
  food_items JSONB, -- [{name: 'Oats', quantity: '50g', calories: 200}]
  total_calories INTEGER,
  
  macros JSONB, -- {protein: 30, carbs: 50, fats: 20}
  
  created_by_trainer_id UUID REFERENCES trainers(id),
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_meal_plans_user_date ON meal_plans(user_id, plan_date DESC);
```

#### 10. WORKOUT_PLANS
```sql
CREATE TABLE workout_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  plan_date DATE NOT NULL,
  
  exercises JSONB, -- [{name: 'Push-ups', sets: 3, reps: 10, duration: 5}]
  total_duration_mins INTEGER,
  estimated_calories INTEGER,
  
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,
  actual_duration_mins INTEGER,
  
  created_by_trainer_id UUID REFERENCES trainers(id),
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_workout_plans_user_date ON workout_plans(user_id, plan_date DESC);
```

#### 11. CHECK_INS
```sql
CREATE TABLE check_ins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  trainer_id UUID REFERENCES trainers(id),
  
  scheduled_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  
  type VARCHAR(20), -- 'call', 'video', 'in-person'
  status VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled', 'no-show'
  
  -- Call Notes
  notes TEXT,
  action_items JSONB, -- [{task: 'Increase protein', due_date: '2024-12-15'}]
  
  -- Ratings
  user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5),
  user_feedback TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_checkins_user ON check_ins(user_id, scheduled_at DESC);
CREATE INDEX idx_checkins_trainer ON check_ins(trainer_id, scheduled_at DESC);
```

#### 12. ANALYTICS_EVENTS
```sql
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  
  event_type VARCHAR(100) NOT NULL, -- 'login', 'log_weight', 'view_dashboard', etc.
  event_data JSONB, -- Additional event metadata
  
  session_id VARCHAR(255),
  device_type VARCHAR(50),
  browser VARCHAR(50),
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_analytics_user ON analytics_events(user_id, created_at DESC);
CREATE INDEX idx_analytics_type ON analytics_events(event_type, created_at DESC);
```

---

## 🔐 ROW LEVEL SECURITY (RLS)

### Users Table
```sql
-- Users can only see their own data
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = auth_id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = auth_id);

-- Trainers can see their assigned users
CREATE POLICY "Trainers can view assigned users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trainers
      WHERE trainers.auth_id = auth.uid()
      AND users.trainer_id = trainers.id
    )
  );

-- Admins can see all users
CREATE POLICY "Admins can view all users"
  ON users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'admin'
    )
  );
```

### Logs Table
```sql
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own logs"
  ON logs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = logs.user_id
      AND users.auth_id = auth.uid()
    )
  );

CREATE POLICY "Trainers can view assigned user logs"
  ON logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN trainers t ON u.trainer_id = t.id
      WHERE u.id = logs.user_id
      AND t.auth_id = auth.uid()
    )
  );
```

---

## ⚡ SUPABASE EDGE FUNCTIONS

### 1. Auto-Alert System
```typescript
// supabase/functions/check-inactive-users/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // Find users who haven't logged in 3+ days
  const threeDaysAgo = new Date()
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

  const { data: inactiveUsers } = await supabase
    .from('users')
    .select('id, name, email, trainer_id, last_active_at')
    .lt('last_active_at', threeDaysAgo.toISOString())
    .eq('journey_stage', 'active')

  // Create notifications
  for (const user of inactiveUsers || []) {
    // Notify user
    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'reminder',
      priority: 'high',
      title: 'We miss you!',
      message: 'Log your progress to stay on track 💪',
      action_url: '/weightloss/dashboard'
    })

    // Notify trainer
    if (user.trainer_id) {
      await supabase.from('notifications').insert({
        user_id: user.trainer_id,
        type: 'alert',
        priority: 'medium',
        title: 'User Inactive',
        message: `${user.name} hasn't logged in for 3+ days`,
        action_url: `/weightloss/dashboard/users/${user.id}`
      })
    }
  }

  return new Response(
    JSON.stringify({ checked: inactiveUsers?.length || 0 }),
    { headers: { "Content-Type": "application/json" } }
  )
})
```

### 2. Milestone Detection
```typescript
// supabase/functions/detect-milestones/index.ts
serve(async (req) => {
  const supabase = createClient(/* ... */)

  // Get recent logs
  const { data: recentLogs } = await supabase
    .from('logs')
    .select('*, users(*)')
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

  for (const log of recentLogs || []) {
    const user = log.users
    const weightLost = user.current_weight - log.weight

    // Check for 5kg milestone
    if (weightLost >= 5 && weightLost < 5.5) {
      await supabase.from('achievements').insert({
        user_id: user.id,
        badge_type: '5kg_club',
        title: '5kg Club Member!',
        description: 'You lost 5kg! Amazing progress!',
        icon: '🏆'
      })

      await supabase.from('notifications').insert({
        user_id: user.id,
        type: 'milestone',
        priority: 'high',
        title: '🎉 Milestone Achieved!',
        message: 'You lost 5kg! Keep up the great work!',
      })
    }

    // Check for 7-day streak
    const { count } = await supabase
      .from('logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('log_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    if (count === 7) {
      await supabase.from('achievements').insert({
        user_id: user.id,
        badge_type: 'week_warrior',
        title: 'Week Warrior!',
        description: '7 days logged in a row!',
        icon: '🔥'
      })
    }
  }

  return new Response(JSON.stringify({ success: true }))
})
```

### 3. WhatsApp Notifications
```typescript
// supabase/functions/send-whatsapp/index.ts
import { Twilio } from 'https://esm.sh/twilio@4.0.0'

serve(async (req) => {
  const { to, message } = await req.json()
  
  const client = new Twilio(
    Deno.env.get('TWILIO_ACCOUNT_SID'),
    Deno.env.get('TWILIO_AUTH_TOKEN')
  )

  await client.messages.create({
    from: 'whatsapp:+14155238886', // Twilio Sandbox
    to: `whatsapp:${to}`,
    body: message
  })

  return new Response(JSON.stringify({ sent: true }))
})
```

---

## 🔄 REAL-TIME SUBSCRIPTIONS

### Live Dashboard Updates
```typescript
// In React component
import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

function Dashboard() {
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    // Subscribe to new notifications
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          setNotifications(prev => [payload.new, ...prev])
          // Show toast notification
          toast.success(payload.new.title)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  return <div>{/* Dashboard UI */}</div>
}
```

### Live Chat
```typescript
// Real-time messages
useEffect(() => {
  const channel = supabase
    .channel('messages')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `to_user_id=eq.${userId}`
      },
      (payload) => {
        setMessages(prev => [...prev, payload.new])
        playNotificationSound()
      }
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}, [userId])
```

---

## 📦 STORAGE STRUCTURE

```
afterburn-bucket/
├─ users/
│  ├─ {user_id}/
│  │  ├─ profile.jpg
│  │  ├─ before-photos/
│  │  │  ├─ front.jpg
│  │  │  ├─ side.jpg
│  │  │  └─ back.jpg
│  │  ├─ after-photos/
│  │  │  └─ ...
│  │  └─ meal-photos/
│  │     ├─ 2024-12-01-breakfast.jpg
│  │     └─ ...
├─ trainers/
│  └─ {trainer_id}/
│     └─ profile.jpg
└─ documents/
   ├─ diet-plans/
   ├─ workout-guides/
   └─ certificates/
```

### Storage Policies
```sql
-- Users can upload to their own folder
CREATE POLICY "Users can upload own files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'afterburn-bucket' AND
    (storage.foldername(name))[1] = 'users' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );

-- Users can view their own files
CREATE POLICY "Users can view own files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'afterburn-bucket' AND
    (storage.foldername(name))[1] = 'users' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );
```

---

## 🚀 DEPLOYMENT WORKFLOW

### Cloudflare Pages Setup
```yaml
# wrangler.toml
name = "afterburn-weightloss"
compatibility_date = "2024-12-01"

[build]
command = "npm run build"
publish = "dist"

[[env.production]]
name = "afterburn-weightloss"
route = "afterburn.com/*"

[[env.preview]]
name = "afterburn-preview"
```

### Environment Variables
```bash
# .env.local (Cloudflare Pages)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase Edge Functions
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
```

### CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
      
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: afterburn-weightloss
          directory: dist
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

---

## 🔒 SECURITY BEST PRACTICES

### 1. Authentication
```typescript
// Secure auth flow
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
})

// Store JWT in httpOnly cookie (via Cloudflare Worker)
// Never expose service role key to frontend
```

### 2. API Rate Limiting
```typescript
// Cloudflare Worker for rate limiting
export default {
  async fetch(request, env) {
    const ip = request.headers.get('CF-Connecting-IP')
    const { success } = await env.RATE_LIMITER.limit({ key: ip })
    
    if (!success) {
      return new Response('Too many requests', { status: 429 })
    }
    
    return fetch(request)
  }
}
```

### 3. Data Validation
```typescript
// Use Zod for validation
import { z } from 'zod'

const userSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  weight: z.number().positive().max(500),
  goalWeight: z.number().positive().max(500)
})

// Validate before DB insert
const validatedData = userSchema.parse(formData)
```

---

## 📊 MONITORING & ANALYTICS

### Cloudflare Web Analytics
```html
<!-- Add to index.html -->
<script defer src='https://static.cloudflareinsights.com/beacon.min.js' 
        data-cf-beacon='{"token": "xxxxx"}'></script>
```

### Supabase Logs
```typescript
// Track custom events
await supabase.from('analytics_events').insert({
  user_id: userId,
  event_type: 'weight_logged',
  event_data: { weight: 78, date: '2024-12-08' }
})
```

### Error Tracking (Sentry)
```typescript
import * as Sentry from "@sentry/react"

Sentry.init({
  dsn: "https://xxxxx@sentry.io/xxxxx",
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 1.0,
})
```

---

## 💰 COST ESTIMATION

### Cloudflare Pages
```
Free Tier:
✅ Unlimited requests
✅ Unlimited bandwidth
✅ 500 builds/month
✅ Preview deployments
Cost: $0/month
```

### Supabase
```
Free Tier:
✅ 500MB database
✅ 1GB file storage
✅ 50,000 monthly active users
✅ 2GB bandwidth
✅ 500K Edge Function invocations

Pro Tier ($25/month):
✅ 8GB database
✅ 100GB file storage
✅ 100,000 monthly active users
✅ 250GB bandwidth
✅ 2M Edge Function invocations

Estimated Cost for 200 users: $25/month
```

### Total Monthly Cost
```
Cloudflare Pages: $0
Supabase Pro: $25
Twilio (WhatsApp): ~$10 (optional)
Total: $25-35/month
```

---

## 🎯 PERFORMANCE OPTIMIZATIONS

### 1. Code Splitting
```typescript
// Lazy load routes
const Dashboard = lazy(() => import('./pages/Dashboard'))
const UserProfile = lazy(() => import('./pages/UserProfile'))

<Suspense fallback={<Loading />}>
  <Routes>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/profile" element={<UserProfile />} />
  </Routes>
</Suspense>
```

### 2. Image Optimization
```typescript
// Use Supabase image transformations
const imageUrl = supabase.storage
  .from('afterburn-bucket')
  .getPublicUrl('users/123/profile.jpg', {
    transform: {
      width: 200,
      height: 200,
      resize: 'cover',
      quality: 80
    }
  })
```

### 3. Database Indexing
```sql
-- Add indexes for common queries
CREATE INDEX idx_logs_user_date ON logs(user_id, log_date DESC);
CREATE INDEX idx_users_trainer ON users(trainer_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE read = false;
```

### 4. Caching Strategy
```typescript
// Use React Query for data caching
import { useQuery } from '@tanstack/react-query'

const { data: users } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000 // 10 minutes
})
```

---

## 🚀 READY TO BUILD!

This architecture provides:
✅ Scalable backend (Supabase)
✅ Fast global delivery (Cloudflare)
✅ Real-time features
✅ Secure authentication
✅ Cost-effective ($25-35/month)
✅ Easy to maintain
✅ Production-ready

**Let's start building!** 🎨
