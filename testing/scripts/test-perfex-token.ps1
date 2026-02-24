# Test Perfex CRM API Token
# User: nhaxinhd
# Token: thietkeresort

$baseUrl = "https://thietkeresort.com.vn/perfex_crm"
$token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoibmhheGluaGQiLCJuYW1lIjoidGhpZXRrZXJlc29ydCIsIkFQSV9USU1FIjoxNzY3MDYzNzE1fQ.L9Mcg_xEOdcEYXbz9BprB93RD7ZuonhsshYPPInQm4Q"
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "=== Testing Perfex CRM API ===" -ForegroundColor Cyan
Write-Host "Base URL: $baseUrl" -ForegroundColor Yellow
Write-Host ""

# Test 1: Get Staff Info
Write-Host "[1] Testing Staff API..." -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/authentication/staff" -Method Get -Headers $headers
    Write-Host "✅ Staff API Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
    Write-Host ""
} catch {
    Write-Host "❌ Staff API Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Test 2: Get Customers
Write-Host "[2] Testing Customers API..." -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/customers" -Method Get -Headers $headers
    Write-Host "✅ Customers API Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 2
    Write-Host ""
} catch {
    Write-Host "❌ Customers API Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Test 3: Get Projects
Write-Host "[3] Testing Projects API..." -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/projects" -Method Get -Headers $headers
    Write-Host "✅ Projects API Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 2
    Write-Host ""
} catch {
    Write-Host "❌ Projects API Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Test 4: Get Dashboard Stats
Write-Host "[4] Testing Dashboard API..." -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/v1/dashboard" -Method Get -Headers $headers
    Write-Host "✅ Dashboard API Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 2
    Write-Host ""
} catch {
    Write-Host "❌ Dashboard API Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Test 5: Mobile API - Login Check
Write-Host "[5] Testing Mobile API..." -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/v1/auth/me" -Method Get -Headers $headers
    Write-Host "✅ Mobile API Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
    Write-Host ""
} catch {
    Write-Host "❌ Mobile API Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

Write-Host "=== Test Complete ===" -ForegroundColor Cyan
