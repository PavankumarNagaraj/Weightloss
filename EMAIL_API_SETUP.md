# 📧 Email API Setup Guide

## Quick Start - Send Emails from App

### **Option 1: Run Email API Server (Recommended)**

Start the email API server in a separate terminal:

```bash
node api/send-email.js
```

This starts a server on `http://localhost:3001` that handles email sending.

**Then:**
1. Start your React app: `npm start`
2. Go to Dashboard
3. Click "Email Report" button
4. Email will be sent automatically! ✅

---

### **Option 2: Use Node.js Script Directly**

If you don't want to run the API server:

```bash
node send-clean-report.js
```

This sends the email directly using actual data from localStorage.

---

## 🚀 **How It Works:**

### **With API Server:**
```
Dashboard Button → API (localhost:3001) → Brevo SMTP → Email Sent ✅
```

### **Without API Server:**
```
Dashboard Button → Downloads HTML Report → Run script manually
```

---

## 📝 **Configuration:**

All email settings are already configured:

```javascript
SMTP Server: smtp-relay.brevo.com
Port: 587
User: 9de95e001@smtp-brevo.com
Password: yTcSL0hbzBF1Prqk
Sender: Afterburn Cafe <pavan@afterburn.fit>
Recipient: pavankumar.nagaraj@gmail.com
```

---

## 🔧 **Installation:**

Email dependencies are already installed:
- ✅ nodemailer

If needed, install:
```bash
npm install nodemailer express body-parser
```

---

## 📊 **Email Report Includes:**

1. **Total Revenue** - With net amount after expenses
2. **Orders & Cost** - Payment breakdown, expenses, credit
3. **Items to Buy** - Urgent purchases needed
4. **Current Stock** - Inventory value and low stock items

---

## 🎯 **Usage:**

### **From Dashboard:**
1. Click "Email Report" button
2. If API running: Email sent instantly ✅
3. If API not running: HTML report downloaded

### **From Reports Tab:**
1. Configure email settings
2. Click "Send Now" or "Test Email"
3. Enable auto-send for daily 11:55 PM reports

### **From Terminal:**
```bash
# Send email with actual app data
node send-clean-report.js

# Or start API server
node api/send-email.js
```

---

## ✅ **Recommended Setup:**

**For Development:**
```bash
# Terminal 1
npm start

# Terminal 2
node api/send-email.js
```

**For Production:**
- Deploy API endpoint to serverless function (Vercel, Netlify, AWS Lambda)
- Update API URL in emailService.js

---

## 🐛 **Troubleshooting:**

### **"Key not found" error:**
- This happens when trying to use Brevo API from browser
- Solution: Run the email API server or use Node.js script

### **Email not sending:**
- Check if API server is running on port 3001
- Or use: `node send-clean-report.js` directly

### **Port already in use:**
- Change port in `api/send-email.js`
- Update port in `emailService.js`

---

## 🎉 **All Set!**

Your email system is ready. Choose your preferred method:
- ✅ Run API server for one-click emails from app
- ✅ Use Node.js script for manual sends
- ✅ Both work with actual cafe data!
