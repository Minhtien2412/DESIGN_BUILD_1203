/**
 * Unified Register Screen
 * =======================
 *
 * Màn hình đăng ký hợp nhất với:
 * - Email/Password registration
 * - Phone/OTP registration
 * - Location selection
 * - Role selection
 *
 * Backend: https://baotienweb.cloud/api/v1
 * VPS: root@103.200.20.100 (baotienweb-api)
 */

import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/services/auth/authService";
import { useI18n } from "@/services/i18nService";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
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

const { width: _width } = Dimensions.get("window");

// ==================== THEME ====================

const COLORS = {
  primary: "#0D9488",
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
};

// ==================== TYPES ====================

type RegisterMode = "email" | "phone";
type AuthStep = "input" | "otp-verify" | "profile";

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  otp: string;
  name: string;
  role: UserRole;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  } | null;
}

const ROLE_OPTION_KEYS: {
  value: UserRole;
  labelKey: string;
  icon: string;
  descKey: string;
}[] = [
  {
    value: "CLIENT",
    labelKey: "register.roleClient",
    icon: "person",
    descKey: "register.roleClientDesc",
  },
  {
    value: "CONTRACTOR",
    labelKey: "register.roleContractor",
    icon: "construct",
    descKey: "register.roleContractorDesc",
  },
  {
    value: "ARCHITECT",
    labelKey: "register.roleArchitect",
    icon: "grid",
    descKey: "register.roleArchitectDesc",
  },
  {
    value: "DESIGNER",
    labelKey: "register.roleDesigner",
    icon: "color-palette",
    descKey: "register.roleDesignerDesc",
  },
  {
    value: "SUPPLIER",
    labelKey: "register.roleSupplier",
    icon: "cube",
    descKey: "register.roleSupplierDesc",
  },
  {
    value: "ENGINEER",
    labelKey: "register.roleEngineer",
    icon: "hardware-chip",
    descKey: "register.roleEngineerDesc",
  },
];

// ==================== OTP INPUT ====================

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

