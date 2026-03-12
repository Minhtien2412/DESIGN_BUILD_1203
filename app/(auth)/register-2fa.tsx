/**
 * 2FA Register Screen
 * Đăng ký với xác thực 2 bước qua Email OTP
 */

import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/services/i18nService";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

type Step = "email" | "otp" | "profile";

export default function Register2FAScreen() {
  const { twoFARegisterSendOtp, twoFARegisterVerify, twoFARegisterResendOtp } =
    useAuth();
  const { t } = useI18n();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Step 1: Send OTP to email
  const handleSendOTP = async () => {
    if (!email.trim() || !email.includes("@")) {
      Alert.alert(t("common.error"), t("register2fa.errEmailValid"));
      return;
    }

    setLoading(true);
    try {
      const result = await twoFARegisterSendOtp(email.trim());

      if (result.success) {
        setStep("otp");
        startResendCooldown();
        Alert.alert(t("common.success"), t("register2fa.otpSent"));
      } else {
        Alert.alert(t("common.error"), result.message);
      }
    } catch (error: any) {
      Alert.alert(
        t("common.error"),
        error.message || t("register2fa.errOtpSendFailed"),
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP, then go to profile step
  const handleVerifyOTP = async () => {
    if (!otp.trim() || otp.length !== 6) {
      Alert.alert(t("common.error"), t("register2fa.errOtp6"));
      return;
    }

    // Move to profile step (OTP will be verified during final registration)
    setStep("profile");
  };

  // Step 3: Complete registration
  const handleCompleteRegistration = async () => {
    if (!name.trim()) {
      Alert.alert(t("common.error"), t("register2fa.errName"));
      return;
    }

    if (!password || password.length < 6) {
      Alert.alert(t("common.error"), t("register2fa.errPasswordMin"));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t("common.error"), t("register2fa.errPasswordMismatch"));
      return;
    }

    setLoading(true);
    try {
      const result = await twoFARegisterVerify(
        email.trim(),
        otp,
        password,
        name.trim(),
        phone.trim() || undefined,
      );

      if (result.success) {
        Alert.alert(t("common.success"), t("register2fa.registerSuccess"), [
          { text: "OK", onPress: () => router.replace("/(tabs)") },
        ]);
      } else {
        // If OTP is wrong, go back to OTP step
        if (result.message.toLowerCase().includes("otp")) {
          setStep("otp");
        }
        Alert.alert(t("common.error"), result.message);
      }
    } catch (error: any) {
      Alert.alert(
        t("common.error"),
        error.message || t("register2fa.errRegisterFailed"),
      );
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    setLoading(true);
    try {
      const result = await twoFARegisterResendOtp(email.trim());
      if (result.success) {
        startResendCooldown();
        Alert.alert(t("common.success"), t("register2fa.newOtpSent"));
      } else {
        Alert.alert(t("common.error"), result.message);
      }
    } catch (error: any) {
      Alert.alert(
        t("common.error"),
        error.message || t("register2fa.errResendFailed"),
      );
    } finally {
      setLoading(false);
    }
  };

  const startResendCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const getStepNumber = () => {
    switch (step) {
      case "email":
        return 1;
      case "otp":
        return 2;
      case "profile":
        return 3;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => {
              if (step === "email") router.back();
              else if (step === "otp") setStep("email");
              else setStep("otp");
            }}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </Pressable>
          <Text style={styles.title}>{t("register2fa.title")}</Text>
        </View>

        {/* Step indicator */}
        <View style={styles.stepIndicator}>
          {[1, 2, 3].map((num) => (
            <View key={num} style={styles.stepRow}>
              <View
                style={[
                  styles.step,
                  getStepNumber() >= num && styles.stepActive,
                ]}
              >
                <Text
                  style={[
                    styles.stepText,
                    getStepNumber() >= num && styles.stepTextActive,
                  ]}
                >
                  {num}
                </Text>
              </View>
              {num < 3 && <View style={styles.stepLine} />}
            </View>
          ))}
        </View>

        {step === "email" ? (
          /* Step 1: Email */
          <View style={styles.form}>
            <Text style={styles.stepTitle}>{t("register2fa.step1Title")}</Text>
            <Text style={styles.description}>{t("register2fa.step1Desc")}</Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <Pressable
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSendOTP}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  {t("register2fa.sendOtp")}
                </Text>
              )}
            </Pressable>
          </View>
        ) : step === "otp" ? (
          /* Step 2: OTP Verification */
          <View style={styles.form}>
            <Text style={styles.stepTitle}>{t("register2fa.step2Title")}</Text>
            <Text style={styles.description}>
              {t("register2fa.step2Desc")} {"\n"}
              <Text style={styles.emailHighlight}>{email}</Text>
            </Text>

            <View style={styles.otpContainer}>
              <TextInput
                style={styles.otpInput}
                placeholder="000000"
                value={otp}
                onChangeText={(text) =>
                  setOtp(text.replace(/[^0-9]/g, "").slice(0, 6))
                }
                keyboardType="number-pad"
                maxLength={6}
                textAlign="center"
              />
            </View>

            <Pressable
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleVerifyOTP}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  {t("register2fa.continue")}
                </Text>
              )}
            </Pressable>

            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>{t("register2fa.noCode")}</Text>
              <Pressable
                onPress={handleResendOTP}
                disabled={resendCooldown > 0 || loading}
              >
                <Text
                  style={[
                    styles.resendLink,
                    resendCooldown > 0 && styles.resendDisabled,
                  ]}
                >
                  {resendCooldown > 0
                    ? t("register2fa.resendCountdown").replace(
                        "{seconds}",
                        String(resendCooldown),
                      )
                    : t("register2fa.resend")}
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          /* Step 3: Profile */
          <View style={styles.form}>
            <Text style={styles.stepTitle}>{t("register2fa.step3Title")}</Text>
            <Text style={styles.description}>{t("register2fa.step3Desc")}</Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder={t("register2fa.fullNameReq")}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons
                name="call-outline"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder={t("register2fa.phoneOptional")}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder={t("register2fa.passwordReq")}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#666"
                />
              </Pressable>
            </View>

            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder={t("register2fa.confirmPasswordReq")}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
              />
            </View>

            <Pressable
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleCompleteRegistration}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  {t("register2fa.completeRegister")}
                </Text>
              )}
            </Pressable>
          </View>
        )}

        {/* Footer links */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>{t("register2fa.hasAccount")}</Text>
          <Pressable onPress={() => router.push("/(auth)/login-2fa" as any)}>
            <Text style={styles.footerLink}>{t("register2fa.login2fa")}</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={() => router.push("/(auth)/register" as any)}
          style={styles.normalLoginButton}
        >
          <Text style={styles.normalLoginText}>
            {t("register2fa.normalRegister")}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
  },
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  step: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  stepActive: {
    backgroundColor: "#007AFF",
  },
  stepText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  stepTextActive: {
    color: "#fff",
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 8,
  },
  form: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  emailHighlight: {
    color: "#007AFF",
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: "#f9f9f9",
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#333",
  },
  eyeButton: {
    padding: 8,
  },
  otpContainer: {
    marginBottom: 24,
  },
  otpInput: {
    height: 60,
    fontSize: 32,
    fontWeight: "600",
    letterSpacing: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 16,
  },
  button: {
    backgroundColor: "#007AFF",
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  resendText: {
    fontSize: 14,
    color: "#666",
  },
  resendLink: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
  },
  resendDisabled: {
    color: "#999",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 14,
    color: "#666",
  },
  footerLink: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
  },
  normalLoginButton: {
    alignItems: "center",
    paddingVertical: 8,
  },
  normalLoginText: {
    fontSize: 13,
    color: "#999",
    textDecorationLine: "underline",
  },
});
