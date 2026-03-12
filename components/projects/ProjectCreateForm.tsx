/**
 * Project Creation Form Component
 * Full-featured form for creating new projects
 */

import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export type ProjectType = 'residential' | 'commercial' | 'landscape' | 'interior' | 'renovation';

const PROJECT_TYPES = [
  { value: 'residential', label: 'Nhà ở', icon: 'home' },
  { value: 'commercial', label: 'Thương mại', icon: 'business' },
  { value: 'landscape', label: 'Cảnh quan', icon: 'leaf' },
  { value: 'interior', label: 'Nội thất', icon: 'color-palette' },
  { value: 'renovation', label: 'Cải tạo', icon: 'hammer' },
] as const;

interface ProjectFormData {
  name: string;
  description: string;
  type: ProjectType;
  location: string;
  budget: string;
  startDate: Date;
  endDate: Date;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
}

interface ProjectCreateFormProps {
  onSubmit: (data: ProjectFormData) => Promise<void>;
  onCancel: () => void;
}

export function ProjectCreateForm({ onSubmit, onCancel }: ProjectCreateFormProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    type: 'residential',
    location: '',
    budget: '',
    startDate: new Date(),
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days later
    clientName: '',
    clientPhone: '',
    clientEmail: '',
  });

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const updateField = (field: keyof ProjectFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên dự án');
      return false;
    }
    if (!formData.location.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập địa điểm');
      return false;
    }
    if (formData.endDate <= formData.startDate) {
      Alert.alert('Lỗi', 'Ngày kết thúc phải sau ngày bắt đầu');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      await onSubmit(formData);
      Alert.alert('Thành công', 'Dự án đã được tạo', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tạo dự án. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Project Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Loại dự án *</Text>
          <View style={styles.typeGrid}>
            {PROJECT_TYPES.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.typeCard,
                  formData.type === type.value && styles.typeCardActive,
                ]}
                onPress={() => updateField('type', type.value)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={type.icon as any}
                  size={28}
                  color={
                    formData.type === type.value ? Colors.light.primary : Colors.light.textMuted
                  }
                />
                <Text
                  style={[
                    styles.typeLabel,
                    formData.type === type.value && styles.typeLabelActive,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tên dự án *</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: Xây nhà phố 3 tầng"
              placeholderTextColor={Colors.light.textMuted}
              value={formData.name}
              onChangeText={(text) => updateField('name', text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mô tả</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Mô tả chi tiết về dự án..."
              placeholderTextColor={Colors.light.textMuted}
              value={formData.description}
              onChangeText={(text) => updateField('description', text)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Địa điểm *</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: 123 Đường ABC, Quận 1, TP.HCM"
              placeholderTextColor={Colors.light.textMuted}
              value={formData.location}
              onChangeText={(text) => updateField('location', text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ngân sách (VNĐ)</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: 500000000"
              placeholderTextColor={Colors.light.textMuted}
              value={formData.budget}
              onChangeText={(text) => updateField('budget', text.replace(/[^0-9]/g, ''))}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thời gian</Text>
          
          <View style={styles.dateRow}>
            <View style={styles.dateGroup}>
              <Text style={styles.label}>Ngày bắt đầu *</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Ionicons name="calendar" size={20} color={Colors.light.primary} />
                <Text style={styles.dateText}>
                  {formData.startDate.toLocaleDateString('vi-VN')}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dateGroup}>
              <Text style={styles.label}>Ngày kết thúc *</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowEndDatePicker(true)}
              >
                <Ionicons name="calendar" size={20} color={Colors.light.primary} />
                <Text style={styles.dateText}>
                  {formData.endDate.toLocaleDateString('vi-VN')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Client Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin khách hàng</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tên khách hàng</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: Nguyễn Văn A"
              placeholderTextColor={Colors.light.textMuted}
              value={formData.clientName}
              onChangeText={(text) => updateField('clientName', text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Số điện thoại</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: 0901234567"
              placeholderTextColor={Colors.light.textMuted}
              value={formData.clientPhone}
              onChangeText={(text) => updateField('clientPhone', text)}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: client@example.com"
              placeholderTextColor={Colors.light.textMuted}
              value={formData.clientEmail}
              onChangeText={(text) => updateField('clientEmail', text)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Date Pickers */}
      {showStartDatePicker && (
        <DateTimePicker
          value={formData.startDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowStartDatePicker(false);
            if (date) updateField('startDate', date);
          }}
        />
      )}
      {showEndDatePicker && (
        <DateTimePicker
          value={formData.endDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowEndDatePicker(false);
            if (date) updateField('endDate', date);
          }}
        />
      )}

      {/* Action Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={onCancel}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonSecondaryText}>Hủy</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.7}
        >
          {loading ? (
            <Text style={styles.buttonPrimaryText}>Đang tạo...</Text>
          ) : (
            <>
              <Ionicons name="checkmark" size={20} color="#fff" />
              <Text style={styles.buttonPrimaryText}>Tạo dự án</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 16,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeCard: {
    width: 100,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: Colors.light.border,
  },
  typeCardActive: {
    borderColor: Colors.light.primary,
    backgroundColor: `${Colors.light.primary}10`,
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textMuted,
  },
  typeLabelActive: {
    color: Colors.light.primary,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  textArea: {
    height: 100,
    paddingTop: 14,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateGroup: {
    flex: 1,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  dateText: {
    fontSize: 15,
    color: Colors.light.text,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonPrimary: {
    backgroundColor: Colors.light.primary,
  },
  buttonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  buttonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
});
