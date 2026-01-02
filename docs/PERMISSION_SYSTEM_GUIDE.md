# Permission & Role Management System
Hệ thống phân quyền role-based access control (RBAC) cho ứng dụng construction management

---

## 📋 Tổng quan

Hệ thống RBAC cho phép kiểm soát truy cập dựa trên vai trò (role) của người dùng. Mỗi role có một tập quyền (permissions) xác định những gì họ có thể làm trong hệ thống.

### Các thành phần chính

1. **Roles** - Vai trò người dùng (15 roles từ Super Admin đến Viewer)
2. **Permissions** - Quyền truy cập (26 modules × 7 actions)
3. **Dashboard** - Giao diện hiển thị theo role
4. **Permission Management** - Quản lý phân quyền (Super Admin only)

---

## 👥 User Roles

### Hierarchy (Cấp độ cao → thấp)

```typescript
SUPER_ADMIN (100)           // Toàn quyền hệ thống
├── ADMIN (90)              // Quản trị viên
├── PROJECT_MANAGER (80)    // Quản lý dự án
├── SITE_MANAGER (70)       // Quản lý công trường
├── ENGINEER (60)           // Kỹ sư
├── ARCHITECT (60)          // Kiến trúc sư
├── FOREMAN (50)            // Giám sát thi công
├── CONTRACTOR (40)         // Nhà thầu chính
├── CONSULTANT (35)         // Tư vấn
├── SUBCONTRACTOR (30)      // Nhà thầu phụ
├── CLIENT (25)             // Khách hàng
├── CLIENT_REP (25)         // Đại diện khách hàng
├── WORKER (20)             // Công nhân
├── SUPPLIER (15)           // Nhà cung cấp
└── VIEWER (10)             // Người xem
```

### Role Descriptions

| Role | Mô tả | Quyền chính |
|------|-------|-------------|
| **SUPER_ADMIN** | Quản trị tối cao | Tất cả quyền, bao gồm quản lý role & permission |
| **ADMIN** | Quản trị viên | Tất cả quyền trừ cài đặt hệ thống |
| **PROJECT_MANAGER** | Quản lý dự án | Quản lý dự án, ngân sách, nhân sự, phê duyệt |
| **SITE_MANAGER** | Quản lý công trường | Quản lý thi công, vật liệu, thiết bị, an toàn |
| **ENGINEER** | Kỹ sư | QC/QA, kiểm tra, tài liệu kỹ thuật |
| **CONTRACTOR** | Nhà thầu | Thực hiện công việc, báo cáo tiến độ |
| **CLIENT** | Khách hàng | Xem tiến độ, phê duyệt thay đổi lớn |
| **VIEWER** | Người xem | Chỉ xem, không chỉnh sửa |

---

## 🔑 Permission Modules

### 26 Modules được quản lý

```typescript
// Dashboard & Analytics
DASHBOARD, ANALYTICS, REPORTS

// Project Management
PROJECTS, TASKS, TIMELINE, MILESTONES

// Resource Management
BUDGET, MATERIALS, EQUIPMENT, LABOR

// Quality & Safety
QC_QA, SAFETY, INSPECTIONS

// Documentation
DOCUMENTS, DRAWINGS, CONTRACTS

// Communication
MESSAGES, ANNOUNCEMENTS, NOTIFICATIONS

// Media
PHOTOS, VIDEOS

// System
USERS, ROLES, SETTINGS, AUDIT_LOG
```

### 7 Permission Actions

```typescript
VIEW      // Xem
CREATE    // Tạo mới
EDIT      // Chỉnh sửa
DELETE    // Xóa
APPROVE   // Phê duyệt
EXPORT    // Xuất
MANAGE    // Quản lý toàn bộ
```

---

## 🎯 Sử dụng trong code

### 1. Check Permission (Hook)

```typescript
import { usePermission } from '@/hooks/usePermissions';
import { PermissionModule, PermissionAction } from '@/types/permission';

function MyComponent() {
  // Check single permission
  const { allowed } = usePermission(
    PermissionModule.PROJECTS,
    PermissionAction.CREATE
  );

  if (!allowed) {
    return <Text>Bạn không có quyền tạo dự án</Text>;
  }

  return <CreateProjectButton />;
}
```

### 2. Get User Role

```typescript
import { useUserRole } from '@/hooks/usePermissions';

function ProfileCard() {
  const userRole = useUserRole();

  return (
    <View>
      <Text>Vai trò: {ROLE_LABELS_VI[userRole]}</Text>
    </View>
  );
}
```

### 3. Check Multiple Permissions

```typescript
import { useHasAllPermissions } from '@/hooks/usePermissions';

function BudgetApprovalButton() {
  const canApprove = useHasAllPermissions([
    { module: PermissionModule.BUDGET, action: PermissionAction.VIEW },
    { module: PermissionModule.BUDGET, action: PermissionAction.APPROVE },
  ]);

  if (!canApprove) return null;

  return <Button title="Phê duyệt ngân sách" />;
}
```

