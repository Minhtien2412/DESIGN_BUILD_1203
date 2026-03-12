# Network Diagnostic Tool
# Kiểm tra tất cả nguyên nhân có thể gây lỗi "No Internet Connection"

Write-Host "`n=== NETWORK DIAGNOSTIC TOOL ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Internet connectivity
Write-Host "[TEST 1] Kiểm tra kết nối Internet..." -ForegroundColor Yellow
try {
    $ping = Test-Connection -ComputerName google.com -Count 1 -Quiet
    if ($ping) {
        Write-Host "  OK Internet connected" -ForegroundColor Green
    } else {
        Write-Host "  FAIL No internet connection" -ForegroundColor Red
        Write-Host "  → Bật WiFi hoặc Mobile Data" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "  FAIL Cannot test connection" -ForegroundColor Red
}

Write-Host ""

# Test 2: DNS resolution
Write-Host "[TEST 2] Kiểm tra DNS resolution..." -ForegroundColor Yellow
try {
    $dns = Resolve-DnsName -Name baotienweb.cloud -ErrorAction SilentlyContinue
    if ($dns) {
        Write-Host "  OK DNS resolves baotienweb.cloud" -ForegroundColor Green
        Write-Host "  IP: $($dns[0].IPAddress)" -ForegroundColor Gray
    } else {
        Write-Host "  FAIL Cannot resolve baotienweb.cloud" -ForegroundColor Red
        Write-Host "  → Check DNS settings or use 8.8.8.8" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  FAIL DNS error" -ForegroundColor Red
}

Write-Host ""

# Test 3: Backend API reachable
Write-Host "[TEST 3] Kiểm tra Backend API..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest `
        -Uri "https://baotienweb.cloud/api/v1/health" `
        -Method GET `
        -TimeoutSec 5 `
        -UseBasicParsing `
        -ErrorAction Stop
    
    if ($response.StatusCode -eq 200) {
        Write-Host "  OK Backend API is up" -ForegroundColor Green
        Write-Host "  Status: $($response.StatusCode)" -ForegroundColor Gray
    } else {
        Write-Host "  WARN Unexpected status: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  FAIL Backend API unreachable" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
    Write-Host "  → Backend may be down or timeout" -ForegroundColor Yellow
}

Write-Host ""

# Test 4: SSL/TLS certificate
Write-Host "[TEST 4] Kiểm tra SSL certificate..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest `
        -Uri "https://baotienweb.cloud" `
        -Method HEAD `
        -TimeoutSec 5 `
        -UseBasicParsing `
        -ErrorAction Stop
    
    Write-Host "  OK SSL certificate valid" -ForegroundColor Green
} catch {
    if ($_.Exception.Message -like "*SSL*" -or $_.Exception.Message -like "*certificate*") {
        Write-Host "  FAIL SSL certificate error" -ForegroundColor Red
        Write-Host "  → Certificate expired or invalid" -ForegroundColor Yellow
    } else {
        Write-Host "  OK SSL probably fine" -ForegroundColor Green
    }
}

Write-Host ""

# Test 5: Port accessibility
Write-Host "[TEST 5] Kiểm tra Port 443 (HTTPS)..." -ForegroundColor Yellow
try {
    $tcp = New-Object System.Net.Sockets.TcpClient
    $tcp.Connect("baotienweb.cloud", 443)
    $tcp.Close()
    Write-Host "  OK Port 443 open" -ForegroundColor Green
} catch {
    Write-Host "  FAIL Port 443 blocked or unreachable" -ForegroundColor Red
    Write-Host "  → Firewall may be blocking" -ForegroundColor Yellow
}

Write-Host ""

# Test 6: Check VPN/Proxy
Write-Host "[TEST 6] Kiểm tra VPN/Proxy..." -ForegroundColor Yellow
$proxy = [System.Net.WebRequest]::GetSystemWebProxy()
$proxyUri = $proxy.GetProxy("https://baotienweb.cloud")
if ($proxyUri.Host -eq "baotienweb.cloud") {
    Write-Host "  OK No proxy detected" -ForegroundColor Green
} else {
    Write-Host "  WARN Proxy detected: $($proxyUri.Host)" -ForegroundColor Yellow
    Write-Host "  → VPN/Proxy may affect connection" -ForegroundColor Gray
}

Write-Host ""

# Test 7: Test authentication endpoint
Write-Host "[TEST 7] Test /auth/login endpoint..." -ForegroundColor Yellow
try {
    $loginData = @{
        email = "test@example.com"
        password = "Test123456"
    } | ConvertTo-Json

    $response = Invoke-RestMethod `
        -Uri "https://baotienweb.cloud/api/v1/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginData `
        -TimeoutSec 10 `
        -ErrorAction Stop
    
    if ($response.accessToken) {
        Write-Host "  OK Login endpoint working" -ForegroundColor Green
        Write-Host "  Token received" -ForegroundColor Gray
    } else {
        Write-Host "  WARN Login returned but no token" -ForegroundColor Yellow
    }
} catch {
    if ($_.Exception.Message -like "*401*" -or $_.Exception.Message -like "*Unauthorized*") {
        Write-Host "  OK Endpoint reachable (wrong credentials)" -ForegroundColor Green
    } else {
        Write-Host "  FAIL Login endpoint error" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
    }
}

Write-Host ""

# Test 8: Network speed/latency
Write-Host "[TEST 8] Kiểm tra latency..." -ForegroundColor Yellow
try {
    $measure = Measure-Command {
        Invoke-WebRequest `
            -Uri "https://baotienweb.cloud/api/v1/health" `
            -Method GET `
            -UseBasicParsing `
            -TimeoutSec 10 `
            -ErrorAction Stop | Out-Null
    }
    
    $ms = [math]::Round($measure.TotalMilliseconds)
    if ($ms -lt 1000) {
        Write-Host "  OK Good latency: ${ms}ms" -ForegroundColor Green
    } elseif ($ms -lt 3000) {
        Write-Host "  WARN Slow connection: ${ms}ms" -ForegroundColor Yellow
    } else {
        Write-Host "  FAIL Very slow: ${ms}ms" -ForegroundColor Red
        Write-Host "  → Connection may timeout" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  FAIL Timeout or error" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== SUMMARY ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Nếu tất cả test PASS:" -ForegroundColor White
Write-Host "  → Lỗi 'No Internet' do NetInfo phát hiện sai" -ForegroundColor Gray
Write-Host "  → Restart app hoặc check useNetworkStatus hook" -ForegroundColor Gray
Write-Host ""
Write-Host "Nếu Backend API FAIL:" -ForegroundColor White
Write-Host "  → Server down hoặc đang maintenance" -ForegroundColor Gray
Write-Host "  → Chờ server khôi phục" -ForegroundColor Gray
Write-Host ""
Write-Host "Nếu Internet FAIL:" -ForegroundColor White
Write-Host "  → Thiết bị thực sự không có internet" -ForegroundColor Gray
Write-Host "  → Bật WiFi/Mobile Data" -ForegroundColor Gray
Write-Host ""
