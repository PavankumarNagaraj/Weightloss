# 🔧 Cloudflare Environment Variables - Debug Guide

## ❌ **Still Getting Error After Merge?**

The environment variables are set in Cloudflare, but the build isn't picking them up.

---

## 🎯 **Root Cause:**

Cloudflare Pages has **TWO** separate environments:
1. **Production** (for production branch deployments)
2. **Preview** (for all other branches)

You need to add variables to **BOTH** environments!

---

## ✅ **Fix: Add Variables to BOTH Environments**

### **Step 1: Go to Cloudflare Dashboard**

1. https://dash.cloudflare.com
2. Click **Pages**
3. Select **weightloss** project
4. Go to **Settings** → **Environment variables**

---

### **Step 2: Add Variables to Production**

1. Make sure you're in the **Production** tab
2. Click **Add variable**
3. Add:

```
Variable name: VITE_SUPABASE_URL
Value: https://capvowxxembnycdonghv.supabase.co
Environment: Production
```

4. Click **Add variable** again
5. Add:

```
Variable name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhcHZvd3h4ZW1ibnljZG9uZ2h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNzc1MDksImV4cCI6MjA4MDg1MzUwOX0.pD4R0VptLjGkvFEo_w7D-MSWnXtu6S1wNzNxm8Ki78w
Environment: Production
```

6. Click **Save**

---

### **Step 3: Add Variables to Preview (Important!)**

1. Click the **Preview** tab
2. Click **Add variable**
3. Add the SAME variables:

```
Variable name: VITE_SUPABASE_URL
Value: https://capvowxxembnycdonghv.supabase.co
Environment: Preview
```

4. Click **Add variable** again
5. Add:

```
Variable name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhcHZvd3h4ZW1ibnljZG9uZ2h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNzc1MDksImV4cCI6MjA4MDg1MzUwOX0.pD4R0VptLjGkvFEo_w7D-MSWnXtu6S1wNzNxm8Ki78w
Environment: Preview
```

6. Click **Save**

---

### **Step 4: Verify Variables Are Set**

You should see something like this:

```
Production Environment:
✅ VITE_SUPABASE_URL = https://capvowxxembnycdonghv.supabase.co
✅ VITE_SUPABASE_ANON_KEY = [encrypted]

Preview Environment:
✅ VITE_SUPABASE_URL = https://capvowxxembnycdonghv.supabase.co
✅ VITE_SUPABASE_ANON_KEY = [encrypted]
```

---

### **Step 5: Trigger New Deployment**

#### **Option A: Via Dashboard (Easiest)**

1. Go to **Deployments** tab
2. Find the latest deployment
3. Click the **"..."** menu
4. Click **"Retry deployment"**

#### **Option B: Create New Deployment**

1. Go to **Deployments** tab
2. Click **"Create deployment"**
3. Select **Production** branch: `main`
4. Click **"Save and Deploy"**

---

## 🔍 **Check Build Logs**

After triggering deployment:

1. Go to **Deployments** tab
2. Click on the running deployment
3. Click **"View build logs"**
4. Look for:

```
✅ Build environment variables:
   VITE_SUPABASE_URL=https://capvowxxembnycdonghv.supabase.co
   VITE_SUPABASE_ANON_KEY=[REDACTED]
```

If you DON'T see these variables in the build logs, they're not set correctly!

---

## 🚨 **Common Issues:**

### **Issue 1: Variables Only in Production, Not Preview**

**Symptom:** Works on production URL, fails on preview URLs

**Fix:** Add variables to BOTH Production AND Preview environments

---

### **Issue 2: Variable Names Missing VITE_ Prefix**

**Wrong:**
```
SUPABASE_URL = https://...
```

**Correct:**
```
VITE_SUPABASE_URL = https://...
```

Vite only exposes variables with `VITE_` prefix to the browser!

---

### **Issue 3: Variables Are "Encrypted" Type**

If you set them as "Secret" type, they might not be exposed to Vite.

**Fix:**
1. Delete the encrypted variables
2. Add them again as **"Plaintext"** type (not "Secret")
3. Redeploy

---

### **Issue 4: Build Cache**

Old build cache might be interfering.

**Fix:**
1. Go to Settings → Builds & deployments
2. Scroll to **Build cache**
3. Click **"Clear cache"**
4. Trigger new deployment

---

## 🎯 **Quick Test: Check If Variables Are Loaded**

After deployment completes:

1. Open your Cloudflare Pages URL
2. Open browser DevTools (F12)
3. Go to **Console** tab
4. Type:

```javascript
console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'exists' : 'missing');
```

**Expected Output:**
```
URL: https://capvowxxembnycdonghv.supabase.co
Key: exists
```

**If you see:**
```
URL: undefined
Key: missing
```

Then variables are NOT being loaded during build!

---

## 💡 **Alternative: Use wrangler.toml (Advanced)**

If dashboard method doesn't work, create a `wrangler.toml` file:

```toml
name = "weightloss"
compatibility_date = "2025-11-30"

[env.production.vars]
VITE_SUPABASE_URL = "https://capvowxxembnycdonghv.supabase.co"
VITE_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhcHZvd3h4ZW1ibnljZG9uZ2h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNzc1MDksImV4cCI6MjA4MDg1MzUwOX0.pD4R0VptLjGkvFEo_w7D-MSWnXtu6S1wNzNxm8Ki78w"
```

**Note:** This exposes your keys in git, so only use if dashboard method fails.

---

## 🔍 **Screenshot Checklist**

To help debug, take screenshots of:

1. **Environment Variables page** showing both Production and Preview tabs
2. **Build logs** showing environment variables section
3. **Browser console** showing the test commands above

---

## 📋 **Final Checklist:**

- [ ] Variables added to **Production** environment
- [ ] Variables added to **Preview** environment
- [ ] Variable names start with `VITE_`
- [ ] Variables are **Plaintext** type (not Secret)
- [ ] Triggered new deployment
- [ ] Build completed successfully
- [ ] Checked build logs for variables
- [ ] Tested in browser console
- [ ] No errors in browser console

---

## 🎯 **If Still Not Working:**

### **Nuclear Option: Delete and Re-add Project**

1. Go to Cloudflare Pages
2. Delete the **weightloss** project
3. Create new project
4. Connect to GitHub repo
5. Set build settings:
   - Build command: `npm run build`
   - Build output: `dist`
   - Root directory: `/`
6. Add environment variables (Production AND Preview)
7. Deploy

---

## 📞 **Need Help?**

Share these details:

1. Screenshot of Environment Variables page (both tabs)
2. Last 50 lines of build logs
3. Browser console output after running test commands
4. Your Cloudflare Pages URL

I'll help debug further!
