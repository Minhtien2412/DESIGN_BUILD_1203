/**
 * TaskForm Component
 * Modal form for creating and editing tasks
 * Features: Validation, assignee picker, priority selector, status dropdown
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
import { Task } from '@/types/construction-map';

// ============================================
// Props Interface
// ============================================

export interface TaskFormProps {
  visible: boolean;
  task?: Task | null; // If provided, edit mode; otherwise, create mode
  projectId: string;
  stageId?: string;
  onSubmit: (data: TaskFormData) => Promise<void>;
  onCancel: () => void;
  assigneeOptions?: { id: string; name: string }[];
}

export interface TaskFormData {
  name: string;
  description?: string;
  stageId: string;
  status: Task['status'];
  priority: Task['priority'];
  assignedTo?: string;
  startDate?: string;
  endDate?: string;
  x?: number;
  y?: number;
  progress?: number;
  tags?: string[];
}

// ============================================
// Validation
// ============================================

interface ValidationErrors {
  name?: string;
  stageId?: string;
  startDate?: string;
  endDate?: string;
}

const validateTaskForm = (data: TaskFormData): ValidationErrors => {
  const errors: ValidationErrors = {};

  // Name is required
  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Tên công việc là bắt buộc';
  } else if (data.name.length > 100) {
    errors.name = 'Tên công việc không được quá 100 ký tự';
  }

  // Stage is required
  if (!data.stageId) {
    errors.stageId = 'Vui lòng chọn giai đoạn';
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
// TaskForm Component
// ============================================

export const TaskForm: React.FC<TaskFormProps> = ({
  visible,
  task,
  projectId,
  stageId: defaultStageId,
  onSubmit,
  onCancel,
  assigneeOptions = [],
}) => {
  // Form state
  const [formData, setFormData] = useState<TaskFormData>({
    name: '',
    description: '',
    stageId: defaultStageId || '',
    status: 'pending',
    priority: 'medium',
    assignedTo: '',
    startDate: '',
    endDate: '',
    progress: 0,
    tags: [],
  });

  // UI state
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const [showAssigneePicker, setShowAssigneePicker] = useState(false);

  // Status options
  const statusOptions: { value: Task['status']; label: string; color: string }[] = [
    { value: 'pending', label: 'Chờ xử lý', color: '#9CA3AF' },
    { value: 'in-progress', label: 'Đang thực hiện', color: '#3B82F6' },
    { value: 'completed', label: 'Hoàn thành', color: '#0066CC' },
    { value: 'blocked', label: 'Bị chặn', color: '#000000' },
  ];

  // Priority options
  const priorityOptions: { value: Task['priority']; label: string; color: string }[] = [
    { value: 'low', label: 'Thấp', color: '#0066CC' },
    { value: 'medium', label: 'Trung bình', color: '#0066CC' },
    { value: 'high', label: 'Cao', color: '#000000' },
  ];

  // Initialize form with task data in edit mode
  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name || '',
        description: task.description || '',
        stageId: task.stageId || defaultStageId || '',
        status: task.status || 'pending',
        priority: task.priority || 'medium',
        assignedTo: task.assignedTo || task.assignee || '',
        startDate: task.startDate || '',
        endDate: task.endDate || '',
        progress: task.progress || 0,
        tags: task.tags || [],
        x: task.x,
        y: task.y,
      });
    } else {
      // Reset form for create mode
      setFormData({
        name: '',
        description: '',
        stageId: defaultStageId || '',
        status: 'pending',
        priority: 'medium',
        assignedTo: '',
        startDate: '',
        endDate: '',
        progress: 0,
        tags: [],
      });
    }
    setErrors({});
  }, [task, visible, defaultStageId]);

  // Handle form field change
  const handleChange = (field: keyof TaskFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Handle form submit
  const handleSubmit = async () => {
    // Validate
    const validationErrors = validateTaskForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(formData);
      // Form will be reset by parent closing the modal
    } catch (error) {
      console.error('TaskForm submit error:', error);
      setErrors({ name: 'Lỗi khi lưu công việc. Vui lòng thử lại.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Get current status label
  const currentStatus = statusOptions.find(s => s.value === formData.status);
  const currentPriority = priorityOptions.find(p => p.value === formData.priority);
  const currentAssignee = assigneeOptions.find(a => a.id === formData.assignedTo);

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
                {task ? 'Chỉnh sửa công việc' : 'Tạo công việc mới'}
              </Text>
              <TouchableOpacity onPress={onCancel} disabled={submitting}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Form Content */}
            <ScrollView style={styles.formContent} showsVerticalScrollIndicator={false}>
              {/* Task Name */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Tên công việc <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  value={formData.name}
                  onChangeText={(value) => handleChange('name', value)}
                  placeholder="Nhập tên công việc"
                  placeholderTextColor="#9CA3AF"
                  editable={!submitting}
                />
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
              </View>

              {/* Description */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Mô tả</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.description}
                  onChangeText={(value) => handleChange('description', value)}
                  placeholder="Nhập mô tả công việc"
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

              {/* Priority Picker */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Độ ưu tiên</Text>
                <TouchableOpacity
                  style={styles.picker}
                  onPress={() => setShowPriorityPicker(!showPriorityPicker)}
                  disabled={submitting}
                >
                  <View style={styles.pickerContent}>
                    <View style={[styles.priorityDot, { backgroundColor: currentPriority?.color }]} />
                    <Text style={styles.pickerText}>{currentPriority?.label}</Text>
                  </View>
                  <Text style={styles.pickerArrow}>▼</Text>
                </TouchableOpacity>
                {showPriorityPicker && (
                  <View style={styles.pickerOptions}>
                    {priorityOptions.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={styles.pickerOption}
                        onPress={() => {
                          handleChange('priority', option.value);
                          setShowPriorityPicker(false);
                        }}
                      >
                        <View style={[styles.priorityDot, { backgroundColor: option.color }]} />
                        <Text style={styles.pickerOptionText}>{option.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Assignee Picker */}
              {assigneeOptions.length > 0 && (
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Người thực hiện</Text>
                  <TouchableOpacity
                    style={styles.picker}
                    onPress={() => setShowAssigneePicker(!showAssigneePicker)}
                    disabled={submitting}
                  >
                    <Text style={styles.pickerText}>
                      {currentAssignee?.name || 'Chưa chọn người thực hiện'}
                    </Text>
                    <Text style={styles.pickerArrow}>▼</Text>
                  </TouchableOpacity>
                  {showAssigneePicker && (
                    <View style={styles.pickerOptions}>
                      <TouchableOpacity
                        style={styles.pickerOption}
                        onPress={() => {
                          handleChange('assignedTo', '');
                          setShowAssigneePicker(false);
                        }}
                      >
                        <Text style={styles.pickerOptionText}>Chưa chọn</Text>
                      </TouchableOpacity>
                      {assigneeOptions.map((option) => (
                        <TouchableOpacity
                          key={option.id}
                          style={styles.pickerOption}
                          onPress={() => {
                            handleChange('assignedTo', option.id);
                            setShowAssigneePicker(false);
                          }}
                        >
                          <Text style={styles.pickerOptionText}>{option.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              )}

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

              {/* Progress (for edit mode) */}
              {task && (
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Tiến độ (%)</Text>
                  <TextInput
                    style={styles.input}
                    value={String(formData.progress || 0)}
                    onChangeText={(value) => {
                      const num = parseInt(value) || 0;
                      handleChange('progress', Math.min(100, Math.max(0, num)));
                    }}
                    placeholder="0"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    editable={!submitting}
                  />
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
                    {task ? 'Cập nhật' : 'Tạo mới'}
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
  priorityDot: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 8,
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
    backgroundColor: '#3B82F6',
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

export default TaskForm;
