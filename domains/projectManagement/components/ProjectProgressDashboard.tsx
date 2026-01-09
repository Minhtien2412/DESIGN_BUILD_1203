/**
 * Optimized ProjectProgressDashboard Component
 * Enhanced với performance optimizations và domain-specific logic
 */

import React, { memo, useCallback, useMemo, useState } from 'react';
import {
    Alert,
    Dimensions,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Button } from '../../../components/ui/button';
import { Container } from '../../../components/ui/container';
import { Loader } from '../../../components/ui/loader';
import { Section } from '../../../components/ui/section';
import {
    useCacheManager,
    usePaymentMutations,
    useProjectDashboard,
    useTaskMutations
} from '../../../shared/hooks/optimizedHooks';
import { useGlobalState } from '../../../shared/stores/globalStore';
import { ProjectPayment, ProjectTask, UserRole } from '../../../types/projectProgress';

const { width } = Dimensions.get('window');

interface ProjectProgressDashboardProps {
  projectId: string;
  userRole: UserRole;
  onTaskPress?: (task: ProjectTask) => void;
  onPaymentPress?: (payment: ProjectPayment) => void;
}

/**
 * Memoized StatCard component
 */
const StatCard = memo(({ 
  title, 
  value, 
  color = '#0066CC',
  onPress 
}: { 
  title: string; 
  value: string | number; 
  color?: string;
  onPress?: () => void;
}) => {
  return (
    <Pressable 
      style={[styles.statCard, { borderLeftColor: color }]}
      onPress={onPress}
      android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
    >
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </Pressable>
  );
});

/**
 * Memoized ProgressBar component
 */
const ProgressBar = memo(({ 
  progress, 
  color = '#0080FF',
  height = 8 
}: { 
  progress: number; 
  color?: string;
  height?: number;
}) => {
  const progressPercentage = Math.max(0, Math.min(100, progress));
  
  return (
    <View style={[styles.progressBarContainer, { height }]}>
      <View 
        style={[
          styles.progressBar, 
          { 
            width: `${progressPercentage}%`, 
            backgroundColor: color 
          }
        ]} 
      />
    </View>
  );
});

/**
 * Memoized TaskSummaryCard component
 */
const TaskSummaryCard = memo(({ 
  tasks, 
  onTaskPress 
}: { 
  tasks: ProjectTask[]; 
  onTaskPress?: (task: ProjectTask) => void;
}) => {
  const taskStats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    
    return { total, completed, inProgress, pending };
  }, [tasks]);

  const recentTasks = useMemo(() => {
    return tasks
      .filter(t => t.status !== 'completed')
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 3);
  }, [tasks]);

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Task Summary</Text>
      
      <View style={styles.statsRow}>
        <StatCard 
          title="Total" 
          value={taskStats.total} 
          color="#0066CC"
        />
        <StatCard 
          title="Completed" 
          value={taskStats.completed} 
          color="#0080FF"
        />
        <StatCard 
          title="In Progress" 
          value={taskStats.inProgress} 
          color="#0066CC"
        />
        <StatCard 
          title="Pending" 
          value={taskStats.pending} 
          color="#999999"
        />
      </View>

      {recentTasks.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Recent Tasks</Text>
          {recentTasks.map(task => (
            <Pressable 
              key={task.id}
              style={styles.taskItem}
              onPress={() => onTaskPress?.(task)}
            >
              <View style={styles.taskHeader}>
                <Text style={styles.taskTitle}>{task.name}</Text>
                <View style={[styles.taskStatus, { backgroundColor: getStatusColor(task.status) }]}>
                  <Text style={styles.taskStatusText}>{task.status}</Text>
                </View>
              </View>
              <ProgressBar progress={task.submissions?.[0]?.completionPercentage || 0} />
              <Text style={styles.taskDue}>Due: {task.endDate ? new Date(task.endDate).toLocaleDateString() : 'TBD'}</Text>
            </Pressable>
          ))}
        </>
      )}
    </View>
  );
});

/**
 * Memoized PaymentSummaryCard component
 */
const PaymentSummaryCard = memo(({ 
  payments, 
  onPaymentPress 
}: { 
  payments: ProjectPayment[]; 
  onPaymentPress?: (payment: ProjectPayment) => void;
}) => {
  const paymentStats = useMemo(() => {
    const total = payments.reduce((sum, p) => sum + p.amount, 0);
    const completed = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
    const pending = payments
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0);
    
    return { total, completed, pending };
  }, [payments]);

  const pendingPayments = useMemo(() => {
    return payments
      .filter(p => p.status === 'pending')
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 3);
  }, [payments]);

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }, []);

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Payment Summary</Text>
      
      <View style={styles.statsRow}>
        <StatCard 
          title="Total" 
          value={formatCurrency(paymentStats.total)} 
          color="#0066CC"
        />
        <StatCard 
          title="Completed" 
          value={formatCurrency(paymentStats.completed)} 
          color="#0080FF"
        />
        <StatCard 
          title="Pending" 
          value={formatCurrency(paymentStats.pending)} 
          color="#0066CC"
        />
      </View>

      {pendingPayments.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Pending Payments</Text>
          {pendingPayments.map(payment => (
            <Pressable 
              key={payment.id}
              style={styles.paymentItem}
              onPress={() => onPaymentPress?.(payment)}
            >
              <View style={styles.paymentHeader}>
                <Text style={styles.paymentTitle}>{payment.category}</Text>
                <Text style={styles.paymentAmount}>{formatCurrency(payment.amount)}</Text>
              </View>
              <Text style={styles.paymentDue}>
                Due: {new Date(payment.dueDate).toLocaleDateString()}
              </Text>
            </Pressable>
          ))}
        </>
      )}
    </View>
  );
});

