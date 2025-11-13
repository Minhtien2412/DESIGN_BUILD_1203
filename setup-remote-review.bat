@echo off
REM Quick Remote Review Setup Script for Windows
REM Chạy script này để setup nhanh các options review từ xa

echo 🔍 APP DESIGN BUILD - Remote Review Setup (Windows)
echo ==========================================

REM Check current environment
echo 📊 Checking current setup...
node --version 2>nul && echo ✅ Node.js found || echo ❌ Node.js not found
npm --version 2>nul && echo ✅ NPM found || echo ❌ NPM not found

REM Check if Expo is working
expo --version 2>nul && echo ✅ Expo CLI found || echo ❌ Expo CLI not found

echo.
echo 📋 Available build scripts:
findstr /c:"\"build" /c:"\"start" /c:"\"web" package.json 2>nul || echo No build scripts found

echo.
echo 🚀 Quick Setup Options:
echo.

REM Option 1: Web Version
echo 1️⃣  WEB VERSION (Recommended - 30 seconds)
echo    Command: npm run web
echo    Result: Browser preview at http://localhost:3000
echo.

REM Option 2: Firebase App Distribution  
echo 2️⃣  FIREBASE APP DISTRIBUTION (Mobile APK)
echo    Setup time: ~10 minutes
echo    Result: APK downloadable via email link
echo.

REM Option 3: ngrok Tunnel
echo 3️⃣  NGROK TUNNEL (Real-time dev server)
echo    Setup time: ~2 minutes
echo    Result: Public URL for Metro bundler
echo.

REM Option 4: Build APK
echo 4️⃣  BUILD APK (Local file sharing)
echo    Command: npm run build:preview
echo    Result: APK file to upload to Google Drive/etc
echo.

echo ==========================================
echo 🎯 Choose your preferred option:
echo.

set /p option="Enter option (1-4): "

if "%option%"=="1" (
    echo 🌐 Starting web version...
    if exist "node_modules\.bin\expo.cmd" (
        npm run web
    ) else (
        echo ❌ Missing dependencies. Run: npm install
    )
) else if "%option%"=="2" (
    echo 📱 Firebase App Distribution setup...
    echo 1. Install Firebase CLI: npm install -g firebase-tools
    echo 2. Login: firebase login
    echo 3. Init: firebase init appdistribution  
    echo 4. Build APK: npm run build:preview
    echo 5. Distribute: firebase appdistribution:distribute ...
    echo.
    set /p firebase_setup="Continue with Firebase setup? (y/n): "
    if /i "%firebase_setup%"=="y" (
        firebase --version 2>nul || (
            echo Installing Firebase CLI...
            npm install -g firebase-tools
        )
        echo Please run: firebase login
        echo Then: firebase init appdistribution
    )
) else if "%option%"=="3" (
    echo 🔗 Setting up ngrok tunnel...
    ngrok version 2>nul || (
        echo Installing ngrok...
        echo Please download ngrok from: https://ngrok.com/download
        echo And add to PATH
        pause
    )
    
    echo Starting Metro bundler in background...
    start /b npm start
    
    timeout /t 10 /nobreak
    echo Creating tunnel...
    start /b ngrok http 8081
    
    timeout /t 5 /nobreak
    echo.
    echo 🎉 Setup complete!
    echo Check ngrok dashboard at: http://localhost:4040
    echo.
    echo To stop: Close command windows or Ctrl+C
) else if "%option%"=="4" (
    echo 🏗️ Building APK...
    if exist "eas.json" (
        echo Using EAS build...
        eas --version 2>nul || (
            echo Installing EAS CLI...
            npm install -g eas-cli
        )
        eas build --profile preview --platform android
    ) else (
        echo Using Expo build...
        npm run build:preview
    )
    
    echo 📤 APK built! Upload to:
    echo - Google Drive
    echo - WeTransfer
    echo - Dropbox  
    echo - Or any file sharing service
) else (
    echo ❌ Invalid option. Please run script again.
    pause
    exit /b 1
)

echo.
echo ✅ Setup complete!
echo 📋 Next steps written to REMOTE_REVIEW_OPTIONS.md
pause