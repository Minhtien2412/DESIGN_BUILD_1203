# Seed Products Script
# Tự động thêm sản phẩm mẫu vào database qua API

$API_BASE = "https://baotienweb.cloud/api/v1"
$ADMIN_EMAIL = "admin2@test.com"
$ADMIN_PASSWORD = "123456"

Write-Host "=== SEEDING PRODUCTS ===" -ForegroundColor Green

# Step 1: Login to get token
Write-Host "`n[1/3] Logging in as admin..." -ForegroundColor Cyan
$loginBody = @{
    email = $ADMIN_EMAIL
    password = $ADMIN_PASSWORD
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$API_BASE/auth/login" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body $loginBody
    
    $TOKEN = $loginResponse.accessToken
    Write-Host "[OK] Login successful! Token: $($TOKEN.Substring(0,50))..." -ForegroundColor Green
} catch {
    Write-Host "[FAIL] Login failed: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Define sample products
Write-Host "`n[2/3] Preparing sample products..." -ForegroundColor Cyan

$products = @(
    # ELECTRONICS (5 products)
    @{
        name = "Bếp từ Sunhouse SHD6800"
        description = "Bếp từ đôi cao cấp, công suất 4000W, mặt kính chịu nhiệt"
        price = 3500000
        category = "ELECTRONICS"
        stock = 50
        images = @("https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400")
    },
    @{
        name = "Tủ lạnh Samsung RT38K5982SL"
        description = "Tủ lạnh Inverter 394L, công nghệ làm lạnh kép"
        price = 12500000
        category = "ELECTRONICS"
        stock = 30
        images = @("https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400")
    },
    @{
        name = "Máy giặt Electrolux EWF9024BDWB"
        description = "Máy giặt inverter 9kg, công nghệ UltraMix"
        price = 8900000
        category = "ELECTRONICS"
        stock = 25
        images = @("https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400")
    },
    @{
        name = "Lò vi sóng Panasonic NN-GT35HMYUE"
        description = "Lò vi sóng có nướng 23L, công suất 800W"
        price = 2150000
        category = "ELECTRONICS"
        stock = 40
        images = @("https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=400")
    },
    @{
        name = "Quạt điều hòa Sharp PJ-A36RV-B"
        description = "Quạt điều hòa không khí công suất 120W, bình chứa 6L"
        price = 3200000
        category = "ELECTRONICS"
        stock = 35
        images = @("https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400")
    },
    
    # HOME (8 products)
    @{
        name = "Bồn cầu TOTO CW818J"
        description = "Bồn cầu 1 khối, công nghệ xả Tornado, tiết kiệm nước"
        price = 5500000
        category = "HOME"
        stock = 20
        images = @("https://images.unsplash.com/photo-1620626011761-996317b8d101?w=400")
    },
    @{
        name = "Vòi lavabo Grohe Eurosmart 23374001"
        description = "Vòi rửa mặt lavabo nóng lạnh, công nghệ EcoJoy tiết kiệm nước"
        price = 1850000
        category = "HOME"
        stock = 60
        images = @("https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400")
    },
    @{
        name = "Sofa băng 3 chỗ Juno Sofa"
        description = "Sofa vải bố cao cấp, khung gỗ tự nhiên, màu xám hiện đại"
        price = 12000000
        category = "HOME"
        stock = 15
        images = @("https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400")
    },
    @{
        name = "Bàn ăn gỗ sồi 6 ghế"
        description = "Bàn ăn gỗ sồi tự nhiên 1.6m, kèm 6 ghế"
        price = 18500000
        category = "HOME"
        stock = 10
        images = @("https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400")
    },
    @{
        name = "Bàn học gỗ MDF chống ẩm"
        description = "Bàn học hiện đại 1.2m, có ngăn kéo, chống ẩm"
        price = 2500000
        category = "HOME"
        stock = 45
        images = @("https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=400")
    },
    @{
        name = "Tủ bếp Acrylic cao cấp (trọn bộ)"
        description = "Tủ bếp chữ L 3m, mặt Acrylic bóng gương, phụ kiện Blum"
        price = 45000000
        category = "HOME"
        stock = 5
        images = @("https://images.unsplash.com/photo-1556909114-f0e9eaecfdb8?w=400")
    },
    @{
        name = "Chậu rửa bát Hafele 567.63.180"
        description = "Chậu inox 304 đúc nguyên khối 2 hộc, kích thước 780x435mm"
        price = 3800000
        category = "HOME"
        stock = 25
        images = @("https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=400")
    },
    @{
        name = "Thảm sofa phòng khách 2x3m"
        description = "Thảm lông ngắn cao cấp, màu be, chống bụi bẩn"
        price = 1200000
        category = "HOME"
        stock = 50
        images = @("https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=400")
    },
    
    # OTHER (3 products)
    @{
        name = "Bình chữa cháy CO2 5kg MT5"
        description = "Bình cứu hỏa CO2 5kg, van đồng, vỏ thép sơn đỏ"
        price = 850000
        category = "OTHER"
        stock = 100
        images = @("https://images.unsplash.com/photo-1563906267088-b029e7101114?w=400")
    },
    @{
        name = "Đầu báo khói Hochiki DCD-1E-JK"
        description = "Đầu báo khói quang điện, tiêu chuẩn EN54"
        price = 450000
        category = "OTHER"
        stock = 200
        images = @("https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400")
    },
    @{
        name = "Chuông cửa có camera Xiaomi"
        description = "Chuông cửa thông minh kết nối WiFi, camera HD 1080p"
        price = 1250000
        category = "OTHER"
        stock = 70
        images = @("https://images.unsplash.com/photo-1558002038-1055907df827?w=400")
    }
)

Write-Host "[OK] Prepared $($products.Count) products" -ForegroundColor Green

# Step 3: Create products
Write-Host "`n[3/3] Creating products..." -ForegroundColor Cyan

$successCount = 0
$failCount = 0
$createdProducts = @()

foreach ($product in $products) {
    $productJson = $product | ConvertTo-Json -Depth 3
    
    try {
        $response = Invoke-RestMethod -Uri "$API_BASE/products" `
            -Method POST `
            -Headers @{
                "Content-Type" = "application/json"
                "Authorization" = "Bearer $TOKEN"
            } `
            -Body $productJson
        
        Write-Host "  [OK] Created: $($product.name) [ID: $($response.id)]" -ForegroundColor Green
        $successCount++
        $createdProducts += $response
    } catch {
        Write-Host "  [FAIL] Failed: $($product.name)" -ForegroundColor Red
        Write-Host "    Error: $_" -ForegroundColor Red
        $failCount++
    }
    
    Start-Sleep -Milliseconds 200  # Avoid rate limiting
}

# Step 4: Approve all created products
if ($createdProducts.Count -gt 0) {
    Write-Host "`n[4/4] Approving products..." -ForegroundColor Cyan
    
    foreach ($product in $createdProducts) {
        try {
            Invoke-RestMethod -Uri "$API_BASE/products/$($product.id)/approve" `
                -Method PATCH `
                -Headers @{
                    "Authorization" = "Bearer $TOKEN"
                }
            Write-Host "  [OK] Approved: $($product.name)" -ForegroundColor Green
        } catch {
            Write-Host "  [FAIL] Failed to approve: $($product.name)" -ForegroundColor Yellow
        }
        Start-Sleep -Milliseconds 200
    }
}

# Summary
Write-Host "`n=== SUMMARY ===" -ForegroundColor Green
Write-Host "Total products: $($products.Count)" -ForegroundColor White
Write-Host "Success: $successCount" -ForegroundColor Green
Write-Host "Failed: $failCount" -ForegroundColor Red
Write-Host "Approved: $($createdProducts.Count)" -ForegroundColor Cyan

if ($successCount -gt 0) {
    Write-Host "`n[OK] Seeding completed! Products are now available in the app." -ForegroundColor Green
} else {
    Write-Host "`n[FAIL] Seeding failed. Please check errors above." -ForegroundColor Red
}
