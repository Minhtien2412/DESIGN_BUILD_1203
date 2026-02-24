/**
 * PPE Distribution Tracking Screen
 * Track PPE equipment distribution to workers
 */

import { Loader } from '@/components/ui/loader';
import { useAuth } from '@/context/AuthContext';
import { usePPEDistributions } from '@/hooks/useSafety';
import {
    PPECondition,
    type DistributePPEParams,
    type PPEDistribution,
} from '@/types/safety';
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
    View,
} from 'react-native';

export default function PPEDistributionsScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const [filter, setFilter] = useState<'all' | 'active' | 'returned'>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { distributions, loading, error, distribute, returnItem, refetch } = usePPEDistributions({
    projectId: projectId || '',
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (loading && distributions.length === 0) {
    return <Loader />;
  }

  const activeDistributions = distributions.filter((d) => !d.returnedAt);
  const returnedDistributions = distributions.filter((d) => d.returnedAt);

  const filteredDistributions =
    filter === 'active'
      ? activeDistributions
      : filter === 'returned'
      ? returnedDistributions
      : distributions;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Cấp phát PPE',
          headerRight: () => (
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Ionicons name="add-circle" size={28} color="#0D9488" style={{ marginRight: 8 }} />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Stats Header */}
      <View style={styles.statsHeader}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{distributions.length}</Text>
          <Text style={styles.statLabel}>Tổng số</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#0D9488' }]}>{activeDistributions.length}</Text>
          <Text style={styles.statLabel}>Đang cấp</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#0D9488' }]}>{returnedDistributions.length}</Text>
          <Text style={styles.statLabel}>Đã trả</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterTabText, filter === 'all' && styles.filterTabTextActive]}>
            Tất cả
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'active' && styles.filterTabActive]}
          onPress={() => setFilter('active')}
        >
          <Text style={[styles.filterTabText, filter === 'active' && styles.filterTabTextActive]}>
            Đang cấp phát
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'returned' && styles.filterTabActive]}
          onPress={() => setFilter('returned')}
        >
          <Text style={[styles.filterTabText, filter === 'returned' && styles.filterTabTextActive]}>
            Đã hoàn trả
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredDistributions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <DistributionCard distribution={item} />}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Chưa có cấp phát nào</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
              <Text style={styles.addButtonText}>Cấp phát PPE</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Distribute PPE Modal */}
      <DistributePPEModal
        visible={modalVisible}
        projectId={projectId || ''}
        onClose={() => setModalVisible(false)}
        onDistribute={async (params) => {
          try {
            await distribute(params);
            setModalVisible(false);
            Alert.alert('Thành công', 'Đã cấp phát thiết bị PPE');
          } catch (err) {
            Alert.alert('Lỗi', 'Không thể cấp phát thiết bị PPE');
          }
        }}
      />
    </>
  );
}

interface DistributionCardProps {
  distribution: PPEDistribution;
}

