# 🔐 HỆ THỐNG XÁC THỰC VÀ PHÂN QUYỀN - TÀI LIỆU TỔNG HỢP

> **Ngày cập nhật:** 12/12/2025
> 
> **Backend API:** https://baotienweb.cloud/api/v1
> 
> **Status:** ✅ Đã triển khai và hoạt động

---

## 📋 MỤC LỤC

1. [Tổng quan hệ thống](#1-tổng-quan-hệ-thống)
2. [AuthContext - Quản lý xác thực](#2-authcontext---quản-lý-xác-thực)
3. [Hệ thống phân quyền (RBAC)](#3-hệ-thống-phân-quyền-rbac)
4. [Hooks và Utilities](#4-hooks-và-utilities)
5. [Bảo vệ Routes và Components](#5-bảo-vệ-routes-và-components)
6. [API Endpoints](#6-api-endpoints)
7. [Các ví dụ thực tế](#7-các-ví-dụ-thực-tế)

---

## 1. TỔNG QUAN HỆ THỐNG

### 1.1. Kiến trúc

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND APP                       │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌─────────────────┐      ┌──────────────────┐     │
│  │  AuthContext    │◄────►│  usePermissions  │     │
│  │  (User State)   │      │  (RBAC Hooks)    │     │
│  └────────┬────────┘      └──────────────────┘     │
│           │                                          │
│           │ ┌──────────────────────────────┐       │
│           └►│  Protected Routes/Components │       │
│             └──────────────────────────────┘       │
│                          │                          │
└──────────────────────────┼──────────────────────────┘
                           │ JWT Token
                           ▼
┌─────────────────────────────────────────────────────┐
│              BACKEND API (NestJS)                    │
├─────────────────────────────────────────────────────┤
│  Authentication Module                               │
│  ├─ POST /auth/register                             │
│  ├─ POST /auth/login                                │
│  ├─ GET  /auth/profile                              │
│  └─ POST /auth/refresh                              │
│                                                      │
│  JWT Strategy + Guards                              │
│  Database: PostgreSQL                               │
└─────────────────────────────────────────────────────┘
```

### 1.2. Flow đăng nhập

```
User nhập email/password
        ↓
AuthContext.signIn(email, password)
        ↓
POST /api/v1/auth/login
        ↓
Backend verify credentials
        ↓
Return: { accessToken, refreshToken, user }
        ↓
Store tokens in SecureStore
        ↓
Set user state trong AuthContext
        ↓
Redirect to home screen
```

---

## 2. AUTHCONTEXT - QUẢN LÝ XÁC THỰC

### 2.1. File: `context/AuthContext.tsx`

**Chức năng chính:**
- Quản lý trạng thái đăng nhập (user state)
- Lưu trữ và quản lý JWT tokens
- Tự động refresh token khi hết hạn
- Cung cấp methods cho authentication

### 2.2. AuthContext Interface

```typescript
interface AuthContextType {
  // State
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  
  // Authentication methods
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string, role?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  
  // OAuth methods (stub - chưa implement backend)
  signInWithGoogle: () => Promise<void>;
  signInWithGoogleCode: (code: string) => Promise<void>;
  signInWithGoogleToken: (credential: string, clientId?: string) => Promise<void>;
  signInWithGoogleAccessToken: (accessToken: string) => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  
  // Profile methods
  updateAvatar: (avatarUrl: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  
  // Permission checks
  hasPermission: (feature: string, capability: string) => boolean;
  hasRole: (role: string | string[]) => boolean;
}
```

### 2.3. User Object Structure

```typescript
interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  avatar?: string;
  role?: string;              // 'CLIENT', 'ENGINEER', 'ADMIN', etc.
  admin?: number;             // 1 if admin, 0 otherwise
  permissions?: Permission[]; // Array of permissions (RBAC)
  staffid?: number;           // For Perfex CRM staff
  global_roles?: string[];    // Multi-role support
}
```

### 2.4. Sử dụng AuthContext

```typescript
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, signIn, signOut } = useAuth();
  
  // Check authentication
  if (!isAuthenticated) {
    return <LoginPrompt />;
  }
  
  // Access user info
  return (
    <View>
      <Text>Xin chào, {user?.name}</Text>
      <Text>Role: {user?.role}</Text>
      <Button onPress={signOut} title="Đăng xuất" />
    </View>
  );
}
```

### 2.5. Token Management

**Lưu trữ tokens:**
```typescript
// Sử dụng SecureStore (Expo)
import { setItem, getItem, deleteItem } from '@/utils/storage';

// Lưu token
await setItem('accessToken', token);
await setItem('refreshToken', refreshToken);

// Đọc token
const token = await getItem('accessToken');

// Xóa token (khi logout)
await deleteItem('accessToken');
await deleteItem('refreshToken');
```

**Auto-refresh token:**
```typescript
// File: services/api.ts
// Tự động refresh khi accessToken hết hạn
const response = await fetch(url, {
  headers: {
    Authorization: `Bearer ${accessToken}`
  }
});

if (response.status === 401) {
  // Token expired, refresh it
  const newToken = await refreshAccessToken(refreshToken);
  // Retry request with new token
}
```

---

## 3. HỆ THỐNG PHÂN QUYỀN (RBAC)

### 3.1. Role-Based Access Control

**15 User Roles (Hierarchy cao → thấp):**

```typescript
enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',      // 100 - Toàn quyền
  ADMIN = 'ADMIN',                   // 90  - Quản trị viên
  PROJECT_MANAGER = 'PROJECT_MANAGER', // 80  - Quản lý dự án
  SITE_MANAGER = 'SITE_MANAGER',     // 70  - Quản lý công trường
  ENGINEER = 'ENGINEER',             // 60  - Kỹ sư
  ARCHITECT = 'ARCHITECT',           // 60  - Kiến trúc sư
  FOREMAN = 'FOREMAN',               // 50  - Giám sát thi công
  CONTRACTOR = 'CONTRACTOR',         // 40  - Nhà thầu chính
  CONSULTANT = 'CONSULTANT',         // 35  - Tư vấn
  SUBCONTRACTOR = 'SUBCONTRACTOR',   // 30  - Nhà thầu phụ
  CLIENT = 'CLIENT',                 // 25  - Khách hàng
  CLIENT_REP = 'CLIENT_REP',         // 25  - Đại diện khách hàng
  WORKER = 'WORKER',                 // 20  - Công nhân
  SUPPLIER = 'SUPPLIER',             // 15  - Nhà cung cấp
  VIEWER = 'VIEWER',                 // 10  - Người xem
}
```

### 3.2. Permission Modules (26 Modules)

```typescript
enum PermissionModule {
  // Dashboard & Analytics
  DASHBOARD,
  ANALYTICS,
  REPORTS,
  
  // Project Management
  PROJECTS,
  TASKS,
  TIMELINE,
  MILESTONES,
  
  // Resource Management
  BUDGET,
  MATERIALS,
  EQUIPMENT,
  LABOR,
  
  // Quality & Safety
  QC_QA,
  SAFETY,
  INSPECTIONS,
  
  // Documentation
  DOCUMENTS,
  DRAWINGS,
  CONTRACTS,
  
  // Communication
  MESSAGES,
  ANNOUNCEMENTS,
  NOTIFICATIONS,
  
  // Media
  PHOTOS,
  VIDEOS,
  
  // System
  USERS,
  ROLES,
  SETTINGS,
  AUDIT_LOG,
}
```

### 3.3. Permission Actions (7 Actions)

```typescript
enum PermissionAction {
  VIEW,      // Xem
  CREATE,    // Tạo mới
  EDIT,      // Chỉnh sửa
  DELETE,    // Xóa
  APPROVE,   // Phê duyệt
  EXPORT,    // Xuất dữ liệu
  MANAGE,    // Quản lý toàn bộ
}
```

### 3.4. Role Permission Matrix

| Role | Projects | Budget | Users | Settings |
|------|----------|--------|-------|----------|
| **SUPER_ADMIN** | ✅ ALL | ✅ ALL | ✅ ALL | ✅ ALL |
| **ADMIN** | ✅ ALL | ✅ ALL | ✅ VIEW, CREATE, EDIT | ✅ VIEW, EDIT |
| **PROJECT_MANAGER** | ✅ VIEW, CREATE, EDIT, APPROVE | ✅ VIEW, CREATE, EDIT, APPROVE | ✅ VIEW | ❌ |
| **ENGINEER** | ✅ VIEW, CREATE, EDIT | ✅ VIEW | ❌ | ❌ |
| **CLIENT** | ✅ VIEW | ✅ VIEW | ❌ | ❌ |
| **VIEWER** | ✅ VIEW | ❌ | ❌ | ❌ |

---

## 4. HOOKS VÀ UTILITIES

### 4.1. usePermissions Hooks

**File:** `hooks/usePermissions.ts`

#### 4.1.1. Get User Role

```typescript
import { useUserRole } from '@/hooks/usePermissions';

function MyComponent() {
  const userRole = useUserRole();
  
  return <Text>Vai trò: {userRole}</Text>;
}
```

#### 4.1.2. Check Single Permission

```typescript
import { usePermission } from '@/hooks/usePermissions';
import { PermissionModule, PermissionAction } from '@/types/permission';

function CreateProjectButton() {
  const { allowed, reason } = usePermission(
    PermissionModule.PROJECTS,
    PermissionAction.CREATE
  );
  
  if (!allowed) {
    return <Text>{reason}</Text>;
  }
  
  return <Button title="Tạo dự án" />;
}
```

#### 4.1.3. Check Multiple Permissions

```typescript
import { useHasAllPermissions } from '@/hooks/usePermissions';

function BudgetApprovalScreen() {
  const canApprove = useHasAllPermissions([
    { module: PermissionModule.BUDGET, action: PermissionAction.VIEW },
    { module: PermissionModule.BUDGET, action: PermissionAction.APPROVE },
  ]);
  
  if (!canApprove) {
    return <AccessDenied />;
  }
  
  return <BudgetApprovalForm />;
}
```

#### 4.1.4. Check Any Permission (OR condition)

```typescript
import { useHasAnyPermission } from '@/hooks/usePermissions';

function DashboardWidget() {
  const canViewDashboard = useHasAnyPermission([
    { module: PermissionModule.DASHBOARD, action: PermissionAction.VIEW },
    { module: PermissionModule.ANALYTICS, action: PermissionAction.VIEW },
  ]);
  
  if (!canViewDashboard) return null;
  
  return <Widget />;
}
```

#### 4.1.5. Check Role Level

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

#### 4.1.6. Get Accessible Modules

```typescript
import { useAccessibleModules } from '@/hooks/usePermissions';

function SidebarMenu() {
  const modules = useAccessibleModules();
  
  return (
    <View>
      {modules.includes(PermissionModule.PROJECTS) && (
        <MenuItem icon="folder" label="Dự án" route="/projects" />
      )}
      {modules.includes(PermissionModule.BUDGET) && (
        <MenuItem icon="cash" label="Ngân sách" route="/budget" />
      )}
    </View>
  );
}
```

### 4.2. Permission Utilities

**File:** `utils/permission-presets.ts`

```typescript
import {
  hasRolePermission,
  hasMinimumRoleLevel,
  getRoleModules,
  getRoleModuleActions,
} from '@/utils/permission-presets';

// Check if role has specific permission
const canCreate = hasRolePermission(
  UserRole.ENGINEER,
  PermissionModule.PROJECTS,
  PermissionAction.CREATE
); // true

// Check if role meets minimum level
const isHighEnough = hasMinimumRoleLevel(
  UserRole.ENGINEER,
  ROLE_HIERARCHY[UserRole.PROJECT_MANAGER]
); // false (60 < 80)

// Get all modules a role can access
const modules = getRoleModules(UserRole.ENGINEER);
// [PROJECTS, TASKS, DOCUMENTS, QC_QA, ...]

// Get all actions a role can perform on a module
const actions = getRoleModuleActions(
  UserRole.ENGINEER,
  PermissionModule.PROJECTS
);
// [VIEW, CREATE, EDIT]
```

---

## 5. BẢO VỆ ROUTES VÀ COMPONENTS

### 5.1. Protected Routes

**Method 1: Check trong component**

```typescript
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { useEffect } from 'react';

export default function ProtectedScreen() {
  const { isAuthenticated, loading } = useAuth();
  
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, loading]);
  
  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return null;
  
  return <YourActualScreen />;
}
```

**Method 2: Higher Order Component (HOC)**

```typescript
// utils/withAuth.tsx
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { ComponentType, useEffect } from 'react';

export function withAuth<P extends object>(
  Component: ComponentType<P>
) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, loading } = useAuth();
    
    useEffect(() => {
      if (!loading && !isAuthenticated) {
        router.replace('/(auth)/login');
      }
    }, [isAuthenticated, loading]);
    
    if (loading || !isAuthenticated) return null;
    
    return <Component {...props} />;
  };
}

