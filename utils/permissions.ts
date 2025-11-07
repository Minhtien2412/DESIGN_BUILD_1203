import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { Alert } from 'react-native';

/**
 * Permission utilities for admin system
 * Based on Perfex CRM permission structure
 */

// ===== TYPES =====

export type Capability = 'view' | 'create' | 'edit' | 'delete' | 'view_own';

export type Feature =
  | 'projects'
  | 'tasks'
  | 'invoices'
  | 'estimates'
  | 'contracts'
  | 'proposals'
  | 'staff'
  | 'clients'
  | 'reports'
  | 'settings'
  | 'roles'
  | 'departments';

export interface Permission {
  feature: Feature;
  capabilities: Capability[];
}

// ===== PERMISSION CHECKER =====

/**
 * Check if current user has specific permission
 * Admin users always return true
 * 
 * @param capability - Action to check (view, create, edit, delete)
 * @param feature - Feature name (projects, invoices, etc.)
 * @param userPermissions - User's permission array (from auth context)
 * @param isAdmin - Whether user is admin
 * @returns boolean
 */
export function hasPermission(
  capability: Capability,
  feature: Feature,
  userPermissions?: Permission[],
  isAdmin?: boolean
): boolean {
  // Admins have all permissions
  if (isAdmin) {
    return true;
  }

  // No permissions loaded
  if (!userPermissions || userPermissions.length === 0) {
    return false;
  }

  // Find feature permissions
  const featurePerms = userPermissions.find(p => p.feature === feature);
  if (!featurePerms) {
    return false;
  }

  // Check if capability exists
  return featurePerms.capabilities.includes(capability);
}

/**
 * Check if user CANNOT perform action (inverse of hasPermission)
 */
export function cannotPerform(
  capability: Capability,
  feature: Feature,
  userPermissions?: Permission[],
  isAdmin?: boolean
): boolean {
  return !hasPermission(capability, feature, userPermissions, isAdmin);
}

/**
 * Check if user is admin
 * Admins bypass all permission checks
 */
export function isAdmin(user: any): boolean {
  return user?.admin === 1 || user?.role?.name === 'Administrator';
}

/**
 * Get all features user has access to
 */
export function getUserFeatures(userPermissions?: Permission[]): Feature[] {
  if (!userPermissions) return [];
  return userPermissions.map(p => p.feature);
}

/**
 * Check if user has ANY capability for a feature
 */
export function hasAnyAccessTo(feature: Feature, userPermissions?: Permission[]): boolean {
  if (!userPermissions) return false;
  const featurePerms = userPermissions.find(p => p.feature === feature);
  return !!featurePerms && featurePerms.capabilities.length > 0;
}

/**
 * Check if user has ALL capabilities for a feature
 */
export function hasFullAccessTo(feature: Feature, userPermissions?: Permission[]): boolean {
  if (!userPermissions) return false;
  const featurePerms = userPermissions.find(p => p.feature === feature);
  if (!featurePerms) return false;

  const allCapabilities: Capability[] = ['view', 'create', 'edit', 'delete'];
  return allCapabilities.every(cap => featurePerms.capabilities.includes(cap));
}

// ===== ROUTE GUARDS =====

interface RequirePermissionOptions {
  redirectTo?: string;
  message?: string;
  showAlert?: boolean;
}

/**
 * Require permission to access a feature/action
 * Redirects to unauthorized page or custom path if no permission
 * 
 * @param capability - Required capability
 * @param feature - Required feature
 * @param userPermissions - User's permissions
 * @param isAdmin - Whether user is admin
 * @param options - Redirect and message options
 */
export function requirePermission(
  capability: Capability,
  feature: Feature,
  userPermissions?: Permission[],
  isAdmin?: boolean,
  options: RequirePermissionOptions = {}
) {
  const {
    redirectTo = '/(tabs)',
    message = 'Bạn không có quyền truy cập chức năng này',
    showAlert = true,
  } = options;

  if (!hasPermission(capability, feature, userPermissions, isAdmin)) {
    if (showAlert) {
      Alert.alert('Không có quyền', message);
    }
    router.replace(redirectTo as any);
  }
}

/**
 * HOC to wrap actions that require permission
 * Returns a function that checks permission before executing
 * 
 * @param capability - Required capability
 * @param feature - Required feature
 * @param action - The action to execute if permission granted
 * @param userPermissions - User's permissions
 * @param isAdmin - Whether user is admin
 * @param onUnauthorized - Callback when unauthorized
 * @returns Wrapped function
 */
