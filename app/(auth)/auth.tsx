/**
 * Modern Auth Screen - Premium Login/Register
 *
 * Features:
 * - Glassmorphism card with dark premium theme
 * - Animated tab switch between Login/Register
 * - Social login (Google, Facebook)
 * - Password strength indicator
 * - Demo user quick select (DEV only)
 *
 * @redesigned 2026-02-25
 */

import { AUTH_THEME as T } from "@/constants/auth-theme";
import { DEMO_USERS, DemoUser } from "@/constants/demoUsers";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { memo, useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import Animated, {
    FadeIn,
    FadeInDown,
    FadeInUp,
    FadeOut,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_W } = Dimensions.get("window");

type AuthMode = "login" | "register";

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}
interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

// ─── AnimatedInput ───────────────────────────────────────────────────────────
const AnimatedInput = memo(function AnimatedInput({
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  error,
  disabled,
  showPasswordToggle,
  onTogglePassword,
  delay = 0,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address";
  autoCapitalize?: "none" | "words";
  error?: string;
  disabled?: boolean;
  showPasswordToggle?: boolean;
  onTogglePassword?: () => void;
  delay?: number;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(350)}
      style={styles.inputOuter}
    >
      <View
        style={[
          styles.inputRow,
          focused && styles.inputRowFocused,
          error ? styles.inputRowError : null,
        ]}
      >
        <Ionicons
          name={icon}
          size={20}
          color={error ? T.error : focused ? T.primary : T.textMuted}
          style={{ marginRight: T.gap.md }}
        />
        <TextInput
          style={styles.inputText}
          placeholder={placeholder}
          placeholderTextColor={T.textDim}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize || "none"}
          autoCorrect={false}
          editable={!disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          selectionColor={T.primaryLight}
        />
        {showPasswordToggle && (
          <Pressable onPress={onTogglePassword} hitSlop={12}>
            <Ionicons
              name={secureTextEntry ? "eye-outline" : "eye-off-outline"}
              size={20}
              color={T.textMuted}
            />
          </Pressable>
        )}
      </View>
      {error && (
        <Animated.Text
          entering={FadeIn.duration(150)}
          exiting={FadeOut.duration(150)}
          style={styles.errorMsg}
        >
          {error}
        </Animated.Text>
      )}
    </Animated.View>
  );
});

// ─── PasswordStrength ────────────────────────────────────────────────────────
const PasswordStrength = memo(function PasswordStrength({
  password,
}: {
  password: string;
}) {
  const getStrength = useCallback(() => {
    if (!password) return { level: 0, label: "", color: T.textMuted };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 2) return { level: 1, label: "Yếu", color: T.error };
    if (score <= 3) return { level: 2, label: "Trung bình", color: T.warning };
    if (score <= 4) return { level: 3, label: "Mạnh", color: T.accent };
    return { level: 4, label: "Rất mạnh", color: T.success };
  }, [password]);

  const strength = getStrength();
  if (!password) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      style={styles.strengthRow}
    >
      <View style={styles.strengthBars}>
        {[1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={[
              styles.strengthBar,
              {
                backgroundColor:
                  i <= strength.level
                    ? strength.color
                    : "rgba(100,100,160,0.2)",
              },
            ]}
          />
        ))}
      </View>
      <Text style={[styles.strengthLabel, { color: strength.color }]}>
        {strength.label}
      </Text>
    </Animated.View>
  );
});

// ─── SocialButton ────────────────────────────────────────────────────────────
const SocialButton = memo(function SocialButton({
  icon,
  label,
  onPress,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  color: string;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.socialBtn,
        pressed && { opacity: 0.7, transform: [{ scale: 0.97 }] },
      ]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={20} color={color} />
      <Text style={styles.socialBtnTxt}>{label}</Text>
    </Pressable>
  );
});

