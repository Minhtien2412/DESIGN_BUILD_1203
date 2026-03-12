/**
 * Protected Route Component
 * Wrap around screens that require authentication/authorization
 * 
 * Usage:
 * <ProtectedRoute roles={['admin', 'architect']}>
 *   <AdminScreen />
 * </ProtectedRoute>
 */

import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { ReactNode, useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

// ============================================================================
// Types
// ============================================================================

export interface ProtectedRouteProps {
  children: ReactNode;
  roles?: string[];
  permissions?: string[];
  redirectTo?: string;
  fallback?: ReactNode;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Protected Route - Requires authentication
 */
export function ProtectedRoute({
  children,
  roles = [],
  permissions = [],
  redirectTo = '/(auth)/login',
  fallback,
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !isAuthenticated) {
      console.log('[ProtectedRoute] User not authenticated, redirecting to login');
      router.replace(redirectTo as any);
    }

    // Check role permissions
    if (!loading && isAuthenticated && user && roles.length > 0) {
      const hasRequiredRole = roles.includes(user.role || '');
      
      if (!hasRequiredRole) {
        console.log('[ProtectedRoute] User does not have required role, redirecting');
        router.replace('/unauthorized' as any);
      }
    }
  }, [loading, isAuthenticated, user, roles, redirectTo]);

  // Show loading state
  if (loading) {
    return fallback || (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  // Check role authorization
  if (roles.length > 0) {
    const hasRequiredRole = roles.includes(user.role || '');
    if (!hasRequiredRole) {
      return null;
    }
  }

  // Check permission authorization (if permissions are provided)
  // This would need to be implemented based on your permission system
  // if (permissions.length > 0) {
  //   const hasRequiredPermissions = permissions.every(p => user.permissions?.includes(p));
  //   if (!hasRequiredPermissions) {
  //     return null;
  //   }
  // }

  // Render children if authorized
  return <>{children}</>;
}

// ============================================================================
// Unauthorized Screen
// ============================================================================

/**
 * Unauthorized access screen
 */
export function UnauthorizedScreen() {
  return (
    <View style={styles.unauthorizedContainer}>
      <Text style={styles.unauthorizedTitle}>⛔ Truy cập bị từ chối</Text>
      <Text style={styles.unauthorizedText}>
        Bạn không có quyền truy cập trang này.
      </Text>
      <Text
        style={styles.goBackButton}
        onPress={() => router.back()}
      >
        ← Quay lại
      </Text>
    </View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  unauthorizedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  unauthorizedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E82A34',
    marginBottom: 16,
  },
  unauthorizedText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  goBackButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
});

// ============================================================================
// Export
// ============================================================================

export default ProtectedRoute;
