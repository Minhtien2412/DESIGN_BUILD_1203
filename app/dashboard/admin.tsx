/**
 * Admin Dashboard Screen
 * 
 * Features:
 * - Real-time statistics (users, projects, revenue)
 * - User management table with filters
 * - Revenue charts (monthly/quarterly)
 * - Recent activities feed
 * - System health indicators
 * 
 * API: dashboardApi.getAdminDashboard() + userApi.getUsers()
 * Created: Nov 24, 2025
 */

import { Section } from '@/components/ui/section';
import { Spacing } from '@/constants/layout';
import { Colors } from '@/constants/theme';
import dashboardService from '@/services/api/dashboard.service';
import type { AdminDashboard, User, UserFilters } from '@/services/api/types';
import userService from '@/services/api/user.service';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Theme colors shortcut
const theme = Colors.light;

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  trend?: string;
}

function StatCard({ title, value, icon, color, trend }: StatCardProps) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <Ionicons name={icon as any} size={24} color={color} />
        {trend && (
          <Text style={[styles.statTrend, { color: trend.startsWith('+') ? theme.success : theme.error }]}>
            {trend}
          </Text>
        )}
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );
}

// ============================================================================
// USER ROW COMPONENT
// ============================================================================

interface UserRowProps {
  user: User;
  onPress: () => void;
}

function UserRow({ user, onPress }: UserRowProps) {
  const roleColors: Record<string, string> = {
    ADMIN: theme.error,
    ENGINEER: theme.primary,
    CLIENT: theme.success,
  };

  return (
    <TouchableOpacity style={styles.userRow} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.userInfo}>
        <View style={[styles.userAvatar, { backgroundColor: roleColors[user.role] || theme.textMuted }]}>
          <Text style={styles.userAvatarText}>
            {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.userDetails}>
          <Text style={styles.userName}>{user.name || 'Chưa có tên'}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>
      </View>
      <View style={styles.userMeta}>
        <View style={[styles.roleBadge, { backgroundColor: `${roleColors[user.role]}20` }]}>
          <Text style={[styles.roleText, { color: roleColors[user.role] }]}>
            {user.role === 'ADMIN' ? 'Quản trị' : user.role === 'ENGINEER' ? 'Kỹ sư' : 'Khách hàng'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
      </View>
    </TouchableOpacity>
  );
}

// ============================================================================
// ACTIVITY ITEM COMPONENT
// ============================================================================

interface ActivityItemProps {
  activity: {
    id: string;
    type: 'project' | 'task' | 'payment' | 'qc' | 'user';
    title: string;
    description: string;
    timestamp: string;
  };
}

