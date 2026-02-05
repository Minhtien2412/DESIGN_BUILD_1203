# =====================================================
# API & BACKEND HEALTH CHECK (ASCII ONLY OUTPUT)
# =====================================================

Write-Host "" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " API & Backend Health Check" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

$apis = @(
    @{ Name = "Backend API (Main)"; Url = "https://baotienweb.cloud/api/v1/health"; Method = "GET" },
    @{ Name = "Gemini AI"; Url = "https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyCBWfOBoxVeMFLM_-fNi1nN4W6cn-hC56U"; Method = "GET" },
    @{ Name = "ExchangeRate API"; Url = "https://v6.exchangerate-api.com/v6/9990a4b1154e45dfa3a508a5/latest/USD"; Method = "GET" },
    @{ Name = "Perfex CRM"; Url = "https://thietkeresort.com.vn/perfex_crm"; Method = "GET" },
    @{ Name = "Pinecone Vector DB"; Url = "https://designbuild-eh2iv5m.svc.aped-4627-b74a.pinecone.io"; Method = "GET" }
)

$results = @()

foreach ($api in $apis) {
    Write-Host ("[INFO] Checking {0}..." -f $api.Name) -ForegroundColor Yellow

    try {
        $start = Get-Date
        $response = Invoke-WebRequest -Uri $api.Url -Method $api.Method -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
        $latency = [math]::Round(((Get-Date) - $start).TotalMilliseconds)

        Write-Host ("[ OK ] {0}: {1}ms" -f $api.Name, $latency) -ForegroundColor Green

        $results += [pscustomobject]@{
            Name = $api.Name
            Category = "OK"
            Detail = "HTTP $($response.StatusCode)"
            Latency = "$latency ms"
        }
    }
    catch {
        $errorMsg = $_.Exception.Message
        $category = "ERROR"
        $detail = $errorMsg
        $color = "Red"

        if ($errorMsg -match "401|403") {
            $category = "WARN"
            $detail = "Auth required"
            $color = "Yellow"
        }
        elseif ($errorMsg -match "404") {
            $category = "WARN"
            $detail = "Endpoint not found"
            $color = "Yellow"
        }
        elseif ($errorMsg -match "timeout") {
            $category = "ERROR"
            $detail = "Request timeout"
            $color = "Red"
        }

        Write-Host ("[{0}] {1}: {2}" -f $category, $api.Name, $detail) -ForegroundColor $color

        $results += [pscustomobject]@{
            Name = $api.Name
            Category = $category
            Detail = $detail
            Latency = "-"
        }
    }
}

Write-Host ""
Write-Host "Additional backend endpoints:" -ForegroundColor Cyan

$endpoints = @("/auth/verify", "/products", "/projects", "/staff", "/tasks")

foreach ($endpoint in $endpoints) {
    $url = "https://baotienweb.cloud/api/v1$endpoint"
    Write-Host ("  [INFO] {0}" -f $endpoint) -ForegroundColor Gray

    try {
        $response = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        Write-Host ("  [ OK ] {0} (HTTP {1})" -f $endpoint, $response.StatusCode) -ForegroundColor Green
    }
    catch {
        $code = $null
        if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
            $code = [int]$_.Exception.Response.StatusCode
        }
        elseif ([regex]::IsMatch($_.Exception.Message, '\\d{3}')) {
            $code = [regex]::Match($_.Exception.Message, '\\d{3}').Value
        }
        if (-not $code) { $code = "n/a" }

        if ($code -eq "401" -or $code -eq "403") {
            Write-Host ("  [WARN] {0} requires auth" -f $endpoint) -ForegroundColor Yellow
        }
        elseif ($code -eq "404") {
            Write-Host ("  [ERR ] {0} not found" -f $endpoint) -ForegroundColor Red
        }
        else {
            Write-Host ("  [ERR ] {0} failed ({1})" -f $endpoint, $code) -ForegroundColor Red
        }
    }
}

$okCount = ($results | Where-Object { $_.Category -eq "OK" }).Count
$warnCount = ($results | Where-Object { $_.Category -eq "WARN" }).Count
$errorCount = ($results | Where-Object { $_.Category -eq "ERROR" }).Count

Write-Host ""
Write-Host "================ SUMMARY ================" -ForegroundColor Cyan
Write-Host ("  OK   : {0}" -f $okCount) -ForegroundColor Green
Write-Host ("  WARN : {0}" -f $warnCount) -ForegroundColor Yellow
Write-Host ("  ERROR: {0}" -f $errorCount) -ForegroundColor Red
Write-Host "=========================================" -ForegroundColor Cyan

if ($errorCount -eq 0) {
    Write-Host "All monitored services responded successfully." -ForegroundColor Green
}
else {
    Write-Host "Some services failed. Please review the details above." -ForegroundColor Yellow
}

Write-Host ""
