# Test All Notification Types
# Gửi đầy đủ các loại: Message, Call, Livestream, Meeting

$baseUrl = "https://baotienweb.cloud/api/v1"

Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "  TEST ALL NOTIFICATION TYPES" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host ""

# Login
Write-Host "Login..." -ForegroundColor Yellow
$login = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -ContentType "application/json" -Body (@{email="admin@nhaxinhdesign.com";password="Admin123456!"} | ConvertTo-Json)
$token = $login.accessToken
Write-Host "  Login OK (User: $($login.user.name))" -ForegroundColor Green
Write-Host ""

$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}

$success = 0
$failed = 0

# 1. MESSAGE - Chat message
Write-Host "1. Sending MESSAGE notification (Chat)..." -ForegroundColor Yellow
try {
    $metadata = @{
        category = "message"
        senderName = "Nguyen Van A"
        messageType = "chat"
        senderAvatar = "https://i.pravatar.cc/150?img=12"
        conversationId = "conv_001"
        messagePreview = "Chao ban! Du an tien trien the nao roi?"
    } | ConvertTo-Json -Compress

    $notif = @{
        type = "MESSAGE"
        title = "Tin nhan moi tu Nguyen Van A"
        body = "Chao ban! Du an tien trien the nao roi?"
        priority = "HIGH"
        metadata = $metadata
    } | ConvertTo-Json

    $res = Invoke-RestMethod -Uri "$baseUrl/notifications" -Method POST -Headers $headers -Body $notif
    Write-Host "  OK - ID: $($res.id)" -ForegroundColor Green
    $success++
} catch {
    Write-Host "  FAILED: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# 2. CALL - Incoming voice call
Write-Host "2. Sending MESSAGE notification (Voice Call)..." -ForegroundColor Yellow
try {
    $metadata = @{
        category = "call"
        callerId = "user_456"
        callerName = "Tran Thi B"
        callerAvatar = "https://i.pravatar.cc/150?img=25"
        callType = "audio"
        callAction = "incoming"
    } | ConvertTo-Json -Compress

    $notif = @{
        type = "MESSAGE"
        title = "Cuoc goi thoai den"
        body = "Tran Thi B dang goi ban"
        priority = "URGENT"
        metadata = $metadata
    } | ConvertTo-Json

    $res = Invoke-RestMethod -Uri "$baseUrl/notifications" -Method POST -Headers $headers -Body $notif
    Write-Host "  OK - ID: $($res.id)" -ForegroundColor Green
    $success++
} catch {
    Write-Host "  FAILED: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# 3. CALL - Video call
Write-Host "3. Sending MESSAGE notification (Video Call)..." -ForegroundColor Yellow
try {
    $metadata = @{
        category = "call"
        callerId = "user_789"
        callerName = "Le Van C"
        callerAvatar = "https://i.pravatar.cc/150?img=33"
        callType = "video"
        callAction = "incoming"
    } | ConvertTo-Json -Compress

    $notif = @{
        type = "MESSAGE"
        title = "Cuoc goi video den"
        body = "Le Van C dang goi video cho ban"
        priority = "URGENT"
        metadata = $metadata
    } | ConvertTo-Json

    $res = Invoke-RestMethod -Uri "$baseUrl/notifications" -Method POST -Headers $headers -Body $notif
    Write-Host "  OK - ID: $($res.id)" -ForegroundColor Green
    $success++
} catch {
    Write-Host "  FAILED: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# 4. LIVESTREAM - Live broadcast started
Write-Host "4. Sending MESSAGE notification (Livestream)..." -ForegroundColor Yellow
try {
    $metadata = @{
        category = "live"
        streamId = "stream_001"
        streamerName = "Pham Van D"
        streamerAvatar = "https://i.pravatar.cc/150?img=45"
        streamTitle = "Thi cong cong trinh - Tuan 3"
        streamUrl = "https://live.example.com/stream_001"
        viewerCount = 0
        isLive = $true
    } | ConvertTo-Json -Compress

    $notif = @{
        type = "MESSAGE"
        title = "Livestream dang phat truc tiep"
        body = "Pham Van D: Thi cong cong trinh - Tuan 3"
        priority = "HIGH"
        metadata = $metadata
    } | ConvertTo-Json

    $res = Invoke-RestMethod -Uri "$baseUrl/notifications" -Method POST -Headers $headers -Body $notif
    Write-Host "  OK - ID: $($res.id)" -ForegroundColor Green
    $success++
} catch {
    Write-Host "  FAILED: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# 5. MEETING - Scheduled meeting
Write-Host "5. Sending PROJECT_UPDATE notification (Meeting)..." -ForegroundColor Yellow
try {
    $metadata = @{
        category = "meeting"
        meetingId = "meeting_001"
        meetingTitle = "Hop du an thang 12"
        organizerName = "Hoang Thi E"
        organizerAvatar = "https://i.pravatar.cc/150?img=50"
        startTime = (Get-Date).AddHours(2).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
        duration = 60
        location = "Phong hop A - Tang 3"
        attendeeCount = 8
        meetingType = "project-review"
    } | ConvertTo-Json -Compress

    $notif = @{
        type = "PROJECT_UPDATE"
        title = "Cuoc hop sap dien ra"
        body = "Hop du an thang 12 - 2 gio nua tai Phong hop A"
        priority = "HIGH"
        metadata = $metadata
    } | ConvertTo-Json

    $res = Invoke-RestMethod -Uri "$baseUrl/notifications" -Method POST -Headers $headers -Body $notif
    Write-Host "  OK - ID: $($res.id)" -ForegroundColor Green
    $success++
} catch {
    Write-Host "  FAILED: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# 6. MEETING - Private meeting (1-on-1)
Write-Host "6. Sending PROJECT_UPDATE notification (Private Meeting)..." -ForegroundColor Yellow
try {
    $metadata = @{
        category = "meeting"
        meetingId = "meeting_002"
        meetingTitle = "Hop rieng: Thao luan ke hoach"
        organizerName = "Tran Van F"
        organizerAvatar = "https://i.pravatar.cc/150?img=60"
        startTime = (Get-Date).AddMinutes(30).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
        duration = 30
        location = "Phong rieng B"
        attendeeCount = 2
        meetingType = "private"
        isPrivate = $true
    } | ConvertTo-Json -Compress

    $notif = @{
        type = "PROJECT_UPDATE"
        title = "Cuoc hop rieng"
        body = "Tran Van F moi ban hop rieng - 30 phut nua"
        priority = "HIGH"
        metadata = $metadata
    } | ConvertTo-Json

    $res = Invoke-RestMethod -Uri "$baseUrl/notifications" -Method POST -Headers $headers -Body $notif
    Write-Host "  OK - ID: $($res.id)" -ForegroundColor Green
    $success++
} catch {
    Write-Host "  FAILED: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# 7. MESSAGE - Group chat
Write-Host "7. Sending MESSAGE notification (Group Chat)..." -ForegroundColor Yellow
try {
    $metadata = @{
        category = "message"
        senderName = "Pham Thi G"
        messageType = "group"
        senderAvatar = "https://i.pravatar.cc/150?img=70"
        conversationId = "group_project_001"
        groupName = "Du an Nha Xinh 2025"
        messagePreview = "Moi nguoi xem bao cao tien do nhe!"
        memberCount = 12
    } | ConvertTo-Json -Compress

    $notif = @{
        type = "MESSAGE"
        title = "Tin nhan nhom: Du an Nha Xinh 2025"
        body = "Pham Thi G: Moi nguoi xem bao cao tien do nhe!"
        priority = "MEDIUM"
        metadata = $metadata
    } | ConvertTo-Json

    $res = Invoke-RestMethod -Uri "$baseUrl/notifications" -Method POST -Headers $headers -Body $notif
    Write-Host "  OK - ID: $($res.id)" -ForegroundColor Green
    $success++
} catch {
    Write-Host "  FAILED: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# 8. SYSTEM - System notification
Write-Host "8. Sending SYSTEM notification..." -ForegroundColor Yellow
try {
    $metadata = @{
        category = "system"
        systemType = "maintenance"
        icon = "settings"
    } | ConvertTo-Json -Compress

    $notif = @{
        type = "SYSTEM"
        title = "Bao tri he thong"
        body = "He thong se bao tri vao 2h sang mai. Vui long luu du lieu."
        priority = "MEDIUM"
        metadata = $metadata
    } | ConvertTo-Json

    $res = Invoke-RestMethod -Uri "$baseUrl/notifications" -Method POST -Headers $headers -Body $notif
    Write-Host "  OK - ID: $($res.id)" -ForegroundColor Green
    $success++
} catch {
    Write-Host "  FAILED: $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

Write-Host ""
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "  RESULTS" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "Success: $success | Failed: $failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Yellow" })
Write-Host ""
Write-Host "Notifications sent:" -ForegroundColor Cyan
Write-Host "  1. Chat message (1-on-1)" -ForegroundColor White
Write-Host "  2. Voice call incoming" -ForegroundColor White
Write-Host "  3. Video call incoming" -ForegroundColor White
Write-Host "  4. Livestream started" -ForegroundColor White
Write-Host "  5. Scheduled meeting (group)" -ForegroundColor White
Write-Host "  6. Private meeting (1-on-1)" -ForegroundColor White
Write-Host "  7. Group chat message" -ForegroundColor White
Write-Host "  8. System notification" -ForegroundColor White
Write-Host ""
Write-Host "App will display these in ~30 seconds (polling interval)" -ForegroundColor Yellow
Write-Host ""
