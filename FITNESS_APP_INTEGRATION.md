# 📱 FITNESS APP INTEGRATION GUIDE
## Google Fit, Apple Health & Samsung Health Sync

---

## 🎯 OVERVIEW

### Why Fitness App Sync?
```
✅ No manual entry (auto-sync steps, calories, sleep)
✅ More accurate data (from phone sensors)
✅ Better user experience (seamless)
✅ Higher engagement (users already track fitness)
✅ Holistic health view (activity + weight + diet)
✅ FREE APIs (no cost!)
```

### What We'll Sync:
```
📊 Activity Data:
├─ Daily steps
├─ Calories burned
├─ Active minutes
├─ Distance walked/run
└─ Workouts completed

😴 Sleep Data:
├─ Sleep duration
├─ Sleep quality
└─ Sleep stages (optional)

❤️ Health Metrics (Optional):
├─ Heart rate
├─ Blood pressure
└─ Body fat percentage
```

---

## 📱 PLATFORM SUPPORT

### 1. **Google Fit** (Android)
```
Coverage: ~70% of Android users
API: Google Fit REST API
Auth: OAuth 2.0
Cost: FREE
Limitations: None for our use case
```

### 2. **Apple Health** (iOS)
```
Coverage: ~99% of iOS users
API: HealthKit Framework
Auth: User permission
Cost: FREE
Limitations: iOS app required (or PWA with workaround)
```

### 3. **Samsung Health** (Samsung Devices)
```
Coverage: ~30% of Android users (Samsung)
API: Samsung Health SDK
Auth: OAuth 2.0
Cost: FREE
Limitations: Samsung devices only
```

### 4. **Fitbit** (Optional)
```
Coverage: Fitbit users
API: Fitbit Web API
Auth: OAuth 2.0
Cost: FREE (with limits)
Limitations: 150 API calls/hour
```

---

## 🔧 IMPLEMENTATION

### Architecture:
```
User's Phone (Fitness App)
         ↓
    [OAuth Login]
         ↓
   Supabase Edge Function
         ↓
   Fetch Fitness Data
         ↓
   Store in Database
         ↓
   Display in Dashboard
```

---

## 1️⃣ GOOGLE FIT INTEGRATION

### Setup:

#### A) Google Cloud Console Setup
```bash
1. Go to: https://console.cloud.google.com
2. Create new project: "Afterburn Weightloss"
3. Enable APIs:
   - Fitness API
   - People API (for profile)
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: 
     https://yourapp.com/auth/google/callback
5. Copy Client ID & Client Secret
```

#### B) Supabase Environment Variables
```bash
GOOGLE_FIT_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_FIT_CLIENT_SECRET=xxxxx
GOOGLE_FIT_REDIRECT_URI=https://yourapp.com/auth/google/callback
```

### Implementation:

#### Frontend (React):
```tsx
// GoogleFitConnect.tsx
import { useState } from 'react'
import { Activity } from 'lucide-react'

export default function GoogleFitConnect({ userId }) {
  const [connecting, setConnecting] = useState(false)

  async function connectGoogleFit() {
    setConnecting(true)
    
    // OAuth URL
    const scopes = [
      'https://www.googleapis.com/auth/fitness.activity.read',
      'https://www.googleapis.com/auth/fitness.body.read',
      'https://www.googleapis.com/auth/fitness.sleep.read'
    ].join(' ')

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${process.env.VITE_GOOGLE_FIT_CLIENT_ID}` +
      `&redirect_uri=${process.env.VITE_GOOGLE_FIT_REDIRECT_URI}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent(scopes)}` +
      `&state=${userId}` + // Pass user ID
      `&access_type=offline` + // Get refresh token
      `&prompt=consent`

    // Redirect to Google OAuth
    window.location.href = authUrl
  }

  return (
    <button
      onClick={connectGoogleFit}
      disabled={connecting}
      className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
    >
      <Activity className="w-5 h-5" />
      {connecting ? 'Connecting...' : 'Connect Google Fit'}
    </button>
  )
}
```

#### OAuth Callback Handler:
```tsx
// GoogleFitCallback.tsx
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from './supabaseClient'

