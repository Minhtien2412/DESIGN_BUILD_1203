/**
 * Unified Login Screen
 * ====================
 *
 * Màn hình đăng nhập hợp nhất với:
 * - Email/Password login
 * - Phone/OTP login
 * - Zalo Mini App login
 * - Trusted Device auto-login (30 ngày)
 * - 🔐 Biometric Authentication (Vân tay / Face ID)
 *
 * Backend: https://baotienweb.cloud/api/v1
 * VPS: root@103.200.20.100 (baotienweb-api)
 */

import { useAuth } from "@/context/AuthContext";
import {
    biometricAuth,
    BiometricType,
    getBiometricIcon,
    getBiometricName,
} from "@/services/biometricAuthService";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    Vibration,
    View,
} from "react-native";

const { width: _width, height: _height } = Dimensions.get("window");

// ==================== THEME ====================

const COLORS = {
  primary: "#0066CC",
  primaryDark: "#004499",
  primaryLight: "#E6F0FF",
  secondary: "#00C853",
  background: "#FFFFFF",
  surface: "#F8F9FA",
  text: "#1A1A1A",
  textMuted: "#6B7280",
  border: "#E5E7EB",
  error: "#DC2626",
  warning: "#F59E0B",
  success: "#10B981",
  zalo: "#0068FF",
};

// ==================== TYPES ====================

type LoginMode = "email" | "phone";
type AuthStep = "input" | "otp-verify" | "complete-profile";

interface FormData {
  email: string;
  password: string;
  phone: string;
  otp: string;
  name: string;
}

// ==================== OTP INPUT COMPONENT ====================

const OTPInputBox = ({
  value,
  onChange,
  length = 6,
}: {
  value: string;
  onChange: (code: string) => void;
  length?: number;
}) => {
  const inputRef = useRef<TextInput>(null);

  return (
    <TouchableOpacity
      onPress={() => inputRef.current?.focus()}
      activeOpacity={1}
    >
      <View style={styles.otpContainer}>
        {Array.from({ length }, (_, i) => (
          <View
            key={i}
            style={[styles.otpBox, value[i] ? styles.otpBoxFilled : null]}
          >
            <Text style={styles.otpText}>{value[i] || ""}</Text>
          </View>
        ))}
      </View>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(text) =>
          onChange(text.replace(/\D/g, "").slice(0, length))
        }
        keyboardType="number-pad"
        maxLength={length}
        style={styles.otpHiddenInput}
        autoFocus
      />
    </TouchableOpacity>
  );
};

// ==================== MAIN COMPONENT ====================

