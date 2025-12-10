# Weight Loss Tracker - React + Firebase

A comprehensive weight loss program management system with trainer dashboard and user tracking capabilities.

## 🚀 Features

### Trainer Dashboard
- **Secure Authentication**: Single trainer login with Firebase Auth
- **User Management**: Create, update, and delete user profiles
- **Progress Tracking**: Monitor all users' weight loss progress
- **Interactive Funnel**: Visual bubble chart showing user progress stages
- **Reports & Analytics**: Weekly summaries, top performers, and attention alerts
- **Status Management**: Manually update user status (On Track / At Risk / Struggling)

### User Dashboard (Public Access)
- **No Login Required**: Access via unique shareable link
- **Daily Logging**: Input weight and meals (breakfast, lunch, dinner)
- **Progress Visualization**: Line chart showing weight trends
- **Meal Plan Display**: View assigned meal plan
- **Goal Tracking**: Progress bar and stats toward goal weight

## 🛠️ Tech Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Firestore + Authentication)
- **Charts**: Chart.js with react-chartjs-2
- **Visualization**: D3.js for bubble funnel
- **Icons**: Lucide React
- **Routing**: React Router v6

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account

## 🔧 Installation

1. **Clone the repository**
   ```bash
   cd /Users/pavan/Documents/Weightloss
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   
   a. Go to [Firebase Console](https://console.firebase.google.com/)
   
   b. Create a new project or use existing one
   
   c. Enable **Authentication** (Email/Password provider)
   
   d. Create a **Firestore Database** (start in production mode)
   
   e. Get your Firebase config from Project Settings
   
   f. Update `src/FirebaseConfig.js` with your credentials:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT_ID.appspot.com",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

4. **Create Trainer Account**
   
   In Firebase Console > Authentication > Users, manually add a user with email/password.

5. **Set up Firestore Security Rules**
   
   In Firebase Console > Firestore Database > Rules:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Allow trainer (authenticated users) full access
       match /users/{userId} {
         allow read, write: if request.auth != null;
         allow read: if true; // Allow public read for user dashboard
       }
       
       match /trainer/{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

## 🚀 Running the Application

```bash
npm run dev
```

The application will open at `http://localhost:3000`

## 📱 Usage

### For Trainers

1. **Login**: Navigate to `/login` and sign in with your credentials
2. **Add Users**: Click "Add User" button in the sidebar
3. **View Dashboard**: Monitor all users in the Overview tab
4. **Funnel View**: See visual representation of user progress stages
5. **Manage Users**: Update status, add notes, view detailed analytics
6. **Generate Links**: Copy user-specific links from the Users tab

### For Users

1. **Access Dashboard**: Open the unique link provided by trainer (e.g., `/user/abc123`)
2. **Log Daily Data**: Enter weight and meals
3. **Track Progress**: View weight chart and progress toward goal
4. **View Meal Plan**: See assigned meal plan

## 📊 Database Schema

### Users Collection
```javascript
{
  name: string,
  gender: string,
  age: number,
  phone: string,
  goalWeight: number,
  programType: "60-day" | "90-day",
  mealPlan: "Veg" | "Non-Veg" | "Detox" | "Custom",
  progressStatus: "onTrack" | "atRisk" | "struggling",
  startDate: ISO string,
  logs: [
    {
      date: ISO string,
      weight: number,
      meals: {
        breakfast: string,
        lunch: string,
        dinner: string
      }
    }
  ],
  notes: [
    {
      text: string,
      date: ISO string
    }
  ],
  createdAt: ISO string
}
```

## 🎨 Routes

- `/login` - Trainer login page
- `/dashboard` - Trainer overview
- `/dashboard/funnel` - Progress funnel visualization
- `/dashboard/users` - User management
- `/dashboard/reports` - Analytics and reports
- `/user/:userId` - Public user dashboard (no auth required)

## 🔐 Security Features

- Firebase Authentication for trainer access
- Public read-only access for user dashboards
- Secure Firestore rules
- Protected routes with authentication checks

## 🚢 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## 📝 Auto Status Detection

The system automatically updates user status based on:
- **At Risk**: No weight change for 5+ days
- **Struggling**: Missed 3+ consecutive logs

## 🎯 Future Enhancements

- Email/SMS notifications
- Multi-trainer support
- Export reports to PDF
- Mobile app version
- Integration with fitness trackers
- Meal plan customization interface

## 🤝 Support

For issues or questions, please contact your system administrator.

## 📄 License

Private project - All rights reserved
