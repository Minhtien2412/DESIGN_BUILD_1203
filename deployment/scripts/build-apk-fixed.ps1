# Build APK Script - Fixed Dependencies
# Tự động build APK sau khi đã fix các lỗi dependencies

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " BUILD APK - FIXED VERSION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Clean Android build caches
Write-Host "[1/4] Cleaning Android build caches..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\android"
Remove-Item -Recurse -Force .\app\build,.\build,.\.gradle -ErrorAction SilentlyContinue
Write-Host "✓ Cleaned" -ForegroundColor Green
Write-Host ""

# Step 2: Build debug APK
Write-Host "[2/4] Building debug APK (this may take 3-5 minutes)..." -ForegroundColor Yellow
.\gradlew.bat assembleDebug

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Build failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common fixes:" -ForegroundColor Yellow
    Write-Host "- Run: npx expo prebuild --clean" -ForegroundColor Gray
    Write-Host "- Check Java version: java -version (need Java 17)" -ForegroundColor Gray
    exit 1
}

Write-Host "✓ Build successful!" -ForegroundColor Green
Write-Host ""

# Step 3: Locate APK
Write-Host "[3/4] Locating APK file..." -ForegroundColor Yellow
$apkPath = ".\app\build\outputs\apk\debug\app-debug.apk"

if (Test-Path $apkPath) {
    $apkSize = (Get-Item $apkPath).Length / 1MB
    Write-Host "✓ Found APK: $apkPath" -ForegroundColor Green
    Write-Host "  Size: $([math]::Round($apkSize, 2)) MB" -ForegroundColor Gray
    Write-Host ""
    
    # Step 4: Copy to root directory
    Write-Host "[4/4] Copying APK to root..." -ForegroundColor Yellow
    $destPath = "..\app-debug.apk"
    Copy-Item $apkPath $destPath -Force
    Write-Host "✓ APK copied to: $destPath" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host " BUILD COMPLETE!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "APK Location:" -ForegroundColor White
    Write-Host "  $destPath" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Install on Android:" -ForegroundColor White
    Write-Host "  1. Transfer APK to your Android device" -ForegroundColor Gray
    Write-Host "  2. Enable 'Install from unknown sources' in Settings" -ForegroundColor Gray
    Write-Host "  3. Open APK file to install" -ForegroundColor Gray
    Write-Host ""
    
} else {
    Write-Host "✗ APK not found at expected location!" -ForegroundColor Red
    Write-Host "  Expected: $apkPath" -ForegroundColor Gray
    exit 1
}

Set-Location $PSScriptRoot
