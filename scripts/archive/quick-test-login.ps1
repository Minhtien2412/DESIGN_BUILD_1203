# Quick Test Login Script
# Test login with sample credentials

$API_BASE = "https://baotienweb.cloud/api/v1"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   QUICK TEST LOGIN" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "Select account to login:" -ForegroundColor Yellow
Write-Host "  1. CLIENT     - client.test@demo.com" -ForegroundColor White
Write-Host "  2. ENGINEER   - engineer.test@demo.com" -ForegroundColor White
Write-Host "  3. ADMIN      - admin.test@demo.com" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter choice (1-3)"

$accounts = @{
    "1" = @{ email = "client.test@demo.com"; password = "Test123456"; role = "CLIENT" }
    "2" = @{ email = "engineer.test@demo.com"; password = "Test123456"; role = "ENGINEER" }
    "3" = @{ email = "admin.test@demo.com"; password = "Test123456"; role = "ADMIN" }
}

if (-not $accounts.ContainsKey($choice)) {
    Write-Host "Invalid choice!" -ForegroundColor Red
    exit 1
}

$account = $accounts[$choice]

Write-Host "`nLogging in as: $($account.role)" -ForegroundColor Cyan
Write-Host "Email: $($account.email)" -ForegroundColor White

try {
    $body = @{
        email = $account.email
        password = $account.password
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$API_BASE/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -ErrorAction Stop

    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "   LOGIN SUCCESSFUL!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    
    Write-Host "`nUser Info:" -ForegroundColor Yellow
    Write-Host "  ID:    $($response.user.id)" -ForegroundColor White
    Write-Host "  Email: $($response.user.email)" -ForegroundColor White
    Write-Host "  Name:  $($response.user.name)" -ForegroundColor White
    Write-Host "  Role:  $($response.user.role)" -ForegroundColor White
    
    Write-Host "`nTokens:" -ForegroundColor Yellow
    Write-Host "  Access:  $($response.accessToken.Substring(0,50))..." -ForegroundColor Gray
    Write-Host "  Refresh: $($response.refreshToken.Substring(0,50))..." -ForegroundColor Gray
    
    # Save credentials to file
    $credentials = @{
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        user = $response.user
        accessToken = $response.accessToken
        refreshToken = $response.refreshToken
    }
    
    $credentials | ConvertTo-Json | Out-File "test-login-credentials.json"
    Write-Host "`nCredentials saved to: test-login-credentials.json" -ForegroundColor Green
    
} catch {
    Write-Host "`n========================================" -ForegroundColor Red
    Write-Host "   LOGIN FAILED!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    
    Write-Host "`nError: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "Status Code: $statusCode" -ForegroundColor Red
    }
    
    Write-Host "`nSuggestions:" -ForegroundColor Yellow
    Write-Host "  1. Check internet connection" -ForegroundColor White
    Write-Host "  2. Verify backend: https://baotienweb.cloud/api/v1/health" -ForegroundColor White
    Write-Host "  3. Only testuser9139@test.com is verified on backend" -ForegroundColor White
}

Write-Host "`n========================================`n" -ForegroundColor Cyan
