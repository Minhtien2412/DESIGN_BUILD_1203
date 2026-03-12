/**
 * RBAC Type Definitions
 * Based on production API: https://api.thietkeresort.com.vn
 * 
 * System: 9 Roles, 69 Permissions, 3-tier Scope System
 */

// ==================== ROLES ====================

export enum UserRole {
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

export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  [UserRole.ADMIN]: '👑 Quản trị viên',
  [UserRole.MANAGER]: '🎯 Quản lý',
  [UserRole.PROJECT_MANAGER]: '📊 Quản lý dự án',
  [UserRole.DESIGNER]: '🎨 Thiết kế',
  [UserRole.ACCOUNTANT]: '💰 Kế toán',
  [UserRole.SALES]: '💼 Kinh doanh',
  [UserRole.MARKETING]: '📢 Marketing',
  [UserRole.CUSTOMER_SERVICE]: '📞 Chăm sóc khách hàng',
  [UserRole.GUEST]: '👤 Khách',
};

// ==================== PERMISSIONS ====================

export enum PermissionScope {
  ALL = 'all',           // Access all records in system (Admin)
  ORGANIZATION = 'organization', // Access organization records (Managers)
  OWN = 'own',           // Access only owned records (Regular users)
}

export enum PermissionCategory {
  USERS = 'users',
  PROJECTS = 'projects',
  RBAC = 'rbac',
  ORGANIZATIONS = 'organizations',
  SYSTEM = 'system',
  FINANCE = 'finance',
}

export interface Permission {
  id: string;
  name: string;
  category: PermissionCategory;
  scope: PermissionScope;
  description?: string;
}

export interface RolePermissions {
  role: UserRole;
  permissions: string[];
  scope: PermissionScope;
}

// ==================== USER WITH RBAC ====================

export interface RBACUser {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  name?: string;
  role: UserRole;
  permissions: string[];
  scope: PermissionScope;
  organization_id?: string;
  phone?: string;
  avatar?: string;
  created_at?: string;
  updated_at?: string;
}

// ==================== API RESPONSES ====================

export interface RBACLoginResponse {
  success: boolean;
  message?: string;
  data?: {
    token: string;
    refresh_token?: string;
    user: {
      id: string;
      email: string;
      username?: string;
      full_name?: string;
      role: string;
      permissions?: string[];
      organization_id?: string;
    };
  };
  error?: string;
}

export interface RBACRegisterResponse {
  success: boolean;
  message?: string;
  data?: {
    user: {
      id: string;
      email: string;
      username?: string;
      full_name?: string;
      role: string;
    };
    token: string;
  };
  error?: string;
}

export interface RBACMeResponse {
  success: boolean;
  data?: {
    id: string;
    email: string;
    username?: string;
    full_name?: string;
    name?: string;
    role: string;
    permissions: string[];
    scope: PermissionScope;
    organization_id?: string;
    phone?: string;
    avatar?: string;
  };
  error?: string;
}

// ==================== PERMISSION CHECKING ====================

export interface PermissionCheckRequest {
  user_id: string;
  permission: string;
  resource_id?: string;
}

export interface PermissionCheckResponse {
  success: boolean;
  data?: {
    allowed: boolean;
    scope: PermissionScope;
    reason?: string;
  };
  error?: string;
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Check if user has a specific permission
 */
export function hasPermission(user: RBACUser | null, permission: string): boolean {
  if (!user) return false;
  if (user.role === UserRole.ADMIN) return true; // Admin has all permissions
  return user.permissions.includes(permission);
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(user: RBACUser | null, permissions: string[]): boolean {
  if (!user) return false;
  if (user.role === UserRole.ADMIN) return true;
  return permissions.some(p => user.permissions.includes(p));
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(user: RBACUser | null, permissions: string[]): boolean {
  if (!user) return false;
  if (user.role === UserRole.ADMIN) return true;
  return permissions.every(p => user.permissions.includes(p));
}

/**
 * Check if user can access a resource based on scope
 */
export function canAccessResource(
  user: RBACUser | null,
  resourceOwnerId: string,
  resourceOrgId?: string
): boolean {
  if (!user) return false;
  
  // Admin can access everything
  if (user.role === UserRole.ADMIN || user.scope === PermissionScope.ALL) {
    return true;
  }
  
  // Organization scope: can access if same organization
  if (user.scope === PermissionScope.ORGANIZATION) {
    return user.organization_id === resourceOrgId;
  }
  
  // Own scope: can only access own resources
  if (user.scope === PermissionScope.OWN) {
    return user.id === resourceOwnerId;
  }
  
  return false;
}

/**
 * Get role from string (case-insensitive)
 */
export function parseRole(roleString?: string): UserRole {
  if (!roleString) return UserRole.GUEST;
  
  const normalized = roleString.toLowerCase().replace(/[-_\s]/g, '_');
  
  switch (normalized) {
    case 'admin':
    case 'administrator':
      return UserRole.ADMIN;
    case 'manager':
      return UserRole.MANAGER;
    case 'project_manager':
    case 'projectmanager':
      return UserRole.PROJECT_MANAGER;
    case 'designer':
      return UserRole.DESIGNER;
    case 'accountant':
      return UserRole.ACCOUNTANT;
    case 'sales':
      return UserRole.SALES;
    case 'marketing':
      return UserRole.MARKETING;
    case 'customer_service':
    case 'customerservice':
      return UserRole.CUSTOMER_SERVICE;
    default:
      return UserRole.GUEST;
  }
}

/**
 * Determine scope from role (default mapping)
 */
export function getDefaultScopeForRole(role: UserRole): PermissionScope {
  switch (role) {
    case UserRole.ADMIN:
      return PermissionScope.ALL;
    case UserRole.MANAGER:
    case UserRole.PROJECT_MANAGER:
    case UserRole.ACCOUNTANT:
      return PermissionScope.ORGANIZATION;
    default:
      return PermissionScope.OWN;
  }
}
