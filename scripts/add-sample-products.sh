#!/bin/bash

# Script to add sample products to database via API
# Run on server: bash /root/add-sample-products.sh

API_URL="https://baotienweb.cloud/api/v1"
API_KEY="thietke-resort-api-2025"

# First, get admin token
echo "=== ĐĂNG NHẬP ADMIN ==="
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "email": "admin@test.com",
    "password": "123456"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Đăng nhập thất bại!"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Đăng nhập thành công!"
echo "Token: ${TOKEN:0:20}..."

# Add products for each category
echo -e "\n=== THÊM SẢN PHẨM THIẾT BỊ BẾP ==="

curl -X POST "$API_URL/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "name": "Bếp từ Sunhouse SHD6800",
    "description": "Bếp từ đôi công suất 4000W, mặt kính Schott Ceran cao cấp, 10 chế độ nấu",
    "price": 3500000,
    "category": "kitchen-equipment",
    "stock": 50,
    "images": ["https://via.placeholder.com/300x300/FF6B35/ffffff?text=Bep+Tu"]
  }'

curl -X POST "$API_URL/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "name": "Lò vi sóng Electrolux EMM2318X",
    "description": "Lò vi sóng 23L, công suất 800W, 8 chế độ nấu tự động",
    "price": 2800000,
    "category": "kitchen-equipment",
    "stock": 30,
    "images": ["https://via.placeholder.com/300x300/4CAF50/ffffff?text=Lo+Vi+Song"]
  }'

curl -X POST "$API_URL/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "name": "Máy hút mùi Teka DLH 786",
    "description": "Máy hút mùi âm tủ 70cm, công suất hút 750m³/h, 3 tốc độ",
    "price": 4200000,
    "category": "kitchen-equipment",
    "stock": 20,
    "images": ["https://via.placeholder.com/300x300/2196F3/ffffff?text=May+Hut+Mui"]
  }'

echo -e "\n=== THÊM SẢN PHẨM THIẾT BỊ VỆ SINH ==="

curl -X POST "$API_URL/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "name": "Bồn cầu TOTO MS914E4",
    "description": "Bồn cầu 1 khối, công nghệ xả Tornado, men sứ CeFiONtect",
    "price": 5800000,
    "category": "sanitary-ware",
    "stock": 25,
    "images": ["https://via.placeholder.com/300x300/9C27B0/ffffff?text=Bon+Cau"]
  }'

curl -X POST "$API_URL/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "name": "Lavabo American Standard WP-F512",
    "description": "Lavabo đặt bàn 52cm, chất liệu sứ cao cấp, tiết kiệm nước",
    "price": 1200000,
    "category": "sanitary-ware",
    "stock": 40,
    "images": ["https://via.placeholder.com/300x300/FF9800/ffffff?text=Lavabo"]
  }'

curl -X POST "$API_URL/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "name": "Vòi sen Grohe Tempesta 100",
    "description": "Vòi sen tăng áp 3 chế độ, chống vôi, công nghệ tiết kiệm nước",
    "price": 980000,
    "category": "sanitary-ware",
    "stock": 60,
    "images": ["https://via.placeholder.com/300x300/00BCD4/ffffff?text=Voi+Sen"]
  }'

echo -e "\n=== THÊM SẢN PHẨM PCCC ==="

curl -X POST "$API_URL/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "name": "Bình chữa cháy bột ABC 4kg",
    "description": "Bình chữa cháy bột khô đa năng, chứng nhận PCCC Việt Nam",
    "price": 280000,
    "category": "fire-safety",
    "stock": 100,
    "images": ["https://via.placeholder.com/300x300/F44336/ffffff?text=Binh+Chua+Chay"]
  }'

curl -X POST "$API_URL/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "name": "Đầu phun sprinkler K5.6",
    "description": "Đầu phun nước chữa cháy tự động, bán kính phun 4m",
    "price": 150000,
    "category": "fire-safety",
    "stock": 200,
    "images": ["https://via.placeholder.com/300x300/E91E63/ffffff?text=Dau+Phun"]
  }'

echo -e "\n=== THÊM BÀN ĂN ==="

curl -X POST "$API_URL/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "name": "Bàn ăn gỗ Sồi 6 chỗ",
    "description": "Bàn ăn gỗ sồi tự nhiên 160x80cm, sơn PU cao cấp, chân sắt sơn tĩnh điện",
    "price": 8500000,
    "category": "dining-table",
    "stock": 15,
    "images": ["https://via.placeholder.com/300x300/795548/ffffff?text=Ban+An"]
  }'

curl -X POST "$API_URL/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "name": "Bàn ăn mặt đá 4 chỗ",
    "description": "Bàn ăn mặt đá marble nhân tạo 120x70cm, chân inox 304",
    "price": 6200000,
    "category": "dining-table",
    "stock": 20,
    "images": ["https://via.placeholder.com/300x300/607D8B/ffffff?text=Ban+Da"]
  }'

echo -e "\n=== THÊM BÀN HỌC ==="

curl -X POST "$API_URL/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "name": "Bàn học sinh điều chỉnh cao",
    "description": "Bàn học 80x60cm, điều chỉnh độ cao 60-80cm, có ngăn kéo",
    "price": 2800000,
    "category": "study-table",
    "stock": 35,
    "images": ["https://via.placeholder.com/300x300/3F51B5/ffffff?text=Ban+Hoc"]
  }'

curl -X POST "$API_URL/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "name": "Bàn làm việc gỗ công nghiệp",
    "description": "Bàn làm việc 120x60cm, gỗ MDF phủ Melamine, 2 hộc kéo",
    "price": 1900000,
    "category": "study-table",
    "stock": 50,
    "images": ["https://via.placeholder.com/300x300/009688/ffffff?text=Ban+Lam+Viec"]
  }'

echo -e "\n=== THÊM SOFA ==="

curl -X POST "$API_URL/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "name": "Sofa da thật 3 chỗ Italy",
    "description": "Sofa da bò thật nhập khẩu Italy, khung gỗ sồi, size 220x90x85cm",
    "price": 28000000,
    "category": "sofa",
    "stock": 8,
    "images": ["https://via.placeholder.com/300x300/8BC34A/ffffff?text=Sofa+Da"]
  }'

curl -X POST "$API_URL/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "name": "Sofa vải bố 2 chỗ",
    "description": "Sofa vải bố nhập khẩu Hàn Quốc, 160x80x85cm, có gối tựa",
    "price": 8500000,
    "category": "sofa",
    "stock": 25,
    "images": ["https://via.placeholder.com/300x300/CDDC39/ffffff?text=Sofa+Vai"]
  }'

echo -e "\n✅ HOÀN THÀNH! Đã thêm 15 sản phẩm mẫu"
echo -e "\nKiểm tra sản phẩm đã tạo:"
echo "psql -U postgres -d thietke_db -c 'SELECT id, name, category, price, status FROM products ORDER BY id DESC LIMIT 15;'"
