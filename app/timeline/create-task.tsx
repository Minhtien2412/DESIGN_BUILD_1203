import { usePhases, useTasks } from '@/hooks/useTimeline';
import { TaskPriority, TaskStatus } from '@/types/timeline';
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

const STATUS_OPTIONS: { value: TaskStatus; label: string; color: string }[] = [
  { value: TaskStatus.NOT_STARTED, label: 'Chưa bắt đầu', color: '#999999' },
  { value: TaskStatus.IN_PROGRESS, label: 'Đang thực hiện', color: '#0D9488' },
  { value: TaskStatus.ON_HOLD, label: 'Tạm dừng', color: '#0D9488' },
  { value: TaskStatus.COMPLETED, label: 'Hoàn thành', color: '#0D9488' },
  { value: TaskStatus.CANCELLED, label: 'Đã hủy', color: '#000000' },
];

const PRIORITY_OPTIONS: { value: TaskPriority; label: string; color: string }[] = [
  { value: TaskPriority.LOW, label: 'Thấp', color: '#0D9488' },
  { value: TaskPriority.MEDIUM, label: 'Trung bình', color: '#0D9488' },
  { value: TaskPriority.HIGH, label: 'Cao', color: '#0D9488' },
  { value: TaskPriority.CRITICAL, label: 'Khẩn cấp', color: '#000000' },
];

