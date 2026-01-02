/**
 * Create/Edit Service Form
 * CRUD for construction services
 */
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ServiceCategory, servicesApi } from '@/services/services-api';
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
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const CATEGORIES = [
  { id: 'DESIGN', name: 'Thiết kế', icon: 'color-palette-outline', color: '#8B5CF6' },
  { id: 'CONSTRUCTION', name: 'Thi công', icon: 'construct-outline', color: '#F59E0B' },
  { id: 'CONSULTING', name: 'Tư vấn', icon: 'bulb-outline', color: '#3B82F6' },
  { id: 'MAINTENANCE', name: 'Bảo trì', icon: 'build-outline', color: '#06B6D4' },
  { id: 'INSPECTION', name: 'Giám sát', icon: 'eye-outline', color: '#EF4444' },
  { id: 'OTHER', name: 'Khác', icon: 'ellipsis-horizontal-circle-outline', color: '#6B7280' },
];

export default function CreateService() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const params = useLocalSearchParams();
  const isEdit = !!params.id;
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);

  const [formData, setFormData] = useState({
    name: '',
    category: '' as ServiceCategory | '',
    price: '',
    unit: '',
    description: '',
    duration: '',
    status: 'ACTIVE' as 'ACTIVE' | 'DRAFT',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load existing service if editing
  useEffect(() => {
    if (isEdit && params.id) {
      loadService(Number(params.id));
    }
  }, [isEdit, params.id]);

  const loadService = async (id: number) => {
    try {
      setInitialLoading(true);
      const response = await servicesApi.getById(id);
      const service = response.data;
      
      setFormData({
        name: service.name,
        category: service.category,
        price: service.price.toString(),
        unit: service.unit,
        description: service.description || '',
        duration: service.duration || '',
        status: service.status === 'ACTIVE' ? 'ACTIVE' : 'DRAFT',
      });
    } catch (error: any) {
      Alert.alert('Lỗi', error?.message || 'Không thể tải dịch vụ');
      router.back();
    } finally {
      setInitialLoading(false);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Vui lòng nhập tên dịch vụ';
    else if (formData.name.trim().length < 3) newErrors.name = 'Tên dịch vụ phải có ít nhất 3 ký tự';
    
    if (!formData.category) newErrors.category = 'Vui lòng chọn danh mục';
    
    if (!formData.price || isNaN(Number(formData.price))) {
      newErrors.price = 'Giá không hợp lệ';
    } else if (Number(formData.price) <= 0) {
      newErrors.price = 'Giá phải lớn hơn 0';
    }
    
    if (!formData.unit.trim()) newErrors.unit = 'Vui lòng nhập đơn vị';

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
      const serviceData = {
        name: formData.name.trim(),
        category: formData.category as ServiceCategory,
        price: Number(formData.price),
        unit: formData.unit.trim(),
        status: formData.status,
        description: formData.description.trim() || undefined,
        duration: formData.duration.trim() || undefined,
      };

      if (isEdit && params.id) {
        await servicesApi.update(Number(params.id), serviceData);
        Alert.alert(
          'Thành công',
          'Đã cập nhật dịch vụ',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        await servicesApi.create(serviceData);
        Alert.alert(
          'Thành công',
          'Đã tạo dịch vụ mới',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    } catch (error: any) {
      console.error('Error saving service:', error);
      Alert.alert(
        'Lỗi',
        error?.message || 'Không thể lưu dịch vụ. Vui lòng thử lại.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner if loading existing service
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
          <Text style={styles.loadingText}>Đang tải dịch vụ...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: isEdit ? 'Chỉnh sửa dịch vụ' : 'Tạo dịch vụ mới',
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            {/* Name */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>
                Tên dịch vụ <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.surface, color: colors.text },
                  errors.name && styles.inputError,
                ]}
                placeholder="Nhập tên dịch vụ"
                placeholderTextColor="#9CA3AF"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            {/* Category */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>
                Danh mục <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryOption,
                      {
                        backgroundColor:
                          formData.category === cat.id ? cat.color : colors.surface,
                      },
                    ]}
                    onPress={() => setFormData({ ...formData, category: cat.id as ServiceCategory })}
                  >
                    <Ionicons
                      name={cat.icon as any}
                      size={18}
                      color={formData.category === cat.id ? '#fff' : cat.color}
                    />
                    <Text
                      style={[
                        styles.categoryOptionText,
                        {
                          color: formData.category === cat.id ? '#fff' : colors.text,
                        },
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
            </View>

            {/* Price & Unit */}
            <View style={styles.row}>
              <View style={[styles.section, { flex: 2 }]}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Giá <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: colors.surface, color: colors.text },
                    errors.price && styles.inputError,
                  ]}
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={formData.price}
                  onChangeText={(text) => setFormData({ ...formData, price: text })}
                />
                {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
              </View>

              <View style={[styles.section, { flex: 1 }]}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Đơn vị <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: colors.surface, color: colors.text },
                    errors.unit && styles.inputError,
                  ]}
                  placeholder="m², ngày..."
                  placeholderTextColor="#9CA3AF"
                  value={formData.unit}
                  onChangeText={(text) => setFormData({ ...formData, unit: text })}
                />
                {errors.unit && <Text style={styles.errorText}>{errors.unit}</Text>}
              </View>
            </View>

            {/* Duration */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>Thời gian thực hiện</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.surface, color: colors.text },
                ]}
                placeholder="VD: 2-3 tháng, 15-20 ngày..."
                placeholderTextColor="#9CA3AF"
                value={formData.duration}
                onChangeText={(text) => setFormData({ ...formData, duration: text })}
              />
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
                placeholder="Mô tả chi tiết dịch vụ, quy trình, cam kết..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
              />
            </View>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={[styles.footer, { backgroundColor: colors.surface }]}>
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
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
    minHeight: 120,
    paddingTop: 12,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  categoryOptionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  submitButton: {
    backgroundColor: '#8B5CF6',
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
    color: '#FFFFFF',
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
