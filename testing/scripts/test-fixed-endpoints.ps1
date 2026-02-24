# Test script để verify các endpoint đã fix
# Chạy: .\test-fixed-endpoints.ps1

$baseUrl = "https://baotienweb.cloud/api/v1"
$apiKey = "thietke-resort-api-key-2024"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   TEST ENDPOINTS DA FIX - 29/12/2025" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Login để lấy token
Write-Host "1. Dang nhap de lay token..." -ForegroundColor Yellow

$loginBody = @{
    email = "testuser20251229152654@test.com"
    password = "TestPassword123!"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST `
        -Headers @{
            "Content-Type" = "application/json"
            "x-api-key" = $apiKey
        } `
        -Body $loginBody
    
    $token = $loginResponse.accessToken
    $userId = $loginResponse.user.id
    
    Write-Host "   [PASS] Login thanh cong! User ID: $userId" -ForegroundColor Green
} catch {
    Write-Host "   [FAIL] Login that bai: $_" -ForegroundColor Red
    exit 1
}

$authHeaders = @{
    "Content-Type" = "application/json"
    "x-api-key" = $apiKey
    "Authorization" = "Bearer $token"
}

$results = @()

# Test 1: Profile endpoint fix (dung /users/{userId})
Write-Host "`n2. Test PROFILE endpoint (FIX: /users/{userId})" -ForegroundColor Yellow
Write-Host "   Endpoint cu (loi): /auth/profile" -ForegroundColor DarkGray
Write-Host "   Endpoint moi (fix): /users/$userId" -ForegroundColor DarkGray

try {
    $profileResponse = Invoke-RestMethod -Uri "$baseUrl/users/$userId" -Method GET -Headers $authHeaders
    Write-Host "   [PASS] Profile - Lay thong tin user thanh cong!" -ForegroundColor Green
    Write-Host "   Data: email=$($profileResponse.email), role=$($profileResponse.role)" -ForegroundColor Gray
    $results += @{ Feature = "Profile"; Status = "PASS"; Endpoint = "/users/$userId" }
} catch {
    Write-Host "   [FAIL] Profile - Loi: $($_.Exception.Message)" -ForegroundColor Red
    $results += @{ Feature = "Profile"; Status = "FAIL"; Endpoint = "/users/$userId" }
}

# Test 2: Construction Progress endpoint fix (dung /projects/{id}/progress)
Write-Host "`n3. Test CONSTRUCTION PROGRESS endpoint (FIX: /projects/{id}/progress)" -ForegroundColor Yellow
Write-Host "   Endpoint cu (loi): /construction/progress" -ForegroundColor DarkGray
Write-Host "   Endpoint moi (fix): /projects/1/progress" -ForegroundColor DarkGray

try {
    $progressResponse = Invoke-RestMethod -Uri "$baseUrl/projects/1/progress" -Method GET -Headers $authHeaders
    Write-Host "   [PASS] Progress - Lay tien do du an thanh cong!" -ForegroundColor Green
    Write-Host "   Data: $($progressResponse | ConvertTo-Json -Compress -Depth 1)" -ForegroundColor Gray
    $results += @{ Feature = "Construction Progress"; Status = "PASS"; Endpoint = "/projects/1/progress" }
} catch {
    Write-Host "   [FAIL] Progress - Loi: $($_.Exception.Message)" -ForegroundColor Red
    $results += @{ Feature = "Construction Progress"; Status = "FAIL"; Endpoint = "/projects/1/progress" }
}

# Test 3: Timeline endpoint fix (dung /projects/{id}/timeline)
Write-Host "`n4. Test TIMELINE endpoint (FIX: /projects/{id}/timeline)" -ForegroundColor Yellow
Write-Host "   Endpoint cu (loi): /timeline" -ForegroundColor DarkGray
Write-Host "   Endpoint moi (fix): /projects/1/timeline" -ForegroundColor DarkGray

try {
    $timelineResponse = Invoke-RestMethod -Uri "$baseUrl/projects/1/timeline" -Method GET -Headers $authHeaders
    Write-Host "   [PASS] Timeline - Lay timeline du an thanh cong!" -ForegroundColor Green
    Write-Host "   Data count: $($timelineResponse.Count) items" -ForegroundColor Gray
    $results += @{ Feature = "Timeline"; Status = "PASS"; Endpoint = "/projects/1/timeline" }
} catch {
    Write-Host "   [FAIL] Timeline - Loi: $($_.Exception.Message)" -ForegroundColor Red
    $results += @{ Feature = "Timeline"; Status = "FAIL"; Endpoint = "/projects/1/timeline" }
}