export default function UnifiedRegisterScreen() {
  const router = useRouter();
  const {
    signUp,
    sendOTP,
    verifyOTP,
    registerWithPhone,
    loading: authLoading,
    isAuthenticated,
  } = useAuth();
  const { t } = useI18n();

  // State
  const [registerMode, setRegisterMode] = useState<RegisterMode>("email");
  const [authStep, setAuthStep] = useState<AuthStep>("input");
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    otp: "",
    name: "",
    role: "CLIENT",
    location: null,
  });
  const [sessionId, setSessionId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [locationLoading, setLocationLoading] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [faceEmbedding, setFaceEmbedding] = useState<number[] | null>(null);
  const [faceVerified, setFaceVerified] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // ==================== EFFECTS ====================

  useEffect(() => {
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
    if (isAuthenticated) {
      router.replace("/(tabs)" as any);
    }
  }, [isAuthenticated]);

  // Check for face verification result when screen regains focus
  useFocusEffect(
    useCallback(() => {
      const checkFaceResult = async () => {
        try {
          const result = await AsyncStorage.getItem(
            "@face_verification_result",
          );
          if (result) {
            const { embedding, verified } = JSON.parse(result);
            if (verified && embedding) {
              setFaceEmbedding(embedding);
              setFaceVerified(true);
            }
            await AsyncStorage.removeItem("@face_verification_result");
          }
        } catch (err) {
          console.warn(
            "[Register] Failed to read face verification result:",
            err,
          );
        }
      };
      checkFaceResult();
    }, []),
  );

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

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isPhoneNumber = (value: string): boolean => {
    const cleaned = value.replace(/\D/g, "");
    return cleaned.length >= 9;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t("register.errName");
    }

    if (registerMode === "email") {
      if (!formData.email.trim()) {
        newErrors.email = t("register.errEmail");
      } else if (!validateEmail(formData.email)) {
        newErrors.email = t("register.errEmailInvalid");
      }

      if (!formData.password) {
        newErrors.password = t("register.errPassword");
      } else if (formData.password.length < 6) {
        newErrors.password = t("register.errPasswordMin");
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = t("register.errPasswordMismatch");
      }
    } else {
      if (!formData.phone.trim()) {
        newErrors.phone = t("register.errPhone");
      } else if (!isPhoneNumber(formData.phone)) {
        newErrors.phone = t("register.errPhoneInvalid");
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

  // ==================== LOCATION ====================

  const handleGetLocation = async () => {
    try {
      setLocationLoading(true);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(t("common.error"), t("register.errLocationDenied"));
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const addressString = [
        address.street,
        address.district,
        address.city,
        address.region,
      ]
        .filter(Boolean)
        .join(", ");

      setFormData((prev) => ({
        ...prev,
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          address: addressString || t("register.locationUnknown"),
        },
      }));
    } catch (error) {
      console.error("[Register] Get location error:", error);
      Alert.alert(t("common.error"), t("register.errLocationFailed"));
    } finally {
      setLocationLoading(false);
    }
  };

  // ==================== HANDLERS ====================

  const handleEmailRegister = async () => {
    if (!validateForm()) {
      triggerShake();
      return;
    }

    // Require face verification before registration
    if (!faceVerified || !faceEmbedding) {
      router.push({
        pathname: "/(auth)/face-verification",
        params: { email: formData.email },
      } as any);
      return;
    }

    try {
      setLoading(true);
      setErrors({});
      Keyboard.dismiss();

      await signUp(
        formData.email,
        formData.password,
        formData.name,
        formData.role,
        formData.phone || undefined,
        formData.location || undefined,
        faceEmbedding,
      );
      // Navigation handled by isAuthenticated effect
    } catch (error: any) {
      console.error("[Register] Email register failed:", error);
      setErrors({
        general: error.message || t("register.errRegisterFailed"),
      });
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!formData.phone.trim() || !isPhoneNumber(formData.phone)) {
      setErrors({ phone: t("register.errPhoneValid") });
      triggerShake();
      return;
    }

    if (!formData.name.trim()) {
      setErrors({ name: t("register.errName") });
      triggerShake();
      return;
    }

    try {
      setLoading(true);
      setErrors({});
      Keyboard.dismiss();

      const result = await sendOTP(formData.phone);

      if (result.success) {
        setSessionId(result.sessionId || "");
        setOtpTimer(result.expiresIn || 300);
        setAuthStep("otp-verify");
      } else {
        setErrors({ general: result.message });
        triggerShake();
      }
    } catch (error: any) {
      console.error("[Register] Send OTP failed:", error);
      setErrors({ general: error.message || t("register.errOtpSendFailed") });
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (formData.otp.length < 6) {
      setErrors({ otp: t("register.errOtpLength") });
      triggerShake();
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      const result = await verifyOTP(formData.phone, formData.otp, sessionId);

      if (result.success) {
        // If new user, register with profile info
        if (result.isNewUser) {
          await registerWithPhone(
            formData.phone,
            formData.name,
            formData.email || undefined,
            formData.password || undefined,
          );
        }
        // Navigation handled by isAuthenticated effect
      } else {
        setErrors({ otp: result.message || t("register.errOtpWrong") });
        triggerShake();
      }
    } catch (error: any) {
      console.error("[Register] Verify OTP failed:", error);
      setErrors({ otp: error.message || t("register.errOtpVerifyFailed") });
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (otpTimer > 0) return;

    setFormData((prev) => ({ ...prev, otp: "" }));
    try {
      setLoading(true);
      const result = await sendOTP(formData.phone);
      if (result.success) {
        setSessionId(result.sessionId || "");
        setOtpTimer(result.expiresIn || 300);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchMode = (mode: RegisterMode) => {
    setRegisterMode(mode);
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
      {/* Name Input */}
      <View style={styles.inputContainer}>
        <Ionicons name="person-outline" size={20} color={COLORS.textMuted} />
        <TextInput
          style={styles.input}
          placeholder={t("register.fullName")}
          placeholderTextColor={COLORS.textMuted}
          value={formData.name}
          onChangeText={(text) => {
            setFormData((prev) => ({ ...prev, name: text }));
            setErrors((prev) => ({ ...prev, name: "" }));
          }}
          autoCapitalize="words"
        />
      </View>
      {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

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
          placeholder={t("register.password")}
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

      {/* Confirm Password */}
      <View style={styles.inputContainer}>
        <Ionicons
          name="lock-closed-outline"
          size={20}
          color={COLORS.textMuted}
        />
        <TextInput
          style={styles.input}
          placeholder={t("register.confirmPassword")}
          placeholderTextColor={COLORS.textMuted}
          value={formData.confirmPassword}
          onChangeText={(text) => {
            setFormData((prev) => ({ ...prev, confirmPassword: text }));
            setErrors((prev) => ({ ...prev, confirmPassword: "" }));
          }}
          secureTextEntry={!showConfirmPassword}
        />
        <TouchableOpacity
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          <Ionicons
            name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
            size={20}
            color={COLORS.textMuted}
          />
        </TouchableOpacity>
      </View>
      {errors.confirmPassword && (
        <Text style={styles.errorText}>{errors.confirmPassword}</Text>
      )}

      {/* Role Selector */}
      <TouchableOpacity
        style={styles.roleSelector}
        onPress={() => setShowRoleSelector(!showRoleSelector)}
      >
        <Ionicons name="briefcase-outline" size={20} color={COLORS.textMuted} />
        <Text style={styles.roleSelectorText}>
          {ROLE_OPTION_KEYS.find((r) => r.value === formData.role)
            ? t(
                ROLE_OPTION_KEYS.find((r) => r.value === formData.role)!
                  .labelKey,
              )
            : t("register.selectRole")}
        </Text>
        <Ionicons
          name={showRoleSelector ? "chevron-up" : "chevron-down"}
          size={20}
          color={COLORS.textMuted}
        />
      </TouchableOpacity>

      {showRoleSelector && (
        <View style={styles.roleOptions}>
          {ROLE_OPTION_KEYS.map((role) => (
            <TouchableOpacity
              key={role.value}
              style={[
                styles.roleOption,
                formData.role === role.value && styles.roleOptionSelected,
              ]}
              onPress={() => {
                setFormData((prev) => ({ ...prev, role: role.value }));
                setShowRoleSelector(false);
              }}
            >
              <Ionicons
                name={role.icon as any}
                size={20}
                color={
                  formData.role === role.value
                    ? COLORS.primary
                    : COLORS.textMuted
                }
              />
              <View style={styles.roleOptionInfo}>
                <Text
                  style={[
                    styles.roleOptionLabel,
                    formData.role === role.value &&
                      styles.roleOptionLabelSelected,
                  ]}
                >
                  {t(role.labelKey)}
                </Text>
                <Text style={styles.roleOptionDesc}>{t(role.descKey)}</Text>
              </View>
              {formData.role === role.value && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={COLORS.primary}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Location */}
      <TouchableOpacity
        style={styles.locationButton}
        onPress={handleGetLocation}
        disabled={locationLoading}
      >
        {locationLoading ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <Ionicons name="location-outline" size={20} color={COLORS.primary} />
        )}
        <Text style={styles.locationButtonText}>
          {formData.location
            ? formData.location.address
            : t("register.addLocation")}
        </Text>
      </TouchableOpacity>

      {/* Face Verification */}
      <TouchableOpacity
        style={[
          styles.locationButton,
          faceVerified && {
            borderColor: COLORS.success,
            backgroundColor: "#ECFDF5",
          },
        ]}
        onPress={() => {
          if (!faceVerified) {
            router.push({
              pathname: "/(auth)/face-verification",
              params: { email: formData.email },
            } as any);
          }
        }}
        disabled={faceVerified}
      >
        <Ionicons
          name={faceVerified ? "checkmark-circle" : "scan-outline"}
          size={20}
          color={faceVerified ? COLORS.success : COLORS.primary}
        />
        <Text
          style={[
            styles.locationButtonText,
            faceVerified && { color: COLORS.success },
          ]}
        >
          {faceVerified
            ? "Đã xác minh khuôn mặt ✓"
            : "Xác minh khuôn mặt (bắt buộc)"}
        </Text>
      </TouchableOpacity>

      {/* Register Button */}
      <TouchableOpacity
        style={[
          styles.primaryButton,
          (loading || authLoading) && styles.buttonDisabled,
        ]}
        onPress={handleEmailRegister}
        disabled={loading || authLoading}
      >
        {loading || authLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryButtonText}>{t("register.register")}</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  const renderPhoneForm = () => (
    <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
      {/* Name Input */}
      <View style={styles.inputContainer}>
        <Ionicons name="person-outline" size={20} color={COLORS.textMuted} />
        <TextInput
          style={styles.input}
          placeholder={t("register.fullName")}
          placeholderTextColor={COLORS.textMuted}
          value={formData.name}
          onChangeText={(text) => {
            setFormData((prev) => ({ ...prev, name: text }));
            setErrors((prev) => ({ ...prev, name: "" }));
          }}
          autoCapitalize="words"
        />
      </View>
      {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

      {/* Phone Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.phonePrefix}>+84</Text>
        <TextInput
          style={styles.input}
          placeholder={t("register.phoneNumber")}
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
          <Text style={styles.primaryButtonText}>{t("register.sendOtp")}</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  const renderOTPVerify = () => (
    <Animated.View style={{ opacity: fadeAnim }}>
      <TouchableOpacity onPress={handleBackToInput} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        <Text style={styles.backButtonText}>{t("register.goBack")}</Text>
      </TouchableOpacity>

      <Text style={styles.otpTitle}>{t("register.enterOtp")}</Text>
      <Text style={styles.otpSubtitle}>
        {t("register.otpSentTo")} {"\n"}
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

      <View style={styles.resendContainer}>
        {otpTimer > 0 ? (
          <Text style={styles.timerText}>
            {t("register.resendAfter")} {Math.floor(otpTimer / 60)}:
            {(otpTimer % 60).toString().padStart(2, "0")}
          </Text>
        ) : (
          <TouchableOpacity onPress={handleResendOTP}>
            <Text style={styles.resendText}>{t("register.resendOtp")}</Text>
          </TouchableOpacity>
        )}
      </View>

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
          <Text style={styles.primaryButtonText}>
            {t("register.confirmRegister")}
          </Text>
        )}
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
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
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
              <Text style={styles.appName}>{t("register.title")}</Text>
              <Text style={styles.tagline}>{t("register.tagline")}</Text>
            </View>

            {/* Error Message */}
            {errors.general && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={20} color={COLORS.error} />
                <Text style={styles.errorBannerText}>{errors.general}</Text>
              </View>
            )}

            {authStep === "input" && (
              <>
                {/* Mode Tabs */}
                <View style={styles.modeTabs}>
                  <TouchableOpacity
                    style={[
                      styles.modeTab,
                      registerMode === "email" && styles.modeTabActive,
                    ]}
                    onPress={() => handleSwitchMode("email")}
                  >
                    <Ionicons
                      name="mail-outline"
                      size={18}
                      color={
                        registerMode === "email"
                          ? COLORS.primary
                          : COLORS.textMuted
                      }
                    />
                    <Text
                      style={[
                        styles.modeTabText,
                        registerMode === "email" && styles.modeTabTextActive,
                      ]}
                    >
                      Email
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.modeTab,
                      registerMode === "phone" && styles.modeTabActive,
                    ]}
                    onPress={() => handleSwitchMode("phone")}
                  >
                    <Ionicons
                      name="phone-portrait-outline"
                      size={18}
                      color={
                        registerMode === "phone"
                          ? COLORS.primary
                          : COLORS.textMuted
                      }
                    />
                    <Text
                      style={[
                        styles.modeTabText,
                        registerMode === "phone" && styles.modeTabTextActive,
                      ]}
                    >
                      {t("register.phoneTab")}
                    </Text>
                  </TouchableOpacity>
                </View>

                {registerMode === "email"
                  ? renderEmailForm()
                  : renderPhoneForm()}

                {/* Login Link */}
                <View style={styles.loginContainer}>
                  <Text style={styles.loginText}>
                    {t("register.hasAccount")}
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push("/(auth)/login-unified" as any)}
                  >
                    <Text style={styles.loginLink}>{t("register.login")}</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {authStep === "otp-verify" && renderOTPVerify()}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardAvoid: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
    paddingTop: 48,
  },
  content: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 24,
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
    fontSize: 24,
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
  roleSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  roleSelectorText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  roleOptions: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  roleOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  roleOptionSelected: {
    backgroundColor: COLORS.primaryLight,
  },
  roleOptionInfo: {
    flex: 1,
  },
  roleOptionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  roleOptionLabelSelected: {
    color: COLORS.primary,
  },
  roleOptionDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 8,
    marginBottom: 16,
  },
  locationButtonText: {
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
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  loginText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  loginLink: {
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
});
