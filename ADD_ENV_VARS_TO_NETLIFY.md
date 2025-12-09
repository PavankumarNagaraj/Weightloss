# 🔧 Add Environment Variables to Netlify

## ⚠️ **Your Site is Missing Environment Variables!**

The error `supabaseUrl is required` means your deployed site doesn't have the Supabase configuration.

---

## 🚀 **Quick Fix (2 minutes):**

### **Option 1: Via Netlify Dashboard (Recommended)**

1. **Go to your Netlify site:**
   - Go to https://app.netlify.com
   - Find your site (probably named something like `afterburn-weightloss`)

2. **Navigate to Environment Variables:**
   - Click on your site
   - Go to **Site configuration** → **Environment variables**
   - Or go to: **Deploy settings** → **Environment**

3. **Add these variables:**

Click **"Add a variable"** and add each one:

| Key | Value |
|-----|-------|
| `VITE_SUPABASE_URL` | `https://capvowxxembnycdonghv.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhcHZvd3h4ZW1ibnljZG9uZ2h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNzc1MDksImV4cCI6MjA4MDg1MzUwOX0.pD4R0VptLjGkvFEo_w7D-MSWnXtu6S1wNzNxm8Ki78w` |

4. **Redeploy:**
   - Go to **Deploys** tab
   - Click **"Trigger deploy"** → **"Clear cache and deploy site"**

5. **Wait 1-2 minutes** for the build to complete

6. **Refresh your site** - it should work now! ✅

---

### **Option 2: Via Netlify CLI (Alternative)**

If you have Netlify CLI installed:

```bash
# Install Netlify CLI (if not installed)
npm install -g netlify-cli

# Login to Netlify
netlify login

# Link to your site
netlify link

# Set environment variables
netlify env:set VITE_SUPABASE_URL "https://capvowxxembnycdonghv.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhcHZvd3h4ZW1ibnljZG9uZ2h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNzc1MDksImV4cCI6MjA4MDg1MzUwOX0.pD4R0VptLjGkvFEo_w7D-MSWnXtu6S1wNzNxm8Ki78w"

# Trigger a new deploy
netlify deploy --prod
```

---

### **Option 3: Add to netlify.toml (Not Recommended for Secrets)**

⚠️ **Warning:** This exposes your keys in Git. Only use for non-sensitive values.

Edit `netlify.toml`:
```toml
[build.environment]
  NODE_VERSION = "18"
  VITE_SUPABASE_URL = "https://capvowxxembnycdonghv.supabase.co"
  # Don't put the anon key here - use Netlify dashboard instead
```

---

## 🔍 **Verify It's Working:**

After redeploying:

1. Open your site
2. Open browser console (F12)
3. You should NOT see "Missing Supabase environment variables"
4. The site should load normally

---

## 📋 **What These Variables Do:**

- **`VITE_SUPABASE_URL`**: Your Supabase project URL
- **`VITE_SUPABASE_ANON_KEY`**: Public anonymous key (safe to expose)

These are needed for:
- User authentication
- Database access
- Google Fit data storage
- All Supabase features

---

## ❓ **Troubleshooting:**

### **Still getting the error?**
1. Make sure you clicked "Trigger deploy" after adding variables
2. Wait for the build to complete (check Deploys tab)
3. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
4. Clear browser cache

### **Can't find environment variables section?**
- Look for: Site settings → Build & deploy → Environment
- Or: Site configuration → Environment variables

### **Variables not showing up?**
- Make sure you're on the correct site
- Check you saved the variables
- Verify the deploy finished successfully

---

## 🎯 **Next Steps:**

Once environment variables are added:
1. ✅ Site will load without errors
2. ✅ Users can sign in with Google
3. ✅ Google Fit data will sync
4. ✅ All features will work

---

**Go add those environment variables now!** 🚀
