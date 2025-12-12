# 🔧 Fix Google OAuth Redirect URL

## ❌ **Problem:**

After Google sign-in, you're being redirected to:
```
localhost:3000/#access_token=...
```

Instead of your actual Cloudflare Pages URL!

---

## 🎯 **Root Cause:**

Google Cloud Console has `http://localhost:3000` configured as the redirect URL, but you need your production URL.

---

## ✅ **Solution: Update Google Cloud Console**

### **Step 1: Get Your Cloudflare Pages URL**

Your Cloudflare Pages URL is probably something like:
```
https://weightloss.pages.dev
```

Or if you have a custom domain:
```
https://your-domain.com
```

**Find it:**
1. Go to Cloudflare Pages dashboard
2. Click your project
3. Copy the URL shown at the top

---

### **Step 2: Update Google Cloud Console**

1. Go to: https://console.cloud.google.com
2. Select your project
3. Go to **APIs & Services** → **Credentials**
4. Find your OAuth 2.0 Client ID (the one you're using)
5. Click the **pencil icon** to edit

---

### **Step 3: Add Authorized Redirect URIs**

In the **Authorized redirect URIs** section, add:

```
https://capvowxxembnycdonghv.supabase.co/auth/v1/callback
```

**Important:** This is your Supabase callback URL, NOT your app URL!

**Format:**
```
https://[YOUR_SUPABASE_PROJECT_REF].supabase.co/auth/v1/callback
```

Your Supabase project ref: `capvowxxembnycdonghv`

---

### **Step 4: Add Authorized JavaScript Origins**

In the **Authorized JavaScript origins** section, add:

```
https://your-cloudflare-pages-url.pages.dev
```

**AND keep localhost for development:**
```
http://localhost:5173
http://localhost:3000
```

---

### **Step 5: Save Changes**

Click **Save** at the bottom.

**Note:** Changes may take 5-10 minutes to propagate.

---

## 📋 **Complete Configuration:**

Your Google OAuth Client should have:

### **Authorized JavaScript origins:**
```
http://localhost:5173
http://localhost:3000
https://your-cloudflare-pages-url.pages.dev
https://capvowxxembnycdonghv.supabase.co
```

### **Authorized redirect URIs:**
```
http://localhost:5173/weightloss/auth
http://localhost:3000/weightloss/auth
https://capvowxxembnycdonghv.supabase.co/auth/v1/callback
```

---

## 🔍 **Why This Happens:**

1. **Development:** You tested locally at `localhost:3000`
2. **Google remembers:** Google OAuth uses the origin where you initiated the request
3. **Production:** Now you're on Cloudflare Pages, but Google still redirects to localhost

**Fix:** Add production URLs to Google Cloud Console!

---

## 🚨 **Common Mistakes:**

### **Mistake 1: Wrong Callback URL**

**Wrong:**
```
https://your-app.pages.dev/auth/callback
```

**Correct:**
```
https://capvowxxembnycdonghv.supabase.co/auth/v1/callback
```

**Why:** Supabase handles the OAuth callback, not your app!

---

### **Mistake 2: Missing HTTPS**

**Wrong:**
```
http://your-app.pages.dev
```

**Correct:**
```
https://your-app.pages.dev
```

**Why:** Production must use HTTPS!

---

### **Mistake 3: Removing Localhost**

**Don't remove:**
```
http://localhost:5173
```

**Why:** You still need this for local development!

---

## 🎯 **Quick Fix (Copy-Paste):**

### **1. Authorized JavaScript Origins:**

```
http://localhost:5173
http://localhost:3000
https://capvowxxembnycdonghv.supabase.co
https://[YOUR-CLOUDFLARE-URL].pages.dev
```

Replace `[YOUR-CLOUDFLARE-URL]` with your actual URL!

### **2. Authorized Redirect URIs:**

```
http://localhost:5173/weightloss/auth
http://localhost:3000/weightloss/auth
https://capvowxxembnycdonghv.supabase.co/auth/v1/callback
```

---

## 🔍 **How to Find Your URLs:**

### **Supabase Project URL:**
1. Go to Supabase dashboard
2. Settings → API
3. Copy "Project URL"
4. Should be: `https://capvowxxembnycdonghv.supabase.co`

### **Cloudflare Pages URL:**
1. Go to Cloudflare Pages dashboard
2. Click your project
3. Copy the URL at the top
4. Should be: `https://weightloss.pages.dev` or similar

---

## ✅ **After Updating:**

1. **Wait 5-10 minutes** for Google to propagate changes
2. **Clear browser cache** (or use incognito)
3. **Try signing in again**
4. Should redirect to your Cloudflare Pages URL! ✅

---

## 🧪 **Test It:**

1. Go to your Cloudflare Pages URL
2. Click "Continue with Google"
3. After allowing permissions, check the URL
4. Should be: `https://your-app.pages.dev/weightloss/dashboard`

**Not:** `http://localhost:3000/...`

---

## 🚨 **Still Redirecting to Localhost?**

### **Check 1: Browser Cache**

Clear cache or use incognito mode.

### **Check 2: Google OAuth Consent Screen**

1. Google Cloud Console → OAuth consent screen
2. Make sure it's published (not in testing mode)
3. If in testing, add your email to test users

### **Check 3: Supabase Configuration**

1. Supabase dashboard → Authentication → Providers
2. Click Google provider
3. Check "Site URL" is set to your Cloudflare Pages URL

### **Check 4: Wait Longer**

Google changes can take up to 30 minutes to propagate.

---

## 📸 **Screenshots to Take:**

If still not working, share screenshots of:

1. **Google Cloud Console** → Credentials → Your OAuth Client
   - Authorized JavaScript origins
   - Authorized redirect URIs

2. **Supabase Dashboard** → Authentication → Providers → Google
   - Client ID
   - Site URL

3. **Browser URL** after sign-in attempt

---

## 💡 **Pro Tip: Use Environment-Aware Redirect**

Your code already does this correctly:

```javascript
redirectTo: `${window.location.origin}/weightloss/dashboard`
```

This automatically uses:
- `http://localhost:5173/weightloss/dashboard` (local)
- `https://your-app.pages.dev/weightloss/dashboard` (production)

**Perfect!** ✅

---

## 🎯 **Summary:**

**Problem:** Google redirects to localhost
**Cause:** Google Cloud Console only has localhost configured
**Fix:** Add Cloudflare Pages URL to Google OAuth settings

**Steps:**
1. Google Cloud Console → Credentials
2. Add Supabase callback URL to redirect URIs
3. Add Cloudflare Pages URL to JavaScript origins
4. Save and wait 5-10 minutes
5. Test again!

---

## 📋 **Checklist:**

- [ ] Found your Cloudflare Pages URL
- [ ] Opened Google Cloud Console
- [ ] Added Supabase callback URL to redirect URIs
- [ ] Added Cloudflare Pages URL to JavaScript origins
- [ ] Saved changes
- [ ] Waited 5-10 minutes
- [ ] Cleared browser cache
- [ ] Tested sign-in
- [ ] Redirects to correct URL! ✅

---

**After this fix, Google sign-in will redirect to your production URL!** 🚀
