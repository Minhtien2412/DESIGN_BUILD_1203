import { useLeaveRequests, useWorkers } from '@/hooks/useLabor';
import { LeaveType } from '@/types/labor';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const LEAVE_TYPE_OPTIONS: {
  value: LeaveType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}[] = [
  { value: LeaveType.ANNUAL, label: 'Phép năm', icon: 'calendar', color: '#0066CC' },
  { value: LeaveType.SICK, label: 'Nghỉ ốm', icon: 'medkit', color: '#000000' },
  { value: LeaveType.PERSONAL, label: 'Cá nhân', icon: 'person', color: '#0066CC' },
  { value: LeaveType.MATERNITY, label: 'Thai sản', icon: 'woman', color: '#0066CC' },
  { value: LeaveType.PATERNITY, label: 'Thai sản (bố)', icon: 'man', color: '#0066CC' },
  { value: LeaveType.UNPAID, label: 'Không lương', icon: 'cash-outline', color: '#999999' },
  { value: LeaveType.EMERGENCY, label: 'Khẩn cấp', icon: 'warning', color: '#0066CC' },
  { value: LeaveType.OTHER, label: 'Khác', icon: 'ellipsis-horizontal', color: '#4A4A4A' },
];

export default function CreateLeaveRequestScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { workers } = useWorkers(projectId);
  const { createLeaveRequest } = useLeaveRequests(projectId);

  const [workerId, setWorkerId] = useState<string | null>(null);
  const [leaveType, setLeaveType] = useState<LeaveType>(LeaveType.ANNUAL);

  const [startDate, setStartDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);

  const [endDate, setEndDate] = useState(new Date());
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const calculateTotalDays = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    if (end < start) return 0;

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end dates
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleSave = async () => {
    if (!workerId) {
      Alert.alert('Lỗi', 'Vui lòng chọn nhân công');
      return;
    }

    if (!reason.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập lý do nghỉ phép');
      return;
    }

    const totalDays = calculateTotalDays();
    if (totalDays <= 0) {
      Alert.alert('Lỗi', 'Ngày kết thúc phải sau ngày bắt đầu');
      return;
    }

    try {
      setLoading(true);
      await createLeaveRequest({
        workerId,
        leaveType,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        reason: reason.trim(),
      });

      Alert.alert('Thành công', 'Đã tạo đơn nghỉ phép', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tạo đơn nghỉ phép');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Worker Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Nhân công <Text style={styles.required}>*</Text>
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {workers.map((worker) => (
              <TouchableOpacity
                key={worker.id}
                style={[styles.workerChip, workerId === worker.id && styles.workerChipActive]}
                onPress={() => setWorkerId(worker.id)}
              >
                <Text
                  style={[
                    styles.workerChipName,
                    workerId === worker.id && styles.workerChipNameActive,
                  ]}
                >
                  {worker.fullName}
                </Text>
                <Text
                  style={[
                    styles.workerChipId,
                    workerId === worker.id && styles.workerChipIdActive,
                  ]}
                >
                  {worker.employeeId}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Leave Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Loại nghỉ phép <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.typeGrid}>
            {LEAVE_TYPE_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.typeCard,
                  leaveType === option.value && {
                    backgroundColor: '#fff',
                    borderColor: option.color,
                  },
                ]}
                onPress={() => setLeaveType(option.value)}
              >
                <Ionicons
                  name={option.icon}
                  size={28}
                  color={leaveType === option.value ? option.color : '#999'}
                />
                <Text
                  style={[
                    styles.typeLabel,
                    leaveType === option.value && { color: option.color, fontWeight: '600' },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Date Range */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Thời gian <Text style={styles.required}>*</Text>
          </Text>

          <View style={styles.dateRow}>
            <View style={styles.dateField}>
              <Text style={styles.dateLabel}>Từ ngày:</Text>
              <TouchableOpacity
                style={styles.datePicker}
                onPress={() => setShowStartPicker(true)}
              >
                <Ionicons name="calendar-outline" size={18} color="#666" />
                <Text style={styles.dateText}>{formatDate(startDate)}</Text>
              </TouchableOpacity>

              {showStartPicker && (
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    setShowStartPicker(Platform.OS === 'ios');
                    if (selectedDate) {
                      setStartDate(selectedDate);
                      if (selectedDate > endDate) {
                        setEndDate(selectedDate);
                      }
                    }
                  }}
                />
              )}
            </View>

            <View style={styles.dateField}>
              <Text style={styles.dateLabel}>Đến ngày:</Text>
              <TouchableOpacity
                style={styles.datePicker}
                onPress={() => setShowEndPicker(true)}
              >
                <Ionicons name="calendar-outline" size={18} color="#666" />
                <Text style={styles.dateText}>{formatDate(endDate)}</Text>
              </TouchableOpacity>

              {showEndPicker && (
                <DateTimePicker
                  value={endDate}
                  mode="date"
                  minimumDate={startDate}
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    setShowEndPicker(Platform.OS === 'ios');
                    if (selectedDate) {
                      setEndDate(selectedDate);
                    }
                  }}
                />
              )}
            </View>
          </View>

          <View style={styles.totalDays}>
            <Ionicons name="time-outline" size={20} color="#0066CC" />
            <Text style={styles.totalDaysText}>
              Tổng số ngày: <Text style={styles.totalDaysValue}>{calculateTotalDays()}</Text>
            </Text>
          </View>
        </View>

        {/* Reason */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Lý do nghỉ phép <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.reasonInput}
            placeholder="Nhập lý do nghỉ phép..."
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Attachments Placeholder */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Đính kèm</Text>
          <TouchableOpacity style={styles.attachmentButton}>
            <Ionicons name="attach-outline" size={20} color="#666" />
            <Text style={styles.attachmentButtonText}>Thêm tệp đính kèm</Text>
          </TouchableOpacity>
          <Text style={styles.helperText}>Tính năng sẽ được bổ sung trong phiên bản sau</Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Hủy</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>{loading ? 'Đang lưu...' : 'Lưu'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  required: {
    color: '#000000',
  },
  chipScroll: {
    flexGrow: 0,
  },
  workerChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginRight: 10,
    minWidth: 120,
  },
  workerChipActive: {
    backgroundColor: '#E8F4FF',
    borderWidth: 1,
    borderColor: '#0066CC',
  },
  workerChipName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  workerChipNameActive: {
    color: '#0066CC',
  },
  workerChipId: {
    fontSize: 11,
    color: '#666',
  },
  workerChipIdActive: {
    color: '#0066CC',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeCard: {
    width: '48%',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateField: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  dateText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  totalDays: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: '#E8F4FF',
    borderRadius: 6,
  },
  totalDaysText: {
    fontSize: 14,
    color: '#666',
  },
  totalDaysValue: {
    fontWeight: '600',
    color: '#0066CC',
    fontSize: 16,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    backgroundColor: '#fff',
  },
  attachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    borderStyle: 'dashed',
  },
  attachmentButtonText: {
    fontSize: 14,
    color: '#666',
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 6,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#0066CC',
    borderRadius: 6,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});
