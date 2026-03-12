# BAOTIENWEB ADMIN - API CONNECTION TEST
Write-Host "`n==============================================================" -ForegroundColor Cyan
Write-Host "  BAOTIENWEB ADMIN - API CONNECTION TEST" -ForegroundColor White
Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "https://baotienweb.cloud/api/v1"
$testsPassed = 0
$testsFailed = 0
$token = $null

# TEST 1: API Health Check
Write-Host "Test 1: API Health Check" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl" -Method GET -UseBasicParsing -TimeoutSec 10
    Write-Host "   OK - API reachable (Status: $($response.StatusCode))" -ForegroundColor Green
    $testsPassed++
} catch {
    Write-Host "   FAIL - API not reachable" -ForegroundColor Red
    $testsFailed++
}
Write-Host ""

# SUMMARY
Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host "  RESULTS" -ForegroundColor White
Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host "   Passed: $testsPassed" -ForegroundColor Green
Write-Host "   Failed: $testsFailed" -ForegroundColor Red
Write-Host "==============================================================" -ForegroundColor Cyan
