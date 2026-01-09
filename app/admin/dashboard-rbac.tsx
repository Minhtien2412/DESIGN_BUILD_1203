/**
 * Admin Dashboard with Role-Based Access Control
 * Different views based on user role and permissions
 */

import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useDashboard } from '@/hooks/useAdmin';
import {
    useCanViewWidget,
    useIsAdmin,
    useIsSuperAdmin,
    usePermission,
    useUserRole,
} from '@/hooks/usePermissions';
import {
    PermissionAction,
    PermissionModule,
    ROLE_HIERARCHY,
    ROLE_LABELS_VI,
} from '@/types/permission';
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
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

// ==================== DASHBOARD WIDGETS ====================

interface WidgetConfig {
  id: string;
  icon: string;
  title: string;
  module: PermissionModule;
  action: PermissionAction;
  minRoleLevel?: number;
  getValue: (stats: any) => string | number;
  color: string;
  route: string;
}

const WIDGET_CONFIGS: WidgetConfig[] = [
  {
    id: 'projects',
    icon: 'folder-outline',
    title: 'Tổng dự án',
    module: PermissionModule.PROJECTS,
    action: PermissionAction.VIEW,
    getValue: (stats) => stats?.total_projects || 0,
    color: '#3b82f6',
    route: '/admin/projects',
  },
  {
    id: 'active_projects',
    icon: 'pulse-outline',
    title: 'Đang thực hiện',
    module: PermissionModule.PROJECTS,
    action: PermissionAction.VIEW,
    getValue: (stats) => stats?.active_projects || 0,
    color: '#0066CC',
    route: '/admin/projects?status=active',
  },
  {
    id: 'budget',
    icon: 'cash-outline',
    title: 'Ngân sách',
    module: PermissionModule.BUDGET,
    action: PermissionAction.VIEW,
    getValue: (stats) => stats?.total_budget ? `${(stats.total_budget / 1000000).toFixed(0)}M` : '0',
    color: '#0066CC',
    route: '/admin/budget',
  },
  {
    id: 'tasks',
    icon: 'checkbox-outline',
    title: 'Công việc',
    module: PermissionModule.TASKS,
    action: PermissionAction.VIEW,
    getValue: (stats) => stats?.total_tasks || 0,
    color: '#666666',
    route: '/admin/tasks',
  },
  {
    id: 'staff',
    icon: 'people-outline',
    title: 'Nhân viên',
    module: PermissionModule.USERS,
    action: PermissionAction.VIEW,
    minRoleLevel: ROLE_HIERARCHY.ADMIN,
    getValue: (stats) => stats?.total_staff || 0,
    color: '#0066CC',
    route: '/admin/staff',
  },
  {
    id: 'clients',
    icon: 'person-outline',
    title: 'Khách hàng',
    module: PermissionModule.USERS,
    action: PermissionAction.VIEW,
    minRoleLevel: ROLE_HIERARCHY.PROJECT_MANAGER,
    getValue: (stats) => stats?.total_clients || 0,
    color: '#666666',
    route: '/admin/clients',
  },
  {
    id: 'qc',
    icon: 'shield-checkmark-outline',
    title: 'QC/QA',
    module: PermissionModule.QC_QA,
    action: PermissionAction.VIEW,
    getValue: (stats) => stats?.total_qc || 0,
    color: '#06b6d4',
    route: '/admin/qc',
  },
  {
    id: 'safety',
    icon: 'warning-outline',
    title: 'An toàn',
    module: PermissionModule.SAFETY,
    action: PermissionAction.VIEW,
    getValue: (stats) => stats?.safety_incidents || 0,
    color: '#000000',
    route: '/admin/safety',
  },
  {
    id: 'materials',
    icon: 'cube-outline',
    title: 'Vật liệu',
    module: PermissionModule.MATERIALS,
    action: PermissionAction.VIEW,
    getValue: (stats) => stats?.total_materials || 0,
    color: '#0066CC',
    route: '/admin/materials',
  },
  {
    id: 'equipment',
    icon: 'construct-outline',
    title: 'Thiết bị',
    module: PermissionModule.EQUIPMENT,
    action: PermissionAction.VIEW,
    getValue: (stats) => stats?.total_equipment || 0,
    color: '#14b8a6',
    route: '/admin/equipment',
  },
];

// ==================== COMPONENTS ====================

