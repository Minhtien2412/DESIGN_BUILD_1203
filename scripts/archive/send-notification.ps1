# Interactive Notification Sender
Write-Host "=== NOTIFICATION TEST TOOL ===" -ForegroundColor Cyan
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
    Write-Host "  Login failed!" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please check:" -ForegroundColor Yellow
    Write-Host "  1. Email and password are correct" -ForegroundColor White
    Write-Host "  2. Account exists (register in app first)" -ForegroundColor White
    exit 1
}

# Choose notification type
Write-Host ""
Write-Host "Choose notification type:" -ForegroundColor Yellow
Write-Host "  1. Message" -ForegroundColor White
Write-Host "  2. Call" -ForegroundColor White
Write-Host "  3. System" -ForegroundColor White
Write-Host "  4. Event" -ForegroundColor White
Write-Host "  5. Live" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter (1-5)"

$notifications = @{
    "1" = @{
        type = "IN_APP"
        title = "New message"
        body = "You have a new message from Nguyen Van A"
        priority = "HIGH"
        metadata = '{"category":"message","senderName":"Nguyen Van A","messageType":"chat"}'
        name = "Message"
    }
    "2" = @{
        type = "PUSH"
        title = "Missed call"
        body = "You missed a call from Tran Thi B"
        priority = "URGENT"
        metadata = '{"category":"call","callerName":"Tran Thi B","callType":"voice","missedCall":true}'
        name = "Call"
    }
    "3" = @{
        type = "IN_APP"
        title = "System update"
        body = "System maintenance scheduled for tonight"
        priority = "MEDIUM"
        metadata = '{"category":"system","systemType":"maintenance"}'
        name = "System"
    }
    "4" = @{
        type = "IN_APP"
        title = "Event reminder"
        body = "Meeting starts in 15 minutes"
        priority = "HIGH"
        metadata = '{"category":"event","eventType":"meeting","eventName":"Team meeting"}'
        name = "Event"
    }
    "5" = @{
        type = "PUSH"
        title = "Live stream"
        body = "Nguyen Van C is live now"
        priority = "HIGH"
        metadata = '{"category":"live","liveType":"stream","streamerName":"Nguyen Van C","isActive":true}'
        name = "Live"
    }
}

if (-not $notifications.ContainsKey($choice)) {
    Write-Host "Invalid choice!" -ForegroundColor Red
    exit 1
}

$notif = $notifications[$choice]

Write-Host ""
Write-Host "Sending $($notif.name) notification..." -ForegroundColor Yellow

$notifData = @{
    type = $notif.type
    title = $notif.title
    body = $notif.body
    priority = $notif.priority
    metadata = $notif.metadata
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-RestMethod `
        -Uri "$baseUrl/notifications" `
        -Method POST `
        -Headers $headers `
        -Body $notifData `
        -ErrorAction Stop
    
    Write-Host "  Success!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Notification sent:" -ForegroundColor Cyan
    Write-Host "  ID: $($response.id)" -ForegroundColor White
    Write-Host "  Title: $($response.title)" -ForegroundColor White
    Write-Host "  Type: $($response.type)" -ForegroundColor White
    Write-Host ""
    Write-Host "Check your app to see it!" -ForegroundColor Green
    
} catch {
    Write-Host "  Failed to send!" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== DONE ===" -ForegroundColor Cyan
