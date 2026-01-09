# 🚀 KẾ HOẠCH XUẤT BẢN APK - CÁC MÔI TRƯỜNG

**Ngày tạo:** 09/01/2026  
**Phiên bản:** 1.0.0  
**Mục tiêu:** Hoàn thiện cấu hình các môi trường và xuất bản APK lên Production

---

## 📋 TỔNG QUAN MÔI TRƯỜNG

| Môi trường | API URL | Mục đích | Build Profile |
|------------|---------|----------|---------------|
| **Development** | `http://localhost:4000` | Dev local | `development` |
| **Preview** | `https://baotienweb.cloud/api/v1` | Internal testing | `preview` |
| **Production** | `https://api.thietkeresort.com.vn` | Public release | `production` |

---

## 🔧 1. CẤU HÌNH MÔI TRƯỜNG

### 1.1 Environment Files

```
📁 Root/
├── .env                    # Development (mặc định)
├── .env.production         # Production override
├── .env.example            # Template
├── eas.json                # EAS Build profiles
├── app.config.ts           # Expo config (đọc env vars)
└── config/env.ts           # ENV constants cho app
```

### 1.2 Biến môi trường quan trọng

| Biến | Development | Production |
|------|-------------|------------|
| `EXPO_PUBLIC_API_BASE_URL` | `http://localhost:4000` | `https://api.thietkeresort.com.vn` |
| `EXPO_PUBLIC_WS_URL` | `ws://localhost:4000` | `wss://api.thietkeresort.com.vn/ws` |
| `EXPO_PUBLIC_ENV` | `development` | `production` |
| `EXPO_PUBLIC_API_DEBUG` | `true` | `false` |
| `EXPO_PUBLIC_API_KEY` | `dev-key` | `production-key` |

---

## 📱 2. EAS BUILD PROFILES

### File: `eas.json`

```json
{
  "cli": {
    "version": ">= 4.0.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      },
      "env": {
        "EXPO_PUBLIC_ENV": "development",
        "EXPO_PUBLIC_API_DEBUG": "true"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      },
      "env": {
        "EXPO_PUBLIC_ENV": "staging",
        "EXPO_PUBLIC_API_BASE_URL": "https://baotienweb.cloud/api/v1"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      },
      "env": {
        "EXPO_PUBLIC_ENV": "production",
        "EXPO_PUBLIC_API_BASE_URL": "https://api.thietkeresort.com.vn",
        "EXPO_PUBLIC_API_DEBUG": "false"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./pc-api-key.json",
        "track": "internal"
      }
    }
  }
}
```

---

## 🛠️ 3. CHECKLIST TRƯỚC KHI BUILD

### 3.1 Cấu hình cơ bản

