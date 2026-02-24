$BaseUrl = "https://baotienweb.cloud/api/v1"

$body = @{
    email = "newuser123@test.com"
    password = "Test@123456"
    name = "New User"
    phone = "0987654321"
} | ConvertTo-Json

$headers = @{
    'Content-Type' = 'application/json'
    'x-api-key' = 'thietke-resort-api-key-2024'
}

Write-Host "Testing registration..."
Write-Host "Body: $body"

try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/auth/register" -Method POST `
        -Headers $headers -Body $body -TimeoutSec 10
    
    Write-Host "`nSUCCESS"
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 5
} catch {
    Write-Host "`nERROR"
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)"
    
    $result = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($result)
    $responseBody = $reader.ReadToEnd()
    
    Write-Host "Response Body:"
    $responseBody
}
