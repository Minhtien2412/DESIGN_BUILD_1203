# Test Registration Endpoint
$BaseUrl = "https://baotienweb.cloud/api/v1"

Write-Host "`n=== TEST REGISTRATION ===`n" -ForegroundColor Cyan

$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
$testEmail = "testuser$timestamp@demo.com"

$registerBody = @{
    email = $testEmail
    password = 'Test@123456'
    name = 'Test User'
    phone = '0987654321'
} | ConvertTo-Json

$headers = @{
    'Content-Type' = 'application/json'
    'x-api-key' = 'dbuild_client_7d3a9f41c2b84e6d9a5f0e1c7b2a4d88'
}

Write-Host "Attempting to register new user..." -ForegroundColor Yellow
Write-Host "Email: $testEmail" -ForegroundColor Gray
Write-Host "Password: Test@123456" -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/auth/register" -Method POST `
        -Headers $headers -Body $registerBody `
        -TimeoutSec 10 -ErrorAction Stop
    
    Write-Host "`n✅ REGISTRATION SUCCESS" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 5) -ForegroundColor White
    
    if ($response.token) {
        Write-Host "`n📝 Testing login with new credentials..." -ForegroundColor Yellow
        
        $loginBody = @{
            email = $testEmail
            password = 'Test@123456'
        } | ConvertTo-Json
        
        $loginResponse = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method POST `
            -Headers $headers -Body $loginBody `
            -TimeoutSec 10 -ErrorAction Stop
        
        Write-Host "✅ LOGIN SUCCESS" -ForegroundColor Green
        Write-Host "Token: $($loginResponse.token.Substring(0, 30))..." -ForegroundColor Gray
        
        Write-Host "`n✅ FULL AUTH FLOW WORKS!" -ForegroundColor Green
        Write-Host "You can now use these credentials:" -ForegroundColor Cyan
        Write-Host "  Email: $testEmail" -ForegroundColor White
        Write-Host "  Password: Test@123456" -ForegroundColor White
    }
} catch {
    Write-Host "`n❌ REGISTRATION FAILED" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.ErrorDetails) {
        Write-Host "Details: " -NoNewline -ForegroundColor Yellow
        Write-Host $_.ErrorDetails.Message -ForegroundColor White
    }
}
