/**
 * Zalo Login Screen
 * =================
 *
 * Màn hình đăng nhập/đăng ký qua Zalo Mini App
 *
 * Hỗ trợ:
 * - Đăng nhập bằng Zalo (trong Mini App)
 * - Đăng nhập bằng OTP (ngoài Mini App)
 * - Liên kết tài khoản Zalo
 */

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Services
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/services/i18nService";
import { calculateExpiryTimestamp, saveTokens } from "@/services/token.service";
import {
    zaloMiniAppAuth,
    ZaloMiniAppLoginResult,
} from "@/services/zaloMiniAppAuthService";
import {
    isValidVietnamesePhone,
    maskPhone,
    zaloOTPAuth,
} from "@/services/zaloOTPAuthService";

// ==================== COLORS ====================

const COLORS = {
  // Zalo brand colors
  zaloPrimary: "#0068FF",
  zaloLight: "#4A9EFF",
  zaloDark: "#0050CC",

  // App theme (monochrome)
  background: "#fafafa",
  surface: "#ffffff",
  text: "#1a1a1a",
  textSecondary: "#6b7280",
  textMuted: "#9ca3af",
  border: "#e5e7eb",
  error: "#ef4444",
  success: "#10b981",
};

// ==================== MAIN COMPONENT ====================

