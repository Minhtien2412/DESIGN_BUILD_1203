# 📱 KẾ HOẠCH PHÁT TRIỂN APP - THIETKERESORT

> **Ngày tạo:** 09/01/2026  
> **Cập nhật:** 09/01/2026  
> **Phiên bản:** 2.1  
> **Mục tiêu:** Hoàn thiện App với dữ liệu động từ CRM/API, hệ thống user hoàn chỉnh

---

## 📊 TỔNG QUAN HIỆN TRẠNG

### ✅ Đã hoàn thành:
- **Expo Router** với 120+ routes
- **AuthContext** với login/logout/Google OAuth
- **Perfex CRM API** đã kết nối (customers, projects, tasks, invoices, etc.)
- **Avatar Upload Service** - expo-image-picker + auto-delete old avatar
- **Dashboard Hook** lấy dữ liệu từ CRM
- **RBAC System** - 9 roles, 69 permissions, 3 scopes
- **Sitemap** - 120+ routes với role-based filtering
- **Environment Config** - Dev/Staging/Production

### ⚠️ Cần kiểm tra:
- Test avatar upload trên thiết bị thật
- Verify CRM data sync
- Push notifications

---

## 🚀 TRẠNG THÁI BUILD APK

| Môi trường | Profile | API | Trạng thái |
|------------|---------|-----|------------|
| Development | `development` | localhost:4000 | ✅ Ready |
| Preview/Staging | `preview` | baotienweb.cloud | 🔄 Building |
| Production | `production` | api.thietkeresort.com.vn | ✅ Ready |
| Production APK | `production-apk` | api.thietkeresort.com.vn | ✅ Ready |

