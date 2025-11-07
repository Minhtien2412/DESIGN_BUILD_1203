@echo off
REM Development Build Script for Android (Windows)
REM This script helps build and run the development client

echo 🚀 Building Development Client for Android
echo ==========================================

REM Check if EAS CLI is installed
eas --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ EAS CLI not found. Installing...
    npm install -g eas-cli
)

REM Login to EAS if not already logged in
echo 🔐 Checking EAS login...
eas whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo Please login to EAS:
    eas login
    if %errorlevel% neq 0 exit /b 1
)

REM Build development client
echo 📱 Building Android development client...
eas build -p android --profile development

echo ✅ Development client build completed!
echo.
echo 📋 Next steps:
echo 1. Install the APK on your Android device
echo 2. Open the app using the development client
echo 3. Test WebRTC video calls and push notifications
echo.
echo 🔗 For more info, see DEVELOPMENT_BUILD_SETUP.md

pause