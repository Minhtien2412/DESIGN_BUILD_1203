/**
 * Enhanced Forgot Password Screen
 * ================================
 * 
 * Màn hình quên mật khẩu với:
 * - Step 1: Nhập email/phone
 * - Step 2: Xác thực OTP
 * - Step 3: Đặt mật khẩu mới
 * - Step 4: Hoàn thành
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
};

// ==================== TYPES ====================

type ResetStep = 1 | 2 | 3 | 4;

interface FormData {
  emailOrPhone: string;
  otpCode: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  emailOrPhone?: string;
  otpCode?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

// ==================== COMPONENT ====================

export default function ForgotPasswordEnhancedScreen() {
  const router = useRouter();
  const {
    sendOTP,
    verifyOTP,
    resetPassword,
    isLoading,
    error: authError,
    clearError,
    otpTimer,
  } = useUnifiedAuth();

  // State
  const [step, setStep] = useState<ResetStep>(1);
  const [formData, setFormData] = useState<FormData>({
    emailOrPhone: '',
    otpCode: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetToken, setResetToken] = useState<string>('');

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const progressAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0)).current;

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
    if (step === 4) {
      Animated.spring(successScale, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
  }, [step]);

  useEffect(() => {
    if (authError) {
      setErrors({ general: authError });
      triggerShake();
    }
  }, [authError]);

  // ==================== HELPERS ====================

  const isPhone = (value: string): boolean => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.length >= 9 && /^\d+$/.test(cleaned);
  };

  const triggerShake = () => {
    Vibration.vibrate(100);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

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

  // ==================== VALIDATION ====================

  const validateStep1 = (): boolean => {
    const newErrors: FormErrors = {};

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu mới';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
    } else {
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

  // ==================== HANDLERS ====================

  const handleSendOTP = async () => {
    if (!validateStep1()) {
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
        purpose: 'reset-password',
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
        recipient: formData.emailOrPhone,
        code,
        purpose: 'reset-password',
      });

      // OTP verified, store the code as token
      setResetToken(code);

      setFormData((prev) => ({ ...prev, otpCode: code }));
      setStep(3);
    } catch (e: any) {
      setErrors({ general: e.message || 'Mã OTP không đúng' });
      triggerShake();
    }
  };

  const handleResendOTP = async () => {
    try {
      const channel = isPhone(formData.emailOrPhone) ? 'sms' : 'email';
      await sendOTP({
        recipient: formData.emailOrPhone,
        channel,
        purpose: 'reset-password',
      });
    } catch (e: any) {
      setErrors({ general: e.message || 'Không thể gửi lại mã OTP' });
    }
  };

  const handleResetPassword = async () => {
    if (!validateStep3()) {
      triggerShake();
      return;
    }

    try {
      setErrors({});
      clearError();

      await resetPassword(
        formData.emailOrPhone,
        resetToken || formData.otpCode,
        formData.password
      );

      setStep(4);
    } catch (e: any) {
      setErrors({ general: e.message || 'Không thể đặt lại mật khẩu' });
      triggerShake();
    }
  };

  // ==================== RENDER ====================

  const renderProgress = () => {
    if (step === 4) return null;

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
            Xác định
          </Text>
          <Text style={[styles.progressLabel, step >= 2 && styles.progressLabelActive]}>
            Xác thực
          </Text>
          <Text style={[styles.progressLabel, step >= 3 && styles.progressLabelActive]}>
            Đổi mật khẩu
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
      {/* Header Icon */}
      <View style={styles.stepHeader}>
        <View style={styles.stepIconContainer}>
          <Ionicons name="key" size={40} color={COLORS.primary} />
        </View>
        <Text style={styles.stepTitle}>Quên mật khẩu?</Text>
        <Text style={styles.stepSubtitle}>
          Nhập email hoặc số điện thoại đã đăng ký để nhận mã xác thực
        </Text>
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
              if (errors.emailOrPhone)
                setErrors((prev) => ({ ...prev, emailOrPhone: undefined }));
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

      {/* General Error */}
      {errors.general && (
        <View style={styles.generalError}>
          <Ionicons name="alert-circle" size={18} color={COLORS.error} />
          <Text style={styles.generalErrorText}>{errors.general}</Text>
        </View>
      )}

      {/* Send OTP Button */}
      <TouchableOpacity
        style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}
        onPress={handleSendOTP}
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
              <Text style={styles.primaryButtonText}>Gửi mã xác thực</Text>
              <Ionicons name="paper-plane" size={20} color="#FFFFFF" />
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>

      {/* Back to Login */}
      <TouchableOpacity
        style={styles.backToLogin}
        onPress={() => router.push('/(auth)/login')}
      >
        <Ionicons name="arrow-back" size={18} color={COLORS.primary} />
        <Text style={styles.backToLoginText}>Quay lại đăng nhập</Text>
      </TouchableOpacity>
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
      <View style={styles.stepHeader}>
        <View style={styles.stepIconContainer}>
          <Ionicons name="shield-checkmark" size={40} color={COLORS.primary} />
        </View>
        <Text style={styles.stepTitle}>Nhập mã xác thực</Text>
        <Text style={styles.stepSubtitle}>
          Mã OTP đã được gửi đến{'\n'}
          <Text style={{ fontWeight: '600', color: COLORS.primary }}>
            {formData.emailOrPhone}
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

        {/* Header */}
        <View style={styles.stepHeader}>
          <View style={styles.stepIconContainer}>
            <Ionicons name="lock-closed" size={40} color={COLORS.primary} />
          </View>
          <Text style={styles.stepTitle}>Tạo mật khẩu mới</Text>
          <Text style={styles.stepSubtitle}>
            Đặt mật khẩu mới cho tài khoản của bạn
          </Text>
        </View>

        {/* Verified Badge */}
        <View style={styles.verifiedBadge}>
          <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
          <Text style={styles.verifiedText}>Đã xác thực thành công</Text>
        </View>

        {/* New Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Mật khẩu mới</Text>
          <View
            style={[styles.inputWrapper, errors.password && styles.inputWrapperError]}
          >
            <Ionicons name="lock-closed" size={20} color={COLORS.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="Nhập mật khẩu mới (tối thiểu 8 ký tự)"
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

        {/* Reset Button */}
        <TouchableOpacity
          style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}
          onPress={handleResetPassword}
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
                <Text style={styles.primaryButtonText}>Đặt lại mật khẩu</Text>
                <Ionicons name="checkmark-done" size={20} color="#FFFFFF" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderStep4 = () => (
    <Animated.View style={[styles.stepContainer, styles.successContainer]}>
      {/* Success Animation */}
      <Animated.View
        style={[
          styles.successIconContainer,
          { transform: [{ scale: successScale }] },
        ]}
      >
        <LinearGradient
          colors={[COLORS.success, '#059669']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.successIconGradient}
        >
          <Ionicons name="checkmark" size={48} color="#FFFFFF" />
        </LinearGradient>
      </Animated.View>

      <Text style={styles.successTitle}>Thành công!</Text>
      <Text style={styles.successSubtitle}>
        Mật khẩu của bạn đã được đặt lại thành công.{'\n'}
        Bây giờ bạn có thể đăng nhập với mật khẩu mới.
      </Text>

      {/* Login Button */}
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => router.replace('/(auth)/login')}
      >
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.primaryButtonGradient}
        >
          <Text style={styles.primaryButtonText}>Đăng nhập ngay</Text>
          <Ionicons name="log-in" size={20} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Tips */}
      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>💡 Mẹo bảo mật:</Text>
        <Text style={styles.tipsText}>
          • Sử dụng mật khẩu duy nhất cho mỗi tài khoản{'\n'}
          • Bật xác thực 2 yếu tố (2FA) nếu có thể{'\n'}
          • Không chia sẻ mật khẩu với người khác
        </Text>
      </View>
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
          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={styles.logoContainer}>
              <MaterialCommunityIcons name="home-city" size={36} color="#FFFFFF" />
            </View>
            <Text style={styles.appName}>ThietKeResort</Text>
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
          {step === 4 && renderStep4()}
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
    paddingBottom: 25,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  logoContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 8,
  },
  appName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
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
    paddingHorizontal: 4,
  },
  progressLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    width: 80,
  },
  progressLabelActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  stepContainer: {
    width: '100%',
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  stepIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
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
  backToLogin: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  backToLoginText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },
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
  // Success
  successContainer: {
    alignItems: 'center',
    paddingTop: 40,
  },
  successIconContainer: {
    marginBottom: 24,
  },
  successIconGradient: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.success,
    marginBottom: 12,
  },
  successSubtitle: {
    fontSize: 15,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  tipsContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginTop: 24,
    width: '100%',
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 22,
  },
});
