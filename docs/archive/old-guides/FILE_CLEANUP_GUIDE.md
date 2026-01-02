# 🧹 FILE CLEANUP GUIDE - Dọn dẹp cấu trúc dự án

**Ngày tạo:** 22/12/2025  
**Mục tiêu:** Loại bỏ files duplicate/backup, tối ưu cấu trúc code

---

## 📊 THỐNG KÊ TỔNG QUAN

### Files cần review/xóa

| Loại | Số lượng | Dung lượng ước tính |
|------|----------|---------------------|
| Backup files (.backup) | 8 | ~50KB |
| Old versions (.old) | 2 | ~20KB |
| Duplicate screens | 6 | ~80KB |
| Test/Demo files | 3 | ~15KB |
| **TỔNG** | **19 files** | **~165KB** |

---

## 🗑️ DANH SÁCH FILES CẦN XÓA

### 1. Backup Files (.backup, .tsx.backup)

```bash
# Xóa tất cả backup files
rm app/(tabs)/index.backup.tsx
rm app/(tabs)/notifications.tsx.backup
rm app/profile/info.backup.tsx
rm app/profile/info.tsx.backup
rm app/profile/payment.backup.tsx
rm app/profile/security.backup.tsx
```

### 2. Old Versions (.old)

```bash
rm app/(tabs)/index.old.tsx
```

### 3. Migrated Files (.migrated.tsx)
*Chỉ xóa sau khi confirm version mới hoạt động*

```bash
# Review trước khi xóa
cat app/safety/incidents/index.migrated.tsx
cat app/safety/ppe/index.migrated.tsx
cat app/safety/training/index.migrated.tsx
cat app/safety/training/sessions.migrated.tsx
cat app/timeline/phases.migrated.tsx
```

### 4. Duplicate/Redundant Screens

| File | Reason | Action |
|------|--------|--------|
| `app/(tabs)/profile-luxury.tsx` | Có `profile.tsx` | MERGE hoặc XÓA |
| `app/(tabs)/profile-new.tsx` | Có `profile.tsx` | MERGE hoặc XÓA |
| `app/(tabs)/projects-luxury.tsx` | Có `projects.tsx` | MERGE hoặc XÓA |
| `app/(tabs)/notifications-luxury.tsx` | Có `notifications.tsx` | XÓA |
| `app/(tabs)/notifications-timeline.tsx` | Có `notifications.tsx` | MERGE hoặc XÓA |
| `app/(tabs)/home-construction.tsx` | Có `index.tsx` | XÓA |
| `app/(tabs)/modern-home.tsx` | Có `index.tsx` | XÓA |
| `app/profile/info-luxury.tsx` | Có `info.tsx` | MERGE hoặc XÓA |
| `app/profile/security-luxury.tsx` | Có `security.tsx` | MERGE hoặc XÓA |
| `app/profile/payment-luxury.tsx` | Có `payment.tsx` | MERGE hoặc XÓA |
| `app/profile/settings-luxury.tsx` | Có `settings.tsx` | MERGE hoặc XÓA |

---

## 📁 CẤU TRÚC SAU KHI DỌN DẸP

### app/(tabs)/ - Clean Structure

```
app/(tabs)/
├── _layout.tsx           ✅ Tab navigation layout
├── index.tsx             ✅ Home screen (9 layers)
├── projects.tsx          ✅ Projects tab
├── notifications.tsx     ✅ Notifications tab
├── profile.tsx           ✅ Profile tab
├── live.tsx              ✅ Livestream tab
├── contacts.tsx          ✅ Contacts
├── activity.tsx          ✅ Activity feed
├── call-test.tsx         ⚠️ REVIEW - có cần production không?
├── menu.tsx              ✅ Menu overlay
└── menu9.tsx             ⚠️ REVIEW - menu variant?
```

### app/profile/ - Clean Structure

```
app/profile/
├── menu.tsx              ✅ Profile menu
├── edit.tsx              ✅ Edit profile
├── info.tsx              ✅ Personal info
├── settings.tsx          ✅ Settings
├── security.tsx          ✅ Security settings
├── privacy.tsx           ✅ Privacy settings
├── payment.tsx           ✅ Payment methods
├── payment-methods.tsx   ⚠️ MERGE với payment.tsx
├── payment-history.tsx   ✅ Payment history
├── addresses.tsx         ✅ Delivery addresses
├── orders.tsx            ✅ Order history
├── favorites.tsx         ✅ Favorites/wishlist
├── reviews.tsx           ✅ User reviews
├── history.tsx           ✅ View history
├── rewards.tsx           ✅ Rewards/points
├── cloud.tsx             ✅ Cloud storage
├── portfolio/            ✅ Portfolio folder
├── portfolio.tsx         ⚠️ MERGE với portfolio/
├── notifications.tsx     ✅ Notification settings
├── permissions.tsx       ✅ App permissions
├── help.tsx              ✅ Help center
├── vouchers.tsx          ✅ Vouchers/coupons
├── my-products.tsx       ✅ Seller products
├── account-management.tsx ⚠️ MERGE với settings.tsx
├── personal-verification.tsx ✅ KYC verification
├── enhanced.tsx          ⚠️ REVIEW - có cần không?
└── file-upload-demo.tsx  ❌ XÓA - demo file
```

