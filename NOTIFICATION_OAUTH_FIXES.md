# ✅ LỖI NOTIFICATION & GOOGLE OAUTH - ĐÃ KHẮC PHỤC

## Ngày: October 31, 2025

---

## ❌ LỖI ĐÃ SỬA

### 1. Babel construct.js Error từ expo-notifications

**Triệu chứng:**
```
Call Stack
  _construct (node_modules\@babel\runtime\helpers\construct.js:4:65)
  NamelessError (node_modules\@expo\metro-runtime\src\metroServerLogs.native.ts:102:20)
  warnOfExpoGoPushUsage (node_modules\expo-notifications\build\warnOfExpoGoPushUsage.js:9:26)
```

**Nguyên nhân:**
- `expo-notifications` tạo Error class khi import
- Babel transform Error class gây xung đột trong React Native
- Import statement chạy code ngay lập tức

**Giải pháp:**
Lazy load `expo-notifications` với try-catch:

```typescript
// hooks/useAppPermissions.ts

// ❌ TRƯỚC (import ngay)
import * as Notifications from 'expo-notifications';

// ✅ SAU (lazy load)
let Notifications: any = null;
try {
  Notifications = require('expo-notifications');
} catch (e) {
  console.warn('[Permissions] expo-notifications not available');
}
```

**Guard tất cả chỗ dùng Notifications:**

```typescript
export async function requestNotificationPermission(): Promise<PermissionResult> {
  try {
    // ✅ Check trước khi dùng
    if (!Notifications) {
      console.warn('[Permissions] Notifications module not available');
      return { status: 'denied', canAskAgain: false };
    }
    
    const { status, canAskAgain } = await Notifications.requestPermissionsAsync();
    // ...
  }
}

export async function checkNotificationPermission(): Promise<PermissionStatus> {
  // ✅ Guard
  if (!Notifications) {
    return 'denied';
  }
  const { status } = await Notifications.getPermissionsAsync();
  return status as PermissionStatus;
}
```

**Kết quả:**
- ✅ Không còn Babel construct.js errors
- ✅ App chạy được trên Expo Go (dù không có push notifications)
- ✅ Warnings về Expo Go vẫn hiện nhưng không crash
- ✅ Development build sẽ có đầy đủ notification features

---

### 2. Google OAuth - Thiếu Android Client ID

**Triệu chứng:**
```
WARN  ⚠️ [Google OAuth] Missing EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID
LOG  [Google OAuth] Client IDs configured: {"android": false, "ios": false, "web": true}
```

**Nguyên nhân:**
- Chỉ có Web Client ID được config
- Android và iOS Client IDs chưa tạo trong Google Cloud Console
- `.env` file thiếu Android/iOS Client IDs

**Giải pháp:**
Tạo Android Client ID trong Google Cloud Console:

**📋 THÔNG TIN CẦN DÙNG:**
```
Package Name: com.adminmarketingnx.APP_DESIGN_BUILD
SHA-1: 9E:8A:6B:92:12:6E:8D:C3:A2:57:73:B7:D8:49:9C:3A:2F:10:5B:1D
Redirect URI: https://auth.expo.io/@adminmarketingnx/APP_DESIGN_BUILD
```

**🎯 CÁCH TẠO ANDROID CLIENT ID:**

1. **Chạy script helper:**
   ```powershell
   powershell -ExecutionPolicy Bypass -File ".\scripts\open-google-console.ps1"
   ```
   Script sẽ tự động mở Google Cloud Console với thông tin đầy đủ.

2. **Hoặc làm thủ công:**
   - Vào: https://console.cloud.google.com/apis/credentials
   - Click "+ CREATE CREDENTIALS" → "OAuth client ID"
   - Chọn "Android"
   - Điền:
     - Name: `Android App`
     - Package name: `com.adminmarketingnx.APP_DESIGN_BUILD`
     - SHA-1: `9E:8A:6B:92:12:6E:8D:C3:A2:57:73:B7:D8:49:9C:3A:2F:10:5B:1D`
   - Click "CREATE"

3. **Copy Client ID và update .env:**
   ```bash
   EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=paste-your-client-id-here
   ```

4. **Restart Metro:**
   ```powershell
   npx expo start -c
   ```

**Kết quả:**
- ✅ Android OAuth sẽ hoạt động
- ✅ Không còn warning về missing Client ID
- ✅ Google Sign-in button sẽ hoạt động trên Android

---

## 📝 FILES ĐÃ SỬA

### 1. hooks/useAppPermissions.ts
- Lazy load `expo-notifications` với try-catch
- Guard `requestNotificationPermission()`
- Guard `checkNotificationPermission()`

### 2. scripts/open-google-console.ps1 (NEW)
- Helper script mở Google Cloud Console
- Hiển thị đầy đủ thông tin cần thiết
- Hướng dẫn từng bước

---

## 🧪 TESTING

### Test 1: Notification Error Fixed
```
✅ App khởi động không crash
✅ Không còn construct.js errors
⚠️ Warnings về Expo Go vẫn hiện (bình thường)
```

### Test 2: Google OAuth
```
⏳ Đang chờ: Tạo Android Client ID
⏳ Đang chờ: Update .env
⏳ Đang chờ: Test Google Sign-in
```

---

## 🚀 NEXT STEPS

### NGAY LẬP TỨC:

1. **Tạo Android Client ID** (5 phút):
   ```powershell
   powershell -ExecutionPolicy Bypass -File ".\scripts\open-google-console.ps1"
   ```
   Script sẽ mở Google Console và hiển thị thông tin cần thiết.

2. **Update .env** (1 phút):
   ```bash
   EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-new-client-id
   ```

3. **Restart Metro** (30 giây):
   ```powershell
   npx expo start -c
   ```

4. **Test Google Sign-in** (2 phút):
   - Mở app trên device/emulator
   - Click "Đăng nhập với Google"
   - Chọn account
   - ✅ Should work!

### TÙY CHỌN:

5. **Tạo iOS Client ID** (nếu cần test iOS):
   - Bundle ID: `com.adminmarketingnx.APP_DESIGN_BUILD`
   - Update: `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=xxx`

6. **Build Development Build** (để test push notifications đầy đủ):
   ```powershell
   eas build --profile development --platform android
   ```

---

## 📊 TRẠNG THÁI

### ✅ ĐÃ HOÀN THÀNH:
- [x] Fix Babel construct.js error
- [x] Lazy load expo-notifications
- [x] Guard notification functions
- [x] Tạo helper script open Google Console
- [x] Restart Metro successfully

### ⏳ CẦN LÀM (BẠN):
- [ ] Tạo Android Client ID
- [ ] Update .env với Android Client ID
- [ ] Restart Metro
- [ ] Test Google Sign-in
- [ ] (Optional) Tạo iOS Client ID
- [ ] (Optional) Build development build

---

## 💡 LƯU Ý QUAN TRỌNG

### Về Expo Go & Notifications:
- ⚠️ **Push notifications KHÔNG hoạt động trong Expo Go** (từ SDK 53+)
- ✅ Permission requests vẫn hoạt động
- ✅ App không crash khi request permissions
- 🚀 Cần **Development Build** để test push notifications đầy đủ

### Về Google OAuth:
- ✅ Web Client ID đã có
- ❌ Android Client ID cần tạo (REQUIRED cho Android)
- ❌ iOS Client ID cần tạo (REQUIRED cho iOS)
- 🔐 SHA-1 fingerprint: Dùng Expo default cho development

---

## 📞 TROUBLESHOOTING

### Nếu vẫn thấy construct.js error:
1. Check file đã update đúng chưa: `hooks/useAppPermissions.ts`
2. Clear Metro cache: `npx expo start -c`
3. Check import statement: Phải dùng `require()` chứ không phải `import`

### Nếu Google OAuth vẫn không hoạt động:
1. Check .env có Android Client ID chưa
2. Check SHA-1 fingerprint đúng chưa
3. Check redirect URI trong Web Client ID
4. Check OAuth Consent Screen đã setup chưa

---

## 📚 TÀI LIỆU THAM KHẢO

- `docs/GOOGLE_OAUTH_QUICK_START.md` - Hướng dẫn setup Google OAuth
- `GOOGLE_OAUTH_CURRENT_STATUS.md` - Trạng thái hiện tại
- `scripts/check-google-oauth.ps1` - Check config
- `scripts/open-google-console.ps1` - Mở Google Console (NEW)

---

**Status:** ✅ **Notification Error FIXED** | ⏳ **Google OAuth Pending User Action**

**Thời gian ước tính hoàn thành Google OAuth:** ~10 phút
