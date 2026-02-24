/**
 * ProtectedScreen Component
 * Bảo vệ toàn bộ screen dựa trên authentication và permissions
 */

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import { useAuth } from '@/context/AuthContext';
import { UserType } from '@/types/auth';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

interface ProtectedScreenProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireRoles?: UserType[];
  requirePermissions?: string[];
  requireVerified?: boolean;
}

/**
 * Wrap screen với authentication & authorization checks
 * 
 * @example
 * <ProtectedScreen 
 *   requireAuth={true}
 *   requireRoles={['seller', 'company']}
 *   requirePermissions={['product.create']}
 * >
 *   <YourScreenContent />
 * </ProtectedScreen>
 */
export function ProtectedScreen({
  children,
  requireAuth = true,
  requireRoles,
  requirePermissions,
  requireVerified = false,
}: ProtectedScreenProps) {
  const { user, loading, isAuthenticated, hasMarketplacePermission } = useAuth();
  const router = useRouter();

  // Loading state
  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <Loader size="large" />
        <ThemedText style={styles.loadingText}>Đang tải...</ThemedText>
      </ThemedView>
    );
  }

  // Check authentication
  if (requireAuth && !isAuthenticated) {
    return (
      <ThemedView style={styles.container}>
        <Ionicons name="lock-closed-outline" size={64} color="#000000" />
        <ThemedText style={styles.title}>Yêu cầu đăng nhập</ThemedText>
        <ThemedText style={styles.message}>
          Bạn cần đăng nhập để truy cập trang này
        </ThemedText>
        <Button
          title="Đăng nhập ngay"
          onPress={() => router.push('/(auth)/login')}
          style={styles.button}
        />
      </ThemedView>
    );
  }

  // Check roles
  if (requireRoles && user?.userType && !requireRoles.includes(user.userType)) {
    const roleNames = {
      buyer: 'Khách hàng',
      seller: 'Người bán',
      company: 'Công ty',
      contractor: 'Nhà thầu',
      architect: 'Kiến trúc sư',
      designer: 'Nhà thiết kế',
      supplier: 'Nhà cung cấp',
      admin: 'Admin',
    };

    return (
      <ThemedView style={styles.container}>
        <Ionicons name="shield-outline" size={64} color="#0D9488" />
        <ThemedText style={styles.title}>Không có quyền truy cập</ThemedText>
        <ThemedText style={styles.message}>
          Trang này chỉ dành cho:{'\n'}
          {requireRoles.map(r => roleNames[r]).join(', ')}
        </ThemedText>
        <ThemedText style={styles.currentRole}>
          Vai trò hiện tại: {user.userType ? roleNames[user.userType] : 'Chưa xác định'}
        </ThemedText>
        <Button
          title="Quay lại"
          onPress={() => router.back()}
          style={styles.button}
        />
      </ThemedView>
    );
  }

  // Check permissions
  if (requirePermissions && requirePermissions.length > 0) {
    const missingPermissions = requirePermissions.filter(
      perm => !hasMarketplacePermission(perm)
    );

    if (missingPermissions.length > 0) {
      return (
        <ThemedView style={styles.container}>
          <Ionicons name="key-outline" size={64} color="#000000" />
          <ThemedText style={styles.title}>Thiếu quyền truy cập</ThemedText>
          <ThemedText style={styles.message}>
            Bạn không có quyền thực hiện hành động này
          </ThemedText>
          <View style={styles.permissionsList}>
            {missingPermissions.map(perm => (
              <View key={perm} style={styles.permissionItem}>
                <Ionicons name="close-circle" size={16} color="#000000" />
                <ThemedText style={styles.permissionText}>{perm}</ThemedText>
              </View>
            ))}
          </View>
          <Button
            title="Quay lại"
            onPress={() => router.back()}
            style={styles.button}
          />
        </ThemedView>
      );
    }
  }

  // Check verification status
  if (requireVerified && user && !user.companyVerified) {
    return (
      <ThemedView style={styles.container}>
        <Ionicons name="shield-checkmark-outline" size={64} color="#0D9488" />
        <ThemedText style={styles.title}>Cần xác minh tài khoản</ThemedText>
        <ThemedText style={styles.message}>
          Tài khoản của bạn cần được xác minh để truy cập tính năng này
        </ThemedText>
        <Button
          title="Xem hướng dẫn xác minh"
          onPress={() => router.push('/settings/verification' as any)}
          style={styles.button}
        />
      </ThemedView>
    );
  }

  // All checks passed - render children
  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    opacity: 0.7,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 8,
  },
  currentRole: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 8,
    marginBottom: 16,
  },
  button: {
    marginTop: 24,
    minWidth: 200,
  },
  permissionsList: {
    marginTop: 16,
    marginBottom: 8,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  permissionText: {
    marginLeft: 8,
    fontSize: 13,
    opacity: 0.8,
  },
});
