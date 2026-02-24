# Seed Sample Data to Production API
$API_BASE = "https://baotienweb.cloud/api/v1"

Write-Host "Seeding data to API..." -ForegroundColor Cyan
Write-Host ""

# Login to get JWT token
Write-Host "Authenticating..." -ForegroundColor Yellow
$timestamp = [DateTimeOffset]::Now.ToUnixTimeSeconds()
$registerBody = "{`"email`":`"seeder$timestamp@test.com`",`"password`":`"Seed123456!`",`"name`":`"Data Seeder`"}"
try {
    $authResponse = Invoke-RestMethod -Uri "$API_BASE/auth/register" -Method Post -ContentType "application/json" -Body $registerBody
    $token = $authResponse.accessToken
    Write-Host "Authentication successful!" -ForegroundColor Green
} catch {
    Write-Host "Authentication failed" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Services
$servicesJson = '[{"name":"Thiet ke kien truc nha pho","category":"DESIGN","price":500000,"unit":"m2","description":"Thiet ke kien truc nha pho hien dai","duration":"2-3 tuan","status":"ACTIVE"},{"name":"Thiet ke noi that can ho","category":"DESIGN","price":350000,"unit":"m2","description":"Thiet ke noi that can ho chung cu","duration":"1-2 tuan","status":"ACTIVE"},{"name":"Thiet ke biet thu san vuon","category":"DESIGN","price":800000,"unit":"m2","description":"Thiet ke kien truc va canh quan biet thu","duration":"4-6 tuan","status":"ACTIVE"},{"name":"Thi cong xay dung nha pho","category":"CONSTRUCTION","price":4500000,"unit":"m2","description":"Thi cong xay dung tron goi nha pho 3-4 tang","duration":"6-8 thang","status":"ACTIVE"},{"name":"Thi cong cai tao sua chua","category":"CONSTRUCTION","price":2800000,"unit":"m2","description":"Cai tao, sua chua nha cu","duration":"2-3 thang","status":"ACTIVE"},{"name":"Thi cong nha thep tien che","category":"CONSTRUCTION","price":3200000,"unit":"m2","description":"Xay dung nha khung thep tien che","duration":"1-2 thang","status":"ACTIVE"},{"name":"Tu van phap ly xay dung","category":"CONSULTING","price":5000000,"unit":"du an","description":"Tu van thu tuc, giay phep xay dung","duration":"2-4 tuan","status":"ACTIVE"},{"name":"Tu van phong thuy nha o","category":"CONSULTING","price":3000000,"unit":"can","description":"Tu van phong thuy thiet ke, xay dung","duration":"3-5 ngay","status":"ACTIVE"},{"name":"Tu van du toan chi phi","category":"CONSULTING","price":2000000,"unit":"du an","description":"Lap du toan chi tiet vat tu, nhan cong","duration":"1 tuan","status":"ACTIVE"},{"name":"Bao tri he thong dien nuoc","category":"MAINTENANCE","price":1500000,"unit":"lan","description":"Bao tri dinh ky he thong dien, nuoc","duration":"1 ngay","status":"ACTIVE"},{"name":"Bao tri son sua dinh ky","category":"MAINTENANCE","price":180000,"unit":"m2","description":"Son lai tuong, tran, sua chua nut vo","duration":"3-5 ngay","status":"ACTIVE"},{"name":"Giam sat thi cong xay dung","category":"INSPECTION","price":3500000,"unit":"thang","description":"Giam sat chat luong thi cong, tien do","duration":"theo du an","status":"ACTIVE"},{"name":"Nghiem thu cong trinh","category":"INSPECTION","price":8000000,"unit":"cong trinh","description":"Nghiem thu chat luong hoan cong","duration":"1-2 ngay","status":"ACTIVE"},{"name":"Khao sat dia chat nen mong","category":"OTHER","price":12000000,"unit":"lo","description":"Khoan khao sat dia chat, phan tich mau","duration":"1-2 tuan","status":"ACTIVE"},{"name":"Dich vu cho thue thiet bi","category":"OTHER","price":800000,"unit":"ngay","description":"Cho thue may tron, may dam, gian giao","duration":"theo nhu cau","status":"ACTIVE"}]'

# Utilities
$utilitiesJson = '[{"name":"Tinh toan vat lieu xay dung","type":"CALCULATOR","icon":"calculator-outline","color":"#3B82F6","description":"Tinh toan luong xi mang, gach, cat","route":"/utilities/material-calculator","enabled":true},{"name":"Du toan chi phi xay nha","type":"CALCULATOR","icon":"cash-outline","color":"#10B981","description":"Uoc tinh chi phi xay dung theo dien tich","route":"/utilities/cost-estimator","enabled":true},{"name":"Tinh dien tich thuc te","type":"CALCULATOR","icon":"resize-outline","color":"#F59E0B","description":"Tinh dien tich xay dung, dien tich su dung","route":"/utilities/area-calculator","enabled":true},{"name":"Tu van AI kien truc","type":"AI","icon":"chatbubbles-outline","color":"#8B5CF6","description":"Tro chuyen voi AI de tu van thiet ke","route":"/utilities/ai-consultant","enabled":true},{"name":"AI phan tich ho so","type":"AI","icon":"document-text-outline","color":"#EC4899","description":"Phan tich ban ve, ho so thiet ke bang AI","route":"/utilities/ai-blueprint-analyzer","enabled":true},{"name":"AI tao thiet ke 3D","type":"AI","icon":"cube-outline","color":"#6366F1","description":"Tao mo hinh 3D tu mo ta van ban","route":"/utilities/ai-3d-generator","enabled":false},{"name":"Live Stream cong truong","type":"MEDIA","icon":"videocam-outline","color":"#EF4444","description":"Theo doi tien do thi cong truc tiep","route":"/utilities/live-stream","enabled":true},{"name":"Thu vien video huong dan","type":"MEDIA","icon":"play-circle-outline","color":"#F59E0B","description":"Huong dan thi cong, lap dat","route":"/utilities/video-library","enabled":true},{"name":"Thu vien anh mau","type":"MEDIA","icon":"images-outline","color":"#06B6D4","description":"Bo suu tap anh mau thiet ke","route":"/utilities/design-gallery","enabled":true},{"name":"Chup anh tien do","type":"MEDIA","icon":"camera-outline","color":"#14B8A6","description":"Tu dong chup anh tien do cong trinh","route":"/utilities/progress-photos","enabled":true},{"name":"Quan ly ho so du an","type":"DOCUMENT","icon":"folder-open-outline","color":"#10B981","description":"Luu tru, quan ly ban ve, hop dong","route":"/utilities/project-files","enabled":true},{"name":"Mau hop dong xay dung","type":"DOCUMENT","icon":"document-attach-outline","color":"#3B82F6","description":"Thu vien mau hop dong, phu luc","route":"/utilities/contract-templates","enabled":true},{"name":"Tra cuu tieu chuan","type":"DOCUMENT","icon":"book-outline","color":"#8B5CF6","description":"Tra cuu TCVN, QCVN ve xay dung","route":"/utilities/standards-lookup","enabled":true},{"name":"Ban do vat lieu gan ban","type":"OTHER","icon":"map-outline","color":"#EF4444","description":"Tim cua hang vat lieu xay dung","route":"/utilities/material-map","enabled":true},{"name":"Lich cong viec","type":"OTHER","icon":"calendar-outline","color":"#F59E0B","description":"Lap lich thi cong, nhac nho deadline","route":"/utilities/work-calendar","enabled":true},{"name":"Cong cu do dac AR","type":"OTHER","icon":"scan-outline","color":"#06B6D4","description":"Do kich thuoc bang camera AR","route":"/utilities/ar-measurement","enabled":false}]'

$services = $servicesJson | ConvertFrom-Json
$utilities = $utilitiesJson | ConvertFrom-Json

Write-Host ""
Write-Host "Seeding $($services.Count) services..." -ForegroundColor Yellow
$sc = 0
foreach ($s in $services) {
    try {
        $body = $s | ConvertTo-Json -Compress
        Invoke-RestMethod -Uri "$API_BASE/services" -Method Post -Headers $headers -Body $body | Out-Null
        $sc++
        Write-Host "  [$sc] $($s.name)" -ForegroundColor Green
        Start-Sleep -Milliseconds 100
    } catch {
        Write-Host "  Failed: $($s.name) - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Seeding $($utilities.Count) utilities..." -ForegroundColor Yellow
$uc = 0
foreach ($u in $utilities) {
    try {
        $body = $u | ConvertTo-Json -Compress
        Invoke-RestMethod -Uri "$API_BASE/utilities" -Method Post -Headers $headers -Body $body | Out-Null
        $uc++
        Write-Host "  [$uc] $($u.name)" -ForegroundColor Green
        Start-Sleep -Milliseconds 100
    } catch {
        Write-Host "  Failed: $($u.name) - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Done! Created $sc services and $uc utilities." -ForegroundColor Cyan

# Verify
$sCheck = Invoke-RestMethod -Uri "$API_BASE/services" -Method Get
$uCheck = Invoke-RestMethod -Uri "$API_BASE/utilities" -Method Get
Write-Host "Total in DB: $($sCheck.meta.total) services, $($uCheck.meta.total) utilities" -ForegroundColor Green
