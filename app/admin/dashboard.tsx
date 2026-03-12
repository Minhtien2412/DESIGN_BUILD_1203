import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useDashboard } from '@/hooks/useAdmin';
import { usePermissions } from '@/utils/permissions';
import { Ionicons } from '@expo/vector-icons';
import { Href, router, Stack } from 'expo-router';
import { useEffect } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

function StatCard({ icon, title, value, color, onPress }: any) {
  return (
    <TouchableOpacity style={[styles.statCard, { borderLeftColor: color }]} onPress={onPress} activeOpacity={0.7}>
      <Ionicons name={icon} size={32} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </TouchableOpacity>
  );
}

function RecentProjectCard({ project, colors }: any) {
  const statusColors: any = {
    planning: '#0D9488',
    active: '#0D9488',
    completed: '#0D9488',
    paused: '#000000',
  };

  const statusLabels: any = {
    planning: 'Lên kế hoạch',
    active: 'Đang thực hiện',
    completed: 'Hoàn thành',
    paused: 'Tạm dừng',
  };

  return (
    <TouchableOpacity
      style={[styles.projectCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => router.push(`/projects/${project.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.projectHeader}>
        <Text style={[styles.projectName, { color: colors.text }]} numberOfLines={1}>
          {project.name}
        </Text>
        <View style={[styles.projectStatus, { backgroundColor: statusColors[project.status] }]}>
          <Text style={styles.projectStatusText}>{statusLabels[project.status]}</Text>
        </View>
      </View>
      <Text style={[styles.projectClient, { color: colors.textMuted }]}>
        Khách hàng: {project.client}
      </Text>
      <View style={styles.projectProgress}>
        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <View style={[styles.progressFill, { backgroundColor: colors.accent, width: `${project.progress}%` }]} />
        </View>
        <Text style={[styles.progressText, { color: colors.text }]}>{project.progress}%</Text>
      </View>
    </TouchableOpacity>
  );
}

function ActivityCard({ activity, colors }: any) {
  return (
    <View style={[styles.activityCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.activityHeader}>
        {activity.staff?.profile_image ? (
          <View style={[styles.activityAvatar, { backgroundColor: colors.accent }]}>
            {/* Would use Image here */}
            <Text style={styles.activityAvatarText}>
              {activity.staff.firstname?.[0]}{activity.staff.lastname?.[0]}
            </Text>
          </View>
        ) : (
          <View style={[styles.activityAvatar, { backgroundColor: colors.accent }]}>
            <Ionicons name="person" size={20} color="#fff" />
          </View>
        )}
        <View style={styles.activityContent}>
          <Text style={[styles.activityStaff, { color: colors.text }]}>
            {activity.staff?.firstname} {activity.staff?.lastname}
          </Text>
          <Text style={[styles.activityDescription, { color: colors.textMuted }]} numberOfLines={2}>
            {activity.description}
          </Text>
        </View>
      </View>
      <Text style={[styles.activityTime, { color: colors.textMuted }]}>
        {new Date(activity.created_at).toLocaleString('vi-VN')}
      </Text>
    </View>
  );
}

export default function AdminDashboard() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, isAuthenticated } = useAuth();
  const { isAdmin, hasPermission } = usePermissions();

  const {
    stats,
    recentProjects,
    recentActivities,
    pendingTasks,
    loading,
    error,
    refresh,
  } = useDashboard();

  // Require admin access
  useEffect(() => {
    if (!loading && (!isAuthenticated || !isAdmin)) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isAdmin, loading]);

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  if (loading && !stats) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Stack.Screen
          options={{
            title: 'Admin Dashboard',
            headerStyle: { backgroundColor: colors.accent },
            headerTintColor: '#fff',
          }}
        />
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>Đang tải...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Stack.Screen
          options={{
            title: 'Admin Dashboard',
            headerStyle: { backgroundColor: colors.accent },
            headerTintColor: '#fff',
          }}
        />
        <Ionicons name="warning-outline" size={48} color={colors.textMuted} />
        <Text style={[styles.errorText, { color: colors.text }]}>Không thể tải dashboard</Text>
        <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.accent }]} onPress={refresh}>
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
          headerStyle: { backgroundColor: colors.accent },
          headerTintColor: '#fff',
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push('/admin/settings')} style={styles.headerButton}>
              <Ionicons name="settings-outline" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} colors={[colors.accent]} />}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={[styles.welcomeText, { color: colors.text }]}>
            Xin chào, {user?.name || 'Admin'}!
          </Text>
          <Text style={[styles.welcomeSubtext, { color: colors.textMuted }]}>
            Tổng quan hệ thống
          </Text>
        </View>

        {/* Stats Grid */}
        {stats && (
          <View style={styles.statsGrid}>
            <StatCard
              icon="folder-outline"
              title="Tổng dự án"
              value={stats.total_projects}
              color="#0D9488"
              onPress={() => router.push('/admin/projects' as Href)}
            />
            <StatCard
              icon="pulse-outline"
              title="Đang thực hiện"
              value={stats.active_projects}
              color="#0D9488"
              onPress={() => router.push('/admin/projects?status=active' as Href)}
            />
            <StatCard
              icon="people-outline"
              title="Nhân viên"
              value={stats.total_staff}
              color="#0D9488"
              onPress={() => router.push('/admin/staff')}
            />
            <StatCard
              icon="person-outline"
              title="Khách hàng"
              value={stats.total_clients}
              color="#666666"
              onPress={() => router.push('/admin/clients' as Href)}
            />
          </View>
        )}

        {/* Recent Projects */}
        {recentProjects && recentProjects.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Dự án gần đây</Text>
              <TouchableOpacity onPress={() => router.push('/projects')}>
                <Text style={[styles.sectionLink, { color: colors.accent }]}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>
            {recentProjects.slice(0, 3).map((project: any) => (
              <RecentProjectCard key={project.id} project={project} colors={colors} />
            ))}
          </View>
        )}

        {/* Recent Activities */}
        {recentActivities && recentActivities.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Hoạt động gần đây</Text>
              <TouchableOpacity onPress={() => router.push('/admin/activity-log' as Href)}>
                <Text style={[styles.sectionLink, { color: colors.accent }]}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>
            {recentActivities.slice(0, 5).map((activity: any) => (
              <ActivityCard key={activity.id} activity={activity} colors={colors} />
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Thao tác nhanh</Text>
          <View style={styles.quickActions}>
            {hasPermission('create', 'projects') && (
              <TouchableOpacity
                style={[styles.quickAction, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => router.push('/projects/create')}
              >
                <Ionicons name="add-circle-outline" size={32} color={colors.accent} />
                <Text style={[styles.quickActionText, { color: colors.text }]}>Tạo dự án</Text>
              </TouchableOpacity>
            )}
            {hasPermission('create', 'staff') && (
              <TouchableOpacity
                style={[styles.quickAction, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => router.push('/admin/staff/create')}
              >
                <Ionicons name="person-add-outline" size={32} color={colors.accent} />
                <Text style={[styles.quickActionText, { color: colors.text }]}>Thêm nhân viên</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => router.push('/admin/reports' as Href)}
            >
              <Ionicons name="stats-chart-outline" size={32} color={colors.accent} />
              <Text style={[styles.quickActionText, { color: colors.text }]}>Báo cáo</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  headerButton: {
    marginRight: 16,
  },
  welcomeSection: {
    padding: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
  },
  welcomeSubtext: {
    fontSize: 14,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 12,
  },
  statCard: {
    width: (width - 48) / 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 8,
    color: '#1f2937',
  },
  statTitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  sectionLink: {
    fontSize: 14,
    fontWeight: '500',
  },
  projectCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  projectStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  projectStatusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  projectClient: {
    fontSize: 13,
    marginBottom: 12,
  },
  projectProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    minWidth: 35,
    textAlign: 'right',
  },
  activityCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  activityAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityAvatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  activityContent: {
    flex: 1,
  },
  activityStaff: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  activityTime: {
    fontSize: 11,
    marginTop: 4,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  quickAction: {
    width: (width - 48) / 3 - 8,
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 32,
  },
});
