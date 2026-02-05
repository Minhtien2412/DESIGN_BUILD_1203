# AUTH SYSTEM REDESIGN - Tài liệu tổng hợp

## 📋 Tổng quan

Tài liệu này mô tả việc viết lại hệ thống authentication cho ứng dụng BaoTienWeb, loại bỏ các phương thức đăng ký/đăng nhập cũ bị lỗi và thay thế bằng hệ thống mới tích hợp với máy chủ.

**Backend:** https://baotienweb.cloud/api/v1  
**VPS:** root@103.200.20.100 (baotienweb-api)

---

## ✅ Những gì đã hoàn thành

### 1. Unified Auth Service (`services/auth/authService.ts`)

Service mới hợp nhất tất cả auth logic với các tính năng:

- ✅ **Email/Password Auth**: Login, Register với JWT
- ✅ **Phone/OTP Auth**: Gửi OTP, Xác thực OTP
- ✅ **Trusted Device**: Auto-login trong 30 ngày
- ✅ **Zalo Mini App**: Login với Zalo SDK
- ✅ **Password Reset**: Forgot password, Reset password
- ✅ **Token Management**: Auto refresh, persist tokens

### 2. New Auth Context (`context/AuthContextNew.tsx`)

Context mới gọn gàng hơn (~500 dòng thay vì 1000+ dòng):

```typescript
// Các method chính
signIn(email, password)           // Email login
signUp(email, password, ...)      // Email register
sendOTP(phone, channel)           // Gửi OTP
verifyOTP(phone, otp, sessionId)  // Xác thực OTP
checkTrustedDevice(phone)         // Kiểm tra device trust
autoLoginWithTrustedDevice(phone) // Auto-login không cần OTP
signInWithZalo(...)               // Zalo Mini App login
registerWithPhone(...)            // Đăng ký bằng SĐT
signOut()                         // Đăng xuất
refreshUser()                     // Refresh profile
```

### 3. New Login Screen (`app/(auth)/login-unified.tsx`)

Màn hình login mới với:

- ✅ Tab chuyển đổi Email / Số điện thoại
- ✅ OTP verification flow
- ✅ Trusted device detection (auto-login)
- ✅ Zalo login button (placeholder)
- ✅ Animation effects
- ✅ Error handling với shake effect

### 4. New Register Screen (`app/(auth)/register-unified.tsx`)

Màn hình đăng ký mới với:

- ✅ Tab chuyển đổi Email / Số điện thoại
- ✅ Role selector (CLIENT, CONTRACTOR, ARCHITECT, etc.)
- ✅ Location picker (GPS)
- ✅ OTP verification flow
- ✅ Form validation

---

## 🚨 CÁC ENDPOINT CẦN TRÊN BACKEND

### Backend hiện tại có:

| Endpoint                | Method | Status       |
| ----------------------- | ------ | ------------ |
| `/auth/login`           | POST   | ✅ Hoạt động |
| `/auth/register`        | POST   | ✅ Hoạt động |
| `/auth/refresh`         | POST   | ✅ Hoạt động |
| `/auth/me`              | GET    | ✅ Hoạt động |
| `/auth/forgot-password` | POST   | ✅ Hoạt động |
| `/auth/reset-password`  | POST   | ✅ Hoạt động |
| `/zalo/send-otp`        | POST   | ✅ Hoạt động |
| `/zalo/verify-otp`      | POST   | ✅ Hoạt động |
| `/zalo/register-phone`  | POST   | ✅ Hoạt động |

### Backend cần thêm (tuỳ chọn - có fallback):

| Endpoint               | Method | Mục đích               | Fallback               |
| ---------------------- | ------ | ---------------------- | ---------------------- |
| `/auth/otp/send`       | POST   | Unified OTP endpoint   | `/zalo/send-otp`       |
| `/auth/otp/verify`     | POST   | Unified OTP endpoint   | `/zalo/verify-otp`     |
| `/auth/register-phone` | POST   | Unified phone register | `/zalo/register-phone` |
| `/auth/zalo-miniapp`   | POST   | Zalo Mini App login    | -                      |

### Endpoint Zalo Mini App mới (cần implement):

```typescript
// POST /auth/zalo-miniapp
// Request Body:
{
  zaloUserId: string;       // Zalo user ID từ SDK
  zaloAccessToken: string;  // Access token từ Zalo
  name: string;             // Tên người dùng
  avatar?: string;          // Avatar URL
  phone?: string;           // Số điện thoại (nếu có)
}

// Response:
{
  success: boolean;
  accessToken: string;      // JWT access token
  refreshToken: string;     // JWT refresh token
  user: {
    id: number;
    email: string;
    name: string;
    phone?: string;
    role: string;
  };
  isNewUser: boolean;       // True nếu tạo user mới
}
```

---

## 📂 CÁC FILE CÓ THỂ XOÁ (Trùng lặp)

Các file màn hình auth cũ có thể xoá sau khi chuyển sang hệ thống mới:

```
app/(auth)/
├── login.tsx           → Redirect, có thể xoá
├── login-enhanced.tsx  → Thay bằng login-unified.tsx
├── login-phone.tsx     → Tích hợp trong login-unified.tsx
├── login-shopee.tsx    → Không dùng nữa
├── login-zalo.tsx      → Tích hợp trong login-unified.tsx
├── register-enhanced.tsx → Thay bằng register-unified.tsx
├── register-shopee.tsx → Không dùng nữa
```