export default function UnifiedLoginScreen() {
  const router = useRouter();
  const {
    signIn,
    restoreSessionFromBiometric,
    sendOTP,
    verifyOTP,
    checkTrustedDevice,
    autoLoginWithTrustedDevice,
    loading: authLoading,
    isAuthenticated,
  } = useAuth();

  // State
  const [loginMode, setLoginMode] = useState<LoginMode>("email");
  const [authStep, setAuthStep] = useState<AuthStep>("input");
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    phone: "",
    otp: "",
    name: "",
  });
  const [sessionId, setSessionId] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [_isNewUser, setIsNewUser] = useState(false);

  // Biometric state
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<BiometricType>("none");
  const [canUseBiometric, setCanUseBiometric] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [showBiometricSetup, setShowBiometricSetup] = useState(false);
  const [pendingCredentials, setPendingCredentials] = useState<{
    userId: string;
    email?: string;
    accessToken: string;
    refreshToken: string;
  } | null>(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // ==================== EFFECTS ====================

  // Check biometric capability on mount
  useEffect(() => {
    const checkBiometric = async () => {
      try {
        const capability = await biometricAuth.checkCapability();
        setBiometricAvailable(capability.isSupported && capability.isEnrolled);

        const type = await biometricAuth.getPrimaryBiometricType();
        setBiometricType(type);

        const canUse = await biometricAuth.canUseBiometricLogin();
        setCanUseBiometric(canUse);

        console.log("[Login] Biometric check:", {
          available: capability.isSupported && capability.isEnrolled,
          type,
          canUse,
        });

        // Auto-prompt biometric if available and credentials saved
        if (canUse) {
          // Small delay to let UI render first
          setTimeout(() => {
            handleBiometricLogin();
          }, 500);
        }
      } catch (error) {
        console.error("[Login] Biometric check error:", error);
      }
    };

    checkBiometric();
  }, []);

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      router.replace("/(tabs)" as any);
    }
  }, [isAuthenticated]);

  // OTP countdown timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // ==================== VALIDATION ====================

  const isPhoneNumber = (value: string): boolean => {
    const cleaned = value.replace(/\D/g, "");
    return cleaned.length >= 9 && /^[0-9+]+$/.test(value.replace(/\s/g, ""));
  };

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (loginMode === "email") {
      if (!formData.email.trim()) {
        newErrors.email = "Vui lòng nhập email";
      } else if (!validateEmail(formData.email)) {
        newErrors.email = "Email không hợp lệ";
      }

      if (!formData.password) {
        newErrors.password = "Vui lòng nhập mật khẩu";
      } else if (formData.password.length < 6) {
        newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
      }
    } else {
      if (!formData.phone.trim()) {
        newErrors.phone = "Vui lòng nhập số điện thoại";
      } else if (!isPhoneNumber(formData.phone)) {
        newErrors.phone = "Số điện thoại không hợp lệ";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ==================== ANIMATIONS ====================

  const triggerShake = () => {
    Vibration.vibrate(100);
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
  };

  // ==================== HANDLERS ====================

  // Biometric Login Handler
  const handleBiometricLogin = useCallback(async () => {
    if (!canUseBiometric || biometricLoading) return;

    try {
      setBiometricLoading(true);
      setErrors({});

      const result = await biometricAuth.loginWithBiometric();

      if (result.success && result.credentials) {
        console.log("[Login] Biometric login success, restoring session");

        // Use stored credentials to restore session
        const restored = await restoreSessionFromBiometric(
          result.credentials.accessToken,
          result.credentials.refreshToken,
        );

        if (!restored) {
          // Token expired or invalid, clear biometric and ask for password
          await biometricAuth.clearCredentials();
          setCanUseBiometric(false);
          setErrors({
            general: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.",
          });
        }
        // If restored successfully, isAuthenticated will change and redirect
      } else if (result.error === "USER_FALLBACK") {
        // User chose to use password instead
        console.log("[Login] User chose password fallback");
      } else if (result.error !== "USER_CANCEL") {
        // Show error only if not cancelled by user
        setErrors({ general: result.message });
      }
    } catch (error: any) {
      console.error("[Login] Biometric login error:", error);
      setErrors({ general: "Xác thực sinh trắc học thất bại" });
    } finally {
      setBiometricLoading(false);
    }
  }, [canUseBiometric, biometricLoading, restoreSessionFromBiometric]);

  // Prompt to enable biometric after successful login
  const promptBiometricSetup = useCallback(
    async (credentials: {
      userId: string;
      email?: string;
      accessToken: string;
      refreshToken: string;
    }) => {
      if (!biometricAvailable) return;

      // Check if already enabled
      const isEnabled = await biometricAuth.isEnabled();
      if (isEnabled) return;

      setPendingCredentials(credentials);
      setShowBiometricSetup(true);
    },
    [biometricAvailable],
  );

  // Handle biometric setup confirmation
  const handleEnableBiometric = async () => {
    if (!pendingCredentials) return;

    try {
      setLoading(true);

      const result = await biometricAuth.saveCredentials({
        userId: pendingCredentials.userId,
        email: pendingCredentials.email,
        accessToken: pendingCredentials.accessToken,
        refreshToken: pendingCredentials.refreshToken,
      });

      if (result.success) {
        Alert.alert(
          "✅ Đã kích hoạt",
          `${getBiometricName(biometricType)} đã được bật. Lần sau bạn có thể đăng nhập nhanh hơn!`,
          [
            {
              text: "Tuyệt vời",
              onPress: () => router.replace("/(tabs)" as any),
            },
          ],
        );
      } else {
        Alert.alert("Lỗi", result.message);
        router.replace("/(tabs)" as any);
      }
    } catch (error) {
      console.error("[Login] Enable biometric error:", error);
      router.replace("/(tabs)" as any);
    } finally {
      setLoading(false);
      setShowBiometricSetup(false);
      setPendingCredentials(null);
    }
  };

  // Skip biometric setup
  const handleSkipBiometric = () => {
    setShowBiometricSetup(false);
    setPendingCredentials(null);
    router.replace("/(tabs)" as any);
  };

  const handleEmailLogin = async () => {
    if (!validateForm()) {
      triggerShake();
      return;
    }

    try {
      setLoading(true);
      setErrors({});
      Keyboard.dismiss();

      const result = await signIn(formData.email, formData.password);

      // If biometric available and not yet enabled, prompt to enable
      if (biometricAvailable && result?.user) {
        await promptBiometricSetup({
          userId: result.user.id || "",
          email: formData.email,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        });
        return; // Don't navigate yet, wait for biometric prompt
      }

      // Navigation handled by useEffect on isAuthenticated change
    } catch (error: any) {
      console.error("[Login] Email login failed:", error);
      setErrors({
        general: error.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại.",
      });
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!formData.phone.trim() || !isPhoneNumber(formData.phone)) {
      setErrors({ phone: "Vui lòng nhập số điện thoại hợp lệ" });
      triggerShake();
      return;
    }

    try {
      setLoading(true);
      setErrors({});
      Keyboard.dismiss();

      // Check trusted device first
      const trusted = await checkTrustedDevice(formData.phone);

      if (trusted.trusted) {
        // Auto-login without OTP
        Alert.alert(
          "Thiết bị được tin tưởng",
          `Thiết bị này đã được xác thực trước đó (còn ${trusted.daysRemaining} ngày). Bạn muốn đăng nhập tự động?`,
          [
            { text: "Không, gửi OTP", onPress: () => proceedSendOTP() },
            { text: "Đăng nhập", onPress: () => handleAutoLogin() },
          ],
        );
        return;
      }

      await proceedSendOTP();
    } catch (error: any) {
      console.error("[Login] Send OTP failed:", error);
      setErrors({
        general: error.message || "Không thể gửi OTP. Vui lòng thử lại.",
      });
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const proceedSendOTP = async () => {
    setLoading(true);

    const result = await sendOTP(formData.phone);

    if (result.success) {
      setSessionId(result.sessionId || "");
      setOtpTimer(result.expiresIn || 300);
      setAuthStep("otp-verify");
    } else {
      setErrors({ general: result.message });
      triggerShake();
    }

    setLoading(false);
  };

  const handleAutoLogin = async () => {
    try {
      setLoading(true);

      const result = await autoLoginWithTrustedDevice(formData.phone);

      if (!result.success) {
        // Auto-login failed, proceed with OTP
        await proceedSendOTP();
      }
      // Success case handled by isAuthenticated effect
    } catch (error: any) {
      console.error("[Login] Auto-login failed:", error);
      await proceedSendOTP();
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (formData.otp.length < 6) {
      setErrors({ otp: "Vui lòng nhập đủ 6 số" });
      triggerShake();
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      const result = await verifyOTP(formData.phone, formData.otp, sessionId);

      if (result.success) {
        if (result.isNewUser) {
          setIsNewUser(true);
          setAuthStep("complete-profile");
        }
        // else: Navigation handled by isAuthenticated effect
      } else {
        setErrors({ otp: result.message || "Mã OTP không đúng" });
        triggerShake();
      }
    } catch (error: any) {
      console.error("[Login] Verify OTP failed:", error);
      setErrors({ otp: error.message || "Xác thực OTP thất bại" });
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (otpTimer > 0) return;

    setFormData((prev) => ({ ...prev, otp: "" }));
    await proceedSendOTP();
  };

  const handleZaloLogin = async () => {
    try {
      setLoading(true);
      setErrors({});

      // TODO: Integrate with Zalo Mini App SDK
      // For now, show coming soon message
      Alert.alert(
        "Zalo Mini App",
        "Tính năng đăng nhập Zalo Mini App đang được phát triển. Vui lòng sử dụng đăng nhập bằng OTP.",
        [{ text: "OK" }],
      );

      /*
      // Zalo Mini App flow:
      const zaloAuth = await zaloMiniAppAuth.login();
      if (zaloAuth.success) {
        const userInfo = await zaloMiniAppAuth.getUserInfo();
        await signInWithZalo(zaloAuth.userId, zaloAuth.accessToken, {
          name: userInfo.name,
          avatar: userInfo.avatar,
          phone: userInfo.phone,
        });
      }
      */
    } catch (error: any) {
      console.error("[Login] Zalo login failed:", error);
      setErrors({ general: error.message || "Đăng nhập Zalo thất bại" });
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchMode = (mode: LoginMode) => {
    setLoginMode(mode);
    setAuthStep("input");
    setErrors({});
    setFormData((prev) => ({ ...prev, otp: "" }));
  };

  const handleBackToInput = () => {
    setAuthStep("input");
    setFormData((prev) => ({ ...prev, otp: "" }));
    setErrors({});
  };

  // ==================== RENDER ====================

  const renderEmailForm = () => (
    <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
      {/* Email Input */}
      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={20} color={COLORS.textMuted} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={COLORS.textMuted}
          value={formData.email}
          onChangeText={(text) => {
            setFormData((prev) => ({ ...prev, email: text }));
            setErrors((prev) => ({ ...prev, email: "" }));
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <Ionicons
          name="lock-closed-outline"
          size={20}
          color={COLORS.textMuted}
        />
        <TextInput
          style={styles.input}
          placeholder="Mật khẩu"
          placeholderTextColor={COLORS.textMuted}
          value={formData.password}
          onChangeText={(text) => {
            setFormData((prev) => ({ ...prev, password: text }));
            setErrors((prev) => ({ ...prev, password: "" }));
          }}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons
            name={showPassword ? "eye-outline" : "eye-off-outline"}
            size={20}
            color={COLORS.textMuted}
          />
        </TouchableOpacity>
      </View>
      {errors.password && (
        <Text style={styles.errorText}>{errors.password}</Text>
      )}

      {/* Forgot Password */}
      <TouchableOpacity
        onPress={() => router.push("/(auth)/forgot-password" as any)}
        style={styles.forgotPassword}
      >
        <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
      </TouchableOpacity>

      {/* Login Button */}
      <TouchableOpacity
        style={[
          styles.primaryButton,
          (loading || authLoading) && styles.buttonDisabled,
        ]}
        onPress={handleEmailLogin}
        disabled={loading || authLoading}
      >
        {loading || authLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryButtonText}>Đăng nhập</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  const renderPhoneForm = () => (
    <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
      {/* Phone Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.phonePrefix}>+84</Text>
        <TextInput
          style={styles.input}
          placeholder="Số điện thoại"
          placeholderTextColor={COLORS.textMuted}
          value={formData.phone}
          onChangeText={(text) => {
            setFormData((prev) => ({
              ...prev,
              phone: text.replace(/[^0-9]/g, ""),
            }));
            setErrors((prev) => ({ ...prev, phone: "" }));
          }}
          keyboardType="phone-pad"
          maxLength={10}
        />
      </View>
      {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

      {/* Send OTP Button */}
      <TouchableOpacity
        style={[
          styles.primaryButton,
          (loading || authLoading) && styles.buttonDisabled,
        ]}
        onPress={handleSendOTP}
        disabled={loading || authLoading}
      >
        {loading || authLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryButtonText}>Gửi mã OTP</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  const renderOTPVerify = () => (
    <Animated.View style={{ opacity: fadeAnim }}>
      <TouchableOpacity onPress={handleBackToInput} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        <Text style={styles.backButtonText}>Quay lại</Text>
      </TouchableOpacity>

      <Text style={styles.otpTitle}>Nhập mã OTP</Text>
      <Text style={styles.otpSubtitle}>
        Mã xác thực đã được gửi đến số {"\n"}
        <Text style={{ fontWeight: "600" }}>+84 {formData.phone}</Text>
      </Text>

      <OTPInputBox
        value={formData.otp}
        onChange={(code) => {
          setFormData((prev) => ({ ...prev, otp: code }));
          setErrors((prev) => ({ ...prev, otp: "" }));
        }}
      />
      {errors.otp && <Text style={styles.errorText}>{errors.otp}</Text>}

      {/* Timer / Resend */}
      <View style={styles.resendContainer}>
        {otpTimer > 0 ? (
          <Text style={styles.timerText}>
            Gửi lại mã sau {Math.floor(otpTimer / 60)}:
            {(otpTimer % 60).toString().padStart(2, "0")}
          </Text>
        ) : (
          <TouchableOpacity onPress={handleResendOTP}>
            <Text style={styles.resendText}>Gửi lại mã OTP</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Verify Button */}
      <TouchableOpacity
        style={[
          styles.primaryButton,
          (loading || authLoading || formData.otp.length < 6) &&
            styles.buttonDisabled,
        ]}
        onPress={handleVerifyOTP}
        disabled={loading || authLoading || formData.otp.length < 6}
      >
        {loading || authLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryButtonText}>Xác nhận</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  const renderCompleteProfile = () => (
    <Animated.View style={{ opacity: fadeAnim }}>
      <Text style={styles.otpTitle}>Hoàn tất hồ sơ</Text>
      <Text style={styles.otpSubtitle}>
        Bạn là người dùng mới. Vui lòng nhập tên của bạn.
      </Text>

      <View style={styles.inputContainer}>
        <Ionicons name="person-outline" size={20} color={COLORS.textMuted} />
        <TextInput
          style={styles.input}
          placeholder="Họ và tên"
          placeholderTextColor={COLORS.textMuted}
          value={formData.name}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, name: text }))
          }
          autoCapitalize="words"
        />
      </View>

      <TouchableOpacity
        style={[
          styles.primaryButton,
          !formData.name.trim() && styles.buttonDisabled,
        ]}
        onPress={() => {
          // Profile update handled, navigate to home
          router.replace("/(tabs)" as any);
        }}
        disabled={!formData.name.trim()}
      >
        <Text style={styles.primaryButtonText}>Hoàn tất</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  // ==================== MAIN RENDER ====================

  return (
    <LinearGradient colors={["#FFFFFF", "#F0F7FF"]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Logo */}
            <View style={styles.logoContainer}>
              <View style={styles.logoBox}>
                <MaterialCommunityIcons
                  name="home-city"
                  size={48}
                  color={COLORS.primary}
                />
              </View>
              <Text style={styles.appName}>DESIGN BUILD</Text>
              <Text style={styles.tagline}>Nền tảng Xây dựng & Thương mại</Text>
            </View>

            {/* Error Message */}
            {errors.general && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={20} color={COLORS.error} />
                <Text style={styles.errorBannerText}>{errors.general}</Text>
              </View>
            )}

            {/* Content based on step */}
            {authStep === "input" && (
              <>
                {/* Mode Tabs */}
                <View style={styles.modeTabs}>
                  <TouchableOpacity
                    style={[
                      styles.modeTab,
                      loginMode === "email" && styles.modeTabActive,
                    ]}
                    onPress={() => handleSwitchMode("email")}
                  >
                    <Ionicons
                      name="mail-outline"
                      size={18}
                      color={
                        loginMode === "email"
                          ? COLORS.primary
                          : COLORS.textMuted
                      }
                    />
                    <Text
                      style={[
                        styles.modeTabText,
                        loginMode === "email" && styles.modeTabTextActive,
                      ]}
                    >
                      Email
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.modeTab,
                      loginMode === "phone" && styles.modeTabActive,
                    ]}
                    onPress={() => handleSwitchMode("phone")}
                  >
                    <Ionicons
                      name="phone-portrait-outline"
                      size={18}
                      color={
                        loginMode === "phone"
                          ? COLORS.primary
                          : COLORS.textMuted
                      }
                    />
                    <Text
                      style={[
                        styles.modeTabText,
                        loginMode === "phone" && styles.modeTabTextActive,
                      ]}
                    >
                      Số điện thoại
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Form */}
                {loginMode === "email" ? renderEmailForm() : renderPhoneForm()}

                {/* Biometric Login Button */}
                {canUseBiometric && (
                  <TouchableOpacity
                    style={styles.biometricButton}
                    onPress={handleBiometricLogin}
                    disabled={biometricLoading}
                  >
                    {biometricLoading ? (
                      <ActivityIndicator color={COLORS.primary} size="small" />
                    ) : (
                      <>
                        <Ionicons
                          name={getBiometricIcon(biometricType) as any}
                          size={24}
                          color={COLORS.primary}
                        />
                        <Text style={styles.biometricButtonText}>
                          Đăng nhập bằng {getBiometricName(biometricType)}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}

                {/* Divider */}
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>hoặc</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Zalo Login */}
                <TouchableOpacity
                  style={styles.zaloButton}
                  onPress={handleZaloLogin}
                >
                  <View style={styles.zaloIcon}>
                    <Text style={styles.zaloIconText}>Z</Text>
                  </View>
                  <Text style={styles.zaloButtonText}>Đăng nhập với Zalo</Text>
                </TouchableOpacity>

                {/* Register Link */}
                <View style={styles.registerContainer}>
                  <Text style={styles.registerText}>Chưa có tài khoản? </Text>
                  <TouchableOpacity
                    onPress={() => router.push("/(auth)/register" as any)}
                  >
                    <Text style={styles.registerLink}>Đăng ký ngay</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {authStep === "otp-verify" && renderOTPVerify()}
            {authStep === "complete-profile" && renderCompleteProfile()}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Biometric Setup Modal */}
      {showBiometricSetup && (
        <View style={styles.modalOverlay}>
          <View style={styles.biometricModal}>
            <View style={styles.biometricModalIcon}>
              <Ionicons
                name={getBiometricIcon(biometricType) as any}
                size={48}
                color={COLORS.primary}
              />
            </View>

            <Text style={styles.biometricModalTitle}>
              Kích hoạt {getBiometricName(biometricType)}?
            </Text>

            <Text style={styles.biometricModalText}>
              Đăng nhập nhanh hơn với {getBiometricName(biometricType)}.{"\n"}
              Không cần nhập mật khẩu mỗi lần mở app.
            </Text>

            <TouchableOpacity
              style={styles.biometricModalButton}
              onPress={handleEnableBiometric}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="shield-checkmark" size={20} color="#fff" />
                  <Text style={styles.biometricModalButtonText}>
                    Kích hoạt ngay
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.biometricModalSkip}
              onPress={handleSkipBiometric}
            >
              <Text style={styles.biometricModalSkipText}>Để sau</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </LinearGradient>
  );
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  content: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.error,
  },
  modeTabs: {
    flexDirection: "row",
    marginBottom: 24,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 4,
  },
  modeTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  modeTabActive: {
    backgroundColor: COLORS.background,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  modeTabText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: "500",
  },
  modeTabTextActive: {
    color: COLORS.primary,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 12,
  },
  phonePrefix: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "500",
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: -8,
    marginBottom: 12,
    marginLeft: 4,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: COLORS.primary,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: COLORS.border,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
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
  zaloButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.zalo,
    borderRadius: 12,
    height: 52,
    gap: 10,
  },
  zaloIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  zaloIconText: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.zalo,
  },
  zaloButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  registerText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },
  // OTP Styles
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.primary,
  },
  otpTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 8,
  },
  otpSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 16,
  },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.surface,
  },
  otpBoxFilled: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  otpText: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
  },
  otpHiddenInput: {
    position: "absolute",
    opacity: 0,
    height: 1,
    width: 1,
  },
  resendContainer: {
    alignItems: "center",
    marginVertical: 16,
  },
  timerText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  resendText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },
  // Biometric Styles
  biometricButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    height: 52,
    marginTop: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
  },
  biometricButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.primary,
  },
  // Biometric Modal Styles
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  biometricModal: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
  },
  biometricModalIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  biometricModalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
    textAlign: "center",
  },
  biometricModalText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  biometricModalButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 52,
    width: "100%",
    gap: 8,
  },
  biometricModalButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  biometricModalSkip: {
    marginTop: 16,
    padding: 8,
  },
  biometricModalSkipText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
});
