/**
 * Equipment List Screen
 * View and manage construction equipment and machinery
 */

import { Loader } from '@/components/ui/loader';
import { useEquipment } from '@/hooks/useEquipment';
import {
    EquipmentCondition,
    EquipmentStatus,
    EquipmentType,
    OwnershipType,
    type CreateEquipmentParams,
    type Equipment,
} from '@/types/equipment';
import { Ionicons } from '@expo/vector-icons';
import { Href, router, Stack, useLocalSearchParams } from 'expo-router';
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

export default function EquipmentListScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const [statusFilter, setStatusFilter] = useState<EquipmentStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { equipment, loading, error, create, refetch } = useEquipment({
    projectId: projectId || '',
    status: statusFilter === 'all' ? undefined : statusFilter,
    search: searchQuery || undefined,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (loading && equipment.length === 0) {
    return <Loader />;
  }

  const availableCount = equipment.filter((e) => e.status === EquipmentStatus.AVAILABLE).length;
  const inUseCount = equipment.filter((e) => e.status === EquipmentStatus.IN_USE).length;
  const maintenanceCount = equipment.filter(
    (e) => e.status === EquipmentStatus.MAINTENANCE || e.status === EquipmentStatus.REPAIR
  ).length;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Thiết bị & Máy móc',
          headerRight: () => (
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Ionicons name="add-circle" size={28} color="#0066CC" style={{ marginRight: 8 }} />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Stats Header */}
      <View style={styles.statsHeader}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{equipment.length}</Text>
          <Text style={styles.statLabel}>Tổng số</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#0066CC' }]}>{availableCount}</Text>
          <Text style={styles.statLabel}>Sẵn sàng</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#0066CC' }]}>{inUseCount}</Text>
          <Text style={styles.statLabel}>Đang dùng</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#0066CC' }]}>{maintenanceCount}</Text>
          <Text style={styles.statLabel}>Bảo trì</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm thiết bị..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterTabs}>
        <TouchableOpacity
          style={[styles.filterChip, statusFilter === 'all' && styles.filterChipActive]}
          onPress={() => setStatusFilter('all')}
        >
          <Text style={[styles.filterChipText, statusFilter === 'all' && styles.filterChipTextActive]}>
            Tất cả
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            statusFilter === EquipmentStatus.AVAILABLE && styles.filterChipActive,
          ]}
          onPress={() => setStatusFilter(EquipmentStatus.AVAILABLE)}
        >
          <Text
            style={[
              styles.filterChipText,
              statusFilter === EquipmentStatus.AVAILABLE && styles.filterChipTextActive,
            ]}
          >
            Sẵn sàng
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            statusFilter === EquipmentStatus.IN_USE && styles.filterChipActive,
          ]}
          onPress={() => setStatusFilter(EquipmentStatus.IN_USE)}
        >
          <Text
            style={[
              styles.filterChipText,
              statusFilter === EquipmentStatus.IN_USE && styles.filterChipTextActive,
            ]}
          >
            Đang sử dụng
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            statusFilter === EquipmentStatus.MAINTENANCE && styles.filterChipActive,
          ]}
          onPress={() => setStatusFilter(EquipmentStatus.MAINTENANCE)}
        >
          <Text
            style={[
              styles.filterChipText,
              statusFilter === EquipmentStatus.MAINTENANCE && styles.filterChipTextActive,
            ]}
          >
            Bảo trì
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            statusFilter === EquipmentStatus.REPAIR && styles.filterChipActive,
          ]}
          onPress={() => setStatusFilter(EquipmentStatus.REPAIR)}
        >
          <Text
            style={[
              styles.filterChipText,
              statusFilter === EquipmentStatus.REPAIR && styles.filterChipTextActive,
            ]}
          >
            Sửa chữa
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <FlatList
        data={equipment}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <EquipmentCard equipment={item} />}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="construct" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Chưa có thiết bị nào</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
              <Text style={styles.addButtonText}>Thêm thiết bị</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Add Equipment Modal */}
      <AddEquipmentModal
        visible={modalVisible}
        projectId={projectId || ''}
        onClose={() => setModalVisible(false)}
        onCreate={async (params) => {
          try {
            await create(params);
            setModalVisible(false);
            Alert.alert('Thành công', 'Đã thêm thiết bị');
          } catch (err) {
            Alert.alert('Lỗi', 'Không thể thêm thiết bị');
          }
        }}
      />
    </>
  );
}

