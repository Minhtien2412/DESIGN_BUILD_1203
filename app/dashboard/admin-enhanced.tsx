/**
 * Enhanced Admin Dashboard Screen
 * 
 * New features:
 * - Gradient statistic cards với trends
 * - Activity feed timeline
 * - Quick actions với badges
 * - Revenue charts
 * - Better loading states
 * - Pull-to-refresh
 * 
 * Created: Nov 24, 2025
 */

import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { QuickAction } from '@/components/dashboard/QuickAction';
import { ChartDataPoint, SimpleChart } from '@/components/dashboard/SimpleChart';
import { StatisticCard } from '@/components/dashboard/StatisticCard';
import { Section } from '@/components/ui/section';
import { Spacing } from '@/constants/layout';
import { Colors } from '@/constants/theme';
import { mockAdminDashboard, mockUsers } from '@/data/mockDashboard';
import { AdminDashboard, getAdminDashboard } from '@/services/dashboardApi';
import { getUsers, User } from '@/services/userApi';
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
const theme = Colors.light;

export default function AdminDashboardEnhancedScreen() {
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  const fetchDashboard = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      setError(null);

      const [dashboardData, usersData] = await Promise.all([
        getAdminDashboard(),
        getUsers({ limit: 10 }),
      ]);

      setDashboard(dashboardData);
      setUsers(usersData.users || []);
    } catch (err) {
      console.warn('⚠️ Using mock data');
      setDashboard(mockAdminDashboard);
      setUsers(mockUsers);
      setError('Server offline - Demo data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Generate chart data
  const revenueChartData: ChartDataPoint[] = dashboard
    ? [
        { label: 'T1', value: (dashboard as any).revenue?.total * 0.8 || 800000000 },
        { label: 'T2', value: (dashboard as any).revenue?.total * 0.9 || 900000000 },
        { label: 'T3', value: (dashboard as any).revenue?.total * 1.1 || 1100000000 },
        { label: 'T4', value: (dashboard as any).revenue?.total || 1000000000 },
      ]
    : [];

  // Generate activities
  const activities = (dashboard as any)?.recentActivities || [
    {
      id: 1,
      type: 'user' as const,
      title: 'User mới đăng ký',
      description: 'engineer@baotienweb.com vừa tạo tài khoản',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
    {
      id: 2,
      type: 'project',
      title: 'Dự án mới',
      description: 'Dự án "Xây nhà phố 3 tầng" đã được tạo',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: 3,
      type: 'payment',
      title: 'Thanh toán thành công',
      description: '100.000.000 VNĐ - Dự án Biệt thự vườn',
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    },
  ];

  if (loading && !dashboard) {
    return (
      <View style={styles.centerContainer}>
        <Stack.Screen options={{ title: 'Admin Dashboard' }} />
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Admin Dashboard',
          headerRight: () => (
            <TouchableOpacity onPress={() => fetchDashboard(true)} style={{ marginRight: 16 }}>
              <Ionicons name="refresh" size={24} color={theme.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchDashboard(true)} />}
      >
        {/* Error Banner */}
        {error && (
          <View style={styles.errorBanner}>
            <Ionicons name="warning" size={20} color={theme.warning} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Statistics Grid */}
        <Section title="Thống kê tổng quan">
          <View style={styles.statsGrid}>
            <StatisticCard
              title="Tổng người dùng"
              value={(dashboard as any)?.users?.total || 0}
              icon="people"
              gradientColors={['#3B82F6', '#0066CC']}
              trend={{ value: '+12%', isPositive: true }}
              subtitle="So với tháng trước"
            />
            <StatisticCard
              title="Dự án"
              value={(dashboard as any)?.projects?.total || 0}
              icon="briefcase"
              gradientColors={['#666666', '#666666']}
              trend={{ value: '+5', isPositive: true }}
            />
            <StatisticCard
              title="Doanh thu"
              value={formatCurrency((dashboard as any)?.revenue?.total || 0)}
              icon="cash"
              gradientColors={['#0066CC', '#0066CC']}
              trend={{ value: '+18%', isPositive: true }}
            />
            <StatisticCard
              title="Hoàn thành"
              value={`${(dashboard as any)?.projects?.completed || 0}/${(dashboard as any)?.projects?.total || 0}`}
              icon="checkmark-circle"
              gradientColors={['#0066CC', '#D97706']}
            />
          </View>
        </Section>

        {/* Quick Actions */}
        <Section title="Thao tác nhanh">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActions}>
            <QuickAction icon="person-add" label="Thêm User" color={theme.primary} onPress={() => Alert.alert('Add User')} />
            <QuickAction icon="briefcase" label="Dự án mới" color="#666666" onPress={() => Alert.alert('New Project')} />
            <QuickAction icon="document-text" label="Báo cáo" color="#0066CC" onPress={() => Alert.alert('Reports')} />
            <QuickAction icon="settings" label="Cài đặt" color="#6B7280" onPress={() => Alert.alert('Settings')} badge={3} />
            <QuickAction icon="notifications" label="Thông báo" color="#0066CC" onPress={() => Alert.alert('Notifications')} badge={12} />
          </ScrollView>
        </Section>

        {/* Revenue Chart */}
        {revenueChartData.length > 0 && (
          <SimpleChart data={revenueChartData} title="Doanh thu theo tháng" color={theme.success} />
        )}

        {/* Recent Activities */}
        <Section title="Hoạt động gần đây">
          <ActivityFeed activities={activities} maxHeight={300} />
        </Section>

        {/* Recent Users */}
        <Section title="Người dùng mới">
          {users.slice(0, 5).map((user) => (
            <TouchableOpacity
              key={user.id}
              style={styles.userCard}
              onPress={() =>
                Alert.alert(user.name || user.email, `Role: ${user.role}\nEmail: ${user.email}`)
              }
              activeOpacity={0.7}
            >
              <View style={[styles.userAvatar, { backgroundColor: getRoleColor(user.role) }]}>
                <Text style={styles.userAvatarText}>
                  {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name || 'No name'}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
              </View>
              <View style={[styles.roleBadge, { backgroundColor: `${getRoleColor(user.role)}20` }]}>
                <Text style={[styles.roleText, { color: getRoleColor(user.role) }]}>{user.role}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </Section>

        <View style={{ height: Spacing.lg }} />
      </ScrollView>
    </View>
  );
}

function getRoleColor(role: string | undefined): string {
  if (!role) return theme.textMuted;
  const colors: Record<string, string> = {
    ADMIN: theme.error,
    ENGINEER: theme.primary,
    CLIENT: theme.success,
  };
  return colors[role] || theme.textMuted;
}

function formatCurrency(amount: number): string {
  if (amount >= 1000000000) return `${(amount / 1000000000).toFixed(1)}B`;
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(0)}M`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`;
  return amount.toString();
}

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
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: theme.textMuted,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: `${theme.warning}15`,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: theme.warning,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActions: {
    gap: 16,
    paddingHorizontal: 4,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
  },
  userEmail: {
    fontSize: 12,
    color: theme.textMuted,
    marginTop: 2,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
