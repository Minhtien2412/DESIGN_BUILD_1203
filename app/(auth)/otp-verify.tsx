/**
 * OTP Verification Screen - Premium Dark Theme
 *
 * Phone-based OTP verification with:
 * - Auto-submit on complete
 * - Shake animation on error
 * - Haptic feedback
 * - Countdown timer & resend
 *
 * @redesigned 2026-02-25
 */

import { AUTH_THEME as T } from "@/constants/auth-theme";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_W } = Dimensions.get("window");
const OTP_LENGTH = 6;

const maskPhone = (phone: string): string => {
  let formatted = phone.replace(/\s+/g, "");
  if (!formatted.startsWith("+")) {
    if (formatted.startsWith("84")) formatted = "+" + formatted;
    else if (formatted.startsWith("0"))
      formatted = "+84" + formatted.substring(1);
    else formatted = "+84" + formatted;
  }
  if (formatted.length < 9) return formatted;
  const prefix = formatted.slice(0, 6);
  const suffix = formatted.slice(-3);
  return `${prefix}${"*".repeat(formatted.length - 9)}${suffix}`;
};

export default function OTPVerificationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { verifyOTP: authVerifyOTP, sendOTP: authSendOTP } = useAuth();

  const phone = (params.phone as string) || "";
  const _mode = (params.mode as string) || "login";
  const name = params.name as string | undefined;
  const email = params.email as string | undefined;
  const sessionId = params.sessionId as string | undefined;

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);

  const inputRefs = useRef<(TextInput | null)[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Timer
  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(t);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Entry animation
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

  // Auto-focus
  useEffect(() => {
    setTimeout(() => inputRefs.current[0]?.focus(), 500);
  }, []);

  const triggerShake = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 15,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -15,
        duration: 50,
        useNativeDriver: true,
      }),
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
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleOtpChange = (value: string, index: number) => {
    if (error) setError(null);
    const digit = value.replace(/[^0-9]/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (digit && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
    if (digit && index === OTP_LENGTH - 1) {
      const completeOtp = newOtp.join("");
      if (completeOtp.length === OTP_LENGTH) handleVerify(completeOtp);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      setOtp(newOtp);
    }
  };

  const handleVerify = async (otpCode?: string) => {
    const code = otpCode || otp.join("");
    if (code.length !== OTP_LENGTH) {
      setError("Vui lòng nhập đủ 6 số");
      triggerShake();
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const result = await authVerifyOTP(phone, code, sessionId);
      if (!result.success) {
        setError(result.message);
        triggerShake();
        setOtp(Array(OTP_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
        return;
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (result.isNewUser) {
        router.replace({
          pathname: "/(auth)/complete-profile" as any,
          params: {
            phone,
            userId: result.user?.id,
            name: name || "",
            email: email || "",
          },
        });
      } else {
        router.replace("/(tabs)");
      }
    } catch (err) {
      setError("Có lỗi xảy ra. Vui lòng thử lại.");
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || resending) return;
    try {
      setResending(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const result = await authSendOTP(phone, "sms");
      if (result.success) {
        setCountdown(60);
        setCanResend(false);
        setOtp(Array(OTP_LENGTH).fill(""));
        setError(null);
        inputRefs.current[0]?.focus();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setError(result.message);
      }
    } catch (_) {
      setError("Không thể gửi lại mã OTP");
    } finally {
      setResending(false);
    }
  };

  const formatCountdown = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return mins > 0
      ? `${mins}:${secs.toString().padStart(2, "0")}`
      : `${secs}s`;
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#0B0B1A", "#1A1040", "#0B0B1A"]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.glow1} />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1, paddingHorizontal: 24 }}
        >
          {/* Back */}
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={T.white} />
          </Pressable>

          {/* Header */}
          <Animated.View
            style={[
              styles.headerWrap,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="shield-checkmark" size={36} color={T.primary} />
            </View>
            <Text style={styles.title}>Xác thực bảo mật</Text>
            <Text style={styles.subtitle}>
              Chúng tôi đã gửi mã xác thực 6 số đến{"\n"}
              <Text style={styles.phoneHighlight}>{maskPhone(phone)}</Text>
              {"\n"}qua Zalo hoặc SMS
            </Text>
          </Animated.View>

          {/* OTP Inputs */}
          <Animated.View
            style={[styles.otpRow, { transform: [{ translateX: shakeAnim }] }]}
          >
            {otp.map((digit, i) => (
              <TextInput
                key={i}
                ref={(ref) => {
                  inputRefs.current[i] = ref;
                }}
                style={[
                  styles.otpCell,
                  digit ? styles.otpCellFilled : null,
                  error ? styles.otpCellError : null,
                ]}
                value={digit}
                onChangeText={(v) => handleOtpChange(v, i)}
                onKeyPress={(e) => handleKeyPress(e, i)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                editable={!loading}
              />
            ))}
          </Animated.View>

          {/* Error */}
          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color={T.error} />
              <Text style={styles.errorTxt}>{error}</Text>
            </View>
          )}

          {/* Resend / Countdown */}
          <View style={styles.resendWrap}>
            {canResend ? (
              <Pressable
                onPress={handleResend}
                disabled={resending}
                style={styles.resendBtn}
              >
                {resending ? (
                  <ActivityIndicator size="small" color={T.primary} />
                ) : (
                  <>
                    <Ionicons name="refresh" size={16} color={T.primary} />
                    <Text style={styles.resendTxt}>Gửi lại mã</Text>
                  </>
                )}
              </Pressable>
            ) : (
              <Text style={styles.countdownTxt}>
                Gửi lại mã sau{" "}
                <Text style={styles.countdownNum}>
                  {formatCountdown(countdown)}
                </Text>
              </Text>
            )}
          </View>

          {/* Verify Button */}
          <Pressable
            style={[styles.verifyBtn, loading && { opacity: 0.6 }]}
            onPress={() => handleVerify()}
            disabled={loading || otp.join("").length !== OTP_LENGTH}
          >
            <LinearGradient
              colors={loading ? ["#555", "#444"] : [T.primary, T.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.verifyGrad}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.verifyTxt}>Xác nhận</Text>
              )}
            </LinearGradient>
          </Pressable>

          {/* Change phone */}
          <Pressable style={styles.changeBtn} onPress={() => router.back()}>
            <Text style={styles.changeTxt}>Đổi số điện thoại khác</Text>
          </Pressable>

          <Text style={styles.helpTxt}>
            Không nhận được mã?{" "}
            <Text style={styles.helpLink}>Liên hệ hỗ trợ</Text>
          </Text>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },
  glow1: {
    position: "absolute",
    top: -80,
    left: -60,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: T.primaryGlow,
  },

  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 4,
  },

  headerWrap: { alignItems: "center", marginBottom: 36 },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "rgba(139,92,246,0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: { fontSize: 26, fontWeight: "700", color: T.white, marginBottom: 12 },
  subtitle: {
    fontSize: 14,
    color: T.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  phoneHighlight: { fontWeight: "700", fontSize: 16, color: T.primaryLight },

  // OTP
  otpRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 20,
  },
  otpCell: {
    width: (SCREEN_W - 48 - 50) / 6,
    height: 58,
    borderRadius: T.radius.md,
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    color: T.text,
    backgroundColor: T.bgInput,
    borderWidth: 2,
    borderColor: T.bgInputBorder,
  },
  otpCellFilled: {
    borderColor: T.primary,
    backgroundColor: "rgba(139,92,246,0.1)",
  },
  otpCellError: { borderColor: T.error, backgroundColor: T.errorBg },

  // Error
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: T.errorBg,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: T.radius.sm,
    gap: 8,
    marginBottom: 16,
  },
  errorTxt: { fontSize: 13, color: T.error, fontWeight: "500" },

  // Resend
  resendWrap: { alignItems: "center", marginBottom: 28 },
  resendBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "rgba(139,92,246,0.1)",
    borderRadius: 20,
  },
  resendTxt: { fontSize: 14, fontWeight: "600", color: T.primary },
  countdownTxt: { fontSize: 14, color: T.textSecondary },
  countdownNum: { fontWeight: "700", color: T.primaryLight },

  // Verify
  verifyBtn: {
    borderRadius: T.radius.md,
    overflow: "hidden",
    marginBottom: 16,
  },
  verifyGrad: {
    height: T.btnH,
    justifyContent: "center",
    alignItems: "center",
  },
  verifyTxt: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.3,
  },

  // Change
  changeBtn: {
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  changeTxt: {
    fontSize: 14,
    color: T.textSecondary,
    textDecorationLine: "underline",
  },

  // Help
  helpTxt: {
    fontSize: 13,
    color: T.textDim,
    textAlign: "center",
    marginTop: 20,
  },
  helpLink: {
    fontWeight: "600",
    color: T.primaryLight,
    textDecorationLine: "underline",
  },
});