// ─── DemoUserPicker ──────────────────────────────────────────────────────────
const DemoUserPicker = memo(function DemoUserPicker({
  onSelectUser,
  disabled,
}: {
  onSelectUser: (u: DemoUser) => void;
  disabled?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  if (!__DEV__) return null;

  const roleColors: Record<string, string> = {
    CLIENT: "#10B981",
    ENGINEER: "#F59E0B",
    CONTRACTOR: "#0D9488",
    ADMIN: "#EF4444",
  };

  return (
    <Animated.View entering={FadeIn.delay(600)} style={styles.demoWrap}>
      <Pressable
        style={styles.demoToggle}
        onPress={() => setExpanded(!expanded)}
        disabled={disabled}
      >
        <Ionicons name="bug-outline" size={15} color={T.warning} />
        <Text style={styles.demoToggleTxt}>
          {expanded ? "Ẩn Demo Users" : "Chọn Demo User"}
        </Text>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={15}
          color={T.textMuted}
        />
      </Pressable>
      {expanded && (
        <Animated.View
          entering={FadeInDown.duration(200)}
          style={styles.demoList}
        >
          {DEMO_USERS.map((user) => (
            <Pressable
              key={user.id}
              style={({ pressed }) => [
                styles.demoItem,
                pressed && { borderColor: T.primary, opacity: 0.85 },
              ]}
              onPress={() => {
                onSelectUser(user);
                setExpanded(false);
              }}
              disabled={disabled}
            >
              <View
                style={[
                  styles.demoAvatar,
                  { backgroundColor: roleColors[user.role] || T.primary },
                ]}
              >
                <Text style={styles.demoAvatarTxt}>
                  {user.role.substring(0, 1)}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.demoName}>{user.name}</Text>
                <Text style={styles.demoEmail}>{user.email}</Text>
              </View>
            </Pressable>
          ))}
        </Animated.View>
      )}
    </Animated.View>
  );
});

