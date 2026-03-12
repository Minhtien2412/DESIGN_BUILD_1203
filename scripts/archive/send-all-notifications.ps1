# Auto send all notification types one by one
Write-Host "=== AUTO SEND ALL NOTIFICATIONS ===" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "https://baotienweb.cloud/api/v1"

# Get credentials
Write-Host "Enter your credentials:" -ForegroundColor Yellow
$email = Read-Host "Email"
$password = Read-Host "Password" -AsSecureString
$passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

Write-Host ""
Write-Host "Logging in as $email..." -ForegroundColor Yellow

$loginData = @{
    email = $email
    password = $passwordPlain
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod `
        -Uri "$baseUrl/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginData `
        -ErrorAction Stop
    
    Write-Host "  Login successful!" -ForegroundColor Green
    $token = $loginResponse.token
    
} catch {
    Write-Host "  Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Define all notifications
$notifications = @(
    @{
        name = "Message"
        icon = "💬"
        type = "IN_APP"
        title = "New message from Nguyen Van A"
        body = "Chao ban! Du an cua chung ta tien trien the nao roi?"
        priority = "HIGH"
        metadata = '{"category":"message","senderName":"Nguyen Van A","messageType":"chat","senderAvatar":"https://i.pravatar.cc/150?img=12","preview":"Chao ban! Du an..."}'
    },
    @{
        name = "Call"
        icon = "📞"
        type = "PUSH"
        title = "Missed call from Tran Thi B"
        body = "You have 1 missed call"
        priority = "URGENT"
        metadata = '{"category":"call","callerName":"Tran Thi B","callType":"voice","callerAvatar":"https://i.pravatar.cc/150?img=5","duration":"00:00","missedCall":true}'
    },
    @{
        name = "System"
        icon = "🔔"
        type = "IN_APP"
        title = "System maintenance scheduled"
        body = "System will be under maintenance at 2:00 AM tomorrow"
        priority = "MEDIUM"
        metadata = '{"category":"system","systemType":"maintenance"}'
    },
    @{
        name = "Event"
        icon = "🎉"
        type = "IN_APP"
        title = "Meeting reminder"
        body = "Team meeting starts in 15 minutes"
        priority = "HIGH"
        metadata = '{"category":"event","eventType":"meeting","eventName":"Team meeting","location":"Meeting Room A","attendees":5}'
    },
    @{
        name = "Live"
        icon = "🎥"
        type = "PUSH"
        title = "Live stream is active"
        body = "Nguyen Van C is streaming: React Native Tutorial"
        priority = "HIGH"
        metadata = '{"category":"live","liveType":"stream","streamerName":"Nguyen Van C","streamerAvatar":"https://i.pravatar.cc/150?img=8","viewerCount":245,"isActive":true}'
    }
)

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host ""
Write-Host "Sending notifications..." -ForegroundColor Yellow
Write-Host ""

$successCount = 0
$failCount = 0

foreach ($notif in $notifications) {
    Write-Host "[$($notif.icon)] Sending $($notif.name)..." -ForegroundColor Cyan
    
    $notifData = @{
        type = $notif.type
        title = $notif.title
        body = $notif.body
        priority = $notif.priority
        metadata = $notif.metadata
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod `
            -Uri "$baseUrl/notifications" `
            -Method POST `
            -Headers $headers `
            -Body $notifData `
            -ErrorAction Stop
        
        Write-Host "  ✓ Success! ID: $($response.id)" -ForegroundColor Green
        $successCount++
        
    } catch {
        Write-Host "  ✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
        $failCount++
    }
    
    # Wait 2 seconds between notifications
    if ($notif -ne $notifications[-1]) {
        Write-Host "  Waiting 2 seconds..." -ForegroundColor Gray
        Start-Sleep -Seconds 2
    }
    
    Write-Host ""
}

Write-Host "=== SUMMARY ===" -ForegroundColor Cyan
Write-Host "  Sent: $successCount" -ForegroundColor Green
Write-Host "  Failed: $failCount" -ForegroundColor Red
Write-Host ""
Write-Host "Check your app notifications tab!" -ForegroundColor Green
Write-Host "App will auto-refresh in 30 seconds (polling interval)" -ForegroundColor Yellow
