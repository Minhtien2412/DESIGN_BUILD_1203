# 📱 Hướng Dẫn Đăng Nhập Google Chi Tiết

> **Cập nhật:** 13/01/2026  
> **App:** Expo Router + React Native

---

## 📋 Tổng Quan

App này sử dụng **2 phương thức** Google Sign-In khác nhau:

| Platform | Thư viện | Client ID Type |
|----------|----------|----------------|
| **Mobile (Expo Go)** | `expo-auth-session` | Web Application |
| **Web** | Google Identity Services | Web Application |
| **Android APK** | `expo-auth-session` | Web + Android |

---

## 🔧 Bước 1: Tạo Project trên Google Cloud Console

### 1.1 Truy cập Google Cloud Console
```
https://console.cloud.google.com
```

### 1.2 Tạo Project mới (hoặc chọn existing)
1. Click dropdown "Select a project" ở header
2. Click "NEW PROJECT"
3. Đặt tên: `APP_DESIGN_BUILD` (hoặc tên bạn muốn)
4. Click "CREATE"

---

## 🔑 Bước 2: Tạo OAuth 2.0 Credentials

### 2.1 Vào trang Credentials
```
https://console.cloud.google.com/apis/credentials
```

### 2.2 Tạo OAuth Client ID

#### 📱 **Client 1: Web Application** (BẮT BUỘC)
> Dùng cho cả Mobile (Expo Go) và Web

1. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
2. Chọn Application type: **Web application**
3. Name: `APP_DESIGN_BUILD_WEB`
4. **Authorized JavaScript origins:**
   ```
   http://localhost:8081
   http://localhost:19006
   https://baotienweb.cloud
   https://auth.expo.io
   ```
5. **Authorized redirect URIs:**
   ```
   https://auth.expo.io/@adminmarketingnx/APP_DESIGN_BUILD
   http://localhost:8081
   http://localhost:19006
   https://baotienweb.cloud/auth/google/callback
   ```
6. Click **"CREATE"**
7. **Copy Client ID** → `EXPO_PUBLIC_GOOGLE_CLIENT_ID` trong `.env`

#### 📱 **Client 2: Android** (Cho APK)
> Chỉ cần khi build APK

1. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
2. Chọn Application type: **Android**
3. Name: `APP_DESIGN_BUILD_ANDROID`
4. Package name: `com.adminmarketingnx.APP_DESIGN_BUILD`
5. SHA-1 certificate fingerprint:
   ```bash
   # Development (debug keystore)
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   
   # Production (release keystore)
   keytool -list -v -keystore your-release-key.keystore -alias your-alias
   ```
6. Click **"CREATE"**
7. **Copy Client ID** → `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`

#### 🍎 **Client 3: iOS** (Cho iOS App)
1. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
2. Chọn Application type: **iOS**
3. Name: `APP_DESIGN_BUILD_IOS`
4. Bundle ID: `com.adminmarketingnx.APP_DESIGN_BUILD`
5. Click **"CREATE"**
6. **Copy Client ID** → `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`

---

## ⚙️ Bước 3: Cấu hình OAuth Consent Screen

### 3.1 Vào OAuth consent screen
```
https://console.cloud.google.com/apis/credentials/consent
```

### 3.2 Điền thông tin
1. **User Type:** External
2. Click "CREATE"
3. **App name:** APP DESIGN BUILD
4. **User support email:** your-email@gmail.com
5. **App logo:** (tùy chọn)
6. **App domain:** baotienweb.cloud
7. **Authorized domains:** baotienweb.cloud
8. **Developer contact:** your-email@gmail.com
9. Click "SAVE AND CONTINUE"

### 3.3 Scopes
1. Click "ADD OR REMOVE SCOPES"
2. Chọn:
   - `.../auth/userinfo.email` - Xem email
   - `.../auth/userinfo.profile` - Xem hồ sơ cơ bản
   - `openid` - Xác thực OpenID
3. Click "UPDATE" → "SAVE AND CONTINUE"

