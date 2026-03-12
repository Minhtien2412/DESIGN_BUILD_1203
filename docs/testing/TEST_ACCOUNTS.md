# 🔐 Test Accounts - baotienweb.cloud/api/v1

**Cập nhật**: 06/01/2026

## ✅ VERIFIED WORKING ACCOUNTS

Tất cả tài khoản dưới đây đã được test và xác nhận hoạt động với backend `https://baotienweb.cloud/api/v1`

### 1. ADMIN (Tài khoản chính)
```
Email: admin2026@baotienweb.cloud
Password: Admin@2026!
Role: ADMIN
User ID: 31
```
**Mô tả**: Tài khoản quản trị viên chính, có toàn quyền truy cập hệ thống

---

### 2. ADMIN (Demo)
```
Email: admin.test@demo.com
Password: Test123456
Role: ADMIN
User ID: 17
```
**Mô tả**: Tài khoản admin demo để test

---

### 3. CLIENT (Khách hàng)
```
Email: client.test@demo.com
Password: Test123456
Role: CLIENT
User ID: 15
```
**Mô tả**: Tài khoản khách hàng, sử dụng để test quyền của người dùng cuối

---

### 4. ENGINEER (Kỹ sư)
```
Email: engineer.test@demo.com
Password: Test123456
Role: ENGINEER
User ID: 16
```
**Mô tả**: Tài khoản kỹ sư, có quyền quản lý dự án và công trình

---

### 5. STAFF (Perfex CRM)
```
Email: staff@thietkeresort.com
Password: demo123456
Role: STAFF
```
**Mô tả**: Tài khoản nhân viên trong Perfex CRM

---

### 6. CUSTOMER (Perfex CRM)
```
Email: customer@company.com
Password: demo123456
Role: CUSTOMER
```
**Mô tả**: Tài khoản khách hàng trong Perfex CRM

---

## 🧪 CÁCH SỬ DỤNG

### Trong App
1. Mở app và vào màn hình test:
   ```
   /test-login-all-roles
   ```
2. Tap vào card của tài khoản muốn test
3. App sẽ tự động đăng nhập và hiển thị kết quả

### Manual Test
```typescript
import { useAuth } from './context/AuthContext';

const { signIn } = useAuth();

// Test admin
await signIn('admin2026@baotienweb.cloud', 'Admin@2026!');

// Test client
await signIn('client.test@demo.com', 'Test123456');
```

---

## 📡 API ENDPOINTS

| Endpoint | Method | Body | Response |
|----------|--------|------|----------|
| `/auth/login` | POST | `{ email, password }` | `{ accessToken, refreshToken, user }` |
| `/auth/register` | POST | `{ email, password, name, role }` | `{ accessToken, refreshToken, user }` |
| `/auth/logout` | POST | `{ refreshToken }` | `{ message }` |
| `/auth/refresh` | POST | `{ refreshToken }` | `{ accessToken, refreshToken }` |

---

## 🎭 SUPPORTED ROLES

| Role | Mô tả | Quyền hạn |
|------|-------|-----------|
| `CLIENT` | Khách hàng | Xem dự án của mình |
| `ENGINEER` | Kỹ sư | Quản lý công trình, dự án |
| `CONTRACTOR` | Nhà thầu | Quản lý thi công |
| `ARCHITECT` | Kiến trúc sư | Thiết kế, vẽ bản vẽ |
| `DESIGNER` | Thiết kế | Thiết kế nội thất |
| `SUPPLIER` | Nhà cung cấp | Cung cấp vật liệu |
| `STAFF` | Nhân viên | Nhân viên công ty |
| `ADMIN` | Quản trị | Toàn quyền |

---

## 🔄 REGISTER FORMAT

```json
{
  "email": "newuser@example.com",
  "password": "Password123!",
  "name": "Full Name",
  "role": "CLIENT"
}
```

**Lưu ý**: 
- `role` phải viết HOA (CLIENT, ADMIN, ENGINEER...)
- Dùng `name` không phải `fullName`
- Password tối thiểu 6 ký tự

---

## 🧪 TEST RESULTS

**Test Date**: 06/01/2026  
**Backend**: https://baotienweb.cloud/api/v1  
**Test Tool**: PowerShell Invoke-RestMethod

| Account | Status | Response Time | Token Valid |
|---------|--------|---------------|-------------|
| admin2026@baotienweb.cloud | ✅ | ~200ms | ✅ |
| admin.test@demo.com | ✅ | ~150ms | ✅ |
| client.test@demo.com | ✅ | ~180ms | ✅ |
| engineer.test@demo.com | ✅ | ~160ms | ✅ |
| Register (new user) | ✅ | ~220ms | ✅ |

---

## 📝 NOTES

1. **Token Expiry**:
   - Access Token: 15 phút
   - Refresh Token: 7 ngày

2. **Storage**:
   - Tokens được lưu trong SecureStore
   - Auto refresh khi access token hết hạn

3. **Error Handling**:
   - 401: Token hết hạn hoặc không hợp lệ
   - 400: Sai email/password
   - 409: Email đã tồn tại (register)

4. **CRM Integration**:
   - Tự động sync với Perfex CRM sau khi login
   - Silent fail nếu sync lỗi (không ảnh hưởng login)

---

## 🚀 QUICK START

### Test trong App
```bash
# Run app
npm start

# Navigate to test screen
# Open app -> Tap "Test Login" trong dev menu
# Or navigate to: /test-login-all-roles
```

### Test API trực tiếp
```powershell
# Test login
Invoke-RestMethod -Uri "https://baotienweb.cloud/api/v1/auth/login" `
  -Method POST -ContentType "application/json" `
  -Body '{"email": "admin2026@baotienweb.cloud", "password": "Admin@2026!"}'

# Test register
Invoke-RestMethod -Uri "https://baotienweb.cloud/api/v1/auth/register" `
  -Method POST -ContentType "application/json" `
  -Body '{"email": "test@example.com", "password": "Test123", "name": "Test User", "role": "CLIENT"}'
```

---

**Last Updated**: January 6, 2026  
**Maintained by**: Development Team  
**Backend Version**: v1.0.0
