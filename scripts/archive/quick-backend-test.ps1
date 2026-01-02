# Quick Backend API Test
# Simple diagnostic tool

$BaseUrl = "https://baotienweb.cloud/api/v1"

Write-Host "`n=== BACKEND API QUICK TEST ===`n" -ForegroundColor Cyan

# Test 1: Health Check
Write-Host "[1] Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$BaseUrl/health" -Method GET -TimeoutSec 10
    Write-Host "  ✅ PASS - Server is UP" -ForegroundColor Green
    Write-Host "  Response: $($health | ConvertTo-Json)" -ForegroundColor Gray
} catch {
    Write-Host "  ❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Login
Write-Host "`n[2] Testing Login Endpoint..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = 'test@demo.com'
        password = 'test123'
    } | ConvertTo-Json

    $headers = @{
        'Content-Type' = 'application/json'
        'x-api-key' = 'thietke-resort-api-key-2024'
    }

    $auth = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method POST `
        -Headers $headers -Body $loginBody -TimeoutSec 10
    
    Write-Host "  ✅ PASS - Login successful" -ForegroundColor Green
    if ($auth.token) {
        $token = $auth.token
        Write-Host "  Token: $($token.Substring(0, 30))" -ForegroundColor Gray
    }
} catch {
    Write-Host "  ❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $token = $null
}

# Test 3: Get Profile (requires auth)
if ($token) {
    Write-Host "`n[3] Testing Profile Endpoint..." -ForegroundColor Yellow
    try {
        $headers = @{
            'Authorization' = "Bearer $token"
            'x-api-key' = 'thietke-resort-api-key-2024'
        }

        $profile = Invoke-RestMethod -Uri "$BaseUrl/profile" -Method GET `
            -Headers $headers -TimeoutSec 10
        
        Write-Host "  ✅ PASS - Profile retrieved" -ForegroundColor Green
        Write-Host "  User: $($profile.name)" -ForegroundColor Gray
    } catch {
        Write-Host "  ❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "`n[3] SKIPPED - No auth token" -ForegroundColor Yellow
}

# Test 4: List Projects
if ($token) {
    Write-Host "`n[4] Testing Projects Endpoint..." -ForegroundColor Yellow
    try {
        $headers = @{
            'Authorization' = "Bearer $token"
            'x-api-key' = 'thietke-resort-api-key-2024'
        }

        $projects = Invoke-RestMethod -Uri "$BaseUrl/projects?page=1&limit=5" -Method GET `
            -Headers $headers -TimeoutSec 10
        
        Write-Host "  ✅ PASS - Projects retrieved" -ForegroundColor Green
        Write-Host "  Count: $($projects.data.Count)" -ForegroundColor Gray
    } catch {
        Write-Host "  ❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "`n[4] SKIPPED - No auth token" -ForegroundColor Yellow
}

# Summary
Write-Host "`n=== TEST COMPLETE ===`n" -ForegroundColor Cyan
Write-Host "Review BACKEND_ERROR_DIAGNOSTICS.md for troubleshooting`n" -ForegroundColor Gray
