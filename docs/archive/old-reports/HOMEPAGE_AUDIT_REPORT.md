# 🔍 HOMEPAGE AUDIT REPORT - Báo cáo kiểm tra trang chủ

**Ngày tạo:** 22/12/2025  
**File chính:** `app/(tabs)/index.tsx`  
**Trạng thái:** 🟡 Cần sửa chữa  

---

## 📊 THỐNG KÊ TỔNG QUAN

### Test Results Summary

| Test | Kết quả | Tỷ lệ | Chi tiết |
|------|---------|-------|----------|
| Route File Verification | ❌ FAILED | 92.6% | 63/68 routes OK, 5 missing |
| Navigation Links Check | ❌ FAILED | 53.1% | 191/360 valid, 169 invalid |
| Naming Convention | ✅ PASSED | 100% | 71 routes OK, 4 warnings |

### Điểm số tổng thể: **72/100** ⚠️

---

## ❌ DANH SÁCH LỖI THEO MỨC ĐỘ

### 🔴 CRITICAL (Cần sửa ngay) - 5 lỗi

| # | Route | Vấn đề | Giải pháp |
|---|-------|--------|-----------|
| 1 | `/legal/index` | ✅ ĐÃ SỬA | Đã tạo file `app/legal/index.tsx` |
| 2 | `/shopping/index?cat=construction` | Query params trong route | Sử dụng dynamic route hoặc filter trong component |
| 3 | `/shopping/index?cat=electrical` | Query params trong route | Sử dụng dynamic route hoặc filter trong component |
| 4 | `/shopping/index?cat=furniture` | Query params trong route | Sử dụng dynamic route hoặc filter trong component |
| 5 | `/shopping/index?cat=paint` | Query params trong route | Sử dụng dynamic route hoặc filter trong component |

### 🟠 HIGH PRIORITY (Sửa sớm) - 32 lỗi trong index.tsx

| Dòng | Route Lỗi | Nên sửa thành |
|------|-----------|---------------|
| 216 | `/(tabs)/cart` | `/cart` (APP_ROUTES.CART) |
| 219 | `/(tabs)/menu` | Tạo `/profile/menu` hoặc xóa |
| 226 | `/profile/rewards` | Thêm vào APP_ROUTES hoặc tạo file |
| 288 | `/ai/index` | `/ai` (APP_ROUTES.AI_HUB) |
| 307 | `/construction/utilities` | Tạo file hoặc redirect |
| 340 | `/dashboard/admin` | `/admin/dashboard` |
| 403 | `/services/index` | Tạo file `app/services/index.tsx` |
| 566 | `/projects/create` | Thêm vào APP_ROUTES |
| 574 | `/live/create` | Thêm vào APP_ROUTES |

### 🟡 MEDIUM PRIORITY - Auth Routes (28 lỗi)

Các file trong `app/(auth)/` và components auth sử dụng routes không có trong APP_ROUTES:

| Route Pattern | Số lần dùng | Giải pháp |
|---------------|-------------|-----------|
| `/(auth)/login` | 15 | Thêm vào APP_ROUTES |
| `/(auth)/register` | 5 | Thêm vào APP_ROUTES |
| `/(auth)/auth-3d-flip` | 2 | Thêm vào APP_ROUTES |
| `/(auth)/forgot-password` | 1 | Thêm vào APP_ROUTES |
| `/(auth)/reset-password` | 1 | Thêm vào APP_ROUTES |
| `/(tabs)` | 14 | Sử dụng APP_ROUTES.HOME |

### 🟢 LOW PRIORITY - Profile Routes (38 lỗi)

