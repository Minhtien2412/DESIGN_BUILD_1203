# Quick Fix Script - Development Build Setup
# Run this to fix the react-native-webrtc error

Write-Host "🔧 Video Call Fix - Development Build Setup" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Update EAS CLI
Write-Host "📦 Step 1: Updating EAS CLI..." -ForegroundColor Yellow
npm install -g eas-cli
Write-Host "✅ EAS CLI updated" -ForegroundColor Green
Write-Host ""

# Step 2: Generate native projects
Write-Host "🏗️  Step 2: Generating native projects (android & ios)..." -ForegroundColor Yellow
Write-Host "This will create android/ and ios/ folders with react-native-webrtc configured" -ForegroundColor Gray
npx expo prebuild --clean
Write-Host "✅ Native projects generated" -ForegroundColor Green
Write-Host ""

# Step 3: Check if Android SDK is available
Write-Host "🤖 Step 3: Checking Android SDK..." -ForegroundColor Yellow
$androidHome = $env:ANDROID_HOME
if ($androidHome) {
    Write-Host "✅ Android SDK found at: $androidHome" -ForegroundColor Green
    Write-Host ""
    
    # Step 4: Build and run on Android
    Write-Host "🚀 Step 4: Building and running on Android..." -ForegroundColor Yellow
    Write-Host "Make sure your Android device/emulator is connected" -ForegroundColor Gray
    Write-Host ""
    
    $response = Read-Host "Ready to build? (y/n)"
    if ($response -eq "y") {
        npx expo run:android
    } else {
        Write-Host "⏸️  Skipped Android build. Run manually with: npx expo run:android" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  Android SDK not found" -ForegroundColor Red
    Write-Host "Options:" -ForegroundColor Yellow
    Write-Host "  1. Install Android Studio: https://developer.android.com/studio" -ForegroundColor Gray
    Write-Host "  2. Or use EAS cloud build: eas build --profile development --platform android" -ForegroundColor Gray
    Write-Host ""
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Install the development build on your device" -ForegroundColor White
Write-Host "  2. Run: npm start" -ForegroundColor White
Write-Host "  3. Open the app (it will connect to dev server)" -ForegroundColor White
Write-Host "  4. Navigate to: /call?calleeId=test&calleeName=Test" -ForegroundColor White
Write-Host ""
Write-Host "📖 Full documentation: VIDEO_CALL_EXPO_FIX.md" -ForegroundColor Gray