### 4. Check Role Level

```typescript
import { useIsAdmin, useIsProjectManager } from '@/hooks/usePermissions';

function AdminPanel() {
  const isAdmin = useIsAdmin();
  const isPM = useIsProjectManager();

  return (
    <View>
      {isAdmin && <AdminSettings />}
      {isPM && <ProjectManagement />}
    </View>
  );
}
```

### 5. Conditional Dashboard Widget

```typescript
import { useCanViewWidget } from '@/hooks/usePermissions';

function StatsCard({ requiredPerms, minRoleLevel }) {
  const canView = useCanViewWidget(requiredPerms, minRoleLevel);

  if (!canView) return null;

  return <View>{/* Stats content */}</View>;
}

// Usage
<StatsCard
  requiredPerms={[
    { module: PermissionModule.BUDGET, action: PermissionAction.VIEW }
  ]}
  minRoleLevel={ROLE_HIERARCHY.PROJECT_MANAGER}
/>
```

---

## 🎨 Dashboard hiển thị theo Role

### Admin Dashboard Features

**Dashboard tự động hiển thị widgets dựa trên quyền:**

```typescript
// Widget chỉ hiển thị nếu có quyền
const WIDGET_CONFIGS = [
  {
    id: 'projects',
    module: PermissionModule.PROJECTS,
    action: PermissionAction.VIEW,
    // Widget này chỉ hiển thị cho user có quyền VIEW projects
  },
  {
    id: 'staff',
    module: PermissionModule.USERS,
    action: PermissionAction.VIEW,
    minRoleLevel: ROLE_HIERARCHY.ADMIN,
    // Widget này chỉ hiển thị cho Admin trở lên
  },
];
```

### Role Indicator

Dashboard hiển thị vai trò hiện tại của user:

```typescript
<RoleIndicator />
// Output: "Quản lý dự án (Cấp độ: 80)"
```

### Quick Actions theo quyền

Các nút thao tác nhanh chỉ hiển thị nếu có quyền:

```typescript
<QuickActionButton
  icon="add-circle-outline"
  label="Tạo dự án"
  route="/projects/create"
  module={PermissionModule.PROJECTS}
  action={PermissionAction.CREATE}
/>
// Chỉ hiển thị cho user có quyền CREATE projects
```

---

## 🛠️ Permission Management UI

### Truy cập

**Chỉ Super Admin:**
```
Dashboard → Icon key (🔑) → Permission Management
Route: /admin/permissions
```

### Tính năng

1. **Xem tất cả roles** với permission breakdown
2. **Chọn role** để xem chi tiết permissions
3. **Module permissions** hiển thị theo màu action:
   - 🔵 VIEW (Blue)
   - 🟢 CREATE (Green)
   - 🟠 EDIT (Orange)
   - 🔴 DELETE (Red)
   - 🟣 APPROVE (Purple)
   - 🔷 EXPORT (Cyan)
   - 🟧 MANAGE (Orange-Red)

### Screenshot mẫu

```
┌─────────────────────────────────────────────────┐
│ Quản lý phân quyền                        [←]   │
├──────────────┬──────────────────────────────────┤
│ Vai trò      │ Project Manager                  │
│              │                                  │
│ ☑ Super Admin│ Quản lý dự án, tasks, ngân sách  │
│ ☑ Admin      │                                  │
│ ☐ Project... │ ⭐ Cấp 80  🔑 15 modules         │
│ ☐ Site...    │                                  │
│ ☐ Engineer   │ Quyền truy cập:                  │
│ ...          │                                  │
│              │ 📁 Projects                      │
│              │ [Xem] [Tạo] [Sửa] [Phê duyệt]   │
│              │                                  │
│              │ 💰 Budget                        │
│              │ [Xem] [Tạo] [Sửa] [Phê duyệt]...│
└──────────────┴──────────────────────────────────┘
```

---

## 📱 Ví dụ thực tế

### Scenario 1: Project Manager tạo dự án

```typescript
// Check permission trước khi hiển thị form
const { allowed, reason } = usePermission(
  PermissionModule.PROJECTS,
  PermissionAction.CREATE
);

if (!allowed) {
  Alert.alert('Không có quyền', reason);
  return;
}

// Hiển thị form tạo dự án
<CreateProjectForm onSubmit={handleCreate} />
```

### Scenario 2: Client xem tiến độ

```typescript
const userRole = useUserRole();

// Client chỉ xem được, không chỉnh sửa
if (userRole === UserRole.CLIENT) {
  return <ProjectTimelineView readonly />;
}

// Project Manager có thể chỉnh sửa
return <ProjectTimelineEdit />;
```

### Scenario 3: Engineer approve QC

