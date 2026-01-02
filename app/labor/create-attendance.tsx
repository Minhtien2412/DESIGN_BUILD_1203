import { useAttendances, useWorkers } from '@/hooks/useLabor';
import { AttendanceStatus, ShiftType } from '@/types/labor';
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

const STATUS_OPTIONS = [
  { value: AttendanceStatus.PRESENT, label: 'Có mặt', icon: 'checkmark-circle', color: '#4CAF50' },
  { value: AttendanceStatus.ABSENT, label: 'Vắng', icon: 'close-circle', color: '#F44336' },
  { value: AttendanceStatus.LATE, label: 'Trễ', icon: 'time', color: '#FF9800' },
  { value: AttendanceStatus.HALF_DAY, label: 'Nửa ngày', icon: 'remove-circle', color: '#2196F3' },
  { value: AttendanceStatus.ON_LEAVE, label: 'Nghỉ phép', icon: 'calendar', color: '#9C27B0' },
  { value: AttendanceStatus.SICK_LEAVE, label: 'Nghỉ ốm', icon: 'medkit', color: '#FF5722' },
  { value: AttendanceStatus.EXCUSED, label: 'Có phép', icon: 'document-text', color: '#0A6847' },
];

const SHIFT_OPTIONS = [
  { value: ShiftType.MORNING, label: 'Ca sáng', icon: 'sunny-outline' },
  { value: ShiftType.AFTERNOON, label: 'Ca chiều', icon: 'partly-sunny-outline' },
  { value: ShiftType.NIGHT, label: 'Ca tối', icon: 'moon-outline' },
  { value: ShiftType.FULL_DAY, label: 'Cả ngày', icon: 'calendar-outline' },
  { value: ShiftType.OVERTIME, label: 'Tăng ca', icon: 'alarm-outline' },
];

export default function CreateAttendanceScreen() {
  const { projectId, date: initialDate } = useLocalSearchParams<{
    projectId: string;
    date?: string;
  }>();
  const { recordAttendance } = useAttendances(projectId);
  const { workers } = useWorkers(projectId);

  const [selectedDate, setSelectedDate] = useState(
    initialDate ? new Date(initialDate) : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [workerId, setWorkerId] = useState<string | null>(null);
  const [status, setStatus] = useState<AttendanceStatus>(AttendanceStatus.PRESENT);
  const [shiftType, setShiftType] = useState<ShiftType>(ShiftType.FULL_DAY);
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [checkOutTime, setCheckOutTime] = useState<Date | null>(null);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!workerId) {
      Alert.alert('Lỗi', 'Vui lòng chọn nhân công');
      return;
    }

    setLoading(true);
    try {
      await recordAttendance({
        workerId,
        projectId: projectId || undefined,
        date: selectedDate.toISOString().split('T')[0],
        status,
        shiftType,
        checkInTime: checkInTime?.toISOString(),
        checkOutTime: checkOutTime?.toISOString(),
        notes: notes.trim() || undefined,
      });

      Alert.alert('Thành công', 'Đã chấm công', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chấm công. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: Date | null) => {
    if (!date) return 'Chọn giờ';
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ngày chấm công</Text>
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
            <Ionicons name="calendar-outline" size={20} color="#666" />
            <Text style={styles.dateText}>{selectedDate.toLocaleDateString('vi-VN')}</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, date) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (date) setSelectedDate(date);
              }}
              maximumDate={new Date()}
            />
          )}
        </View>

        {/* Worker Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Chọn nhân công <Text style={styles.required}>*</Text>
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
            {workers.map((worker) => (
              <TouchableOpacity
                key={worker.id}
                style={[
                  styles.workerChip,
                  workerId === worker.id && styles.workerChipActive,
                ]}
                onPress={() => setWorkerId(worker.id)}
              >
                <Text
                  style={[
                    styles.workerChipText,
                    workerId === worker.id && styles.workerChipTextActive,
                  ]}
                >
                  {worker.fullName}
                </Text>
                <Text style={styles.workerChipSubtext}>{worker.employeeId}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Trạng thái <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.statusGrid}>
            {STATUS_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.statusCard,
                  status === option.value && styles.statusCardActive,
                  status === option.value && { borderColor: option.color },
                ]}
                onPress={() => setStatus(option.value)}
              >
                <Ionicons
                  name={option.icon as any}
                  size={28}
                  color={status === option.value ? option.color : '#666'}
                />
                <Text
                  style={[
                    styles.statusLabel,
                    status === option.value && { color: option.color, fontWeight: '600' },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Shift */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Ca làm việc <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.shiftGrid}>
            {SHIFT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.shiftChip,
                  shiftType === option.value && styles.shiftChipActive,
                ]}
                onPress={() => setShiftType(option.value)}
              >
                <Ionicons
                  name={option.icon as any}
                  size={20}
                  color={shiftType === option.value ? '#2196F3' : '#666'}
                />
                <Text
                  style={[
                    styles.shiftChipText,
                    shiftType === option.value && styles.shiftChipTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Time Tracking */}
        {(status === AttendanceStatus.PRESENT || status === AttendanceStatus.LATE) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Giờ vào/ra</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Giờ vào</Text>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setShowCheckInPicker(true)}
              >
                <Ionicons name="log-in-outline" size={20} color="#666" />
                <Text style={styles.timeText}>{formatTime(checkInTime)}</Text>
              </TouchableOpacity>

              {showCheckInPicker && (
                <DateTimePicker
                  value={checkInTime || new Date()}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, time) => {
                    setShowCheckInPicker(Platform.OS === 'ios');
                    if (time) setCheckInTime(time);
                  }}
                />
              )}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Giờ ra</Text>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setShowCheckOutPicker(true)}
              >
                <Ionicons name="log-out-outline" size={20} color="#666" />
                <Text style={styles.timeText}>{formatTime(checkOutTime)}</Text>
              </TouchableOpacity>

              {showCheckOutPicker && (
                <DateTimePicker
                  value={checkOutTime || new Date()}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, time) => {
                    setShowCheckOutPicker(Platform.OS === 'ios');
                    if (time) setCheckOutTime(time);
                  }}
                />
              )}
            </View>
          </View>
        )}

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.label}>Ghi chú</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Thêm ghi chú..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
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
          <Text style={styles.saveButtonText}>
            {loading ? 'Đang lưu...' : 'Lưu chấm công'}
          </Text>
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
    marginBottom: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  required: {
    color: '#F44336',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  dateText: {
    fontSize: 15,
    color: '#333',
  },
  chipContainer: {
    flexGrow: 0,
  },
  workerChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    minWidth: 120,
  },
  workerChipActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  workerChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  workerChipTextActive: {
    color: '#2196F3',
  },
  workerChipSubtext: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statusCard: {
    width: '30%',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    gap: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  statusCardActive: {
    backgroundColor: '#fff',
  },
  statusLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  shiftGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  shiftChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  shiftChipActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  shiftChipText: {
    fontSize: 13,
    color: '#666',
  },
  shiftChipTextActive: {
    color: '#2196F3',
    fontWeight: '600',
  },
  field: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  timeText: {
    fontSize: 15,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#333',
  },
  textArea: {
    minHeight: 60,
    paddingTop: 12,
    textAlignVertical: 'top',
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
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#2196F3',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#B0BEC5',
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});
