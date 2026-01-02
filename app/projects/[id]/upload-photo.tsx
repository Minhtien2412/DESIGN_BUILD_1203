/**
 * Upload Progress Photo Screen
 * Upload construction progress photos with metadata
 */

import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import photoTimelineService, {
    PhotoCategory,
    PhotoPhase,
} from '@/services/api/photo-timeline.service';

const PHASES: { value: PhotoPhase; label: string }[] = [
  { value: 'PRE_CONSTRUCTION', label: 'Chuẩn bị' },
  { value: 'SITE_PREPARATION', label: 'San lấp mặt bằng' },
  { value: 'FOUNDATION', label: 'Móng' },
  { value: 'STRUCTURE', label: 'Kết cấu' },
  { value: 'ENCLOSURE', label: 'Bao che' },
  { value: 'INTERIOR', label: 'Nội thất' },
  { value: 'FINISHING', label: 'Hoàn thiện' },
  { value: 'COMPLETION', label: 'Nghiệm thu' },
  { value: 'POST_COMPLETION', label: 'Sau nghiệm thu' },
];

const CATEGORIES: { value: PhotoCategory; label: string }[] = [
  { value: 'FOUNDATION', label: 'Móng' },
  { value: 'STRUCTURE', label: 'Kết cấu' },
  { value: 'FRAMING', label: 'Khung' },
  { value: 'ROOFING', label: 'Mái' },
  { value: 'EXTERIOR', label: 'Ngoại thất' },
  { value: 'INTERIOR', label: 'Nội thất' },
  { value: 'MEP', label: 'M&E' },
  { value: 'FINISHING', label: 'Hoàn thiện' },
  { value: 'LANDSCAPE', label: 'Cảnh quan' },
  { value: 'OVERALL', label: 'Tổng thể' },
  { value: 'DEFECT', label: 'Khuyết tật' },
  { value: 'OTHER', label: 'Khác' },
];

