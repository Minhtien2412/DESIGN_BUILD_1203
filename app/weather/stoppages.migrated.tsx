/**
 * Work Stoppage Tracking Screen - Migrated to Universal Components
 * Using ModuleLayout + UniversalList pattern
 */

import { ModuleLayout } from '@/components/layouts/ModuleLayout';
import { Loader } from '@/components/ui/loader';
import { UniversalList } from '@/components/universal/UniversalList';
import { useWorkStoppages } from '@/hooks/useWeather';
import {
    StopageReason,
    StopageStatus,
    WorkActivityType,
    type CreateStoppageParams,
    type WorkStoppage,
} from '@/types/weather';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function WorkStoppageScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const [filter, setFilter] = useState<StopageStatus | 'ALL'>(StopageStatus.ACTIVE);
  const [modalVisible, setModalVisible] = useState(false);

  const { stoppages, loading, error, create, complete, cancel, refetch } =
    useWorkStoppages({
      projectId: projectId || '',
      status: filter === 'ALL' ? undefined : [filter],
    });

  const handleComplete = async (stoppage: WorkStoppage) => {
    Alert.alert('Kết thúc dừng việc', 'Xác nhận kết thúc dừng việc này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Kết thúc',
        onPress: async () => {
          try {
            await complete(stoppage.id, new Date());
            Alert.alert('Thành công', 'Đã kết thúc dừng việc');
          } catch (err) {
            Alert.alert('Lỗi', 'Không thể kết thúc dừng việc');
          }
        },
      },
    ]);
  };

  const handleCancel = async (stoppage: WorkStoppage) => {
    Alert.prompt(
      'Hủy dừng việc',
      'Nhập lý do hủy:',
      [
        { text: 'Đóng', style: 'cancel' },
        {
          text: 'Hủy dừng việc',
          style: 'destructive',
          onPress: async (reason?: string) => {
            try {
              await cancel(stoppage.id, reason);
              Alert.alert('Thành công', 'Đã hủy dừng việc');
            } catch (err) {
              Alert.alert('Lỗi', 'Không thể hủy dừng việc');
            }
          },
        },
      ],
      'plain-text'
    );
  };

  if (loading && stoppages.length === 0) {
    return <Loader />;
  }

  const activeStoppages = stoppages.filter((s) => s.status === StopageStatus.ACTIVE);
  const totalDelay = stoppages.reduce((sum, s) => sum + (s.impact.estimatedDelay || 0), 0);

  return (
    <>
      <Stack.Screen options={{ title: 'Dừng việc do thời tiết', headerShown: false }} />

      <ModuleLayout
        title="Dừng việc do thời tiết"
        subtitle={`${activeStoppages.length} đang dừng • ${stoppages.length} tổng • ${totalDelay}h trễ`}
        showBackButton
        scrollable={false}
        padding={false}
        headerRight={
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Ionicons name="add-circle" size={28} color="#0066CC" />
          </TouchableOpacity>
        }
      >
        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          {(['ALL', StopageStatus.ACTIVE, StopageStatus.PLANNED, StopageStatus.COMPLETED, StopageStatus.CANCELLED] as const).map(
            (status) => (
              <TouchableOpacity
                key={status}
                style={[styles.filterTab, filter === status && styles.filterTabActive]}
                onPress={() => setFilter(status as StopageStatus | 'ALL')}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    filter === status && styles.filterTabTextActive,
                  ]}
                >
                  {getStatusFilterLabel(status as StopageStatus | 'ALL')}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>

        {/* Universal List with custom stoppage cards */}
        <UniversalList<WorkStoppage>
          config={{
            data: stoppages,
            keyExtractor: (item) => item.id,
            renderItem: (item) => (
              <StoppageCard
                stoppage={item}
                onComplete={() => handleComplete(item)}
                onCancel={() => handleCancel(item)}
              />
            ),
            onRefresh: refetch,
            emptyIcon: 'construct',
            emptyMessage: 'Không có dừng việc nào',
            emptyAction: {
              label: 'Tạo dừng việc',
              onPress: () => setModalVisible(true),
            },
          }}
        />
      </ModuleLayout>

      {/* Create Stoppage Modal - preserved for Task 21 */}
      <CreateStoppageModal
        visible={modalVisible}
        projectId={projectId || ''}
        onClose={() => setModalVisible(false)}
        onCreate={async (params) => {
          try {
            await create(params);
            setModalVisible(false);
            Alert.alert('Thành công', 'Đã tạo dừng việc');
          } catch (err) {
            Alert.alert('Lỗi', 'Không thể tạo dừng việc');
          }
        }}
      />
    </>
  );
}