// Sử dụng:
export default withAuth(MyProtectedScreen);
```

**Method 3: Layout guard**

```typescript
// app/(protected)/_layout.tsx
import { useAuth } from '@/context/AuthContext';
import { Redirect, Stack } from 'expo-router';

export default function ProtectedLayout() {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return <LoadingScreen />;
  
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }
  
  return <Stack />;
}
```

### 5.2. Protected Components

**Conditional Rendering dựa trên quyền:**

```typescript
import { usePermission } from '@/hooks/usePermissions';

function ActionButton({ module, action, onPress, label }) {
  const { allowed } = usePermission(module, action);
  
  if (!allowed) return null;
  
  return <Button onPress={onPress} title={label} />;
}

// Sử dụng:
<ActionButton
  module={PermissionModule.PROJECTS}
  action={PermissionAction.DELETE}
  onPress={handleDelete}
  label="Xóa dự án"
/>
```

**Protected Section:**

```typescript
function DashboardScreen() {
  const isAdmin = useIsAdmin();
  const { allowed: canViewBudget } = usePermission(
    PermissionModule.BUDGET,
    PermissionAction.VIEW
  );
  
  return (
    <ScrollView>
      <ProjectList />
      
      {canViewBudget && (
        <BudgetSummary />
      )}
      
      {isAdmin && (
        <AdminControls />
      )}
    </ScrollView>
  );
}
```

---

## 6. API ENDPOINTS

### 6.1. Authentication Endpoints

**Base URL:** `https://baotienweb.cloud/api/v1`

