import { useDefects } from '@/hooks/useQC';
import { DefectSeverity } from '@/types/qc-qa';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function CreateDefectScreen() {
  const { id: projectId } = useLocalSearchParams<{ id: string }>();
  const { createDefect } = useDefects();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [severity, setSeverity] = useState<DefectSeverity>(DefectSeverity.MINOR);
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const severityOptions: { value: DefectSeverity; label: string; color: string }[] = [
    { value: DefectSeverity.CRITICAL, label: 'Nghiêm trọng', color: '#D32F2F' },
    { value: DefectSeverity.MAJOR, label: 'Quan trọng', color: '#0D9488' },
    { value: DefectSeverity.MINOR, label: 'Nhỏ', color: '#FBC02D' },
    { value: DefectSeverity.COSMETIC, label: 'Thẩm mỹ', color: '#689F38' },
  ];

  const handleAddPhoto = () => {
    Alert.alert(
      'Tính năng Upload Ảnh',
      'Tính năng upload ảnh sẽ được tích hợp trong Task #44 (File Upload - Upload Components)',
      [
        {
          text: 'OK',
          onPress: () => {
            setPhotos([...photos, `https://picsum.photos/seed/${Date.now()}/400/300`]);
          },
        },
      ]
    );
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề lỗi');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mô tả lỗi');
      return;
    }
    if (!location.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập vị trí lỗi');
      return;
    }

    setLoading(true);
    try {
      await createDefect({
        projectId: projectId!,
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        severity,
        photos,
      });
      Alert.alert('Thành công', 'Đã báo cáo lỗi thành công', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể báo cáo lỗi');
      console.error('Create defect error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.label}>
            Tiêu đề lỗi <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Ví dụ: Vết nứt trên tường phòng khách"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            Mô tả chi tiết <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Mô tả chi tiết về lỗi, kích thước, vị trí, nguyên nhân có thể..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            Vị trí <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Ví dụ: Tầng 2 - Phòng khách - Tường phía Nam"
            value={location}
            onChangeText={setLocation}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            Mức độ nghiêm trọng <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.severityContainer}>
            {severityOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.severityOption,
                  severity === option.value && {
                    backgroundColor: option.color,
                    borderColor: option.color,
                  },
                ]}
                onPress={() => setSeverity(option.value)}
              >
                <View style={styles.severityContent}>
                  {severity === option.value && (
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  )}
                  <Text
                    style={[
                      styles.severityText,
                      severity === option.value && styles.severityTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </View>
                {option.value === 'CRITICAL' && (
                  <Text
                    style={[
                      styles.severityDescription,
                      severity === option.value && { color: '#fff' },
                    ]}
                  >
                    Ảnh hưởng an toàn kết cấu
                  </Text>
                )}
                {option.value === 'MAJOR' && (
                  <Text
                    style={[
                      styles.severityDescription,
                      severity === option.value && { color: '#fff' },
                    ]}
                  >
                    Ảnh hưởng chức năng sử dụng
                  </Text>
                )}
                {option.value === 'MINOR' && (
                  <Text
                    style={[
                      styles.severityDescription,
                      severity === option.value && { color: '#fff' },
                    ]}
                  >
                    Lỗi nhỏ, ít ảnh hưởng
                  </Text>
                )}
                {option.value === 'COSMETIC' && (
                  <Text
                    style={[
                      styles.severityDescription,
                      severity === option.value && { color: '#fff' },
                    ]}
                  >
                    Chỉ ảnh hưởng thẩm mỹ
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Ảnh minh chứng ({photos.length})</Text>
          <View style={styles.photosContainer}>
            {photos.map((photo, index) => (
              <View key={index} style={styles.photoPreview}>
                <View style={styles.photoPlaceholder}>
                  <Ionicons name="image" size={32} color="#999999" />
                </View>
                <TouchableOpacity
                  style={styles.removePhotoButton}
                  onPress={() => handleRemovePhoto(index)}
                >
                  <Ionicons name="close-circle" size={24} color="#000000" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addPhotoButton} onPress={handleAddPhoto}>
              <Ionicons name="camera" size={32} color="#0D9488" />
              <Text style={styles.addPhotoText}>Thêm ảnh</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color="#0D9488" />
          <Text style={styles.infoText}>
            Lỗi sẽ được gửi đến quản lý dự án để xử lý. Bạn sẽ nhận được thông báo khi
            có cập nhật về trạng thái lỗi.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Hủy</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Đang gửi...' : 'Báo cáo lỗi'}
          </Text>
        </TouchableOpacity>
      </View>
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
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#000000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#333',
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  severityContainer: {
    gap: 12,
  },
  severityOption: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 16,
  },
  severityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  severityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  severityTextActive: {
    color: '#fff',
  },
  severityDescription: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoPreview: {
    width: 100,
    height: 100,
    position: 'relative',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    backgroundColor: '#F0FDFA',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#0D9488',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoText: {
    fontSize: 12,
    color: '#0D9488',
    marginTop: 4,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F0FDFA',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1976D2',
    lineHeight: 18,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#000000',
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
