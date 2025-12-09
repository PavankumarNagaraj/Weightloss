# 🔐 Add All Google Fitness Scopes (Read-Only)

## 📋 Complete List of Fitness Scopes to Add:

### **All Read-Only Fitness Scopes:**
```
https://www.googleapis.com/auth/fitness.activity.read
https://www.googleapis.com/auth/fitness.body.read
https://www.googleapis.com/auth/fitness.body_temperature.read
https://www.googleapis.com/auth/fitness.blood_pressure.read
https://www.googleapis.com/auth/fitness.blood_glucose.read
https://www.googleapis.com/auth/fitness.oxygen_saturation.read
https://www.googleapis.com/auth/fitness.heart_rate.read
https://www.googleapis.com/auth/fitness.location.read
https://www.googleapis.com/auth/fitness.nutrition.read
https://www.googleapis.com/auth/fitness.reproductive_health.read
https://www.googleapis.com/auth/fitness.sleep.read
```

---

## 🎯 How to Add in Google Cloud Console:

### **Method 1: Via Data Access (Recommended)**

1. **Go to:** https://console.cloud.google.com
2. **Left Sidebar:** Click **"Data Access"**
3. Look for **"Scopes"** section
4. Click **"ADD OR REMOVE SCOPES"** or **"Configure"**
5. In the search box, type: **"fitness"**
6. Select all the `.read` scopes (NOT `.write`)
7. Click **"UPDATE"** or **"SAVE"**

### **Method 2: Via OAuth Consent Screen**

1. **Go to:** https://console.cloud.google.com
2. **APIs & Services** → **OAuth consent screen**
3. Click **"EDIT APP"** or your app name
4. Navigate to **"Scopes"** step
5. Click **"ADD OR REMOVE SCOPES"**
6. Search for "fitness" and add all `.read` scopes
7. Click **"SAVE AND CONTINUE"**

### **Method 3: Manually Add Scopes**

If you can't find them in the list:

1. Scroll to bottom of scopes page
2. Look for **"Manually add scopes"** section
3. Paste all scopes (one per line or comma-separated)
4. Click **"ADD TO TABLE"**
5. Save

---

## ✅ What Each Scope Provides:

| Scope | Data Access |
|-------|-------------|
| `fitness.activity.read` | Steps, distance, calories, workouts |
| `fitness.body.read` | Weight, height, body fat %, BMI |
| `fitness.body_temperature.read` | Body temperature measurements |
| `fitness.blood_pressure.read` | Blood pressure readings |
| `fitness.blood_glucose.read` | Blood sugar levels |
| `fitness.oxygen_saturation.read` | SpO2 levels |
| `fitness.heart_rate.read` | Heart rate data |
| `fitness.location.read` | GPS location during activities |
| `fitness.nutrition.read` | Food intake, macros |
| `fitness.reproductive_health.read` | Menstrual cycle data |
| `fitness.sleep.read` | Sleep duration, quality |

---

## 🔒 Important Notes:

### **Read-Only Access:**
- ✅ All scopes are `.read` only
- ✅ Cannot modify user's fitness data
- ✅ Cannot delete data
- ✅ Privacy-safe

### **User Consent:**
- Users will see what data you're requesting
- Users can deny specific scopes
- Users can revoke access anytime

---

## 🧪 After Adding Scopes:

### **1. Enable Fitness API:**
```
APIs & Services → Library → Search "Fitness API" → Enable
```

### **2. Test the Integration:**
```bash
npm run dev
```

Go to: http://localhost:5173/weightloss/auth

Click: "Continue with Google + Fitness Data"

### **3. Verify Scopes:**
During OAuth, you should see Google asking permission for:
- View your fitness activity data
- View your body measurements
- View your heart rate data
- View your sleep data
- etc.

---

## 📊 Data You'll Get:

### **Activity Data:**
- Daily steps
- Distance walked/run
- Calories burned
- Active minutes
- Exercise sessions

### **Body Metrics:**
- Weight
- Height
- Body fat percentage
- BMI

### **Health Vitals:**
- Heart rate (resting, active, max)
- Blood pressure
- Blood glucose
- Oxygen saturation
- Body temperature

### **Lifestyle:**
- Sleep duration
- Sleep stages (light, deep, REM)
- Nutrition intake
- Location during activities

---

## 🎯 For Weight Loss Program:

### **Key Metrics to Track:**
1. **Daily Activity:** Steps, calories burned
2. **Body Weight:** Track weight loss progress
3. **Heart Rate:** Monitor workout intensity
4. **Sleep:** Ensure adequate recovery
5. **Nutrition:** Track food intake

### **Correlations to Analyze:**
- Activity level vs weight loss
- Sleep quality vs progress
- Heart rate zones vs fat burning
- Calorie deficit vs results

---

## ✅ Checklist:

- [ ] Add all fitness scopes in Google Cloud Console
- [ ] Enable Google Fitness API
- [ ] Save OAuth consent screen
- [ ] Test Google sign-in
- [ ] Verify all scopes are granted
- [ ] Check data access in app

---

## 🚀 Ready!

Once you add these scopes in Google Cloud Console, refresh your app and test!

**All fitness data will be available in read-only mode!** 📊