export default function GoogleFitCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    handleCallback()
  }, [])

  async function handleCallback() {
    const code = searchParams.get('code')
    const userId = searchParams.get('state')

    if (!code || !userId) {
      navigate('/dashboard?error=auth_failed')
      return
    }

    // Exchange code for tokens
    const { data, error } = await supabase.functions.invoke(
      'google-fit-auth',
      {
        body: { code, userId }
      }
    )

    if (error) {
      navigate('/dashboard?error=sync_failed')
      return
    }

    // Success! Start syncing
    navigate('/dashboard?success=google_fit_connected')
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Connecting to Google Fit...</p>
      </div>
    </div>
  )
}
```

#### Supabase Edge Function:
```typescript
// supabase/functions/google-fit-auth/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { code, userId } = await req.json()

  // Exchange code for tokens
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code,
      client_id: Deno.env.get('GOOGLE_FIT_CLIENT_ID'),
      client_secret: Deno.env.get('GOOGLE_FIT_CLIENT_SECRET'),
      redirect_uri: Deno.env.get('GOOGLE_FIT_REDIRECT_URI'),
      grant_type: 'authorization_code'
    })
  })

  const tokens = await tokenResponse.json()

  // Store tokens in database
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  await supabase.from('fitness_connections').insert({
    user_id: userId,
    provider: 'google_fit',
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString()
  })

  // Trigger initial sync
  await supabase.functions.invoke('sync-google-fit', {
    body: { userId }
  })

  return new Response(JSON.stringify({ success: true }))
})
```

#### Sync Function:
```typescript
// supabase/functions/sync-google-fit/index.ts
serve(async (req) => {
  const { userId } = await req.json()
  const supabase = createClient(/* ... */)

  // Get user's tokens
  const { data: connection } = await supabase
    .from('fitness_connections')
    .select('*')
    .eq('user_id', userId)
    .eq('provider', 'google_fit')
    .single()

  if (!connection) {
    return new Response(JSON.stringify({ error: 'Not connected' }), { status: 400 })
  }

  // Check if token expired, refresh if needed
  if (new Date(connection.expires_at) < new Date()) {
    const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        refresh_token: connection.refresh_token,
        client_id: Deno.env.get('GOOGLE_FIT_CLIENT_ID'),
        client_secret: Deno.env.get('GOOGLE_FIT_CLIENT_SECRET'),
        grant_type: 'refresh_token'
      })
    })
    const newTokens = await refreshResponse.json()
    
    // Update tokens
    await supabase
      .from('fitness_connections')
      .update({
        access_token: newTokens.access_token,
        expires_at: new Date(Date.now() + newTokens.expires_in * 1000).toISOString()
      })
      .eq('id', connection.id)
    
    connection.access_token = newTokens.access_token
  }

  // Fetch fitness data (last 7 days)
  const endTime = Date.now()
  const startTime = endTime - (7 * 24 * 60 * 60 * 1000)

  // Steps
  const stepsResponse = await fetch(
    `https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${connection.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        aggregateBy: [{
          dataTypeName: 'com.google.step_count.delta',
          dataSourceId: 'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps'
        }],
        bucketByTime: { durationMillis: 86400000 }, // 1 day
        startTimeMillis: startTime,
        endTimeMillis: endTime
      })
    }
  )
  const stepsData = await stepsResponse.json()

  // Calories
  const caloriesResponse = await fetch(
    `https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${connection.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        aggregateBy: [{
          dataTypeName: 'com.google.calories.expended'
        }],
        bucketByTime: { durationMillis: 86400000 },
        startTimeMillis: startTime,
        endTimeMillis: endTime
      })
    }
  )
  const caloriesData = await caloriesResponse.json()

  // Store in database
  for (const bucket of stepsData.bucket) {
    const date = new Date(parseInt(bucket.startTimeMillis))
    const steps = bucket.dataset[0]?.point[0]?.value[0]?.intVal || 0
    const calories = caloriesData.bucket.find(b => 
      b.startTimeMillis === bucket.startTimeMillis
    )?.dataset[0]?.point[0]?.value[0]?.fpVal || 0

    await supabase.from('fitness_data').upsert({
      user_id: userId,
      date: date.toISOString().split('T')[0],
      steps,
      calories_burned: Math.round(calories),
      provider: 'google_fit',
      synced_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,date'
    })
  }

  return new Response(JSON.stringify({ 
    success: true,
    synced_days: stepsData.bucket.length 
  }))
})
```

---

## 2️⃣ APPLE HEALTH INTEGRATION

### Setup:

#### A) Enable HealthKit in Xcode (if native app)
```xml
<!-- Info.plist -->
<key>NSHealthShareUsageDescription</key>
<string>We need access to your health data to track your fitness progress</string>

