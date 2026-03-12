/**
 * Forgot Password Screen - Premium Dark Theme
 *
 * 3-step flow:
 * 1. Phone/Email input
 * 2. OTP verification
 * 3. New password
 *
 * @redesigned 2026-02-25
 */

import { AUTH_THEME as T } from "@/constants/auth-theme";
import authApi from "@/services/api/authApi";
import {
    isValidVietnamesePhone,
    maskPhone,
    zaloOTPAuth,
} from "@/services/zaloOTPAuthService";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
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
import Animated, {
    FadeInDown,
    FadeInUp
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

type VerifyMethod = "phone" | "email";

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [verifyMethod, setVerifyMethod] = useState<VerifyMethod>("phone");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [verifyToken, setVerifyToken] = useState("");
  const [maskedContact, setMaskedContact] = useState("");
  const [showPass, setShowPass] = useState(false);

  const otpRefs = useRef<TextInput[]>([]);

  useEffect(() => {
    if (otpTimer > 0) {
      const t = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [otpTimer]);

  // ─── Step 1: Send OTP ─────────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (verifyMethod === "phone") {
      const trimmedPhone = phone.trim();
      if (!trimmedPhone) {
        Alert.alert("Lỗi", "Vui lòng nhập số điện thoại");
        return;
      }
      if (!isValidVietnamesePhone(trimmedPhone)) {
        Alert.alert("Lỗi", "Số điện thoại không hợp lệ.");
        return;
      }
      setLoading(true);
      try {
        const result = await zaloOTPAuth.sendOTP(trimmedPhone, {
          channel: "sms",
        });
        if (result.success) {
          setOtpTimer(result.expiresIn || 300);
          setMaskedContact(maskPhone(trimmedPhone));
          setStep(2);
          setTimeout(() => otpRefs.current[0]?.focus(), 300);
        } else {
          Alert.alert("Lỗi", result.message || "Không thể gửi mã OTP.");
        }
      } catch (error: any) {
        Alert.alert("Lỗi", error?.message || "Không thể gửi mã OTP.");
      } finally {
        setLoading(false);
      }
    } else {
      const trimmedEmail = email.trim();
      if (!trimmedEmail) {
        Alert.alert("Lỗi", "Vui lòng nhập email");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        Alert.alert("Lỗi", "Email không hợp lệ");
        return;
      }
      setLoading(true);
      try {
        try {
          const response = await authApi.sendOtp({
            type: "email",
            value: trimmedEmail,
            purpose: "reset-password",
          });
          if (response.success) {
            setOtpTimer(response.expiresIn || 60);
            setMaskedContact(trimmedEmail);
            setStep(2);
            setTimeout(() => otpRefs.current[0]?.focus(), 300);
          }
        } catch (_) {
          const response = await authApi.forgotPassword({
            email: trimmedEmail,
          });
          if (response.success) {
            Alert.alert(
              "Thành công",
              "Link đặt lại mật khẩu đã được gửi đến email.",
              [{ text: "OK", onPress: () => router.back() }],
            );
          }
        }
      } catch (error: any) {
        Alert.alert("Lỗi", error?.message || "Không thể gửi yêu cầu.");
      } finally {
        setLoading(false);
      }
    }
  };

  // ─── Step 2: OTP ──────────────────────────────────────────────────────
  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
    if (newOtp.every((d) => d !== "")) handleVerifyOtp(newOtp.join(""));
  };

  const handleOtpKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0)
      otpRefs.current[index - 1]?.focus();
  };

  const handleVerifyOtp = async (code?: string) => {
    const otpCode = code || otp.join("");
    if (otpCode.length !== 6) {
      Alert.alert("Lỗi", "Nhập đủ 6 số");
      return;
    }
    setLoading(true);
    try {
      if (verifyMethod === "phone") {
        const result = await zaloOTPAuth.verifyOTP(phone.trim(), otpCode);
        if (result.success) {
          setVerifyToken(result.accessToken || otpCode);
          setStep(3);
        } else Alert.alert("Lỗi", result.message || "Mã OTP không đúng");
      } else {
        try {
          const response = await authApi.verifyOtp({
            type: "email",
            value: email.trim(),
            code: otpCode,
            purpose: "reset-password",
          });
          if (response.success) {
            setVerifyToken(response.token || otpCode);
            setStep(3);
          } else Alert.alert("Lỗi", response.message || "Mã OTP không đúng");
        } catch (_) {
          setVerifyToken(otpCode);
          setStep(3);
        }
      }
    } catch (error: any) {
      Alert.alert("Lỗi", error?.message || "Xác thực thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (otpTimer > 0) return;
    setOtp(["", "", "", "", "", ""]);
    await handleSendOtp();
  };

  // ─── Step 3: New Password ─────────────────────────────────────────────
  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu ít nhất 6 ký tự");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp");
      return;
    }
    setLoading(true);
    try {
      if (verifyMethod === "phone") {
        const result = await zaloOTPAuth.resetPassword(
          phone.trim(),
          newPassword,
          verifyToken,
        );
        if (result.success) {
          Alert.alert("Thành công", "Mật khẩu đã được đặt lại!", [
            {
              text: "Đăng nhập",
              onPress: () => router.replace("/(auth)/login"),
            },
          ]);
        } else {
          Alert.alert("Lỗi", result.message || "Không thể đặt lại mật khẩu");
        }
      } else {
        const response = await authApi.resetPassword({
          token: verifyToken,
          newPassword,
        });
        if (response.success) {
          Alert.alert("Thành công", "Mật khẩu đã được đặt lại!", [
            {
              text: "Đăng nhập",
              onPress: () => router.replace("/(auth)/login"),
            },
          ]);
        }
      }
    } catch (error: any) {
      Alert.alert("Lỗi", error?.message || "Không thể đặt lại mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────
  const stepInfos = [
    {
      title: "Quên mật khẩu?",
      sub:
        verifyMethod === "phone"
          ? "Nhập số điện thoại để nhận OTP"
          : "Nhập email để nhận mã xác thực",
    },
    { title: "Xác thực OTP", sub: `Nhập mã 6 số đã gửi đến ${maskedContact}` },
    { title: "Đặt mật khẩu mới", sub: "Tạo mật khẩu mới cho tài khoản" },
  ];
  const info = stepInfos[step - 1];

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#0B0B1A", "#151530", "#0B0B1A"]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.glow1} />
      <View style={styles.glow2} />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          {/* Top bar */}
          <View style={styles.topBar}>
            <Pressable
              style={styles.backBtn}
              onPress={() => (step === 1 ? router.back() : setStep(step - 1))}
            >
              <Ionicons name="arrow-back" size={22} color={T.white} />
            </Pressable>

            {/* Step dots */}
            <View style={styles.stepRow}>
              {[1, 2, 3].map((s) => (
                <View
                  key={s}
                  style={[
                    styles.stepDot,
                    s === step && styles.stepDotActive,
                    s < step && styles.stepDotDone,
                  ]}
                >
                  {s < step ? (
                    <Ionicons name="checkmark" size={12} color="#fff" />
                  ) : (
                    <Text
                      style={[
                        styles.stepNum,
                        s === step && styles.stepNumActive,
                      ]}
                    >
                      {s}
                    </Text>
                  )}
                </View>
              ))}
            </View>

            <View style={{ width: 40 }} />
          </View>

          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <Animated.View
              entering={FadeInUp.duration(350)}
              style={styles.headerWrap}
            >
              <View style={styles.headerIcon}>
                <Ionicons
                  name={
                    step === 1
                      ? "key"
                      : step === 2
                        ? "shield-checkmark"
                        : "lock-open"
                  }
                  size={28}
                  color={T.primary}
                />
              </View>
              <Text style={styles.title}>{info.title}</Text>
              <Text style={styles.subtitle}>{info.sub}</Text>
            </Animated.View>

            {/* Card */}
            <Animated.View
              entering={FadeInDown.delay(100).duration(350)}
              style={styles.card}
            >
              {/* ── Step 1 ── */}
              {step === 1 && (
                <>
                  {/* Method Toggle */}
                  <View style={styles.methodRow}>
                    {(["phone", "email"] as VerifyMethod[]).map((m) => (
                      <Pressable
                        key={m}
                        style={[
                          styles.methodBtn,
                          verifyMethod === m && styles.methodBtnActive,
                        ]}
                        onPress={() => setVerifyMethod(m)}
                        disabled={loading}
                      >
                        <Ionicons
                          name={
                            m === "phone"
                              ? "chatbubble-ellipses-outline"
                              : "mail-outline"
                          }
                          size={18}
                          color={verifyMethod === m ? T.white : T.primaryLight}
                        />
                        <Text
                          style={[
                            styles.methodTxt,
                            verifyMethod === m && styles.methodTxtActive,
                          ]}
                        >
                          {m === "phone" ? "Zalo/SMS" : "Email"}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  {/* Input */}
                  <View style={styles.inputRow}>
                    <Ionicons
                      name={
                        verifyMethod === "phone"
                          ? "call-outline"
                          : "mail-outline"
                      }
                      size={20}
                      color={T.textMuted}
                      style={{ marginRight: T.gap.md }}
                    />
                    <TextInput
                      style={styles.inputText}
                      placeholder={
                        verifyMethod === "phone" ? "Số điện thoại" : "Email"
                      }
                      placeholderTextColor={T.textDim}
                      value={verifyMethod === "phone" ? phone : email}
                      onChangeText={
                        verifyMethod === "phone" ? setPhone : setEmail
                      }
                      keyboardType={
                        verifyMethod === "phone" ? "phone-pad" : "email-address"
                      }
                      autoCapitalize="none"
                      editable={!loading}
                      selectionColor={T.primaryLight}
                    />
                  </View>
                  {verifyMethod === "phone" && (
                    <Text style={styles.hint}>
                      VD: 0912345678 hoặc +84912345678
                    </Text>
                  )}

                  {/* CTA */}
                  <Pressable
                    style={[styles.ctaBtn, loading && { opacity: 0.6 }]}
                    onPress={handleSendOtp}
                    disabled={loading}
                  >
                    <LinearGradient
                      colors={[T.primary, T.primaryDark]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.ctaGrad}
                    >
                      {loading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.ctaTxt}>
                          {verifyMethod === "phone"
                            ? "Gửi OTP qua Zalo/SMS"
                            : "Gửi mã OTP"}
                        </Text>
                      )}
                    </LinearGradient>
                  </Pressable>
                </>
              )}

              {/* ── Step 2 ── */}
              {step === 2 && (
                <>
                  <View style={styles.otpInfoBox}>
                    <Ionicons
                      name={
                        verifyMethod === "phone"
                          ? "chatbubble-ellipses"
                          : "mail"
                      }
                      size={22}
                      color={T.primary}
                    />
                    <Text style={styles.otpInfoTxt}>
                      {verifyMethod === "phone"
                        ? "Mã OTP đã gửi qua Zalo/SMS đến"
                        : "Mã OTP đã gửi đến email"}
                    </Text>
                    <Text style={styles.otpContact}>{maskedContact}</Text>
                  </View>

                  <View style={styles.otpRow}>
                    {otp.map((digit, i) => (
                      <TextInput
                        key={i}
                        ref={(ref) => {
                          if (ref) otpRefs.current[i] = ref;
                        }}
                        style={[
                          styles.otpCell,
                          digit ? styles.otpCellFilled : null,
                        ]}
                        value={digit}
                        onChangeText={(t) => handleOtpChange(t, i)}
                        onKeyPress={({ nativeEvent }) =>
                          handleOtpKeyPress(nativeEvent.key, i)
                        }
                        keyboardType="number-pad"
                        maxLength={1}
                        selectionColor={T.primaryLight}
                        editable={!loading}
                      />
                    ))}
                  </View>

                  <View style={styles.timerRow}>
                    <Text style={styles.timerTxt}>
                      {otpTimer > 0
                        ? `Gửi lại sau ${otpTimer}s`
                        : "Không nhận được mã?"}
                    </Text>
                    <Pressable
                      onPress={handleResendOtp}
                      disabled={otpTimer > 0 || loading}
                    >
                      <Text
                        style={[
                          styles.resendTxt,
                          otpTimer > 0 && { color: T.textDim },
                        ]}
                      >
                        Gửi lại
                      </Text>
                    </Pressable>
                  </View>

                  <Pressable
                    style={[styles.ctaBtn, loading && { opacity: 0.6 }]}
                    onPress={() => handleVerifyOtp()}
                    disabled={loading}
                  >
                    <LinearGradient
                      colors={[T.primary, T.primaryDark]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.ctaGrad}
                    >
                      {loading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.ctaTxt}>Xác nhận</Text>
                      )}
                    </LinearGradient>
                  </Pressable>
                </>
              )}

              {/* ── Step 3 ── */}
              {step === 3 && (
                <>
                  <View style={styles.inputRow}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color={T.textMuted}
                      style={{ marginRight: T.gap.md }}
                    />
                    <TextInput
                      style={styles.inputText}
                      placeholder="Mật khẩu mới"
                      placeholderTextColor={T.textDim}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={!showPass}
                      editable={!loading}
                      selectionColor={T.primaryLight}
                    />
                    <Pressable
                      onPress={() => setShowPass(!showPass)}
                      hitSlop={12}
                    >
                      <Ionicons
                        name={showPass ? "eye-off-outline" : "eye-outline"}
                        size={20}
                        color={T.textMuted}
                      />
                    </Pressable>
                  </View>

                  <View style={[styles.inputRow, { marginTop: T.gap.lg }]}>
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={20}
                      color={T.textMuted}
                      style={{ marginRight: T.gap.md }}
                    />
                    <TextInput
                      style={styles.inputText}
                      placeholder="Xác nhận mật khẩu"
                      placeholderTextColor={T.textDim}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showPass}
                      editable={!loading}
                      selectionColor={T.primaryLight}
                    />
                  </View>

                  <Pressable
                    style={[
                      styles.ctaBtn,
                      { marginTop: T.gap.xl },
                      loading && { opacity: 0.6 },
                    ]}
                    onPress={handleResetPassword}
                    disabled={loading}
                  >
                    <LinearGradient
                      colors={[T.primary, T.primaryDark]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.ctaGrad}
                    >
                      {loading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.ctaTxt}>Đặt lại mật khẩu</Text>
                      )}
                    </LinearGradient>
                  </Pressable>
                </>
              )}
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },
  glow1: {
    position: "absolute",
    top: -100,
    right: -60,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: T.primaryGlow,
  },
  glow2: {
    position: "absolute",
    bottom: -60,
    left: -80,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: T.accentGlow,
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },

  stepRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  stepDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(100,100,160,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  stepDotActive: { backgroundColor: T.primary, borderColor: T.primaryLight },
  stepDotDone: { backgroundColor: T.success },
  stepNum: { fontSize: 12, fontWeight: "700", color: T.textMuted },
  stepNumActive: { color: T.white },

  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },

  headerWrap: { alignItems: "center", marginTop: 12, marginBottom: 28 },
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(139,92,246,0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: { fontSize: 24, fontWeight: "700", color: T.white, marginBottom: 8 },
  subtitle: {
    fontSize: 14,
    color: T.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 16,
  },

  card: {
    backgroundColor: T.bgCard,
    borderRadius: T.radius.lg,
    padding: T.gap.xl,
    borderWidth: 1,
    borderColor: T.bgCardBorder,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },

  // Method toggle
  methodRow: { flexDirection: "row", gap: T.gap.md, marginBottom: T.gap.xl },
  methodBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: T.gap.sm,
    paddingVertical: 12,
    borderRadius: T.radius.md,
    borderWidth: 1.5,
    borderColor: T.primary + "40",
  },
  methodBtnActive: { backgroundColor: T.primary, borderColor: T.primary },
  methodTxt: { fontSize: 14, fontWeight: "600", color: T.primaryLight },
  methodTxtActive: { color: T.white },

  // Input
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: T.bgInput,
    borderRadius: T.radius.md,
    borderWidth: 1.2,
    borderColor: T.bgInputBorder,
    paddingHorizontal: T.gap.lg,
    height: T.inputH,
  },
  inputText: { flex: 1, fontSize: 15, color: T.text },
  hint: { fontSize: 12, color: T.textDim, marginTop: 6, marginLeft: 4 },

  // CTA
  ctaBtn: {
    borderRadius: T.radius.md,
    overflow: "hidden",
    marginTop: T.gap.lg,
  },
  ctaGrad: { height: T.btnH, justifyContent: "center", alignItems: "center" },
  ctaTxt: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.3,
  },

  // OTP
  otpInfoBox: {
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: T.gap.lg,
    backgroundColor: "rgba(139,92,246,0.06)",
    borderRadius: T.radius.md,
  },
  otpInfoTxt: {
    fontSize: 13,
    color: T.textSecondary,
    marginTop: 8,
    textAlign: "center",
  },
  otpContact: { fontSize: 15, fontWeight: "600", color: T.text, marginTop: 4 },

  otpRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: T.gap.lg,
  },
  otpCell: {
    width: 46,
    height: 52,
    borderWidth: 1.5,
    borderRadius: T.radius.sm,
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    color: T.text,
    backgroundColor: T.bgInput,
    borderColor: T.bgInputBorder,
  },
  otpCellFilled: {
    borderColor: T.primary,
    backgroundColor: "rgba(139,92,246,0.08)",
  },

  timerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: T.gap.lg,
  },
  timerTxt: { fontSize: 13, color: T.textMuted },
  resendTxt: { fontSize: 13, fontWeight: "600", color: T.primaryLight },
});
