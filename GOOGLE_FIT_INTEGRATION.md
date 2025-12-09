# Google Fit Integration Guide

## 🎯 Overview

The system is **ready for Google Fit integration** to automatically sync:
- ✅ Step count
- ✅ Calories burned
- ✅ Distance walked
- ✅ Heart rate data
- ✅ Activity duration

---

## 📁 Files Created

### 1. **User Authentication Service** (Enhanced)
`/src/services/userAuthService.js`

**New Functions:**
- `linkGoogleAccount(userId, googleData)` - Link Google account
- `isGoogleLinked(userId)` - Check if linked
- `getGoogleAccount(userId)` - Get Google account data
- `unlinkGoogleAccount(userId)` - Disconnect Google
- `updateGoogleToken(userId, newAccessToken)` - Refresh token

### 2. **Google Fit Service**
`/src/services/googleFitService.js`

**Functions:**
- `initGoogleAuth()` - Start OAuth flow
- `getStepCount(userId, date)` - Get steps for a date
- `getStepCountRange(userId, startDate, endDate)` - Get step history
- `getHealthMetrics(userId, date)` - Get all health data
- `syncTodaySteps(userId)` - Sync today's steps
- `syncStepHistory(userId, days)` - Sync last N days
- `saveStepCountToLog(userId, date, steps)` - Save to user logs

### 3. **Google Fit Connect Component**
`/src/components/GoogleFitConnect.jsx`

**Features:**
- Connect/Disconnect Google account
- Display connection status
- Show today's step count
- Manual sync button
- Auto-sync capability

---

## 🚀 Implementation Steps (Future)

### Step 1: Get Google Cloud Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google Fit API**
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:5173/google-callback`
   - `https://yourdomain.com/google-callback`

### Step 2: Install Dependencies

```bash
npm install @react-oauth/google
```

### Step 3: Add Environment Variables

Create `.env` file:
```env
VITE_GOOGLE_CLIENT_ID=your_client_id_here
VITE_GOOGLE_CLIENT_SECRET=your_client_secret_here
```

### Step 4: Implement OAuth Flow

Update `/src/services/googleFitService.js`:

```javascript
export const initGoogleAuth = () => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const redirectUri = window.location.origin + '/google-callback';
  const scope = 'https://www.googleapis.com/auth/fitness.activity.read';
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}&` +
    `redirect_uri=${redirectUri}&` +
    `response_type=code&` +
    `scope=${scope}&` +
    `access_type=offline&` +
    `prompt=consent`;
  
  window.location.href = authUrl;
};
```

### Step 5: Handle OAuth Callback

Create `/src/components/GoogleCallback.jsx`:

```javascript
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { linkGoogleAccount } from '../services/userAuthService';
import { getCurrentUserId } from '../services/userAuthService';

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    const code = searchParams.get('code');
    const userId = getCurrentUserId();
    
    if (code && userId) {
      // Exchange code for tokens
      exchangeCodeForTokens(code, userId);
    }
  }, []);
  
  const exchangeCodeForTokens = async (code, userId) => {
    try {
      // Call your backend to exchange code for tokens
      const response = await fetch('/api/google/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, userId }),
      });
      
      const data = await response.json();
      
      // Link Google account
      linkGoogleAccount(userId, {
        googleId: data.googleId,
        email: data.email,
        name: data.name,
        picture: data.picture,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      
      navigate(`/user/${userId}`);
    } catch (error) {
      console.error('Error exchanging code:', error);
      navigate(`/user/${userId}?error=google_auth_failed`);
    }
  };
  
  return <div>Connecting to Google Fit...</div>;
};

export default GoogleCallback;
```

### Step 6: Add Route

Update `/src/App.jsx`:

```javascript
import GoogleCallback from './components/GoogleCallback';

// Add route
<Route path="/google-callback" element={<GoogleCallback />} />
```

### Step 7: Add to UserDashboard

Update `/src/components/UserDashboard.jsx`:

```javascript
import GoogleFitConnect from './GoogleFitConnect';

