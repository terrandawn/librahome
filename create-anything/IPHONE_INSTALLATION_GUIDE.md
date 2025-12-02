# iPhone Installation Guide for Create-Anything Book App

## 🎯 Overview

This guide will help you install the improved book management app on your iPhone with working book addition functionality. The app consists of two parts:
- **Backend**: Web API server with database
- **Frontend**: React Native mobile app

## 📋 Prerequisites

- iPhone with iOS 14+ 
- Expo Go app (from App Store)
- Free Neon database account (for persistent storage)
- Basic command line knowledge
- Computer with Node.js installed

---

## 🚀 Method 1: Quick & Easy (Expo Development Build)

### Step 1: Set Up Backend Database

1. **Create Neon Database**:
   - Go to https://neon.tech
   - Sign up for free account
   - Create new project/database
   - Copy connection string

2. **Configure Backend**:
   ```bash
   # On your computer
   cd create-anything/apps/web
   cp .env.example .env
   ```
   
   Edit `.env` file:
   ```
   DATABASE_URL=your-neon-connection-string
   NODE_ENV=production
   LOG_LEVEL=INFO
   ```

3. **Deploy Backend** (Choose one option):

#### Option A: Deploy to Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd create-anything/apps/web
vercel --prod
```
Copy the deployment URL (e.g., `https://your-app.vercel.app`)

#### Option B: Deploy to Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