function StatCard({ widget, stats, colors }: { widget: WidgetConfig; stats: any; colors: any }) {
  const canView = useCanViewWidget(
    [{ module: widget.module, action: widget.action }],
    widget.minRoleLevel
  );

  if (!canView) return null;

  return (
    <TouchableOpacity
      style={[styles.statCard, { backgroundColor: colors.surface, borderLeftColor: widget.color }]}
      onPress={() => router.push(widget.route as Href)}
      activeOpacity={0.7}
    >
      <Ionicons name={widget.icon as any} size={32} color={widget.color} />
      <Text style={[styles.statValue, { color: colors.text }]}>{widget.getValue(stats)}</Text>
      <Text style={[styles.statTitle, { color: colors.textMuted }]}>{widget.title}</Text>
    </TouchableOpacity>
  );
}

function RoleIndicator({ colors }: { colors: any }) {
  const userRole = useUserRole();
  const roleLevel = userRole ? ROLE_HIERARCHY[userRole] : 0;

  if (!userRole) return null;

  const getRoleColor = () => {
    if (roleLevel >= ROLE_HIERARCHY.ADMIN) return '#0066CC';
    if (roleLevel >= ROLE_HIERARCHY.PROJECT_MANAGER) return '#3b82f6';
    if (roleLevel >= ROLE_HIERARCHY.ENGINEER) return '#666666';
    return '#0066CC';
  };

  return (
    <View style={[styles.roleIndicator, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.roleBadge, { backgroundColor: getRoleColor() }]}>
        <Text style={styles.roleBadgeText}>{ROLE_LABELS_VI[userRole]}</Text>
      </View>
      <Text style={[styles.roleLevel, { color: colors.textMuted }]}>
        Cấp độ: {roleLevel}
      </Text>
    </View>
  );
}

