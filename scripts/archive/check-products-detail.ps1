# Check products detail with pagination

$API_BASE = "https://baotienweb.cloud/api/v1"
$ADMIN_EMAIL = "admin2@test.com"
$ADMIN_PASSWORD = "123456"

# Login
$loginBody = @{email=$ADMIN_EMAIL;password=$ADMIN_PASSWORD} | ConvertTo-Json
$loginResponse = Invoke-RestMethod -Uri "$API_BASE/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $loginBody
$TOKEN = $loginResponse.accessToken

$headers = @{"Authorization" = "Bearer $TOKEN"}

Write-Host "Fetching all products...`n"

# Try with pagination
try {
    $allProducts = Invoke-RestMethod -Uri "$API_BASE/products?limit=100&status=APPROVED" -Headers $headers
    
    if ($allProducts.data) {
        $products = $allProducts.data
        $total = $allProducts.meta.total
    } else {
        $products = $allProducts
        $total = $products.Count
    }
    
    Write-Host "Total products: $total`n" -ForegroundColor Cyan
    
    # Group by category
    $grouped = $products | Group-Object category | Sort-Object Count -Descending
    
    Write-Host "Products by category:" -ForegroundColor Yellow
    foreach ($group in $grouped) {
        Write-Host "  $($group.Name): $($group.Count) products" -ForegroundColor White
        
        # Show first 3 products in each category
        $group.Group | Select-Object -First 3 | ForEach-Object {
            Write-Host "    - $($_.name) ($($_.price) VND)" -ForegroundColor Gray
        }
    }
    
    # Check approved vs pending
    Write-Host "`nBy status:" -ForegroundColor Yellow
    $byStatus = $products | Group-Object status
    foreach ($group in $byStatus) {
        Write-Host "  $($group.Name): $($group.Count) products" -ForegroundColor White
    }
    
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}
