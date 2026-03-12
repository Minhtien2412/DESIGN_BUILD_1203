# 🚀 Expo Development Build - Hướng Dẫn Cài Đặt Đầy Đủ

## 📋 Yêu Cầu Hệ Thống

### Windows
- Node.js 18+ (đã cài ✅)
- npm hoặc yarn (đã cài ✅)
- Android Studio (cho Android development)
- JDK 17 (Java Development Kit)

---

## 🔧 Bước 1: Cài Đặt Java JDK 17

### Download JDK:
```
https://adoptium.net/temurin/releases/?version=17
```

Chọn:
- **Operating System**: Windows
- **Architecture**: x64
- **Package Type**: JDK
- **Version**: 17 (LTS)

### Sau khi cài đặt:

```powershell
# Set JAVA_HOME (thay đường dẫn thực tế sau khi cài)
$javaPath = "C:\Program Files\Eclipse Adoptium\jdk-17.0.13.11-hotspot"
[System.Environment]::SetEnvironmentVariable("JAVA_HOME", $javaPath, "User")
$env:JAVA_HOME = $javaPath

# Verify
java -version
# Kết quả mong đợi: openjdk version "17.0.x"
```

---

## 🔧 Bước 2: Cài Đặt Android SDK

### Nếu chưa có Android Studio:
```
https://developer.android.com/studio
```

### Sau khi cài Android Studio:

1. **Mở Android Studio**
2. **Settings → Appearance & Behavior → System Settings → Android SDK**
3. **Cài đặt:**
   - Android SDK Platform 34 (Android 14)
   - Android SDK Platform 33 (Android 13)
   - Android SDK Build-Tools 34.0.0
   - Android SDK Command-line Tools
   - Android Emulator
   - Intel x86 Emulator Accelerator (HAXM installer)

4. **Set ANDROID_HOME:**
```powershell
$androidSdk = "$env:LOCALAPPDATA\Android\Sdk"
[System.Environment]::SetEnvironmentVariable("ANDROID_HOME", $androidSdk, "User")
$env:ANDROID_HOME = $androidSdk

# Thêm vào PATH
$currentPath = [System.Environment]::GetEnvironmentVariable("Path", "User")
$newPath = "$androidSdk\platform-tools;$androidSdk\tools;$androidSdk\tools\bin;$currentPath"
[System.Environment]::SetEnvironmentVariable("Path", $newPath, "User")
```

5. **Verify:**
```powershell
adb version
# Android Debug Bridge version x.x.x
```

---

## 🔧 Bước 3: Tạo Android Virtual Device (AVD)

### Trong Android Studio:
1. **Tools → Device Manager**
2. **Create Device**
3. Chọn: **Phone → Pixel 5** (hoặc bất kỳ device nào)
4. Chọn System Image: **Android 13 (API 33)** hoặc **Android 14 (API 34)**
5. Finish

### Hoặc dùng command line:
```powershell
# List available system images
sdkmanager --list | Select-String "system-images"

# Install system image
sdkmanager "system-images;android-33;google_apis_playstore;x86_64"

# Create AVD
avdmanager create avd -n Medium_Phone_API_33 -k "system-images;android-33;google_apis_playstore;x86_64" -d "pixel_5"
```

---

## 🔧 Bước 4: Cấu Hình Expo Project

### 4.1 Update local.properties (đã tạo ✅)
File `android/local.properties` đã được tạo tự động

### 4.2 Verify gradle.properties (đã có ✅)
File `android/gradle.properties` đã có cấu hình tốt

### 4.3 Install dependencies
```powershell
npm install
```

---

## 🚀 Bước 5: Build Development Client

### Option A: Build và chạy trên emulator
```powershell
# Khởi động emulator trước
emulator -avd Medium_Phone_API_33

# Trong terminal khác, build và install
npx expo run:android
```

### Option B: Build APK để cài trên thiết bị thật
```powershell
# Development build
npm run build:dev:android

# Preview build (internal testing)
npm run build:preview

# Production build
npm run build:production
```

---

## 🎯 Bước 6: Chạy Development Server

### Start Metro bundler:
```powershell
npx expo start
```

### Hoặc với options:
```powershell
# Clear cache
npx expo start --clear

# Dev client mode
npx expo start --dev-client

# LAN connection
npx expo start --lan
```

---

## 📱 Cách Sử Dụng

### 1. **Expo Go** (Nhanh, không cần build)
- Cài Expo Go app từ Google Play
- Scan QR code từ terminal
- **Hạn chế**: Không support một số native modules

### 2. **Development Build** (Đầy đủ tính năng)
- Build app với `npx expo run:android`
- App sẽ được cài trên emulator/device
- Connect tới Metro bundler để hot reload
- **Ưu điểm**: Support tất cả native modules

---

## 🔥 Troubleshooting

### Lỗi "JAVA_HOME is not set"
```powershell
# Kiểm tra JAVA_HOME
echo $env:JAVA_HOME

# Set lại nếu cần
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.x.x"
```

### Lỗi "SDK location not found"
```powershell
# Tạo/sửa android/local.properties
echo "sdk.dir=C:\\Users\\$env:USERNAME\\AppData\\Local\\Android\\Sdk" > android\local.properties
```

### Lỗi "Port 8081 already in use"
```powershell
# Kill node processes
Get-Process -Name node | Stop-Process -Force

# Hoặc dùng port khác
npx expo start --port 8082
```

### Emulator không khởi động
```powershell
# List AVDs
emulator -list-avds

# Khởi động với verbose để debug
emulator -avd Medium_Phone_API_33 -verbose
```

### Gradle build chậm
Trong `android/gradle.properties` đã có:
```properties
org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m
org.gradle.parallel=true
org.gradle.daemon=true
```

---

## 📚 Scripts Available

```json
{
  "start": "npx expo start",
  "android": "npx expo run:android",
  "build:dev:android": "eas build --profile development --platform android",
  "build:preview": "eas build --profile preview --platform android",
  "build:production": "eas build --profile production --platform android"
}
```

---

## ✅ Checklist Hoàn Tất

- [ ] Java JDK 17 installed
- [ ] JAVA_HOME environment variable set
- [ ] Android Studio installed
- [ ] Android SDK Platform 33/34 installed
- [ ] ANDROID_HOME environment variable set
- [ ] AVD created (emulator)
- [ ] npm dependencies installed
- [ ] Patch script đã chạy (fix PNG assets)
- [ ] Development build successful
- [ ] Metro bundler running
- [ ] App running on emulator/device

---

## 🎊 Kết Quả Mong Đợi

Sau khi hoàn tất tất cả bước:
```powershell
npx expo run:android
```

Sẽ thấy:
```
✓ Built successfully
✓ Installed on emulator
✓ Opening app...
✓ Connected to Metro bundler
```

App sẽ mở và hiển thị màn hình home với:
- Bottom tabs navigation
- Projects screen
- Notifications
- Profile
- All features working!

---

**Lưu ý**: Nếu chỉ muốn test nhanh mà không cần build, dùng **Expo Go** app trên điện thoại thật!