export default function CreateTaskScreen() {
  const { projectId, phaseId } = useLocalSearchParams<{
    projectId: string;
    phaseId?: string;
  }>();
  const { phases } = usePhases(projectId!);
  const { createTask } = useTasks(phaseId, projectId);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPhase, setSelectedPhase] = useState(phaseId || phases[0]?.id || '');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [estimatedHours, setEstimatedHours] = useState('');
  const [isMilestone, setIsMilestone] = useState(false);
  const [tags, setTags] = useState('');
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setStartDate(selectedDate);
      if (selectedDate > endDate) {
        setEndDate(new Date(selectedDate.getTime() + 7 * 24 * 60 * 60 * 1000));
      }
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(Platform.OS === 'ios');
    if (selectedDate) {
      if (selectedDate < startDate) {
        Alert.alert('Lỗi', 'Ngày kết thúc phải sau ngày bắt đầu');
        return;
      }
      setEndDate(selectedDate);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên công việc');
      return;
    }

    if (!selectedPhase) {
      Alert.alert('Lỗi', 'Vui lòng chọn giai đoạn');
      return;
    }

    if (endDate <= startDate) {
      Alert.alert('Lỗi', 'Ngày kết thúc phải sau ngày bắt đầu');
      return;
    }

    try {
      setSaving(true);
      await createTask({
        phaseId: selectedPhase,
        projectId: projectId!,
        name: name.trim(),
        description: description.trim(),
        startDate,
        endDate,
        priority,
        estimatedHours: estimatedHours ? parseFloat(estimatedHours) : undefined,
        isMilestone,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t),
      });

      Alert.alert('Thành công', 'Công việc đã được tạo', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tạo công việc');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.form}>
          {/* Name */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Tên công việc <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="VD: Đào móng"
              placeholderTextColor="#999"
            />
          </View>

          {/* Description */}
          <View style={styles.field}>
            <Text style={styles.label}>Mô tả</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Mô tả chi tiết về công việc..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Phase Selection */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Giai đoạn <Text style={styles.required}>*</Text>
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.phaseRow}>
                {phases.map((phase) => (
                  <TouchableOpacity
                    key={phase.id}
                    style={[
                      styles.phaseChip,
                      selectedPhase === phase.id && styles.phaseChipSelected,
                    ]}
                    onPress={() => setSelectedPhase(phase.id)}
                  >
                    <View
                      style={[styles.phaseIndicator, { backgroundColor: phase.color }]}
                    />
                    <Text
                      style={[
                        styles.phaseChipText,
                        selectedPhase === phase.id && styles.phaseChipTextSelected,
                      ]}
                    >
                      {phase.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Date Range */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Thời gian <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.dateRow}>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowStartPicker(true)}
              >
                <Ionicons name="calendar-outline" size={18} color="#0D9488" />
                <View style={styles.dateContent}>
                  <Text style={styles.dateLabel}>Bắt đầu</Text>
                  <Text style={styles.dateValue}>{formatDate(startDate)}</Text>
                </View>
              </TouchableOpacity>

              <Ionicons name="arrow-forward" size={18} color="#999" />

              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowEndPicker(true)}
              >
                <Ionicons name="calendar-outline" size={18} color="#0D9488" />
                <View style={styles.dateContent}>
                  <Text style={styles.dateLabel}>Kết thúc</Text>
                  <Text style={styles.dateValue}>{formatDate(endDate)}</Text>
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.infoBox}>
              <Ionicons name="time-outline" size={14} color="#666" />
              <Text style={styles.infoText}>
                Thời lượng:{' '}
                {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))}{' '}
                ngày
              </Text>
            </View>
          </View>

          {/* Priority */}
          <View style={styles.field}>
            <Text style={styles.label}>Mức độ ưu tiên</Text>
            <View style={styles.priorityGrid}>
              {PRIORITY_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.priorityOption,
                    priority === option.value && {
                      backgroundColor: option.color + '20',
                      borderColor: option.color,
                    },
                  ]}
                  onPress={() => setPriority(option.value)}
                >
                  <View
                    style={[styles.priorityDot, { backgroundColor: option.color }]}
                  />
                  <Text
                    style={[
                      styles.priorityText,
                      priority === option.value && { color: option.color, fontWeight: '600' },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Estimated Hours */}
          <View style={styles.field}>
            <Text style={styles.label}>Số giờ ước tính</Text>
            <TextInput
              style={styles.input}
              value={estimatedHours}
              onChangeText={setEstimatedHours}
              placeholder="0"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>

          {/* Milestone Toggle */}
          <TouchableOpacity
            style={styles.toggleRow}
            onPress={() => setIsMilestone(!isMilestone)}
          >
            <View style={styles.toggleLeft}>
              <Ionicons
                name="flag"
                size={20}
                color={isMilestone ? '#0D9488' : '#999'}
              />
              <Text style={styles.toggleLabel}>Đánh dấu là cột mốc quan trọng</Text>
            </View>
            <View
              style={[styles.toggle, isMilestone && styles.toggleActive]}
            >
              <View
                style={[styles.toggleThumb, isMilestone && styles.toggleThumbActive]}
              />
            </View>
          </TouchableOpacity>

          {/* Tags */}
          <View style={styles.field}>
            <Text style={styles.label}>Thẻ (phân cách bằng dấu phẩy)</Text>
            <TextInput
              style={styles.input}
              value={tags}
              onChangeText={setTags}
              placeholder="VD: móng, nền, quan trọng"
              placeholderTextColor="#999"
            />
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={saving}
        >
          <Text style={styles.cancelButtonText}>Hủy</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <Text style={styles.saveButtonText}>Đang lưu...</Text>
          ) : (
            <Text style={styles.saveButtonText}>Tạo công việc</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Date Pickers */}
      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleStartDateChange}
        />
      )}
      {showEndPicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleEndDateChange}
          minimumDate={startDate}
        />
      )}
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
  form: {
    padding: 16,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#000000',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#333',
  },
  textArea: {
    height: 80,
    paddingTop: 12,
  },
  phaseRow: {
    flexDirection: 'row',
    gap: 8,
  },
  phaseChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  phaseChipSelected: {
    backgroundColor: '#F0FDFA',
    borderColor: '#0D9488',
  },
  phaseIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
  },
  phaseChipText: {
    fontSize: 13,
    color: '#666',
  },
  phaseChipTextSelected: {
    color: '#0D9488',
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 10,
  },
  dateContent: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDFA',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#1976D2',
  },
  priorityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  priorityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minWidth: '48%',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 13,
    color: '#666',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  toggleLabel: {
    fontSize: 14,
    color: '#333',
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e0e0e0',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#0D9488',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
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
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#0D9488',
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
