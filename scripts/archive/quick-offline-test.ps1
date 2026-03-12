# Quick Offline Test - Send notification to test account
Write-Host "=== QUICK OFFLINE TEST ===" -ForegroundColor Cyan

$baseUrl = "https://baotienweb.cloud/api/v1"

# Using test account
$email = "test@example.com"
$password = "Test123456"

Write-Host "Logging in as $email..." -ForegroundColor Yellow

$loginData = @{
    email = $email
    password = $password
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod `
        -Uri "$baseUrl/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginData
    
    Write-Host "OK Logged in" -ForegroundColor Green
    $token = $loginResponse.token
    
} catch {
    Write-Host "FAIL Login: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Using default test user. If not exists:" -ForegroundColor Yellow
    Write-Host "  1. Open app" -ForegroundColor White
    Write-Host "  2. Register with: test@example.com / Test123456" -ForegroundColor White
    Write-Host "  3. Run this script again" -ForegroundColor White
    exit 1
}

# Send notification
Write-Host ""
Write-Host "Sending offline test notification..." -ForegroundColor Yellow

$notifData = @{
    title = "Offline Mode Test"
    body = "Testing notification system without internet"
    type = "system"
    priority = "high"
} | ConvertTo-Json

try {
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $response = Invoke-RestMethod `
        -Uri "$baseUrl/notifications" `
        -Method POST `
        -Headers $headers `
        -Body $notifData
    
    Write-Host "OK Notification sent (ID: $($response.id))" -ForegroundColor Green
    
} catch {
    Write-Host "FAIL: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== TEST STEPS ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Open app -> See notification badge" -ForegroundColor White
Write-Host "2. Turn ON Airplane Mode" -ForegroundColor White
Write-Host "3. Close and reopen app" -ForegroundColor White
Write-Host "4. Check: Notifications still visible (cached)" -ForegroundColor White
Write-Host "5. Turn OFF Airplane Mode" -ForegroundColor White
Write-Host "6. Pull to refresh -> New data syncs" -ForegroundColor White
Write-Host ""
Write-Host "Done!" -ForegroundColor Green
