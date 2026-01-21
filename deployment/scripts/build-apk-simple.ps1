# Script to build APK by temporarily removing problematic dependencies
Write-Host "`n=== BUILD APK SCRIPT ===" -ForegroundColor Cyan
Write-Host "Tạm thời loại bỏ các dependency có vấn đề để build APK`n" -ForegroundColor Yellow

# Stop Metro if running
Write-Host "1. Stopping Metro bundler..." -ForegroundColor Green
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Clean build artifacts
Write-Host "2. Cleaning build artifacts..." -ForegroundColor Green
Remove-Item -Path "android\app\build" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "android\.gradle" -Recurse -Force -ErrorAction SilentlyContinue

# Comment out document-picker in package.json
Write-Host "3. Temporarily removing react-native-document-picker..." -ForegroundColor Green
$packageJson = Get-Content "package.json" -Raw
$packageJsonBackup = $packageJson
$packageJson = $packageJson -replace '"react-native-document-picker":\s*"[^"]*",?', '// "react-native-document-picker": "temporarily removed",'
Set-Content "package.json" -Value $packageJson

# Reinstall dependencies
Write-Host "4. Reinstalling dependencies (this may take a while)..." -ForegroundColor Green
npm install

# Build debug APK
Write-Host "5. Building debug APK..." -ForegroundColor Green
cd android
.\gradlew.bat assembleDebug

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ BUILD SUCCESSFUL!" -ForegroundColor Green
    $apkPath = "app\build\outputs\apk\debug\app-debug.apk"
    if (Test-Path $apkPath) {
        $apkSize = (Get-Item $apkPath).Length / 1MB
        Write-Host "`nAPK Location: android\$apkPath" -ForegroundColor Cyan
        Write-Host "APK Size: $([math]::Round($apkSize, 2)) MB" -ForegroundColor Cyan
        
        # Copy to root for easy access
        Copy-Item $apkPath "..\app-debug.apk" -Force
        Write-Host "`nCopied to: app-debug.apk (in project root)" -ForegroundColor Green
    }
} else {
    Write-Host "`n❌ BUILD FAILED!" -ForegroundColor Red
}

cd ..

# Restore package.json
Write-Host "6. Restoring package.json..." -ForegroundColor Green
Set-Content "package.json" -Value $packageJsonBackup

Write-Host "`n=== SCRIPT COMPLETE ===" -ForegroundColor Cyan