#### Option C: Use Local Development (Testing only)
```bash
cd create-anything/apps/web
npm install --legacy-peer-deps
npm run dev
```
Use `http://localhost:PORT` (but phone can't access localhost)

### Step 2: Configure Mobile App

1. **Update Mobile Environment**:
   ```bash
   cd create-anything/apps/mobile
   ```

2. **Create environment file**:
   ```bash
   # Create app.config.js
   touch app.config.js
   ```

3. **Edit app.config.js**:
   ```javascript
   export default {
     expo: {
       name: "Book Library",
       slug: "book-library",
       version: "1.0.0",
       orientation: "portrait",
       icon: "./assets/images/icon.png",
       userInterfaceStyle: "automatic",
       splash: {
         image: "./assets/images/splash-icon.png",
         resizeMode: "contain",
         backgroundColor: "#ffffff"
       },
       assetBundlePatterns: [
         "**/*"
       ],
       ios: {
         supportsTablet: true,
         bundleIdentifier: "com.yourname.booklibrary"
       },
       android: {
         adaptiveIcon: {
           foregroundImage: "./assets/images/adaptive-icon.png",
           backgroundColor: "#FFFFFF"
         },
         package: "com.yourname.booklibrary"
       },
       web: {
         favicon: "./assets/images/favicon.png"
       },
       plugins: [
         "expo-router",
         [
           "expo-splash-screen",
           {
             "image": "./assets/images/splash-icon.png",
             "imageWidth": 200,
             "resizeMode": "contain"
           }
         ],
         "expo-audio",
         [
           "expo-build-properties",
           {
             "ios": {
               "useFrameworks": "static"
             }
           }
         ]
       ],
       extra: {
         router: {
           origin: false
         },
         eas: {
           projectId: "your-eas-project-id" // Optional
         }
       },
       updates: {
         fallbackToCacheTimeout: 0
       },
       runtimeVersion: {
         policy: "appVersion"
       }
     }
   };
   ```

### Step 3: Install and Run on iPhone

#### Option A: Expo Go (Easiest)
1. **Install Expo Go** from App Store on your iPhone
2. **Start development server**:
   ```bash
   cd create-anything/apps/mobile
   npm install
   npx expo start --tunnel
   ```
3. **Scan QR code** with Expo Go app
4. **Test book addition** - it should work!

#### Option B: Development Build (Better performance)
1. **Install EAS CLI**:
   ```bash
   npm install -g eas-cli
   ```

2. **Configure EAS**:
   ```bash
   cd create-anything/apps/mobile
   eas build:configure
   ```

3. **Create development build**:
   ```bash
   eas build --platform ios --profile development
   ```

4. **Install on iPhone**:
   - Scan QR code from build output
   - Or install via TestFlight if configured

---

## 🚀 Method 2: Production Build (App Store Ready)

### Step 1: Complete Backend Setup
Follow Method 1, Step 1 but ensure backend is deployed to production (Vercel/Railway).

### Step 2: Prepare for Production Build

1. **Update app constants**:
   ```javascript
   // In create-anything/apps/mobile/app.config.js
   export default {
     expo: {
       // ... other config
       extra: {
         // Add your production backend URL
         apiBaseUrl: "https://your-backend-url.vercel.app"
       }
     }
   };
   ```

2. **Create production build configuration**:
   ```bash
   cd create-anything/apps/mobile
   eas build:configure
   ```

3. **Build for App Store**:
   ```bash
   eas build --platform ios --profile production
   ```

### Step 3: Submit to App Store (Optional)

1. **Configure App Store Connect**:
   - Create Apple Developer account ($99/year)
   - Set up app listing
   - Upload build via Xcode or Transporter

2. **Alternative: TestFlight Distribution**:
   ```bash
   eas submit --platform ios --profile production
   ```

---

## 🔧 Configuration Details

### Backend URL Configuration

The mobile app uses `EXPO_PUBLIC_BASE_URL` environment variable. Update it:

```bash
# For development
export EXPO_PUBLIC_BASE_URL=http://localhost:3000

# For production  
export EXPO_PUBLIC_BASE_URL=https://your-app.vercel.app
```

Or create `.env` file in mobile app:
```
EXPO_PUBLIC_BASE_URL=https://your-backend-url.vercel.app
```

### Database Setup

Apply schema to your Neon database:
```bash
# Using psql
psql "your-neon-connection-string" < database/schema.sql

# Or use Neon console UI to run the SQL commands
```

---

## 🧪 Testing the Installation

### Test Backend
```bash
curl -X POST https://your-backend-url.vercel.app/api/books \
  -H "Content-Type: application/json" \
  -H "x-user-id: test-user" \
  -d '{"title": "Test Book", "author": "Test Author"}'
```

### Test Mobile App
1. Open app on iPhone
2. Navigate to "Add Book"
3. Enter book details
4. Tap "Add to Library"
5. Should see "Success!" message

---

## 🐛 Troubleshooting

### Common Issues

#### "Network request failed"
- **Cause**: Backend URL not accessible from phone
- **Fix**: Use deployed backend URL, not localhost
- **Check**: Ensure backend is running and accessible

#### "Database connection failed"
- **Cause**: DATABASE_URL not configured
- **Fix**: Set up Neon database and update .env
- **Check**: Verify database schema is applied

#### "Build failed"
- **Cause**: Missing dependencies or configuration
- **Fix**: Run `npm install --legacy-peer-deps`
- **Check**: Verify Expo CLI version

#### "Cannot connect to development server"
- **Cause**: Network/firewall issues
- **Fix**: Use `--tunnel` or `--host` flags
- **Check**: Ensure phone and computer on same network

### Debug Tools

#### Mobile App Debugging
1. **Shake device** to open developer menu
2. **Enable remote debugging**
3. **Check console logs** in browser

#### Backend Debugging
1. **Check Vercel/Railway logs**
2. **Test API endpoints** with curl
3. **Verify database connectivity**

---

## 📱 App Features (After Installation)

✅ **Book Management**:
- Add books to library
- View book collection
- Edit book details
- Delete books

✅ **Reading Tracking**:
- Mark books as reading
- Track reading progress
- Record reading sessions

✅ **Search & Filter**:
- Search by title/author
- Filter by status/genre
- Sort by various criteria

✅ **Authentication**:
- User accounts
- Secure login/logout

✅ **Sync**:
- Real-time data sync
- Works offline (with mock DB)
- Cloud storage with real DB

---

## 🎉 Next Steps

1. **Start with Method 1** for quick testing
2. **Set up Neon database** for persistent storage  
3. **Deploy backend to Vercel** for reliable hosting
4. **Install via Expo Go** for easy iPhone access
5. **Test all features** before sharing

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the detailed logs in the app
3. Use the debug screen (navigate to `/debug` in mobile app)
4. Refer to `BOOK_ISSUE_ANALYSIS.md` for technical details

Your improved book library app will be working on your iPhone in no time! 📚✨