- [ ] **app.config.ts** - Cập nhật version, package name
- [ ] **eas.json** - Kiểm tra build profiles
- [ ] **assets/images/** - Icons, splash screen đầy đủ
- [ ] **Google Services** - `google-services.json` (Android), `GoogleService-Info.plist` (iOS)

### 3.2 Environment Variables

- [ ] `.env.production` - Đúng API URLs
- [ ] API Keys - Production keys configured
- [ ] WebSocket URLs - WSS protocol cho production
- [ ] Google OAuth Client IDs - Đúng theo package name

### 3.3 Permissions

- [ ] Camera, Microphone
- [ ] Location (fine, coarse)
- [ ] Storage (media, external)
- [ ] Notifications
- [ ] Biometrics

### 3.4 Code Quality

- [ ] Không còn `console.log` debug
- [ ] Error handling đầy đủ
- [ ] No TypeScript errors
- [ ] No unused imports

---

## 🔨 4. COMMANDS BUILD APK

### 4.1 Development Build (Debug)

```powershell
# Build APK cho dev/test nội bộ
eas build -p android --profile development

# Hoặc local build (không cần EAS account)
npx expo run:android --variant debug
```

### 4.2 Preview Build (Internal Testing)

```powershell
# Build APK để test trước production
eas build -p android --profile preview

# Download APK từ EAS dashboard sau khi build xong
```

### 4.3 Production Build (Release)

```powershell
# Build AAB cho Google Play Store
eas build -p android --profile production

# Hoặc build APK production (cài trực tiếp)
eas build -p android --profile production --local
```

### 4.4 Submit lên Play Store

```powershell
# Sau khi build production xong
eas submit -p android --profile production
```

---

## 📦 5. ASSETS REQUIREMENTS

### 5.1 App Icons

| File | Size | Mục đích |
|------|------|----------|
| `icon.png` | 1024x1024 | Main icon |
| `adaptive-icon.png` | 1024x1024 | Android Adaptive |
| `favicon.png` | 48x48 | Web favicon |

### 5.2 Splash Screen

| File | Size | Mục đích |
|------|------|----------|
| `splash-icon.png` | 200x200 | Centered logo |
| `splash.png` | 1284x2778 | Full splash (optional) |

### 5.3 Adaptive Icon (Android)

```
assets/images/
├── android-icon-foreground.png  # 432x432 (với padding)
├── android-icon-background.png  # 432x432 (solid color)
└── android-icon-monochrome.png  # 432x432 (single color)
```

---

## 🔐 6. SIGNING & CREDENTIALS

### 6.1 Android Keystore

```powershell
# Tạo keystore mới (nếu chưa có)
keytool -genkeypair -v -storetype PKCS12 -keystore release.keystore -alias release -keyalg RSA -keysize 2048 -validity 10000

# Thông tin cần điền:
# - Keystore password
# - Key alias: release
# - Key password
# - CN=Your Name, OU=Your Unit, O=Your Organization
```

### 6.2 EAS Credentials

```powershell
# Quản lý credentials
eas credentials

# Hoặc để EAS tự tạo/quản lý
# (Khuyến nghị cho lần đầu)
```

### 6.3 Google Play Service Account

1. Tạo Service Account trong Google Cloud Console
2. Enable Google Play Developer API
3. Download JSON key → `pc-api-key.json`
4. Grant access trong Play Console

---

## 🌐 7. BACKEND CHECKLIST

### 7.1 Production Server

- [ ] **Domain:** `api.thietkeresort.com.vn`
- [ ] **SSL:** HTTPS/WSS configured
- [ ] **Database:** PostgreSQL production
- [ ] **Redis:** Cache & sessions
- [ ] **PM2:** Process manager

### 7.2 API Endpoints Verify

```powershell
# Health check
curl https://api.thietkeresort.com.vn/health

# Auth test
curl -X POST https://api.thietkeresort.com.vn/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"xxx"}'

# Upload test (with token)
curl -X POST https://api.thietkeresort.com.vn/upload/avatar \
  -H "Authorization: Bearer {token}" \
  -F "avatar=@test.jpg"
```

### 7.3 CRM Integration

- [ ] Perfex CRM API accessible
- [ ] Token working (tested)
- [ ] Endpoints: customers, projects, tasks, invoices

---

## 📊 8. TESTING PLAN

### 8.1 Unit Tests

```powershell
# Run all tests
npm test

# Specific test file
npm test -- services/avatarService.test.ts
```

### 8.2 E2E Tests

```powershell
# Detox (if configured)
npm run e2e:android

# Manual testing checklist
```

### 8.3 Manual Testing Checklist

| Feature | Test Case | Status |
|---------|-----------|--------|
| Auth | Login với email/password | ⬜ |
| Auth | Login với Google OAuth | ⬜ |
| Auth | Logout | ⬜ |
| Profile | Upload avatar | ⬜ |
| Profile | Delete avatar | ⬜ |
| Profile | Edit profile | ⬜ |
| Home | Load dashboard data | ⬜ |
| Home | Pull to refresh | ⬜ |
| CRM | View projects | ⬜ |
| CRM | View customers | ⬜ |
| Navigation | All routes accessible | ⬜ |
| Notifications | Receive push | ⬜ |
| Offline | Cache working | ⬜ |

---

## 🚀 9. RELEASE WORKFLOW

### Step 1: Prepare

```powershell
# 1. Update version
# app.config.ts → version: "1.0.1"

# 2. Commit changes
git add .
git commit -m "release: v1.0.1"
git tag v1.0.1
git push origin main --tags
```

### Step 2: Build

```powershell
# 3. Build production
eas build -p android --profile production

# 4. Wait for build completion (~15-30 min)
# Check status: https://expo.dev/accounts/xxx/projects/xxx/builds
```

### Step 3: Test

```powershell
# 5. Download APK/AAB from EAS
# 6. Install on test devices
# 7. Run full test suite
```

### Step 4: Submit

```powershell
# 8. Submit to Play Store
eas submit -p android --profile production

# 9. Complete store listing in Play Console
# 10. Submit for review
```

### Step 5: Monitor

```powershell
# 11. Monitor crash reports (Firebase Crashlytics)
# 12. Check analytics
# 13. Respond to user reviews
```

---

## ⚡ 10. QUICK COMMANDS

### Development

```powershell
# Start dev server
npm start

# Start with clear cache
npm start -- --clear

# Android emulator
npm run android
```

### Build

```powershell
# Preview APK (internal)
eas build -p android --profile preview

# Production AAB
eas build -p android --profile production

# Local APK (no EAS)
npx expo run:android --variant release
```

### Debug

```powershell
# Check build logs
eas build:list

# View build details
eas build:view {buildId}

# Check credentials
eas credentials
```

---

## 📝 11. ENVIRONMENT CONFIG FILES

### File: `.env.development`

```dotenv
EXPO_PUBLIC_ENV=development
EXPO_PUBLIC_API_BASE_URL=http://localhost:4000
EXPO_PUBLIC_API_DEBUG=true
EXPO_PUBLIC_API_KEY=dev-api-key
EXPO_PUBLIC_WS_URL=ws://localhost:4000
```

### File: `.env.staging`

```dotenv
EXPO_PUBLIC_ENV=staging
EXPO_PUBLIC_API_BASE_URL=https://baotienweb.cloud/api/v1
EXPO_PUBLIC_API_DEBUG=true
EXPO_PUBLIC_API_KEY=staging-api-key
EXPO_PUBLIC_WS_URL=wss://baotienweb.cloud
```

### File: `.env.production`

```dotenv
EXPO_PUBLIC_ENV=production
EXPO_PUBLIC_API_BASE_URL=https://api.thietkeresort.com.vn
EXPO_PUBLIC_API_DEBUG=false
EXPO_PUBLIC_API_KEY=production-api-key-secure
EXPO_PUBLIC_WS_URL=wss://api.thietkeresort.com.vn/ws
EXPO_PUBLIC_PERFEX_CRM_URL=https://thietkeresort.com.vn/perfex_crm
```

---

## 📈 12. VERSION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 09/01/2026 | Initial release |

---

## 🆘 13. TROUBLESHOOTING

### Build Fails

```powershell
# Clear cache
eas build:list --status=errored
npx expo start --clear

# Check logs
eas build:view {buildId} --logs
```

### APK không cài được

- Kiểm tra Android version (min SDK 21)
- Enable "Unknown sources"
- Uninstall version cũ trước

### API không connect

- Verify URL trong `.env`
- Check SSL certificate
- Test với curl/Postman

### Push Notifications không hoạt động

- Check `google-services.json`
- Verify FCM configuration
- Test với Firebase Console

---

**✅ Tài liệu này cung cấp hướng dẫn đầy đủ để build và xuất bản APK cho cả 3 môi trường: Development, Preview, và Production.**
