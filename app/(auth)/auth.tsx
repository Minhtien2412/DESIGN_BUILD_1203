/**
 * Modern Auth Screen - Beautiful Login/Register
 *
 * Features:
 * - Animated tab switch between Login/Register
 * - Social login buttons
 * - Password strength indicator
 * - Modern minimal UI design
 * - Optimized performance
 * - Demo user quick select (DEV only)
 *
 * @created 2026-01-27
 */

import { DEMO_USERS, DemoUser } from "@/constants/demoUsers";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { memo, useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Keyboard,
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
    FadeIn,
    FadeInDown,
    FadeInUp,
    FadeOut,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

// ============================================================================
// THEME
// ============================================================================
const THEME = {
  colors: {
    // Primary gradient
    primary: "#7C3AED",
    primaryLight: "#A78BFA",
    primaryDark: "#5B21B6",

    // Accent
    accent: "#06B6D4",
    accentLight: "#67E8F9",

    // Backgrounds
    bg: "#0F0F23",
    bgCard: "#1A1A2E",
    bgInput: "#16213E",

    // Text
    text: "#FFFFFF",
    textSecondary: "#94A3B8",
    textMuted: "#64748B",

    // States
    error: "#EF4444",
    success: "#10B981",
    warning: "#F59E0B",

    // Borders
    border: "#334155",
    borderFocus: "#7C3AED",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
};

// ============================================================================
// TYPES
// ============================================================================
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
}

// ============================================================================
// COMPONENTS
// ============================================================================

// Animated Input Component
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
}: {
  icon: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address";
  autoCapitalize?: "none" | "words";
  error?: string;
  disabled?: boolean;
  showPasswordToggle?: boolean;
  onTogglePassword?: () => void;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <Animated.View
      entering={FadeInDown.delay(100).springify()}
      style={styles.inputContainer}
    >
      <View
        style={[
          styles.inputWrapper,
          focused && styles.inputFocused,
          error && styles.inputError,
        ]}
      >
        <Ionicons
          name={icon}
          size={20}
          color={focused ? THEME.colors.primary : THEME.colors.textMuted}
        />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={THEME.colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize || "none"}
          autoCorrect={false}
          editable={!disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {showPasswordToggle && (
          <Pressable onPress={onTogglePassword} hitSlop={10}>
            <Ionicons
              name={secureTextEntry ? "eye-outline" : "eye-off-outline"}
              size={20}
              color={THEME.colors.textMuted}
            />
          </Pressable>
        )}
      </View>
      {error && (
        <Animated.Text
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={styles.errorText}
        >
          {error}
        </Animated.Text>
      )}
    </Animated.View>
  );
});

