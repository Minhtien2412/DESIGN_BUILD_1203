/**
 * OTP Input Component
 * Phone/Email OTP login input with countdown timer
 *
 * @module components/auth/OtpInput
 * @created 2026-01-22
 */

import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import {
    BORDER_RADIUS,
    COLORS,
    SPACING,
    TYPOGRAPHY,
} from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import { post } from "../../services/api";

/**
 * OTP Channel type
 */
type OtpChannel = "SMS" | "EMAIL" | "WHATSAPP";

/**
 * OTP Purpose type
 */
type OtpPurpose =
  | "LOGIN"
  | "REGISTER"
  | "VERIFY_PHONE"
  | "VERIFY_EMAIL"
  | "RESET_PASSWORD";

/**
 * Props for OtpLoginInput
 */
interface OtpLoginInputProps {
  /** Phone number or email to send OTP to */
  identifier: string;
  /** OTP delivery channel */
  channel?: OtpChannel;
  /** OTP purpose */
  purpose?: OtpPurpose;
  /** Number of OTP digits */
  length?: number;
  /** Called on successful OTP verification */
  onSuccess?: (data: { user: any; isNewUser: boolean }) => void;
  /** Called on error */
  onError?: (error: string) => void;
  /** Called when user wants to go back */
  onBack?: () => void;
  /** Custom style */
  style?: object;
}

/**
 * OTP Login Input Component
 */
