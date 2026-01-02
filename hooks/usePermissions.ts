/**
 * Permission Hooks
 * React hooks for checking user permissions
 */

import { useAuth } from '@/context/AuthContext';
import {
    PermissionAction,
    PermissionCheck,
    PermissionCheckResult,
    PermissionModule,
    ROLE_HIERARCHY,
    UserRole,
} from '@/types/permission';
import {
    getRoleModuleActions,
    getRoleModules,
    hasMinimumRoleLevel,
    hasRolePermission,
    isHigherRole,
} from '@/utils/permission-presets';
import { useMemo } from 'react';

/**
 * Get user's role from auth context
 */
export function useUserRole(): UserRole | null {
  const { user } = useAuth();
  
  // Map backend role to UserRole enum
  if (!user) return null;
  
  // Check if user has role from API
  const apiRole = (user as any).role;
  if (apiRole) {
    // Map backend role strings to UserRole enum
    const roleMap: Record<string, UserRole> = {
      'super_admin': UserRole.SUPER_ADMIN,
      'admin': UserRole.ADMIN,
      'project_manager': UserRole.PROJECT_MANAGER,
      'site_manager': UserRole.SITE_MANAGER,
      'engineer': UserRole.ENGINEER,
      'architect': UserRole.ARCHITECT,
      'foreman': UserRole.FOREMAN,
      'contractor': UserRole.CONTRACTOR,
      'subcontractor': UserRole.SUBCONTRACTOR,
      'worker': UserRole.WORKER,
      'client': UserRole.CLIENT,
      'client_rep': UserRole.CLIENT_REP,
      'consultant': UserRole.CONSULTANT,
      'supplier': UserRole.SUPPLIER,
      'viewer': UserRole.VIEWER,
    };
    
    return roleMap[apiRole.toLowerCase()] || UserRole.VIEWER;
  }
  
  // Fallback to email-based admin check (temporary)
  if (user.email?.includes('admin')) {
    return UserRole.ADMIN;
  }
  
  return UserRole.VIEWER;
}

/**
 * Check if user has permission for a specific action
 */
export function usePermission(
  module: PermissionModule,
  action: PermissionAction,
  projectId?: number
): PermissionCheckResult {
  const role = useUserRole();

  return useMemo(() => {
    if (!role) {
      return {
        allowed: false,
        reason: 'Not authenticated',
      };
    }

    const allowed = hasRolePermission(role, module, action);

    if (!allowed) {
      return {
        allowed: false,
        reason: `Permission denied: ${action} on ${module}`,
        requiredPermission: `${module}.${action}`,
      };
    }

    return { allowed: true };
  }, [role, module, action, projectId]);
}

/**
 * Check multiple permissions at once
 */
export function usePermissions(checks: PermissionCheck[]): PermissionCheckResult[] {
  const role = useUserRole();

  return useMemo(() => {
    if (!role) {
      return checks.map(() => ({
        allowed: false,
        reason: 'Not authenticated',
      }));
    }

    return checks.map((check) => {
      const allowed = hasRolePermission(role, check.module, check.action);

      if (!allowed) {
        return {
          allowed: false,
          reason: `Permission denied: ${check.action} on ${check.module}`,
          requiredPermission: `${check.module}.${check.action}`,
        };
      }

      return { allowed: true };
    });
  }, [role, checks]);
}

/**
 * Check if user has ALL permissions
 */
export function useHasAllPermissions(checks: PermissionCheck[]): boolean {
  const results = usePermissions(checks);
  return results.every((result) => result.allowed);
}

/**
 * Check if user has ANY of the permissions
 */
export function useHasAnyPermission(checks: PermissionCheck[]): boolean {
  const results = usePermissions(checks);
  return results.some((result) => result.allowed);
}

/**
 * Get all modules user can access
 */
export function useAccessibleModules(): PermissionModule[] {
  const role = useUserRole();

  return useMemo(() => {
    if (!role) return [];
    return getRoleModules(role);
  }, [role]);
}

/**
 * Get all actions user can perform on a module
 */
export function useModuleActions(module: PermissionModule): PermissionAction[] {
  const role = useUserRole();

  return useMemo(() => {
    if (!role) return [];
    return getRoleModuleActions(role, module);
  }, [role, module]);
}

/**
 * Check if user has minimum role level
 */
export function useHasMinRoleLevel(minLevel: number): boolean {
  const role = useUserRole();

  return useMemo(() => {
    if (!role) return false;
    return hasMinimumRoleLevel(role, minLevel);
  }, [role, minLevel]);
}

/**
 * Check if user is admin or higher
 */
export function useIsAdmin(): boolean {
  return useHasMinRoleLevel(ROLE_HIERARCHY[UserRole.ADMIN]);
}

/**
 * Check if user is super admin
 */
export function useIsSuperAdmin(): boolean {
  const role = useUserRole();
  return role === UserRole.SUPER_ADMIN;
}

/**
 * Check if user is project manager or higher
 */
export function useIsProjectManager(): boolean {
  return useHasMinRoleLevel(ROLE_HIERARCHY[UserRole.PROJECT_MANAGER]);
}

/**
 * Check if user can manage another user
 */
export function useCanManageUser(targetRole: UserRole): boolean {
  const role = useUserRole();

  return useMemo(() => {
    if (!role) return false;
    return isHigherRole(role, targetRole);
  }, [role, targetRole]);
}

/**
 * Get user's role level
 */
export function useRoleLevel(): number {
  const role = useUserRole();
  return role ? ROLE_HIERARCHY[role] : 0;
}

/**
 * Hook to check if user can view a dashboard widget
 */
export function useCanViewWidget(
  requiredPermissions: { module: PermissionModule; action: PermissionAction }[],
  minRoleLevel?: number
): boolean {
  const hasAllPerms = useHasAllPermissions(requiredPermissions);
  const hasMinLevel = useHasMinRoleLevel(minRoleLevel || 0);

  return hasAllPerms && hasMinLevel;
}
