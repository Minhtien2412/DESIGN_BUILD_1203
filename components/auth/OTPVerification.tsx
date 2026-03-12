/**
 * OTP Verification Component
 * ==========================
 * 
 * Component nhập và xác thực OTP với auto-focus, countdown timer.
 * Tích hợp với OTP Service.
 * 
 * @author ThietKeResort Team
 * @created 2025-01-12
 */

import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    Vibration,
    View,
} from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import {
    canSendOTP,
    maskEmail,
    maskPhoneNumber,
    sendOTP,
    verifyOTP,
    type OTPChannel
} from '../../services/otpService';

// ============================================
// Types
// ============================================
interface OTPVerificationProps {
  /** Phone number or email to send OTP to */
  recipient: string;
  /** OTP channel (sms, email, call) */
  channel?: OTPChannel;
  /** Number of OTP digits */
  length?: number;
  /** Countdown time in seconds */
  resendTimeout?: number;
  /** Auto send OTP on mount */
  autoSend?: boolean;
  /** Custom title */
  title?: string;
  /** Custom subtitle */
  subtitle?: string;
  /** On successful verification */
  onVerified?: (code: string) => void;
  /** On verification error */
  onError?: (error: string) => void;
  /** On back press */
  onBack?: () => void;
  /** Custom style */
  style?: any;
}

