# Debug single product creation

$API_BASE = "https://baotienweb.cloud/api/v1"

# Login
$loginBody = @{email="admin2@test.com";password="123456"} | ConvertTo-Json
$loginResponse = Invoke-RestMethod -Uri "$API_BASE/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $loginBody
$TOKEN = $loginResponse.accessToken

Write-Host "Token: $($TOKEN.Substring(0,50))...`n"

# Try create one product with detailed error
$product = @{
    name = "Test Product"
    description = "Test description"
    price = 1000000
    category = "HOME"
    stock = 10
    images = @("https://picsum.photos/400")
} | ConvertTo-Json

Write-Host "Request body:"
Write-Host $product

try {
    $response = Invoke-RestMethod -Uri "$API_BASE/products" -Method POST -Headers @{"Content-Type"="application/json";"Authorization"="Bearer $TOKEN"} -Body $product
    Write-Host "`n[OK] Created product ID: $($response.id)"
} catch {
    Write-Host "`n[FAIL] Error details:"
    Write-Host $_.Exception.Message
    if ($_.ErrorDetails) {
        Write-Host $_.ErrorDetails.Message
    }
}
