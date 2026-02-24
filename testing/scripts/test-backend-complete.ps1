# ================================================================
# BACKEND API COMPREHENSIVE TEST SCRIPT
# ================================================================
# Run: .\test-backend-complete.ps1
# ================================================================

$ErrorActionPreference = "Continue"
$baseUrl = "https://baotienweb.cloud/api/v1"
$apiKey = "thietke-resort-api-key-2024"
$timestamp = [int][double]::Parse((Get-Date -UFormat %s))

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║          BACKEND API TEST SUITE                          ║" -ForegroundColor Cyan
Write-Host "║          Base URL: $baseUrl" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

$results = @{
    passed = 0
    failed = 0
    tests = @()
}

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [string]$Body = $null
    )
    
    Write-Host "`n───────────────────────────────────────────────────────────" -ForegroundColor Gray
    Write-Host "TEST: $Name" -ForegroundColor Yellow
    Write-Host "  → $Method $Url" -ForegroundColor Gray
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            UseBasicParsing = $true
            TimeoutSec = 15
        }
        
        if ($Body) {
            $params.Body = $Body
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-RestMethod @params
        
        Write-Host "  ✓ PASSED" -ForegroundColor Green
        $script:results.passed++
        $script:results.tests += @{ name = $Name; status = "PASSED"; response = $response }
        
        return $response
    }
    catch {
        Write-Host "  ✗ FAILED: $($_.Exception.Message)" -ForegroundColor Red
        $script:results.failed++
        $script:results.tests += @{ name = $Name; status = "FAILED"; error = $_.Exception.Message }
        
        return $null
    }
}

# ================================================================
# TEST 1: HEALTH CHECK
# ================================================================
Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║  CATEGORY: SYSTEM HEALTH                                   ║" -ForegroundColor Magenta
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta

$health = Test-Endpoint -Name "Health Check" -Url "$baseUrl/health"
if ($health) {
    Write-Host "    Status: $($health.status)" -ForegroundColor Cyan
    Write-Host "    Database: $($health.database.status)" -ForegroundColor Cyan
    Write-Host "    Memory: $($health.memory.status)" -ForegroundColor Cyan
    Write-Host "    Disk: $($health.disk.status)" -ForegroundColor Cyan
}

# ================================================================
# TEST 2: AUTHENTICATION - REGISTER (All Roles)
# ================================================================
Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║  CATEGORY: AUTHENTICATION - REGISTRATION                   ║" -ForegroundColor Magenta
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta

$roles = @("CLIENT", "ENGINEER", "CONTRACTOR", "STAFF", "ARCHITECT", "DESIGNER", "SUPPLIER", "ADMIN")
$testUsers = @()

foreach ($role in $roles) {
    $email = "test-$($role.ToLower())-$timestamp@example.com"
    $body = @{
        email = $email
        password = "Test123456!"
        fullName = "Test $role User"
        role = $role
    } | ConvertTo-Json -Compress
    
    $user = Test-Endpoint -Name "Register as $role" -Url "$baseUrl/auth/register" -Method POST -Body $body
    
    if ($user) {
        Write-Host "    User ID: $($user.user.id)" -ForegroundColor Cyan
        Write-Host "    Email: $($user.user.email)" -ForegroundColor Cyan
        Write-Host "    Role: $($user.user.role)" -ForegroundColor Green
        Write-Host "    Token: $($user.accessToken.Substring(0, 20))..." -ForegroundColor Gray
        
        $testUsers += @{
            role = $role
            email = $email
            password = "Test123456!"
            userId = $user.user.id
            token = $user.accessToken
        }
    }
}

# ================================================================
# TEST 3: AUTHENTICATION - LOGIN
# ================================================================
Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║  CATEGORY: AUTHENTICATION - LOGIN                          ║" -ForegroundColor Magenta
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta

if ($testUsers.Count -gt 0) {
    $testUser = $testUsers[0]
    $loginBody = @{
        email = $testUser.email
        password = $testUser.password
    } | ConvertTo-Json -Compress
    
    $login = Test-Endpoint -Name "Login as $($testUser.role)" -Url "$baseUrl/auth/login" -Method POST -Body $loginBody
    
    if ($login) {
        Write-Host "    User ID: $($login.user.id)" -ForegroundColor Cyan
        Write-Host "    Email: $($login.user.email)" -ForegroundColor Cyan
        Write-Host "    Token: $($login.accessToken.Substring(0, 20))..." -ForegroundColor Gray
    }
}

# ================================================================
# TEST 4: PRODUCTS API
# ================================================================
Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║  CATEGORY: PRODUCTS                                        ║" -ForegroundColor Magenta
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta

$products = Test-Endpoint -Name "Get All Products" -Url "$baseUrl/products" -Headers @{"x-api-key" = $apiKey}

if ($products) {
    Write-Host "    Total Products: $($products.length)" -ForegroundColor Cyan
    if ($products.length -gt 0) {
        Write-Host "    Sample Product: $($products[0].name)" -ForegroundColor Gray
        Write-Host "    Price: $($products[0].price) VND" -ForegroundColor Gray
    }
}

# ================================================================
# TEST 5: PROJECTS API
# ================================================================
Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║  CATEGORY: PROJECTS                                        ║" -ForegroundColor Magenta
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta

$projects = Test-Endpoint -Name "Get All Projects" -Url "$baseUrl/projects" -Headers @{"x-api-key" = $apiKey}

if ($projects) {
    Write-Host "    Total Projects: $($projects.length)" -ForegroundColor Cyan
    if ($projects.length -gt 0) {
        Write-Host "    Sample Project: $($projects[0].name)" -ForegroundColor Gray
        Write-Host "    Location: $($projects[0].location)" -ForegroundColor Gray
    }
}

# ================================================================
# TEST 6: USER PROFILE (Authenticated)
# ================================================================
Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║  CATEGORY: USER PROFILE                                    ║" -ForegroundColor Magenta
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta

if ($testUsers.Count -gt 0) {
    $authUser = $testUsers[0]
    $profile = Test-Endpoint -Name "Get User Profile" -Url "$baseUrl/auth/profile" -Headers @{"Authorization" = "Bearer $($authUser.token)"}
    
    if ($profile) {
        Write-Host "    User ID: $($profile.id)" -ForegroundColor Cyan
        Write-Host "    Email: $($profile.email)" -ForegroundColor Cyan
        Write-Host "    Full Name: $($profile.fullName)" -ForegroundColor Cyan
        Write-Host "    Role: $($profile.role)" -ForegroundColor Green
        Write-Host "    Email Verified: $($profile.emailVerified)" -ForegroundColor $(if($profile.emailVerified) { "Green" } else { "Yellow" })
    }
}

# ================================================================
# FINAL RESULTS SUMMARY
# ================================================================
Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                    TEST RESULTS SUMMARY                    ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

$total = $results.passed + $results.failed
$passRate = if ($total -gt 0) { [math]::Round(($results.passed / $total) * 100, 1) } else { 0 }

Write-Host "`nTotal Tests: $total" -ForegroundColor White
Write-Host "  ✓ Passed: $($results.passed)" -ForegroundColor Green
Write-Host "  ✗ Failed: $($results.failed)" -ForegroundColor Red
Write-Host "  Pass Rate: $passRate%" -ForegroundColor $(if($passRate -ge 80) { "Green" } else { "Yellow" })

Write-Host "`n───────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host "Detailed Test Results:" -ForegroundColor Yellow

foreach ($test in $results.tests) {
    $icon = if ($test.status -eq "PASSED") { "✓" } else { "✗" }
    $color = if ($test.status -eq "PASSED") { "Green" } else { "Red" }
    Write-Host "  $icon $($test.name)" -ForegroundColor $color
    if ($test.error) {
        Write-Host "      Error: $($test.error)" -ForegroundColor Red
    }
}

# ================================================================
# EXPORT TEST RESULTS
# ================================================================
$reportPath = "test-backend-results-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
$results | ConvertTo-Json -Depth 5 | Out-File $reportPath -Encoding UTF8

Write-Host "`n───────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host "✓ Test report saved: $reportPath" -ForegroundColor Green
Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                 TESTING COMPLETED                          ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan
