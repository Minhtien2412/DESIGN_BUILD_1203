/**
 * Construction Reports - Demo with Charts
 * Báo cáo với biểu đồ hiện đại
 */

import { BarChart, DonutChart, LineChart, MetricCard } from '@/components/construction';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ReportsScreen() {
  const { id: projectId } = useLocalSearchParams<{ id: string }>();

  // Mock data for charts
  const progressData = [
    { label: 'T1', value: 15 },
    { label: 'T2', value: 28 },
    { label: 'T3', value: 42 },
    { label: 'T4', value: 55 },
    { label: 'T5', value: 68 },
    { label: 'T6', value: 75 },
  ];

  const budgetData = [
    { label: 'Vật liệu', value: 2400, color: '#3b82f6' },
    { label: 'Nhân công', value: 1800, color: '#10b981' },
    { label: 'Thiết bị', value: 1200, color: '#f59e0b' },
    { label: 'Khác', value: 600, color: '#6b7280' },
  ];

  const categoryData = [
    { label: 'Hoàn thành', value: 45, color: '#10b981' },
    { label: 'Đang làm', value: 30, color: '#3b82f6' },
    { label: 'Chậm tiến độ', value: 15, color: '#f59e0b' },
    { label: 'Chưa bắt đầu', value: 10, color: '#9ca3af' },
  ];

  const workforceData = [
    { label: 'T2', value: 45 },
    { label: 'T3', value: 52 },
    { label: 'T4', value: 48 },
    { label: 'T5', value: 60 },
    { label: 'T6', value: 55 },
    { label: 'T7', value: 58 },
    { label: 'CN', value: 30 },
  ];

  return (
    <Container fullWidth>
      <StatusBar style="dark" />
      
      {/* Header */}
      <Section>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <Text style={styles.title}>Báo cáo dự án</Text>
            <Text style={styles.subtitle}>Tổng quan & phân tích</Text>
          </View>
          <TouchableOpacity style={styles.exportButton}>
            <Ionicons name="download-outline" size={20} color="#3b82f6" />
          </TouchableOpacity>
        </View>
      </Section>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* KPI Cards */}
        <Section>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.metricsRow}>
            <MetricCard
              icon="speedometer"
              label="Tiến độ"
              value="75%"
              subtitle="Đúng kế hoạch"
              trend="up"
              trendValue="+5%"
              gradientColors={['#10b981', '#059669']}
              style={styles.metricCard}
            />
            <MetricCard
              icon="cash"
              label="Ngân sách"
              value="6.0B"
              subtitle="VNĐ đã chi"
              trend="up"
              trendValue="+12%"
              gradientColors={['#3b82f6', '#2563eb']}
              style={styles.metricCard}
            />
            <MetricCard
              icon="people"
              label="Nhân công"
              value="52"
              subtitle="người/ngày"
              trend="down"
              trendValue="-3%"
              gradientColors={['#f59e0b', '#d97706']}
              style={styles.metricCard}
            />
            <MetricCard
              icon="checkmark-done"
              label="QC Đạt"
              value="92%"
              subtitle="kiểm tra"
              trend="up"
              trendValue="+4%"
              gradientColors={['#8b5cf6', '#7c3aed']}
              style={styles.metricCard}
            />
          </ScrollView>
        </Section>

        {/* Progress Timeline */}
        <Section>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Tiến độ theo tháng</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>Chi tiết</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.chartCard}>
            <LineChart
              data={progressData}
              height={200}
              lineColor="#10b981"
              gradientColors={['#10b981', '#dcfce7']}
            />
          </View>
        </Section>

        {/* Budget Breakdown */}
        <Section>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Phân bổ ngân sách</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.chartCard}>
            <BarChart
              data={budgetData}
              height={220}
              showValues={true}
            />
          </View>
        </Section>

        {/* Task Status */}
        <Section>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Trạng thái công việc</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>Chi tiết</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.chartCard}>
            <DonutChart
              data={categoryData}
              size={220}
              thickness={35}
              centerText="100"
              centerSubtext="công việc"
            />
          </View>
        </Section>

        {/* Workforce Trend */}
        <Section>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Nhân công tuần này</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>Lịch sử</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.chartCard}>
            <BarChart
              data={workforceData.map(d => ({ ...d, color: '#3b82f6' }))}
              height={200}
              showValues={true}
            />
          </View>
        </Section>

        {/* Summary Stats */}
        <Section>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Ionicons name="calendar" size={20} color="#6b7280" />
                <Text style={styles.summaryLabel}>Ngày bắt đầu</Text>
                <Text style={styles.summaryValue}>01/01/2024</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Ionicons name="flag" size={20} color="#6b7280" />
                <Text style={styles.summaryLabel}>Dự kiến hoàn thành</Text>
                <Text style={styles.summaryValue}>31/12/2024</Text>
              </View>
            </View>
            
            <View style={[styles.summaryRow, { marginTop: 16 }]}>
              <View style={styles.summaryItem}>
                <Ionicons name="document-text" size={20} color="#6b7280" />
                <Text style={styles.summaryLabel}>Tổng công việc</Text>
                <Text style={styles.summaryValue}>100</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Ionicons name="checkmark-circle" size={20} color="#6b7280" />
                <Text style={styles.summaryLabel}>Đã hoàn thành</Text>
                <Text style={styles.summaryValue}>45</Text>
              </View>
            </View>
          </View>
        </Section>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  exportButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricsRow: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  metricCard: {
    width: 180,
    marginRight: 12,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  viewAll: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3b82f6',
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 16,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginTop: 4,
  },
});