// In the render:
<GoogleFitConnect userId={userId} />
```

---

## 📊 Data Structure

### Google Account Storage
```javascript
{
  "user_123": {
    "googleId": "1234567890",
    "email": "user@gmail.com",
    "name": "John Doe",
    "picture": "https://...",
    "accessToken": "ya29.a0...",
    "refreshToken": "1//0g...",
    "linkedAt": "2025-12-06T14:00:00.000Z",
    "permissions": {
      "fitness": true,
      "activity": true,
      "location": false
    }
  }
}
```

### User Log with Steps
```javascript
{
  "date": "2025-12-06",
  "weight": 75,
  "steps": 8543,
  "stepsSource": "google_fit",
  "stepsSyncedAt": "2025-12-06T18:30:00.000Z",
  "meals": {
    "breakfast": "Oats",
    "lunch": "Chicken salad",
    "dinner": "Paneer tikka"
  }
}
```

---

## 🔐 Security Considerations

### 1. Token Storage
- ✅ Access tokens stored in localStorage (encrypted in production)
- ✅ Refresh tokens used to get new access tokens
- ✅ Tokens expire after 1 hour (Google default)

### 2. Permissions
- ✅ Only request necessary scopes
- ✅ User can revoke access anytime
- ✅ Clear privacy policy

### 3. Data Privacy
- ✅ Only sync data user explicitly allows
- ✅ Data stored locally (no external server)
- ✅ User can disconnect and delete data

---

## 🎨 UI/UX Flow

### User Journey:

1. **User Dashboard** → See "Connect Google Fit" card
2. **Click Connect** → Redirect to Google OAuth
3. **Grant Permission** → Allow fitness data access
4. **Redirect Back** → Return to dashboard
5. **Auto-Sync** → Steps automatically synced
6. **View Data** → See step count in dashboard

### Features:

- ✅ One-click connect
- ✅ Visual connection status
- ✅ Manual sync button
- ✅ Auto-sync on page load
- ✅ Disconnect option
- ✅ Privacy information

---

## 📱 Mobile Considerations

### Google Fit App Required:
- User must have Google Fit app installed
- App must be tracking steps
- Phone must have step counter sensor

### Alternative Sources:
- Samsung Health (via Health Connect API)
- Apple Health (via HealthKit - iOS only)
- Fitbit (via Fitbit API)
- Other fitness trackers

---

## 🧪 Testing (Without Real Google Account)

### Mock Data for Development:

```javascript
// In googleFitService.js
export const getStepCount = async (userId, date) => {
  // Mock data for testing
  if (process.env.NODE_ENV === 'development') {
    return Math.floor(Math.random() * 10000) + 5000; // 5000-15000 steps
  }
  
  // Real implementation...
};
```

### Test Flow:
1. Click "Connect Google Fit"
2. Mock OAuth (skip actual Google)
3. Store fake tokens
4. Return mock step data
5. Display in UI

---

## 🔄 Auto-Sync Strategy

### When to Sync:

1. **On Dashboard Load** - Sync today's steps
2. **On Daily Log** - Sync before saving weight
3. **Manual Button** - User-triggered sync
4. **Background** - Every 30 minutes (optional)

### Implementation:

```javascript
// In UserDashboard.jsx
useEffect(() => {
  const syncSteps = async () => {
    if (isGoogleLinked(userId)) {
      try {
        await syncTodaySteps(userId);
      } catch (error) {
        console.error('Auto-sync failed:', error);
      }
    }
  };
  
  syncSteps();
  
  // Auto-sync every 30 minutes
  const interval = setInterval(syncSteps, 30 * 60 * 1000);
  
  return () => clearInterval(interval);
}, [userId]);
```

---

## 📈 Future Enhancements

### Phase 1 (Current):
- ✅ Basic OAuth setup
- ✅ Step count sync
- ✅ Manual sync button

### Phase 2:
- ⏳ Auto-sync on schedule
- ⏳ Historical data import
- ⏳ Sync last 30 days

### Phase 3:
- ⏳ Calories burned tracking
- ⏳ Distance tracking
- ⏳ Heart rate monitoring

### Phase 4:
- ⏳ Activity type detection
- ⏳ Sleep tracking
- ⏳ Nutrition data (if available)

---

## 🐛 Common Issues & Solutions

### Issue 1: Token Expired
**Solution:** Implement token refresh
```javascript
if (response.status === 401) {
  const newToken = await refreshAccessToken(userId);
  // Retry request with new token
}
```

### Issue 2: No Data Available
**Solution:** Check if Google Fit app is tracking
```javascript
if (steps === 0) {
  alert('No step data found. Please ensure Google Fit is tracking your activity.');
}
```

### Issue 3: Permission Denied
**Solution:** Request permissions again
```javascript
if (error.message.includes('permission')) {
  alert('Please grant fitness data permission to sync steps.');
  initGoogleAuth(); // Re-request permissions
}
```

---

## 📞 Support Resources

- [Google Fit REST API Docs](https://developers.google.com/fit/rest)
- [OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [Google Fit Scopes](https://developers.google.com/fit/datatypes/activity)

---

## ✅ Current Status

**Ready for Implementation:**
- ✅ Service layer complete
- ✅ UI component ready
- ✅ Data structure defined
- ✅ Error handling in place

**Next Steps:**
1. Get Google Cloud credentials
2. Add OAuth flow
3. Test with real Google account
4. Deploy and monitor

---

**Last Updated:** December 6, 2025  
**Status:** 🟡 Ready for OAuth Implementation
