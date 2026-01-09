import { usePhases } from '@/hooks/useTimeline';
import type { PhaseStatus } from '@/types/timeline';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const STATUS_CONFIG: Record<
  PhaseStatus,
  { label: string; color: string; icon: string }
> = {
  PLANNED: { label: 'Kế hoạch', color: '#999999', icon: 'document-text-outline' },
  ACTIVE: { label: 'Đang thực hiện', color: '#0066CC', icon: 'play-circle' },
  COMPLETED: { label: 'Hoàn thành', color: '#0066CC', icon: 'checkmark-circle' },
  DELAYED: { label: 'Bị trễ', color: '#000000', icon: 'alert-circle' },
};

export default function PhasesScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { phases, loading, deletePhase } = usePhases(projectId!);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const handleDelete = (phaseId: string, phaseName: string) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa giai đoạn "${phaseName}"?\n\nTất cả công việc trong giai đoạn này cũng sẽ bị xóa.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePhase(phaseId);
              Alert.alert('Thành công', 'Giai đoạn đã được xóa');
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa giai đoạn');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {phases.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="albums-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Chưa có giai đoạn nào</Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.push(`/timeline/create-phase?projectId=${projectId}`)}
            >
              <Text style={styles.createButtonText}>Tạo giai đoạn đầu tiên</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.phasesList}>
            {phases
              .sort((a, b) => a.order - b.order)
              .map((phase) => {
                const isExpanded = expandedId === phase.id;
                const statusConfig = STATUS_CONFIG[phase.status];
                const duration = Math.ceil(
                  (new Date(phase.endDate).getTime() -
                    new Date(phase.startDate).getTime()) /
                    (1000 * 60 * 60 * 24)
                );

                return (
                  <View key={phase.id} style={styles.phaseCard}>
                    <TouchableOpacity
                      style={styles.phaseHeader}
                      onPress={() => setExpandedId(isExpanded ? null : phase.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.phaseLeft}>
                        <View
                          style={[styles.phaseOrder, { backgroundColor: phase.color }]}
                        >
                          <Text style={styles.phaseOrderText}>{phase.order}</Text>
                        </View>
                        <View style={styles.phaseInfo}>
                          <Text style={styles.phaseName}>{phase.name}</Text>
                          <View style={styles.phaseMeta}>
                            <Ionicons name="calendar-outline" size={14} color="#666" />
                            <Text style={styles.phaseMetaText}>
                              {formatDate(phase.startDate)} - {formatDate(phase.endDate)}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View style={styles.phaseRight}>
                        <View
                          style={[
                            styles.statusBadge,
                            { backgroundColor: statusConfig.color + '20' },
                          ]}
                        >
                          <Ionicons
                            name={statusConfig.icon as any}
                            size={12}
                            color={statusConfig.color}
                          />
                          <Text style={[styles.statusText, { color: statusConfig.color }]}>
                            {statusConfig.label}
                          </Text>
                        </View>
                        <Ionicons
                          name={isExpanded ? 'chevron-up' : 'chevron-down'}
                          size={20}
                          color="#999"
                        />
                      </View>
                    </TouchableOpacity>

                    {/* Progress Bar */}
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${phase.completionPercentage}%`,
                              backgroundColor: phase.color,
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.progressText}>
                        {phase.completionPercentage}%
                      </Text>
                    </View>

                    {isExpanded && (
                      <View style={styles.phaseBody}>
                        {phase.description && (
                          <Text style={styles.phaseDescription}>{phase.description}</Text>
                        )}

                        <View style={styles.statsGrid}>
                          <View style={styles.statBox}>
                            <Ionicons name="time-outline" size={16} color="#666" />
                            <Text style={styles.statLabel}>Thời lượng</Text>
                            <Text style={styles.statValue}>{duration} ngày</Text>
                          </View>

                          {phase.budget && (
                            <View style={styles.statBox}>
                              <Ionicons name="cash-outline" size={16} color="#666" />
                              <Text style={styles.statLabel}>Ngân sách</Text>
                              <Text style={styles.statValue}>
                                {formatCurrency(phase.budget)}
                              </Text>
                            </View>
                          )}

                          {phase.actualCost && (
                            <View style={styles.statBox}>
                              <Ionicons name="calculator-outline" size={16} color="#666" />
                              <Text style={styles.statLabel}>Chi phí thực tế</Text>
                              <Text style={styles.statValue}>
                                {formatCurrency(phase.actualCost)}
                              </Text>
                            </View>
                          )}
                        </View>

                        <View style={styles.actions}>
                          <TouchableOpacity
                            style={styles.viewButton}
                            onPress={() => router.push(`/timeline/phase/${phase.id}` as any)}
                          >
                            <Ionicons name="eye-outline" size={18} color="#0066CC" />
                            <Text style={styles.actionButtonText}>Xem chi tiết</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[styles.actionButton, styles.deleteButton]}
                            onPress={() => handleDelete(phase.id, phase.name)}
                          >
                            <Ionicons name="trash-outline" size={18} color="#000000" />
                            <Text style={[styles.actionButtonText, { color: '#000000' }]}>
                              Xóa
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>
                );
              })}
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      {phases.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push(`/timeline/create-phase?projectId=${projectId}`)}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    marginBottom: 20,
  },
  createButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#0066CC',
    borderRadius: 8,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  phasesList: {
    padding: 16,
  },
  phaseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  phaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  phaseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  phaseOrder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  phaseOrderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  phaseInfo: {
    flex: 1,
  },
  phaseName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  phaseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  phaseMetaText: {
    fontSize: 12,
    color: '#666',
  },
  phaseRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    minWidth: 40,
    textAlign: 'right',
  },
  phaseBody: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  phaseDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    gap: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
  },
  statValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  viewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: '#E8F4FF',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: '#E8F4FF',
  },
  deleteButton: {
    backgroundColor: '#F5F5F5',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0066CC',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0066CC',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
