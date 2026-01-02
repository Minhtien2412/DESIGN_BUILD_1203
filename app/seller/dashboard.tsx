/**
 * Seller Dashboard - Only accessible by sellers and companies
 * Dashboard cho người bán và công ty
 */

import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { ProtectedScreen } from '@/components/auth/ProtectedScreen';
import { ThemedText } from '@/components/themed-text';
import { Container } from '@/components/ui/container';
import { RoleBadge } from '@/components/ui/role-badge';
import { Section } from '@/components/ui/section';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Href, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

export default function SellerDashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <ProtectedScreen
      requireAuth={true}
      requireRoles={['seller', 'company', 'contractor', 'supplier']}
      requirePermissions={['product.create']}
    >
      <ScrollView>
        <Container>
          {/* Header */}
          <Section>
            <View style={styles.header}>
              <View>
                <ThemedText style={styles.greeting}>Xin chào,</ThemedText>
                <ThemedText style={styles.userName}>{user?.name}</ThemedText>
              </View>
              {user?.userType && <RoleBadge userType={user.userType} size="large" />}
            </View>
          </Section>

          {/* Stats */}
          <Section>
            <ThemedText style={styles.sectionTitle}>Thống kê</ThemedText>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Ionicons name="cube-outline" size={32} color="#10B981" />
                <ThemedText style={styles.statValue}>24</ThemedText>
                <ThemedText style={styles.statLabel}>Sản phẩm</ThemedText>
              </View>

              <View style={styles.statCard}>
                <Ionicons name="cart-outline" size={32} color="#3B82F6" />
                <ThemedText style={styles.statValue}>12</ThemedText>
                <ThemedText style={styles.statLabel}>Đơn hàng</ThemedText>
              </View>

              <View style={styles.statCard}>
                <Ionicons name="star-outline" size={32} color="#F59E0B" />
                <ThemedText style={styles.statValue}>4.8</ThemedText>
                <ThemedText style={styles.statLabel}>Đánh giá</ThemedText>
              </View>

              <View style={styles.statCard}>
                <Ionicons name="cash-outline" size={32} color="#EF4444" />
                <ThemedText style={styles.statValue}>45M</ThemedText>
                <ThemedText style={styles.statLabel}>Doanh thu</ThemedText>
              </View>
            </View>
          </Section>

          {/* Quick Actions */}
          <Section>
            <ThemedText style={styles.sectionTitle}>Thao tác nhanh</ThemedText>

            {/* Create Product - Requires permission */}
            <PermissionGuard permission="product.create">
              <Pressable style={styles.actionButton} onPress={() => router.push('/products/create' as Href)}>
                <View style={[styles.actionIcon, { backgroundColor: '#10B98115' }]}>
                  <Ionicons name="add-circle" size={24} color="#10B981" />
                </View>
                <View style={styles.actionContent}>
                  <ThemedText style={styles.actionTitle}>Tạo sản phẩm mới</ThemedText>
                  <ThemedText style={styles.actionSubtitle}>Đăng sản phẩm/dịch vụ mới</ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </Pressable>
            </PermissionGuard>

            {/* Manage Orders */}
            <PermissionGuard permission="order.view_own">
              <Pressable style={styles.actionButton} onPress={() => router.push('/orders' as Href)}>
                <View style={[styles.actionIcon, { backgroundColor: '#3B82F615' }]}>
                  <Ionicons name="list" size={24} color="#3B82F6" />
                </View>
                <View style={styles.actionContent}>
                  <ThemedText style={styles.actionTitle}>Quản lý đơn hàng</ThemedText>
                  <ThemedText style={styles.actionSubtitle}>Xem và cập nhật đơn hàng</ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </Pressable>
            </PermissionGuard>

            {/* Analytics - Only for companies */}
            <PermissionGuard 
              permission="analytics.advanced"
              fallback={null}
            >
              <Pressable style={styles.actionButton} onPress={() => router.push('/analytics' as Href)}>
                <View style={[styles.actionIcon, { backgroundColor: '#8B5CF615' }]}>
                  <Ionicons name="analytics" size={24} color="#8B5CF6" />
                </View>
                <View style={styles.actionContent}>
                  <ThemedText style={styles.actionTitle}>Phân tích nâng cao</ThemedText>
                  <ThemedText style={styles.actionSubtitle}>Báo cáo chi tiết kinh doanh</ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </Pressable>
            </PermissionGuard>

            {/* Team Management - Only for companies */}
            <PermissionGuard 
              permission="team.manage"
              fallback={null}
            >
              <Pressable style={styles.actionButton} onPress={() => router.push('/team' as Href)}>
                <View style={[styles.actionIcon, { backgroundColor: '#EC489915' }]}>
                  <Ionicons name="people" size={24} color="#EC4899" />
                </View>
                <View style={styles.actionContent}>
                  <ThemedText style={styles.actionTitle}>Quản lý nhân viên</ThemedText>
                  <ThemedText style={styles.actionSubtitle}>Thêm/sửa thành viên team</ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </Pressable>
            </PermissionGuard>
          </Section>
        </Container>
      </ScrollView>
    </ProtectedScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    opacity: 0.7,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 13,
    opacity: 0.7,
    marginTop: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 13,
    opacity: 0.7,
  },
});