/**
 * Main ProjectProgressDashboard Component
 */
const ProjectProgressDashboard: React.FC<ProjectProgressDashboardProps> = ({
  projectId,
  userRole,
  onTaskPress,
  onPaymentPress,
}) => {
  const [refreshing, setRefreshing] = useState(false);
  const { addNotification } = useGlobalState();
  const { clearProjectCache } = useCacheManager();
  
  // Data fetching hooks
  const { 
    data: dashboard, 
    loading, 
    error, 
    refresh: refreshDashboard 
  } = useProjectDashboard(projectId, userRole);

  // Mutation hooks
  const taskMutations = useTaskMutations();
  const paymentMutations = usePaymentMutations();

  // Memoized calculations
  const overallProgress = useMemo(() => {
    if (!dashboard?.progress) return 0;
    return dashboard.progress.overallProgress;
  }, [dashboard]);

  const nextMilestone = useMemo(() => {
    if (!dashboard?.progress?.phases) return null;
    const phases = Object.values(dashboard.progress.phases);
    return phases.find(p => p.status !== 'completed');
  }, [dashboard]);

  // Handlers
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      clearProjectCache(projectId);
      await refreshDashboard();
    } finally {
      setRefreshing(false);
    }
  }, [refreshDashboard, clearProjectCache, projectId]);

  const handleQuickAction = useCallback((action: string) => {
    switch (action) {
      case 'add-task':
        Alert.alert('Quick Action', 'Add New Task functionality');
        break;
      case 'request-payment':
        Alert.alert('Quick Action', 'Request Payment functionality');
        break;
      case 'view-reports':
        Alert.alert('Quick Action', 'View Reports functionality');
        break;
      default:
        break;
    }
  }, []);

  // Loading state
  if (loading && !dashboard) {
    return (
      <Container>
        <Loader />
      </Container>
    );
  }

  // Error state
  if (error && !dashboard) {
    return (
      <Container>
        <Section>
          <Text style={styles.errorText}>Error: {error}</Text>
          <Button 
            title="Retry" 
            onPress={refreshDashboard}
            style={{ marginTop: 16 }}
          />
        </Section>
      </Container>
    );
  }

  if (!dashboard) {
    return (
      <Container>
        <Section>
          <Text style={styles.emptyText}>No dashboard data available</Text>
        </Section>
      </Container>
    );
  }

  return (
    <Container fullWidth>
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            colors={['#0066CC']}
          />
        }
      >
        {/* Header */}
        <Section>
          <Text style={styles.title}>Project Dashboard</Text>
          <Text style={styles.subtitle}>Project Progress Overview</Text>
        </Section>

        {/* Overall Progress */}
        <Section>
          <View style={styles.progressSection}>
            <Text style={styles.progressTitle}>Overall Progress</Text>
            <Text style={styles.progressPercentage}>{overallProgress.toFixed(1)}%</Text>
            <ProgressBar progress={overallProgress} height={12} />
          </View>
        </Section>

        {/* Next Milestone */}
        {nextMilestone && (
          <Section>
            <View style={styles.milestoneCard}>
              <Text style={styles.milestoneTitle}>Next Milestone</Text>
              <Text style={styles.milestoneName}>{nextMilestone.name}</Text>
              <Text style={styles.milestoneDate}>
                Due: {nextMilestone.endDate ? new Date(nextMilestone.endDate).toLocaleDateString() : 'TBD'}
              </Text>
            </View>
          </Section>
        )}

        {/* Quick Actions */}
        <Section>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <Button 
              title="Add Task"
              onPress={() => handleQuickAction('add-task')}
              style={styles.quickActionButton}
            />
            <Button 
              title="Request Payment"
              onPress={() => handleQuickAction('request-payment')}
              style={styles.quickActionButton}
            />
            <Button 
              title="View Reports"
              onPress={() => handleQuickAction('view-reports')}
              style={styles.quickActionButton}
            />
          </View>
        </Section>

        {/* Task Summary */}
        <Section>
          <TaskSummaryCard 
            tasks={[]} 
            onTaskPress={onTaskPress}
          />
        </Section>

        {/* Payment Summary */}
        <Section>
          <PaymentSummaryCard 
            payments={dashboard.upcomingPayments || []} 
            onPaymentPress={onPaymentPress}
          />
        </Section>

        {/* Performance Indicators */}
        <Section>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Performance Indicators</Text>
            <View style={styles.kpiRow}>
              <StatCard 
                title="Schedule Performance" 
                value={`${dashboard.kpis?.schedulePerformance || 0}%`}
                color="#0080FF"
              />
              <StatCard 
                title="Cost Performance" 
                value={`${dashboard.kpis?.costPerformance || 0}%`}
                color="#0066CC"
              />
            </View>
          </View>
        </Section>
      </ScrollView>
    </Container>
  );
};

// Helper function
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'completed': return '#0080FF';
    case 'in-progress': return '#0066CC';
    case 'pending': return '#999999';
    case 'overdue': return '#1A1A1A';
    default: return '#999999';
  }
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginVertical: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    borderLeftWidth: 4,
    minHeight: 60,
    justifyContent: 'center',
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressSection: {
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  progressPercentage: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0066CC',
    marginBottom: 16,
  },
  progressBarContainer: {
    width: '100%',
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  milestoneCard: {
    backgroundColor: '#E8F4FF',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#0066CC',
  },
  milestoneTitle: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '600',
  },
  milestoneName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 4,
  },
  milestoneDate: {
    fontSize: 14,
    color: '#666',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  taskItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  taskStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  taskStatusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  taskDue: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  paymentItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  paymentAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0066CC',
  },
  paymentDue: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  errorText: {
    fontSize: 16,
    color: '#1A1A1A',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default memo(ProjectProgressDashboard);
