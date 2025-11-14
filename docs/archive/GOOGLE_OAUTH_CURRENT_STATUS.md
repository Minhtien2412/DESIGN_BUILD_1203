# ✅ GOOGLE OAUTH - TRẠNG THÁI HIỆN TẠI

## 📊 ĐÃ HOÀN THÀNH

✅ **Code Implementation**
- Hook `useGoogleOAuth.native.ts` - Hoàn chỉnh
- Config `env.ts` - Hỗ trợ 3 Client IDs
- Config `app.config.ts` - Pass Client IDs vào app
- Login & Register screens - Đã update
- Error handling - Đầy đủ

✅ **Documentation**
- `GOOGLE_OAUTH_QUICK_START.md` - Hướng dẫn chi tiết
- `GOOGLE_OAUTH_SETUP_REACT_NATIVE.md` - Hướng dẫn kỹ thuật
- `GOOGLE_OAUTH_TODO.md` - Checklist

✅ **Tools**
- `check-google-oauth.ps1` - Script kiểm tra config
- `get-sha1.ps1` - Script lấy SHA-1 (cần Java JDK)

✅ **Environment**
- Web Client ID: ✅ Đã có (`702527545429-...`)
- Expo username: `adminmarketingnx`
- Redirect URI: `https://auth.expo.io/@adminmarketingnx/APP_DESIGN_BUILD`
- Required packages: ✅ Installed

---

## ⏳ CẦN LÀM NGAY (BẠN)

### 🎯 BƯỚC 1: TẠO ANDROID CLIENT ID (5 phút)

1. **Vào Google Cloud Console:**
   ```
   https://console.cloud.google.com/apis/credentials
   ```

2. **Click "+ CREATE CREDENTIALS" → "OAuth client ID"**

3. **Chọn "Android"**

4. **Điền thông tin:**
   ```
   Name: Android App
   Package name: com.adminmarketingnx.APP_DESIGN_BUILD
   SHA-1 certificate fingerprint: 9E:8A:6B:92:12:6E:8D:C3:A2:57:73:B7:D8:49:9C:3A:2F:10:5B:1D
   ```
   > SHA-1 này là của Expo debug keystore (dùng cho development)

5. **Click "CREATE"**

6. **Copy Client ID** và paste vào `.env`:
   ```bash
   EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=paste-here
   ```

---

### 🎯 BƯỚC 2: TẠO IOS CLIENT ID (3 phút) - TÙY CHỌN

> Bỏ qua nếu chỉ test trên Android

1. **Vào Google Cloud Console** (cùng link trên)

2. **Click "+ CREATE CREDENTIALS" → "OAuth client ID"**

3. **Chọn "iOS"**

4. **Điền thông tin:**
   ```
   Name: iOS App
   Bundle ID: com.adminmarketingnx.APP_DESIGN_BUILD
   ```

5. **Click "CREATE"**

6. **Copy Client ID** và paste vào `.env`:
   ```bash
   EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=paste-here
   ```

---

### 🎯 BƯỚC 3: SETUP OAUTH CONSENT SCREEN (5 phút)

**Nếu chưa có OAuth Consent Screen:**

1. **Vào:**
   ```
   https://console.cloud.google.com/apis/credentials/consent
   ```

2. **Chọn "External"** → Click "CREATE"

3. **App information:**
   ```
   App name: APP_DESIGN_BUILD
   User support email: <your-email>
   Developer contact: <your-email>
   ```

4. **Click "SAVE AND CONTINUE"**

5. **Scopes:** Click "ADD OR REMOVE SCOPES"
   - ✅ Check: `.../auth/userinfo.email`
   - ✅ Check: `.../auth/userinfo.profile`
   - ✅ Check: `openid`
   - Click "UPDATE"

6. **Click "SAVE AND CONTINUE"**

7. **Test users:** Click "+ ADD USERS"
   - Nhập email của bạn (email dùng để test)
   - Click "SAVE"

8. **Click "SAVE AND CONTINUE"** → "BACK TO DASHBOARD"

