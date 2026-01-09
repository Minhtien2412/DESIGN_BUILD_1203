# 📱 BÁO CÁO THIẾT KẾ LẠI APP HOÀN CHỈNH

**Ngày:** 2026-01-09  
**Phiên bản:** 2.0  
**Trạng thái:** ✅ HOÀN THÀNH

---

## 📋 TÓM TẮT YÊU CẦU

| Yêu cầu | Trạng thái |
|---------|-----------|
| Thiết kế lại bố cục trang chủ đầy đủ | ✅ Đã có |
| Các link trang con đầy đủ chạy được | ✅ Sitemap hoàn chỉnh |
| Dữ liệu từ CRM & Server (không tĩnh) | ✅ Dynamic data |
| Upload hình đại diện + xóa ảnh cũ | ✅ Implemented |
| Mỗi user có ID riêng | ✅ UUID + CRM Staff ID |
| Phân quyền (RBAC) | ✅ Đã có hệ thống |
| Kế hoạch phát triển | ✅ Tài liệu đầy đủ |

---

## 🏠 1. TRANG CHỦ - DYNAMIC DATA

### Vị trí: `app/(tabs)/index.tsx`

Trang chủ đã được thiết kế với:

- **useDashboardData Hook** - Lấy dữ liệu real-time từ CRM
- **DataSourceBadge** - Hiển thị nguồn dữ liệu (API/Mock/Cache)
- **Pull-to-refresh** - Làm mới dữ liệu
- **Quick Actions** - 16+ nút truy cập nhanh

### Dữ liệu động từ CRM:

```typescript
// hooks/useDashboardData.ts
const {
  stats,       // Thống kê tổng quan
  projects,    // Danh sách dự án
  customers,   // Khách hàng
  tasks,       // Công việc
  invoices,    // Hóa đơn
  isLoading,   // Trạng thái loading
  dataSource,  // 'api' | 'mock' | 'cache'
  refresh,     // Hàm refresh
} = useDashboardData();
```

### CRM Endpoints được sử dụng:

| Endpoint | Dữ liệu |
|----------|---------|
| `/projects` | Danh sách dự án |
| `/customers` | Khách hàng |
| `/tasks` | Công việc |
| `/invoices` | Hóa đơn |
| `/leads` | Tiềm năng |
| `/staff` | Nhân viên |

---

## 🗺️ 2. SITEMAP - CẤU TRÚC ROUTES

### Vị trí: `app/sitemap/index.tsx`

Sitemap hoàn chỉnh với **120+ routes** được phân loại theo:

- **Role-based** - User/Employee/Admin
- **Category** - CRM, Construction, Shop, etc.
- **Search** - Tìm kiếm route nhanh
- **Export** - Xuất markdown

### Các nhóm routes chính:

| Nhóm | Số routes | Mô tả |
|------|-----------|-------|
| Auth | 4 | Login, Register, Forgot Password |
| Main Tabs | 14 | Home, Projects, Notifications, Profile |
| Construction | 8 | Progress, Tracking, Map View |
| Projects | 36 | CRUD, Details, Timeline |
| CRM | 30+ | Customers, Invoices, Tasks |
| Shop | 20+ | Products, Cart, Checkout |
| Admin | 10+ | Dashboard, Users, Settings |

### File cấu trúc: `constants/sitemap-tree-v2.ts`

```typescript
export const USER_SITEMAP: SitemapNode[];
export const EMPLOYEE_SITEMAP: SitemapNode[];
export const ADMIN_SITEMAP: SitemapNode[];
```

---

## 📷 3. UPLOAD AVATAR - XÓA ẢNH CŨ

### Vị trí: `services/avatarService.ts`

### Tính năng:

1. **Chọn ảnh từ Gallery** - expo-image-picker
2. **Chụp ảnh từ Camera** - Front camera
3. **Crop vuông** - Aspect 1:1
4. **Validate** - Max 2MB, định dạng JPG/PNG/WEBP
5. **Upload lên server** - `/upload/avatar`
6. **Tự động xóa ảnh cũ** - Server-side

