# 🔧 Create Google Fit Data Table in Supabase

## ⚠️ **Required Step!**

The `google_fit_data` table doesn't exist yet in your Supabase database. You need to create it to store cached fitness data.

---

## 📋 **Quick Steps:**

### **1. Go to Supabase SQL Editor**
https://capvowxxembnycdonghv.supabase.co/project/_/sql

### **2. Click "New Query"**

### **3. Copy & Paste This SQL:**

```sql
-- Create google_fit_data table
CREATE TABLE IF NOT EXISTS google_fit_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Date
  date DATE NOT NULL,
  
  -- Activity data
  steps INTEGER,
  distance DECIMAL(10,2),
  calories_burned INTEGER,
  active_minutes INTEGER,
  
  -- Heart rate
  heart_rate_avg INTEGER,
  heart_rate_min INTEGER,
  heart_rate_max INTEGER,
  
  -- Sleep data
  sleep_duration INTEGER,
  
  -- Raw data
  raw_data JSONB,
  
  -- Metadata
  synced_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_google_fit_user_id ON google_fit_data(user_id);
CREATE INDEX IF NOT EXISTS idx_google_fit_date ON google_fit_data(date);

-- Enable Row Level Security
ALTER TABLE google_fit_data ENABLE ROW LEVEL SECURITY;

-- Users can view their own data
CREATE POLICY "Users can view own Google Fit data" ON google_fit_data
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own data
CREATE POLICY "Users can insert own Google Fit data" ON google_fit_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own data
CREATE POLICY "Users can update own Google Fit data" ON google_fit_data
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own data
CREATE POLICY "Users can delete own Google Fit data" ON google_fit_data
  FOR DELETE USING (auth.uid() = user_id);
```

### **4. Click "RUN" (or press Ctrl+Enter)**

### **5. You should see:**
```
Success. No rows returned
```

---

## ✅ **That's It!**

The table is now created. Refresh your app and the Google Fit widget should work!

---

## 🎯 **What This Table Stores:**

| Column | Description |
|--------|-------------|
| `user_id` | User who owns the data |
| `date` | Date of the fitness data |
| `steps` | Step count |
| `distance` | Distance in meters |
| `calories_burned` | Calories burned |
| `active_minutes` | Active minutes |
| `heart_rate_avg/min/max` | Heart rate data |
| `sleep_duration` | Sleep in minutes |
| `synced_at` | When data was synced |

---

## 🔒 **Security (RLS):**

- ✅ Users can only see their own data
- ✅ Users can only insert/update/delete their own data
- ✅ Row Level Security enabled
- ✅ Automatic cleanup when user is deleted

---

## 📊 **Benefits:**

1. **Fast Loads:** Data cached in database
2. **Cost Savings:** Fewer Google API calls
3. **Historical Data:** All past data stored
4. **Offline Access:** Works even if Google Fit is down
5. **Analytics Ready:** Query data for insights

---

## 🧪 **Test It:**

After creating the table:

1. Refresh your app
2. Go to Weight Loss → Auth → Sign in with Google
3. The Google Fit widget should load
4. Click "Sync 30 Days" to import historical data
5. Data will be cached in the `google_fit_data` table

---

## 📁 **Alternative:**

If you prefer, you can also run the full schema:
```bash
# In Supabase SQL Editor, run:
database/schema.sql
```

But the quick SQL above is all you need for Google Fit!

---

## ❓ **Troubleshooting:**

### **Error: "relation 'auth.users' does not exist"**
Change `auth.users` to `public.users` if you have a custom users table.

### **Error: "permission denied"**
Make sure you're running as the database owner (should be automatic in Supabase SQL Editor).

### **Still getting "table not found"**
1. Check the table was created: Go to Table Editor in Supabase
2. Look for `google_fit_data` table
3. If not there, try running the SQL again

---

**Once the table is created, your Google Fit integration will work perfectly!** 🎉