#### 6.1.1. Register (Đăng ký)

```bash
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "YourPassword123",
  "name": "User Full Name",
  "role": "CLIENT"  # Optional: CLIENT | ENGINEER | ADMIN
}

# Response 201:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 13,
    "email": "user@example.com",
    "name": "User Full Name",
    "role": "CLIENT"
  }
}
```

#### 6.1.2. Login (Đăng nhập)

```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "YourPassword123"
}

# Response 200:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 13,
    "email": "user@example.com",
    "name": "User Full Name",
    "role": "CLIENT"
  }
}
```

#### 6.1.3. Get Profile (Lấy thông tin user)

```bash
GET /auth/profile
Authorization: Bearer <accessToken>

# Response 200:
{
  "id": 13,
  "email": "user@example.com",
  "name": "User Full Name",
  "role": "CLIENT",
  "createdAt": "2025-12-10T08:30:00Z"
}
```

#### 6.1.4. Refresh Token

```bash
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}

# Response 200:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 6.2. JWT Token Structure

**Access Token (15 phút):**
```json
{
  "sub": 13,                    // User ID
  "email": "user@example.com",
  "role": "CLIENT",
  "iat": 1765420245,            // Issued at
  "exp": 1765421145             // Expires at (15 min)
}
```

**Refresh Token (7 ngày):**
```json
{
  "sub": 13,
  "email": "user@example.com",
  "role": "CLIENT",
  "iat": 1765420245,
  "exp": 1766025045             // Expires at (7 days)
}
```

---

## 7. CÁC VÍ DỤ THỰC TẾ

### 7.1. Màn hình Đăng nhập

```typescript
// app/(auth)/login.tsx
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';