### 3.4 Test Users (Development)
- Thêm email test: your-email@gmail.com
- Click "SAVE AND CONTINUE"

---

## 📝 Bước 4: Cấu hình .env

```env
# ============================================
# Google OAuth Configuration
# ============================================

# Web Client ID (BẮT BUỘC - dùng cho cả Mobile và Web)
EXPO_PUBLIC_GOOGLE_CLIENT_ID=702679918765-xxxxxxxxxxxxx.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=702679918765-xxxxxxxxxxxxx.apps.googleusercontent.com

# Android Client ID (cho APK)
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=381977107167-xxxxxxxxxxxxx.apps.googleusercontent.com

# iOS Client ID (cho iOS App)  
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com
```

---

## 🔍 Bước 5: Kiểm tra cấu hình hiện tại

### File cấu hình trong App:

| File | Mục đích |
|------|----------|
| `hooks/useGoogleAuth.ts` | Hook chính cho mobile (Expo Go) |
| `hooks/useGoogleOAuth.native.ts` | Hook cho native builds |
| `hooks/useGoogleOAuth.web.ts` | Hook cho web platform |
| `config/env.ts` | Đọc biến môi trường |
| `.env` | Lưu Client IDs |

### Redirect URI quan trọng:
```
# Expo Go (Development)
https://auth.expo.io/@adminmarketingnx/APP_DESIGN_BUILD

# Development Server
exp://192.168.x.x:8081

# Web
http://localhost:8081
http://localhost:19006
```

---

## 🧪 Bước 6: Test Đăng Nhập

### 6.1 Mobile (Expo Go)
```bash
npx expo start
```
1. Mở app trên Expo Go
2. Vào trang Login
3. Nhấn "Đăng nhập bằng Google"
4. Chọn tài khoản Google
5. Xác nhận đăng nhập thành công

### 6.2 Web
```bash
npx expo start --web
```
1. Mở http://localhost:8081
2. Vào trang Login
3. Nhấn "Đăng nhập bằng Google"

---

## ❌ Xử lý lỗi thường gặp

### Lỗi 400: redirect_uri_mismatch
**Nguyên nhân:** Redirect URI trong Google Console không khớp
**Giải pháp:**
1. Vào Google Console → Credentials
2. Edit Web Client ID
3. Thêm redirect URI:
   ```
   https://auth.expo.io/@adminmarketingnx/APP_DESIGN_BUILD
   ```

### Lỗi 401: invalid_client
**Nguyên nhân:** Client ID sai hoặc bị xóa
**Giải pháp:**
1. Kiểm tra lại Client ID trong `.env`
2. Tạo mới nếu cần

### Lỗi: Google Sign-In cancelled
**Nguyên nhân:** User hủy đăng nhập
**Giải pháp:** Hiển thị thông báo thân thiện, cho phép thử lại

### Lỗi: Cannot get user info
**Nguyên nhân:** Scopes chưa được approve
**Giải pháp:**
1. Vào OAuth consent screen
2. Kiểm tra scopes: email, profile, openid
3. Publish app nếu cần

---

## 🔐 Best Practices

### Security
- ✅ Không commit `.env` lên Git
- ✅ Dùng `.env.example` để document
- ✅ Restrict API key trong Google Console
- ✅ Sử dụng HTTPS cho production

### UX
- ✅ Hiển thị loading khi đang xử lý
- ✅ Thông báo lỗi rõ ràng
- ✅ Cho phép retry khi fail
- ✅ Remember login state

---

## 📚 Tài liệu tham khảo

- [Expo Auth Session](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Google Sign-In for Web](https://developers.google.com/identity/gsi/web)
- [Google Cloud Console](https://console.cloud.google.com)

---

## 📱 Client IDs hiện tại trong App

```env
# Web Client (cho Expo Go + Web)
EXPO_PUBLIC_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com

# Android Client
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com
```

---

*Tài liệu này được tạo tự động bởi AI Assistant - 13/01/2026*
