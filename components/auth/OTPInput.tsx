/**
 * OTP Input Component
 * ===================
 * 
 * Component nhập mã OTP với:
 * - Auto focus next input
 * - Backspace to previous
 * - Paste support
 * - Timer countdown
 * - Resend button
 * 
 * @author ThietKeResort Team
 * @created 2026-01-12
 */

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Clipboard,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';

// ==================== TYPES ====================

interface OTPInputProps {
  length?: number;
  value?: string;
  onChange?: (value: string) => void;
  onComplete?: (code: string) => void;
  onResend?: () => void;
  timer?: number;
  error?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  
  // Styling
  containerStyle?: ViewStyle;
  inputStyle?: ViewStyle;
  primaryColor?: string;
  errorColor?: string;
  textColor?: string;
  backgroundColor?: string;
}

// ==================== COMPONENT ====================

export default function OTPInput({
  length = 6,
  value = '',
  onChange,
  onComplete,
  onResend,
  timer = 0,
  error,
  disabled = false,
  autoFocus = true,
  containerStyle,
  inputStyle,
  primaryColor = '#0D9488',
  errorColor = '#D32F2F',
  textColor = '#222222',
  backgroundColor = '#F5F5F5',
}: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Sync with external value
  useEffect(() => {
    if (value) {
      const newOtp = value.split('').slice(0, length);
      while (newOtp.length < length) newOtp.push('');
      setOtp(newOtp);
    }
  }, [value, length]);

  // Auto focus first input
  useEffect(() => {
    if (autoFocus && !disabled) {
      setTimeout(() => inputRefs.current[0]?.focus(), 300);
    }
  }, [autoFocus, disabled]);

  // Shake animation on error
  useEffect(() => {
    if (error) {
      triggerShake();
    }
  }, [error]);

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleChange = (text: string, index: number) => {
    // Handle paste
    if (text.length > 1) {
      const pastedCode = text.replace(/\D/g, '').slice(0, length);
      const newOtp = [...otp];
      
      for (let i = 0; i < pastedCode.length; i++) {
        if (index + i < length) {
          newOtp[index + i] = pastedCode[i];
        }
      }
      
      setOtp(newOtp);
      onChange?.(newOtp.join(''));
      
      // Focus last filled or next empty
      const lastIndex = Math.min(index + pastedCode.length, length - 1);
      inputRefs.current[lastIndex]?.focus();
      
      // Check complete
      if (newOtp.every(d => d !== '')) {
        onComplete?.(newOtp.join(''));
      }
      return;
    }
    
    // Single digit input
    const digit = text.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    onChange?.(newOtp.join(''));
    
    // Auto focus next
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Check complete
    if (newOtp.every(d => d !== '')) {
      onComplete?.(newOtp.join(''));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Move to previous and clear it
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        onChange?.(newOtp.join(''));
        inputRefs.current[index - 1]?.focus();
      } else if (otp[index]) {
        // Clear current
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
        onChange?.(newOtp.join(''));
      }
    }
  };

  const handlePaste = async () => {
    try {
      const text = await Clipboard.getString();
      const code = text.replace(/\D/g, '').slice(0, length);
      if (code.length > 0) {
        handleChange(code, 0);
      }
    } catch (e) {
      console.log('Paste error:', e);
    }
  };

  const formatTimer = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isComplete = otp.every(d => d !== '');

  return (
    <View style={[styles.container, containerStyle]}>
      {/* OTP Inputs */}
      <Animated.View 
        style={[
          styles.inputContainer,
          { transform: [{ translateX: shakeAnim }] }
        ]}
      >
        {Array(length).fill(0).map((_, index) => {
          const isFocused = focusedIndex === index;
          const hasValue = !!otp[index];
          const hasError = !!error;
          
          return (
            <TextInput
              key={index}
              ref={(ref) => { inputRefs.current[index] = ref; }}
              style={[
                styles.input,
                {
                  backgroundColor: hasValue ? `${primaryColor}10` : backgroundColor,
                  borderColor: hasError 
                    ? errorColor 
                    : isFocused 
                      ? primaryColor 
                      : hasValue 
                        ? primaryColor 
                        : '#E0E0E0',
                  borderWidth: isFocused || hasValue || hasError ? 2 : 1,
                  color: textColor,
                },
              ]}
              value={otp[index]}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex(-1)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              editable={!disabled}
              caretHidden
            />
          );
        })}
      </Animated.View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={16} color={errorColor} />
          <Text style={[styles.errorText, { color: errorColor }]}>{error}</Text>
        </View>
      )}

      {/* Timer and Resend */}
      <View style={styles.timerContainer}>
        {timer > 0 ? (
          <View style={styles.timerRow}>
            <Ionicons name="time-outline" size={16} color="#757575" />
            <Text style={styles.timerText}>
              Mã hết hạn sau <Text style={{ color: primaryColor, fontWeight: '600' }}>{formatTimer(timer)}</Text>
            </Text>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.resendButton}
            onPress={onResend}
            disabled={disabled}
          >
            <Ionicons name="refresh" size={16} color={primaryColor} />
            <Text style={[styles.resendText, { color: primaryColor }]}>
              Gửi lại mã OTP
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Paste Button */}
      <TouchableOpacity 
        style={[styles.pasteButton, { backgroundColor: `${primaryColor}10` }]}
        onPress={handlePaste}
        disabled={disabled}
      >
        <Ionicons name="clipboard-outline" size={18} color={primaryColor} />
        <Text style={[styles.pasteText, { color: primaryColor }]}>Dán mã từ clipboard</Text>
      </TouchableOpacity>

      {/* Complete Indicator */}
      {isComplete && !error && (
        <View style={[styles.completeIndicator, { backgroundColor: '#00C853' }]}>
          <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
          <Text style={styles.completeText}>Đã nhập đủ mã</Text>
        </View>
      )}
    </View>
  );
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  input: {
    width: 48,
    height: 56,
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '500',
  },
  timerContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timerText: {
    fontSize: 14,
    color: '#757575',
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 6,
  },
  resendText: {
    fontSize: 14,
    fontWeight: '600',
  },
  pasteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  pasteText: {
    fontSize: 14,
    fontWeight: '500',
  },
  completeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  completeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
