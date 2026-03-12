import { router } from 'expo-router';

/**
 * Utility to check if user is authenticated and redirect to login if not
 * Used for protected actions that require authentication
 */
export const requireAuth = (
  isAuthenticated: boolean,
  options?: {
    redirectTo?: string;
    message?: string;
  }
): boolean => {
  if (!isAuthenticated) {
    // Redirect to login with return path
    const returnPath = options?.redirectTo || '/';
    router.push({
      pathname: '/(auth)/login',
      params: { returnTo: returnPath },
    } as any);
    return false;
  }
  return true;
};

/**
 * Higher-order function to wrap actions that require authentication
 */
export const withAuth = <T extends (...args: any[]) => any>(
  isAuthenticated: boolean,
  action: T,
  onUnauthenticated?: () => void
): T => {
  return ((...args: Parameters<T>) => {
    if (!isAuthenticated) {
      if (onUnauthenticated) {
        onUnauthenticated();
      } else {
        router.push('/(auth)/login' as any);
      }
      return;
    }
    return action(...args);
  }) as T;
};

/**
 * Check if current route requires authentication
 */
export const isProtectedRoute = (pathname: string): boolean => {
  const protectedPaths = [
    '/profile/info',
    '/profile/videos',
    '/profile/cloud',
    '/profile/payment',
    '/profile/capability',
    '/profile/security',
    '/projects/create',
    '/bookings',
  ];
  
  return protectedPaths.some(path => pathname.startsWith(path));
};
