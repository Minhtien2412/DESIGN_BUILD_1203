# Auto add products to backend via SSH
Write-Host "=== AUTO ADDING PRODUCTS TO BACKEND ===" -ForegroundColor Cyan

$sshCommand = @"
cd /root && cat > add-products.sh << 'EOFSCRIPT'
#!/bin/bash
API_URL='https://baotienweb.cloud/api/v1'
TOKEN=`curl -s -X POST "\$API_URL/auth/login" -H 'Content-Type: application/json' -d '{"email":"admin2@test.com","password":"123456"}' | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4`
echo "Adding products..."
curl -s -X POST "\$API_URL/products" -H 'Content-Type: application/json' -H "Authorization: Bearer \$TOKEN" -d '{"name":"Bếp từ Sunhouse","description":"Bếp từ đôi 4000W","price":3500000,"category":"ELECTRONICS","stock":50}' && echo '✓ 1'
curl -s -X POST "\$API_URL/products" -H 'Content-Type: application/json' -H "Authorization: Bearer \$TOKEN" -d '{"name":"Lò vi sóng Electrolux","description":"23L 800W","price":2800000,"category":"ELECTRONICS","stock":30}' && echo '✓ 2'
curl -s -X POST "\$API_URL/products" -H 'Content-Type: application/json' -H "Authorization: Bearer \$TOKEN" -d '{"name":"Tủ lạnh Samsung","description":"360L Inverter","price":12000000,"category":"ELECTRONICS","stock":20}' && echo '✓ 3'
curl -s -X POST "\$API_URL/products" -H 'Content-Type: application/json' -H "Authorization: Bearer \$TOKEN" -d '{"name":"Bồn cầu TOTO","description":"1 khối Tornado","price":5800000,"category":"HOME","stock":25}' && echo '✓ 4'
curl -s -X POST "\$API_URL/products" -H 'Content-Type: application/json' -H "Authorization: Bearer \$TOKEN" -d '{"name":"Lavabo American","description":"52cm sứ cao cấp","price":1200000,"category":"HOME","stock":40}' && echo '✓ 5'
curl -s -X POST "\$API_URL/products" -H 'Content-Type: application/json' -H "Authorization: Bearer \$TOKEN" -d '{"name":"Sofa da Italy","description":"3 chỗ 220cm","price":28000000,"category":"HOME","stock":8}' && echo '✓ 6'
curl -s -X POST "\$API_URL/products" -H 'Content-Type: application/json' -H "Authorization: Bearer \$TOKEN" -d '{"name":"Giường gỗ Óc Chó","description":"1m8 hiện đại","price":15000000,"category":"HOME","stock":12}' && echo '✓ 7'
curl -s -X POST "\$API_URL/products" -H 'Content-Type: application/json' -H "Authorization: Bearer \$TOKEN" -d '{"name":"Bình chữa cháy","description":"ABC 4kg","price":280000,"category":"OTHER","stock":100}' && echo '✓ 8'
echo '✅ Done 8 products'
EOFSCRIPT
bash /root/add-products.sh
"@

Write-Host "Running SSH command..." -ForegroundColor Yellow
ssh root@103.200.20.100 $sshCommand

Write-Host "`n✅ Products added to backend!" -ForegroundColor Green