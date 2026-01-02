/**
 * Phases Management Screen - Migrated to Universal Components
 * Using ModuleLayout + UniversalList pattern
 */

import { ModuleLayout } from '@/components/layouts/ModuleLayout';
import { UniversalList } from '@/components/universal/UniversalList';
import { usePhases } from '@/hooks/useTimeline';
import type { PhaseStatus, TimelinePhase } from '@/types/timeline';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const STATUS_CONFIG: Record<PhaseStatus, { label: string; color: string; icon: string }> = {
  PLANNED: { label: 'Kế hoạch', color: '#9E9E9E', icon: 'document-text-outline' },
  ACTIVE: { label: 'Đang thực hiện', color: '#2196F3', icon: 'play-circle' },
  COMPLETED: { label: 'Hoàn thành', color: '#4CAF50', icon: 'checkmark-circle' },
  DELAYED: { label: 'Bị trễ', color: '#F44336', icon: 'alert-circle' },
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

  const handleDelete = (phase: TimelinePhase) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa giai đoạn "${phase.name}"?\n\nTất cả công việc trong giai đoạn này cũng sẽ bị xóa.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePhase(phase.id);
              Alert.alert('Thành công', 'Giai đoạn đã được xóa');
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa giai đoạn');
            }
          },
        },
      ]
    );
  };

  const sortedPhases = [...phases].sort((a, b) => a.order - b.order);

  return (
    <>
      <Stack.Screen options={{ title: 'Quản lý giai đoạn', headerShown: false }} />

      <ModuleLayout
        title="Quản lý giai đoạn"
        subtitle={`${phases.length} giai đoạn`}
        showBackButton
        scrollable={false}
        padding={false}
        headerRight={
          <TouchableOpacity
            onPress={() => router.push(`/timeline/create-phase?projectId=${projectId}`)}
          >
            <Ionicons name="add-circle" size={28} color="#2196F3" />
          </TouchableOpacity>
        }
      >
        <UniversalList<TimelinePhase>
          config={{
            data: sortedPhases,
            keyExtractor: (item) => item.id,
            renderItem: (item) => (
              <PhaseCard
                phase={item}
                isExpanded={expandedId === item.id}
                onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
                onDelete={() => handleDelete(item)}
                formatDate={formatDate}
                formatCurrency={formatCurrency}
              />
            ),
            emptyIcon: 'albums-outline',
            emptyMessage: 'Chưa có giai đoạn nào',
            emptyAction: {
              label: 'Tạo giai đoạn đầu tiên',
              onPress: () => router.push(`/timeline/create-phase?projectId=${projectId}`),
            },
          }}
        />
      </ModuleLayout>
    </>
  );
}

// Custom PhaseCard component
interface PhaseCardProps {
  phase: TimelinePhase;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  formatDate: (date: Date) => string;
  formatCurrency: (value: number) => string;
}

function PhaseCard({
  phase,
  isExpanded,
  onToggle,
  onDelete,
  formatDate,
  formatCurrency,
}: PhaseCardProps) {
  const statusConfig = STATUS_CONFIG[phase.status];
  const duration = Math.ceil(
    (new Date(phase.endDate).getTime() - new Date(phase.startDate).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <View style={styles.phaseCard}>
      {/* Header */}
      <TouchableOpacity style={styles.phaseHeader} onPress={onToggle} activeOpacity={0.7}>
        <View style={styles.phaseLeft}>
          <View style={[styles.phaseOrder, { backgroundColor: phase.color }]}>
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
            style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20' }]}
          >
            <Ionicons name={statusConfig.icon as any} size={12} color={statusConfig.color} />
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
      <View style={styles.progressSection}>
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${phase.completionPercentage}%` }]}
          />
        </View>
        <Text style={styles.progressText}>{phase.completionPercentage}%</Text>
      </View>

      {/* Expanded Details */}
      {isExpanded && (
        <View style={styles.expandedContent}>
          {/* Description */}
          {phase.description && (
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Mô tả:</Text>
              <Text style={styles.detailValue}>{phase.description}</Text>
            </View>
          )}

          {/* Details Grid */}
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.detailItemText}>{duration} ngày</Text>
            </View>
            {phase.budget && (
              <View style={styles.detailItem}>
                <Ionicons name="cash-outline" size={16} color="#666" />
                <Text style={styles.detailItemText}>{formatCurrency(phase.budget)}</Text>
              </View>
            )}
            {phase.actualCost && (
              <View style={styles.detailItem}>
                <Ionicons name="card-outline" size={16} color="#666" />
                <Text style={styles.detailItemText}>
                  Chi: {formatCurrency(phase.actualCost)}
                </Text>
              </View>
            )}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() =>
                router.push(`/timeline/edit-phase?phaseId=${phase.id}&projectId=${phase.projectId}` as any)
              }
            >
              <Ionicons name="create-outline" size={18} color="#2196F3" />
              <Text style={styles.editButtonText}>Sửa</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
              <Ionicons name="trash-outline" size={18} color="#F44336" />
              <Text style={styles.deleteButtonText}>Xóa</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  phaseCard: {
    backgroundColor: '#FFF',
    marginBottom: 16,
    borderRadius: 12,
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
    gap: 12,
  },
  phaseOrder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phaseOrderText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  phaseInfo: {
    flex: 1,
  },
  phaseName: {
    fontSize: 16,
    fontWeight: 'bold',
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2196F3',
    width: 40,
  },
  expandedContent: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    padding: 16,
    gap: 16,
  },
  detailSection: {
    gap: 8,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  detailItemText: {
    fontSize: 13,
    color: '#333',
  },
  dependenciesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dependencyTag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dependencyText: {
    fontSize: 12,
    color: '#1976D2',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  editButtonText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: 'bold',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFEBEE',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  deleteButtonText: {
    color: '#F44336',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
