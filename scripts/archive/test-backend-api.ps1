# Backend API Testing Script
# Quick diagnostic tool for testing baotienweb.cloud API

param(
    [string]$BaseUrl = "https://baotienweb.cloud/api/v1",
    [string]$Token = ""
)

Write-Host "`n╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║          BACKEND API DIAGNOSTICS TOOL                        ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Test Results
$testResults = @()

function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Endpoint,
        [string]$Description,
        [hashtable]$Body = $null,
        [bool]$RequiresAuth = $false
    )
    
    Write-Host "`n▶ Testing: $Description" -ForegroundColor Yellow
    Write-Host "  Method: $Method" -ForegroundColor Gray
    Write-Host "  URL: $BaseUrl$Endpoint" -ForegroundColor Gray
    
    try {
        $headers = @{
            'Content-Type' = 'application/json'
            'Accept' = 'application/json'
            'x-api-key' = 'dbuild_client_7d3a9f41c2b84e6d9a5f0e1c7b2a4d88'
        }
        
        if ($RequiresAuth -and $Token) {
            $headers['Authorization'] = "Bearer $Token"
            $tokenPreview = $Token.Substring(0, [Math]::Min(20, $Token.Length))
            Write-Host "  Auth: Bearer token $tokenPreview" -ForegroundColor Gray
        }
        
        $fullUrl = $BaseUrl + $Endpoint
        $params = @{
            Uri = $fullUrl
            Method = $Method
            Headers = $headers
            TimeoutSec = 10
        }
        
        if ($Body) {
            $jsonBody = ($Body | ConvertTo-Json)
            $params['Body'] = $jsonBody
            Write-Host "  Body: " -NoNewline -ForegroundColor Gray
            Write-Host $jsonBody -ForegroundColor White
        }
        
        $response = Invoke-RestMethod @params
        
        Write-Host "  ✅ SUCCESS" -ForegroundColor Green
        Write-Host "  Response:" -ForegroundColor Gray
        Write-Host ($response | ConvertTo-Json -Depth 3) -ForegroundColor White
        
        $testResults += [PSCustomObject]@{
            Endpoint = $Endpoint
            Method = $Method
            Status = 'PASS'
            StatusCode = 200
            Error = $null
        }
        
        return $response
        
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.Value__
        $errorMessage = $_.Exception.Message
        
        Write-Host "  ❌ FAILED" -ForegroundColor Red
        Write-Host "  Status Code: $statusCode" -ForegroundColor Red
        Write-Host "  Error: $errorMessage" -ForegroundColor Red
        
        # Try to get response body
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "  Response Body: $responseBody" -ForegroundColor Red
        } catch {}
        
        $testResults += [PSCustomObject]@{
            Endpoint = $Endpoint
            Method = $Method
            Status = 'FAIL'
            StatusCode = $statusCode
            Error = $errorMessage
        }
        
        return $null
    }
}

# ==================== TESTS ====================

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "1. HEALTH CHECK" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Test-Endpoint -Method 'GET' -Endpoint '/health' -Description 'Server Health Check'

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "2. AUTHENTICATION ENDPOINTS" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

# Test Login
$loginBody = @{
    email = 'test@demo.com'
    password = 'test123'
}

$authResponse = Test-Endpoint -Method 'POST' -Endpoint '/auth/login' `
    -Description 'User Login' -Body $loginBody

if ($authResponse -and $authResponse.token) {
    $Token = $authResponse.token
    $tokenPreview = $Token.Substring(0, [Math]::Min(30, $Token.Length))
    Write-Host "`n  🔑 Token received: $tokenPreview" -ForegroundColor Green
}

# Test Register (might fail if user exists)
$registerBody = @{
    email = "test_$(Get-Date -Format 'yyyyMMddHHmmss')@demo.com"
    password = 'test123'
    name = 'Test User'
}

Test-Endpoint -Method 'POST' -Endpoint '/auth/register' `
    -Description 'User Registration' -Body $registerBody

# Test Get Profile (requires auth)
if ($Token) {
    Test-Endpoint -Method 'GET' -Endpoint '/auth/me' `
        -Description 'Get Current User Profile' -RequiresAuth $true
}

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "3. PROFILE ENDPOINTS (Phase 1)" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

if ($Token) {
    Test-Endpoint -Method 'GET' -Endpoint '/profile' `
        -Description 'Get User Profile' -RequiresAuth $true
    
    $updateBody = @{
        name = 'Updated Name'
        phone = '0901234567'
    }
    
    Test-Endpoint -Method 'PATCH' -Endpoint '/profile' `
        -Description 'Update User Profile' -Body $updateBody -RequiresAuth $true
} else {
    Write-Host "  ⚠️  SKIPPED: No authentication token available" -ForegroundColor Yellow
}

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "4. PROJECTS ENDPOINTS (Phase 1)" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

