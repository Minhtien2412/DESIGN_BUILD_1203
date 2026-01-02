/**
 * Analytics Dashboard Screen
 * View project analytics and generate reports
 */

import { useThemeColor } from '@/hooks/use-theme-color';
import { analyticsService, DashboardMetrics } from '@/services/analyticsApi';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AnalyticsDashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardColor = useThemeColor({}, 'card');
  const primaryColor = '#EE4D2D';

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getDashboardMetrics();
      setMetrics(data);
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      setExporting(true);
      const result = await analyticsService.exportReport({
        reportType: 'dashboard',
        format,
        filters: {},
        options: { includeCharts: true },
      });
      
      Alert.alert(
        'Export Successful',
        `Report exported as ${result.filename}`,
        [
          {
            text: 'Download',
            onPress: () => {
              // Open download URL
            },
          },
          { text: 'OK' },
        ]
      );
    } catch (error: any) {
      Alert.alert('Export Failed', error.message);
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `${(amount / 1000000).toFixed(1)}M VND`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return '#FF3B30';
      case 'high':
        return '#FF9500';
      case 'medium':
        return '#007AFF';
      case 'low':
        return '#34C759';
      default:
        return '#999';
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor }]}>
        <ActivityIndicator size="large" color={primaryColor} />
        <Text style={[styles.loadingText, { color: textColor }]}>
          Loading analytics...
        </Text>
      </View>
    );
  }

  if (!metrics) {
    return (
      <View style={[styles.errorContainer, { backgroundColor }]}>
        <Ionicons name="alert-circle-outline" size={64} color="#999" />
        <Text style={[styles.errorText, { color: textColor }]}>
          Failed to load analytics
        </Text>
        <Pressable
          style={[styles.retryButton, { backgroundColor: primaryColor }]}
          onPress={loadMetrics}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor }]}
      edges={['top']}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: textColor }]}>
          Analytics Dashboard
        </Text>
        <Pressable onPress={() => {}} hitSlop={8}>
          <Ionicons name="filter-outline" size={24} color={textColor} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Overview Cards */}
        <Animated.View entering={FadeInUp.springify()} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Overview</Text>
          <View style={styles.grid}>
            <View style={[styles.metricCard, { backgroundColor: cardColor }]}>
              <Ionicons name="briefcase-outline" size={28} color={primaryColor} />
              <Text style={[styles.metricValue, { color: textColor }]}>
                {metrics.totalProjects}
              </Text>
              <Text style={[styles.metricLabel, { color: '#999' }]}>
                Total Projects
              </Text>
            </View>

            <View style={[styles.metricCard, { backgroundColor: cardColor }]}>
              <Ionicons name="play-circle-outline" size={28} color="#007AFF" />
              <Text style={[styles.metricValue, { color: textColor }]}>
                {metrics.activeProjects}
              </Text>
              <Text style={[styles.metricLabel, { color: '#999' }]}>Active</Text>
            </View>

            <View style={[styles.metricCard, { backgroundColor: cardColor }]}>
              <Ionicons name="checkmark-circle-outline" size={28} color="#34C759" />
              <Text style={[styles.metricValue, { color: textColor }]}>
                {metrics.completedProjects}
              </Text>
              <Text style={[styles.metricLabel, { color: '#999' }]}>
                Completed
              </Text>
            </View>

            <View style={[styles.metricCard, { backgroundColor: cardColor }]}>
              <Ionicons name="trending-up-outline" size={28} color={primaryColor} />
              <Text style={[styles.metricValue, { color: textColor }]}>
                {Math.round(metrics.averageProgress)}%
              </Text>
              <Text style={[styles.metricLabel, { color: '#999' }]}>
                Avg Progress
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Budget */}
        <Animated.View entering={FadeInUp.delay(100).springify()} style={styles.section}>
          <View style={[styles.budgetCard, { backgroundColor: cardColor }]}>
            <View style={styles.budgetHeader}>
              <Ionicons name="wallet-outline" size={24} color={primaryColor} />
              <Text style={[styles.budgetTitle, { color: textColor }]}>
                Budget Overview
              </Text>
            </View>
            <View style={styles.budgetStats}>
              <View style={styles.budgetStat}>
                <Text style={[styles.budgetLabel, { color: '#999' }]}>
                  Total Budget
                </Text>
                <Text style={[styles.budgetValue, { color: textColor }]}>
                  {formatCurrency(metrics.totalBudget)}
                </Text>
              </View>
              <View style={styles.budgetStat}>
                <Text style={[styles.budgetLabel, { color: '#999' }]}>
                  Total Spent
                </Text>
                <Text style={[styles.budgetValue, { color: primaryColor }]}>
                  {formatCurrency(metrics.totalSpent)}
                </Text>
              </View>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: primaryColor,
                    width: `${(metrics.totalSpent / metrics.totalBudget) * 100}%`,
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: '#999' }]}>
              {Math.round((metrics.totalSpent / metrics.totalBudget) * 100)}% utilized
            </Text>
          </View>
        </Animated.View>

        {/* Timeline Status */}
        <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Timeline Status
          </Text>
          <View style={styles.grid2}>
            <View style={[styles.statusCard, { backgroundColor: cardColor }]}>
              <Ionicons name="checkmark-circle" size={32} color="#34C759" />
              <Text style={[styles.statusValue, { color: textColor }]}>
                {metrics.onTimeProjects}
              </Text>
              <Text style={[styles.statusLabel, { color: '#999' }]}>
                On Time
              </Text>
            </View>
            <View style={[styles.statusCard, { backgroundColor: cardColor }]}>
              <Ionicons name="alert-circle" size={32} color="#FF9500" />
              <Text style={[styles.statusValue, { color: textColor }]}>
                {metrics.delayedProjects}
              </Text>
              <Text style={[styles.statusLabel, { color: '#999' }]}>Delayed</Text>
            </View>
          </View>
        </Animated.View>

        {/* Upcoming Tasks */}
        <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Upcoming Tasks
          </Text>
          <View style={styles.tasksList}>
            {metrics.upcomingTasks.slice(0, 5).map((task, index) => (
              <Pressable
                key={task.id}
                style={[styles.taskCard, { backgroundColor: cardColor }]}
                onPress={() => router.push(`/projects/${task.projectId}`)}
              >
                <View
                  style={[
                    styles.priorityIndicator,
                    { backgroundColor: getPriorityColor(task.priority) },
                  ]}
                />
                <View style={styles.taskInfo}>
                  <Text style={[styles.taskTitle, { color: textColor }]} numberOfLines={1}>
                    {task.title}
                  </Text>
                  <Text style={[styles.taskProject, { color: '#999' }]} numberOfLines={1}>
                    {task.projectName}
                  </Text>
                  <View style={styles.taskFooter}>
                    <Ionicons name="calendar-outline" size={12} color="#999" />
                    <Text style={[styles.taskDate, { color: '#999' }]}>
                      {new Date(task.dueDate).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* Export Actions */}
        <Animated.View entering={FadeInUp.delay(400).springify()} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Export Reports
          </Text>
          <View style={styles.exportGrid}>
            <Pressable
              style={[styles.exportButton, { backgroundColor: cardColor }]}
              onPress={() => handleExport('pdf')}
              disabled={exporting}
            >
              <Ionicons name="document-text-outline" size={32} color="#FF3B30" />
              <Text style={[styles.exportLabel, { color: textColor }]}>PDF</Text>
            </Pressable>
            <Pressable
              style={[styles.exportButton, { backgroundColor: cardColor }]}
              onPress={() => handleExport('excel')}
              disabled={exporting}
            >
              <Ionicons name="grid-outline" size={32} color="#34C759" />
              <Text style={[styles.exportLabel, { color: textColor }]}>Excel</Text>
            </Pressable>
            <Pressable
              style={[styles.exportButton, { backgroundColor: cardColor }]}
              onPress={() => handleExport('csv')}
              disabled={exporting}
            >
              <Ionicons name="document-outline" size={32} color="#007AFF" />
              <Text style={[styles.exportLabel, { color: textColor }]}>CSV</Text>
            </Pressable>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  content: {
    padding: 20,
    gap: 24,
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  grid2: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  budgetCard: {
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  budgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  budgetTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  budgetStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budgetStat: {
    gap: 4,
  },
  budgetLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  budgetValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  statusCard: {
    flex: 1,
    aspectRatio: 1.2,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  statusValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  tasksList: {
    gap: 12,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
  },
  priorityIndicator: {
    width: 4,
    height: 48,
    borderRadius: 2,
  },
  taskInfo: {
    flex: 1,
    gap: 4,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  taskProject: {
    fontSize: 12,
    fontWeight: '500',
  },
  taskFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  taskDate: {
    fontSize: 11,
    fontWeight: '500',
  },
  exportGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  exportButton: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  exportLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
});
