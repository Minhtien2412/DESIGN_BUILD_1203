# Quick Test - Send specific notification type
param(
    [ValidateSet("message", "call-audio", "call-video", "livestream", "meeting-group", "meeting-private", "group-chat", "system")]
    [string]$Type = "message",
    [string]$FromName = "Test User"
)

$baseUrl = "https://baotienweb.cloud/api/v1"

# Login
$login = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -ContentType "application/json" -Body (@{email="admin@nhaxinhdesign.com";password="Admin123456!"} | ConvertTo-Json)
$token = $login.accessToken

$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}

switch ($Type) {
    "message" {
        $metadata = @{
            category = "message"
            senderName = $FromName
            messageType = "chat"
            senderAvatar = "https://i.pravatar.cc/150?img=12"
            conversationId = "conv_$(Get-Random -Minimum 100 -Maximum 999)"
            messagePreview = "Chao ban! Ban co ranh khong?"
        } | ConvertTo-Json -Compress

        $notif = @{
            type = "MESSAGE"
            title = "Tin nhan moi tu $FromName"
            body = "Chao ban! Ban co ranh khong?"
            priority = "HIGH"
            metadata = $metadata
        }
    }
    
    "call-audio" {
        $metadata = @{
            category = "call"
            callerId = "user_$(Get-Random -Minimum 100 -Maximum 999)"
            callerName = $FromName
            callerAvatar = "https://i.pravatar.cc/150?img=25"
            callType = "audio"
            callAction = "incoming"
        } | ConvertTo-Json -Compress

        $notif = @{
            type = "MESSAGE"
            title = "Cuoc goi thoai den"
            body = "$FromName dang goi ban"
            priority = "URGENT"
            metadata = $metadata
        }
    }
    
    "call-video" {
        $metadata = @{
            category = "call"
            callerId = "user_$(Get-Random -Minimum 100 -Maximum 999)"
            callerName = $FromName
            callerAvatar = "https://i.pravatar.cc/150?img=33"
            callType = "video"
            callAction = "incoming"
        } | ConvertTo-Json -Compress

        $notif = @{
            type = "MESSAGE"
            title = "Cuoc goi video den"
            body = "$FromName dang goi video cho ban"
            priority = "URGENT"
            metadata = $metadata
        }
    }
    
    "livestream" {
        $metadata = @{
            category = "live"
            streamId = "stream_$(Get-Random -Minimum 100 -Maximum 999)"
            streamerName = $FromName
            streamerAvatar = "https://i.pravatar.cc/150?img=45"
            streamTitle = "Truc tiep thi cong cong trinh"
            streamUrl = "https://live.example.com/stream"
            viewerCount = 0
            isLive = $true
        } | ConvertTo-Json -Compress

        $notif = @{
            type = "MESSAGE"
            title = "Livestream dang phat truc tiep"
            body = "${FromName}: Truc tiep thi cong cong trinh"
            priority = "HIGH"
            metadata = $metadata
        }
    }
    
    "meeting-group" {
        $metadata = @{
            category = "meeting"
            meetingId = "meeting_$(Get-Random -Minimum 100 -Maximum 999)"
            meetingTitle = "Hop du an"
            organizerName = $FromName
            organizerAvatar = "https://i.pravatar.cc/150?img=50"
            startTime = (Get-Date).AddHours(2).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
            duration = 60
            location = "Phong hop A"
            attendeeCount = 8
            meetingType = "project-review"
        } | ConvertTo-Json -Compress

        $notif = @{
            type = "PROJECT_UPDATE"
            title = "Cuoc hop sap dien ra"
            body = "${FromName} moi ban tham gia cuoc hop - 2 gio nua"
            priority = "HIGH"
            metadata = $metadata
        }
    }
    
    "meeting-private" {
        $metadata = @{
            category = "meeting"
            meetingId = "meeting_$(Get-Random -Minimum 100 -Maximum 999)"
            meetingTitle = "Hop rieng"
            organizerName = $FromName
            organizerAvatar = "https://i.pravatar.cc/150?img=60"
            startTime = (Get-Date).AddMinutes(30).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
            duration = 30
            location = "Phong rieng"
            attendeeCount = 2
            meetingType = "private"
            isPrivate = $true
        } | ConvertTo-Json -Compress

        $notif = @{
            type = "PROJECT_UPDATE"
            title = "Cuoc hop rieng"
            body = "$FromName moi ban hop rieng - 30 phut nua"
            priority = "HIGH"
            metadata = $metadata
        }
    }
    
    "group-chat" {
        $metadata = @{
            category = "message"
            senderName = $FromName
            messageType = "group"
            senderAvatar = "https://i.pravatar.cc/150?img=70"
            conversationId = "group_$(Get-Random -Minimum 100 -Maximum 999)"
            groupName = "Du an Nha Xinh"
            messagePreview = "Moi nguoi xem bao cao nhe!"
            memberCount = 12
        } | ConvertTo-Json -Compress

        $notif = @{
            type = "MESSAGE"
            title = "Tin nhan nhom: Du an Nha Xinh"
            body = "${FromName}: Moi nguoi xem bao cao nhe!"
            priority = "MEDIUM"
            metadata = $metadata
        }
    }
    
    "system" {
        $metadata = @{
            category = "system"
            systemType = "info"
            icon = "information-circle"
        } | ConvertTo-Json -Compress

        $notif = @{
            type = "SYSTEM"
            title = "Thong bao he thong"
            body = "Cap nhat phien ban moi da san sang"
            priority = "MEDIUM"
            metadata = $metadata
        }
    }
}

$body = $notif | ConvertTo-Json
$res = Invoke-RestMethod -Uri "$baseUrl/notifications" -Method POST -Headers $headers -Body $body

Write-Host "SUCCESS! $Type notification sent (ID: $($res.id))" -ForegroundColor Green
Write-Host "From: $FromName" -ForegroundColor Cyan
Write-Host "App will show in ~30 seconds" -ForegroundColor Yellow