// ============================================
// Main Component
// ============================================
export function OTPVerification({
  recipient,
  channel = 'sms',
  length = 6,
  resendTimeout = 60,
  autoSend = true,
  title,
  subtitle,
  onVerified,
  onError,
  onBack,
  style,
}: OTPVerificationProps) {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [sent, setSent] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  
  // Theme
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'tint');
  const secondaryText = useThemeColor({}, 'tabIconDefault');
  const errorColor = '#ef4444';
  const successColor = '#22c55e';

  // Masked recipient
  const maskedRecipient = channel === 'email' 
    ? maskEmail(recipient) 
    : maskPhoneNumber(recipient);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  // Auto send OTP on mount
  useEffect(() => {
    if (autoSend) {
      handleSendOTP();
    }
  }, [autoSend]);

  // Shake animation for error
  const shake = useCallback(() => {
    Vibration.vibrate(100);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  // Send OTP
  const handleSendOTP = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check rate limit
      const { allowed, waitSeconds } = canSendOTP(recipient);
      if (!allowed && waitSeconds) {
        setCountdown(waitSeconds);
        setError(`Vui lòng đợi ${waitSeconds} giây`);
        return;
      }
      
      const result = await sendOTP({
        recipient,
        channel,
        locale: 'vi',
      });
      
      if (result.success) {
        setSent(true);
        setRequestId(result.requestId);
        setCountdown(resendTimeout);
        
        // Focus first input
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 100);
      } else {
        setError(result.message);
        onError?.(result.message);
      }
    } catch (err: any) {
      const message = err.message || 'Không thể gửi mã OTP';
      setError(message);
      onError?.(message);
    } finally {
      setLoading(false);
    }
  }, [recipient, channel, resendTimeout, onError]);

  // Handle input change
  const handleChange = useCallback((text: string, index: number) => {
    // Only allow numbers
    const digit = text.replace(/[^0-9]/g, '');
    
    if (digit.length > 1) {
      // Paste handling
      const digits = digit.slice(0, length).split('');
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        if (index + i < length) {
          newOtp[index + i] = d;
        }
      });
      setOtp(newOtp);
      
      // Focus last filled or next empty
      const nextIndex = Math.min(index + digits.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
      
      // Auto verify if complete
      if (newOtp.every((d) => d !== '')) {
        handleVerify(newOtp.join(''));
      }
      return;
    }
    
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setError(null);
    
    // Auto focus next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Auto verify if complete
    if (digit && index === length - 1 && newOtp.every((d) => d !== '')) {
      handleVerify(newOtp.join(''));
    }
  }, [otp, length]);

  // Handle backspace
  const handleKeyPress = useCallback((e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      inputRefs.current[index - 1]?.focus();
    }
  }, [otp]);

  // Verify OTP
  const handleVerify = useCallback(async (code?: string) => {
    const otpCode = code || otp.join('');
    
    if (otpCode.length !== length) {
      setError(`Vui lòng nhập đủ ${length} số`);
      shake();
      return;
    }
    
    try {
      setVerifying(true);
      setError(null);
      
      const result = await verifyOTP({
        recipient,
        code: otpCode,
        requestId: requestId || undefined,
      });
      
      if (result.valid) {
        onVerified?.(otpCode);
      } else {
        setError(result.message);
        shake();
        
        // Clear OTP on error
        setOtp(new Array(length).fill(''));
        inputRefs.current[0]?.focus();
      }
    } catch (err: any) {
      const message = err.message || 'Có lỗi xảy ra';
      setError(message);
      shake();
      onError?.(message);
    } finally {
      setVerifying(false);
    }
  }, [otp, length, recipient, requestId, onVerified, onError, shake]);

  // Resend OTP
  const handleResend = useCallback(async () => {
    if (countdown > 0) return;
    
    setOtp(new Array(length).fill(''));
    setError(null);
    await handleSendOTP();
  }, [countdown, length, handleSendOTP]);

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor }, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      {onBack && (
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
      )}

      {/* Icon */}
      <View style={[styles.iconContainer, { backgroundColor: `${primaryColor}20` }]}>
        <Ionicons 
          name={channel === 'email' ? 'mail-outline' : 'chatbubble-outline'} 
          size={40} 
          color={primaryColor} 
        />
      </View>

      {/* Title */}
      <Text style={[styles.title, { color: textColor }]}>
        {title || 'Xác thực OTP'}
      </Text>
      
      <Text style={[styles.subtitle, { color: secondaryText }]}>
        {subtitle || `Mã xác thực đã được gửi đến ${maskedRecipient}`}
      </Text>

      {/* OTP Input */}
      <Animated.View 
        style={[styles.otpContainer, { transform: [{ translateX: shakeAnim }] }]}
      >
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => { inputRefs.current[index] = ref; }}
            style={[
              styles.otpInput,
              { 
                backgroundColor: cardColor,
                borderColor: error ? errorColor : digit ? primaryColor : '#e5e7eb',
                color: textColor,
              },
            ]}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
            editable={!verifying}
          />
        ))}
      </Animated.View>

      {/* Error message */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={16} color={errorColor} />
          <Text style={[styles.errorText, { color: errorColor }]}>{error}</Text>
        </View>
      )}

      {/* Verify Button */}
      <TouchableOpacity
        style={[
          styles.verifyButton,
          { backgroundColor: primaryColor },
          (verifying || otp.some((d) => !d)) && styles.buttonDisabled,
        ]}
        onPress={() => handleVerify()}
        disabled={verifying || otp.some((d) => !d)}
      >
        {verifying ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.verifyButtonText}>Xác nhận</Text>
        )}
      </TouchableOpacity>

      {/* Resend */}
      <View style={styles.resendContainer}>
        <Text style={[styles.resendText, { color: secondaryText }]}>
          Chưa nhận được mã?
        </Text>
        {countdown > 0 ? (
          <Text style={[styles.countdown, { color: secondaryText }]}>
            Gửi lại sau {countdown}s
          </Text>
        ) : loading ? (
          <ActivityIndicator size="small" color={primaryColor} />
        ) : (
          <TouchableOpacity onPress={handleResend}>
            <Text style={[styles.resendLink, { color: primaryColor }]}>
              Gửi lại mã
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Change method */}
      {channel === 'sms' && (
        <TouchableOpacity 
          style={styles.changeMethod}
          onPress={() => {
            // Could trigger callback to change to email
          }}
        >
          <Text style={[styles.changeMethodText, { color: secondaryText }]}>
            Thử phương thức khác?
          </Text>
        </TouchableOpacity>
      )}
    </KeyboardAvoidingView>
  );
}

// ============================================
// Styles
// ============================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 16,
    padding: 8,
    zIndex: 1,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  otpContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 24,
  },
  errorText: {
    fontSize: 13,
  },
  verifyButton: {
    width: '100%',
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resendText: {
    fontSize: 14,
  },
  countdown: {
    fontSize: 14,
    fontWeight: '600',
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  changeMethod: {
    marginTop: 24,
    padding: 8,
  },
  changeMethodText: {
    fontSize: 13,
    textDecorationLine: 'underline',
  },
});

export default OTPVerification;
