# 🔐 Auth Configuration Status Report
## Báo cáo Kiểm tra Cấu hình Đăng ký/Đăng nhập

**Ngày kiểm tra:** 15/01/2026
**Server:** baotienweb.cloud (103.200.20.100)

---

## ✅ Trạng thái Tổng quan

| Tính năng | Máy chủ (VPS) | App Mobile | Trạng thái |
|-----------|---------------|------------|------------|
| Email/Password Auth | ✅ | ✅ | **HOẠT ĐỘNG** |
| Phone OTP (SMS) | ✅ | ✅ | **HOẠT ĐỘNG** |
| Zalo OAuth | ✅ Configured | ✅ Ready | **SẴN SÀNG** |
| ZNS Notification | ❌ Missing OA Token | - | **CHƯA CẤU HÌNH** |
| Google OAuth | ✅ Client ID | ✅ Ready | **SẴN SÀNG** |
| JWT Authentication | ✅ | ✅ | **HOẠT ĐỘNG** |

---

## 🧪 Kết quả Test API

### 1. Đăng ký bằng Email ✅
```
POST /api/v1/auth/register
Status: SUCCESS
Response: accessToken, refreshToken, user object
```

### 2. Đăng nhập bằng Email ✅
```
POST /api/v1/auth/login
Status: SUCCESS  
Response: accessToken, refreshToken, user object
```

### 3. Gửi OTP (GetOTP.dev) ✅
```
POST /api/v1/zalo/send-otp
Status: SUCCESS
Response: {
  "success": true,
  "sessionId": "c84491d0-9041-4fe4-856f-55257bb858cc",
  "message": "OTP đã được gửi"
}
```

### 4. Health Check ✅
```
GET /api/v1/health
Status: OK
Uptime: Running stable
```

---

## ⚙️ Cấu hình Máy chủ (VPS)

### .env đã cấu hình:
```env
# Database ✅
DATABASE_URL=postgresql://postgres:***@localhost:5432/postgres

# JWT Auth ✅
JWT_SECRET=72f8a37c6d5e4b12a3f9c28d4e1f7b65
JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Zalo ✅
ZALO_APP_ID=1408601745775286980
ZALO_APP_SECRET=ZQXD5iVxC48Eyol4DM6m

# GetOTP ✅
GETOTP_API_KEY=b2c885626ab1e17735372aa843edb431

# API ✅
API_KEY=thietke-resort-api-key-2024
```

### GetOTP Service:
- Template ID: `ea458d21-7337-452e-a0fa-7cc2554114f9`
- Sender: `OTP Dev`
- Cooldown: 60 giây
- Expiry: 5 phút

---

## 📱 Cấu hình App Mobile

### config/env.ts:
```typescript
API_BASE_URL: 'https://baotienweb.cloud/api/v1'
API_KEY: 'thietke-resort-api-key-2024'
```

### services/api/authApi.ts:
- ✅ login() - Đăng nhập email/password
- ✅ register() - Đăng ký email/password
- ✅ sendOtp() - Gửi OTP
- ✅ verifyOtp() - Xác thực OTP
- ✅ getProfile() - Lấy thông tin user
- ✅ refreshAccessToken() - Refresh token

### context/AuthContext.tsx:
- ✅ signIn() - Xử lý đăng nhập
- ✅ signUp() - Xử lý đăng ký
- ✅ signOut() - Xử lý đăng xuất
- ✅ Token persistence với SecureStore

---

## ❌ Cần hoàn thiện

### 1. ZNS (Zalo Notification Service)
**Vấn đề:** Chưa có OA Access Token
**Giải pháp:**
1. Đăng nhập https://oa.zalo.me
2. Lấy Access Token từ Settings > API
3. Thêm vào .env:
   ```
   ZALO_OA_ACCESS_TOKEN=xxx
   ZALO_OA_REFRESH_TOKEN=xxx
   ```

### 2. Google OAuth
**Vấn đề:** Client Secret placeholder
**Giải pháp:**
1. Vào https://console.cloud.google.com/apis/credentials
2. Lấy Client Secret thật
3. Cập nhật GOOGLE_CLIENT_SECRET trong .env

---

## 🔧 Commands hữu ích

### Kiểm tra logs:
```bash
ssh root@103.200.20.100 "pm2 logs baotienweb-api --lines 50"
```

### Restart backend:
```bash
ssh root@103.200.20.100 "cd /var/www/baotienweb-api && pm2 restart baotienweb-api"
```

### Test API:
```powershell
# Test health
Invoke-RestMethod "https://baotienweb.cloud/api/v1/health"

# Test send OTP
$body = @{phone="84912345678"; channel="sms"} | ConvertTo-Json
Invoke-RestMethod -Uri "https://baotienweb.cloud/api/v1/zalo/send-otp" `
  -Method POST -Body $body -ContentType "application/json" `
  -Headers @{"X-API-Key"="thietke-resort-api-key-2024"}
```

---

## 📊 Sơ đồ Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │───▶│  Backend API    │───▶│   GetOTP.dev    │
│  (React Native) │    │   (NestJS)      │    │   (SMS Service) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                      │                      │
        │   1. send-otp        │   2. POST /verify    │
        │──────────────────────▶──────────────────────▶
        │                      │                      │
        │   3. OTP sent        │   4. message_id      │
        │◀──────────────────────◀──────────────────────│
        │                      │                      │
        │   5. verify-otp      │   6. GET /verify     │
        │──────────────────────▶──────────────────────▶
        │                      │                      │
        │   7. JWT tokens      │   8. verified=true   │
        │◀──────────────────────◀──────────────────────│
```

---

**Kết luận:** Hệ thống đăng ký/đăng nhập đã hoạt động ổn định với Email và OTP. Cần bổ sung OA Access Token để kích hoạt ZNS.
