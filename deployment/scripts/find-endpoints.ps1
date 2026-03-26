# Script to find working alternative endpoints
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FINDING ALTERNATIVE ENDPOINTS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$BaseUrl = "https://baotienweb.cloud/api/v1"
$ApiKey = "dbuild_client_7d3a9f41c2b84e6d9a5f0e1c7b2a4d88"

# Login
Write-Host "Getting access token..." -ForegroundColor Yellow
try {
    $loginBody = @{ email="testuser20251229152654@test.com"; password="TestPassword123!" } | ConvertTo-Json
    $login = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method POST `
        -Headers @{ "Content-Type"="application/json"; "x-api-key"=$ApiKey } `
        -Body $loginBody -TimeoutSec 15
    $token = $login.accessToken
    $userId = 29
    Write-Host "[OK] Token obtained`n" -ForegroundColor Green
} catch {
    Write-Host "[FAIL] Cannot login" -ForegroundColor Red
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
    "x-api-key" = $ApiKey
}

# Test alternative endpoints
$alternatives = @{
    "Construction Progress" = @(
        "/construction", 
        "/progress", 
        "/projects/1/progress",
        "/construction/projects",
        "/project-progress"
    )
    "Documents" = @(
        "/files",
        "/docs",
        "/project-documents",
        "/projects/1/documents",
        "/storage/documents"
    )
    "Budget" = @(
        "/budgets",
        "/financial/budget",
        "/projects/1/budget",
        "/project-budget",
        "/finance"
    )
    "Contracts" = @(
        "/contract",
        "/legal/contracts",
        "/projects/1/contracts",
        "/project-contracts"
    )
    "Timeline" = @(
        "/activity",
        "/feed",
        "/history",
        "/projects/1/timeline",
        "/project-timeline",
        "/activity-feed"
    )
    "Analytics" = @(
        "/dashboard",
        "/reports",
        "/stats",
        "/statistics",
        "/analytics"
    )
}

$found = @()

foreach ($feature in $alternatives.Keys) {
    Write-Host "Testing: $feature" -ForegroundColor Magenta
    Write-Host "===========================================" -ForegroundColor Gray
    
    foreach ($endpoint in $alternatives[$feature]) {
        $url = "$BaseUrl$endpoint"
        try {
            $result = Invoke-RestMethod -Uri $url -Method GET -Headers $headers -TimeoutSec 5
            Write-Host "  [FOUND] $endpoint" -ForegroundColor Green
            $found += @{
                Feature = $feature
                Endpoint = $endpoint
                Status = "FOUND"
                ResponseType = $result.GetType().Name
            }
        } catch {
            $statusCode = $_.Exception.Response.StatusCode.value__
            if ($statusCode -eq 404) {
                Write-Host "  [404] $endpoint" -ForegroundColor DarkGray
            } elseif ($statusCode -eq 401) {
                Write-Host "  [401] $endpoint (Auth issue)" -ForegroundColor Yellow
            } elseif ($statusCode -eq 400) {
                Write-Host "  [400] $endpoint (Bad request - might need params)" -ForegroundColor Yellow
                $found += @{
                    Feature = $feature
                    Endpoint = $endpoint
                    Status = "EXISTS (needs params)"
                }
            } else {
                Write-Host "  [$statusCode] $endpoint" -ForegroundColor DarkYellow
            }
        }
    }
    Write-Host ""
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SUMMARY OF FOUND ENDPOINTS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($found.Count -gt 0) {
    Write-Host "Found $($found.Count) working/existing endpoints:" -ForegroundColor Green
    Write-Host ""
    foreach ($item in $found) {
        Write-Host "  * $($item.Feature): $($item.Endpoint)" -ForegroundColor Green
        if ($item.Status -eq "EXISTS (needs params)") {
            Write-Host "    (Requires query parameters or path variables)" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "No alternative endpoints found." -ForegroundColor Yellow
    Write-Host "Endpoints may require:" -ForegroundColor Gray
    Write-Host "  - Different authentication" -ForegroundColor Gray
    Write-Host "  - Project ID or other parameters" -ForegroundColor Gray
    Write-Host "  - May not be implemented yet" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