function DistributionCard({ distribution }: DistributionCardProps) {
  const isActive = !distribution.returnedAt;
  const conditionColor = getConditionColor(distribution.condition);

  return (
    <View style={[styles.distributionCard, !isActive && styles.distributionCardInactive]}>
      <View style={styles.distributionHeader}>
        <View style={styles.workerInfo}>
          <Ionicons name="person-circle" size={48} color="#0D9488" />
          <View style={{ flex: 1 }}>
            <Text style={styles.workerName}>{distribution.workerName}</Text>
            <Text style={styles.workerId}>ID: {distribution.workerId}</Text>
          </View>
        </View>
        {isActive && (
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>ĐANG CẤP</Text>
          </View>
        )}
      </View>

      <View style={styles.ppeInfo}>
        <View style={styles.infoRow}>
          <Ionicons name="shield" size={16} color="#666" />
          <Text style={styles.infoLabel}>Thiết bị:</Text>
          <Text style={styles.infoValue}>{distribution.ppeItemId}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="cube" size={16} color="#666" />
          <Text style={styles.infoLabel}>Số lượng:</Text>
          <Text style={styles.infoValue}>{distribution.quantity}</Text>
        </View>
        <View style={styles.infoRow}>
          <View style={[styles.conditionDot, { backgroundColor: conditionColor }]} />
          <Text style={styles.infoLabel}>Tình trạng:</Text>
          <Text style={[styles.infoValue, { color: conditionColor }]}>
            {getConditionLabel(distribution.condition)}
          </Text>
        </View>
      </View>

      <View style={styles.timeInfo}>
        <View style={styles.timeRow}>
          <Ionicons name="log-out" size={14} color="#666" />
          <Text style={styles.timeLabel}>Cấp phát:</Text>
          <Text style={styles.timeValue}>
            {new Date(distribution.distributedAt).toLocaleString('vi-VN')}
          </Text>
        </View>
        {distribution.distributedBy && (
          <Text style={styles.metaText}>Người cấp: {distribution.distributedBy}</Text>
        )}
        {distribution.returnedAt && (
          <>
            <View style={styles.timeRow}>
              <Ionicons name="log-in" size={14} color="#0D9488" />
              <Text style={styles.timeLabel}>Hoàn trả:</Text>
              <Text style={[styles.timeValue, { color: '#0D9488' }]}>
                {new Date(distribution.returnedAt).toLocaleString('vi-VN')}
              </Text>
            </View>
            {distribution.returnedQuantity && (
              <Text style={styles.metaText}>Số lượng trả: {distribution.returnedQuantity}</Text>
            )}
            {distribution.returnNotes && (
              <View style={styles.returnNotesBox}>
                <Text style={styles.returnNotesLabel}>Ghi chú hoàn trả:</Text>
                <Text style={styles.returnNotesText}>{distribution.returnNotes}</Text>
              </View>
            )}
          </>
        )}
      </View>

      {distribution.signature && (
        <View style={styles.signatureInfo}>
          <Ionicons name="checkmark-done" size={16} color="#0D9488" />
          <Text style={styles.signatureText}>Đã ký nhận</Text>
        </View>
      )}
    </View>
  );
}

interface DistributePPEModalProps {
  visible: boolean;
  projectId: string;
  onClose: () => void;
  onDistribute: (params: DistributePPEParams) => Promise<void>;
}

