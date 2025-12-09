# 🚀 Phase 1 Setup Guide

Complete guide to set up backend, database, authentication, and cloud storage.

---

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn
- Git
- Code editor (VS Code recommended)

---

## 1️⃣ Supabase Setup

### Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub
4. Click "New Project"
5. Fill in details:
   - **Name:** weightloss-app
   - **Database Password:** (save this securely)
   - **Region:** Choose closest to you
6. Click "Create new project"
7. Wait 2-3 minutes for setup

### Step 2: Get API Keys

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_KEY` (⚠️ Keep secret!)

### Step 3: Run Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy entire content from `/database/schema.sql`
4. Paste and click "Run"
5. Wait for success message

### Step 4: Configure Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email templates (optional):
   - Go to **Authentication** → **Email Templates**
   - Customize welcome email, password reset, etc.

### Step 5: Configure Storage (Optional)

1. Go to **Storage**
2. Create bucket: `user-photos` (if not using Cloudinary exclusively)
3. Set public access policies

---

## 2️⃣ Cloudinary Setup

### Step 1: Create Account

1. Go to [https://cloudinary.com](https://cloudinary.com)
2. Click "Sign Up Free"
3. Fill in details and verify email

### Step 2: Get Credentials

1. Go to Dashboard
2. Copy these values:
   - **Cloud Name** → `CLOUDINARY_CLOUD_NAME`
   - **API Key** → `CLOUDINARY_API_KEY`
   - **API Secret** → `CLOUDINARY_API_SECRET`

### Step 3: Configure Upload Preset (Optional)

1. Go to **Settings** → **Upload**
2. Scroll to "Upload presets"
3. Click "Add upload preset"
4. Set:
   - **Preset name:** weightloss-photos
   - **Signing Mode:** Signed
   - **Folder:** weightloss/users
5. Save

---

## 3️⃣ SendGrid Setup

### Step 1: Create Account

1. Go to [https://sendgrid.com](https://sendgrid.com)
2. Sign up for free account
3. Verify email

### Step 2: Create API Key

1. Go to **Settings** → **API Keys**
2. Click "Create API Key"
3. Name: "Weight Loss App"
4. Permissions: "Full Access"
5. Copy API key → `SENDGRID_API_KEY`

### Step 3: Verify Sender Email

1. Go to **Settings** → **Sender Authentication**
2. Click "Verify a Single Sender"
3. Fill in your email details
4. Verify email
5. Use this as `SENDGRID_FROM_EMAIL`

---

## 4️⃣ Twilio Setup (WhatsApp)

### Step 1: Create Account

1. Go to [https://twilio.com](https://twilio.com)
2. Sign up for free trial
3. Verify phone number

### Step 2: Get Credentials

1. Go to Dashboard
2. Copy:
   - **Account SID** → `TWILIO_ACCOUNT_SID`
   - **Auth Token** → `TWILIO_AUTH_TOKEN`

### Step 3: Set Up WhatsApp Sandbox

1. Go to **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Follow instructions to join sandbox
3. Copy sandbox number → `TWILIO_WHATSAPP_FROM`
4. Format: `whatsapp:+14155238886`

---

## 5️⃣ Google OAuth Setup (for Google Fit)

### Step 1: Create Google Cloud Project

1. Go to [https://console.cloud.google.com](https://console.cloud.google.com)
2. Click "New Project"
3. Name: "Weight Loss App"
4. Click "Create"

### Step 2: Enable APIs

1. Go to **APIs & Services** → **Library**
2. Search and enable:
   - Google Fitness API
   - Google OAuth2 API

### Step 3: Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click "Create Credentials" → "OAuth client ID"
3. Configure consent screen first (if prompted):
   - User Type: External
   - App name: Weight Loss App
   - Support email: your email
   - Scopes: Add Fitness API scopes
4. Create OAuth client ID:
   - Application type: Web application
   - Name: Weight Loss Backend
   - Authorized redirect URIs:
     - `http://localhost:5000/api/auth/google-fit/callback`
     - `https://your-domain.com/api/auth/google-fit/callback`
5. Copy:
   - **Client ID** → `GOOGLE_CLIENT_ID`
   - **Client Secret** → `GOOGLE_CLIENT_SECRET`

---

## 6️⃣ Backend Setup

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and fill in all values from above steps.

### Step 3: Test Backend

```bash
npm run dev
```

