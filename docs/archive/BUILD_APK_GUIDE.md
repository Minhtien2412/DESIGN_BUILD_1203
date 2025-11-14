# 📦 Hướng Dẫn Build APK

**Ngày cập nhật:** 07/11/2025

## 🎯 Phương Án 1: EAS Build (Khuyến nghị)

**Ưu điểm:**
- ✅ Dễ nhất, không cần cài Java/Android Studio
- ✅ Build trên cloud, không tốn tài nguyên máy
- ✅ Tự động ký file APK
- ✅ Link tải APK có hiệu lực 30 ngày

**Bước thực hiện:**

### 1. Đảm bảo đủ dung lượng
```powershell
# Kiểm tra dung lượng ổ C (cần ít nhất 2-3GB)
Get-PSDrive C | Select-Object Used,Free
```

### 2. Dọn dẹp nếu cần
```powershell
# Xóa cache npm
npm cache clean --force

# Xóa node_modules và cài lại (nếu cần)
Remove-Item -Recurse -Force node_modules
npm install
```

### 3. Build APK
```powershell
# Build preview APK (để test internal)
eas build --profile preview --platform android

# Build production APK
eas build --profile production --platform android
```

### 4. Tải APK
- Đợi 5-10 phút cho build hoàn thành
- Kiểm tra: https://expo.dev/accounts/[your-account]/projects/app_design_build/builds
- Hoặc click link trong terminal output
- Tải APK về máy

### 5. Cài APK trên điện thoại
```
1. Copy file APK vào điện thoại (USB/AirDrop/Drive)
2. Bật "Unknown Sources" trong Settings
3. Mở file APK và cài đặt
```

---

## 🎯 Phương Án 2: Build Local với Gradle

**Yêu cầu:**
- Java Development Kit (JDK) 17 hoặc 21
- Android SDK (qua Android Studio)
- Ít nhất 10GB dung lượng trống

### 1. Cài đặt JDK

**Download:**
- https://www.oracle.com/java/technologies/downloads/
- Hoặc: https://adoptium.net/ (OpenJDK)

**Cài đặt:**
1. Tải JDK 17 cho Windows
2. Cài vào `C:\Program Files\Java\jdk-17`
3. Set Environment Variables:
   ```
   JAVA_HOME = C:\Program Files\Java\jdk-17
   Path += %JAVA_HOME%\bin
   ```

**Kiểm tra:**
```powershell
java -version
# Output: java version "17.x.x"
```

### 2. Cài Android Studio (optional nhưng dễ hơn)

**Download:**
- https://developer.android.com/studio

**Setup:**
1. Cài Android Studio
2. Mở SDK Manager (Tools > SDK Manager)
3. Cài Android SDK Platform 34 (API 34)
4. Cài Android SDK Build-Tools 34.0.0

### 3. Prebuild native code
```powershell
npx expo prebuild --platform android
```

### 4. Build APK
```powershell
cd android
.\gradlew.bat assembleRelease
```

### 5. Tìm APK
```
File APK sẽ ở:
android\app\build\outputs\apk\release\app-release.apk
```

---

## 🎯 Phương Án 3: Android Studio GUI

**Ưu điểm:**
- Giao diện trực quan
- Dễ debug lỗi
- Có thể test trên emulator ngay

**Bước thực hiện:**

### 1. Cài Android Studio
- Download: https://developer.android.com/studio
- Cài đặt với tất cả components mặc định

### 2. Prebuild project
```powershell
npx expo prebuild --platform android
```

### 3. Mở project trong Android Studio
```
File > Open > chọn folder: android/
```

### 4. Build APK
```
Build > Build Bundle(s) / APK(s) > Build APK(s)
```

### 5. Tìm APK
Android Studio sẽ hiển thị notification với link "locate" APK sau khi build xong.

---

## 🐛 Xử Lý Lỗi Thường Gặp

### Lỗi: "ENOSPC: no space left on device"

**Nguyên nhân:** Không đủ dung lượng ổ đĩa

**Giải pháp:**
```powershell
# 1. Xóa cache npm
npm cache clean --force

# 2. Xóa Expo cache
npx expo start --clear

# 3. Xóa build cũ
Remove-Item -Recurse -Force android\app\build

# 4. Xóa temp files Windows
# Settings > System > Storage > Temporary files
```

