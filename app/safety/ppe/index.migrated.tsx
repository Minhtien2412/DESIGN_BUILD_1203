/**
 * PPE Inventory Screen - Migrated to Universal Components
 * Using ModuleLayout + UniversalList pattern
 */

import { ModuleLayout } from '@/components/layouts/ModuleLayout';
import { Loader } from '@/components/ui/loader';
import { UniversalCard } from '@/components/universal/UniversalCard';
import { UniversalList } from '@/components/universal/UniversalList';
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
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function PPEInventoryScreen() {
  const params = useLocalSearchParams<{ projectId: string }>();
  const projectId = params.projectId || 'project-1'; // Fallback for backward compatibility
  
  const [filter, setFilter] = useState<'all' | 'good' | 'needsReplacement'>('all');
  const [modalVisible, setModalVisible] = useState(false);

  const { items, loading, error, create, refetch } = usePPEItems({
    projectId,
  });

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

  // Filter function for UniversalList
  const filterItems = (item: PPEItem) => {
    if (filter === 'good') {
      return item.condition === PPECondition.NEW || item.condition === PPECondition.GOOD;
    }
    if (filter === 'needsReplacement') {
      return (
        item.condition === PPECondition.WORN ||
        item.condition === PPECondition.DAMAGED ||
        item.condition === PPECondition.EXPIRED
      );
    }
    return true;
  };

  const filteredItems = items.filter(filterItems);

  return (
    <>
      <Stack.Screen options={{ title: 'Quản lý PPE', headerShown: false }} />

      <ModuleLayout
        title="Quản lý PPE"
        subtitle={`${items.length} thiết bị • ${goodCondition.length} tốt • ${needsReplacement.length} cần thay`}
        showBackButton
        headerRight={
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Ionicons name="add-circle" size={28} color="#0A6847" />
          </TouchableOpacity>
        }
        scrollable={false}
        padding={false}
      >
        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterTabText, filter === 'all' && styles.filterTabTextActive]}>
              Tất cả ({items.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'good' && styles.filterTabActive]}
            onPress={() => setFilter('good')}
          >
            <Text style={[styles.filterTabText, filter === 'good' && styles.filterTabTextActive]}>
              Tốt ({goodCondition.length})
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
              Cần thay ({needsReplacement.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Universal List */}
        <UniversalList<PPEItem>
          config={{
            data: filteredItems,
            keyExtractor: (item) => item.id,
            renderItem: (item) => (
              <UniversalCard
                variant="info"
                icon={getPPEIcon(item.type) as any}
                title={item.name}
                description={`${getPPETypeLabel(item.type)} • SL: ${item.quantity}${
                  item.manufacturer ? ` • ${item.manufacturer}` : ''
                }`}
                badge={getConditionLabel(item.condition)}
                onPress={() => router.push(`/safety/ppe/${item.id}`)}
              />
            ),
            onRefresh: refetch,
            emptyIcon: 'shield-checkmark',
            emptyMessage: 'Chưa có thiết bị PPE nào',
            emptyAction: {
              label: 'Thêm thiết bị',
              onPress: () => setModalVisible(true),
            },
          }}
        />
      </ModuleLayout>

      {/* Add PPE Modal */}
      <AddPPEModal
        visible={modalVisible}
        projectId="project-1"
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

// Helper functions
function getPPEIcon(type: PPEType): string {
  const icons: Partial<Record<PPEType, string>> = {
    [PPEType.HARD_HAT]: 'shield',
    [PPEType.SAFETY_GLASSES]: 'glasses',
    [PPEType.FACE_SHIELD]: 'eye',
    [PPEType.SAFETY_VEST]: 'shirt',
    [PPEType.SAFETY_SHOES]: 'footsteps',
    [PPEType.GLOVES]: 'hand-right',
    [PPEType.EAR_PROTECTION]: 'ear',
    [PPEType.RESPIRATOR]: 'medical',
    [PPEType.DUST_MASK]: 'medkit',
    [PPEType.SAFETY_HARNESS]: 'link',
    [PPEType.COVERALLS]: 'man',
    [PPEType.RAIN_GEAR]: 'umbrella',
    [PPEType.WELDING_HELMET]: 'bonfire',
    [PPEType.KNEE_PADS]: 'fitness',
    [PPEType.OTHER]: 'shield-checkmark',
  };
  return icons[type] || 'shield-checkmark';
}

function getPPETypeLabel(type: PPEType): string {
  const labels: Partial<Record<PPEType, string>> = {
    [PPEType.HARD_HAT]: 'Mũ bảo hộ',
    [PPEType.SAFETY_GLASSES]: 'Kính bảo hộ',
    [PPEType.FACE_SHIELD]: 'Kính che mặt',
    [PPEType.SAFETY_VEST]: 'Áo phản quang',
    [PPEType.SAFETY_SHOES]: 'Giày bảo hộ',
    [PPEType.GLOVES]: 'Găng tay',
    [PPEType.EAR_PROTECTION]: 'Bịt tai',
    [PPEType.RESPIRATOR]: 'Khẩu trang N95',
    [PPEType.DUST_MASK]: 'Khẩu trang',
    [PPEType.SAFETY_HARNESS]: 'Dây an toàn',
    [PPEType.COVERALLS]: 'Quần áo liền',
    [PPEType.RAIN_GEAR]: 'Áo mưa',
    [PPEType.WELDING_HELMET]: 'Mũ hàn',
    [PPEType.KNEE_PADS]: 'Đệm gối',
    [PPEType.OTHER]: 'Khác',
  };
  return labels[type] || 'Khác';
}

function getConditionLabel(condition: PPECondition): string {
  const labels: Record<PPECondition, string> = {
    [PPECondition.NEW]: 'Mới',
    [PPECondition.GOOD]: 'Tốt',
    [PPECondition.FAIR]: 'Trung bình',
    [PPECondition.WORN]: 'Cũ',
    [PPECondition.DAMAGED]: 'Hỏng',
    [PPECondition.EXPIRED]: 'Hết hạn',
  };
  return labels[condition] || 'Không rõ';
}

function getConditionColor(condition: PPECondition): string {
  const colors: Record<PPECondition, string> = {
    [PPECondition.NEW]: '#10B981',
    [PPECondition.GOOD]: '#10B981',
    [PPECondition.FAIR]: '#0A6847',
    [PPECondition.WORN]: '#FF9800',
    [PPECondition.DAMAGED]: '#1A1A1A',
    [PPECondition.EXPIRED]: '#1A1A1A',
  };
  return colors[condition] || '#9E9E9E';
}

// Add PPE Modal Component
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
    if (!name || parseInt(quantity) <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên và số lượng');
      return;
    }

    setCreating(true);
    try {
      await onCreate({
        projectId,
        type,
        name,
        manufacturer,
        model,
        size,
        condition,
        quantity: parseInt(quantity),
        unitCost: unitCost ? parseFloat(unitCost) : undefined,
        location,
      });
      // Reset form
      setName('');
      setManufacturer('');
      setModel('');
      setSize('');
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
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalForm}>
            <Text style={styles.fieldLabel}>Loại thiết bị *</Text>
            <View style={styles.typeGrid}>
              {Object.values(PPEType).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeButton, type === t && styles.typeButtonActive]}
                  onPress={() => setType(t)}
                >
                  <Ionicons
                    name={getPPEIcon(t) as any}
                    size={24}
                    color={type === t ? '#0A6847' : '#666'}
                  />
                  <Text
                    style={[styles.typeButtonText, type === t && styles.typeButtonTextActive]}
                  >
                    {getPPETypeLabel(t)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Tên thiết bị *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Nhập tên thiết bị"
            />

            <Text style={styles.fieldLabel}>Nhà sản xuất</Text>
            <TextInput
              style={styles.input}
              value={manufacturer}
              onChangeText={setManufacturer}
              placeholder="Nhập nhà sản xuất"
            />

            <Text style={styles.fieldLabel}>Số lượng *</Text>
            <TextInput
              style={styles.input}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="number-pad"
              placeholder="0"
            />

            <Text style={styles.fieldLabel}>Tình trạng</Text>
            <View style={styles.conditionGrid}>
              {Object.values(PPECondition).map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.conditionButton,
                    condition === c && { backgroundColor: getConditionColor(c) + '20' },
                  ]}
                  onPress={() => setCondition(c)}
                >
                  <Text
                    style={[
                      styles.conditionButtonText,
                      condition === c && { color: getConditionColor(c) },
                    ]}
                  >
                    {getConditionLabel(c)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Vị trí kho</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="Nhập vị trí kho"
            />
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onClose}
              disabled={creating}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.createButton]}
              onPress={handleCreate}
              disabled={creating}
            >
              <Text style={styles.createButtonText}>
                {creating ? 'Đang thêm...' : 'Thêm thiết bị'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  filterTabs: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: '#0A6847',
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
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
    fontWeight: '700',
    color: '#333',
  },
  modalForm: {
    padding: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    width: '31%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    gap: 4,
  },
  typeButtonActive: {
    borderColor: '#0A6847',
    backgroundColor: '#E3F2FD',
  },
  typeButtonText: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  typeButtonTextActive: {
    color: '#0A6847',
    fontWeight: '600',
  },
  conditionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  conditionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  conditionButtonText: {
    fontSize: 14,
    color: '#666',
  },
  modalActions: {
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
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  createButton: {
    backgroundColor: '#0A6847',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
