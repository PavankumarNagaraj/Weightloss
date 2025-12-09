# ⌚ Samsung Health Integration - Free Implementation

## 🎯 **Goal: Support Samsung Watch Users**

Add Samsung Health support alongside Google Fit - completely free!

---

## 🔧 **Implementation Strategy**

### **Challenge:**
Samsung Health SDK only works on Android devices (native code required)

### **Solution:**
Use **Samsung Health Web API** + **OAuth 2.0** (similar to Google Fit)

---

## 📋 **Step-by-Step Implementation:**

### **Phase 1: Samsung Developer Account Setup**

1. **Create Samsung Account** (Free)
   - Go to: https://account.samsung.com/membership/signUp
   - Sign up with email

2. **Register as Samsung Developer** (Free)
   - Go to: https://developer.samsung.com
   - Click "Join" → Fill form → Verify email
   - No payment required!

3. **Create Samsung Health App**
   - Go to: https://developer.samsung.com/health
   - Click "My Applications" → "Create New Application"
   - Fill in details:
     - **App Name:** AFTERBURN Weight Loss
     - **Package Name:** com.afterburn.weightloss
     - **Redirect URI:** `https://your-site.pages.dev/auth/samsung/callback`

4. **Get API Credentials**
   - Copy **Client ID**
   - Copy **Client Secret**
   - Save these securely

---

### **Phase 2: Database Schema Update**

```sql
-- Add Samsung Health support to fitness_data table
ALTER TABLE google_fit_data RENAME TO fitness_data;

ALTER TABLE fitness_data ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'google';
-- Values: 'google', 'samsung', 'manual'

ALTER TABLE fitness_data ADD COLUMN IF NOT EXISTS device_info JSONB;

-- Update users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS samsung_health_connected BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS samsung_health_refresh_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS samsung_health_last_sync TIMESTAMP;

-- Create index
CREATE INDEX IF NOT EXISTS idx_fitness_data_platform ON fitness_data(platform);
```

---

### **Phase 3: Samsung Health Service**

Create `src/services/samsungHealthClient.js`:

