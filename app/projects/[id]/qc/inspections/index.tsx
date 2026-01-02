import MetricCard from '@/components/construction/MetricCard';
import TimelineItem from '@/components/construction/TimelineItem';
import { Container } from '@/components/ui/container';
import {
    Inspection,
    InspectionStatus,
    InspectionType,
    QCInspectionService,
} from '@/services/api/qc-inspections.mock';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const TYPE_LABELS: Record<InspectionType, string> = {
  foundation: 'Móng',
  structure: 'Kết cấu',
  electrical: 'Điện',
  plumbing: 'Nước',
  finishing: 'Hoàn thiện',
  safety: 'An toàn',
  final: 'Nghiệm thu',
};

const STATUS_LABELS: Record<InspectionStatus, string> = {
  scheduled: 'Đã lên lịch',
  'in-progress': 'Đang kiểm tra',
  completed: 'Hoàn thành',
  failed: 'Không đạt',
  cancelled: 'Hủy',
};

export default function QCInspectionsScreen() {
  const { id: projectId } = useLocalSearchParams<{ id: string }>();

  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [filteredInspections, setFilteredInspections] = useState<Inspection[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<InspectionStatus | 'all'>('all');

  useEffect(() => {
    loadData();
  }, [projectId]);

  useEffect(() => {
    filterInspections();
  }, [inspections, statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [inspectionsData, statsData] = await Promise.all([
        QCInspectionService.getInspections({ projectId }),
        QCInspectionService.getStats(projectId),
      ]);
      setInspections(inspectionsData);
      setStats(statsData);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải danh sách kiểm tra');
    } finally {
      setLoading(false);
    }
  };

  const filterInspections = () => {
    let filtered = inspections;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(i => i.status === statusFilter);
    }

    setFilteredInspections(filtered);
  };

  const getStatusConfig = (status: InspectionStatus) => {
    const configs: Record<InspectionStatus, { type: 'current' | 'completed' | 'failed' | 'pending'; icon: any }> = {
      scheduled: { type: 'pending', icon: 'calendar' },
      'in-progress': { type: 'current', icon: 'play-circle' },
      completed: { type: 'completed', icon: 'checkmark-done' },
      failed: { type: 'failed', icon: 'close-circle' },
      cancelled: { type: 'failed', icon: 'ban' },
    };
    return configs[status];
  };

  const getResultBadge = (inspection: Inspection) => {
    if (inspection.status !== 'completed') return null;

    return (
      <View style={styles.resultBadge}>
        <Ionicons
          name={inspection.overallResult === 'pass' ? 'checkmark-circle' : 'close-circle'}
          size={16}
          color={inspection.overallResult === 'pass' ? '#10b981' : '#ef4444'}
        />
        <Text style={[
          styles.resultText,
          { color: inspection.overallResult === 'pass' ? '#10b981' : '#ef4444' }
        ]}>
          {inspection.overallResult === 'pass' ? 'Đạt' : 'Không đạt'}
        </Text>
        <Text style={styles.passRateText}>({inspection.passRate}%)</Text>
      </View>
    );
  };

  const renderInspection = (inspection: Inspection) => {
    const statusConfig = getStatusConfig(inspection.status);

    return (
      <View>
        <TimelineItem
          key={inspection.id}
          title={inspection.title}
          description={`${TYPE_LABELS[inspection.type]} • ${inspection.inspector}${inspection.location ? ' • ' + inspection.location : ''}${inspection.phase ? ' • Giai đoạn: ' + inspection.phase : ''}${inspection.status === 'completed' && inspection.defectsFound !== undefined ? (inspection.defectsFound > 0 ? ` • ${inspection.defectsFound} lỗi` : ' • Không có lỗi') : ''}`}
          date={new Date(inspection.scheduledDate).toLocaleDateString('vi-VN')}
          status={statusConfig.type}
          icon={statusConfig.icon}
        />

        {inspection.description && (
          <Text style={styles.description}>{inspection.description}</Text>
        )}

        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => router.push(`/projects/${projectId}/qc/inspections/${inspection.id}`)}
        >
          <Text style={styles.viewButtonText}>Xem chi tiết</Text>
          <Ionicons name="chevron-forward" size={16} color="#3b82f6" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Container fullWidth>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kiểm tra QC/QA</Text>
        <TouchableOpacity 
          onPress={() => router.push(`/projects/${projectId}/qc/defects`)}
          style={styles.defectsButton}
        >
          <Ionicons name="warning-outline" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Stats */}
        {stats && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.statsContainer}
            contentContainerStyle={styles.statsContent}
          >
            <MetricCard
              label="Tổng số"
              value={stats.totalInspections.toString()}
              icon="list"
              gradientColors={['#3b82f6', '#2563eb']}
            />
            <MetricCard
              label="Hoàn thành"
              value={stats.completedInspections.toString()}
              icon="checkmark-done"
              gradientColors={['#10b981', '#059669']}
            />
            <MetricCard
              label="Tỷ lệ đạt"
              value={`${stats.passRate}%`}
              icon="trophy"
              gradientColors={['#f59e0b', '#d97706']}
            />
            <MetricCard
              label="Lỗi nghiêm trọng"
              value={stats.criticalDefects.toString()}
              icon="alert-circle"
              gradientColors={['#ef4444', '#dc2626']}
            />
          </ScrollView>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#3b82f6' }]}
            onPress={() => router.push(`/projects/${projectId}/qc/inspections/create`)}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Tạo kiểm tra</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#10b981' }]}
            onPress={() => router.push(`/projects/${projectId}/qc/templates`)}
          >
            <Ionicons name="document-text" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Templates</Text>
          </TouchableOpacity>
        </View>

        {/* Status Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          <TouchableOpacity
            style={[styles.filterChip, statusFilter === 'all' && styles.filterChipActive]}
            onPress={() => setStatusFilter('all')}
          >
            <Text style={[styles.filterChipText, statusFilter === 'all' && styles.filterChipTextActive]}>
              Tất cả
            </Text>
          </TouchableOpacity>
          {(Object.keys(STATUS_LABELS) as InspectionStatus[]).map(status => (
            <TouchableOpacity
              key={status}
              style={[styles.filterChip, statusFilter === status && styles.filterChipActive]}
              onPress={() => setStatusFilter(status)}
            >
              <Text style={[styles.filterChipText, statusFilter === status && styles.filterChipTextActive]}>
                {STATUS_LABELS[status]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Inspections Timeline */}
        <View style={styles.timeline}>
          {loading ? (
            <View style={styles.emptyState}>
              <Ionicons name="hourglass-outline" size={64} color="#d1d5db" />
              <Text style={styles.emptyText}>Đang tải...</Text>
            </View>
          ) : filteredInspections.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="clipboard-outline" size={64} color="#d1d5db" />
              <Text style={styles.emptyText}>Chưa có kiểm tra QC/QA</Text>
              <TouchableOpacity
                style={styles.createCTA}
                onPress={() => router.push(`/projects/${projectId}/qc/inspections/create`)}
              >
                <Ionicons name="add-circle" size={20} color="#3b82f6" />
                <Text style={styles.createCTAText}>Tạo kiểm tra mới</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredInspections.map(renderInspection)
          )}
        </View>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    flex: 1,
    textAlign: 'center',
  },
  defectsButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  statsContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  filterContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterChipActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  timeline: {
    padding: 16,
  },
  inspectionContent: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#6b7280',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  },
  resultText: {
    fontSize: 13,
    fontWeight: '700',
  },
  passRateText: {
    fontSize: 12,
    color: '#6b7280',
  },
  defectsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
  },
  defectsText: {
    fontSize: 13,
    fontWeight: '600',
  },
  description: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3b82f6',
    marginTop: 4,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9ca3af',
    marginTop: 16,
  },
  createCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#eff6ff',
    borderRadius: 24,
  },
  createCTAText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
});
