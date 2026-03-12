import { PermissionString, Role } from '@/types/auth';
import { Href, router, usePathname } from 'expo-router';

/**
 * Navigate to any route without type errors
 * Use this for dynamic routes or routes not yet in typed routes
 */
export const navigateTo = (path: string) => {
  router.push(path as Href);
};

/**
 * Replace current route with new route
 */
export const replaceTo = (path: string) => {
  router.replace(path as Href);
};

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
 * Note: This is a hook and must be called within a React component
 */
export function useIsForbiddenRoute(): boolean {
  const pathname = usePathname();
  return pathname === '/forbidden';
}
