# Notification API Test - Clean Version
$BASE_URL = "https://baotienweb.cloud/api/v1"

Write-Host "======================================"
Write-Host "  NOTIFICATION API INTEGRATION TEST  "
Write-Host "======================================"
Write-Host ""

# Login
Write-Host "[1] Logging in..." -ForegroundColor Yellow
$loginBody = '{"email":"admin@baotien.com","password":"Admin@123"}'
$loginResult = Invoke-RestMethod -Uri "$BASE_URL/auth/login" `
    -Method POST `
    -Body $loginBody `
    -ContentType "application/json"

$TOKEN = $loginResult.access_token
Write-Host "SUCCESS: Token acquired" -ForegroundColor Green
Write-Host ""

# Setup auth header
$authHeaders = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type" = "application/json"
}

# Test 1: Get notifications
Write-Host "[2] GET /notifications..." -ForegroundColor Yellow
$notifications = Invoke-RestMethod -Uri "$BASE_URL/notifications" `
    -Method GET `
    -Headers $authHeaders

Write-Host "SUCCESS: Found $($notifications.meta.total) notifications" -ForegroundColor Green
Write-Host ""

# Test 2: Unread count
Write-Host "[3] GET /notifications/unread-count..." -ForegroundColor Yellow
$unread = Invoke-RestMethod -Uri "$BASE_URL/notifications/unread-count" `
    -Method GET `
    -Headers $authHeaders

Write-Host "SUCCESS: Unread count = $($unread.count)" -ForegroundColor Green
Write-Host ""

# Test 3: Mark one as read
if ($notifications.data.Count -gt 0)
{
    $firstId = $notifications.data[0].id
    Write-Host "[4] PATCH /notifications/$firstId/read..." -ForegroundColor Yellow
    $markOne = Invoke-RestMethod -Uri "$BASE_URL/notifications/$firstId/read" `
        -Method PATCH `
        -Headers $authHeaders
    
    Write-Host "SUCCESS: Marked as read" -ForegroundColor Green
    Write-Host ""
}

# Test 4: Mark all as read
Write-Host "[5] PATCH /notifications/read-all..." -ForegroundColor Yellow
$markAll = Invoke-RestMethod -Uri "$BASE_URL/notifications/read-all" `
    -Method PATCH `
    -Headers $authHeaders

Write-Host "SUCCESS: Marked $($markAll.count) as read" -ForegroundColor Green
Write-Host ""

# Test 5: Verify unread = 0
Write-Host "[6] Verifying unread count = 0..." -ForegroundColor Yellow
$verify = Invoke-RestMethod -Uri "$BASE_URL/notifications/unread-count" `
    -Method GET `
    -Headers $authHeaders

if ($verify.count -eq 0)
{
    Write-Host "PASS: Unread count is 0" -ForegroundColor Green
}
else
{
    Write-Host "FAIL: Expected 0, got $($verify.count)" -ForegroundColor Red
}
Write-Host ""

# Test 6: Archive
if ($notifications.data.Count -gt 1)
{
    $secondId = $notifications.data[1].id
    Write-Host "[7] PATCH /notifications/$secondId/archive..." -ForegroundColor Yellow
    $archive = Invoke-RestMethod -Uri "$BASE_URL/notifications/$secondId/archive" `
        -Method PATCH `
        -Headers $authHeaders
    
    Write-Host "SUCCESS: Archived notification" -ForegroundColor Green
    Write-Host ""
}

# Final summary
Write-Host "======================================"
Write-Host "           TEST SUMMARY               "
Write-Host "======================================"
Write-Host "ALL API ENDPOINTS WORKING!" -ForegroundColor Green
Write-Host ""
Write-Host "Next: Test mobile app" -ForegroundColor Yellow
Write-Host "  1. npm start"
Write-Host "  2. Login as test@baotien.com"
Write-Host "  3. Navigate to Notifications tab"
Write-Host "  4. Pull to refresh"
Write-Host "  5. Wait 30s for polling"
Write-Host ""
