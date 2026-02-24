# API Connection Test Script
# Test Baotienweb API connectivity

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "   BAOTIENWEB API - CONNECTION TEST" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Production Domain
Write-Host "1. Testing Production Domain (baotienweb.cloud)" -ForegroundColor Yellow
Write-Host "   URL: https://baotienweb.cloud/api/v1" -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri "https://baotienweb.cloud/api/v1" -Method Get -TimeoutSec 10
    Write-Host "   Result: SUCCESS" -ForegroundColor Green
    Write-Host "   Response: $($response | ConvertTo-Json -Compress)" -ForegroundColor Gray
} catch {
    Write-Host "   Result: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor DarkRed
}

Write-Host ""

# Test 2: VPS Direct IP
Write-Host "2. Testing VPS Direct IP (103.200.20.100:3000)" -ForegroundColor Yellow
Write-Host "   URL: http://103.200.20.100:3000/api/v1" -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri "http://103.200.20.100:3000/api/v1" -Method Get -TimeoutSec 10
    Write-Host "   Result: SUCCESS" -ForegroundColor Green
    Write-Host "   Response: $($response | ConvertTo-Json -Compress)" -ForegroundColor Gray
} catch {
    Write-Host "   Result: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor DarkRed
}

Write-Host ""

# Test 3: Swagger Docs (Domain)
Write-Host "3. Testing Swagger Docs (baotienweb.cloud)" -ForegroundColor Yellow
Write-Host "   URL: https://baotienweb.cloud/api/docs" -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri "https://baotienweb.cloud/api/docs" -Method Get -TimeoutSec 10
    Write-Host "   Result: SUCCESS (Status $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "   Result: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor DarkRed
}

Write-Host ""

# Test 4: Swagger Docs (IP)
Write-Host "4. Testing Swagger Docs (VPS IP)" -ForegroundColor Yellow
Write-Host "   URL: http://103.200.20.100:3000/api/docs" -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri "http://103.200.20.100:3000/api/docs" -Method Get -TimeoutSec 10
    Write-Host "   Result: SUCCESS (Status $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "   Result: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor DarkRed
}

Write-Host ""

# Test 5: Auth Register Endpoint
Write-Host "5. Testing Auth Register Endpoint" -ForegroundColor Yellow
Write-Host "   URL: https://baotienweb.cloud/api/v1/auth/register" -ForegroundColor Gray

try {
    $headers = @{
        "Content-Type" = "application/json"
        "X-API-Key" = "baotienweb-api-key-2025"
    }
    
    $body = @{
        email = "test-$(Get-Random)@test.com"
        password = "Test123!"
        name = "Test User"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "https://baotienweb.cloud/api/v1/auth/register" -Method Post -Headers $headers -Body $body -TimeoutSec 10
    Write-Host "   Result: SUCCESS (User registered)" -ForegroundColor Green
    Write-Host "   User ID: $($response.user.id)" -ForegroundColor Gray
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 409) {
        Write-Host "   Result: ENDPOINT OK (Email already exists - expected)" -ForegroundColor Green
    } elseif ($statusCode) {
        Write-Host "   Result: HTTP $statusCode" -ForegroundColor Yellow
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor DarkRed
    } else {
        Write-Host "   Result: CONNECTION FAILED" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor DarkRed
    }
}

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "   CURRENT FRONTEND CONFIGURATION" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "API_BASE_URL: http://103.200.20.100:3000" -ForegroundColor Gray
Write-Host "API_PREFIX: /api/v1" -ForegroundColor Gray
Write-Host "API_KEY: baotienweb-api-key-2025" -ForegroundColor Gray
Write-Host "WS_URL: DISABLED" -ForegroundColor Gray
Write-Host ""
Write-Host "Files to check:" -ForegroundColor Yellow
Write-Host "  - config/env.ts" -ForegroundColor Gray
Write-Host "  - services/api/client.ts" -ForegroundColor Gray
Write-Host "  - app.config.ts" -ForegroundColor Gray
Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""