### Lỗi: "JAVA_HOME is not set"

**Giải pháp:**
1. Cài JDK 17 từ: https://adoptium.net/
2. Set biến môi trường:
   ```
   Windows Search > "Environment Variables" > System Variables
   New > JAVA_HOME = C:\Program Files\Java\jdk-17
   Edit Path > Add > %JAVA_HOME%\bin
   ```
3. Restart PowerShell và thử lại

### Lỗi: "Android SDK not found"

**Giải pháp:**
1. Cài Android Studio
2. Mở SDK Manager
3. Cài Android SDK Platform 34
4. Set ANDROID_HOME:
   ```
   ANDROID_HOME = C:\Users\[YourName]\AppData\Local\Android\Sdk
   ```

### Lỗi: Build failed khi upload EAS

**Giải pháp:**
```powershell
# Tạo .easignore để loại trừ files không cần
echo "node_modules/
.expo/
.expo-shared/
android/
ios/
**/*.log
.env.local" > .easignore

# Thử lại
eas build --profile preview --platform android
```

---

## 📊 So Sánh Các Phương Án

| Tiêu chí | EAS Build | Gradle | Android Studio |
|----------|-----------|--------|----------------|
| Độ khó | ⭐ Dễ | ⭐⭐⭐ Khó | ⭐⭐ Trung bình |
| Thời gian setup | 0 phút | 30-60 phút | 30-60 phút |
| Thời gian build | 5-10 phút | 5-15 phút | 5-15 phút |
| Dung lượng cần | 2-3GB | 10GB+ | 10GB+ |
| Yêu cầu | Internet | JDK, SDK | Android Studio |
| Phù hợp | Mọi người | Dev có kinh nghiệm | Dev mới bắt đầu |

---

## 🚀 Build Profiles

### Preview Profile (eas.json)
```json
{
  "preview": {
    "distribution": "internal",
    "android": { "buildType": "apk" }
  }
}
```
- Dùng để test internal
- Tạo APK (không phải AAB)
- Không cần upload lên Play Store

### Production Profile
```json
{
  "production": {
    "android": { "buildType": "app-bundle" }
  }
}
```
- Dùng để release lên Play Store
- Tạo AAB (Android App Bundle)
- Size nhỏ hơn APK

---

## 📱 Cài APK Trên Điện Thoại

### Android
1. Copy file APK vào điện thoại
2. Mở Settings > Security > Unknown Sources (bật)
3. Mở File Manager > tìm file APK
4. Tap vào APK và chọn Install

### Qua ADB (cho dev)
```powershell
# Kết nối điện thoại qua USB (bật USB Debugging)
adb install app-release.apk
```

---

## 🔧 Commands Nhanh

```powershell
# Build preview APK (dễ nhất)
eas build --profile preview --platform android

# Check build status
eas build:list

# View build logs
eas build:view [build-id]

# Cancel running build
eas build:cancel

# Clean và rebuild
npm cache clean --force
Remove-Item -Recurse -Force node_modules
npm install
eas build --profile preview --platform android --clear-cache
```

---

## 📚 Tài Liệu Tham Khảo

- **EAS Build Docs:** https://docs.expo.dev/build/setup/
- **Android APK:** https://docs.expo.dev/build-reference/apk/
- **Gradle Build:** https://developer.android.com/build
- **Environment Variables:** https://docs.expo.dev/build-reference/variables/

---

## ✅ Checklist Trước Khi Build

- [ ] Đã test app trên Expo Go hoặc development build
- [ ] Đã cập nhật version trong app.config.ts (versionCode, version)
- [ ] Đã kiểm tra .env có đúng EXPO_PUBLIC_API_BASE_URL
- [ ] Đã commit code lên git
- [ ] Đã xóa cache: `npm cache clean --force`
- [ ] Có ít nhất 3GB dung lượng trống
- [ ] Internet ổn định (cho EAS Build)

---

**Khuyến nghị:** Dùng **EAS Build** cho lần đầu - đơn giản nhất!

```powershell
eas build --profile preview --platform android
```

Đợi 5-10 phút → Tải APK → Cài trên điện thoại → Xong! 🎉
