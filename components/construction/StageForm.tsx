/**
 * StageForm Component
 * Modal form for creating and editing stages
 * Features: Validation, duration picker, dependencies selector, status tracking
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { Stage } from '@/types/construction-map';

// ============================================
// Props Interface
// ============================================

export interface StageFormProps {
  visible: boolean;
  stage?: Stage | null; // If provided, edit mode; otherwise, create mode
  projectId: string;
  onSubmit: (data: StageFormData) => Promise<void>;
  onCancel: () => void;
  existingStages?: Stage[]; // For dependencies
}

export interface StageFormData {
  name: string;
  description?: string;
  number?: string;
  status: Stage['status'];
  order?: number;
  startDate?: string;
  endDate?: string;
  color?: string;
  x?: number;
  y?: number;
}

// ============================================
// Validation
// ============================================

interface ValidationErrors {
  name?: string;
  number?: string;
  startDate?: string;
  endDate?: string;
  order?: string;
}

const validateStageForm = (data: StageFormData): ValidationErrors => {
  const errors: ValidationErrors = {};

  // Name is required
  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Tên giai đoạn là bắt buộc';
  } else if (data.name.length > 100) {
    errors.name = 'Tên giai đoạn không được quá 100 ký tự';
  }

  // Number format
  if (data.number && data.number.length > 20) {
    errors.number = 'Số thứ tự không được quá 20 ký tự';
  }

  // Order must be positive
  if (data.order !== undefined && data.order < 0) {
    errors.order = 'Thứ tự phải là số dương';
  }

  // Date validation
  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    if (start > end) {
      errors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
    }
  }

  return errors;
};

// ============================================
// Predefined Colors
// ============================================

const STAGE_COLORS = [
  { value: '#0D9488', label: 'Xanh dương' },
  { value: '#0D9488', label: 'Xanh lá' },
  { value: '#0D9488', label: 'Vàng' },
  { value: '#000000', label: 'Đỏ' },
  { value: '#666666', label: 'Tím' },
  { value: '#666666', label: 'Hồng' },
  { value: '#14B8A6', label: 'Xanh ngọc' },
  { value: '#0D9488', label: 'Cam' },
  { value: '#666666', label: 'Indigo' },
  { value: '#6B7280', label: 'Xám' },
];

// ============================================
// StageForm Component
// ============================================

export const StageForm: React.FC<StageFormProps> = ({
  visible,
  stage,
  projectId,
  onSubmit,
  onCancel,
  existingStages = [],
}) => {
  // Form state
  const [formData, setFormData] = useState<StageFormData>({
    name: '',
    description: '',
    number: '',
    status: 'pending',
    order: existingStages.length,
    startDate: '',
    endDate: '',
    color: '#0D9488',
  });

  // UI state
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Status options
  const statusOptions: { value: Stage['status']; label: string; color: string }[] = [
    { value: 'pending', label: 'Chờ xử lý', color: '#9CA3AF' },
    { value: 'active', label: 'Đang thực hiện', color: '#0D9488' },
    { value: 'completed', label: 'Hoàn thành', color: '#0D9488' },
    { value: 'cancelled', label: 'Đã hủy', color: '#000000' },
  ];

  // Initialize form with stage data in edit mode
  useEffect(() => {
    if (stage) {
      setFormData({
        name: stage.name || '',
        description: stage.description || '',
        number: stage.number || '',
        status: stage.status || 'pending',
        order: stage.order ?? existingStages.length,
        startDate: stage.startDate || '',
        endDate: stage.endDate || '',
        color: stage.color || '#0D9488',
        x: stage.x,
        y: stage.y,
      });
    } else {
      // Reset form for create mode
      setFormData({
        name: '',
        description: '',
        number: '',
        status: 'pending',
        order: existingStages.length,
        startDate: '',
        endDate: '',
        color: '#0D9488',
      });
    }
    setErrors({});
  }, [stage, visible, existingStages.length]);

  // Handle form field change
  const handleChange = (field: keyof StageFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Handle form submit
  const handleSubmit = async () => {
    // Validate
    const validationErrors = validateStageForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(formData);
      // Form will be reset by parent closing the modal
    } catch (error) {
      console.error('StageForm submit error:', error);
      setErrors({ name: 'Lỗi khi lưu giai đoạn. Vui lòng thử lại.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate duration in days
  const calculateDuration = (): number | null => {
    if (!formData.startDate || !formData.endDate) return null;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diff = end.getTime() - start.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const duration = calculateDuration();
  const currentStatus = statusOptions.find(s => s.value === formData.status);
  const currentColor = STAGE_COLORS.find(c => c.value === formData.color);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>
                {stage ? 'Chỉnh sửa giai đoạn' : 'Tạo giai đoạn mới'}
              </Text>
              <TouchableOpacity onPress={onCancel} disabled={submitting}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Form Content */}
            <ScrollView style={styles.formContent} showsVerticalScrollIndicator={false}>
              {/* Stage Name */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Tên giai đoạn <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  value={formData.name}
                  onChangeText={(value) => handleChange('name', value)}
                  placeholder="Nhập tên giai đoạn"
                  placeholderTextColor="#9CA3AF"
                  editable={!submitting}
                />
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
              </View>

              {/* Stage Number */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Số thứ tự</Text>
                <TextInput
                  style={[styles.input, errors.number && styles.inputError]}
                  value={formData.number}
                  onChangeText={(value) => handleChange('number', value)}
                  placeholder="VD: S01, Phase 1, etc."
                  placeholderTextColor="#9CA3AF"
                  editable={!submitting}
                />
                {errors.number && <Text style={styles.errorText}>{errors.number}</Text>}
              </View>

              {/* Description */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Mô tả</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.description}
                  onChangeText={(value) => handleChange('description', value)}
                  placeholder="Nhập mô tả giai đoạn"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  editable={!submitting}
                />
              </View>

              {/* Status Picker */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Trạng thái</Text>
                <TouchableOpacity
                  style={styles.picker}
                  onPress={() => setShowStatusPicker(!showStatusPicker)}
                  disabled={submitting}
                >
                  <View style={styles.pickerContent}>
                    <View style={[styles.statusDot, { backgroundColor: currentStatus?.color }]} />
                    <Text style={styles.pickerText}>{currentStatus?.label}</Text>
                  </View>
                  <Text style={styles.pickerArrow}>▼</Text>
                </TouchableOpacity>
                {showStatusPicker && (
                  <View style={styles.pickerOptions}>
                    {statusOptions.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={styles.pickerOption}
                        onPress={() => {
                          handleChange('status', option.value);
                          setShowStatusPicker(false);
                        }}
                      >
                        <View style={[styles.statusDot, { backgroundColor: option.color }]} />
                        <Text style={styles.pickerOptionText}>{option.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Color Picker */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Màu sắc</Text>
                <TouchableOpacity
                  style={styles.picker}
                  onPress={() => setShowColorPicker(!showColorPicker)}
                  disabled={submitting}
                >
                  <View style={styles.pickerContent}>
                    <View style={[styles.colorPreview, { backgroundColor: formData.color }]} />
                    <Text style={styles.pickerText}>{currentColor?.label || 'Tùy chỉnh'}</Text>
                  </View>
                  <Text style={styles.pickerArrow}>▼</Text>
                </TouchableOpacity>
                {showColorPicker && (
                  <View style={styles.colorPickerOptions}>
                    {STAGE_COLORS.map((color) => (
                      <TouchableOpacity
                        key={color.value}
                        style={styles.colorOption}
                        onPress={() => {
                          handleChange('color', color.value);
                          setShowColorPicker(false);
                        }}
                      >
                        <View
                          style={[
                            styles.colorCircle,
                            { backgroundColor: color.value },
                            formData.color === color.value && styles.colorCircleSelected,
                          ]}
                        />
                        <Text style={styles.colorLabel}>{color.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Order */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Thứ tự hiển thị</Text>
                <TextInput
                  style={[styles.input, errors.order && styles.inputError]}
                  value={String(formData.order ?? '')}
                  onChangeText={(value) => {
                    const num = parseInt(value) || 0;
                    handleChange('order', Math.max(0, num));
                  }}
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  editable={!submitting}
                />
                {errors.order && <Text style={styles.errorText}>{errors.order}</Text>}
              </View>

              {/* Start Date */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Ngày bắt đầu</Text>
                <TextInput
                  style={[styles.input, errors.startDate && styles.inputError]}
                  value={formData.startDate}
                  onChangeText={(value) => handleChange('startDate', value)}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#9CA3AF"
                  editable={!submitting}
                />
                {errors.startDate && <Text style={styles.errorText}>{errors.startDate}</Text>}
              </View>

              {/* End Date */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Ngày kết thúc</Text>
                <TextInput
                  style={[styles.input, errors.endDate && styles.inputError]}
                  value={formData.endDate}
                  onChangeText={(value) => handleChange('endDate', value)}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#9CA3AF"
                  editable={!submitting}
                />
                {errors.endDate && <Text style={styles.errorText}>{errors.endDate}</Text>}
              </View>

              {/* Duration Display */}
              {duration !== null && duration >= 0 && (
                <View style={styles.durationInfo}>
                  <Text style={styles.durationLabel}>Thời gian:</Text>
                  <Text style={styles.durationValue}>{duration} ngày</Text>
                </View>
              )}
            </ScrollView>

            {/* Footer Actions */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onCancel}
                disabled={submitting}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.submitButton, submitting && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {stage ? 'Cập nhật' : 'Tạo mới'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    fontSize: 24,
    color: '#6B7280',
    paddingHorizontal: 8,
  },
  formContent: {
    padding: 20,
    maxHeight: 500,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#000000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#000000',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  errorText: {
    fontSize: 12,
    color: '#000000',
    marginTop: 4,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  pickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 16,
    color: '#111827',
  },
  pickerArrow: {
    fontSize: 12,
    color: '#6B7280',
  },
  pickerOptions: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  pickerOption: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  pickerOptionText: {
    fontSize: 16,
    color: '#111827',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: 4,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  colorPickerOptions: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  colorOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorCircleSelected: {
    borderColor: '#111827',
    borderWidth: 3,
  },
  colorLabel: {
    fontSize: 16,
    color: '#111827',
  },
  durationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  durationLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginRight: 8,
  },
  durationValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D9488',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  submitButton: {
    backgroundColor: '#0D9488',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default StageForm;
