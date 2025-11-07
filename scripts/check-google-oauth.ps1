# Google OAuth Setup Checker
# Run this to verify your configuration

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " GOOGLE OAUTH SETUP CHECKER" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$hasErrors = $false

# Check .env file exists
Write-Host "1. Checking .env file..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "   ✅ .env file found" -ForegroundColor Green
    
    # Read .env and check for Client IDs
    $envContent = Get-Content ".env" -Raw
    
    # Check Web Client ID
    Write-Host ""
    Write-Host "2. Checking Web Client ID..." -ForegroundColor Yellow
    if ($envContent -match "EXPO_PUBLIC_GOOGLE_CLIENT_ID=([0-9]+-[a-zA-Z0-9]+\.apps\.googleusercontent\.com)") {
        $webClientId = $matches[1]
        Write-Host "   ✅ Found: $($webClientId.Substring(0, 30))..." -ForegroundColor Green
    } else {
        Write-Host "   ❌ MISSING or INVALID" -ForegroundColor Red
        Write-Host "   Add: EXPO_PUBLIC_GOOGLE_CLIENT_ID=xxx-xxx.apps.googleusercontent.com" -ForegroundColor Yellow
        $hasErrors = $true
    }
    
    # Check Android Client ID
    Write-Host ""
    Write-Host "3. Checking Android Client ID..." -ForegroundColor Yellow
    if ($envContent -match "EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=([0-9]+-[a-zA-Z0-9]+\.apps\.googleusercontent\.com)") {
        $androidClientId = $matches[1]
        Write-Host "   ✅ Found: $($androidClientId.Substring(0, 30))..." -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  MISSING or EMPTY" -ForegroundColor Yellow
        Write-Host "   This is required for Android app" -ForegroundColor Yellow
        Write-Host "   See: docs/GOOGLE_OAUTH_QUICK_START.md" -ForegroundColor Cyan
    }
    
    # Check iOS Client ID
    Write-Host ""
    Write-Host "4. Checking iOS Client ID..." -ForegroundColor Yellow
    if ($envContent -match "EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=([0-9]+-[a-zA-Z0-9]+\.apps\.googleusercontent\.com)") {
        $iosClientId = $matches[1]
        Write-Host "   ✅ Found: $($iosClientId.Substring(0, 30))..." -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  MISSING or EMPTY" -ForegroundColor Yellow
        Write-Host "   This is required for iOS app" -ForegroundColor Yellow
        Write-Host "   See: docs/GOOGLE_OAUTH_QUICK_START.md" -ForegroundColor Cyan
    }
    
} else {
    Write-Host "   ❌ .env file NOT FOUND!" -ForegroundColor Red
    Write-Host "   Copy .env.example to .env" -ForegroundColor Yellow
    $hasErrors = $true
}

# Check Expo username
Write-Host ""
Write-Host "5. Checking Expo configuration..." -ForegroundColor Yellow
try {
    $expoUsername = npx expo whoami 2>&1 | Out-String
    if ($expoUsername -match "Not logged in") {
        Write-Host "   ⚠️  Not logged in to Expo" -ForegroundColor Yellow
        Write-Host "   Run: npx expo login" -ForegroundColor Cyan
    } else {
        $username = $expoUsername.Trim()
        Write-Host "   ✅ Expo username: $username" -ForegroundColor Green
        Write-Host ""
        Write-Host "   Your redirect URI should be:" -ForegroundColor Cyan
        Write-Host "   https://auth.expo.io/@$username/APP_DESIGN_BUILD" -ForegroundColor White
    }
} catch {
    Write-Host "   ⚠️  Could not check Expo username" -ForegroundColor Yellow
}

# Check package.json for required packages
Write-Host ""
Write-Host "6. Checking required packages..." -ForegroundColor Yellow
if (Test-Path "package.json") {
    $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
    
    $requiredPackages = @(
        "expo-auth-session",
        "expo-web-browser"
    )
    
    $allFound = $true
    foreach ($pkg in $requiredPackages) {
        if ($packageJson.dependencies.$pkg) {
            Write-Host "   ✅ $pkg installed" -ForegroundColor Green
        } else {
            Write-Host "   ❌ $pkg NOT installed" -ForegroundColor Red
            $allFound = $false
        }
    }
    
    if (-not $allFound) {
        Write-Host ""
        Write-Host "   Run: npm install" -ForegroundColor Yellow
        $hasErrors = $true
    }
} else {
    Write-Host "   ❌ package.json NOT FOUND!" -ForegroundColor Red
    $hasErrors = $true
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
if ($hasErrors) {
    Write-Host " ❌ SETUP INCOMPLETE" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Read: docs/GOOGLE_OAUTH_QUICK_START.md" -ForegroundColor White
    Write-Host "2. Create OAuth Client IDs on Google Cloud Console" -ForegroundColor White
    Write-Host "3. Update .env with Client IDs" -ForegroundColor White
    Write-Host "4. Run: npx expo start -c" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host " ✅ CONFIGURATION LOOKS GOOD!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Build development build:" -ForegroundColor White
    Write-Host "   eas build --profile development --platform android" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "2. Or run locally:" -ForegroundColor White
    Write-Host "   npx expo run:android" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "3. Test Google Sign-in!" -ForegroundColor White
    Write-Host ""
}

Write-Host ""
