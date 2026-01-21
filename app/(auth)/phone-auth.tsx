/**
 * Xác Thực Số Điện Thoại
 * ======================
 * 
 * 📱 Đăng nhập/Đăng ký nhanh bằng OTP
 * 
 * Quy trình:
 * 1. Nhập số điện thoại → Nhận mã OTP qua Zalo/SMS
 * 2. Nhập mã OTP 6 số → Xác thực tự động
 * 3. Hoàn tất → Vào ứng dụng
 * 
 * @author Design Build Team
 * @version 2.0.0
 * @created 2026-01-15
 */

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';

import { useAuth } from '@/context/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const OTP_LENGTH = 6;

// Colors
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
};

type Step = 'phone' | 'otp' | 'profile';

// Helper: format phone for display
const formatPhoneDisplay = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 4) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 10)}`;
};

// Helper: validate Vietnamese phone
const isValidPhone = (phone: string): boolean => {
  const digits = phone.replace(/\D/g, '');
  if (digits.length !== 10) return false;
  return /^0(3|5|7|8|9)[0-9]{8}$/.test(digits);
};

// Helper: mask phone for display
const maskPhone = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 6) return phone;
  return `${digits.slice(0, 4)}***${digits.slice(-3)}`;
};

export default function PhoneAuthScreen() {
  const router = useRouter();
  const { sendOTP, verifyOTP, registerWithPhone, isAuthenticated } = useAuth();

  // Step management
  const [step, setStep] = useState<Step>('phone');
  
  // Phone step state
  const [phone, setPhone] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  // OTP step state
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [countdown, setCountdown] = useState(0);
  
  // Profile step state (for new users)
  const [isNewUser, setIsNewUser] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  // Common state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs
  const otpRefs = useRef<(TextInput | null)[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  // Entrance animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [step]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Shake animation for errors
  const triggerShake = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  // ==================== PHONE STEP ====================
  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 10) {
      setPhone(digits);
      if (error) setError(null);
    }
  };

  const handleSendOTP = async () => {
    if (!phone) {
      setError('Vui lòng nhập số điện thoại');
      triggerShake();
      return;
    }
    
    if (!isValidPhone(phone)) {
      setError('Số điện thoại không hợp lệ');
      triggerShake();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const result = await sendOTP(phone, 'sms');

      if (!result.success) {
        setError(result.message);
        triggerShake();
        return;
      }

      // Success - move to OTP step
      setSessionId(result.sessionId || null);
      setCountdown(60);
      setStep('otp');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Focus first OTP input
      setTimeout(() => otpRefs.current[0]?.focus(), 300);
      
    } catch (err: any) {
      console.error('[PhoneAuth] Send OTP error:', err);
      setError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  // ==================== OTP STEP ====================
  const handleOtpChange = (value: string, index: number) => {
    if (error) setError(null);
    
    const digit = value.replace(/[^0-9]/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Auto-advance
      if (index < OTP_LENGTH - 1) {
        otpRefs.current[index + 1]?.focus();
      }
      
      // Auto-submit when complete
      if (index === OTP_LENGTH - 1) {
        const completeOtp = newOtp.join('');
        if (completeOtp.length === OTP_LENGTH) {
          handleVerifyOTP(completeOtp);
        }
      }
    }
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
    }
  };

  const handleVerifyOTP = async (otpCode?: string) => {
    const code = otpCode || otp.join('');
    
    if (code.length !== OTP_LENGTH) {
      setError('Vui lòng nhập đủ 6 số');
      triggerShake();
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await verifyOTP(phone, code, sessionId || undefined);

      if (!result.success) {
        setError(result.message);
        triggerShake();
        setOtp(Array(OTP_LENGTH).fill(''));
        otpRefs.current[0]?.focus();
        return;
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Check if new user needs profile completion
      if (result.isNewUser) {
        setIsNewUser(true);
        setStep('profile');
      } else {
        // Existing user - go to home
        router.replace('/(tabs)');
      }
      
    } catch (err: any) {
      console.error('[PhoneAuth] Verify OTP error:', err);
      setError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    try {
      setLoading(true);
      const result = await sendOTP(phone, 'sms');
      
      if (result.success) {
        setSessionId(result.sessionId || null);
        setCountdown(60);
        setOtp(Array(OTP_LENGTH).fill(''));
        setError(null);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError('Không thể gửi lại mã OTP');
    } finally {
      setLoading(false);
    }
  };

  // ==================== PROFILE STEP ====================
  const handleCompleteProfile = async () => {
    if (!name.trim()) {
      setError('Vui lòng nhập họ tên');
      triggerShake();
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await registerWithPhone(phone, name.trim(), email.trim() || undefined);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
      
    } catch (err: any) {
      console.error('[PhoneAuth] Register error:', err);
      setError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  // ==================== RENDER ====================
  const renderPhoneStep = () => (
    <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateX: shakeAnim }] }]}>
      <View style={styles.iconContainer}>
        <Ionicons name="phone-portrait-outline" size={48} color={COLORS.primary} />
      </View>
      
      <Text style={styles.title}>Đăng nhập / Đăng ký</Text>
      <Text style={styles.subtitle}>
        Nhập số điện thoại để nhận mã xác thực OTP
      </Text>

      {/* Phone Input */}
      <View style={styles.inputContainer}>
        <View style={styles.countryCode}>
          <Text style={styles.countryCodeText}>🇻🇳 +84</Text>
        </View>
        <TextInput
          style={styles.phoneInput}
          value={formatPhoneDisplay(phone)}
          onChangeText={handlePhoneChange}
          placeholder="912 345 678"
          placeholderTextColor={COLORS.textMuted}
          keyboardType="phone-pad"
          maxLength={12}
          editable={!loading}
        />
      </View>

      {/* Error */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={16} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Submit Button */}
      <Pressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSendOTP}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Tiếp tục</Text>
        )}
      </Pressable>

      {/* Email Login Link */}
      <Pressable
        style={styles.linkButton}
        onPress={() => router.push('/(auth)/login')}
      >
        <Text style={styles.linkText}>Đăng nhập bằng Email</Text>
      </Pressable>
    </Animated.View>
  );

  const renderOtpStep = () => (
    <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateX: shakeAnim }] }]}>
      <View style={styles.iconContainer}>
        <Ionicons name="shield-checkmark-outline" size={48} color={COLORS.primary} />
      </View>
      
      <Text style={styles.title}>Xác thực OTP</Text>
      <Text style={styles.subtitle}>
        Nhập mã 6 số đã gửi đến{'\n'}
        <Text style={styles.phoneHighlight}>{maskPhone(phone)}</Text>
      </Text>

      {/* OTP Inputs */}
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => { otpRefs.current[index] = ref; }}
            style={[
              styles.otpInput,
              digit && styles.otpInputFilled,
              error && styles.otpInputError,
            ]}
            value={digit}
            onChangeText={(value) => handleOtpChange(value, index)}
            onKeyPress={(e) => handleOtpKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
            editable={!loading}
          />
        ))}
      </View>

      {/* Error */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={16} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Resend */}
      <View style={styles.resendContainer}>
        {countdown > 0 ? (
          <Text style={styles.countdownText}>Gửi lại sau {countdown}s</Text>
        ) : (
          <Pressable onPress={handleResendOTP} disabled={loading}>
            <Text style={styles.resendText}>Gửi lại mã</Text>
          </Pressable>
        )}
      </View>

      {/* Submit Button */}
      <Pressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={() => handleVerifyOTP()}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Xác nhận</Text>
        )}
      </Pressable>

      {/* Back Button */}
      <Pressable style={styles.linkButton} onPress={() => setStep('phone')}>
        <Text style={styles.linkText}>← Đổi số điện thoại</Text>
      </Pressable>
    </Animated.View>
  );

  const renderProfileStep = () => (
    <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateX: shakeAnim }] }]}>
      <View style={styles.iconContainer}>
        <Ionicons name="person-add-outline" size={48} color={COLORS.primary} />
      </View>
      
      <Text style={styles.title}>Hoàn tất đăng ký</Text>
      <Text style={styles.subtitle}>
        Nhập thông tin để hoàn tất tài khoản
      </Text>

      {/* Name Input */}
      <View style={styles.inputWrapper}>
        <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={styles.textInput}
          value={name}
          onChangeText={setName}
          placeholder="Họ và tên *"
          placeholderTextColor={COLORS.textMuted}
          editable={!loading}
        />
      </View>

      {/* Email Input (optional) */}
      <View style={styles.inputWrapper}>
        <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={styles.textInput}
          value={email}
          onChangeText={setEmail}
          placeholder="Email (không bắt buộc)"
          placeholderTextColor={COLORS.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />
      </View>

      {/* Error */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={16} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Submit Button */}
      <Pressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleCompleteProfile}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Hoàn tất</Text>
        )}
      </Pressable>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        {/* Back Button */}
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>

        {/* Step Indicator */}
        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, step === 'phone' && styles.stepDotActive]} />
          <View style={[styles.stepLine, step !== 'phone' && styles.stepLineActive]} />
          <View style={[styles.stepDot, step === 'otp' && styles.stepDotActive]} />
          <View style={[styles.stepLine, step === 'profile' && styles.stepLineActive]} />
          <View style={[styles.stepDot, step === 'profile' && styles.stepDotActive]} />
        </View>

        {/* Content */}
        {step === 'phone' && renderPhoneStep()}
        {step === 'otp' && renderOtpStep()}
        {step === 'profile' && renderProfileStep()}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  stepDotActive: {
    backgroundColor: '#fff',
    transform: [{ scale: 1.2 }],
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 5,
  },
  stepLineActive: {
    backgroundColor: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  phoneHighlight: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    overflow: 'hidden',
  },
  countryCode: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
    backgroundColor: '#fff',
  },
  countryCodeText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 18,
    color: COLORS.text,
    letterSpacing: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: COLORS.text,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  otpInput: {
    width: (SCREEN_WIDTH - 88) / 6 - 8,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: COLORS.text,
  },
  otpInputFilled: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  otpInputError: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.errorLight,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.errorLight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  countdownText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  resendText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  linkText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },
});
