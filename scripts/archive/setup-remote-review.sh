#!/bin/bash
# Quick Remote Review Setup Script
# Chạy script này để setup nhanh các options review từ xa

set -e

echo "🔍 APP DESIGN BUILD - Remote Review Setup"
echo "========================================"

# Check current environment
echo "📊 Checking current setup..."
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

# Check if Expo is working
if command -v expo &> /dev/null; then
    echo "✅ Expo CLI: $(expo --version)"
else
    echo "❌ Expo CLI not found"
fi

# Check package.json for scripts
echo ""
echo "📋 Available build scripts:"
grep -E "\"(build|start|web).*\":" package.json | sed 's/,$//' | sed 's/^[[:space:]]*/  /'

echo ""
echo "🚀 Quick Setup Options:"
echo ""

# Option 1: Web Version (Fastest)
echo "1️⃣  WEB VERSION (Recommended - 30 seconds)"
echo "   Command: npm run web"
echo "   Result: Browser preview at http://localhost:3000"
echo ""

# Option 2: Firebase App Distribution
echo "2️⃣  FIREBASE APP DISTRIBUTION (Mobile APK)"
echo "   Setup time: ~10 minutes"
echo "   Result: APK downloadable via email link"
echo ""

# Option 3: ngrok Tunnel
echo "3️⃣  NGROK TUNNEL (Real-time dev server)"
echo "   Setup time: ~2 minutes"  
echo "   Result: Public URL for Metro bundler"
echo ""

# Option 4: Build APK
echo "4️⃣  BUILD APK (Local file sharing)"
echo "   Command: npm run build:preview"
echo "   Result: APK file to upload to Google Drive/etc"
echo ""

echo "=========================================="
echo "🎯 Choose your preferred option:"
echo ""

read -p "Enter option (1-4): " option

case $option in
    1)
        echo "🌐 Starting web version..."
        if [ -f "node_modules/.bin/expo" ]; then
            npm run web
        else
            echo "❌ Missing dependencies. Run: npm install"
        fi
        ;;
    2)
        echo "📱 Firebase App Distribution setup..."
        echo "1. Install Firebase CLI: npm install -g firebase-tools"
        echo "2. Login: firebase login"
        echo "3. Init: firebase init appdistribution"
        echo "4. Build APK: npm run build:preview"
        echo "5. Distribute: firebase appdistribution:distribute ..."
        echo ""
        read -p "Continue with Firebase setup? (y/n): " firebase_setup
        if [[ $firebase_setup == "y" ]]; then
            if ! command -v firebase &> /dev/null; then
                echo "Installing Firebase CLI..."
                npm install -g firebase-tools
            fi
            echo "Please run: firebase login"
            echo "Then: firebase init appdistribution"
        fi
        ;;
    3)
        echo "🔗 Setting up ngrok tunnel..."
        if ! command -v ngrok &> /dev/null; then
            echo "Installing ngrok..."
            if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
                echo "Please download ngrok from: https://ngrok.com/download"
                echo "And add to PATH"
            else
                brew install ngrok 2>/dev/null || echo "Please install ngrok manually"
            fi
        fi
        
        echo "Starting Metro bundler in background..."
        npm start &
        METRO_PID=$!
        
        sleep 10
        echo "Creating tunnel..."
        ngrok http 8081 &
        NGROK_PID=$!
        
        sleep 5
        echo ""
        echo "🎉 Setup complete!"
        echo "Metro server PID: $METRO_PID"
        echo "ngrok PID: $NGROK_PID"
        echo "Check ngrok dashboard at: http://localhost:4040"
        echo ""
        echo "To stop: kill $METRO_PID $NGROK_PID"
        ;;
    4)
        echo "🏗️  Building APK..."
        if [ -f "eas.json" ]; then
            echo "Using EAS build..."
            if ! command -v eas &> /dev/null; then
                echo "Installing EAS CLI..."
                npm install -g eas-cli
            fi
            eas build --profile preview --platform android
        else
            echo "Using Expo build..."
            npm run build:preview || npx expo build:android
        fi
        
        echo "📤 APK built! Upload to:"
        echo "- Google Drive"
        echo "- WeTransfer" 
        echo "- Dropbox"
        echo "- Or any file sharing service"
        ;;
    *)
        echo "❌ Invalid option. Please run script again."
        exit 1
        ;;
esac

echo ""
echo "✅ Setup complete!"
echo "📋 Next steps written to REMOTE_REVIEW_OPTIONS.md"