---

## 🔧 SCRIPT DỌN DẸP

### PowerShell Script

```powershell
# FILE_CLEANUP.ps1
# Chạy từ thư mục gốc project

Write-Host "🧹 Starting file cleanup..." -ForegroundColor Cyan

# 1. Xóa backup files
$backupFiles = @(
    "app/(tabs)/index.backup.tsx",
    "app/(tabs)/notifications.tsx.backup",
    "app/profile/info.backup.tsx",
    "app/profile/info.tsx.backup",
    "app/profile/payment.backup.tsx",
    "app/profile/security.backup.tsx"
)

foreach ($file in $backupFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "✓ Deleted: $file" -ForegroundColor Green
    }
}

# 2. Xóa old versions
$oldFiles = @(
    "app/(tabs)/index.old.tsx"
)

foreach ($file in $oldFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "✓ Deleted: $file" -ForegroundColor Green
    }
}

# 3. Move duplicates to archive (safer than delete)
$archiveDir = "_archived_files"
if (-not (Test-Path $archiveDir)) {
    New-Item -ItemType Directory -Path $archiveDir | Out-Null
}

$duplicateFiles = @(
    "app/(tabs)/profile-luxury.tsx",
    "app/(tabs)/profile-new.tsx",
    "app/(tabs)/notifications-luxury.tsx",
    "app/(tabs)/home-construction.tsx",
    "app/(tabs)/modern-home.tsx"
)

foreach ($file in $duplicateFiles) {
    if (Test-Path $file) {
        $dest = "$archiveDir/$(Split-Path $file -Leaf)"
        Move-Item $file $dest -Force
        Write-Host "→ Archived: $file" -ForegroundColor Yellow
    }
}

Write-Host "✅ Cleanup complete!" -ForegroundColor Green
```

---

## 📋 CHECKLIST TRƯỚC KHI XÓA

Với mỗi file duplicate:

- [ ] Kiểm tra file có đang được import ở đâu không
- [ ] Diff 2 files để xác định differences
- [ ] Merge features tốt hơn vào file chính
- [ ] Test app sau khi xóa
- [ ] Commit changes

### Lệnh kiểm tra imports

```bash
# Tìm files đang import profile-luxury
grep -r "profile-luxury" --include="*.tsx" --include="*.ts" .

# Tìm files đang import modern-home
grep -r "modern-home" --include="*.tsx" --include="*.ts" .
```

---

## 🎯 PRIORITY ORDER

### Phase 1: Safe Deletes (5 phút)
Xóa ngay, không cần review:
- ❌ `.backup` files
- ❌ `.old` files
- ❌ `file-upload-demo.tsx`

### Phase 2: Review & Archive (15 phút)
Archive trước, xóa sau nếu không cần:
- 📦 `profile-luxury.tsx`
- 📦 `profile-new.tsx`
- 📦 `home-construction.tsx`
- 📦 `modern-home.tsx`

### Phase 3: Merge & Delete (30 phút)
Merge features rồi xóa:
- 🔀 `settings-luxury.tsx` → `settings.tsx`
- 🔀 `security-luxury.tsx` → `security.tsx`
- 🔀 `info-luxury.tsx` → `info.tsx`

---

## ⚠️ LƯU Ý QUAN TRỌNG

1. **Backup trước khi xóa**
   ```bash
   git add -A
   git commit -m "chore: backup before cleanup"
   ```

2. **Test sau mỗi phase**
   ```bash
   npm start
   # Kiểm tra app có lỗi không
   ```

3. **Kiểm tra navigation**
   ```bash
   npm run test:routes
   # Đảm bảo không có route bị break
   ```

---

## 📈 KẾT QUẢ MONG ĐỢI

| Metric | Trước | Sau | Giảm |
|--------|-------|-----|------|
| Files trong (tabs) | 21 | 11 | -10 |
| Files trong profile | 35 | 25 | -10 |
| Total duplicate files | 19 | 0 | -19 |
| Bundle size estimate | ~3.2MB | ~3.0MB | -200KB |

---

*Document created: 22/12/2025*
