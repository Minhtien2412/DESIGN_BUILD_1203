# Hướng dẫn cài đặt Custom API cho Perfex CRM

## Tình trạng hiện tại

- **Perfex CRM URL**: `https://thietkeresort.com.vn/perfex_crm/`
- **API Module Status**: ❌ CHƯA ACTIVE (cần key license)
- **Giải pháp**: Sử dụng Custom API Controller (bypass API Module)

---

## 📋 Bước 1: Upload Custom API Controller

### 1.1 Chuẩn bị file

File `Custom_api.php` đã được tạo sẵn tại:
```
docs/perfex-custom-api/Custom_api.php
```

### 1.2 Upload lên server

Sử dụng FileZilla hoặc cPanel File Manager:

**Đường dẫn đích:**
```
/home/nhaxinhd/thietkeresort.com.vn/perfex_crm/application/controllers/Custom_api.php
```

### 1.3 Quyền file

Đặt quyền file là `644`:
```bash
chmod 644 /home/nhaxinhd/thietkeresort.com.vn/perfex_crm/application/controllers/Custom_api.php
```

---

## 📋 Bước 2: Cấu hình API Key

### 2.1 Mở file Custom_api.php đã upload

Tìm dòng:
```php
private $API_SECRET_KEY = 'thietkeresort-perfex-api-2024';
```

### 2.2 Đổi thành key bảo mật riêng

```php
private $API_SECRET_KEY = 'your-secret-key-here-change-this';
```

> ⚠️ **QUAN TRỌNG**: Đổi key này thành một chuỗi ngẫu nhiên bảo mật!

---

## 📋 Bước 3: Test API

### 3.1 Test kết nối (không cần auth)

Mở trình duyệt:
```
https://thietkeresort.com.vn/perfex_crm/custom_api/test
```

**Kết quả mong đợi:**
```json
{
  "status": true,
  "message": "Perfex CRM Custom API is working!",
  "version": "1.0.0",
  "perfex_version": "3.x.x",
  "timestamp": "2025-12-30 10:00:00"
}
```

### 3.2 Test với API Key

Sử dụng Postman hoặc curl:

```bash
curl -X GET "https://thietkeresort.com.vn/perfex_crm/custom_api/customers" \
  -H "X-API-Key: thietkeresort-perfex-api-2024"
```

---

## 📋 Bước 4: Cấu hình trong App

### 4.1 File .env (hoặc app.config.ts)

```env
EXPO_PUBLIC_PERFEX_CRM_URL=https://thietkeresort.com.vn/perfex_crm
EXPO_PUBLIC_PERFEX_API_TOKEN=thietkeresort-perfex-api-2024
```

### 4.2 Hoặc cập nhật app.config.ts

```typescript
export default {
  expo: {
    // ...
    extra: {
      // ...
      EXPO_PUBLIC_PERFEX_CRM_URL: 'https://thietkeresort.com.vn/perfex_crm',
      EXPO_PUBLIC_PERFEX_API_TOKEN: 'thietkeresort-perfex-api-2024',
    },
  },
};
```

---

## 📊 API Endpoints Reference

### Public (không cần auth)

| Endpoint | Description |
|----------|-------------|
| `GET /custom_api/test` | Test connection |

### Protected (cần X-API-Key header)

#### Customers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/custom_api/customers` | Danh sách khách hàng |
| GET | `/custom_api/customer/{id}` | Chi tiết khách hàng |
| POST | `/custom_api/customers/create` | Tạo khách hàng |
| POST | `/custom_api/customers/update/{id}` | Cập nhật khách hàng |

#### Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/custom_api/projects` | Danh sách dự án |
| GET | `/custom_api/project/{id}` | Chi tiết dự án |
| POST | `/custom_api/projects/create` | Tạo dự án |
| POST | `/custom_api/projects/progress/{id}` | Cập nhật tiến độ |

#### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/custom_api/tasks` | Danh sách tasks |
| POST | `/custom_api/tasks/create` | Tạo task |
| POST | `/custom_api/tasks/complete/{id}` | Hoàn thành task |

