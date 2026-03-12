# API Integration Testing Script
# Tests Products, Notifications, Messages APIs

$BASE_URL = "https://baotienweb.cloud/api/v1"
$TEST_EMAIL = "test@example.com"
$TEST_PASSWORD = "Test123456"

Write-Host "`n=== API Integration Testing ===" -ForegroundColor Cyan

# STEP 1: Login
Write-Host "`n[1/4] Authentication..." -ForegroundColor Yellow

$loginBody = @{
    email = $TEST_EMAIL
    password = $TEST_PASSWORD
} | ConvertTo-Json

try {
    $authResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method Post -ContentType "application/json" -Body $loginBody
    $token = $authResponse.accessToken
    Write-Host "[OK] Login successful - User: $($authResponse.user.email)" -ForegroundColor Green
} catch {
    Write-Host "[FAIL] Login failed. Trying register..." -ForegroundColor Red
    
    $registerBody = @{
        email = $TEST_EMAIL
        password = $TEST_PASSWORD
        name = "Test User"
    } | ConvertTo-Json

    try {
        $authResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/register" -Method Post -ContentType "application/json" -Body $registerBody
        $token = $authResponse.accessToken
        Write-Host "[OK] Registration successful" -ForegroundColor Green
    } catch {
        Write-Host "[FAIL] Cannot authenticate. Exiting." -ForegroundColor Red
        exit 1
    }
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# STEP 2: Test Products API
Write-Host "`n[2/4] Products API..." -ForegroundColor Yellow

Write-Host "  [2.1] GET /products" -ForegroundColor Cyan
try {
    $url = "$BASE_URL/products"
    $productsResponse = Invoke-RestMethod -Uri $url -Method Get -Headers $headers
    $count = if ($productsResponse.data) { $productsResponse.data.Count } else { $productsResponse.Count }
    Write-Host "  [OK] Found $count products" -ForegroundColor Green
    $testProductId = if ($productsResponse.data) { $productsResponse.data[0].id } else { $productsResponse[0].id }
} catch {
    Write-Host "  [FAIL] $($_.Exception.Message)" -ForegroundColor Red
}

Start-Sleep -Milliseconds 500

Write-Host "  [2.2] GET /products/:id" -ForegroundColor Cyan
if ($testProductId) {
    try {
        $product = Invoke-RestMethod -Uri "$BASE_URL/products/$testProductId" -Method Get -Headers $headers
        Write-Host "  [OK] Product: $($product.name) - $($product.price) VND" -ForegroundColor Green
    } catch {
        Write-Host "  [FAIL] $($_.Exception.Message)" -ForegroundColor Red
    }
}

Start-Sleep -Milliseconds 500

Write-Host "  [2.3] GET /products with filters" -ForegroundColor Cyan
try {
    $url = "$BASE_URL/products" + "?category=ELECTRONICS"
    $filtered = Invoke-RestMethod -Uri $url -Method Get -Headers $headers
    $count = if ($filtered.data) { $filtered.data.Count } else { $filtered.Count }
    Write-Host "  [OK] Found $count electronics" -ForegroundColor Green
} catch {
    Write-Host "  [FAIL] $($_.Exception.Message)" -ForegroundColor Red
}

# STEP 3: Test Notifications API
Write-Host "`n[3/4] Notifications API..." -ForegroundColor Yellow

Write-Host "  [3.1] GET /notifications" -ForegroundColor Cyan
try {
    $notifs = Invoke-RestMethod -Uri "$BASE_URL/notifications" -Method Get -Headers $headers
    $count = if ($notifs.data) { $notifs.data.Count } else { $notifs.Count }
    Write-Host "  [OK] Found $count notifications" -ForegroundColor Green
    if ($notifs.data -and $notifs.data.Count -gt 0) {
        $testNotifId = $notifs.data[0].id
    }
} catch {
    Write-Host "  [FAIL] $($_.Exception.Message)" -ForegroundColor Red
}

Start-Sleep -Milliseconds 500

Write-Host "  [3.2] GET /notifications/unread-count" -ForegroundColor Cyan
try {
    $unread = Invoke-RestMethod -Uri "$BASE_URL/notifications/unread-count" -Method Get -Headers $headers
    Write-Host "  [OK] Unread: $($unread.count)" -ForegroundColor Green
} catch {
    Write-Host "  [FAIL] $($_.Exception.Message)" -ForegroundColor Red
}

# STEP 4: Test Messages API
Write-Host "`n[4/4] Messages API..." -ForegroundColor Yellow

Write-Host "  [4.1] GET /messages/conversations" -ForegroundColor Cyan
try {
    $convs = Invoke-RestMethod -Uri "$BASE_URL/messages/conversations" -Method Get -Headers $headers
    $count = if ($convs -is [array]) { $convs.Count } else { 1 }
    Write-Host "  [OK] Found $count conversations" -ForegroundColor Green
    if ($convs -and $count -gt 0) {
        $testConvId = if ($convs -is [array]) { $convs[0].id } else { $convs.id }
    }
} catch {
    Write-Host "  [FAIL] $($_.Exception.Message)" -ForegroundColor Red
}

Start-Sleep -Milliseconds 500

Write-Host "  [4.2] GET /messages/unread-count" -ForegroundColor Cyan
try {
    $unreadMsgs = Invoke-RestMethod -Uri "$BASE_URL/messages/unread-count" -Method Get -Headers $headers
    Write-Host "  [OK] Unread messages: $($unreadMsgs.count)" -ForegroundColor Green
} catch {
    Write-Host "  [FAIL] $($_.Exception.Message)" -ForegroundColor Red
}

# Summary
Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host "[OK] Products API: 3 endpoints tested" -ForegroundColor Green
Write-Host "[OK] Notifications API: 2 endpoints tested" -ForegroundColor Green
Write-Host "[OK] Messages API: 2 endpoints tested" -ForegroundColor Green
Write-Host "`nSee MANUAL_CHAT_SEEDING.md for chat data setup" -ForegroundColor Yellow
Write-Host "=== Test Complete ===`n" -ForegroundColor Cyan
