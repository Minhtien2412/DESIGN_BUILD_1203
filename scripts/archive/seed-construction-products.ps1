# Seed Construction Products
# Them san pham xay dung kien truc

$API_BASE = "https://baotienweb.cloud/api/v1"
$ADMIN_EMAIL = "admin2@test.com"
$ADMIN_PASSWORD = "123456"

Write-Host "=== SEEDING CONSTRUCTION PRODUCTS ===" -ForegroundColor Green

# Login
$loginBody = @{email=$ADMIN_EMAIL;password=$ADMIN_PASSWORD} | ConvertTo-Json
try {
    $loginResponse = Invoke-RestMethod -Uri "$API_BASE/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $loginBody
    $TOKEN = $loginResponse.accessToken
    Write-Host "[OK] Login successful`n" -ForegroundColor Green
} catch {
    Write-Host "[FAIL] Cannot login: $_" -ForegroundColor Red
    exit 1
}

# Construction products - categorized properly
$products = @(
    # ELECTRONICS - Thiet bi dien cong trinh (15 products)
    @{name="Day dien Cadivi CV 2x2.5";description="Day dien don Cadivi 2 loi 2.5mm2, chong chay";price=85000;category="ELECTRONICS";stock=500},
    @{name="O cam dien Panasonic Wide";description="O cam 3 chau 16A, mat kinh cung";price=45000;category="ELECTRONICS";stock=200},
    @{name="Cong tac Schneider 2 chieu";description="Cong tac 2 chieu Schneider Electric";price=35000;category="ELECTRONICS";stock=300},
    @{name="Aptomat Mitsubishi 2P 32A";description="CB dong tu Mitsubishi NF30-CS 2P 32A";price=180000;category="ELECTRONICS";stock=150},
    @{name="Den LED am tran Philips 9W";description="Den downlight am tran Philips Meson 9W";price=120000;category="ELECTRONICS";stock=200},
    @{name="Day cap dien luc Cadisun 3x6";description="Day cap dien luc 3 loi x 6mm2";price=250000;category="ELECTRONICS";stock=300},
    @{name="Tu dien 8 nhanh Schneider";description="Tu dien noi Schneider 8 nhanh co cau dao";price=450000;category="ELECTRONICS";stock=80},
    @{name="Ong luon day dien Nanoco D16";description="Ong luon day dien HDPE phi 16mm";price=8000;category="ELECTRONICS";stock=1000},
    @{name="Quat hut am tran Panasonic";description="Quat thong gio hut am tran 15W";price=280000;category="ELECTRONICS";stock=100},
    @{name="Chuong cua co day Panasonic";description="Chuong cua Panasonic EBZ502";price=85000;category="ELECTRONICS";stock=150},
    @{name="Bong den compact Rạng Đong 23W";description="Bong tiet kiem nang luong 23W";price=35000;category="ELECTRONICS";stock=400},
    @{name="O cam chong soc Lioa 4D32N";description="O cam chong soc 4 lo Lioa";price=250000;category="ELECTRONICS";stock=120},
    @{name="May cat nghet ELCB Sino 2P 63A";description="CB chong ro ELCB 2P 63A";price=320000;category="ELECTRONICS";stock=100},
    @{name="Den LED ong bo Rang Dong 1.2m";description="Bo den LED tube 18W dai 1.2m";price=95000;category="ELECTRONICS";stock=250},
    @{name="Contactor Mitsubishi 3P 25A";description="Contactor dien tu 3 pha 25A";price=180000;category="ELECTRONICS";stock=80},
    
    # HOME - Vat lieu xay dung, thiet bi noi that (25 products)
    @{name="Gach lat nen Viglacera 60x60";description="Gach granite Viglacera ECO 601";price=180000;category="HOME";stock=500},
    @{name="Xi mang PCB40 bao 50kg";description="Xi mang Portlan hon hop PCB40";price=95000;category="HOME";stock=1000},
    @{name="Cat xay dung xe 5m3";description="Cat vang xay dung sach, xe 5 khoi";price=650000;category="HOME";stock=50},
    @{name="Da 1x2 khoi lap phuong";description="Da 1x2 xay dung, khoi lap phuong";price=180000;category="HOME";stock=800},
    @{name="Gach block 10x20x40";description="Gach khong nung block 10x20x40cm";price=5500;category="HOME";stock=5000},
    @{name="Son nuoc noi that Jotun 18L";description="Son nuoc cao cap Jotun Essence 18L";price=1850000;category="HOME";stock=80},
    @{name="Thep xay dung D10 Viet Nhat";description="Thep tron phi 10mm dai 11.7m";price=95000;category="HOME";stock=500},
    @{name="Tuong xay 2 lo Viglacera";description="Tuong xay 2 lo Viglacera BS205";price=85000;category="HOME";stock=300},
    @{name="Cua nhua loi thep Huge 80x200";description="Cua nhua loi thep Huge chong nuoc";price=1250000;category="HOME";stock=50},
    @{name="Ke go cong nghiep 20x120x2400";description="Ke go MDF chiu nuoc";price=45000;category="HOME";stock=200},
    @{name="Ton lanh 0.45mm Bluescope";description="Ton lanh ma mau Bluescope 0.45mm";price=185000;category="HOME";stock=150},
    @{name="Ong nuoc PVC Tien Phong D34";description="Ong cap nuoc PVC phi 34mm";price=28000;category="HOME";stock=400},
    @{name="Khoa cua tay nam Hafele 489.82";description="Khoa tay nam phong tam Hafele inox";price=450000;category="HOME";stock=100},
    @{name="Ke sat V32 dai 6m";description="Ke sat tiec V32 xay dung";price=38000;category="HOME";stock=600},
    @{name="Gach op tuong 30x60 Dong Tam";description="Gach men op tuong Dong Tam 3060BLOCK001";price=135000;category="HOME";stock=400},
    @{name="Keo dan gach Sika MaxBond";description="Keo dan gach Sika MaxBond bao 20kg";price=180000;category="HOME";stock=200},
    @{name="Nap ham kiem gang cau D600";description="Nap ham kiem cong trinh gang cau phi 600";price=850000;category="HOME";stock=50},
    @{name="Luoi thep D4 a100x100";description="Luoi thep han D4 o 100x100mm";price=25000;category="HOME";stock=800},
    @{name="Cua kinh cuong luc 12mm";description="Cua kinh cuong luc trong suot day 12mm";price=2500000;category="HOME";stock=30},
    @{name="Tuong rao luoi B40 cao 1.8m";description="Luoi thep B40 rao tuong cao 1.8m";price=95000;category="HOME";stock=150},
    @{name="Tam panel chong chay Austnam";description="Tam panel EPS chong chay day 50mm";price=185000;category="HOME";stock=100},
    @{name="Go thong xay dung 5x10x400";description="Go thong xay dung quy cach 5x10cm";price=35000;category="HOME";stock=500},
    @{name="Ke nhua PVC 15x2.5cm";description="Ke nhua PVC tran nha, tuong";price=12000;category="HOME";stock=800},
    @{name="Be phot Inax BFV-10";description="Be phot nong lanh lavabo Inax";price=1850000;category="HOME";stock=60},
    @{name="Gach ceramic Viglacera 40x40";description="Gach ceramic Viglacera B4007";price=95000;category="HOME";stock=600},
    
    # OTHER - PCCC va dung cu xay dung (10 products)
    @{name="Binh chua chay bot ABC 8kg";description="Binh cuu hoa bot ABC 8kg MFZ8";price=550000;category="OTHER";stock=100},
    @{name="Hop dung cuon voi PCCC Yamato";description="Hop dung cuon voi chua chay Yamato 30m";price=3500000;category="OTHER";stock=30},
    @{name="Den thoat hiem kentom 2 mat";description="Den exit thoat hiem 2 mat kentom KT320";price=180000;category="OTHER";stock=150},
    @{name="Van giac PCCC D65";description="Van giac sprinkler DN65 phun nuoc chua chay";price=280000;category="OTHER";stock=200},
    @{name="May bom chua chay Versar 5HP";description="May bom cuu hoa 5HP Versar chiu ap cao";price=8500000;category="OTHER";stock=20},
    @{name="Thang nhom rut gon Advindeq 3.8m";description="Thang nhom rut 2 doan 3.8m Advindeq";price=1850000;category="OTHER";stock=40},
    @{name="May khoan bua Bosch GBH 2-26";description="May khoan bua dien Bosch 800W";price=2150000;category="OTHER";stock=50},
    @{name="May mai goc Makita 9553HB";description="May mai goc Makita 115mm 710W";price=1050000;category="OTHER";stock=60},
    @{name="May cat sat Makita 2414NB";description="May cat sat bang Makita 2000W";price=3200000;category="OTHER";stock=30},
    @{name="May danh bong Makita 9227C";description="May danh bong Makita 180mm 1200W";price=2850000;category="OTHER";stock=35}
)

