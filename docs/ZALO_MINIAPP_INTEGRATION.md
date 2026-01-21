# Zalo Mini App Integration Guide

## Tích hợp đăng nhập/đăng ký qua Zalo

**Tài liệu tham khảo:** https://miniapp.zaloplatforms.com/documents/

---

## 📋 Tổng quan

Ứng dụng hỗ trợ 2 phương thức đăng nhập qua Zalo:

### 1. **Zalo Mini App SDK** (Khi chạy trong Zalo)

- Sử dụng trực tiếp SDK của Zalo Mini App
- Lấy thông tin user: ID, tên, avatar
- Lấy số điện thoại (cần xin quyền)

### 2. **OTP qua Zalo ZNS/SMS** (Khi chạy ngoài Zalo)

- Gửi mã OTP qua GetOTP service
- Hỗ trợ SMS, Viber, Voice
- Phù hợp cho web và native app

---

## 🔧 Cấu hình

### Environment Variables (.env)

```bash
# Zalo App (https://developers.zalo.me)
ZALO_APP_ID=1408601745775286980
ZALO_APP_SECRET=YOUR_SECRET_KEY
ZALO_OA_ACCESS_TOKEN=YOUR_OA_TOKEN

# Expo public
EXPO_PUBLIC_ZALO_APP_ID=1408601745775286980
```

### Đăng ký Zalo App

1. Truy cập [Zalo Developer Portal](https://developers.zalo.me/)
2. Tạo Zalo App mới
3. Vào **Cài đặt** → Kích hoạt ứng dụng
4. Vào **Quản lý quyền** → Xin quyền:
   - `scope.userInfo` - Thông tin user
   - `scope.userPhonenumber` - Số điện thoại

### Tạo Zalo Mini App

1. Truy cập [Mini App Management](https://mini.zalo.me/developers/)
2. Chọn Zalo App → Tạo Mini App
3. Lấy Mini App ID

---

## 📱 API Reference

### 1. getAccessToken

Lấy token xác thực người dùng.

```typescript
import { getAccessToken } from "zmp-sdk/apis";

const accessToken = await getAccessToken();
```

### 2. getUserInfo

Lấy thông tin người dùng.

```typescript
import { getUserInfo } from "zmp-sdk/apis";

const { userInfo } = await getUserInfo({
  autoRequestPermission: true, // Tự động xin quyền
  avatarType: "large", // small | normal | large
});

// userInfo = {
//   id: string,           // Unique ID theo Zalo App
//   name: string,         // Tên hiển thị
//   avatar: string,       // URL ảnh đại diện
//   followedOA?: boolean, // Đã follow OA chưa
//   idByOA?: string,      // ID theo Official Account
//   isSensitive?: boolean // Tài khoản nhạy cảm
// }
```

### 3. getPhoneNumber

Lấy số điện thoại người dùng.

```typescript
import { getPhoneNumber } from "zmp-sdk/apis";

// Bước 1: Lấy token từ client
const { token } = await getPhoneNumber();

// Bước 2: Gửi token lên server để verify
// Server gọi Zalo Graph API với secret_key
```

**Server-side verification:**

```bash
curl --location --request GET 'https://graph.zalo.me/v2.0/me/info' \
  --header 'access_token: <user_access_token>' \
  --header 'code: <phone_token>' \
  --header 'secret_key: <zalo_app_secret>'

# Response:
# {
#   "data": { "number": "849123456789" },
#   "error": 0,
#   "message": "Success"
# }
```

### 4. authorize

Xin cấp quyền từ người dùng.

```typescript
import { authorize } from "zmp-sdk/apis";

const result = await authorize({
  scopes: ["scope.userInfo", "scope.userPhonenumber"],
});

// result = {
//   'scope.userInfo': true,
//   'scope.userPhonenumber': true
// }
```

### 5. getSetting

Kiểm tra quyền đã được cấp.

```typescript
import { getSetting } from "zmp-sdk/apis";

const { authSetting } = await getSetting();
// authSetting = {
//   'scope.userInfo': true,
//   'scope.userPhonenumber': false
// }
```

---

## 🚀 Sử dụng trong React Native

### Service: zaloMiniAppAuthService

```typescript
import { zaloMiniAppAuth } from "@/services/zaloMiniAppAuthService";

// Đăng nhập
const result = await zaloMiniAppAuth.login({
  requirePhone: true,
  autoRequestPermission: true,
});

if (result.success) {
  // Lưu tokens
  await saveTokens(result.accessToken, result.refreshToken);

  // result.user = {
  //   id: 'zalo_user_id',
  //   name: 'Nguyễn Văn A',
  //   avatar: 'https://...',
  // }
  // result.phoneNumber = '+84912345678'
  // result.isNewUser = true/false
}
```

### Screen: zalo-login.tsx

```tsx
import { useRouter } from "expo-router";

// Navigate to Zalo login
router.push("/zalo-login");
```

---

## 🔄 Flow xác thực

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │     │   Backend   │     │  Zalo API   │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       │  1. authorize()   │                   │
       │──────────────────>│                   │
       │                   │                   │
       │  2. getAccessToken()                  │
       │──────────────────>│                   │
       │                   │                   │
       │  3. getUserInfo() │                   │
       │──────────────────>│                   │
       │                   │                   │
       │  4. getPhoneNumber()                  │
       │──────────────────>│                   │
       │     token         │                   │
       │<──────────────────│                   │
       │                   │                   │
       │  5. POST /auth/zalo/verify-phone      │
       │──────────────────>│                   │
       │                   │ GET /me/info      │
       │                   │──────────────────>│
       │                   │   phone_number    │
       │                   │<──────────────────│
       │   phone_number    │                   │
       │<──────────────────│                   │
       │                   │                   │
       │  6. POST /auth/zalo/login             │
       │──────────────────>│                   │
       │   tokens + user   │                   │
       │<──────────────────│                   │
```

---

## ⚠️ Lưu ý quan trọng

### 1. Quyền xin cấp

- Phải giải thích rõ ràng mục đích xin quyền
- Không xin quyền ngay khi mở app
- Chỉ xin quyền khi cần thiết (checkout, đặt hàng...)

### 2. Token bảo mật

- `secret_key` chỉ dùng ở server
- Không expose secret_key ở client
- Phone token chỉ valid 2 phút, dùng 1 lần

### 3. Error handling

```typescript
try {
  await authorize({ scopes: ["scope.userPhonenumber"] });
} catch (error) {
  if (error.code === -201) {
    // Người dùng từ chối
  } else if (error.code === -1401) {
    // Từ chối quyền cụ thể
  }
}
```

### 4. Testing

- Trong development, service sẽ dùng mock data
- Để test thật, deploy lên Zalo Mini App environment

---

## 📁 File Structure

```
services/
├── zaloMiniAppAuthService.ts  # Zalo Mini App SDK integration
├── zaloAuthService.ts         # Zalo OAuth (web/native)
└── zaloOTPAuthService.ts      # OTP via Zalo ZNS/SMS

app/
└── zalo-login.tsx             # Màn hình đăng nhập Zalo
```

---

## 🔗 Links

- [Zalo Mini App Docs](https://miniapp.zaloplatforms.com/documents/)
- [Zalo Developer Portal](https://developers.zalo.me/)
- [Mini App Management](https://mini.zalo.me/developers/)
- [API Reference](https://miniapp.zaloplatforms.com/documents/api/)
- [Error Codes](https://miniapp.zaloplatforms.com/documents/api/errorCode/)
