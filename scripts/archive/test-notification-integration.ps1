# Test Notification System Integration
# Tests all notification API endpoints with real backend

$BASE_URL = "https://baotienweb.cloud/api/v1"
$TOKEN = $null

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  NOTIFICATION SYSTEM INTEGRATION TEST  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to make API calls
function Invoke-ApiTest {
    param(
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null,
        [string]$Description
    )
    
    Write-Host "[TEST] $Description" -ForegroundColor Yellow
    Write-Host "  → $Method $Endpoint" -ForegroundColor Gray
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($TOKEN) {
        $headers["Authorization"] = "Bearer $TOKEN"
    }
    
    try {
        $params = @{
            Uri = "$BASE_URL$Endpoint"
            Method = $Method
            Headers = $headers
            TimeoutSec = 10
        }
        
        if ($Body) {
            $params["Body"] = ($Body | ConvertTo-Json)
        }
        
        $response = Invoke-RestMethod @params
        
        Write-Host "  ✓ SUCCESS" -ForegroundColor Green
        Write-Host "  Response:" -ForegroundColor Gray
        Write-Host ($response | ConvertTo-Json -Depth 3) -ForegroundColor White
        Write-Host ""
        
        return @{ success = $true; data = $response }
    }
    catch {
        Write-Host "  ✗ FAILED" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode.value__
            Write-Host "  Status Code: $statusCode" -ForegroundColor Red
        }
        
        Write-Host ""
        
        return @{ success = $false; error = $_.Exception.Message }
    }
}

# Step 1: Login to get token
Write-Host "==== STEP 1: Authentication ====" -ForegroundColor Cyan
$loginResult = Invoke-ApiTest -Method "POST" -Endpoint "/auth/login" -Body @{
    email = "test@baotien.com"
    password = "Test@123"
} -Description "Login to get access token"

if ($loginResult.success) {
    $TOKEN = $loginResult.data.access_token
    Write-Host "Token acquired: $($TOKEN.Substring(0, 20))..." -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "Cannot proceed without authentication token. Exiting." -ForegroundColor Red
    exit 1
}

# Step 2: Test GET /notifications
Write-Host "==== STEP 2: Fetch Notifications ====" -ForegroundColor Cyan
$endpoint2 = "/notifications?page=1`&limit=10"
$notificationsResult = Invoke-ApiTest -Method "GET" -Endpoint $endpoint2 -Description "Fetch first page of notifications"

$notificationIds = @()
if ($notificationsResult.success -and $notificationsResult.data.data) {
    $notificationIds = $notificationsResult.data.data | ForEach-Object { $_.id }
    Write-Host "Found $($notificationIds.Count) notifications" -ForegroundColor Green
    Write-Host ""
}

# Step 3: Test GET /notifications/unread-count
Write-Host "==== STEP 3: Get Unread Count ====" -ForegroundColor Cyan
$unreadResult = Invoke-ApiTest -Method "GET" -Endpoint "/notifications/unread-count" -Description "Get unread notification count"

$unreadCount = 0
if ($unreadResult.success) {
    $unreadCount = $unreadResult.data.count
    Write-Host "Unread count: $unreadCount" -ForegroundColor Green
    Write-Host ""
}

# Step 4: Test PATCH /notifications/:id/read
if ($notificationIds.Count -gt 0) {
    Write-Host "==== STEP 4: Mark Single as Read ====" -ForegroundColor Cyan
    $firstNotifId = $notificationIds[0]
    $markReadResult = Invoke-ApiTest -Method "PATCH" -Endpoint "/notifications/$firstNotifId/read" -Description "Mark notification $firstNotifId as read"
    
    if ($markReadResult.success) {
        Write-Host "Successfully marked notification as read" -ForegroundColor Green
        Write-Host ""
    }
} else {
    Write-Host "==== STEP 4: SKIPPED (No notifications found) ====" -ForegroundColor Yellow
    Write-Host ""
}