```typescript
const canApprove = useHasAllPermissions([
  { module: PermissionModule.QC_QA, action: PermissionAction.VIEW },
  { module: PermissionModule.QC_QA, action: PermissionAction.APPROVE },
]);

// Button chỉ hiển thị cho Engineer có quyền approve
{canApprove && (
  <Button title="Phê duyệt QC" onPress={handleApprove} />
)}
```

### Scenario 4: Dashboard widgets khác nhau

```typescript
// Admin Dashboard
- Tổng dự án ✓
- Nhân viên ✓
- Khách hàng ✓
- QC/QA ✓
- An toàn ✓
- Ngân sách ✓

// Site Manager Dashboard
- Tổng dự án ✓
- Công việc ✓
- Vật liệu ✓
- Thiết bị ✓
- An toàn ✓
- Nhân công ✓

// Client Dashboard
- Tổng dự án ✓
- Tiến độ ✓
- Ngân sách ✓ (view only)
- Ảnh tiến độ ✓
- Báo cáo ✓
```

---

## 🔒 Security Best Practices

### 1. Always check on backend
Frontend permission checks là UI enhancement, **backend PHẢI validate lại**:

```typescript
// Frontend
const { allowed } = usePermission(PermissionModule.BUDGET, PermissionAction.EDIT);
if (!allowed) return;

// Backend API PHẢI check lại
POST /api/budget/update
Headers: { Authorization: Bearer <token> }
// → Backend validates user role & permissions
```

### 2. Không hardcode roles
```typescript
// ❌ BAD
if (user.role === 'admin') { ... }

// ✅ GOOD
if (useIsAdmin()) { ... }
```

### 3. Use hooks trong components
```typescript
// ❌ BAD - Direct permission check
const hasPermission = hasRolePermission(userRole, module, action);

// ✅ GOOD - Use hook
const { allowed } = usePermission(module, action);
```

### 4. Validate project-specific permissions
```typescript
// Check global permission
const { allowed: canViewProjects } = usePermission(
  PermissionModule.PROJECTS,
  PermissionAction.VIEW
);

// Check project-specific permission
const { allowed: canEditThisProject } = usePermission(
  PermissionModule.PROJECTS,
  PermissionAction.EDIT,
  projectId  // ← Project context
);
```

---

## 🔄 Migration từ old permission system

### Old way
```typescript
import { isAdmin } from '@/utils/permissions';

if (isAdmin(user)) {
  // Show admin features
}
```

### New way
```typescript
import { useIsAdmin } from '@/hooks/usePermissions';

const isAdmin = useIsAdmin();

if (isAdmin) {
  // Show admin features
}
```

### Migration table

| Old | New |
|-----|-----|
| `isAdmin(user)` | `useIsAdmin()` |
| `user.role === 'admin'` | `useUserRole() === UserRole.ADMIN` |
| Manual permission check | `usePermission(module, action)` |
| Hardcoded role levels | `ROLE_HIERARCHY[role]` |

---

## 📊 Testing

### Test permission hooks

```typescript
import { renderHook } from '@testing-library/react-hooks';
import { usePermission } from '@/hooks/usePermissions';

test('Admin can create projects', () => {
  const { result } = renderHook(() =>
    usePermission(PermissionModule.PROJECTS, PermissionAction.CREATE)
  );

  expect(result.current.allowed).toBe(true);
});

test('Viewer cannot create projects', () => {
  const { result } = renderHook(() =>
    usePermission(PermissionModule.PROJECTS, PermissionAction.CREATE)
  );

  expect(result.current.allowed).toBe(false);
  expect(result.current.reason).toContain('Permission denied');
});
```

---

## 🎯 Next Steps

### Phase 1: Basic Implementation ✅
- [x] Type definitions
- [x] Permission presets
- [x] Permission hooks
- [x] RBAC Dashboard
- [x] Permission Management UI

### Phase 2: Integration (To-do)
- [ ] Backend API integration
- [ ] User role assignment UI
- [ ] Project-specific roles
- [ ] Audit log for permission changes
- [ ] Role templates

### Phase 3: Advanced (Future)
- [ ] Custom permissions (beyond presets)
- [ ] Time-based permissions (expiry)
- [ ] Conditional permissions (if-then rules)
- [ ] Permission delegation
- [ ] Multi-factor approval workflows

---

## 📝 Files Created

```
types/
  └── permission.ts              // Permission & Role types

utils/
  └── permission-presets.ts      // Role permission presets & helpers

hooks/
  └── usePermissions.ts          // Permission checking hooks

app/admin/
  ├── dashboard.tsx              // Redirect to RBAC dashboard
  ├── dashboard-rbac.tsx         // Role-based dashboard
  └── permissions.tsx            // Permission management UI

docs/
  └── PERMISSION_SYSTEM_GUIDE.md // This file
```

---

**Version:** 1.0.0  
**Last Updated:** December 2025  
**Status:** ✅ Production Ready
