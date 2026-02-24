# Phase 1 E2E Testing - PowerShell Helper Scripts
# Quick commands to assist manual testing

Write-Host "`n╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     PHASE 1 E2E TESTING - HELPER COMMANDS                    ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

function Show-TestMenu {
    Write-Host "Available Commands:" -ForegroundColor Yellow
    Write-Host "  1. start-app       - Start Expo dev server" -ForegroundColor White
    Write-Host "  2. open-android    - Open on Android emulator" -ForegroundColor White
    Write-Host "  3. open-ios        - Open on iOS simulator" -ForegroundColor White
    Write-Host "  4. open-web        - Open in web browser" -ForegroundColor White
    Write-Host "  5. check-logs      - View app logs" -ForegroundColor White
    Write-Host "  6. clear-cache     - Clear app cache" -ForegroundColor White
    Write-Host "  7. reset-app       - Reset app data (close & reopen)" -ForegroundColor White
    Write-Host "  8. show-test-plan  - Open test plan document" -ForegroundColor White
    Write-Host "  9. show-checklist  - Show quick test checklist" -ForegroundColor White
    Write-Host "  10. record-bug     - Create bug report template" -ForegroundColor White
    Write-Host "  0. exit            - Exit test menu`n" -ForegroundColor White
}

function Start-ExpoApp {
    Write-Host "`n▶ Starting Expo dev server..." -ForegroundColor Green
    npx expo start
}

function Open-AndroidApp {
    Write-Host "`n📱 Opening on Android emulator..." -ForegroundColor Green
    Write-Host "Note: Make sure Android emulator is running first!" -ForegroundColor Yellow
    # Send 'a' key to expo terminal
    # This requires expo to be running in another terminal
    Write-Host "Press 'a' in the Expo terminal to open Android" -ForegroundColor Cyan
}

function Open-iOSApp {
    Write-Host "`n📱 Opening on iOS simulator..." -ForegroundColor Green
    Write-Host "Press 'i' in the Expo terminal to open iOS" -ForegroundColor Cyan
}

function Open-WebApp {
    Write-Host "`n🌐 Opening in web browser..." -ForegroundColor Green
    Write-Host "Press 'w' in the Expo terminal to open web" -ForegroundColor Cyan
    Start-Process "http://localhost:8081"
}

function Show-AppLogs {
    Write-Host "`n📋 Recent app logs:" -ForegroundColor Green
    Write-Host "Check the Expo terminal for runtime logs" -ForegroundColor Cyan
    Write-Host "Or use: npx react-native log-android" -ForegroundColor Cyan
    Write-Host "Or use: npx react-native log-ios" -ForegroundColor Cyan
}

function Clear-AppCache {
    Write-Host "`n🧹 Clearing app cache..." -ForegroundColor Green
    npx expo start -c
}

function Reset-AppData {
    Write-Host "`n🔄 To reset app data:" -ForegroundColor Green
    Write-Host "1. Close the app completely (swipe away from recent apps)" -ForegroundColor Cyan
    Write-Host "2. Clear app data: Settings > Apps > Expo Go > Storage > Clear Data" -ForegroundColor Cyan
    Write-Host "3. Reopen app and scan QR code again" -ForegroundColor Cyan
}

function Show-TestPlanDoc {
    Write-Host "`n📖 Opening test plan document..." -ForegroundColor Green
    if (Test-Path "MANUAL_TEST_GUIDE.md") {
        code MANUAL_TEST_GUIDE.md
    } else {
        notepad MANUAL_TEST_GUIDE.md
    }
}

function Show-QuickChecklist {
    Write-Host "`n✅ Quick Test Checklist:`n" -ForegroundColor Green
    if (Test-Path "QUICK_TEST_CHECKLIST.txt") {
        Get-Content QUICK_TEST_CHECKLIST.txt
    } else {
        Write-Host "Checklist file not found!" -ForegroundColor Red
    }
}

function New-BugReport {
    $bugNumber = Read-Host "Enter bug number (e.g., 1, 2, 3)"
    $bugTitle = Read-Host "Enter brief bug description"
    
    $bugReport = @"
# Bug Report #$bugNumber

**Title:** $bugTitle

**Severity:** ☐ Critical  ☐ High  ☐ Medium  ☐ Low

**Date Reported:** $(Get-Date -Format "yyyy-MM-dd HH:mm")

**Reported By:** [Your Name]

**Device/Platform:** [Android/iOS/Web, version]

## Steps to Reproduce
1. 
2. 
3. 

## Expected Behavior


## Actual Behavior


## Screenshots/Videos
[Attach here]

## Console Errors
```
[Paste console errors here]
```

## Environment
- App Version: Development
- Expo SDK: 54
- React Native: 0.76.5
- Device: [Specify]
- OS Version: [Specify]

## Additional Notes


## Priority Justification


## Suggested Fix


---
**Status:** ☐ Open  ☐ In Progress  ☐ Fixed  ☐ Won't Fix
**Assigned To:** [Developer Name]
**Fixed In:** [Version/Commit]
"@

    $filename = "BUG_REPORT_$bugNumber.md"
    $bugReport | Out-File -FilePath $filename -Encoding UTF8
    
    Write-Host "`n✅ Bug report created: $filename" -ForegroundColor Green
    Write-Host "Opening in editor..." -ForegroundColor Cyan
    
    if (Get-Command code -ErrorAction SilentlyContinue) {
        code $filename
    } else {
        notepad $filename
    }
}

# Main Menu Loop
do {
    Show-TestMenu
    $choice = Read-Host "Select option (0-10)"
    
    switch ($choice) {
        "1" { Start-ExpoApp }
        "2" { Open-AndroidApp }
        "3" { Open-iOSApp }
        "4" { Open-WebApp }
        "5" { Show-AppLogs }
        "6" { Clear-AppCache }
        "7" { Reset-AppData }
        "8" { Show-TestPlanDoc }
        "9" { Show-QuickChecklist }
        "10" { New-BugReport }
        "0" { 
            Write-Host "`n👋 Exiting test helper. Good luck testing!`n" -ForegroundColor Green
            break
        }
        default { 
            Write-Host "`n❌ Invalid option. Please try again.`n" -ForegroundColor Red
        }
    }
    
    if ($choice -ne "0") {
        Write-Host "`nPress any key to return to menu..." -ForegroundColor Gray
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        Clear-Host
    }
} while ($choice -ne "0")
