# Test Incoming Call - Simplified
param([string]$CallType = "audio", [string]$CallerName = "Nguyen Van Test")

$baseUrl = "https://baotienweb.cloud/api/v1"
Write-Host "=== TEST INCOMING CALL ===" -ForegroundColor Cyan
Write-Host "Type: $CallType | Caller: $CallerName" -ForegroundColor Yellow

# Login
$login = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -ContentType "application/json" -Body (@{email="admin@nhaxinhdesign.com";password="Admin123456!"} | ConvertTo-Json)
$token = $login.accessToken
Write-Host "Login OK" -ForegroundColor Green

# Send call notification
$callerId = "user_$(Get-Random -Minimum 100 -Maximum 999)"
$metadata = @{
    category = "call"
    callerId = $callerId
    callerName = $CallerName
    callerAvatar = "https://i.pravatar.cc/150?u=$callerId"
    callType = $CallType
    callAction = "incoming"
} | ConvertTo-Json -Compress

$title = if ($CallType -eq "video") { "Cuoc goi video den" } else { "Cuoc goi thoai den" }
$body = "$CallerName dang goi ban"

$notification = @{
    type = "MESSAGE"
    title = $title
    body = $body
    priority = "URGENT"
    metadata = $metadata
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "$baseUrl/notifications" -Method POST -Headers @{Authorization="Bearer $token";"Content-Type"="application/json"} -Body $notification

Write-Host ""
Write-Host "SUCCESS! Call notification sent (ID: $($response.id))" -ForegroundColor Green
Write-Host "App will show incoming call popup in ~30 seconds" -ForegroundColor Yellow
