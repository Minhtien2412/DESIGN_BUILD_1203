# Get SHA-1 Fingerprint for Google OAuth Android Setup
# This script helps you get the SHA-1 certificate fingerprint needed for Google Cloud Console

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Google OAuth SHA-1 Fingerprint Helper" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if keytool exists
$keytool = Get-Command keytool -ErrorAction SilentlyContinue
if (-not $keytool) {
    Write-Host "❌ ERROR: keytool not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "keytool is part of Java JDK. Please install JDK first:" -ForegroundColor Yellow
    Write-Host "  Download: https://www.oracle.com/java/technologies/downloads/" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "After installing JDK, add to PATH:" -ForegroundColor Yellow
    Write-Host '  $env:PATH += ";C:\Program Files\Java\jdk-XX\bin"' -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host "✅ keytool found: $($keytool.Source)" -ForegroundColor Green
Write-Host ""

# Debug keystore path
$debugKeystore = "$env:USERPROFILE\.android\debug.keystore"

Write-Host "Checking debug keystore..." -ForegroundColor Cyan
Write-Host "Path: $debugKeystore" -ForegroundColor Gray
Write-Host ""

if (-not (Test-Path $debugKeystore)) {
    Write-Host "❌ Debug keystore not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "The debug keystore is created automatically when you run:" -ForegroundColor Yellow
    Write-Host "  npx expo run:android" -ForegroundColor Yellow
    Write-Host "or" -ForegroundColor Yellow
    Write-Host "  npx react-native run-android" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please build your app once to generate the debug keystore." -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host "✅ Debug keystore found!" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DEVELOPMENT SHA-1 FINGERPRINT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

try {
    # Get SHA-1 from debug keystore
    $output = & keytool -keystore $debugKeystore -list -v -alias androiddebugkey -storepass android -keypass android 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to read keystore" -ForegroundColor Red
        Write-Host $output -ForegroundColor Red
        exit 1
    }
    
    # Extract SHA-1
    $sha1Line = $output | Select-String -Pattern "SHA1:"
    
    if ($sha1Line) {
        $sha1 = $sha1Line.ToString().Split(":")[1].Trim()
        
        Write-Host "✅ SHA-1 Fingerprint (Debug):" -ForegroundColor Green
        Write-Host ""
        Write-Host "  $sha1" -ForegroundColor Yellow
        Write-Host ""
        
        # Copy to clipboard if possible
        try {
            Set-Clipboard -Value $sha1
            Write-Host "✅ SHA-1 copied to clipboard!" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  Could not copy to clipboard. Please copy manually." -ForegroundColor Yellow
        }
        
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "NEXT STEPS" -ForegroundColor Cyan
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "1. Go to Google Cloud Console:" -ForegroundColor White
        Write-Host "   https://console.cloud.google.com/apis/credentials" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "2. Create or Edit OAuth Client ID (Android type)" -ForegroundColor White
        Write-Host ""
        Write-Host "3. Paste this SHA-1 into 'SHA-1 certificate fingerprint' field:" -ForegroundColor White
        Write-Host "   $sha1" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "4. Set Package name:" -ForegroundColor White
        Write-Host "   com.adminmarketingnx.APP_DESIGN_BUILD" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "5. Copy the Android Client ID and add to .env:" -ForegroundColor White
        Write-Host "   EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-client-id" -ForegroundColor Yellow
        Write-Host ""
        
    } else {
        Write-Host "❌ Could not find SHA-1 in keystore output" -ForegroundColor Red
        Write-Host ""
        Write-Host "Full output:" -ForegroundColor Gray
        Write-Host $output -ForegroundColor Gray
    }
    
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Option to get release SHA-1
Write-Host "Do you also need the RELEASE SHA-1? (y/n): " -ForegroundColor Cyan -NoNewline
$response = Read-Host

if ($response -eq "y" -or $response -eq "Y") {
    Write-Host ""
    Write-Host "Please enter the path to your release keystore:" -ForegroundColor Cyan
    Write-Host "(Example: C:\path\to\my-release-key.keystore)" -ForegroundColor Gray
    $releaseKeystore = Read-Host "Path"
    
    if (Test-Path $releaseKeystore) {
        Write-Host ""
        Write-Host "Enter keystore alias (default: my-key-alias): " -ForegroundColor Cyan -NoNewline
        $alias = Read-Host
        if ([string]::IsNullOrWhiteSpace($alias)) {
            $alias = "my-key-alias"
        }
        
        Write-Host ""
        Write-Host "Running keytool... You will be prompted for keystore password." -ForegroundColor Yellow
        Write-Host ""
        
        & keytool -keystore $releaseKeystore -list -v -alias $alias
        
    } else {
        Write-Host "❌ Release keystore not found at: $releaseKeystore" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Done! 🎉" -ForegroundColor Green
Write-Host ""
