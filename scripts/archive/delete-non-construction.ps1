# Delete Non-Construction Products
# Xoa cac san pham khong lien quan xay dung

$API_BASE = "https://baotienweb.cloud/api/v1"
$ADMIN_EMAIL = "admin2@test.com"
$ADMIN_PASSWORD = "123456"

Write-Host "=== DELETE NON-CONSTRUCTION PRODUCTS ===" -ForegroundColor Yellow

# Login
Write-Host "`nStep 1: Logging in..." -ForegroundColor Cyan
$loginBody = @{email=$ADMIN_EMAIL;password=$ADMIN_PASSWORD} | ConvertTo-Json
$loginResponse = Invoke-RestMethod -Uri "$API_BASE/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $loginBody
$TOKEN = $loginResponse.accessToken
Write-Host "[OK] Login successful`n" -ForegroundColor Green

# IDs to delete (FASHION, BEAUTY, SPORTS, BOOKS, TOYS, FOOD)
# ID 127-156 (30 products from remaining categories)
$idsToDelete = 127..156

Write-Host "Step 2: Deleting $($idsToDelete.Count) non-construction products..." -ForegroundColor Cyan

$deletedCount = 0
$failedCount = 0

foreach ($id in $idsToDelete) {
    try {
        Invoke-RestMethod -Uri "$API_BASE/products/$id" -Method DELETE -Headers @{"Authorization"="Bearer $TOKEN"} | Out-Null
        Write-Host "  [OK] Deleted ID: $id" -ForegroundColor Green
        $deletedCount++
    } catch {
        Write-Host "  [FAIL] ID: $id - $($_.Exception.Message)" -ForegroundColor Red
        $failedCount++
    }
    Start-Sleep -Milliseconds 100
}

Write-Host "`n=== SUMMARY ===" -ForegroundColor Green
Write-Host "Deleted: $deletedCount | Failed: $failedCount" -ForegroundColor White
Write-Host "`nRemaining construction-related products: 16 (ELECTRONICS, HOME, OTHER)" -ForegroundColor Cyan
