/**
 * Work Stoppage Tracking Screen
 * Track weather-based construction delays and work interruptions
 */

import { Loader } from '@/components/ui/loader';
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
    FlatList,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function WorkStoppageScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const [filter, setFilter] = useState<StopageStatus | 'ALL'>(StopageStatus.ACTIVE);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { stoppages, loading, error, create, complete, cancel, refetch } =
    useWorkStoppages({
      projectId: projectId || '',
      status: filter === 'ALL' ? undefined : [filter],
    });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

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
  const totalDelay = stoppages.reduce(
    (sum, s) => sum + (s.impact.estimatedDelay || 0),
    0
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Dừng việc do thời tiết',
          headerRight: () => (
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Ionicons name="add-circle" size={28} color="#2196F3" style={{ marginRight: 8 }} />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Stats Header */}
      <View style={styles.statsHeader}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, styles.statValueActive]}>
            {activeStoppages.length}
          </Text>
          <Text style={styles.statLabel}>Đang dừng</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stoppages.length}</Text>
          <Text style={styles.statLabel}>Tổng số</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalDelay}h</Text>
          <Text style={styles.statLabel}>Tổng trễ</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        {(['ALL', StopageStatus.ACTIVE, StopageStatus.PLANNED, StopageStatus.COMPLETED, StopageStatus.CANCELLED] as const).map((status) => (
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
        ))}
      </View>

      <FlatList
        data={stoppages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <StoppageCard
            stoppage={item}
            onComplete={() => handleComplete(item)}
            onCancel={() => handleCancel(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="construct" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Không có dừng việc nào</Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.createButtonText}>Tạo dừng việc</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Create Stoppage Modal */}
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

interface StoppageCardProps {
  stoppage: WorkStoppage;
  onComplete: () => void;
  onCancel: () => void;
}

function StoppageCard({ stoppage, onComplete, onCancel }: StoppageCardProps) {
  const statusColor = getStatusColor(stoppage.status);
  const reasonIcon = getReasonIcon(stoppage.reason);

  return (
    <View style={styles.stoppageCard}>
      {/* Header */}
      <View style={styles.stoppageHeader}>
        <View style={[styles.reasonBadge, { backgroundColor: `${statusColor}15` }]}>
          <Ionicons name={reasonIcon} size={24} color={statusColor} />
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
            <Ionicons name="time" size={16} color="#F44336" />
            <Text style={styles.impactText}>
              Trễ {stoppage.impact.estimatedDelay} giờ
            </Text>
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
            <Ionicons name="close-circle" size={18} color="#F44336" />
            <Text style={styles.cancelButtonText}>Hủy</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

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
      prev.includes(activity)
        ? prev.filter((a) => a !== activity)
        : [...prev, activity]
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

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelModalButton} onPress={onClose}>
              <Text style={styles.cancelModalButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.createModalButton, creating && styles.buttonDisabled]}
              onPress={handleCreate}
              disabled={creating}
            >
              <Text style={styles.createModalButtonText}>
                {creating ? 'Đang tạo...' : 'Tạo'}
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
    case StopageStatus.PLANNED:
      return '#2196F3';
    case StopageStatus.ACTIVE:
      return '#F44336';
    case StopageStatus.COMPLETED:
      return '#4CAF50';
    case StopageStatus.CANCELLED:
      return '#9E9E9E';
    default:
      return '#666';
  }
}

function getStatusLabel(status: StopageStatus): string {
  const labels: Record<StopageStatus, string> = {
    [StopageStatus.PLANNED]: 'Đã lên kế hoạch',
    [StopageStatus.ACTIVE]: 'Đang dừng',
    [StopageStatus.COMPLETED]: 'Đã hoàn thành',
    [StopageStatus.CANCELLED]: 'Đã hủy',
  };
  return labels[status] || status;
}

function getStatusFilterLabel(status: StopageStatus | 'ALL'): string {
  if (status === 'ALL') return 'Tất cả';
  return getStatusLabel(status);
}

function getReasonIcon(reason: StopageReason): any {
  const icons: Record<StopageReason, string> = {
    [StopageReason.HEAVY_RAIN]: 'rainy',
    [StopageReason.STRONG_WIND]: 'leaf',
    [StopageReason.EXTREME_HEAT]: 'sunny',
    [StopageReason.THUNDERSTORM]: 'thunderstorm',
    [StopageReason.FLOOD]: 'water',
    [StopageReason.POOR_VISIBILITY]: 'eye-off',
    [StopageReason.UNSAFE_CONDITIONS]: 'warning',
    [StopageReason.EQUIPMENT_SAFETY]: 'construct',
    [StopageReason.WORKER_SAFETY]: 'people',
    [StopageReason.OTHER]: 'alert-circle',
  };
  return icons[reason] || 'alert-circle';
}

