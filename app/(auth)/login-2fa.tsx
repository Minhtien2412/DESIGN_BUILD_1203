/**
 * 2FA Login Screen
 * Đăng nhập với xác thực 2 bước qua Email OTP
 */

import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

type Step = "credentials" | "otp";

export default function Login2FAScreen() {
  const { twoFALoginRequestOtp, twoFALoginVerify, twoFALoginResendOtp } =
    useAuth();

  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [tempToken, setTempToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Step 1: Submit credentials and request OTP
  const handleRequestOTP = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập email và mật khẩu");
      return;
    }

    setLoading(true);
    try {
      const result = await twoFALoginRequestOtp(email.trim(), password);

      if (result.success && result.tempToken) {
        setTempToken(result.tempToken);
        setStep("otp");
        startResendCooldown();
        Alert.alert("Thành công", "Mã OTP đã được gửi đến email của bạn");
      } else {
        Alert.alert("Lỗi", result.message);
      }
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Đã xảy ra lỗi");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async () => {
    if (!otp.trim() || otp.length !== 6) {
      Alert.alert("Lỗi", "Vui lòng nhập mã OTP 6 số");
      return;
    }

    setLoading(true);
    try {
      const result = await twoFALoginVerify(email.trim(), tempToken, otp);

      if (result.success) {
        Alert.alert("Thành công", "Đăng nhập thành công!", [
          { text: "OK", onPress: () => router.replace("/(tabs)") },
        ]);
      } else {
        Alert.alert("Lỗi", result.message);
      }
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Mã OTP không đúng");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    setLoading(true);
    try {
      const result = await twoFALoginResendOtp(email.trim());
      if (result.success) {
        startResendCooldown();
        Alert.alert("Thành công", "Mã OTP mới đã được gửi");
      } else {
        Alert.alert("Lỗi", result.message);
      }
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Không thể gửi lại OTP");
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </Pressable>
          <Text style={styles.title}>
            {step === "credentials" ? "Đăng nhập 2FA" : "Xác thực OTP"}
          </Text>
        </View>

        {/* Step indicator */}
        <View style={styles.stepIndicator}>
          <View
            style={[styles.step, step === "credentials" && styles.stepActive]}
          >
            <Text
              style={[
                styles.stepText,
                step === "credentials" && styles.stepTextActive,
              ]}
            >
              1
            </Text>
          </View>
          <View style={styles.stepLine} />
          <View style={[styles.step, step === "otp" && styles.stepActive]}>
            <Text
              style={[styles.stepText, step === "otp" && styles.stepTextActive]}
            >
              2
            </Text>
          </View>
        </View>

        {step === "credentials" ? (
          /* Step 1: Credentials */
          <View style={styles.form}>
            <Text style={styles.description}>
              Nhập email và mật khẩu để nhận mã OTP xác thực
            </Text>

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

            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Mật khẩu"
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

            <Pressable
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRequestOTP}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Tiếp tục</Text>
              )}
            </Pressable>
          </View>
        ) : (
          /* Step 2: OTP Verification */
          <View style={styles.form}>
            <Text style={styles.description}>
              Nhập mã OTP 6 số đã gửi đến {"\n"}
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
                <Text style={styles.buttonText}>Xác nhận</Text>
              )}
            </Pressable>

            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Không nhận được mã? </Text>
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
                    ? `Gửi lại (${resendCooldown}s)`
                    : "Gửi lại"}
                </Text>
              </Pressable>
            </View>

            <Pressable
              onPress={() => setStep("credentials")}
              style={styles.changeEmailButton}
            >
              <Text style={styles.changeEmailText}>← Đổi email khác</Text>
            </Pressable>
          </View>
        )}

        {/* Footer links */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Chưa có tài khoản? </Text>
          <Pressable onPress={() => router.push("/(auth)/register-2fa" as any)}>
            <Text style={styles.footerLink}>Đăng ký 2FA</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={() => router.push("/(auth)/login" as any)}
          style={styles.normalLoginButton}
        >
          <Text style={styles.normalLoginText}>
            Đăng nhập thường (không 2FA)
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
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
    width: 60,
    height: 2,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 8,
  },
  form: {
    flex: 1,
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
  changeEmailButton: {
    alignItems: "center",
    marginTop: 24,
  },
  changeEmailText: {
    fontSize: 14,
    color: "#666",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "auto",
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