// Password Strength Indicator
const PasswordStrength = memo(function PasswordStrength({
  password,
}: {
  password: string;
}) {
  const getStrength = useCallback(() => {
    if (!password)
      return { level: 0, label: "", color: THEME.colors.textMuted };

    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2)
      return { level: 1, label: "Yếu", color: THEME.colors.error };
    if (score <= 3)
      return { level: 2, label: "Trung bình", color: THEME.colors.warning };
    if (score <= 4)
      return { level: 3, label: "Mạnh", color: THEME.colors.accent };
    return { level: 4, label: "Rất mạnh", color: THEME.colors.success };
  }, [password]);

  const strength = getStrength();
  if (!password) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      style={styles.strengthContainer}
    >
      <View style={styles.strengthBars}>
        {[1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={[
              styles.strengthBar,
              {
                backgroundColor:
                  i <= strength.level ? strength.color : THEME.colors.border,
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

// Social Login Button
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
        styles.socialButton,
        pressed && styles.socialButtonPressed,
      ]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={22} color={color} />
      <Text style={styles.socialButtonText}>{label}</Text>
    </Pressable>
  );
});

// Demo User Picker (DEV only)
const DemoUserPicker = memo(function DemoUserPicker({
  onSelectUser,
  disabled,
}: {
  onSelectUser: (user: DemoUser) => void;
  disabled?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  if (!__DEV__) return null;

  const roleColors: Record<string, string> = {
    CLIENT: "#10B981",
    ENGINEER: "#F59E0B",
    CONTRACTOR: "#3B82F6",
    ADMIN: "#EF4444",
  };

  return (
    <Animated.View
      entering={FadeIn.delay(500)}
      style={styles.demoPickerContainer}
    >
      <Pressable
        style={styles.demoPickerToggle}
        onPress={() => setExpanded(!expanded)}
        disabled={disabled}
      >
        <Ionicons name="bug-outline" size={16} color={THEME.colors.warning} />
        <Text style={styles.demoPickerToggleText}>
          {expanded ? "Ẩn Demo Users" : "Chọn Demo User"}
        </Text>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={16}
          color={THEME.colors.textMuted}
        />
      </Pressable>
      {expanded && (
        <Animated.View
          entering={FadeInDown.duration(200)}
          style={styles.demoUserList}
        >
          {DEMO_USERS.map((user) => (
            <Pressable
              key={user.id}
              style={({ pressed }) => [
                styles.demoUserItem,
                pressed && styles.demoUserItemPressed,
              ]}
              onPress={() => {
                onSelectUser(user);
                setExpanded(false);
              }}
              disabled={disabled}
            >
              <View
                style={[
                  styles.demoUserRole,
                  { backgroundColor: roleColors[user.role] },
                ]}
              >
                <Text style={styles.demoUserRoleText}>
                  {user.role.substring(0, 1)}
                </Text>
              </View>
              <View style={styles.demoUserInfo}>
                <Text style={styles.demoUserName}>{user.name}</Text>
                <Text style={styles.demoUserEmail}>{user.email}</Text>
              </View>
            </Pressable>
          ))}
        </Animated.View>
      )}
    </Animated.View>
  );
});

// ============================================================================
// MAIN SCREEN
// ============================================================================
export default function ModernAuthScreen() {
  const router = useRouter();
  const { signIn, signUp, loading: authLoading } = useAuth();

  // State
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Animation
  const tabIndicatorPosition = useSharedValue(0);

  const tabIndicatorStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withSpring((tabIndicatorPosition.value * (width - 48)) / 2),
      },
    ],
  }));

  // Handlers
  const switchMode = useCallback((newMode: AuthMode) => {
    Keyboard.dismiss();
    setMode(newMode);
    setErrors({});
    tabIndicatorPosition.value = newMode === "login" ? 0 : 1;
  }, []);

  const updateField = useCallback(
    (field: keyof FormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors],
  );

  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (mode === "register" && !formData.name.trim()) {
      newErrors.name = "Vui lòng nhập họ tên";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu tối thiểu 6 ký tự";
    }

    if (mode === "register" && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [mode, formData]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;

    Keyboard.dismiss();
    setLoading(true);

    try {
      if (mode === "login") {
        await signIn(formData.email.trim().toLowerCase(), formData.password);
      } else {
        await signUp(
          formData.email.trim().toLowerCase(),
          formData.password,
          formData.name.trim(),
        );
      }
      router.replace("/(tabs)");
    } catch (error: any) {
      const message = error?.message || "Có lỗi xảy ra. Vui lòng thử lại.";
      if (message.includes("credentials") || message.includes("password")) {
        setErrors({ password: "Email hoặc mật khẩu không đúng" });
      } else if (message.includes("email") || message.includes("exists")) {
        setErrors({ email: "Email đã được sử dụng" });
      } else {
        Alert.alert("Lỗi", message);
      }
    } finally {
      setLoading(false);
    }
  }, [mode, formData, validate, signIn, signUp, router]);

  const handleSocialLogin = useCallback((provider: string) => {
    Alert.alert("Thông báo", `Đăng nhập với ${provider} sẽ sớm được hỗ trợ!`);
  }, []);

  const handleDemoUserSelect = useCallback((user: DemoUser) => {
    setFormData({
      name: user.name,
      email: user.email,
      password: user.password,
      confirmPassword: user.password,
    });
    setErrors({});
    setMode("login");
    tabIndicatorPosition.value = 0;
  }, []);

  const isLoading = loading || authLoading;

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={[THEME.colors.bg, THEME.colors.bgCard, THEME.colors.bg]}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative Circles */}
      <View style={styles.decorCircle1} />
      <View style={styles.decorCircle2} />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Logo */}
            <Animated.View
              entering={FadeInUp.delay(100).springify()}
              style={styles.logoContainer}
            >
              <LinearGradient
                colors={[THEME.colors.primary, THEME.colors.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logo}
              >
                <Ionicons name="home" size={36} color="#fff" />
              </LinearGradient>
              <Text style={styles.appName}>APP DESIGN BUILD</Text>
              <Text style={styles.appSlogan}>Xây dựng ngôi nhà mơ ước</Text>
            </Animated.View>

            {/* Auth Card */}
            <Animated.View
              entering={FadeInUp.delay(200).springify()}
              style={styles.card}
            >
              {/* Tab Switcher */}
              <View style={styles.tabContainer}>
                <Animated.View
                  style={[styles.tabIndicator, tabIndicatorStyle]}
                />
                <Pressable
                  style={styles.tab}
                  onPress={() => switchMode("login")}
                >
                  <Text
                    style={[
                      styles.tabText,
                      mode === "login" && styles.tabTextActive,
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
                      styles.tabText,
                      mode === "register" && styles.tabTextActive,
                    ]}
                  >
                    Đăng ký
                  </Text>
                </Pressable>
              </View>

              {/* Form */}
              <View style={styles.form}>
                {/* Name (Register only) */}
                {mode === "register" && (
                  <AnimatedInput
                    icon="person-outline"
                    placeholder="Họ và tên"
                    value={formData.name}
                    onChangeText={(v) => updateField("name", v)}
                    autoCapitalize="words"
                    error={errors.name}
                    disabled={isLoading}
                  />
                )}

                {/* Email */}
                <AnimatedInput
                  icon="mail-outline"
                  placeholder="Email"
                  value={formData.email}
                  onChangeText={(v) => updateField("email", v)}
                  keyboardType="email-address"
                  error={errors.email}
                  disabled={isLoading}
                />

                {/* Password */}
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
                />

                {/* Password Strength (Register only) */}
                {mode === "register" && (
                  <PasswordStrength password={formData.password} />
                )}

                {/* Confirm Password (Register only) */}
                {mode === "register" && (
                  <AnimatedInput
                    icon="shield-checkmark-outline"
                    placeholder="Xác nhận mật khẩu"
                    value={formData.confirmPassword}
                    onChangeText={(v) => updateField("confirmPassword", v)}
                    secureTextEntry={!showPassword}
                    error={errors.confirmPassword}
                    disabled={isLoading}
                  />
                )}

                {/* Forgot Password */}
                {mode === "login" && (
                  <Pressable
                    style={styles.forgotButton}
                    onPress={() => router.push("/(auth)/forgot-password")}
                  >
                    <Text style={styles.forgotText}>Quên mật khẩu?</Text>
                  </Pressable>
                )}

                {/* Submit Button */}
                <Animated.View entering={FadeInDown.delay(300).springify()}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.submitButton,
                      pressed && styles.submitButtonPressed,
                      isLoading && styles.submitButtonDisabled,
                    ]}
                    onPress={handleSubmit}
                    disabled={isLoading}
                  >
                    <LinearGradient
                      colors={[THEME.colors.primary, THEME.colors.primaryDark]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.submitButtonGradient}
                    >
                      {isLoading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.submitButtonText}>
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
                <Text style={styles.dividerText}>hoặc</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social Login */}
              <View style={styles.socialContainer}>
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
              </View>

              {/* Demo User Picker (DEV only) */}
              <DemoUserPicker
                onSelectUser={handleDemoUserSelect}
                disabled={isLoading}
              />
            </Animated.View>

            {/* Terms */}
            <Animated.Text
              entering={FadeIn.delay(400)}
              style={styles.termsText}
            >
              Bằng việc tiếp tục, bạn đồng ý với{" "}
              <Text style={styles.termsLink}>Điều khoản</Text> và{" "}
              <Text style={styles.termsLink}>Chính sách</Text> của chúng tôi
            </Animated.Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.bg,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: THEME.spacing.xl,
    paddingTop: THEME.spacing.xl,
    paddingBottom: THEME.spacing.xxl,
  },

  // Decorative
  decorCircle1: {
    position: "absolute",
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: THEME.colors.primary,
    opacity: 0.1,
  },
  decorCircle2: {
    position: "absolute",
    bottom: -50,
    left: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: THEME.colors.accent,
    opacity: 0.1,
  },

  // Logo
  logoContainer: {
    alignItems: "center",
    marginBottom: THEME.spacing.xxl,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: THEME.radius.xl,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: THEME.spacing.lg,
  },
  appName: {
    fontSize: 28,
    fontWeight: "700",
    color: THEME.colors.text,
    marginBottom: THEME.spacing.xs,
  },
  appSlogan: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
  },

  // Card
  card: {
    backgroundColor: THEME.colors.bgCard,
    borderRadius: THEME.radius.xl,
    padding: THEME.spacing.xl,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },

  // Tabs
  tabContainer: {
    flexDirection: "row",
    backgroundColor: THEME.colors.bgInput,
    borderRadius: THEME.radius.md,
    padding: 4,
    marginBottom: THEME.spacing.xl,
    position: "relative",
  },
  tabIndicator: {
    position: "absolute",
    top: 4,
    left: 4,
    width: "50%",
    height: "100%",
    backgroundColor: THEME.colors.primary,
    borderRadius: THEME.radius.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: THEME.spacing.md,
    alignItems: "center",
    zIndex: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: THEME.colors.textMuted,
  },
  tabTextActive: {
    color: THEME.colors.text,
  },

  // Form
  form: {
    gap: THEME.spacing.lg,
  },
  inputContainer: {
    gap: THEME.spacing.xs,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.bgInput,
    borderRadius: THEME.radius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    paddingHorizontal: THEME.spacing.lg,
    height: 52,
    gap: THEME.spacing.md,
  },
  inputFocused: {
    borderColor: THEME.colors.borderFocus,
  },
  inputError: {
    borderColor: THEME.colors.error,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: THEME.colors.text,
  },
  errorText: {
    fontSize: 12,
    color: THEME.colors.error,
    marginLeft: THEME.spacing.xs,
  },

  // Password Strength
  strengthContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: THEME.spacing.md,
    marginTop: -THEME.spacing.sm,
  },
  strengthBars: {
    flexDirection: "row",
    gap: 4,
  },
  strengthBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: "500",
  },

  // Forgot
  forgotButton: {
    alignSelf: "flex-end",
    marginTop: -THEME.spacing.sm,
  },
  forgotText: {
    fontSize: 13,
    color: THEME.colors.primary,
    fontWeight: "500",
  },

  // Submit
  submitButton: {
    borderRadius: THEME.radius.md,
    overflow: "hidden",
  },
  submitButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonGradient: {
    height: 52,
    justifyContent: "center",
    alignItems: "center",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },

  // Divider
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: THEME.spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: THEME.colors.border,
  },
  dividerText: {
    fontSize: 13,
    color: THEME.colors.textMuted,
    marginHorizontal: THEME.spacing.lg,
  },

  // Social
  socialContainer: {
    flexDirection: "row",
    gap: THEME.spacing.md,
  },
  socialButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: THEME.spacing.sm,
    backgroundColor: THEME.colors.bgInput,
    borderRadius: THEME.radius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    paddingVertical: THEME.spacing.md,
  },
  socialButtonPressed: {
    opacity: 0.8,
  },
  socialButtonText: {
    fontSize: 13,
    fontWeight: "500",
    color: THEME.colors.text,
  },

  // Terms
  termsText: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    textAlign: "center",
    marginTop: THEME.spacing.xl,
    lineHeight: 18,
  },
  termsLink: {
    color: THEME.colors.primary,
    fontWeight: "500",
  },

  // Demo User Picker
  demoPickerContainer: {
    marginTop: THEME.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    paddingTop: THEME.spacing.lg,
  },
  demoPickerToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: THEME.spacing.sm,
    paddingVertical: THEME.spacing.sm,
  },
  demoPickerToggleText: {
    fontSize: 13,
    color: THEME.colors.warning,
    fontWeight: "500",
  },
  demoUserList: {
    marginTop: THEME.spacing.md,
    gap: THEME.spacing.sm,
  },
  demoUserItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: THEME.spacing.md,
    backgroundColor: THEME.colors.bgInput,
    borderRadius: THEME.radius.md,
    padding: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  demoUserItemPressed: {
    opacity: 0.8,
    borderColor: THEME.colors.primary,
  },
  demoUserRole: {
    width: 32,
    height: 32,
    borderRadius: THEME.radius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  demoUserRoleText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
  },
  demoUserInfo: {
    flex: 1,
  },
  demoUserName: {
    fontSize: 14,
    fontWeight: "600",
    color: THEME.colors.text,
  },
  demoUserEmail: {
    fontSize: 12,
    color: THEME.colors.textMuted,
  },
});