function getReasonLabel(reason: StopageReason): string {
  const labels: Record<StopageReason, string> = {
    [StopageReason.HEAVY_RAIN]: 'Mưa to',
    [StopageReason.STRONG_WIND]: 'Gió mạnh',
    [StopageReason.EXTREME_HEAT]: 'Nắng nóng',
    [StopageReason.THUNDERSTORM]: 'Dông bão',
    [StopageReason.FLOOD]: 'Lũ lụt',
    [StopageReason.POOR_VISIBILITY]: 'Tầm nhìn kém',
    [StopageReason.UNSAFE_CONDITIONS]: 'Điều kiện không an toàn',
    [StopageReason.EQUIPMENT_SAFETY]: 'An toàn thiết bị',
    [StopageReason.WORKER_SAFETY]: 'An toàn công nhân',
    [StopageReason.OTHER]: 'Khác',
  };
  return labels[reason] || reason;
}

function getActivityLabel(activity: WorkActivityType): string {
  const labels: Record<WorkActivityType, string> = {
    [WorkActivityType.EXCAVATION]: 'Đào đất',
    [WorkActivityType.FOUNDATION]: 'Móng',
    [WorkActivityType.CONCRETE_POURING]: 'Đổ bê tông',
    [WorkActivityType.STEEL_ERECTION]: 'Dựng thép',
    [WorkActivityType.MASONRY]: 'Xây gạch',
    [WorkActivityType.ROOFING]: 'Lợp mái',
    [WorkActivityType.EXTERIOR_FINISHING]: 'Hoàn thiện ngoại thất',
    [WorkActivityType.PAINTING_EXTERIOR]: 'Sơn ngoại thất',
    [WorkActivityType.CRANE_OPERATIONS]: 'Vận hành cần cẩu',
    [WorkActivityType.SCAFFOLDING]: 'Giàn giáo',
    [WorkActivityType.ELECTRICAL_OUTDOOR]: 'Điện ngoài trời',
    [WorkActivityType.PLUMBING_OUTDOOR]: 'Ống nước ngoài trời',
    [WorkActivityType.LANDSCAPING]: 'Cảnh quan',
    [WorkActivityType.PAVING]: 'Lát đường',
    [WorkActivityType.OTHER]: 'Khác',
  };
  return labels[activity] || activity;
}

function getSafetyRiskColor(risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'): string {
  switch (risk) {
    case 'LOW':
      return '#4CAF50';
    case 'MEDIUM':
      return '#FF9800';
    case 'HIGH':
      return '#F44336';
    case 'CRITICAL':
      return '#B71C1C';
    default:
      return '#9E9E9E';
  }
}

function getSafetyRiskLabel(risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'): string {
  const labels = {
    LOW: 'Thấp',
    MEDIUM: 'Trung bình',
    HIGH: 'Cao',
    CRITICAL: 'Nghiêm trọng',
  };
  return labels[risk] || risk;
}

const styles = StyleSheet.create({
  statsHeader: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statValueActive: {
    color: '#F44336',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  filterTabActive: {
    borderBottomColor: '#2196F3',
  },
  filterTabText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
  },
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
  },
  stoppageHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
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
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    color: '#FFF',
    fontWeight: 'bold',
  },
  timeSection: {
    gap: 8,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeLabel: {
    fontSize: 13,
    color: '#666',
  },
  timeValue: {
    fontSize: 13,
    color: '#333',
    flex: 1,
  },
  activitiesSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  activityTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activityTag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  activityTagText: {
    fontSize: 12,
    color: '#1976D2',
  },
  impactSection: {
    gap: 8,
    marginBottom: 16,
  },
  impactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  impactText: {
    fontSize: 13,
    color: '#666',
  },
  safetyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  safetyText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: 'bold',
  },
  decisionSection: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  decisionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 6,
  },
  decisionReasoning: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
    marginBottom: 8,
  },
  decisionMeta: {
    fontSize: 11,
    color: '#999',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  completeButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
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
    borderColor: '#F44336',
  },
  cancelButtonText: {
    color: '#F44336',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
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
    fontSize: 18,
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
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#FFF',
  },
  reasonChipActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  reasonChipText: {
    fontSize: 13,
    color: '#666',
  },
  reasonChipTextActive: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  activityChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activityChip: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#FFF',
    gap: 4,
    alignItems: 'center',
  },
  activityChipActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  activityChipText: {
    fontSize: 12,
    color: '#666',
  },
  activityChipTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  riskChips: {
    flexDirection: 'row',
    gap: 8,
  },
  riskChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  riskChipActive: {
    backgroundColor: '#F5F5F5',
  },
  riskChipText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  cancelModalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  cancelModalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  createModalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#2196F3',
    alignItems: 'center',
  },
  createModalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
});