interface EquipmentCardProps {
  equipment: Equipment;
}

function EquipmentCard({ equipment }: EquipmentCardProps) {
  const statusColor = getStatusColor(equipment.status);
  const conditionColor = getConditionColor(equipment.condition);
  const typeIcon = getEquipmentIcon(equipment.type);

  return (
    <TouchableOpacity
      style={styles.equipmentCard}
      onPress={() => router.push(`/equipment/${equipment.id}` as Href)}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.typeIcon, { backgroundColor: `${statusColor}15` }]}>
          <Ionicons name={typeIcon} size={32} color={statusColor} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.titleRow}>
            <Text style={styles.equipmentNumber}>{equipment.equipmentNumber}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
              <Text style={styles.statusText}>{getStatusLabel(equipment.status)}</Text>
            </View>
          </View>
          <Text style={styles.equipmentName}>{equipment.name}</Text>
          <Text style={styles.equipmentType}>{getEquipmentTypeLabel(equipment.type)}</Text>
        </View>
      </View>

      <View style={styles.cardInfo}>
        {equipment.manufacturer && (
          <View style={styles.infoRow}>
            <Ionicons name="business" size={14} color="#666" />
            <Text style={styles.infoText}>{equipment.manufacturer}</Text>
            {equipment.model && <Text style={styles.infoText}> • {equipment.model}</Text>}
          </View>
        )}
        <View style={styles.infoRow}>
          <View style={[styles.conditionDot, { backgroundColor: conditionColor }]} />
          <Text style={styles.infoLabel}>Tình trạng:</Text>
          <Text style={[styles.infoValue, { color: conditionColor }]}>
            {getConditionLabel(equipment.condition)}
          </Text>
        </View>
        {equipment.currentLocation && (
          <View style={styles.infoRow}>
            <Ionicons name="location" size={14} color="#666" />
            <Text style={styles.infoText}>{equipment.currentLocation}</Text>
          </View>
        )}
        {equipment.assignedToName && (
          <View style={styles.infoRow}>
            <Ionicons name="person" size={14} color="#666" />
            <Text style={styles.infoText}>Được cấp cho: {equipment.assignedToName}</Text>
          </View>
        )}
      </View>

      <View style={styles.cardFooter}>
        <View style={[styles.ownershipBadge, { borderColor: getOwnershipColor(equipment.ownershipType) }]}>
          <Ionicons name={getOwnershipIcon(equipment.ownershipType)} size={12} color={getOwnershipColor(equipment.ownershipType)} />
          <Text style={[styles.ownershipText, { color: getOwnershipColor(equipment.ownershipType) }]}>
            {getOwnershipLabel(equipment.ownershipType)}
          </Text>
        </View>
        {equipment.operatingHours !== undefined && (
          <View style={styles.hoursInfo}>
            <Ionicons name="time" size={12} color="#666" />
            <Text style={styles.hoursText}>{equipment.operatingHours} giờ</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

interface AddEquipmentModalProps {
  visible: boolean;
  projectId: string;
  onClose: () => void;
  onCreate: (params: CreateEquipmentParams) => Promise<void>;
}

function AddEquipmentModal({ visible, projectId, onClose, onCreate }: AddEquipmentModalProps) {
  const [type, setType] = useState<EquipmentType>(EquipmentType.EXCAVATOR);
  const [name, setName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [ownershipType, setOwnershipType] = useState<OwnershipType>(OwnershipType.OWNED);
  const [currentLocation, setCurrentLocation] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên thiết bị');
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
        serialNumber: serialNumber.trim() || undefined,
        ownershipType,
        currentLocation: currentLocation.trim() || undefined,
        status: EquipmentStatus.AVAILABLE,
        condition: EquipmentCondition.GOOD,
      });
      // Reset form
      setType(EquipmentType.EXCAVATOR);
      setName('');
      setManufacturer('');
      setModel('');
      setSerialNumber('');
      setOwnershipType(OwnershipType.OWNED);
      setCurrentLocation('');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Thêm thiết bị</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <Text style={styles.inputLabel}>Loại thiết bị *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeChips}>
              {Object.values(EquipmentType).slice(0, 12).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeChip, type === t && styles.typeChipActive]}
                  onPress={() => setType(t)}
                >
                  <Ionicons name={getEquipmentIcon(t)} size={18} color={type === t ? '#FFF' : '#666'} />
                  <Text style={[styles.typeChipText, type === t && styles.typeChipTextActive]}>
                    {getEquipmentTypeLabel(t)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.inputLabel}>Tên thiết bị *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="VD: Máy xúc Komatsu PC200"
            />

            <Text style={styles.inputLabel}>Nhà sản xuất</Text>
            <TextInput style={styles.input} value={manufacturer} onChangeText={setManufacturer} />

            <Text style={styles.inputLabel}>Model</Text>
            <TextInput style={styles.input} value={model} onChangeText={setModel} />

            <Text style={styles.inputLabel}>Số serial</Text>
            <TextInput style={styles.input} value={serialNumber} onChangeText={setSerialNumber} />

            <Text style={styles.inputLabel}>Hình thức sở hữu</Text>
            <View style={styles.ownershipChips}>
              {Object.values(OwnershipType).map((o) => (
                <TouchableOpacity
                  key={o}
                  style={[
                    styles.ownershipChip,
                    ownershipType === o && styles.ownershipChipActive,
                    { borderColor: getOwnershipColor(o) },
                  ]}
                  onPress={() => setOwnershipType(o)}
                >
                  <Ionicons name={getOwnershipIcon(o)} size={16} color={ownershipType === o ? getOwnershipColor(o) : '#666'} />
                  <Text
                    style={[
                      styles.ownershipChipText,
                      ownershipType === o && { color: getOwnershipColor(o) },
                    ]}
                  >
                    {getOwnershipLabel(o)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Vị trí hiện tại</Text>
            <TextInput
              style={styles.input}
              value={currentLocation}
              onChangeText={setCurrentLocation}
              placeholder="VD: Công trường A, Khu vực 1"
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
              <Text style={styles.createButtonText}>{creating ? 'Đang thêm...' : 'Thêm'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// Helper functions
function getStatusColor(status: EquipmentStatus): string {
  switch (status) {
    case EquipmentStatus.AVAILABLE:
      return '#0066CC';
    case EquipmentStatus.IN_USE:
      return '#0066CC';
    case EquipmentStatus.MAINTENANCE:
      return '#0066CC';
    case EquipmentStatus.REPAIR:
      return '#000000';
    case EquipmentStatus.RESERVED:
      return '#999999';
    case EquipmentStatus.OUT_OF_SERVICE:
      return '#999999';
    case EquipmentStatus.RETIRED:
      return '#4A4A4A';
    default:
      return '#666';
  }
}

function getStatusLabel(status: EquipmentStatus): string {
  const labels: Record<EquipmentStatus, string> = {
    [EquipmentStatus.AVAILABLE]: 'SẴN SÀNG',
    [EquipmentStatus.IN_USE]: 'ĐANG DÙNG',
    [EquipmentStatus.MAINTENANCE]: 'BẢO TRÌ',
    [EquipmentStatus.REPAIR]: 'SỬA CHỮA',
    [EquipmentStatus.RESERVED]: 'ĐÃ ĐẶT',
    [EquipmentStatus.OUT_OF_SERVICE]: 'NGỪNG HOẠT ĐỘNG',
    [EquipmentStatus.RETIRED]: 'ĐÃ LOẠI',
  };
  return labels[status] || status;
}

function getConditionColor(condition: EquipmentCondition): string {
  switch (condition) {
    case EquipmentCondition.EXCELLENT:
      return '#0066CC';
    case EquipmentCondition.GOOD:
      return '#0066CC';
    case EquipmentCondition.FAIR:
      return '#0066CC';
    case EquipmentCondition.POOR:
      return '#000000';
    case EquipmentCondition.CRITICAL:
      return '#B71C1C';
    default:
      return '#666';
  }
}

function getConditionLabel(condition: EquipmentCondition): string {
  const labels: Record<EquipmentCondition, string> = {
    [EquipmentCondition.EXCELLENT]: 'Xuất sắc',
    [EquipmentCondition.GOOD]: 'Tốt',
    [EquipmentCondition.FAIR]: 'Khá',
    [EquipmentCondition.POOR]: 'Kém',
    [EquipmentCondition.CRITICAL]: 'Nghiêm trọng',
  };
  return labels[condition] || condition;
}

function getOwnershipColor(ownership: OwnershipType): string {
  switch (ownership) {
    case OwnershipType.OWNED:
      return '#0066CC';
    case OwnershipType.RENTED:
      return '#0066CC';
    case OwnershipType.LEASED:
      return '#0066CC';
    default:
      return '#666';
  }
}

function getOwnershipLabel(ownership: OwnershipType): string {
  const labels: Record<OwnershipType, string> = {
    [OwnershipType.OWNED]: 'Sở hữu',
    [OwnershipType.RENTED]: 'Thuê',
    [OwnershipType.LEASED]: 'Cho thuê',
  };
  return labels[ownership] || ownership;
}

function getOwnershipIcon(ownership: OwnershipType): any {
  switch (ownership) {
    case OwnershipType.OWNED:
      return 'checkmark-circle';
    case OwnershipType.RENTED:
      return 'time';
    case OwnershipType.LEASED:
      return 'swap-horizontal';
    default:
      return 'help-circle';
  }
}

function getEquipmentIcon(type: EquipmentType): any {
  const icons: Partial<Record<EquipmentType, string>> = {
    [EquipmentType.EXCAVATOR]: 'construct',
    [EquipmentType.BULLDOZER]: 'construct',
    [EquipmentType.CRANE]: 'git-network',
    [EquipmentType.FORKLIFT]: 'cube',
    [EquipmentType.CONCRETE_MIXER]: 'sync',
    [EquipmentType.CONCRETE_PUMP]: 'water',
    [EquipmentType.LOADER]: 'cube-outline',
    [EquipmentType.DUMP_TRUCK]: 'car',
    [EquipmentType.GENERATOR]: 'flash',
    [EquipmentType.COMPRESSOR]: 'speedometer',
    [EquipmentType.WELDING_MACHINE]: 'bonfire',
    [EquipmentType.POWER_TOOLS]: 'hammer',
  };
  return icons[type] || 'build';
}

function getEquipmentTypeLabel(type: EquipmentType): string {
  const labels: Partial<Record<EquipmentType, string>> = {
    [EquipmentType.EXCAVATOR]: 'Máy xúc',
    [EquipmentType.BULLDOZER]: 'Máy ủi',
    [EquipmentType.CRANE]: 'Cần cẩu',
    [EquipmentType.FORKLIFT]: 'Xe nâng',
    [EquipmentType.CONCRETE_MIXER]: 'Máy trộn bê tông',
    [EquipmentType.CONCRETE_PUMP]: 'Bơm bê tông',
    [EquipmentType.LOADER]: 'Máy xúc lật',
    [EquipmentType.BACKHOE]: 'Máy đào hố',
    [EquipmentType.DUMP_TRUCK]: 'Xe ben',
    [EquipmentType.GRADER]: 'Máy san',
    [EquipmentType.ROLLER]: 'Máy lu',
    [EquipmentType.GENERATOR]: 'Máy phát điện',
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  filterTabs: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#FFF',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#0066CC',
    borderColor: '#0066CC',
  },
  filterChipText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
  },
  equipmentCard: {
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
  cardHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  typeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  equipmentNumber: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: 'bold',
  },
  equipmentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  equipmentType: {
    fontSize: 13,
    color: '#666',
  },
  cardInfo: {
    gap: 6,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  conditionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  ownershipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  ownershipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  hoursInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hoursText: {
    fontSize: 11,
    color: '#666',
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
    backgroundColor: '#0066CC',
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
    marginBottom: 8,
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
    marginRight: 8,
  },
  typeChipActive: {
    backgroundColor: '#0066CC',
    borderColor: '#0066CC',
  },
  typeChipText: {
    fontSize: 12,
    color: '#666',
  },
  typeChipTextActive: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  ownershipChips: {
    flexDirection: 'row',
    gap: 8,
  },
  ownershipChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    backgroundColor: '#FFF',
    gap: 6,
  },
  ownershipChipActive: {
    backgroundColor: '#F5F5F5',
  },
  ownershipChipText: {
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
    backgroundColor: '#0066CC',
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
