# 📱 Hướng dẫn cài đặt Module Mobile API cho Perfex CRM

## 📋 Tổng quan

Module này cung cấp REST API endpoints để ứng dụng mobile kết nối với Perfex CRM, bao gồm:
- 🔐 Authentication (đăng nhập/đăng ký)
- 📊 Projects (dự án)
- 💰 Invoices (hóa đơn)
- 📝 Estimates (báo giá)
- ✅ Tasks (công việc)
- 🎫 Tickets (hỗ trợ)
- 📈 Dashboard (thống kê)

---

## 🚀 Cách cài đặt

### Cách 1: Upload qua Admin Panel (Khuyến nghị)

1. **Nén folder module**
   ```
   - Vào folder: perfex-module/
   - Nén folder "mobile_api" thành file "mobile_api.zip"
   - Đảm bảo khi giải nén, folder "mobile_api" nằm ở root
   ```

2. **Upload qua Admin Panel**
   ```
   - Đăng nhập Admin Perfex CRM
   - Vào: Setup → Modules
   - Click "Upload Module"
   - Chọn file mobile_api.zip
   - Click "Upload & Install"
   ```

3. **Kích hoạt module**
   ```
   - Sau khi upload, module sẽ xuất hiện trong danh sách
   - Click "Activate" để kích hoạt
   ```

### Cách 2: Upload trực tiếp qua FTP/SSH

1. **Kết nối server**
   ```bash
   # FTP hoặc SFTP
   Host: thietkeresort.com.vn
   User: [your-username]
   Path: /home/nhaxinhd/thietkeresort.com.vn/perfex_crm/
   ```

2. **Upload folder module**
   ```bash
   # Copy folder mobile_api vào thư mục modules
   scp -r perfex-module/mobile_api/ user@server:/path/to/perfex_crm/modules/
   
   # Hoặc dùng FTP upload folder mobile_api vào:
   # /perfex_crm/modules/mobile_api/
   ```

3. **Kích hoạt trong Admin**
   ```
   - Đăng nhập Admin Perfex CRM
   - Vào: Setup → Modules
   - Tìm "Mobile API"
   - Click "Activate"
   ```

---

## ⚙️ Cấu hình sau cài đặt

### 1. Lấy API Key

Sau khi kích hoạt module:

1. Vào menu **Mobile API** (trong sidebar admin)
2. Click tab **API Keys**
3. Copy API Key mặc định hoặc tạo key mới
4. Cập nhật vào app:

```typescript
// config/env.ts
export default {
  PERFEX_CRM_URL: 'https://thietkeresort.com.vn/perfex_crm',
  PERFEX_API_KEY: 'YOUR_API_KEY_HERE',
};
```

### 2. Cấu hình Module

1. Vào **Mobile API → Cài đặt**
2. Thiết lập:
   - ✅ Cho phép đăng ký tài khoản mới
   - ✅ Bật logging (gỡ lỗi)
   - Số bản ghi tối đa mỗi request

---

## 📚 API Endpoints

### Base URL
```
https://thietkeresort.com.vn/perfex_crm/api/v1/
```

### Headers bắt buộc
```
X-API-Key: YOUR_API_KEY
Content-Type: application/json
```

### Headers cho user đã đăng nhập
```
X-User-Type: staff | contact
X-User-Id: USER_ID
```

### Danh sách endpoints

| Endpoint | Method | Mô tả |
|----------|--------|-------|
| `/auth/login` | POST | Đăng nhập |
| `/auth/register` | POST | Đăng ký |
| `/auth/me` | GET | Thông tin user hiện tại |
| `/auth/change_password` | POST | Đổi mật khẩu |
| `/auth/update_profile` | POST | Cập nhật profile |
| `/projects` | GET | Danh sách dự án |
| `/projects/:id` | GET | Chi tiết dự án |
| `/invoices` | GET | Danh sách hóa đơn |
| `/invoices/:id` | GET | Chi tiết hóa đơn |
| `/estimates` | GET | Danh sách báo giá |
| `/estimates/:id` | GET | Chi tiết báo giá |
| `/tasks` | GET | Danh sách công việc |
| `/tasks/:id` | GET | Chi tiết công việc |
| `/tickets` | GET | Danh sách ticket |
| `/tickets/:id` | GET | Chi tiết ticket |
| `/tickets` | POST | Tạo ticket mới |
| `/tickets/:id/reply` | POST | Trả lời ticket |
| `/dashboard` | GET | Thống kê tổng quan |
| `/notifications` | GET | Danh sách thông báo |

---

## 🔒 Bảo mật

1. **API Key**
   - Mỗi key có thể set IP whitelist
   - Có thể tắt/xóa key bất cứ lúc nào
   - Nên tạo key riêng cho từng app/môi trường

2. **Rate Limiting**
   - Mặc định: 100 requests/phút
   - Có thể điều chỉnh trong Settings

3. **Logging**
   - Mọi request được ghi log
   - Xem log trong Admin → Mobile API → Logs

---

## 🧪 Test API

### Sử dụng curl

```bash
# Test endpoint
curl -X GET "https://thietkeresort.com.vn/perfex_crm/api/v1/test" \
  -H "X-API-Key: YOUR_API_KEY"

# Đăng nhập
curl -X POST "https://thietkeresort.com.vn/perfex_crm/api/v1/auth/login" \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"123456"}'

# Lấy danh sách dự án (sau khi đăng nhập)
curl -X GET "https://thietkeresort.com.vn/perfex_crm/api/v1/projects" \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "X-User-Type: contact" \
  -H "X-User-Id: 1"
```

### Sử dụng API Documentation

1. Vào Admin → Mobile API → Tài liệu API
2. Xem tài liệu tương tác với ví dụ code

---

## 🔧 Troubleshooting

### Lỗi 404 Not Found

1. Kiểm tra module đã được kích hoạt chưa
2. Kiểm tra file `.htaccess` trong thư mục Perfex CRM
3. Xóa cache: `application/cache/*`

### Lỗi 403 Invalid API Key

1. Kiểm tra API Key đã đúng chưa
2. Kiểm tra key còn active không
3. Kiểm tra IP whitelist (nếu có)

### Lỗi 500 Internal Server Error

1. Kiểm tra PHP error log
2. Kiểm tra quyền file/folder
3. Kiểm tra database connection

---

## 📁 Cấu trúc Module

```
modules/mobile_api/
├── mobile_api.php          # Main module file
├── install.php             # Installation script
├── uninstall.php           # Uninstallation script
├── routes_init.php         # Routes initialization
├── config/
│   └── routes.php          # Route definitions
├── controllers/
│   ├── Api.php             # REST API controller
│   └── Mobile_api.php      # Admin controller
├── models/
│   └── Mobile_api_model.php
├── views/
│   ├── settings.php
│   ├── api_keys.php
│   ├── logs.php
│   └── docs.php
└── language/
    ├── english/
    └── vietnamese/
```

---

## 📞 Hỗ trợ

Nếu gặp vấn đề, liên hệ:
- Email: support@thietkeresort.com.vn
- Hotline: [Số điện thoại]

---

*Module Version: 1.0.0*
*Perfex CRM Version: 2.9+*
*Last Updated: 2025*
