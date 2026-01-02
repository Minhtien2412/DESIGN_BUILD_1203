import StatusBadge from '@/components/construction/StatusBadge';
import { Container } from '@/components/ui/container';
import {
    Defect,
    DefectSeverity,
    DefectStatus,
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

const SEVERITY_COLORS = {
  critical: '#ef4444',
  major: '#f59e0b',
  minor: '#3b82f6',
};

const SEVERITY_LABELS = {
  critical: 'Nghiêm trọng',
  major: 'Lớn',
  minor: 'Nhỏ',
};

const STATUS_LABELS: Record<DefectStatus, string> = {
  open: 'Mở',
  'in-progress': 'Đang xử lý',
  resolved: 'Đã giải quyết',
  closed: 'Đóng',
};

export default function DefectsListScreen() {
  const { id: projectId } = useLocalSearchParams<{ id: string }>();

  const [defects, setDefects] = useState<Defect[]>([]);
  const [filteredDefects, setFilteredDefects] = useState<Defect[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<DefectStatus | 'all'>('all');
  const [severityFilter, setSeverityFilter] = useState<DefectSeverity | 'all'>('all');

  useEffect(() => {
    loadDefects();
  }, [projectId]);

  useEffect(() => {
    filterDefects();
  }, [defects, statusFilter, severityFilter]);

  const loadDefects = async () => {
    try {
      setLoading(true);
      const data = await QCInspectionService.getDefects({ projectId });
      setDefects(data);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải danh sách lỗi');
    } finally {
      setLoading(false);
    }
  };

  const filterDefects = () => {
    let filtered = defects;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(d => d.status === statusFilter);
    }

    if (severityFilter !== 'all') {
      filtered = filtered.filter(d => d.severity === severityFilter);
    }

    setFilteredDefects(filtered);
  };

  const handleResolve = async (defect: Defect) => {
    Alert.prompt(
      'Giải quyết lỗi',
      'Nhập mô tả cách giải quyết:',
      async (text) => {
        if (!text.trim()) return;

        try {
          await QCInspectionService.updateDefect(defect.id, {
            status: 'resolved',
            resolvedBy: 'Current User',
            resolvedAt: new Date().toISOString(),
            resolution: text,
          });
          Alert.alert('Thành công', 'Đã đánh dấu lỗi là đã giải quyết');
          loadDefects();
        } catch (error) {
          Alert.alert('Lỗi', 'Không thể cập nhật trạng thái');
        }
      }
    );
  };

  const renderDefectCard = (defect: Defect) => {
    const getStatusConfig = () => {
      switch (defect.status) {
        case 'open':
          return { type: 'failed' as const, icon: 'alert-circle' };
        case 'in-progress':
          return { type: 'current' as const, icon: 'time' };
        case 'resolved':
          return { type: 'completed' as const, icon: 'checkmark-circle' };
        case 'closed':
          return { type: 'completed' as const, icon: 'checkmark-done' };
      }
    };

    const statusConfig = getStatusConfig();
    const isOverdue = defect.dueDate && new Date(defect.dueDate) < new Date() && defect.status !== 'resolved' && defect.status !== 'closed';

    return (
      <View key={defect.id} style={styles.defectCard}>
        <View style={styles.cardHeader}>
          <View style={[styles.severityBadge, { backgroundColor: SEVERITY_COLORS[defect.severity] + '20' }]}>
            <View style={[styles.severityDot, { backgroundColor: SEVERITY_COLORS[defect.severity] }]} />
            <Text style={[styles.severityText, { color: SEVERITY_COLORS[defect.severity] }]}>
              {SEVERITY_LABELS[defect.severity]}
            </Text>
          </View>
          <StatusBadge
            variant={statusConfig.type === 'completed' ? 'success' : statusConfig.type === 'failed' ? 'error' : statusConfig.type === 'current' ? 'info' : 'warning'}
            label={STATUS_LABELS[defect.status]}
            size="small"
          />
        </View>

        <Text style={styles.defectTitle}>{defect.title}</Text>
        <Text style={styles.defectDescription}>{defect.description}</Text>

        <View style={styles.defectInfo}>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color="#6b7280" />
            <Text style={styles.infoText}>{defect.location}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="pricetag-outline" size={16} color="#6b7280" />
            <Text style={styles.infoText}>{defect.category}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={16} color="#6b7280" />
            <Text style={styles.infoText}>
              {defect.assignedTo || 'Chưa phân công'}
            </Text>
          </View>
          {defect.dueDate && (
            <View style={styles.infoRow}>
              <Ionicons 
                name="calendar-outline" 
                size={16} 
                color={isOverdue ? '#ef4444' : '#6b7280'} 
              />
              <Text style={[styles.infoText, isOverdue && styles.overdueText]}>
                Hạn: {new Date(defect.dueDate).toLocaleDateString('vi-VN')}
                {isOverdue && ' (Quá hạn)'}
              </Text>
            </View>
          )}
        </View>

        {defect.status === 'resolved' && defect.resolution && (
          <View style={styles.resolutionBox}>
            <Text style={styles.resolutionLabel}>Cách giải quyết:</Text>
            <Text style={styles.resolutionText}>{defect.resolution}</Text>
            <Text style={styles.resolutionBy}>
              {defect.resolvedBy} - {new Date(defect.resolvedAt!).toLocaleDateString('vi-VN')}
            </Text>
          </View>
        )}

        {(defect.status === 'open' || defect.status === 'in-progress') && (
          <TouchableOpacity
            style={styles.resolveButton}
            onPress={() => handleResolve(defect)}
          >
            <Ionicons name="checkmark-circle" size={18} color="#10b981" />
            <Text style={styles.resolveButtonText}>Đánh dấu đã giải quyết</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <Container fullWidth>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lỗi & Khuyết tật</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Filters */}
        <View style={styles.filtersSection}>
          <Text style={styles.filterLabel}>Mức độ:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            <TouchableOpacity
              style={[styles.filterChip, severityFilter === 'all' && styles.filterChipActive]}
              onPress={() => setSeverityFilter('all')}
            >
              <Text style={[styles.filterChipText, severityFilter === 'all' && styles.filterChipTextActive]}>
                Tất cả
              </Text>
            </TouchableOpacity>
            {(Object.keys(SEVERITY_LABELS) as DefectSeverity[]).map(severity => (
              <TouchableOpacity
                key={severity}
                style={[styles.filterChip, severityFilter === severity && styles.filterChipActive]}
                onPress={() => setSeverityFilter(severity)}
              >
                <View style={[styles.severityDot, { backgroundColor: SEVERITY_COLORS[severity] }]} />
                <Text style={[styles.filterChipText, severityFilter === severity && styles.filterChipTextActive]}>
                  {SEVERITY_LABELS[severity]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.filterLabel}>Trạng thái:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            <TouchableOpacity
              style={[styles.filterChip, statusFilter === 'all' && styles.filterChipActive]}
              onPress={() => setStatusFilter('all')}
            >
              <Text style={[styles.filterChipText, statusFilter === 'all' && styles.filterChipTextActive]}>
                Tất cả
              </Text>
            </TouchableOpacity>
            {(Object.keys(STATUS_LABELS) as DefectStatus[]).map(status => (
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
        </View>

        {/* Defects List */}
        <View style={styles.list}>
          {loading ? (
            <View style={styles.emptyState}>
              <Ionicons name="hourglass-outline" size={64} color="#d1d5db" />
              <Text style={styles.emptyText}>Đang tải...</Text>
            </View>
          ) : filteredDefects.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle-outline" size={64} color="#d1d5db" />
              <Text style={styles.emptyText}>Không có lỗi nào</Text>
              <Text style={styles.emptySubtext}>Tuyệt vời! Công trình đang diễn ra tốt</Text>
            </View>
          ) : (
            filteredDefects.map(renderDefectCard)
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
  filtersSection: {
    padding: 16,
    gap: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  filterRow: {
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 6,
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
  list: {
    padding: 16,
    gap: 12,
  },
  defectCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  severityText: {
    fontSize: 13,
    fontWeight: '700',
  },
  defectTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  defectDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  defectInfo: {
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
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
  overdueText: {
    color: '#ef4444',
    fontWeight: '600',
  },
  resolutionBox: {
    padding: 12,
    backgroundColor: '#d1fae5',
    borderRadius: 12,
    gap: 6,
  },
  resolutionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065f46',
  },
  resolutionText: {
    fontSize: 14,
    color: '#047857',
    lineHeight: 20,
  },
  resolutionBy: {
    fontSize: 12,
    color: '#059669',
    marginTop: 4,
  },
  resolveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  resolveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
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
  emptySubtext: {
    fontSize: 14,
    color: '#d1d5db',
    marginTop: 8,
  },
});