**Giữ lại:**

- `login-unified.tsx` (mới)
- `register-unified.tsx` (mới)
- `login-perfex.tsx` (Perfex CRM)
- `otp-verify.tsx` (có thể dùng)
- `forgot-password.tsx`
- `reset-password.tsx`
- `complete-profile.tsx`
- `_layout.tsx`

---

## 🔄 CÁCH CHUYỂN ĐỔI

### Bước 1: Cập nhật imports

Trong `app/_layout.tsx`, đổi:

```typescript
// Cũ
import { AuthProvider } from "@/context/AuthContext";

// Mới
import { AuthProvider } from "@/context/AuthContextNew";
```

### Bước 2: Cập nhật login.tsx

```typescript
// app/(auth)/login.tsx
import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function LoginScreen() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/(auth)/login-unified");
  }, []);

  return null;
}
```

### Bước 3: Cập nhật register.tsx

```typescript
// app/(auth)/register.tsx
import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function RegisterScreen() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/(auth)/register-unified");
  }, []);

  return null;
}
```

---

## 🛠 BACKEND IMPLEMENTATION GUIDE

### 1. Zalo Mini App Endpoint (NestJS/Fastify)

```typescript
// auth.controller.ts
@Post('zalo-miniapp')
async loginWithZaloMiniApp(@Body() dto: ZaloMiniAppLoginDto) {
  // 1. Verify Zalo access token (call Zalo API)
  const zaloUserInfo = await this.zaloService.getUserInfo(dto.zaloAccessToken);

  if (!zaloUserInfo || zaloUserInfo.id !== dto.zaloUserId) {
    throw new UnauthorizedException('Invalid Zalo credentials');
  }

  // 2. Find or create user
  let user = await this.userService.findByZaloId(dto.zaloUserId);
  let isNewUser = false;

  if (!user) {
    isNewUser = true;
    user = await this.userService.create({
      email: `zalo_${dto.zaloUserId}@baotienweb.cloud`,
      name: dto.name,
      avatar: dto.avatar,
      phone: dto.phone,
      zaloId: dto.zaloUserId,
      role: 'CLIENT',
    });
  }

  // 3. Generate JWT tokens
  const tokens = await this.authService.generateTokens(user);

  return {
    success: true,
    ...tokens,
    user: this.mapToResponse(user),
    isNewUser,
  };
}
```

### 2. Database Schema Update (Prisma)

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String?  // Optional for social login
  name      String
  phone     String?
  avatar    String?
  role      Role     @default(CLIENT)
  zaloId    String?  @unique  // ← THÊM MỚI
  googleId  String?  @unique
  facebookId String? @unique
  // ...
}
```

---

## 🧪 TESTING

### Test Cases

1. **Email Login**
   - Login với email/password đúng → Success
   - Login với password sai → Error message
   - Login với email không tồn tại → Error message

2. **OTP Login**
   - Gửi OTP → Nhận mã thành công
   - Nhập đúng OTP → Login thành công
   - Nhập sai OTP → Error message
   - Resend OTP → Gửi lại thành công

3. **Trusted Device**
   - Đăng nhập lần đầu → Cần OTP
   - Đăng nhập lần 2 trên cùng device → Auto-login
   - Sau 30 ngày → Cần OTP lại

4. **Register**
   - Đăng ký với email mới → Success
   - Đăng ký với email đã tồn tại → Error
   - Đăng ký với SĐT + OTP → Success

---

## 📝 NOTES

### Những gì đã xoá/thay thế:

1. ❌ `signInWithGoogle()` - Throw error, không dùng
2. ❌ `signInWithGoogleCode()` - Không implement
3. ❌ `signInWithGoogleToken()` - Không implement
4. ❌ `signInWithGoogleAccessToken()` - Không implement
5. ❌ `signInWithFacebook()` - Throw error, không dùng
6. ❌ `signInWithPhone()` - Thay bằng verifyOTP

### Những gì đã giữ lại:

1. ✅ `signIn(email, password)` - Email/password login
2. ✅ `signUp(...)` - Email registration
3. ✅ `sendOTP()` - Gửi OTP qua Zalo
4. ✅ `verifyOTP()` - Xác thực OTP
5. ✅ `registerWithPhone()` - Đăng ký bằng SĐT
6. ✅ Trusted device system - Auto-login 30 ngày

### Thêm mới:

1. ✅ `signInWithZalo()` - Zalo Mini App SDK login
2. ✅ Unified authService singleton
3. ✅ Fallback endpoints (auth → zalo)

---

## 🚀 NEXT STEPS

1. [ ] Test login/register flows trên app
2. [ ] Implement `/auth/zalo-miniapp` endpoint trên backend
3. [ ] Xoá các file auth screens cũ không dùng
4. [ ] Update `app/_layout.tsx` dùng AuthContextNew
5. [ ] Test Trusted Device flow
6. [ ] Integrate Zalo Mini App SDK (production)

---

**Cập nhật lần cuối:** ${new Date().toISOString()}