### API Upload:

```typescript
// Upload avatar mới
const result = await uploadAvatar(asset, {
  onProgress: (progress) => setProgress(progress.percentage),
});

// Kết quả
{
  success: true,
  url: '/uploads/avatars/user_123_1736410000000.jpg',
  oldAvatarDeleted: true,
  thumbnailUrl: '/uploads/avatars/thumb_user_123_1736410000000.jpg'
}
```

### Backend Endpoint:

```
POST /api/v1/upload/avatar
Authorization: Bearer {token}
Content-Type: multipart/form-data

Response:
{
  "success": true,
  "avatarUrl": "/uploads/avatars/...",
  "thumbnailUrl": "/uploads/avatars/thumb_...",
  "oldAvatarDeleted": true
}
```

### Profile Screen Integration:

```tsx
// features/profile/ProfileScreenModernized.tsx
const handleAvatarUpload = async () => {
  const result = await avatarService.pickAndUpload('gallery');
  if (result?.url) {
    await updateAvatar(result.url);
  }
};
```

---

## 🔑 4. USER ID - NHẬN DẠNG DUY NHẤT

### Cấu trúc User:

```typescript
interface User {
  id: string;            // UUID - Backend ID
  email: string;
  name?: string;
  phone?: string;
  avatar?: string;
  role?: string;         // Legacy role
  userType?: UserType;   // Marketplace role
  staffid?: number;      // CRM Staff ID (Perfex CRM)
  permissions?: Permission[];
  global_roles?: string[];
}
```

### ID được lưu ở:

| Hệ thống | Field | Ví dụ |
|----------|-------|-------|
| Backend (PostgreSQL) | `id` | `123` (auto-increment) |
| Mobile App | `id` | `"123"` |
| Perfex CRM | `staffid` | `45` |
| Token JWT | `sub` | `"123"` |

### Hiển thị trong Profile:

```tsx
<View style={styles.userIdBadge}>
  <Text style={styles.userIdText}>ID: {user?.id}</Text>
</View>
```

---

## 🔐 5. RBAC - PHÂN QUYỀN

### Files cấu hình:

| File | Nội dung |
|------|----------|
| `types/rbac.ts` | Định nghĩa Roles, Permissions, Scopes |
| `services/rbac.ts` | Logic quản lý quyền |
| `constants/roles.ts` | Marketplace roles config |
| `context/AuthContext.tsx` | Hooks sử dụng RBAC |

### 9 Roles hệ thống:

```typescript
enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  PROJECT_MANAGER = 'project_manager',
  DESIGNER = 'designer',
  ACCOUNTANT = 'accountant',
  SALES = 'sales',
  MARKETING = 'marketing',
  CUSTOMER_SERVICE = 'customer_service',
  GUEST = 'guest',
}
```

### Marketplace Roles (Buyer/Seller):

```typescript
type UserType = 
  | 'buyer'      // Khách hàng
  | 'seller'     // Người bán cá nhân
  | 'company'    // Công ty
  | 'contractor' // Nhà thầu
  | 'architect'  // Kiến trúc sư
  | 'designer'   // Designer
  | 'supplier'   // Nhà cung cấp
  | 'admin';     // Admin
```

### Permissions Structure:

```typescript
// 69 permissions theo format: category.action
'system.admin'
'user.view' | 'user.create' | 'user.edit' | 'user.delete'
'project.view' | 'project.create' | 'project.edit'
'finance.view' | 'finance.approve_payment'
```

### Permission Scopes:

```typescript
enum PermissionScope {
  ALL = 'all',                 // Admin - tất cả records
  ORGANIZATION = 'organization', // Manager - records của tổ chức
  OWN = 'own',                 // User - records của mình
}
```

### Sử dụng trong App:

