import { router } from 'expo-router';

/**
 * Open the search screen with a prefilled hashtag filter.
 * Accepts values with or without leading '#'.
 */
export function openHashtag(tag: string) {
  const normalized = tag.replace(/^#/, '');
  try {
    router.push(`/search?tag=${encodeURIComponent(normalized)}` as any);
  } catch {
    // best-effort; ignore navigation errors in non-router contexts
  }
}

import { PermissionString, Role } from '@/types/auth';
import { usePathname } from 'expo-router';

/**
 * Navigation helper for forbidden access
 * Redirects to forbidden screen with permission/role context
 */
export function navigateToForbidden(options?: {
  permission?: PermissionString;
  role?: Role;
  replace?: boolean;
}) {
  const { permission, role, replace = true } = options || {};

  const params: Record<string, string> = {};
  if (permission) params.permission = permission;
  if (role) params.role = role;

  if (replace) {
    router.replace({
      pathname: '/forbidden' as any,
      params,
    });
  } else {
    router.push({
      pathname: '/forbidden' as any,
      params,
    });
  }
}

/**
 * Check if current route is forbidden screen
 * Note: This should be used within a component that has access to hooks
 */
export function isForbiddenRoute(): boolean {
  const pathname = usePathname();
  return pathname === '/forbidden';
}
