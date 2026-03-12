# Build Development Build cho WebRTC Testing

## ⚠️ Quan trọng: WebRTC KHÔNG chạy trên Expo Go

WebRTC cần **native modules** (`react-native-webrtc`) không có sẵn trong Expo Go. Bạn phải build **development build** hoặc **production build**.

---

## 🔧 Option 1: Local Development Build (Nhanh, Free)

### Prerequisites
- Android Studio installed (cho Android)
- Xcode installed (cho iOS - chỉ trên Mac)
- USB cable để kết nối điện thoại
- Developer mode enabled trên điện thoại

### Bước 1: Chuẩn bị môi trường

**Android:**
```bash
# Install Android SDK
# Xem: https://docs.expo.dev/get-started/set-up-your-environment/?platform=android

# Kiểm tra
adb devices
```

**iOS (Mac only):**
```bash
# Install Xcode từ App Store
# Install CocoaPods
sudo gem install cocoapods
```

### Bước 2: Build và chạy

**Android:**
```bash
# Kết nối điện thoại qua USB, enable USB debugging
adb devices

# Build và install (tự động)
npx expo run:android

# Lần sau chỉ cần
npx expo start --dev-client
```

**iOS (Mac only):**
```bash
# Kết nối iPhone qua USB
# Trust computer trên iPhone

# Build và install
npx expo run:ios

# Lần sau
npx expo start --dev-client
```

### Bước 3: Test WebRTC

1. Install development build trên **2 thiết bị**
2. Cả 2 devices phải kết nối cùng WiFi hoặc có kết nối internet
3. Login 2 accounts khác nhau
4. Device 1: Start video call
5. Device 2: Accept call
6. Check video/audio streams

---

## ☁️ Option 2: EAS Build (Cloud Build, Dễ hơn)

### Prerequisites
- Expo account (free)
- EAS CLI
- Google Play Store account (để distribute) - optional

### Bước 1: Setup EAS

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure project
eas build:configure
```

### Bước 2: Build Development Build

**Android:**
```bash
# Build development APK
eas build --profile development --platform android

# Đợi 15-30 phút (build trên cloud)
# Download APK từ link được gửi
# Install trên điện thoại: adb install app.apk
```

**iOS:**
```bash
# Build development build
eas build --profile development --platform ios

# Cần Apple Developer account ($99/year)
# Download IPA và install qua Xcode
```

### Bước 3: Chạy app

```bash
# Start Expo server
npx expo start --dev-client

# Scan QR code từ development build app
```

---

## 🏗️ Option 3: Production Build (cho release)

### Android Production APK

```bash
# Build production APK
eas build --profile production --platform android

# Hoặc Android App Bundle (AAB) cho Play Store
eas build --profile production --platform android --auto-submit
```

### iOS Production

```bash
# Build cho TestFlight
eas build --profile production --platform ios

# Submit to App Store
eas submit --platform ios
```

---

## 📱 Testing Checklist

### Pre-test Setup

- [ ] Backend đã deploy với WebRTC fixes
- [ ] Development build installed trên 2 devices
- [ ] 2 test users đã tạo trên server
- [ ] Cả 2 devices có camera + microphone permissions

### Test Scenarios

**Scenario 1: Basic Video Call**
- [ ] User A login
- [ ] User B login
- [ ] User A navigate to Contacts
- [ ] User A tap video call icon on User B
- [ ] User B nhận incoming call popup
- [ ] User B accept call
- [ ] Both devices show ActiveCallScreen
- [ ] User A sees local video (small preview)
- [ ] User A sees remote video (full screen)
- [ ] User B sees local video
- [ ] User B sees remote video
- [ ] Audio 2 chiều hoạt động
- [ ] End call từ 1 bên → cả 2 về màn hình cũ

**Scenario 2: Call Controls**
- [ ] Toggle mute → audio tắt
- [ ] Toggle video → camera tắt
- [ ] Toggle speaker → loa ngoài/loa trong
- [ ] Flip camera → chuyển camera trước/sau

**Scenario 3: Network Issues**
- [ ] Start call → tắt WiFi → bật lại → call vẫn hoạt động
- [ ] Call qua mạng di động
- [ ] Call qua 2 networks khác nhau

**Scenario 4: Edge Cases**
- [ ] Reject incoming call
- [ ] Cancel outgoing call
- [ ] Call khi user offline
- [ ] Multiple incoming calls (chỉ accept 1)

---

## 🐛 Troubleshooting

### Issue: "Metro bundler not found"
```bash
npx expo start --dev-client --clear
```

### Issue: "WebRTC module not found"
```bash
# Rebuild app
npx expo run:android
```

### Issue: "No video/audio stream"
- Check permissions trong Settings → Apps → Your App
- Restart app
- Check console logs

### Issue: "Connection failed"
- Check Backend logs: `ssh root@baotienweb.cloud 'pm2 logs baotienweb-api'`
- Check WebSocket connection
- Verify CORS settings

### Issue: "ICE connection failed"
- Cần TURN server (see WEBRTC_BACKEND_FIXES.md)
- Test với 2 devices cùng WiFi trước

---

## 📊 Build Commands Reference

| Command | Purpose | Time |
|---------|---------|------|
| `npx expo run:android` | Local dev build Android | 5-10 min |
| `npx expo run:ios` | Local dev build iOS | 10-15 min |
| `eas build --profile development --platform android` | Cloud dev build Android | 15-30 min |
| `eas build --profile production --platform android` | Cloud prod build Android | 20-40 min |
| `npx expo start --dev-client` | Start dev server | Instant |

---

## 🎯 Recommended Flow (Fastest)

1. **First time:**
   ```bash
   npx expo run:android
   # App tự động install và open
   ```

2. **Subsequent runs:**
   ```bash
   npx expo start --dev-client
   # App already installed, just scan QR
   ```

3. **Test on 2nd device:**
   - Copy APK từ `android/app/build/outputs/apk/debug/` sang device 2
   - Hoặc build lại: `npx expo run:android --device`

---

## 📝 Notes

- Development build **bao gồm tất cả native modules** (react-native-webrtc, camera, etc.)
- Kích thước APK: ~50-100MB
- Không cần rebuild khi sửa JS/TS code (hot reload hoạt động)
- Chỉ cần rebuild khi:
  - Thêm/xóa native modules
  - Sửa native config (app.json permissions)
  - Update Expo SDK

---

*Document created: 2025-12-19*
