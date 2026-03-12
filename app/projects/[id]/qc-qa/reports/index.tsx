import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ReportsIndexScreen() {
  const { id: projectId } = useLocalSearchParams<{ id: string }>();

  const reports = [
    {
      id: 'compliance',
      title: 'Báo cáo Tuân thủ',
      description: 'Báo cáo chi tiết về mức độ tuân thủ các tiêu chuẩn QC/QA',
      icon: 'document-text',
      color: '#0D9488',
      route: `/projects/${projectId}/qc-qa/reports/compliance`,
    },
    {
      id: 'quality-metrics',
      title: 'Chỉ số Chất lượng',
      description: 'Biểu đồ và thống kê về chất lượng công trình',
      icon: 'stats-chart',
      color: '#0D9488',
      route: `/projects/${projectId}/qc-qa/reports/quality-metrics`,
    },
    {
      id: 'defects-summary',
      title: 'Tổng hợp Lỗi',
      description: 'Báo cáo tổng hợp về các lỗi đã phát hiện và xử lý',
      icon: 'alert-circle',
      color: '#000000',
      route: `/projects/${projectId}/qc-qa/reports/defects-summary`,
    },
    {
      id: 'inspection-history',
      title: 'Lịch sử Kiểm tra',
      description: 'Lịch sử tất cả các checklist và inspection',
      icon: 'time',
      color: '#0D9488',
      route: `/projects/${projectId}/qc-qa/reports/inspection-history`,
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Báo cáo & Thống kê QC/QA</Text>
          <Text style={styles.headerSubtitle}>
            Xem các báo cáo chi tiết về chất lượng và tiến độ kiểm tra
          </Text>
        </View>

        <View style={styles.reportsList}>
          {reports.map((report) => (
            <TouchableOpacity
              key={report.id}
              style={styles.reportCard}
              onPress={() => router.push(report.route as any)}
            >
              <View style={[styles.reportIcon, { backgroundColor: report.color }]}>
                <Ionicons name={report.icon as any} size={32} color="#fff" />
              </View>
              <View style={styles.reportContent}>
                <Text style={styles.reportTitle}>{report.title}</Text>
                <Text style={styles.reportDescription}>{report.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#999" />
            </TouchableOpacity>
          ))}
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
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  reportsList: {
    padding: 16,
  },
  reportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  reportContent: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  reportDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
});
