# 🚀 HƯỚNG DẪN HOÀN THIỆN GOOGLE OAUTH

## ❌ VẤN ĐỀ ĐÃ PHÁT HIỆN

Bạn đang cố dùng `@react-oauth/google` - package này **KHÔNG HOẠT ĐỘNG** với React Native!

`@react-oauth/google` chỉ dành cho **React Web** (dùng Google Identity Services SDK trên browser).

## ✅ GIẢI PHÁP ĐÚNG

Trong React Native/Expo, phải dùng: **`expo-auth-session`**

Tôi đã tạo implementation mới hoàn toàn đúng tại:
- `hooks/useGoogleOAuth.native.ts` - Hook chính
- `docs/GOOGLE_OAUTH_SETUP_REACT_NATIVE.md` - Hướng dẫn chi tiết
- `scripts/get-sha1.ps1` - Script lấy SHA-1 fingerprint

## 📋 CÁC BƯỚC CẦN LÀM NGAY

### Bước 1: Lấy SHA-1 Fingerprint (Cho Android)

Chạy script này:

```powershell
.\scripts\get-sha1.ps1
```

Script sẽ:
- Tự động lấy SHA-1 fingerprint
- Copy vào clipboard
- Hiển thị hướng dẫn tiếp theo

### Bước 2: Tạo OAuth Credentials trên Google Cloud Console

1. Vào: https://console.cloud.google.com/apis/credentials

2. Tạo **3 OAuth Client IDs**:

#### A. Web Client ID
- Type: **Web application**
- Authorized redirect URIs:
  ```
  https://auth.expo.io/@your-username/your-app-slug
  ```
- Copy **Client ID** → Paste vào `.env`

#### B. Android Client ID
- Type: **Android**
- Package name: `com.adminmarketingnx.APP_DESIGN_BUILD`
- SHA-1: Paste SHA-1 từ script `get-sha1.ps1`
- Copy **Client ID** → Paste vào `.env`

#### C. iOS Client ID
- Type: **iOS**
- Bundle ID: `com.adminmarketingnx.APP_DESIGN_BUILD`
- Copy **Client ID** → Paste vào `.env`

### Bước 3: Cập nhật file `.env`

```bash
# Web Client ID (Bắt buộc)
EXPO_PUBLIC_GOOGLE_CLIENT_ID=123456789-xxxxx.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=123456789-xxxxx.apps.googleusercontent.com

# Android Client ID (Bắt buộc)
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=123456789-yyyyy.apps.googleusercontent.com

# iOS Client ID (Bắt buộc)
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=123456789-zzzzz.apps.googleusercontent.com
```

### Bước 4: Cấu hình OAuth Consent Screen

1. Vào **OAuth consent screen**
2. Chọn **External**
3. Điền thông tin app
4. Thêm scopes:
   - `userinfo.email`
   - `userinfo.profile`
   - `openid`
5. **Testing:** Thêm email test của bạn
6. Click **SAVE**

### Bước 5: Restart Metro

```bash
npx expo start -c
```

### Bước 6: Build Development Build (BẮT BUỘC)

⚠️ **QUAN TRỌNG:** Google OAuth **KHÔNG HOẠT ĐỘNG** trong Expo Go!

Bạn phải tạo development build:

```bash
# Cài EAS CLI
npm install -g eas-cli

# Login
eas login

# Build cho Android
eas build --profile development --platform android

# Sau khi build xong, download APK và cài lên thiết bị/emulator

# Run app
npx expo start --dev-client
```

## 🎯 FLOW HOẠT ĐỘNG

### Option 1: Authorization Code Flow (RECOMMENDED)

```tsx
// Login screen sử dụng:
const googleAuth = useGoogleOAuth({
  flow: 'auth-code',
  onSuccess: async ({ code }) => {
    // Gửi code về backend
    await signInWithGoogleCode(code);
  }
});

<Button onPress={googleAuth.signIn}>
  Đăng nhập với Google
</Button>
```