<key>NSHealthUpdateUsageDescription</key>
<string>We need to update your health data</string>
```

#### B) For Web App (PWA Workaround)
```typescript
// Use Apple Health Export feature
// Users can export their data as XML and upload it
// Not real-time, but works without native app

export async function importAppleHealthXML(file: File) {
  const text = await file.text()
  const parser = new DOMParser()
  const xml = parser.parseFromString(text, 'text/xml')
  
  // Parse steps
  const steps = Array.from(xml.querySelectorAll('Record[type="HKQuantityTypeIdentifierStepCount"]'))
    .map(record => ({
      date: record.getAttribute('startDate')?.split(' ')[0],
      steps: parseInt(record.getAttribute('value') || '0')
    }))
  
  // Parse calories
  const calories = Array.from(xml.querySelectorAll('Record[type="HKQuantityTypeIdentifierActiveEnergyBurned"]'))
    .map(record => ({
      date: record.getAttribute('startDate')?.split(' ')[0],
      calories: parseInt(record.getAttribute('value') || '0')
    }))
  
  return { steps, calories }
}
```

#### C) Better Option: Use Shortcuts App
```typescript
// Create iOS Shortcut that:
// 1. Reads HealthKit data
// 2. Sends to your API endpoint
// 3. Runs automatically daily

// API endpoint to receive data
// supabase/functions/apple-health-webhook/index.ts
serve(async (req) => {
  const { userId, steps, calories, date } = await req.json()
  
  const supabase = createClient(/* ... */)
  
  await supabase.from('fitness_data').upsert({
    user_id: userId,
    date,
    steps,
    calories_burned: calories,
    provider: 'apple_health',
    synced_at: new Date().toISOString()
  })
  
  return new Response(JSON.stringify({ success: true }))
})
```

---

## 3️⃣ SAMSUNG HEALTH INTEGRATION

### Setup:

#### A) Samsung Developer Account
```bash
1. Register at: https://developer.samsung.com
2. Create app in Samsung Health Partner Program
3. Get Partner App Key
4. Request permissions:
   - com.samsung.health.step_count
   - com.samsung.health.exercise
   - com.samsung.health.sleep
```

#### B) Implementation (Similar to Google Fit)
```typescript
// OAuth flow similar to Google Fit
const authUrl = `https://account.samsung.com/accounts/v1/oauth2/authorize?` +
  `client_id=${SAMSUNG_CLIENT_ID}` +
  `&redirect_uri=${REDIRECT_URI}` +
  `&response_type=code` +
  `&scope=samsung.health.step_count.read samsung.health.exercise.read`

// Fetch data
const response = await fetch(
  `https://api.samsunghealth.com/v1/users/me/steps`,
  {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }
)
```

---

## 📊 DATABASE SCHEMA

### Tables:

```sql
-- Fitness Connections
CREATE TABLE fitness_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(20) NOT NULL, -- 'google_fit', 'apple_health', 'samsung_health'
  
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP,
  
  connected_at TIMESTAMP DEFAULT NOW(),
  last_synced_at TIMESTAMP,
  
  UNIQUE(user_id, provider)
);

-- Fitness Data
CREATE TABLE fitness_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Activity
  steps INTEGER DEFAULT 0,
  calories_burned INTEGER DEFAULT 0,
  active_minutes INTEGER DEFAULT 0,
  distance_km DECIMAL(5,2) DEFAULT 0,
  
  -- Sleep
  sleep_hours DECIMAL(3,1),
  sleep_quality VARCHAR(20), -- 'poor', 'fair', 'good', 'excellent'
  
  -- Health
  heart_rate_avg INTEGER,
  
  -- Metadata
  provider VARCHAR(20), -- 'google_fit', 'apple_health', 'samsung_health'
  synced_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

CREATE INDEX idx_fitness_data_user_date ON fitness_data(user_id, date DESC);
```

---

## 🎨 UI COMPONENTS

### Fitness Dashboard Widget:
```tsx
// FitnessWidget.tsx
import { Activity, Flame, Moon, Heart } from 'lucide-react'

