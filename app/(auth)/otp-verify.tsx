/**
 * Màn Hình Xác Thực OTP
 * ======================
 * 
 * 🔐 Xác thực danh tính bằng mã OTP
 * 
 * Hướng dẫn:
 * 1. Kiểm tra tin nhắn Zalo hoặc SMS để lấy mã OTP
 * 2. Nhập đủ 6 số vào ô bên dưới
 * 3. Hệ thống sẽ tự động xác thực sau khi nhập đủ
 * 4. Nếu không nhận được mã, nhấn "Gửi lại" sau 60 giây
 * 
 * 💡 Mẹo: Mã OTP có hiệu lực trong 5 phút
 * 
 * @author Design Build Team
 * @version 2.0.0
 * @created 2026-01-15
 */

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
    View,
} from 'react-native';

import { useAuth } from '@/context/AuthContext';

// Helper function to mask phone number for display
const maskPhone = (phone: string): string => {
  // Format phone first
  let formatted = phone.replace(/\s+/g, '');
  if (!formatted.startsWith('+')) {
    if (formatted.startsWith('84')) {
      formatted = '+' + formatted;
    } else if (formatted.startsWith('0')) {
      formatted = '+84' + formatted.substring(1);
    } else {
      formatted = '+84' + formatted;
    }
  }
  if (formatted.length < 9) return formatted;
  const prefix = formatted.slice(0, 6);
  const suffix = formatted.slice(-3);
  const masked = '*'.repeat(formatted.length - 9);
  return `${prefix}${masked}${suffix}`;
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const OTP_LENGTH = 6;

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
  background: '#F7F9FC',
  surface: '#FFFFFF',
  border: '#E2E8F0',
};

