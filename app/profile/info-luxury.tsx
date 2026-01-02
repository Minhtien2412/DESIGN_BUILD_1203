/**
 * Profile Info Screen - Luxury Redesign
 * Personal details editing with elegant form validation
 */

import { LuxuryAvatar } from '@/components/ui/luxury-avatar';
import { LuxuryButton } from '@/components/ui/luxury-button';
import { LuxuryCard } from '@/components/ui/luxury-card';
import { LuxuryInput } from '@/components/ui/luxury-input';
import { SafeScrollView } from '@/components/ui/safe-area';
import { Animations } from '@/constants/animations';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/features/auth';
import { resolveAvatar } from '@/utils/avatar';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
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

export default function ProfileInfoLuxury() {
  const { user } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: '',
    address: '',
    city: '',
    country: 'Vietnam',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [avatarUri, setAvatarUri] = useState<string>(
    resolveAvatar(user?.avatar, { userId: user?.id || 'guest', nameFallback: user?.name || 'User', size: 120 })
  );
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const avatarScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: Animations.timing.elegant,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        damping: 15,
        stiffness: 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleFieldChange = (field: keyof FormData, value: string) => {
    setFormData({ ...formData, [field]: value });
    setHasChanges(true);

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập họ tên';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Họ tên phải có ít nhất 2 ký tự';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10,11}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ (10-11 chữ số)';
    }

    // Bio validation
    if (formData.bio && formData.bio.length > 200) {
      newErrors.bio = 'Giới thiệu không được vượt quá 200 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Lỗi xác thực', 'Vui lòng kiểm tra lại thông tin');
      return;
    }

    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert(
        'Thành công',
        'Thông tin đã được cập nhật',
        [
          {
            text: 'OK',
            onPress: () => {
              setHasChanges(false);
              router.back();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật thông tin. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Quyền truy cập', 'Cần quyền truy cập thư viện ảnh');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      // Animate avatar change
      Animated.sequence([
        Animated.timing(avatarScale, {
          toValue: 0.9,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(avatarScale, {
          toValue: 1,
          damping: 10,
          stiffness: 100,
          useNativeDriver: true,
        }),
      ]).start();

      setAvatarUri(result.assets[0].uri);
      setHasChanges(true);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Chỉnh sửa thông tin',
          headerStyle: { backgroundColor: Colors.light.primary },
          headerTintColor: Colors.light.surface,
          headerTitleStyle: { fontWeight: '600' },
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <SafeScrollView style={styles.scrollView}>
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {/* Avatar Section */}
            <LinearGradient
              colors={[Colors.light.primary, Colors.light.secondary]}
              style={styles.avatarSection}
            >
              <TouchableOpacity onPress={handlePickImage} activeOpacity={0.8}>
                <Animated.View style={{ transform: [{ scale: avatarScale }] }}>
                  <LuxuryAvatar
                    source={{ uri: avatarUri }}
                    name={formData.name || user?.name}
                    size="xlarge"
                    borderColor={Colors.light.accent}
                    borderWidth={4}
                  />
                  <View style={styles.avatarBadge}>
                    <Ionicons name="camera" size={20} color={Colors.light.primary} />
                  </View>
                </Animated.View>
              </TouchableOpacity>
              <Text style={styles.avatarHint}>Nhấn để thay đổi ảnh đại diện</Text>
            </LinearGradient>

            {/* Personal Info Section */}
            <LuxuryCard style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.goldBar} />
                <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
              </View>

              <LuxuryInput
                label="Họ và tên *"
                value={formData.name}
                onChangeText={(value) => handleFieldChange('name', value)}
                error={errors.name}
                leftIcon="person"
                variant="filled"
                containerStyle={styles.input}
              />

              <LuxuryInput
                label="Email *"
                value={formData.email}
                onChangeText={(value) => handleFieldChange('email', value)}
                error={errors.email}
                leftIcon="mail"
                variant="filled"
                keyboardType="email-address"
                autoCapitalize="none"
                containerStyle={styles.input}
              />

              <LuxuryInput
                label="Số điện thoại"
                value={formData.phone}
                onChangeText={(value) => handleFieldChange('phone', value)}
                error={errors.phone}
                leftIcon="call"
                variant="filled"
                keyboardType="phone-pad"
                containerStyle={styles.input}
              />

              <LuxuryInput
                label="Giới thiệu bản thân"
                value={formData.bio}
                onChangeText={(value) => handleFieldChange('bio', value)}
                error={errors.bio}
                leftIcon="create"
                variant="filled"
                multiline
                numberOfLines={4}
                containerStyle={styles.input}
              />
            </LuxuryCard>

            {/* Address Section */}
            <LuxuryCard style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.goldBar} />
                <Text style={styles.sectionTitle}>Địa chỉ</Text>
              </View>

              <LuxuryInput
                label="Địa chỉ"
                value={formData.address}
                onChangeText={(value) => handleFieldChange('address', value)}
                error={errors.address}
                leftIcon="home"
                variant="filled"
                containerStyle={styles.input}
              />

              <LuxuryInput
                label="Thành phố"
                value={formData.city}
                onChangeText={(value) => handleFieldChange('city', value)}
                error={errors.city}
                leftIcon="location"
                variant="filled"
                containerStyle={styles.input}
              />

              <LuxuryInput
                label="Quốc gia"
                value={formData.country}
                onChangeText={(value) => handleFieldChange('country', value)}
                error={errors.country}
                leftIcon="globe"
                variant="filled"
                containerStyle={styles.input}
              />
            </LuxuryCard>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <LuxuryButton
                variant="outline"
                size="large"
                onPress={() => router.back()}
                style={styles.button}
                title="Hủy"
              />

              <LuxuryButton
                variant="primary"
                size="large"
                onPress={handleSave}
                loading={saving}
                disabled={!hasChanges || saving}
                style={styles.button}
                title={saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              />
            </View>

            <View style={{ height: 40 }} />
          </Animated.View>
        </SafeScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollView: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.light.surface,
  },
  avatarHint: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.goldLight,
    letterSpacing: 0.3,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  goldBar: {
    width: 4,
    height: 20,
    backgroundColor: Colors.light.accent,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.primary,
    letterSpacing: 0.5,
  },
  input: {
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  button: {
    flex: 1,
  },
});