function QuickActionButton({
  icon,
  label,
  route,
  module,
  action,
  color,
  colors,
}: {
  icon: string;
  label: string;
  route: string;
  module: PermissionModule;
  action: PermissionAction;
  color: string;
  colors: any;
}) {
  const { allowed } = usePermission(module, action);

  if (!allowed) return null;

  return (
    <TouchableOpacity
      style={[styles.quickAction, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => router.push(route as Href)}
    >
      <Ionicons name={icon as any} size={32} color={color} />
      <Text style={[styles.quickActionText, { color: colors.text }]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ==================== MAIN COMPONENT ====================

export default function AdminDashboardRBAC() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, isAuthenticated } = useAuth();
  const userRole = useUserRole();
  const isAdmin = useIsAdmin();
  const isSuperAdmin = useIsSuperAdmin();
  
  // Call usePermission at top level unconditionally
  const canViewProjects = usePermission(PermissionModule.PROJECTS, PermissionAction.VIEW);

  const { stats, recentProjects, recentActivities, loading, error, refresh } = useDashboard();

  // Require at least some role
  useEffect(() => {
    if (!loading && (!isAuthenticated || !userRole)) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, userRole, loading]);

  if (!isAuthenticated || !userRole) {
    return null;
  }

  if (loading && !stats) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Stack.Screen
          options={{
            title: 'Dashboard',
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
            title: 'Dashboard',
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
          title: 'Dashboard',
          headerStyle: { backgroundColor: colors.accent },
          headerTintColor: '#fff',
          headerRight: () => (
            <View style={styles.headerRight}>
              {isSuperAdmin && (
                <TouchableOpacity
                  onPress={() => router.push('/admin/permissions')}
                  style={styles.headerButton}
                >
                  <Ionicons name="key-outline" size={24} color="#fff" />
                </TouchableOpacity>
              )}
              {isAdmin && (
                <TouchableOpacity
                  onPress={() => router.push('/admin/settings')}
                  style={styles.headerButton}
                >
                  <Ionicons name="settings-outline" size={24} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
          ),
        }}
      />
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} colors={[colors.accent]} />}
      >
        {/* Welcome Section with Role */}
        <View style={styles.welcomeSection}>
          <Text style={[styles.welcomeText, { color: colors.text }]}>
            Xin chào, {user?.name || 'User'}!
          </Text>
          <Text style={[styles.welcomeSubtext, { color: colors.textMuted }]}>
            Tổng quan hệ thống
          </Text>
        </View>

        {/* Role Indicator */}
        <View style={styles.roleContainer}>
          <RoleIndicator colors={colors} />
        </View>

        {/* Stats Grid - Role-based widgets */}
        <View style={styles.statsGrid}>
          {WIDGET_CONFIGS.map((widget) => (
            <StatCard key={widget.id} widget={widget} stats={stats} colors={colors} />
          ))}
        </View>

        {/* Quick Actions - Role-based */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Thao tác nhanh</Text>
          <View style={styles.quickActions}>
            <QuickActionButton
              icon="add-circle-outline"
              label="Tạo dự án"
              route="/projects/create"
              module={PermissionModule.PROJECTS}
              action={PermissionAction.CREATE}
              color={colors.accent}
              colors={colors}
            />
            <QuickActionButton
              icon="person-add-outline"
              label="Thêm nhân viên"
              route="/admin/staff/create"
              module={PermissionModule.USERS}
              action={PermissionAction.CREATE}
              color={colors.accent}
              colors={colors}
            />
            <QuickActionButton
              icon="stats-chart-outline"
              label="Báo cáo"
              route="/admin/reports"
              module={PermissionModule.REPORTS}
              action={PermissionAction.VIEW}
              color={colors.accent}
              colors={colors}
            />
            <QuickActionButton
              icon="document-text-outline"
              label="Tài liệu"
              route="/admin/documents"
              module={PermissionModule.DOCUMENTS}
              action={PermissionAction.VIEW}
              color={colors.accent}
              colors={colors}
            />
            <QuickActionButton
              icon="camera-outline"
              label="Ảnh tiến độ"
              route="/admin/photos"
              module={PermissionModule.PHOTOS}
              action={PermissionAction.VIEW}
              color={colors.accent}
              colors={colors}
            />
            <QuickActionButton
              icon="shield-checkmark-outline"
              label="An toàn"
              route="/admin/safety"
              module={PermissionModule.SAFETY}
              action={PermissionAction.VIEW}
              color={colors.accent}
              colors={colors}
            />
          </View>
        </View>

        {/* Recent Projects - If has permission */}
        {canViewProjects.allowed &&
          recentProjects &&
          recentProjects.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Dự án gần đây</Text>
                <TouchableOpacity onPress={() => router.push('/projects')}>
                  <Text style={[styles.sectionLink, { color: colors.accent }]}>Xem tất cả</Text>
                </TouchableOpacity>
              </View>
              {recentProjects.slice(0, 3).map((project: any) => (
                <ProjectCard key={project.id} project={project} colors={colors} />
              ))}
            </View>
          )}

        {/* Recent Activities - Admin only */}
        {isAdmin && recentActivities && recentActivities.length > 0 && (
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

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </>
  );
}

// Helper components (reused from original)
function ProjectCard({ project, colors }: any) {
  const statusColors: any = {
    planning: '#0066CC',
    active: '#3b82f6',
    completed: '#0066CC',
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
        <View style={[styles.activityAvatar, { backgroundColor: colors.accent }]}>
          <Ionicons name="person" size={20} color="#fff" />
        </View>
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText: { marginTop: 12, fontSize: 15 },
  errorText: { marginTop: 12, fontSize: 16, fontWeight: '500', marginBottom: 16 },
  retryButton: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  retryButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerButton: { marginRight: 4 },
  welcomeSection: { padding: 20 },
  welcomeText: { fontSize: 24, fontWeight: '700' },
  welcomeSubtext: { fontSize: 14, marginTop: 4 },
  roleContainer: { paddingHorizontal: 16, marginBottom: 12 },
  roleIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  roleBadgeText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  roleLevel: { fontSize: 12, fontWeight: '500' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 12 },
  statCard: {
    width: (width - 48) / 2,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: { fontSize: 28, fontWeight: '700', marginTop: 8 },
  statTitle: { fontSize: 13, marginTop: 4 },
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '600' },
  sectionLink: { fontSize: 14, fontWeight: '500' },
  quickActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 },
  quickAction: {
    width: (width - 48) / 3 - 8,
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  quickActionText: { fontSize: 12, fontWeight: '500', marginTop: 8, textAlign: 'center' },
  projectCard: { borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1 },
  projectHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  projectName: { fontSize: 16, fontWeight: '600', flex: 1, marginRight: 8 },
  projectStatus: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  projectStatusText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  projectClient: { fontSize: 13, marginBottom: 12 },
  projectProgress: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  progressBar: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  progressText: { fontSize: 13, fontWeight: '600', minWidth: 35, textAlign: 'right' },
  activityCard: { borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1 },
  activityHeader: { flexDirection: 'row', marginBottom: 8 },
  activityAvatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  activityContent: { flex: 1 },
  activityStaff: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  activityDescription: { fontSize: 13, lineHeight: 18 },
  activityTime: { fontSize: 11, marginTop: 4 },
  bottomSpacing: { height: 32 },
});
