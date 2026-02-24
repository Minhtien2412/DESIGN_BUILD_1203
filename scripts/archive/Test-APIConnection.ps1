# ===================================================================
# BAOTIENWEB ADMIN - API CONNECTION TEST
# Testing full API integration with baotienweb.cloud
# ===================================================================

Write-Host "`n" -NoNewline
Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host "  BAOTIENWEB ADMIN - API CONNECTION TEST" -ForegroundColor White
Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "https://baotienweb.cloud/api/v1"
$testsPassed = 0
$testsFailed = 0
$token = $null

# ===================================================================
# TEST 1: API Health Check
# ===================================================================
Write-Host "ðŸ“¡ TEST 1: API Health Check" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl" -Method GET -UseBasicParsing -TimeoutSec 10
    Write-Host "   âœ… API is reachable (Status: $($response.StatusCode))" -ForegroundColor Green
    $testsPassed++
} catch {
    Write-Host "   âŒ API is not reachable" -ForegroundColor Red
    $testsFailed++
}
Write-Host ""

# ===================================================================
# TEST 2: Register New User
# ===================================================================
Write-Host "ðŸ“ TEST 2: User Registration" -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$testUser = @{
    email = "testuser.$timestamp@baotienweb.com"
    password = "TestPass123!@#"
    name = "Test User $timestamp"
    role = "ENGINEER"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $testUser -ContentType "application/json"
    Write-Host "   âœ… User registered successfully" -ForegroundColor Green
    Write-Host "      User ID: $($response.user.id)" -ForegroundColor Gray
    Write-Host "      Email: $($response.user.email)" -ForegroundColor Gray
    Write-Host "      Role: $($response.user.role)" -ForegroundColor Gray
    $token = $response.accessToken
    $testsPassed++
} catch {
    Write-Host "   âŒ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}
Write-Host ""

# ===================================================================
# TEST 3: Login with Admin
# ===================================================================
Write-Host "ðŸ” TEST 3: Login with Admin User" -ForegroundColor Yellow
$loginData = @{
    email = "admin.test@baotienweb.com"
    password = "AdminTest123!@#"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    Write-Host "   âœ… Login successful" -ForegroundColor Green
    Write-Host "      User: $($response.user.name)" -ForegroundColor Gray
    Write-Host "      Role: $($response.user.role)" -ForegroundColor Gray
    $token = $response.accessToken
    $testsPassed++
} catch {
    Write-Host "   âŒ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}
Write-Host ""

# ===================================================================
# TEST 4: Get Users List (with auth)
# ===================================================================
Write-Host "ðŸ‘¥ TEST 4: Fetch Users List" -ForegroundColor Yellow
if ($token) {
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/users" -Method GET -Headers $headers
        Write-Host "   âœ… Users fetched successfully" -ForegroundColor Green
        Write-Host "      Total users: $($response.Count)" -ForegroundColor Gray
        $testsPassed++
    } catch {
        Write-Host "   âŒ Failed to fetch users: $($_.Exception.Message)" -ForegroundColor Red
        $testsFailed++
    }
} else {
    Write-Host "   âš ï¸ Skipped (no auth token)" -ForegroundColor Yellow
    $testsFailed++
}
Write-Host ""

# ===================================================================
# TEST 5: Get Projects List (with auth)
# ===================================================================
Write-Host "ðŸ“‚ TEST 5: Fetch Projects List" -ForegroundColor Yellow
if ($token) {
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/projects" -Method GET -Headers $headers
        Write-Host "   âœ… Projects fetched successfully" -ForegroundColor Green
        Write-Host "      Total projects: $($response.Count)" -ForegroundColor Gray
        $testsPassed++
    } catch {
        Write-Host "   âŒ Failed to fetch projects: $($_.Exception.Message)" -ForegroundColor Red
        $testsFailed++
    }
} else {
    Write-Host "   âš ï¸ Skipped (no auth token)" -ForegroundColor Yellow
    $testsFailed++
}
Write-Host ""

# ===================================================================
# TEST 6: Create New Project
# ===================================================================
Write-Host "âž• TEST 6: Create New Project" -ForegroundColor Yellow
if ($token) {
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $newProject = @{
        name = "Test Project $(Get-Date -Format 'yyyyMMddHHmmss')"
        description = "Test project created by API test script"
        status = "PLANNING"
        budget = 100000000
        startDate = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        endDate = (Get-Date).AddMonths(6).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/projects" -Method POST -Headers $headers -Body $newProject
        Write-Host "   âœ… Project created successfully" -ForegroundColor Green
        Write-Host "      Project ID: $($response.id)" -ForegroundColor Gray
        Write-Host "      Name: $($response.name)" -ForegroundColor Gray
        $testsPassed++
    } catch {
        Write-Host "   âŒ Failed to create project: $($_.Exception.Message)" -ForegroundColor Red
        $testsFailed++
    }
} else {
    Write-Host "   âš ï¸ Skipped (no auth token)" -ForegroundColor Yellow
    $testsFailed++
}
Write-Host ""

# ===================================================================
# TEST 7: Token Refresh
# ===================================================================
Write-Host "ðŸ”„ TEST 7: Token Refresh" -ForegroundColor Yellow
if ($token) {
    # First login to get refresh token
    try {
        $loginResp = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginData -ContentType "application/json"
        $refreshData = @{
            refreshToken = $loginResp.refreshToken
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$baseUrl/auth/refresh" -Method POST -Body $refreshData -ContentType "application/json"
        Write-Host "   âœ… Token refreshed successfully" -ForegroundColor Green
        $testsPassed++
    } catch {
        Write-Host "   âŒ Token refresh failed: $($_.Exception.Message)" -ForegroundColor Red
        $testsFailed++
    }
} else {
    Write-Host "   âš ï¸ Skipped (no auth token)" -ForegroundColor Yellow
    $testsFailed++
}
Write-Host ""

# ===================================================================
# SUMMARY
# ===================================================================
Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host "  TEST SUMMARY" -ForegroundColor White
Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Total Tests: " -NoNewline -ForegroundColor Gray
Write-Host ($testsPassed + $testsFailed) -ForegroundColor White
Write-Host "   âœ… Passed: " -NoNewline -ForegroundColor Green
Write-Host $testsPassed -ForegroundColor White
Write-Host "   âŒ Failed: " -NoNewline -ForegroundColor Red
Write-Host $testsFailed -ForegroundColor White
Write-Host ""

if ($testsFailed -eq 0) {
    Write-Host "   ðŸŽ‰ ALL TESTS PASSED!" -ForegroundColor Green
    Write-Host "   ðŸš€ Frontend is ready to connect to API" -ForegroundColor Green
} else {
    Write-Host "   âš ï¸ Some tests failed - please review" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host "  CONFIGURATION" -ForegroundColor White
Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Base URL: $baseUrl" -ForegroundColor Gray
Write-Host "   Dev Server: http://localhost:3000" -ForegroundColor Gray
Write-Host "   API Docs: https://baotienweb.cloud/api/docs" -ForegroundColor Gray
Write-Host ""
Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host ""

