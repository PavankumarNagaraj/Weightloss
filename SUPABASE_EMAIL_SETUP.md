# 📧 Supabase Email Setup Guide

## 🚀 Quick Setup

### **Step 1: Login to Supabase**

```bash
supabase login
```

This will open your browser to authenticate.

---

### **Step 2: Link to Your Supabase Project**

If you have an existing Supabase project:

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

Or create a new project at https://supabase.com/dashboard

---

### **Step 3: Set Brevo API Key Secret**

You need to get a Brevo API key first:

1. Go to https://app.brevo.com/
2. Navigate to **SMTP & API** → **API Keys**
3. Create a new API key
4. Copy the key (starts with `xkeysib-`)

Then set it as a Supabase secret:

```bash
supabase secrets set BREVO_API_KEY=xkeysib-YOUR_ACTUAL_API_KEY_HERE
```

---

### **Step 4: Deploy the Edge Function**

```bash
supabase functions deploy send-email
```

This deploys the email function to Supabase!

---

### **Step 5: Get Your Function URL**

After deployment, you'll get a URL like:
```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-email
```

---

### **Step 6: Update React App**

Update `/src/services/emailService.js`:

Replace:
```javascript
const response = await fetch('http://localhost:3001/api/send-email', {
```

With:
```javascript
const SUPABASE_FUNCTION_URL = 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-email';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';

const response = await fetch(SUPABASE_FUNCTION_URL, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  },
```

Get your anon key from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api

---

## 🧪 Test the Function

### **Test Locally:**

```bash
# Start Supabase locally
supabase start

# In another terminal, serve the function
supabase functions serve send-email --env-file ./supabase/.env.local

# Test with curl
curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send-email' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
  --header 'Content-Type: application/json' \
  --data '{
    "recipientEmail": "pavankumar.nagaraj@gmail.com",
    "recipientName": "Pavan Kumar",
    "subject": "Test Email",
    "htmlContent": "<h1>Test from Supabase!</h1>"
  }'
```

### **Test Production:**

```bash
curl -i --location --request POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-email' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "recipientEmail": "pavankumar.nagaraj@gmail.com",
    "subject": "Test Email",
    "htmlContent": "<h1>Test Email!</h1>"
  }'
```

---

## 📝 Environment Variables

Create `supabase/.env.local` for local testing:

```bash
BREVO_API_KEY=xkeysib-YOUR_API_KEY_HERE
```

For production, use:
```bash
supabase secrets set BREVO_API_KEY=xkeysib-YOUR_API_KEY_HERE
```

---

## 🔧 Configuration

### **Email Settings:**
- **Sender:** Afterburn Cafe <pavan@afterburn.fit>
- **Recipient:** pavankumar.nagaraj@gmail.com
- **SMTP:** Brevo API (no direct SMTP needed)

### **Supabase Function:**
- **Name:** send-email
- **Runtime:** Deno
- **CORS:** Enabled for all origins
- **Auth:** Requires Supabase anon key

---

## 📊 Usage from React App

Once deployed, the Dashboard "Email Report" button will:

1. Generate daily report with actual data
2. Call Supabase Edge Function
3. Function sends email via Brevo API
4. Email delivered to pavankumar.nagaraj@gmail.com

---

## 🐛 Troubleshooting

### **"Key not found" error:**
- Make sure you've set the Brevo API key secret
- Run: `supabase secrets set BREVO_API_KEY=your_key`

### **CORS error:**
- Function already has CORS headers enabled
- Check that you're using the correct Authorization header

### **Function not found:**
- Verify deployment: `supabase functions list`
- Redeploy: `supabase functions deploy send-email`

### **Email not sending:**
- Check Brevo API key is valid
- Check function logs: `supabase functions logs send-email`
- Verify sender email is authorized in Brevo

---

## 🎯 Complete Setup Commands

```bash
# 1. Login
supabase login

# 2. Link project (or create new one)
supabase link --project-ref YOUR_PROJECT_REF

# 3. Set API key secret
supabase secrets set BREVO_API_KEY=xkeysib-YOUR_ACTUAL_KEY

# 4. Deploy function
supabase functions deploy send-email

# 5. Test it
curl -i --location --request POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-email' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"recipientEmail":"pavankumar.nagaraj@gmail.com","subject":"Test","htmlContent":"<h1>Works!</h1>"}'
```

---

## ✅ Benefits of Supabase

- ✅ No local server needed
- ✅ Serverless - scales automatically
- ✅ Secure - API keys stored as secrets
- ✅ CORS handled automatically
- ✅ Free tier available
- ✅ Easy deployment with CLI
- ✅ Function logs for debugging

---

## 🎉 You're All Set!

Your email system is now:
- ✅ Deployed to Supabase Edge Functions
- ✅ Using Brevo API for email sending
- ✅ Accessible from your React app
- ✅ Secure with environment variables
- ✅ Production-ready!

Click "Email Report" on Dashboard and emails will be sent! 📧
