# 🔧 Update Supabase Site URL

## 🎯 **Also Need to Update Supabase!**

Besides Google Cloud Console, you also need to update Supabase with your production URL.

---

## ✅ **Step-by-Step:**

### **Step 1: Go to Supabase Dashboard**

1. https://supabase.com/dashboard
2. Select your project: `capvowxxembnycdonghv`
3. Go to **Authentication** → **URL Configuration**

---

### **Step 2: Update Site URL**

Find the **Site URL** field and update it to your Cloudflare Pages URL:

```
https://your-cloudflare-pages-url.pages.dev
```

**Example:**
```
https://weightloss.pages.dev
```

---

### **Step 3: Update Redirect URLs**

Add your production URL to **Redirect URLs**:

```
https://your-cloudflare-pages-url.pages.dev/**
```

The `**` wildcard allows all paths under your domain.

**Also keep localhost for development:**
```
http://localhost:5173/**
http://localhost:3000/**
https://your-cloudflare-pages-url.pages.dev/**
```

---

### **Step 4: Save Changes**

Click **Save** at the bottom.

Changes take effect immediately!

---

## 📋 **Complete Supabase Configuration:**

### **Site URL:**
```
https://your-cloudflare-pages-url.pages.dev
```

### **Redirect URLs:**
```
http://localhost:5173/**
http://localhost:3000/**
https://your-cloudflare-pages-url.pages.dev/**
```

---

## 🎯 **Why This Matters:**

Supabase uses the Site URL to:
- Validate OAuth redirects
- Generate email confirmation links
- Secure your authentication flow

If it's set to `localhost`, all redirects go to localhost!

---

## ✅ **After Updating:**

1. **No waiting needed** (unlike Google, Supabase is instant)
2. **Try signing in again**
3. Should redirect to your production URL! ✅

---

## 🔍 **How to Find Your Cloudflare Pages URL:**

1. Go to Cloudflare Pages dashboard
2. Click your **weightloss** project
3. Look for the URL at the top
4. Should be something like: `https://weightloss-abc.pages.dev`

Or if you have a custom domain:
```
https://your-custom-domain.com
```

---

## 📸 **What It Should Look Like:**

```
Supabase Dashboard → Authentication → URL Configuration

Site URL:
https://weightloss.pages.dev

Redirect URLs:
http://localhost:5173/**
http://localhost:3000/**
https://weightloss.pages.dev/**
```

---

## 🚨 **Common Issues:**

### **Issue 1: Forgot the `/**` Wildcard**

**Wrong:**
```
https://weightloss.pages.dev
```

**Correct:**
```
https://weightloss.pages.dev/**
```

**Why:** The wildcard allows all paths like `/weightloss/dashboard`

---

### **Issue 2: Used HTTP Instead of HTTPS**

**Wrong:**
```
http://weightloss.pages.dev/**
```

**Correct:**
```
https://weightloss.pages.dev/**
```

**Why:** Cloudflare Pages always uses HTTPS!

---

### **Issue 3: Removed Localhost**

**Don't remove:**
```
http://localhost:5173/**
```

**Why:** You still need this for local development!

---

## 🎯 **Summary:**

**Two places to update:**

1. **Google Cloud Console:**
   - Authorized JavaScript origins
   - Authorized redirect URIs

2. **Supabase Dashboard:** ← **This one!**
   - Site URL
   - Redirect URLs

**Both must have your Cloudflare Pages URL!**

---

## 📋 **Quick Checklist:**

- [ ] Found Cloudflare Pages URL
- [ ] Opened Supabase dashboard
- [ ] Updated Site URL
- [ ] Added production URL to Redirect URLs
- [ ] Kept localhost URLs for development
- [ ] Saved changes
- [ ] Tested sign-in
- [ ] Redirects correctly! ✅

---

**After updating both Google and Supabase, OAuth will work perfectly!** 🚀
