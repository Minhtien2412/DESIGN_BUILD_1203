/**
 * PPE Inventory Screen
 * Manage personal protective equipment inventory and distribution
 */

import { Loader } from '@/components/ui/loader';
import { usePPEItems } from '@/hooks/useSafety';
import {
    PPECondition,
    PPEType,
    type CreatePPEParams,
    type PPEItem,
} from '@/types/safety';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
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

export default function PPEInventoryScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const [filter, setFilter] = useState<'all' | 'good' | 'needsReplacement'>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { items, loading, error, create, refetch } = usePPEItems({
    projectId: projectId || '',
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (loading && items.length === 0) {
    return <Loader />;
  }

  const goodCondition = items.filter(
    (i) => i.condition === PPECondition.NEW || i.condition === PPECondition.GOOD
  );
  const needsReplacement = items.filter(
    (i) =>
      i.condition === PPECondition.WORN ||
      i.condition === PPECondition.DAMAGED ||
      i.condition === PPECondition.EXPIRED
  );

  const filteredItems =
    filter === 'good'
      ? goodCondition
      : filter === 'needsReplacement'
      ? needsReplacement
      : items;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Quản lý PPE',
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
          <Text style={styles.statValue}>{items.length}</Text>
          <Text style={styles.statLabel}>Tổng số</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#4CAF50' }]}>{goodCondition.length}</Text>
          <Text style={styles.statLabel}>Tốt</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#F44336' }]}>
            {needsReplacement.length}
          </Text>
          <Text style={styles.statLabel}>Cần thay</Text>
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
          style={[styles.filterTab, filter === 'good' && styles.filterTabActive]}
          onPress={() => setFilter('good')}
        >
          <Text style={[styles.filterTabText, filter === 'good' && styles.filterTabTextActive]}>
            Tình trạng tốt
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'needsReplacement' && styles.filterTabActive]}
          onPress={() => setFilter('needsReplacement')}
        >
          <Text
            style={[
              styles.filterTabText,
              filter === 'needsReplacement' && styles.filterTabTextActive,
            ]}
          >
            Cần thay thế
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PPECard item={item} />}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="shield-checkmark" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Chưa có thiết bị PPE nào</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
              <Text style={styles.addButtonText}>Thêm thiết bị</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Add PPE Modal */}
      <AddPPEModal
        visible={modalVisible}
        projectId={projectId || ''}
        onClose={() => setModalVisible(false)}
        onCreate={async (params) => {
          try {
            await create(params);
            setModalVisible(false);
            Alert.alert('Thành công', 'Đã thêm thiết bị PPE');
          } catch (err) {
            Alert.alert('Lỗi', 'Không thể thêm thiết bị PPE');
          }
        }}
      />
    </>
  );
}

interface PPECardProps {
  item: PPEItem;
}

