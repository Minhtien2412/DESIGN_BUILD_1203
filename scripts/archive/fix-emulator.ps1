# =============================================
# Fix Android Emulator Connection Issues
# =============================================

Write-Host "`n[FIX] Android Emulator Connection Troubleshooter" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: Check if emulator is running
Write-Host "[STEP 1] Checking for running emulators..." -ForegroundColor Yellow
$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"

if (-Not (Test-Path $adb)) {
    Write-Host "[ERROR] ADB not found at: $adb" -ForegroundColor Red
    Write-Host "Please install Android SDK Platform-Tools" -ForegroundColor Red
    exit 1
}

& $adb devices
Write-Host ""

# Step 2: Kill ADB server
Write-Host "[STEP 2] Restarting ADB server..." -ForegroundColor Yellow
& $adb kill-server
Start-Sleep -Seconds 2
& $adb start-server
Write-Host "[OK] ADB server restarted`n" -ForegroundColor Green

# Step 3: List available emulators
Write-Host "[STEP 3] Available emulators:" -ForegroundColor Yellow
$emulatorPath = "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe"

if (Test-Path $emulatorPath) {
    & $emulatorPath -list-avds
    Write-Host ""
} else {
    Write-Host "[ERROR] Emulator not found at: $emulatorPath" -ForegroundColor Red
    Write-Host "Please install Android Emulator via Android Studio" -ForegroundColor Red
    exit 1
}

# Step 4: Options
Write-Host "[OPTIONS] What would you like to do?" -ForegroundColor Cyan
Write-Host "1. Start emulator manually" -ForegroundColor White
Write-Host "2. Use physical device (recommended for WebRTC)" -ForegroundColor White
Write-Host "3. Kill all emulator processes" -ForegroundColor White
Write-Host "4. Exit" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter choice (1-4)"

switch ($choice) {
    "1" {
        Write-Host "`n[ACTION] Starting emulator..." -ForegroundColor Yellow
        Write-Host "Available AVDs:" -ForegroundColor White
        & $emulatorPath -list-avds
        Write-Host ""
        $avdName = Read-Host "Enter AVD name"
        
        Write-Host "[INFO] Starting $avdName..." -ForegroundColor Yellow
        Start-Process -FilePath $emulatorPath -ArgumentList "-avd", $avdName
        
        Write-Host "[INFO] Waiting for emulator to boot..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
        
        Write-Host "[INFO] Checking device status..." -ForegroundColor Yellow
        & $adb wait-for-device
        & $adb devices
        
        Write-Host "`n[OK] Emulator started!" -ForegroundColor Green
        Write-Host "[INFO] Now run: npm run run:dev:android" -ForegroundColor Cyan
    }
    
    "2" {
        Write-Host "`n[INFO] Using physical device:" -ForegroundColor Yellow
        Write-Host "1. Connect phone via USB" -ForegroundColor White
        Write-Host "2. Enable Developer Options:" -ForegroundColor White
        Write-Host "   Settings > About phone > Tap 'Build number' 7 times" -ForegroundColor Gray
        Write-Host "3. Enable USB Debugging:" -ForegroundColor White
        Write-Host "   Settings > Developer options > USB debugging" -ForegroundColor Gray
        Write-Host "4. Accept debugging prompt on phone" -ForegroundColor White
        Write-Host ""
        
        Write-Host "Press Enter when ready..."
        Read-Host
        
        Write-Host "[INFO] Checking connected devices..." -ForegroundColor Yellow
        & $adb devices
        Write-Host ""
        Write-Host "[INFO] If device appears above, run: npm run run:dev:android" -ForegroundColor Cyan
    }
    
    "3" {
        Write-Host "`n[ACTION] Killing all emulator processes..." -ForegroundColor Yellow
        Get-Process | Where-Object {$_.ProcessName -like "*emulator*"} | Stop-Process -Force
        Get-Process | Where-Object {$_.ProcessName -like "*qemu*"} | Stop-Process -Force
        Write-Host "[OK] All emulator processes killed" -ForegroundColor Green
        
        Write-Host "[INFO] Restarting ADB..." -ForegroundColor Yellow
        & $adb kill-server
        Start-Sleep -Seconds 2
        & $adb start-server
        Write-Host "[OK] Done" -ForegroundColor Green
    }
    
    "4" {
        Write-Host "[EXIT] Goodbye!" -ForegroundColor Cyan
        exit 0
    }
    
    default {
        Write-Host "[ERROR] Invalid choice" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "[COMPLETE] Troubleshooting finished" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
