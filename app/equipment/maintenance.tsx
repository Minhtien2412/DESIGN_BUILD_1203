/**
 * Equipment Maintenance Screen
 * Track and manage equipment maintenance records
 */

import { Loader } from '@/components/ui/loader';
import { useMaintenanceRecords } from '@/hooks/useEquipment';
import {
    MaintenanceStatus,
    MaintenanceType,
    type CreateMaintenanceRecordParams,
    type MaintenanceRecord,
} from '@/types/equipment';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
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

export default function EquipmentMaintenanceScreen() {
  const { projectId, equipmentId } = useLocalSearchParams<{ projectId?: string; equipmentId?: string }>();
  const [statusFilter, setStatusFilter] = useState<MaintenanceStatus | 'all'>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { records, loading, error, create, refetch } = useMaintenanceRecords({
    equipmentId,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (loading && records.length === 0) {
    return <Loader />;
  }

  const filteredRecords = statusFilter === 'all' ? records : records.filter((r) => r.status === statusFilter);

  const scheduledCount = records.filter((r) => r.status === MaintenanceStatus.SCHEDULED).length;
  const inProgressCount = records.filter((r) => r.status === MaintenanceStatus.IN_PROGRESS).length;
  const overdueCount = records.filter((r) => r.status === MaintenanceStatus.OVERDUE).length;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Bảo trì thiết bị',
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
          <Text style={styles.statValue}>{records.length}</Text>
          <Text style={styles.statLabel}>Tổng số</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#2196F3' }]}>{scheduledCount}</Text>
          <Text style={styles.statLabel}>Đã lên lịch</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#FF9800' }]}>{inProgressCount}</Text>
          <Text style={styles.statLabel}>Đang thực hiện</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#F44336' }]}>{overdueCount}</Text>
          <Text style={styles.statLabel}>Quá hạn</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        <TouchableOpacity
          style={[styles.filterTab, statusFilter === 'all' && styles.filterTabActive]}
          onPress={() => setStatusFilter('all')}
        >
          <Text style={[styles.filterTabText, statusFilter === 'all' && styles.filterTabTextActive]}>
            Tất cả
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, statusFilter === MaintenanceStatus.SCHEDULED && styles.filterTabActive]}
          onPress={() => setStatusFilter(MaintenanceStatus.SCHEDULED)}
        >
          <Text style={[styles.filterTabText, statusFilter === MaintenanceStatus.SCHEDULED && styles.filterTabTextActive]}>
            Đã lên lịch
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, statusFilter === MaintenanceStatus.IN_PROGRESS && styles.filterTabActive]}
          onPress={() => setStatusFilter(MaintenanceStatus.IN_PROGRESS)}
        >
          <Text style={[styles.filterTabText, statusFilter === MaintenanceStatus.IN_PROGRESS && styles.filterTabTextActive]}>
            Đang thực hiện
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, statusFilter === MaintenanceStatus.COMPLETED && styles.filterTabActive]}
          onPress={() => setStatusFilter(MaintenanceStatus.COMPLETED)}
        >
          <Text style={[styles.filterTabText, statusFilter === MaintenanceStatus.COMPLETED && styles.filterTabTextActive]}>
            Hoàn thành
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredRecords}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MaintenanceCard record={item} />}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="build" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Chưa có lịch bảo trì nào</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
              <Text style={styles.addButtonText}>Lên lịch bảo trì</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Add Maintenance Modal */}
      <AddMaintenanceModal
        visible={modalVisible}
        equipmentId={equipmentId}
        onClose={() => setModalVisible(false)}
        onCreate={async (params) => {
          try {
            await create(params);
            setModalVisible(false);
            Alert.alert('Thành công', 'Đã lên lịch bảo trì');
          } catch (err) {
            Alert.alert('Lỗi', 'Không thể lên lịch bảo trì');
          }
        }}
      />
    </>
  );
}

interface MaintenanceCardProps {
  record: MaintenanceRecord;
}

