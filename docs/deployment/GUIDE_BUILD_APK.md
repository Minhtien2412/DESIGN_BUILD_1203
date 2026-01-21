# 📱 Hướng Dẫn Xuất File APK

## ✅ **Cách 1: EAS Build (Cloud) - KHUYÊN DÙNG**

### Điều kiện:
- Tài khoản Expo có quota build (Free: 1 build/tháng, reset vào **01/01/2026**)
- Internet connection

### Các bước:

```powershell
# 1. Login EAS (nếu chưa)
eas login

# 2. Build APK Preview
eas build --platform android --profile preview

# 3. Download APK từ link EAS gửi về email
```

### Ưu điểm:
- ✅ Không cần cài Android SDK/Tools
- ✅ Build trên cloud, nhanh và ổn định
- ✅ Tự động sign APK
- ✅ Có thể test qua Expo Go ngay

### Nhược điểm:
- ❌ Cần quota (đã hết, reset 01/01/2026)
- ❌ Cần internet
- ❌ Build time: ~15-20 phút

---

## 🔧 **Cách 2: Build Local (Trên Windows)**

### Điều kiện:
- **Android Studio** đã cài với Android SDK
- **Java JDK 17** (khuyên dùng)
- Gradle wrapper (đã có trong project)

### Các bước:

#### Bước 1: Prebuild native code
```powershell
npx expo prebuild --platform android
```

#### Bước 2: Build APK Debug
```powershell
cd android
.\gradlew.bat assembleDebug
```

APK sẽ nằm ở: `android/app/build/outputs/apk/debug/app-debug.apk`

#### Bước 3 (Optional): Build APK Release
```powershell
.\gradlew.bat assembleRelease
```

### Ưu điểm:
- ✅ Không cần quota EAS
- ✅ Build offline được
- ✅ Control hoàn toàn

### Nhược điểm:
- ❌ Cần cài Android Studio (heavy ~3GB)
- ❌ Có thể gặp lỗi dependency conflicts
- ❌ Build time: ~5-10 phút (lần đầu lâu hơn)

---

## ⚡ **Cách 3: Build Với Script Tự Động**

Đã tạo sẵn script để tự động fix lỗi và build:

```powershell
# Chạy script
.\build-apk-simple.ps1
```

Script sẽ:
1. Stop Metro bundler
2. Clean build artifacts
3. Tạm thời loại bỏ dependencies có vấn đề
4. Reinstall dependencies
5. Build debug APK
6. Copy APK ra root folder
7. Restore package.json

---

## 🐛 **Các Lỗi Thường Gặp**

### 1. **JavaScript heap out of memory**
```powershell
# Fix: Tăng Node memory
$env:NODE_OPTIONS="--max-old-space-size=8192"
npx expo start
```

### 2. **react-native-document-picker compile error**
**Nguyên nhân**: Package không tương thích với React Native 0.77+

**Giải pháp tạm thời**:
```powershell
# Loại bỏ trong node_modules
Remove-Item "node_modules\react-native-document-picker" -Recurse -Force

# Hoặc comment trong package.json
# "react-native-document-picker": "^9.4.0", → // Removed temporarily
```

### 3. **WebRTC duplicate classes**
**Nguyên nhân**: Có 2 versions WebRTC (livekit + jitsi)

**Giải pháp**: Thêm vào `android/app/build.gradle`:
```gradle
configurations.all {
    exclude group: 'org.jitsi', module: 'webrtc'
}
```

### 4. **Port 8081 already in use**
```powershell
# Kill node processes
Get-Process -Name node | Stop-Process -Force

# Hoặc dùng port khác
npx expo start --port 8082
```

---

## 📊 **So Sánh Các Phương Pháp**

| Tiêu chí | EAS Cloud | Local Build | Script Auto |
|----------|-----------|-------------|-------------|
| **Thời gian** | 15-20 min | 5-10 min | 5-10 min |
| **Cài đặt** | ✅ Minimal | ❌ Android Studio | ✅ Minimal |
| **Quota** | ❌ Limited | ✅ Unlimited | ✅ Unlimited |
| **Internet** | ✅ Required | ⚠️ Optional | ⚠️ Optional |
| **Độ tin cậy** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **APK Size** | ~50-60MB | ~80-100MB | ~80-100MB |

---

## 🎯 **Khuyến Nghị**

### Cho Development (Test):
1. **Expo Go** (nhanh nhất, không cần build)
   ```powershell
   npx expo start
   # Scan QR code with Expo Go app
   ```

2. **Development Build** (có native modules)
   ```powershell
   eas build --profile development --platform android
   ```

### Cho Production:
1. **EAS Build Production** (đợi quota reset 01/01/2026)
   ```powershell
   eas build --profile production --platform android
   # Tạo AAB file để upload lên Play Store
   ```

2. **Local Release Build** (nếu cần ngay)
   ```powershell
   cd android
   .\gradlew.bat bundleRelease
   # Tạo AAB: android/app/build/outputs/bundle/release/app-release.aab
   ```

---

## 📦 **Test APK**

Sau khi có APK:

### Trên thiết bị thật:
1. Copy APK vào điện thoại
2. Bật "Install unknown apps" trong Settings
3. Tap vào APK để cài đặt
4. Test các tính năng

### Trên emulator:
```powershell
# Khởi động emulator
emulator -avd Pixel_5_API_33

# Install APK
adb install app-debug.apk

# View logs
adb logcat
```

---

## 🔐 **Signing APK (Cho Production)**

### Tạo keystore:
```powershell
keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

### Configure trong `android/app/build.gradle`:
```gradle
android {
    signingConfigs {
        release {
            storeFile file('my-release-key.keystore')
            storePassword 'your-password'
            keyAlias 'my-key-alias'
            keyPassword 'your-password'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

### Build signed APK:
```powershell
.\gradlew.bat assembleRelease
```

---

## 📞 **Support**

Nếu gặp vấn đề:
1. Check logs trong `android/app/build/` 
2. Run với `--stacktrace`: `.\gradlew.bat assembleDebug --stacktrace`
3. Clean project: `.\gradlew.bat clean`
4. Update dependencies: `npm install`

---

## ✨ **Quick Commands**

```powershell
# EAS Build (cần quota)
eas build -p android --profile preview

# Local Debug
npx expo prebuild --platform android
cd android && .\gradlew.bat assembleDebug

# Local Release  
cd android && .\gradlew.bat assembleRelease

# Auto script
.\build-apk-simple.ps1

# Expo Go (no build needed)
npx expo start
```

---

**Last Updated**: December 26, 2025  
**Status**: EAS quota reset on **January 1, 2026** ⏰
