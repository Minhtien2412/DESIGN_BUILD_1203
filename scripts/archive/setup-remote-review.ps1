# Quick Remote Review Setup for APP_DESIGN_BUILD
# PowerShell script cho Windows

Write-Host "🔍 APP DESIGN BUILD - Remote Review Setup" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Check current environment
Write-Host "`n📊 Checking current setup..." -ForegroundColor Yellow

try {
    $nodeVersion = node --version 2>$null
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found" -ForegroundColor Red
}

try {
    $npmVersion = npm --version 2>$null
    Write-Host "✅ NPM: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ NPM not found" -ForegroundColor Red
}

try {
    $expoVersion = expo --version 2>$null
    Write-Host "✅ Expo CLI: $expoVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Expo CLI not found" -ForegroundColor Red
}

# Check package.json for scripts
Write-Host "`n📋 Available build scripts:" -ForegroundColor Yellow
if (Test-Path "package.json") {
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    $packageJson.scripts.PSObject.Properties | Where-Object { $_.Name -like "*build*" -or $_.Name -like "*start*" -or $_.Name -like "*web*" } | ForEach-Object {
        Write-Host "  $($_.Name): $($_.Value)" -ForegroundColor White
    }
} else {
    Write-Host "❌ package.json not found" -ForegroundColor Red
}

Write-Host "`n🚀 Quick Setup Options:" -ForegroundColor Cyan
Write-Host ""

Write-Host "1️⃣  WEB VERSION (Recommended - 30 seconds)" -ForegroundColor Green
Write-Host "   Command: npm run web" -ForegroundColor Gray
Write-Host "   Result: Browser preview at http://localhost:3000" -ForegroundColor Gray
Write-Host ""

Write-Host "2️⃣  FIREBASE APP DISTRIBUTION (Mobile APK)" -ForegroundColor Green
Write-Host "   Setup time: ~10 minutes" -ForegroundColor Gray
Write-Host "   Result: APK downloadable via email link" -ForegroundColor Gray
Write-Host ""

Write-Host "3️⃣  NGROK TUNNEL (Real-time dev server)" -ForegroundColor Green
Write-Host "   Setup time: ~2 minutes" -ForegroundColor Gray
Write-Host "   Result: Public URL for Metro bundler" -ForegroundColor Gray
Write-Host ""

Write-Host "4️⃣  BUILD APK (Local file sharing)" -ForegroundColor Green
Write-Host "   Command: npm run build:preview" -ForegroundColor Gray
Write-Host "   Result: APK file to upload to Google Drive/etc" -ForegroundColor Gray
Write-Host ""

Write-Host "5️⃣  QUICK WEB DEPLOY (Vercel/Netlify)" -ForegroundColor Green
Write-Host "   Setup time: ~5 minutes" -ForegroundColor Gray
Write-Host "   Result: Live URL for instant sharing" -ForegroundColor Gray
Write-Host ""

Write-Host "==========================================" -ForegroundColor Cyan
$option = Read-Host "🎯 Choose your preferred option (1-5)"

