/**
 * Engineer Dashboard Screen
 * 
 * Features:
 * - Assigned projects overview
 * - Task statistics (pending/completed)
 * - QC inspections pending
 * - Upcoming deadlines calendar
 * - Performance metrics
 * 
 * API: dashboardApi.getEngineerDashboard()
 * Created: Nov 24, 2025
 */

import { Section } from '@/components/ui/section';
import { Spacing } from '@/constants/layout';
import { Colors } from '@/constants/theme';
import dashboardService from '@/services/api/dashboard.service';
import type { EngineerDashboard, Project } from '@/services/api/types';
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

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  subtitle?: string;
}

function StatCard({ title, value, icon, color, subtitle }: StatCardProps) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );
}

// ============================================================================
// PROJECT CARD COMPONENT
// ============================================================================

interface ProjectCardProps {
  project: Project;
  onPress: () => void;
}

function ProjectCard({ project, onPress }: ProjectCardProps) {
  const statusColors: Record<string, string> = {
    IN_PROGRESS: theme.success,
    PLANNING: theme.warning,
    COMPLETED: theme.info,
    ON_HOLD: theme.textMuted,
    CANCELLED: theme.danger,
  };

  return (
    <TouchableOpacity style={styles.projectCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.projectHeader}>
        <Text style={styles.projectName} numberOfLines={1}>{project.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: `${statusColors[project.status] || theme.textMuted}20` }]}>
          <Text style={[styles.statusText, { color: statusColors[project.status] || theme.textMuted }]}>
            {project.status === 'IN_PROGRESS' ? 'Đang thực hiện' : 
             project.status === 'PLANNING' ? 'Chờ bắt đầu' :
             project.status === 'COMPLETED' ? 'Hoàn thành' : 
             project.status === 'ON_HOLD' ? 'Tạm dừng' : 'Hủy'}
          </Text>
        </View>
      </View>
      
      {/* Progress bar */}
      {project.progress !== undefined && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${project.progress}%`, backgroundColor: theme.primary }]} />
          </View>
          <Text style={styles.progressText}>{project.progress}%</Text>
        </View>
      )}

      {/* Project details */}
      <View style={styles.projectDetails}>
        {project.clientName && (
          <View style={styles.projectDetail}>
            <Ionicons name="person-outline" size={14} color={theme.textMuted} />
            <Text style={styles.projectDetailText}>{project.clientName}</Text>
          </View>
        )}
        {project.endDate && (
          <View style={styles.projectDetail}>
            <Ionicons name="calendar-outline" size={14} color={theme.textMuted} />
            <Text style={styles.projectDetailText}>{new Date(project.endDate).toLocaleDateString('vi-VN')}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ============================================================================
// DEADLINE ITEM COMPONENT
// ============================================================================

// DeadlineItem component removed - TODO: Add deadline feature to API
// interface DeadlineItemProps {
//   deadline: { projectName: string; taskName: string; dueDate: string; priority: string; daysRemaining: number };
// }

// function DeadlineItem({ deadline }: DeadlineItemProps) {
//   const priorityColors: Record<string, string> = {
//     urgent: theme.error,
//     high: theme.warning,
//     medium: theme.info,
//     low: theme.textMuted,
//   };

//   return (
//     <View style={styles.deadlineItem}>
//       <View style={[styles.deadlineIndicator, { backgroundColor: priorityColors[deadline.priority] }]} />
//       <View style={styles.deadlineContent}>
//         <Text style={styles.deadlineProject}>{deadline.projectName}</Text>
//         <Text style={styles.deadlineTask}>{deadline.taskName}</Text>
//         <View style={styles.deadlineFooter}>
//           <Text style={[styles.deadlineDays, { color: deadline.daysRemaining < 3 ? theme.error : theme.textMuted }]}>
//             {deadline.daysRemaining === 0 ? 'Hôm nay' : 
//              deadline.daysRemaining < 0 ? `Trễ ${Math.abs(deadline.daysRemaining)} ngày` :
//              `Còn ${deadline.daysRemaining} ngày`}
//           </Text>
//           <Text style={styles.deadlineDate}>
//             {new Date(deadline.dueDate).toLocaleDateString('vi-VN')}
//           </Text>
//         </View>
//       </View>
//     </View>
//   );
// }

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function EngineerDashboardScreen() {
  const [dashboard, setDashboard] = useState<EngineerDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  const fetchDashboard = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      
      setError(null);

      console.log('👷 Fetching engineer dashboard...');
      const data = await dashboardService.engineer();

      console.log('✅ Engineer dashboard loaded:', data);
      setDashboard(data);
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

  const onRefresh = () => {
    fetchDashboard(true);
  };

  const handleProjectPress = (project: Project) => {
    Alert.alert(
      project.name,
      `Trạng thái: ${project.status}\nTiến độ: ${project.progress}%`,
      [
        { text: 'Đóng', style: 'cancel' },
        { text: 'Xem chi tiết', onPress: () => console.log('Navigate to project:', project.id) },
      ]
    );
  };

  // Loading state
  if (loading && !dashboard) {
    return (
      <View style={styles.centerContainer}>
        <Stack.Screen options={{ title: 'Dashboard Kỹ Sư', headerShown: true }} />
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={styles.loadingText}>Đang tải dashboard...</Text>
      </View>
    );
  }

  // Error state
  if (error && !dashboard) {
    return (
      <View style={styles.centerContainer}>
        <Stack.Screen options={{ title: 'Dashboard Kỹ Sư', headerShown: true }} />
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
          title: 'Dashboard Kỹ Sư',
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
        <Section title="📊 Thống kê công việc">
          <View style={styles.statsGrid}>
            <StatCard
              title="Dự án được giao"
              value={dashboard?.stats?.assignedProjects || 0}
              icon="folder-outline"
              color={theme.primary}
            />
            <StatCard
              title="Công việc hôm nay"
              value={dashboard?.stats?.todayTasks || 0}
              icon="checkbox-outline"
              color={theme.warning}
            />
            <StatCard
              title="Hoàn thành"
              value={dashboard?.stats?.completedTasks || 0}
              icon="checkmark-circle-outline"
              color={theme.success}
            />
            <StatCard
              title="QC chờ kiểm tra"
              value={dashboard?.stats?.pendingQC || 0}
              icon="eye-outline"
              color={theme.info}
            />
          </View>
        </Section>

        {/* My Projects */}
        <Section title="🏭️ Dự án của tôi" style={{ marginTop: Spacing.lg }}>
          {dashboard?.projects && dashboard.projects.length > 0 ? (
            dashboard.projects.map((project) => (
              <ProjectCard key={project.id} project={project} onPress={() => handleProjectPress(project)} />
            ))
          ) : (
            <Text style={styles.emptyText}>Chưa có dự án được giao</Text>
          )}
        </Section>

        {/* Upcoming Deadlines - TODO: Add to API */}
        {/* <Section title="⏰ Deadline sắp tới" style={{ marginTop: Spacing.lg }}>
          {dashboard?.upcomingDeadlines && dashboard.upcomingDeadlines.length > 0 ? (
            dashboard.upcomingDeadlines.slice(0, 5).map((deadline) => (
              <DeadlineItem key={deadline.id} deadline={deadline} />
            ))
          ) : (
            <Text style={styles.emptyText}>Không có deadline sắp tới</Text>
          )}
        </Section> */}

        {/* Performance Stats - TODO: Add to API */}
        {/* {dashboard?.performanceStats && (
          <Section title="📈 Hiệu suất" style={{ marginTop: Spacing.lg, marginBottom: Spacing.xl }}>
            <View style={styles.performanceCard}>
              <View style={styles.performanceRow}>
                <Text style={styles.performanceLabel}>Công việc hoàn thành (tháng này)</Text>
                <Text style={styles.performanceValue}>{dashboard.performanceStats.tasksCompletedThisMonth}</Text>
              </View>
              <View style={styles.performanceRow}>
                <Text style={styles.performanceLabel}>Thời gian hoàn thành TB (giờ)</Text>
                <Text style={styles.performanceValue}>{dashboard.performanceStats.averageTaskCompletionTime}</Text>
              </View>
              <View style={styles.performanceRow}>
                <Text style={styles.performanceLabel}>Tỷ lệ đúng hạn</Text>
                <Text style={[styles.performanceValue, { color: theme.success }]}>
                  {dashboard.performanceStats.onTimeDeliveryRate}%
                </Text>
              </View>
              {dashboard.performanceStats.qualityScore && (
                <View style={styles.performanceRow}>
                  <Text style={styles.performanceLabel}>Điểm chất lượng</Text>
                  <Text style={[styles.performanceValue, { color: theme.primary }]}>
                    {dashboard.performanceStats.qualityScore}/10
                  </Text>
                </View>
              )}
            </View>
          </Section>
        )} */}
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
  statSubtitle: {
    fontSize: 10,
    color: theme.textMuted,
    marginTop: 2,
  },

  // Project Card
  projectCard: {
    backgroundColor: '#fff',
    padding: Spacing.md,
    borderRadius: 8,
    marginBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    flex: 1,
    marginRight: Spacing.sm,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: theme.surfaceMuted,
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: Spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.text,
    minWidth: 35,
    textAlign: 'right',
  },
  projectDetails: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  projectDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  projectDetailText: {
    fontSize: 12,
    color: theme.textMuted,
  },

  // Deadline Item
  deadlineItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: Spacing.xs,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  deadlineIndicator: {
    width: 4,
  },
  deadlineContent: {
    flex: 1,
    padding: Spacing.md,
  },
  deadlineProject: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 2,
  },
  deadlineTask: {
    fontSize: 12,
    color: theme.textMuted,
    marginBottom: Spacing.xs,
  },
  deadlineFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deadlineDays: {
    fontSize: 12,
    fontWeight: '600',
  },
  deadlineDate: {
    fontSize: 11,
    color: theme.textMuted,
  },

  // Performance Card
  performanceCard: {
    backgroundColor: '#fff',
    padding: Spacing.md,
    borderRadius: 8,
    marginTop: Spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.surfaceMuted,
  },
  performanceLabel: {
    fontSize: 14,
    color: theme.text,
  },
  performanceValue: {
    fontSize: 16,
    fontWeight: '600',
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
