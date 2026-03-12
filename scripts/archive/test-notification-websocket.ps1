# Test Notification WebSocket - PowerShell Version
# Run this script to test sending notifications to the app

$API_BASE = "https://baotienweb.cloud/api/v1"
$API_KEY = "sk_live_designbuild_2025_secure_key_v1"

Write-Host "=== Step 1: Login to get token ===" -ForegroundColor Cyan

try {
    $loginBody = @{
        email = "testuser1@baotienweb.cloud"
        password = "Test@123456"
    } | ConvertTo-Json

    $headers = @{
        "Content-Type" = "application/json"
        "X-API-Key" = $API_KEY
    }

    $loginResponse = Invoke-RestMethod -Uri "$API_BASE/auth/login" -Method Post -Body $loginBody -Headers $headers
    
    $token = $loginResponse.accessToken
    
    if (-not $token) {
        Write-Host "Failed to get token from response" -ForegroundColor Red
        $loginResponse | ConvertTo-Json
        exit 1
    }
    
    Write-Host "Got token: $($token.Substring(0, [Math]::Min(50, $token.Length)))..." -ForegroundColor Green
    
} catch {
    Write-Host "Login failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== Step 2: Create a test notification ===" -ForegroundColor Cyan

try {
    $timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ss"
    
    $notifBody = @{
        type = "SYSTEM"
        title = "WebSocket Test"
        message = "This is a test notification sent at $(Get-Date -Format 'HH:mm:ss')"
        data = @{
            test = $true
            timestamp = $timestamp
        }
    } | ConvertTo-Json -Depth 3

    $authHeaders = @{
        "Content-Type" = "application/json"
        "X-API-Key" = $API_KEY
        "Authorization" = "Bearer $token"
    }

    $notifResponse = Invoke-RestMethod -Uri "$API_BASE/notifications" -Method Post -Body $notifBody -Headers $authHeaders
    
    Write-Host "Notification created:" -ForegroundColor Green
    $notifResponse | ConvertTo-Json -Depth 3
    
} catch {
    Write-Host "Create notification failed: $_" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Yellow
}

Write-Host "`n=== Done ===" -ForegroundColor Cyan
Write-Host "Check the app console for:" -ForegroundColor Yellow
Write-Host "  'Received notification' (from UnifiedNotificationContext)" -ForegroundColor White
Write-Host "  'notification from WebSocket' (from notificationRealtimeService)" -ForegroundColor White
