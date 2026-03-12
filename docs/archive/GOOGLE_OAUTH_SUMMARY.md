# ✅ GOOGLE OAUTH - HOÀN THÀNH

## 🎯 VẤN ĐỀ ĐÃ FIX

**Lỗi cũ:** Bạn đang dùng `@react-oauth/google` - package cho React **WEB** không hoạt động với React Native.

**Giải pháp:** Tôi đã tạo lại hoàn toàn implementation sử dụng `expo-auth-session` (đúng cho React Native).

## 📦 FILES MỚI ĐÃ TẠO

| File | Mô tả |
|------|-------|
| `hooks/useGoogleOAuth.native.ts` | Hook Google OAuth cho React Native (mới 100%) |
| `docs/GOOGLE_OAUTH_SETUP_REACT_NATIVE.md` | Hướng dẫn chi tiết từng bước |
| `scripts/get-sha1.ps1` | Script PowerShell lấy SHA-1 fingerprint |
| `GOOGLE_OAUTH_TODO.md` | Checklist những việc cần làm |

## 📝 FILES ĐÃ CẬP NHẬT

- ✅ `config/env.ts` - Thêm support 3 Google Client IDs
- ✅ `app.config.ts` - Pass Client IDs vào app
- ✅ `.env` - Thêm variables mới với hướng dẫn
- ✅ `app/(auth)/login.tsx` - Dùng hook mới
- ✅ `app/(auth)/register.tsx` - Dùng hook mới

## 🚀 BƯỚC TIẾP THEO (QUAN TRỌNG)

### 1. Lấy SHA-1 Certificate Fingerprint

```powershell
.\scripts\get-sha1.ps1
```

### 2. Tạo 3 OAuth Client IDs

Vào: https://console.cloud.google.com/apis/credentials

Tạo 3 Client IDs:
- **Web**: Cho expo-auth-session proxy
- **Android**: Package name: `com.adminmarketingnx.APP_DESIGN_BUILD` + SHA-1
- **iOS**: Bundle ID: `com.adminmarketingnx.APP_DESIGN_BUILD`

### 3. Cập nhật `.env`

```bash
EXPO_PUBLIC_GOOGLE_CLIENT_ID=xxx-xxxxx.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=xxx-xxxxx.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=yyy-yyyyy.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=zzz-zzzzz.apps.googleusercontent.com
```

### 4. Setup OAuth Consent Screen

- External
- Thêm scopes: profile, email, openid
- Thêm test users (email của bạn)

### 5. Build Development Build

```bash
# Expo Go KHÔNG hỗ trợ Google OAuth đầy đủ
# Phải build development build

npm install -g eas-cli
eas login
eas build --profile development --platform android
```

### 6. Test

- Install APK từ EAS Build
- Run: `npx expo start --dev-client`
- Test Google Sign-in button

## 🎓 CẤU TRÚC CODE

### Hook Usage

```tsx
import { useGoogleOAuth } from '@/hooks/useGoogleOAuth.native';

// Authorization Code Flow (RECOMMENDED)
const { signIn, loading, isReady } = useGoogleOAuth({
  flow: 'auth-code',
  onSuccess: async ({ code }) => {
    // Send code to backend
    await fetch('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ code })
    });
  },
  onError: (error) => {
    console.error('OAuth error:', error);
  }
});

<Button onPress={signIn} disabled={!isReady || loading}>
  {loading ? 'Đang xử lý...' : 'Đăng nhập Google'}
</Button>
```

### Two Flows Supported

1. **Authorization Code Flow** (Recommended)
   - Returns: `code`
   - Backend exchanges code for tokens
   - More secure, có refresh token
   
2. **Implicit Flow** (Alternative)
   - Returns: `accessToken`, `idToken`
   - Client-side only
   - Faster but less secure

## 📊 BACKEND REQUIREMENTS

Backend cần endpoints:

### Option 1: Authorization Code Flow
```
POST /api/auth/google
Body: { code: "auth_code_here" }

Backend làm:
1. Exchange code với Google: https://oauth2.googleapis.com/token
2. Get: access_token, refresh_token, id_token
3. Verify id_token
4. Create/login user
5. Return app token
```

### Option 2: Implicit Flow
```
POST /api/auth/google
Body: { accessToken: "token_here" }

Backend làm:
1. Verify token với Google
2. Get user info
3. Create/login user
4. Return app token
```

## ⚠️ LƯU Ý QUAN TRỌNG

1. **Expo Go không hỗ trợ:** Phải dùng development build
2. **Cần 3 Client IDs:** Web, Android, iOS riêng biệt
3. **SHA-1 fingerprint:** Bắt buộc cho Android
4. **OAuth Consent Screen:** Phải setup và thêm test users
5. **Redirect URI:** Tự động bởi expo-auth-session

## 🐛 COMMON ERRORS

| Lỗi | Nguyên nhân | Giải pháp |
|-----|-------------|-----------|
| "Google Sign-in không khả dụng" | Đang dùng Expo Go | Build development build |
| "Invalid client" | Client ID sai | Kiểm tra .env |
| "Redirect URI mismatch" | Chưa thêm URI | Thêm vào Google Console |
| "Access blocked" | Consent screen chưa publish | Publish hoặc thêm test users |

## 📚 TÀI LIỆU

- **Chi tiết:** `docs/GOOGLE_OAUTH_SETUP_REACT_NATIVE.md`
- **Checklist:** `GOOGLE_OAUTH_TODO.md`
- **Expo Docs:** https://docs.expo.dev/guides/authentication/#google

## ✅ CHECKLIST

- [x] Tạo implementation mới (expo-auth-session)
- [x] Cập nhật config và env
- [x] Tạo scripts và docs
- [ ] **Bạn làm:** Run get-sha1.ps1
- [ ] **Bạn làm:** Tạo 3 OAuth Client IDs
- [ ] **Bạn làm:** Cập nhật .env
- [ ] **Bạn làm:** Setup OAuth Consent
- [ ] **Bạn làm:** Build development build
- [ ] **Bạn làm:** Test Google Sign-in

---

**Ready to go! 🚀** Làm theo checklist bên trên và bạn sẽ có Google Sign-in hoạt động hoàn hảo.
