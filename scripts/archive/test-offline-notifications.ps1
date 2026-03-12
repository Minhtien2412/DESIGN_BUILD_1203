# Test Offline Notifications System
# This script tests how the app handles notifications when there's no internet connection

Write-Host "=== OFFLINE NOTIFICATION TEST ===" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "https://baotienweb.cloud/api/v1"

# Step 1: Get credentials and login
Write-Host "[STEP 1] Login and send notification while ONLINE" -ForegroundColor Yellow
Write-Host ""

$email = Read-Host "Email"
$password = Read-Host "Password" -AsSecureString
$passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

Write-Host ""
Write-Host "Logging in..." -ForegroundColor Gray

$loginData = @{
    email = $email
    password = $passwordPlain
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod `
        -Uri "$baseUrl/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginData `
        -ErrorAction Stop
    
    Write-Host "  OK Login successful" -ForegroundColor Green
    $token = $loginResponse.token
    
} catch {
    Write-Host "  FAIL Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Send a notification
Write-Host ""
Write-Host "[STEP 2] Sending test notification to your account..." -ForegroundColor Yellow

$notificationData = @{
    title = "Test Offline Mode"
    body = "This notification was sent to test offline functionality"
    type = "system"
    priority = "normal"
    data = @{
        testId = "offline-test-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    }
} | ConvertTo-Json

try {
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $notifResponse = Invoke-RestMethod `
        -Uri "$baseUrl/notifications" `
        -Method POST `
        -Headers $headers `
        -Body $notificationData `
        -ErrorAction Stop
    
    Write-Host "  OK Notification sent (ID: $($notifResponse.id))" -ForegroundColor Green
    
} catch {
    Write-Host "  FAIL Could not send notification: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 3: Instructions for offline testing
Write-Host ""
Write-Host "[STEP 3] MANUAL TEST INSTRUCTIONS" -ForegroundColor Yellow
Write-Host ""
Write-Host "Now perform these steps:" -ForegroundColor White
Write-Host ""
Write-Host "  1. Open the app on your phone/emulator" -ForegroundColor Cyan
Write-Host "     - You should see the new notification" -ForegroundColor Gray
Write-Host "     - Badge count should update" -ForegroundColor Gray
Write-Host ""
Write-Host "  2. Turn OFF WiFi and Mobile Data (Airplane mode)" -ForegroundColor Cyan
Write-Host "     - Enable airplane mode on device" -ForegroundColor Gray
Write-Host ""
Write-Host "  3. Force close and restart the app" -ForegroundColor Cyan
Write-Host "     - Close app completely" -ForegroundColor Gray
Write-Host "     - Open app again" -ForegroundColor Gray
Write-Host ""
Write-Host "  4. Check if notifications still display:" -ForegroundColor Cyan
Write-Host "     - Last seen notifications should be cached" -ForegroundColor Gray
Write-Host "     - Offline banner should appear" -ForegroundColor Gray
Write-Host "     - Can view notification details" -ForegroundColor Gray
Write-Host ""
Write-Host "  5. Turn internet back ON" -ForegroundColor Cyan
Write-Host "     - Disable airplane mode" -ForegroundColor Gray
Write-Host "     - Pull to refresh notifications" -ForegroundColor Gray
Write-Host "     - New notifications should sync" -ForegroundColor Gray
Write-Host ""

Write-Host "Expected Behavior:" -ForegroundColor Yellow
Write-Host "  OFFLINE:" -ForegroundColor White
Write-Host "    - Shows cached notifications" -ForegroundColor Gray
Write-Host "    - 'No Internet' message appears" -ForegroundColor Gray
Write-Host "    - No new notifications fetch" -ForegroundColor Gray
Write-Host "    - Can still read cached content" -ForegroundColor Gray
Write-Host ""
Write-Host "  BACK ONLINE:" -ForegroundColor White
Write-Host "    - Auto syncs new notifications" -ForegroundColor Gray
Write-Host "    - Badge count updates" -ForegroundColor Gray
Write-Host "    - Offline message disappears" -ForegroundColor Gray
Write-Host ""

# Step 4: Send another notification for online sync test
Write-Host "[STEP 4] Sending second notification for sync test..." -ForegroundColor Yellow

$notificationData2 = @{
    title = "Online Sync Test"
    body = "This should appear when you go back online"
    type = "info"
    priority = "high"
    data = @{
        testId = "sync-test-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    }
} | ConvertTo-Json

try {
    $notifResponse2 = Invoke-RestMethod `
        -Uri "$baseUrl/notifications" `
        -Method POST `
        -Headers $headers `
        -Body $notificationData2 `
        -ErrorAction Stop
    
    Write-Host "  OK Second notification sent (ID: $($notifResponse2.id))" -ForegroundColor Green
    
} catch {
    Write-Host "  FAIL Could not send second notification: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Technical Details:" -ForegroundColor Yellow
Write-Host "  Hook: useNotifications" -ForegroundColor White
Write-Host "  Offline detection: useNetworkStatus" -ForegroundColor White
Write-Host "  Cache storage: AsyncStorage (offlineStorage)" -ForegroundColor White
Write-Host "  Cache key: 'notifications_offline'" -ForegroundColor White
Write-Host "  TTL: SHORT (5 minutes for online refresh)" -ForegroundColor White
Write-Host ""
Write-Host "Test completed! Follow the manual steps above." -ForegroundColor Green
Write-Host ""