function MaintenanceCard({ record }: MaintenanceCardProps) {
  const statusColor = getStatusColor(record.status);
  const typeIcon = getMaintenanceIcon(record.type);
  const isOverdue = record.status === MaintenanceStatus.OVERDUE;

  return (
    <TouchableOpacity
      style={[styles.maintenanceCard, isOverdue && styles.maintenanceCardOverdue]}
      onPress={() => router.push(`/equipment/maintenance/${record.id}` as Href)}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.typeIcon, { backgroundColor: `${statusColor}15` }]}>
          <Ionicons name={typeIcon} size={28} color={statusColor} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.maintenanceTitle}>{record.title}</Text>
          <Text style={styles.equipmentName}>{record.equipmentName}</Text>
          <View style={styles.typeRow}>
            <Text style={styles.typeLabel}>{getMaintenanceTypeLabel(record.type)}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{getStatusLabel(record.status)}</Text>
        </View>
      </View>

      <View style={styles.cardInfo}>
        <View style={styles.infoRow}>
          <Ionicons name="calendar" size={14} color="#666" />
          <Text style={styles.infoLabel}>Lên lịch:</Text>
          <Text style={styles.infoValue}>
            {new Date(record.scheduledDate).toLocaleDateString('vi-VN')}
          </Text>
        </View>
        {record.technician && (
          <View style={styles.infoRow}>
            <Ionicons name="person" size={14} color="#666" />
            <Text style={styles.infoLabel}>Kỹ thuật viên:</Text>
            <Text style={styles.infoValue}>{record.technicianName || record.technician}</Text>
          </View>
        )}
        {record.totalCost && (
          <View style={styles.infoRow}>
            <Ionicons name="cash" size={14} color="#666" />
            <Text style={styles.infoLabel}>Chi phí:</Text>
            <Text style={styles.infoValue}>
              {record.totalCost.toLocaleString('vi-VN')} VNĐ
            </Text>
          </View>
        )}
        {record.downtimeHours && (
          <View style={styles.infoRow}>
            <Ionicons name="time" size={14} color="#FF9800" />
            <Text style={styles.infoLabel}>Thời gian ngừng:</Text>
            <Text style={styles.infoValue}>{record.downtimeHours} giờ</Text>
          </View>
        )}
      </View>

      {record.completedAt && (
        <View style={styles.completedInfo}>
          <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
          <Text style={styles.completedText}>
            Hoàn thành: {new Date(record.completedAt).toLocaleDateString('vi-VN')}
          </Text>
        </View>
      )}

      {record.partsReplaced && record.partsReplaced.length > 0 && (
        <View style={styles.partsInfo}>
          <Text style={styles.partsLabel}>Linh kiện thay thế: {record.partsReplaced.length}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

interface AddMaintenanceModalProps {
  visible: boolean;
  equipmentId?: string;
  onClose: () => void;
  onCreate: (params: CreateMaintenanceRecordParams) => Promise<void>;
}

function AddMaintenanceModal({ visible, equipmentId, onClose, onCreate }: AddMaintenanceModalProps) {
  const [selectedEquipmentId, setSelectedEquipmentId] = useState(equipmentId || '');
  const [type, setType] = useState<MaintenanceType>(MaintenanceType.PREVENTIVE);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledDate, setScheduledDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [technician, setTechnician] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!selectedEquipmentId.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập ID thiết bị');
      return;
    }
    if (!title.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mô tả');
      return;
    }

    setCreating(true);
    try {
      await onCreate({
        equipmentId: selectedEquipmentId.trim(),
        type,
        title: title.trim(),
        description: description.trim(),
        scheduledDate: scheduledDate.toISOString(),
        technician: technician.trim() || undefined,
      });
      // Reset form
      setSelectedEquipmentId(equipmentId || '');
      setType(MaintenanceType.PREVENTIVE);
      setTitle('');
      setDescription('');
      setScheduledDate(new Date());
      setTechnician('');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Lên lịch bảo trì</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <Text style={styles.inputLabel}>ID Thiết bị *</Text>
            <TextInput
              style={styles.input}
              value={selectedEquipmentId}
              onChangeText={setSelectedEquipmentId}
              placeholder="Nhập ID thiết bị"
              editable={!equipmentId}
            />

            <Text style={styles.inputLabel}>Loại bảo trì *</Text>
            <View style={styles.typeChips}>
              {Object.values(MaintenanceType).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeChip, type === t && styles.typeChipActive]}
                  onPress={() => setType(t)}
                >
                  <Ionicons name={getMaintenanceIcon(t)} size={16} color={type === t ? '#FFF' : '#666'} />
                  <Text style={[styles.typeChipText, type === t && styles.typeChipTextActive]}>
                    {getMaintenanceTypeLabel(t)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Tiêu đề *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="VD: Bảo dưỡng định kỳ 500 giờ"
            />

            <Text style={styles.inputLabel}>Mô tả *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Mô tả công việc cần thực hiện"
              multiline
              numberOfLines={4}
            />

            <Text style={styles.inputLabel}>Ngày thực hiện *</Text>
            <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
              <Ionicons name="calendar" size={20} color="#666" />
              <Text style={styles.dateButtonText}>{scheduledDate.toLocaleDateString('vi-VN')}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={scheduledDate}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowDatePicker(false);
                  if (date) setScheduledDate(date);
                }}
              />
            )}

            <Text style={styles.inputLabel}>Kỹ thuật viên</Text>
            <TextInput
              style={styles.input}
              value={technician}
              onChangeText={setTechnician}
              placeholder="VD: Nguyễn Văn A"
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
              <Text style={styles.createButtonText}>{creating ? 'Đang tạo...' : 'Lên lịch'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// Helper functions
function getStatusColor(status: MaintenanceStatus): string {
  switch (status) {
    case MaintenanceStatus.SCHEDULED:
      return '#2196F3';
    case MaintenanceStatus.IN_PROGRESS:
      return '#FF9800';
    case MaintenanceStatus.COMPLETED:
      return '#4CAF50';
    case MaintenanceStatus.CANCELLED:
      return '#9E9E9E';
    case MaintenanceStatus.OVERDUE:
      return '#F44336';
    default:
      return '#666';
  }
}

function getStatusLabel(status: MaintenanceStatus): string {
  const labels: Record<MaintenanceStatus, string> = {
    [MaintenanceStatus.SCHEDULED]: 'ĐÃ LÊN LỊCH',
    [MaintenanceStatus.IN_PROGRESS]: 'ĐANG THỰC HIỆN',
    [MaintenanceStatus.COMPLETED]: 'HOÀN THÀNH',
    [MaintenanceStatus.CANCELLED]: 'ĐÃ HỦY',
    [MaintenanceStatus.OVERDUE]: 'QUÁ HẠN',
  };
  return labels[status] || status;
}

function getMaintenanceIcon(type: MaintenanceType): any {
  const icons: Record<MaintenanceType, string> = {
    [MaintenanceType.PREVENTIVE]: 'shield-checkmark',
    [MaintenanceType.CORRECTIVE]: 'build',
    [MaintenanceType.PREDICTIVE]: 'analytics',
    [MaintenanceType.EMERGENCY]: 'warning',
    [MaintenanceType.INSPECTION]: 'eye',
    [MaintenanceType.CALIBRATION]: 'settings',
  };
  return icons[type] || 'build';
}

function getMaintenanceTypeLabel(type: MaintenanceType): string {
  const labels: Record<MaintenanceType, string> = {
    [MaintenanceType.PREVENTIVE]: 'Phòng ngừa',
    [MaintenanceType.CORRECTIVE]: 'Sửa chữa',
    [MaintenanceType.PREDICTIVE]: 'Dự đoán',
    [MaintenanceType.EMERGENCY]: 'Khẩn cấp',
    [MaintenanceType.INSPECTION]: 'Kiểm tra',
    [MaintenanceType.CALIBRATION]: 'Hiệu chuẩn',
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
    fontSize: 11,
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
    fontSize: 11,
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
  maintenanceCard: {
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
  maintenanceCardOverdue: {
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  cardHeader: {
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
  maintenanceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  equipmentName: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  typeRow: {
    flexDirection: 'row',
  },
  typeLabel: {
    fontSize: 11,
    color: '#2196F3',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 9,
    color: '#FFF',
    fontWeight: 'bold',
  },
  cardInfo: {
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
  },
  infoValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  completedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E8F5E9',
    padding: 8,
    borderRadius: 6,
    marginTop: 12,
  },
  completedText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '500',
  },
  partsInfo: {
    backgroundColor: '#E3F2FD',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  partsLabel: {
    fontSize: 11,
    color: '#1565C0',
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
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
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
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dateButtonText: {
    fontSize: 14,
    color: '#333',
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
