# Test product creation with full error details

$API_BASE = "https://baotienweb.cloud/api/v1"

# Login
$loginBody = '{"email":"admin2@test.com","password":"123456"}'
$loginResp = Invoke-RestMethod -Uri "$API_BASE/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
$token = $loginResp.accessToken

Write-Host "Got token: $($token.Substring(0,30))...`n"

# Try create product with full details
$productBody = @"
{
  "name": "Test Bep Tu",
  "description": "Test description",
  "price": 1500000,
  "category": "ELECTRONICS",
  "stock": 25,
  "images": ["https://picsum.photos/400"]
}
"@

Write-Host "Sending request..."
Write-Host $productBody

try {
    $response = Invoke-WebRequest -Uri "$API_BASE/products" `
        -Method POST `
        -ContentType "application/json" `
        -Headers @{"Authorization" = "Bearer $token"} `
        -Body $productBody `
        -ErrorAction Stop
    
    Write-Host "`n[SUCCESS]"
    Write-Host $response.Content
} catch {
    Write-Host "`n[ERROR]"
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)"
    
    if ($_.ErrorDetails) {
        Write-Host "Details: $($_.ErrorDetails.Message)"
    }
    
    # Try to read response stream
    $result = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($result)
    $responseBody = $reader.ReadToEnd()
    Write-Host "Response body: $responseBody"
}
