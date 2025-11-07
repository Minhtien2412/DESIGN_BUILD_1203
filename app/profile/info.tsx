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
      await apiFetch('/profile/update', {
        method: 'POST',
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
      Alert.alert('Thành công', 'Cập nhật thông tin thành công', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Update profile error:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật thông tin. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const pickImage = async () => {
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
      }
    } catch (error) {
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
      }
    } catch (error) {
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
          headerRight: () => (
            <TouchableOpacity onPress={handleSave} disabled={saving}>
              {saving ? (
                <ActivityIndicator size="small" color="#0891B2" />
              ) : (
                <ThemedText style={styles.saveButton}>Lưu</ThemedText>
              )}
            </TouchableOpacity>
          )
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
            <View style={styles.avatarContainer}>
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
              <TouchableOpacity 
                style={styles.avatarEditButton}
                onPress={showImageOptions}
                activeOpacity={0.8}
              >
                <Ionicons name="camera" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.avatarHint}>Nhấn vào ảnh để thay đổi</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>
            {/* Name */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                Họ và tên <Text style={styles.required}>*</Text>
              </Text>
              <View style={[styles.inputWrapper, errors.name && styles.inputError]}>
                <Ionicons name="person-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) => {
                    setFormData({ ...formData, name: text });
                    if (errors.name) setErrors({ ...errors, name: undefined });
                  }}
                  placeholder="Nhập họ và tên"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            {/* Email */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                Email <Text style={styles.required}>*</Text>
              </Text>
              <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
                <Ionicons name="mail-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(text) => {
                    setFormData({ ...formData, email: text });
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  placeholder="email@example.com"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Phone */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Số điện thoại</Text>
              <View style={[styles.inputWrapper, errors.phone && styles.inputError]}>
                <Ionicons name="call-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.phone}
                  onChangeText={(text) => {
                    setFormData({ ...formData, phone: text });
                    if (errors.phone) setErrors({ ...errors, phone: undefined });
                  }}
                  placeholder="0123456789"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                />
              </View>
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            </View>

            {/* Bio */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Giới thiệu bản thân</Text>
              <View style={[styles.inputWrapper, styles.textAreaWrapper, errors.bio && styles.inputError]}>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.bio}
                  onChangeText={(text) => {
                    setFormData({ ...formData, bio: text });
                    if (errors.bio) setErrors({ ...errors, bio: undefined });
                  }}
                  placeholder="Viết vài dòng về bản thân..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
              <Text style={styles.charCount}>{formData.bio.length}/500</Text>
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
                  onChangeText={(text) => setFormData({ ...formData, address: text })}
                  placeholder="Số nhà, tên đường"
                  placeholderTextColor="#9CA3AF"
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
                  onChangeText={(text) => setFormData({ ...formData, city: text })}
                  placeholder="TP. Hồ Chí Minh"
                  placeholderTextColor="#9CA3AF"
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
                  onChangeText={(text) => setFormData({ ...formData, country: text })}
                  placeholder="Vietnam"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
          </View>

          {/* Save Button (Mobile) */}
          <TouchableOpacity
            style={[styles.submitButton, saving && styles.submitButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={24} color="#fff" />
                <Text style={styles.submitButtonText}>Lưu thay đổi</Text>
              </>
            )}
          </TouchableOpacity>
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
    color: '#EF4444',
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
    borderColor: '#EF4444',
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
    color: '#EF4444',
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
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
});
