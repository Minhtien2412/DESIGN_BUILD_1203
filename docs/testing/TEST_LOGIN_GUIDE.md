# 🧪 Hướng dẫn Test Đăng nhập/Đăng ký

**Ngày cập nhật**: 06/01/2026  
**Backend**: https://baotienweb.cloud/api/v1

---

## 📱 Test trong App (Recommended)

### Cách 1: Sử dụng màn hình Test chuyên dụng

1. **Khởi động app**:
   ```bash
   npm start
   ```

2. **Vào màn hình test**:
   - Mở app
   - Scroll xuống cuối trang Home
   - Tap vào button **"🧪 Test Login All Roles"** (chỉ hiện trong dev mode)
   - Hoặc navigate thủ công: `/test-login-all-roles`

3. **Test từng tài khoản**:
   - Tap vào card của tài khoản muốn test
   - App sẽ tự động đăng nhập và hiển thị kết quả
   - Thông tin credentials được hiển thị sẵn trong card

4. **Test tất cả**:
   - Tap vào button **"🚀 Test All Accounts"**
   - App sẽ test lần lượt tất cả tài khoản

### Cách 2: Đăng nhập thủ công

1. Vào màn hình Login: `/(auth)/login`
2. Nhập credentials từ bảng bên dưới
3. Tap "Đăng nhập"

---

## 💻 Test qua PowerShell (Quick)

### Chạy script tự động

```powershell
# Chạy script test tất cả tài khoản
.\test-all-login-accounts.ps1
```

Script sẽ:
- ✅ Test login cho tất cả 6 tài khoản
- 📊 Hiển thị bảng kết quả chi tiết
- 🔄 (Optional) Test đăng ký tài khoản mới

### Test thủ công qua PowerShell

#### Test Login
```powershell
Invoke-RestMethod -Uri "https://baotienweb.cloud/api/v1/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email": "admin2026@baotienweb.cloud", "password": "Admin@2026!"}'
```

#### Test Register
```powershell
Invoke-RestMethod -Uri "https://baotienweb.cloud/api/v1/auth/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email": "newuser@test.com", "password": "Test123", "name": "New User", "role": "CLIENT"}'
```

---

## 🔑 Bảng tài khoản Test

| # | Role | Email | Password | Mô tả |
|---|------|-------|----------|-------|
| 1 | **ADMIN** | `admin2026@baotienweb.cloud` | `Admin@2026!` | Admin chính |
| 2 | **ADMIN** | `admin.test@demo.com` | `Test123456` | Admin demo |
| 3 | **CLIENT** | `client.test@demo.com` | `Test123456` | Khách hàng |
| 4 | **ENGINEER** | `engineer.test@demo.com` | `Test123456` | Kỹ sư |
| 5 | **STAFF** | `staff@thietkeresort.com` | `demo123456` | Nhân viên Perfex |
| 6 | **CUSTOMER** | `customer@company.com` | `demo123456` | Customer Perfex |

---

## 🎯 Checklist Test

### Login Flow
- [ ] Login với Admin chính (`admin2026@baotienweb.cloud`)
- [ ] Login với Admin demo (`admin.test@demo.com`)
- [ ] Login với Client (`client.test@demo.com`)
- [ ] Login với Engineer (`engineer.test@demo.com`)
- [ ] Login với Staff Perfex (`staff@thietkeresort.com`)
- [ ] Login với Customer Perfex (`customer@company.com`)
- [ ] Test sai password (expect error 401)
- [ ] Test email không tồn tại (expect error 400)

### Register Flow
- [ ] Register tài khoản CLIENT mới
- [ ] Register tài khoản ENGINEER mới
- [ ] Test email đã tồn tại (expect error 409)
- [ ] Test password yếu (expect validation error)
- [ ] Test role không hợp lệ (expect error 400)