if ($Token) {
    # List Projects
    Test-Endpoint -Method 'GET' -Endpoint '/projects?page=1&limit=10' `
        -Description 'List Projects' -RequiresAuth $true
    
    # Create Project
    $projectBody = @{
        title = "Test Project $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
        description = 'Created by API test script'
        budget = 5000000000
        startDate = (Get-Date -Format 'yyyy-MM-dd')
        endDate = (Get-Date).AddMonths(6).ToString('yyyy-MM-dd')
    }
    
    $project = Test-Endpoint -Method 'POST' -Endpoint '/projects' `
        -Description 'Create New Project' -Body $projectBody -RequiresAuth $true
    
    # Get Project Detail (if created)
    if ($project -and $project.id) {
        Test-Endpoint -Method 'GET' -Endpoint "/projects/$($project.id)" `
            -Description 'Get Project Detail' -RequiresAuth $true
        
        # Update Project
        $updateProject = @{
            title = "Updated: $($projectBody.title)"
            status = 'IN_PROGRESS'
        }
        
        Test-Endpoint -Method 'PATCH' -Endpoint "/projects/$($project.id)" `
            -Description 'Update Project' -Body $updateProject -RequiresAuth $true
        
        # Delete Project
        Test-Endpoint -Method 'DELETE' -Endpoint "/projects/$($project.id)" `
            -Description 'Delete Project (Soft)' -RequiresAuth $true
    }
} else {
    Write-Host "  ⚠️  SKIPPED: No authentication token available" -ForegroundColor Yellow
}

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "5. SERVICES ENDPOINTS (Phase 1)" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

if ($Token) {
    # Get Service Detail
    Test-Endpoint -Method 'GET' -Endpoint '/services/1/details' `
        -Description 'Get Service Detail (ID: 1)' -RequiresAuth $true
    
    # Create Booking
    $bookingBody = @{
        serviceId = 1
        packageId = 2
        customerName = 'Test Customer'
        customerPhone = '0901234567'
        customerEmail = 'customer@test.com'
        area = 120
        location = 'TP.HCM'
        notes = 'Test booking from API script'
    }
    
    Test-Endpoint -Method 'POST' -Endpoint '/services/bookings' `
        -Description 'Create Service Booking' -Body $bookingBody -RequiresAuth $true
} else {
    Write-Host "  ⚠️  SKIPPED: No authentication token available" -ForegroundColor Yellow
}

# ==================== SUMMARY ====================

Write-Host "`n`n╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                    TEST SUMMARY                               ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$totalTests = $testResults.Count
$passedTests = ($testResults | Where-Object { $_.Status -eq 'PASS' }).Count
$failedTests = ($testResults | Where-Object { $_.Status -eq 'FAIL' }).Count
$passRate = if ($totalTests -gt 0) { [math]::Round(($passedTests / $totalTests) * 100, 1) } else { 0 }

Write-Host "Total Tests: $totalTests" -ForegroundColor White
Write-Host "Passed: $passedTests" -ForegroundColor Green
Write-Host "Failed: $failedTests" -ForegroundColor Red
Write-Host "Pass Rate: $passRate%" -ForegroundColor $(if ($passRate -ge 80) { 'Green' } elseif ($passRate -ge 50) { 'Yellow' } else { 'Red' })

Write-Host "`nDetailed Results:" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

$testResults | Format-Table -Property @(
    @{Label='Method'; Expression={$_.Method}; Width=8},
    @{Label='Endpoint'; Expression={$_.Endpoint}; Width=40},
    @{Label='Status'; Expression={$_.Status}; Width=8},
    @{Label='Code'; Expression={$_.StatusCode}; Width=6},
    @{Label='Error'; Expression={if ($_.Error.Length -gt 30) { $_.Error.Substring(0, 27) + '...' } else { $_.Error }}; Width=30}
) -AutoSize

# Export results to file
$timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$reportFile = "backend_test_report_$timestamp.json"
$testResults | ConvertTo-Json | Out-File -FilePath $reportFile -Encoding UTF8

Write-Host "`n📝 Full report saved to: $reportFile" -ForegroundColor Cyan

# Recommendations
Write-Host "`n`n💡 RECOMMENDATIONS:" -ForegroundColor Yellow

if ($failedTests -eq 0) {
    Write-Host "  ✅ All tests passed! Backend is working correctly." -ForegroundColor Green
    Write-Host "  ✅ Ready for Phase 1 E2E testing with real API." -ForegroundColor Green
} elseif ($failedTests -eq $totalTests) {
    Write-Host "  🔴 All tests failed! Backend might be down or unreachable." -ForegroundColor Red
    Write-Host "  🔴 Check server status: ping baotienweb.cloud" -ForegroundColor Red
    Write-Host "  🔴 Review BACKEND_ERROR_DIAGNOSTICS.md for troubleshooting." -ForegroundColor Red
} else {
    Write-Host "  ⚠️  Some tests failed. Review errors above." -ForegroundColor Yellow
    Write-Host "  ⚠️  Check BACKEND_ERROR_DIAGNOSTICS.md for solutions." -ForegroundColor Yellow
    
    if (-not $Token) {
        Write-Host "  ⚠️  No auth token - some tests were skipped." -ForegroundColor Yellow
        Write-Host "  💡 Fix login endpoint first, then retest." -ForegroundColor Yellow
    }
}

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray
