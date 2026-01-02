import { useChecklists, useDefects } from '@/hooks/useQC';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function QCQAIndexScreen() {
  const { id: projectId } = useLocalSearchParams<{ id: string }>();
  const { checklists, loadChecklists } = useChecklists();
  const { defects, loadDefects } = useDefects();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadChecklists({ projectId });
      loadDefects({ projectId });
    }
  }, [projectId, loadChecklists, loadDefects]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (projectId) {
      await Promise.all([loadChecklists({ projectId }), loadDefects({ projectId })]);
    }
    setRefreshing(false);
  };

  // Calculate statistics
  const checklistStats = {
    total: checklists.length,
    draft: checklists.filter((c) => c.status === 'DRAFT').length,
    inProgress: checklists.filter((c) => c.status === 'IN_PROGRESS').length,
    approved: checklists.filter((c) => c.status === 'APPROVED').length,
    completed: checklists.filter((c) => c.status === 'COMPLETED').length,
  };

  const defectStats = {
    total: defects.length,
    open: defects.filter((d) => d.status === 'OPEN').length,
    inProgress: defects.filter((d) => d.status === 'IN_PROGRESS').length,
    critical: defects.filter((d) => d.severity === 'CRITICAL').length,
    resolved: defects.filter((d) => d.status === 'RESOLVED').length,
  };

  const checklistTypes = [
    { type: 'FOUNDATION', name: 'Móng', icon: 'construct', color: '#795548' },
    { type: 'STRUCTURE', name: 'Kết cấu', icon: 'business', color: '#1A1A1A' },
    { type: 'MEP', name: 'M&E', icon: 'flash', color: '#FF9800' },
    { type: 'FINISHING', name: 'Hoàn thiện', icon: 'color-palette', color: '#2196F3' },
    { type: 'LANDSCAPE', name: 'Cảnh quan', icon: 'leaf', color: '#4CAF50' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header Stats */}
        <View style={styles.headerStats}>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={32} color="#4CAF50" />
            <Text style={styles.statNumber}>{checklistStats.approved}</Text>
            <Text style={styles.statLabel}>Checklists đã duyệt</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="alert-circle" size={32} color="#F44336" />
            <Text style={styles.statNumber}>{defectStats.open}</Text>
            <Text style={styles.statLabel}>Lỗi chưa xử lý</Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tổng quan QC/QA</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.miniStatCard, { backgroundColor: '#E3F2FD' }]}>
              <Text style={[styles.miniStatNumber, { color: '#2196F3' }]}>
                {checklistStats.total}
              </Text>
              <Text style={styles.miniStatLabel}>Tổng Checklists</Text>
            </View>
            <View style={[styles.miniStatCard, { backgroundColor: '#FFF3E0' }]}>
              <Text style={[styles.miniStatNumber, { color: '#FF9800' }]}>
                {checklistStats.inProgress}
              </Text>
              <Text style={styles.miniStatLabel}>Đang thực hiện</Text>
            </View>
            <View style={[styles.miniStatCard, { backgroundColor: '#FFEBEE' }]}>
              <Text style={[styles.miniStatNumber, { color: '#F44336' }]}>
                {defectStats.total}
              </Text>
              <Text style={styles.miniStatLabel}>Tổng lỗi</Text>
            </View>
            <View style={[styles.miniStatCard, { backgroundColor: '#FCE4EC' }]}>
              <Text style={[styles.miniStatNumber, { color: '#D32F2F' }]}>
                {defectStats.critical}
              </Text>
              <Text style={styles.miniStatLabel}>Lỗi nghiêm trọng</Text>
            </View>
          </View>
        </View>

        {/* Inspection Checklists */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Checklists Kiểm Tra</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.checklistGrid}>
            {checklistTypes.map((type) => (
              <TouchableOpacity
                key={type.type}
                style={styles.checklistCard}
                onPress={() =>
                  router.push(
                    `/projects/${projectId}/qc-qa/checklist/${type.type.toLowerCase()}`
                  )
                }
              >
                <View style={[styles.checklistIcon, { backgroundColor: type.color }]}>
                  <Ionicons name={type.icon as any} size={28} color="#fff" />
                </View>
                <Text style={styles.checklistName}>{type.name}</Text>
                <Text style={styles.checklistCount}>
                  {checklists.filter((c) => c.type === type.type).length} checklist
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Defect Management */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quản lý Lỗi</Text>
            <TouchableOpacity
              onPress={() => router.push(`/projects/${projectId}/qc-qa/defects/list`)}
            >
              <Text style={styles.viewAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.defectSummary}>
            <TouchableOpacity
              style={styles.defectSummaryCard}
              onPress={() => router.push(`/projects/${projectId}/qc-qa/defects/list`)}
            >
              <View style={styles.defectSummaryHeader}>
                <Ionicons name="warning" size={24} color="#F44336" />
                <Text style={styles.defectSummaryTitle}>Lỗi cần xử lý</Text>
              </View>
              <Text style={styles.defectSummaryNumber}>
                {defectStats.open + defectStats.inProgress}
              </Text>
              <View style={styles.defectSummaryFooter}>
                <Text style={styles.defectSummaryDetail}>
                  {defectStats.open} mới • {defectStats.inProgress} đang xử lý
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.defectSummaryCard}
              onPress={() => router.push(`/projects/${projectId}/qc-qa/defects/create`)}
            >
              <View style={styles.defectSummaryHeader}>
                <Ionicons name="add-circle" size={24} color="#2196F3" />
                <Text style={styles.defectSummaryTitle}>Báo cáo lỗi</Text>
              </View>
              <Text style={[styles.defectSummaryNumber, { color: '#2196F3' }]}>+</Text>
              <View style={styles.defectSummaryFooter}>
                <Text style={styles.defectSummaryDetail}>Thêm lỗi mới</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Recent Defects */}
          {defects.length > 0 && (
            <View style={styles.recentDefects}>
              <Text style={styles.subsectionTitle}>Lỗi gần đây</Text>
              {defects.slice(0, 3).map((defect) => (
                <TouchableOpacity
                  key={defect.id}
                  style={styles.defectItem}
                  onPress={() =>
                    router.push(`/projects/${projectId}/qc-qa/defects/${defect.id}`)
                  }
                >
                  <View style={styles.defectItemHeader}>
                    <View
                      style={[
                        styles.severityDot,
                        {
                          backgroundColor:
                            defect.severity === 'CRITICAL'
                              ? '#D32F2F'
                              : defect.severity === 'MAJOR'
                              ? '#F57C00'
                              : defect.severity === 'MINOR'
                              ? '#FBC02D'
                              : '#689F38',
                        },
                      ]}
                    />
                    <Text style={styles.defectItemTitle} numberOfLines={1}>
                      {defect.title}
                    </Text>
                  </View>
                  <Text style={styles.defectItemLocation}>{defect.location}</Text>
                  <Text style={styles.defectItemDate}>
                    {new Date(defect.reportedAt).toLocaleDateString('vi-VN')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Báo cáo & Thống kê</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() =>
                router.push(`/projects/${projectId}/qc-qa/reports/compliance`)
              }
            >
              <Ionicons name="document-text" size={32} color="#2196F3" />
              <Text style={styles.actionCardText}>Báo cáo tuân thủ</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() =>
                router.push(`/projects/${projectId}/qc-qa/reports/quality-metrics`)
              }
            >
              <Ionicons name="stats-chart" size={32} color="#4CAF50" />
              <Text style={styles.actionCardText}>Chỉ số chất lượng</Text>
            </TouchableOpacity>
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
  headerStats: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  subsectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  miniStatCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  miniStatNumber: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  miniStatLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  checklistGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  checklistCard: {
    width: '31%',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  checklistIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  checklistName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  checklistCount: {
    fontSize: 11,
    color: '#999',
  },
  defectSummary: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  defectSummaryCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  defectSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  defectSummaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  defectSummaryNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#F44336',
    marginBottom: 8,
  },
  defectSummaryFooter: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 8,
  },
  defectSummaryDetail: {
    fontSize: 12,
    color: '#666',
  },
  recentDefects: {
    marginTop: 8,
  },
  defectItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#F44336',
  },
  defectItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  defectItemTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  defectItemLocation: {
    fontSize: 12,
    color: '#666',
    marginLeft: 16,
    marginBottom: 2,
  },
  defectItemDate: {
    fontSize: 11,
    color: '#999',
    marginLeft: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  actionCardText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
});
