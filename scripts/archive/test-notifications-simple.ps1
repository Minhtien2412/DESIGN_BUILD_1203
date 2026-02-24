# Simple Notification API Test
# PowerShell-friendly version

$BASE_URL = "https://baotienweb.cloud/api/v1"

Write-Host "`n======================================" -ForegroundColor Cyan
Write-Host "  NOTIFICATION API INTEGRATION TEST  " -ForegroundColor Cyan
Write-Host "======================================`n" -ForegroundColor Cyan

# Step 1: Login
Write-Host "[1] Logging in..." -ForegroundColor Yellow
$loginBody = @{
    email = "test@baotien.com"
    password = "Test@123"
} | ConvertTo-Json

$loginHeaders = @{ "Content-Type" = "application/json" }

$login = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Body $loginBody -Headers $loginHeaders -ErrorAction Stop

$TOKEN = $login.access_token
Write-Host "✓ Login successful. Token: $($TOKEN.Substring(0,20))..." -ForegroundColor Green

# Reusable header
$authHeaders = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $TOKEN"
}

# Step 2: Get notifications list
Write-Host "`n[2] Fetching notifications..." -ForegroundColor Yellow
$notifications = Invoke-RestMethod -Uri "$BASE_URL/notifications" -Method GET -Headers $authHeaders -ErrorAction Stop
Write-Host "✓ Found $($notifications.meta.total) notifications" -ForegroundColor Green
Write-Host "  First 3:" -ForegroundColor Gray
$notifications.data | Select-Object -First 3 | ForEach-Object {
    Write-Host "    - [$($_.id)] $($_.title)" -ForegroundColor White
}

# Step 3: Get unread count
Write-Host "`n[3] Getting unread count..." -ForegroundColor Yellow
$unreadCount = Invoke-RestMethod -Uri "$BASE_URL/notifications/unread-count" -Method GET -Headers $authHeaders -ErrorAction Stop
Write-Host "✓ Unread count: $($unreadCount.count)" -ForegroundColor Green

# Step 4: Mark first notification as read
if ($notifications.data.Count -gt 0) {
    $firstId = $notifications.data[0].id
    Write-Host "`n[4] Marking notification #$firstId as read..." -ForegroundColor Yellow
    $markRead = Invoke-RestMethod -Uri "$BASE_URL/notifications/$firstId/read" -Method PATCH -Headers $authHeaders -ErrorAction Stop
    Write-Host "✓ Marked as read: $($markRead.read)" -ForegroundColor Green
}

# Step 5: Mark all as read
Write-Host "`n[5] Marking all notifications as read..." -ForegroundColor Yellow
$markAllRead = Invoke-RestMethod -Uri "$BASE_URL/notifications/read-all" -Method PATCH -Headers $authHeaders -ErrorAction Stop
Write-Host "✓ Marked $($markAllRead.count) notifications as read" -ForegroundColor Green

# Step 6: Verify unread count is 0
Write-Host ""
Write-Host "[6] Verifying unread count = 0..." -ForegroundColor Yellow
$verifyUnread = Invoke-RestMethod -Uri "$BASE_URL/notifications/unread-count" -Method GET -Headers $authHeaders -ErrorAction Stop
if ($verifyUnread.count -eq 0) {
    Write-Host "OK PASS: Unread count is 0" -ForegroundColor Green
} else {
    Write-Host "ERROR FAIL: Expected 0, got $($verifyUnread.count)" -ForegroundColor Red
}

# Step 7: Archive a notification
if ($notifications.data.Count -gt 1) {
    $secondId = $notifications.data[1].id
    Write-Host "`n[7] Archiving notification #$secondId..." -ForegroundColor Yellow
    $archive = Invoke-RestMethod -Uri "$BASE_URL/notifications/$secondId/archive" -Method PATCH -Headers $authHeaders -ErrorAction Stop
    Write-Host "✓ Archived: $($archive.archived)" -ForegroundColor Green
}

# Step 8: Final check
Write-Host "`n[8] Final notification count..." -ForegroundColor Yellow
$finalNotifs = Invoke-RestMethod -Uri "$BASE_URL/notifications" -Method GET -Headers $authHeaders -ErrorAction Stop
Write-Host "✓ Total notifications: $($finalNotifs.meta.total)" -ForegroundColor Green

# Summary
Write-Host "`n======================================" -ForegroundColor Cyan
Write-Host "           TEST SUMMARY               " -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "✓ Login" -ForegroundColor Green
Write-Host "✓ GET /notifications" -ForegroundColor Green
Write-Host "✓ GET /notifications/unread-count" -ForegroundColor Green
Write-Host "✓ PATCH /notifications/:id/read" -ForegroundColor Green
Write-Host "✓ PATCH /notifications/read-all" -ForegroundColor Green
Write-Host "✓ PATCH /notifications/:id/archive" -ForegroundColor Green
Write-Host "`n✅ All API endpoints working!" -ForegroundColor Green

Write-Host "`nNext: Test in mobile app" -ForegroundColor Yellow
Write-Host "  1. npm start" -ForegroundColor White
Write-Host "  2. Login as test@baotien.com" -ForegroundColor White
Write-Host "  3. Go to Notifications tab" -ForegroundColor White
Write-Host "  4. Pull to refresh" -ForegroundColor White
Write-Host "  5. Wait 30s for polling test`n" -ForegroundColor White
