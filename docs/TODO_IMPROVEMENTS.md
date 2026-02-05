# 📋 TODO - CẢI TIẾN ỨNG DỤNG

> **Created:** 04/02/2026  
> **Status:** In Progress  
> **Priority:** High → Medium → Low

---

## 🎯 MỤC TIÊU TỔNG QUAN

1. ✅ Chỉnh sửa trang Profile và các trang con - UI hoàn thiện
2. ⏳ Trang chủ và chức năng theo chuẩn BE
3. ⏳ Loại bỏ dữ liệu demo → dữ liệu thật
4. ⏳ Thêm các quyền cần thiết (call, SMS, contacts, etc.)
5. ⏳ Tái sử dụng dữ liệu có sẵn từ smartphone

---

## 📱 1. QUYỀN TRUY CẬP THIẾT BỊ

### ✅ Đã hoàn thành (devicePermissions.ts - Updated 04/02/2026)

- [x] Camera - Chụp ảnh, quay video
- [x] Storage/Gallery - Truy cập ảnh, video
- [x] Location - Vị trí GPS
- [x] Notifications - Push notifications
- [x] Microphone - Placeholder
- [x] **Contacts** - Đọc/tìm kiếm danh bạ điện thoại ✨NEW
- [x] **Phone Call** - Gọi điện trực tiếp (`makePhoneCall()`) ✨NEW
- [x] **SMS** - Gửi tin nhắn SMS (`sendSMS()`) ✨NEW
- [x] **Email** - Mở ứng dụng email (`sendEmail()`) ✨NEW
- [x] **Maps** - Mở bản đồ (`openMaps()`) ✨NEW

### ⏳ Cần thêm (tùy chọn)

- [ ] **Calendar** - Đồng bộ lịch (expo-calendar)
- [ ] **Bluetooth** - Kết nối thiết bị IoT
- [ ] **NFC** - Thanh toán/quét thẻ (nâng cao)

### Các hàm mới đã thêm vào devicePermissions.ts:

```typescript
// Contacts
requestContactsPermission(): Promise<PermissionStatus>
checkContactsPermission(): Promise<PermissionStatus>
getDeviceContacts(options?): Promise<Contact[]>
searchContacts(query): Promise<Contact[]>

// Communication
makePhoneCall(phoneNumber): Promise<boolean>
sendSMS(phoneNumber, message?): Promise<boolean>
sendEmail(to, subject?, body?): Promise<boolean>
openMaps(latitude, longitude, label?): Promise<boolean>
```

### Smartphone Data tái sử dụng:

- ✅ Danh bạ → Gợi ý thêm liên hệ, mời vào dự án
- ⏳ Lịch → Đồng bộ deadline, meeting
- ✅ Ảnh/Video → Upload hình ảnh công trình
- ✅ GPS → Định vị công trình, tính khoảng cách
- ✅ Gọi điện → Liên hệ nhà thầu, khách hàng trực tiếp

---

## 👤 2. TRANG PROFILE & CÁC TRANG CON

### Profile Chính (features/profile/ProfileScreenRedesigned.tsx)

- [x] Hiển thị thông tin user từ API
- [x] Stats (projects, tasks, orders)
- [x] Quick actions (messages, calls, contacts, settings)
- [x] Menu sections (account, features, support)
- [ ] **FIX:** Avatar upload error handling
- [ ] **FIX:** Stats loading skeleton

### Profile Sub-pages

