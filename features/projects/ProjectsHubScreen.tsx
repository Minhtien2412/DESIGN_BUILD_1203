/**
 * Enhanced Projects Hub Screen
 * Role-based project management with mindmap integration
 * Features:
 * - Manager: Customer list → Projects → Mindmap
 * - Contractor/Worker: Only assigned projects
 * - Client: Own projects only
 * @route /(tabs)/projects
 */

import { TappableImage } from '@/components/ui/full-media-viewer';
import { MODERN_COLORS, MODERN_RADIUS, MODERN_SHADOWS, MODERN_SPACING } from '@/constants/modern-theme';
import { useAuth } from '@/context/AuthContext';
import { useProjectsHub } from '@/hooks/useProjectsHub';
import { MINDMAP_ROLE_PERMISSIONS, MindmapRole } from '@/types/project-mindmap';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
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
const SHOPEE_ORANGE = '#0066CC';
const SHOPEE_ORANGE_LIGHT = '#FF6533';

// Quick Action Cards for different roles
interface QuickAction {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  route: string;
  roles: MindmapRole[];
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'customers',
    title: 'Khách hàng',
    subtitle: 'Quản lý khách hàng & dự án',
    icon: 'people',
    color: '#0066CC',
    route: '/projects/customer-projects',
    roles: ['ADMIN', 'MANAGER'],
  },
  {
    id: 'timeline',
    title: 'Timeline Dự án',
    subtitle: 'Mindmap tiến độ thi công',
    icon: 'git-network',
    color: SHOPEE_ORANGE,
    route: '/projects/timeline-mindmap',
    roles: ['ADMIN', 'MANAGER', 'ENGINEER', 'CONTRACTOR'],
  },
  {
    id: 'my-projects',
    title: 'Công trình của tôi',
    subtitle: 'Dự án được giao',
    icon: 'briefcase',
    color: '#0066CC',
    route: '/projects/customer-projects?view=my-projects',
    roles: ['CONTRACTOR', 'WORKER', 'ENGINEER'],
  },
  {
    id: 'todos',
    title: 'Việc cần làm',
    subtitle: 'Todo & Tasks được giao',
    icon: 'checkbox',
    color: '#0066CC',
    route: '/projects/timeline-mindmap?tab=todos',
    roles: ['CONTRACTOR', 'WORKER', 'ENGINEER'],
  },
  {
    id: 'progress',
    title: 'Tiến độ thi công',
    subtitle: 'Báo cáo tiến độ dự án',
    icon: 'analytics',
    color: '#10B981',
    route: '/(tabs)/progress',
    roles: ['ADMIN', 'MANAGER', 'ENGINEER', 'CONTRACTOR', 'CLIENT'],
  },
  {
    id: 'ai-assistant',
    title: '🤖 AI Assistant',
    subtitle: 'Hỗ trợ chỉnh sửa app',
    icon: 'sparkles',
    color: '#8B5CF6',
    route: '/(tabs)/ai-assistant',
    roles: ['ADMIN', 'MANAGER', 'ENGINEER', 'CONTRACTOR', 'CLIENT', 'WORKER'],
  },
  {
    id: 'create',
    title: 'Tạo dự án mới',
    subtitle: 'Khởi tạo dự án mới',
    icon: 'add-circle',
    color: '#00BCD4',
    route: '/projects/create',
    roles: ['ADMIN', 'MANAGER'],
  },
];

