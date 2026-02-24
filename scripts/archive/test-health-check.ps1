# Health Check Test Script (PowerShell)
# Kiểm tra server status với X-API-Key header

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "HEALTH CHECK TEST" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

$apiKey = "thietke-resort-api-key-2024"
$headers = @{
    'X-API-Key' = $apiKey
    'Content-Type' = 'application/json'
}

$servers = @(
    @{Name="Production VPS"; Url="https://api.thietkeresort.com.vn/health"},
    @{Name="SSH Tunnel"; Url="http://localhost:5000/health"},
    @{Name="Local Mock"; Url="http://localhost:3001/health"}
)

Write-Host "`nAPI Key: $apiKey" -ForegroundColor Gray
Write-Host "Timeout: 10 seconds`n" -ForegroundColor Gray

$results = @()

foreach ($server in $servers) {
    Write-Host "[?] Checking $($server.Name)..." -ForegroundColor Yellow
    Write-Host "   URL: $($server.Url)" -ForegroundColor Gray
    
    $startTime = Get-Date
    
    try {
        $response = Invoke-WebRequest -Uri $server.Url -Headers $headers -TimeoutSec 10 -ErrorAction Stop
        $latency = [math]::Round(((Get-Date) - $startTime).TotalMilliseconds)
        
        Write-Host "   Status: $($response.StatusCode) $($response.StatusDescription)" -ForegroundColor Gray
        Write-Host "   Latency: $($latency)ms" -ForegroundColor Gray
        
        if ($response.StatusCode -eq 200) {
            try {
                $data = $response.Content | ConvertFrom-Json
                Write-Host "   Response: $($response.Content)" -ForegroundColor Gray
                
                if ($data.status -eq "healthy") {
                    Write-Host "   [OK] ONLINE - Server is healthy!`n" -ForegroundColor Green
                    $results += @{Server=$server.Name; Status="online"; Latency=$latency}
                } else {
                    Write-Host "   [!!] WARNING - Unexpected status: $($data.status)`n" -ForegroundColor Yellow
                    $results += @{Server=$server.Name; Status="error"; Latency=$latency}
                }
            } catch {
                Write-Host "   [XX] ERROR - JSON parse failed: $_`n" -ForegroundColor Red
                $results += @{Server=$server.Name; Status="error"; Latency=$latency}
            }
        } else {
            Write-Host "   [XX] ERROR - HTTP $($response.StatusCode)`n" -ForegroundColor Red
            $results += @{Server=$server.Name; Status="error"; Latency=$latency}
        }
    } catch {
        $latency = [math]::Round(((Get-Date) - $startTime).TotalMilliseconds)
        Write-Host "   [XX] OFFLINE - $($_.Exception.Message)`n" -ForegroundColor Red
        $results += @{Server=$server.Name; Status="offline"; Latency=$latency}
    }
}

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "SUMMARY" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

foreach ($result in $results) {
    $icon = switch ($result.Status) {
        "online" { "[OK]" }
        "error"  { "[!!]" }
        default  { "[XX]" }
    }
    
    $color = switch ($result.Status) {
        "online" { "Green" }
        "error"  { "Yellow" }
        default  { "Red" }
    }
    
    $serverName = $result.Server.PadRight(20)
    Write-Host "$icon $serverName $($result.Latency)ms - $($result.Status.ToUpper())" -ForegroundColor $color
}

$onlineResults = @($results | Where-Object { $_.Status -eq "online" })
$onlineCount = $onlineResults.Count
$totalCount = $results.Count
Write-Host "`n[+] $onlineCount/$totalCount servers online" -ForegroundColor $(if ($onlineCount -gt 0) {"Green"} else {"Red"})

if ($onlineCount -eq 0) {
    Write-Host "`n[!] WARNING: All servers offline!" -ForegroundColor Yellow
    Write-Host "Possible issues:" -ForegroundColor Yellow
    Write-Host "  1. X-API-Key header not sent correctly" -ForegroundColor Gray
    Write-Host "  2. Network connectivity problems" -ForegroundColor Gray
    Write-Host "  3. Server is down" -ForegroundColor Gray
}

Write-Host "===================================================`n" -ForegroundColor Cyan