#### Others

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/custom_api/invoices` | Danh sách hóa đơn |
| GET | `/custom_api/leads` | Danh sách leads |
| POST | `/custom_api/leads/create` | Tạo lead |
| GET | `/custom_api/estimates` | Danh sách báo giá |
| GET | `/custom_api/staff` | Danh sách nhân viên |

#### Sync

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/custom_api/sync/user` | Sync user từ app → Perfex |
| POST | `/custom_api/sync/project` | Sync project từ app → Perfex |

---

## 📖 Ví dụ sử dụng trong React Native

### Test Connection

```typescript
import PerfexCRM from '@/services/perfexCRM';

const result = await PerfexCRM.testConnection();
console.log(result);
// { connected: true, version: '1.0.0', message: 'Connected!' }
```

### Lấy danh sách khách hàng

```typescript
const { data, total } = await PerfexCRM.Customers.getAll({ page: 1, limit: 20 });
console.log(`Tổng: ${total} khách hàng`);
```

### Cập nhật tiến độ dự án

```typescript
await PerfexCRM.Projects.updateProgress('123', 75);
// Project 123 progress = 75%
```

### Sync user từ app sang Perfex

```typescript
await PerfexCRM.Sync.syncUserToCustomer({
  id: 'user-001',
  email: 'khachhang@email.com',
  name: 'Nguyễn Văn A',
  phone: '0901234567',
  address: '123 ABC, Q1, HCM',
});
```

---

## 🔧 Troubleshooting

### Lỗi 404 Not Found

- Kiểm tra file đã upload đúng đường dẫn chưa
- Tên file phải là `Custom_api.php` (viết hoa C)

### Lỗi 401 Unauthorized

- Kiểm tra API Key có đúng không
- Kiểm tra header `X-API-Key` đã được gửi chưa

### Lỗi 500 Internal Server Error

- Kiểm tra PHP error log: `/home/nhaxinhd/logs/error.log`
- Có thể do thiếu model hoặc syntax error

### CORS Error

- File `Custom_api.php` đã có CORS headers
- Nếu vẫn lỗi, thêm vào `.htaccess`:

```apache
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type, Authorization, X-API-Key"
</IfModule>
```

---

## 📝 Database Schema Reference

### Bảng chính trong Perfex CRM

| Table | Description |
|-------|-------------|
| `tblclients` | Khách hàng |
| `tblcontacts` | Liên hệ của khách hàng |
| `tblprojects` | Dự án |
| `tbltasks` | Tasks |
| `tbltaskassignees` | Task assignments |
| `tblinvoices` | Hóa đơn |
| `tblleads` | Leads |
| `tblestimates` | Báo giá |
| `tblstaff` | Nhân viên |

### Project Status

| ID | Status |
|----|--------|
| 1 | Not Started |
| 2 | In Progress |
| 3 | On Hold |
| 4 | Cancelled |
| 5 | Finished |

### Task Status

| ID | Status |
|----|--------|
| 1 | Not Started |
| 2 | In Progress |
| 3 | Testing |
| 4 | Awaiting Feedback |
| 5 | Complete |

### Invoice Status

| ID | Status |
|----|--------|
| 1 | Unpaid |
| 2 | Paid |
| 3 | Partially Paid |
| 4 | Overdue |
| 5 | Cancelled |
| 6 | Draft |

---

## ✅ Checklist cài đặt

- [ ] Upload `Custom_api.php` lên `/application/controllers/`
- [ ] Đổi `API_SECRET_KEY` thành key bảo mật
- [ ] Test endpoint `/custom_api/test`
- [ ] Cấu hình `.env` trong app
- [ ] Test từ app với `PerfexCRM.testConnection()`

---

## 📞 Support

Nếu gặp vấn đề, liên hệ:
- Email: support@thietkeresort.com
- Phone: 0901234567

---

*Cập nhật: 2025-12-30*