You should see:
```
╔═══════════════════════════════════════╗
║   Weight Loss Backend API Server     ║
╠═══════════════════════════════════════╣
║   Environment: development
║   Port: 5000
║   URL: http://localhost:5000
╚═══════════════════════════════════════╝
```

### Step 4: Test API

Open browser or Postman:
```
GET http://localhost:5000/health
```

Should return:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-12-09T..."
}
```

---

## 7️⃣ Frontend Setup

### Step 1: Install Supabase Client

```bash
cd ..  # Back to root
npm install @supabase/supabase-js
```

### Step 2: Configure Environment

```bash
cp .env.frontend.example .env
```

Edit `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:5000/api
```

### Step 3: Test Frontend

```bash
npm run dev
```

Open: `http://localhost:5173`

---

## 8️⃣ Testing the Integration

### Test 1: Sign Up

1. Go to signup page
2. Create new account
3. Check Supabase dashboard → Authentication → Users
4. User should appear

### Test 2: Upload Photo

1. Log in
2. Go to photo upload
3. Upload image
4. Check:
   - Cloudinary dashboard → Media Library
   - Supabase dashboard → Table Editor → photos

### Test 3: Google Fit

1. Go to settings
2. Click "Connect Google Fit"
3. Authorize access
4. Check Supabase → users table → google_fit_connected = true

---

## 9️⃣ Deployment

### Backend Deployment (Render)

1. Go to [https://render.com](https://render.com)
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your repository
5. Configure:
   - **Name:** weightloss-backend
   - **Environment:** Node
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
   - **Plan:** Free
6. Add environment variables (all from .env)
7. Click "Create Web Service"
8. Wait for deployment
9. Copy URL → Update `VITE_API_URL` in frontend

### Frontend Deployment (Cloudflare Pages)

1. Go to [https://dash.cloudflare.com](https://dash.cloudflare.com)
2. Sign up/login
3. Go to **Pages**
4. Click "Create a project"
5. Connect GitHub repository
6. Configure:
   - **Project name:** weightloss-app
   - **Production branch:** main
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
7. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_URL` (your Render backend URL)
8. Click "Save and Deploy"
9. Wait for deployment
10. Get URL → Update in Google OAuth redirect URIs

---

## 🔐 Security Checklist

- [ ] Never commit `.env` files
- [ ] Keep `SUPABASE_SERVICE_KEY` secret
- [ ] Use HTTPS in production
- [ ] Enable Row Level Security in Supabase
- [ ] Set up CORS properly
- [ ] Use rate limiting
- [ ] Validate all inputs
- [ ] Sanitize user data

---

## 📚 Next Steps

After Phase 1 is complete:

1. **Test all features thoroughly**
2. **Set up monitoring** (Sentry)
3. **Configure email templates** (SendGrid)
4. **Create WhatsApp message templates**
5. **Move to Phase 2** (Notifications + Payments)

---

## 🆘 Troubleshooting

### Backend won't start
- Check all environment variables are set
- Verify Supabase credentials
- Check port 5000 is not in use

### Photos won't upload
- Verify Cloudinary credentials
- Check file size < 10MB
- Ensure multer is configured correctly

### Authentication fails
- Verify Supabase URL and keys
- Check CORS settings
- Ensure user exists in database

### Google Fit won't connect
- Verify OAuth credentials
- Check redirect URI matches exactly
- Ensure Fitness API is enabled

---

## 📞 Support

If you encounter issues:

1. Check console logs (browser + backend)
2. Verify all environment variables
3. Test each service independently
4. Check Supabase logs
5. Review API responses

---

## ✅ Completion Checklist

- [ ] Supabase project created
- [ ] Database schema executed
- [ ] Cloudinary account set up
- [ ] SendGrid configured
- [ ] Twilio WhatsApp sandbox active
- [ ] Google OAuth credentials created
- [ ] Backend running locally
- [ ] Frontend connected to backend
- [ ] Test user created
- [ ] Photo upload working
- [ ] Google Fit connection working
- [ ] Backend deployed to Render
- [ ] Frontend deployed to Cloudflare Pages

---

**🎉 Congratulations! Phase 1 is complete!**

Your app now has:
✅ Secure authentication
✅ Cloud database
✅ Photo storage
✅ Google Fit integration
✅ Email capability
✅ WhatsApp capability

Ready for Phase 2! 🚀
