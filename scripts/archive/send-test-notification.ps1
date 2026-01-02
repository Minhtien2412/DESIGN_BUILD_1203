# Test Notification Sender
# Send test notifications to app

$baseUrl = "https://baotienweb.cloud/api/v1"
$email = "test@baotien.com"
$password = "Test@123"

Write-Host "=== SEND TEST NOTIFICATION ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Login
Write-Host "[1] Logging in..." -ForegroundColor Yellow
$loginBody = @{
    email = $email
    password = $password
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody
    
    $token = $loginResponse.token
    Write-Host "  Success! Token received" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "  Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Choose notification type
Write-Host "[2] Choose notification type:" -ForegroundColor Yellow
Write-Host "  1. Message (Chat)" -ForegroundColor White
Write-Host "  2. Call (Missed)" -ForegroundColor White
Write-Host "  3. System" -ForegroundColor White
Write-Host "  4. Event" -ForegroundColor White
Write-Host "  5. Live Stream" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter number (1-5)"

# Prepare notification data
switch ($choice) {
    "1" {
        $metadataObj = @{
            category = "message"
            messageType = "chat"
            senderName = "Nguyen Van A"
            senderAvatar = "https://i.pravatar.cc/150?img=12"
            preview = "Chao ban! Du an cua chung ta..."
            conversationId = "conv_123"
        }
        $notificationData = @{
            type = "IN_APP"
            title = "New message from Nguyen Van A"
            body = "Chao ban! Du an cua chung ta tien trien the nao roi?"
            priority = "HIGH"
            metadata = ($metadataObj | ConvertTo-Json -Compress)
        }
        $displayName = "Message"
    }
    "2" {
        $metadataObj = @{
            category = "call"
            callType = "voice"
            callerName = "Tran Thi B"
            callerAvatar = "https://i.pravatar.cc/150?img=5"
            duration = "00:00"
            missedCall = $true
        }
        $notificationData = @{
            type = "PUSH"
            title = "Missed call from Tran Thi B"
            body = "Ban co 1 cuoc goi nho"
            priority = "URGENT"
            metadata = ($metadataObj | ConvertTo-Json -Compress)
        }
        $displayName = "Call"
    }
    "3" {
        $metadataObj = @{
            category = "system"
            systemType = "maintenance"
        }
        $notificationData = @{
            type = "IN_APP"
            title = "System maintenance"
            body = "He thong se bao tri vao 2:00 AM ngay mai"
            priority = "MEDIUM"
            metadata = ($metadataObj | ConvertTo-Json -Compress)
        }
        $displayName = "System"
    }
    "4" {
        $metadataObj = @{
            category = "event"
            eventType = "meeting"
            eventName = "Cuoc hop nhom du an"
            location = "Phong hop A"
            attendees = 5
        }
        $notificationData = @{
            type = "IN_APP"
            title = "Upcoming event"
            body = "Cuoc hop nhom du an bat dau sau 15 phut"
            priority = "HIGH"
            metadata = ($metadataObj | ConvertTo-Json -Compress)
        }
        $displayName = "Event"
    }
    "5" {
        $metadataObj = @{
            category = "live"
            liveType = "stream"
            streamerName = "Nguyen Van C"
            streamerAvatar = "https://i.pravatar.cc/150?img=8"
            viewerCount = 245
            isActive = $true
        }
        $notificationData = @{
            type = "PUSH"
            title = "Live stream is active"
            body = "Nguyen Van C dang phat truc tiep: Huong dan React Native"
            priority = "HIGH"
            metadata = ($metadataObj | ConvertTo-Json -Compress)
        }
        $displayName = "Live Stream"
    }
    default {
        Write-Host "  Invalid choice!" -ForegroundColor Red
        exit 1
    }
}

# Step 3: Send notification
Write-Host ""
Write-Host "[3] Sending '$displayName' notification..." -ForegroundColor Yellow

$notificationJson = $notificationData | ConvertTo-Json -Depth 5

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/notifications" `
        -Method POST `
        -Headers $headers `
        -Body $notificationJson
    
    Write-Host "  Success! Notification sent" -ForegroundColor Green
    Write-Host ""
    Write-Host "Details:" -ForegroundColor Cyan
    Write-Host "  - ID: $($response.id)" -ForegroundColor Gray
    Write-Host "  - Title: $($response.title)" -ForegroundColor Gray
    Write-Host "  - Type: $($response.type)" -ForegroundColor Gray
    Write-Host "  - Priority: $($response.priority)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Check your app to see the notification!" -ForegroundColor Green
    
} catch {
    Write-Host "  Send failed:" -ForegroundColor Red
    Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.ErrorDetails.Message) {
        Write-Host "  Details: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=== DONE ===" -ForegroundColor Cyan
