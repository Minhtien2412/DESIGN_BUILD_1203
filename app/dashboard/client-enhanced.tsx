/**
 * Enhanced Client Dashboard  
 * Project tracking, payments, timeline, support
 */

import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { QuickAction } from '@/components/dashboard/QuickAction';
import { SimpleChart } from '@/components/dashboard/SimpleChart';
import { StatisticCard } from '@/components/dashboard/StatisticCard';
import { Colors } from '@/constants/theme';
import { getClientDashboard } from '@/services/dashboardApi';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// Mock data
const mockClientDashboard = {
  projects: { active: 2, planning: 1, completed: 3 },
  payments: { total: 1500000000, paid: 900000000, pending: 600000000 },
  milestones: { total: 12, completed: 7, upcoming: 2 },
  support: { tickets: 1, avgResponseTime: '2h' },
};

const mockActivities = [
  {
    id: '1',
    type: 'payment' as const,
    title: 'Thanh toán thành công',
    description: 'Giai đoạn 2 - 300,000,000 VNĐ',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    type: 'project' as const,
    title: 'Tiến độ cập nhật',
    description: 'Dự án Nhà phố đạt 70%',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    type: 'task' as const,
    title: 'Milestone hoàn thành',
    description: 'Hoàn thành móng và cột',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
];

const progressData = [
  { label: 'T1', value: 15 },
  { label: 'T2', value: 30 },
  { label: 'T3', value: 50 },
  { label: 'T4', value: 70 },
];

export default function ClientDashboardEnhanced() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const loadDashboard = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(false);

      const data = await getClientDashboard();
      setDashboard(data);
    } catch (err) {
      console.error('Dashboard error:', err);
      setError(true);
      setDashboard(mockClientDashboard);
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

  const data = dashboard || mockClientDashboard;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {error && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={20} color="#0D9488" />
          <Text style={styles.errorText}>Server không khả dụng - Dùng dữ liệu demo</Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Xin chào!</Text>
          <Text style={styles.subtitle}>Dự án của bạn</Text>
        </View>
        <TouchableOpacity style={styles.supportButton}>
          <Ionicons name="chatbubbles" size={24} color={Colors.light.primary} />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{data.support.tickets}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Statistics Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statRow}>
          <StatisticCard
            title="Dự án"
            value={data.projects.active}
            icon="briefcase"
            gradientColors={['#0D9488', '#0D9488']}
            trend={{ value: `${data.projects.planning} đang lên kế hoạch`, isPositive: true }}
            subtitle="Đang thực hiện"
          />
          <StatisticCard
            title="Tiến độ"
            value={`${Math.round((data.milestones.completed / data.milestones.total) * 100)}%`}
            icon="trending-up"
            gradientColors={['#0D9488', '#0D9488']}
            trend={{ value: `${data.milestones.completed}/${data.milestones.total}`, isPositive: true }}
            subtitle="Milestone"
          />
        </View>
        <View style={styles.statRow}>
          <StatisticCard
            title="Đã thanh toán"
            value={`${(data.payments.paid / 1000000000).toFixed(1)}B`}
            icon="checkmark-circle"
            gradientColors={['#666666', '#666666']}
            trend={{ value: `${Math.round((data.payments.paid / data.payments.total) * 100)}%`, isPositive: true }}
            subtitle="VNĐ"
          />
          <StatisticCard
            title="Còn lại"
            value={`${(data.payments.pending / 1000000000).toFixed(1)}B`}
            icon="hourglass"
            gradientColors={['#0D9488', '#D97706']}
            trend={{ value: 'Theo kế hoạch', isPositive: true }}
            subtitle="VNĐ"
          />
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
        <View style={styles.actionsRow}>
          <QuickAction
            icon="eye"
            label="Xem dự án"
            color={Colors.light.primary}
            onPress={() => console.log('View projects')}
          />
          <QuickAction
            icon="card"
            label="Thanh toán"
            color="#0D9488"
            onPress={() => console.log('Payment')}
          />
          <QuickAction
            icon="calendar"
            label="Lịch hẹn"
            color="#666666"
            onPress={() => console.log('Schedule')}
          />
          <QuickAction
            icon="help-circle"
            label="Hỗ trợ"
            color="#0D9488"
            badge={data.support.tickets}
            onPress={() => console.log('Support')}
          />
        </View>
      </View>

      {/* Progress Chart */}
      <View style={styles.section}>
        <SimpleChart
          data={progressData}
          title="Tiến độ dự án theo tháng"
          color="#0D9488"
        />
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hoạt động gần đây</Text>
        <ActivityFeed activities={mockActivities} maxHeight={300} />
      </View>

      {/* Active Projects */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Dự án đang thực hiện</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllLink}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.projectsList}>
          {[
            {
              name: 'Nhà phố 3 tầng',
              location: 'Quận 1, TP.HCM',
              progress: 70,
              image: 'https://images.unsplash.com/photo-1503174971373-b1f69850bded?w=400',
            },
            {
              name: 'Biệt thự vườn',
              location: 'Quận 2, TP.HCM',
              progress: 45,
              image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
            },
          ].map((project, index) => (
            <TouchableOpacity key={index} style={styles.projectCard}>
              <Image source={{ uri: project.image }} style={styles.projectImage} />
              <View style={styles.projectContent}>
                <Text style={styles.projectName}>{project.name}</Text>
                <Text style={styles.projectLocation}>
                  <Ionicons name="location" size={12} color={Colors.light.textMuted} /> {project.location}
                </Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${project.progress}%` }]} />
                </View>
                <Text style={styles.progressText}>{project.progress}% hoàn thành</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.light.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Payment Schedule */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Lịch thanh toán</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllLink}>Chi tiết</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.paymentList}>
          {[
            { phase: 'Giai đoạn 1', amount: 300000000, status: 'paid', date: '15/10/2025' },
            { phase: 'Giai đoạn 2', amount: 300000000, status: 'paid', date: '20/11/2025' },
            { phase: 'Giai đoạn 3', amount: 300000000, status: 'pending', date: '25/12/2025' },
          ].map((payment, index) => (
            <View key={index} style={styles.paymentItem}>
              <View style={[
                styles.paymentStatus,
                payment.status === 'paid' ? styles.statusPaid : styles.statusPending,
              ]}>
                <Ionicons
                  name={payment.status === 'paid' ? 'checkmark-circle' : 'time'}
                  size={20}
                  color={payment.status === 'paid' ? '#0D9488' : '#0D9488'}
                />
              </View>
              <View style={styles.paymentContent}>
                <Text style={styles.paymentPhase}>{payment.phase}</Text>
                <Text style={styles.paymentDate}>{payment.date}</Text>
              </View>
              <Text style={styles.paymentAmount}>
                {(payment.amount / 1000000).toFixed(0)}M VNĐ
              </Text>
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
  supportButton: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#000000',
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
  projectsList: {
    gap: 12,
  },
  projectCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    gap: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  projectImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  projectContent: {
    flex: 1,
  },
  projectName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
  },
  projectLocation: {
    fontSize: 13,
    color: Colors.light.textMuted,
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.light.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0D9488',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: Colors.light.textMuted,
    fontWeight: '600',
  },
  paymentList: {
    gap: 12,
  },
  paymentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  paymentStatus: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusPaid: {
    backgroundColor: '#D1FAE5',
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  paymentContent: {
    flex: 1,
  },
  paymentPhase: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 2,
  },
  paymentDate: {
    fontSize: 13,
    color: Colors.light.textMuted,
  },
  paymentAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.text,
  },
});