```javascript
import { supabase } from '../lib/supabase';

const SAMSUNG_CLIENT_ID = import.meta.env.VITE_SAMSUNG_CLIENT_ID;
const SAMSUNG_CLIENT_SECRET = import.meta.env.VITE_SAMSUNG_CLIENT_SECRET;
const SAMSUNG_REDIRECT_URI = `${window.location.origin}/auth/samsung/callback`;

// Samsung Health OAuth URLs
const SAMSUNG_AUTH_URL = 'https://account.samsung.com/accounts/v1/oauth2/authorize';
const SAMSUNG_TOKEN_URL = 'https://account.samsung.com/accounts/v1/oauth2/token';
const SAMSUNG_API_URL = 'https://api.samsunghealth.com/v1';

/**
 * Initiate Samsung Health OAuth flow
 */
export const connectSamsungHealth = () => {
  const scopes = [
    'samsung.health.step_count.read',
    'samsung.health.calories.read',
    'samsung.health.distance.read',
    'samsung.health.heart_rate.read',
    'samsung.health.sleep.read',
  ].join(' ');

  const params = new URLSearchParams({
    client_id: SAMSUNG_CLIENT_ID,
    redirect_uri: SAMSUNG_REDIRECT_URI,
    response_type: 'code',
    scope: scopes,
    state: Math.random().toString(36).substring(7), // CSRF protection
  });

  window.location.href = `${SAMSUNG_AUTH_URL}?${params}`;
};

/**
 * Exchange authorization code for access token
 */
export const handleSamsungCallback = async (code) => {
  try {
    const response = await fetch(SAMSUNG_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: SAMSUNG_CLIENT_ID,
        client_secret: SAMSUNG_CLIENT_SECRET,
        redirect_uri: SAMSUNG_REDIRECT_URI,
        code: code,
      }),
    });

    const data = await response.json();
    
    if (data.access_token) {
      // Store tokens in Supabase
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase
        .from('users')
        .update({
          samsung_health_connected: true,
          samsung_health_refresh_token: data.refresh_token,
          samsung_health_last_sync: new Date().toISOString(),
        })
        .eq('id', user.id);

      return data.access_token;
    }
    
    throw new Error('Failed to get access token');
  } catch (error) {
    console.error('Samsung Health auth error:', error);
    throw error;
  }
};

/**
 * Get Samsung Health data for a specific date
 */
export const getSamsungHealthData = async (accessToken, date = new Date()) => {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const startTime = startOfDay.getTime();
    const endTime = endOfDay.getTime();

    // Fetch steps
    const stepsResponse = await fetch(
      `${SAMSUNG_API_URL}/step_count?start_time=${startTime}&end_time=${endTime}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    const stepsData = await stepsResponse.json();

    // Fetch calories
    const caloriesResponse = await fetch(
      `${SAMSUNG_API_URL}/calories?start_time=${startTime}&end_time=${endTime}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );
    const caloriesData = await caloriesResponse.json();

    // Fetch distance
    const distanceResponse = await fetch(
      `${SAMSUNG_API_URL}/distance?start_time=${startTime}&end_time=${endTime}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );
    const distanceData = await distanceResponse.json();

    // Fetch heart rate
    const heartRateResponse = await fetch(
      `${SAMSUNG_API_URL}/heart_rate?start_time=${startTime}&end_time=${endTime}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );
    const heartRateData = await heartRateResponse.json();

    // Parse and aggregate data
    const steps = stepsData.data?.reduce((sum, item) => sum + (item.count || 0), 0) || 0;
    const calories = caloriesData.data?.reduce((sum, item) => sum + (item.calories || 0), 0) || 0;
    const distance = distanceData.data?.reduce((sum, item) => sum + (item.distance || 0), 0) || 0;
    
    const heartRates = heartRateData.data?.map(item => item.heart_rate).filter(Boolean) || [];
    const avgHeartRate = heartRates.length > 0 
      ? Math.round(heartRates.reduce((a, b) => a + b, 0) / heartRates.length)
      : null;

    return {
      steps,
      calories: Math.round(calories),
      distance: Math.round(distance), // in meters
      activeMinutes: Math.round(steps / 100), // Estimate
      heartRate: avgHeartRate,
      platform: 'samsung',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching Samsung Health data:', error);
    throw error;
  }
};

/**
 * Check if Samsung Health is connected
 */
export const isSamsungHealthConnected = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data } = await supabase
      .from('users')
      .select('samsung_health_connected')
      .eq('id', user.id)
      .single();

    return data?.samsung_health_connected || false;
  } catch (error) {
    console.error('Error checking Samsung Health connection:', error);
    return false;
  }
};

/**
 * Disconnect Samsung Health
 */
export const disconnectSamsungHealth = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase
      .from('users')
      .update({
        samsung_health_connected: false,
        samsung_health_refresh_token: null,
      })
      .eq('id', user.id);

    return true;
  } catch (error) {
    console.error('Error disconnecting Samsung Health:', error);
    throw error;
  }
};

export default {
  connectSamsungHealth,
  handleSamsungCallback,
  getSamsungHealthData,
  isSamsungHealthConnected,
  disconnectSamsungHealth,
};
```

---

### **Phase 4: Update Fitness Sync Service**

Update `src/services/fitnessSync.js` to support multiple platforms:

```javascript
import { getActivityForDate } from './googleFitClient';
import { getSamsungHealthData } from './samsungHealthClient';
import { supabase } from '../lib/supabase';

/**
 * Sync fitness data from any platform
 */
export const syncFitnessData = async (userId, date = new Date(), platform = 'google') => {
  try {
    let fitnessData;

    // Get data based on platform
    if (platform === 'samsung') {
      // Get Samsung Health access token
      const { data: user } = await supabase
        .from('users')
        .select('samsung_health_refresh_token')
        .eq('id', userId)
        .single();

      if (!user?.samsung_health_refresh_token) {
        throw new Error('Samsung Health not connected');
      }

      // Refresh token and get data
      const accessToken = await refreshSamsungToken(user.samsung_health_refresh_token);
      fitnessData = await getSamsungHealthData(accessToken, date);
    } else {
      // Default to Google Fit
      fitnessData = await getActivityForDate(date);
    }

    // Save to database
    const dateStr = date.toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('fitness_data')
      .upsert({
        user_id: userId,
        date: dateStr,
        steps: fitnessData.steps,
        distance: fitnessData.distance,
        calories_burned: fitnessData.calories,
        active_minutes: fitnessData.activeMinutes,
        heart_rate_avg: fitnessData.heartRate,
        platform: platform,
        raw_data: fitnessData,
        synced_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,date'
      });

    if (error) throw error;

    return { ...fitnessData, fromCache: false };
  } catch (error) {
    console.error('Error syncing fitness data:', error);
    throw error;
  }
};
```

---

### **Phase 5: Update UI - Platform Selector**

Update `src/components/GoogleFitWidget.jsx`:

```jsx
import { useState, useEffect } from 'react';
import { Activity, Watch } from 'lucide-react';
import { connectSamsungHealth, isSamsungHealthConnected } from '../services/samsungHealthClient';
import { isConnected as isGoogleFitConnected } from '../services/googleFitClient';

const FitnessWidget = () => {
  const [platform, setPlatform] = useState(null);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [samsungConnected, setSamsungConnected] = useState(false);

  useEffect(() => {
    checkConnections();
  }, []);

  const checkConnections = async () => {
    const google = await isGoogleFitConnected();
    const samsung = await isSamsungHealthConnected();
    
    setGoogleConnected(google);
    setSamsungConnected(samsung);
    
    // Auto-select connected platform
    if (samsung) setPlatform('samsung');
    else if (google) setPlatform('google');
  };

  if (!googleConnected && !samsungConnected) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold mb-4">Connect Your Fitness Device</h3>
        
        <div className="space-y-3">
          <button
            onClick={() => window.location.href = '/weightloss/auth'}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Activity className="w-5 h-5" />
            <span>Connect Google Fit</span>
          </button>
          
          <button
            onClick={connectSamsungHealth}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            <Watch className="w-5 h-5" />
            <span>Connect Samsung Health</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Platform selector if both connected */}
      {googleConnected && samsungConnected && (
        <div className="mb-4">
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="google">Google Fit</option>
            <option value="samsung">Samsung Health</option>
          </select>
        </div>
      )}
      
      {/* Show fitness data */}
      <div className="text-sm text-gray-500 mb-2">
        Connected: {platform === 'samsung' ? '⌚ Samsung Health' : '📱 Google Fit'}
      </div>
      
      {/* Rest of widget... */}
    </div>
  );
};
```

---

### **Phase 6: Environment Variables**

Add to `.env`:
```bash
# Samsung Health
VITE_SAMSUNG_CLIENT_ID=your_samsung_client_id
VITE_SAMSUNG_CLIENT_SECRET=your_samsung_client_secret
```

Add to Cloudflare Pages environment variables (same as Supabase).

---

## 📋 **Implementation Checklist:**

### **Setup (30 mins):**
- [ ] Create Samsung Developer account
- [ ] Register app in Samsung Health
- [ ] Get Client ID and Secret
- [ ] Add to environment variables

### **Database (10 mins):**
- [ ] Run SQL to update schema
- [ ] Add platform column
- [ ] Add Samsung Health columns to users table

### **Code (2 hours):**
- [ ] Create `samsungHealthClient.js`
- [ ] Update `fitnessSync.js` for multi-platform
- [ ] Add Samsung callback route
- [ ] Update fitness widget UI
- [ ] Add platform selector

### **Testing (30 mins):**
- [ ] Test Samsung Health connection
- [ ] Test data sync
- [ ] Test platform switching
- [ ] Test disconnect

---

## 🎯 **Benefits:**

✅ **Free** - No API costs
✅ **Native** - Direct Samsung Health integration
✅ **Flexible** - Users choose their platform
✅ **Scalable** - Easy to add more platforms later

---

## 📱 **User Experience:**

```
1. User opens app
2. Sees: "Connect Google Fit" or "Connect Samsung Health"
3. Clicks Samsung Health
4. Logs in with Samsung account
5. Grants permissions
6. Data syncs automatically
7. Can switch between platforms if both connected
```

---

## 🚀 **Next Steps:**

**Ready to implement?** I can:

1. Create the Samsung Health client service
2. Update the database schema
3. Add the platform selector UI
4. Create the callback route handler
5. Update all documentation

**Shall I start coding?** 🎯
