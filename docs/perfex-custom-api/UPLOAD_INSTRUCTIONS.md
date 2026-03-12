# Hướng Dẫn Upload Custom API Lên Server

## 🎯 Mục đích
File `Custom_api.php` cần được upload lên server Perfex CRM để kích hoạt các endpoint authentication cho app.

## 📁 Vị trí file

**File nguồn (local):**
```
docs/perfex-custom-api/Custom_api.php
```

**Vị trí đích (server):**
```
/home/nhaxinhd/thietkeresort.com.vn/perfex_crm/application/controllers/Custom_api.php
```

## 🚀 Cách Upload

### Option 1: FTP/SFTP
1. Kết nối FTP/SFTP tới server `thietkeresort.com.vn`
2. Navigate tới: `/home/nhaxinhd/thietkeresort.com.vn/perfex_crm/application/controllers/`
3. **Backup file cũ** (nếu có): Rename `Custom_api.php` → `Custom_api.php.bak`
4. Upload file mới `Custom_api.php`
5. Set permissions: `chmod 644 Custom_api.php`

### Option 2: SSH Terminal
```bash
# Connect SSH
ssh nhaxinhd@thietkeresort.com.vn

# Navigate to controllers
cd /home/nhaxinhd/thietkeresort.com.vn/perfex_crm/application/controllers/

# Backup existing file
cp Custom_api.php Custom_api.php.bak.$(date +%Y%m%d)

# Upload using scp (từ local)
# Hoặc paste nội dung file vào:
nano Custom_api.php

# Set permissions
chmod 644 Custom_api.php
```

### Option 3: cPanel File Manager
1. Login vào cPanel: `https://thietkeresort.com.vn/cpanel`
2. Vào File Manager
3. Navigate: `public_html/perfex_crm/application/controllers/`
4. Upload file `Custom_api.php`

---

## 🔐 Bảo mật - Đổi API Key

**QUAN TRỌNG:** Sau khi upload, cần đổi API Key trong cả 2 file:

### 1. Trên Server (Custom_api.php line 29):
```php
private $api_key = 'YOUR_SECURE_RANDOM_KEY_HERE';
```

### 2. Trong App (config/env.ts):
```typescript
PERFEX_API_KEY: 'YOUR_SECURE_RANDOM_KEY_HERE',
```

Tạo key ngẫu nhiên:
```bash
openssl rand -hex 32
# Example output: a1b2c3d4e5f6789...
```

---

## 🧪 Test Sau Khi Upload

### Test 1: Endpoint hoạt động
```bash
curl -X GET "https://thietkeresort.com.vn/perfex_crm/custom_api/test" \
  -H "X-API-Key: 67890abcdef!@#\$%^&*"
```

Expected response:
```json
{
  "status": true,
  "message": "Custom API is working",
  "time": "2025-12-30 12:00:00"
}
```

### Test 2: Register
```bash
curl -X POST "https://thietkeresort.com.vn/perfex_crm/custom_api/auth/register" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: 67890abcdef!@#\$%^&*" \
  -d '{
    "email": "test@example.com",
    "password": "123456",
    "firstname": "Test User"
  }'
```

### Test 3: Login
```bash
curl -X POST "https://thietkeresort.com.vn/perfex_crm/custom_api/auth/login" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: 67890abcdef!@#\$%^&*" \
  -d '{
    "email": "test@example.com",
    "password": "123456"
  }'
```

---

## 📋 Auth Endpoints Summary

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/custom_api/test` | Test API hoạt động |
| POST | `/custom_api/auth/register` | Đăng ký tài khoản |
| POST | `/custom_api/auth/login` | Đăng nhập |
| POST | `/custom_api/auth/me` | Lấy thông tin user |
| POST | `/custom_api/auth/change_password` | Đổi mật khẩu |
| POST | `/custom_api/auth/update_profile` | Cập nhật profile |

---

## ⚠️ Troubleshooting

### Error: 401 Unauthorized
- Kiểm tra X-API-Key header
- Đảm bảo API key match giữa server và app

### Error: 404 Not Found
- File chưa được upload đúng vị trí
- Routes chưa được config (nếu dùng custom routes)

### Error: 500 Internal Server Error
- Check PHP error log: `/home/nhaxinhd/logs/error.log`
- Có thể thiếu helper phpass

### Phpass Helper không tồn tại
Tạo file `/application/helpers/phpass_helper.php`:
```php
<?php
// Include PasswordHash class từ Perfex
if (!class_exists('PasswordHash')) {
    require APPPATH . '../assets/plugins/phpass/passwordhash.php';
}
```

---

## ✅ Checklist

- [ ] Backup file cũ
- [ ] Upload Custom_api.php
- [ ] Set permissions 644
- [ ] Đổi API Key (server + app)
- [ ] Test endpoint /test
- [ ] Test register
- [ ] Test login
- [ ] Kiểm tra trong Perfex CRM: Khách hàng → Danh sách

---

## 📞 Support

Nếu gặp lỗi, kiểm tra:
1. PHP Error Log
2. Browser Console (F12)
3. Network tab → Response

File locations:
- Perfex logs: `/home/nhaxinhd/thietkeresort.com.vn/perfex_crm/application/logs/`
- PHP logs: `/home/nhaxinhd/logs/error.log`
