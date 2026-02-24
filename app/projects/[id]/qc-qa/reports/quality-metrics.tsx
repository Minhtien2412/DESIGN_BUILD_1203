import { useChecklists, useDefects } from '@/hooks/useQC';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

type TimeRange = 'week' | 'month' | 'quarter' | 'year';

export default function QualityMetricsScreen() {
  const { id: projectId } = useLocalSearchParams<{ id: string }>();
  const { checklists, loadChecklists } = useChecklists();
  const { defects, loadDefects } = useDefects();
  const [timeRange, setTimeRange] = useState<TimeRange>('month');

  useEffect(() => {
    if (projectId) {
      loadChecklists({ projectId });
      loadDefects({ projectId });
    }
  }, [projectId, loadChecklists, loadDefects]);

  // Calculate KPIs
  const totalDefects = defects.length;
  const criticalDefects = defects.filter((d) => d.severity === 'CRITICAL').length;
  const resolvedDefects = defects.filter((d) =>
    ['RESOLVED', 'VERIFIED', 'CLOSED'].includes(d.status)
  ).length;
  const criticalRatio = totalDefects > 0 ? (criticalDefects / totalDefects) * 100 : 0;

  // Average resolution time (mock - in days)
  const avgResolutionTime = 3.5;

  // First-time pass rate
  const totalInspections = checklists.length;
  const firstTimePass = checklists.filter((c) => c.status === 'APPROVED').length;
  const firstTimePassRate = totalInspections > 0 ? (firstTimePass / totalInspections) * 100 : 0;

  // Defect trends (mock data for chart visualization)
  const defectTrends = [
    { label: 'T1', value: 12 },
    { label: 'T2', value: 15 },
    { label: 'T3', value: 9 },
    { label: 'T4', value: 7 },
    { label: 'T5', value: 5 },
    { label: 'T6', value: 8 },
  ];

  // Severity distribution
  const severityDistribution = {
    CRITICAL: defects.filter((d) => d.severity === 'CRITICAL').length,
    MAJOR: defects.filter((d) => d.severity === 'MAJOR').length,
    MINOR: defects.filter((d) => d.severity === 'MINOR').length,
    COSMETIC: defects.filter((d) => d.severity === 'COSMETIC').length,
  };

  const maxDefects = Math.max(...defectTrends.map((d) => d.value), 1);

  const timeRanges: { label: string; value: TimeRange }[] = [
    { label: 'Tuần', value: 'week' },
    { label: 'Tháng', value: 'month' },
    { label: 'Quý', value: 'quarter' },
    { label: 'Năm', value: 'year' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Time Range Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Khoảng thời gian:</Text>
          <View style={styles.filterButtons}>
            {timeRanges.map((range) => (
              <TouchableOpacity
                key={range.value}
                style={[
                  styles.filterButton,
                  timeRange === range.value && styles.filterButtonActive,
                ]}
                onPress={() => setTimeRange(range.value)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    timeRange === range.value && styles.filterButtonTextActive,
                  ]}
                >
                  {range.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* KPIs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chỉ số Chất lượng Chính</Text>
          <View style={styles.kpiGrid}>
            <View style={[styles.kpiCard, { borderLeftColor: '#0D9488' }]}>
              <Ionicons name="speedometer" size={28} color="#0D9488" />
              <Text style={styles.kpiValue}>{firstTimePassRate.toFixed(1)}%</Text>
              <Text style={styles.kpiLabel}>Tỷ lệ Pass lần đầu</Text>
            </View>
            <View style={[styles.kpiCard, { borderLeftColor: '#0D9488' }]}>
              <Ionicons name="time" size={28} color="#0D9488" />
              <Text style={styles.kpiValue}>{avgResolutionTime.toFixed(1)} ngày</Text>
              <Text style={styles.kpiLabel}>Thời gian xử lý TB</Text>
            </View>
            <View style={[styles.kpiCard, { borderLeftColor: '#000000' }]}>
              <Ionicons name="alert-circle" size={28} color="#000000" />
              <Text style={styles.kpiValue}>{criticalRatio.toFixed(1)}%</Text>
              <Text style={styles.kpiLabel}>Tỷ lệ lỗi nghiêm trọng</Text>
            </View>
            <View style={[styles.kpiCard, { borderLeftColor: '#0D9488' }]}>
              <Ionicons name="checkmark-done" size={28} color="#0D9488" />
              <Text style={styles.kpiValue}>
                {resolvedDefects}/{totalDefects}
              </Text>
              <Text style={styles.kpiLabel}>Lỗi đã xử lý</Text>
            </View>
          </View>
        </View>

        {/* Defect Trends Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Xu hướng Phát hiện Lỗi</Text>
          <View style={styles.chart}>
            {defectTrends.map((item, index) => {
              const barHeight = (item.value / maxDefects) * 120;
              return (
                <View key={index} style={styles.chartBar}>
                  <Text style={styles.chartValue}>{item.value}</Text>
                  <View
                    style={[
                      styles.chartBarFill,
                      {
                        height: barHeight,
                        backgroundColor:
                          item.value > 10 ? '#000000' : item.value > 5 ? '#0D9488' : '#0D9488',
                      },
                    ]}
                  />
                  <Text style={styles.chartLabel}>{item.label}</Text>
                </View>
              );
            })}
          </View>
          <Text style={styles.chartFootnote}>Số lỗi phát hiện theo tháng</Text>
        </View>

        {/* Severity Distribution */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phân bố theo Mức độ Nghiêm trọng</Text>
          <View style={styles.severityList}>
            {Object.entries(severityDistribution).map(([severity, count]) => {
              const total = totalDefects;
              const percentage = total > 0 ? (count / total) * 100 : 0;
              const severityLabels: Record<string, string> = {
                CRITICAL: 'Nghiêm trọng',
                MAJOR: 'Quan trọng',
                MINOR: 'Nhỏ',
                COSMETIC: 'Thẩm mỹ',
              };
              const severityColors: Record<string, string> = {
                CRITICAL: '#D32F2F',
                MAJOR: '#0D9488',
                MINOR: '#FBC02D',
                COSMETIC: '#689F38',
              };

              return (
                <View key={severity} style={styles.severityItem}>
                  <View style={styles.severityHeader}>
                    <View
                      style={[styles.severityDot, { backgroundColor: severityColors[severity] }]}
                    />
                    <Text style={styles.severityName}>{severityLabels[severity]}</Text>
                    <Text style={styles.severityCount}>
                      {count} ({percentage.toFixed(0)}%)
                    </Text>
                  </View>
                  <View style={styles.severityBar}>
                    <View
                      style={[
                        styles.severityBarFill,
                        { width: `${percentage}%`, backgroundColor: severityColors[severity] },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Checklist Completion Rate */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tỷ lệ Hoàn thành Checklist</Text>
          <View style={styles.completionCard}>
            <View style={styles.completionCircle}>
              <Text style={styles.completionPercentage}>
                {((checklists.filter((c) => c.status === 'APPROVED').length / (checklists.length || 1)) * 100).toFixed(0)}%
              </Text>
              <Text style={styles.completionLabel}>Hoàn thành</Text>
            </View>
            <View style={styles.completionDetails}>
              <View style={styles.completionRow}>
                <View style={[styles.completionDot, { backgroundColor: '#0D9488' }]} />
                <Text style={styles.completionText}>
                  Đã duyệt: {checklists.filter((c) => c.status === 'APPROVED').length}
                </Text>
              </View>
              <View style={styles.completionRow}>
                <View style={[styles.completionDot, { backgroundColor: '#0D9488' }]} />
                <Text style={styles.completionText}>
                  Đang thực hiện: {checklists.filter((c) => c.status === 'IN_PROGRESS').length}
                </Text>
              </View>
              <View style={styles.completionRow}>
                <View style={[styles.completionDot, { backgroundColor: '#999999' }]} />
                <Text style={styles.completionText}>
                  Nháp: {checklists.filter((c) => c.status === 'DRAFT').length}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nhận xét & Khuyến nghị</Text>
          <View style={styles.insightBox}>
            <Ionicons name="bulb" size={24} color="#0D9488" />
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Điểm nổi bật:</Text>
              <Text style={styles.insightText}>
                • Xu hướng giảm số lỗi phát hiện qua các tháng (từ 15 → 8){'\n'}• Tỷ lệ lỗi
                nghiêm trọng chiếm {criticalRatio.toFixed(0)}% - cần giám sát chặt{'\n'}• Thời
                gian xử lý trung bình {avgResolutionTime} ngày - khá tốt
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  filterSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#0D9488',
  },
  filterButtonText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  kpiCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    alignItems: 'center',
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  kpiLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 160,
    paddingTop: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
  },
  chartBar: {
    alignItems: 'center',
    gap: 4,
  },
  chartValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  chartBarFill: {
    width: 30,
    borderRadius: 4,
  },
  chartLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 8,
  },
  chartFootnote: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 12,
  },
  severityList: {
    gap: 16,
  },
  severityItem: {
    gap: 8,
  },
  severityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  severityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  severityName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  severityCount: {
    fontSize: 13,
    color: '#666',
  },
  severityBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  severityBarFill: {
    height: '100%',
  },
  completionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
  },
  completionCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#0D9488',
  },
  completionPercentage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0D9488',
  },
  completionLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
  },
  completionDetails: {
    flex: 1,
    gap: 10,
  },
  completionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  completionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  completionText: {
    fontSize: 13,
    color: '#666',
  },
  insightBox: {
    flexDirection: 'row',
    backgroundColor: '#F0F8FF',
    padding: 16,
    borderRadius: 8,
    gap: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0D9488',
    marginBottom: 8,
  },
  insightText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
});