| Route | File sử dụng | Cần thêm vào APP_ROUTES |
|-------|--------------|-------------------------|
| `/profile/settings` | profile-luxury.tsx | ✓ |
| `/profile/edit` | profile-luxury.tsx | ✓ |
| `/profile/portfolio` | profile-luxury.tsx | ✓ |
| `/profile/rewards` | index.tsx | ✓ |
| `/profile/cloud` | profile-luxury.tsx | ✓ |
| `/profile/info` | profile-new.tsx | ✓ |
| `/profile/payment` | profile-luxury.tsx | ✓ |
| `/profile/addresses` | profile-luxury.tsx | ✓ |
| `/profile/orders` | profile-luxury.tsx | ✓ |
| `/profile/favorites` | profile-luxury.tsx | ✓ |
| `/profile/reviews` | profile-luxury.tsx | ✓ |
| `/profile/privacy` | profile-luxury.tsx | ✓ |
| `/profile/security` | profile-luxury.tsx | ✓ |
| `/profile/permissions` | profile-luxury.tsx | ✓ |
| `/profile/help` | profile-luxury.tsx | ✓ |
| `/profile/notifications` | settings-luxury.tsx | ✓ |
| `/profile/history` | recently-viewed.tsx | ✓ |

---

## 🗺️ SƠ ĐỒ INTERNAL LINKS - TRANG CHỦ

### Cấu trúc 9 Layer Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           HOME SCREEN                                    │
│                        app/(tabs)/index.tsx                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ HEADER                                                             │   │
│  │ ├── Search → /search?q={query}                                    │   │
│  │ ├── Cart → ❌ /(tabs)/cart → ✅ /cart                             │   │
│  │ ├── Menu → ❌ /(tabs)/menu → ✅ /profile/menu                     │   │
│  │ └── Rewards → ❌ /profile/rewards (MISSING)                       │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ LAYER 1: MAIN SERVICES (8 mục) ✅ OK                               │   │
│  │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                               │   │
│  │ │Thiết │ │Thi   │ │Dự án │ │Tiến  │                               │   │
│  │ │kế nhà│ │công  │ │của tôi│ │độ   │                               │   │
│  │ │  ✅   │ │  ✅   │ │  ✅   │ │  ✅  │                               │   │
│  │ └──────┘ └──────┘ └──────┘ └──────┘                               │   │
│  │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                               │   │
│  │ │Vật   │ │Nhân  │ │Báo   │ │Site  │                               │   │
│  │ │liệu  │ │công  │ │giá   │ │map   │                               │   │
│  │ │  ✅   │ │  ✅   │ │  ✅   │ │  ✅  │                               │   │
│  │ └──────┘ └──────┘ └──────┘ └──────┘                               │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ AI WIDGET + BANNER                                                 │   │
│  │ └── AI Hub → ❌ /ai/index → ✅ /ai                                 │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ LAYER 2: CONSTRUCTION SERVICES (8 mục) ✅ OK                       │   │
│  │ See All → ❌ /construction/utilities (MISSING FILE)               │   │
│  │ ├── Ép cọc ✅    ├── Đào đất ✅   ├── Bê tông ✅   ├── Vật liệu ✅ │   │
│  │ ├── Thợ xây ✅   ├── Thợ điện ✅  ├── Cốp pha ✅   └── Design ✅   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ LAYER 3: MANAGEMENT TOOLS (8 mục) ✅ OK                            │   │
│  │ Settings → ❌ /dashboard/admin (MISSING)                          │   │
│  │ ├── Timeline ✅  ├── Ngân sách ✅  ├── QC/QA ✅   ├── An toàn ✅   │   │
│  │ ├── Tài liệu ✅  ├── Báo cáo ✅   ├── RFI ✅     └── Submittal ✅  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ LAYER 4: FINISHING WORKS (8 mục) ✅ OK - Horizontal Scroll         │   │
│  │ ├── Lát gạch ✅ [HOT]  ├── Sơn tường ✅ [NEW]  ├── Đá ✅           │   │
│  │ ├── Thạch cao ✅ [HOT] ├── Làm cửa ✅          ├── Lan can ✅      │   │
│  │ ├── Camera ✅ [NEW]    └── Thợ tổng hợp ✅                         │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ LAYER 5: PROFESSIONAL SERVICES (4 mục) ✅ OK                       │   │
│  │ See All → ❌ /services/index (MISSING FILE)                       │   │
│  │ ├── Thiết kế nội thất ✅   ├── Kiến trúc sư ✅                     │   │
│  │ ├── Giám sát CL ✅          └── Phong thủy ✅                       │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ LAYER 6: QUICK TOOLS (8 mục) ✅ OK                                 │   │
│  │ ├── Dự toán ✅      ├── QR Code ✅      ├── Bản đồ ✅ [NEW]        │   │
│  │ ├── Cửa hàng ✅     ├── AI Hub ✅ [NEW] ├── Live Stream ✅         │   │
│  │ ├── Video XD ✅     └── Tin nhắn ✅                                 │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ LAYER 7: SHOPPING (4 mục) ⚠️ QUERY PARAMS WARNING                  │   │
│  │ ├── Vật liệu XD → ⚠️ /shopping/index?cat=construction             │   │
│  │ ├── Thiết bị điện → ⚠️ /shopping/index?cat=electrical             │   │
│  │ ├── Nội thất → ⚠️ /shopping/index?cat=furniture                   │   │
│  │ └── Sơn & Màu → ⚠️ /shopping/index?cat=paint                      │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ LAYER 8: ADDITIONAL SERVICES (8 mục) ✅ OK                         │   │
│  │ ├── Đặt lịch ✅    ├── Video Call ✅  ├── Thông báo ✅            │   │
│  │ ├── Analytics ✅   ├── Contracts ✅   ├── Weather ✅               │   │
│  │ ├── Fleet ✅       └── Food ✅                                      │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ LAYER 9: ADVANCED FEATURES (4 mục) ✅ OK                           │   │
│  │ ├── Inspection ✅ [PRO]   ├── Warranty ✅ [PRO]                    │   │
│  │ ├── Risk Management ✅    └── Legal ✅ [NEW] (ĐÃ TẠO FILE)         │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ BOTTOM ACTION BAR                                                  │   │
│  │ ├── Tạo dự án → ❌ /projects/create (MISSING IN APP_ROUTES)       │   │
│  │ └── Livestream → ❌ /live/create (MISSING IN APP_ROUTES)          │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Thống kê Link Status