switch ($option) {
    "1" {
        Write-Host "🌐 Starting web version..." -ForegroundColor Yellow
        if (Test-Path "node_modules\.bin\expo.cmd") {
            try {
                npm run web
            } catch {
                Write-Host "❌ Error starting web version. Try: npm install" -ForegroundColor Red
            }
        } else {
            Write-Host "❌ Missing dependencies. Run: npm install" -ForegroundColor Red
        }
    }
    
    "2" {
        Write-Host "📱 Firebase App Distribution setup..." -ForegroundColor Yellow
        Write-Host "1. Install Firebase CLI: npm install -g firebase-tools" -ForegroundColor White
        Write-Host "2. Login: firebase login" -ForegroundColor White
        Write-Host "3. Init: firebase init appdistribution" -ForegroundColor White
        Write-Host "4. Build APK: npm run build:preview" -ForegroundColor White
        Write-Host "5. Distribute: firebase appdistribution:distribute ..." -ForegroundColor White
        Write-Host ""
        
        $firebase_setup = Read-Host "Continue with Firebase setup? (y/n)"
        if ($firebase_setup -eq "y") {
            try {
                firebase --version 2>$null
                Write-Host "✅ Firebase CLI already installed" -ForegroundColor Green
            } catch {
                Write-Host "Installing Firebase CLI..." -ForegroundColor Yellow
                npm install -g firebase-tools
            }
            Write-Host "Next steps:" -ForegroundColor Cyan
            Write-Host "1. Run: firebase login" -ForegroundColor White
            Write-Host "2. Run: firebase init appdistribution" -ForegroundColor White
            Write-Host "3. See FIREBASE_DISTRIBUTION_GUIDE.md for details" -ForegroundColor White
        }
    }
    
    "3" {
        Write-Host "🔗 Setting up ngrok tunnel..." -ForegroundColor Yellow
        
        try {
            ngrok version 2>$null
            Write-Host "✅ ngrok found" -ForegroundColor Green
        } catch {
            Write-Host "❌ ngrok not found. Please download from: https://ngrok.com/download" -ForegroundColor Red
            Write-Host "And add to PATH" -ForegroundColor Red
            return
        }
        
        Write-Host "Starting Metro bundler..." -ForegroundColor Yellow
        Start-Process "npm" -ArgumentList "start" -NoNewWindow
        
        Start-Sleep 10
        Write-Host "Creating tunnel..." -ForegroundColor Yellow
        Start-Process "ngrok" -ArgumentList "http", "8081"
        
        Start-Sleep 5
        Write-Host ""
        Write-Host "🎉 Setup complete!" -ForegroundColor Green
        Write-Host "Check ngrok dashboard at: http://localhost:4040" -ForegroundColor Cyan
        Write-Host "Share the public URL with reviewers" -ForegroundColor White
    }
    
    "4" {
        Write-Host "🏗️ Building APK..." -ForegroundColor Yellow
        
        if (Test-Path "eas.json") {
            Write-Host "Using EAS build..." -ForegroundColor Gray
            try {
                eas --version 2>$null
                Write-Host "✅ EAS CLI found" -ForegroundColor Green
            } catch {
                Write-Host "Installing EAS CLI..." -ForegroundColor Yellow
                npm install -g eas-cli
            }
            eas build --profile preview --platform android
        } else {
            Write-Host "Using npm build script..." -ForegroundColor Gray
            npm run build:preview
        }
        
        Write-Host ""
        Write-Host "📤 APK built! Upload to:" -ForegroundColor Green
        Write-Host "- Google Drive (https://drive.google.com)" -ForegroundColor White
        Write-Host "- WeTransfer (https://wetransfer.com)" -ForegroundColor White
        Write-Host "- Dropbox (https://dropbox.com)" -ForegroundColor White
        Write-Host "- OneDrive (https://onedrive.live.com)" -ForegroundColor White
    }
    
    "5" {
        Write-Host "🚀 Quick web deploy..." -ForegroundColor Yellow
        
        # Check if Vercel CLI is available
        try {
            vercel --version 2>$null
            Write-Host "✅ Vercel CLI found" -ForegroundColor Green
        } catch {
            Write-Host "Installing Vercel CLI..." -ForegroundColor Yellow
            npm install -g vercel
        }
        
        Write-Host "Building web version..." -ForegroundColor Gray
        npm run web
        
        Write-Host ""
        Write-Host "Deploy options:" -ForegroundColor Cyan
        Write-Host "1. Vercel: vercel --prod" -ForegroundColor White
        Write-Host "2. Netlify: npx netlify deploy --prod" -ForegroundColor White
        Write-Host "3. Surge: npx surge dist/" -ForegroundColor White
        
        $deploy_choice = Read-Host "Choose deployment (1-3) or skip (s)"
        switch ($deploy_choice) {
            "1" { vercel --prod }
            "2" { 
                try {
                    netlify --version 2>$null
                } catch {
                    npm install -g netlify-cli
                }
                npx netlify deploy --prod 
            }
            "3" {
                try {
                    surge --version 2>$null
                } catch {
                    npm install -g surge
                }
                npx surge dist/
            }
            default { Write-Host "Skipping deployment. Build ready in dist/ folder" -ForegroundColor Gray }
        }
    }
    
    default {
        Write-Host "❌ Invalid option. Please run script again." -ForegroundColor Red
        return
    }
}

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host "📋 Check REMOTE_REVIEW_OPTIONS.md for more details" -ForegroundColor Cyan
Write-Host "📱 Check FIREBASE_DISTRIBUTION_GUIDE.md for Firebase setup" -ForegroundColor Cyan

Read-Host "Press Enter to exit"