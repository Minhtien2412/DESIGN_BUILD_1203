# Script to generate remaining shopping pages from template
# Each page will have unique products, categories, and content

$baseFile = "app\shopping\vat-lieu-xay.tsx"

# Define page configurations
$pages = @(
    @{
        filename = "dien.tsx"
        title = "Thiết bị điện"
        icon = "⚡"
        products = @(
            @{name = "Công tắc Panasonic Wide"; price = 45000; unit = "cái"; emoji = "🔘"; rating = 4.8; sold = 3450; stock = 2000; brand = "Panasonic"; category = "Công tắc"; badge = "Bán chạy"},
            @{name = "Dây điện Cadivi 2x2.5"; price = 185000; unit = "cuộn"; emoji = "🔌"; rating = 4.7; sold = 2890; stock = 500; brand = "Cadivi"; category = "Dây điện"},
            @{name = "MCB 2P 32A Schneider"; price = 165000; unit = "cái"; emoji = "⚙️"; rating = 4.9; sold = 1560; stock = 800; brand = "Schneider"; category = "MCB/ELCB"; badge = "Chính hãng"},
            @{name = "Đèn LED Rạng Đông 9W"; price = 35000; unit = "bóng"; emoji = "💡"; rating = 4.6; sold = 5670; stock = 3000; brand = "Rạng Đông"; category = "Đèn LED"; discount = 15},
            @{name = "Ổ cắm 3 chấu 16A"; price = 28000; unit = "cái"; emoji = "🔌"; rating = 4.5; sold = 4230; stock = 1500; brand = "Lioa"; category = "Ổ cắm"},
            @{name = "Dây cáp điện Trần Phú"; price = 450000; unit = "cuộn"; emoji = "🔗"; rating = 4.8; sold = 980; stock = 300; brand = "Trần Phú"; category = "Dây cáp"; badge = "Chính hãng"},
            @{name = "Hộp nối dây điện"; price = 15000; unit = "cái"; emoji = "📦"; rating = 4.4; sold = 3890; stock = 2500; brand = "Sino"; category = "Phụ kiện"},
            @{name = "Công tắc thông minh WiFi"; price = 320000; unit = "bộ"; emoji = "📱"; rating = 4.7; sold = 1240; stock = 600; brand = "Broadlink"; category = "Smart"; discount = 10}
        )
        categories = @("Tất cả", "Công tắc", "Dây điện", "Đèn LED", "Ổ cắm", "MCB/ELCB")
    },
    @{
        filename = "nuoc.tsx"
        title = "Thiết bị nước"
        icon = "💧"
        products = @(
            @{name = "Ống PVC Tiền Phong D27"; price = 28000; unit = "cây"; emoji = "🔵"; rating = 4.7; sold = 4560; stock = 3000; brand = "Tiền Phong"; category = "Ống nước"; badge = "Bán chạy"},
            @{name = "Vòi sen tăng áp Inox 304"; price = 185000; unit = "bộ"; emoji = "🚿"; rating = 4.8; sold = 2340; stock = 800; brand = "Eurolife"; category = "Vòi sen"; discount = 12},
            @{name = "Van khóa nhựa D21"; price = 15000; unit = "cái"; emoji = "🔧"; rating = 4.5; sold = 3890; stock = 2000; brand = "Duy Tân"; category = "Van khóa"},
            @{name = "Bồn nước Đại Thành 500L"; price = 1850000; unit = "bồn"; emoji = "🛢️"; rating = 4.9; sold = 890; stock = 150; brand = "Đại Thành"; category = "Bồn nước"; badge = "Chính hãng"},
            @{name = "Máy bơm nước Panasonic"; price = 2450000; unit = "máy"; emoji = "⚡"; rating = 4.8; sold = 560; stock = 200; brand = "Panasonic"; category = "Máy bơm"; badge = "Chính hãng"},
            @{name = "Bồn cầu Viglacera V62"; price = 1650000; unit = "bộ"; emoji = "🚽"; rating = 4.7; sold = 1230; stock = 300; brand = "Viglacera"; category = "Thiết bị vệ sinh"; discount = 8},
            @{name = "Vòi lavabo nóng lạnh"; price = 380000; unit = "cái"; emoji = "🚰"; rating = 4.6; sold = 1890; stock = 600; brand = "Inax"; category = "Vòi sen"},
            @{name = "Ống đồng điều hòa D10"; price = 95000; unit = "mét"; emoji = "🟠"; rating = 4.8; sold = 2340; stock = 1000; brand = "Hailiang"; category = "Phụ kiện"}
        )
        categories = @("Tất cả", "Ống nước", "Vòi sen", "Van khóa", "Bồn nước", "Máy bơm")
    },
    @{
        filename = "son.tsx"
        title = "Sơn & Phủ"
        icon = "🎨"
        products = @(
            @{name = "Sơn Dulux nội thất 5L"; price = 485000; unit = "thùng"; emoji = "🎨"; rating = 4.8; sold = 2340; stock = 500; brand = "Dulux"; category = "Sơn nội thất"; badge = "Bán chạy"},
            @{name = "Sơn Jotun ngoại thất 5L"; price = 650000; unit = "thùng"; emoji = "🏠"; rating = 4.9; sold = 1560; stock = 300; brand = "Jotun"; category = "Sơn ngoại thất"; badge = "Chính hãng"},
            @{name = "Sơn lót chống kiềm Kova"; price = 245000; unit = "thùng"; emoji = "🛡️"; rating = 4.6; sold = 1890; stock = 600; brand = "Kova"; category = "Sơn lót"},
            @{name = "Sơn dầu Expo màu đen"; price = 85000; unit = "lon"; emoji = "⚫"; rating = 4.5; sold = 3450; stock = 800; brand = "Expo"; category = "Sơn dầu"; discount = 10},
            @{name = "Chống thấm Sika Top 107"; price = 750000; unit = "bộ"; emoji = "💧"; rating = 4.9; sold = 980; stock = 250; brand = "Sika"; category = "Chống thấm"; badge = "Chính hãng"},
            @{name = "Sơn dầu ICI màu trắng"; price = 95000; unit = "lon"; emoji = "⚪"; rating = 4.6; sold = 2890; stock = 1000; brand = "ICI"; category = "Sơn dầu"},
            @{name = "Cọ sơn lông 4 inch"; price = 45000; unit = "cây"; emoji = "🖌️"; rating = 4.4; sold = 4560; stock = 1500; brand = "Thanh Bình"; category = "Dụng cụ"},
            @{name = "Con lăn sơn 9 inch"; price = 65000; unit = "cái"; emoji = "🎡"; rating = 4.5; sold = 3210; stock = 1200; brand = "Duy Tân"; category = "Dụng cụ"; discount = 5}
        )
        categories = @("Tất cả", "Sơn nội thất", "Sơn ngoại thất", "Sơn lót", "Chống thấm", "Dụng cụ")
    },
    @{
        filename = "gach-men.tsx"
        title = "Gạch & Ceramic"
        icon = "🔲"
        products = @(
            @{name = "Gạch Prime 60x60 bóng kiếng"; price = 185000; unit = "m²"; emoji = "✨"; rating = 4.8; sold = 2340; stock = 5000; brand = "Prime"; category = "Gạch 60x60"; badge = "Bán chạy"},
            @{name = "Gạch Viglacera 80x80 vân đá"; price = 285000; unit = "m²"; emoji = "🪨"; rating = 4.9; sold = 1560; stock = 3000; brand = "Viglacera"; category = "Gạch 80x80"; badge = "Chính hãng"},
            @{name = "Gạch ốp tường 30x60"; price = 125000; unit = "m²"; emoji = "🧱"; rating = 4.6; sold = 3450; stock = 8000; brand = "Đồng Tâm"; category = "Gạch ốp tường"; discount = 8},
            @{name = "Gạch lát nền 40x40"; price = 95000; unit = "m²"; emoji = "⬜"; rating = 4.5; sold = 4560; stock = 10000; brand = "Taicera"; category = "Gạch lát nền"},
            @{name = "Gạch mosaic thủy tinh"; price = 450000; unit = "m²"; emoji = "🎨"; rating = 4.7; sold = 890; stock = 1500; brand = "Bisazza"; category = "Gạch trang trí"; badge = "Cao cấp"},
            @{name = "Keo dán gạch Davco"; price = 85000; unit = "bao"; emoji = "📦"; rating = 4.8; sold = 3210; stock = 2000; brand = "Davco"; category = "Vật liệu phụ"},
            @{name = "Vữa chà ron Lanko"; price = 65000; unit = "bao"; emoji = "🔧"; rating = 4.6; sold = 2890; stock = 1800; brand = "Lanko"; category = "Vật liệu phụ"; discount = 5},
            @{name = "Gạch sân vườn 50x50"; price = 145000; unit = "m²"; emoji = "🌳"; rating = 4.7; sold = 1670; stock = 4000; brand = "Prime"; category = "Gạch ngoại thất"}
        )
        categories = @("Tất cả", "Gạch 60x60", "Gạch 80x80", "Gạch ốp tường", "Gạch lát nền", "Phụ kiện")
    },
    @{
        filename = "cua.tsx"
        title = "Cửa & Phụ kiện"
        icon = "🚪"
        products = @(
            @{name = "Cửa gỗ HDF veneer sồi"; price = 1850000; unit = "cánh"; emoji = "🚪"; rating = 4.8; sold = 1230; stock = 200; brand = "Huge"; category = "Cửa gỗ"; badge = "Bán chạy"},
            @{name = "Cửa nhôm kính cường lực"; price = 2450000; unit = "cánh"; emoji = "🪟"; rating = 4.9; sold = 890; stock = 150; brand = "Xingfa"; category = "Cửa nhôm"; badge = "Chính hãng"},
            @{name = "Cửa gỗ công nghiệp MDF"; price = 1250000; unit = "cánh"; emoji = "🚪"; rating = 4.6; sold = 1560; stock = 300; brand = "Kingdoor"; category = "Cửa gỗ"; discount = 10},
            @{name = "Cửa sổ nhôm 4 cánh"; price = 3200000; unit = "bộ"; emoji = "🪟"; rating = 4.7; sold = 670; stock = 100; brand = "Asia"; category = "Cửa sổ"},
            @{name = "Khóa cửa thông minh Xiaomi"; price = 3850000; unit = "bộ"; emoji = "🔐"; rating = 4.9; sold = 450; stock = 180; brand = "Xiaomi"; category = "Khóa cửa"; badge = "Cao cấp"},
            @{name = "Bản lề cửa Hafele inox"; price = 125000; unit = "cái"; emoji = "🔧"; rating = 4.8; sold = 2340; stock = 1000; brand = "Hafele"; category = "Phụ kiện"; badge = "Chính hãng"},
            @{name = "Tay nắm cửa inox 304"; price = 85000; unit = "bộ"; emoji = "✊"; rating = 4.5; sold = 3450; stock = 1500; brand = "Seleco"; category = "Phụ kiện"; discount = 8},
            @{name = "Chốt cửa inox cao cấp"; price = 45000; unit = "cái"; emoji = "🔩"; rating = 4.6; sold = 2890; stock = 2000; brand = "Việt Tiệp"; category = "Phụ kiện"}
        )
        categories = @("Tất cả", "Cửa gỗ", "Cửa nhôm", "Cửa sổ", "Khóa cửa", "Phụ kiện")
    },
    @{
        filename = "noi-that.tsx"
        title = "Nội thất"
        icon = "🛋️"
        products = @(
            @{name = "Giường ngủ gỗ sồi 1.8m"; price = 8500000; unit = "bộ"; emoji = "🛏️"; rating = 4.8; sold = 450; stock = 80; brand = "Nhà Xinh"; category = "Giường ngủ"; badge = "Bán chạy"},
            @{name = "Sofa da thật 3 chỗ"; price = 12500000; unit = "bộ"; emoji = "🛋️"; rating = 4.9; sold = 230; stock = 50; brand = "Hòa Phát"; category = "Sofa"; badge = "Cao cấp"},
            @{name = "Bàn ăn 6 ghế gỗ tự nhiên"; price = 6800000; unit = "bộ"; emoji = "🪑"; rating = 4.7; sold = 560; stock = 100; brand = "Nhà Xinh"; category = "Bàn ăn"; discount = 12},
            @{name = "Tủ quần áo gỗ công nghiệp"; price = 4500000; unit = "cái"; emoji = "🚪"; rating = 4.6; sold = 780; stock = 120; brand = "Fine"; category = "Tủ quần áo"},
            @{name = "Kệ sách 5 tầng gỗ"; price = 1850000; unit = "cái"; emoji = "📚"; rating = 4.5; sold = 1230; stock = 200; brand = "Moho"; category = "Kệ sách"; discount = 10},
            @{name = "Bàn làm việc hiện đại"; price = 2450000; unit = "bộ"; emoji = "💻"; rating = 4.8; sold = 890; stock = 150; brand = "IGA"; category = "Bàn làm việc"},
            @{name = "Ghế văn phòng ergonomic"; price = 3200000; unit = "cái"; emoji = "🪑"; rating = 4.9; sold = 670; stock = 180; brand = "Ergonomic"; category = "Ghế"; badge = "Chính hãng"},
            @{name = "Tủ giày dép 3 tầng"; price = 850000; unit = "cái"; emoji = "👟"; rating = 4.4; sold = 1560; stock = 300; brand = "Furni"; category = "Tủ giày"; discount = 8}
        )
        categories = @("Tất cả", "Giường ngủ", "Sofa", "Bàn ăn", "Tủ quần áo", "Kệ sách")
    },
    @{
        filename = "dieu-hoa.tsx"
        title = "Điều hòa"
        icon = "❄️"
        products = @(
            @{name = "Điều hòa Daikin 1HP inverter"; price = 8500000; unit = "máy"; emoji = "❄️"; rating = 4.9; sold = 1230; stock = 150; brand = "Daikin"; category = "1 chiều"; badge = "Bán chạy"},
            @{name = "Điều hòa Panasonic 1.5HP 2 chiều"; price = 12500000; unit = "máy"; emoji = "🔄"; rating = 4.8; sold = 890; stock = 120; brand = "Panasonic"; category = "2 chiều"; badge = "Chính hãng"},
            @{name = "Điều hòa LG 2HP inverter"; price = 15800000; unit = "máy"; emoji = "❄️"; rating = 4.7; sold = 670; stock = 100; brand = "LG"; category = "1 chiều"; discount = 8},
            @{name = "Multi Daikin 2 dàn 1HP"; price = 28500000; unit = "bộ"; emoji = "🔢"; rating = 4.9; sold = 340; stock = 50; brand = "Daikin"; category = "Multi"; badge = "Cao cấp"},
            @{name = "Điều hòa âm trần Midea 3HP"; price = 18500000; unit = "máy"; emoji = "⬇️"; rating = 4.8; sold = 450; stock = 80; brand = "Midea"; category = "Âm trần"; badge = "Chính hãng"},
            @{name = "Dây đồng điều hòa D10"; price = 95000; unit = "mét"; emoji = "🔶"; rating = 4.6; sold = 3450; stock = 2000; brand = "Hailiang"; category = "Phụ kiện"},
            @{name = "Remote điều hòa đa năng"; price = 85000; unit = "cái"; emoji = "📱"; rating = 4.5; sold = 2340; stock = 1500; brand = "Chunghop"; category = "Phụ kiện"; discount = 10},
            @{name = "Gas điều hòa R32"; price = 450000; unit = "bình"; emoji = "💨"; rating = 4.7; sold = 1560; stock = 300; brand = "Chemours"; category = "Phụ kiện"}
        )
        categories = @("Tất cả", "1 chiều", "2 chiều", "Multi", "Âm trần", "Phụ kiện")
    }
)

