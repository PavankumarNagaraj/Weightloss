# Firebase Setup Guide

Complete guide to set up Firebase for the Weight Loss Tracker application.

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name (e.g., "weightloss-tracker")
4. Enable/disable Google Analytics (optional)
5. Click **"Create project"**

## Step 2: Register Web App

1. In your Firebase project, click the **Web icon** (</>) to add a web app
2. Enter app nickname (e.g., "Weight Loss Tracker")
3. **Do NOT** check "Set up Firebase Hosting" (we'll do this later)
4. Click **"Register app"**
5. Copy the Firebase configuration object

## Step 3: Update Firebase Config

1. Open `src/FirebaseConfig.js`
2. Replace the placeholder values with your Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

## Step 4: Enable Authentication

1. In Firebase Console, go to **Build > Authentication**
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Click on **"Email/Password"**
5. Enable the first toggle (Email/Password)
6. Click **"Save"**

### Create Trainer Account

1. Go to **"Users"** tab in Authentication
2. Click **"Add user"**
3. Enter email: `trainer@example.com` (or your preferred email)
4. Enter password: Create a strong password
5. Click **"Add user"**

**Important**: Save these credentials - you'll need them to login!

## Step 5: Set Up Firestore Database

1. In Firebase Console, go to **Build > Firestore Database**
2. Click **"Create database"**
3. Select **"Start in production mode"** (we'll add rules next)
4. Choose a Cloud Firestore location (select closest to your users)
5. Click **"Enable"**

### Configure Security Rules

1. Go to **"Rules"** tab in Firestore Database
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      // Authenticated users (trainers) can read and write
      allow read, write: if request.auth != null;
      
      // Allow public read access for user dashboards (no auth required)
      allow read: if true;
      
      // Users can update their own logs
      allow update: if true;
    }
    
    // Trainer collection (if needed)
    match /trainer/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. Click **"Publish"**

### Create Initial Collections (Optional)

Firestore will automatically create collections when you add the first document. However, you can create them manually:

1. Click **"Start collection"**
2. Collection ID: `users`
3. Add a test document (you can delete it later):
   - Document ID: Auto-ID
   - Field: `name`, Type: string, Value: `Test User`
4. Click **"Save"**

## Step 6: Install Dependencies

```bash
cd /Users/pavan/Documents/Weightloss
npm install
```

## Step 7: Run the Application

```bash
npm run dev
```

The app should open at `http://localhost:3000`

## Step 8: Test the Setup

1. Navigate to `http://localhost:3000/login`
2. Login with the trainer credentials you created
3. You should be redirected to the dashboard
4. Try adding a test user
5. Copy the user link and test the public user dashboard

## Optional: Deploy to Firebase Hosting

### Install Firebase CLI

```bash
npm install -g firebase-tools
```

### Login to Firebase

```bash
firebase login
```

### Initialize Firebase Hosting

```bash
firebase init hosting
```

Select:
- Use existing project
- Public directory: `dist`
- Configure as single-page app: `Yes`
- Set up automatic builds with GitHub: `No` (or Yes if you want)
- Don't overwrite dist/index.html if asked

### Build and Deploy

```bash
npm run build
firebase deploy
```

Your app will be live at: `https://your-project.firebaseapp.com`

## Firestore Data Structure

The app will automatically create documents with this structure:

### Users Collection (`users/{userId}`)

```javascript
{
  name: "John Doe",
  gender: "Male",
  age: 30,
  phone: "+1234567890",
  goalWeight: 70,
  programType: "60-day",
  mealPlan: "Veg",
  progressStatus: "onTrack",
  startDate: "2024-01-01T00:00:00.000Z",
  createdAt: "2024-01-01T00:00:00.000Z",
  logs: [
    {
      date: "2024-01-01T00:00:00.000Z",
      weight: 85,
      meals: {
        breakfast: "Oats with fruits",
        lunch: "Brown rice and dal",
        dinner: "Roti and vegetables"
      }
    }
  ],
  notes: [
    {
      text: "Great progress this week!",
      date: "2024-01-07T00:00:00.000Z"
    }
  ]
}
```

## Troubleshooting

### Authentication Error
- Verify Email/Password is enabled in Firebase Console
- Check if trainer account exists in Authentication > Users
- Ensure credentials are correct

### Firestore Permission Denied
- Check security rules are published
- Verify you're logged in as trainer
- Check browser console for specific error

### Firebase Config Error
- Verify all config values in `src/FirebaseConfig.js`
- Ensure no typos in the config object
- Check if Firebase project is active

### Build Errors
- Run `npm install` to ensure all dependencies are installed
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be v16+)

## Security Best Practices

1. **Never commit Firebase config to public repositories** (use environment variables)
2. **Use strong passwords** for trainer accounts
3. **Regularly review** Firestore security rules
4. **Monitor usage** in Firebase Console to detect unusual activity
5. **Enable App Check** for additional security (optional)

## Cost Considerations

Firebase free tier (Spark Plan) includes:
- **Authentication**: 10K verifications/month
- **Firestore**: 1GB storage, 50K reads, 20K writes, 20K deletes per day
- **Hosting**: 10GB storage, 360MB/day transfer

This should be sufficient for small to medium gyms. Monitor usage in Firebase Console.

## Support

If you encounter issues:
1. Check Firebase Console for error messages
2. Review browser console for JavaScript errors
3. Verify all setup steps were completed
4. Check Firebase Status page: https://status.firebase.google.com/

## Next Steps

After setup is complete:
1. Add real user data
2. Customize meal plans
3. Set up regular backups
4. Configure email notifications (requires additional setup)
5. Consider upgrading to Blaze plan for production use
