/**
 * Add Task Form Modal
 * Form for creating new tasks in projects
 */

import { Button } from '@/components/ui/button';
import { Task } from '@/components/ui/task-management';
import { SpacingSemantic } from '@/constants/spacing';
import { TextVariants } from '@/constants/typography';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

export interface TaskFormData {
  title: string;
  description: string;
  status: Task['status'];
  priority: Task['priority'];
  dueDate: string;
  tags: string[];
}

interface AddTaskFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => void;
  projectId?: string;
}

const PRIORITY_CONFIG = {
  urgent: { label: 'Cấp bách', color: '#000000', icon: 'flash' as const },
  high: { label: 'Cao', color: '#0066CC', icon: 'arrow-up' as const },
  medium: { label: 'Trung bình', color: '#3B82F6', icon: 'remove' as const },
  low: { label: 'Thấp', color: '#6B7280', icon: 'arrow-down' as const },
};

const STATUS_CONFIG = {
  todo: { label: 'Cần làm', color: '#6B7280' },
  'in-progress': { label: 'Đang làm', color: '#3B82F6' },
  completed: { label: 'Hoàn thành', color: '#0066CC' },
  blocked: { label: 'Bị chặn', color: '#000000' },
};

const COMMON_TAGS = [
  'thiết kế',
  'thi công',
  'nghiệm thu',
  'báo cáo',
  'vật tư',
  'nhân công',
  'giấy phép',
  'cấp bách',
  'quan trọng',
];

