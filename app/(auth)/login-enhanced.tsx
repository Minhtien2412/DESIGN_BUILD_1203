/**
 * Enhanced Login Screen
 * =====================
 * 
 * Màn hình đăng nhập hiện đại với:
 * - Email/Phone + Password login
 * - OTP Login option
 * - Social login (Google, Facebook)
 * - Biometric authentication
 * - Remember me với biometric
 * 
 * @author ThietKeResort Team
 * @created 2026-01-12
 */

import OTPInput from '@/components/auth/OTPInput';
import { useUnifiedAuth } from '@/context/UnifiedAuthContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    Vibration,
    View
} from 'react-native';

const { width, height } = Dimensions.get('window');

// ==================== THEME ====================

const COLORS = {
  primary: '#0066CC',
  primaryDark: '#004499',
  primaryLight: '#E6F0FF',
  secondary: '#00C853',
  background: '#FFFFFF',
  surface: '#F8F9FA',
  text: '#1A1A1A',
  textMuted: '#6B7280',
  border: '#E5E7EB',
  error: '#DC2626',
  warning: '#F59E0B',
  
  // Social
  google: '#EA4335',
  facebook: '#1877F2',
  apple: '#000000',
};

// ==================== TYPES ====================

type LoginMode = 'password' | 'otp';
type AuthStep = 'input' | 'otp-verify';

interface FormData {
  emailOrPhone: string;
  password: string;
  rememberMe: boolean;
}

// ==================== COMPONENT ====================