**Backend nhận:**
```javascript
POST /api/auth/google
{
  "code": "authorization_code_here"
}

// Backend exchange code with Google:
// https://oauth2.googleapis.com/token
// Get: access_token, refresh_token, id_token
```

### Option 2: Implicit Flow (Client-only)

```tsx
const googleAuth = useGoogleOAuth({
  flow: 'implicit',
  onSuccess: async ({ accessToken }) => {
    // Dùng access token trực tiếp
    await signInWithGoogleAccessToken(accessToken);
  }
});
```

## 📊 TÌNH TRẠNG HIỆN TẠI

### ✅ Đã hoàn thành:
- [x] Tạo hook `useGoogleOAuth.native.ts` cho React Native
- [x] Cập nhật `config/env.ts` hỗ trợ 3 Client IDs
- [x] Cập nhật `app.config.ts` pass Client IDs vào app
- [x] Cập nhật `login.tsx` và `register.tsx` dùng hook mới
- [x] Tạo script `get-sha1.ps1` lấy fingerprint
- [x] Tạo hướng dẫn chi tiết `GOOGLE_OAUTH_SETUP_REACT_NATIVE.md`
- [x] Guard against Expo Go crashes (fallback với Alert)

### ⏳ Cần bạn làm:
- [ ] Chạy script `get-sha1.ps1` lấy SHA-1
- [ ] Tạo 3 OAuth Client IDs trên Google Cloud Console
- [ ] Cập nhật `.env` với Client IDs
- [ ] Cấu hình OAuth Consent Screen
- [ ] Build development build (`eas build`)
- [ ] Test Google Sign-in trên dev build

## 🐛 TROUBLESHOOTING

### Lỗi: "Google Sign-in không khả dụng"
- ✅ **Nguyên nhân:** Đang chạy trong Expo Go
- ✅ **Giải pháp:** Tạo development build

### Lỗi: "Invalid client"
- ✅ **Nguyên nhân:** Client ID sai hoặc chưa cấu hình
- ✅ **Giải pháp:** Kiểm tra lại `.env` và Google Console

### Lỗi: "Redirect URI mismatch"
- ✅ **Nguyên nhân:** Chưa thêm redirect URI vào Google Console
- ✅ **Giải pháp:** Thêm `https://auth.expo.io/@username/slug`

### Lỗi: "Access blocked"
- ✅ **Nguyên nhân:** OAuth Consent Screen chưa publish hoặc thiếu test users
- ✅ **Giải pháp:** Publish hoặc thêm email test

## 📚 TÀI LIỆU THAM KHẢO

1. **Chi tiết setup:** `docs/GOOGLE_OAUTH_SETUP_REACT_NATIVE.md`
2. **Expo Auth Session:** https://docs.expo.dev/guides/authentication/#google
3. **Google OAuth Guide:** https://developers.google.com/identity/protocols/oauth2/native-app
4. **Development Build:** https://docs.expo.dev/develop/development-builds/introduction/

## 🎉 SAU KHI HOÀN THÀNH

App sẽ có:
- ✅ Google Sign-in hoạt động trên Android và iOS
- ✅ Authorization Code Flow (secure, có refresh token)
- ✅ Implicit Flow (client-only, nhanh hơn)
- ✅ Error handling đầy đủ
- ✅ Loading states
- ✅ User-friendly messages

---

## ⚡ QUICK START

```bash
# 1. Lấy SHA-1
.\scripts\get-sha1.ps1

# 2. Setup Google Console (làm theo hướng dẫn script in ra)

# 3. Cập nhật .env với 3 Client IDs

# 4. Restart Metro
npx expo start -c

# 5. Build development build
eas build --profile development --platform android

# 6. Install APK và test!
```

Nếu cần hỗ trợ thêm, hãy cho tôi biết bước nào bạn đang gặp khó khăn! 🚀