| Layer | Tổng Links | ✅ OK | ❌ Lỗi | % Hoạt động |
|-------|-----------|------|-------|-------------|
| Header | 4 | 1 | 3 | 25% |
| Layer 1 | 9 | 9 | 0 | 100% |
| AI Section | 1 | 0 | 1 | 0% |
| Layer 2 | 9 | 8 | 1 | 89% |
| Layer 3 | 9 | 8 | 1 | 89% |
| Layer 4 | 9 | 9 | 0 | 100% |
| Layer 5 | 5 | 4 | 1 | 80% |
| Layer 6 | 8 | 8 | 0 | 100% |
| Layer 7 | 5 | 1 | 4 | 20% |
| Layer 8 | 9 | 9 | 0 | 100% |
| Layer 9 | 4 | 4 | 0 | 100% |
| Bottom | 2 | 0 | 2 | 0% |
| **TỔNG** | **74** | **61** | **13** | **82.4%** |

---

## 📁 FILE STRUCTURE AUDIT

### Các file cần dọn dẹp/xóa

```
app/(tabs)/
├── index.backup.tsx          ← XÓA (backup cũ)
├── index.old.tsx             ← XÓA (version cũ)
├── notifications.tsx.backup  ← XÓA (backup)
├── home-construction.tsx     ← REVIEW (có cần không?)
├── modern-home.tsx           ← REVIEW (duplicate?)
├── profile-luxury.tsx        ← MERGE với profile.tsx
├── profile-new.tsx           ← MERGE với profile.tsx
├── projects-luxury.tsx       ← MERGE với projects.tsx
└── notifications-timeline.tsx ← REVIEW (cần không?)
```

### Files nên giữ (Clean structure)

```
app/(tabs)/
├── _layout.tsx               ✅ Tab layout
├── index.tsx                 ✅ Home screen
├── projects.tsx              ✅ Projects tab
├── notifications.tsx         ✅ Notifications tab
├── profile.tsx               ✅ Profile tab
├── live.tsx                  ✅ Live stream tab
├── contacts.tsx              ✅ Contacts
└── menu.tsx                  ✅ Menu overlay
```

---

## 🔔 NOTIFICATION SYSTEM AUDIT

### Current Implementation