export default function LoginEnhancedScreen() {
  const router = useRouter();
  const {
    login,
    sendOTP,
    verifyOTP,
    loginWithBiometric,
    isBiometricAvailable,
    isLoading,
    error: authError,
    clearError,
    otpTimer,
    setOtpTimer,
  } = useUnifiedAuth();

  // State
  const [loginMode, setLoginMode] = useState<LoginMode>('password');
  const [authStep, setAuthStep] = useState<AuthStep>('input');
  const [formData, setFormData] = useState<FormData>({
    emailOrPhone: '',
    password: '',
    rememberMe: true,
  });
  const [otpCode, setOtpCode] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState<'fingerprint' | 'faceid' | null>(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // ==================== EFFECTS ====================

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Check biometric
    checkBiometric();
  }, []);

  useEffect(() => {
    if (authError) {
      setErrors({ general: authError });
      triggerShake();
    }
  }, [authError]);

  // ==================== BIOMETRIC ====================

  const checkBiometric = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const available = await isBiometricAvailable();

      if (compatible && enrolled && available) {
        setBiometricEnabled(true);
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('faceid');
        } else {
          setBiometricType('fingerprint');
        }
      }
    } catch (e) {
      console.log('Biometric check error:', e);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      setErrors({});
      clearError();

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Đăng nhập bằng sinh trắc học',
        cancelLabel: 'Huỷ',
        disableDeviceFallback: false,
      });

      if (result.success) {
        await loginWithBiometric();
        router.replace('/(tabs)');
      }
    } catch (e: any) {
      setErrors({ general: e.message || 'Xác thực sinh trắc học thất bại' });
    }
  };

  // ==================== VALIDATION ====================

  const isPhone = (value: string): boolean => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.length >= 9 && /^\d+$/.test(cleaned);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.emailOrPhone.trim()) {
      newErrors.emailOrPhone = 'Vui lòng nhập Email hoặc Số điện thoại';
    } else if (isPhone(formData.emailOrPhone)) {
      const phone = formData.emailOrPhone.replace(/\D/g, '');
      if (phone.length < 10) {
        newErrors.emailOrPhone = 'Số điện thoại không hợp lệ';
      }
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.emailOrPhone)) {
        newErrors.emailOrPhone = 'Email không hợp lệ';
      }
    }

    if (loginMode === 'password') {
      if (!formData.password) {
        newErrors.password = 'Vui lòng nhập mật khẩu';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ==================== ANIMATIONS ====================

  const triggerShake = () => {
    Vibration.vibrate(100);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  // ==================== HANDLERS ====================

  const handlePasswordLogin = async () => {
    if (!validateForm()) {
      triggerShake();
      return;
    }

    try {
      setErrors({});
      clearError();

      await login({
        emailOrPhone: formData.emailOrPhone,
        password: formData.password,
        rememberMe: formData.rememberMe,
      });

      router.replace('/(tabs)');
    } catch (e: any) {
      setErrors({ general: e.message || 'Đăng nhập thất bại' });
      triggerShake();
    }
  };

  const handleOTPRequest = async () => {
    if (!formData.emailOrPhone.trim()) {
      setErrors({ emailOrPhone: 'Vui lòng nhập Email hoặc Số điện thoại' });
      triggerShake();
      return;
    }

    try {
      setErrors({});
      clearError();

      const channel = isPhone(formData.emailOrPhone) ? 'sms' : 'email';
      await sendOTP({
        recipient: formData.emailOrPhone,
        channel,
        purpose: 'login',
      });

      setAuthStep('otp-verify');
    } catch (e: any) {
      setErrors({ general: e.message || 'Không thể gửi mã OTP' });
      triggerShake();
    }
  };

  const handleOTPVerify = async (code: string) => {
    try {
      setErrors({});
      clearError();

      await verifyOTP({
        recipient: formData.emailOrPhone,
        code,
        purpose: 'login',
      });

      // OTP verified - login
      router.replace('/(tabs)');
    } catch (e: any) {
      setErrors({ general: e.message || 'Mã OTP không đúng' });
      triggerShake();
    }
  };

  const handleResendOTP = async () => {
    const channel = isPhone(formData.emailOrPhone) ? 'sms' : 'email';
    await sendOTP({
      recipient: formData.emailOrPhone,
      channel,
      purpose: 'login',
    });
  };

  // ==================== RENDER ====================

  const renderLoginForm = () => (
    <Animated.View
      style={[
        styles.formContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { translateX: shakeAnim }],
        },
      ]}
    >
      {/* Mode Tabs */}
      <View style={styles.modeTabs}>
        <TouchableOpacity
          style={[styles.modeTab, loginMode === 'password' && styles.modeTabActive]}
          onPress={() => setLoginMode('password')}
        >
          <Ionicons
            name="key"
            size={18}
            color={loginMode === 'password' ? COLORS.primary : COLORS.textMuted}
          />
          <Text
            style={[
              styles.modeTabText,
              loginMode === 'password' && styles.modeTabTextActive,
            ]}
          >
            Mật khẩu
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeTab, loginMode === 'otp' && styles.modeTabActive]}
          onPress={() => setLoginMode('otp')}
        >
          <Ionicons
            name="chatbox"
            size={18}
            color={loginMode === 'otp' ? COLORS.primary : COLORS.textMuted}
          />
          <Text
            style={[styles.modeTabText, loginMode === 'otp' && styles.modeTabTextActive]}
          >
            Mã OTP
          </Text>
        </TouchableOpacity>
      </View>

      {/* Email/Phone Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Email hoặc Số điện thoại</Text>
        <View
          style={[
            styles.inputWrapper,
            errors.emailOrPhone && styles.inputWrapperError,
          ]}
        >
          <Ionicons
            name={isPhone(formData.emailOrPhone) ? 'call' : 'mail'}
            size={20}
            color={COLORS.textMuted}
          />
          <TextInput
            style={styles.input}
            placeholder="Nhập email hoặc số điện thoại"
            placeholderTextColor={COLORS.textMuted}
            value={formData.emailOrPhone}
            onChangeText={(text) => {
              setFormData((prev) => ({ ...prev, emailOrPhone: text }));
              if (errors.emailOrPhone) setErrors((prev) => ({ ...prev, emailOrPhone: '' }));
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {formData.emailOrPhone.length > 0 && (
            <TouchableOpacity
              onPress={() => setFormData((prev) => ({ ...prev, emailOrPhone: '' }))}
            >
              <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        {errors.emailOrPhone && (
          <Text style={styles.errorText}>{errors.emailOrPhone}</Text>
        )}
      </View>

      {/* Password Input (only for password mode) */}
      {loginMode === 'password' && (
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Mật khẩu</Text>
          <View
            style={[styles.inputWrapper, errors.password && styles.inputWrapperError]}
          >
            <Ionicons name="lock-closed" size={20} color={COLORS.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="Nhập mật khẩu"
              placeholderTextColor={COLORS.textMuted}
              value={formData.password}
              onChangeText={(text) => {
                setFormData((prev) => ({ ...prev, password: text }));
                if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
              }}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color={COLORS.textMuted}
              />
            </TouchableOpacity>
          </View>
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
        </View>
      )}

      {/* Remember Me & Forgot Password */}
      {loginMode === 'password' && (
        <View style={styles.optionsRow}>
          <TouchableOpacity
            style={styles.rememberMe}
            onPress={() =>
              setFormData((prev) => ({ ...prev, rememberMe: !prev.rememberMe }))
            }
          >
            <View
              style={[
                styles.checkbox,
                formData.rememberMe && styles.checkboxChecked,
              ]}
            >
              {formData.rememberMe && (
                <Ionicons name="checkmark" size={14} color="#FFFFFF" />
              )}
            </View>
            <Text style={styles.rememberText}>Ghi nhớ đăng nhập</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
            <Text style={styles.forgotText}>Quên mật khẩu?</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* General Error */}
      {errors.general && (
        <View style={styles.generalError}>
          <Ionicons name="alert-circle" size={18} color={COLORS.error} />
          <Text style={styles.generalErrorText}>{errors.general}</Text>
        </View>
      )}

      {/* Login Button */}
      <TouchableOpacity
        style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
        onPress={loginMode === 'password' ? handlePasswordLogin : handleOTPRequest}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.loginButtonGradient}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.loginButtonText}>
                {loginMode === 'password' ? 'Đăng nhập' : 'Gửi mã OTP'}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>

      {/* Biometric Login */}
      {biometricEnabled && loginMode === 'password' && (
        <TouchableOpacity
          style={styles.biometricButton}
          onPress={handleBiometricLogin}
        >
          <Ionicons
            name={biometricType === 'faceid' ? 'scan' : 'finger-print'}
            size={24}
            color={COLORS.primary}
          />
          <Text style={styles.biometricText}>
            Đăng nhập bằng {biometricType === 'faceid' ? 'Face ID' : 'vân tay'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Divider */}
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>hoặc đăng nhập với</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Social Login */}
      <View style={styles.socialButtons}>
        <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#FEE2E2' }]}>
          <Ionicons name="logo-google" size={22} color={COLORS.google} />
          <Text style={[styles.socialButtonText, { color: COLORS.google }]}>
            Google
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#DBEAFE' }]}>
          <Ionicons name="logo-facebook" size={22} color={COLORS.facebook} />
          <Text style={[styles.socialButtonText, { color: COLORS.facebook }]}>
            Facebook
          </Text>
        </TouchableOpacity>
      </View>

      {/* Register Link */}
      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>Chưa có tài khoản? </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.registerLink}>Đăng ký ngay</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderOTPVerify = () => (
    <Animated.View
      style={[
        styles.formContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          setAuthStep('input');
          setOtpCode('');
        }}
      >
        <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        <Text style={styles.backButtonText}>Quay lại</Text>
      </TouchableOpacity>

      {/* OTP Header */}
      <View style={styles.otpHeader}>
        <Ionicons name="shield-checkmark" size={48} color={COLORS.primary} />
        <Text style={styles.otpTitle}>Xác thực OTP</Text>
        <Text style={styles.otpSubtitle}>
          Mã xác thực đã được gửi đến{'\n'}
          <Text style={{ fontWeight: '600', color: COLORS.primary }}>
            {formData.emailOrPhone}
          </Text>
        </Text>
      </View>

      {/* OTP Input */}
      <OTPInput
        length={6}
        value={otpCode}
        onChange={setOtpCode}
        onComplete={handleOTPVerify}
        onResend={handleResendOTP}
        timer={otpTimer}
        error={errors.general}
        disabled={isLoading}
        primaryColor={COLORS.primary}
        errorColor={COLORS.error}
      />

      {/* Verify Button */}
      <TouchableOpacity
        style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
        onPress={() => handleOTPVerify(otpCode)}
        disabled={isLoading || otpCode.length < 6}
      >
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.loginButtonGradient}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.loginButtonText}>Xác nhận</Text>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Animated.View style={{ transform: [{ scale: logoScale }] }}>
            <View style={styles.logoContainer}>
              <MaterialCommunityIcons name="home-city" size={48} color="#FFFFFF" />
            </View>
            <Text style={styles.appName}>ThietKeResort</Text>
            <Text style={styles.appTagline}>Xây dựng & Thiết kế chuyên nghiệp</Text>
          </Animated.View>
        </LinearGradient>

        {/* Form */}
        <View style={styles.formCard}>
          <Text style={styles.welcomeTitle}>Chào mừng trở lại!</Text>
          <Text style={styles.welcomeSubtitle}>
            Đăng nhập để tiếp tục sử dụng dịch vụ
          </Text>

          {authStep === 'input' ? renderLoginForm() : renderOTPVerify()}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 12,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  appTagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 4,
  },
  formCard: {
    flex: 1,
    backgroundColor: COLORS.background,
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  formContainer: {
    width: '100%',
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  modeTabActive: {
    backgroundColor: COLORS.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modeTabText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  modeTabTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    height: 52,
    gap: 12,
  },
  inputWrapperError: {
    borderColor: COLORS.error,
    backgroundColor: '#FEF2F2',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 6,
    marginLeft: 4,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  rememberText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  forgotText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  generalError: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    gap: 10,
  },
  generalErrorText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.error,
  },
  loginButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 16,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
    gap: 10,
    marginBottom: 24,
  },
  biometricText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginHorizontal: 16,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 10,
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  registerText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  // OTP Verify
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  otpHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  otpTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 16,
  },
  otpSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
});
