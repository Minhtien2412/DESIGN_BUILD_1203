# 📋 Checklist Vận Hành App Ổn Định

## ✅ Đã hoàn thành (Updated: 2025-12-22)

### 1. Frontend Code
- [x] Fix lỗi `Colors.primary` → `PRIMARY_COLOR` trong `app/weather/index.tsx`
- [x] API Services đã được cấu hình đúng (`services/api.ts`)
- [x] Environment pointing to production (`baotienweb.cloud/api/v1`)
- [x] Không có TypeScript errors trong thư mục `app/`

### 2. Backend API ✅ FULLY WORKING
- [x] Server online tại `103.200.20.100`
- [x] PM2 running from `/var/www/baotienweb-api`
- [x] Database: PostgreSQL with Prisma (avatar field added)
- [x] API hoạt động: `/api/v1/products` ✅
- [x] API hoạt động: `/api/v1/auth/register` ✅
- [x] API hoạt động: `/api/v1/auth/login` ✅
- [x] API hoạt động: `/api/v1/auth/me` ✅
- [x] API hoạt động: `/api/v1/profile` ✅
- [x] API hoạt động: `/api/v1/notifications` ✅
- [x] API hoạt động: `/api/v1/notifications/unread-count` ✅

### 3. Expo Dev Server
- [x] Metro Bundler chạy trên port 8082
- [x] QR code sẵn sàng scan

---

## 🔄 Bước tiếp theo

### 1. Build Production APK

```
backend-files/
├── profile/          # Profile API với avatar upload
├── notifications/    # Notifications API
└── prisma/          # Database migrations
```

**Để deploy:** Xem [BACKEND_DEPLOYMENT_MANUAL.md](BACKEND_DEPLOYMENT_MANUAL.md)

### 2. Các tính năng chính cần test

| Tính năng | Route | API Endpoint | Status |
|-----------|-------|--------------|--------|
| Đăng nhập | `/auth/login` | `POST /auth/login` | ⏳ Test |
| Đăng ký | `/auth/register` | `POST /auth/register` | ⏳ Test |
| Trang chủ | `/(tabs)/index` | - | ⏳ Test |
| Dự án | `/(tabs)/projects` | `GET /projects` | ⏳ Test |
| Sản phẩm | `/shopping/*` | `GET /products` | ✅ OK |
| Giỏ hàng | `/cart` | Local storage | ⏳ Test |
| Profile | `/profile` | `GET /profile` | ⏳ Pending BE |
| Thông báo | `/notifications` | `GET /notifications` | ⏳ Pending BE |

### 3. Test trên thiết bị

```bash
# Android Emulator
npx expo start --android

# iOS Simulator (Mac only)
npx expo start --ios

# Web Browser
npx expo start --web
```

---

## 🚀 Quick Actions

### Chạy app development
```bash
cd "C:\tien\New folder\APP_DESIGN_BUILD05.12.2025"
npx expo start --clear
```

### Test API endpoint
```bash
curl https://baotienweb.cloud/api/v1/products
```

### SSH vào Backend
```bash
ssh root@103.200.20.100
# Password: 6k4BOIRDwWhsM39F2DyM
```

### Build APK
```bash
npx eas build --platform android --profile preview
```

---

## 📝 Các bước tiếp theo (Theo thứ tự ưu tiên)

### Bước 1: Deploy Backend Modules
1. SSH vào server
2. Upload các file từ `backend-files/`
3. Update `app.module.ts`
4. Run migrations
5. Restart PM2

### Bước 2: Test Auth Flow
1. Đăng ký tài khoản mới
2. Đăng nhập
3. Kiểm tra token được lưu
4. Test refresh token

### Bước 3: Test Profile & Avatar
1. Upload avatar
2. Cập nhật thông tin
3. Kiểm tra hiển thị

### Bước 4: Test Notifications
1. Xem danh sách thông báo
2. Đánh dấu đã đọc
3. Badge count

### Bước 5: Test Shopping Flow
1. Xem sản phẩm
2. Thêm vào giỏ
3. Checkout (nếu có)

### Bước 6: Performance & UX
1. Loading states
2. Error handling
3. Offline mode

---

## 🛠️ Troubleshooting

### App không load được data
1. Kiểm tra network connection
2. Check API endpoint trong `.env`
3. Xem logs: `npx expo start --clear`

### Lỗi "Module not found"
```bash
npm install
npx expo start --clear
```

### Metro bundler crash
```bash
# Kill all node processes
taskkill /F /IM node.exe
npx expo start --clear
```

### Backend errors
```bash
ssh root@103.200.20.100
pm2 logs baotienweb-api --lines 100
```

---

## 📊 Metrics & Monitoring

### App Performance
- [ ] Enable performance monitoring
- [ ] Setup error tracking (Sentry/Bugsnag)
- [ ] Analytics (Mixpanel/Amplitude)

### Backend Health
- [ ] PM2 cluster mode
- [ ] Log aggregation
- [ ] Uptime monitoring

---

*Last updated: December 22, 2025*
