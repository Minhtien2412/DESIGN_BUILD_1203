# Test Backend Endpoints - Simplified Version
$API_BASE = "https://baotienweb.cloud/api/v1"

Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host " BACKEND API ENDPOINT TEST" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "API: $API_BASE`n" -ForegroundColor Yellow

$totalTests = 0
$passedTests = 0

$endpoints = @(
    @{Method="GET"; Path="/"; Name="API Root"},
    @{Method="GET"; Path="/health"; Name="Health Check"},
    @{Method="GET"; Path="/projects"; Name="List Projects"},
    @{Method="GET"; Path="/projects/1"; Name="Get Project"},
    @{Method="GET"; Path="/timeline"; Name="List Timelines"},
    @{Method="GET"; Path="/timeline/1"; Name="Get Timeline"},
    @{Method="GET"; Path="/tasks"; Name="List Tasks"},
    @{Method="GET"; Path="/tasks/1"; Name="Get Task"},
    @{Method="GET"; Path="/products"; Name="List Products"},
    @{Method="GET"; Path="/products/1"; Name="Get Product"},
    @{Method="GET"; Path="/payment/invoices"; Name="Payment Invoices"},
    @{Method="GET"; Path="/notifications"; Name="Notifications"},
    @{Method="GET"; Path="/messages"; Name="Messages"},
    @{Method="GET"; Path="/users"; Name="Users"},
    @{Method="POST"; Path="/auth/login"; Name="Auth Login"},
    @{Method="POST"; Path="/auth/register"; Name="Auth Register"}
)

foreach ($endpoint in $endpoints) {
    $totalTests++
    $url = "$API_BASE$($endpoint.Path)"
    
    Write-Host "[$totalTests] $($endpoint.Name)" -NoNewline -ForegroundColor White
    
    try {
        $response = Invoke-WebRequest -Uri $url -Method $endpoint.Method -UseBasicParsing -ErrorAction Stop
        Write-Host " [OK] $($response.StatusCode)" -ForegroundColor Green
        $passedTests++
    }
    catch {
        $status = 0
        if ($_.Exception.Response) {
            $status = [int]$_.Exception.Response.StatusCode
        }
        
        if ($status -eq 404) {
            Write-Host " [404]" -ForegroundColor Red
        }
        elseif ($status -eq 401 -or $status -eq 403) {
            Write-Host " [AUTH] $status" -ForegroundColor Yellow
            $passedTests++
        }
        elseif ($status -eq 400) {
            Write-Host " [VAL] 400" -ForegroundColor Yellow
            $passedTests++
        }
        else {
            Write-Host " [ERR]" -ForegroundColor Red
        }
    }
}

Write-Host "`n═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host " SUMMARY" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Total: $totalTests" -ForegroundColor White
Write-Host "Working: $passedTests" -ForegroundColor Green
Write-Host "Failed: $($totalTests - $passedTests)" -ForegroundColor Red
$rate = [math]::Round(($passedTests / $totalTests) * 100, 1)
Write-Host "Success Rate: $rate%" -ForegroundColor $(if($rate -ge 70) { "Green" } else { "Yellow" })
Write-Host ""
