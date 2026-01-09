import { MilestoneCard } from '@/components/timeline/MilestoneCard';
import { createPhase, CreatePhaseDto } from '@/services/timeline-api';
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
    View
} from 'react-native';

const PHASE_COLORS = [
  { value: '#0066CC', label: 'Xanh dương', icon: 'water' },
  { value: '#0066CC', label: 'Xanh lá', icon: 'leaf' },
  { value: '#000000', label: 'Đỏ', icon: 'flame' },
  { value: '#0066CC', label: 'Cam', icon: 'sunny' },
  { value: '#0066CC', label: 'Tím', icon: 'flower' },
  { value: '#0066CC', label: 'Hồng', icon: 'heart' },
  { value: '#4A4A4A', label: 'Xám', icon: 'settings' },
];

const PHASE_ICONS = [
  { value: 'construct', label: 'Xây dựng' },
  { value: 'hammer', label: 'Búa' },
  { value: 'build', label: 'Công cụ' },
  { value: 'flag', label: 'Cờ' },
  { value: 'checkmark-circle', label: 'Hoàn thành' },
  { value: 'calendar', label: 'Lịch' },
  { value: 'time', label: 'Thời gian' },
  { value: 'rocket', label: 'Khởi động' },
];

export default function CreatePhaseScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  );
  const [selectedColor, setSelectedColor] = useState(PHASE_COLORS[0].value);
  const [selectedIcon, setSelectedIcon] = useState(PHASE_ICONS[0].value);
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
      // Auto-adjust end date if it's before start date
      if (selectedDate > endDate) {
        setEndDate(new Date(selectedDate.getTime() + 30 * 24 * 60 * 60 * 1000));
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
      Alert.alert('Lỗi', 'Vui lòng nhập tên giai đoạn');
      return;
    }

    if (endDate <= startDate) {
      Alert.alert('Lỗi', 'Ngày kết thúc phải sau ngày bắt đầu');
      return;
    }

    try {
      setSaving(true);
      
      const dto: CreatePhaseDto = {
        projectId: Number(projectId),
        name: name.trim(),
        description: description.trim(),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        color: selectedColor,
        icon: selectedIcon,
      };

      await createPhase(dto);

      Alert.alert('Thành công', 'Giai đoạn đã được tạo', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Error creating phase:', error);
      Alert.alert('Lỗi', 'Không thể tạo giai đoạn. Vui lòng thử lại.');
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
              Tên giai đoạn <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="VD: Khởi công và móng"
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
              placeholder="Mô tả chi tiết về giai đoạn..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
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
                <Ionicons name="calendar-outline" size={20} color="#0066CC" />
                <View style={styles.dateContent}>
                  <Text style={styles.dateLabel}>Bắt đầu</Text>
                  <Text style={styles.dateValue}>{formatDate(startDate)}</Text>
                </View>
              </TouchableOpacity>

              <Ionicons name="arrow-forward" size={20} color="#999" />

              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowEndPicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color="#0066CC" />
                <View style={styles.dateContent}>
                  <Text style={styles.dateLabel}>Kết thúc</Text>
                  <Text style={styles.dateValue}>{formatDate(endDate)}</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Duration Info */}
            <View style={styles.infoBox}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.infoText}>
                Thời lượng:{' '}
                {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))}{' '}
                ngày
              </Text>
            </View>
          </View>

          {/* Color */}
          <View style={styles.field}>
            <Text style={styles.label}>Màu sắc</Text>
            <View style={styles.colorGrid}>
              {PHASE_COLORS.map((colorItem) => (
                <TouchableOpacity
                  key={colorItem.value}
                  style={[
                    styles.colorOption,
                    { backgroundColor: colorItem.value },
                    selectedColor === colorItem.value && styles.colorOptionSelected,
                  ]}
                  onPress={() => setSelectedColor(colorItem.value)}
                >
                  {selectedColor === colorItem.value && (
                    <Ionicons name="checkmark" size={20} color="#fff" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Icon */}
          <View style={styles.field}>
            <Text style={styles.label}>Biểu tượng</Text>
            <View style={styles.iconGrid}>
              {PHASE_ICONS.map((iconItem) => (
                <TouchableOpacity
                  key={iconItem.value}
                  style={[
                    styles.iconOption,
                    selectedIcon === iconItem.value && styles.iconOptionSelected,
                  ]}
                  onPress={() => setSelectedIcon(iconItem.value)}
                >
                  <Ionicons 
                    name={iconItem.value as any} 
                    size={24} 
                    color={selectedIcon === iconItem.value ? '#0066CC' : '#666'} 
                  />
                  <Text style={[
                    styles.iconLabel,
                    selectedIcon === iconItem.value && styles.iconLabelSelected,
                  ]}>
                    {iconItem.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Live Preview */}
          <View style={styles.field}>
            <Text style={styles.label}>Xem trước</Text>
            <View style={styles.preview}>
              <MilestoneCard
                phase={{
                  id: 0,
                  projectId: Number(projectId),
                  name: name || 'Tên giai đoạn',
                  description: description || 'Mô tả giai đoạn',
                  startDate: startDate.toISOString(),
                  endDate: endDate.toISOString(),
                  color: selectedColor,
                  icon: selectedIcon,
                  status: 'NOT_STARTED',
                  progress: 0,
                  order: 0,
                  tasks: [],
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                }}
                onPress={() => {}}
              />
            </View>
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
            <Text style={styles.saveButtonText}>Tạo giai đoạn</Text>
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
    height: 100,
    paddingTop: 12,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
  },
  dateContent: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E8F4FF',
    padding: 10,
    borderRadius: 6,
    marginTop: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#1976D2',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: '#333',
    transform: [{ scale: 1.1 }],
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconOption: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
  },
  iconOptionSelected: {
    borderColor: '#0066CC',
    backgroundColor: '#E8F4FF',
  },
  iconLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  iconLabelSelected: {
    color: '#0066CC',
    fontWeight: '600',
  },
  preview: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
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
    backgroundColor: '#0066CC',
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
