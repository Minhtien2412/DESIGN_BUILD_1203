# Cleanup Non-Construction Products (Final)
# Xoa toan bo san pham khong lien quan xay dung

$API_BASE = "https://baotienweb.cloud/api/v1"
$ADMIN_EMAIL = "admin2@test.com"
$ADMIN_PASSWORD = "123456"

Write-Host "=== FINAL CLEANUP: DELETE NON-CONSTRUCTION PRODUCTS ===" -ForegroundColor Yellow

# Login
$loginBody = @{email=$ADMIN_EMAIL;password=$ADMIN_PASSWORD} | ConvertTo-Json
$loginResponse = Invoke-RestMethod -Uri "$API_BASE/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $loginBody
$TOKEN = $loginResponse.accessToken
$headers = @{"Authorization" = "Bearer $TOKEN"}

Write-Host "[OK] Logged in`n" -ForegroundColor Green

# Get all products (fetch multiple pages if needed)
$allProductsList = @()
$page = 1
do {
    try {
        $response = Invoke-RestMethod -Uri "$API_BASE/products?limit=100&page=$page" -Headers $headers
        if ($response.data) {
            $allProductsList += $response.data
            $hasMore = $response.meta.page -lt $response.meta.totalPages
        } else {
            $allProductsList += $response
            $hasMore = $false
        }
        $page++
    } catch {
        $hasMore = $false
    }
} while ($hasMore)

$products = $allProductsList
Write-Host "Total products found: $($products.Count)`n" -ForegroundColor Cyan

# Categories to DELETE
$deleteCategories = @('FASHION', 'BEAUTY', 'SPORTS', 'BOOKS', 'TOYS', 'FOOD')

$toDelete = $products | Where-Object { $deleteCategories -contains $_.category }

Write-Host "Products to delete: $($toDelete.Count)" -ForegroundColor Yellow
foreach ($cat in $deleteCategories) {
    $count = ($toDelete | Where-Object { $_.category -eq $cat }).Count
    if ($count -gt 0) {
        Write-Host "  - $cat : $count products" -ForegroundColor White
    }
}

Write-Host "`nDeleting..." -ForegroundColor Cyan
$deleted = 0

foreach ($product in $toDelete) {
    try {
        Invoke-RestMethod -Uri "$API_BASE/products/$($product.id)" -Method DELETE -Headers $headers | Out-Null
        Write-Host "  [OK] Deleted: $($product.name) [$($product.category)]" -ForegroundColor Green
        $deleted++
    } catch {
        Write-Host "  [FAIL] $($product.name)" -ForegroundColor Red
    }
    Start-Sleep -Milliseconds 100
}

Write-Host "`n=== CLEANUP COMPLETE ===" -ForegroundColor Green
Write-Host "Deleted: $deleted products" -ForegroundColor White
Write-Host "Remaining: Construction products only (ELECTRONICS, HOME, OTHER)" -ForegroundColor Cyan
