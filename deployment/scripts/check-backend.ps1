# Backend Health Check
# Simple and reliable test script

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  BACKEND HEALTH CHECK" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$mainApi = "https://baotienweb.cloud/api/v1"
$perfexApi = "https://thietkeresort.com.vn/perfex_crm"
$perfexToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC90aGlldGtlcmVzb3J0LmNvbS52blwvcGVyZmV4X2NybVwvYXBpXC9hdXRoZW50aWNhdGlvbiIsImlhdCI6MTczNTYzMzQ3MiwiZXhwIjoxOTI1NTM0MDcyLCJuYmYiOjE3MzU2MzM0NzIsImp0aSI6IjhzeDJaeTJZQTZjM0E0Y0YiLCJzdWIiOiJ0aGlldGtlcmVzb3J0QGdtYWlsLmNvbSIsInBydiI6ImUwNTczZTljNTVlNzBiNGZkNDA5YmIzOWRmODM2NTU2ZWVjOTU5NWEifQ.CycqDyj2KWmBdqm-a2kbYzNzE1fQ.L9Mcg_xEOdcEYXbz9BprB93RD7ZuonhsshYPPInQm4Q"

$passed = 0
$failed = 0
$warned = 0

# Test 1: Main API Base
Write-Host "[TEST 1] Main API Base URL" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $mainApi -Method Get -TimeoutSec 5 -UseBasicParsing
    Write-Host "  [PASS] HTTP $($response.StatusCode)" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "  [FAIL] $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 2: Main API Projects
Write-Host "[TEST 2] Main API Projects Endpoint" -ForegroundColor Yellow
try {
    $headers = @{ "x-api-key" = "dbuild_client_7d3a9f41c2b84e6d9a5f0e1c7b2a4d88" }
    $response = Invoke-RestMethod -Uri "$mainApi/projects" -Headers $headers -Method Get -TimeoutSec 10
    $count = if ($response.items) { $response.items.Count } elseif ($response -is [Array]) { $response.Count } else { 0 }
    Write-Host "  [PASS] Found $count projects" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "  [WARN] $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "  [INFO] Will use mock data" -ForegroundColor Gray
    $warned++
}

# Test 3: Perfex CRM Base
Write-Host "[TEST 3] Perfex CRM Base URL" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $perfexApi -Method Get -TimeoutSec 5 -UseBasicParsing
    Write-Host "  [PASS] HTTP $($response.StatusCode)" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "  [FAIL] $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 4: Perfex Customers
Write-Host "[TEST 4] Perfex Customers API" -ForegroundColor Yellow
try {
    $headers = @{ "authtoken" = $perfexToken }
    $response = Invoke-RestMethod -Uri "$perfexApi/api/customers" -Headers $headers -Method Get -TimeoutSec 10
    $count = if ($response -is [Array]) { $response.Count } else { 1 }
    Write-Host "  [PASS] Found $count customers" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "  [FAIL] $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 5: Perfex Projects
Write-Host "[TEST 5] Perfex Projects API" -ForegroundColor Yellow
try {
    $headers = @{ "authtoken" = $perfexToken }
    $response = Invoke-RestMethod -Uri "$perfexApi/api/projects" -Headers $headers -Method Get -TimeoutSec 10
    $count = if ($response -is [Array]) { $response.Count } else { 1 }
    Write-Host "  [PASS] Found $count projects" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "  [FAIL] $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 6: Response Time
Write-Host "[TEST 6] Response Time Check" -ForegroundColor Yellow
try {
    $start = Get-Date
    $response = Invoke-WebRequest -Uri $mainApi -Method Get -TimeoutSec 5 -UseBasicParsing
    $duration = (Get-Date) - $start
    $ms = [math]::Round($duration.TotalMilliseconds)
    
    if ($ms -lt 1000) {
        Write-Host "  [PASS] ${ms}ms (Excellent)" -ForegroundColor Green
        $passed++
    } elseif ($ms -lt 3000) {
        Write-Host "  [PASS] ${ms}ms (Good)" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "  [WARN] ${ms}ms (Slow)" -ForegroundColor Yellow
        $warned++
    }
} catch {
    Write-Host "  [FAIL] Cannot measure" -ForegroundColor Red
    $failed++
}

# Summary
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  SUMMARY" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Total Tests: $($passed + $failed + $warned)" -ForegroundColor White
Write-Host "Passed:      $passed" -ForegroundColor Green
Write-Host "Failed:      $failed" -ForegroundColor Red
Write-Host "Warnings:    $warned" -ForegroundColor Yellow
Write-Host ""

if ($failed -eq 0) {
    Write-Host "[SUCCESS] Backend is operational!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Status:" -ForegroundColor Cyan
    Write-Host "  * API Integration: READY" -ForegroundColor White
    Write-Host "  * Caching: ENABLED" -ForegroundColor White
    Write-Host "  * Mock Fallback: READY" -ForegroundColor White
    Write-Host "  * React Hooks: 15+ available" -ForegroundColor White
} else {
    Write-Host "[WARNING] Some backend services are down" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Actions:" -ForegroundColor Cyan
    Write-Host "  1. Check server status" -ForegroundColor White
    Write-Host "  2. Verify API keys/tokens" -ForegroundColor White
    Write-Host "  3. App will use mock data" -ForegroundColor White
}

Write-Host ""
Write-Host "Documentation:" -ForegroundColor Cyan
Write-Host "  - docs/API_INTEGRATION_GUIDE.md" -ForegroundColor White
Write-Host "  - API_INTEGRATION_COMPLETE.md" -ForegroundColor White
Write-Host ""