function PPECard({ item }: PPECardProps) {
  const conditionColor = getConditionColor(item.condition);
  const typeIcon = getPPEIcon(item.type);

  return (
    <TouchableOpacity
      style={styles.ppeCard}
      onPress={() => router.push(`/safety/ppe/${item.id}`)}
    >
      <View style={styles.ppeHeader}>
        <View style={[styles.typeIcon, { backgroundColor: `${conditionColor}15` }]}>
          <Ionicons name={typeIcon} size={28} color={conditionColor} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.ppeName}>{item.name}</Text>
          <Text style={styles.ppeType}>{getPPETypeLabel(item.type)}</Text>
        </View>
        <View style={[styles.conditionBadge, { backgroundColor: conditionColor }]}>
          <Text style={styles.conditionText}>{getConditionLabel(item.condition)}</Text>
        </View>
      </View>

      <View style={styles.ppeInfo}>
        <View style={styles.infoRow}>
          <Ionicons name="cube" size={16} color="#666" />
          <Text style={styles.infoText}>Số lượng: {item.quantity}</Text>
        </View>
        {item.manufacturer && (
          <View style={styles.infoRow}>
            <Ionicons name="business" size={16} color="#666" />
            <Text style={styles.infoText}>{item.manufacturer}</Text>
          </View>
        )}
        {item.location && (
          <View style={styles.infoRow}>
            <Ionicons name="location" size={16} color="#666" />
            <Text style={styles.infoText}>{item.location}</Text>
          </View>
        )}
        {item.assignedTo && (
          <View style={styles.infoRow}>
            <Ionicons name="person" size={16} color="#666" />
            <Text style={styles.infoText}>Đã cấp: {item.assignedTo}</Text>
          </View>
        )}
      </View>

      {item.expiryDate && (
        <View style={styles.expiryInfo}>
          <Ionicons name="time" size={14} color="#FF9800" />
          <Text style={styles.expiryText}>
            Hết hạn: {new Date(item.expiryDate).toLocaleDateString('vi-VN')}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

interface AddPPEModalProps {
  visible: boolean;
  projectId: string;
  onClose: () => void;
  onCreate: (params: CreatePPEParams) => Promise<void>;
}

function AddPPEModal({ visible, projectId, onClose, onCreate }: AddPPEModalProps) {
  const [type, setType] = useState<PPEType>(PPEType.HARD_HAT);
  const [name, setName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [model, setModel] = useState('');
  const [size, setSize] = useState('');
  const [condition, setCondition] = useState<PPECondition>(PPECondition.NEW);
  const [quantity, setQuantity] = useState('0');
  const [unitCost, setUnitCost] = useState('');
  const [location, setLocation] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên thiết bị');
      return;
    }
    if (parseInt(quantity) <= 0) {
      Alert.alert('Lỗi', 'Số lượng phải lớn hơn 0');
      return;
    }

    setCreating(true);
    try {
      await onCreate({
        projectId,
        type,
        name: name.trim(),
        manufacturer: manufacturer.trim() || undefined,
        model: model.trim() || undefined,
        size: size.trim() || undefined,
        condition,
        quantity: parseInt(quantity),
        unitCost: unitCost ? parseFloat(unitCost) : undefined,
        location: location.trim() || undefined,
      });
      // Reset form
      setType(PPEType.HARD_HAT);
      setName('');
      setManufacturer('');
      setModel('');
      setSize('');
      setCondition(PPECondition.NEW);
      setQuantity('0');
      setUnitCost('');
      setLocation('');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Thêm thiết bị PPE</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <Text style={styles.inputLabel}>Loại PPE *</Text>
            <View style={styles.typeChips}>
              {Object.values(PPEType).slice(0, 8).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeChip, type === t && styles.typeChipActive]}
                  onPress={() => setType(t)}
                >
                  <Ionicons name={getPPEIcon(t)} size={18} color={type === t ? '#FFF' : '#666'} />
                  <Text style={[styles.typeChipText, type === t && styles.typeChipTextActive]}>
                    {getPPETypeLabel(t)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Tên thiết bị *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="VD: Mũ bảo hộ Delta Plus"
            />

            <Text style={styles.inputLabel}>Nhà sản xuất</Text>
            <TextInput style={styles.input} value={manufacturer} onChangeText={setManufacturer} />

            <Text style={styles.inputLabel}>Model</Text>
            <TextInput style={styles.input} value={model} onChangeText={setModel} />

            <Text style={styles.inputLabel}>Kích cỡ</Text>
            <TextInput style={styles.input} value={size} onChangeText={setSize} />

            <Text style={styles.inputLabel}>Tình trạng</Text>
            <View style={styles.conditionChips}>
              {Object.values(PPECondition).map((c) => (
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

            <Text style={styles.inputLabel}>Số lượng *</Text>
            <TextInput
              style={styles.input}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="number-pad"
            />

            <Text style={styles.inputLabel}>Đơn giá (VNĐ)</Text>
            <TextInput
              style={styles.input}
              value={unitCost}
              onChangeText={setUnitCost}
              keyboardType="decimal-pad"
            />

            <Text style={styles.inputLabel}>Vị trí lưu trữ</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="VD: Kho A, Kệ 3"
            />
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.createButton, creating && styles.buttonDisabled]}
              onPress={handleCreate}
              disabled={creating}
            >
              <Text style={styles.createButtonText}>{creating ? 'Đang tạo...' : 'Thêm'}</Text>
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
      return '#4CAF50';
    case PPECondition.GOOD:
      return '#10B981';
    case PPECondition.FAIR:
      return '#FF9800';
    case PPECondition.WORN:
      return '#F44336';
    case PPECondition.DAMAGED:
      return '#B71C1C';
    case PPECondition.EXPIRED:
      return '#9E9E9E';
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

function getPPEIcon(type: PPEType): any {
  const icons: Partial<Record<PPEType, string>> = {
    [PPEType.HARD_HAT]: 'construct',
    [PPEType.SAFETY_GLASSES]: 'glasses',
    [PPEType.GLOVES]: 'hand-left',
    [PPEType.SAFETY_SHOES]: 'footsteps',
    [PPEType.SAFETY_VEST]: 'shirt',
    [PPEType.SAFETY_HARNESS]: 'fitness',
    [PPEType.RESPIRATOR]: 'medical',
    [PPEType.EAR_PROTECTION]: 'ear',
  };
  return icons[type] || 'shield';
}

function getPPETypeLabel(type: PPEType): string {
  const labels: Partial<Record<PPEType, string>> = {
    [PPEType.HARD_HAT]: 'Mũ bảo hộ',
    [PPEType.SAFETY_GLASSES]: 'Kính bảo hộ',
    [PPEType.FACE_SHIELD]: 'Tấm chắn mặt',
    [PPEType.EAR_PROTECTION]: 'Bảo vệ tai',
    [PPEType.RESPIRATOR]: 'Mặt nạ phòng độc',
    [PPEType.DUST_MASK]: 'Khẩu trang',
    [PPEType.SAFETY_VEST]: 'Áo phản quang',
    [PPEType.GLOVES]: 'Găng tay',
    [PPEType.SAFETY_SHOES]: 'Giày bảo hộ',
    [PPEType.SAFETY_HARNESS]: 'Dây an toàn',
  };
  return labels[type] || type;
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
    borderBottomColor: '#2196F3',
  },
  filterTabText: {
    fontSize: 13,
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
  ppeCard: {
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
  ppeHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  typeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ppeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  ppeType: {
    fontSize: 13,
    color: '#666',
  },
  conditionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
  },
  conditionText: {
    fontSize: 11,
    color: '#FFF',
    fontWeight: 'bold',
  },
  ppeInfo: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
  },
  expiryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF3E0',
    padding: 8,
    borderRadius: 6,
    marginTop: 12,
  },
  expiryText: {
    fontSize: 12,
    color: '#E65100',
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
    backgroundColor: '#2196F3',
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
  typeChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#FFF',
    gap: 6,
  },
  typeChipActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  typeChipText: {
    fontSize: 12,
    color: '#666',
  },
  typeChipTextActive: {
    color: '#FFF',
    fontWeight: 'bold',
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
  createButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#2196F3',
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
});
