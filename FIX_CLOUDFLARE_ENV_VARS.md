# 🔧 Fix Cloudflare Pages Environment Variables

## ❌ **Error You're Seeing:**
```
Missing Supabase environment variables
Uncaught Error: supabaseUrl is required.
```

## 🎯 **The Problem:**
Environment variables were added to Cloudflare Pages, but the build hasn't picked them up yet.

---

## ✅ **Solution: 3 Steps**

### **Step 1: Verify Variables in Cloudflare Dashboard**

1. Go to: https://dash.cloudflare.com
2. Click **Pages** → Select your project
3. Go to **Settings** → **Environment variables**
4. Verify these variables exist for **Production**:

```
VITE_SUPABASE_URL = https://capvowxxembnycdonghv.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Important:** Variable names MUST start with `VITE_` for Vite to expose them!

---

### **Step 2: Trigger a New Deployment**

Environment variables are only loaded during build time. You need to redeploy!

#### **Option A: Push a Small Change (Easiest)**

```bash
cd /Users/pavan/Documents/Weightloss

# Make a small change to trigger rebuild
echo "# Updated $(date)" >> README.md

# Commit and push
git add README.md
git commit -m "Trigger rebuild for env vars"
git push origin calculatorb
```

This will trigger Cloudflare to rebuild with the new environment variables.

#### **Option B: Manual Redeploy in Dashboard**

1. Go to Cloudflare Pages dashboard
2. Click your project
3. Go to **Deployments** tab
4. Click **"Retry deployment"** on the latest deployment

OR

5. Click **"Create deployment"** → **"Production"**
6. Select the branch (`calculatorb`)
7. Click **"Save and Deploy"**

---

### **Step 3: Wait for Build to Complete**

1. Watch the build logs in Cloudflare dashboard
2. Look for: **"Build completed successfully"**
3. Wait 1-2 minutes for deployment
4. Test your site

---

## 🔍 **Verify It's Fixed:**

### **Check in Browser Console:**

1. Open your Cloudflare Pages site
2. Press `F12` (open DevTools)
3. Go to **Console** tab
4. Type:

```javascript
console.log(import.meta.env.VITE_SUPABASE_URL);
```

**Expected:** Should show your Supabase URL
**If undefined:** Variables not loaded, follow steps below

---

## 🚨 **Still Not Working? Try These:**

### **Issue 1: Variables Not Showing in Dashboard**

**Fix:** Re-add them manually:

1. Go to Cloudflare Pages → Your project → Settings → Environment variables
2. Click **"Add variable"**
3. Add for **Production** environment:

```
Variable name: VITE_SUPABASE_URL
Value: https://capvowxxembnycdonghv.supabase.co
```

4. Click **"Add variable"** again:

```
Variable name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhcHZvd3h4ZW1ibnljZG9uZ2h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNzc1MDksImV4cCI6MjA4MDg1MzUwOX0.pD4R0VptLjGkvFEo_w7D-MSWnXtu6S1wNzNxm8Ki78w
```

5. Click **"Save"**
6. Redeploy (see Step 2 above)

---

### **Issue 2: Wrong Environment Selected**

Cloudflare has **Production** and **Preview** environments.

**Fix:** Make sure you added variables to **Production**, not just Preview!

1. In Environment variables section
2. Look for dropdown that says **"Production"** or **"Preview"**
3. Select **"Production"**
4. Add variables there
5. Redeploy

---

### **Issue 3: Variable Names Don't Have VITE_ Prefix**

Vite only exposes variables that start with `VITE_`.

**Wrong:**
```
SUPABASE_URL = https://...
SUPABASE_ANON_KEY = eyJ...
```

**Correct:**
```
VITE_SUPABASE_URL = https://...
VITE_SUPABASE_ANON_KEY = eyJ...
```

**Fix:** Delete old variables, add new ones with `VITE_` prefix, redeploy.

---

### **Issue 4: Build Settings Wrong**

**Check Build Configuration:**

1. Go to Cloudflare Pages → Your project → Settings → Builds & deployments
2. Verify:

```
Build command: npm run build
Build output directory: dist
Root directory: (leave empty or /)
Node version: 18 or higher
```

3. If wrong, update and click **"Save"**
4. Redeploy

---

### **Issue 5: .env File in Git (Security Risk!)**

If you accidentally committed `.env` file:

**Fix:**

```bash
# Remove .env from git
git rm --cached .env
git commit -m "Remove .env from git"
git push origin calculatorb

# Make sure .gitignore has .env
echo ".env" >> .gitignore
git add .gitignore
git commit -m "Add .env to gitignore"
git push origin calculatorb
```

---

## 📋 **Quick Checklist:**

- [ ] Variables added to Cloudflare Pages dashboard
- [ ] Variable names start with `VITE_`
- [ ] Variables added to **Production** environment
- [ ] Triggered new deployment (push or manual)
- [ ] Build completed successfully
- [ ] Waited 1-2 minutes for deployment
- [ ] Tested site in browser
- [ ] No errors in console

---

## 🎯 **Expected Result:**

After following these steps, your site should:

✅ Load without errors
✅ Show login page
✅ Connect to Supabase
✅ No "supabaseUrl is required" error

---

## 💡 **Pro Tip: Test Locally First**

Before deploying, test locally:

```bash
# Create .env file (if not exists)
cat > .env << EOF
VITE_SUPABASE_URL=https://capvowxxembnycdonghv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhcHZvd3h4ZW1ibnljZG9uZ2h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNzc1MDksImV4cCI6MjA4MDg1MzUwOX0.pD4R0VptLjGkvFEo_w7D-MSWnXtu6S1wNzNxm8Ki78w
EOF

# Run locally
npm run dev
```

If it works locally, it should work on Cloudflare after proper setup.

---

## 🚀 **Quick Fix Command:**

Run this to trigger a rebuild:

```bash
cd /Users/pavan/Documents/Weightloss
echo "# Rebuild $(date)" >> README.md
git add README.md
git commit -m "Trigger rebuild for env vars"
git push origin calculatorb
```

Then wait 2-3 minutes and check your site!

---

## 📞 **Still Stuck?**

If none of this works, share:
1. Screenshot of Cloudflare environment variables page
2. Build logs from Cloudflare (last 50 lines)
3. Browser console errors

I'll help debug further!
