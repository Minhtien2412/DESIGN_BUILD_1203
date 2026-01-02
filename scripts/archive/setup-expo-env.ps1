# Quick Start Script - Expo Development Setup
# Run this after installing Java JDK 17 and Android Studio

Write-Host "=== Expo Development Environment Setup ===" -ForegroundColor Cyan

# 1. Verify Java
Write-Host "`n[1/6] Checking Java installation..." -ForegroundColor Yellow
try {
    $javaVersion = java -version 2>&1 | Select-String "version" | Select-Object -First 1
    Write-Host "[OK] Java found: $javaVersion" -ForegroundColor Green
} catch {
    Write-Host "[FAIL] Java not found!" -ForegroundColor Red
    Write-Host "Please install JDK 17 from: https://adoptium.net/temurin/releases/?version=17" -ForegroundColor Yellow
    exit 1
}

# 2. Set JAVA_HOME if not set
Write-Host "`n[2/6] Checking JAVA_HOME..." -ForegroundColor Yellow
if (-not $env:JAVA_HOME) {
    Write-Host "[WARN] JAVA_HOME not set" -ForegroundColor Red
    Write-Host "Finding Java installation..." -ForegroundColor Yellow
    
    $possiblePaths = @(
        "C:\Program Files\Eclipse Adoptium\jdk-17*",
        "C:\Program Files\Java\jdk-17*",
        "C:\Program Files\OpenJDK\jdk-17*"
    )
    
    foreach ($pattern in $possiblePaths) {
        $jdkPath = Get-Item $pattern -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($jdkPath) {
            $env:JAVA_HOME = $jdkPath.FullName
            [System.Environment]::SetEnvironmentVariable("JAVA_HOME", $env:JAVA_HOME, "User")
            Write-Host "[OK] JAVA_HOME set to: $env:JAVA_HOME" -ForegroundColor Green
            break
        }
    }
    
    if (-not $env:JAVA_HOME) {
        Write-Host "[FAIL] Could not find JDK automatically. Please set JAVA_HOME manually." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "[OK] JAVA_HOME: $env:JAVA_HOME" -ForegroundColor Green
}

# 3. Verify Android SDK
Write-Host "`n[3/6] Checking Android SDK..." -ForegroundColor Yellow
$androidHome = "$env:LOCALAPPDATA\Android\Sdk"
if (Test-Path $androidHome) {
    Write-Host "[OK] Android SDK found: $androidHome" -ForegroundColor Green
    $env:ANDROID_HOME = $androidHome
    [System.Environment]::SetEnvironmentVariable("ANDROID_HOME", $androidHome, "User")
} else {
    Write-Host "[WARN] Android SDK not found at: $androidHome" -ForegroundColor Red
    Write-Host "Please install Android Studio from: https://developer.android.com/studio" -ForegroundColor Yellow
}

# 4. Verify adb
Write-Host "`n[4/6] Checking Android Debug Bridge..." -ForegroundColor Yellow
try {
    $adbVersion = adb version 2>&1 | Select-String "Android Debug Bridge" | Select-Object -First 1
    Write-Host "[OK] ADB found: $adbVersion" -ForegroundColor Green
} catch {
    Write-Host "[WARN] ADB not in PATH. Adding platform-tools..." -ForegroundColor Yellow
    $platformTools = "$androidHome\platform-tools"
    if (Test-Path $platformTools) {
        $env:PATH = "$platformTools;$env:PATH"
        Write-Host "[OK] Added to PATH for this session" -ForegroundColor Green
    }
}

# 5. Run patch script
Write-Host "`n[5/6] Running asset patch script..." -ForegroundColor Yellow
if (Test-Path "scripts\patch-expo-router-assets.js") {
    node scripts\patch-expo-router-assets.js
    Write-Host "[OK] Asset patch completed" -ForegroundColor Green
} else {
    Write-Host "[WARN] Patch script not found" -ForegroundColor Yellow
}

# 6. Check npm dependencies
Write-Host "`n[6/6] Checking npm dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host "[OK] Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "[OK] Dependencies already installed" -ForegroundColor Green
}

# Summary
Write-Host "`n=== Setup Complete ===" -ForegroundColor Cyan
Write-Host "`nNext steps:" -ForegroundColor Green
Write-Host "  1. Start Metro bundler:  npx expo start" -ForegroundColor White
Write-Host "  2. Build dev client:     npx expo run:android" -ForegroundColor White
Write-Host "  3. Or use Expo Go:       Install from Google Play, scan QR code" -ForegroundColor White
Write-Host "`nFor detailed guide, see: EXPO_SETUP_GUIDE.md" -ForegroundColor Yellow
