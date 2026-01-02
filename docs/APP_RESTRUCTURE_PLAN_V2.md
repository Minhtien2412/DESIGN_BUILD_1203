# 📱 Kế hoạch tái cấu trúc App toàn diện
## Phân chia chức năng & giao diện rõ ràng theo vai trò

**Ngày tạo:** 2025-12-23  
**Version:** 2.0  
**Trạng thái:** 🟡 Ready for Implementation

---

## 📋 Mục lục
1. [Tổng quan kiến trúc](#1-tổng-quan-kiến-trúc)
2. [Phân chia vai trò](#2-phân-chia-vai-trò)
3. [Cấu trúc thư mục mới](#3-cấu-trúc-thư-mục-mới)
4. [Giao diện từng vai trò](#4-giao-diện-từng-vai-trò)
5. [Module Registry](#5-module-registry)
6. [Navigation Configuration](#6-navigation-configuration)
7. [UI Architecture](#7-ui-architecture)
8. [Kế hoạch triển khai](#8-kế-hoạch-triển-khai)
9. [Checklist hoàn thành](#9-checklist-hoàn-thành)

---

## 1. Tổng quan kiến trúc

### 1.1 Hiện trạng (BEFORE)
```
❌ 60+ folders trong app/
❌ Components trùng lặp (communication vs communications)
❌ Files backup lẫn lộn (construction-old-backup, *.backup.tsx)
❌ Navigation chung cho mọi vai trò
❌ Không phân biệt rõ User/Employee/Admin
❌ UI không nhất quán
```

### 1.2 Kiến trúc mới (AFTER)
```
✅ Route Groups theo vai trò: (auth), (user), (employee), (admin), (shared)
✅ Module Registry: Định nghĩa tập trung tất cả modules
✅ Navigation Config: Tab/Drawer riêng từng vai trò
✅ UI Architecture: Color/Typography/Layout riêng từng vai trò
✅ Component Library: Reusable, role-aware components
```

### 1.3 Các file mới đã tạo
| File | Mục đích |
|------|----------|
| `constants/module-registry.ts` | Đăng ký tất cả modules, phân quyền |
| `constants/navigation-config.ts` | Tabs/Drawer cho từng vai trò |
| `constants/ui-architecture.ts` | Colors/Typography/Layout/Animations |
| `constants/sitemap-tree.ts` | Cây sitemap theo vai trò |

---

## 2. Phân chia vai trò

### 2.1 Định nghĩa vai trò
```typescript
type UserRole = 'guest' | 'user' | 'employee' | 'admin';
```

### 2.2 Ma trận quyền truy cập

| Module | Guest | User | Employee | Admin |
|--------|:-----:|:----:|:--------:|:-----:|
| **CORE** |
| Home | ✅ | ✅ | ✅ | ✅ |
| Search | ✅ | ✅ | ✅ | ✅ |
| Profile | ❌ | ✅ | ✅ | ✅ |
| Notifications | ❌ | ✅ | ✅ | ✅ |
| **SHOPPING** |
| Browse Products | ✅ | ✅ | ❌ | ✅ |
| Cart | ❌ | ✅ | ❌ | ❌ |
| Checkout | ❌ | ✅ | ❌ | ❌ |
| Orders | ❌ | ✅ | ❌ | ❌ |
| **SERVICES** |
| House Design | ❌ | ✅ | ❌ | ❌ |
| Interior Design | ❌ | ✅ | ❌ | ❌ |
| Construction Services | ❌ | ✅ | ❌ | ❌ |
| Booking | ❌ | ✅ | ✅ | ✅ |
| **PROJECTS** |
| My Projects | ❌ | ✅ | ✅ | ✅ |
| Construction Progress | ❌ | ✅ | ✅ | ✅ |
| Timeline | ❌ | ✅ | ✅ | ✅ |
| Budget | ❌ | ✅ | ✅ | ✅ |
| **MANAGEMENT** |
| Dashboard | ❌ | ❌ | ✅ | ✅ |
| Daily Report | ❌ | ❌ | ✅ | ✅ |
| QA/QC | ❌ | ❌ | ✅ | ✅ |
| Safety | ❌ | ❌ | ✅ | ✅ |
| Documents | ❌ | ❌ | ✅ | ✅ |
| Materials | ❌ | ✅ | ✅ | ✅ |
| Labor | ❌ | ❌ | ✅ | ✅ |
| **ADMIN ONLY** |
| Product Management | ❌ | ❌ | ❌ | ✅ |
| User Management | ❌ | ❌ | ❌ | ✅ |
| Roles & Permissions | ❌ | ❌ | ❌ | ✅ |
| Analytics | ❌ | ❌ | ❌ | ✅ |
| System Settings | ❌ | ❌ | ❌ | ✅ |

---

## 3. Cấu trúc thư mục mới

### 3.1 Route Groups (app/)
```
app/
├── _layout.tsx              # Root layout với AuthProvider, CartProvider
├── index.tsx               # Redirect logic dựa trên role
│
├── (auth)/                 # 🔐 Authentication routes (Guest only)
│   ├── _layout.tsx
│   ├── login.tsx
│   ├── register.tsx
│   ├── forgot-password.tsx
│   └── verify-otp.tsx
│
├── (user)/                 # 👤 User routes (Logged in users)
│   ├── _layout.tsx         # UserLayout với theme user
│   ├── (tabs)/             # Bottom tabs cho user
│   │   ├── _layout.tsx
│   │   ├── index.tsx       # Home - Shopping focus
│   │   ├── shopping.tsx
│   │   ├── projects.tsx
│   │   ├── notifications.tsx
│   │   └── profile.tsx
│   ├── cart/
│   ├── checkout/
│   ├── services/
│   ├── product/
│   └── ...
│
├── (employee)/             # 👷 Employee routes
│   ├── _layout.tsx         # EmployeeLayout với theme employee
│   ├── (tabs)/             # Bottom tabs cho employee
│   │   ├── _layout.tsx
│   │   ├── dashboard.tsx   # Work dashboard
│   │   ├── tasks.tsx
│   │   ├── reports.tsx
│   │   ├── messages.tsx
│   │   └── profile.tsx
│   ├── daily-report/
│   ├── quality-assurance/
│   ├── safety/
│   └── ...
│
├── (admin)/                # 🔧 Admin routes
│   ├── _layout.tsx         # AdminLayout với theme admin
│   ├── (tabs)/             # Bottom tabs cho admin
│   │   ├── _layout.tsx
│   │   ├── dashboard.tsx   # Analytics dashboard
│   │   ├── projects.tsx
│   │   ├── management.tsx
│   │   ├── analytics.tsx
│   │   └── profile.tsx
│   ├── products/
│   ├── users/
│   ├── settings/
│   └── ...
│
├── (shared)/               # 🔗 Shared routes (all authenticated)
│   ├── _layout.tsx
│   ├── messages/
│   ├── call/
│   ├── live/
│   ├── ai/
│   ├── weather/
│   ├── sitemap/
│   └── ...
│
└── +not-found.tsx
```

### 3.2 Components (components/)
```
components/
├── ui/                     # Atomic UI components
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.styles.ts
│   │   └── index.ts
│   ├── Input/
│   ├── Card/
│   ├── Avatar/
│   ├── Badge/
│   ├── Loader/
│   └── ...
│
├── layouts/                # Layout wrappers
│   ├── GuestLayout.tsx
│   ├── UserLayout.tsx
│   ├── EmployeeLayout.tsx
│   ├── AdminLayout.tsx
│   └── RoleBasedLayout.tsx
│
├── navigation/             # Navigation components
│   ├── RoleBasedTabs.tsx
│   ├── RoleBasedDrawer.tsx
│   ├── TabBar/
│   └── DrawerMenu/
│
├── features/               # Feature-specific components
│   ├── shopping/           # Shopping feature components
│   ├── projects/           # Project feature components
│   ├── management/         # Management feature components
│   └── ...
│
└── shared/                 # Shared across features
    ├── Header.tsx
    ├── Footer.tsx
    ├── ErrorBoundary.tsx
    └── ...
```

---

## 4. Giao diện từng vai trò

### 4.1 Guest UI
```
┌─────────────────────────────────────┐
│ 🧭 Khám phá          [🔍] [👤]     │ ← Simple header
├─────────────────────────────────────┤
│ ╔═════════════════════════════════╗ │
│ ║   🏠 Banner - Khám phá dịch vụ  ║ │ ← Call to action
│ ╚═════════════════════════════════╝ │
├─────────────────────────────────────┤
│ [  Thiết kế  ] [  Xây dựng  ] ...  │ ← Service quick access
├─────────────────────────────────────┤
│ 📦 Sản phẩm nổi bật                │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐       │ ← Product preview
│ │prod│ │prod│ │prod│ │prod│       │
│ └────┘ └────┘ └────┘ └────┘       │
├─────────────────────────────────────┤
│                                     │
│   [        ĐĂNG NHẬP        ]      │ ← Prominent CTA
│   [        ĐĂNG KÝ          ]      │
│                                     │
└─────────────────────────────────────┘
│ 🧭      │ 🛒     │ 📺     │ 👤    │ ← 4 tabs
│Khám phá │Mua sắm │ Live   │Đăng nhập│
└─────────────────────────────────────┘
```

### 4.2 User UI
```
┌─────────────────────────────────────┐
│ 🏠 Xin chào, Tiến! [🔍] [🛒3] [🔔5]│ ← Personalized header
├─────────────────────────────────────┤
│ ╔═════════════════════════════════╗ │
│ ║ 🎉 Ưu đãi tháng 12 - Giảm 30%   ║ │ ← Promo banner
│ ╚═════════════════════════════════╝ │
├─────────────────────────────────────┤
│ [🛒 Mua sắm][📅 Đặt lịch][📈 Tiến độ][🤖 AI] │ ← Quick actions
├─────────────────────────────────────┤
│ 📁 Danh mục                         │
│ [Vật liệu][Nội thất][Điện][Nước]... │
├─────────────────────────────────────┤
│ 🏗️ Dịch vụ thiết kế        [Xem tất cả→] │
│ ┌────────┐ ┌────────┐ ┌────────┐   │
│ │ Nhà phố │ │ Biệt thự│ │ Nội thất │   │
│ │ 50M+    │ │ 100M+   │ │ 30M+     │   │
│ └────────┘ └────────┘ └────────┘   │
├─────────────────────────────────────┤
│ 📦 Gợi ý cho bạn           [Xem tất cả→] │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐       │
│ │prod│ │prod│ │prod│ │prod│       │
│ └────┘ └────┘ └────┘ └────┘       │
├─────────────────────────────────────┤
│ 📋 Dự án của bạn           [Xem tất cả→] │
│ ┌─────────────────────────────────┐ │
│ │ 🏠 Nhà phố Quận 7    [75%] 🔵🔵⚪ │ │
│ │ 🏢 Căn hộ Thủ Đức    [30%] 🔵⚪⚪ │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
│ 🏠     │ 🛒     │ 📁    │ 🔔    │ 👤   │
│Trang chủ│Mua sắm │Dự án  │Thông báo│Cá nhân│
└─────────────────────────────────────┘

Màu chủ đạo: #EE4D2D (Shopee Orange)
```

### 4.3 Employee UI
```
┌─────────────────────────────────────┐
│ ☰ Công việc hôm nay         [🔔3] │ ← Work-focused header
├─────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ │
│ │Nhiệm vụ │ │Hoàn thành│ │ Trễ hạn │ │ ← Stats cards
│ │   12    │ │    8     │ │    2    │ │
│ └─────────┘ └─────────┘ └─────────┘ │
├─────────────────────────────────────┤
│ 📋 Nhiệm vụ cần làm        [Xem tất cả→] │
│ ┌─────────────────────────────────┐ │
│ │ ⚡ Kiểm tra móng Block A   [!]  │ │
│ │ 📍 Dự án ABC | Hạn: Hôm nay     │ │
│ ├─────────────────────────────────┤ │
│ │ 📝 Báo cáo tiến độ tuần 51      │ │
│ │ 📍 Dự án XYZ | Hạn: 25/12       │ │
│ ├─────────────────────────────────┤ │
│ │ 🔍 QA đổ bê tông sàn tầng 2     │ │
│ │ 📍 Dự án ABC | Hạn: 26/12       │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ [📋 Nhiệm vụ][📝 Nhật ký][✅ QA][💬 Tin nhắn] │ ← Quick actions
├─────────────────────────────────────┤
│ 🏗️ Dự án đang thực hiện    [Xem tất cả→] │
│ ┌────────────────┐ ┌────────────────┐ │
│ │ Nhà phố Quận 7 │ │ Căn hộ Thủ Đức │ │
│ │ [████████░░] 75% │ [███░░░░░░░] 30% │ │
│ └────────────────┘ └────────────────┘ │
├─────────────────────────────────────┤
│ 🔔 Thông báo mới                    │
│ • Cuộc họp 14:00 - Meeting room A   │
│ • Vật liệu đã về kho                │
└─────────────────────────────────────┘
│ 📊     │ ✅     │ 📝    │ 💬    │ 👤   │
│Công việc│Nhiệm vụ│Báo cáo│Tin nhắn│Cá nhân│
└─────────────────────────────────────┘

Màu chủ đạo: #4ECDC4 (Teal)
```

### 4.4 Admin UI
```
┌─────────────────────────────────────┐
│ ☰ Dashboard                 [🔔5] │ ← Control center header
├─────────────────────────────────────┤
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ │
│ │Doanh thu│ │Đơn hàng│ │Dự án   │ │Nhân viên│ │
│ │ 1.2B ▲ │ │  156   │ │   23   │ │   45   │ │
│ │+15% 📈 │ │+8% 📈  │ │ Active │ │ Online │ │
│ └────────┘ └────────┘ └────────┘ └────────┘ │
├─────────────────────────────────────┤
│ 📊 Doanh thu tuần này               │
│ ┌─────────────────────────────────┐ │
│ │     📈 Chart (Revenue)          │ │
│ │  ┌───┐                          │ │
│ │  │   │ ┌───┐ ┌───┐              │ │
│ │  │   │ │   │ │   │ ┌───┐        │ │
│ │  │   │ │   │ │   │ │   │ ┌───┐  │ │
│ │  T2   T3   T4   T5   T6   T7   │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ [📊 Phân tích][🏷️ Sản phẩm][👥 Users][📄 Báo cáo] │
├─────────────────────────────────────┤
│ ⚠️ Cần phê duyệt              [Xem tất cả→] │
│ ┌─────────────────────────────────┐ │
│ │ 📦 Sản phẩm mới: Gạch Đồng Tâm  │ │ [✓][✕]
│ │ 👤 Nhân viên mới: Nguyễn Văn A  │ │ [✓][✕]
│ │ 💰 Thanh toán: HĐ-001234        │ │ [✓][✕]
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ 🚨 Cảnh báo hệ thống                │
│ • 3 dự án chậm tiến độ              │
│ • Kho hàng gần hết: Xi măng         │
└─────────────────────────────────────┘
│ 📊     │ 📁     │ ⚙️    │ 📈    │ 👤   │
│Dashboard│Dự án  │Quản lý│Phân tích│Cá nhân│
└─────────────────────────────────────┘

Màu chủ đạo: #6C5CE7 (Purple)
```

---

## 5. Module Registry

File: `constants/module-registry.ts`

### 5.1 Cấu trúc Module
```typescript
interface AppModule {
  id: string;           // Unique identifier
  name: string;         // English name
  nameVi: string;       // Vietnamese name
  description: string;  // Module description
  icon: string;         // Ionicons name
  color: string;        // Theme color
  route: string;        // Navigation route
  roles: UserRole[];    // Allowed roles
  status: ModuleStatus; // 'active' | 'beta' | 'coming-soon'
  priority: number;     // Display priority
  category: ModuleCategory;
  features?: string[];  // Sub-features
}
```

### 5.2 Module Categories
- `core` - Chức năng chính (Home, Auth, Profile)
- `shopping` - Mua sắm (Products, Cart, Checkout)
- `services` - Dịch vụ (Design, Construction)
- `projects` - Dự án (My Projects, Progress)
- `communication` - Liên lạc (Messages, Video Call, Live)
- `management` - Quản lý (Dashboard, Reports)
- `analytics` - Phân tích (Charts, Statistics)
- `tools` - Công cụ (AI, Calculator, QR Code)
- `settings` - Cài đặt

### 5.3 Helper Functions
```typescript
getModulesByRole(role)           // Get modules for a role
getModulesByCategory(category)   // Get modules by category
getModulesGroupedByCategory(role) // Group modules for drawer
getTopModules(role, limit)       // Get top priority modules
canAccessModule(moduleId, role)  // Check access permission
```

---

## 6. Navigation Configuration

File: `constants/navigation-config.ts`

### 6.1 Tab Configurations

| Role | Tab 1 | Tab 2 | Tab 3 | Tab 4 | Tab 5 |
|------|-------|-------|-------|-------|-------|
| Guest | Khám phá | Mua sắm | Live | Đăng nhập | - |
| User | Trang chủ | Mua sắm | Dự án | Thông báo | Cá nhân |
| Employee | Công việc | Nhiệm vụ | Báo cáo | Tin nhắn | Cá nhân |
| Admin | Dashboard | Dự án | Quản lý | Phân tích | Cá nhân |

### 6.2 Drawer Sections

**User Drawer:**
- Chính (Home, Shopping, Cart)
- Dịch vụ (House Design, Interior, Construction)
- Dự án của tôi (Projects, Progress, Timeline)
- Liên lạc (Messages, Video Call, Live)
- Công cụ (AI, Cost Estimator, QR)
- Cá nhân (Profile, Orders, Settings)

**Employee Drawer:**
- Công việc (Dashboard, Tasks, Schedule)
- Dự án (Projects, Progress, Daily Report)
- Quản lý (QA/QC, Safety, Inspection, Materials)
- Tài liệu (Documents, Reports, RFI)
- Liên lạc (Messages, Video Call, Meetings)
- Công cụ (AI, Weather, QR)

**Admin Drawer:**
- Tổng quan (Dashboard, Analytics, Reports)
- Quản lý hệ thống (Products, Users, Roles)
- Dự án (All Projects, Contracts, Budget)
- Quản lý công việc (Daily Report, QA, Safety)
- Tài nguyên (Materials, Labor, Inventory)
- Tài liệu (Documents, RFI, Change Orders)
- Cài đặt (System Settings, Notifications)

---

## 7. UI Architecture

File: `constants/ui-architecture.ts`

### 7.1 Color Palettes

| Property | Guest | User | Employee | Admin |
|----------|-------|------|----------|-------|
| Primary | #636E72 | #EE4D2D | #4ECDC4 | #6C5CE7 |
| Secondary | #B2BEC3 | #F97316 | #00B894 | #8B5CF6 |
| Accent | #45B7D1 | #FF6B6B | #45B7D1 | #A29BFE |
| Header BG | #FFFFFF | #EE4D2D | #4ECDC4 | #6C5CE7 |

### 7.2 Component Styles

Button styles, Card styles, Header styles - all role-specific.

### 7.3 Home Layouts

Each role has different home screen sections:
- **Guest:** Banner → Services → Products → CTA
- **User:** Banner → Quick Actions → Categories → Services → Products → Projects
- **Employee:** Stats → Tasks → Quick Actions → Projects → Notifications
- **Admin:** Stats → Chart → Quick Actions → Projects → Pending Approvals → Alerts

---

## 8. Kế hoạch triển khai

### Phase 1: Infrastructure (Tuần 1-2)
- [ ] Migrate AuthContext để hỗ trợ UserRole
- [ ] Tạo RoleBasedLayout component
- [ ] Tạo RoleBasedTabs component
- [ ] Tạo RoleBasedDrawer component
- [ ] Test role switching

### Phase 2: Route Groups (Tuần 3-4)
- [ ] Tạo (auth)/ route group
- [ ] Tạo (user)/ route group
- [ ] Tạo (employee)/ route group
- [ ] Tạo (admin)/ route group
- [ ] Tạo (shared)/ route group
- [ ] Configure nested layouts

### Phase 3: User Interface (Tuần 5)
- [ ] User home screen với shopping focus
- [ ] User tab navigation
- [ ] User drawer menu
- [ ] Shopping flow (Cart, Checkout)
- [ ] Services flow

### Phase 4: Employee Interface (Tuần 6)
- [ ] Employee dashboard
- [ ] Task management UI
- [ ] Daily report flow
- [ ] QA/QC interface
- [ ] Employee-specific components

### Phase 5: Admin Interface (Tuần 7)
- [ ] Admin dashboard với analytics
- [ ] Product management (đã có)
- [ ] User management
- [ ] System settings
- [ ] Admin-specific components

### Phase 6: Cleanup (Tuần 8)
- [ ] Remove duplicate folders
- [ ] Remove backup files
- [ ] Update all imports
- [ ] Final testing
- [ ] Documentation update

---

## 9. Checklist hoàn thành

### ✅ Đã hoàn thành
- [x] Tạo Module Registry (`constants/module-registry.ts`)
- [x] Tạo Navigation Config (`constants/navigation-config.ts`)
- [x] Tạo UI Architecture (`constants/ui-architecture.ts`)
- [x] Tạo Sitemap Tree (`constants/sitemap-tree.ts`)
- [x] Tạo kế hoạch triển khai chi tiết

### 🟡 Đang chờ triển khai
- [ ] RoleBasedLayout component
- [ ] RoleBasedTabs component
- [ ] RoleBasedDrawer component
- [ ] Route groups migration
- [ ] Home screens cho từng role
- [ ] Cleanup duplicate files

### ❓ Cần quyết định
- Có cần hỗ trợ multiple roles per user?
- Role switching trong app hay chỉ khi login?
- Cần offline support cho employee?

---

## 📎 Attachments

### Files liên quan:
- [constants/module-registry.ts](../constants/module-registry.ts)
- [constants/navigation-config.ts](../constants/navigation-config.ts)
- [constants/ui-architecture.ts](../constants/ui-architecture.ts)
- [constants/sitemap-tree.ts](../constants/sitemap-tree.ts)
- [app/(tabs)/_layout.tsx](../app/(tabs)/_layout.tsx)
- [context/AuthContext.tsx](../context/AuthContext.tsx)

---

*Cập nhật lần cuối: 2025-12-23*
