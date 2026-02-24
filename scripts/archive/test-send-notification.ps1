# Script để gửi thông báo thử từ máy khác
# Sử dụng API backend: https://baotienweb.cloud/api/v1/notifications

$baseUrl = "https://baotienweb.cloud/api/v1"

# Thông tin đăng nhập (thay đổi nếu cần)
$email = "test@baotien.com"
$password = "Test@123"

Write-Host "=== GỬI THÔNG BÁO THỬ ===" -ForegroundColor Cyan
Write-Host ""

# Bước 1: Đăng nhập để lấy token
Write-Host "[1] Đăng nhập để lấy token..." -ForegroundColor Yellow
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
    Write-Host "✓ Đăng nhập thành công!" -ForegroundColor Green
    Write-Host "  Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Lỗi đăng nhập: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "  Vui lòng kiểm tra email/password trong script" -ForegroundColor Yellow
    exit 1
}

# Bước 2: Menu chọn loại thông báo
Write-Host "[2] Chọn loại thông báo muốn gửi:" -ForegroundColor Yellow
Write-Host "  1. Tin nhắn (Message)" -ForegroundColor White
Write-Host "  2. Cuộc gọi (Call)" -ForegroundColor White
Write-Host "  3. Thông báo hệ thống (System)" -ForegroundColor White
Write-Host "  4. Sự kiện (Event)" -ForegroundColor White
Write-Host "  5. Live stream (Live)" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Nhập số (1-5)"

# Chuẩn bị notification data dựa trên lựa chọn
switch ($choice) {
    "1" {
        $notificationData = @{
            type = "IN_APP"
            title = "💬 Tin nhắn mới từ Nguyễn Văn A"
            body = "Chào bạn! Dự án của chúng ta tiến triển như thế nào rồi?"
            priority = "HIGH"
            metadata = @{
                category = "message"
                messageType = "chat"
                senderName = "Nguyễn Văn A"
                senderAvatar = "https://i.pravatar.cc/150?img=12"
                preview = "Chào bạn! Dự án của chúng ta..."
                conversationId = "conv_123"
            } | ConvertTo-Json
        }
        $displayName = "Tin nhắn"
    }
    "2" {
        $notificationData = @{
            type = "PUSH"
            title = "📞 Cuộc gọi nhớ từ Trần Thị B"
            body = "Bạn có 1 cuộc gọi nhớ lúc $(Get-Date -Format 'HH:mm')"
            priority = "URGENT"
            metadata = @{
                category = "call"
                callType = "voice"
                callerName = "Trần Thị B"
                callerAvatar = "https://i.pravatar.cc/150?img=5"
                duration = "00:00"
                missedCall = $true
            } | ConvertTo-Json
        }
        $displayName = "Cuộc gọi"
    }
    "3" {
        $notificationData = @{
            type = "IN_APP"
            title = "🔔 Cập nhật hệ thống"
            body = "Hệ thống sẽ bảo trì vào 2:00 AM ngày mai. Vui lòng lưu công việc."
            priority = "MEDIUM"
            metadata = @{
                category = "system"
                systemType = "maintenance"
                scheduledTime = (Get-Date).AddDays(1).ToString("yyyy-MM-ddT02:00:00")
                affectedServices = @("notifications", "messages")
            } | ConvertTo-Json
        }
        $displayName = "Hệ thống"
    }
    "4" {
        $notificationData = @{
            type = "IN_APP"
            title = "🎉 Sự kiện sắp diễn ra"
            body = "Cuộc họp nhóm dự án bắt đầu sau 15 phút"
            priority = "HIGH"
            metadata = @{
                category = "event"
                eventType = "meeting"
                eventName = "Cuộc họp nhóm dự án"
                startTime = (Get-Date).AddMinutes(15).ToString("yyyy-MM-ddTHH:mm:ss")
                location = "Phòng họp A"
                attendees = 5
            } | ConvertTo-Json
        }
        $displayName = "Sự kiện"
    }
    "5" {
        $notificationData = @{
            type = "PUSH"
            title = "🎥 Phát trực tiếp đang diễn ra"
            body = "Nguyễn Văn C đang phát trực tiếp: 'Hướng dẫn React Native'"
            priority = "HIGH"
            metadata = @{
                category = "live"
                liveType = "stream"
                streamerName = "Nguyễn Văn C"
                streamerAvatar = "https://i.pravatar.cc/150?img=8"
                viewerCount = 245
                isActive = $true
                startedAt = (Get-Date).AddMinutes(-10).ToString("yyyy-MM-ddTHH:mm:ss")
            } | ConvertTo-Json
        }
        $displayName = "Live stream"
    }
    default {
        Write-Host "✗ Lựa chọn không hợp lệ!" -ForegroundColor Red
        exit 1
    }
}

# Bước 3: Gửi thông báo
Write-Host ""
Write-Host "[3] Đang gửi thông báo '$displayName'..." -ForegroundColor Yellow

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
    
    Write-Host "✓ Thông báo đã được gửi thành công!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Chi tiết thông báo:" -ForegroundColor Cyan
    Write-Host "  - ID: $($response.id)" -ForegroundColor Gray
    Write-Host "  - Tiêu đề: $($response.title)" -ForegroundColor Gray
    Write-Host "  - Nội dung: $($response.body)" -ForegroundColor Gray
    Write-Host "  - Loại: $($response.type)" -ForegroundColor Gray
    Write-Host "  - Độ ưu tiên: $($response.priority)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "📱 Kiểm tra app để xem thông báo!" -ForegroundColor Green
    
} catch {
    Write-Host "✗ Lỗi khi gửi thông báo:" -ForegroundColor Red
    Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.ErrorDetails.Message) {
        Write-Host "  Chi tiết: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=== HOÀN TẤT ===" -ForegroundColor Cyan