| Route                 | File             | Status | Issues                               |
| --------------------- | ---------------- | ------ | ------------------------------------ |
| /profile/edit         | edit.tsx         | ⏳     | Import path lỗi `device-permissions` |
| /profile/addresses    | addresses/       | ⏳     | UI chưa responsive                   |
| /profile/payment      | payment/         | ⏳     | Chưa kết nối API                     |
| /profile/orders       | orders.tsx       | ⏳     | Cần pagination                       |
| /profile/favorites    | favorites.tsx    | ⏳     | Sync với FavoritesContext            |
| /profile/history      | history.tsx      | ⏳     | Cần clear history function           |
| /profile/portfolio    | portfolio/       | ⏳     | Upload works API                     |
| /profile/reviews      | reviews.tsx      | ⏳     | Rating system BE                     |
| /profile/rewards      | rewards.tsx      | ⏳     | Points/voucher system                |
| /profile/qr-code      | qr-code.tsx      | ⏳     | QR generation                        |
| /profile/verify-phone | verify-phone.tsx | ⏳     | OTP flow                             |
| /profile/achievements | achievements.tsx | ⏳     | Gamification                         |

---

## ⚙️ 3. TRANG SETTINGS

### Settings Chính (app/settings/index.tsx)

- [x] General settings (language, theme)
- [x] Notification settings
- [x] Privacy settings
- [x] Biometric toggle
- [ ] **ADD:** Clear cache option

### Settings Sub-pages

| Route                            | File            | Status | Notes            |
| -------------------------------- | --------------- | ------ | ---------------- |
| /settings/account/security       | security.tsx    | ✅     | 2FA, sessions    |
| /settings/account/privacy        | privacy.tsx     | ✅     | Visibility opts  |
| /settings/preferences/appearance | appearance.tsx  | ✅     | Theme selection  |
| /settings/preferences/language   | language.tsx    | ⏳     | i18n integration |
| /settings/data/cloud             | cloud.tsx       | ⏳     | Backup/restore   |
| /settings/data/permissions       | permissions.tsx | ✅     | Full working     |

---

## 🏠 4. TRANG CHỦ (HOME)

### Home Sections (components/home/)

| Section         | Component             | BE API               | Status       |
| --------------- | --------------------- | -------------------- | ------------ |
| Quick Actions   | QuickActionsGrid      | N/A                  | ✅           |
| Weather Widget  | WeatherWidget         | /api/weather         | ⏳ Demo data |
| Main Services   | ServicesGrid          | /services            | ⏳ Demo data |
| Live Streams    | LiveSection           | /livestreams         | ⏳ Demo data |
| Flash Sale      | FlashSaleSection      | /flash-sales         | ⏳ Demo data |
| Top Workers     | TopWorkersSection     | /workers/top         | ⏳ Demo data |
| Design Utils    | DesignUtilsGrid       | /services/design     | ⏳ Demo data |
| Interior        | InteriorSection       | /categories/interior | ⏳ Demo data |
| House Library   | HouseLibrarySection   | /houses/library      | ⏳ Demo data |
| Workers Rough   | WorkersRoughSection   | /workers/rough       | ⏳ Demo data |
| Workers Finish  | WorkersFinishSection  | /workers/finish      | ⏳ Demo data |
| Videos          | VideosSection         | /videos              | ⏳ Demo data |
| Recent Projects | RecentProjectsSection | /projects/recent     | ⏳           |

### Home Data Service (services/homeDataService.ts)

- [x] API transform functions đã sẵn sàng
- [x] Fallback to mock data nếu API fail
- [ ] Kết nối API thật (cần backend deploy endpoints)
- [ ] Cache strategy với AsyncStorage
- [ ] Pagination cho từng section

---

## 📊 5. DỮ LIỆU DEMO → DỮ LIỆU THẬT

### Cần thêm vào Database (Backend)

```sql
-- Workers/Nhà thầu
INSERT INTO workers (name, specialty, rating, jobs_completed, ...)

-- Services/Dịch vụ
INSERT INTO services (name, category, price, description, ...)

-- Houses/Mẫu nhà
INSERT INTO house_templates (name, type, area, style, images, ...)

-- Flash Sales
INSERT INTO flash_sales (product_id, discount, start_time, end_time, ...)
```

### ✅ Seed Data Created (data/seedData.ts)

