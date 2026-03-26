# ============================================================================
# APP FEATURES ENDPOINTS TEST
# Kiểm tra các chức năng chính trong app với Backend API
# ============================================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "APP FEATURES ENDPOINTS TEST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$BaseUrl = "https://baotienweb.cloud/api/v1"
$ApiKey = "dbuild_client_7d3a9f41c2b84e6d9a5f0e1c7b2a4d88"

# Login để lấy token
Write-Host "`nLogging in to get access token..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = "testuser20251229152654@test.com"
        password = "TestPassword123!"
    } | ConvertTo-Json
    
    $login = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method POST `
        -Headers @{ "Content-Type"="application/json"; "x-api-key"=$ApiKey } `
        -Body $loginBody -TimeoutSec 15
    
    $token = $login.accessToken
    Write-Host "[OK] Login successful" -ForegroundColor Green
} catch {
    Write-Host "[FAIL] Cannot login: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
    "x-api-key" = $ApiKey
    "Content-Type" = "application/json"
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TESTING APP FEATURES" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$results = @()

# ============================================================================
# 1. PROJECTS - Quản lý dự án
# ============================================================================
Write-Host "1. PROJECTS - Quan ly du an" -ForegroundColor Magenta
try {
    $projects = Invoke-RestMethod -Uri "$BaseUrl/projects" -Method GET -Headers $headers -TimeoutSec 10
    Write-Host "   [PASS] GET /projects - Count: $($projects.Count)" -ForegroundColor Green
    $results += @{ Feature="Projects"; Endpoint="/projects"; Status="PASS"; Count=$projects.Count }
} catch {
    Write-Host "   [FAIL] GET /projects: $($_.Exception.Message)" -ForegroundColor Red
    $results += @{ Feature="Projects"; Endpoint="/projects"; Status="FAIL"; Error=$_.Exception.Message }
}

# ============================================================================
# 2. TASKS - Quản lý công việc
# ============================================================================
Write-Host "`n2. TASKS - Quan ly cong viec" -ForegroundColor Magenta
try {
    $tasks = Invoke-RestMethod -Uri "$BaseUrl/tasks" -Method GET -Headers $headers -TimeoutSec 10
    Write-Host "   [PASS] GET /tasks - Count: $($tasks.Count)" -ForegroundColor Green
    $results += @{ Feature="Tasks"; Endpoint="/tasks"; Status="PASS"; Count=$tasks.Count }
} catch {
    Write-Host "   [FAIL] GET /tasks: $($_.Exception.Message)" -ForegroundColor Red
    $results += @{ Feature="Tasks"; Endpoint="/tasks"; Status="FAIL"; Error=$_.Exception.Message }
}

# ============================================================================
# 3. NOTIFICATIONS - Thông báo
# ============================================================================
Write-Host "`n3. NOTIFICATIONS - Thong bao" -ForegroundColor Magenta
try {
    $notifications = Invoke-RestMethod -Uri "$BaseUrl/notifications" -Method GET -Headers $headers -TimeoutSec 10
    Write-Host "   [PASS] GET /notifications - Count: $($notifications.Count)" -ForegroundColor Green
    $results += @{ Feature="Notifications"; Endpoint="/notifications"; Status="PASS"; Count=$notifications.Count }
} catch {
    Write-Host "   [FAIL] GET /notifications: $($_.Exception.Message)" -ForegroundColor Red
    $results += @{ Feature="Notifications"; Endpoint="/notifications"; Status="FAIL"; Error=$_.Exception.Message }
}

# ============================================================================
# 4. MESSAGES - Tin nhắn/Chat
# ============================================================================
Write-Host "`n4. MESSAGES - Tin nhan/Chat" -ForegroundColor Magenta
try {
    $messages = Invoke-RestMethod -Uri "$BaseUrl/messages/conversations" -Method GET -Headers $headers -TimeoutSec 10
    Write-Host "   [PASS] GET /messages/conversations - Count: $($messages.Count)" -ForegroundColor Green
    $results += @{ Feature="Messages"; Endpoint="/messages/conversations"; Status="PASS"; Count=$messages.Count }
} catch {
    Write-Host "   [FAIL] GET /messages/conversations: $($_.Exception.Message)" -ForegroundColor Red
    $results += @{ Feature="Messages"; Endpoint="/messages/conversations"; Status="FAIL"; Error=$_.Exception.Message }
}

# ============================================================================
# 5. PRODUCTS - Sản phẩm/Dịch vụ
# ============================================================================
Write-Host "`n5. PRODUCTS - San pham/Dich vu" -ForegroundColor Magenta
try {
    $products = Invoke-RestMethod -Uri "$BaseUrl/products" -Method GET -Headers $headers -TimeoutSec 10
    Write-Host "   [PASS] GET /products - Count: $($products.Count)" -ForegroundColor Green
    $results += @{ Feature="Products"; Endpoint="/products"; Status="PASS"; Count=$products.Count }
} catch {
    Write-Host "   [FAIL] GET /products: $($_.Exception.Message)" -ForegroundColor Red
    $results += @{ Feature="Products"; Endpoint="/products"; Status="FAIL"; Error=$_.Exception.Message }
}

# ============================================================================
# 6. PROFILE - Thông tin người dùng
# ============================================================================
Write-Host "`n6. PROFILE - Thong tin nguoi dung" -ForegroundColor Magenta
try {
    $profile = Invoke-RestMethod -Uri "$BaseUrl/auth/profile" -Method GET -Headers $headers -TimeoutSec 10
    Write-Host "   [PASS] GET /auth/profile - User: $($profile.email)" -ForegroundColor Green
    $results += @{ Feature="Profile"; Endpoint="/auth/profile"; Status="PASS"; Email=$profile.email }
} catch {
    Write-Host "   [FAIL] GET /auth/profile: $($_.Exception.Message)" -ForegroundColor Red
    $results += @{ Feature="Profile"; Endpoint="/auth/profile"; Status="FAIL"; Error=$_.Exception.Message }
}

# ============================================================================
# 7. CONSTRUCTION - Tiến độ thi công
# ============================================================================
Write-Host "`n7. CONSTRUCTION - Tien do thi cong" -ForegroundColor Magenta
try {
    $construction = Invoke-RestMethod -Uri "$BaseUrl/construction/progress" -Method GET -Headers $headers -TimeoutSec 10
    Write-Host "   [PASS] GET /construction/progress - Count: $($construction.Count)" -ForegroundColor Green
    $results += @{ Feature="Construction"; Endpoint="/construction/progress"; Status="PASS"; Count=$construction.Count }
} catch {
    Write-Host "   [FAIL] GET /construction/progress: $($_.Exception.Message)" -ForegroundColor Red
    $results += @{ Feature="Construction"; Endpoint="/construction/progress"; Status="FAIL"; Error=$_.Exception.Message }
}

# ============================================================================
# 8. DOCUMENTS - Quản lý tài liệu
# ============================================================================
Write-Host "`n8. DOCUMENTS - Quan ly tai lieu" -ForegroundColor Magenta
try {
    $documents = Invoke-RestMethod -Uri "$BaseUrl/documents" -Method GET -Headers $headers -TimeoutSec 10
    Write-Host "   [PASS] GET /documents - Count: $($documents.Count)" -ForegroundColor Green
    $results += @{ Feature="Documents"; Endpoint="/documents"; Status="PASS"; Count=$documents.Count }
} catch {
    Write-Host "   [FAIL] GET /documents: $($_.Exception.Message)" -ForegroundColor Red
    $results += @{ Feature="Documents"; Endpoint="/documents"; Status="FAIL"; Error=$_.Exception.Message }
}

# ============================================================================
# 9. BUDGET - Quản lý ngân sách
# ============================================================================
Write-Host "`n9. BUDGET - Quan ly ngan sach" -ForegroundColor Magenta
try {
    $budget = Invoke-RestMethod -Uri "$BaseUrl/budget" -Method GET -Headers $headers -TimeoutSec 10
    Write-Host "   [PASS] GET /budget - Count: $($budget.Count)" -ForegroundColor Green
    $results += @{ Feature="Budget"; Endpoint="/budget"; Status="PASS"; Count=$budget.Count }
} catch {
    Write-Host "   [FAIL] GET /budget: $($_.Exception.Message)" -ForegroundColor Red
    $results += @{ Feature="Budget"; Endpoint="/budget"; Status="FAIL"; Error=$_.Exception.Message }
}

# ============================================================================
# 10. CONTRACTS - Hợp đồng
# ============================================================================
Write-Host "`n10. CONTRACTS - Hop dong" -ForegroundColor Magenta
try {
    $contracts = Invoke-RestMethod -Uri "$BaseUrl/contracts" -Method GET -Headers $headers -TimeoutSec 10
    Write-Host "   [PASS] GET /contracts - Count: $($contracts.Count)" -ForegroundColor Green
    $results += @{ Feature="Contracts"; Endpoint="/contracts"; Status="PASS"; Count=$contracts.Count }
} catch {
    Write-Host "   [FAIL] GET /contracts: $($_.Exception.Message)" -ForegroundColor Red
    $results += @{ Feature="Contracts"; Endpoint="/contracts"; Status="FAIL"; Error=$_.Exception.Message }
}

# ============================================================================
# 11. TIMELINE - Lịch sử hoạt động
# ============================================================================
Write-Host "`n11. TIMELINE - Lich su hoat dong" -ForegroundColor Magenta
try {
    $timeline = Invoke-RestMethod -Uri "$BaseUrl/timeline" -Method GET -Headers $headers -TimeoutSec 10
    Write-Host "   [PASS] GET /timeline - Count: $($timeline.Count)" -ForegroundColor Green
    $results += @{ Feature="Timeline"; Endpoint="/timeline"; Status="PASS"; Count=$timeline.Count }
} catch {
    Write-Host "   [FAIL] GET /timeline: $($_.Exception.Message)" -ForegroundColor Red
    $results += @{ Feature="Timeline"; Endpoint="/timeline"; Status="FAIL"; Error=$_.Exception.Message }
}

# ============================================================================
# 12. ANALYTICS - Phân tích/Báo cáo
# ============================================================================
Write-Host "`n12. ANALYTICS - Phan tich/Bao cao" -ForegroundColor Magenta
try {
    $analytics = Invoke-RestMethod -Uri "$BaseUrl/analytics/dashboard" -Method GET -Headers $headers -TimeoutSec 10
    Write-Host "   [PASS] GET /analytics/dashboard" -ForegroundColor Green
    $results += @{ Feature="Analytics"; Endpoint="/analytics/dashboard"; Status="PASS" }
} catch {
    Write-Host "   [FAIL] GET /analytics/dashboard: $($_.Exception.Message)" -ForegroundColor Red
    $results += @{ Feature="Analytics"; Endpoint="/analytics/dashboard"; Status="FAIL"; Error=$_.Exception.Message }
}

# ============================================================================
# SUMMARY
# ============================================================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$passCount = ($results | Where-Object { $_.Status -eq "PASS" }).Count
$failCount = ($results | Where-Object { $_.Status -eq "FAIL" }).Count
$totalCount = $results.Count

Write-Host "Total Features Tested: $totalCount" -ForegroundColor Yellow
Write-Host "Passed: $passCount" -ForegroundColor Green
Write-Host "Failed: $failCount" -ForegroundColor Red
Write-Host ""

Write-Host "Detailed Results:" -ForegroundColor Yellow
Write-Host "==================" -ForegroundColor Yellow
foreach ($result in $results) {
    $status = if ($result.Status -eq "PASS") { "[OK]" } else { "[FAIL]" }
    $color = if ($result.Status -eq "PASS") { "Green" } else { "Red" }
    
    Write-Host "$status $($result.Feature) - $($result.Endpoint)" -ForegroundColor $color
    if ($result.Count) {
        Write-Host "      Items: $($result.Count)" -ForegroundColor Gray
    }
    if ($result.Email) {
        Write-Host "      User: $($result.Email)" -ForegroundColor Gray
    }
    if ($result.Error) {
        Write-Host "      Error: $($result.Error)" -ForegroundColor Gray
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test completed: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Cyan

# Export results to JSON
$results | ConvertTo-Json -Depth 5 | Out-File "app-features-test-results.json" -Encoding UTF8
Write-Host "`nResults saved to: app-features-test-results.json" -ForegroundColor Yellow