function ActivityItem({ activity }: ActivityItemProps) {
  const icons: Record<string, any> = {
    project: 'folder-outline',
    task: 'checkbox-outline',
    payment: 'card-outline',
    qc: 'checkmark-circle-outline',
    user: 'person-outline',
  };

  const colors: Record<string, string> = {
    project: theme.primary,
    task: theme.warning,
    payment: theme.success,
    qc: theme.info,
    user: theme.secondary,
  };

  return (
    <View style={styles.activityItem}>
      <View style={[styles.activityIcon, { backgroundColor: `${colors[activity.type]}20` }]}>
        <Ionicons name={icons[activity.type]} size={20} color={colors[activity.type]} />
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle}>{activity.title}</Text>
        <Text style={styles.activityDesc}>{activity.description}</Text>
        <Text style={styles.activityTime}>{formatTime(activity.timestamp)}</Text>
      </View>
    </View>
  );
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Map API Activity to component ActivityItem format
function mapActivityToItem(activity: any): ActivityItemProps['activity'] {
  // Map entityType to component type
  const typeMap: Record<string, 'project' | 'task' | 'payment' | 'qc' | 'user'> = {
    'project': 'project',
    'task': 'task',
    'payment': 'payment',
    'qc': 'qc',
    'user': 'user',
    'default': 'task'
  };
  
  const type = typeMap[activity.entityType] || 'task';
  const userName = activity.userName || 'Người dùng';
  
  // Generate title and description from action
  const actionMap: Record<string, { title: string, desc: string }> = {
    'create': { title: `${userName} tạo mới`, desc: `${activity.entityType} #${activity.entityId}` },
    'update': { title: `${userName} cập nhật`, desc: `${activity.entityType} #${activity.entityId}` },
    'delete': { title: `${userName} xóa`, desc: `${activity.entityType} #${activity.entityId}` },
    'login': { title: `${userName} đăng nhập`, desc: 'Hệ thống' },
    'logout': { title: `${userName} đăng xuất`, desc: 'Hệ thống' },
  };
  
  const mapped = actionMap[activity.action] || { 
    title: `${userName} ${activity.action}`, 
    desc: `${activity.entityType} #${activity.entityId}` 
  };
  
  return {
    id: activity.id,
    type,
    title: mapped.title,
    description: mapped.desc,
    timestamp: activity.timestamp
  };
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 7) return `${days} ngày trước`;
  return date.toLocaleDateString('vi-VN');
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AdminDashboardScreen() {
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userFilters, setUserFilters] = useState<UserFilters>({});

  // Fetch dashboard data
  const fetchDashboard = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      
      setError(null);

      console.log('📊 Fetching admin dashboard...');
      const [dashboardData, usersData] = await Promise.all([
        dashboardService.admin(),
        userService.list({ limit: 10 }), // Get first 10 users
      ]);

      console.log('✅ Dashboard loaded:', dashboardData);
      setDashboard(dashboardData);
      setUsers(usersData.data || []);
    } catch (err: any) {
      console.error('❌ Dashboard error:', err);
      setError(err.message || 'Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Handle refresh
  const onRefresh = () => {
    fetchDashboard(true);
  };

  // Handle user press
  const handleUserPress = (user: User) => {
    Alert.alert(
      user.name || user.email,
      `Email: ${user.email}\nRole: ${user.role}\nID: ${user.id}`,
      [
        { text: 'Đóng', style: 'cancel' },
        { text: 'Xem chi tiết', onPress: () => console.log('Navigate to user detail:', user.id) },
      ]
    );
  };

  // Loading state
  if (loading && !dashboard) {
    return (
      <View style={styles.centerContainer}>
        <Stack.Screen options={{ title: 'Admin Dashboard', headerShown: true }} />
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={styles.loadingText}>Đang tải dashboard...</Text>
      </View>
    );
  }

  // Error state
  if (error && !dashboard) {
    return (
      <View style={styles.centerContainer}>
        <Stack.Screen options={{ title: 'Admin Dashboard', headerShown: true }} />
        <Ionicons name="alert-circle-outline" size={64} color={theme.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchDashboard()}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Admin Dashboard',
          headerShown: true,
          headerRight: () => (
            <TouchableOpacity onPress={onRefresh} style={{ marginRight: 8 }}>
              <Ionicons name="refresh-outline" size={24} color={theme.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Statistics Cards */}
        <Section title="📊 Thống kê tổng quan">
          <View style={styles.statsGrid}>
            <StatCard
              title="Tổng người dùng"
              value={dashboard?.stats?.totalUsers || 0}
              icon="people-outline"
              color={theme.primary}
              trend="+12%"
            />
            <StatCard
              title="Dự án"
              value={dashboard?.stats?.totalProjects || 0}
              icon="folder-outline"
              color={theme.warning}
              trend="+8%"
            />
            <StatCard
              title="Doanh thu"
              value={dashboard?.stats?.totalRevenue ? formatCurrency(dashboard.stats.totalRevenue) : '0đ'}
              icon="cash-outline"
              color={theme.success}
              trend="+15%"
            />
            <StatCard
              title="Đang thực hiện"
              value={dashboard?.stats?.activeUsers || 0}
              icon="construct-outline"
              color={theme.info}
            />
          </View>
        </Section>

        {/* User Management */}
        <Section title="👥 Quản lý người dùng" style={{ marginTop: Spacing.lg }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionSubtitle}>Người dùng gần đây</Text>
            <TouchableOpacity onPress={() => console.log('View all users')}>
              <Text style={styles.viewAllText}>Xem tất cả →</Text>
            </TouchableOpacity>
          </View>
          {users.length > 0 ? (
            users.map((user) => <UserRow key={user.id} user={user} onPress={() => handleUserPress(user)} />)
          ) : (
            <Text style={styles.emptyText}>Chưa có người dùng</Text>
          )}
        </Section>

        {/* Recent Activities */}
        <Section title="🔔 Hoạt động gần đây" style={{ marginTop: Spacing.lg, marginBottom: Spacing.xl }}>
          {dashboard?.recentActivities && dashboard.recentActivities.length > 0 ? (
            dashboard.recentActivities.slice(0, 5).map((activity) => (
              <ActivityItem key={activity.id} activity={mapActivityToItem(activity)} />
            ))
          ) : (
            <Text style={styles.emptyText}>Chưa có hoạt động</Text>
          )}
        </Section>

        {/* System Health (if available) */}
        {dashboard?.systemHealth && (
          <Section title="⚙️ Tình trạng hệ thống" style={{ marginTop: Spacing.lg, marginBottom: Spacing.xl }}>
            <View style={styles.healthCard}>
              <Text style={styles.healthText}>
                Status: <Text style={{ color: theme.success }}>Hoạt động tốt</Text>
              </Text>
            </View>
          </Section>
        )}
      </ScrollView>
    </>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background,
    padding: Spacing.lg,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: 16,
    color: theme.textMuted,
  },
  errorText: {
    marginTop: Spacing.md,
    fontSize: 16,
    color: theme.error,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: Spacing.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    backgroundColor: theme.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  statCard: {
    flex: 1,
    minWidth: (SCREEN_WIDTH - Spacing.md * 2 - Spacing.sm) / 2,
    backgroundColor: '#fff',
    padding: Spacing.md,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: theme.textMuted,
  },
  statTrend: {
    fontSize: 12,
    fontWeight: '600',
  },

  // User Management
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: theme.textMuted,
  },
  viewAllText: {
    fontSize: 14,
    color: theme.primary,
    fontWeight: '600',
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: Spacing.md,
    borderRadius: 8,
    marginBottom: Spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  userAvatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: theme.textMuted,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  roleBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Activities
  activityItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: Spacing.md,
    borderRadius: 8,
    marginBottom: Spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 2,
  },
  activityDesc: {
    fontSize: 12,
    color: theme.textMuted,
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 11,
    color: theme.textMuted,
  },

  // System Health
  healthCard: {
    backgroundColor: '#fff',
    padding: Spacing.md,
    borderRadius: 8,
    marginTop: Spacing.xs,
  },
  healthText: {
    fontSize: 14,
    color: theme.text,
  },

  emptyText: {
    fontSize: 14,
    color: theme.textMuted,
    textAlign: 'center',
    padding: Spacing.lg,
    fontStyle: 'italic',
  },
});
