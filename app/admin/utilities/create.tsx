/**
 * Create/Edit Utility Form
 * CRUD for app utilities/features
 */
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { utilitiesApi, UtilityType } from '@/services/utilities-api';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const UTILITY_TYPES = [
  { id: 'CALCULATOR', name: 'Công cụ tính', icon: 'calculator', color: '#3B82F6' },
  { id: 'AI', name: 'Trí tuệ nhân tạo', icon: 'sparkles', color: '#8B5CF6' },
  { id: 'MEDIA', name: 'Đa phương tiện', icon: 'film', color: '#EF4444' },
  { id: 'DOCUMENT', name: 'Tài liệu', icon: 'document-text', color: '#10B981' },
  { id: 'OTHER', name: 'Khác', icon: 'ellipsis-horizontal', color: '#6B7280' },
];

const ICON_OPTIONS = [
  'calculator-outline',
  'cash-outline',
  'chatbubbles-outline',
  'videocam-outline',
  'play-circle-outline',
  'document-text-outline',
  'camera-outline',
  'map-outline',
  'calendar-outline',
  'notifications-outline',
];

const COLOR_OPTIONS = [
  '#3B82F6',
  '#8B5CF6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#06B6D4',
  '#EC4899',
  '#6366F1',
];

export default function CreateUtility() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const params = useLocalSearchParams();
  const isEdit = !!params.id;
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);

  const [formData, setFormData] = useState({
    name: '',
    type: '' as UtilityType | '',
    icon: 'calculator-outline',
    color: '#3B82F6',
    description: '',
    route: '',
    enabled: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEdit && params.id) {
      loadUtility(Number(params.id));
    }
  }, [isEdit, params.id]);

  const loadUtility = async (id: number) => {
    try {
      setInitialLoading(true);
      const response = await utilitiesApi.getById(id);
      const utility = response.data;
      
      setFormData({
        name: utility.name,
        type: utility.type,
        icon: utility.icon,
        color: utility.color,
        description: utility.description || '',
        route: utility.route || '',
        enabled: utility.enabled,
      });
    } catch (error: any) {
      Alert.alert('Lỗi', error?.message || 'Không thể tải tiện ích');
      router.back();
    } finally {
      setInitialLoading(false);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Vui lòng nhập tên tiện ích';
    else if (formData.name.trim().length < 3) newErrors.name = 'Tên phải có ít nhất 3 ký tự';
    
    if (!formData.type) newErrors.type = 'Vui lòng chọn loại tiện ích';
    if (!formData.route.trim()) newErrors.route = 'Vui lòng nhập đường dẫn';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      Alert.alert('Lỗi', 'Vui lòng kiểm tra lại thông tin');
      return;
    }

    setLoading(true);

    try {
      const utilityData = {
        name: formData.name.trim(),
        type: formData.type as UtilityType,
        icon: formData.icon,
        color: formData.color,
        description: formData.description.trim() || undefined,
        route: formData.route.trim() || undefined,
        enabled: formData.enabled,
      };

      if (isEdit && params.id) {
        await utilitiesApi.update(Number(params.id), utilityData);
        Alert.alert(
          'Thành công',
          'Đã cập nhật tiện ích',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        await utilitiesApi.create(utilityData);
        Alert.alert(
          'Thành công',
          'Đã tạo tiện ích mới',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    } catch (error: any) {
      console.error('Error saving utility:', error);
      Alert.alert(
        'Lỗi',
        error?.message || 'Không thể lưu tiện ích. Vui lòng thử lại.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen
          options={{
            title: 'Đang tải...',
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={styles.loadingText}>Đang tải tiện ích...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: isEdit ? 'Chỉnh sửa tiện ích' : 'Tạo tiện ích mới',
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            {/* Preview */}
            <View style={[styles.preview, { backgroundColor: colors.surface }]}>
              <View style={[styles.previewIcon, { backgroundColor: formData.color + '20' }]}>
                <Ionicons name={formData.icon as any} size={32} color={formData.color} />
              </View>
              <Text style={[styles.previewName, { color: colors.text }]}>
                {formData.name || 'Tên tiện ích'}
              </Text>
              <Text style={styles.previewDesc}>
                {formData.description || 'Mô tả tiện ích'}
              </Text>
            </View>

            {/* Name */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>
                Tên tiện ích <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.surface, color: colors.text },
                  errors.name && styles.inputError,
                ]}
                placeholder="Nhập tên tiện ích"
                placeholderTextColor="#9CA3AF"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            {/* Type */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>
                Loại tiện ích <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.typeGrid}>
                {UTILITY_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.typeOption,
                      {
                        backgroundColor:
                          formData.type === type.id ? type.color : colors.surface,
                      },
                    ]}
                    onPress={() => setFormData({ ...formData, type: type.id as UtilityType })}
                  >
                    <Ionicons
                      name={type.icon as any}
                      size={16}
                      color={formData.type === type.id ? '#fff' : type.color}
                    />
                    <Text
                      style={[
                        styles.typeOptionText,
                        {
                          color: formData.type === type.id ? '#fff' : colors.text,
                        },
                      ]}
                    >
                      {type.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.type && <Text style={styles.errorText}>{errors.type}</Text>}
            </View>

            {/* Icon */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>Biểu tượng</Text>
              <View style={styles.iconGrid}>
                {ICON_OPTIONS.map((iconName) => (
                  <TouchableOpacity
                    key={iconName}
                    style={[
                      styles.iconOption,
                      {
                        backgroundColor:
                          formData.icon === iconName
                            ? formData.color + '20'
                            : colors.surface,
                      },
                    ]}
                    onPress={() => setFormData({ ...formData, icon: iconName })}
                  >
                    <Ionicons
                      name={iconName as any}
                      size={24}
                      color={formData.icon === iconName ? formData.color : '#6B7280'}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Color */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>Màu sắc</Text>
              <View style={styles.colorGrid}>
                {COLOR_OPTIONS.map((colorValue) => (
                  <TouchableOpacity
                    key={colorValue}
                    style={[
                      styles.colorOption,
                      { backgroundColor: colorValue },
                      formData.color === colorValue && styles.colorOptionSelected,
                    ]}
                    onPress={() => setFormData({ ...formData, color: colorValue })}
                  >
                    {formData.color === colorValue && (
                      <Ionicons name="checkmark" size={20} color="#fff" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Route */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>
                Đường dẫn <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.surface, color: colors.text },
                  errors.route && styles.inputError,
                ]}
                placeholder="/utilities/calculator"
                placeholderTextColor="#9CA3AF"
                value={formData.route}
                onChangeText={(text) => setFormData({ ...formData, route: text })}
              />
              {errors.route && <Text style={styles.errorText}>{errors.route}</Text>}
            </View>

            {/* Description */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>Mô tả</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  { backgroundColor: colors.surface, color: colors.text },
                ]}
                placeholder="Mô tả chi tiết chức năng tiện ích..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
              />
            </View>

            {/* Enable Status */}
            <View style={[styles.section, styles.switchRow]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: colors.text, marginBottom: 4 }]}>
                  Kích hoạt
                </Text>
                <Text style={styles.helperText}>
                  Bật để hiển thị tiện ích cho người dùng
                </Text>
              </View>
              <Switch
                value={formData.enabled}
                onValueChange={(value) => setFormData({ ...formData, enabled: value })}
                trackColor={{ false: '#D1D5DB', true: formData.color + '80' }}
                thumbColor={formData.enabled ? formData.color : '#f4f3f4'}
              />
            </View>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={[styles.footer, { backgroundColor: colors.surface }]}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: formData.color },
              loading && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <Text style={styles.submitButtonText}>Đang lưu...</Text>
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>
                  {isEdit ? 'Cập nhật' : 'Tạo mới'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  preview: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  previewIcon: {
    width: 72,
    height: 72,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  previewName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  previewDesc: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  typeOptionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  iconOption: {
    width: 52,
    height: 52,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  helperText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
});