export default function AddTaskForm({
  visible,
  onClose,
  onSubmit,
}: AddTaskFormProps) {
  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const border = useThemeColor({}, 'border');
  const primary = useThemeColor({}, 'primary');
  const chipBackground = useThemeColor({}, 'chipBackground');

  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '',
    tags: [],
  });

  const [errors, setErrors] = useState<Partial<Record<keyof TaskFormData, string>>>({});
  const [customTag, setCustomTag] = useState('');

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof TaskFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Vui lòng nhập tiêu đề công việc';
    }
    if (formData.title.length > 100) {
      newErrors.title = 'Tiêu đề không được quá 100 ký tự';
    }
    if (formData.description.length > 500) {
      newErrors.description = 'Mô tả không được quá 500 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(formData);
      handleClose();
    }
  };

  const handleClose = () => {
    // Reset form
    setFormData({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      dueDate: '',
      tags: [],
    });
    setCustomTag('');
    setErrors({});
    onClose();
  };

  const handleAddTag = (tag: string) => {
    if (!formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
  };

  const handleAddCustomTag = () => {
    const tag = customTag.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      setCustomTag('');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: background }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: border }]}>
            <Text style={[TextVariants.h3, { color: text }]}>Thêm công việc mới</Text>
            <Pressable onPress={handleClose} hitSlop={8}>
              <Ionicons name="close" size={24} color={text} />
            </Pressable>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Title Input */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: text }]}>
                Tiêu đề <Text style={styles.required}>*</Text>
              </Text>
              <View style={[styles.inputContainer, { borderColor: errors.title ? '#000000' : border }]}>
                <Ionicons name="document-text-outline" size={20} color={textMuted} />
                <TextInput
                  style={[styles.input, { color: text }]}
                  value={formData.title}
                  onChangeText={(value) => {
                    setFormData(prev => ({ ...prev, title: value }));
                    if (errors.title) {
                      setErrors(prev => ({ ...prev, title: undefined }));
                    }
                  }}
                  placeholder="VD: Hoàn thiện đổ bê tông móng"
                  placeholderTextColor={textMuted}
                  maxLength={100}
                />
              </View>
              {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
              <Text style={[styles.hint, { color: textMuted }]}>
                {formData.title.length}/100 ký tự
              </Text>
            </View>

            {/* Description Input */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: text }]}>Mô tả</Text>
              <View style={[styles.inputContainer, styles.textAreaContainer, { borderColor: errors.description ? '#000000' : border }]}>
                <TextInput
                  style={[styles.input, styles.textArea, { color: text }]}
                  value={formData.description}
                  onChangeText={(value) => {
                    setFormData(prev => ({ ...prev, description: value }));
                    if (errors.description) {
                      setErrors(prev => ({ ...prev, description: undefined }));
                    }
                  }}
                  placeholder="Mô tả chi tiết công việc..."
                  placeholderTextColor={textMuted}
                  multiline
                  numberOfLines={4}
                  maxLength={500}
                />
              </View>
              {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
              <Text style={[styles.hint, { color: textMuted }]}>
                {formData.description.length}/500 ký tự
              </Text>
            </View>

            {/* Priority Selection */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: text }]}>Độ ưu tiên</Text>
              <View style={styles.priorityGrid}>
                {(Object.keys(PRIORITY_CONFIG) as Array<keyof typeof PRIORITY_CONFIG>).map((priority) => {
                  const config = PRIORITY_CONFIG[priority];
                  return (
                    <Pressable
                      key={priority}
                      style={[
                        styles.priorityChip,
                        { borderColor: border, backgroundColor: chipBackground },
                        formData.priority === priority && {
                          backgroundColor: config.color + '20',
                          borderColor: config.color,
                        },
                      ]}
                      onPress={() => setFormData(prev => ({ ...prev, priority }))}
                    >
                      <Ionicons
                        name={config.icon}
                        size={16}
                        color={formData.priority === priority ? config.color : textMuted}
                      />
                      <Text
                        style={[
                          styles.priorityChipText,
                          { color: formData.priority === priority ? config.color : text },
                        ]}
                      >
                        {config.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Status Selection */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: text }]}>Trạng thái</Text>
              <View style={styles.statusGrid}>
                {(Object.keys(STATUS_CONFIG) as Array<keyof typeof STATUS_CONFIG>).map((status) => {
                  const config = STATUS_CONFIG[status];
                  return (
                    <Pressable
                      key={status}
                      style={[
                        styles.statusChip,
                        { borderColor: border, backgroundColor: chipBackground },
                        formData.status === status && {
                          backgroundColor: config.color + '20',
                          borderColor: config.color,
                        },
                      ]}
                      onPress={() => setFormData(prev => ({ ...prev, status }))}
                    >
                      <Text
                        style={[
                          styles.statusChipText,
                          { color: formData.status === status ? config.color : text },
                        ]}
                      >
                        {config.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Due Date Input */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: text }]}>Hạn hoàn thành</Text>
              <View style={[styles.inputContainer, { borderColor: border }]}>
                <Ionicons name="calendar-outline" size={20} color={textMuted} />
                <TextInput
                  style={[styles.input, { color: text }]}
                  value={formData.dueDate}
                  onChangeText={(value) => setFormData(prev => ({ ...prev, dueDate: value }))}
                  placeholder="YYYY-MM-DD (tùy chọn)"
                  placeholderTextColor={textMuted}
                />
              </View>
              <Text style={[styles.hint, { color: textMuted }]}>Định dạng: YYYY-MM-DD</Text>
            </View>

            {/* Tags Selection */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: text }]}>Nhãn công việc</Text>
              
              {/* Selected Tags */}
              {formData.tags.length > 0 && (
                <View style={styles.selectedTags}>
                  {formData.tags.map((tag) => (
                    <View key={tag} style={[styles.selectedTag, { backgroundColor: primary + '20' }]}>
                      <Text style={[styles.selectedTagText, { color: primary }]}>{tag}</Text>
                      <Pressable onPress={() => handleRemoveTag(tag)} hitSlop={4}>
                        <Ionicons name="close-circle" size={16} color={primary} />
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}

              {/* Common Tags */}
              <View style={styles.tagsGrid}>
                {COMMON_TAGS.filter(tag => !formData.tags.includes(tag)).map((tag) => (
                  <Pressable
                    key={tag}
                    style={[styles.tagChip, { borderColor: border, backgroundColor: chipBackground }]}
                    onPress={() => handleAddTag(tag)}
                  >
                    <Ionicons name="add" size={14} color={textMuted} />
                    <Text style={[styles.tagChipText, { color: text }]}>{tag}</Text>
                  </Pressable>
                ))}
              </View>

              {/* Custom Tag Input */}
              <View style={styles.customTagContainer}>
                <View style={[styles.inputContainer, { flex: 1, borderColor: border }]}>
                  <Ionicons name="pricetag-outline" size={20} color={textMuted} />
                  <TextInput
                    style={[styles.input, { color: text }]}
                    value={customTag}
                    onChangeText={setCustomTag}
                    placeholder="Thêm nhãn tùy chỉnh..."
                    placeholderTextColor={textMuted}
                    onSubmitEditing={handleAddCustomTag}
                  />
                </View>
                <Pressable
                  style={[styles.addButton, { backgroundColor: primary }]}
                  onPress={handleAddCustomTag}
                  disabled={!customTag.trim()}
                >
                  <Ionicons name="add" size={20} color="#fff" />
                </Pressable>
              </View>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={[styles.footer, { borderTopColor: border }]}>
            <Button
              title="Hủy"
              variant="secondary"
              onPress={handleClose}
              style={{ flex: 1 }}
            />
            <Button
              title="Thêm công việc"
              onPress={handleSubmit}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SpacingSemantic.lg,
    borderBottomWidth: 1,
  },
  scrollContent: {
    padding: SpacingSemantic.lg,
  },
  field: {
    marginBottom: SpacingSemantic.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: SpacingSemantic.sm,
  },
  required: {
    color: '#000000',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: SpacingSemantic.md,
    paddingVertical: SpacingSemantic.sm,
    gap: SpacingSemantic.sm,
  },
  textAreaContainer: {
    alignItems: 'flex-start',
    paddingVertical: SpacingSemantic.md,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#000000',
    fontSize: 12,
    marginTop: 4,
  },
  hint: {
    fontSize: 12,
    marginTop: 4,
  },
  priorityGrid: {
    flexDirection: 'row',
    gap: SpacingSemantic.sm,
  },
  priorityChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: SpacingSemantic.md,
    borderRadius: 12,
    borderWidth: 1,
  },
  priorityChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SpacingSemantic.sm,
  },
  statusChip: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: SpacingSemantic.md,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  statusChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  selectedTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SpacingSemantic.sm,
    marginBottom: SpacingSemantic.sm,
  },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  selectedTagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SpacingSemantic.sm,
    marginBottom: SpacingSemantic.sm,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  tagChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  customTagContainer: {
    flexDirection: 'row',
    gap: SpacingSemantic.sm,
    alignItems: 'center',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    gap: SpacingSemantic.md,
    padding: SpacingSemantic.lg,
    borderTopWidth: 1,
  },
});