Write-Host "🛒 Generating shopping pages..." -ForegroundColor Cyan

foreach ($page in $pages) {
    $targetFile = "app\shopping\$($page.filename)"
    
    Write-Host "  Creating $($page.filename)..." -ForegroundColor Yellow
    
    # Read template
    $content = Get-Content $baseFile -Raw
    
    # Replace title
    $content = $content -replace 'Vật liệu xây dựng', $page.title
    
    # Replace icon in first line comment (if exists)
    $content = $content -replace '🏗️ Vật liệu xây', "$($page.icon) $($page.title)"
    
    # Build products array
    $productsArray = "const PRODUCTS: Product[] = ["
    foreach ($product in $page.products) {
        $productsArray += "`n  {"
        $productsArray += "`n    id: '$([guid]::NewGuid().ToString().Substring(0,8))',"
        $productsArray += "`n    name: '$($product.name)',"
        $productsArray += "`n    price: $($product.price),"
        $productsArray += "`n    unit: '$($product.unit)',"
        $productsArray += "`n    image: '$($product.emoji)',"
        $productsArray += "`n    rating: $($product.rating),"
        $productsArray += "`n    sold: $($product.sold),"
        $productsArray += "`n    stock: $($product.stock),"
        $productsArray += "`n    brand: '$($product.brand)',"
        $productsArray += "`n    category: '$($product.category)',"
        if ($product.discount) {
            $productsArray += "`n    discount: $($product.discount),"
        }
        if ($product.badge) {
            $productsArray += "`n    badge: '$($product.badge)',"
        }
        $productsArray += "`n  },"
    }
    $productsArray += "`n];"
    
    # Replace products array
    $content = $content -replace "const PRODUCTS: Product\[\] = \[[\s\S]*?\];", $productsArray
    
    # Build categories array
    $categoriesArray = "const CATEGORIES = [" + ($page.categories | ForEach-Object { "'$_'" }) -join ", " + "];"
    
    # Replace categories array
    $content = $content -replace "const CATEGORIES = \[.*?\];", $categoriesArray
    
    # Save file
    Set-Content -Path $targetFile -Value $content -Encoding UTF8
    
    Write-Host "  ✅ Created $($page.filename)" -ForegroundColor Green
}

Write-Host "`n✅ All shopping pages generated successfully!" -ForegroundColor Green
Write-Host "📊 Total: $($pages.Count) pages created" -ForegroundColor Cyan
