/**
 * Màn Hình Đăng Nhập Bằng Số Điện Thoại
 * =====================================
 * 
 * 📱 Đăng nhập/Đăng ký nhanh chóng với OTP
 * 
 * Hướng dẫn sử dụng:
 * 1. Nhập số điện thoại của bạn (VD: 0912 345 678)
 * 2. Nhấn "Tiếp tục" để nhận mã xác thực OTP
 * 3. Nhập mã OTP được gửi qua Zalo/SMS
 * 4. Đăng nhập thành công!
 * 
 * 💡 Lưu ý: Thiết bị tin cậy sẽ tự động đăng nhập trong 30 ngày
 * 
 * @author Design Build Team
 * @version 2.0.0
 * @created 2026-01-15
 */

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Href, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
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
import { formatVietnamesePhone, isValidVietnamesePhone, zaloOTPAuth } from '@/services/zaloOTPAuthService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Colors - Zalo inspired
const COLORS = {
  primary: '#0068FF',
  primaryDark: '#0052CC',
  primaryLight: '#E6F2FF',
  secondary: '#00B14F',
  background: '#FFFFFF',
  surface: '#F5F7FA',
  text: '#081C36',
  textSecondary: '#7589A3',
  textMuted: '#A0AEC0',
  border: '#E2E8F0',
  error: '#E53E3E',
  errorLight: '#FED7D7',
  success: '#00B14F',
  google: '#EA4335',
  facebook: '#1877F2',
  zalo: '#0068FF',
};

type AuthMode = 'login' | 'register';