// ═════════════════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ═════════════════════════════════════════════════════════════════════════════
export default function ModernAuthScreen() {
  const router = useRouter();
  const {
    signIn,
    signUp,
    signInWithGoogleAccessToken,
    twoFARegisterSendOtp,
    twoFARegisterVerify,
    twoFALoginRequestOtp,
    twoFALoginVerify,
    loading: authLoading,
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  // 2FA / OTP state
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpType, setOtpType] = useState<"register" | "login">("register");
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");

  const tabPos = useSharedValue(0);
  const tabIndicatorStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withSpring(tabPos.value * ((SCREEN_W - 80) / 2), {
          damping: 20,
          stiffness: 180,
        }),
      },
    ],
  }));

  // ───── Handlers ─────
  const switchMode = useCallback(
    (m: AuthMode) => {
      Keyboard.dismiss();
      setMode(m);
      setErrors({});
      tabPos.value = m === "login" ? 0 : 1;
    },
    [tabPos],
  );

  const updateField = useCallback(
    (field: keyof FormData, value: string) => {
      setFormData((p) => ({ ...p, [field]: value }));
      if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }));
    },
    [errors],
  );

  const validate = useCallback((): boolean => {
    const e: FormErrors = {};
    if (mode === "register" && !formData.name.trim())
      e.name = "Vui lòng nhập họ tên";
    if (!formData.email.trim()) e.email = "Vui lòng nhập email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      e.email = "Email không hợp lệ";
    if (!formData.password) e.password = "Vui lòng nhập mật khẩu";
    else if (formData.password.length < 6)
      e.password = "Mật khẩu tối thiểu 6 ký tự";
    if (mode === "register" && formData.password !== formData.confirmPassword)
      e.confirmPassword = "Mật khẩu không khớp";
    if (
      mode === "register" &&
      phone.trim() &&
      !/^(0|\+84)[0-9]{9,10}$/.test(phone.replace(/\s/g, ""))
    )
      e.general = "Số điện thoại không hợp lệ";
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [mode, formData, phone]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;
    Keyboard.dismiss();
    setLoading(true);
    try {
      if (mode === "login") {
        try {
          await signIn(formData.email.trim().toLowerCase(), formData.password);
          router.replace("/(tabs)");
        } catch (loginErr: any) {
          // Check if 2FA is required
          if (
            loginErr?.message?.includes("2FA") ||
            loginErr?.message?.includes("OTP") ||
            loginErr?.requires2FA
          ) {
            // Initiate 2FA login flow
            const otpResult = await twoFALoginRequestOtp(
              formData.email.trim().toLowerCase(),
              formData.password,
            );
            if (otpResult.success) {
              setTempToken(otpResult.tempToken || null);
              setOtpType("login");
              setOtpCode("");
              setOtpError("");
              setShowOTPModal(true);
            } else {
              Alert.alert(
                "Lỗi 2FA",
                otpResult.message || "Không thể gửi mã OTP",
              );
            }
          } else {
            throw loginErr;
          }
        }
      } else {
        // Registration: Try 2FA flow first (send OTP to verify email)
        const otpResult = await twoFARegisterSendOtp(
          formData.email.trim().toLowerCase(),
        );
        if (otpResult.success) {
          setOtpType("register");
          setOtpCode("");
          setOtpError("");
          setShowOTPModal(true);
        } else {
          // 2FA not available or OTP send failed, fallback to direct registration
          console.log(
            "[Auth] 2FA register not available, falling back to direct signup",
          );
          await signUp(
            formData.email.trim().toLowerCase(),
            formData.password,
            formData.name.trim(),
            undefined, // role
            phone.trim() || undefined,
          );
          router.replace("/(tabs)");
        }
      }
    } catch (error: any) {
      const msg = error?.message || "Có lỗi xảy ra. Vui lòng thử lại.";
      if (msg.includes("credentials") || msg.includes("password")) {
        setErrors({ password: "Email hoặc mật khẩu không đúng" });
      } else if (msg.includes("email") || msg.includes("exists")) {
        setErrors({ email: "Email đã được sử dụng" });
      } else {
        Alert.alert("Lỗi", msg);
      }
    } finally {
      setLoading(false);
    }
  }, [
    mode,
    formData,
    phone,
    validate,
    signIn,
    signUp,
    twoFARegisterSendOtp,
    twoFALoginRequestOtp,
    router,
  ]);

  // Handle OTP verification (for both register & login 2FA flows)
  const handleVerifyOTP = useCallback(async () => {
    if (otpCode.length < 4) {
      setOtpError("Vui lòng nhập đầy đủ mã OTP");
      return;
    }
    setOtpLoading(true);
    setOtpError("");
    try {
      let verifyResult;
      if (otpType === "register") {
        // 2FA Registration: Verify OTP + create account
        verifyResult = await twoFARegisterVerify(
          formData.email.trim().toLowerCase(),
          otpCode,
          formData.password,
          formData.name.trim(),
          phone.trim() || undefined,
        );
      } else {
        // 2FA Login: Verify OTP with tempToken
        verifyResult = await twoFALoginVerify(
          formData.email.trim().toLowerCase(),
          tempToken || "",
          otpCode,
        );
      }
      if (verifyResult.success) {
        setShowOTPModal(false);
        router.replace("/(tabs)");
      } else {
        setOtpError(
          verifyResult.message || "Mã OTP không hợp lệ. Vui lòng thử lại.",
        );
      }
    } catch (err: any) {
      setOtpError(err?.message || "Mã OTP không hợp lệ. Vui lòng thử lại.");
    } finally {
      setOtpLoading(false);
    }
  }, [
    otpCode,
    otpType,
    formData,
    phone,
    tempToken,
    twoFARegisterVerify,
    twoFALoginVerify,
    router,
  ]);

  // Resend OTP
  const handleResendOTP = useCallback(async () => {
    try {
      setOtpLoading(true);
      let resendResult;
      if (otpType === "register") {
        resendResult = await twoFARegisterSendOtp(
          formData.email.trim().toLowerCase(),
        );
      } else {
        resendResult = await twoFALoginRequestOtp(
          formData.email.trim().toLowerCase(),
          formData.password,
        );
      }
      if (resendResult.success) {
        Alert.alert("Đã gửi lại", "Mã OTP mới đã được gửi đến email của bạn.");
      } else {
        Alert.alert("Lỗi", resendResult.message || "Không thể gửi lại mã OTP");
      }
    } catch (err: any) {
      Alert.alert("Lỗi", err?.message || "Không thể gửi lại mã OTP");
    } finally {
      setOtpLoading(false);
    }
  }, [otpType, formData, twoFARegisterSendOtp, twoFALoginRequestOtp]);

  const handleSocialLogin = useCallback(
    async (provider: string) => {
      if (provider === "Google") {
        try {
          setLoading(true);
          const { makeRedirectUri } = await import("expo-auth-session");
          const extras = Constants.expoConfig?.extra || {};
          const clientId =
            extras.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
            extras.EXPO_PUBLIC_GOOGLE_CLIENT_ID ||
            "";
          if (!clientId) {
            Alert.alert("Cấu hình thiếu", "Chưa thiết lập Google Client ID.");
            return;
          }
          const redirectUri = makeRedirectUri({
            scheme: "appdesignbuild",
            path: "redirect",
          });
          const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent("openid email profile")}`;
          const result = await WebBrowser.openAuthSessionAsync(
            authUrl,
            redirectUri,
          );
          if (result.type === "success" && result.url) {
            const params = new URLSearchParams(result.url.split("#")[1]);
            const accessToken = params.get("access_token");
            if (accessToken) {
              await signInWithGoogleAccessToken(accessToken);
              router.replace("/(tabs)");
            } else {
              Alert.alert("Lỗi", "Không nhận được token từ Google.");
            }
          }
        } catch (error: any) {
          Alert.alert("Lỗi", error?.message || "Đăng nhập Google thất bại.");
        } finally {
          setLoading(false);
        }
      } else if (provider === "Facebook") {
        try {
          setLoading(true);
          const { makeRedirectUri } = await import("expo-auth-session");
          const extras = Constants.expoConfig?.extra || {};
          const fbAppId = extras.EXPO_PUBLIC_FACEBOOK_APP_ID || "";
          if (!fbAppId) {
            Alert.alert(
              "Cấu hình thiếu",
              "Chưa thiết lập Facebook App ID. Liên hệ admin.",
            );
            return;
          }
          const redirectUri = makeRedirectUri({
            scheme: "appdesignbuild",
            path: "redirect",
          });
          const fbAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${fbAppId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent("email,public_profile")}`;
          const result = await WebBrowser.openAuthSessionAsync(
            fbAuthUrl,
            redirectUri,
          );
          if (result.type === "success" && result.url) {
            const params = new URLSearchParams(result.url.split("#")[1]);
            const accessToken = params.get("access_token");
            if (accessToken) {
              // Fetch Facebook profile info
              const fbRes = await fetch(
                `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${accessToken}`,
              );
              const fbUser = await fbRes.json();
              // Call backend social login
              const { socialLogin } = require("@/services/api/authApi");
              await socialLogin("facebook", {
                token: accessToken,
                email: fbUser.email,
                name: fbUser.name,
                picture: fbUser.picture?.data?.url,
              });
              router.replace("/(tabs)");
            } else {
              Alert.alert("Lỗi", "Không nhận được token từ Facebook.");
            }
          }
        } catch (error: any) {
          Alert.alert("Lỗi", error?.message || "Đăng nhập Facebook thất bại.");
        } finally {
          setLoading(false);
        }
      } else if (provider === "Apple") {
        try {
          setLoading(true);
          if (Platform.OS !== "ios") {
            Alert.alert(
              "Không hỗ trợ",
              "Đăng nhập Apple chỉ khả dụng trên iOS.",
            );
            return;
          }
          // Use expo-apple-authentication if available
          try {
            const AppleAuth = require("expo-apple-authentication");
            const credential = await AppleAuth.signInAsync({
              requestedScopes: [
                AppleAuth.AppleAuthenticationScope.FULL_NAME,
                AppleAuth.AppleAuthenticationScope.EMAIL,
              ],
            });
            if (credential.identityToken) {
              const { socialLogin } = require("@/services/api/authApi");
              await socialLogin("apple", {
                token: credential.identityToken,
                email: credential.email || "",
                name: credential.fullName
                  ? `${credential.fullName.givenName || ""} ${credential.fullName.familyName || ""}`.trim()
                  : "",
              });
              router.replace("/(tabs)");
            }
          } catch (appleErr: any) {
            if (appleErr.code !== "ERR_CANCELED") {
              Alert.alert(
                "Lỗi",
                appleErr?.message || "Đăng nhập Apple thất bại.",
              );
            }
          }
        } finally {
          setLoading(false);
        }
      } else {
        Alert.alert(
          "Thông báo",
          `Đăng nhập với ${provider} sẽ sớm được hỗ trợ!`,
        );
      }
    },
    [signInWithGoogleAccessToken, router],
  );

  const handleDemoUserSelect = useCallback(
    (user: DemoUser) => {
      setFormData({
        name: user.name,
        email: user.email,
        password: user.password,
        confirmPassword: user.password,
      });
      setPhone("");
      setErrors({});
      setMode("login");
      tabPos.value = 0;
    },
    [tabPos],
  );

  const isLoading = loading || authLoading;

  // ───── Render ─────
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#0B0B1A", "#151530", "#0B0B1A"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative glows */}
      <View style={styles.glow1} />
      <View style={styles.glow2} />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* ── Logo ── */}
            <Animated.View
              entering={FadeInUp.delay(80).springify()}
              style={styles.logoWrap}
            >
              <LinearGradient
                colors={[T.primary, T.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logoBg}
              >
                <Ionicons name="home" size={32} color="#fff" />
              </LinearGradient>
              <Text style={styles.appTitle}>APP DESIGN BUILD</Text>
              <Text style={styles.appSub}>Xây dựng ngôi nhà mơ ước</Text>
            </Animated.View>

            {/* ── Card ── */}
            <Animated.View
              entering={FadeInUp.delay(180).springify()}
              style={styles.card}
            >
              {/* Tab Bar */}
              <View style={styles.tabBar}>
                <Animated.View
                  style={[styles.tabIndicator, tabIndicatorStyle]}
                />
                <Pressable
                  style={styles.tab}
                  onPress={() => switchMode("login")}
                >
                  <Text
                    style={[
                      styles.tabTxt,
                      mode === "login" && styles.tabTxtActive,
                    ]}
                  >
                    Đăng nhập
                  </Text>
                </Pressable>
                <Pressable
                  style={styles.tab}
                  onPress={() => switchMode("register")}
                >
                  <Text
                    style={[
                      styles.tabTxt,
                      mode === "register" && styles.tabTxtActive,
                    ]}
                  >
                    Đăng ký
                  </Text>
                </Pressable>
              </View>

              {/* Form */}
              <View style={styles.form}>
                {mode === "register" && (
                  <AnimatedInput
                    icon="person-outline"
                    placeholder="Họ và tên"
                    value={formData.name}
                    onChangeText={(v) => updateField("name", v)}
                    autoCapitalize="words"
                    error={errors.name}
                    disabled={isLoading}
                    delay={50}
                  />
                )}

                <AnimatedInput
                  icon="mail-outline"
                  placeholder="Email"
                  value={formData.email}
                  onChangeText={(v) => updateField("email", v)}
                  keyboardType="email-address"
                  error={errors.email}
                  disabled={isLoading}
                  delay={100}
                />

                <AnimatedInput
                  icon="lock-closed-outline"
                  placeholder="Mật khẩu"
                  value={formData.password}
                  onChangeText={(v) => updateField("password", v)}
                  secureTextEntry={!showPassword}
                  error={errors.password}
                  disabled={isLoading}
                  showPasswordToggle
                  onTogglePassword={() => setShowPassword(!showPassword)}
                  delay={150}
                />

                {mode === "register" && (
                  <PasswordStrength password={formData.password} />
                )}

                {mode === "register" && (
                  <AnimatedInput
                    icon="shield-checkmark-outline"
                    placeholder="Xác nhận mật khẩu"
                    value={formData.confirmPassword}
                    onChangeText={(v) => updateField("confirmPassword", v)}
                    secureTextEntry={!showPassword}
                    error={errors.confirmPassword}
                    disabled={isLoading}
                    delay={200}
                  />
                )}

                {mode === "register" && (
                  <Animated.View
                    entering={FadeInDown.delay(220).duration(350)}
                    style={styles.inputOuter}
                  >
                    <View style={styles.inputRow}>
                      <Ionicons
                        name="call-outline"
                        size={20}
                        color={T.textMuted}
                        style={{ marginRight: T.gap.md }}
                      />
                      <TextInput
                        style={styles.inputText}
                        placeholder="Số điện thoại (tuỳ chọn)"
                        placeholderTextColor={T.textDim}
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!isLoading}
                        selectionColor={T.primaryLight}
                      />
                    </View>
                  </Animated.View>
                )}

                {mode === "login" && (
                  <Pressable
                    style={styles.forgotBtn}
                    onPress={() => router.push("/(auth)/forgot-password")}
                  >
                    <Text style={styles.forgotTxt}>Quên mật khẩu?</Text>
                  </Pressable>
                )}

                {/* Submit */}
                <Animated.View entering={FadeInDown.delay(250).springify()}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.submitBtn,
                      pressed && {
                        opacity: 0.85,
                        transform: [{ scale: 0.98 }],
                      },
                      isLoading && { opacity: 0.6 },
                    ]}
                    onPress={handleSubmit}
                    disabled={isLoading}
                  >
                    <LinearGradient
                      colors={[T.primary, T.primaryDark]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.submitGrad}
                    >
                      {isLoading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.submitTxt}>
                          {mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
                        </Text>
                      )}
                    </LinearGradient>
                  </Pressable>
                </Animated.View>
              </View>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerTxt}>hoặc</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social */}
              <View style={styles.socialRow}>
                <SocialButton
                  icon="logo-google"
                  label="Google"
                  onPress={() => handleSocialLogin("Google")}
                  color="#EA4335"
                />
                <SocialButton
                  icon="logo-facebook"
                  label="Facebook"
                  onPress={() => handleSocialLogin("Facebook")}
                  color="#1877F2"
                />
                {Platform.OS === "ios" && (
                  <SocialButton
                    icon="logo-apple"
                    label="Apple"
                    onPress={() => handleSocialLogin("Apple")}
                    color="#000"
                  />
                )}
              </View>

              {/* Demo */}
              <DemoUserPicker
                onSelectUser={handleDemoUserSelect}
                disabled={isLoading}
              />
            </Animated.View>

            {/* Terms */}
            <Animated.Text entering={FadeIn.delay(500)} style={styles.terms}>
              Bằng việc tiếp tục, bạn đồng ý với{" "}
              <Text style={styles.termsLink}>Điều khoản</Text> và{" "}
              <Text style={styles.termsLink}>Chính sách</Text> của chúng tôi
            </Animated.Text>
          </ScrollView>

          {/* ══════ OTP Verification Modal (2FA) ══════ */}
          <Modal
            visible={showOTPModal}
            transparent
            animationType="slide"
            onRequestClose={() => setShowOTPModal(false)}
          >
            <View style={styles.otpOverlay}>
              <View style={styles.otpModal}>
                <View style={styles.otpHandle} />

                <Text style={styles.otpTitle}>
                  {otpType === "register"
                    ? "Xác thực Email"
                    : "Xác thực 2 bước"}
                </Text>
                <Text style={styles.otpSubtitle}>
                  Mã OTP đã được gửi đến{"\n"}
                  <Text style={{ color: T.primary, fontWeight: "700" }}>
                    {formData.email}
                  </Text>
                </Text>

                {/* OTP Input */}
                <View style={styles.otpInputWrap}>
                  <Ionicons name="keypad-outline" size={18} color="#666" />
                  <TextInput
                    style={styles.otpInput}
                    value={otpCode}
                    onChangeText={(v) => {
                      setOtpCode(v.replace(/[^0-9]/g, "").slice(0, 6));
                      setOtpError("");
                    }}
                    placeholder="Nhập mã OTP (6 số)"
                    placeholderTextColor="#666"
                    keyboardType="number-pad"
                    maxLength={6}
                    autoFocus
                  />
                </View>

                {otpError ? (
                  <Text style={styles.otpErrorText}>{otpError}</Text>
                ) : null}

                {/* Verify button */}
                <Pressable
                  style={[styles.otpVerifyBtn, otpLoading && { opacity: 0.6 }]}
                  onPress={handleVerifyOTP}
                  disabled={otpLoading}
                >
                  <LinearGradient
                    colors={[T.primary, T.primaryDark]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.otpVerifyGrad}
                  >
                    {otpLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.otpVerifyText}>Xác nhận</Text>
                    )}
                  </LinearGradient>
                </Pressable>

                {/* Resend */}
                <Pressable
                  onPress={handleResendOTP}
                  style={styles.otpResendBtn}
                  disabled={otpLoading}
                >
                  <Text style={styles.otpResendText}>Gửi lại mã OTP</Text>
                </Pressable>

                {/* Cancel */}
                <Pressable
                  onPress={() => setShowOTPModal(false)}
                  style={styles.otpCancelBtn}
                >
                  <Text style={styles.otpCancelText}>Hủy</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// STYLES
