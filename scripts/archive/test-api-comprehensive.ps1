# Comprehensive API Testing Script
# Purpose: Test all major API endpoints locally before deployment

param(
    [string]$BaseUrl = "http://localhost:3000",
    [switch]$Verbose
)

$ErrorActionPreference = "Continue"
$testResults = @()

function Write-TestResult {
    param($TestName, $Success, $Details = "")
    
    $result = @{
        Test = $TestName
        Success = $Success
        Details = $Details
        Timestamp = Get-Date -Format "HH:mm:ss"
    }
    
    $script:testResults += $result
    
    if ($Success) {
        Write-Host "✅ $TestName" -ForegroundColor Green
    } else {
        Write-Host "❌ $TestName" -ForegroundColor Red
    }
    
    if ($Verbose -and $Details) {
        Write-Host "   $Details" -ForegroundColor Gray
    }
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "API Testing Suite - Local Backend" -ForegroundColor Cyan
Write-Host "Base URL: $BaseUrl" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "" -ForegroundColor White

# 1. Health Check
Write-Host "[1/10] Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/health" -Method GET -TimeoutSec 5
    Write-TestResult "Health Check" $true "Status: OK"
} catch {
    Write-TestResult "Health Check" $false $_.Exception.Message
}

# 2. Auth - Register
Write-Host "[2/10] Testing User Registration..." -ForegroundColor Yellow
try {
    $registerBody = @{
        email = "test_$(Get-Random)@example.com"
        password = "Test123456"
        name = "Test User"
        phone = "0901234567"
        role = "CLIENT"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$BaseUrl/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $registerBody `
        -TimeoutSec 10
    
    $script:testEmail = ($registerBody | ConvertFrom-Json).email
    Write-TestResult "User Registration" $true "User created: $($script:testEmail)"
} catch {
    Write-TestResult "User Registration" $false $_.Exception.Message
}

# 3. Auth - Login
Write-Host "[3/10] Testing User Login..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = $script:testEmail
        password = "Test123456"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$BaseUrl/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody `
        -TimeoutSec 10
    
    $script:accessToken = $response.access_token
    Write-TestResult "User Login" $true "Token received: $($script:accessToken.Substring(0,20))..."
} catch {
    Write-TestResult "User Login" $false $_.Exception.Message
}

# 4. Auth - Current User (Protected Route)
Write-Host "[4/10] Testing Protected Route (Current User)..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $($script:accessToken)"
    }
    
    $response = Invoke-RestMethod -Uri "$BaseUrl/auth/me" `
        -Method GET `
        -Headers $headers `
        -TimeoutSec 10
    
    Write-TestResult "Get Current User" $true "User: $($response.email)"
} catch {
    Write-TestResult "Get Current User" $false $_.Exception.Message
}

# 5. Products - List (Public)
Write-Host "[5/10] Testing Product List..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/products" -Method GET -TimeoutSec 10
    $count = if ($response.data) { $response.data.Count } else { $response.Count }
    Write-TestResult "Product List" $true "Products found: $count"
} catch {
    Write-TestResult "Product List" $false $_.Exception.Message
}

# 6. Projects - List (Protected)
Write-Host "[6/10] Testing Project List..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $($script:accessToken)"
    }
    
    $response = Invoke-RestMethod -Uri "$BaseUrl/projects" `
        -Method GET `
        -Headers $headers `
        -TimeoutSec 10
    
    $count = if ($response.data) { $response.data.Count } else { $response.Count }
    Write-TestResult "Project List" $true "Projects found: $count"
} catch {
    Write-TestResult "Project List" $false $_.Exception.Message
}

# 7. Favorites - Get (Protected)
Write-Host "[7/10] Testing Favorites API..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $($script:accessToken)"
    }
    
    $response = Invoke-RestMethod -Uri "$BaseUrl/favorites" `
        -Method GET `
        -Headers $headers `
        -TimeoutSec 10
    
    Write-TestResult "Get Favorites" $true "Favorites retrieved"
} catch {
    Write-TestResult "Get Favorites" $false $_.Exception.Message
}

# 8. Cart - Get (Protected)
Write-Host "[8/10] Testing Cart API..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $($script:accessToken)"
    }
    
    $response = Invoke-RestMethod -Uri "$BaseUrl/cart" `
        -Method GET `
        -Headers $headers `
        -TimeoutSec 10
    
    Write-TestResult "Get Cart" $true "Cart retrieved"
} catch {
    Write-TestResult "Get Cart" $false $_.Exception.Message
}

# 9. Notifications - Get (Protected)
Write-Host "[9/10] Testing Notifications API..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $($script:accessToken)"
    }
    
    $response = Invoke-RestMethod -Uri "$BaseUrl/notifications" `
        -Method GET `
        -Headers $headers `
        -TimeoutSec 10
    
    Write-TestResult "Get Notifications" $true "Notifications retrieved"
} catch {
    Write-TestResult "Get Notifications" $false $_.Exception.Message
}

# 10. User Profile - Edit (Protected)
Write-Host "[10/10] Testing Profile Edit API..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $($script:accessToken)"
        "Content-Type" = "application/json"
    }
    
    $profileBody = @{
        name = "Updated Test User"
        phone = "0912345678"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$BaseUrl/user/profile" `
        -Method PUT `
        -Headers $headers `
        -Body $profileBody `
        -TimeoutSec 10
    
    Write-TestResult "Edit Profile" $true "Profile updated"
} catch {
    Write-TestResult "Edit Profile" $false $_.Exception.Message
}

# Summary
Write-Host "" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$passed = ($testResults | Where-Object { $_.Success }).Count
$failed = ($testResults | Where-Object { -not $_.Success }).Count
$total = $testResults.Count

Write-Host "Total Tests: $total" -ForegroundColor White
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor Red
Write-Host "Success Rate: $([math]::Round(($passed/$total)*100, 2))%" -ForegroundColor Cyan

if ($failed -gt 0) {
    Write-Host "" -ForegroundColor White
    Write-Host "Failed Tests:" -ForegroundColor Red
    $testResults | Where-Object { -not $_.Success } | ForEach-Object {
        Write-Host "  - $($_.Test): $($_.Details)" -ForegroundColor Red
    }
}

Write-Host "" -ForegroundColor White
Write-Host "Next Steps:" -ForegroundColor Cyan
if ($passed -eq $total) {
    Write-Host "  ✅ All tests passed! Ready for deployment" -ForegroundColor Green
    Write-Host "  📝 Run: .\backup-before-deploy.ps1" -ForegroundColor Yellow
} else {
    Write-Host "  ⚠️  Fix failing endpoints before deployment" -ForegroundColor Yellow
    Write-Host "  📋 Check backend logs for errors" -ForegroundColor Yellow
}
