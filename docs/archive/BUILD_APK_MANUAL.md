# Hướng Dẫn Build APK Thủ Công

## Phương Pháp 1: EAS Build (Khuyến Nghị)

### Bước 1: Đảm bảo không có process đang chạy
```powershell
# Tắt Metro bundler (Ctrl+C)
# Đóng tất cả terminal
```

### Bước 2: Build với EAS
```powershell
# Clear cache và build
eas build --profile preview --platform android --clear-cache
```

### Bước 3: Chờ build hoàn tất (10-20 phút)
- Theo dõi tiến trình tại: https://expo.dev/accounts/adminmarketingnx/projects/APP_DESIGN_BUILD/builds
- Download APK khi hoàn tất

---

## Phương Pháp 2: Build Local (Cần Android Studio)

### Yêu Cầu:
1. **Java JDK 17** - Download tại: https://adoptium.net/
2. **Android Studio** - Download tại: https://developer.android.com/studio

### Cài Đặt Java:
```powershell
# Download JDK 17 và cài đặt

# Sau đó set biến môi trường
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.x-hotspot"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
```

### Build APK:
```powershell
# 1. Vào thư mục android
cd android

# 2. Build release APK
.\gradlew assembleRelease

# 3. APK sẽ nằm tại:
# android\app\build\outputs\apk\release\app-release.apk
```

---

## Phương Pháp 3: Development Build (Nhanh Nhất - Cần Device)

### Yêu Cầu:
- Điện thoại Android với USB Debugging enabled
- Hoặc Android Emulator đang chạy

### Build và Cài:
```powershell
# Build và cài trực tiếp lên device
npx expo run:android --variant release
```

APK sẽ được build và cài tự động lên thiết bị.

---

## Phương Pháp 4: Build APK Tối Ưu (Giảm Dung Lượng)

### Nếu gặp lỗi "Project quá lớn":

```powershell
# 1. Tạo backup trước
Copy-Item -Path . -Destination ../APP_DESIGN_BACKUP -Recurse

# 2. Xóa folders không cần thiết
Remove-Item -Recurse -Force _archived, perfex_crm, server, backend-implementation

# 3. Xóa videos lớn (nếu có)
Remove-Item -Recurse -Force assets/videos

# 4. Clean npm cache
npm cache clean --force

# 5. Build lại
eas build --profile preview --platform android --clear-cache
```

---

## Xử Lý Lỗi Thường Gặp

### Lỗi: "JAVA_HOME is not set"
**Giải pháp:**
```powershell
# Cài JDK 17 và set:
[System.Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Eclipse Adoptium\jdk-17.0.x-hotspot", "User")
```

### Lỗi: "resource busy or locked"
**Giải pháp:**
```powershell
# Đóng tất cả terminal
# Xóa temp files
Remove-Item -Recurse -Force $env:TEMP\eas-cli-*
# Thử lại
```

### Lỗi: "No Android device found"
**Giải pháp:**
```powershell
# Bật USB Debugging trên điện thoại:
# Settings > Developer Options > USB Debugging

# Hoặc tạo emulator trong Android Studio
```

### Lỗi: "Prebuild failed"
**Giải pháp:**
```powershell
# Xóa folder android cũ
Remove-Item -Recurse -Force android

# Prebuild lại
npx expo prebuild --platform android

# Build lại
eas build --profile preview --platform android
```

---

## Download APK Từ EAS Build

Sau khi build thành công với EAS:

1. Mở link: https://expo.dev/accounts/adminmarketingnx/projects/APP_DESIGN_BUILD/builds
2. Click vào build mới nhất
3. Download APK
4. Chuyển file APK vào điện thoại
5. Cài đặt (cần bật "Unknown sources")

---

## APK Debug vs Release

### Debug APK (Nhanh):
```powershell
cd android
.\gradlew assembleDebug
# Output: android/app/build/outputs/apk/debug/app-debug.apk
```

### Release APK (Tối Ưu):
```powershell
cd android
.\gradlew assembleRelease
# Output: android/app/build/outputs/apk/release/app-release.apk
```

**Release APK** nhỏ hơn và chạy nhanh hơn, nhưng cần keystore để sign.

---

## Next Steps

Sau khi có APK:

1. **Test trên thiết bị thật**
   - Cài APK
   - Test tất cả features
   - Kiểm tra permissions

2. **Test Google Sign In**
   - Đảm bảo SHA-1 đã đăng ký
   - Test đăng nhập Google

3. **Test Notifications**
   - Test push notifications
   - Test in-app notifications

4. **Performance Testing**
   - Kiểm tra tốc độ load
   - Kiểm tra memory usage
   - Test với network chậm

5. **Production Build**
   ```powershell
   eas build --profile production --platform android
   ```
   Tạo AAB file để upload lên Google Play Store.