// Custom StoppageCard component (complex multi-section layout)
interface StoppageCardProps {
  stoppage: WorkStoppage;
  onComplete: () => void;
  onCancel: () => void;
}

function StoppageCard({ stoppage, onComplete, onCancel }: StoppageCardProps) {
  const statusColor = getStatusColor(stoppage.status);
  const reasonIcon = getReasonIcon(stoppage.reason);

  return (
    <View style={[styles.stoppageCard, { borderLeftColor: statusColor, borderLeftWidth: 4 }]}>
      {/* Header */}
      <View style={styles.stoppageHeader}>
        <View style={[styles.reasonBadge, { backgroundColor: `${statusColor}15` }]}>
          <Ionicons name={reasonIcon as any} size={24} color={statusColor} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.reasonText}>{getReasonLabel(stoppage.reason)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{getStatusLabel(stoppage.status)}</Text>
          </View>
        </View>
      </View>

      {/* Time Info */}
      <View style={styles.timeSection}>
        <View style={styles.timeRow}>
          <Ionicons name="play-circle" size={16} color="#666" />
          <Text style={styles.timeLabel}>Bắt đầu:</Text>
          <Text style={styles.timeValue}>
            {new Date(stoppage.startTime).toLocaleString('vi-VN')}
          </Text>
        </View>
        {stoppage.endTime && (
          <View style={styles.timeRow}>
            <Ionicons name="stop-circle" size={16} color="#666" />
            <Text style={styles.timeLabel}>Kết thúc:</Text>
            <Text style={styles.timeValue}>
              {new Date(stoppage.endTime).toLocaleString('vi-VN')}
            </Text>
          </View>
        )}
        {stoppage.plannedEndTime && !stoppage.endTime && (
          <View style={styles.timeRow}>
            <Ionicons name="time" size={16} color="#666" />
            <Text style={styles.timeLabel}>Dự kiến:</Text>
            <Text style={styles.timeValue}>
              {new Date(stoppage.plannedEndTime).toLocaleString('vi-VN')}
            </Text>
          </View>
        )}
      </View>

      {/* Affected Activities */}
      <View style={styles.activitiesSection}>
        <Text style={styles.sectionTitle}>Hoạt động bị ảnh hưởng:</Text>
        <View style={styles.activityTags}>
          {stoppage.affectedActivities.map((activity, index) => (
            <View key={index} style={styles.activityTag}>
              <Text style={styles.activityTagText}>{getActivityLabel(activity)}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Impact Info */}
      <View style={styles.impactSection}>
        <View style={styles.impactRow}>
          <Ionicons name="people" size={16} color="#666" />
          <Text style={styles.impactText}>
            {stoppage.affectedWorkers} công nhân bị ảnh hưởng
          </Text>
        </View>
        {stoppage.impact.estimatedDelay && (
          <View style={styles.impactRow}>
            <Ionicons name="time" size={16} color="#000000" />
            <Text style={styles.impactText}>Trễ {stoppage.impact.estimatedDelay} giờ</Text>
          </View>
        )}
        {stoppage.impact.safetyRisk && (
          <View
            style={[
              styles.safetyBadge,
              { backgroundColor: getSafetyRiskColor(stoppage.impact.safetyRisk) },
            ]}
          >
            <Ionicons name="warning" size={14} color="#FFF" />
            <Text style={styles.safetyText}>
              Rủi ro: {getSafetyRiskLabel(stoppage.impact.safetyRisk)}
            </Text>
          </View>
        )}
      </View>

      {/* Decision Info */}
      <View style={styles.decisionSection}>
        <Text style={styles.decisionTitle}>Quyết định:</Text>
        <Text style={styles.decisionReasoning}>{stoppage.decision.reasoning}</Text>
        <Text style={styles.decisionMeta}>
          {stoppage.decision.decidedBy} -{' '}
          {new Date(stoppage.decision.decidedAt).toLocaleString('vi-VN')}
        </Text>
      </View>

      {/* Actions */}
      {stoppage.status === StopageStatus.ACTIVE && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.completeButton} onPress={onComplete}>
            <Ionicons name="checkmark-circle" size={18} color="#FFF" />
            <Text style={styles.completeButtonText}>Kết thúc</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Ionicons name="close-circle" size={18} color="#000000" />
            <Text style={styles.cancelButtonText}>Hủy</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// CreateStoppageModal preserved from original (Task 21 will refactor)
interface CreateStoppageModalProps {
  visible: boolean;
  projectId: string;
  onClose: () => void;
  onCreate: (params: CreateStoppageParams) => Promise<void>;
}

function CreateStoppageModal({
  visible,
  projectId,
  onClose,
  onCreate,
}: CreateStoppageModalProps) {
  const [reason, setReason] = useState<StopageReason>(StopageReason.HEAVY_RAIN);
  const [activities, setActivities] = useState<WorkActivityType[]>([]);
  const [workers, setWorkers] = useState('0');
  const [reasoning, setReasoning] = useState('');
  const [estimatedDelay, setEstimatedDelay] = useState('');
  const [safetyRisk, setSafetyRisk] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [creating, setCreating] = useState(false);

  const toggleActivity = (activity: WorkActivityType) => {
    setActivities((prev) =>
      prev.includes(activity) ? prev.filter((a) => a !== activity) : [...prev, activity]
    );
  };

  const handleCreate = async () => {
    if (activities.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng chọn ít nhất một hoạt động');
      return;
    }
    if (!reasoning.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập lý do quyết định');
      return;
    }

    setCreating(true);
    try {
      await onCreate({
        projectId,
        reason,
        affectedActivities: activities,
        startTime: new Date(),
        affectedWorkers: parseInt(workers) || 0,
        decisionReasoning: reasoning,
        estimatedDelay: estimatedDelay ? parseFloat(estimatedDelay) : undefined,
        safetyRisk,
      });
      // Reset form
      setReason(StopageReason.HEAVY_RAIN);
      setActivities([]);
      setWorkers('0');
      setReasoning('');
      setEstimatedDelay('');
      setSafetyRisk('MEDIUM');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Tạo dừng việc</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Reason Selection */}
            <Text style={styles.inputLabel}>Lý do dừng việc</Text>
            <View style={styles.reasonChips}>
              {Object.values(StopageReason).map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.reasonChip, reason === r && styles.reasonChipActive]}
                  onPress={() => setReason(r)}
                >
                  <Text
                    style={[
                      styles.reasonChipText,
                      reason === r && styles.reasonChipTextActive,
                    ]}
                  >
                    {getReasonLabel(r)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Activities Selection */}
            <Text style={styles.inputLabel}>Hoạt động bị ảnh hưởng</Text>
            <View style={styles.activityChips}>
              {Object.values(WorkActivityType).map((activity) => (
                <TouchableOpacity
                  key={activity}
                  style={[
                    styles.activityChip,
                    activities.includes(activity) && styles.activityChipActive,
                  ]}
                  onPress={() => toggleActivity(activity)}
                >
                  {activities.includes(activity) && (
                    <Ionicons name="checkmark" size={14} color="#FFF" />
                  )}
                  <Text
                    style={[
                      styles.activityChipText,
                      activities.includes(activity) && styles.activityChipTextActive,
                    ]}
                  >
                    {getActivityLabel(activity)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Workers Input */}
            <Text style={styles.inputLabel}>Số công nhân bị ảnh hưởng</Text>
            <TextInput
              style={styles.input}
              value={workers}
              onChangeText={setWorkers}
              keyboardType="number-pad"
              placeholder="0"
            />

            {/* Reasoning Input */}
            <Text style={styles.inputLabel}>Lý do quyết định *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={reasoning}
              onChangeText={setReasoning}
              multiline
              numberOfLines={3}
              placeholder="Nhập lý do quyết định dừng việc..."
            />

            {/* Estimated Delay */}
            <Text style={styles.inputLabel}>Thời gian trễ ước tính (giờ)</Text>
            <TextInput
              style={styles.input}
              value={estimatedDelay}
              onChangeText={setEstimatedDelay}
              keyboardType="decimal-pad"
              placeholder="0"
            />

            {/* Safety Risk */}
            <Text style={styles.inputLabel}>Mức độ rủi ro an toàn</Text>
            <View style={styles.riskChips}>
              {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map((risk) => (
                <TouchableOpacity
                  key={risk}
                  style={[
                    styles.riskChip,
                    safetyRisk === risk && styles.riskChipActive,
                    { borderColor: getSafetyRiskColor(risk) },
                  ]}
                  onPress={() => setSafetyRisk(risk)}
                >
                  <Text
                    style={[
                      styles.riskChipText,
                      safetyRisk === risk && { color: getSafetyRiskColor(risk) },
                    ]}
                  >
                    {getSafetyRiskLabel(risk)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Modal Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonCancel]}
              onPress={onClose}
            >
              <Text style={styles.modalButtonCancelText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonCreate]}
              onPress={handleCreate}
              disabled={creating}
            >
              <Text style={styles.modalButtonCreateText}>
                {creating ? 'Đang tạo...' : 'Tạo dừng việc'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// Helper functions
function getStatusColor(status: StopageStatus): string {
  switch (status) {
    case StopageStatus.ACTIVE:
      return '#000000';
    case StopageStatus.PLANNED:
      return '#0066CC';
    case StopageStatus.COMPLETED:
      return '#0066CC';
    case StopageStatus.CANCELLED:
      return '#999999';
    default:
      return '#999999';
  }
}

function getStatusLabel(status: StopageStatus): string {
  switch (status) {
    case StopageStatus.ACTIVE:
      return 'ĐANG DỪNG';
    case StopageStatus.PLANNED:
      return 'DỰ KIẾN';
    case StopageStatus.COMPLETED:
      return 'HOÀN THÀNH';
    case StopageStatus.CANCELLED:
      return 'ĐÃ HỦY';
    default:
      return status;
  }
}

function getStatusFilterLabel(status: StopageStatus | 'ALL'): string {
  if (status === 'ALL') return 'Tất cả';
  switch (status) {
    case StopageStatus.ACTIVE:
      return 'Đang dừng';
    case StopageStatus.PLANNED:
      return 'Dự kiến';
    case StopageStatus.COMPLETED:
      return 'Hoàn thành';
    case StopageStatus.CANCELLED:
      return 'Đã hủy';
    default:
      return status;
  }
}

function getReasonIcon(reason: StopageReason): string {
  switch (reason) {
    case StopageReason.HEAVY_RAIN:
      return 'rainy';
    case StopageReason.STRONG_WIND:
      return 'leaf';
    case StopageReason.EXTREME_HEAT:
      return 'sunny';
    case StopageReason.THUNDERSTORM:
      return 'thunderstorm';
    case StopageReason.FLOOD:
      return 'water';
    case StopageReason.POOR_VISIBILITY:
      return 'eye-off';
    case StopageReason.UNSAFE_CONDITIONS:
      return 'warning';
    case StopageReason.EQUIPMENT_SAFETY:
      return 'construct';
    case StopageReason.WORKER_SAFETY:
      return 'people';
    default:
      return 'alert-circle';
  }
}

function getReasonLabel(reason: StopageReason): string {
  switch (reason) {
    case StopageReason.HEAVY_RAIN:
      return 'Mưa lớn';
    case StopageReason.STRONG_WIND:
      return 'Gió mạnh';
    case StopageReason.EXTREME_HEAT:
      return 'Nóng cực độ';
    case StopageReason.THUNDERSTORM:
      return 'Bão';
    case StopageReason.FLOOD:
      return 'Lũ lụt';
    case StopageReason.POOR_VISIBILITY:
      return 'Tầm nhìn kém';
    case StopageReason.UNSAFE_CONDITIONS:
      return 'Điều kiện không an toàn';
    case StopageReason.EQUIPMENT_SAFETY:
      return 'An toàn thiết bị';
    case StopageReason.WORKER_SAFETY:
      return 'An toàn công nhân';
    case StopageReason.OTHER:
      return 'Khác';
    default:
      return reason;
  }
}

function getActivityLabel(activity: WorkActivityType): string {
  switch (activity) {
    case WorkActivityType.EXCAVATION:
      return 'Đào đất';
    case WorkActivityType.CONCRETE_POURING:
      return 'Đổ bê tông';
    case WorkActivityType.STEEL_ERECTION:
      return 'Dựng thép';
    case WorkActivityType.ROOFING:
      return 'Lợp mái';
    case WorkActivityType.PAINTING_EXTERIOR:
      return 'Sơn ngoài trời';
    case WorkActivityType.MASONRY:
      return 'Xây gạch';
    case WorkActivityType.CRANE_OPERATIONS:
      return 'Vận hành cần cẩu';
    case WorkActivityType.SCAFFOLDING:
      return 'Giàn giáo';
    case WorkActivityType.ELECTRICAL_OUTDOOR:
      return 'Điện ngoài trời';
    case WorkActivityType.PLUMBING_OUTDOOR:
      return 'Ống nước ngoài trời';
    case WorkActivityType.LANDSCAPING:
      return 'Cảnh quan';
    case WorkActivityType.PAVING:
      return 'Rải đường';
    case WorkActivityType.OTHER:
      return 'Khác';
    default:
      return activity;
  }
}

function getSafetyRiskColor(risk: string): string {
  switch (risk) {
    case 'LOW':
      return '#0066CC';
    case 'MEDIUM':
      return '#0066CC';
    case 'HIGH':
      return '#000000';
    case 'CRITICAL':
      return '#B71C1C';
    default:
      return '#999999';
  }
}

function getSafetyRiskLabel(risk: string): string {
  switch (risk) {
    case 'LOW':
      return 'Thấp';
    case 'MEDIUM':
      return 'Trung bình';
    case 'HIGH':
      return 'Cao';
    case 'CRITICAL':
      return 'Nguy kịch';
    default:
      return risk;
  }
}

const styles = StyleSheet.create({
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    flexWrap: 'wrap',
  },
  filterTab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: '#0066CC',
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },

  // Custom stoppage card styles
  stoppageCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 12,
  },
  stoppageHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  reasonBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reasonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFF',
  },
  timeSection: {
    gap: 6,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeLabel: {
    fontSize: 13,
    color: '#666',
  },
  timeValue: {
    flex: 1,
    fontSize: 13,
    color: '#333',
  },
  activitiesSection: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  activityTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activityTag: {
    backgroundColor: '#E8F4FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activityTagText: {
    fontSize: 12,
    color: '#1976D2',
  },
  impactSection: {
    gap: 8,
  },
  impactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  impactText: {
    fontSize: 13,
    color: '#666',
  },
  safetyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 6,
  },
  safetyText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  decisionSection: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  decisionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  decisionReasoning: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
  },
  decisionMeta: {
    fontSize: 11,
    color: '#999',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  completeButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#0066CC',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  completeButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#000000',
  },
  cancelButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Modal styles (preserved for Task 21)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  reasonChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  reasonChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
  },
  reasonChipActive: {
    backgroundColor: '#0066CC',
  },
  reasonChipText: {
    fontSize: 13,
    color: '#666',
  },
  reasonChipTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  activityChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activityChip: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    gap: 4,
  },
  activityChipActive: {
    backgroundColor: '#0066CC',
  },
  activityChipText: {
    fontSize: 13,
    color: '#666',
  },
  activityChipTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#FFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  riskChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  riskChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: '#FFF',
  },
  riskChipActive: {
    backgroundColor: '#F5F5F5',
  },
  riskChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#F5F5F5',
  },
  modalButtonCancelText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#666',
  },
  modalButtonCreate: {
    backgroundColor: '#0066CC',
  },
  modalButtonCreateText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFF',
  },
});