function DistributePPEModal({ visible, projectId, onClose, onDistribute }: DistributePPEModalProps) {
  const [ppeItemId, setPpeItemId] = useState('');
  const [workerId, setWorkerId] = useState('');
  const [workerName, setWorkerName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [condition, setCondition] = useState<PPECondition>(PPECondition.NEW);
  const [signature, setSignature] = useState('');
  const [distributing, setDistributing] = useState(false);
  
  const { user } = useAuth();

  const handleDistribute = async () => {
    if (!ppeItemId.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập ID thiết bị PPE');
      return;
    }
    if (!workerId.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập ID công nhân');
      return;
    }
    if (!workerName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên công nhân');
      return;
    }
    if (parseInt(quantity) <= 0) {
      Alert.alert('Lỗi', 'Số lượng phải lớn hơn 0');
      return;
    }

    setDistributing(true);
    try {
      await onDistribute({
        projectId,
        ppeItemId: ppeItemId.trim(),
        workerId: workerId.trim(),
        workerName: workerName.trim(),
        quantity: parseInt(quantity),
        distributedBy: user?.name || user?.email || 'Unknown',
        condition,
        signature: signature.trim() || undefined,
      });
      // Reset form
      setPpeItemId('');
      setWorkerId('');
      setWorkerName('');
      setQuantity('1');
      setCondition(PPECondition.NEW);
      setSignature('');
    } finally {
      setDistributing(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Cấp phát PPE</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <Text style={styles.inputLabel}>ID Thiết bị PPE *</Text>
            <TextInput
              style={styles.input}
              value={ppeItemId}
              onChangeText={setPpeItemId}
              placeholder="Nhập hoặc quét mã thiết bị"
            />

            <Text style={styles.inputLabel}>ID Công nhân *</Text>
            <TextInput
              style={styles.input}
              value={workerId}
              onChangeText={setWorkerId}
              placeholder="Nhập hoặc quét mã công nhân"
            />

            <Text style={styles.inputLabel}>Tên công nhân *</Text>
            <TextInput
              style={styles.input}
              value={workerName}
              onChangeText={setWorkerName}
              placeholder="VD: Nguyễn Văn A"
            />

            <Text style={styles.inputLabel}>Số lượng *</Text>
            <TextInput
              style={styles.input}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="number-pad"
            />

            <Text style={styles.inputLabel}>Tình trạng thiết bị</Text>
            <View style={styles.conditionChips}>
              {Object.values(PPECondition).slice(0, 4).map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.conditionChip,
                    condition === c && styles.conditionChipActive,
                    { borderColor: getConditionColor(c) },
                  ]}
                  onPress={() => setCondition(c)}
                >
                  <Text
                    style={[
                      styles.conditionChipText,
                      condition === c && { color: getConditionColor(c) },
                    ]}
                  >
                    {getConditionLabel(c)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Chữ ký người nhận</Text>
            <TextInput
              style={styles.input}
              value={signature}
              onChangeText={setSignature}
              placeholder="Tùy chọn"
            />

            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color="#0D9488" />
              <Text style={styles.infoBoxText}>
                Người nhận sẽ chịu trách nhiệm bảo quản thiết bị và hoàn trả khi hết nhiệm vụ.
              </Text>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.distributeButton, distributing && styles.buttonDisabled]}
              onPress={handleDistribute}
              disabled={distributing}
            >
              <Text style={styles.distributeButtonText}>
                {distributing ? 'Đang cấp...' : 'Cấp phát'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// Helper functions
function getConditionColor(condition: PPECondition): string {
  switch (condition) {
    case PPECondition.NEW:
      return '#0D9488';
    case PPECondition.GOOD:
      return '#0D9488';
    case PPECondition.FAIR:
      return '#0D9488';
    case PPECondition.WORN:
      return '#000000';
    case PPECondition.DAMAGED:
      return '#B71C1C';
    case PPECondition.EXPIRED:
      return '#999999';
    default:
      return '#666';
  }
}

function getConditionLabel(condition: PPECondition): string {
  const labels: Record<PPECondition, string> = {
    [PPECondition.NEW]: 'Mới',
    [PPECondition.GOOD]: 'Tốt',
    [PPECondition.FAIR]: 'Khá',
    [PPECondition.WORN]: 'Mòn',
    [PPECondition.DAMAGED]: 'Hỏng',
    [PPECondition.EXPIRED]: 'Hết hạn',
  };
  return labels[condition] || condition;
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
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  filterTabActive: {
    borderBottomColor: '#0D9488',
  },
  filterTabText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: '#0D9488',
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
  },
  distributionCard: {
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
  distributionCardInactive: {
    opacity: 0.8,
  },
  distributionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  workerInfo: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
  },
  workerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  workerId: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  activeBadge: {
    backgroundColor: '#0D9488',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadgeText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: 'bold',
  },
  ppeInfo: {
    gap: 8,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: '#666',
  },
  infoValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  conditionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  timeInfo: {
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeLabel: {
    fontSize: 12,
    color: '#666',
  },
  timeValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  metaText: {
    fontSize: 11,
    color: '#999',
    marginLeft: 20,
  },
  returnNotesBox: {
    backgroundColor: '#F5F5F5',
    padding: 10,
    borderRadius: 6,
    marginTop: 6,
  },
  returnNotesLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
    marginBottom: 4,
  },
  returnNotesText: {
    fontSize: 12,
    color: '#333',
  },
  signatureInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E8F5E9',
    padding: 8,
    borderRadius: 6,
    marginTop: 12,
  },
  signatureText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '500',
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
  addButton: {
    backgroundColor: '#0D9488',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
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
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },
  conditionChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  conditionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: '#FFF',
  },
  conditionChipActive: {
    backgroundColor: '#F5F5F5',
  },
  conditionChipText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#F0FDFA',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  infoBoxText: {
    fontSize: 13,
    color: '#1565C0',
    flex: 1,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  distributeButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#0D9488',
    alignItems: 'center',
  },
  distributeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
});
