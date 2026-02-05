# 📱 Báo Cáo Cập Nhật Chức Năng Đăng Ký/Đăng Nhập OTP

**Ngày cập nhật:** 2026-01-15  
**Phiên bản:** 1.0.0  
**Trạng thái:** ✅ Hoàn thành

---

## 🎯 Mục Tiêu

Cập nhật ứng dụng di động để hỗ trợ đăng ký và đăng nhập bằng OTP Zalo với:
- Gửi OTP qua API backend thực
- Xác thực OTP và nhận token
- Lưu token vào local storage (SecureStore)
- Tự động cập nhật trạng thái đăng nhập

---

## 📁 Files Đã Cập Nhật

### 1. `context/AuthContext.tsx`

**Thay đổi:**
- ✅ Thêm interface `SendOTPResult` và `VerifyOTPResult`
- ✅ Thêm hàm `sendOTP()` - gửi OTP qua backend API
- ✅ Thêm hàm `verifyOTP()` - xác thực OTP và lưu token
- ✅ Thêm hàm `signInWithPhone()` - đăng nhập bằng SĐT
- ✅ Thêm hàm `registerWithPhone()` - đăng ký tài khoản mới

**API Endpoints sử dụng:**
```
POST /zalo/send-otp     - Gửi OTP đến số điện thoại
POST /zalo/verify-otp   - Xác thực OTP và trả về token
POST /zalo/register-phone - Đăng ký tài khoản mới
```

### 2. `app/(auth)/login-phone.tsx`

**Thay đổi:**
- ✅ Import `useAuth` từ AuthContext
- ✅ Sử dụng `sendOTP()` từ AuthContext thay vì `zaloOTPAuth.sendOTP()`
- ✅ Truyền `sessionId` sang màn hình OTP verify

### 3. `app/(auth)/otp-verify.tsx`

**Thay đổi:**
- ✅ Import `useAuth` từ AuthContext
- ✅ Sử dụng `verifyOTP()` từ AuthContext thay vì gọi trực tiếp
- ✅ Sử dụng `sendOTP()` từ AuthContext cho chức năng gửi lại
- ✅ Token được lưu tự động trong AuthContext

---

## 🔄 Flow Đăng Nhập/Đăng Ký OTP

```
┌────────────────────────────────────────────────────────────────┐
│                    FLOW ĐĂNG NHẬP OTP                          │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  1. User nhập SĐT → login-phone.tsx                            │
│     │                                                          │
│     ▼                                                          │
│  2. Gọi useAuth().sendOTP(phone)                              │
│     │                                                          │
│     ▼                                                          │
│  3. AuthContext → POST /zalo/send-otp                         │
│     │                                                          │
│     ▼                                                          │
│  4. Backend → GetOTP API (api.otp.dev)                        │
│     │                                                          │
│     ▼                                                          │
│  5. Trả về sessionId → Navigate to otp-verify.tsx             │
│     │                                                          │
│     ▼                                                          │
│  6. User nhập 6 số OTP                                         │
│     │                                                          │
│     ▼                                                          │
│  7. Gọi useAuth().verifyOTP(phone, otp, sessionId)            │
│     │                                                          │
│     ▼                                                          │
│  8. AuthContext → POST /zalo/verify-otp                       │
│     │                                                          │
│     ▼                                                          │
│  9. Backend xác thực → Trả về tokens + user                   │
│     │                                                          │
│     ▼                                                          │
│  10. AuthContext:                                              │
│      - saveTokens() → SecureStore                             │
│      - setToken() → api.ts memory                             │
│      - setState() → isAuthenticated: true                     │
│      - setItem('userData') → AsyncStorage                     │
│     │                                                          │
│     ▼                                                          │
│  11. Navigate → /(tabs) hoặc complete-profile                 │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Lưu Trữ Token

### SecureStore (Token Service)
```typescript
// services/token.service.ts
await saveTokens({
  accessToken: response.accessToken,
  refreshToken: response.refreshToken,
  expiresAt: calculateExpiryTimestamp('7d'),
});
```

### AsyncStorage (User Data)
```typescript
await setItem('userData', JSON.stringify(user));
```

### Memory (API Service)
```typescript
setToken(response.accessToken);
setRefreshToken(response.refreshToken);
```

---

## 📞 API Format

### Send OTP Request
```json
POST /api/v1/zalo/send-otp
{
  "phone": "84912345678",
  "channel": "sms"
}
```

### Send OTP Response
```json
{
  "success": true,
  "message": "OTP đã được gửi",
  "sessionId": "c84491d0-9041-4fe4-856f-55257bb858cc",
  "expiresIn": 300
}
```

### Verify OTP Request
```json
POST /api/v1/zalo/verify-otp
{
  "phone": "84912345678",
  "otp": "123456",
  "sessionId": "c84491d0-9041-4fe4-856f-55257bb858cc"
}
```

### Verify OTP Response
```json
{
  "success": true,
  "message": "Xác thực thành công",
  "isNewUser": false,
  "user": {
    "id": "123",
    "name": "Nguyễn Văn A",
    "phone": "84912345678",
    "email": "phone_84912345678@baotienweb.cloud",
    "role": "CLIENT"
  },
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG..."
}
```

---

## 🧪 Test Checklist

### Gửi OTP
- [ ] Nhập SĐT format 0912345678
- [ ] Nhập SĐT format +84912345678
- [ ] Nhập SĐT format 84912345678
- [ ] Kiểm tra error khi SĐT không hợp lệ
- [ ] Kiểm tra cooldown sau khi gửi

### Xác thực OTP
- [ ] Nhập đúng 6 số OTP
- [ ] Nhập sai OTP → hiển thị lỗi
- [ ] Hết thời gian → gửi lại OTP
- [ ] Auto-submit khi nhập đủ 6 số

### Token Storage
- [ ] Token lưu vào SecureStore
- [ ] User data lưu vào AsyncStorage
- [ ] Token có trong memory api.ts
- [ ] isAuthenticated = true

### Navigation
- [ ] User mới → complete-profile
- [ ] User cũ → /(tabs)
- [ ] Sau đăng nhập → không quay lại auth

---

## 🔧 Cấu Hình Backend

**Server:** https://baotienweb.cloud  
**API Base:** /api/v1  

### Environment Variables (VPS)
```bash
GETOTP_API_KEY=your_api_key_here
GETOTP_TEMPLATE_ID=ea458d21-7337-452e-a0fa-7cc2554114f9
GETOTP_SENDER_NAME=OTP Dev
```

---

## 📝 Notes

1. **Format SĐT:** App tự động format sang dạng 84xxxxxxxxx
2. **Token Expiry:** 7 ngày (có thể thay đổi)
3. **OTP Expiry:** 5 phút (từ GetOTP API)
4. **Retry:** API có retry/backoff tự động trong apiFetch

---

## ✅ Kết Luận

Chức năng đăng ký/đăng nhập OTP đã được tích hợp hoàn chỉnh:

| Component | Status | Description |
|-----------|--------|-------------|
| AuthContext | ✅ | Thêm sendOTP, verifyOTP, signInWithPhone, registerWithPhone |
| login-phone.tsx | ✅ | Sử dụng useAuth().sendOTP |
| otp-verify.tsx | ✅ | Sử dụng useAuth().verifyOTP |
| Token Storage | ✅ | Tự động lưu vào SecureStore + AsyncStorage |
| Auth State | ✅ | Tự động cập nhật isAuthenticated |

**Bước tiếp theo:**
1. Test trên thiết bị thật với SĐT thật
2. Kiểm tra edge cases (network error, expired OTP, etc.)
3. Thêm analytics tracking cho OTP events