**File:** `features/notifications/NotificationsScreenModernized.tsx`

**Notification Types:**
- `system` - Thông báo hệ thống (icon: notifications-outline, màu: primary)
- `project` - Thông báo dự án (icon: folder-outline, màu: warning)
- `task` - Thông báo công việc (icon: checkmark-circle-outline, màu: success)
- `message` - Tin nhắn (icon: chatbubble-outline, màu: secondary)

### Features đã có ✅

| Feature | Status | File |
|---------|--------|------|
| Date grouping | ✅ | NotificationsScreenModernized.tsx |
| Unread badges | ✅ | NotificationsScreenModernized.tsx |
| Mark all as read | ✅ | NotificationsScreenModernized.tsx |
| Filter by type | ✅ | NotificationsScreenModernized.tsx |
| Pull to refresh | ✅ | NotificationsScreenModernized.tsx |
| Local notifications | ✅ | services/notifications.ts |
| Android channel | ✅ | services/notifications.ts |
| Push notifications | ⚠️ Partial | services/pushNotifications.ts |

### Features cần thêm ⏳

| Feature | Priority | Mô tả |
|---------|----------|-------|
| Badge count on tab | HIGH | Hiển thị số unread trên tab icon |
| Deep linking | HIGH | Click notification → navigate to route |
| Scheduled notifications | MEDIUM | Reminder cho tasks/deadlines |
| Sound customization | LOW | Âm thanh riêng cho từng loại |

### System Notification Categories

```typescript
// Đề xuất cấu trúc notification categories
const NOTIFICATION_CATEGORIES = {
  SYSTEM: {
    type: 'system',
    title: 'Thông báo hệ thống',
    icon: 'notifications-outline',
    color: '#2E7D32',  // Nordic Green
    priority: 'high',
    examples: [
      'Cập nhật ứng dụng mới',
      'Bảo trì hệ thống',
      'Thay đổi chính sách',
    ],
  },
  PROJECT: {
    type: 'project',
    title: 'Thông báo dự án',
    icon: 'folder-outline', 
    color: '#FF9800',
    priority: 'high',
    examples: [
      'Dự án mới được tạo',
      'Tiến độ cập nhật',
      'Milestone hoàn thành',
    ],
  },
  TASK: {
    type: 'task',
    title: 'Công việc',
    icon: 'checkmark-circle-outline',
    color: '#4CAF50',
    priority: 'medium',
    examples: [
      'Task được giao',
      'Deadline sắp đến',
      'Task hoàn thành',
    ],
  },
  MESSAGE: {
    type: 'message',
    title: 'Tin nhắn',
    icon: 'chatbubble-outline',
    color: '#2196F3',
    priority: 'high',
    examples: [
      'Tin nhắn mới',
      'Mention trong chat',
      'Reply to comment',
    ],
  },
  PAYMENT: {
    type: 'payment',
    title: 'Thanh toán',
    icon: 'card-outline',
    color: '#9C27B0',
    priority: 'high',
    examples: [
      'Thanh toán thành công',
      'Invoice mới',
      'Hóa đơn quá hạn',
    ],
  },
  SAFETY: {
    type: 'safety',
    title: 'An toàn',
    icon: 'warning-outline',
    color: '#F44336',
    priority: 'critical',
    examples: [
      'Cảnh báo an toàn',
      'Incident report',
      'Weather alert',
    ],
  },
};
```

---

## 📋 ACTION PLAN - Kế hoạch sửa lỗi

### Phase 1: Critical Fixes (30 phút)

1. ✅ **Tạo file `/legal/index.tsx`** - ĐÃ XONG
2. ⏳ **Sửa routes trong `index.tsx`:**
   - Line 216: `/(tabs)/cart` → `/cart`
   - Line 219: `/(tabs)/menu` → `/profile/menu`
   - Line 288: `/ai/index` → `/ai`

### Phase 2: Add Missing Routes (1 giờ)

