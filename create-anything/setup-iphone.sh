#!/bin/bash

echo "📱 iPhone App Setup Script for Book Library"
echo "=========================================="
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install backend dependencies
echo ""
echo "📦 Setting up backend..."
cd apps/web

if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install --legacy-peer-deps
fi

echo "✅ Backend dependencies installed"

# Install mobile dependencies
echo ""
echo "📱 Setting up mobile app..."
cd ../mobile

if [ ! -d "node_modules" ]; then
    echo "Installing mobile dependencies..."
    npm install
fi

# Install Expo CLI if not present
if ! command_exists eas; then
    echo "Installing EAS CLI..."
    npm install -g eas-cli
fi

echo "✅ Mobile dependencies installed"

# Go back to root
cd ../..

echo ""
echo "🎯 Next Steps:"
echo ""
echo "1. 🗄️  Set up your database:"
echo "   - Go to https://neon.tech"
echo "   - Create a free account and database"
echo "   - Copy the connection string"
echo ""
echo "2. ⚙️  Configure backend:"
echo "   cd apps/web"
echo "   cp .env.example .env"
echo "   # Edit .env and add your DATABASE_URL"
echo ""
echo "3. 🚀 Deploy backend (choose one):"
echo "   # Option A: Vercel (recommended)"
echo "   npm i -g vercel"
echo "   vercel --prod"
echo ""
echo "   # Option B: Railway"
echo "   npm i -g @railway/cli"
echo "   railway login && railway up"
echo ""
echo "4. 📱 Configure mobile app:"
echo "   cd apps/mobile"
echo "   # Edit .env and set EXPO_PUBLIC_BASE_URL"
echo "   # Use your deployed backend URL"
echo ""
echo "5. 🏃‍♂️ Run on iPhone:"
echo "   # Option A: Expo Go (easiest)"
echo "   npx expo start --tunnel"
echo "   # Scan QR code with Expo Go app"
echo ""
echo "   # Option B: Development build"
echo "   eas build --platform ios --profile development"
echo ""
echo ""
echo "📚 Full guide available in IPHONE_INSTALLATION_GUIDE.md"
echo ""
echo "🎉 Ready to install your Book Library app on iPhone!"