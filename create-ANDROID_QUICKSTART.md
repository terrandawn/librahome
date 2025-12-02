# 🤖 Android Quick Start Guide

## ⚡ Super Quick (5 Minutes)

### 1. Install Expo Go
Download from Google Play Store on your Android phone

### 2. Set Up Backend (2 minutes)
```bash
# Create free database at https://neon.tech
# Get connection string

cd create-anything/apps/web
cp .env.example .env
# Edit .env: DATABASE_URL=your-neon-string

# Deploy to Vercel
npm i -g vercel
vercel --prod
```

### 3. Configure Mobile App (1 minute)
```bash
cd create-anything/apps/mobile
# Edit .env: EXPO_PUBLIC_BASE_URL=https://your-app.vercel.app
npm install
```

### 4. Install on Android (2 minutes)
```bash
npx expo start --tunnel
# Scan QR code with Expo Go app
```

That's it! 🎉 Your book library app is working on Android!

---

## 🔧 Alternative: Build APK

If you prefer a standalone app:

```bash
# After steps 1-3 above
npm install -g eas-cli
eas build --platform android --profile preview
# Download APK and install on Android
```

---

## 🆘 Quick Troubleshooting

**"Network request failed"**
- Use deployed URL, not localhost
- Check backend is running

**"Can't install APK"**
- Enable "Install from unknown sources" in Android settings
- Security > Install from unknown sources

**"Expo Go can't connect"**
- Use `--tunnel` flag
- Check phone and computer on same network

**Need help?**
- Full guide: `ANDROID_INSTALLATION_GUIDE.md`
- Debug mode: Shake phone in app
- Issues: Check the detailed guide

📱 **Happy reading on Android!** 📚✨