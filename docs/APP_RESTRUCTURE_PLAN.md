# 📱 KẾ HOẠCH CHỈNH SỬA APP TOÀN DIỆN
## Bảo Tiến Construction Management App
### Ngày lập: 23/12/2025

---

## 📋 MỤC LỤC
1. [Tổng quan hiện tại](#1-tổng-quan-hiện-tại)
2. [Vấn đề cần giải quyết](#2-vấn-đề-cần-giải-quyết)
3. [Kiến trúc mới đề xuất](#3-kiến-trúc-mới-đề-xuất)
4. [Phân chia vai trò người dùng](#4-phân-chia-vai-trò-người-dùng)
5. [Cấu trúc navigation](#5-cấu-trúc-navigation)
6. [Chi tiết từng module](#6-chi-tiết-từng-module)
7. [Roadmap thực hiện](#7-roadmap-thực-hiện)

---

## 1. TỔNG QUAN HIỆN TẠI

### 📊 Thống kê hiện tại
| Thành phần | Số lượng | Ghi chú |
|------------|----------|---------|
| Thư mục app/ | 60+ | Nhiều thư mục trùng chức năng |
| Components | 80+ | Một số chưa được sử dụng |
| Tab screens | 8 | 4 hiển thị, 4 ẩn |
| Routes định nghĩa | 64+ | Trong typed-routes.ts |

### 🔴 Vấn đề hiện tại
- Quá nhiều thư mục với chức năng chồng chéo
- Không rõ ràng phân biệt giao diện User/Employee/Admin
- Nhiều file backup/old không cần thiết
- Navigation phức tạp, khó maintain

---

## 2. VẤN ĐỀ CẦN GIẢI QUYẾT

### 2.1 Cấu trúc thư mục
```
❌ HIỆN TẠI (Rối)                    ✅ ĐỀ XUẤT (Rõ ràng)
app/                                 app/
├── communication/                   ├── (auth)/          # Xác thực
├── communications/   ← Trùng!       ├── (tabs)/          # Bottom tabs
├── construction/                    ├── (user)/          # Màn hình User
├── construction-old-backup/         ├── (employee)/      # Màn hình Nhân viên
├── construction-progress.tsx        ├── (admin)/         # Màn hình Admin
├── progress-tracking.tsx ← Trùng!   └── (shared)/        # Màn hình dùng chung
```

### 2.2 Phân tách chức năng
| Chức năng | User | Employee | Admin |
|-----------|------|----------|-------|
| Xem sản phẩm | ✅ | ✅ | ✅ |
| Đặt hàng | ✅ | ❌ | ❌ |
| Quản lý đơn hàng | Đơn của mình | Tất cả | Tất cả + báo cáo |
| Quản lý dự án | Dự án mình tạo | Dự án được phân | Tất cả |
| Báo cáo | Cơ bản | Chi tiết | Toàn diện |
| Cài đặt hệ thống | ❌ | ❌ | ✅ |

---

## 3. KIẾN TRÚC MỚI ĐỀ XUẤT

### 3.1 Cấu trúc thư mục App

```
app/
├── _layout.tsx                      # Root layout với providers
├── +not-found.tsx                   # 404 page
│
├── (auth)/                          # 🔐 Authentication
│   ├── _layout.tsx
│   ├── login.tsx
│   ├── register.tsx
│   ├── forgot-password.tsx
│   └── onboarding.tsx
│
├── (tabs)/                          # 📱 Bottom Tab Navigation
│   ├── _layout.tsx
│   ├── index.tsx                    # Home - Dynamic theo role
│   ├── projects.tsx                 # Dự án
│   ├── live.tsx                     # Live stream
│   └── profile.tsx                  # Cá nhân
│
├── (user)/                          # 👤 User-specific screens
│   ├── _layout.tsx
│   ├── shopping/                    # Mua sắm
│   │   ├── index.tsx
│   │   ├── [category].tsx
│   │   ├── cart.tsx
│   │   └── checkout.tsx
│   ├── orders/                      # Đơn hàng của tôi
│   │   ├── index.tsx
│   │   └── [id].tsx
│   ├── services/                    # Đặt dịch vụ
│   │   ├── index.tsx
│   │   ├── house-design.tsx
│   │   ├── interior-design.tsx
│   │   └── booking.tsx
│   └── my-projects/                 # Dự án cá nhân
│       ├── index.tsx
│       ├── create.tsx
│       └── [id]/
│           ├── index.tsx
│           ├── progress.tsx
│           ├── budget.tsx
│           └── timeline.tsx
│
├── (employee)/                      # 👷 Employee-specific screens
│   ├── _layout.tsx
│   ├── dashboard.tsx                # Bảng điều khiển nhân viên
│   ├── projects/                    # Quản lý dự án
│   │   ├── index.tsx
│   │   ├── [id]/
│   │   │   ├── index.tsx
│   │   │   ├── tasks.tsx
│   │   │   ├── daily-report.tsx
│   │   │   ├── inspection.tsx
│   │   │   └── documents.tsx
│   ├── quality/                     # QA/QC
│   │   ├── index.tsx
│   │   ├── inspection.tsx
│   │   └── punch-list.tsx
│   ├── resources/                   # Tài nguyên
│   │   ├── materials.tsx
│   │   ├── labor.tsx
│   │   ├── equipment.tsx
│   │   └── inventory.tsx
│   └── reports/                     # Báo cáo
│       ├── index.tsx
│       ├── daily.tsx
│       └── weekly.tsx
│
├── (admin)/                         # 🛡️ Admin-specific screens
│   ├── _layout.tsx
│   ├── dashboard.tsx                # Admin dashboard
│   ├── users/                       # Quản lý người dùng
│   │   ├── index.tsx
│   │   ├── staff.tsx
│   │   └── roles.tsx
│   ├── products/                    # Quản lý sản phẩm
│   │   ├── index.tsx
│   │   ├── create.tsx
│   │   └── [id].tsx
│   ├── orders/                      # Quản lý đơn hàng
│   │   ├── index.tsx
│   │   └── [id].tsx
│   ├── projects/                    # Quản lý tất cả dự án
│   │   └── index.tsx
│   ├── analytics/                   # Phân tích
│   │   ├── index.tsx
│   │   ├── revenue.tsx
│   │   └── performance.tsx
│   └── settings/                    # Cài đặt hệ thống
│       ├── index.tsx
│       ├── general.tsx
│       └── integrations.tsx
│
├── (shared)/                        # 🔗 Shared screens (all roles)
│   ├── product/[id].tsx             # Chi tiết sản phẩm
│   ├── messages/                    # Tin nhắn
│   │   ├── index.tsx
│   │   └── [id].tsx
│   ├── notifications.tsx            # Thông báo
│   ├── search.tsx                   # Tìm kiếm
│   ├── weather.tsx                  # Thời tiết
│   ├── ai.tsx                       # AI Assistant
│   ├── call/                        # Video call
│   │   ├── index.tsx
│   │   └── [id].tsx
│   └── legal/                       # Pháp lý
│       ├── terms.tsx
│       └── privacy.tsx
│
└── sitemap/                         # Sơ đồ ứng dụng
    └── index.tsx
```

### 3.2 Cấu trúc Components

```
components/
├── ui/                              # 🎨 UI primitives
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   ├── modal.tsx
│   ├── loader.tsx
│   ├── badge.tsx
│   ├── avatar.tsx
│   ├── tabs.tsx
│   └── ...
│
├── layouts/                         # 📐 Layout components
│   ├── SafeScrollView.tsx
│   ├── PageContainer.tsx
│   ├── DashboardLayout.tsx
│   └── AuthLayout.tsx
│
├── navigation/                      # 🧭 Navigation components
│   ├── CustomTabBar.tsx
│   ├── HeaderBar.tsx
│   ├── DrawerMenu.tsx
│   └── BreadCrumb.tsx
│
├── forms/                           # 📝 Form components
│   ├── FormInput.tsx
│   ├── FormSelect.tsx
│   ├── FormDatePicker.tsx
│   ├── FormImagePicker.tsx
│   └── FormValidation.tsx
│
├── features/                        # ⚡ Feature-specific components
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── AuthGate.tsx
│   ├── products/
│   │   ├── ProductCard.tsx
│   │   ├── ProductList.tsx
│   │   └── ProductFilter.tsx
│   ├── projects/
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectTimeline.tsx
│   │   └── ProgressMiniMap.tsx
│   ├── shopping/
│   │   ├── CartItem.tsx
│   │   ├── CartSummary.tsx
│   │   └── CheckoutForm.tsx
│   └── dashboard/
│       ├── StatsCard.tsx
│       ├── ChartWidget.tsx
│       └── RecentActivity.tsx
│
└── shared/                          # 🔄 Shared components
    ├── ErrorBoundary.tsx
    ├── LoadingScreen.tsx
    ├── EmptyState.tsx
    └── RefreshControl.tsx
```

---

## 4. PHÂN CHIA VAI TRÒ NGƯỜI DÙNG

### 4.1 User (Khách hàng)

```
┌─────────────────────────────────────────────────────────────┐
│                    👤 USER INTERFACE                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │  Home   │ │ Projects│ │  Live   │ │ Profile │           │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘           │
│       │           │           │           │                 │
│  ┌────▼────────────▼───────────▼───────────▼────┐          │
│  │                                               │          │
│  │  📦 MUA SẮM        │  🏠 DỊCH VỤ              │          │
│  │  ├── Danh mục      │  ├── Thiết kế nhà        │          │
│  │  ├── Sản phẩm      │  ├── Nội thất            │          │
│  │  ├── Giỏ hàng      │  ├── Thi công            │          │
│  │  └── Thanh toán    │  └── Đặt lịch            │          │
│  │                    │                          │          │
│  │  📁 DỰ ÁN CỦA TÔI  │  💬 LIÊN LẠC             │          │
│  │  ├── Danh sách     │  ├── Tin nhắn            │          │
│  │  ├── Tạo mới       │  ├── Thông báo           │          │
│  │  ├── Tiến độ       │  └── Video call          │          │
│  │  └── Timeline      │                          │          │
│  │                    │                          │          │
│  └───────────────────────────────────────────────┘          │
│                                                             │
│  ⚡ QUICK TOOLS: Dự toán | QR | Thời tiết | AI Assistant   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Employee (Nhân viên)

```
┌─────────────────────────────────────────────────────────────┐
│                   👷 EMPLOYEE INTERFACE                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              📊 DASHBOARD NHÂN VIÊN                  │    │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐        │    │
│  │  │Dự án   │ │Công việc│ │Báo cáo │ │Cảnh báo│        │    │
│  │  │đang làm│ │hôm nay  │ │chờ gửi │ │an toàn │        │    │
│  │  │   5    │ │   12    │ │   3    │ │   1    │        │    │
│  │  └────────┘ └────────┘ └────────┘ └────────┘        │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌──────────────────────┬───────────────────────────┐      │
│  │  🏗️ QUẢN LÝ DỰ ÁN    │  📋 CÔNG VIỆC              │      │
│  │  ├── Danh sách       │  ├── Nhiệm vụ hôm nay     │      │
│  │  ├── Chi tiết        │  ├── Punch list          │      │
│  │  ├── Báo cáo ngày    │  └── Lịch trình tuần     │      │
│  │  └── Tài liệu        │                           │      │
│  │                      │  ✅ QA/QC                  │      │
│  │  📦 TÀI NGUYÊN       │  ├── Kiểm tra            │      │
│  │  ├── Vật liệu        │  ├── Inspection form     │      │
│  │  ├── Nhân công       │  └── Nghiệm thu          │      │
│  │  ├── Thiết bị        │                           │      │
│  │  └── Kho hàng        │  📊 BÁO CÁO               │      │
│  │                      │  ├── Nhật ký công trình  │      │
│  │                      │  ├── Báo cáo tuần        │      │
│  │                      │  └── RFI/Submittal       │      │
│  └──────────────────────┴───────────────────────────┘      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 Admin (Quản trị viên)

```
┌─────────────────────────────────────────────────────────────┐
│                    🛡️ ADMIN INTERFACE                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │               📊 ADMIN DASHBOARD                     │    │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐        │    │
│  │  │Doanh thu│ │Đơn hàng│ │Dự án   │ │Nhân viên│       │    │
│  │  │tháng này│ │mới     │ │active  │ │online  │        │    │
│  │  │₫125M   │ │   42   │ │   15   │ │   8    │        │    │
│  │  └────────┘ └────────┘ └────────┘ └────────┘        │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌──────────────────────┬───────────────────────────┐      │
│  │  👥 QUẢN LÝ          │  📦 SẢN PHẨM & ĐƠN HÀNG   │      │
│  │  ├── Người dùng      │  ├── Danh sách SP         │      │
│  │  ├── Nhân viên       │  ├── Thêm/Sửa SP          │      │
│  │  ├── Phân quyền      │  ├── Đơn hàng             │      │
│  │  └── Hoạt động       │  └── Duyệt sản phẩm       │      │
│  │                      │                           │      │
│  │  📊 PHÂN TÍCH        │  ⚙️ CÀI ĐẶT               │      │
│  │  ├── Doanh thu       │  ├── Hệ thống             │      │
│  │  ├── Hiệu suất       │  ├── Tích hợp            │      │
│  │  ├── Người dùng      │  ├── Thông báo           │      │
│  │  └── Báo cáo         │  └── Backup/Restore      │      │
│  │                      │                           │      │
│  │  🏗️ DỰ ÁN            │                           │      │
│  │  ├── Tất cả dự án    │                           │      │
│  │  ├── Phân công       │                           │      │
│  │  └── Tổng quan       │                           │      │
│  └──────────────────────┴───────────────────────────┘      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. CẤU TRÚC NAVIGATION

### 5.1 Bottom Tabs (Responsive theo Role)

```typescript
// Navigation thay đổi theo role
const TAB_CONFIG = {
  user: [
    { name: 'home', icon: 'home', label: 'Trang chủ' },
    { name: 'shopping', icon: 'cart', label: 'Mua sắm' },
    { name: 'projects', icon: 'folder', label: 'Dự án' },
    { name: 'profile', icon: 'person', label: 'Cá nhân' },
  ],
  employee: [
    { name: 'dashboard', icon: 'grid', label: 'Dashboard' },
    { name: 'projects', icon: 'construct', label: 'Dự án' },
    { name: 'tasks', icon: 'list', label: 'Công việc' },
    { name: 'profile', icon: 'person', label: 'Cá nhân' },
  ],
  admin: [
    { name: 'dashboard', icon: 'stats-chart', label: 'Dashboard' },
    { name: 'management', icon: 'people', label: 'Quản lý' },
    { name: 'analytics', icon: 'bar-chart', label: 'Phân tích' },
    { name: 'settings', icon: 'settings', label: 'Cài đặt' },
  ],
};
```

### 5.2 Deep Linking Structure

```
baotien://                           # App scheme
├── auth/login
├── auth/register
├── user/
│   ├── shopping/:category
│   ├── product/:id
│   ├── orders/:id
│   └── projects/:id
├── employee/
│   ├── projects/:id
│   ├── tasks/:id
│   └── reports/:type
├── admin/
│   ├── users/:id
│   ├── products/:id
│   └── analytics/:type
└── shared/
    ├── messages/:id
    ├── notifications
    └── call/:id
```

---

## 6. CHI TIẾT TỪNG MODULE

### 6.1 Module Authentication

| Màn hình | Route | Mô tả |
|----------|-------|-------|
| Login | /(auth)/login | Đăng nhập |
| Register | /(auth)/register | Đăng ký |
| Forgot Password | /(auth)/forgot-password | Quên mật khẩu |
| Onboarding | /(auth)/onboarding | Giới thiệu app |

### 6.2 Module Shopping (User)

| Màn hình | Route | Mô tả |
|----------|-------|-------|
| Categories | /(user)/shopping | Danh mục sản phẩm |
| Product List | /(user)/shopping/[category] | Sản phẩm theo danh mục |
| Product Detail | /(shared)/product/[id] | Chi tiết sản phẩm |
| Cart | /(user)/shopping/cart | Giỏ hàng |
| Checkout | /(user)/shopping/checkout | Thanh toán |
| Orders | /(user)/orders | Đơn hàng của tôi |

### 6.3 Module Projects

| Màn hình | User | Employee | Admin |
|----------|------|----------|-------|
| List | Dự án của tôi | Dự án được phân | Tất cả |
| Detail | Xem | Xem + Sửa | Xem + Sửa + Xóa |
| Progress | Xem tiến độ | Cập nhật tiến độ | Quản lý tiến độ |
| Timeline | Xem | Cập nhật | Quản lý |
| Budget | Xem tổng quan | Chi tiết | Đầy đủ |
| Documents | Upload cá nhân | Upload + Quản lý | Toàn quyền |

### 6.4 Module Dashboard

| Thành phần | Employee | Admin |
|------------|----------|-------|
| Quick Stats | Dự án đang làm, công việc hôm nay | Doanh thu, đơn hàng, users |
| Charts | Tiến độ dự án | Revenue, Performance |
| Recent Activity | Hoạt động cá nhân | Hoạt động hệ thống |
| Alerts | Cảnh báo an toàn | Cảnh báo hệ thống |
| Quick Actions | Tạo báo cáo, Check-in | Duyệt, Phân quyền |

---

## 7. ROADMAP THỰC HIỆN

### Phase 1: Cơ sở hạ tầng (Tuần 1-2)
```
□ Tạo cấu trúc thư mục mới
□ Setup route groups: (auth), (user), (employee), (admin), (shared)
□ Tạo Role-based layout wrapper
□ Di chuyển và dọn dẹp components
□ Cập nhật navigation system
```

### Phase 2: Authentication & Role Management (Tuần 2-3)
```
□ Hoàn thiện AuthContext với roles
□ Tạo RoleGate component
□ Dynamic tab bar theo role
□ Protected routes
□ Test authentication flow
```

### Phase 3: User Interface (Tuần 3-4)
```
□ Home screen với service layers
□ Shopping module hoàn chỉnh
□ My Projects module
□ Services booking
□ Profile & Settings
```

### Phase 4: Employee Interface (Tuần 4-5)
```
□ Employee dashboard
□ Project management
□ Daily reporting
□ QA/QC module
□ Resource management
```

### Phase 5: Admin Interface (Tuần 5-6)
```
□ Admin dashboard với analytics
□ User management
□ Product management
□ Order management
□ System settings
```

### Phase 6: Shared Features (Tuần 6-7)
```
□ Messaging system
□ Notification center
□ Video call integration
□ AI Assistant
□ Search & Sitemap
```

### Phase 7: Polish & Testing (Tuần 7-8)
```
□ UI/UX refinements
□ Performance optimization
□ Error handling
□ Testing toàn diện
□ Documentation
```

---

## 📌 CHECKLIST HOÀN THÀNH

### Cấu trúc
- [ ] Tách routes theo role
- [ ] Dọn dẹp file thừa/backup
- [ ] Chuẩn hóa naming convention
- [ ] Tổ chức components

### Giao diện
- [ ] Thiết kế nhất quán
- [ ] Responsive design
- [ ] Dark/Light mode
- [ ] Animations mượt

### Chức năng
- [ ] Auth hoạt động ổn định
- [ ] RBAC hoàn chỉnh
- [ ] API integration
- [ ] Offline support

### Testing
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Performance tests

---

## 📝 GHI CHÚ

1. **Ưu tiên cao**: Authentication, Role-based UI, Core navigation
2. **Ưu tiên trung**: Shopping, Projects, Dashboard
3. **Ưu tiên thấp**: Advanced features, Polish

---

*Kế hoạch này sẽ được cập nhật theo tiến độ thực hiện.*
*Liên hệ: Bảo Tiến Team*
