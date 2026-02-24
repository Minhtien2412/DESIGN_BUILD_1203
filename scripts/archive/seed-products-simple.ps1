# Seed Products Script - Simple Version
# Auto-add sample products via API

$API_BASE = "https://baotienweb.cloud/api/v1"
$ADMIN_EMAIL = "admin2@test.com"
$ADMIN_PASSWORD = "123456"

Write-Host "=== SEEDING PRODUCTS ===" -ForegroundColor Green

# Login
Write-Host "`nStep 1: Logging in..." -ForegroundColor Cyan
$loginBody = @{
    email = $ADMIN_EMAIL
    password = $ADMIN_PASSWORD
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$API_BASE/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $loginBody
    $TOKEN = $loginResponse.accessToken
    Write-Host "[OK] Login successful" -ForegroundColor Green
} catch {
    Write-Host "[FAIL] Login failed: $_" -ForegroundColor Red
    exit 1
}

# Product list
$products = @(
    @{name="Bep tu Sunhouse SHD6800";description="Bep tu doi cao cap, cong suat 4000W";price=3500000;category="ELECTRONICS";stock=50},
    @{name="Tu lanh Samsung RT38K";description="Tu lanh Inverter 394L";price=12500000;category="ELECTRONICS";stock=30},
    @{name="May giat Electrolux 9kg";description="May giat inverter 9kg";price=8900000;category="ELECTRONICS";stock=25},
    @{name="Lo vi song Panasonic";description="Lo vi song co nuong 23L";price=2150000;category="ELECTRONICS";stock=40},
    @{name="Quat dieu hoa Sharp";description="Quat dieu hoa cong suat 120W";price=3200000;category="ELECTRONICS";stock=35},
    @{name="Bon cau TOTO CW818J";description="Bon cau 1 khoi, tiet kiem nuoc";price=5500000;category="HOME";stock=20},
    @{name="Voi lavabo Grohe";description="Voi rua mat lavabo nong lanh";price=1850000;category="HOME";stock=60},
    @{name="Sofa bang 3 cho";description="Sofa vai bo cao cap";price=12000000;category="HOME";stock=15},
    @{name="Ban an go soi 6 ghe";description="Ban an go soi tu nhien 1.6m";price=18500000;category="HOME";stock=10},
    @{name="Ban hoc go MDF";description="Ban hoc hien dai 1.2m";price=2500000;category="HOME";stock=45},
    @{name="Tu bep Acrylic";description="Tu bep chu L 3m cao cap";price=45000000;category="HOME";stock=5},
    @{name="Chau rua bat Hafele";description="Chau inox 304 duc nguyen khoi";price=3800000;category="HOME";stock=25},
    @{name="Tham sofa 2x3m";description="Tham long ngan cao cap";price=1200000;category="HOME";stock=50},
    @{name="Binh chua chay CO2 5kg";description="Binh cuu hoa CO2 5kg";price=850000;category="OTHER";stock=100},
    @{name="Dau bao khoi Hochiki";description="Dau bao khoi quang dien";price=450000;category="OTHER";stock=200},
    @{name="Chuong cua camera Xiaomi";description="Chuong cua thong minh WiFi";price=1250000;category="OTHER";stock=70}
)

Write-Host "[OK] Prepared $($products.Count) products`n" -ForegroundColor Green

# Create products
Write-Host "Step 2: Creating products..." -ForegroundColor Cyan
$successCount = 0
$createdIds = @()

foreach ($product in $products) {
    $productJson = $product | ConvertTo-Json -Depth 3
    
    try {
        $response = Invoke-RestMethod -Uri "$API_BASE/products" -Method POST -Headers @{"Content-Type"="application/json";"Authorization"="Bearer $TOKEN"} -Body $productJson
        Write-Host "  [OK] $($product.name) [ID: $($response.id)]" -ForegroundColor Green
        $successCount++
        $createdIds += $response.id
    } catch {
        Write-Host "  [FAIL] $($product.name)" -ForegroundColor Red
    }
    
    Start-Sleep -Milliseconds 200
}

# Approve products
if ($createdIds.Count -gt 0) {
    Write-Host "`nStep 3: Approving products..." -ForegroundColor Cyan
    
    foreach ($id in $createdIds) {
        try {
            Invoke-RestMethod -Uri "$API_BASE/products/$id/approve" -Method PATCH -Headers @{"Authorization"="Bearer $TOKEN"} | Out-Null
            Write-Host "  [OK] Approved ID: $id" -ForegroundColor Green
        } catch {
            Write-Host "  [FAIL] ID: $id" -ForegroundColor Yellow
        }
        Start-Sleep -Milliseconds 200
    }
}

# Summary
Write-Host "`n=== SUMMARY ===" -ForegroundColor Green
Write-Host "Total: $($products.Count) | Success: $successCount | Failed: $($products.Count - $successCount)" -ForegroundColor White

if ($successCount -gt 0) {
    Write-Host "`n[OK] Seeding completed! Products available in app.`n" -ForegroundColor Green
} else {
    Write-Host "`n[FAIL] Seeding failed. Check errors above.`n" -ForegroundColor Red
}
