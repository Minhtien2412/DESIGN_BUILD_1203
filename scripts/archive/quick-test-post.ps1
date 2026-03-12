# Quick test POST endpoint
$baseUrl = "https://baotienweb.cloud/api/v1"

Write-Host "=== QUICK TEST POST /notifications ===" -ForegroundColor Cyan
Write-Host ""

# Login
Write-Host "Step 1: Login..." -ForegroundColor Yellow
try {
    $loginResponse = Invoke-RestMethod `
        -Uri "$baseUrl/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body (@{
            email = "admin@nhaxinhdesign.com"
            password = "6k4BOIRDwWhsM39F2DyM"
        } | ConvertTo-Json)
    
    $token = $loginResponse.token
    Write-Host "  ✓ Login success! Token: $($token.Substring(0,20))..." -ForegroundColor Green
} catch {
    Write-Host "  ✗ Login failed!" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "  Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    exit 1
}

Write-Host ""
Write-Host "Step 2: Send test notification..." -ForegroundColor Yellow

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$notification = @{
    type = "IN_APP"
    title = "Test from PowerShell"
    body = "This is a test notification sent at $(Get-Date -Format 'HH:mm:ss')"
    priority = "MEDIUM"
    metadata = '{"category":"system","source":"powershell-test"}'
} | ConvertTo-Json

Write-Host "  Sending to: POST $baseUrl/notifications" -ForegroundColor Gray
Write-Host "  Payload:" -ForegroundColor Gray
Write-Host "    $notification" -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-RestMethod `
        -Uri "$baseUrl/notifications" `
        -Method POST `
        -Headers $headers `
        -Body $notification `
        -Verbose
    
    Write-Host "  ✓ Notification created!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 5 | Write-Host -ForegroundColor White
    
} catch {
    Write-Host "  ✗ Failed to create notification!" -ForegroundColor Red
    Write-Host "  Status: $($_.Exception.Response.StatusCode.Value__) $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.ErrorDetails.Message) {
        Write-Host "  Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    
    exit 1
}

Write-Host ""
Write-Host "=== TEST COMPLETED ===" -ForegroundColor Green
