/**
 * Create New Project - Comprehensive Form
 * Upload media, location picker, dimensions, budget, timeline
 */
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSmartBackHandler } from '@/hooks/useBackHandler';
import { apiFetch } from '@/services/api';
import { uploadDocument, uploadMediaWithProgress } from '@/services/media';
import { requireAuth } from '@/utils/auth';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Stack, router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
// react-native-maps is not available in Expo Go. We'll lazy-load it and
// gracefully fall back to a placeholder when running in Expo Go.
// Do NOT use static import to avoid TurboModule errors in Expo Go.

const { width: SCREEN_W } = Dimensions.get('window');

type ProjectStatus = 'planning' | 'active' | 'completed' | 'paused';

const PROJECT_TYPES = [
  { value: 'residential', label: 'Nhà ở dân dụng', icon: 'home' },
  { value: 'commercial', label: 'Thương mại', icon: 'business' },
  { value: 'industrial', label: 'Công nghiệp', icon: 'construct' },
  { value: 'infrastructure', label: 'Hạ tầng', icon: 'globe' },
];

export default function CreateProjectScreen() {
  // Lazy maps module loader state
  const [mapsModule, setMapsModule] = useState<{ MapView: any; Marker: any } | null>(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const m = await import('react-native-maps');
        if (mounted) setMapsModule({ MapView: (m as any).default, Marker: (m as any).Marker });
      } catch (e) {
        console.warn('[Maps] react-native-maps not available in this build');
      }
    })();
    return () => { mounted = false; };
  }, []);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { isAuthenticated } = useAuth();
  
  useSmartBackHandler();

  // Auth guard - redirect to login if not authenticated
  useEffect(() => {
    requireAuth(isAuthenticated, {
      redirectTo: '/projects/create',
      message: 'Vui lòng đăng nhập để tạo dự án mới'
    });
  }, [isAuthenticated]);

  // Form state
  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState('residential');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('planning');
  
  // Dimensions
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [floors, setFloors] = useState('');
  
  // Budget & Timeline
  const [budget, setBudget] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Media
  const [images, setImages] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<Array<{ name: string; url: string }>>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Pickers state
  const [showMapModal, setShowMapModal] = useState(false);
  const [pickedCoord, setPickedCoord] = useState<{ latitude: number; longitude: number } | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<false | 'start' | 'end'>(false);
  const [tempDate, setTempDate] = useState<Date>(new Date());

  // Owner & scope & privacy
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [scopes, setScopes] = useState<string[]>(['thiet-ke']);
  const [privacy, setPrivacy] = useState<'private' | 'public'>('private');

  const handleImagePick = async () => {
    try {
      setUploading(true);
      setUploadPercent(0);
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (perm.status !== 'granted') {
        Alert.alert('Quyền truy cập', 'Cần quyền truy cập thư viện ảnh để tiếp tục');
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.85,
      });
      if (res.canceled) return;
      for (const asset of res.assets) {
        const filename = asset.fileName || asset.uri.split('/').pop() || 'image.jpg';
        const { url } = await uploadMediaWithProgress(
          'projects',
          asset.uri,
          filename,
          { kind: 'project-image' },
          ({ percent }) => setUploadPercent(Math.round(percent))
        );
        if (url) setImages(prev => [...prev, url]);
      }
    } catch (e: any) {
      if (e?.code === 'AUTH_MISSING' || e?.status === 401) {
        Alert.alert('Phiên đăng nhập', 'Phiên đăng nhập đã hết hạn hoặc thiếu quyền. Vui lòng đăng nhập lại.', [
          { text: 'Đăng nhập', onPress: () => router.push('/(auth)/login') },
          { text: 'Đóng', style: 'cancel' },
        ]);
      } else {
        Alert.alert('Tải ảnh lên thất bại', e?.message || 'Vui lòng thử lại');
      }
    } finally {
      setUploading(false);
      setUploadPercent(0);
    }
  };

  const handleDocumentPick = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: '*/*', multiple: false, copyToCacheDirectory: true });
      if (res.canceled) return;
      const file = res.assets?.[0];
      if (!file) return;
      const filename = file.name || 'attachment';
      const { url } = await uploadDocument(file.uri, filename, { kind: 'project-doc' });
      if (url) setAttachments(prev => [...prev, { name: filename, url }]);
    } catch (e: any) {
      Alert.alert('Tải tài liệu thất bại', e?.message || 'Vui lòng thử lại');
    }
  };

  const handleLocationPick = () => {
    setShowMapModal(true);
  };

  const handleDatePick = (field: 'start' | 'end') => {
    setTempDate(new Date());
    setShowDatePicker(field);
  };

  const validateForm = () => {
    if (!projectName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên dự án');
      return false;
    }
    if (!ownerName.trim() || !ownerPhone.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập thông tin chủ đầu tư (Họ tên và Số điện thoại)');
      return false;
    }
    if (!location.trim() && !address.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập địa điểm hoặc địa chỉ');
      return false;
    }
    if (!budget.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập ngân sách dự kiến');
      return false;
    }
    if (!acceptTerms) {
      Alert.alert('Điều khoản', 'Vui lòng xác nhận đã đọc và đồng ý điều khoản sử dụng');
      return false;
    }
    return true;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const formData = {
        title: projectName,
        type: projectType,
        description,
        location: location || address,
        address,
        status,
        owner: {
          name: ownerName,
          phone: ownerPhone,
          email: ownerEmail,
        },
        scopes,
        privacy,
        dimensions: {
          length: length ? parseFloat(length) : undefined,
          width: width ? parseFloat(width) : undefined,
          height: height ? parseFloat(height) : undefined,
          floors: floors ? parseInt(floors) : undefined,
        },
        budget: budget ? parseFloat(budget) : undefined,
        start_date: startDate,
        end_date: endDate,
        images,
        attachments,
      };

      const resp = await apiFetch<any>('/api/projects', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      // Try to extract created project id from common response shapes
      const created = (resp && (resp.data ?? resp)) as any;
      const createdId = created?.id || created?._id || created?.project?.id || created?.data?.id;

      if (createdId) {
        Alert.alert('Thành công', 'Dự án đã được tạo!', [
          { text: 'Xem chi tiết', onPress: () => router.push((`/projects/${createdId}`) as const) },
          { text: 'Đóng', style: 'cancel' }
        ]);
      } else {
        Alert.alert('Thành công', 'Dự án đã được tạo!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Không thể tạo dự án';
      Alert.alert('Lỗi', msg);
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // Don't render form if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen 
        options={{
          title: 'Tạo dự án mới',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShown: false,
        }} 
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tạo dự án mới</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stepper */}
        <View style={styles.stepper}>
          {['Cơ bản','Hình ảnh','Vị trí','Kích thước','Ngân sách'].map((s, i) => (
            <View key={i} style={styles.stepItem}>
              <View style={styles.stepDot} />
              <Text style={styles.stepText}>{s}</Text>
              {i < 4 && <View style={styles.stepLine} />}
            </View>
          ))}
        </View>

        {/* Basic Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tên dự án <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập tên dự án..."
              placeholderTextColor="#999"
              value={projectName}
              onChangeText={setProjectName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Loại dự án <Text style={styles.required}>*</Text></Text>
            <View style={styles.typeGrid}>
              {PROJECT_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.typeCard,
                    projectType === type.value && styles.typeCardActive
                  ]}
                  onPress={() => setProjectType(type.value)}
                >
                  <Ionicons 
                    name={type.icon as any} 
                    size={28} 
                    color={projectType === type.value ? '#90b44c' : '#666'} 
                  />
                  <Text 
                    style={[
                      styles.typeLabel,
                      projectType === type.value && styles.typeLabelActive
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mô tả</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Mô tả chi tiết về dự án..."
              placeholderTextColor="#999"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />
          </View>
        
          {/* Chủ đầu tư */}
          <View style={[styles.inputGroup, { marginTop: 4 }]}>
            <Text style={styles.sectionSmallTitle}>Thông tin chủ đầu tư</Text>
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Họ và tên <Text style={styles.required}>*</Text></Text>
                <TextInput style={styles.input} placeholder="VD: Nguyễn Văn A" placeholderTextColor="#999" value={ownerName} onChangeText={setOwnerName} />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Số điện thoại <Text style={styles.required}>*</Text></Text>
                <TextInput style={styles.input} placeholder="090xxxxxxx" placeholderTextColor="#999" value={ownerPhone} onChangeText={setOwnerPhone} keyboardType="phone-pad" />
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput style={styles.input} placeholder="email@domain.com" placeholderTextColor="#999" value={ownerEmail} onChangeText={setOwnerEmail} keyboardType="email-address" />
            </View>
          </View>

          {/* Hạng mục thi công */}
          <View style={styles.inputGroup}>
            <Text style={styles.sectionSmallTitle}>Hạng mục dự kiến</Text>
            <View style={styles.chipsRow}>
              {[
                {v:'thiet-ke', t:'Thiết kế'},
                {v:'phan-tho', t:'Phần thô'},
                {v:'hoan-thien', t:'Hoàn thiện'},
                {v:'noi-that', t:'Nội thất'},
                {v:'ha-tang', t:'Hạ tầng'},
              ].map(it => (
                <TouchableOpacity key={it.v} onPress={() => setScopes(s => s.includes(it.v) ? s.filter(x=>x!==it.v) : [...s, it.v])} style={[styles.chip, scopes.includes(it.v) && styles.chipActive]}>
                  <Text style={[styles.chipText, scopes.includes(it.v) && styles.chipTextActive]}>{it.t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Media Upload Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hình ảnh dự án</Text>
          <Text style={styles.sectionSubtitle}>Thêm ảnh mặt bằng, thiết kế, hiện trạng</Text>

          <View style={styles.mediaGrid}>
            {images.map((img, index) => (
              <View key={index} style={styles.mediaItem}>
                <Image source={{ uri: img }} style={styles.mediaImage} />
                <TouchableOpacity 
                  style={styles.removeImageBtn}
                  onPress={() => removeImage(index)}
                >
                  <Ionicons name="close-circle" size={24} color="#ff3b30" />
                </TouchableOpacity>
              </View>
            ))}
            
            <TouchableOpacity 
              style={styles.addMediaBtn}
              onPress={handleImagePick}
              disabled={uploading}
            >
              <Ionicons name="camera" size={32} color="#90b44c" />
              <Text style={styles.addMediaText}>Thêm ảnh</Text>
            </TouchableOpacity>
          </View>
          {uploading ? (
            <View style={{ marginTop: 8 }}>
              <Text style={{ color: '#666', fontWeight: '600' }}>Đang tải lên... {uploadPercent}%</Text>
              <View style={{ height: 6, backgroundColor: '#eee', borderRadius: 4, marginTop: 6 }}>
                <View style={{ height: 6, width: `${uploadPercent}%`, backgroundColor: '#90b44c', borderRadius: 4 }} />
              </View>
            </View>
          ) : null}
        </View>

        {/* Attachments Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tài liệu đính kèm</Text>
          <Text style={styles.sectionSubtitle}>Hồ sơ PDF, bảng dự toán, catalog...</Text>
          <View style={{ gap: 8 }}>
            {attachments.map((a, idx) => (
              <View key={idx} style={styles.attachmentRow}>
                <Ionicons name="document-text" size={18} color="#666" />
                <Text style={styles.attachmentName} numberOfLines={1}>{a.name}</Text>
                <TouchableOpacity onPress={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}>
                  <Ionicons name="trash" size={18} color="#ff3b30" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={[styles.addMediaBtn, { height: 56 }]} onPress={handleDocumentPick}>
              <Ionicons name="cloud-upload" size={22} color="#90b44c" />
              <Text style={[styles.addMediaText, { marginTop: 4 }]}>Thêm tài liệu</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Location Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vị trí dự án</Text>

          <TouchableOpacity style={styles.mapPickerBtn} onPress={handleLocationPick}>
            <View style={styles.mapPlaceholder}>
              <Ionicons name="map" size={48} color="#90b44c" />
              <Text style={styles.mapPlaceholderText}>Chọn trên bản đồ</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Địa chỉ <Text style={styles.required}>*</Text></Text>
            <View style={styles.inputWithIcon}>
              <Ionicons name="location" size={22} color="#666" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.inputWithPadding]}
                placeholder="Số nhà, đường, phường/xã..."
                placeholderTextColor="#999"
                value={address}
                onChangeText={setAddress}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tỉnh/Thành phố</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: TP. Hồ Chí Minh"
              placeholderTextColor="#999"
              value={location}
              onChangeText={setLocation}
            />
          </View>
        </View>

        {/* Dimensions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kích thước & Quy mô</Text>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Chiều dài (m)</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor="#999"
                value={length}
                onChangeText={setLength}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Chiều rộng (m)</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor="#999"
                value={width}
                onChangeText={setWidth}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Chiều cao (m)</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor="#999"
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Số tầng</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor="#999"
                value={floors}
                onChangeText={setFloors}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Auto-calculated area */}
          {length && width && (
            <View style={styles.calculatedArea}>
              <Ionicons name="calculator" size={20} color="#90b44c" />
              <Text style={styles.calculatedAreaText}>
                Diện tích: <Text style={styles.calculatedAreaValue}>
                  {(parseFloat(length) * parseFloat(width)).toFixed(2)} m²
                </Text>
              </Text>
            </View>
          )}

          {/* Privacy */}
          <View style={[styles.inputGroup, { marginTop: 10 }]}>
            <Text style={styles.sectionSmallTitle}>Chế độ hiển thị</Text>
            <View style={styles.chipsRow}>
              {(['private','public'] as const).map(p => (
                <TouchableOpacity key={p} onPress={() => setPrivacy(p)} style={[styles.chip, privacy===p && styles.chipActive]}>
                  <Text style={[styles.chipText, privacy===p && styles.chipTextActive]}>
                    {p==='private' ? 'Riêng tư' : 'Công khai'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Budget & Timeline Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ngân sách & Thời gian</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ngân sách dự kiến <Text style={styles.required}>*</Text></Text>
            <View style={styles.inputWithIcon}>
              <Ionicons name="cash" size={22} color="#666" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.inputWithPadding]}
                placeholder="VD: 500000000"
                placeholderTextColor="#999"
                value={budget}
                onChangeText={setBudget}
                keyboardType="numeric"
              />
              <Text style={styles.inputSuffix}>VNĐ</Text>
            </View>
            {budget && (
              <Text style={styles.helperText}>
                ≈ {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseFloat(budget) || 0)}
              </Text>
            )}
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Ngày bắt đầu</Text>
              <TouchableOpacity 
                style={styles.dateInput}
                onPress={() => handleDatePick('start')}
              >
                <Ionicons name="calendar" size={20} color="#666" />
                <Text style={styles.dateText}>
                  {startDate || 'Chọn ngày'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Ngày kết thúc</Text>
              <TouchableOpacity 
                style={styles.dateInput}
                onPress={() => handleDatePick('end')}
              >
                <Ionicons name="calendar" size={20} color="#666" />
                <Text style={styles.dateText}>
                  {endDate || 'Chọn ngày'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Submit Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={() => setShowPreview(true)}
            disabled={loading}
          >
            <Ionicons name="checkmark-circle" size={24} color="#fff" />
            <Text style={styles.submitButtonText}>
              Xem lại & Tạo dự án
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Hủy bỏ</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Map Picker Modal */}
      <Modal visible={showMapModal} transparent animationType="slide" onRequestClose={() => setShowMapModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { padding: 0 }]}> 
            <View style={{ padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#111' }}>Chọn vị trí trên bản đồ</Text>
              <TouchableOpacity onPress={() => setShowMapModal(false)} style={{ padding: 6 }}>
                <Ionicons name="close" size={22} color="#333" />
              </TouchableOpacity>
            </View>
            <View style={{ height: 360 }}>
              {mapsModule?.MapView ? (
              <mapsModule.MapView
                style={{ flex: 1 }}
                initialRegion={{
                  latitude: 16.047079, // Vietnam center-ish
                  longitude: 108.206230,
                  latitudeDelta: 8,
                  longitudeDelta: 8,
                }}
                onPress={(e: any) => {
                  const { latitude, longitude } = e.nativeEvent.coordinate;
                  setPickedCoord({ latitude, longitude });
                }}
              >
                {pickedCoord && (
                  <mapsModule.Marker coordinate={pickedCoord} />
                )}
              </mapsModule.MapView>
              ) : (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                  <Ionicons name="map" size={48} color="#90b44c" />
                  <Text style={{ marginTop: 8, color: '#666', textAlign: 'center' }}>
                    Bản đồ cần Development Build. Vui lòng dùng nút "Chọn trên bản đồ" trong bản dev build,
                    hoặc nhập địa chỉ/tọa độ thủ công.
                  </Text>
                </View>
              )}
            </View>
            <View style={{ padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ color: '#555' }}>
                {pickedCoord ? `Đã chọn: ${pickedCoord.latitude.toFixed(5)}, ${pickedCoord.longitude.toFixed(5)}` : 'Chạm vào bản đồ để chọn vị trí'}
              </Text>
              <TouchableOpacity
                disabled={!pickedCoord}
                onPress={() => {
                  if (pickedCoord) {
                    const value = `${pickedCoord.latitude.toFixed(6)}, ${pickedCoord.longitude.toFixed(6)}`;
                    setLocation(value);
                    setShowMapModal(false);
                  }
                }}
                style={{
                  backgroundColor: pickedCoord ? '#90b44c' : '#cbd5e1',
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 10,
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Date Picker Inline (platform-friendly) */}
      {showDatePicker && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, date) => {
            if (Platform.OS === 'android') {
              // On Android, event is undefined for old types, but community picker returns event.type
              // If user cancels, date will be undefined
              if (!date) {
                setShowDatePicker(false);
                return;
              }
            }
            if (date) {
              const iso = date.toISOString().slice(0,10);
              if (showDatePicker === 'start') setStartDate(iso);
              if (showDatePicker === 'end') setEndDate(iso);
              setTempDate(date);
            }
            if (Platform.OS !== 'ios') {
              setShowDatePicker(false);
            }
          }}
          style={{ backgroundColor: Platform.OS === 'ios' ? '#fff' : undefined }}
        />
      )}

      {/* Preview modal */}
      <Modal visible={showPreview} transparent animationType="slide" onRequestClose={() => setShowPreview(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.previewTitle}>Xem lại thông tin</Text>
            <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
              <Text style={styles.previewRow}>Tên dự án: <Text style={styles.previewValue}>{projectName || '-'}</Text></Text>
              <Text style={styles.previewRow}>Loại: <Text style={styles.previewValue}>{PROJECT_TYPES.find(t=>t.value===projectType)?.label}</Text></Text>
              <Text style={styles.previewRow}>Chủ đầu tư: <Text style={styles.previewValue}>{ownerName || '-'}</Text></Text>
              <Text style={styles.previewRow}>Liên hệ: <Text style={styles.previewValue}>{ownerPhone || '-'} {ownerEmail?`• ${ownerEmail}`:''}</Text></Text>
              <Text style={styles.previewRow}>Địa chỉ: <Text style={styles.previewValue}>{address || location || '-'}</Text></Text>
              {(length||width) && (
                <Text style={styles.previewRow}>Kích thước: <Text style={styles.previewValue}>{width || 0} x {length || 0} m</Text></Text>
              )}
              {floors ? (
                <Text style={styles.previewRow}>Số tầng: <Text style={styles.previewValue}>{floors}</Text></Text>
              ) : null}
              <Text style={styles.previewRow}>Ngân sách: <Text style={styles.previewValue}>{budget ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseFloat(budget)||0) : '-'}</Text></Text>
              <Text style={styles.previewRow}>Hạng mục: <Text style={styles.previewValue}>{scopes.length? scopes.map(s=>({
                'thiet-ke':'Thiết kế','phan-tho':'Phần thô','hoan-thien':'Hoàn thiện','noi-that':'Nội thất','ha-tang':'Hạ tầng'
              } as any)[s]).join(', ') : '-'}</Text></Text>
              <Text style={styles.previewRow}>Chính sách: <Text style={styles.previewValue}>{privacy==='private'?'Riêng tư':'Công khai'}</Text></Text>
            </ScrollView>

            <View style={{ marginTop: 12 }}>
              <TouchableOpacity onPress={() => setAcceptTerms(!acceptTerms)} style={styles.termsRow}>
                <View style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}>
                  {acceptTerms && <Ionicons name="checkmark" size={14} color="#fff" />}
                </View>
                <Text style={styles.termsText}>Tôi xác nhận thông tin là chính xác và đồng ý điều khoản sử dụng</Text>
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection:'row', gap: 10, marginTop: 12 }}>
              <TouchableOpacity style={[styles.submitButton, { flex: 1 }]} onPress={handleCreate} disabled={loading}>
                <Ionicons name="save" size={22} color="#fff" />
                <Text style={styles.submitButtonText}>{loading ? 'Đang tạo...' : 'Tạo dự án'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.cancelButton, { flex: 1 }]} onPress={() => setShowPreview(false)}>
                <Text style={styles.cancelButtonText}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  sectionSmallTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#ff3b30',
  },
  input: {
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  inputWithPadding: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: 0,
  },
  inputSuffix: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginLeft: 8,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  helperText: {
    fontSize: 14,
    color: '#90b44c',
    marginTop: 6,
    fontWeight: '500',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeCard: {
    width: (SCREEN_W - 84) / 2,
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeCardActive: {
    backgroundColor: '#f0f9f4',
    borderColor: '#90b44c',
  },
  typeLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  typeLabelActive: {
    color: '#90b44c',
    fontWeight: '700',
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  mediaItem: {
    width: (SCREEN_W - 84) / 3,
    height: (SCREEN_W - 84) / 3,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  addMediaBtn: {
    width: (SCREEN_W - 84) / 3,
    height: (SCREEN_W - 84) / 3,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#90b44c',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f9f4',
  },
  addMediaText: {
    fontSize: 14,
    color: '#90b44c',
    fontWeight: '600',
    marginTop: 8,
  },
  // Attachments
  attachmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  attachmentName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  mapPickerBtn: {
    marginBottom: 16,
  },
  mapPlaceholder: {
    height: 160,
    backgroundColor: '#f0f9f4',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#90b44c',
    borderStyle: 'dashed',
  },
  mapPlaceholderText: {
    fontSize: 16,
    color: '#90b44c',
    fontWeight: '600',
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  calculatedArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f0f9f4',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: -8,
  },
  calculatedAreaText: {
    fontSize: 16,
    color: '#666',
  },
  calculatedAreaValue: {
    fontWeight: '700',
    color: '#90b44c',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  chipActive: {
    backgroundColor: '#f0f9f4',
    borderColor: '#90b44c',
  },
  chipText: {
    fontSize: 12,
    color: '#555',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#2f5d1a',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  footer: {
    marginTop: 24,
    gap: 12,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#90b44c',
    paddingVertical: 18,
    borderRadius: 12,
    shadowColor: '#90b44c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  // Stepper
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginBottom: 12,
  },
  stepItem: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  stepDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#90b44c' },
  stepLine: { flex: 1, height: 2, backgroundColor: '#e8f3e8', marginHorizontal: 6 },
  stepText: { fontSize: 11, color: '#666', marginLeft: 6 },
  // Preview modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  previewTitle: { fontSize: 18, fontWeight: '700', color: '#111', marginBottom: 10 },
  previewRow: { fontSize: 14, color: '#555', marginBottom: 6 },
  previewValue: { fontWeight: '700', color: '#111' },
  termsRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 1, borderColor: '#ccc', justifyContent:'center', alignItems:'center', backgroundColor:'#fff' },
  checkboxChecked: { backgroundColor: '#90b44c', borderColor: '#90b44c' },
  termsText: { flex: 1, fontSize: 12, color: '#666' },
});
