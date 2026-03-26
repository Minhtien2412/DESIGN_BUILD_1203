# Authentication Endpoints Test
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AUTHENTICATION ENDPOINTS TEST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$BaseUrl = "https://baotienweb.cloud/api/v1"
$ApiKey = "dbuild_client_7d3a9f41c2b84e6d9a5f0e1c7b2a4d88"
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$testEmail = "testuser${timestamp}@test.com"
$testPassword = "TestPassword123!"
$testName = "Test User $timestamp"

Write-Host "Base URL: $BaseUrl"
Write-Host "Test Email: $testEmail"
Write-Host ""

# TEST 1: Health Check
Write-Host "TEST 1: Health Check" -ForegroundColor Magenta
try {
    $health = Invoke-RestMethod -Uri "https://baotienweb.cloud/health" -Method GET -TimeoutSec 10
    Write-Host "[PASS] Health Check OK" -ForegroundColor Green
} catch {
    Write-Host "[FAIL] Health Check: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# TEST 2: Register
Write-Host "TEST 2: Register New User" -ForegroundColor Magenta
try {
    $registerBody = @{ email=$testEmail; password=$testPassword; name=$testName }
    $register = Invoke-RestMethod -Uri "$BaseUrl/auth/register" -Method POST `
        -Headers @{ "Content-Type"="application/json"; "x-api-key"=$ApiKey } `
        -Body ($registerBody | ConvertTo-Json) -TimeoutSec 15
    
    Write-Host "[PASS] Register OK - User ID: $($register.user.id)" -ForegroundColor Green
    $Global:accessToken = $register.accessToken
    $Global:refreshToken = $register.refreshToken
} catch {
    Write-Host "[FAIL] Register: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# TEST 3: Login
Write-Host "TEST 3: Login" -ForegroundColor Magenta
try {
    $loginBody = @{ email=$testEmail; password=$testPassword }
    $login = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method POST `
        -Headers @{ "Content-Type"="application/json"; "x-api-key"=$ApiKey } `
        -Body ($loginBody | ConvertTo-Json) -TimeoutSec 15
    
    Write-Host "[PASS] Login OK - Role: $($login.user.role)" -ForegroundColor Green
    $Global:accessToken = $login.accessToken
    $Global:refreshToken = $login.refreshToken
} catch {
    Write-Host "[FAIL] Login: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# TEST 4: Protected Endpoint
Write-Host "TEST 4: Protected Endpoint - Projects" -ForegroundColor Magenta
if ($Global:accessToken) {
    try {
        $projects = Invoke-RestMethod -Uri "$BaseUrl/projects" -Method GET `
            -Headers @{ "Authorization"="Bearer $($Global:accessToken)"; "x-api-key"=$ApiKey } `
            -TimeoutSec 15
        
        Write-Host "[PASS] Protected Endpoint OK - Projects: $($projects.Count)" -ForegroundColor Green
    } catch {
        Write-Host "[FAIL] Protected Endpoint: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "[SKIP] No access token" -ForegroundColor Yellow
}
Write-Host ""

# TEST 5: Token Refresh
Write-Host "TEST 5: Token Refresh" -ForegroundColor Magenta
if ($Global:refreshToken) {
    try {
        $refresh = Invoke-RestMethod -Uri "$BaseUrl/auth/refresh" -Method POST `
            -Headers @{ "Authorization"="Bearer $($Global:refreshToken)"; "x-api-key"=$ApiKey } `
            -TimeoutSec 15
        
        Write-Host "[PASS] Token Refresh OK" -ForegroundColor Green
    } catch {
        Write-Host "[FAIL] Token Refresh: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "[SKIP] No refresh token" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST COMPLETED" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
