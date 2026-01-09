/**
 * Document Upload Screen
 * Allows users to upload documents to projects
 */

import { useAuth } from '@/context/AuthContext';
import { DocumentCategory } from '@/types/document';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#0066CC',
  primaryLight: '#E8F4FF',
  background: '#F5F5F5',
  card: '#FFFFFF',
  text: '#222222',
  textSecondary: '#666666',
  textMuted: '#999999',
  border: '#E0E0E0',
  success: '#00C853',
  error: '#D32F2F',
  warning: '#FF9800',
};

const CATEGORY_OPTIONS: { value: DocumentCategory; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: DocumentCategory.DESIGN, label: 'Thiết kế', icon: 'brush' },
  { value: DocumentCategory.CONTRACT, label: 'Hợp đồng', icon: 'document-text' },
  { value: DocumentCategory.PERMIT, label: 'Giấy phép', icon: 'checkmark-circle' },
  { value: DocumentCategory.SPECIFICATION, label: 'Đặc tả kỹ thuật', icon: 'list' },
  { value: DocumentCategory.REPORT, label: 'Báo cáo', icon: 'bar-chart' },
  { value: DocumentCategory.PHOTO, label: 'Hình ảnh', icon: 'image' },
  { value: DocumentCategory.INVOICE, label: 'Hóa đơn', icon: 'receipt' },
  { value: DocumentCategory.SCHEDULE, label: 'Lịch trình', icon: 'calendar' },
  { value: DocumentCategory.SAFETY, label: 'An toàn', icon: 'shield-checkmark' },
  { value: DocumentCategory.QUALITY, label: 'Chất lượng', icon: 'star' },
  { value: DocumentCategory.MEETING, label: 'Họp', icon: 'people' },
  { value: DocumentCategory.OTHER, label: 'Khác', icon: 'folder' },
];

interface SelectedFile {
  uri: string;
  name: string;
  type: string;
  size?: number;
}

