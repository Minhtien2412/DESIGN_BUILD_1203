# Mobile API Module cho Perfex CRM

Module REST API chính thức cho ứng dụng mobile ThietKeResort.

## 📦 Cài đặt

### Cách 1: Upload qua Admin Panel
1. Nén thư mục `mobile_api` thành file `.zip`
2. Đăng nhập Perfex CRM Admin
3. Vào **Setup → Modules**
4. Click **Upload Module** và chọn file zip
5. Activate module

### Cách 2: Upload trực tiếp qua FTP/SFTP
1. Upload toàn bộ thư mục `mobile_api` vào:
   ```
   /home/nhaxinhd/thietkeresort.com.vn/perfex_crm/modules/mobile_api/
   ```
2. Đăng nhập Perfex CRM Admin
3. Vào **Setup → Modules**
4. Tìm **Mobile API** và click **Activate**

## 📁 Cấu trúc thư mục

```
mobile_api/
├── mobile_api.php        # Main module file
├── install.php           # Installation script
├── uninstall.php         # Uninstallation script
├── config/
│   └── routes.php        # API routes
├── controllers/
│   ├── Mobile_api.php    # Admin controller
│   └── Api.php           # REST API controller
├── models/
│   └── Mobile_api_model.php
├── views/
│   ├── settings.php
│   ├── api_keys.php
│   ├── logs.php
│   └── docs.php
└── language/
    ├── english/
    │   └── mobile_api_lang.php
    └── vietnamese/
        └── mobile_api_lang.php
```

## 🔧 Cấu hình

Sau khi cài đặt, vào **Mobile API** trong sidebar Admin:

1. **Cài đặt**: Bật/tắt API, cấu hình rate limit
2. **API Keys**: Tạo và quản lý API keys
3. **Logs**: Xem lịch sử requests
4. **Tài liệu**: Xem documentation API

## 🔑 Authentication

Mỗi request cần có header:
```
X-API-Key: YOUR_API_KEY
```

Với các endpoint cần đăng nhập, thêm:
```
X-User-Type: contact  (hoặc staff)
X-User-Id: USER_ID
```

## 📡 API Endpoints

### Base URL
```
https://thietkeresort.com.vn/perfex_crm/api/v1
```

### Authentication
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/auth/login` | Đăng nhập |
| POST | `/auth/register` | Đăng ký |
| GET | `/auth/me` | Thông tin user |
| POST | `/auth/change-password` | Đổi mật khẩu |

### Projects
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/projects` | Danh sách dự án |
| GET | `/projects/{id}` | Chi tiết dự án |
| GET | `/projects/{id}/tasks` | Tasks của dự án |

### Invoices & Estimates
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/invoices` | Danh sách hóa đơn |
| GET | `/invoices/{id}` | Chi tiết hóa đơn |
| GET | `/estimates` | Danh sách báo giá |
| GET | `/estimates/{id}` | Chi tiết báo giá |

### Tasks
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/tasks` | Danh sách tasks |
| GET | `/tasks/{id}` | Chi tiết task |

### Tickets
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/tickets` | Danh sách tickets |
| GET | `/tickets/{id}` | Chi tiết ticket |
| POST | `/tickets/create` | Tạo ticket |

### Dashboard
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/dashboard` | Thống kê tổng quan |

### Customers (Staff only)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/customers` | Danh sách khách hàng |
| GET | `/customers/{id}` | Chi tiết khách hàng |

## 💻 Ví dụ sử dụng

### Login
```bash
curl -X POST "https://thietkeresort.com.vn/perfex_crm/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{"email":"user@example.com","password":"123456"}'
```

### Get Projects
```bash
curl -X GET "https://thietkeresort.com.vn/perfex_crm/api/v1/projects" \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "X-User-Type: contact" \
  -H "X-User-Id: 1"
```

## 📱 Tích hợp với App

Cập nhật `config/env.ts`:

```typescript
// Perfex CRM API (Official Module)
PERFEX_CRM_URL: 'https://thietkeresort.com.vn/perfex_crm',
PERFEX_API_KEY: 'YOUR_API_KEY_FROM_MODULE',
```

## 🔒 Bảo mật

- API Keys được tự động generate với 64 ký tự hex
- Có thể tắt/bật từng API key
- Hỗ trợ IP whitelist (sắp có)
- Rate limiting có thể cấu hình
- Tất cả requests được log để audit

## 📊 Logs

Module tự động log tất cả API requests bao gồm:
- Thời gian
- Method (GET/POST/...)
- Endpoint
- IP address
- Response code

Có thể xóa logs định kỳ để tránh database quá lớn.

## 🆘 Hỗ trợ

Nếu gặp vấn đề, kiểm tra:
1. Module đã được activate
2. API Key còn active
3. Routes đã được load (check `config/routes.php`)
4. PHP error logs

---

**Version:** 1.0.0  
**Author:** ThietKeResort Team  
**Last Updated:** December 2025