- [x] 9 Workers (rough, finishing, electrical, plumbing)
- [x] 5 Services (architecture, interior, construction, renovation, consulting)
- [x] 3 House Templates (townhouse, villa, single-story)
- [x] 3 Flash Sales with countdown
- [x] 2 Livestreams
- [x] 3 Banners
- [x] 17 Categories

### Data Sources

- [x] Seed data từ file JSON ✅
- [ ] Admin panel để quản lý
- [ ] Import từ Excel/CSV

---

## 🔧 6. FIXES ĐÃ HOÀN THÀNH

### ✅ Import Errors Fixed

- [x] `device-permissions` → `devicePermissions` (profile/edit.tsx)
- [x] `requestMediaLibraryPermission` → `requestStoragePermission`

### ✅ UI Improvements Added

- [x] Loading Skeletons (components/ui/Skeleton.tsx) - Enhanced with:
  - SkeletonGrid for categories
  - SkeletonHorizontalList for product lists
  - SkeletonHome for home screen
  - SkeletonProfile for profile screen
  - SkeletonWorkerCard, SkeletonProductCard, SkeletonServiceCard

### UI Issues (Pending)

- [ ] Dark mode consistency
- [ ] Safe area padding
- [x] Loading skeletons ✅
- [ ] Error boundaries
- [ ] Empty states

### Performance (Pending)

- [ ] Image optimization (FastImage)
- [ ] List virtualization
- [ ] Memoization

---

## 🌐 7. i18n & LOCALIZATION ✅ NEW

### ✅ Created lib/i18n.ts

- [x] Vietnamese (vi) translations - Full
- [x] English (en) translations - Full
- [x] Translation categories: common, auth, home, profile, settings, cart, workers, services, projects, chat, notifications, errors, time, permissions

### ✅ Created context/LanguageContext.tsx

- [x] LanguageProvider
- [x] useLanguage hook
- [x] useTranslation hook
- [x] withTranslation HOC

### ✅ Created app/settings/language.tsx

- [x] Language selection UI
- [x] Persist to AsyncStorage
- [x] Real-time language switch

---

## ☁️ 8. CLOUD BACKUP ✅ NEW

### ✅ Created services/cloudBackupService.ts

- [x] createCloudBackup() - Backup to server
- [x] restoreFromCloud() - Restore from server
- [x] getBackupList() - List all backups
- [x] deleteBackup() - Delete backup
- [x] createLocalBackup() - Offline fallback
- [x] restoreFromLocalBackup()
- [x] getLocalBackups()
- [x] isAutoBackupDue() - Check if 24h passed

### ✅ Created app/settings/cloud-backup.tsx

- [x] Backup status card
- [x] Create backup button
- [x] Restore button
- [x] Backup history list
- [x] Auto backup settings toggle
- [x] Wi-Fi only option

---

## 📅 TIMELINE

### Phase 1 (Tuần này) ✅ DONE

1. ✅ Fix import errors (profile/edit.tsx)
2. ✅ Thêm permissions (phone, contacts, SMS, email, maps)
3. ✅ Tạo useSmartPhone hook
4. ✅ Update PermissionsScreen với contacts

### Phase 2 (Tuần này) ✅ DONE

1. ✅ Create seedData.ts for backend
2. ✅ Enhanced Skeleton components
3. ✅ i18n system (Vietnamese + English)
4. ✅ Cloud backup service
5. ✅ Settings pages (language, cloud-backup)

### Phase 3 (Tuần sau)

1. ⏳ Kết nối BE APIs cho Home
2. ⏳ Profile sub-pages completion
3. ⏳ Dark mode consistency check
4. ⏳ Testing & QA

---

## 📝 NOTES

- Bundle test: `npx expo export --platform android`
- TypeScript check: `npx tsc --noEmit`
- Backend URL: `baotienweb.cloud`
- API Docs: `/docs/api-reference.md`

---

_Last Updated: 04/02/2026 - Phase 2 Completed_
