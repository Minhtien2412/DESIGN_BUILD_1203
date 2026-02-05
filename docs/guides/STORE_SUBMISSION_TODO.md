# 📱 STORE SUBMISSION TODO LIST

## Cập nhật: 2026-01-27 08:36 UTC+7

---

## 🔴 PRIORITY 1: CRITICAL (Bắt buộc để submit)

### ✅ 1. Privacy Policy

- **Trạng thái:** ✅ HOÀN THÀNH
- **File:** `web/privacy-policy.html`
- **URL:** https://baotienweb.cloud/privacy-policy

### ⏳ 2. Fix lỗi "Unexpected text node"

- **Trạng thái:** ⚠️ WARNING (không block Android/iOS)
- **Nguyên nhân:** Text node nằm ngoài `<Text>` component trên web SSR
- **Ghi chú:** Chỉ ảnh hưởng web, KHÔNG ảnh hưởng Android/iOS build

### ❌ 3. Tạo Feature Graphic (1024x500)

- **Trạng thái:** ❌ CHƯA LÀM
- **Yêu cầu:**
  - Background gradient xanh lá
  - Logo APP Design Build
  - Slogan: "Thiết kế & Xây dựng thông minh"
- **Tool:** Canva, Figma, hoặc Photoshop

### ❌ 4. Tạo Screenshots (6-8 ảnh)

- **Trạng thái:** ❌ CHƯA LÀM
- **Yêu cầu cho Android:**
  - Phone: 1080x1920 hoặc 1080x2400 (6-8 ảnh)
  - Screenshots: Home, Marketplace, Chat, Projects, AI Assistant, Profile

---

## 🟡 PRIORITY 2: IMPORTANT

### ✅ 5. Shadow Styles Utility

- **Trạng thái:** ✅ ĐÃ TẠO UTILITY
- **File:** `utils/shadowStyles.ts`
- **Cách dùng:**
  ```typescript
  import { shadowPresets, createShadow } from '@/utils/shadowStyles';
  
  // Sử dụng preset
  style={shadowPresets.md}
  
  // Hoặc custom
  style={createShadow({ offsetY: 2, blurRadius: 4, opacity: 0.25 })}
  ```
- **Presets có sẵn:** sm, md, lg, xl, card, button, fab, inputFocus, error, success, none
- **Ghi chú:** Utility tự động detect platform và dùng boxShadow cho web, native shadow cho iOS/Android

### ⚠️ 6. Fix memory issue

- **Trạng thái:** ⚠️ GIẢI PHÁP TẠM THỜI
- **Giải pháp:** Tăng Node.js heap size
  ```bash
  # Windows
  set NODE_OPTIONS=--max-old-space-size=8192
  npx expo start
  
  # Linux/Mac
  export NODE_OPTIONS=--max-old-space-size=8192
  npx expo start
  ```

### ✅ 7. EAS Build Configuration

- **Trạng thái:** ✅ HOÀN THÀNH
- **File:** `eas.json` đã được update
- **Profiles:**
  - `development`: APK cho dev/debug
  - `preview`: APK cho internal testing
  - `production`: AAB cho Google Play
  - `apk-preview`: APK riêng cho preview
- **Guide:** Xem `EAS_BUILD_GUIDE.md`

### ✅ 8. App.json configuration

- **Trạng thái:** ✅ HOÀN THÀNH
- **Thông tin:**
  - Name: APP Design Build
  - Package: com.adminmarketingnx.APP_DESIGN_BUILD
  - Version: 1.0.0
  - Target SDK: 35
  - Hermes: Enabled
  - ProGuard: Enabled

---

## 🟢 PRIORITY 3: OPTIMIZATION

### ✅ 9. APK Size Optimization

- **Trạng thái:** ✅ CẤU HÌNH ĐÃ TỐI ƯU
- **Đã enable:**
  - Hermes JavaScript engine
  - ProGuard minification
  - Resource shrinking
  - App Bundle format (auto-splits by ABI)
- **Ước tính:** AAB ~50-70MB (APK ~80-100MB)

### ⚠️ 10. Network status detection (web)

- **Trạng thái:** ⚠️ WARNING
- **Ghi chú:** Luôn hiện OFFLINE trên web do web API khác - cần fix cho web platform

---

## 📋 BUILD COMMANDS

### Cho Android APK (Testing)

```bash
# Sử dụng EAS Build (cloud-based)
eas build --platform android --profile preview

# Hoặc local build (cần Linux/macOS)
cd android && ./gradlew assembleRelease
```

### Cho Android AAB (Production - Google Play)

```bash
eas build --platform android --profile production
```

### Cho iOS (Cần Apple Developer Account $99/năm)

```bash
eas build --platform ios --profile production
```

---

## 📅 NEXT STEPS

1. [ ] Build APK preview để test trên thiết bị thật
2. [ ] Chụp screenshots từ app chạy thật
3. [ ] Tạo Feature Graphic (dùng Canva/Figma)
4. [ ] Đăng ký Google Play Console ($25)
5. [ ] Submit internal testing
6. [ ] Build AAB production
7. [ ] Submit Google Play Review

---

## ⚠️ LƯU Ý QUAN TRỌNG

1. **Keystore:** Backup file `android/app/release.keystore` - mất keystore = không thể update app
2. **Windows:** Không thể build local, phải dùng EAS Build (cloud)
3. **EAS Quota:** Free tier có 30 builds/tháng
4. **Review Time:** Google Play 1-7 ngày, lần đầu thường lâu hơn

---

_Cập nhật bởi: GitHub Copilot CLI_
