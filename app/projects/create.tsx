/**
 * Project Creation Screen
 * Route: /projects/create
 * Purpose: Create new construction project with full details
 */

import { useAuth } from '@/context/AuthContext';
import { createProject, CreateProjectDto } from '@/services/api/projectsApi';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
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
    View
} from 'react-native';

interface FormData {
  title: string;
  description: string;
  budget: string;
  startDate: string;
  endDate: string;
  location: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
}

interface FormErrors {
  title?: string;
  budget?: string;
  startDate?: string;
  endDate?: string;
  clientName?: string;
}

export default function CreateProjectScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    budget: '',
    startDate: '',
    endDate: '',
    location: '',
    clientName: '',
    clientPhone: '',
    clientEmail: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Update field
  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Validate form
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Tên dự án không được để trống';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Tên dự án phải có ít nhất 3 ký tự';
    }

    if (formData.budget && isNaN(Number(formData.budget))) {
      newErrors.budget = 'Ngân sách phải là số';
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
      }
    }

    if (formData.clientName && formData.clientName.length < 2) {
      newErrors.clientName = 'Tên khách hàng phải có ít nhất 2 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!validate()) {
      Alert.alert('Lỗi', 'Vui lòng kiểm tra lại thông tin');
      return;
    }

    setLoading(true);
    try {
      const dto: CreateProjectDto = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        budget: formData.budget ? Number(formData.budget) : undefined,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
      };

      const newProject = await createProject(dto);

      Alert.alert(
        'Thành công',
        'Dự án đã được tạo thành công!',
        [
          {
            text: 'Xem dự án',
            onPress: () => router.replace(`/projects/${newProject.id}` as any),
          },
          {
            text: 'Tạo dự án khác',
            onPress: () => {
              setFormData({
                title: '',
                description: '',
                budget: '',
                startDate: '',
                endDate: '',
                location: '',
                clientName: '',
                clientPhone: '',
                clientEmail: '',
              });
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('[CreateProject] Error:', error);
      Alert.alert(
        'Lỗi',
        error.message || 'Không thể tạo dự án. Vui lòng thử lại sau.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tạo Dự Án Mới</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Project Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="information-circle" size={18} color="#FF6B00" />
            {'  '}Thông tin dự án
          </Text>

          {/* Title */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Tên dự án <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.title && styles.inputError]}
              placeholder="VD: Xây dựng biệt thự 3 tầng"
              value={formData.title}
              onChangeText={(value) => updateField('title', value)}
              editable={!loading}
            />
            {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
          </View>

          {/* Description */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Mô tả dự án</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Mô tả chi tiết về dự án..."
              value={formData.description}
              onChangeText={(value) => updateField('description', value)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!loading}
            />
          </View>

          {/* Location */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Địa điểm</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: Quận 9, TP.HCM"
              value={formData.location}
              onChangeText={(value) => updateField('location', value)}
              editable={!loading}
            />
          </View>

          {/* Budget */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Ngân sách (VNĐ)</Text>
            <TextInput
              style={[styles.input, errors.budget && styles.inputError]}
              placeholder="VD: 500000000"
              value={formData.budget}
              onChangeText={(value) => updateField('budget', value)}
              keyboardType="numeric"
              editable={!loading}
            />
            {errors.budget && <Text style={styles.errorText}>{errors.budget}</Text>}
            {formData.budget && !errors.budget && (
              <Text style={styles.helperText}>
                ~ {Number(formData.budget).toLocaleString('vi-VN')} đ
              </Text>
            )}
          </View>
        </View>

        {/* Timeline Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="calendar" size={18} color="#FF6B00" />
            {'  '}Thời gian thực hiện
          </Text>

          <View style={styles.row}>
            {/* Start Date */}
            <View style={[styles.fieldContainer, styles.halfWidth]}>
              <Text style={styles.label}>Ngày bắt đầu</Text>
              <TextInput
                style={[styles.input, errors.startDate && styles.inputError]}
                placeholder="YYYY-MM-DD"
                value={formData.startDate}
                onChangeText={(value) => updateField('startDate', value)}
                editable={!loading}
              />
              {errors.startDate && (
                <Text style={styles.errorText}>{errors.startDate}</Text>
              )}
            </View>

            {/* End Date */}
            <View style={[styles.fieldContainer, styles.halfWidth]}>
              <Text style={styles.label}>Ngày kết thúc</Text>
              <TextInput
                style={[styles.input, errors.endDate && styles.inputError]}
                placeholder="YYYY-MM-DD"
                value={formData.endDate}
                onChangeText={(value) => updateField('endDate', value)}
                editable={!loading}
              />
              {errors.endDate && <Text style={styles.errorText}>{errors.endDate}</Text>}
            </View>
          </View>
        </View>

        {/* Client Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="person" size={18} color="#FF6B00" />
            {'  '}Thông tin khách hàng
          </Text>

          {/* Client Name */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Tên khách hàng</Text>
            <TextInput
              style={[styles.input, errors.clientName && styles.inputError]}
              placeholder="VD: Nguyễn Văn A"
              value={formData.clientName}
              onChangeText={(value) => updateField('clientName', value)}
              editable={!loading}
            />
            {errors.clientName && (
              <Text style={styles.errorText}>{errors.clientName}</Text>
            )}
          </View>

          {/* Client Phone */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Số điện thoại</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: 0901234567"
              value={formData.clientPhone}
              onChangeText={(value) => updateField('clientPhone', value)}
              keyboardType="phone-pad"
              editable={!loading}
            />
          </View>

          {/* Client Email */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: client@example.com"
              value={formData.clientEmail}
              onChangeText={(value) => updateField('clientEmail', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color="#0066CC" />
          <Text style={styles.infoText}>
            Các thông tin đánh dấu (*) là bắt buộc. Bạn có thể cập nhật thông tin sau khi
            tạo dự án.
          </Text>
        </View>
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => router.back()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Hủy</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.submitButton, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#FFF" />
              <Text style={styles.submitButtonText}>  Tạo dự án</Text>
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
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    ...Platform.select({
      ios: {
        paddingTop: 50,
      },
      android: {
        paddingTop: 16,
      },
    }),
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 8,
  },
  required: {
    color: '#FF3B30',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#FAFAFA',
    color: '#333',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E8F4FF',
    borderRadius: 8,
    padding: 12,
    gap: 8,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#0066CC',
    lineHeight: 18,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
    ...Platform.select({
      ios: {
        paddingBottom: 32,
      },
    }),
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  submitButton: {
    backgroundColor: '#FF6B00',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
