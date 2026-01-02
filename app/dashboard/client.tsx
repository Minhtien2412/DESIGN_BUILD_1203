/**
 * Client Dashboard Screen
 * 
 * Features:
 * - My projects overview
 * - Payment status (investment/paid/pending)
 * - Project progress tracking
 * - Upcoming payment schedules
 * - Recent project updates feed
 * 
 * API: dashboardApi.getClientDashboard()
 * Created: Nov 24, 2025
 */

import { Section } from '@/components/ui/section';
import { Spacing } from '@/constants/layout';
import { Colors } from '@/constants/theme';
import dashboardService from '@/services/api/dashboard.service';
import type { ClientDashboard, PaymentSchedule, Project, ProjectProgress, ProjectUpdate } from '@/services/api/types';
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
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Ionicons name={icon as any} size={24} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );
}

// ============================================================================
// PAYMENT CARD COMPONENT
// ============================================================================

interface PaymentCardProps {
  payment: PaymentSchedule;
  onPress: () => void;
}

function PaymentCard({ payment, onPress }: PaymentCardProps) {
  const statusColors: Record<string, string> = {
    paid: theme.success,
    pending: theme.warning,
    overdue: theme.error,
  };

  const statusLabels: Record<string, string> = {
    paid: 'Đã thanh toán',
    pending: 'Chờ thanh toán',
    overdue: 'Quá hạn',
  };

  return (
    <TouchableOpacity style={styles.paymentCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.paymentHeader}>
        <View style={styles.paymentInfo}>
          <Text style={styles.paymentProject}>{payment.projectName}</Text>
          <Text style={styles.paymentAmount}>{formatCurrency(payment.amount)}</Text>
        </View>
        <View style={[styles.paymentStatus, { backgroundColor: `${statusColors[payment.status]}20` }]}>
          <Text style={[styles.paymentStatusText, { color: statusColors[payment.status] }]}>
            {statusLabels[payment.status]}
          </Text>
        </View>
      </View>
      <View style={styles.paymentFooter}>
        <Ionicons name="calendar-outline" size={14} color={theme.textMuted} />
        <Text style={styles.paymentDate}>
          Hạn: {new Date(payment.dueDate).toLocaleDateString('vi-VN')}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ============================================================================
// PROJECT PROGRESS CARD
// ============================================================================

interface ProjectProgressCardProps {
  project: ProjectProgress;
  onPress: () => void;
}

function ProjectProgressCard({ project, onPress }: ProjectProgressCardProps) {
  return (
    <TouchableOpacity style={styles.progressCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressName}>{project.projectName}</Text>
        <Text style={styles.progressPercent}>{project.progress}%</Text>
      </View>
      
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressBarFill, { width: `${project.progress}%` }]} />
        </View>
      </View>

      {project.currentPhase && (
        <View style={styles.progressPhase}>
          <Ionicons name="construct-outline" size={14} color={theme.textMuted} />
          <Text style={styles.progressPhaseText}>{project.currentPhase}</Text>
        </View>
      )}

      {project.lastUpdate && (
        <Text style={styles.progressUpdate}>
          Cập nhật: {new Date(project.lastUpdate).toLocaleDateString('vi-VN')}
        </Text>
      )}
    </TouchableOpacity>
  );
}

// ============================================================================
// UPDATE ITEM COMPONENT
// ============================================================================

interface UpdateItemProps {
  update: ProjectUpdate;
}