export default function UploadPhotoScreen() {
  const { id: projectId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const primary = useThemeColor({}, 'primary');
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const border = useThemeColor({}, 'border');
  const background = useThemeColor({}, 'background');
  const surface = useThemeColor({}, 'surface');

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [phase, setPhase] = useState<PhotoPhase>('STRUCTURE');
  const [category, setCategory] = useState<PhotoCategory>('OVERALL');
  const [tags, setTags] = useState('');
  const [notes, setNotes] = useState('');

  const [coordinates, setCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Quyền truy cập', 'Cần cấp quyền truy cập camera để chụp ảnh');
      return false;
    }
    return true;
  };

  const requestMediaLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Quyền truy cập', 'Cần cấp quyền truy cập thư viện ảnh');
      return false;
    }
    return true;
  };

  const getLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setCoordinates({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      }
    } catch (error) {
      console.log('Could not get location:', error);
    }
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      await getLocationPermission();
    }
  };

  const handlePickImage = async () => {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleUpload = async () => {
    if (!imageUri) {
      Alert.alert('Lỗi', 'Vui lòng chọn ảnh');
      return;
    }

    if (!location.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập vị trí');
      return;
    }

    if (!projectId) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin dự án');
      return;
    }

    setLoading(true);

    try {
      // Convert image URI to blob for upload
      const response = await fetch(imageUri);
      const blob = await response.blob();

      const uploadData = {
        projectId: parseInt(projectId),
        phase,
        category,
        location: location.trim(),
        description: description.trim() || undefined,
        file: blob,
        tags: tags
          .split(',')
          .map(t => t.trim())
          .filter(Boolean),
        notes: notes.trim() || undefined,
        coordinates: coordinates || undefined,
      };

      await photoTimelineService.uploadPhoto(uploadData);

      Alert.alert('Thành công', 'Đã tải lên ảnh tiến độ', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error('Upload failed:', error);
      Alert.alert('Lỗi', error.message || 'Không thể tải lên ảnh');
    } finally {
      setLoading(false);
    }
  };

  const renderPhaseSelector = () => (
    <View style={styles.section}>
      <Text style={[styles.label, { color: text }]}>Giai đoạn *</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll}>
        {PHASES.map(p => (
          <Pressable
            key={p.value}
            style={[
              styles.pill,
              { borderColor: border },
              phase === p.value && { backgroundColor: primary, borderColor: primary },
            ]}
            onPress={() => setPhase(p.value)}
          >
            <Text style={[styles.pillText, { color: phase === p.value ? '#fff' : text }]}>
              {p.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );

  const renderCategorySelector = () => (
    <View style={styles.section}>
      <Text style={[styles.label, { color: text }]}>Hạng mục *</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll}>
        {CATEGORIES.map(c => (
          <Pressable
            key={c.value}
            style={[
              styles.pill,
              { borderColor: border },
              category === c.value && { backgroundColor: primary, borderColor: primary },
            ]}
            onPress={() => setCategory(c.value)}
          >
            <Text style={[styles.pillText, { color: category === c.value ? '#fff' : text }]}>
              {c.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: surface, borderBottomColor: border }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color={text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: text }]}>Thêm ảnh tiến độ</Text>
        <Pressable
          onPress={handleUpload}
          disabled={loading || !imageUri}
          style={[styles.uploadButton, (!imageUri || loading) && styles.uploadButtonDisabled]}
        >
          {loading ? (
            <ActivityIndicator size="small" color={primary} />
          ) : (
            <Text style={[styles.uploadButtonText, { color: primary }]}>Tải lên</Text>
          )}
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Image Preview */}
          {imageUri ? (
            <View style={styles.imagePreview}>
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
              <Pressable
                style={[styles.changeImageButton, { backgroundColor: surface }]}
                onPress={() =>
                  Alert.alert('Chọn ảnh', 'Chọn nguồn ảnh', [
                    { text: 'Chụp ảnh', onPress: handleTakePhoto },
                    { text: 'Thư viện', onPress: handlePickImage },
                    { text: 'Hủy', style: 'cancel' },
                  ])
                }
              >
                <Ionicons name="camera-outline" size={20} color={primary} />
                <Text style={[styles.changeImageText, { color: primary }]}>Đổi ảnh</Text>
              </Pressable>
            </View>
          ) : (
            <View style={[styles.uploadArea, { backgroundColor: surface, borderColor: border }]}>
              <Ionicons name="images-outline" size={64} color={textMuted} />
              <Text style={[styles.uploadTitle, { color: text }]}>Thêm ảnh tiến độ</Text>
              <Text style={[styles.uploadSubtitle, { color: textMuted }]}>
                Chụp ảnh mới hoặc chọn từ thư viện
              </Text>
              <View style={styles.uploadButtons}>
                <Pressable
                  style={[styles.uploadOption, { backgroundColor: primary }]}
                  onPress={handleTakePhoto}
                >
                  <Ionicons name="camera" size={24} color="#fff" />
                  <Text style={styles.uploadOptionText}>Chụp ảnh</Text>
                </Pressable>
                <Pressable
                  style={[styles.uploadOption, { borderColor: primary, borderWidth: 2 }]}
                  onPress={handlePickImage}
                >
                  <Ionicons name="images" size={24} color={primary} />
                  <Text style={[styles.uploadOptionText, { color: primary }]}>Thư viện</Text>
                </Pressable>
              </View>
            </View>
          )}

          {imageUri && (
            <View style={styles.form}>
              {/* Location */}
              <View style={styles.section}>
                <Text style={[styles.label, { color: text }]}>Vị trí *</Text>
                <View style={[styles.input, { borderColor: border, backgroundColor: surface }]}>
                  <Ionicons name="location-outline" size={20} color={textMuted} />
                  <TextInput
                    style={[styles.inputText, { color: text }]}
                    placeholder="VD: Tầng 1 - Phòng khách"
                    placeholderTextColor={textMuted}
                    value={location}
                    onChangeText={setLocation}
                  />
                </View>
              </View>

              {/* Phase */}
              {renderPhaseSelector()}

              {/* Category */}
              {renderCategorySelector()}

              {/* Description */}
              <View style={styles.section}>
                <Text style={[styles.label, { color: text }]}>Mô tả</Text>
                <TextInput
                  style={[styles.textarea, { borderColor: border, backgroundColor: surface, color: text }]}
                  placeholder="Mô tả chi tiết về ảnh..."
                  placeholderTextColor={textMuted}
                  multiline
                  numberOfLines={4}
                  value={description}
                  onChangeText={setDescription}
                  textAlignVertical="top"
                />
              </View>

              {/* Tags */}
              <View style={styles.section}>
                <Text style={[styles.label, { color: text }]}>Tags (phân cách bằng dấu phẩy)</Text>
                <View style={[styles.input, { borderColor: border, backgroundColor: surface }]}>
                  <Ionicons name="pricetag-outline" size={20} color={textMuted} />
                  <TextInput
                    style={[styles.inputText, { color: text }]}
                    placeholder="VD: bê tông, cốt thép, kiểm tra"
                    placeholderTextColor={textMuted}
                    value={tags}
                    onChangeText={setTags}
                  />
                </View>
              </View>

              {/* Notes */}
              <View style={styles.section}>
                <Text style={[styles.label, { color: text }]}>Ghi chú</Text>
                <TextInput
                  style={[styles.textarea, { borderColor: border, backgroundColor: surface, color: text }]}
                  placeholder="Ghi chú thêm..."
                  placeholderTextColor={textMuted}
                  multiline
                  numberOfLines={3}
                  value={notes}
                  onChangeText={setNotes}
                  textAlignVertical="top"
                />
              </View>

              {/* Location Info */}
              {coordinates && (
                <View style={[styles.infoBox, { backgroundColor: primary + '10', borderColor: primary }]}>
                  <Ionicons name="navigate" size={16} color={primary} />
                  <Text style={[styles.infoText, { color: primary }]}>
                    Tọa độ GPS: {coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)}
                  </Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  uploadButton: {
    padding: 4,
  },
  uploadButtonDisabled: {
    opacity: 0.4,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  uploadArea: {
    margin: 16,
    padding: 48,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  uploadSubtitle: {
    fontSize: 14,
    marginTop: 4,
    marginBottom: 24,
  },
  uploadButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  uploadOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  uploadOptionText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  imagePreview: {
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 300,
  },
  changeImageButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  changeImageText: {
    fontSize: 14,
    fontWeight: '600',
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
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  inputText: {
    flex: 1,
    fontSize: 15,
  },
  textarea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    minHeight: 100,
  },
  pillScroll: {
    flexGrow: 0,
  },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '500',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  infoText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
