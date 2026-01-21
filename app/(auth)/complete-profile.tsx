/**
 * Màn Hình Hoàn Tất Hồ Sơ
 * =======================
 * 
 * 📝 Bổ sung thông tin cá nhân sau khi xác thực OTP
 * 
 * Hướng dẫn:
 * 1. Nhập họ tên đầy đủ của bạn
 * 2. Email (không bắt buộc) - để nhận thông báo quan trọng
 * 3. Mật khẩu (không bắt buộc) - để đăng nhập bằng email sau này
 * 4. Nhấn "Hoàn tất" để bắt đầu sử dụng ứng dụng
 * 
 * 💡 Mẹo: Bạn có thể cập nhật thông tin sau trong phần Cài đặt
 * 
 * @author Design Build Team
 * @version 2.0.0
 * @created 2026-01-15
 */

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { useAuth } from '@/context/AuthContext';

// Colors
const COLORS = {
  primary: '#0068FF',
  primaryDark: '#0052CC',
  primaryLight: '#E6F2FF',
  success: '#00B14F',
  error: '#E53E3E',
  errorLight: '#FED7D7',
  text: '#081C36',
  textSecondary: '#7589A3',
  textMuted: '#A0AEC0',
  surface: '#F5F7FA',
  border: '#E2E8F0',
};

export default function CompleteProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { registerWithPhone } = useAuth();
  
  const phone = (params.phone as string) || '';
  const userId = params.userId as string | undefined;
  const initialName = params.name as string | undefined;
  const initialEmail = params.email as string | undefined;
  
  // Form state
  const [name, setName] = useState(initialName || '');
  const [email, setEmail] = useState(initialEmail || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Animations
  const shakeAnim = useRef(new Animated.Value(0)).current;
  
  // Shake animation
  const triggerShake = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };
  
  // Validate form
  const validateForm = (): boolean => {
    if (!name.trim()) {
      setError('Vui lòng nhập họ tên');
      return false;
    }
    
    if (name.trim().length < 2) {
      setError('Họ tên phải có ít nhất 2 ký tự');
      return false;
    }
    
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Email không hợp lệ');
      return false;
    }
    
    if (password) {
      if (password.length < 6) {
        setError('Mật khẩu phải có ít nhất 6 ký tự');
        return false;
      }
      
      if (password !== confirmPassword) {
        setError('Mật khẩu xác nhận không khớp');
        return false;
      }
    }
    
    return true;
  };
  
  // Submit profile
  const handleSubmit = async () => {
    if (!validateForm()) {
      triggerShake();
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Use AuthContext's registerWithPhone - tokens saved automatically
      await registerWithPhone(
        phone,
        name.trim(),
        email.trim() || undefined,
        password || undefined
      );
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Navigate to home
      router.replace('/(tabs)');
      
    } catch (err: any) {
      console.error('[CompleteProfile] Error:', err);
      setError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
      triggerShake();
    } finally {
      setLoading(false);
    }
  };
  
  // Skip for now
  const handleSkip = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Go to home without completing profile
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0068FF', '#00B14F']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="account-check" size={48} color="#fff" />
            </View>
            <Text style={styles.title}>Hoàn tất hồ sơ</Text>
            <Text style={styles.subtitle}>
              Bổ sung thông tin để trải nghiệm tốt hơn
            </Text>
          </View>
          
          {/* Form Card */}
          <Animated.View 
            style={[
              styles.formCard,
              { transform: [{ translateX: shakeAnim }] }
            ]}
          >
            {/* Phone (readonly) */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Số điện thoại</Text>
              <View style={[styles.inputWrapper, styles.inputDisabled]}>
                <Ionicons name="call-outline" size={20} color={COLORS.textMuted} />
                <Text style={styles.phoneText}>{phone}</Text>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                  <Text style={styles.verifiedText}>Đã xác thực</Text>
                </View>
              </View>
            </View>
            
            {/* Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Họ và tên *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color={COLORS.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder="Nhập họ và tên"
                  placeholderTextColor={COLORS.textMuted}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  editable={!loading}
                />
              </View>
            </View>
            
            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email (tùy chọn)</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color={COLORS.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder="email@example.com"
                  placeholderTextColor={COLORS.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>
            </View>
            
            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mật khẩu (tùy chọn)</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color={COLORS.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder="Ít nhất 6 ký tự"
                  placeholderTextColor={COLORS.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons 
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                    size={20} 
                    color={COLORS.textMuted} 
                  />
                </Pressable>
              </View>
              <Text style={styles.inputHint}>
                Thiết lập mật khẩu để đăng nhập nhanh hơn
              </Text>
            </View>
            
            {/* Confirm Password */}
            {password.length > 0 && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Xác nhận mật khẩu</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color={COLORS.textMuted} />
                  <TextInput
                    style={styles.input}
                    placeholder="Nhập lại mật khẩu"
                    placeholderTextColor={COLORS.textMuted}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                    editable={!loading}
                  />
                </View>
              </View>
            )}
            
            {/* Referral Code */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mã giới thiệu (tùy chọn)</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="gift-outline" size={20} color={COLORS.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder="Nhập mã nếu có"
                  placeholderTextColor={COLORS.textMuted}
                  value={referralCode}
                  onChangeText={setReferralCode}
                  autoCapitalize="characters"
                  editable={!loading}
                />
              </View>
            </View>
            
            {/* Error */}
            {error && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color={COLORS.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            
            {/* Submit Button */}
            <Pressable
              style={[styles.submitButton, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <LinearGradient
                colors={loading ? ['#ccc', '#aaa'] : [COLORS.primary, COLORS.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitButtonGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>Hoàn tất đăng ký</Text>
                )}
              </LinearGradient>
            </Pressable>
            
            {/* Skip */}
            <Pressable style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipText}>Bỏ qua, thiết lập sau</Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 30,
  },
  
  // Header
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
  },
  
  // Form Card
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  
  // Input
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 10,
  },
  inputDisabled: {
    backgroundColor: '#F0F4F8',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
  },
  inputHint: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 6,
    marginLeft: 4,
  },
  
  // Phone readonly
  phoneText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E6F7EF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.success,
  },
  
  // Error
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.errorLight,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.error,
  },
  
  // Submit Button
  submitButton: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonGradient: {
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  
  // Skip
  skipButton: {
    alignSelf: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  skipText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textDecorationLine: 'underline',
  },
});
