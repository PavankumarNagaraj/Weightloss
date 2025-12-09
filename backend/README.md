# Weight Loss Backend API

Node.js + Express backend for Weight Loss Management Application.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your credentials

# Start development server
npm run dev

# Start production server
npm start
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── supabase.js          # Supabase client configuration
│   │   └── cloudinary.js        # Cloudinary configuration
│   ├── middleware/
│   │   └── auth.js               # Authentication middleware
│   ├── routes/
│   │   ├── auth.js               # Authentication routes
│   │   └── photos.js             # Photo upload routes
│   ├── services/
│   │   ├── authService.js        # Auth business logic
│   │   ├── cloudinaryService.js  # Cloudinary operations
│   │   └── googleFitService.js   # Google Fit integration
│   └── server.js                 # Express app entry point
├── .env.example                  # Environment variables template
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Authentication

```
POST   /api/auth/signup                    # Register new user
POST   /api/auth/signin                    # Login user
POST   /api/auth/signout                   # Logout user
GET    /api/auth/me                        # Get current user
POST   /api/auth/refresh                   # Refresh access token
POST   /api/auth/forgot-password           # Request password reset
POST   /api/auth/reset-password            # Reset password
GET    /api/auth/google-fit/connect        # Get Google Fit OAuth URL
GET    /api/auth/google-fit/callback       # Google Fit OAuth callback
POST   /api/auth/google-fit/disconnect     # Disconnect Google Fit
```

### Photos

```
POST   /api/photos/upload                  # Upload single photo
POST   /api/photos/upload-multiple         # Upload multiple photos
GET    /api/photos/:userId                 # Get user's photos
DELETE /api/photos/:photoId                # Delete photo
```

### Health Check

```
GET    /health                             # Server health status
```

## 🔐 Authentication

All protected routes require Bearer token:

```javascript
headers: {
  'Authorization': 'Bearer YOUR_ACCESS_TOKEN'
}
```

## 📝 Environment Variables

See `.env.example` for all required variables:

- **Supabase:** URL, anon key, service key
- **Cloudinary:** Cloud name, API key, API secret
- **SendGrid:** API key, from email
- **Twilio:** Account SID, auth token, WhatsApp number
- **Google OAuth:** Client ID, client secret, redirect URI
- **JWT:** Secret key, expiration time

## 🧪 Testing

```bash
# Test health endpoint
curl http://localhost:5000/health

# Test signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

## 🚀 Deployment

### Render

1. Push code to GitHub
2. Create new Web Service on Render
3. Connect repository
4. Set environment variables
5. Deploy

### Railway

1. Install Railway CLI: `npm i -g @railway/cli`
2. Login: `railway login`
3. Initialize: `railway init`
4. Deploy: `railway up`

## 📦 Dependencies

- **express** - Web framework
- **@supabase/supabase-js** - Supabase client
- **cloudinary** - Image management
- **multer** - File upload handling
- **@sendgrid/mail** - Email service
- **twilio** - SMS/WhatsApp
- **googleapis** - Google Fit API
- **jsonwebtoken** - JWT tokens
- **bcryptjs** - Password hashing
- **helmet** - Security headers
- **cors** - CORS middleware
- **express-rate-limit** - Rate limiting
- **morgan** - HTTP logger
- **compression** - Response compression

## 🔒 Security Features

- Helmet security headers
- CORS configuration
- Rate limiting
- Input validation
- JWT authentication
- Password hashing
- Row-level security (Supabase)

## 📊 Monitoring

Add Sentry for error tracking:

```bash
npm install @sentry/node
```

## 🐛 Debugging

```bash
# Enable debug logs
DEBUG=* npm run dev

# Check logs
tail -f logs/error.log
```

## 📄 License

MIT
