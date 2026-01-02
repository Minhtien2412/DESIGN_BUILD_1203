/**
 * Enhanced Engineer Dashboard
 * Task management, project timeline, daily reports
 */

import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { QuickAction } from '@/components/dashboard/QuickAction';
import { SimpleChart } from '@/components/dashboard/SimpleChart';
import { StatisticCard } from '@/components/dashboard/StatisticCard';
import { Colors } from '@/constants/theme';
import { getEngineerDashboard } from '@/services/dashboardApi';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// Mock data
const mockEngineerDashboard = {
  tasks: { total: 24, pending: 8, inProgress: 12, completed: 4 },
  projects: { active: 5, thisWeek: 2 },
  reports: { submitted: 18, pending: 3 },
  safety: { score: 92, incidents: 0 },
};

const mockActivities = [
  {
    id: '1',
    type: 'task' as const,
    title: 'Task hoàn thành',
    description: 'Kiểm tra chất lượng bê tông',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    color: '#10B981',
  },
  {
    id: '2',
    type: 'project' as const,
    title: 'Cập nhật tiến độ',
    description: 'Dự án Nhà phố 3 tầng - 65%',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    type: 'system' as const,
    title: 'Báo cáo đã duyệt',
    description: 'Báo cáo ngày 24/11/2025',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];

const weeklyTasks = [
  { label: 'T2', value: 8 },
  { label: 'T3', value: 12 },
  { label: 'T4', value: 10 },
  { label: 'T5', value: 15 },
  { label: 'T6', value: 14 },
  { label: 'T7', value: 6 },
  { label: 'CN', value: 0 },
];

export default function EngineerDashboardEnhanced() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const loadDashboard = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(false);

      const data = await getEngineerDashboard();
      setDashboard(data);
    } catch (err) {
      console.error('Dashboard error:', err);
      setError(true);
      setDashboard(mockEngineerDashboard);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboard(true);
  };

  if (loading && !dashboard) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  const data = dashboard || mockEngineerDashboard;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {error && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={20} color="#F59E0B" />
          <Text style={styles.errorText}>Server không khả dụng - Dùng dữ liệu demo</Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Xin chào, Kỹ sư!</Text>
          <Text style={styles.subtitle}>Công việc hôm nay</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color={Colors.light.text} />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>5</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Statistics Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statRow}>
          <StatisticCard
            title="Task đang làm"
            value={data.tasks.inProgress}
            icon="build"
            gradientColors={['#3B82F6', '#2563EB']}
            trend={{ value: `${data.tasks.pending} chờ`, isPositive: false }}
            subtitle="Ưu tiên cao"
          />
          <StatisticCard
            title="Dự án"
            value={data.projects.active}
            icon="briefcase"
            gradientColors={['#8B5CF6', '#7C3AED']}
            trend={{ value: `${data.projects.thisWeek} tuần này`, isPositive: true }}
            subtitle="Đang thực hiện"
          />
        </View>
        <View style={styles.statRow}>
          <StatisticCard
            title="Báo cáo"
            value={data.reports.submitted}
            icon="document-text"
            gradientColors={['#10B981', '#059669']}
            trend={{ value: `${data.reports.pending} chờ duyệt`, isPositive: false }}
            subtitle="Đã gửi"
          />
          <StatisticCard
            title="An toàn"
            value={`${data.safety.score}%`}
            icon="shield-checkmark"
            gradientColors={['#F59E0B', '#D97706']}
            trend={{ value: `${data.safety.incidents} sự cố`, isPositive: true }}
            subtitle="Điểm tuân thủ"
          />
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
        <View style={styles.actionsRow}>
          <QuickAction
            icon="add-circle"
            label="Task mới"
            color={Colors.light.primary}
            onPress={() => console.log('New task')}
          />
          <QuickAction
            icon="camera"
            label="Chụp hiện trường"
            color="#10B981"
            onPress={() => console.log('Camera')}
          />
          <QuickAction
            icon="document"
            label="Báo cáo"
            color="#F59E0B"
            onPress={() => console.log('Report')}
          />
          <QuickAction
            icon="warning"
            label="Sự cố"
            color="#EF4444"
            badge={data.safety.incidents}
            onPress={() => console.log('Incidents')}
          />
        </View>
      </View>

      {/* Weekly Task Chart */}
      <View style={styles.section}>
        <SimpleChart
          data={weeklyTasks}
          title="Tasks hoàn thành trong tuần"
          color="#3B82F6"
        />
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hoạt động gần đây</Text>
        <ActivityFeed activities={mockActivities} maxHeight={300} />
      </View>

      {/* Today's Schedule */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Lịch hôm nay</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllLink}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.scheduleList}>
          {[
            { time: '08:00', title: 'Kiểm tra công trình A', location: 'Quận 1' },
            { time: '10:30', title: 'Họp tiến độ dự án B', location: 'Online' },
            { time: '14:00', title: 'Nghiệm thu giai đoạn 2', location: 'Quận 3' },
          ].map((item, index) => (
            <View key={index} style={styles.scheduleItem}>
              <View style={styles.scheduleTime}>
                <Ionicons name="time" size={16} color={Colors.light.primary} />
                <Text style={styles.timeText}>{item.time}</Text>
              </View>
              <View style={styles.scheduleContent}>
                <Text style={styles.scheduleTitle}>{item.title}</Text>
                <Text style={styles.scheduleLocation}>
                  <Ionicons name="location" size={12} color={Colors.light.textMuted} /> {item.location}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.light.textMuted,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 8,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.textMuted,
    marginTop: 2,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  statsGrid: {
    paddingHorizontal: 16,
    gap: 12,
  },
  statRow: {
    flexDirection: 'row',
    gap: 12,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
  seeAllLink: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  scheduleList: {
    gap: 12,
  },
  scheduleItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  scheduleTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingRight: 12,
    borderRightWidth: 2,
    borderRightColor: Colors.light.primary,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.text,
  },
  scheduleContent: {
    flex: 1,
  },
  scheduleTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  scheduleLocation: {
    fontSize: 13,
    color: Colors.light.textMuted,
  },
});
