// Create Construction Project Form Component
// Form for creating new construction projects

import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { useThemeColor } from '@/hooks/use-theme-color';
import { uploadFile } from '@/services/storageUpload';
import {
    CreateProjectFormData,
    ProjectType
} from '@/types/construction';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface CreateProjectFormProps {
  onSubmit: (data: CreateProjectFormData) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

interface FormData {
  project_name: string;
  project_type: ProjectType | '';
  description: string;
  location: {
    address: string;
    ward: string;
    district: string;
    province: string;
    land_area: string;
    construction_area: string;
  };
  estimated_budget: string;
  preferred_start_date: string;
  specifications: {
    floors: string;
    bedrooms: string;
    bathrooms: string;
    parking_spaces: string;
    special_features: string;
  };
  notes: string;
}

const PROJECT_TYPES: { value: ProjectType; label: string }[] = [
  { value: 'nha_o', label: 'Nhà ở' },
  { value: 'biet_thu', label: 'Biệt thự' },
  { value: 'nha_pho', label: 'Nhà phố' },
  { value: 'chung_cu', label: 'Chung cư' },
  { value: 'van_phong', label: 'Văn phòng' },
  { value: 'thuong_mai', label: 'Thương mại' },
  { value: 'cong_nghiep', label: 'Công nghiệp' },
  { value: 'khac', label: 'Khác' },
];

export const CreateProjectForm: React.FC<CreateProjectFormProps> = ({
  onSubmit,
  onCancel,
  loading = false
}) => {
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'icon');
  const primaryColor = useThemeColor({}, 'tint');
  const dangerColor = useThemeColor({}, 'danger');
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    project_name: '',
    project_type: '',
    description: '',
    location: {
      address: '',
      ward: '',
      district: '',
      province: '',
      land_area: '',
      construction_area: '',
    },
    estimated_budget: '',
    preferred_start_date: '',
    specifications: {
      floors: '',
      bedrooms: '',
      bathrooms: '',
      parking_spaces: '',
      special_features: '',
    },
    notes: '',
  });

  const [landDocuments, setLandDocuments] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, { path: string; savedAs: string }>>({});
  const [errors, setErrors] = useState<string[]>([]);

  // Update form field
  const updateField = (section: keyof FormData, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: typeof prev[section] === 'object' 
        ? { ...(prev[section] as any), [field]: value }
        : value
    }));
  };

  // Pick land documents
  const pickLandDocuments = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        multiple: true,
      });

      if (!result.canceled) {
        setLandDocuments(prev => [...prev, ...result.assets]);
      }
    } catch (error) {
      console.error('Error picking documents:', error);
      Alert.alert('Lỗi', 'Không thể chọn tài liệu');
    }
  };

  // Pick photos
  const pickPhotos = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        setPhotos(prev => [...prev, ...result.assets]);
      }
    } catch (error) {
      console.error('Error picking photos:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh');
    }
  };

  // Remove document
  const removeDocument = (index: number) => {
    setLandDocuments(prev => prev.filter((_, i) => i !== index));
    setUploadedDocs(prev => {
      const copy = { ...prev };
      // Note: keys are doc_<index>_<name>
      Object.keys(copy).forEach(k => {
        if (k.startsWith(`doc_${index}_`)) delete copy[k];
      });
      return copy;
    });
  };

  // Remove photo
  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!formData.project_name.trim()) {
      newErrors.push('Tên dự án không được để trống');
    }

    if (!formData.project_type) {
      newErrors.push('Loại dự án không được để trống');
    }

    if (!formData.location.address.trim()) {
      newErrors.push('Địa chỉ xây dựng không được để trống');
    }

    if (!formData.location.land_area || parseFloat(formData.location.land_area) <= 0) {
      newErrors.push('Diện tích đất phải lớn hơn 0');
    }

    if (!formData.estimated_budget || parseFloat(formData.estimated_budget) <= 0) {
      newErrors.push('Ngân sách dự kiến phải lớn hơn 0');
    }

    if (landDocuments.length === 0) {
      newErrors.push('Cần tải lên ít nhất một tài liệu sổ đất');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const submitData: CreateProjectFormData = {
        project_name: formData.project_name,
        project_type: formData.project_type as ProjectType,
        description: formData.description || undefined,
        location: {
          address: formData.location.address,
          ward: formData.location.ward,
          district: formData.location.district,
          province: formData.location.province,
          land_area: parseFloat(formData.location.land_area),
          construction_area: formData.location.construction_area 
            ? parseFloat(formData.location.construction_area)
            : undefined,
        },
        estimated_budget: parseFloat(formData.estimated_budget),
        preferred_start_date: formData.preferred_start_date || undefined,
        land_documents: landDocuments,
        photos: photos.length > 0 ? photos : undefined,
        specifications: {
          floors: parseInt(formData.specifications.floors) || 1,
          bedrooms: formData.specifications.bedrooms 
            ? parseInt(formData.specifications.bedrooms) 
            : undefined,
          bathrooms: formData.specifications.bathrooms 
            ? parseInt(formData.specifications.bathrooms) 
            : undefined,
          parking_spaces: formData.specifications.parking_spaces 
            ? parseInt(formData.specifications.parking_spaces) 
            : undefined,
          special_features: formData.specifications.special_features 
            ? formData.specifications.special_features.split(',').map(f => f.trim())
            : undefined,
        },
        notes: formData.notes || undefined,
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting form:', error);
      Alert.alert('Lỗi', 'Không thể tạo dự án');
    }
  };

  return (
    <Container>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Error Display */}
        {errors.length > 0 && (
          <View style={[styles.errorContainer, { borderColor: dangerColor }]}>
            <Ionicons name="alert-circle" size={20} color={dangerColor} />
            <View style={{ marginLeft: 8, flex: 1 }}>
              {errors.map((error, index) => (
                <Text key={index} style={[styles.errorText, { color: dangerColor }]}>
                  • {error}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Basic Information */}
        <Section title="Thông tin cơ bản">
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: textColor }]}>
              Tên dự án <Text style={{ color: dangerColor }}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, { borderColor, color: textColor }]}
              value={formData.project_name}
              onChangeText={(value) => updateField('project_name', '', value)}
              placeholder="Nhập tên dự án"
              placeholderTextColor={mutedColor}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: textColor }]}>
              Loại dự án <Text style={{ color: dangerColor }}>*</Text>
            </Text>
            <View style={styles.typeContainer}>
              {PROJECT_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.typeOption,
                    { borderColor },
                    formData.project_type === type.value && { 
                      backgroundColor: primaryColor,
                      borderColor: primaryColor
                    }
                  ]}
                  onPress={() => updateField('project_type', '', type.value)}
                >
                  <Text
                    style={[
                      styles.typeText,
                      { color: textColor },
                      formData.project_type === type.value && { color: 'white' }
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: textColor }]}>Mô tả</Text>
            <TextInput
              style={[styles.textArea, { borderColor, color: textColor }]}
              value={formData.description}
              onChangeText={(value) => updateField('description', '', value)}
              placeholder="Mô tả chi tiết về dự án"
              placeholderTextColor={mutedColor}
              multiline
              numberOfLines={3}
            />
          </View>
        </Section>

        {/* Location Information */}
        <Section title="Thông tin vị trí">
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: textColor }]}>
              Địa chỉ xây dựng <Text style={{ color: dangerColor }}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, { borderColor, color: textColor }]}
              value={formData.location.address}
              onChangeText={(value) => updateField('location', 'address', value)}
              placeholder="Số nhà, tên đường"
              placeholderTextColor={mutedColor}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={[styles.label, { color: textColor }]}>Phường/Xã</Text>
              <TextInput
                style={[styles.input, { borderColor, color: textColor }]}
                value={formData.location.ward}
                onChangeText={(value) => updateField('location', 'ward', value)}
                placeholder="Phường/Xã"
                placeholderTextColor={mutedColor}
              />
            </View>
            <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={[styles.label, { color: textColor }]}>Quận/Huyện</Text>
              <TextInput
                style={[styles.input, { borderColor, color: textColor }]}
                value={formData.location.district}
                onChangeText={(value) => updateField('location', 'district', value)}
                placeholder="Quận/Huyện"
                placeholderTextColor={mutedColor}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: textColor }]}>Tỉnh/Thành phố</Text>
            <TextInput
              style={[styles.input, { borderColor, color: textColor }]}
              value={formData.location.province}
              onChangeText={(value) => updateField('location', 'province', value)}
              placeholder="Tỉnh/Thành phố"
              placeholderTextColor={mutedColor}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={[styles.label, { color: textColor }]}>
                Diện tích đất (m²) <Text style={{ color: dangerColor }}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, { borderColor, color: textColor }]}
                value={formData.location.land_area}
                onChangeText={(value) => updateField('location', 'land_area', value)}
                placeholder="0"
                placeholderTextColor={mutedColor}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={[styles.label, { color: textColor }]}>Diện tích xây dựng (m²)</Text>
              <TextInput
                style={[styles.input, { borderColor, color: textColor }]}
                value={formData.location.construction_area}
                onChangeText={(value) => updateField('location', 'construction_area', value)}
                placeholder="0"
                placeholderTextColor={mutedColor}
                keyboardType="numeric"
              />
            </View>
          </View>
        </Section>

        {/* Budget & Timeline */}
        <Section title="Ngân sách & Thời gian">
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: textColor }]}>
              Ngân sách dự kiến (VND) <Text style={{ color: dangerColor }}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, { borderColor, color: textColor }]}
              value={formData.estimated_budget}
              onChangeText={(value) => updateField('estimated_budget', '', value)}
              placeholder="0"
              placeholderTextColor={mutedColor}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: textColor }]}>Ngày khởi công mong muốn</Text>
            <TextInput
              style={[styles.input, { borderColor, color: textColor }]}
              value={formData.preferred_start_date}
              onChangeText={(value) => updateField('preferred_start_date', '', value)}
              placeholder="dd/mm/yyyy"
              placeholderTextColor={mutedColor}
            />
          </View>
        </Section>

        {/* Documents */}
        <Section title="Tài liệu sổ đất">
          <View style={[styles.infoNote, { borderColor: mutedColor, backgroundColor: 'rgba(128, 128, 128, 0.1)' }]}>
            <Ionicons name="information-circle" size={16} color={mutedColor} />
            <Text style={[styles.infoText, { color: mutedColor }]}>
              Bạn có thể tải tài liệu lên server an toàn (multer) hoặc lưu cục bộ.
            </Text>
          </View>
          
          <TouchableOpacity
            style={[styles.uploadButton, { borderColor }]}
            onPress={pickLandDocuments}
          >
            <Ionicons name="document-attach" size={24} color={primaryColor} />
            <Text style={[styles.uploadText, { color: textColor }]}>
              Tải lên tài liệu sổ đất
            </Text>
          </TouchableOpacity>

          {landDocuments.map((doc, index) => {
            const key = `doc_${index}_${doc.name}`;
            const info = uploadedDocs[key];
            return (
              <View key={index} style={[styles.fileItem, { borderColor }]}> 
                <Ionicons name="document" size={20} color={primaryColor} />
                <View style={{ flex: 1, marginHorizontal: 8 }}>
                  <Text style={[styles.fileName, { color: textColor }]} numberOfLines={1}>
                    {doc.name}
                  </Text>
                  {info?.path ? (
                    <Text style={{ color: '#16a34a', fontSize: 12 }} numberOfLines={1}>Đã upload: {info.path}</Text>
                  ) : null}
                </View>
                <TouchableOpacity
                  onPress={async () => {
                    try {
                      const res = await uploadFile({ uri: doc.uri, name: doc.name || `doc_${index}`, type: doc.mimeType || 'application/octet-stream' }, { projectId: 'temp' });
                      if (res?.ok && res.file && res.file.path && res.file.savedAs) {
                        const { path, savedAs } = res.file;
                        setUploadedDocs(prev => ({ ...prev, [key]: { path, savedAs } }));
                        Alert.alert('Thành công', 'Đã upload tài liệu lên server');
                      } else {
                        Alert.alert('Lỗi', res?.message || 'Upload thất bại');
                      }
                    } catch (e: any) {
                      Alert.alert('Lỗi', e?.message || 'Upload thất bại');
                    }
                  }}
                  style={{ marginRight: 10 }}
                >
                  <Ionicons name="cloud-upload" size={20} color={primaryColor} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    if (info?.savedAs) {
                      const filename = encodeURIComponent(info.savedAs);
                      router.push(`/viewer?filename=${filename}` as any);
                    } else {
                      Alert.alert('Chưa có file trên server', 'Hãy upload trước khi xem');
                    }
                  }}
                  style={{ marginRight: 10 }}
                >
                  <Ionicons name="eye" size={20} color={primaryColor} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeDocument(index)}>
                  <Ionicons name="close-circle" size={20} color={dangerColor} />
                </TouchableOpacity>
              </View>
            );
          })}
        </Section>

        {/* Photos */}
        <Section title="Hình ảnh (tùy chọn)">
          <View style={[styles.infoNote, { borderColor: mutedColor, backgroundColor: 'rgba(128, 128, 128, 0.1)' }]}>
            <Ionicons name="information-circle" size={16} color={mutedColor} />
            <Text style={[styles.infoText, { color: mutedColor }]}>
              Hình ảnh được lưu trữ an toàn trên thiết bị của bạn (không upload lên server)
            </Text>
          </View>
          
          <TouchableOpacity
            style={[styles.uploadButton, { borderColor }]}
            onPress={pickPhotos}
          >
            <Ionicons name="camera" size={24} color={primaryColor} />
            <Text style={[styles.uploadText, { color: textColor }]}>
              Thêm hình ảnh
            </Text>
          </TouchableOpacity>

          {photos.length > 0 && (
            <View style={styles.photoGrid}>
              {photos.map((photo, index) => (
                <View key={index} style={styles.photoItem}>
                  <TouchableOpacity
                    style={styles.removePhoto}
                    onPress={() => removePhoto(index)}
                  >
                    <Ionicons name="close-circle" size={20} color={dangerColor} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </Section>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          {onCancel && (
            <Button
              title="Hủy"
              variant="secondary"
              onPress={onCancel}
              style={{ flex: 1, marginRight: 12 }}
            />
          )}
          <Button
            title="Tạo dự án"
            onPress={handleSubmit}
            loading={loading}
            style={{ flex: 1 }}
          />
        </View>
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  errorContainer: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    backgroundColor: '#fef2f2',
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  typeOption: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  typeText: {
    fontSize: 14,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  uploadText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  fileName: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  photoItem: {
    width: 80,
    height: 80,
    margin: 4,
    borderRadius: 8,
    position: 'relative',
  },
  removePhoto: {
    position: 'absolute',
    top: -6,
    right: -6,
    zIndex: 1,
  },
  actionContainer: {
    flexDirection: 'row',
    marginTop: 24,
    marginBottom: 32,
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 12,
    marginLeft: 6,
    flex: 1,
    lineHeight: 16,
  },
});