export function withPermission<T extends (...args: any[]) => any>(
  capability: Capability,
  feature: Feature,
  action: T,
  userPermissions?: Permission[],
  isAdmin?: boolean,
  onUnauthorized?: () => void
): T {
  return ((...args: Parameters<T>) => {
    if (hasPermission(capability, feature, userPermissions, isAdmin)) {
      return action(...args);
    } else {
      if (onUnauthorized) {
        onUnauthorized();
      } else {
        Alert.alert('Không có quyền', 'Bạn không có quyền thực hiện hành động này');
      }
    }
  }) as T;
}

// ===== REACT HOOKS =====

/**
 * Hook to check permissions in components
 * Returns permission checker functions bound to current user
 */
export function usePermissions() {
  const { user } = useAuth();

  const permissions = user?.permissions as Permission[] | undefined;
  const adminStatus = isAdmin(user);

  return {
    hasPermission: (capability: Capability, feature: Feature) =>
      hasPermission(capability, feature, permissions, adminStatus),
    
    cannotPerform: (capability: Capability, feature: Feature) =>
      cannotPerform(capability, feature, permissions, adminStatus),
    
    isAdmin: adminStatus,
    
    hasAnyAccessTo: (feature: Feature) =>
      hasAnyAccessTo(feature, permissions),
    
    hasFullAccessTo: (feature: Feature) =>
      hasFullAccessTo(feature, permissions),
    
    requirePermission: (
      capability: Capability,
      feature: Feature,
      options?: RequirePermissionOptions
    ) => requirePermission(capability, feature, permissions, adminStatus, options),
    
    withPermission: <T extends (...args: any[]) => any>(
      capability: Capability,
      feature: Feature,
      action: T,
      onUnauthorized?: () => void
    ) => withPermission(capability, feature, action, permissions, adminStatus, onUnauthorized),
    
    userFeatures: getUserFeatures(permissions),
    permissions,
  };
}

// ===== PROTECTED ADMIN ROUTES =====

/**
 * Check if route is admin-only
 */
export function isAdminRoute(pathname: string): boolean {
  const adminPaths = [
    '/admin',
    '/admin/dashboard',
    '/admin/staff',
    '/admin/roles',
    '/admin/departments',
    '/admin/settings',
    '/admin/activity-log',
  ];

  return adminPaths.some(path => pathname.startsWith(path));
}

/**
 * Check if route requires specific permission
 */
export function getRoutePermission(pathname: string): { capability: Capability; feature: Feature } | null {
  const routeMap: Record<string, { capability: Capability; feature: Feature }> = {
    '/admin/staff': { capability: 'view', feature: 'staff' },
    '/admin/staff/create': { capability: 'create', feature: 'staff' },
    '/admin/roles': { capability: 'view', feature: 'roles' },
    '/admin/departments': { capability: 'view', feature: 'departments' },
    '/admin/settings': { capability: 'edit', feature: 'settings' },
    '/projects/create': { capability: 'create', feature: 'projects' },
    '/invoices/create': { capability: 'create', feature: 'invoices' },
  };

  for (const [route, permission] of Object.entries(routeMap)) {
    if (pathname.startsWith(route)) {
      return permission;
    }
  }

  return null;
}

// ===== PERMISSION LABELS (Vietnamese) =====

export const CAPABILITY_LABELS: Record<Capability, string> = {
  view: 'Xem',
  create: 'Tạo mới',
  edit: 'Chỉnh sửa',
  delete: 'Xóa',
  view_own: 'Xem của mình',
};

export const FEATURE_LABELS: Record<Feature, string> = {
  projects: 'Dự án',
  tasks: 'Công việc',
  invoices: 'Hóa đơn',
  estimates: 'Báo giá',
  contracts: 'Hợp đồng',
  proposals: 'Đề xuất',
  staff: 'Nhân viên',
  clients: 'Khách hàng',
  reports: 'Báo cáo',
  settings: 'Cài đặt',
  roles: 'Vai trò',
  departments: 'Phòng ban',
};

/**
 * Get capability label in Vietnamese
 */
export function getCapabilityLabel(capability: Capability): string {
  return CAPABILITY_LABELS[capability] || capability;
}

/**
 * Get feature label in Vietnamese
 */
export function getFeatureLabel(feature: Feature): string {
  return FEATURE_LABELS[feature] || feature;
}