export default function LoginScreen() {
  const { signIn, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const handleLogin = async () => {
    try {
      setError('');
      await signIn(email, password);
      // Auto redirect by AuthContext
    } catch (err) {
      setError('Email hoặc mật khẩu không đúng');
    }
  };
  
  return (
    <View>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Mật khẩu"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
      <Button
        title={loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        onPress={handleLogin}
        disabled={loading}
      />
    </View>
  );
}
```

### 7.2. Profile Screen với role display

```typescript
import { useAuth } from '@/context/AuthContext';
import { useUserRole } from '@/hooks/usePermissions';
import { ROLE_LABELS_VI } from '@/types/permission';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const userRole = useUserRole();
  
  return (
    <View>
      <Text>Email: {user?.email}</Text>
      <Text>Tên: {user?.name}</Text>
      <Text>Vai trò: {userRole && ROLE_LABELS_VI[userRole]}</Text>
      
      <Button title="Đăng xuất" onPress={signOut} />
    </View>
  );
}
```

### 7.3. Dashboard với permission-based widgets

```typescript
import { usePermission } from '@/hooks/usePermissions';
import { PermissionModule, PermissionAction } from '@/types/permission';

export default function DashboardScreen() {
  const { allowed: canViewProjects } = usePermission(
    PermissionModule.PROJECTS,
    PermissionAction.VIEW
  );
  
  const { allowed: canViewBudget } = usePermission(
    PermissionModule.BUDGET,
    PermissionAction.VIEW
  );
  
  const { allowed: canManageUsers } = usePermission(
    PermissionModule.USERS,
    PermissionAction.MANAGE
  );
  
  return (
    <ScrollView>
      <Text style={{ fontSize: 24 }}>Dashboard</Text>
      
      {canViewProjects && (
        <ProjectSummaryWidget />
      )}
      
      {canViewBudget && (
        <BudgetWidget />
      )}
      
      {canManageUsers && (
        <UserManagementWidget />
      )}
    </ScrollView>
  );
}
```

### 7.4. Create Project với permission check

```typescript
import { usePermission } from '@/hooks/usePermissions';
import { PermissionModule, PermissionAction } from '@/types/permission';

export default function CreateProjectScreen() {
  const { allowed, reason } = usePermission(
    PermissionModule.PROJECTS,
    PermissionAction.CREATE
  );
  
  if (!allowed) {
    return (
      <View>
        <Text>Bạn không có quyền tạo dự án</Text>
        <Text>{reason}</Text>
      </View>
    );
  }
  
  return (
    <View>
      <Text>Tạo dự án mới</Text>
      {/* Form tạo dự án */}
    </View>
  );
}
```

### 7.5. Admin Panel với multiple permissions

```typescript
import {
  useIsAdmin,
  useHasAllPermissions,
} from '@/hooks/usePermissions';
import { PermissionModule, PermissionAction } from '@/types/permission';

export default function AdminPanelScreen() {
  const isAdmin = useIsAdmin();
  
  const canManageUsers = useHasAllPermissions([
    { module: PermissionModule.USERS, action: PermissionAction.VIEW },
    { module: PermissionModule.USERS, action: PermissionAction.MANAGE },
  ]);
  
  const canManageRoles = useHasAllPermissions([
    { module: PermissionModule.ROLES, action: PermissionAction.VIEW },
    { module: PermissionModule.ROLES, action: PermissionAction.MANAGE },
  ]);
  
  if (!isAdmin) {
    return <AccessDenied />;
  }
  
  return (
    <View>
      <Text>Admin Panel</Text>
      
      {canManageUsers && (
        <MenuItem
          icon="people"
          label="Quản lý người dùng"
          route="/admin/users"
        />
      )}
      
      {canManageRoles && (
        <MenuItem
          icon="shield"
          label="Quản lý vai trò"
          route="/admin/roles"
        />
      )}
    </View>
  );
}
```

---

## 📚 TÀI LIỆU THAM KHẢO

### Files quan trọng:

1. **Authentication:**
   - `context/AuthContext.tsx` - Core auth logic
   - `services/api/authApi.ts` - API calls
   - `utils/storage.ts` - Token storage
   - `services/api.ts` - Auto token refresh

2. **Permissions:**
   - `types/permission.ts` - Type definitions
   - `hooks/usePermissions.ts` - Permission hooks
   - `utils/permission-presets.ts` - Role permission mapping

3. **Documentation:**
   - `AUTH_API_DOCS.md` - API reference
   - `AUTH_SETTINGS_OVERVIEW.md` - Settings guide
   - `docs/PERMISSION_SYSTEM_GUIDE.md` - RBAC guide

### Test Accounts:

```
Email: test@example.com
Password: Test123456
Role: CLIENT

Email: admin@nhaxinhdesign.com
Password: (liên hệ để lấy)
Role: ADMIN
```

---

## ✅ CHECKLIST TRIỂN KHAI

### Authentication:
- [x] Register endpoint hoạt động
- [x] Login endpoint hoạt động
- [x] Token storage (SecureStore)
- [x] Auto token refresh
- [x] Profile fetch
- [x] Logout và clear data
- [x] AuthContext provider
- [ ] OAuth (Google/Facebook) - Backend chưa hỗ trợ

### Permissions:
- [x] Role definitions (15 roles)
- [x] Permission modules (26 modules)
- [x] Permission actions (7 actions)
- [x] usePermission hooks
- [x] Role hierarchy
- [x] Permission presets
- [ ] Backend role sync - Cần API endpoint

### UI/UX:
- [x] Login screen
- [x] Register screen
- [x] Profile screen với role display
- [x] Protected routes
- [x] Permission-based components
- [ ] Permission management UI (Super Admin)

---

**Cập nhật lần cuối:** 12/12/2025  
**Người tạo:** GitHub Copilot  
**Status:** ✅ Production Ready