export default function ProjectsHubScreen() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  
  // Fetch real data from CRM
  const { stats, recentProjects, loading, dataSource, refresh } = useProjectsHub();
  
  // Determine user's role (default to MANAGER for demo)
  const currentRole: MindmapRole = (user?.role?.toUpperCase() as MindmapRole) || 'MANAGER';
  const permissions = MINDMAP_ROLE_PERMISSIONS[currentRole];
  
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, []);

  // Filter quick actions based on user role
  const availableActions = QUICK_ACTIONS.filter(action => 
    action.roles.includes(currentRole)
  );

  const getRoleDisplayName = (role: MindmapRole): string => {
    const names: Record<MindmapRole, string> = {
      ADMIN: 'Quản trị viên',
      MANAGER: 'Quản lý',
      ENGINEER: 'Kỹ sư',
      CONTRACTOR: 'Nhà thầu',
      WORKER: 'Công nhân',
      CLIENT: 'Khách hàng',
      VIEWER: 'Người xem',
    };
    return names[role];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS': return SHOPEE_ORANGE;
      case 'COMPLETED': return '#0066CC';
      case 'PLANNING': return '#0066CC';
      case 'ON_HOLD': return '#0066CC';
      default: return '#999999';
    }
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[SHOPEE_ORANGE, SHOPEE_ORANGE_LIGHT]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.headerGradient}
    >
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.headerGreeting}>
            Xin chào, {user?.name || 'Bạn'} 👋
          </Text>
          <View style={styles.roleBadge}>
            <Ionicons name="shield-checkmark" size={14} color="#fff" />
            <Text style={styles.roleText}>{getRoleDisplayName(currentRole)}</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerIconBtn}
            onPress={() => router.push('/search' as any)}
          >
            <Ionicons name="search" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerIconBtn}
            onPress={() => router.push('/notifications' as any)}
          >
            <Ionicons name="notifications" size={22} color="#fff" />
            {stats.overdueTodos > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {stats.overdueTodos}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Data Source Badge */}
      <View style={styles.dataSourceBadge}>
        <View style={[styles.dataSourceDot, { backgroundColor: dataSource === 'crm' ? '#0066CC' : '#0066CC' }]} />
        <Text style={styles.dataSourceText}>
          {dataSource === 'crm' ? 'Live CRM' : 'Demo'}
        </Text>
        {loading && <ActivityIndicator size="small" color="#fff" style={{ marginLeft: 8 }} />}
      </View>

      {/* Stats Cards */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statsContainer}
      >
        <View style={styles.statCard}>
          <Ionicons name="folder-open" size={24} color={SHOPEE_ORANGE} />
          <Text style={styles.statValue}>{stats.totalProjects}</Text>
          <Text style={styles.statLabel}>Tổng dự án</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="play-circle" size={24} color="#0066CC" />
          <Text style={styles.statValue}>{stats.activeProjects}</Text>
          <Text style={styles.statLabel}>Đang thực hiện</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkbox" size={24} color="#0066CC" />
          <Text style={styles.statValue}>{stats.pendingTodos}</Text>
          <Text style={styles.statLabel}>Việc cần làm</Text>
        </View>
        {(currentRole === 'ADMIN' || currentRole === 'MANAGER') && (
          <View style={styles.statCard}>
            <Ionicons name="people" size={24} color="#9C27B0" />
            <Text style={styles.statValue}>{stats.totalCustomers}</Text>
            <Text style={styles.statLabel}>Khách hàng</Text>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );

  const renderQuickActions = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Chức năng nhanh</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.actionsGrid}>
        {availableActions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.actionCard}
            onPress={() => router.push(action.route as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconWrapper, { backgroundColor: `${action.color}15` }]}>
              <Ionicons name={action.icon as any} size={28} color={action.color} />
            </View>
            <Text style={styles.actionTitle} numberOfLines={1}>{action.title}</Text>
            <Text style={styles.actionSubtitle} numberOfLines={1}>{action.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderRecentProjects = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Dự án gần đây</Text>
        <TouchableOpacity onPress={() => router.push('/projects/customer-projects' as any)}>
          <Text style={styles.seeAllText}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.recentProjectsContainer}
      >
        {recentProjects.map((project) => (
          <TouchableOpacity
            key={project.id}
            style={styles.recentProjectCard}
            onPress={() => router.push(`/projects/timeline-mindmap?projectId=${project.id}` as any)}
            activeOpacity={0.8}
          >
            <View style={styles.projectImagePlaceholder}>
              {project.image ? (
                <TappableImage 
                  source={{ uri: project.image }} 
                  style={styles.projectImage}
                  title={project.name}
                  description={`Khách hàng: ${project.customerName}`}
                />
              ) : (
                <Ionicons name="business" size={40} color="#ccc" />
              )}
            </View>
            <View style={styles.projectInfo}>
              <Text style={styles.projectName} numberOfLines={1}>{project.name}</Text>
              <Text style={styles.projectCustomer} numberOfLines={1}>
                <Ionicons name="person" size={12} color="#666" /> {project.customerName}
              </Text>
              <View style={styles.projectProgress}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${project.progress}%`,
                        backgroundColor: getStatusColor(project.status),
                      }
                    ]} 
                  />
                </View>
                <Text style={[styles.progressText, { color: getStatusColor(project.status) }]}>
                  {project.progress}%
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderRoleFeatures = () => {
    // Different feature highlights based on role
    const features = {
      ADMIN: ['Toàn quyền quản lý', 'Xem tất cả dự án', 'Phân quyền người dùng'],
      MANAGER: ['Quản lý khách hàng', 'Tạo & giao việc', 'Theo dõi tiến độ'],
      ENGINEER: ['Kiểm tra chất lượng', 'Duyệt tiến độ', 'Báo cáo kỹ thuật'],
      CONTRACTOR: ['Xem công trình được giao', 'Cập nhật tiến độ', 'Hoàn thành todo'],
      WORKER: ['Xem việc được giao', 'Báo cáo tiến độ', 'Upload hình ảnh'],
      CLIENT: ['Xem dự án của mình', 'Theo dõi tiến độ', 'Đánh giá hoàn thành'],
      VIEWER: ['Chỉ xem', 'Không chỉnh sửa', 'Theo dõi tổng quan'],
    };

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quyền của bạn</Text>
        </View>
        <View style={styles.featuresCard}>
          {features[currentRole].map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={20} color={SHOPEE_ORANGE} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[SHOPEE_ORANGE]}
            tintColor={SHOPEE_ORANGE}
          />
        }
      >
        {renderHeader()}
        {renderQuickActions()}
        {renderRecentProjects()}
        {renderRoleFeatures()}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerGradient: {
    paddingTop: 44,
    paddingBottom: MODERN_SPACING.lg,
    paddingHorizontal: MODERN_SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: MODERN_SPACING.md,
  },
  headerGreeting: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 4,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: SHOPEE_ORANGE,
  },
  dataSourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  dataSourceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  dataSourceText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
  },
  statsContainer: {
    paddingHorizontal: 4,
    gap: 12,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: MODERN_RADIUS.md,
    padding: MODERN_SPACING.md,
    alignItems: 'center',
    minWidth: 90,
    ...MODERN_SHADOWS.sm,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: MODERN_COLORS.text,
    marginTop: 6,
  },
  statLabel: {
    fontSize: 11,
    color: MODERN_COLORS.textSecondary,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: MODERN_SPACING.md,
    marginTop: MODERN_SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: MODERN_SPACING.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: MODERN_COLORS.text,
  },
  seeAllText: {
    fontSize: 14,
    color: SHOPEE_ORANGE,
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: (width - MODERN_SPACING.md * 2 - 12) / 2,
    backgroundColor: '#fff',
    borderRadius: MODERN_RADIUS.md,
    padding: MODERN_SPACING.md,
    ...MODERN_SHADOWS.sm,
  },
  actionIconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: MODERN_COLORS.text,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
    color: MODERN_COLORS.textSecondary,
  },
  recentProjectsContainer: {
    gap: 12,
    paddingRight: MODERN_SPACING.md,
  },
  recentProjectCard: {
    width: 200,
    backgroundColor: '#fff',
    borderRadius: MODERN_RADIUS.md,
    overflow: 'hidden',
    ...MODERN_SHADOWS.sm,
  },
  projectImagePlaceholder: {
    width: '100%',
    height: 100,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  projectImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  projectInfo: {
    padding: MODERN_SPACING.sm,
  },
  projectName: {
    fontSize: 14,
    fontWeight: '600',
    color: MODERN_COLORS.text,
    marginBottom: 2,
  },
  projectCustomer: {
    fontSize: 12,
    color: MODERN_COLORS.textSecondary,
    marginBottom: 8,
  },
  projectProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 35,
    textAlign: 'right',
  },
  featuresCard: {
    backgroundColor: '#fff',
    borderRadius: MODERN_RADIUS.md,
    padding: MODERN_SPACING.md,
    ...MODERN_SHADOWS.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  featureText: {
    fontSize: 14,
    color: MODERN_COLORS.text,
    marginLeft: 10,
  },
});
