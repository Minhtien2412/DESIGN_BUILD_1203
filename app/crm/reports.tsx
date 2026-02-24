/**
 * Reports Screen - Perfex CRM Style
 * ==================================
 * 
 * Báo cáo tổng hợp dự án:
 * - Revenue charts
 * - Task completion rates
 * - Time tracking summary
 * - Export options
 */

import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ReportSection {
  id: string;
  title: string;
  icon: string;
  color: string;
}

const REPORT_SECTIONS: ReportSection[] = [
  { id: 'overview', title: 'Tổng quan', icon: 'analytics', color: '#0D9488' },
  { id: 'tasks', title: 'Công việc', icon: 'checkbox', color: '#22c55e' },
  { id: 'time', title: 'Thời gian', icon: 'time', color: '#f59e0b' },
  { id: 'finance', title: 'Tài chính', icon: 'wallet', color: '#8b5cf6' },
];

export default function ReportsScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const [activeSection, setActiveSection] = useState('overview');
  const [dateRange, setDateRange] = useState('month'); // week, month, quarter, year

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const cardBg = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');

  // Mock data với dữ liệu thực từ Perfex CRM
  // Projects: Nhà Anh Khương Q9 (15 tỷ), Biệt Thự 3 Tầng Anh Tiến Q7 (10 tỷ)
  // Customers: Anh Khương Q9, NHÀ XINH, Anh Tiến, Lê Nguyên Thảo
  // Invoice: INV-000001, 305 triệu VND, status: unpaid
  const overviewData = {
    totalProjects: 2, // 2 dự án thực từ CRM
    activeProjects: 1, // Biệt thự Anh Tiến đang thực hiện (status: 2)
    completedProjects: 0,
    delayedProjects: 0,
    totalRevenue: 25000000000, // Tổng giá trị: 15 tỷ + 10 tỷ
    totalExpenses: 3055000000, // Ước tính 12.2% 
    profit: 21945000000,
    profitMargin: 87.8,
  };

  const taskData = {
    total: 5, // 5 tasks mẫu
    completed: 1,
    inProgress: 1,
    notStarted: 3,
    overdue: 0,
    completionRate: 20,
    avgCompletionTime: 4, // days
    productivityTrend: [40, 50, 45, 55, 60, 65, 70],
  };

  const timeData = {
    totalHours: 240,
    billableHours: 200,
    nonBillableHours: 40,
    billableRate: 83,
    avgHoursPerDay: 8,
    mostProductiveDay: 'Thứ Ba',
    timeByProject: [
      { name: 'Nhà Anh Khương Q9', hours: 120 },
      { name: 'Biệt Thự Anh Tiến Q7', hours: 100 },
      { name: 'Tư vấn NHÀ XINH', hours: 20 },
    ],
  };

  const financeData = {
    totalInvoiced: 3105000000, // Tổng invoice: 305M + 1.65B + 1.1B + 50M
    totalPaid: 2775000000, // Đã thanh toán: 1.65B + 1.1B + 25M
    totalPending: 330000000, // Chờ thanh toán: 305M + 25M
    totalOverdue: 0,
    collectionRate: 89,
    monthlyRevenue: [1000, 1200, 1500, 2000, 2500, 3000, 3100],
  };

  const formatCurrency = (value: number): string => {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return String(value);
  };

  const renderProgressBar = (value: number, color: string) => (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBar, { width: `${value}%`, backgroundColor: color }]} />
    </View>
  );

  const renderBarChart = (data: number[], color: string) => {
    const max = Math.max(...data);
    return (
      <View style={styles.barChart}>
        {data.map((value, index) => (
          <View key={index} style={styles.barContainer}>
            <View
              style={[
                styles.bar,
                {
                  height: `${(value / max) * 100}%`,
                  backgroundColor: color,
                },
              ]}
            />
            <Text style={[styles.barLabel, { color: textColor }]}>
              {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'][index]}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderOverviewSection = () => (
    <View style={styles.sectionContent}>
      {/* Project Stats */}
      <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
        <Text style={[styles.cardTitle, { color: textColor }]}>Trạng thái dự án</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#0D9488' }]}>{overviewData.totalProjects}</Text>
            <Text style={[styles.statLabel, { color: textColor }]}>Tổng dự án</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#22c55e' }]}>{overviewData.activeProjects}</Text>
            <Text style={[styles.statLabel, { color: textColor }]}>Đang hoạt động</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#8b5cf6' }]}>{overviewData.completedProjects}</Text>
            <Text style={[styles.statLabel, { color: textColor }]}>Hoàn thành</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#ef4444' }]}>{overviewData.delayedProjects}</Text>
            <Text style={[styles.statLabel, { color: textColor }]}>Trễ hạn</Text>
          </View>
        </View>
      </View>

      {/* Finance Overview */}
      <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
        <Text style={[styles.cardTitle, { color: textColor }]}>Tổng quan tài chính</Text>
        <View style={styles.financeRow}>
          <View style={styles.financeItem}>
            <Ionicons name="trending-up" size={24} color="#22c55e" />
            <Text style={[styles.financeValue, { color: textColor }]}>
              {formatCurrency(overviewData.totalRevenue)}đ
            </Text>
            <Text style={[styles.financeLabel, { color: textColor }]}>Doanh thu</Text>
          </View>
          <View style={styles.financeItem}>
            <Ionicons name="trending-down" size={24} color="#ef4444" />
            <Text style={[styles.financeValue, { color: textColor }]}>
              {formatCurrency(overviewData.totalExpenses)}đ
            </Text>
            <Text style={[styles.financeLabel, { color: textColor }]}>Chi phí</Text>
          </View>
          <View style={styles.financeItem}>
            <Ionicons name="wallet" size={24} color="#8b5cf6" />
            <Text style={[styles.financeValue, { color: textColor }]}>
              {formatCurrency(overviewData.profit)}đ
            </Text>
            <Text style={[styles.financeLabel, { color: textColor }]}>Lợi nhuận</Text>
          </View>
        </View>
        <View style={styles.profitMarginRow}>
          <Text style={[styles.profitMarginLabel, { color: textColor }]}>
            Biên lợi nhuận: {overviewData.profitMargin}%
          </Text>
          {renderProgressBar(overviewData.profitMargin, '#8b5cf6')}
        </View>
      </View>
    </View>
  );

  const renderTasksSection = () => (
    <View style={styles.sectionContent}>
      {/* Task Summary */}
      <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
        <Text style={[styles.cardTitle, { color: textColor }]}>Tổng hợp công việc</Text>
        <View style={styles.taskStats}>
          <View style={styles.taskStatItem}>
            <Text style={[styles.taskStatNumber, { color: '#22c55e' }]}>{taskData.completed}</Text>
            <Text style={[styles.taskStatLabel, { color: textColor }]}>Hoàn thành</Text>
          </View>
          <View style={styles.taskStatItem}>
            <Text style={[styles.taskStatNumber, { color: '#0D9488' }]}>{taskData.inProgress}</Text>
            <Text style={[styles.taskStatLabel, { color: textColor }]}>Đang làm</Text>
          </View>
          <View style={styles.taskStatItem}>
            <Text style={[styles.taskStatNumber, { color: '#6b7280' }]}>{taskData.notStarted}</Text>
            <Text style={[styles.taskStatLabel, { color: textColor }]}>Chưa bắt đầu</Text>
          </View>
          <View style={styles.taskStatItem}>
            <Text style={[styles.taskStatNumber, { color: '#ef4444' }]}>{taskData.overdue}</Text>
            <Text style={[styles.taskStatLabel, { color: textColor }]}>Quá hạn</Text>
          </View>
        </View>
      </View>

      {/* Completion Rate */}
      <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
        <Text style={[styles.cardTitle, { color: textColor }]}>Tỷ lệ hoàn thành</Text>
        <View style={styles.completionRateContainer}>
          <View style={styles.circleProgress}>
            <Text style={[styles.circleValue, { color: '#22c55e' }]}>{taskData.completionRate}%</Text>
          </View>
          <View style={styles.completionDetails}>
            <Text style={[styles.completionText, { color: textColor }]}>
              {taskData.completed} / {taskData.total} công việc
            </Text>
            <Text style={[styles.completionSubtext, { color: textColor }]}>
              Thời gian hoàn thành TB: {taskData.avgCompletionTime} ngày
            </Text>
          </View>
        </View>
      </View>

      {/* Productivity Trend */}
      <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
        <Text style={[styles.cardTitle, { color: textColor }]}>Xu hướng năng suất</Text>
        {renderBarChart(taskData.productivityTrend, '#22c55e')}
      </View>
    </View>
  );

  const renderTimeSection = () => (
    <View style={styles.sectionContent}>
      {/* Time Summary */}
      <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
        <Text style={[styles.cardTitle, { color: textColor }]}>Tổng hợp thời gian</Text>
        <View style={styles.timeSummary}>
          <View style={styles.timeStat}>
            <Ionicons name="time" size={32} color="#0D9488" />
            <Text style={[styles.timeValue, { color: textColor }]}>{timeData.totalHours}h</Text>
            <Text style={[styles.timeLabel, { color: textColor }]}>Tổng giờ</Text>
          </View>
          <View style={styles.timeStat}>
            <Ionicons name="cash" size={32} color="#22c55e" />
            <Text style={[styles.timeValue, { color: textColor }]}>{timeData.billableHours}h</Text>
            <Text style={[styles.timeLabel, { color: textColor }]}>Tính phí</Text>
          </View>
          <View style={styles.timeStat}>
            <Ionicons name="remove-circle" size={32} color="#6b7280" />
            <Text style={[styles.timeValue, { color: textColor }]}>{timeData.nonBillableHours}h</Text>
            <Text style={[styles.timeLabel, { color: textColor }]}>Không tính</Text>
          </View>
        </View>
      </View>

      {/* Time by Project */}
      <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
        <Text style={[styles.cardTitle, { color: textColor }]}>Thời gian theo dự án</Text>
        {timeData.timeByProject.map((project, index) => (
          <View key={index} style={styles.projectTimeRow}>
            <Text style={[styles.projectName, { color: textColor }]} numberOfLines={1}>
              {project.name}
            </Text>
            <View style={styles.projectTimeBar}>
              <View
                style={[
                  styles.projectTimeProgress,
                  {
                    width: `${(project.hours / timeData.totalHours) * 100}%`,
                    backgroundColor: ['#0D9488', '#22c55e', '#f59e0b', '#8b5cf6', '#6b7280'][index],
                  },
                ]}
              />
            </View>
            <Text style={[styles.projectHours, { color: textColor }]}>{project.hours}h</Text>
          </View>
        ))}
      </View>

      {/* Productivity Info */}
      <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
        <View style={styles.infoRow}>
          <Ionicons name="calendar" size={20} color={primaryColor} />
          <Text style={[styles.infoText, { color: textColor }]}>
            Ngày năng suất nhất: <Text style={styles.infoBold}>{timeData.mostProductiveDay}</Text>
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="hourglass" size={20} color={primaryColor} />
          <Text style={[styles.infoText, { color: textColor }]}>
            Trung bình mỗi ngày: <Text style={styles.infoBold}>{timeData.avgHoursPerDay}h</Text>
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="checkmark-circle" size={20} color={primaryColor} />
          <Text style={[styles.infoText, { color: textColor }]}>
            Tỷ lệ tính phí: <Text style={styles.infoBold}>{timeData.billableRate}%</Text>
          </Text>
        </View>
      </View>
    </View>
  );

  const renderFinanceSection = () => (
    <View style={styles.sectionContent}>
      {/* Invoice Summary */}
      <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
        <Text style={[styles.cardTitle, { color: textColor }]}>Hóa đơn</Text>
        <View style={styles.invoiceSummary}>
          <View style={[styles.invoiceItem, { backgroundColor: '#22c55e20' }]}>
            <Text style={[styles.invoiceValue, { color: '#22c55e' }]}>
              {formatCurrency(financeData.totalPaid)}đ
            </Text>
            <Text style={[styles.invoiceLabel, { color: textColor }]}>Đã thanh toán</Text>
          </View>
          <View style={[styles.invoiceItem, { backgroundColor: '#f59e0b20' }]}>
            <Text style={[styles.invoiceValue, { color: '#f59e0b' }]}>
              {formatCurrency(financeData.totalPending)}đ
            </Text>
            <Text style={[styles.invoiceLabel, { color: textColor }]}>Chờ thanh toán</Text>
          </View>
          <View style={[styles.invoiceItem, { backgroundColor: '#ef444420' }]}>
            <Text style={[styles.invoiceValue, { color: '#ef4444' }]}>
              {formatCurrency(financeData.totalOverdue)}đ
            </Text>
            <Text style={[styles.invoiceLabel, { color: textColor }]}>Quá hạn</Text>
          </View>
        </View>
      </View>

      {/* Collection Rate */}
      <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
        <View style={styles.collectionHeader}>
          <Text style={[styles.cardTitle, { color: textColor }]}>Tỷ lệ thu hồi</Text>
          <Text style={[styles.collectionValue, { color: '#22c55e' }]}>{financeData.collectionRate}%</Text>
        </View>
        {renderProgressBar(financeData.collectionRate, '#22c55e')}
      </View>

      {/* Monthly Revenue */}
      <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
        <Text style={[styles.cardTitle, { color: textColor }]}>Doanh thu theo tuần</Text>
        {renderBarChart(financeData.monthlyRevenue, '#0D9488')}
      </View>
    </View>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'overview': return renderOverviewSection();
      case 'tasks': return renderTasksSection();
      case 'time': return renderTimeSection();
      case 'finance': return renderFinanceSection();
      default: return renderOverviewSection();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Báo cáo</Text>
        <TouchableOpacity style={styles.exportButton}>
          <Ionicons name="share-outline" size={24} color={textColor} />
        </TouchableOpacity>
      </View>

      {/* Section Tabs */}
      <View style={[styles.tabBar, { borderBottomColor: borderColor }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {REPORT_SECTIONS.map((section) => (
            <TouchableOpacity
              key={section.id}
              style={[
                styles.tab,
                activeSection === section.id && { borderBottomColor: section.color, borderBottomWidth: 2 },
              ]}
              onPress={() => setActiveSection(section.id)}
            >
              <Ionicons
                name={section.icon as any}
                size={20}
                color={activeSection === section.id ? section.color : '#6b7280'}
              />
              <Text
                style={[
                  styles.tabText,
                  { color: activeSection === section.id ? section.color : textColor },
                ]}
              >
                {section.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Date Range Filter */}
      <View style={[styles.dateFilter, { backgroundColor: cardBg, borderBottomColor: borderColor }]}>
        {['week', 'month', 'quarter', 'year'].map((range) => (
          <TouchableOpacity
            key={range}
            style={[
              styles.dateChip,
              { borderColor },
              dateRange === range && { backgroundColor: primaryColor, borderColor: primaryColor },
            ]}
            onPress={() => setDateRange(range)}
          >
            <Text
              style={[
                styles.dateChipText,
                { color: dateRange === range ? '#fff' : textColor },
              ]}
            >
              {range === 'week' ? 'Tuần' : range === 'month' ? 'Tháng' : range === 'quarter' ? 'Quý' : 'Năm'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
  },
  exportButton: {
    padding: 4,
  },
  tabBar: {
    borderBottomWidth: 1,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 6,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
  },
  dateFilter: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
  },
  dateChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  dateChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  sectionContent: {
    padding: 16,
    gap: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statBox: {
    width: '50%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
  financeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  financeItem: {
    alignItems: 'center',
    gap: 4,
  },
  financeValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  financeLabel: {
    fontSize: 11,
    opacity: 0.7,
  },
  profitMarginRow: {
    gap: 8,
  },
  profitMarginLabel: {
    fontSize: 12,
    opacity: 0.8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  taskStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  taskStatItem: {
    alignItems: 'center',
  },
  taskStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  taskStatLabel: {
    fontSize: 11,
    marginTop: 2,
    opacity: 0.7,
  },
  completionRateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  circleProgress: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 6,
    borderColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  completionDetails: {
    flex: 1,
    gap: 4,
  },
  completionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  completionSubtext: {
    fontSize: 12,
    opacity: 0.7,
  },
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: 24,
    borderRadius: 4,
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 10,
    opacity: 0.6,
  },
  timeSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  timeStat: {
    alignItems: 'center',
    gap: 4,
  },
  timeValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  timeLabel: {
    fontSize: 11,
    opacity: 0.7,
  },
  projectTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  projectName: {
    width: 80,
    fontSize: 12,
  },
  projectTimeBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  projectTimeProgress: {
    height: '100%',
    borderRadius: 4,
  },
  projectHours: {
    width: 40,
    fontSize: 12,
    textAlign: 'right',
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  infoText: {
    fontSize: 13,
  },
  infoBold: {
    fontWeight: '600',
  },
  invoiceSummary: {
    gap: 12,
  },
  invoiceItem: {
    padding: 16,
    borderRadius: 10,
  },
  invoiceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  invoiceLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  collectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  collectionValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
