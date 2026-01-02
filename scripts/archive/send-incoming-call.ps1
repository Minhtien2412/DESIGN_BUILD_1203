# Test Incoming Call Notification
# Gửi cuộc gọi đến test từ máy khác

param(
    [string]$CallType = "audio",  # audio hoặc video
    [string]$CallerName = "Nguyen Van Test"
)

$baseUrl = "https://baotienweb.cloud/api/v1"
$email = "admin@nhaxinhdesign.com"
$password = "Admin123456!"

Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "  TEST INCOMING CALL NOTIFICATION" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Call Type: $CallType" -ForegroundColor Yellow
Write-Host "Caller: $CallerName" -ForegroundColor Yellow
Write-Host ""

# Login
Write-Host "Step 1: Login..." -ForegroundColor Yellow
try {
    $loginResponse = Invoke-RestMethod `
        -Uri "$baseUrl/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body (@{
            email = $email
            password = $password
        } | ConvertTo-Json)
    
    $token = $loginResponse.accessToken
    Write-Host "  ✓ Login success!" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 2: Sending incoming call notification..." -ForegroundColor Yellow

$callerId = "user_$(Get-Random -Minimum 100 -Maximum 999)"
$metadata = @{
    category = "call"
    callerId = $callerId
    callerName = $CallerName
    callerAvatar = "https://i.pravatar.cc/150?u=$callerId"
    callType = $CallType
    callAction = "incoming"
    timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
} | ConvertTo-Json -Compress

$notification = @{
    type = "MESSAGE"
    title = if ($CallType -eq "video") { "Cuộc gọi video đến" } else { "Cuộc gọi thoại đến" }
    body = "$CallerName đang gọi $(if ($CallType -eq 'video') { 'video' } else { '' }) cho bạn"
    priority = "URGENT"
    metadata = $metadata
} | ConvertTo-Json

Write-Host "  Payload:" -ForegroundColor Gray
Write-Host "    $notification" -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-RestMethod `
        -Uri "$baseUrl/notifications" `
        -Method POST `
        -Headers @{
            Authorization = "Bearer $token"
            "Content-Type" = "application/json"
        } `
        -Body $notification
    
    Write-Host "  ✓ Incoming call notification sent!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 5 | Write-Host -ForegroundColor White
    
} catch {
    Write-Host "  ✗ Failed to send notification!" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "  Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    exit 1
}

Write-Host ""
Write-Host "==================================================================" -ForegroundColor Green
Write-Host "  ✓ INCOMING CALL NOTIFICATION SENT!" -ForegroundColor Green
Write-Host "==================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Notification đã được gửi đến app!" -ForegroundColor Green
Write-Host "App sẽ hiển thị popup cuộc gọi đến sau ~30 giây (polling interval)" -ForegroundColor Yellow
Write-Host ""
Write-Host "To test different call types:" -ForegroundColor Cyan
Write-Host "  .\send-incoming-call.ps1 -CallType audio" -ForegroundColor White
Write-Host "  .\send-incoming-call.ps1 -CallType video" -ForegroundColor White
Write-Host "  .\send-incoming-call.ps1 -CallType video -CallerName ""Tran Thi B""" -ForegroundColor White
Write-Host ""
