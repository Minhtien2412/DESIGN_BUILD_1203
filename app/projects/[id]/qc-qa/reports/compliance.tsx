import { useChecklists, useDefects } from '@/hooks/useQC';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ComplianceReportScreen() {
  const { id: projectId } = useLocalSearchParams<{ id: string }>();
  const { checklists, loadChecklists } = useChecklists();
  const { defects, loadDefects } = useDefects();

  useEffect(() => {
    if (projectId) {
      loadChecklists({ projectId });
      loadDefects({ projectId });
    }
  }, [projectId, loadChecklists, loadDefects]);

  // Calculate compliance metrics
  const totalChecklists = checklists.length;
  const approvedChecklists = checklists.filter((c) => c.status === 'APPROVED').length;
  const complianceRate = totalChecklists > 0 ? (approvedChecklists / totalChecklists) * 100 : 0;

  const checklistByType = {
    FOUNDATION: checklists.filter((c) => c.type === 'FOUNDATION'),
    STRUCTURE: checklists.filter((c) => c.type === 'STRUCTURE'),
    MEP: checklists.filter((c) => c.type === 'MEP'),
    FINISHING: checklists.filter((c) => c.type === 'FINISHING'),
    LANDSCAPE: checklists.filter((c) => c.type === 'LANDSCAPE'),
  };

  const defectsByStatus = {
    open: defects.filter((d) => d.status === 'OPEN').length,
    inProgress: defects.filter((d) => d.status === 'IN_PROGRESS').length,
    resolved: defects.filter((d) => d.status === 'RESOLVED').length,
    verified: defects.filter((d) => d.status === 'VERIFIED').length,
    closed: defects.filter((d) => d.status === 'CLOSED').length,
  };

  const handleExportPDF = () => {
    Alert.alert(
      'Xuất PDF',
      'Tính năng xuất PDF sẽ được triển khai trong phiên bản tiếp theo',
      [{ text: 'OK' }]
    );
  };

  const getComplianceColor = (rate: number) => {
    if (rate >= 90) return '#0066CC';
    if (rate >= 70) return '#0066CC';
    return '#000000';
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Overall Compliance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tỷ lệ Tuân thủ Tổng thể</Text>
          <View style={styles.complianceCard}>
            <View style={styles.complianceCircle}>
              <Text
                style={[
                  styles.compliancePercentage,
                  { color: getComplianceColor(complianceRate) },
                ]}
              >
                {complianceRate.toFixed(1)}%
              </Text>
              <Text style={styles.complianceLabel}>Tuân thủ</Text>
            </View>
            <View style={styles.complianceDetails}>
              <View style={styles.complianceDetailRow}>
                <Ionicons name="checkmark-circle" size={20} color="#0066CC" />
                <Text style={styles.complianceDetailText}>
                  {approvedChecklists} / {totalChecklists} checklists đã duyệt
                </Text>
              </View>
              <View style={styles.complianceDetailRow}>
                <Ionicons name="alert-circle" size={20} color="#000000" />
                <Text style={styles.complianceDetailText}>
                  {defects.length} lỗi đã phát hiện
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Checklist Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chi tiết theo Loại Checklist</Text>
          {Object.entries(checklistByType).map(([type, items]) => {
            const approved = items.filter((i) => i.status === 'APPROVED').length;
            const total = items.length;
            const rate = total > 0 ? (approved / total) * 100 : 0;
            const typeNames: Record<string, string> = {
              FOUNDATION: 'Móng',
              STRUCTURE: 'Kết cấu',
              MEP: 'M&E',
              FINISHING: 'Hoàn thiện',
              LANDSCAPE: 'Cảnh quan',
            };

            return (
              <View key={type} style={styles.checklistTypeCard}>
                <View style={styles.checklistTypeHeader}>
                  <Text style={styles.checklistTypeName}>{typeNames[type]}</Text>
                  <Text style={[styles.checklistTypeRate, { color: getComplianceColor(rate) }]}>
                    {rate.toFixed(0)}%
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${rate}%`, backgroundColor: getComplianceColor(rate) },
                    ]}
                  />
                </View>
                <Text style={styles.checklistTypeCount}>
                  {approved} / {total} đã duyệt
                </Text>
              </View>
            );
          })}
        </View>

        {/* Defects Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trạng thái Xử lý Lỗi</Text>
          <View style={styles.defectsGrid}>
            <View style={styles.defectStatCard}>
              <View style={[styles.defectStatDot, { backgroundColor: '#000000' }]} />
              <Text style={styles.defectStatNumber}>{defectsByStatus.open}</Text>
              <Text style={styles.defectStatLabel}>Chưa xử lý</Text>
            </View>
            <View style={styles.defectStatCard}>
              <View style={[styles.defectStatDot, { backgroundColor: '#0066CC' }]} />
              <Text style={styles.defectStatNumber}>{defectsByStatus.inProgress}</Text>
              <Text style={styles.defectStatLabel}>Đang xử lý</Text>
            </View>
            <View style={styles.defectStatCard}>
              <View style={[styles.defectStatDot, { backgroundColor: '#0066CC' }]} />
              <Text style={styles.defectStatNumber}>{defectsByStatus.resolved}</Text>
              <Text style={styles.defectStatLabel}>Đã sửa</Text>
            </View>
            <View style={styles.defectStatCard}>
              <View style={[styles.defectStatDot, { backgroundColor: '#0066CC' }]} />
              <Text style={styles.defectStatNumber}>{defectsByStatus.verified}</Text>
              <Text style={styles.defectStatLabel}>Đã kiểm tra</Text>
            </View>
          </View>
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tóm tắt</Text>
          <View style={styles.summaryBox}>
            <Ionicons name="information-circle" size={24} color="#0066CC" />
            <Text style={styles.summaryText}>
              Dự án đang đạt mức tuân thủ{' '}
              <Text style={{ fontWeight: '600', color: getComplianceColor(complianceRate) }}>
                {complianceRate.toFixed(1)}%
              </Text>
              . Có {defectsByStatus.open + defectsByStatus.inProgress} lỗi cần xử lý và{' '}
              {checklists.filter((c) => c.status === 'IN_PROGRESS').length} checklist đang
              thực hiện.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Export Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.exportButton} onPress={handleExportPDF}>
          <Ionicons name="download" size={20} color="#fff" />
          <Text style={styles.exportButtonText}>Xuất PDF</Text>
        </TouchableOpacity>
      </View>
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
  complianceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  complianceCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#E0E0E0',
  },
  compliancePercentage: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  complianceLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  complianceDetails: {
    flex: 1,
    gap: 12,
  },
  complianceDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  complianceDetailText: {
    fontSize: 14,
    color: '#666',
  },
  checklistTypeCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  checklistTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  checklistTypeName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  checklistTypeRate: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
  },
  checklistTypeCount: {
    fontSize: 12,
    color: '#666',
  },
  defectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  defectStatCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  defectStatDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  defectStatNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  defectStatLabel: {
    fontSize: 12,
    color: '#666',
  },
  summaryBox: {
    flexDirection: 'row',
    backgroundColor: '#E8F4FF',
    padding: 16,
    borderRadius: 8,
    gap: 12,
  },
  summaryText: {
    flex: 1,
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0066CC',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  exportButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
