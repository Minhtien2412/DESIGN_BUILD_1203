# Test registration with corrected fields (email, password, name only)
$randomEmail = "testuser$(Get-Random -Minimum 1000 -Maximum 9999)@example.com"

$body = @{
    email = $randomEmail
    password = "Test123!"
    name = "Test User"
} | ConvertTo-Json

Write-Host "`n=== Testing Registration API ===" -ForegroundColor Cyan
Write-Host "Endpoint: https://baotienweb.cloud/api/v1/auth/register" -ForegroundColor Gray
Write-Host "`nPayload (Frontend now sends):" -ForegroundColor Yellow
Write-Host $body -ForegroundColor White

try {
    $response = Invoke-RestMethod `
        -Uri "https://baotienweb.cloud/api/v1/auth/register" `
        -Method POST `
        -Headers @{
            "x-api-key" = "baotienweb-api-key-2025"
            "Content-Type" = "application/json"
        } `
        -Body $body `
        -TimeoutSec 15
    
    Write-Host "`n✅ SUCCESS! Backend accepted the request!" -ForegroundColor Green
    Write-Host "`nResponse Data:" -ForegroundColor Yellow
    Write-Host "  User ID: $($response.user.id) (type: $($response.user.id.GetType().Name))" -ForegroundColor White
    Write-Host "  Email: $($response.user.email)" -ForegroundColor White
    Write-Host "  Name: $($response.user.name)" -ForegroundColor White
    Write-Host "  Role: $($response.user.role)" -ForegroundColor White
    Write-Host "  Access Token: $($response.accessToken.Substring(0, 30))..." -ForegroundColor White
    Write-Host "  Refresh Token: $($response.refreshToken.Substring(0, 30))..." -ForegroundColor White
    
    Write-Host "`n[OK] Field Validation:" -ForegroundColor Green
    Write-Host "  - No 'fullName' field sent [OK]" -ForegroundColor Gray
    Write-Host "  - No 'username' field sent [OK]" -ForegroundColor Gray
    Write-Host "  - Only email, password, name sent [OK]" -ForegroundColor Gray
    Write-Host "  - Backend accepted without errors [OK]" -ForegroundColor Gray
    
} catch {
    Write-Host "`n❌ ERROR:" -ForegroundColor Red
    $errorDetail = $_.ErrorDetails.Message
    if ($errorDetail) {
        Write-Host $errorDetail -ForegroundColor Yellow
    } else {
        Write-Host $_.Exception.Message -ForegroundColor Yellow
    }
}

Write-Host ""
