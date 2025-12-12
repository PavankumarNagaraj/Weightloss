# 📧 Brevo Email Setup Guide

## ⚠️ Important: API Key Issue

The API key provided (`yTcSL0hbzBF1Prqk`) appears to be the SMTP password, not the API key.

---

## 🔑 How to Get Your Brevo API Key:

### **Step 1: Log into Brevo**
1. Go to https://app.brevo.com/
2. Log in with your credentials

### **Step 2: Generate API Key**
1. Click on your name (top right)
2. Go to **"SMTP & API"**
3. Click on **"API Keys"** tab
4. Click **"Generate a new API key"**
5. Give it a name (e.g., "Cafe Management")
6. Copy the API key (starts with `xkeysib-`)

### **Step 3: Update Configuration**
Replace the API key in these files:
- `/src/services/emailService.js`
- `/send-test-email.js`

---

## 📝 Current Configuration:

```
SMTP Server: smtp-relay.brevo.com
Port: 587
Login: 9de95e001@smtp-brevo.com
Password: yTcSL0hbzBF1Prqk
API Key: [NEEDS TO BE OBTAINED FROM BREVO DASHBOARD]
```

---

## 🧪 Test Email Options:

### **Option 1: Using the Web App**
1. Start your React app: `npm start`
2. Go to Reports tab
3. Enter email: `pavankuar.nagaraj@gmail.com`
4. Click "Test Email"

### **Option 2: Using Node.js Script**
```bash
# After updating API key in send-test-email.js
node send-test-email.js
```

### **Option 3: Using HTML File**
```bash
# Open in browser
open test-email.html
# Click "Send Test Email" button
```

---

## 🔧 Alternative: Use SMTP Directly (Without API)

If you prefer to use SMTP instead of API, you can use a library like `nodemailer`:

### **Install nodemailer:**
```bash
npm install nodemailer
```

### **Create test script:**
```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: '9de95e001@smtp-brevo.com',
    pass: 'yTcSL0hbzBF1Prqk'
  }
});

transporter.sendMail({
  from: '"Cafe Management" <9de95e001@smtp-brevo.com>',
  to: 'pavankuar.nagaraj@gmail.com',
  subject: '✅ Test Email - Brevo SMTP',
  html: '<h1>Test Email</h1><p>If you see this, SMTP is working!</p>'
}, (error, info) => {
  if (error) {
    console.log('Error:', error);
  } else {
    console.log('Email sent:', info.messageId);
  }
});
```

---

## 📊 What to Do Now:

### **Immediate Action:**
1. **Get API Key from Brevo Dashboard**
2. **Update the API key in the code**
3. **Run test email**

### **Or Use the Web App:**
1. Start the app: `npm start`
2. Go to Reports tab
3. Configure email settings
4. Click "Test Email"

---

## ✅ Once API Key is Updated:

The email will include:
- ✅ SMTP configuration verification
- 📊 Daily report features overview
- 🎯 Next steps guide
- 🚀 System status confirmation

---

## 🆘 Troubleshooting:

### **401 Unauthorized Error:**
- API key is incorrect or expired
- Get new API key from Brevo dashboard

### **Email Not Received:**
- Check spam folder
- Verify email address is correct
- Check Brevo account status

### **Network Error:**
- Check internet connection
- Verify firewall settings
- Try different network

---

## 📞 Support:

**Brevo Support:** https://help.brevo.com/
**Documentation:** https://developers.brevo.com/

---

**Note:** The password `yTcSL0hbzBF1Prqk` is for SMTP authentication, not for API calls. You need a separate API key from the Brevo dashboard.
