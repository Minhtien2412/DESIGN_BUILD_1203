# Test Backend Login với debug chi tiết

$API_BASE = "https://baotienweb.cloud/api/v1"

Write-Host "Testing login endpoint..." -ForegroundColor Cyan

$testCredentials = @(
    @{ email = "testuser9139@test.com"; password = "password123" }
    @{ email = "test@example.com"; password = "password123" }
    @{ email = "admin@test.com"; password = "admin123" }
)

foreach ($cred in $testCredentials) {
    Write-Host "`nTesting: $($cred.email)" -ForegroundColor Yellow
    
    try {
        $body = @{
            email = $cred.email
            password = $cred.password
        } | ConvertTo-Json

        $response = Invoke-RestMethod -Uri "$API_BASE/auth/login" `
            -Method POST `
            -ContentType "application/json" `
            -Body $body `
            -ErrorAction Stop

        Write-Host "SUCCESS!" -ForegroundColor Green
        Write-Host "User: $($response.user.email)" -ForegroundColor White
        Write-Host "Role: $($response.user.role)" -ForegroundColor White
        break
        
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "FAILED - Status: $statusCode" -ForegroundColor Red
        
        if ($statusCode -eq 401) {
            Write-Host "  Invalid credentials" -ForegroundColor Gray
        }
    }
}

Write-Host "`n`nTrying to check if we can register..." -ForegroundColor Cyan

try {
    $registerBody = @{
        email = "testuser$(Get-Random -Minimum 1000 -Maximum 9999)@test.com"
        password = "password123"
        name = "Test User"
        role = "CLIENT"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$API_BASE/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $registerBody `
        -ErrorAction Stop

    Write-Host "Register SUCCESS!" -ForegroundColor Green
    Write-Host "New user created: $($response.user.email)" -ForegroundColor White
    
    # Now try to login with new account
    Write-Host "`nTrying to login with new account..." -ForegroundColor Cyan
    
    $loginBody = @{
        email = $response.user.email
        password = "password123"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$API_BASE/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody

    Write-Host "Login SUCCESS!" -ForegroundColor Green
    Write-Host "Tokens received!" -ForegroundColor White
    
} catch {
    Write-Host "Register/Login failed: $($_.Exception.Message)" -ForegroundColor Red
}
