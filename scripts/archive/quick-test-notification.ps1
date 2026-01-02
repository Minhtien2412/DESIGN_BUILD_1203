# Simple test - check if backend is accessible
$baseUrl = "https://baotienweb.cloud/api/v1"

Write-Host "Testing backend connection..." -ForegroundColor Cyan

# Test 1: Check if API is reachable
try {
    Write-Host "Ping backend API..." -ForegroundColor Yellow
    $response = Invoke-WebRequest -Uri "https://baotienweb.cloud" -Method GET -TimeoutSec 5
    Write-Host "  Backend reachable: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "  Cannot reach backend: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Try login
Write-Host ""
Write-Host "Testing login..." -ForegroundColor Yellow

$loginData = @{
    email = "test@baotien.com"
    password = "Test@123"
}

$loginJson = $loginData | ConvertTo-Json
Write-Host "Login payload: $loginJson" -ForegroundColor Gray

try {
    $loginResponse = Invoke-RestMethod `
        -Uri "$baseUrl/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginJson `
        -ErrorAction Stop
    
    Write-Host "  Login successful!" -ForegroundColor Green
    Write-Host "  Token: $($loginResponse.token.Substring(0,20))..." -ForegroundColor Gray
    
    $token = $loginResponse.token
    
    # Test 3: Try sending notification
    Write-Host ""
    Write-Host "Sending test notification..." -ForegroundColor Yellow
    
    $notifData = @{
        type = "IN_APP"
        title = "Test Message"
        body = "This is a test notification from script"
        priority = "HIGH"
        metadata = '{"category":"message"}'
    }
    
    $notifJson = $notifData | ConvertTo-Json
    
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $notifResponse = Invoke-RestMethod `
        -Uri "$baseUrl/notifications" `
        -Method POST `
        -Headers $headers `
        -Body $notifJson `
        -ErrorAction Stop
    
    Write-Host "  Notification sent!" -ForegroundColor Green
    Write-Host "  ID: $($notifResponse.id)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "SUCCESS! Check your app now." -ForegroundColor Green
    
} catch {
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "  Response: $responseBody" -ForegroundColor Yellow
    }
}