---

### 🎯 BƯỚC 4: CẬP NHẬT WEB CLIENT ID (2 phút)

**Kiểm tra Web Client ID đã có redirect URI chưa:**

1. **Vào Google Cloud Console** → **Credentials**

2. **Click vào Web Client ID** (`702527545429-...`)

3. **Kiểm tra "Authorized redirect URIs":**
   - Phải có: `https://auth.expo.io/@adminmarketingnx/APP_DESIGN_BUILD`
   
   **Nếu chưa có:**
   - Click "ADD URI"
   - Paste: `https://auth.expo.io/@adminmarketingnx/APP_DESIGN_BUILD`
   - Click "SAVE"

---

### 🎯 BƯỚC 5: RESTART METRO (30 giây)

```powershell
# Stop Metro hiện tại (Ctrl+C)

# Clear cache và restart
npx expo start -c
```

---

### 🎯 BƯỚC 6: BUILD & TEST (15-20 phút)

#### Option A: Build với EAS (Recommended)

```powershell
# Cài EAS CLI (nếu chưa có)
npm install -g eas-cli

# Login
eas login

# Cấu hình (nếu chưa có)
eas build:configure

# Build cho Android
eas build --profile development --platform android

# Đợi build xong (~15-20 phút)
# EAS sẽ gửi link download APK
# Download và cài APK lên device/emulator

# Run app
npx expo start --dev-client
```

#### Option B: Build local (Nhanh hơn - Nếu có Android Studio)

```powershell
# Build và run local
npx expo run:android

# App sẽ tự động build và mở
```

---

## 🧪 CÁCH TEST

1. **Mở app** (development build, không phải Expo Go)

2. **Vào màn hình Login**

3. **Click button "Đăng nhập với Google"**

4. **Chọn Google account** (phải là account đã add vào Test Users)

5. **Chấp nhận permissions**

6. **Xem kết quả:**
   - ✅ Thành công: Navigate về màn hình chính
   - ❌ Lỗi: Check console logs để debug

---

## 🐛 TROUBLESHOOTING NHANH

### Lỗi: "Google Sign-in không khả dụng"
```
✅ Fix: Đang chạy Expo Go → Build development build
```

### Lỗi: "Invalid client"
```
✅ Fix: 
1. Check .env có đúng Client ID không
2. Restart Metro: npx expo start -c
```

### Lỗi: "Redirect URI mismatch"
```
✅ Fix:
1. Check Web Client ID có URI: 
   https://auth.expo.io/@adminmarketingnx/APP_DESIGN_BUILD
2. Save lại trong Google Console
```

### Lỗi: "Access blocked: This app's request is invalid"
```
✅ Fix:
1. Vào OAuth Consent Screen
2. Thêm email của bạn vào Test Users
3. Retry
```

---

## 📋 CHECKLIST CUỐI CÙNG

- [ ] Tạo Android Client ID
- [ ] Tạo iOS Client ID (tùy chọn)
- [ ] Setup OAuth Consent Screen
- [ ] Thêm Test Users
- [ ] Kiểm tra Web Client ID có Redirect URI
- [ ] Cập nhật `.env`
- [ ] Restart Metro
- [ ] Build development build
- [ ] Test Google Sign-in

---

## 🎉 SAU KHI HOÀN THÀNH

Bạn sẽ có:
- ✅ Google Sign-in hoạt động đầy đủ
- ✅ Đăng nhập bằng tài khoản Google
- ✅ Nhận user info (email, name, picture)
- ✅ Backend integration ready

---

## 📞 HỖ TRỢ

Nếu gặp lỗi:
1. Check console logs trong Terminal
2. Check Google Cloud Console logs
3. Run: `powershell .\scripts\check-google-oauth.ps1`
4. Đọc: `docs/GOOGLE_OAUTH_QUICK_START.md`

---

**Ước tính thời gian tổng:** ~30-35 phút (bao gồm build time)

**Bắt đầu từ Bước 1!** 🚀