# Test 4-8: Cac endpoint chua co BE (expected 404)
Write-Host "`n5. Test cac endpoint CHUA CO BE (expected 404 - dung mock data)" -ForegroundColor Yellow

$comingSoonEndpoints = @(
    @{ Name = "Documents"; Endpoint = "/documents" },
    @{ Name = "Budget"; Endpoint = "/budget/summary" },
    @{ Name = "Contracts"; Endpoint = "/contracts" },
    @{ Name = "Analytics"; Endpoint = "/analytics/dashboard" },
    @{ Name = "Search"; Endpoint = "/search?q=test" }
)

foreach ($ep in $comingSoonEndpoints) {
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl$($ep.Endpoint)" -Method GET -Headers $authHeaders
        Write-Host "   [$($ep.Name)] API response (unexpected): $($response | ConvertTo-Json -Compress)" -ForegroundColor Yellow
        $results += @{ Feature = $ep.Name; Status = "UNEXPECTED_OK"; Endpoint = $ep.Endpoint }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 404) {
            Write-Host "   [$($ep.Name)] 404 (expected) - App se dung MOCK DATA" -ForegroundColor Cyan
            $results += @{ Feature = $ep.Name; Status = "MOCK_MODE"; Endpoint = $ep.Endpoint }
        } else {
            Write-Host "   [$($ep.Name)] Error $statusCode - $($_.Exception.Message)" -ForegroundColor Red
            $results += @{ Feature = $ep.Name; Status = "ERROR"; Endpoint = $ep.Endpoint }
        }
    }
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "            KET QUA TONG HOP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$passCount = ($results | Where-Object { $_.Status -eq "PASS" }).Count
$mockCount = ($results | Where-Object { $_.Status -eq "MOCK_MODE" }).Count
$failCount = ($results | Where-Object { $_.Status -eq "FAIL" -or $_.Status -eq "ERROR" }).Count

Write-Host "`n  PASS (API hoat dong):     $passCount" -ForegroundColor Green
Write-Host "  MOCK MODE (dung offline): $mockCount" -ForegroundColor Cyan
Write-Host "  FAIL (loi):               $failCount" -ForegroundColor Red

Write-Host "`n----------------------------------------" -ForegroundColor Gray
Write-Host "Chi tiet:" -ForegroundColor Gray
foreach ($r in $results) {
    $color = switch ($r.Status) {
        "PASS" { "Green" }
        "MOCK_MODE" { "Cyan" }
        "FAIL" { "Red" }
        "ERROR" { "Red" }
        default { "Yellow" }
    }
    Write-Host "  $($r.Feature.PadRight(22)) [$($r.Status.PadRight(10))] $($r.Endpoint)" -ForegroundColor $color
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "             GIAI PHAP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`n1. ENDPOINTS DA FIX (dung API that):" -ForegroundColor Green
Write-Host "   - Profile:    /users/{userId}" -ForegroundColor Gray
Write-Host "   - Progress:   /projects/{id}/progress" -ForegroundColor Gray
Write-Host "   - Timeline:   /projects/{id}/timeline" -ForegroundColor Gray

Write-Host "`n2. ENDPOINTS DUNG MOCK DATA (doi BE):" -ForegroundColor Cyan
Write-Host "   - Documents:  services/featureServiceWrapper.ts" -ForegroundColor Gray
Write-Host "   - Budget:     services/featureServiceWrapper.ts" -ForegroundColor Gray
Write-Host "   - Contracts:  services/featureServiceWrapper.ts" -ForegroundColor Gray
Write-Host "   - Analytics:  services/featureServiceWrapper.ts" -ForegroundColor Gray
Write-Host "   - Search:     Local search trong mock data" -ForegroundColor Gray

Write-Host "`n3. FILE MOI DUOC TAO:" -ForegroundColor Yellow
Write-Host "   - services/featureAvailability.ts" -ForegroundColor Gray
Write-Host "   - services/offlineStorage.ts" -ForegroundColor Gray
Write-Host "   - services/featureServiceWrapper.ts" -ForegroundColor Gray
Write-Host "   - data/mockFeatureData.ts" -ForegroundColor Gray
Write-Host "   - hooks/useFeatureAvailability.ts" -ForegroundColor Gray
Write-Host "   - components/ui/FeatureStatus.tsx" -ForegroundColor Gray
Write-Host "   - docs/FIX_GUIDE_AND_UPLOAD_SOLUTION.md" -ForegroundColor Gray

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test hoan tat!" -ForegroundColor Green