export default function FitnessWidget({ userId }) {
  const [data, setData] = useState(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    loadFitnessData()
  }, [userId])

  async function loadFitnessData() {
    const { data: connection } = await supabase
      .from('fitness_connections')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    setConnected(!!connection)

    if (connection) {
      const { data: fitnessData } = await supabase
        .from('fitness_data')
        .select('*')
        .eq('user_id', userId)
        .eq('date', new Date().toISOString().split('T')[0])
        .single()
      
      setData(fitnessData)
    }
  }

  if (!connected) {
    return (
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-lg font-bold mb-4">Connect Fitness App</h3>
        <p className="text-gray-600 mb-4">
          Automatically track your steps, calories, and activity
        </p>
        <div className="space-y-2">
          <GoogleFitConnect userId={userId} />
          <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-lg">
            Connect Apple Health
          </button>
          <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg">
            Connect Samsung Health
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">Today's Activity</h3>
        <button 
          onClick={loadFitnessData}
          className="text-sm text-blue-500 hover:text-blue-600"
        >
          Sync Now
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-600">Steps</span>
          </div>
          <div className="text-2xl font-bold">
            {data?.steps?.toLocaleString() || 0}
          </div>
          <div className="text-xs text-gray-500">Goal: 10,000</div>
          <div className="mt-2 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${Math.min((data?.steps || 0) / 10000 * 100, 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-gray-600">Calories</span>
          </div>
          <div className="text-2xl font-bold">
            {data?.calories_burned || 0}
          </div>
          <div className="text-xs text-gray-500">Burned today</div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Moon className="w-5 h-5 text-purple-500" />
            <span className="text-sm text-gray-600">Sleep</span>
          </div>
          <div className="text-2xl font-bold">
            {data?.sleep_hours || '-'} hrs
          </div>
          <div className="text-xs text-gray-500">
            {data?.sleep_quality || 'No data'}
          </div>
        </div>

        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-5 h-5 text-red-500" />
            <span className="text-sm text-gray-600">Heart Rate</span>
          </div>
          <div className="text-2xl font-bold">
            {data?.heart_rate_avg || '-'} bpm
          </div>
          <div className="text-xs text-gray-500">Average</div>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Last synced: {data?.synced_at ? new Date(data.synced_at).toLocaleTimeString() : 'Never'}
      </div>
    </div>
  )
}
```

---

## ⚙️ AUTOMATED SYNC

### Cron Job (Daily Sync):
```typescript
// supabase/functions/daily-fitness-sync/index.ts
// Run this daily via Supabase Cron

serve(async (req) => {
  const supabase = createClient(/* ... */)

  // Get all users with fitness connections
  const { data: connections } = await supabase
    .from('fitness_connections')
    .select('user_id, provider')

  for (const connection of connections || []) {
    // Trigger sync for each user
    await supabase.functions.invoke(`sync-${connection.provider}`, {
      body: { userId: connection.user_id }
    })
    
    // Wait 1 second between syncs (rate limiting)
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  return new Response(JSON.stringify({ 
    synced: connections?.length || 0 
  }))
})
```

### Schedule in Supabase:
```sql
-- Using pg_cron extension
SELECT cron.schedule(
  'daily-fitness-sync',
  '0 6 * * *', -- Every day at 6 AM
  $$
  SELECT net.http_post(
    url:='https://your-project.supabase.co/functions/v1/daily-fitness-sync',
    headers:='{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  );
  $$
);
```

---

## 💰 COST ANALYSIS

```
Google Fit API:     FREE (unlimited)
Apple Health:       FREE (no API, manual/shortcut)
Samsung Health:     FREE (with limits)
Fitbit API:         FREE (150 calls/hour)

Total Cost:         $0/month

Development Time:   3-4 days
Maintenance:        Minimal (auto-sync)
```

---

## 🎯 IMPLEMENTATION PRIORITY

### Phase 1 (Post-MVP):
- Google Fit integration (70% Android users)
- Basic dashboard widget
- Daily auto-sync

### Phase 2:
- Apple Health (iOS Shortcut method)
- Samsung Health integration
- Sleep & heart rate data

### Phase 3:
- Advanced analytics (correlate activity with weight loss)
- Recommendations based on activity
- Fitbit integration (if requested)

---

## ✅ BENEFITS

### For Users:
```
✅ No manual entry (saves time)
✅ More accurate tracking
✅ Holistic health view
✅ Better insights
✅ Motivation (see progress)
```

### For Trainers:
```
✅ See user activity levels
✅ Identify inactive users
✅ Better recommendations
✅ Data-driven coaching
✅ Track compliance
```

### For Business:
```
✅ Higher engagement
✅ Better retention
✅ Competitive advantage
✅ Premium feature
✅ Zero cost!
```

---

## 🚀 READY TO IMPLEMENT!

This feature is:
- ✅ High value
- ✅ Low cost ($0)
- ✅ Easy to implement (3-4 days)
- ✅ Great UX improvement
- ✅ Competitive advantage

**Much better than custom wearable integration!** 📱✨
