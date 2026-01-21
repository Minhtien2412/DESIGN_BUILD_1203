/**
 * Enhanced Register Screen
 * ========================
 * 
 * Màn hình đăng ký nhiều bước với:
 * - Step 1: Nhập thông tin cơ bản
 * - Step 2: Xác thực OTP
 * - Step 3: Tạo mật khẩu
 * 
 * @author ThietKeResort Team
 * @created 2026-01-12
 */

import OTPInput from '@/components/auth/OTPInput';
import { useUnifiedAuth } from '@/context/UnifiedAuthContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
    View,
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
  success: '#10B981',
  
  // Social
  google: '#EA4335',
  facebook: '#1877F2',
};

// ==================== TYPES ====================

type RegisterStep = 1 | 2 | 3;

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  otpCode: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  otpCode?: string;
  password?: string;
  confirmPassword?: string;
  agreeTerms?: string;
  general?: string;
}

// ==================== COMPONENT ====================

export default function RegisterEnhancedScreen() {
  const router = useRouter();
  const {
    register,
    sendOTP,
    verifyOTP,
    isLoading,
    error: authError,
    clearError,
    otpTimer,
  } = useUnifiedAuth();

  // State
  const [step, setStep] = useState<RegisterStep>(1);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    otpCode: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const progressAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // ==================== EFFECTS ====================

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: step,
      friction: 10,
      tension: 40,
      useNativeDriver: false,
    }).start();
  }, [step]);

  useEffect(() => {
    if (authError) {
      setErrors({ general: authError });
      triggerShake();
    }
  }, [authError]);

  // ==================== VALIDATION ====================

  const validateStep1 = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ và tên';
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Họ tên phải có ít nhất 3 ký tự';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Email không hợp lệ';
      }
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else {
      const phoneClean = formData.phone.replace(/\D/g, '');
      if (phoneClean.length < 10 || phoneClean.length > 11) {
        newErrors.phone = 'Số điện thoại không hợp lệ';
      }
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'Bạn cần đồng ý với điều khoản sử dụng';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
    } else {
      // Strength check
      const hasUpper = /[A-Z]/.test(formData.password);
      const hasLower = /[a-z]/.test(formData.password);
      const hasNumber = /[0-9]/.test(formData.password);
      if (!hasUpper || !hasLower || !hasNumber) {
        newErrors.password = 'Mật khẩu phải có chữ hoa, chữ thường và số';
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
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

  const handleNextStep1 = async () => {
    if (!validateStep1()) {
      triggerShake();
      return;
    }

    try {
      setErrors({});
      clearError();

      // Send OTP to phone
      await sendOTP({
        recipient: formData.phone,
        channel: 'sms',
        purpose: 'register',
      });

      setStep(2);
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
        recipient: formData.phone,
        code,
        purpose: 'register',
      });

      setOtpVerified(true);
      setFormData((prev) => ({ ...prev, otpCode: code }));
      setStep(3);
    } catch (e: any) {
      setErrors({ general: e.message || 'Mã OTP không đúng' });
      triggerShake();
    }
  };

  const handleResendOTP = async () => {
    try {
      await sendOTP({
        recipient: formData.phone,
        channel: 'sms',
        purpose: 'register',
      });
    } catch (e: any) {
      setErrors({ general: e.message || 'Không thể gửi lại mã OTP' });
    }
  };

  const handleRegister = async () => {
    if (!validateStep3()) {
      triggerShake();
      return;
    }

    try {
      setErrors({});
      clearError();

      await register({
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        acceptTerms: true,
      });

      // Success - navigate
      router.replace('/(tabs)');
    } catch (e: any) {
      setErrors({ general: e.message || 'Đăng ký thất bại' });
      triggerShake();
    }
  };

  // ==================== PASSWORD STRENGTH ====================

  const getPasswordStrength = (): { level: number; color: string; text: string } => {
    const password = formData.password;
    if (!password) return { level: 0, color: COLORS.border, text: '' };

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { level: 1, color: COLORS.error, text: 'Yếu' };
    if (score <= 4) return { level: 2, color: COLORS.warning, text: 'Trung bình' };
    return { level: 3, color: COLORS.success, text: 'Mạnh' };
  };

  // ==================== RENDER ====================

  const renderProgress = () => {
    const progressWidth = progressAnim.interpolate({
      inputRange: [1, 2, 3],
      outputRange: ['33.33%', '66.66%', '100%'],
    });

    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
        </View>
        <View style={styles.progressSteps}>
          {[1, 2, 3].map((s) => (
            <View
              key={s}
              style={[
                styles.progressStep,
                s <= step && styles.progressStepActive,
                s < step && styles.progressStepComplete,
              ]}
            >
              {s < step ? (
                <Ionicons name="checkmark" size={14} color="#FFFFFF" />
              ) : (
                <Text
                  style={[
                    styles.progressStepText,
                    s <= step && styles.progressStepTextActive,
                  ]}
                >
                  {s}
                </Text>
              )}
            </View>
          ))}
        </View>
        <View style={styles.progressLabels}>
          <Text style={[styles.progressLabel, step >= 1 && styles.progressLabelActive]}>
            Thông tin
          </Text>
          <Text style={[styles.progressLabel, step >= 2 && styles.progressLabelActive]}>
            Xác thực
          </Text>
          <Text style={[styles.progressLabel, step >= 3 && styles.progressLabelActive]}>
            Mật khẩu
          </Text>
        </View>
      </View>
    );
  };

  const renderStep1 = () => (
    <Animated.View
      style={[
        styles.stepContainer,
        { transform: [{ translateX: shakeAnim }] },
      ]}
    >
      {/* Full Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Họ và tên</Text>
        <View
          style={[styles.inputWrapper, errors.fullName && styles.inputWrapperError]}
        >
          <Ionicons name="person" size={20} color={COLORS.textMuted} />
          <TextInput
            style={styles.input}
            placeholder="Nhập họ và tên"
            placeholderTextColor={COLORS.textMuted}
            value={formData.fullName}
            onChangeText={(text) => {
              setFormData((prev) => ({ ...prev, fullName: text }));
              if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
            }}
            autoCapitalize="words"
          />
        </View>
        {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
      </View>

      {/* Email */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Email</Text>
        <View style={[styles.inputWrapper, errors.email && styles.inputWrapperError]}>
          <Ionicons name="mail" size={20} color={COLORS.textMuted} />
          <TextInput
            style={styles.input}
            placeholder="Nhập email"
            placeholderTextColor={COLORS.textMuted}
            value={formData.email}
            onChangeText={(text) => {
              setFormData((prev) => ({ ...prev, email: text }));
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>

      {/* Phone */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Số điện thoại</Text>
        <View style={[styles.inputWrapper, errors.phone && styles.inputWrapperError]}>
          <Ionicons name="call" size={20} color={COLORS.textMuted} />
          <TextInput
            style={styles.input}
            placeholder="Nhập số điện thoại"
            placeholderTextColor={COLORS.textMuted}
            value={formData.phone}
            onChangeText={(text) => {
              setFormData((prev) => ({ ...prev, phone: text }));
              if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
            }}
            keyboardType="phone-pad"
          />
        </View>
        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
      </View>

      {/* Terms */}
      <TouchableOpacity
        style={styles.termsContainer}
        onPress={() =>
          setFormData((prev) => ({ ...prev, agreeTerms: !prev.agreeTerms }))
        }
      >
        <View
          style={[
            styles.checkbox,
            formData.agreeTerms && styles.checkboxChecked,
            errors.agreeTerms && styles.checkboxError,
          ]}
        >
          {formData.agreeTerms && (
            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
          )}
        </View>
        <Text style={styles.termsText}>
          Tôi đồng ý với{' '}
          <Text style={styles.termsLink}>Điều khoản sử dụng</Text> và{' '}
          <Text style={styles.termsLink}>Chính sách bảo mật</Text>
        </Text>
      </TouchableOpacity>
      {errors.agreeTerms && (
        <Text style={[styles.errorText, { marginTop: -8, marginBottom: 16 }]}>
          {errors.agreeTerms}
        </Text>
      )}

      {/* General Error */}
      {errors.general && (
        <View style={styles.generalError}>
          <Ionicons name="alert-circle" size={18} color={COLORS.error} />
          <Text style={styles.generalErrorText}>{errors.general}</Text>
        </View>
      )}

      {/* Next Button */}
      <TouchableOpacity
        style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}
        onPress={handleNextStep1}
        disabled={isLoading}
      >
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.primaryButtonGradient}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.primaryButtonText}>Tiếp tục</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>

      {/* Divider */}
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>hoặc đăng ký với</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Social Register */}
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
    </Animated.View>
  );

  const renderStep2 = () => (
    <Animated.View
      style={[
        styles.stepContainer,
        { transform: [{ translateX: shakeAnim }] },
      ]}
    >
      {/* Back */}
      <TouchableOpacity style={styles.backButton} onPress={() => setStep(1)}>
        <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        <Text style={styles.backButtonText}>Quay lại</Text>
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.otpHeader}>
        <View style={styles.otpIconContainer}>
          <Ionicons name="shield-checkmark" size={40} color={COLORS.primary} />
        </View>
        <Text style={styles.otpTitle}>Xác thực số điện thoại</Text>
        <Text style={styles.otpSubtitle}>
          Mã OTP đã được gửi đến{'\n'}
          <Text style={{ fontWeight: '600', color: COLORS.primary }}>
            {formData.phone}
          </Text>
        </Text>
      </View>

      {/* OTP Input */}
      <OTPInput
        length={6}
        value={formData.otpCode}
        onChange={(code) => setFormData((prev) => ({ ...prev, otpCode: code }))}
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
        style={[
          styles.primaryButton,
          (isLoading || formData.otpCode.length < 6) && styles.primaryButtonDisabled,
        ]}
        onPress={() => handleOTPVerify(formData.otpCode)}
        disabled={isLoading || formData.otpCode.length < 6}
      >
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.primaryButtonGradient}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.primaryButtonText}>Xác thực</Text>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderStep3 = () => {
    const strength = getPasswordStrength();

    return (
      <Animated.View
        style={[
          styles.stepContainer,
          { transform: [{ translateX: shakeAnim }] },
        ]}
      >
        {/* Back */}
        <TouchableOpacity style={styles.backButton} onPress={() => setStep(2)}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>

        {/* Verified Badge */}
        <View style={styles.verifiedBadge}>
          <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
          <Text style={styles.verifiedText}>Số điện thoại đã xác thực</Text>
        </View>

        {/* Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Mật khẩu</Text>
          <View
            style={[styles.inputWrapper, errors.password && styles.inputWrapperError]}
          >
            <Ionicons name="lock-closed" size={20} color={COLORS.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="Nhập mật khẩu (tối thiểu 8 ký tự)"
              placeholderTextColor={COLORS.textMuted}
              value={formData.password}
              onChangeText={(text) => {
                setFormData((prev) => ({ ...prev, password: text }));
                if (errors.password)
                  setErrors((prev) => ({ ...prev, password: undefined }));
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

          {/* Strength Indicator */}
          {formData.password.length > 0 && (
            <View style={styles.strengthContainer}>
              <View style={styles.strengthBars}>
                {[1, 2, 3].map((level) => (
                  <View
                    key={level}
                    style={[
                      styles.strengthBar,
                      level <= strength.level && { backgroundColor: strength.color },
                    ]}
                  />
                ))}
              </View>
              <Text style={[styles.strengthText, { color: strength.color }]}>
                {strength.text}
              </Text>
            </View>
          )}
        </View>

        {/* Confirm Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Xác nhận mật khẩu</Text>
          <View
            style={[
              styles.inputWrapper,
              errors.confirmPassword && styles.inputWrapperError,
            ]}
          >
            <Ionicons name="lock-closed" size={20} color={COLORS.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="Nhập lại mật khẩu"
              placeholderTextColor={COLORS.textMuted}
              value={formData.confirmPassword}
              onChangeText={(text) => {
                setFormData((prev) => ({ ...prev, confirmPassword: text }));
                if (errors.confirmPassword)
                  setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons
                name={showConfirmPassword ? 'eye-off' : 'eye'}
                size={20}
                color={COLORS.textMuted}
              />
            </TouchableOpacity>
          </View>
          {errors.confirmPassword && (
            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
          )}

          {/* Match indicator */}
          {formData.confirmPassword.length > 0 &&
            formData.password === formData.confirmPassword && (
              <View style={styles.matchIndicator}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                <Text style={styles.matchText}>Mật khẩu khớp</Text>
              </View>
            )}
        </View>

        {/* General Error */}
        {errors.general && (
          <View style={styles.generalError}>
            <Ionicons name="alert-circle" size={18} color={COLORS.error} />
            <Text style={styles.generalErrorText}>{errors.general}</Text>
          </View>
        )}

        {/* Register Button */}
        <TouchableOpacity
          style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}
          onPress={handleRegister}
          disabled={isLoading}
        >
          <LinearGradient
            colors={[COLORS.success, '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryButtonGradient}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.primaryButtonText}>Hoàn tất đăng ký</Text>
                <Ionicons name="checkmark-done" size={20} color="#FFFFFF" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

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
          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={styles.logoContainer}>
              <MaterialCommunityIcons name="home-city" size={40} color="#FFFFFF" />
            </View>
            <Text style={styles.appName}>Tạo tài khoản</Text>
            <Text style={styles.appTagline}>
              Đăng ký để trải nghiệm dịch vụ tốt nhất
            </Text>
          </Animated.View>
        </LinearGradient>

        {/* Form */}
        <View style={styles.formCard}>
          {/* Progress */}
          {renderProgress()}

          {/* Steps */}
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Đã có tài khoản? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.loginLink}>Đăng nhập ngay</Text>
            </TouchableOpacity>
          </View>
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
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 10,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  appTagline: {
    fontSize: 13,
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
    paddingTop: 24,
    paddingBottom: 24,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressTrack: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  progressSteps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -12,
    paddingHorizontal: 30,
  },
  progressStep: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressStepActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  progressStepComplete: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  progressStepText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  progressStepTextActive: {
    color: '#FFFFFF',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 8,
  },
  progressLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    width: 70,
  },
  progressLabelActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  stepContainer: {
    width: '100%',
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
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxError: {
    borderColor: COLORS.error,
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 20,
  },
  termsLink: {
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
  primaryButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 16,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  loginText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  // OTP Step
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  otpHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  otpIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  otpTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  otpSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 22,
  },
  // Password Step
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D1FAE5',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 20,
    gap: 8,
  },
  verifiedText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.success,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  strengthBars: {
    flexDirection: 'row',
    gap: 4,
  },
  strengthBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
  },
  matchIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  matchText: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: '500',
  },
});
