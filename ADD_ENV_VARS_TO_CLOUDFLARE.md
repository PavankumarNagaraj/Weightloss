# 🔧 Add Environment Variables to Cloudflare Pages

## ⚠️ **Your Site is Missing Environment Variables!**

The error `supabaseUrl is required` means your deployed site doesn't have the Supabase configuration.

---

## 🚀 **Quick Fix (2 minutes):**

### **Step 1: Go to Cloudflare Dashboard**
https://dash.cloudflare.com

### **Step 2: Navigate to Pages**
1. Click on **Workers & Pages** in the left sidebar
2. Find your site (probably named `weightloss` or `afterburn`)
3. Click on your site

### **Step 3: Go to Settings**
1. Click on **Settings** tab
2. Scroll down to **Environment variables** section
3. Or click **Environment variables** in the left menu

### **Step 4: Add Variables**

Click **"Add variable"** for **Production** environment and add:

#### **Variable 1:**
- **Variable name:** `VITE_SUPABASE_URL`
- **Value:** `https://capvowxxembnycdonghv.supabase.co`
- Click **Save**

#### **Variable 2:**
- **Variable name:** `VITE_SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhcHZvd3h4ZW1ibnljZG9uZ2h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNzc1MDksImV4cCI6MjA4MDg1MzUwOX0.pD4R0VptLjGkvFEo_w7D-MSWnXtu6S1wNzNxm8Ki78w`
- Click **Save**

### **Step 5: Redeploy**

**Option A: Automatic (Recommended)**
1. Go to **Deployments** tab
2. Click **"Retry deployment"** on the latest deployment
3. Or click **"Create deployment"**

**Option B: Push to Git**
```bash
# Make a small change and push
git commit --allow-empty -m "Trigger redeploy with env vars"
git push origin calculatorb
```

### **Step 6: Wait & Test**
1. Wait 1-2 minutes for build to complete
2. Check **Deployments** tab for "Success"
3. Refresh your site - it should work now! ✅

---

## 📸 **Visual Guide:**

```
Cloudflare Dashboard
  └─ Workers & Pages
      └─ Your Site
          └─ Settings
              └─ Environment variables
                  └─ Production
                      └─ Add variable
```

---

## 🔍 **Verify It's Working:**

After redeploying:

1. Open your site
2. Open browser console (F12)
3. You should NOT see "Missing Supabase environment variables"
4. The site should load normally

---

## 📋 **Environment Variables to Add:**

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://capvowxxembnycdonghv.supabase.co` | Production |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhcHZvd3h4ZW1ibnljZG9uZ2h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNzc1MDksImV4cCI6MjA4MDg1MzUwOX0.pD4R0VptLjGkvFEo_w7D-MSWnXtu6S1wNzNxm8Ki78w` | Production |

**Note:** Also add to **Preview** environment if you want them to work on preview deployments.

---

## 🎯 **What These Variables Do:**

- **`VITE_SUPABASE_URL`**: Your Supabase project URL
- **`VITE_SUPABASE_ANON_KEY`**: Public anonymous key (safe to expose)

These are needed for:
- ✅ User authentication
- ✅ Database access
- ✅ Google Fit data storage
- ✅ All Supabase features

---

## ⚙️ **Alternative: Using Wrangler CLI**

If you have Wrangler installed:

```bash
# Install Wrangler (if not installed)
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Set environment variables
wrangler pages project create weightloss # if needed

# Add environment variables (requires manual dashboard for now)
# Cloudflare Pages doesn't support CLI env var setting yet
# Use the dashboard method above
```

---

## ❓ **Troubleshooting:**

### **Can't find Environment Variables section?**
- Make sure you're in **Workers & Pages** (not Websites)
- Click on your Pages project
- Look for **Settings** → **Environment variables**

### **Variables not taking effect?**
1. Make sure you saved each variable
2. Redeploy the site (Deployments → Retry deployment)
3. Wait for build to complete
4. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

### **Still getting the error?**
1. Check you added variables to **Production** environment
2. Verify the deployment succeeded (green checkmark)
3. Check browser console for other errors
4. Clear browser cache completely

### **Build failing?**
- Check **Deployments** → **View build log**
- Make sure build command is: `npm run build`
- Output directory should be: `dist`

---

## 🔧 **Cloudflare Pages Build Settings:**

Make sure these are configured:

| Setting | Value |
|---------|-------|
| **Framework preset** | Vite |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Root directory** | `/` |
| **Node version** | 18 or higher |

---

## 🎯 **Next Steps:**

Once environment variables are added:
1. ✅ Site will load without errors
2. ✅ Users can sign in with Google
3. ✅ Google Fit data will sync
4. ✅ All features will work

---

## 📝 **Quick Checklist:**

- [ ] Go to Cloudflare Dashboard
- [ ] Navigate to Workers & Pages → Your Site
- [ ] Click Settings → Environment variables
- [ ] Add `VITE_SUPABASE_URL` to Production
- [ ] Add `VITE_SUPABASE_ANON_KEY` to Production
- [ ] Save both variables
- [ ] Go to Deployments → Retry deployment
- [ ] Wait for build to complete
- [ ] Refresh your site and test

---

**Go add those environment variables to Cloudflare Pages now!** 🚀
