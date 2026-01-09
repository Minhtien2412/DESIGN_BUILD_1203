import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Container } from '@/components/ui/container';
import { SafeScrollView } from '@/components/ui/safe-area';
import { useAuth } from '@/features/auth';
import { useProfile } from '@/hooks/useProfile';
import { apiFetch } from '@/services/api';
import { resolveAvatar } from '@/utils/avatar';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Stack, router } from 'expo-router';
import * as React from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface FormData {
  name: string;
  email: string;
  phone: string;
  bio: string;
  address: string;
  city: string;
  country: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  bio?: string;
  address?: string;
  city?: string;
  country?: string;
}

export default function ProfileInfoScreen() {
  const { user: authUser, refreshUser } = useAuth();
  const { user: profileUser, loading: profileLoading, refresh } = useProfile();
  const user = profileUser || authUser;

  const [formData, setFormData] = React.useState<FormData>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: '',
    address: '',
    city: '',
    country: 'Vietnam',
  });

  const [errors, setErrors] = React.useState<FormErrors>({});
  const [avatarUri, setAvatarUri] = React.useState<string>(
    resolveAvatar(user?.avatar, { userId: user?.id || 'guest', nameFallback: user?.name || 'User', size: 120 })
  );
  const [saving, setSaving] = React.useState(false);
  const [hasChanges, setHasChanges] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [validFields, setValidFields] = React.useState<Set<keyof FormData>>(new Set());

  // Animations
  const successScale = React.useRef(new Animated.Value(0)).current;
  const shakeAnim = React.useRef(new Animated.Value(0)).current;
  const avatarScale = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (user) {
  setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: (user as any).bio || '',
        address: (user as any).address || '',
        city: (user as any).city || '',
        country: (user as any).country || 'Vietnam',
      });
    }
  }, [user]);

  const handleFieldChange = (field: keyof FormData, value: string) => {
    setFormData({ ...formData, [field]: value });
    setHasChanges(true);

    // Real-time validation
    const newErrors = { ...errors };
    
    // Validate based on field type
    if (field === 'name') {
      if (!value.trim()) {
        newErrors.name = 'Vui lòng nhập họ tên';
      } else if (value.trim().length < 2) {
        newErrors.name = 'Họ tên phải có ít nhất 2 ký tự';
      } else {
        delete newErrors.name;
      }
    } else if (field === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value.trim()) {
        newErrors.email = 'Vui lòng nhập email';
      } else if (!emailRegex.test(value)) {
        newErrors.email = 'Email không hợp lệ';
      } else {
        delete newErrors.email;
      }
    } else if (field === 'phone') {
      const phoneRegex = /^[0-9]{10,11}$/;
      if (value && !phoneRegex.test(value.replace(/\s/g, ''))) {
        newErrors.phone = 'Số điện thoại không hợp lệ (10-11 số)';
      } else {
        delete newErrors.phone;
      }
    } else if (field === 'bio') {
      if (value.length > 500) {
        newErrors.bio = 'Giới thiệu không được quá 500 ký tự';
      } else {
        delete newErrors.bio;
      }
    }

    setErrors(newErrors);

    // Update valid fields set for checkmark display
    const newValidFields = new Set(validFields);
    if (!newErrors[field] && value.trim()) {
      newValidFields.add(field);
    } else {
      newValidFields.delete(field);
    }
    setValidFields(newValidFields);
  };

  const shakeError = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const showSuccessAnimation = () => {
    setShowSuccess(true);
    Animated.sequence([
      Animated.spring(successScale, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.delay(1500),
      Animated.timing(successScale, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setShowSuccess(false));
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên không được để trống';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Tên phải có ít nhất 2 ký tự';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    const phoneRegex = /^[0-9]{10,11}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ (10-11 chữ số)';
    }

    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Giới thiệu không được vượt quá 500 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      shakeError();
      Alert.alert('Lỗi', 'Vui lòng kiểm tra lại thông tin');
      return;
    }

    setSaving(true);
  try {
      // Create FormData for multipart upload
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('bio', formData.bio);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('city', formData.city);
      formDataToSend.append('country', formData.country);

      if (avatarUri && avatarUri.startsWith('file://')) {
        const filename = avatarUri.split('/').pop() || 'avatar.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        formDataToSend.append('avatar', { uri: avatarUri, name: filename, type } as any);
      }

      // Use centralized API wrapper (adds token, API key, timeout, errors)
      // BE uses PATCH /profile (not POST /profile/update)
      await apiFetch('/profile', {
        method: 'PATCH',
        data: formDataToSend,
        timeoutMs: 15000,
      });

      // Refresh both profile hook and global auth user to propagate avatar across the app
      await Promise.allSettled([refresh(), refreshUser()]);
      // Refresh avatar cache by appending cache bust param for this screen state
      setAvatarUri(
        resolveAvatar(user?.avatar, {
          userId: user?.id || 'guest',
          nameFallback: user?.name || 'User',
          size: 120,
          cacheBust: Date.now(),
        })
      );
      
      setHasChanges(false);
      showSuccessAnimation();
      
      setTimeout(() => {
        Alert.alert('Thành công', 'Thông tin đã được cập nhật', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }, 300);
    } catch (error) {
      console.error('Update profile error:', error);
      shakeError();
      Alert.alert('Lỗi', 'Không thể cập nhật thông tin. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const pickImage = async () => {
    // Animate avatar before picking
    Animated.sequence([
      Animated.timing(avatarScale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(avatarScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền truy cập thư viện ảnh');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setAvatarUri(result.assets[0].uri);
        setHasChanges(true);
        
        // Animate avatar change
        Animated.sequence([
          Animated.timing(avatarScale, { toValue: 1.1, duration: 200, useNativeDriver: true }),
          Animated.spring(avatarScale, { toValue: 1, friction: 5, useNativeDriver: true }),
        ]).start();
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại.');
    }
  };

  const takePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền truy cập camera');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setAvatarUri(result.assets[0].uri);
        setHasChanges(true);
        
        // Animate avatar change
        Animated.sequence([
          Animated.timing(avatarScale, { toValue: 1.1, duration: 200, useNativeDriver: true }),
          Animated.spring(avatarScale, { toValue: 1, friction: 5, useNativeDriver: true }),
        ]).start();
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Lỗi', 'Không thể chụp ảnh. Vui lòng thử lại.');
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Chọn ảnh đại diện',
      'Bạn muốn chọn ảnh từ đâu?',
      [
        { text: 'Thư viện', onPress: pickImage },
        { text: 'Chụp ảnh', onPress: takePhoto },
        { text: 'Hủy', style: 'cancel' }
      ]
    );
  };

  if (profileLoading) {
    return (
      <Container>
        <Stack.Screen options={{ title: 'Thông tin cá nhân', headerBackTitle: 'Quay lại' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0891B2" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </Container>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen 
        options={{ 
          title: 'Thông tin cá nhân',
          headerBackTitle: 'Quay lại',
          headerRight: () => hasChanges ? (
            <TouchableOpacity 
              onPress={handleSave} 
              disabled={saving}
              style={{ opacity: saving ? 0.5 : 1 }}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#0891B2" />
              ) : (
                <ThemedText style={styles.saveButton}>Lưu</ThemedText>
              )}
            </TouchableOpacity>
          ) : null
        }} 
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <SafeScrollView
          hasTabBar={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <TouchableOpacity 
              onPress={showImageOptions}
              activeOpacity={0.8}
              disabled={saving}
            >
              <Animated.View style={{ transform: [{ scale: avatarScale }] }}>
                <View style={styles.avatarContainer}>
                  <Image source={{ uri: avatarUri }} style={styles.avatar} />
                  <View style={styles.avatarEditButton}>
                    <Ionicons name="camera" size={18} color="#fff" />
                  </View>
                </View>
              </Animated.View>
            </TouchableOpacity>
            <Text style={styles.avatarHint}>Nhấn vào ảnh để thay đổi</Text>
          </View>

          {/* Form Fields */}
          <Animated.View 
            style={[
              styles.formSection,
              { transform: [{ translateX: shakeAnim }] }
            ]}
          >
            {/* Name */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                Họ và tên <Text style={styles.required}>*</Text>
              </Text>
              <View style={[
                styles.inputWrapper, 
                errors.name && styles.inputError,
                validFields.has('name') && styles.inputValid
              ]}>
                <Ionicons 
                  name={validFields.has('name') ? "checkmark-circle" : "person-outline"} 
                  size={20} 
                  color={errors.name ? "#000000" : validFields.has('name') ? "#0066CC" : "#6B7280"} 
                  style={styles.inputIcon} 
                />
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) => handleFieldChange('name', text)}
                  placeholder="Nhập họ và tên đầy đủ"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="words"
                  editable={!saving}
                />
              </View>
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            {/* Email */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                Email <Text style={styles.required}>*</Text>
              </Text>
              <View style={[
                styles.inputWrapper, 
                errors.email && styles.inputError,
                validFields.has('email') && styles.inputValid
              ]}>
                <Ionicons 
                  name={validFields.has('email') ? "checkmark-circle" : "mail-outline"} 
                  size={20} 
                  color={errors.email ? "#000000" : validFields.has('email') ? "#0066CC" : "#6B7280"} 
                  style={styles.inputIcon} 
                />
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(text) => handleFieldChange('email', text)}
                  placeholder="email@example.com"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!saving}
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Phone */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Số điện thoại</Text>
              <View style={[
                styles.inputWrapper, 
                errors.phone && styles.inputError,
                validFields.has('phone') && styles.inputValid
              ]}>
                <Ionicons 
                  name={validFields.has('phone') ? "checkmark-circle" : "call-outline"} 
                  size={20} 
                  color={errors.phone ? "#000000" : validFields.has('phone') ? "#0066CC" : "#6B7280"} 
                  style={styles.inputIcon} 
                />
                <TextInput
                  style={styles.input}
                  value={formData.phone}
                  onChangeText={(text) => handleFieldChange('phone', text)}
                  placeholder="0123456789"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  maxLength={11}
                  editable={!saving}
                />
              </View>
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            </View>

            {/* Bio */}
            <View style={styles.fieldContainer}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={styles.label}>Giới thiệu bản thân</Text>
                <Text style={styles.charCount}>{formData.bio.length}/500</Text>
              </View>
              <View style={[
                styles.inputWrapper, 
                styles.textAreaWrapper, 
                errors.bio && styles.inputError,
                validFields.has('bio') && styles.inputValid
              ]}>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.bio}
                  onChangeText={(text) => handleFieldChange('bio', text)}
                  placeholder="Viết vài dòng về bản thân..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  maxLength={500}
                  editable={!saving}
                />
              </View>
              {errors.bio && <Text style={styles.errorText}>{errors.bio}</Text>}
            </View>

            {/* Address */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Địa chỉ</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="location-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.address}
                  onChangeText={(text) => handleFieldChange('address', text)}
                  placeholder="Số nhà, tên đường"
                  placeholderTextColor="#9CA3AF"
                  editable={!saving}
                />
              </View>
            </View>

            {/* City */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Thành phố</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="business-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.city}
                  onChangeText={(text) => handleFieldChange('city', text)}
                  placeholder="TP. Hồ Chí Minh"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="words"
                  editable={!saving}
                />
              </View>
            </View>

            {/* Country */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Quốc gia</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="flag-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.country}
                  onChangeText={(text) => handleFieldChange('country', text)}
                  placeholder="Vietnam"
                  placeholderTextColor="#9CA3AF"
                  editable={!saving}
                />
              </View>
            </View>
          </Animated.View>

          {/* Save Button */}
          <TouchableOpacity
            style={[
              styles.submitButton, 
              !hasChanges && styles.submitButtonDisabled,
              saving && styles.submitButtonSaving
            ]}
            onPress={handleSave}
            disabled={!hasChanges || saving}
            activeOpacity={0.8}
          >
            {saving ? (
              <>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.submitButtonText}>Đang lưu...</Text>
              </>
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={24} color="#fff" />
                <Text style={styles.submitButtonText}>
                  {hasChanges ? 'Lưu thay đổi' : 'Không có thay đổi'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Success Overlay */}
          {showSuccess && (
            <Animated.View 
              style={[
                styles.successOverlay,
                { transform: [{ scale: successScale }] }
              ]}
            >
              <View style={styles.successCard}>
                <Ionicons name="checkmark-circle" size={60} color="#0066CC" />
                <Text style={styles.successText}>Đã lưu!</Text>
              </View>
            </Animated.View>
          )}
        </SafeScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  saveButton: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0891B2',
    marginRight: 8,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E5E7EB',
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0891B2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarHint: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  formSection: {
    gap: 20,
  },
  fieldContainer: {
    marginBottom: 4,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#000000',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  inputError: {
    borderColor: '#000000',
    borderWidth: 2,
  },
  inputValid: {
    borderColor: '#0066CC',
    borderWidth: 2,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 12,
  },
  textAreaWrapper: {
    alignItems: 'flex-start',
    paddingTop: 12,
    minHeight: 100,
  },
  textArea: {
    paddingTop: 0,
    paddingBottom: 12,
  },
  charCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },
  errorText: {
    fontSize: 13,
    color: '#000000',
    marginTop: 6,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0891B2',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 32,
    gap: 8,
    shadowColor: '#0891B2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
  },
  submitButtonSaving: {
    backgroundColor: '#6B7280',
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  successCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  successText: {
    marginTop: 16,
    fontSize: 24,
    fontWeight: '700',
    color: '#0066CC',
  },
});
