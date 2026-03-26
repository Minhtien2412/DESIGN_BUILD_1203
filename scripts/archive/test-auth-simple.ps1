Write-Host "`n=== AUTH SYSTEM TEST ===" -ForegroundColor Cyan

$baseUrl = "https://baotienweb.cloud"
$apiPrefix = "/api/v1"
$apiKey = "dbuild_client_7d3a9f41c2b84e6d9a5f0e1c7b2a4d88"

$headers = @{
    "Content-Type" = "application/json"
    "X-API-Key" = $apiKey
}

# Test Login
Write-Host "`nTest: Login with admin@test.com" -ForegroundColor Yellow
try {
    $loginUrl = "$baseUrl$apiPrefix/auth/login"
    Write-Host "URL: $loginUrl"
    
    $body = @{
        email = "admin@test.com"
        password = "123456"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri $loginUrl -Method POST -Headers $headers -Body $body -TimeoutSec 10
    Write-Host "SUCCESS: Login worked!" -ForegroundColor Green
    Write-Host "User: $($response.user.email)"
    Write-Host "Role: $($response.user.role)"
    
    $global:token = $response.accessToken
} catch {
    Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)"
}

# Test /auth/me
if ($global:token) {
    Write-Host "`nTest: Get current user" -ForegroundColor Yellow
    try {
        $meUrl = "$baseUrl$apiPrefix/auth/me"
        Write-Host "URL: $meUrl"
        
        $authHeaders = $headers.Clone()
        $authHeaders["Authorization"] = "Bearer $global:token"
        
        $response = Invoke-RestMethod -Uri $meUrl -Method GET -Headers $authHeaders -TimeoutSec 10
        Write-Host "SUCCESS: Got user profile!" -ForegroundColor Green
        Write-Host "Email: $($response.user.email)"
    } catch {
        Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Status: $($_.Exception.Response.StatusCode.value__)"
    }
}

Write-Host "`n=== TEST COMPLETE ===" -ForegroundColor Cyan
Write-Host "`nConfiguration:"
Write-Host "  Base URL: $baseUrl"
Write-Host "  API Prefix: $apiPrefix"
Write-Host "  Full Auth URL: $baseUrl$apiPrefix/auth/login"
Write-Host "`nMock Users:"
Write-Host "  - admin@test.com / 123456"
Write-Host "  - user@test.com / 123456"
Write-Host "  - lamchankhan113@gmail.com / 123456"
Write-Host ""