export default function ZaloLoginScreen() {
  const router = useRouter();
  const { signInWithPhone, refreshUser } = useAuth();
  const { t } = useI18n();

  // State
  const [isInMiniApp, setIsInMiniApp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"initial" | "otp" | "verify">("initial");

  // OTP flow state
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState("");

  // Check environment on mount
  useEffect(() => {
    setIsInMiniApp(zaloMiniAppAuth.isInMiniApp());
  }, []);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // ============ HANDLERS ============

  /**
   * Đăng nhập qua Zalo Mini App
   */
  const handleZaloLogin = async () => {
    setIsLoading(true);
    setError("");

    try {
      const result: ZaloMiniAppLoginResult = await zaloMiniAppAuth.login({
        requirePhone: true,
        autoRequestPermission: true,
      });

      if (result.success) {
        // Lưu tokens và đăng nhập
        if (result.accessToken && result.refreshToken) {
          await saveTokens({
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            expiresAt: calculateExpiryTimestamp("1h"), // 1 hour
          });
          await refreshUser();
        }

        Alert.alert(
          result.isNewUser
            ? `🎉 ${t("zaloLogin.welcomeNew")}`
            : `👋 ${t("zaloLogin.welcomeBack")}`,
          result.isNewUser
            ? `${result.user?.name} - ${t("zaloLogin.accountCreated")}`
            : `${result.user?.name} - ${t("zaloLogin.loginSuccess")}`,
          [{ text: "OK", onPress: () => router.replace("/(tabs)") }],
        );
      } else {
        setError(result.message || t("zaloLogin.errLoginFailed"));
      }
    } catch (err: any) {
      setError(err.message || t("zaloLogin.errGeneric"));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Gửi OTP
   */
  const handleSendOTP = async () => {
    if (!isValidVietnamesePhone(phone)) {
      setError(t("zaloLogin.errPhoneInvalid"));
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await zaloOTPAuth.sendOTP(phone);

      if (result.success) {
        setOtpSent(true);
        setStep("verify");
        setCountdown(60);
        Alert.alert(t("zaloLogin.otpSentAlert"), result.message);
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message || t("zaloLogin.errOtpSendFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Gửi lại OTP
   */
  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setIsLoading(true);
    setError("");

    try {
      const result = await zaloOTPAuth.sendOTP(phone, { isResend: true });

      if (result.success) {
        setCountdown(60);
        Alert.alert(t("zaloLogin.otpResentAlert"), result.message);
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message || t("zaloLogin.errOtpResendFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Xác thực OTP
   */
  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError(t("zaloLogin.errOtp6"));
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await zaloOTPAuth.verifyOTP(phone, otp);

      if (result.success) {
        // Lưu tokens và đăng nhập
        if (result.accessToken && result.refreshToken) {
          await saveTokens({
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            expiresAt: calculateExpiryTimestamp("1h"), // 1 hour
          });
          await refreshUser();
        }

        Alert.alert(
          result.isNewUser
            ? `🎉 ${t("zaloLogin.welcomeNew")}`
            : `👋 ${t("zaloLogin.welcomeBack")}`,
          result.isNewUser
            ? t("zaloLogin.accountCreated")
            : t("zaloLogin.loginSuccess"),
          [{ text: "OK", onPress: () => router.replace("/(tabs)") }],
        );
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message || t("zaloLogin.errVerifyFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Quay lại
   */
  const handleBack = () => {
    if (step === "verify") {
      setStep("otp");
      setOtp("");
    } else if (step === "otp") {
      setStep("initial");
      setPhone("");
      setOtpSent(false);
    } else {
      router.back();
    }
    setError("");
  };

  // ============ RENDER ============

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>
              {step === "initial"
                ? t("zaloLogin.login")
                : step === "otp"
                  ? t("zaloLogin.enterPhone")
                  : t("zaloLogin.verifyOtp")}
            </Text>

            <View style={styles.placeholder} />
          </View>

          {/* Logo & Welcome */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Ionicons
                name="person-circle-outline"
                size={80}
                color={COLORS.zaloPrimary}
              />
            </View>
            <Text style={styles.welcomeText}>
              {step === "initial"
                ? t("zaloLogin.welcome")
                : step === "otp"
                  ? t("zaloLogin.enterPhone")
                  : t("zaloLogin.otpSentTo").replace(
                      "{phone}",
                      maskPhone(phone),
                    )}
            </Text>
            <Text style={styles.subText}>
              {step === "initial"
                ? t("zaloLogin.loginSubtext")
                : step === "otp"
                  ? t("zaloLogin.phoneSubtext")
                  : t("zaloLogin.otpSubtext")}
            </Text>
          </View>

          {/* Content based on step */}
          {step === "initial" && (
            <View style={styles.content}>
              {/* Zalo Login Button */}
              {isInMiniApp && (
                <TouchableOpacity
                  style={[
                    styles.zaloButton,
                    isLoading && styles.buttonDisabled,
                  ]}
                  onPress={handleZaloLogin}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[COLORS.zaloLight, COLORS.zaloPrimary]}
                    style={styles.zaloGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Text style={styles.zaloIcon}>Z</Text>
                        <Text style={styles.zaloButtonText}>
                          {t("zaloLogin.loginWithZalo")}
                        </Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              )}

              {/* Divider */}
              {isInMiniApp && (
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>{t("zaloLogin.or")}</Text>
                  <View style={styles.dividerLine} />
                </View>
              )}

              {/* Phone OTP Button */}
              <TouchableOpacity
                style={styles.otpButton}
                onPress={() => setStep("otp")}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="phone-portrait-outline"
                  size={24}
                  color={COLORS.text}
                />
                <Text style={styles.otpButtonText}>
                  {t("zaloLogin.loginWithPhone")}
                </Text>
              </TouchableOpacity>

              {/* Skip */}
              <TouchableOpacity
                style={styles.skipButton}
                onPress={() => router.replace("/(tabs)")}
              >
                <Text style={styles.skipText}>{t("zaloLogin.skipGuest")}</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === "otp" && (
            <View style={styles.content}>
              {/* Phone Input */}
              <View style={styles.inputContainer}>
                <View style={styles.phonePrefix}>
                  <Text style={styles.prefixText}>🇻🇳 +84</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="912 345 678"
                  placeholderTextColor={COLORS.textMuted}
                  value={phone}
                  onChangeText={(text) => {
                    setPhone(text.replace(/[^0-9]/g, ""));
                    setError("");
                  }}
                  keyboardType="phone-pad"
                  maxLength={10}
                  autoFocus
                />
              </View>

              {/* Error */}
              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              {/* Send OTP Button */}
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  (!phone || isLoading) && styles.buttonDisabled,
                ]}
                onPress={handleSendOTP}
                disabled={!phone || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    {t("zaloLogin.sendOtp")}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {step === "verify" && (
            <View style={styles.content}>
              {/* OTP Input */}
              <View style={styles.otpInputContainer}>
                <TextInput
                  style={styles.otpInput}
                  placeholder="• • • • • •"
                  placeholderTextColor={COLORS.textMuted}
                  value={otp}
                  onChangeText={(text) => {
                    setOtp(text.replace(/[^0-9]/g, ""));
                    setError("");
                  }}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus
                  textAlign="center"
                />
              </View>

              {/* Error */}
              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              {/* Resend OTP */}
              <TouchableOpacity
                style={styles.resendButton}
                onPress={handleResendOTP}
                disabled={countdown > 0}
              >
                <Text
                  style={[
                    styles.resendText,
                    countdown > 0 && styles.resendDisabled,
                  ]}
                >
                  {countdown > 0
                    ? t("zaloLogin.resendAfter").replace(
                        "{seconds}",
                        String(countdown),
                      )
                    : t("zaloLogin.resendOtp")}
                </Text>
              </TouchableOpacity>

              {/* Verify Button */}
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  (otp.length !== 6 || isLoading) && styles.buttonDisabled,
                ]}
                onPress={handleVerifyOTP}
                disabled={otp.length !== 6 || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    {t("zaloLogin.confirm")}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {t("zaloLogin.termsFooter")}{" "}
              <Text style={styles.linkText}>{t("zaloLogin.termsOfUse")}</Text>{" "}
              {t("zaloLogin.and")}{" "}
              <Text style={styles.linkText}>
                {t("zaloLogin.privacyPolicy")}
              </Text>
            </Text>

            {/* Debug info */}
            {__DEV__ && (
              <View style={styles.debugInfo}>
                <Text style={styles.debugText}>
                  🔧 Dev Mode | In Mini App: {isInMiniApp ? "Yes" : "No"}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },
  placeholder: {
    width: 40,
  },

  // Logo
  logoContainer: {
    alignItems: "center",
    marginTop: 32,
    marginBottom: 40,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.zaloPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },
  subText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 20,
  },

  // Content
  content: {
    flex: 1,
  },

  // Zalo Button
  zaloButton: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  zaloGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 12,
  },
  zaloButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  zaloIcon: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0068FF",
    backgroundColor: "#fff",
    width: 28,
    height: 28,
    borderRadius: 6,
    textAlign: "center",
    lineHeight: 28,
    overflow: "hidden",
  },

  // Divider
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: COLORS.textMuted,
  },

  // OTP Button
  otpButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  otpButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.text,
  },

  // Skip
  skipButton: {
    marginTop: 24,
    paddingVertical: 12,
    alignItems: "center",
  },
  skipText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textDecorationLine: "underline",
  },

  // Input
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  phonePrefix: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  prefixText: {
    fontSize: 16,
    color: COLORS.text,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 18,
    color: COLORS.text,
    letterSpacing: 1,
  },

  // OTP Input
  otpInputContainer: {
    marginBottom: 16,
  },
  otpInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 20,
    paddingHorizontal: 24,
    fontSize: 32,
    fontWeight: "600",
    color: COLORS.text,
    letterSpacing: 8,
  },

  // Primary Button
  primaryButton: {
    backgroundColor: COLORS.zaloPrimary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  buttonDisabled: {
    opacity: 0.5,
  },

  // Resend
  resendButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  resendText: {
    fontSize: 14,
    color: COLORS.zaloPrimary,
    fontWeight: "500",
  },
  resendDisabled: {
    color: COLORS.textMuted,
  },

  // Error
  errorText: {
    fontSize: 14,
    color: COLORS.error,
    marginBottom: 8,
    textAlign: "center",
  },

  // Footer
  footer: {
    marginTop: "auto",
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 18,
  },
  linkText: {
    color: COLORS.zaloPrimary,
    textDecorationLine: "underline",
  },

  // Debug
  debugInfo: {
    marginTop: 16,
    padding: 8,
    backgroundColor: "#f0f9ff",
    borderRadius: 8,
    alignItems: "center",
  },
  debugText: {
    fontSize: 12,
    color: "#0F766E",
  },
});