export default function OTPVerificationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { verifyOTP: authVerifyOTP, sendOTP: authSendOTP } = useAuth();
  
  const phone = (params.phone as string) || '';
  const mode = (params.mode as string) || 'login';
  const name = params.name as string | undefined;
  const email = params.email as string | undefined;
  const sessionId = params.sessionId as string | undefined;
  
  // State
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);
  
  // Refs
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  
  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);
  
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
  
  // Auto-focus first input
  useEffect(() => {
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 500);
  }, []);
  
  // Handle OTP input change
  const handleOtpChange = (value: string, index: number) => {
    if (error) setError(null);
    
    // Only allow digits
    const digit = value.replace(/[^0-9]/g, '').slice(-1);
    
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    
    // Haptic feedback
    if (digit) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Auto-advance to next input
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Auto-submit when complete
    if (digit && index === OTP_LENGTH - 1) {
      const completeOtp = newOtp.join('');
      if (completeOtp.length === OTP_LENGTH) {
        handleVerify(completeOtp);
      }
    }
  };
  
  // Handle backspace
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
    }
  };
  
  // Shake animation
  const triggerShake = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 15, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -15, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };
  
  // Verify OTP
  const handleVerify = async (otpCode?: string) => {
    const code = otpCode || otp.join('');
    
    if (code.length !== OTP_LENGTH) {
      setError('Vui lòng nhập đủ 6 số');
      triggerShake();
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Use AuthContext's verifyOTP which handles token saving and state update
      const result = await authVerifyOTP(phone, code, sessionId);
      
      if (!result.success) {
        setError(result.message);
        triggerShake();
        setOtp(Array(OTP_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
        return;
      }
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Navigate based on result
      if (result.isNewUser) {
        // New user - go to complete profile
        router.replace({
          pathname: '/(auth)/complete-profile' as any,
          params: {
            phone,
            userId: result.user?.id,
            name: name || '',
            email: email || '',
          },
        });
      } else {
        // Existing user - go to home
        router.replace('/(tabs)');
      }
      
    } catch (err) {
      console.error('[OTPVerify] Error:', err);
      setError('Có lỗi xảy ra. Vui lòng thử lại.');
      triggerShake();
    } finally {
      setLoading(false);
    }
  };
  
  // Resend OTP
  const handleResend = async () => {
    if (!canResend || resending) return;
    
    try {
      setResending(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Use AuthContext's sendOTP
      const result = await authSendOTP(phone, 'sms');
      
      if (result.success) {
        setCountdown(60);
        setCanResend(false);
        setOtp(Array(OTP_LENGTH).fill(''));
        setError(null);
        inputRefs.current[0]?.focus();
        
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Không thể gửi lại mã OTP');
    } finally {
      setResending(false);
    }
  };
  
  // Format countdown
  const formatCountdown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
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
        style={styles.content}
      >
        {/* Back Button */}
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        
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
          <View style={styles.iconContainer}>
            <Ionicons name="shield-checkmark" size={48} color="#fff" />
          </View>
          <Text style={styles.title}>Xác thực bảo mật</Text>
          <Text style={styles.subtitle}>
            Chúng tôi đã gửi mã xác thực 6 số đến{'\n'}
            <Text style={styles.phoneText}>{maskPhone(phone)}</Text>{'\n'}
            qua Zalo hoặc SMS
          </Text>
        </Animated.View>
        
        {/* OTP Inputs */}
        <Animated.View 
          style={[
            styles.otpContainer,
            { transform: [{ translateX: shakeAnim }] }
          ]}
        >
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => { inputRefs.current[index] = ref; }}
              style={[
                styles.otpInput,
                digit ? styles.otpInputFilled : null,
                error ? styles.otpInputError : null,
              ]}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              editable={!loading}
            />
          ))}
        </Animated.View>
        
        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={18} color={COLORS.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        {/* Countdown & Resend */}
        <View style={styles.resendContainer}>
          {canResend ? (
            <Pressable 
              onPress={handleResend}
              disabled={resending}
              style={styles.resendButton}
            >
              {resending ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <>
                  <Ionicons name="refresh" size={18} color={COLORS.primary} />
                  <Text style={styles.resendText}>Gửi lại mã</Text>
                </>
              )}
            </Pressable>
          ) : (
            <Text style={styles.countdownText}>
              Gửi lại mã sau <Text style={styles.countdownNumber}>{formatCountdown(countdown)}</Text>
            </Text>
          )}
        </View>
        
        {/* Verify Button */}
        <Pressable
          style={[styles.verifyButton, loading && styles.buttonDisabled]}
          onPress={() => handleVerify()}
          disabled={loading || otp.join('').length !== OTP_LENGTH}
        >
          <LinearGradient
            colors={loading ? ['#ccc', '#aaa'] : [COLORS.primary, COLORS.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.verifyButtonGradient}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.verifyButtonText}>Xác nhận</Text>
            )}
          </LinearGradient>
        </Pressable>
        
        {/* Change Phone */}
        <Pressable 
          style={styles.changePhoneButton}
          onPress={() => router.back()}
        >
          <Text style={styles.changePhoneText}>Đổi số điện thoại khác</Text>
        </Pressable>
        
        {/* Help */}
        <Text style={styles.helpText}>
          Không nhận được mã?{' '}
          <Text style={styles.helpLink}>Liên hệ hỗ trợ</Text>
        </Text>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  
  // Back Button
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  
  // Header
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  phoneText: {
    fontWeight: '700',
    fontSize: 16,
  },
  
  // OTP Inputs
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  otpInput: {
    width: (SCREEN_WIDTH - 48 - 50) / 6,
    height: 56,
    backgroundColor: '#fff',
    borderRadius: 14,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: COLORS.text,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  otpInputFilled: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  otpInputError: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.errorLight,
  },
  
  // Error
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.error,
    fontWeight: '500',
  },
  
  // Resend
  resendContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 20,
  },
  resendText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  countdownText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  countdownNumber: {
    fontWeight: '700',
    color: '#fff',
  },
  
  // Verify Button
  verifyButton: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  verifyButtonGradient: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  
  // Change Phone
  changePhoneButton: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  changePhoneText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textDecorationLine: 'underline',
  },
  
  // Help
  helpText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: 24,
  },
  helpLink: {
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
