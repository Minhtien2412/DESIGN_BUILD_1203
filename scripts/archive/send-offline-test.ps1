# Simple notification sender for offline testing
param(
    [string]$Email = "test@example.com",
    [string]$Password = "Test123456"
)

$baseUrl = "https://baotienweb.cloud/api/v1"

Write-Host "Sending test notification..." -ForegroundColor Cyan

# Login
try {
    $loginData = @{
        email = $Email
        password = $Password
    } | ConvertTo-Json

    $login = Invoke-RestMethod `
        -Uri "$baseUrl/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginData
    
    $token = $login.token
    Write-Host "  Logged in as $Email" -ForegroundColor Gray
    
} catch {
    Write-Host "  FAIL: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "  Try: .\send-offline-test.ps1 -Email 'your@email.com' -Password 'yourpass'" -ForegroundColor Yellow
    exit 1
}

# Send notification
try {
    $timestamp = Get-Date -Format "HH:mm:ss"
    $notifData = @{
        title = "Test Offline [$timestamp]"
        body = "Notification for testing offline mode. Turn on Airplane Mode and restart app."
        type = "info"
        priority = "high"
        data = @{
            testType = "offline"
            sentAt = $timestamp
        }
    } | ConvertTo-Json

    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }

    $response = Invoke-RestMethod `
        -Uri "$baseUrl/notifications" `
        -Method POST `
        -Headers $headers `
        -Body $notifData
    
    Write-Host "  OK: Notification sent (ID: $($response.id))" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Open app -> See notification" -ForegroundColor White
    Write-Host "  2. Enable Airplane Mode" -ForegroundColor White
    Write-Host "  3. Close app completely" -ForegroundColor White
    Write-Host "  4. Reopen app (offline)" -ForegroundColor White
    Write-Host "  5. Notifications should still show (cached)" -ForegroundColor White
    
} catch {
    Write-Host "  FAIL: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