### Latest Build:
- **Preview APK**: [Build abfaef29](https://expo.dev/accounts/adminmarketingnx/projects/APP_DESIGN_BUILD/builds/abfaef29-df94-4805-aa29-f2894bcc9064)

### Commands:
```powershell
# Preview APK (nội bộ)
./build-apk.ps1 -env preview

# Production AAB (Play Store)
./build-apk.ps1 -env prod

# Production APK (cài trực tiếp)
./build-apk.ps1 -env prod-apk
```

---

## 🎯 MỤC TIÊU ĐÃ HOÀN THÀNH

### 1. **Trang chủ (Home Screen)** ✅
- [x] Layout Shopee-style với grid modules
- [x] Dữ liệu động từ CRM (useDashboardData hook)
- [x] Badge động (DataSourceBadge)
- [x] Pull-to-refresh
- [x] Deep link tất cả modules

### 2. **Profile & Avatar** ✅
- [x] Upload avatar lên server (avatarService.ts)
- [x] Tự động xóa hình cũ khi upload mới
- [x] Lưu avatar URL vào user profile
- [x] Hiển thị avatar trong ProfileScreen

### 3. **User Authentication** ✅
- [x] User ID unique từ Backend
- [x] Sync user với Perfex CRM (staffid)
- [x] JWT token management
- [x] Refresh token flow

### 4. **Phân quyền (RBAC)** ✅
- [x] 9 Roles hệ thống + 8 Marketplace roles
- [x] 69 Permissions matrix
- [x] Route protection (sitemap-tree-v2.ts)
- [x] UI hide/show theo quyền (hasPermission, hasRole)

### 5. **Data Integration** ✅
- [x] CRM: Projects, Customers, Tasks, Invoices
- [x] Backend: Users, Avatar upload
- [x] WebSocket config (chat, call, progress namespaces)
- [x] Offline caching (AsyncStorage)

---

## 📁 CẤU TRÚC ROUTES

### Tabs chính:
```
/(tabs)/
├── index.tsx          - Trang chủ
├── projects.tsx       - Danh sách dự án
├── notifications.tsx  - Thông báo
├── profile.tsx        - Cá nhân
└── menu.tsx           - Menu đầy đủ
```

### CRM Modules (/crm):
```
/crm/
├── index.tsx          - Dashboard CRM
├── customers.tsx      - Khách hàng
├── projects.tsx       - Dự án
├── tasks.tsx          - Công việc
├── leads.tsx          - Leads/Tiềm năng
├── tickets.tsx        - Hỗ trợ
├── contracts.tsx      - Hợp đồng
├── invoices.tsx       - Hoá đơn
├── expenses.tsx       - Chi phí
├── staff.tsx          - Nhân viên
├── milestones.tsx     - Mốc tiến độ
├── files.tsx          - Tài liệu
├── activity.tsx       - Hoạt động
└── time-tracking.tsx  - Chấm công
```

### Core Modules:
```
/projects/             - Quản lý dự án
/construction/         - Thi công
/documents/            - Tài liệu
/contracts/            - Hợp đồng
/quality-assurance/    - QA/QC
/safety/               - An toàn
/inventory/            - Kho bãi
/fleet/                - Phương tiện
/labor/                - Nhân công
```

### Commerce:
```
/shopping/             - Mua sắm vật liệu
/services/             - Dịch vụ xây dựng
/cart.tsx              - Giỏ hàng
/checkout.tsx          - Thanh toán
```

### Communication:
```
/messages/             - Tin nhắn
/call/                 - Video call
/(tabs)/live.tsx       - Livestream
/social/               - Mạng xã hội
```

### Admin:
```
/admin/                - Quản trị
/dashboard/            - Dashboard
/analytics/            - Báo cáo
/reports/              - Thống kê
```

---

## 🔐 HỆ THỐNG USER

### User Model:
```typescript
interface User {
  // Core Identity (from Backend)
  id: string;              // UUID từ Backend
  email: string;
  name: string;
  phone?: string;
  avatar?: string;         // URL avatar trên server
  
  // Authentication
  role: UserRole;          // ADMIN | MANAGER | STAFF | CLIENT | CONTRACTOR
  permissions: Permission[];
  
  // CRM Integration
  staffid?: number;        // Perfex CRM staff ID
  contactid?: number;      // Perfex CRM contact ID
  customerid?: number;     // Perfex CRM customer ID
  
  // Profile
  companyName?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}
```

### Roles & Permissions:
| Role | CRM Access | Admin | Projects | Documents | Chat |
|------|-----------|-------|----------|-----------|------|
| ADMIN | Full | Yes | Full | Full | Full |
| MANAGER | Full | Limited | Full | Full | Full |
| STAFF | Limited | No | Assigned | Own | Team |
| CLIENT | Own | No | Assigned | Own | Support |
| CONTRACTOR | Assigned | No | Assigned | Shared | Project |

---

## 🖼️ AVATAR UPLOAD FLOW

```
1. User chọn ảnh (Gallery/Camera)
   ↓
2. Compress ảnh (max 2MB, 1024x1024)
   ↓
3. Upload lên Backend /upload/avatar
   ↓
4. Backend:
   - Lưu file vào /uploads/avatars/{userId}/
   - Xóa avatar cũ (nếu có)
   - Update user.avatar trong DB
   - Return URL mới
   ↓
5. App update AuthContext với avatar mới
   ↓
6. UI cập nhật hiển thị
```

---

## 📡 API ENDPOINTS

### Backend (baotienweb.cloud):
```
POST   /auth/login              - Đăng nhập
POST   /auth/register           - Đăng ký
POST   /auth/google             - Google OAuth
GET    /auth/me                 - Lấy user info
PUT    /user/profile            - Cập nhật profile
POST   /upload/avatar           - Upload avatar
DELETE /upload/avatar           - Xóa avatar
GET    /notifications           - Lấy thông báo
```

### Perfex CRM (thietkeresort.com.vn/perfex_crm):
```
GET    /api/customers           - Khách hàng
GET    /api/projects            - Dự án
GET    /api/tasks               - Công việc
GET    /api/invoices            - Hoá đơn
GET    /api/expenses            - Chi phí
GET    /api/contracts           - Hợp đồng
GET    /api/staff               - Nhân viên
```

---

## 🚀 TIMELINE THỰC HIỆN

### Phase 1: Core (Ngay bây giờ)
- [x] Phân tích cấu trúc
- [ ] Tạo HomeScreen với data động
- [ ] Fix Avatar upload
- [ ] Hoàn thiện User ID system

### Phase 2: Data Integration (2-3 ngày)
- [ ] Kết nối tất cả CRM endpoints
- [ ] Real-time notifications
- [ ] Offline caching

### Phase 3: RBAC (2-3 ngày)
- [ ] Implement roles & permissions
- [ ] Route protection
- [ ] UI adaptation

### Phase 4: Polish (2-3 ngày)
- [ ] Testing tất cả routes
- [ ] Error handling
- [ ] Performance optimization

---

## 📋 CHECKLIST

### Trang chủ:
- [ ] Header với avatar + notifications
- [ ] Banner slider từ API
- [ ] Quick access grid với badges
- [ ] Recent projects từ CRM
- [ ] Pending tasks từ CRM
- [ ] Statistics cards
- [ ] Pull-to-refresh

### Profile:
- [ ] Avatar với upload button
- [ ] Edit profile form
- [ ] Change password
- [ ] Settings section
- [ ] Logout button
- [ ] Delete account

### Navigation:
- [ ] Tất cả 120+ routes hoạt động
- [ ] Deep linking
- [ ] Back navigation
- [ ] Tab bar badges

### Data:
- [ ] Projects từ CRM
- [ ] Customers từ CRM
- [ ] Tasks từ CRM
- [ ] Invoices từ CRM
- [ ] Notifications từ Backend
- [ ] Messages từ Backend

---

## 🛠️ FILES CẦN TẠO/SỬA

1. `app/(tabs)/index.tsx` - HomeScreen với data động
2. `features/profile/ProfileScreenModernized.tsx` - Avatar upload
3. `services/avatarService.ts` - Avatar upload logic
4. `hooks/useUserProfile.ts` - Profile management
5. `constants/permissions.ts` - RBAC definitions
6. `components/home/` - Home screen components
7. `app/sitemap/index.tsx` - Full sitemap

---

*Báo cáo này sẽ được cập nhật khi tiến độ thay đổi.*