function UpdateItem({ update }: UpdateItemProps) {
  return (
    <View style={styles.updateItem}>
      <View style={styles.updateIcon}>
        <Ionicons name="notifications-outline" size={20} color={theme.primary} />
      </View>
      <View style={styles.updateContent}>
        <Text style={styles.updateProject}>{update.projectName}</Text>
        <Text style={styles.updateMessage}>{update.message}</Text>
        <Text style={styles.updateTime}>{formatTime(update.timestamp)}</Text>
      </View>
    </View>
  );
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function formatTime(timestamp: string | undefined): string {
  if (!timestamp) return 'N/A';
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

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ClientDashboardScreen() {
  const [dashboard, setDashboard] = useState<ClientDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  const fetchDashboard = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      
      setError(null);

      console.log('👤 Fetching client dashboard...');
      const data = await dashboardService.client();

      console.log('✅ Client dashboard loaded:', data);
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

  const handlePaymentPress = (payment: PaymentSchedule) => {
    Alert.alert(
      'Chi tiết thanh toán',
      `Dự án: ${payment.projectName}\nSố tiền: ${formatCurrency(payment.amount)}\nHạn: ${new Date(payment.dueDate).toLocaleDateString('vi-VN')}\nTrạng thái: ${payment.status}`,
      [
        { text: 'Đóng', style: 'cancel' },
        { text: 'Thanh toán', onPress: () => console.log('Process payment:', payment.id) },
      ]
    );
  };

  const handleProjectPress = (project: Project) => {
    Alert.alert(
      project.name || 'Dự án',
      `Tiến độ: ${project.progress || 0}%\nMô tả: ${project.description || 'N/A'}`,
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
        <Stack.Screen options={{ title: 'Dashboard Khách Hàng', headerShown: true }} />
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={styles.loadingText}>Đang tải dashboard...</Text>
      </View>
    );
  }

  // Error state
  if (error && !dashboard) {
    return (
      <View style={styles.centerContainer}>
        <Stack.Screen options={{ title: 'Dashboard Khách Hàng', headerShown: true }} />
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
          title: 'Dashboard Khách Hàng',
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
        <Section title="📊 Tổng quan dự án">
          <View style={styles.statsGrid}>
            <StatCard
              title="Tổng dự án"
              value={dashboard?.stats?.totalProjects || 0}
              icon="folder-outline"
              color={theme.primary}
            />
            <StatCard
              title="Đang thực hiện"
              value={dashboard?.stats?.activeProjects || 0}
              icon="construct-outline"
              color={theme.warning}
            />
            <StatCard
              title="Cột mốc hoàn thành"
              value={dashboard?.stats?.completedMilestones || 0}
              icon="checkmark-circle-outline"
              color={theme.success}
            />
            <StatCard
              title="Thanh toán sắp tới"
              value={dashboard?.stats?.upcomingPayments || 0}
              icon="card-outline"
              color={theme.info}
            />
          </View>
        </Section>

        {/* Financial Overview */}
        {(dashboard?.totalInvestment !== undefined || dashboard?.totalPaid !== undefined) && (
          <Section title="💰 Tổng quan tài chính" style={{ marginTop: Spacing.lg }}>
            <View style={styles.financialCard}>
              {dashboard.totalInvestment !== undefined && (
                <View style={styles.financialRow}>
                  <Text style={styles.financialLabel}>Tổng đầu tư</Text>
                  <Text style={styles.financialValue}>{formatCurrency(dashboard.totalInvestment)}</Text>
                </View>
              )}
              {dashboard.totalPaid !== undefined && (
                <View style={styles.financialRow}>
                  <Text style={styles.financialLabel}>Đã thanh toán</Text>
                  <Text style={[styles.financialValue, { color: theme.success }]}>
                    {formatCurrency(dashboard.totalPaid)}
                  </Text>
                </View>
              )}
              {dashboard.totalPending !== undefined && (
                <View style={styles.financialRow}>
                  <Text style={styles.financialLabel}>Còn lại</Text>
                  <Text style={[styles.financialValue, { color: theme.warning }]}>
                    {formatCurrency(dashboard.totalPending)}
                  </Text>
                </View>
              )}
            </View>
          </Section>
        )}

        {/* My Projects */}
        <Section title="🏭️ Dự án của tôi" style={{ marginTop: Spacing.lg }}>
          {dashboard?.projects && dashboard.projects.length > 0 ? (
            dashboard.projects.map((project: Project) => (
              <TouchableOpacity 
                key={project.id} 
                style={styles.projectCard}
                onPress={() => handleProjectPress(project)}
              >
                <Text style={styles.projectName}>{project.name}</Text>
                {project.description && (
                  <Text style={styles.projectDesc} numberOfLines={2}>{project.description}</Text>
                )}
                {project.progress !== undefined && (
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${project.progress}%` }]} />
                    </View>
                    <Text style={styles.progressText}>{project.progress}%</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyText}>Chưa có dự án</Text>
          )}
        </Section>

        {/* Upcoming Payments */}
        <Section title="💳 Lịch thanh toán" style={{ marginTop: Spacing.lg }}>
          {dashboard?.upcomingPayments && dashboard.upcomingPayments.length > 0 ? (
            dashboard.upcomingPayments.slice(0, 5).map((payment) => (
              <PaymentCard 
                key={payment.id} 
                payment={payment} 
                onPress={() => handlePaymentPress(payment)} 
              />
            ))
          ) : (
            <Text style={styles.emptyText}>Không có thanh toán sắp tới</Text>
          )}
        </Section>

        {/* Recent Updates */}
        <Section title="🔔 Cập nhật gần đây" style={{ marginTop: Spacing.lg, marginBottom: Spacing.xl }}>
          {dashboard?.recentUpdates && dashboard.recentUpdates.length > 0 ? (
            dashboard.recentUpdates.slice(0, 5).map((update) => (
              <UpdateItem key={update.id} update={update} />
            ))
          ) : (
            <Text style={styles.emptyText}>Chưa có cập nhật mới</Text>
          )}
        </Section>
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
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: Spacing.md,
    borderRadius: 12,
    borderLeftWidth: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
    marginVertical: Spacing.xs,
  },
  statTitle: {
    fontSize: 11,
    color: theme.textMuted,
    textAlign: 'center',
  },

  // Financial Card
  financialCard: {
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
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.surfaceMuted,
  },
  financialLabel: {
    fontSize: 14,
    color: theme.text,
  },
  financialValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },

  // Payment Card
  paymentCard: {
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
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  paymentInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  paymentProject: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.primary,
  },
  paymentStatus: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  paymentStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  paymentFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  paymentDate: {
    fontSize: 12,
    color: theme.textMuted,
  },

  // Progress Card
  progressCard: {
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
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  progressName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    flex: 1,
  },
  progressPercent: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.primary,
  },
  progressBarContainer: {
    marginBottom: Spacing.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.surfaceMuted,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.primary,
    borderRadius: 4,
  },
  progressPhase: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  progressPhaseText: {
    fontSize: 12,
    color: theme.textMuted,
  },
  progressUpdate: {
    fontSize: 11,
    color: theme.textMuted,
  },

  // Update Item
  updateItem: {
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
  updateIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${theme.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  updateContent: {
    flex: 1,
  },
  updateProject: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 2,
  },
  updateMessage: {
    fontSize: 12,
    color: theme.textMuted,
    marginBottom: 4,
  },
  updateTime: {
    fontSize: 11,
    color: theme.textMuted,
  },

  // Project Card (for projects grid)
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
  projectName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  projectDesc: {
    fontSize: 12,
    color: theme.textMuted,
    marginBottom: Spacing.sm,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.primary,
  },

  emptyText: {
    fontSize: 14,
    color: theme.textMuted,
    textAlign: 'center',
    padding: Spacing.lg,
    fontStyle: 'italic',
  },
});