export function OtpLoginInput({
  identifier,
  channel = "SMS",
  purpose = "LOGIN",
  length = 6,
  onSuccess,
  onError,
  onBack,
  style,
}: OtpLoginInputProps) {
  const { restoreSessionFromBiometric } = useAuth();
  const [otp, setOtp] = useState<string[]>(Array(length).fill(""));
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);

  const inputRefs = useRef<(TextInput | null)[]>([]);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Auto-send OTP on mount
  useEffect(() => {
    sendOtp();
     
  }, []);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Auto-submit when OTP is complete
  useEffect(() => {
    const code = otp.join("");
    if (code.length === length && !loading && otpSent) {
      verifyOtp(code);
    }
     
  }, [otp, loading, otpSent]);

  /**
   * Send OTP request
   */
  const sendOtp = useCallback(async () => {
    if (sendingOtp || countdown > 0) return;

    setSendingOtp(true);
    setError(null);

    try {
      const response = await post<{
        success: boolean;
        message: string;
        expiresIn: number;
        cooldownSeconds?: number;
      }>("/auth/otp/send", {
        identifier,
        channel,
        purpose,
      });

      if (response.success) {
        setOtpSent(true);
        setCountdown(response.cooldownSeconds || 60);
      } else {
        if (response.cooldownSeconds) {
          setCountdown(response.cooldownSeconds);
        }
        setError(response.message);
      }
    } catch (err: any) {
      const message = err?.message || "Failed to send OTP";
      setError(message);
      onError?.(message);
    } finally {
      setSendingOtp(false);
    }
  }, [identifier, channel, purpose, sendingOtp, countdown, onError]);

  /**
   * Verify OTP
   */
  const verifyOtp = useCallback(
    async (code: string) => {
      if (loading) return;

      setLoading(true);
      setError(null);

      try {
        const response = await post<{
          success: boolean;
          message: string;
          accessToken?: string;
          refreshToken?: string;
          user?: {
            id: number;
            email: string;
            name: string;
            role: string;
            isNewUser: boolean;
          };
        }>("/auth/otp/verify", {
          identifier,
          otp: code,
          channel,
          purpose,
        });

        if (response.success && response.accessToken && response.user) {
          // Login successful - restore session with tokens
          await restoreSessionFromBiometric(
            response.accessToken,
            response.refreshToken || "",
          );

          onSuccess?.({
            user: response.user,
            isNewUser: response.user.isNewUser,
          });
        } else {
          throw new Error(response.message || "Verification failed");
        }
      } catch (err: any) {
        const message = err?.message || "Invalid OTP";
        setError(message);
        onError?.(message);

        // Shake animation
        Animated.sequence([
          Animated.timing(shakeAnim, {
            toValue: 10,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: -10,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 10,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 0,
            duration: 50,
            useNativeDriver: true,
          }),
        ]).start();

        // Clear OTP on error
        setOtp(Array(length).fill(""));
        inputRefs.current[0]?.focus();
      } finally {
        setLoading(false);
      }
    },
    [
      identifier,
      channel,
      purpose,
      loading,
      restoreSessionFromBiometric,
      onSuccess,
      onError,
      shakeAnim,
      length,
    ],
  );

  /**
   * Handle digit input
   */
  const handleChangeText = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setError(null);

    // Move to next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  /**
   * Handle backspace
   */
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  /**
   * Format countdown time
   */
  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0
      ? `${mins}:${secs.toString().padStart(2, "0")}`
      : `${secs}s`;
  };

  /**
   * Mask identifier for display
   */
  const getMaskedIdentifier = () => {
    if (identifier.includes("@")) {
      const [local, domain] = identifier.split("@");
      return `${local.slice(0, 2)}***@${domain}`;
    }
    return `${identifier.slice(0, 3)}****${identifier.slice(-3)}`;
  };

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
        )}
        <Text style={styles.title}>Xác thực OTP</Text>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Ionicons
          name={channel === "EMAIL" ? "mail-outline" : "phone-portrait-outline"}
          size={48}
          color={COLORS.primary}
        />
        <Text style={styles.infoText}>
          Nhập mã OTP đã gửi tới{"\n"}
          <Text style={styles.infoHighlight}>{getMaskedIdentifier()}</Text>
        </Text>
      </View>

      {/* OTP Input Boxes */}
      <Animated.View
        style={[
          styles.otpContainer,
          { transform: [{ translateX: shakeAnim }] },
        ]}
      >
        {Array.from({ length }).map((_, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              inputRefs.current[index] = ref;
            }}
            style={[
              styles.otpInput,
              otp[index] && styles.otpInputFilled,
              error && styles.otpInputError,
            ]}
            value={otp[index]}
            onChangeText={(text) => handleChangeText(text, index)}
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
          <Ionicons name="alert-circle" size={16} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Loading */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang xác thực...</Text>
        </View>
      )}

      {/* Resend */}
      <View style={styles.resendContainer}>
        {countdown > 0 ? (
          <Text style={styles.countdownText}>
            Gửi lại sau {formatCountdown(countdown)}
          </Text>
        ) : (
          <TouchableOpacity
            onPress={sendOtp}
            disabled={sendingOtp}
            style={styles.resendButton}
          >
            {sendingOtp ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Text style={styles.resendText}>Gửi lại mã OTP</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Change method */}
      {channel === "SMS" && (
        <TouchableOpacity style={styles.changeMethod}>
          <Text style={styles.changeMethodText}>
            Không nhận được SMS? Thử phương thức khác
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  backButton: {
    padding: SPACING.xs,
    marginRight: SPACING.sm,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: "700",
    color: COLORS.text,
  },
  info: {
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  infoText: {
    marginTop: SPACING.md,
    textAlign: "center",
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  infoHighlight: {
    fontWeight: "600",
    color: COLORS.text,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    color: COLORS.text,
    backgroundColor: COLORS.surface,
  },
  otpInputFilled: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.background,
  },
  otpInputError: {
    borderColor: COLORS.error,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  errorText: {
    color: COLORS.error,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  resendContainer: {
    alignItems: "center",
    marginTop: SPACING.lg,
  },
  countdownText: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  resendButton: {
    padding: SPACING.sm,
  },
  resendText: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: "600",
  },
  changeMethod: {
    alignItems: "center",
    marginTop: SPACING.xl,
    padding: SPACING.md,
  },
  changeMethodText: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.sm,
    textDecorationLine: "underline",
  },
});

export default OtpLoginInput;
