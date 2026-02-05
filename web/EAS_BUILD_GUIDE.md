# 📱 EAS Build Guide - Hướng Dẫn Chi Tiết

## 🎯 Tổng Quan

EAS Build là dịch vụ cloud của Expo để build app Android (APK/AAB) và iOS (IPA) mà **không cần** máy Mac hoặc Linux local.

---

## 📋 Các Bước Chuẩn Bị

### 1. Cài đặt EAS CLI

```bash
npm install -g eas-cli
```

### 2. Đăng nhập Expo Account

```bash
eas login
# Nhập email và password của tài khoản Expo
```

### 3. Cấu hình Project

```bash
eas build:configure
```

---

## 🤖 Build Android

### Build APK (Testing/Internal)

```bash
# APK cho development/testing
eas build --platform android --profile development

# APK cho preview/internal testing
eas build --platform android --profile preview
```

### Build AAB (Play Store)

```bash
# App Bundle cho Play Store
eas build --platform android --profile production

# Hoặc dùng profile store-android
eas build --platform android --profile store-android
```

### Cấu hình eas.json cho Android

```json
{
  "build": {
    "development": {
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleDebug"
      }
    },
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle",
        "gradleCommand": ":app:bundleRelease"
      }
    }
  }
}
```

---

## 🍎 Build iOS

### Build cho Simulator

```bash
eas build --platform ios --profile development
```

### Build cho Device (Ad-hoc)

```bash
eas build --platform ios --profile preview
```

### Build cho App Store

```bash
eas build --platform ios --profile production
```

### Yêu cầu cho iOS

1. **Apple Developer Account** ($99/năm)
2. **Provisioning Profile** - EAS tự động tạo
3. **Signing Certificate** - EAS tự động quản lý

---

## 🔐 Quản Lý Credentials

### Android Keystore

```bash
# Tạo keystore mới
eas credentials --platform android

# Xem keystore hiện tại
eas credentials --platform android --scope project
```

### iOS Certificates

```bash
# Quản lý credentials iOS
eas credentials --platform ios

# Tạo mới hoặc sử dụng credentials có sẵn
```

---

## 📊 Build Profiles Chi Tiết

### Development Profile

- **Mục đích**: Debug, test trên device
- **Android**: APK với debug key
- **iOS**: Simulator build
- **Thời gian build**: ~10-15 phút

### Preview Profile

- **Mục đích**: Internal testing, QA
- **Android**: APK với release key
- **iOS**: Ad-hoc distribution
- **Thời gian build**: ~15-20 phút

### Production Profile

- **Mục đích**: Store submission
- **Android**: AAB (App Bundle)
- **iOS**: App Store Connect upload
- **Thời gian build**: ~20-30 phút

---

## 🚀 Submit lên Store

### Google Play Store

```bash
# Submit AAB lên Play Store
eas submit --platform android --profile production
```

Cần file `google-service-account.json`:

1. Vào Google Play Console > API Access
2. Tạo Service Account
3. Download JSON key
4. Đặt tại root project

### Apple App Store

```bash
# Submit lên App Store Connect
eas submit --platform ios --profile production
```

Cần thông tin trong eas.json:

- `appleId`: Apple ID email
- `ascAppId`: App Store Connect App ID
- `appleTeamId`: Team ID

---

## ⚙️ Tối Ưu APK Size

### 1. Proguard/R8 (Android)

Thêm vào `android/app/build.gradle`:

```gradle
android {
    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 2. Image Optimization

```bash
# Cài sharp-cli
npm install -g sharp-cli

# Compress images
find assets -name "*.png" -exec sharp --input {} --output {} --quality 80 \;
```

### 3. Remove Unused Dependencies

```bash
# Phân tích bundle size
npx react-native-bundle-visualizer

# Hoặc
npx source-map-explorer
```

### 4. Split APKs by ABI

```json
// eas.json
{
  "build": {
    "production": {
      "android": {
        "buildType": "app-bundle" // AAB tự động split
      }
    }
  }
}
```

### 5. Enable Hermes Engine

```json
// app.json
{
  "expo": {
    "jsEngine": "hermes"
  }
}
```

---

## 🐛 Troubleshooting

### Lỗi "Unsupported platform"

**Nguyên nhân**: Local build yêu cầu Mac/Linux

**Giải pháp**: Sử dụng EAS Build (cloud)

```bash
# Thay vì local build
eas build --platform android --profile preview
```

### Lỗi "Account limit reached"

**Nguyên nhân**: Free tier giới hạn

**Giải pháp**:

1. Nâng cấp lên Expo paid plan
2. Hoặc chờ reset quota (monthly)
3. Hoặc build local trên Mac/Linux

### Lỗi Keystore

```bash
# Reset Android credentials
eas credentials --platform android
# Chọn "Remove" rồi tạo mới
```

### Lỗi iOS Provisioning

```bash
# Reset iOS credentials
eas credentials --platform ios
# Chọn tạo mới provisioning profile
```

---

## 📦 Commands Tổng Hợp

```bash
# ========== BUILD ==========
# Android APK (test)
eas build -p android --profile preview

# Android AAB (store)
eas build -p android --profile production

# iOS (store)
eas build -p ios --profile production

# Both platforms
eas build --platform all --profile production

# ========== SUBMIT ==========
# Submit Android
eas submit -p android

# Submit iOS
eas submit -p ios

# ========== CREDENTIALS ==========
# Xem credentials
eas credentials

# ========== STATUS ==========
# Xem build status
eas build:list

# Cancel build
eas build:cancel
```

---

## 💰 Pricing

### Free Tier

- 30 builds/tháng
- Queue priority: Low
- Build time limit: 1 hour

### Production ($99/tháng)

- Unlimited builds
- Priority queue
- Faster build times

### Enterprise (Custom)

- Dedicated infrastructure
- SLA guarantees
- Premium support

---

## ✅ Checklist Trước Khi Build Production

- [ ] Version number đã update (package.json, app.json)
- [ ] Build number đã increment
- [ ] Environment variables đã set đúng
- [ ] Icons và splash screen đúng size
- [ ] Privacy policy URL hoạt động
- [ ] Terms of service URL hoạt động
- [ ] App name không vi phạm trademark
- [ ] Description rõ ràng, không spam
- [ ] Screenshots chuẩn bị đủ
- [ ] Feature graphic (Android) chuẩn bị
- [ ] Test trên real devices
- [ ] Remove console.log và debug code
- [ ] API endpoints trỏ đúng production

---

## 🎯 Quick Start

```bash
# 1. Login
eas login

# 2. Configure (lần đầu)
eas build:configure

# 3. Build APK để test
eas build -p android --profile preview

# 4. Download APK từ link trong terminal

# 5. Build cho Store khi ready
eas build -p android --profile production
eas build -p ios --profile production

# 6. Submit
eas submit -p android
eas submit -p ios
```

---

Chúc bạn build thành công! 🚀
