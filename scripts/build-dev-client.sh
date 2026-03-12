#!/bin/bash

# Development Build Script for Android
# This script helps build and run the development client

echo "🚀 Building Development Client for Android"
echo "=========================================="

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI not found. Installing..."
    npm install -g eas-cli
fi

# Login to EAS if not already logged in
echo "🔐 Checking EAS login..."
eas whoami > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "Please login to EAS:"
    eas login
fi

# Build development client
echo "📱 Building Android development client..."
eas build -p android --profile development

echo "✅ Development client build completed!"
echo ""
echo "📋 Next steps:"
echo "1. Install the APK on your Android device"
echo "2. Open the app using the development client"
echo "3. Test WebRTC video calls and push notifications"
echo ""
echo "🔗 For more info, see DEVELOPMENT_BUILD_SETUP.md"