export default function DocumentUploadScreen() {
  const { projectId, folderId } = useLocalSearchParams<{ projectId?: string; folderId?: string }>();
  const { user } = useAuth();
  
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<DocumentCategory>(DocumentCategory.OTHER);
  const [tags, setTags] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Không rõ';
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (!result.canceled && result.assets) {
        const newFiles = result.assets.map((asset: { uri: string; name: string; mimeType?: string; size?: number }) => ({
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType || 'application/octet-stream',
          size: asset.size,
        }));
        setSelectedFiles(prev => [...prev, ...newFiles]);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Lỗi', 'Không thể chọn tài liệu');
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Quyền truy cập', 'Cần quyền truy cập thư viện ảnh');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        const newFiles = result.assets.map(asset => ({
          uri: asset.uri,
          name: asset.fileName || `image_${Date.now()}.jpg`,
          type: asset.mimeType || 'image/jpeg',
          size: asset.fileSize,
        }));
        setSelectedFiles(prev => [...prev, ...newFiles]);
        setCategory(DocumentCategory.PHOTO);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Lỗi', 'Không thể chọn hình ảnh');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Quyền truy cập', 'Cần quyền truy cập camera');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setSelectedFiles(prev => [...prev, {
          uri: asset.uri,
          name: `photo_${Date.now()}.jpg`,
          type: 'image/jpeg',
          size: asset.fileSize,
        }]);
        setCategory(DocumentCategory.PHOTO);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Lỗi', 'Không thể chụp ảnh');
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      Alert.alert('Chưa chọn file', 'Vui lòng chọn ít nhất một file để tải lên');
      return;
    }

    if (!title.trim()) {
      Alert.alert('Thiếu tiêu đề', 'Vui lòng nhập tiêu đề cho tài liệu');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setUploadProgress(i);
      }

      // TODO: Implement actual upload to backend
      // const formData = new FormData();
      // selectedFiles.forEach((file, index) => {
      //   formData.append(`files[${index}]`, {
      //     uri: file.uri,
      //     name: file.name,
      //     type: file.type,
      //   } as any);
      // });
      // formData.append('title', title);
      // formData.append('description', description);
      // formData.append('category', category);
      // formData.append('tags', tags);
      // if (projectId) formData.append('projectId', projectId);
      // if (folderId) formData.append('folderId', folderId);

      Alert.alert(
        'Thành công',
        `Đã tải lên ${selectedFiles.length} file`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Lỗi', 'Không thể tải lên tài liệu. Vui lòng thử lại.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const getFileIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    if (type.startsWith('image/')) return 'image';
    if (type.startsWith('video/')) return 'videocam';
    if (type.includes('pdf')) return 'document-text';
    if (type.includes('word') || type.includes('document')) return 'document';
    if (type.includes('excel') || type.includes('spreadsheet')) return 'grid';
    if (type.includes('powerpoint') || type.includes('presentation')) return 'easel';
    return 'document-outline';
  };

  const selectedCategoryInfo = CATEGORY_OPTIONS.find(c => c.value === category);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Upload Area */}
        <View style={styles.uploadSection}>
          <Text style={styles.sectionTitle}>Chọn file</Text>
          
          <View style={styles.uploadButtons}>
            <TouchableOpacity style={styles.uploadButton} onPress={pickDocument}>
              <Ionicons name="document-attach" size={28} color={COLORS.primary} />
              <Text style={styles.uploadButtonText}>Tài liệu</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <Ionicons name="images" size={28} color={COLORS.primary} />
              <Text style={styles.uploadButtonText}>Thư viện</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.uploadButton} onPress={takePhoto}>
              <Ionicons name="camera" size={28} color={COLORS.primary} />
              <Text style={styles.uploadButtonText}>Chụp ảnh</Text>
            </TouchableOpacity>
          </View>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <View style={styles.selectedFiles}>
              <Text style={styles.selectedCount}>
                Đã chọn {selectedFiles.length} file
              </Text>
              {selectedFiles.map((file, index) => (
                <View key={index} style={styles.fileItem}>
                  {file.type.startsWith('image/') ? (
                    <Image source={{ uri: file.uri }} style={styles.fileThumbnail} />
                  ) : (
                    <View style={styles.fileIconContainer}>
                      <Ionicons name={getFileIcon(file.type)} size={24} color={COLORS.primary} />
                    </View>
                  )}
                  <View style={styles.fileInfo}>
                    <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
                    <Text style={styles.fileSize}>{formatFileSize(file.size)}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => removeFile(index)}
                  >
                    <Ionicons name="close-circle" size={24} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Document Info */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Thông tin tài liệu</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Tiêu đề *</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập tiêu đề tài liệu"
              placeholderTextColor={COLORS.textMuted}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mô tả</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Mô tả ngắn về tài liệu"
              placeholderTextColor={COLORS.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Danh mục</Text>
            <TouchableOpacity 
              style={styles.categorySelector}
              onPress={() => setShowCategoryPicker(!showCategoryPicker)}
            >
              <View style={styles.categorySelected}>
                <Ionicons 
                  name={selectedCategoryInfo?.icon || 'folder'} 
                  size={20} 
                  color={COLORS.primary} 
                />
                <Text style={styles.categoryText}>
                  {selectedCategoryInfo?.label || 'Chọn danh mục'}
                </Text>
              </View>
              <Ionicons 
                name={showCategoryPicker ? 'chevron-up' : 'chevron-down'} 
                size={20} 
                color={COLORS.textMuted} 
              />
            </TouchableOpacity>
            
            {showCategoryPicker && (
              <View style={styles.categoryPicker}>
                {CATEGORY_OPTIONS.map(option => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.categoryOption,
                      category === option.value && styles.categoryOptionActive,
                    ]}
                    onPress={() => {
                      setCategory(option.value);
                      setShowCategoryPicker(false);
                    }}
                  >
                    <Ionicons 
                      name={option.icon} 
                      size={18} 
                      color={category === option.value ? COLORS.primary : COLORS.textSecondary} 
                    />
                    <Text style={[
                      styles.categoryOptionText,
                      category === option.value && styles.categoryOptionTextActive,
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Tags</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập tags, phân cách bằng dấu phẩy"
              placeholderTextColor={COLORS.textMuted}
              value={tags}
              onChangeText={setTags}
            />
          </View>
        </View>

        {/* Upload Progress */}
        {uploading && (
          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${uploadProgress}%` }]} />
            </View>
            <Text style={styles.progressText}>Đang tải lên... {uploadProgress}%</Text>
          </View>
        )}

        {/* Bottom Spacer */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Upload Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={uploading}
        >
          <Text style={styles.cancelButtonText}>Hủy</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.submitButton,
            (selectedFiles.length === 0 || uploading) && styles.submitButtonDisabled,
          ]}
          onPress={handleUpload}
          disabled={selectedFiles.length === 0 || uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="cloud-upload" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Tải lên</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  uploadSection: {
    backgroundColor: COLORS.card,
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  uploadButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  uploadButton: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    width: (width - 80) / 3,
  },
  uploadButtonText: {
    marginTop: 8,
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  selectedFiles: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 16,
  },
  selectedCount: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  fileThumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  fileIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  fileSize: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  removeButton: {
    padding: 4,
  },
  infoSection: {
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categorySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categorySelected: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryText: {
    fontSize: 14,
    color: COLORS.text,
  },
  categoryPicker: {
    marginTop: 8,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxHeight: 200,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  categoryOptionActive: {
    backgroundColor: COLORS.primaryLight,
  },
  categoryOptionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  categoryOptionTextActive: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  progressSection: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  bottomBar: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  submitButton: {
    flex: 2,
    flexDirection: 'row',
    padding: 14,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.textMuted,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
