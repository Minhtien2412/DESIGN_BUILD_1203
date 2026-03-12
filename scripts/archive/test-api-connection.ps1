# 🔍 API CONNECTION TEST SCRIPT
# Kiểm tra kết nối tới Baotienweb API

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║      BAOTIENWEB API - CONNECTION TEST                        ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Test configurations
$configs = @(
    @{
        Name = "Production Domain (baotienweb.cloud)"
        BaseUrl = "https://baotienweb.cloud"
        Endpoints = @(
            "/",
            "/api",
            "/api/v1",
            "/api/docs"
        )
    },
    @{
        Name = "VPS Direct IP"
        BaseUrl = "http://103.200.20.100:3000"
        Endpoints = @(
            "/",
            "/health",
            "/api",
            "/api/v1",
            "/api/docs"
        )
    }
)

# Test function
function Test-Endpoint {
    param(
        [string]$Url,
        [int]$TimeoutSec = 5
    )
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec $TimeoutSec -ErrorAction Stop
        return @{
            Success = $true
            StatusCode = $response.StatusCode
            ContentLength = $response.Content.Length
        }
    } catch {
        return @{
            Success = $false
            Error = $_.Exception.Message
        }
    }
}

# Run tests
foreach ($config in $configs) {
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    Write-Host "📍 Testing: $($config.Name)" -ForegroundColor Yellow
    Write-Host "   Base URL: $($config.BaseUrl)" -ForegroundColor Gray
    Write-Host ""
    
    $successCount = 0
    $totalCount = $config.Endpoints.Count
    
    foreach ($endpoint in $config.Endpoints) {
        $url = "$($config.BaseUrl)$endpoint"
        Write-Host "   🔗 $endpoint" -NoNewline
        
        $result = Test-Endpoint -Url $url
        
        if ($result.Success) {
            Write-Host " ✅ OK (Status: $($result.StatusCode), Size: $($result.ContentLength) bytes)" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host " ❌ FAILED" -ForegroundColor Red
            Write-Host "      Error: $($result.Error)" -ForegroundColor DarkRed
        }
    }
    
    Write-Host ""
    Write-Host "   📊 Result: $successCount/$totalCount endpoints accessible" -ForegroundColor $(if ($successCount -eq $totalCount) { "Green" } else { "Yellow" })
    Write-Host ""
}

# Test specific API endpoints
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "📍 Testing API Endpoints (Authentication)" -ForegroundColor Yellow
Write-Host ""

$apiBase = "https://baotienweb.cloud"
$endpoints = @(
    @{ Method = "POST"; Path = "/api/v1/auth/register"; Body = @{ email = "test@test.com"; password = "Test123!" } },
    @{ Method = "POST"; Path = "/api/v1/auth/login"; Body = @{ email = "test@test.com"; password = "Test123!" } }
)

foreach ($ep in $endpoints) {
    Write-Host "   🔗 $($ep.Method) $($ep.Path)" -NoNewline
    
    try {
        $headers = @{
            "Content-Type" = "application/json"
            "X-API-Key" = "baotienweb-api-key-2025"
        }
        
        $body = $ep.Body | ConvertTo-Json
        $url = "$apiBase$($ep.Path)"
        
        $response = Invoke-RestMethod -Uri $url -Method $ep.Method -Headers $headers -Body $body -TimeoutSec 5 -ErrorAction Stop
        
        Write-Host " ✅ Response received" -ForegroundColor Green
        Write-Host "      Response: $($response | ConvertTo-Json -Compress -Depth 2)" -ForegroundColor Gray
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode) {
            Write-Host " ⚠️  HTTP $statusCode" -ForegroundColor Yellow
        } else {
            Write-Host " ❌ Connection failed" -ForegroundColor Red
        }
        Write-Host "      Error: $($_.Exception.Message)" -ForegroundColor DarkRed
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

# Summary
Write-Host "SUMMARY AND RECOMMENDATIONS" -ForegroundColor Cyan
Write-Host ""
Write-Host "Current Frontend Configuration:" -ForegroundColor Yellow
Write-Host "   • API_BASE_URL: http://103.200.20.100:3000" -ForegroundColor Gray
Write-Host "   • API_PREFIX: /api/v1" -ForegroundColor Gray
Write-Host "   • Fallback: https://baotienweb.cloud" -ForegroundColor Gray
Write-Host ""
Write-Host "Recommended Actions:" -ForegroundColor Yellow
Write-Host "   1. If production domain works → Update env.ts to use baotienweb.cloud" -ForegroundColor Gray
Write-Host "   2. If IP works → Keep current config (VPS direct access)" -ForegroundColor Gray
Write-Host "   3. If both fail → Check server status and firewall" -ForegroundColor Gray
Write-Host ""

Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                  TEST COMPLETE                               ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