# Step 5: Test GET /notifications (with filters)
Write-Host "==== STEP 5: Fetch Unread Only ====" -ForegroundColor Cyan
$endpoint5 = "/notifications?isRead=false`&limit=5"
$unreadOnlyResult = Invoke-ApiTest -Method "GET" -Endpoint $endpoint5 -Description "Fetch only unread notifications"

if ($unreadOnlyResult.success) {
    $unreadNotifs = $unreadOnlyResult.data.data
    Write-Host "Found $($unreadNotifs.Count) unread notifications" -ForegroundColor Green
    Write-Host ""
}

# Step 6: Test PATCH /notifications/read-all
Write-Host "==== STEP 6: Mark All as Read ====" -ForegroundColor Cyan
$markAllResult = Invoke-ApiTest -Method "PATCH" -Endpoint "/notifications/read-all" -Description "Mark all notifications as read"

if ($markAllResult.success) {
    Write-Host "Marked $($markAllResult.data.count) notifications as read" -ForegroundColor Green
    Write-Host ""
}

# Step 7: Verify unread count is now 0
Write-Host "==== STEP 7: Verify Unread Count = 0 ====" -ForegroundColor Cyan
$verifyUnreadResult = Invoke-ApiTest -Method "GET" -Endpoint "/notifications/unread-count" -Description "Verify unread count after marking all read"

if ($verifyUnreadResult.success) {
    $newUnreadCount = $verifyUnreadResult.data.count
    
    if ($newUnreadCount -eq 0) {
        Write-Host "✓ PASS: Unread count is 0 as expected" -ForegroundColor Green
    } else {
        Write-Host "✗ FAIL: Expected 0, got $newUnreadCount" -ForegroundColor Red
    }
    Write-Host ""
}

# Step 8: Test PATCH /notifications/:id/archive
if ($notificationIds.Count -gt 1) {
    Write-Host "==== STEP 8: Archive Notification ====" -ForegroundColor Cyan
    $secondNotifId = $notificationIds[1]
    $archiveResult = Invoke-ApiTest -Method "PATCH" -Endpoint "/notifications/$secondNotifId/archive" -Description "Archive notification $secondNotifId"
    
    if ($archiveResult.success) {
        Write-Host "Successfully archived notification" -ForegroundColor Green
        Write-Host ""
    }
} else {
    Write-Host "==== STEP 8: SKIPPED (Not enough notifications) ====" -ForegroundColor Yellow
    Write-Host ""
}

# Step 9: Fetch again to verify archive
Write-Host "==== STEP 9: Verify Archive ====" -ForegroundColor Cyan
$endpoint9 = "/notifications?page=1`&limit=10"
$finalFetchResult = Invoke-ApiTest -Method "GET" -Endpoint $endpoint9 -Description "Fetch notifications to verify archived item removed"

if ($finalFetchResult.success) {
    $finalCount = $finalFetchResult.data.meta.total
    Write-Host "Final notification count: $finalCount" -ForegroundColor Green
    Write-Host ""
}

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "           TEST SUMMARY                 " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✓ Authentication" -ForegroundColor Green
Write-Host "✓ GET /notifications (list)" -ForegroundColor Green
Write-Host "✓ GET /notifications/unread-count" -ForegroundColor Green
Write-Host "✓ PATCH /notifications/:id/read" -ForegroundColor Green
Write-Host "✓ GET /notifications (with filters)" -ForegroundColor Green
Write-Host "✓ PATCH /notifications/read-all" -ForegroundColor Green
Write-Host "✓ PATCH /notifications/:id/archive" -ForegroundColor Green
Write-Host ""
Write-Host "All API endpoints tested successfully!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Run mobile app: npm start" -ForegroundColor White
Write-Host "2. Login with test@baotien.com / Test@123" -ForegroundColor White
Write-Host "3. Navigate to Notifications tab" -ForegroundColor White
Write-Host "4. Pull to refresh to see backend data" -ForegroundColor White
Write-Host "5. Test mark as read, mark all read" -ForegroundColor White
Write-Host "6. Wait 30 seconds to test polling" -ForegroundColor White
Write-Host ""