1. Thêm vào `typed-routes.ts`:
   ```typescript
   // Auth routes
   AUTH_LOGIN: '/(auth)/login',
   AUTH_REGISTER: '/(auth)/register',
   AUTH_FORGOT_PASSWORD: '/(auth)/forgot-password',
   
   // Projects
   PROJECTS_CREATE: '/projects/create',
   
   // Live
   LIVE_CREATE: '/live/create',
   
   // Profile extras
   PROFILE_SETTINGS: '/profile/settings',
   PROFILE_EDIT: '/profile/edit',
   PROFILE_REWARDS: '/profile/rewards',
   ```

### Phase 3: File Cleanup (30 phút)

```bash
# Xóa các file backup
rm app/(tabs)/index.backup.tsx
rm app/(tabs)/index.old.tsx
rm app/(tabs)/notifications.tsx.backup

# Merge profile files (review trước)
# profile-luxury.tsx + profile-new.tsx → profile.tsx
```

### Phase 4: Create Missing Files (1 giờ)

```
app/
├── services/index.tsx         ← Tạo mới (hub dịch vụ)
├── construction/utilities.tsx ← Tạo mới (hub tiện ích)
├── projects/create.tsx        ← Tạo mới (form tạo dự án)
├── live/create.tsx           ← Tạo mới (form tạo livestream)
└── dashboard/admin.tsx        ← Redirect to /admin/dashboard
```

### Phase 5: Shopping Route Fix (30 phút)

**Giải pháp:** Sử dụng URL params thay vì encode trong route

```typescript
// Thay vì:
CONSTRUCTION_MATERIALS: '/shopping/index?cat=construction',

// Sử dụng:
SHOPPING_INDEX: '/shopping/index',

// Và navigate với params:
router.push({
  pathname: APP_ROUTES.SHOPPING_INDEX,
  params: { cat: 'construction' }
});
```

---

## 📈 ĐỀ XUẤT CẢI TIẾN UX/UI

### 1. Navigation Consistency
- Sử dụng `APP_ROUTES` constants 100%
- Không hardcode strings trong navigate()
- Thêm validation trước khi navigate

### 2. Error Handling
```tsx
const navigateTo = async (route: AppRoute) => {
  try {
    await trackNavigation(route);
    router.push(route);
  } catch (error) {
    // Show user-friendly error
    Toast.show({
      type: 'error',
      text1: 'Không thể mở trang',
      text2: 'Vui lòng thử lại sau',
    });
  }
};
```

### 3. Loading States
- Thêm skeleton screens cho lazy-loaded components
- Shimmer effect cho ProductsList

### 4. Accessibility
- Thêm `accessibilityLabel` cho TouchableOpacity
- Kiểm tra contrast ratio cho màu sắc

---

## ✅ CHECKLIST SỬA LỖI

| Task | Priority | Status | Assignee |
|------|----------|--------|----------|
| Tạo /legal/index.tsx | 🔴 Critical | ✅ Done | Auto |
| Fix hardcoded routes in index.tsx | 🔴 Critical | ⏳ | - |
| Add auth routes to APP_ROUTES | 🟠 High | ⏳ | - |
| Add profile routes to APP_ROUTES | 🟠 High | ⏳ | - |
| Create /services/index.tsx | 🟡 Medium | ⏳ | - |
| Create /projects/create.tsx | 🟡 Medium | ⏳ | - |
| Create /live/create.tsx | 🟡 Medium | ⏳ | - |
| Fix shopping category routes | 🟡 Medium | ⏳ | - |
| Remove backup files | 🟢 Low | ⏳ | - |
| Merge profile files | 🟢 Low | ⏳ | - |
| Add notification badges | 🟡 Medium | ⏳ | - |
| Improve notification categories | 🟡 Medium | ⏳ | - |

---

## 📚 TÀI LIỆU LIÊN QUAN

- [HOME_STRUCTURE_COMPLETE.md](./HOME_STRUCTURE_COMPLETE.md) - Cấu trúc 9 layers
- [NAVIGATION_SYSTEM_FINAL_REPORT.md](./NAVIGATION_SYSTEM_FINAL_REPORT.md) - Báo cáo navigation
- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Hướng dẫn migrate routes
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Checklist trước deploy

---

*Report generated: 22/12/2025*  
*Tool: Route Verification Test Suite*
