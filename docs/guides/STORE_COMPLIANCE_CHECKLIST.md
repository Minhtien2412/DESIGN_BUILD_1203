# 📱 STORE COMPLIANCE CHECKLIST

## Google Play Store & Apple App Store Requirements

---

## 🎯 VẤN ĐỀ HIỆN TẠI

### 1. Build trên Windows

**Lỗi:** `Unsupported platform, macOS or Linux is required to build apps for Android`

**Giải pháp:**

```bash
# Sử dụng EAS Build (cloud-based) - KHUYẾN NGHỊ
eas build --platform android --profile preview

# Hoặc sử dụng WSL2 trên Windows
# 1. Cài đặt WSL2
wsl --install

# 2. Trong WSL, cài đặt Node.js và Android SDK
```

### 2. Account bị giới hạn build

**Giải pháp:**

- Upgrade lên EAS Pro plan ($99/tháng) để có unlimited builds
- Hoặc đợi reset monthly quota (free tier: 30 builds/tháng)
- Build locally trên macOS/Linux

---

## 📋 GOOGLE PLAY STORE REQUIREMENTS

### A. Technical Requirements ✅

| Tiêu chí          | Trạng thái    | Yêu cầu                              |
| ----------------- | ------------- | ------------------------------------ |
| Target SDK        | ✅ 35         | Tối thiểu 34 (Android 14) từ 08/2024 |
| 64-bit support    | ✅            | Bắt buộc                             |
| App Bundle (.aab) | ⚠️ Cần config | Bắt buộc cho production              |
| Min SDK           | ✅ 24         | Không bắt buộc cụ thể                |
| ProGuard/R8       | ✅ Enabled    | Khuyến nghị                          |

### B. Content Requirements

| Tiêu chí         | Trạng thái | Hành động             |
| ---------------- | ---------- | --------------------- |
| Privacy Policy   | ❌ Thiếu   | Cần tạo URL           |
| Data Safety Form | ❌ Thiếu   | Cần điền              |
| Content Rating   | ❌ Thiếu   | Cần questionnaire     |
| Target Audience  | ❌ Thiếu   | Chọn 18+              |
| Ads Declaration  | ❌ Thiếu   | Khai báo không có ads |

### C. Visual Assets

| Asset              | Kích thước         | Trạng thái |
| ------------------ | ------------------ | ---------- |
| App Icon           | 512x512            | ✅         |
| Feature Graphic    | 1024x500           | ❌ Cần tạo |
| Screenshots Phone  | 2-8 ảnh, min 320px | ❌ Cần tạo |
| Screenshots Tablet | 2-8 ảnh (optional) | ❌         |

### D. Store Listing

```
✅ Short Description: 80 ký tự max
✅ Full Description: 4000 ký tự max
❌ Category: Chưa chọn (Business/Productivity)
❌ Contact Email: Cần thêm
❌ Privacy Policy URL: Cần thêm
```

---

## 🍎 APPLE APP STORE REQUIREMENTS

### A. Technical Requirements

| Tiêu chí               | Trạng thái      | Yêu cầu             |
| ---------------------- | --------------- | ------------------- |
| Xcode Version          | N/A             | Cần macOS để build  |
| iOS Deployment Target  | ✅ 13.4         | Khuyến nghị 15.0+   |
| App Transport Security | ✅              | HTTPS required      |
| 64-bit                 | ✅              | Bắt buộc            |
| Privacy Manifest       | ⚠️ Cần kiểm tra | Bắt buộc từ 05/2024 |

### B. App Store Connect Requirements

| Tiêu chí                | Trạng thái | Ghi chú                               |
| ----------------------- | ---------- | ------------------------------------- |
| Apple Developer Account | ❌         | $99/năm                               |
| Bundle ID               | ✅         | com.adminmarketingnx.APP_DESIGN_BUILD |
| App Category            | ❌         | Business                              |
| Age Rating              | ❌         | 4+ hoặc 12+                           |
| Privacy Policy          | ❌         | Bắt buộc                              |
| App Privacy Details     | ❌         | Data collection disclosure            |

### C. Visual Assets (iOS)

| Asset             | Kích thước               | Trạng thái |
| ----------------- | ------------------------ | ---------- |
| App Icon          | 1024x1024 (no alpha)     | ✅         |
| Screenshots 6.5"  | 1284x2778 hoặc 1242x2688 | ❌         |
| Screenshots 5.5"  | 1242x2208                | ❌         |
| iPad Screenshots  | 2048x2732                | ❌         |
| App Preview Video | 15-30 giây (optional)    | ❌         |

---

## 🔧 CÁC CẢI TIẾN CẦN THỰC HIỆN

### Priority 1: Critical (Bắt buộc để submit)

#### 1. Tạo Privacy Policy

```markdown
URL: https://baotienweb.cloud/privacy-policy

Nội dung cần có:

- Dữ liệu thu thập (email, phone, location, camera)
- Mục đích sử dụng
- Chia sẻ với bên thứ 3
- Bảo mật dữ liệu
- Quyền của người dùng
- Liên hệ
```

#### 2. Tạo Feature Graphic (1024x500)

```
- Background gradient xanh lá
- Logo APP Design Build
- Slogan: "Thiết kế & Xây dựng thông minh"
- Screenshots mini của app
```

#### 3. Tạo Screenshots

```
Cần 4-8 screenshots cho mỗi kích thước:
1. Màn hình chính (Home)
2. Marketplace sản phẩm
3. Chat/Communication
4. Quản lý dự án
5. AI Assistant
6. Profile/Settings
```

#### 4. Fix App Name

```json
// app.json - Đổi tên chuyên nghiệp hơn
"name": "Design Build Pro"
// hoặc
"name": "Thiết Kế Xây Dựng"
```

### Priority 2: Recommended

#### 1. Data Safety Form (Google Play)

```yaml
Data collected:
  - Email: Yes (Account)
  - Phone: Yes (Account)
  - Location: Yes (Features)
  - Photos: Yes (Features)
  - Files: Yes (Features)

Data shared:
  - With service providers: Yes
  - For analytics: Yes

Security:
  - Data encrypted in transit: Yes
  - Data can be deleted: Yes
```

#### 2. App Privacy (Apple)

```yaml
Data Types:
  Contact Info:
    - Email: Yes (App Functionality)
    - Phone: Yes (App Functionality)
  Location:
    - Precise Location: Yes (App Functionality)
  Identifiers:
    - User ID: Yes (App Functionality)
  Usage Data:
    - Product Interaction: Yes (Analytics)
```

### Priority 3: Optimization

#### 1. Giảm APK Size

```bash
# Hiện tại: ~130MB - Cần giảm xuống < 100MB

# Cách giảm:
1. Enable Hermes engine
2. Remove unused dependencies
3. Optimize images
4. Enable code splitting
```

#### 2. Performance Optimization

```javascript
// app.config.ts - Thêm optimization
android: {
  enableProguardInReleaseBuilds: true,
  enableShrinkResourcesInReleaseBuilds: true,
}
```

---

## 📦 ĐỊNH DẠNG XUẤT FILE

### Cho Google Play Store (Production)

```bash
# App Bundle (.aab) - BẮT BUỘC
eas build --platform android --profile production

# Output: .aab file (signed)
```

### Cho Apple App Store

```bash
# IPA file
eas build --platform ios --profile production

# Cần Apple Developer Account ($99/năm)
# Cần macOS để submit qua Xcode/Transporter
```

### Cho Testing (APK)

```bash
# Debug APK
eas build --platform android --profile preview

# Output: .apk file (có thể cài trực tiếp)
```

---

## 🚀 HƯỚNG DẪN SUBMIT

### Google Play Store

1. **Tạo Developer Account**
   - URL: https://play.google.com/console
   - Phí: $25 (một lần)

2. **Tạo App**
   - Create app → Free → Vietnamese

3. **Điền Store Listing**
   - App name, descriptions
   - Screenshots, feature graphic
   - Category: Business

4. **App Content**
   - Privacy policy URL
   - Data safety form
   - Content rating questionnaire
   - Target audience: 18+

5. **Upload AAB**
   - Production → Create release
   - Upload .aab file
   - Release notes

6. **Submit Review**
   - Review time: 1-7 ngày
   - First submission thường lâu hơn

### Apple App Store

1. **Tạo Developer Account**
   - URL: https://developer.apple.com
   - Phí: $99/năm

2. **App Store Connect**
   - Tạo app mới
   - Bundle ID phải match

3. **Upload Build**
   - Dùng Xcode hoặc Transporter
   - Cần macOS

4. **App Information**
   - Screenshots cho tất cả devices
   - App Privacy
   - Age Rating

5. **Submit Review**
   - Review time: 1-3 ngày
   - Có thể bị reject nếu vi phạm guidelines

---

## ⚠️ COMMON REJECTION REASONS

### Google Play

1. ❌ Missing privacy policy
2. ❌ Incomplete data safety form
3. ❌ Misleading app name/description
4. ❌ Requesting unnecessary permissions
5. ❌ Crashes on launch
6. ❌ Broken core functionality

### Apple App Store

1. ❌ Crashes/bugs
2. ❌ Incomplete functionality
3. ❌ Privacy violations
4. ❌ Misleading marketing
5. ❌ Poor user interface
6. ❌ Missing login demo account

---

## 📅 ACTION PLAN

### Tuần 1

- [ ] Tạo Privacy Policy page
- [ ] Tạo Feature Graphic
- [ ] Chụp Screenshots (6-8 ảnh)
- [ ] Fix lỗi "Unexpected text node"

### Tuần 2

- [ ] Build APK để test
- [ ] Điền Data Safety Form
- [ ] Tạo Google Play Console account
- [ ] Submit internal testing

### Tuần 3

- [ ] Build AAB production
- [ ] Submit Google Play Review
- [ ] Chuẩn bị Apple Developer Account (nếu cần iOS)

### Tuần 4

- [ ] Theo dõi review feedback
- [ ] Fix issues nếu có
- [ ] Release to production

---

## 📞 LIÊN HỆ HỖ TRỢ

- **Google Play Console Help:** https://support.google.com/googleplay/android-developer
- **Apple Developer Support:** https://developer.apple.com/support/
- **EAS Build Documentation:** https://docs.expo.dev/build/introduction/