Write-Host "[OK] Prepared $($products.Count) construction products`n" -ForegroundColor Green

# Create products
Write-Host "Creating products..." -ForegroundColor Cyan
$successCount = 0

foreach ($product in $products) {
    $productJson = $product | ConvertTo-Json -Depth 3
    
    try {
        $response = Invoke-RestMethod -Uri "$API_BASE/products" -Method POST -Headers @{"Content-Type"="application/json";"Authorization"="Bearer $TOKEN"} -Body $productJson
        Write-Host "  [OK] $($product.name) [$($product.category)]" -ForegroundColor Green
        $successCount++
    } catch {
        Write-Host "  [FAIL] $($product.name)" -ForegroundColor Red
    }
    
    Start-Sleep -Milliseconds 150
}

Write-Host "`n=== SUMMARY ===" -ForegroundColor Green
Write-Host "Construction Products Created:" -ForegroundColor Cyan
Write-Host "  - ELECTRONICS (Dien cong trinh): 15 products" -ForegroundColor White
Write-Host "  - HOME (Vat lieu xay dung): 25 products" -ForegroundColor White
Write-Host "  - OTHER (PCCC & Dung cu): 10 products" -ForegroundColor White
Write-Host "`nTotal: $($products.Count) | Success: $successCount" -ForegroundColor White
Write-Host "`nTotal construction products in DB: ~66 products" -ForegroundColor Cyan