### Token Management
- [ ] Access token được lưu vào SecureStore
- [ ] Refresh token được lưu vào SecureStore
- [ ] Auto logout khi token hết hạn
- [ ] Auto refresh token khi access token expire

### Navigation After Login
- [ ] Redirect về Home sau login thành công
- [ ] Profile hiển thị đúng thông tin user
- [ ] Role-based UI hiển thị đúng (Admin có thêm options)

---

## 📡 API Endpoints

### POST /auth/login
**Request**:
```json
{
  "email": "admin2026@baotienweb.cloud",
  "password": "Admin@2026!"
}
```

**Response** (200):
```json
{
  "accessToken": "eyJhbGci...",
  "refreshToken": "eyJhbGci...",
  "user": {
    "id": 31,
    "email": "admin2026@baotienweb.cloud",
    "name": "Admin User",
    "role": "ADMIN"
  }
}
```

### POST /auth/register
**Request**:
```json
{
  "email": "newuser@test.com",
  "password": "Test123",
  "name": "New User",
  "role": "CLIENT"
}
```

**Response** (201):
```json
{
  "accessToken": "eyJhbGci...",
  "refreshToken": "eyJhbGci...",
  "user": {
    "id": 33,
    "email": "newuser@test.com",
    "name": "New User",
    "role": "CLIENT"
  }
}
```

### POST /auth/logout
**Request**:
```json
{
  "refreshToken": "eyJhbGci..."
}
```

**Response** (200):
```json
{
  "message": "Logged out successfully"
}
```

### POST /auth/refresh
**Request**:
```json
{
  "refreshToken": "eyJhbGci..."
}
```

**Response** (200):
```json
{
  "accessToken": "eyJhbGci...",
  "refreshToken": "eyJhbGci..."
}
```

---

## 🐛 Debugging

### Xem logs trong app
```typescript
// AuthContext.tsx đã có console.log
// Mở Metro bundler logs để xem
```

### Xem network requests
1. Mở React Native Debugger
2. Tab "Network" để xem tất cả API calls
3. Check request/response details

### Common Errors

#### 400 Bad Request
- Email/password format không hợp lệ
- Missing required fields
- Role không hợp lệ (phải viết HOA)

#### 401 Unauthorized
- Sai email hoặc password
- Token hết hạn
- Token không hợp lệ

#### 409 Conflict
- Email đã tồn tại khi register

#### 500 Internal Server Error
- Server lỗi
- Database connection issues
- Check server logs

---

## 📝 Notes

### Token Expiry
- **Access Token**: 15 phút
- **Refresh Token**: 7 ngày
- Auto refresh được handle bởi `api.ts`

### Security
- Passwords được hash với bcrypt trên server
- Tokens được lưu trong SecureStore (encrypted)
- HTTPS only (baotienweb.cloud)

### Perfex CRM Integration
- Sau khi login, app tự động sync với Perfex CRM
- Silent fail nếu sync lỗi (không ảnh hưởng login)
- Dữ liệu từ Perfex được cache trong SQLite

### Roles & Permissions
- `ADMIN`: Toàn quyền, access tất cả features
- `STAFF`: Nhân viên, quản lý tasks
- `ENGINEER`: Kỹ sư, quản lý projects/construction
- `CLIENT`: Khách hàng, xem projects của mình
- `CONTRACTOR`, `ARCHITECT`, `DESIGNER`, `SUPPLIER`: Specialized roles

---

## 🚀 Quick Commands

```bash
# Start app
npm start

# Run test script
.\test-all-login-accounts.ps1

# Clear cache and restart
npm start -- --clear

# View logs
npx expo start --dev-client
```

---

## 📞 Support

**Issues?**
- Check [TEST_ACCOUNTS.md](./TEST_ACCOUNTS.md) for updated credentials
- Check backend status: https://baotienweb.cloud/api/docs
- Review [AuthContext.tsx](./context/AuthContext.tsx) for implementation

**Last Updated**: January 6, 2026
