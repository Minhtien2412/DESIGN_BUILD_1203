# Phase 2: Route Restructure Plan

**Ngày phân tích:** 02/01/2026  
**Trạng thái:** 🔄 Đang thực hiện

---

## 📊 Phân tích hiện trạng

### 1. Duplicate/Variant Routes cần xử lý

| File | Mục đích | Đề xuất |
|------|----------|---------|
| `(tabs)/profile.tsx` | Profile chính | ✅ GIỮ LẠI |
| `(tabs)/profile-luxury.tsx` | Profile luxury variant | ❌ Di chuyển → `profile/variants/` |
| `(tabs)/profile-new.tsx` | Profile new variant | ❌ XÓA hoặc merge |
| `(tabs)/notifications.tsx` | Notifications chính | ✅ GIỮ LẠI |
| `(tabs)/notifications-luxury.tsx` | Luxury variant | ❌ Di chuyển → `notifications/variants/` |
| `(tabs)/notifications-timeline.tsx` | Timeline variant | ❌ Di chuyển → `notifications/variants/` |
| `(tabs)/projects.tsx` | Projects chính | ✅ GIỮ LẠI |
| `(tabs)/projects-luxury.tsx` | Luxury variant | ❌ Di chuyển → `projects/variants/` |
| `(tabs)/modern-home.tsx` | Home variant | ❌ Xem xét merge/remove |
| `(tabs)/home-construction.tsx` | Construction home | ✅ GIỮ (nếu cần thiết) |

### 2. Shopping Routes - Cần gộp

**Hiện tại:** `app/shopping/` có 25+ files

| Category | Files |
|----------|-------|
| Vật liệu | `vat-lieu-xay.tsx`, `gach-men.tsx`, `son.tsx` |
| Điện nước | `dien.tsx`, `nuoc.tsx` |
| Thiết bị | `thiet-bi-bep.tsx`, `thiet-bi-ve-sinh.tsx`, `dieu-hoa.tsx`, `pccc.tsx` |
| Nội thất | `noi-that.tsx`, `sofa.tsx`, `ban-an.tsx`, `ban-hoc.tsx`, `cua.tsx` |
| Chức năng | `cart.tsx`, `compare.tsx`, `flash-sale.tsx`, `products-catalog.tsx` |

**Đề xuất cấu trúc mới:**
```
app/shopping/
├── index.tsx                    # Main shopping page
├── cart.tsx                     # Cart
├── compare.tsx                  # Compare products
├── flash-sale.tsx               # Flash sales
├── [category].tsx               # Dynamic category page
├── product/
│   └── [id].tsx                 # Product detail
├── categories/
│   ├── vat-lieu/               # Vật liệu xây dựng
│   ├── dien-nuoc/              # Điện nước
│   ├── thiet-bi/               # Thiết bị
│   └── noi-that/               # Nội thất
└── _layout.tsx
```

### 3. Naming Convention Issues

| Vấn đề | Files | Đề xuất |
|--------|-------|---------|
| Vietnamese names | `ban-an.tsx`, `cua.tsx`, etc. | Giữ nguyên (OK cho SEO tiếng Việt) |
| Inconsistent casing | Mixed kebab-case | Chuẩn hóa tất cả thành kebab-case |
| `-luxury`, `-new` suffixes | Multiple files | Di chuyển vào `/variants/` |

---

## 🔧 Kế hoạch thực hiện

### Step 1: Cleanup Tab Variants (Ưu tiên cao)
- [x] Analyze variant files
- [ ] Create `app/(tabs)/_archive/` for variants we want to keep but hide
- [ ] Remove from tab navigation
- [ ] Update _layout.tsx

### Step 2: Consolidate Shopping Categories
- [ ] Keep dynamic `[category].tsx` as main handler
- [ ] Remove individual category files
- [ ] Update navigation links

### Step 3: Profile Route Cleanup
- [ ] Merge luxury/new variants into main profile
- [ ] Remove duplicates

### Step 4: Messages/Chat Consolidation
- [ ] `(tabs)/menu9.tsx` → rename/move to `messages/chat.tsx`
- [ ] Consolidate with existing `messages/` folder

---

## ⚠️ Rủi ro & Lưu ý

1. **Breaking Navigation:** Cần cập nhật tất cả router.push() calls
2. **Deep Links:** Kiểm tra external deep links
3. **Git History:** Commit mỗi step để dễ rollback

---

## 📋 Files cần xử lý

### Xóa/Archive (14 files):
```
(tabs)/profile-luxury.tsx
(tabs)/profile-new.tsx
(tabs)/notifications-luxury.tsx
(tabs)/notifications-timeline.tsx
(tabs)/projects-luxury.tsx
(tabs)/modern-home.tsx
(tabs)/activity.tsx
(tabs)/menu9.tsx (rename to chat)
shopping/ban-an.tsx (merge to [category])
shopping/ban-hoc.tsx
shopping/cua.tsx
shopping/dien.tsx
shopping/nuoc.tsx
... (more category files)
```

### Giữ lại:
```
(tabs)/index.tsx ✅
(tabs)/projects.tsx ✅
(tabs)/notifications.tsx ✅
(tabs)/profile.tsx ✅
(tabs)/live.tsx ✅
(tabs)/menu.tsx ✅
(tabs)/home-construction.tsx ✅
shopping/index.tsx ✅
shopping/cart.tsx ✅
shopping/[category].tsx ✅
shopping/product/[id].tsx ✅
```

---

## 🚀 Bắt đầu thực hiện?

Xác nhận để tiếp tục từng bước.
