$BaseUrl = "https://baotienweb.cloud/api/v1"

Write-Host "`n=== TEST REGISTRATION ===`n"

$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
$testEmail = "testuser$timestamp@demo.com"

$registerBody = @{
    email = $testEmail
    password = 'Test@123456'
    name = 'Test User'
    phone = '0987654321'
}

$headers = @{
    'Content-Type' = 'application/json'
    'x-api-key' = 'dbuild_client_7d3a9f41c2b84e6d9a5f0e1c7b2a4d88'
}

Write-Host "Email: $testEmail"
Write-Host "Password: Test@123456"

try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/auth/register" -Method POST `
        -Headers $headers -Body ($registerBody | ConvertTo-Json) -TimeoutSec 10
    
    Write-Host "`nSUCCESS - Registration completed"
    $response | ConvertTo-Json -Depth 5
    
    if ($response.token) {
        Write-Host "`nTesting login..."
        $loginBody = @{
            email = $testEmail
            password = 'Test@123456'
        }
        
        $loginResponse = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method POST `
            -Headers $headers -Body ($loginBody | ConvertTo-Json) -TimeoutSec 10
        
        Write-Host "LOGIN SUCCESS"
        Write-Host "Use these credentials for testing:"
        Write-Host "Email: $testEmail"
        Write-Host "Password: Test@123456"
    }
} catch {
    Write-Host "`nFAILED"
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)"
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.ErrorDetails) {
        $_.ErrorDetails.Message
    }
}