// ═════════════════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },

  glow1: {
    position: "absolute",
    top: -120,
    right: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: T.primaryGlow,
  },
  glow2: {
    position: "absolute",
    bottom: -80,
    left: -100,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: T.accentGlow,
  },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },

  // Logo
  logoWrap: { alignItems: "center", marginBottom: 28 },
  logoBg: {
    width: 68,
    height: 68,
    borderRadius: T.radius.xl,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    shadowColor: T.primary,
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  appTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: T.white,
    letterSpacing: 0.5,
  },
  appSub: { fontSize: 13, color: T.textSecondary, marginTop: 4 },

  // Card
  card: {
    backgroundColor: T.bgCard,
    borderRadius: T.radius.lg,
    padding: T.gap.xl,
    borderWidth: 1,
    borderColor: T.bgCardBorder,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },

  // Tabs
  tabBar: {
    flexDirection: "row",
    backgroundColor: T.bgInput,
    borderRadius: T.radius.md,
    padding: 3,
    marginBottom: T.gap.xl,
    position: "relative",
  },
  tabIndicator: {
    position: "absolute",
    top: 3,
    left: 3,
    width: "50%",
    height: "100%",
    borderRadius: T.radius.sm,
    backgroundColor: T.primary,
  },
  tab: {
    flex: 1,
    paddingVertical: 13,
    alignItems: "center",
    zIndex: 1,
  },
  tabTxt: { fontSize: 14, fontWeight: "600", color: T.textMuted },
  tabTxtActive: { color: T.white },

  // Form
  form: { gap: T.gap.lg },
  inputOuter: { gap: T.gap.xs },
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
  inputRowFocused: {
    borderColor: T.primary,
    shadowColor: T.primary,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 3,
  },
  inputRowError: { borderColor: T.error },
  inputText: { flex: 1, fontSize: 15, color: T.text },
  errorMsg: { fontSize: 12, color: T.error, marginLeft: 4 },

  // Strength
  strengthRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: T.gap.md,
    marginTop: -6,
  },
  strengthBars: { flexDirection: "row", gap: 4 },
  strengthBar: { width: 38, height: 4, borderRadius: 2 },
  strengthLabel: { fontSize: 12, fontWeight: "600" },

  // Forgot
  forgotBtn: { alignSelf: "flex-end", marginTop: -6 },
  forgotTxt: { fontSize: 13, color: T.primaryLight, fontWeight: "500" },

  // Submit
  submitBtn: { borderRadius: T.radius.md, overflow: "hidden" },
  submitGrad: {
    height: T.btnH,
    justifyContent: "center",
    alignItems: "center",
  },
  submitTxt: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.3,
  },

  // Divider
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: T.gap.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(100,100,160,0.2)",
  },
  dividerTxt: {
    fontSize: 13,
    color: T.textMuted,
    marginHorizontal: T.gap.lg,
  },

  // Social
  socialRow: { flexDirection: "row", gap: T.gap.md },
  socialBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: T.gap.sm,
    backgroundColor: T.bgInput,
    borderRadius: T.radius.md,
    borderWidth: 1,
    borderColor: T.bgInputBorder,
    paddingVertical: T.gap.md,
  },
  socialBtnTxt: { fontSize: 13, fontWeight: "600", color: T.text },

  // Terms
  terms: {
    fontSize: 12,
    color: T.textMuted,
    textAlign: "center",
    marginTop: T.gap.xl,
    lineHeight: 18,
  },
  termsLink: { color: T.primaryLight, fontWeight: "500" },

  // Demo
  demoWrap: {
    marginTop: T.gap.lg,
    borderTopWidth: 1,
    borderTopColor: "rgba(100,100,160,0.15)",
    paddingTop: T.gap.lg,
  },
  demoToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: T.gap.sm,
    paddingVertical: T.gap.sm,
  },
  demoToggleTxt: { fontSize: 13, color: T.warning, fontWeight: "500" },
  demoList: { marginTop: T.gap.md, gap: T.gap.sm },
  demoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: T.gap.md,
    backgroundColor: T.bgInput,
    borderRadius: T.radius.md,
    padding: T.gap.md,
    borderWidth: 1,
    borderColor: T.bgInputBorder,
  },
  demoAvatar: {
    width: 34,
    height: 34,
    borderRadius: T.radius.pill,
    justifyContent: "center",
    alignItems: "center",
  },
  demoAvatarTxt: { fontSize: 13, fontWeight: "700", color: "#fff" },
  demoName: { fontSize: 14, fontWeight: "600", color: T.text },
  demoEmail: { fontSize: 12, color: T.textMuted },

  // OTP Modal
  otpOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  otpModal: {
    backgroundColor: T.bgCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    alignItems: "center",
  },
  otpHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginBottom: 20,
  },
  otpTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: T.text,
    marginBottom: 8,
  },
  otpSubtitle: {
    fontSize: 14,
    color: T.textMuted,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  otpInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: T.bgInput,
    borderRadius: T.radius.md,
    borderWidth: 1,
    borderColor: T.bgInputBorder,
    paddingHorizontal: 14,
    height: 50,
    width: "100%",
    marginBottom: 12,
    gap: 10,
  },
  otpInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: T.text,
    letterSpacing: 8,
    textAlign: "center",
  },
  otpErrorText: {
    fontSize: 13,
    color: T.error,
    marginBottom: 10,
  },
  otpVerifyBtn: {
    width: "100%",
    marginTop: 8,
    borderRadius: T.radius.md,
    overflow: "hidden",
  },
  otpVerifyGrad: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: T.radius.md,
  },
  otpVerifyText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  otpResendBtn: {
    marginTop: 16,
    paddingVertical: 8,
  },
  otpResendText: {
    fontSize: 14,
    color: T.primaryLight,
    fontWeight: "600",
  },
  otpCancelBtn: {
    marginTop: 8,
    paddingVertical: 8,
  },
  otpCancelText: {
    fontSize: 14,
    color: T.textMuted,
  },
});