export default function PhoneLoginScreen() {
  const router = useRouter();
  const { sendOTP, checkTrustedDevice, autoLoginWithTrustedDevice } = useAuth();
  
  // State
  const [phone, setPhone] = useState('');
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputFocused, setInputFocused] = useState(false);
  const [checkingTrusted, setCheckingTrusted] = useState(false);
  const [trustedInfo, setTrustedInfo] = useState<{ trusted: boolean; daysRemaining?: number } | null>(null);
  
  // For register mode
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  // Entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  
  // Format phone input
  const formatPhoneDisplay = (value: string): string => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as: 0912 345 678
    if (digits.length <= 4) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 10)}`;
  };
  
  // Handle phone change
  const handlePhoneChange = (value: string) => {
    // Allow only digits
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 10) {
      setPhone(digits);
      if (error) setError(null);
      // Reset trusted info when phone changes
      setTrustedInfo(null);
    }
  };
  
  // Check trusted device when phone is valid
  const handlePhoneBlur = async () => {
    setInputFocused(false);
    
    // Check trusted device if phone is valid
    if (isValidVietnamesePhone(phone) && mode === 'login') {
      setCheckingTrusted(true);
      try {
        const result = await checkTrustedDevice(phone);
        setTrustedInfo(result);
        
        if (result.trusted) {
          console.log('[PhoneLogin] Device trusted, days remaining:', result.daysRemaining);
        }
      } catch (err) {
        console.warn('[PhoneLogin] Could not check trusted device:', err);
      } finally {
        setCheckingTrusted(false);
      }
    }
  };
  
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
  
  // Button press animation
  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };
  
  // Validate form
  const validateForm = (): boolean => {
    if (!phone) {
      setError('Vui lòng nhập số điện thoại');
      return false;
    }
    
    if (!isValidVietnamesePhone(phone)) {
      setError('Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam.');
      return false;
    }
    
    if (mode === 'register' && !name.trim()) {
      setError('Vui lòng nhập họ tên');
      return false;
    }
    
    return true;
  };
  
  // Send OTP or Auto-login
  const handleSendOTP = async () => {
    if (!validateForm()) {
      triggerShake();
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      animatePress();
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // 🔐 Check trusted device first (skip OTP if trusted)
      if (mode === 'login') {
        const trusted = trustedInfo || await checkTrustedDevice(phone);
        
        if (trusted.trusted) {
          console.log('[PhoneLogin] Device trusted, attempting auto-login...');
          
          const autoResult = await autoLoginWithTrustedDevice(phone);
          
          if (autoResult.success) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.replace('/(tabs)');
            return;
          }
          
          // Auto-login failed, continue with OTP
          console.log('[PhoneLogin] Auto-login failed, falling back to OTP');
        }
      }
      
      // Use AuthContext's sendOTP
      const result = await sendOTP(phone, 'sms');
      
      if (!result.success) {
        setError(result.message);
        triggerShake();
        return;
      }
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Navigate to OTP verification with sessionId
      router.push({
        pathname: '/(auth)/otp-verify' as any,
        params: {
          phone: formatVietnamesePhone(phone),
          mode,
          name: name || '',
          email: email || '',
          sessionId: result.sessionId || '',
        },
      });
      
    } catch (err) {
      console.error('[PhoneLogin] Error:', err);
      setError('Có lỗi xảy ra. Vui lòng thử lại.');
      triggerShake();
    } finally {
      setLoading(false);
    }
  };
  
  // Sign in with Zalo
  const handleZaloLogin = async () => {
    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const result = await zaloOTPAuth.signInWithZalo();
      
      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace('/(tabs)');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Đăng nhập Zalo thất bại');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={['#0068FF', '#00B14F']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />
      
      {/* Decorative circles */}
      <View style={[styles.decorCircle, styles.decorCircle1]} />
      <View style={[styles.decorCircle, styles.decorCircle2]} />
      
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
          <Animated.View 
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }
            ]}
          >
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={['#fff', '#f0f7ff']}
                style={styles.logoCircle}
              >
                <MaterialCommunityIcons name="home-city" size={48} color={COLORS.primary} />
              </LinearGradient>
            </View>
            <Text style={styles.appName}>Design Build</Text>
            <Text style={styles.tagline}>Thiết kế • Thi công • Quản lý</Text>
          </Animated.View>
          
          {/* Form Card */}
          <Animated.View 
            style={[
              styles.formCard,
              {
                opacity: fadeAnim,
                transform: [{ translateX: shakeAnim }],
              }
            ]}
          >
            {/* Mode Tabs */}
            <View style={styles.modeTabs}>
              <Pressable
                style={[styles.modeTab, mode === 'login' && styles.modeTabActive]}
                onPress={() => {
                  setMode('login');
                  setError(null);
                  Haptics.selectionAsync();
                }}
              >
                <Text style={[styles.modeTabText, mode === 'login' && styles.modeTabTextActive]}>
                  Đăng nhập
                </Text>
              </Pressable>
              <Pressable
                style={[styles.modeTab, mode === 'register' && styles.modeTabActive]}
                onPress={() => {
                  setMode('register');
                  setError(null);
                  Haptics.selectionAsync();
                }}
              >
                <Text style={[styles.modeTabText, mode === 'register' && styles.modeTabTextActive]}>
                  Đăng ký
                </Text>
              </Pressable>
            </View>
            
            <Text style={styles.formTitle}>
              {mode === 'login' ? 'Chào mừng bạn!' : 'Tạo tài khoản mới'}
            </Text>
            <Text style={styles.formSubtitle}>
              {mode === 'login' 
                ? 'Đăng nhập bằng số điện thoại'
                : 'Nhập thông tin để đăng ký'}
            </Text>
            
            {/* Name Input (Register only) */}
            {mode === 'register' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Họ và tên</Text>
                <View style={[
                  styles.inputWrapper,
                  inputFocused && styles.inputFocused,
                ]}>
                  <Ionicons 
                    name="person-outline" 
                    size={20} 
                    color={COLORS.textMuted} 
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Nguyễn Văn A"
                    placeholderTextColor={COLORS.textMuted}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    editable={!loading}
                  />
                </View>
              </View>
            )}
            
            {/* Phone Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Số điện thoại</Text>
              <View style={[
                styles.inputWrapper,
                inputFocused && styles.inputFocused,
                error && styles.inputError,
              ]}>
                {/* Country Code */}
                <View style={styles.countryCode}>
                  <Text style={styles.flagEmoji}>🇻🇳</Text>
                  <Text style={styles.countryCodeText}>+84</Text>
                </View>
                
                <View style={styles.divider} />
                
                <TextInput
                  style={styles.phoneInput}
                  placeholder="912 345 678"
                  placeholderTextColor={COLORS.textMuted}
                  value={formatPhoneDisplay(phone)}
                  onChangeText={handlePhoneChange}
                  onFocus={() => setInputFocused(true)}
                  onBlur={handlePhoneBlur}
                  keyboardType="phone-pad"
                  maxLength={12} // Including spaces
                  editable={!loading}
                />
                
                {/* Trusted device indicator */}
                {checkingTrusted && (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                )}
                
                {trustedInfo?.trusted && !checkingTrusted && (
                  <Ionicons name="shield-checkmark" size={20} color={COLORS.success} />
                )}
                
                {phone.length > 0 && !checkingTrusted && !trustedInfo?.trusted && (
                  <Pressable onPress={() => setPhone('')}>
                    <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
                  </Pressable>
                )}
              </View>
            </View>
            
            {/* Email Input (Register only - optional) */}
            {mode === 'register' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email (không bắt buộc)</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons 
                    name="mail-outline" 
                    size={20} 
                    color={COLORS.textMuted} 
                  />
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
            )}
            
            {/* Error Message */}
            {error && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color={COLORS.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            
            {/* Trusted Device Info */}
            {trustedInfo?.trusted && mode === 'login' && (
              <View style={styles.trustedDeviceInfo}>
                <Ionicons name="shield-checkmark" size={18} color={COLORS.success} />
                <Text style={styles.trustedDeviceText}>
                  🔒 Thiết bị tin cậy • Còn hiệu lực {trustedInfo.daysRemaining} ngày
                </Text>
              </View>
            )}
            
            {/* Helper Text - Hướng dẫn người dùng */}
            {!trustedInfo?.trusted && mode === 'login' && phone.length === 0 && (
              <View style={styles.helperBox}>
                <Text style={styles.helperText}>
                  💡 Nhập số điện thoại để nhận mã xác thực OTP qua Zalo
                </Text>
              </View>
            )}
            
            {/* Submit Button */}
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Pressable
                style={[styles.submitButton, loading && styles.buttonDisabled]}
                onPress={handleSendOTP}
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
                    <>
                      <Text style={styles.submitButtonText}>
                        {trustedInfo?.trusted && mode === 'login' 
                          ? 'Đăng nhập nhanh' 
                          : mode === 'login' 
                            ? 'Tiếp tục' 
                            : 'Đăng ký'}
                      </Text>
                      <Ionicons 
                        name={trustedInfo?.trusted && mode === 'login' ? 'flash' : 'arrow-forward'} 
                        size={20} 
                        color="#fff" 
                      />
                    </>
                  )}
                </LinearGradient>
              </Pressable>
            </Animated.View>
            
            {/* Divider */}
            <View style={styles.orDivider}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>hoặc</Text>
              <View style={styles.orLine} />
            </View>
            
            {/* Social Login */}
            <View style={styles.socialButtons}>
              {/* Zalo Login */}
              <Pressable 
                style={[styles.socialButton, { backgroundColor: '#0068FF' }]}
                onPress={handleZaloLogin}
                disabled={loading}
              >
                <MaterialCommunityIcons name="chat" size={22} color="#fff" />
                <Text style={styles.socialButtonText}>Zalo</Text>
              </Pressable>
              
              {/* Google Login */}
              <Pressable 
                style={[styles.socialButton, { backgroundColor: '#EA4335' }]}
                onPress={() => router.push('/(auth)/login-zalo' as Href)}
                disabled={loading}
              >
                <Ionicons name="logo-google" size={22} color="#fff" />
                <Text style={styles.socialButtonText}>Google</Text>
              </Pressable>
            </View>
            
            {/* Password Login Link */}
            <Pressable 
              style={styles.passwordLoginLink}
              onPress={() => router.push('/(auth)/login' as Href)}
            >
              <Ionicons name="lock-closed-outline" size={16} color={COLORS.primary} />
              <Text style={styles.passwordLoginText}>Đăng nhập bằng mật khẩu</Text>
            </Pressable>
          </Animated.View>
          
          {/* Terms */}
          <Text style={styles.terms}>
            Tiếp tục đồng nghĩa bạn chấp nhận{'\n'}
            <Text style={styles.termsLink}>Điều khoản dịch vụ</Text>
            {' và '}
            <Text style={styles.termsLink}>Chính sách quyền riêng tư</Text>
          </Text>
          
          {/* Support Info */}
          <View style={styles.supportInfo}>
            <Text style={styles.supportText}>
              Cần hỗ trợ? Liên hệ: 0377 263 997
            </Text>
          </View>
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
  decorCircle: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  decorCircle1: {
    width: 300,
    height: 300,
    top: -100,
    right: -100,
  },
  decorCircle2: {
    width: 200,
    height: 200,
    bottom: 100,
    left: -80,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 70 : 50,
    paddingBottom: 30,
  },
  
  // Header
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoContainer: {
    marginBottom: 14,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  appName: {
    fontSize: 30,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
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
  
  // Mode Tabs
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  modeTabActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  modeTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  modeTabTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  
  formTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  formSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 24,
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
    height: 54,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 10,
  },
  inputFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  inputError: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.errorLight,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  
  // Phone Input specific
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  flagEmoji: {
    fontSize: 18,
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.border,
  },
  phoneInput: {
    flex: 1,
    fontSize: 17,
    fontWeight: '500',
    color: COLORS.text,
    letterSpacing: 1,
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
  
  // Trusted Device Info
  trustedDeviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  trustedDeviceText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.success,
    fontWeight: '500',
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
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonGradient: {
    height: 54,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  
  // Divider
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  orText: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginHorizontal: 12,
  },
  
  // Social Buttons
  socialButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 12,
    gap: 8,
  },
  socialButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  
  // Password Login
  passwordLoginLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  passwordLoginText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  
  // Terms
  terms: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
  },
  termsLink: {
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  
  // Helper Box - Hướng dẫn người dùng
  helperBox: {
    backgroundColor: COLORS.primaryLight,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  helperText: {
    fontSize: 13,
    color: COLORS.primary,
    textAlign: 'center',
    lineHeight: 18,
  },
  
  // Support Info
  supportInfo: {
    marginTop: 16,
    paddingVertical: 8,
  },
  supportText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
});
