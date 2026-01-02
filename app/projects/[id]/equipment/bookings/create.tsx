import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import {
    Equipment,
    EquipmentService,
} from '@/services/api/equipment.mock';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function CreateBookingScreen() {
  const { id: projectId } = useLocalSearchParams<{ id: string }>();

  const [availableEquipment, setAvailableEquipment] = useState<Equipment[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [showEquipmentPicker, setShowEquipmentPicker] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [purpose, setPurpose] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAvailableEquipment();
  }, []);

  const loadAvailableEquipment = async () => {
    try {
      const equipment = await EquipmentService.getEquipment({ available: true });
      setAvailableEquipment(equipment);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải danh sách thiết bị');
    }
  };

  const handleSelectEquipment = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setShowEquipmentPicker(false);
  };

  const handleSubmit = async () => {
    // Validation
    if (!selectedEquipment) {
      Alert.alert('Thiếu thông tin', 'Vui lòng chọn thiết bị');
      return;
    }

    if (!startDate || !endDate) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập ngày bắt đầu và kết thúc');
      return;
    }

    if (!purpose.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập mục đích sử dụng');
      return;
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      Alert.alert('Lỗi', 'Định dạng ngày không hợp lệ (dd/mm/yyyy)');
      return;
    }

    if (end <= start) {
      Alert.alert('Lỗi', 'Ngày kết thúc phải sau ngày bắt đầu');
      return;
    }

    try {
      setLoading(true);

      await EquipmentService.createBooking({
        equipmentId: selectedEquipment.id,
        equipmentName: selectedEquipment.name,
        projectId: projectId || 'project-1',
        projectName: 'Dự án hiện tại',
        bookedBy: 'Current User',
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        status: 'pending',
        purpose: purpose.trim(),
        notes: notes.trim() || undefined,
      });

      Alert.alert('Thành công', 'Yêu cầu đặt thiết bị đã được tạo', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tạo yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  const formatDateInput = (text: string, currentValue: string): string => {
    // Remove non-numeric characters
    const numbers = text.replace(/\D/g, '');
    
    // Format as dd/mm/yyyy
    let formatted = '';
    if (numbers.length >= 1) {
      formatted = numbers.substring(0, 2);
    }
    if (numbers.length >= 3) {
      formatted += '/' + numbers.substring(2, 4);
    }
    if (numbers.length >= 5) {
      formatted += '/' + numbers.substring(4, 8);
    }
    
    return formatted;
  };

  return (
    <Container fullWidth>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đặt thiết bị</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Equipment Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Thiết bị</Text>
            
            {!selectedEquipment ? (
              <TouchableOpacity
                style={styles.equipmentPickerButton}
                onPress={() => setShowEquipmentPicker(!showEquipmentPicker)}
              >
                <Ionicons name="hardware-chip-outline" size={24} color="#6b7280" />
                <Text style={styles.equipmentPickerText}>Chọn thiết bị</Text>
                <Ionicons 
                  name={showEquipmentPicker ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="#6b7280" 
                />
              </TouchableOpacity>
            ) : (
              <View style={styles.selectedEquipmentCard}>
                <View style={styles.selectedEquipmentInfo}>
                  <Text style={styles.selectedEquipmentName}>{selectedEquipment.name}</Text>
                  <Text style={styles.selectedEquipmentDetails}>
                    {selectedEquipment.model} • {selectedEquipment.location}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setSelectedEquipment(null)}
                  style={styles.removeButton}
                >
                  <Ionicons name="close-circle" size={24} color="#ef4444" />
                </TouchableOpacity>
              </View>
            )}

            {showEquipmentPicker && !selectedEquipment && (
              <ScrollView style={styles.equipmentList} nestedScrollEnabled>
                {availableEquipment.length === 0 ? (
                  <View style={styles.emptyEquipment}>
                    <Text style={styles.emptyEquipmentText}>Không có thiết bị khả dụng</Text>
                  </View>
                ) : (
                  availableEquipment.map(equipment => (
                    <TouchableOpacity
                      key={equipment.id}
                      style={styles.equipmentItem}
                      onPress={() => handleSelectEquipment(equipment)}
                    >
                      <View>
                        <Text style={styles.equipmentItemName}>{equipment.name}</Text>
                        <Text style={styles.equipmentItemDetails}>
                          {equipment.model} • {equipment.location}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            )}
          </View>

          {/* Date Range */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Thời gian sử dụng</Text>
            
            <View style={styles.dateRow}>
              <View style={styles.dateInputContainer}>
                <Text style={styles.inputLabel}>Từ ngày</Text>
                <TextInput
                  style={styles.dateInput}
                  placeholder="dd/mm/yyyy"
                  value={startDate}
                  onChangeText={(text) => setStartDate(formatDateInput(text, startDate))}
                  keyboardType="numeric"
                  maxLength={10}
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.dateInputContainer}>
                <Text style={styles.inputLabel}>Đến ngày</Text>
                <TextInput
                  style={styles.dateInput}
                  placeholder="dd/mm/yyyy"
                  value={endDate}
                  onChangeText={(text) => setEndDate(formatDateInput(text, endDate))}
                  keyboardType="numeric"
                  maxLength={10}
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            <Text style={styles.dateHint}>
              <Ionicons name="information-circle-outline" size={14} color="#6b7280" />
              {' '}Nhập ngày theo định dạng: ngày/tháng/năm
            </Text>
          </View>

          {/* Purpose */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Mục đích sử dụng *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ví dụ: Đổ bê tông tầng 3, Hàn kết cấu thép..."
              value={purpose}
              onChangeText={setPurpose}
              multiline
              numberOfLines={2}
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Ghi chú</Text>
            <TextInput
              style={[styles.textInput, styles.notesInput]}
              placeholder="Yêu cầu đặc biệt, lưu ý khi sử dụng..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              variant="primary"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
            >
              Tạo yêu cầu
            </Button>
            <Button
              variant="outline"
              onPress={() => router.back()}
              disabled={loading}
            >
              Hủy
            </Button>
          </View>
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
  form: {
    padding: 16,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1f2937',
  },
  equipmentPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  equipmentPickerText: {
    flex: 1,
    fontSize: 15,
    color: '#6b7280',
    marginLeft: 12,
  },
  selectedEquipmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  selectedEquipmentInfo: {
    flex: 1,
  },
  selectedEquipmentName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  selectedEquipmentDetails: {
    fontSize: 13,
    color: '#6b7280',
  },
  removeButton: {
    padding: 4,
  },
  equipmentList: {
    maxHeight: 300,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  equipmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  equipmentItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  equipmentItemDetails: {
    fontSize: 13,
    color: '#6b7280',
  },
  emptyEquipment: {
    padding: 32,
    alignItems: 'center',
  },
  emptyEquipmentText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateInputContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  dateInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  dateHint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: -4,
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1f2937',
    textAlignVertical: 'top',
  },
  notesInput: {
    minHeight: 100,
  },
  actions: {
    gap: 12,
    marginTop: 8,
  },
});
