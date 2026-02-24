# Detailed Login Test
$BaseUrl = "https://baotienweb.cloud/api/v1"

Write-Host "`n=== DETAILED LOGIN TEST ===`n" -ForegroundColor Cyan

$loginBody = @{
    email = 'test@demo.com'
    password = 'test123'
}

$headers = @{
    'Content-Type' = 'application/json'
    'x-api-key' = 'thietke-resort-api-key-2024'
}

Write-Host "Request URL: $BaseUrl/auth/login" -ForegroundColor Gray
Write-Host "Request Body:" -ForegroundColor Gray
Write-Host ($loginBody | ConvertTo-Json) -ForegroundColor White
Write-Host "Request Headers:" -ForegroundColor Gray
Write-Host ($headers | ConvertTo-Json) -ForegroundColor White

try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method POST `
        -Headers $headers -Body ($loginBody | ConvertTo-Json) `
        -TimeoutSec 10 -ErrorAction Stop
    
    Write-Host "`n✅ SUCCESS" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 5) -ForegroundColor White
} catch {
    Write-Host "`n❌ ERROR" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.ErrorDetails) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
    }
}