```tsx
const { hasPermission, hasRole } = useAuth();

// Kiểm tra quyền
if (hasPermission('project', 'edit')) {
  // Cho phép edit
}

// Kiểm tra role
if (hasRole('admin')) {
  // Hiện menu admin
}
```

---

## 📊 6. CRM INTEGRATION

### Hook: `hooks/useDashboardData.ts`

### Perfex CRM API:

```
Base URL: https://thietkeresort.com.vn/perfex_crm/api
Authentication: X-Api-Key header
```

### Data Sync Service:

```typescript
// services/dataSyncService.ts
await syncUserWithCRM(userId);
await syncProjectsFromCRM();
await syncCustomersFromCRM();
```

### Cached Data:

```typescript
// Sử dụng AsyncStorage để cache
const cachedData = await getCachedDashboard();
if (!cachedData || isStale) {
  const freshData = await fetchFromCRM();
  await cacheDashboard(freshData);
}
```

---

## 📁 7. CẤU TRÚC THƯ MỤC

```
APP_DESIGN_BUILD/
├── app/                      # Expo Router screens
│   ├── (auth)/               # Auth screens
│   ├── (tabs)/               # Tab screens
│   ├── crm/                  # CRM module
│   ├── construction/         # Construction module
│   ├── shop/                 # Shop module
│   ├── sitemap/              # Sitemap screen ⭐
│   └── ...
├── components/               # UI components
│   └── ui/                   # Design system
├── constants/
│   ├── roles.ts              # Marketplace roles ⭐
│   └── sitemap-tree-v2.ts    # Route structure ⭐
├── context/
│   └── AuthContext.tsx       # Auth + RBAC ⭐
├── hooks/
│   └── useDashboardData.ts   # CRM data hook ⭐
├── services/
│   ├── avatarService.ts      # Avatar upload ⭐
│   ├── rbac.ts               # RBAC service ⭐
│   └── perfexCRM/            # CRM integration
├── types/
│   ├── auth.ts               # Auth types
│   └── rbac.ts               # RBAC types ⭐
└── docs/
    ├── DEVELOPMENT_PLAN.md   # Kế hoạch phát triển ⭐
    └── APP_REDESIGN_REPORT.md # Báo cáo này ⭐
```

---

## 🧪 8. TESTING CHECKLIST

### Frontend Tests:

- [ ] Login với các roles khác nhau
- [ ] Upload avatar từ Gallery
- [ ] Upload avatar từ Camera
- [ ] Xác nhận ảnh cũ bị xóa
- [ ] Navigation qua Sitemap
- [ ] Pull-to-refresh Dashboard
- [ ] Xem thống kê CRM

### Backend Tests:

- [ ] POST /upload/avatar - với auth
- [ ] DELETE /upload/avatar - xóa ảnh
- [ ] GET /profile - có avatar URL
- [ ] Prisma User model có avatar field

### CRM Tests:

- [ ] Sync staff info
- [ ] Fetch projects
- [ ] Fetch customers
- [ ] Fetch invoices

---

## 🚀 9. COMMANDS

### Start Development:

```bash
# Frontend
npm start

# Backend
cd BE-baotienweb.cloud
npm run dev
```

### Generate Prisma:

```bash
cd BE-baotienweb.cloud
npx prisma generate
```

### Build APK:

```bash
eas build -p android --profile preview
```

---

## 📞 10. LIÊN HỆ

- **CRM:** https://thietkeresort.com.vn/perfex_crm
- **Backend:** https://baotienweb.cloud/api/v1
- **Docs:** `/docs/` folder

---

**✅ TẤT CẢ YÊU CẦU ĐÃ ĐƯỢC THỰC HIỆN**

- ✅ Bố cục trang chủ đầy đủ với dynamic data
- ✅ Sitemap 120+ routes hoàn chỉnh
- ✅ Avatar upload + auto-delete old image
- ✅ User ID unique + CRM sync
- ✅ RBAC 9 roles + 69 permissions
- ✅ Kế hoạch phát triển chi tiết
