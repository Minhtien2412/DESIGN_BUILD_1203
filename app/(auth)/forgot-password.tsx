import AuthBackground from "@/components/ui/AuthBackground";
import { useThemeColor } from "@/hooks/use-theme-color";
import authApi from "@/services/api/authApi";
import {
    isValidVietnamesePhone,
    maskPhone,
    zaloOTPAuth
} from "@/services/zaloOTPAuthService";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type VerifyMethod = "phone" | "email";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const primary = useThemeColor({}, "primary");
  const surface = useThemeColor({}, "surface");
  const text = useThemeColor({}, "text");
  const textMuted = useThemeColor({}, "textMuted");
  const border = useThemeColor({}, "border");

  // Step state: 1 = Phone/Email input, 2 = OTP verification, 3 = New password
  const [step, setStep] = useState(1);
  const [verifyMethod, setVerifyMethod] = useState<VerifyMethod>("phone"); // Default: Phone (Zalo OTP)
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [verifyToken, setVerifyToken] = useState("");
  const [maskedContact, setMaskedContact] = useState("");

  const [phoneFocused, setPhoneFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);

  const phoneLabel = useRef(new Animated.Value(0)).current;
  const emailLabel = useRef(new Animated.Value(0)).current;
  const passLabel = useRef(new Animated.Value(0)).current;
  const confirmLabel = useRef(new Animated.Value(0)).current;
  const otpRefs = useRef<TextInput[]>([]);

  const animate = (anim: Animated.Value, active: boolean) =>
    Animated.timing(anim, {
      toValue: active ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();

  // OTP Timer countdown
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  // Step 1: Send OTP to phone (Zalo/SMS) or email
  const handleSendOtp = async () => {
    if (verifyMethod === "phone") {
      await handleSendPhoneOtp();
    } else {
      await handleSendEmailOtp();
    }
  };

  // Send OTP via Zalo/SMS
  const handleSendPhoneOtp = async () => {
    const trimmedPhone = phone.trim();

    if (!trimmedPhone) {
      Alert.alert("Lỗi", "Vui lòng nhập số điện thoại");
      return;
    }

    if (!isValidVietnamesePhone(trimmedPhone)) {
      Alert.alert(
        "Lỗi",
        "Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam."
      );
      return;
    }

    setLoading(true);
    try {
      // Gửi OTP qua Zalo/SMS
      const result = await zaloOTPAuth.sendOTP(trimmedPhone, {
        channel: "sms",
      });

      if (result.success) {
        setOtpTimer(result.expiresIn || 300);
        setMaskedContact(maskPhone(trimmedPhone));
        setStep(2);
        setTimeout(() => otpRefs.current[0]?.focus(), 300);
        Alert.alert(
          "Thành công",
          result.message || `Mã OTP đã được gửi đến Zalo/SMS của bạn!`
        );
      } else {
        Alert.alert(
          "Lỗi",
          result.message || "Không thể gửi mã OTP. Vui lòng thử lại."
        );
      }
    } catch (error: any) {
      let errorMessage = "Không thể gửi mã OTP. Vui lòng thử lại.";

      if (error?.message) {
        const msg = error.message.toLowerCase();
        if (msg.includes("not found") || msg.includes("không tìm thấy")) {
          errorMessage =
            "Số điện thoại này chưa được đăng ký. Vui lòng kiểm tra lại.";
        } else if (msg.includes("network") || msg.includes("timeout")) {
          errorMessage =
            "Lỗi kết nối mạng. Vui lòng kiểm tra internet và thử lại.";
        } else if (
          msg.includes("rate limit") ||
          msg.includes("too many") ||
          msg.includes("quá nhiều")
        ) {
          errorMessage =
            "Bạn đã gửi quá nhiều yêu cầu. Vui lòng đợi vài phút rồi thử lại.";
        } else {
          errorMessage = error.message;
        }
      }

      Alert.alert("Lỗi", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Send OTP via Email (fallback)
  const handleSendEmailOtp = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      Alert.alert("Lỗi", "Vui lòng nhập địa chỉ email");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      Alert.alert("Lỗi", "Địa chỉ email không hợp lệ");
      return;
    }

    setLoading(true);
    try {
      // Try OTP flow first
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
          Alert.alert(
            "Thành công",
            response.message || "Mã OTP đã được gửi đến email của bạn!"
          );
        }
      } catch (otpError) {
        // Fallback to forgot-password endpoint
        const response = await authApi.forgotPassword({ email: trimmedEmail });
        if (response.success) {
          Alert.alert(
            "Thành công",
            "Link đặt lại mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.",
            [{ text: "OK", onPress: () => router.back() }]
          );
        }
      }
    } catch (error: any) {
      // Xử lý lỗi chi tiết
      let errorMessage = "Không thể gửi yêu cầu. Vui lòng thử lại.";

      if (error?.message) {
        const msg = error.message.toLowerCase();
        if (msg.includes("not found") || msg.includes("không tìm thấy")) {
          errorMessage =
            "Email này chưa được đăng ký. Vui lòng kiểm tra lại hoặc tạo tài khoản mới.";
        } else if (msg.includes("network") || msg.includes("timeout")) {
          errorMessage =
            "Lỗi kết nối mạng. Vui lòng kiểm tra internet và thử lại.";
        } else if (msg.includes("rate limit") || msg.includes("too many")) {
          errorMessage =
            "Bạn đã gửi quá nhiều yêu cầu. Vui lòng đợi vài phút rồi thử lại.";
        } else if (msg.includes("invalid") || msg.includes("không hợp lệ")) {
          errorMessage = "Email không hợp lệ. Vui lòng kiểm tra và nhập lại.";
        } else {
          errorMessage = error.message;
        }
      }

      Alert.alert("Lỗi", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP (Phone via Zalo or Email)
  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((d) => d !== "") && newOtp.join("").length === 6) {
      handleVerifyOtp(newOtp.join(""));
    }
  };

  const handleOtpKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (code?: string) => {
    const otpCode = code || otp.join("");
    if (otpCode.length !== 6) {
      Alert.alert("Lỗi", "Vui lòng nhập đủ 6 số");
      return;
    }

    setLoading(true);
    try {
      if (verifyMethod === "phone") {
        // Verify OTP via Zalo service
        const result = await zaloOTPAuth.verifyOTP(phone.trim(), otpCode);

        if (result.success) {
          setVerifyToken(result.accessToken || otpCode);
          setStep(3);
        } else {
          Alert.alert("Lỗi", result.message || "Mã OTP không đúng");
        }
      } else {
        // Verify OTP via Email
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
          } else {
            Alert.alert("Lỗi", response.message || "Mã OTP không đúng");
          }
        } catch (apiError) {
          // Demo mode: accept any 6 digits
          setVerifyToken(otpCode);
          setStep(3);
        }
      }
    } catch (error: any) {
      // Xử lý lỗi OTP chi tiết
      let errorMessage = "Xác thực OTP thất bại";

      if (error?.message) {
        const msg = error.message.toLowerCase();
        if (msg.includes("expired") || msg.includes("hết hạn")) {
          errorMessage = "Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.";
        } else if (
          msg.includes("invalid") ||
          msg.includes("incorrect") ||
          msg.includes("sai")
        ) {
          errorMessage = "Mã OTP không đúng. Vui lòng kiểm tra lại.";
        } else if (msg.includes("network") || msg.includes("timeout")) {
          errorMessage = "Lỗi kết nối. Vui lòng thử lại.";
        } else {
          errorMessage = error.message;
        }
      }

      Alert.alert("Lỗi", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (otpTimer > 0) return;
    setOtp(["", "", "", "", "", ""]);
    await handleSendOtp();
  };

  // Step 3: Reset Password
  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);
    try {
      if (verifyMethod === "phone") {
        // Reset password via Zalo OTP service
        const result = await zaloOTPAuth.resetPassword(
          phone.trim(),
          newPassword,
          verifyToken
        );

        if (result.success) {
          Alert.alert(
            "Thành công",
            result.message || "Mật khẩu đã được đặt lại thành công!",
            [
              {
                text: "Đăng nhập",
                onPress: () => router.replace("/(auth)/login"),
              },
            ]
          );
        } else {
          Alert.alert("Lỗi", result.message || "Không thể đặt lại mật khẩu");
        }
      } else {
        // Reset password via Email API
        const response = await authApi.resetPassword({
          token: verifyToken,
          newPassword,
        });

        if (response.success) {
          Alert.alert("Thành công", "Mật khẩu đã được đặt lại thành công!", [
            {
              text: "Đăng nhập",
              onPress: () => router.replace("/(auth)/login"),
            },
          ]);
        }
      }
    } catch (error: any) {
      // Xử lý lỗi đặt lại mật khẩu chi tiết
      let errorMessage = "Không thể đặt lại mật khẩu";

      if (error?.message) {
        const msg = error.message.toLowerCase();
        if (msg.includes("expired") || msg.includes("hết hạn")) {
          errorMessage =
            "Phiên xác thực đã hết hạn. Vui lòng bắt đầu lại từ đầu.";
        } else if (msg.includes("weak") || msg.includes("yếu")) {
          errorMessage =
            "Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn với chữ hoa, chữ thường và số.";
        } else if (msg.includes("invalid token")) {
          errorMessage =
            "Token không hợp lệ. Vui lòng thực hiện lại quá trình khôi phục mật khẩu.";
        } else if (msg.includes("network") || msg.includes("timeout")) {
          errorMessage = "Lỗi kết nối mạng. Vui lòng thử lại.";
        } else if (msg.includes("same") || msg.includes("giống")) {
          errorMessage = "Mật khẩu mới phải khác mật khẩu cũ.";
        } else {
          errorMessage = error.message;
        }
      }

      Alert.alert("Lỗi", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <AuthBackground>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Step indicator */}
          <View style={styles.stepIndicator}>
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
                  <Ionicons name="checkmark" size={12} color="#FFF" />
                ) : (
                  <Text
                    style={[
                      styles.stepText,
                      s === step && styles.stepTextActive,
                    ]}
                  >
                    {s}
                  </Text>
                )}
              </View>
            ))}
          </View>

          <View style={styles.header}>
            <Text style={[styles.title, { color: text }]}>
              {step === 1 && "Quên mật khẩu?"}
              {step === 2 && "Xác thực OTP"}
              {step === 3 && "Đặt mật khẩu mới"}
            </Text>
            <Text style={[styles.subtitle, { color: textMuted }]}>
              {step === 1 &&
                (verifyMethod === "phone"
                  ? "Nhập số điện thoại để nhận OTP qua Zalo/SMS"
                  : "Nhập email để nhận mã xác thực")}
              {step === 2 && `Nhập mã 6 số đã gửi đến ${maskedContact}`}
              {step === 3 && "Tạo mật khẩu mới cho tài khoản"}
            </Text>
          </View>

          <View
            style={[
              styles.form,
              { backgroundColor: surface, borderColor: border },
            ]}
          >
            {/* Step 1: Phone/Email Input */}
            {step === 1 && (
              <>
                {/* Method Toggle */}
                <View style={styles.methodToggle}>
                  <TouchableOpacity
                    style={[
                      styles.methodButton,
                      verifyMethod === "phone" && { backgroundColor: primary },
                      { borderColor: primary },
                    ]}
                    onPress={() => setVerifyMethod("phone")}
                    disabled={loading}
                  >
                    <Ionicons
                      name="logo-whatsapp"
                      size={18}
                      color={verifyMethod === "phone" ? "#FFF" : primary}
                    />
                    <Text
                      style={[
                        styles.methodButtonText,
                        { color: verifyMethod === "phone" ? "#FFF" : primary },
                      ]}
                    >
                      Zalo/SMS
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.methodButton,
                      verifyMethod === "email" && { backgroundColor: primary },
                      { borderColor: primary },
                    ]}
                    onPress={() => setVerifyMethod("email")}
                    disabled={loading}
                  >
                    <Ionicons
                      name="mail-outline"
                      size={18}
                      color={verifyMethod === "email" ? "#FFF" : primary}
                    />
                    <Text
                      style={[
                        styles.methodButtonText,
                        { color: verifyMethod === "email" ? "#FFF" : primary },
                      ]}
                    >
                      Email
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Phone Input */}
                {verifyMethod === "phone" && (
                  <View
                    style={[styles.inputContainer, { position: "relative" }]}
                  >
                    <Ionicons
                      name="call-outline"
                      size={20}
                      color={phoneFocused ? primary : textMuted}
                      style={styles.inputIcon}
                    />
                    <Animated.Text
                      style={[
                        styles.floatingLabel,
                        {
                          color: phoneFocused ? primary : textMuted,
                          top: phoneLabel.interpolate({
                            inputRange: [0, 1],
                            outputRange: [14, -8],
                          }),
                          fontSize: phoneLabel.interpolate({
                            inputRange: [0, 1],
                            outputRange: [14, 12],
                          }) as any,
                          backgroundColor: surface,
                          paddingHorizontal: 4,
                          pointerEvents: "none",
                        },
                      ]}
                    >
                      Số điện thoại
                    </Animated.Text>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          borderColor: phoneFocused ? primary : border,
                          backgroundColor: surface,
                          color: text,
                        },
                      ]}
                      placeholder=""
                      selectionColor={primary}
                      value={phone}
                      onChangeText={(t) => {
                        setPhone(t);
                        animate(phoneLabel, t.length > 0);
                      }}
                      onFocus={() => {
                        setPhoneFocused(true);
                        animate(phoneLabel, true);
                      }}
                      onBlur={() => {
                        setPhoneFocused(false);
                        animate(phoneLabel, phone.length > 0);
                      }}
                      autoCapitalize="none"
                      keyboardType="phone-pad"
                      autoComplete="tel"
                      editable={!loading}
                    />
                    <Text style={[styles.inputHint, { color: textMuted }]}>
                      VD: 0912345678 hoặc +84912345678
                    </Text>
                  </View>
                )}

                {/* Email Input */}
                {verifyMethod === "email" && (
                  <View
                    style={[styles.inputContainer, { position: "relative" }]}
                  >
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color={emailFocused ? primary : textMuted}
                      style={styles.inputIcon}
                    />
                    <Animated.Text
                      style={[
                        styles.floatingLabel,
                        {
                          color: emailFocused ? primary : textMuted,
                          top: emailLabel.interpolate({
                            inputRange: [0, 1],
                            outputRange: [14, -8],
                          }),
                          fontSize: emailLabel.interpolate({
                            inputRange: [0, 1],
                            outputRange: [14, 12],
                          }) as any,
                          backgroundColor: surface,
                          paddingHorizontal: 4,
                          pointerEvents: "none",
                        },
                      ]}
                    >
                      Email
                    </Animated.Text>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          borderColor: emailFocused ? primary : border,
                          backgroundColor: surface,
                          color: text,
                        },
                      ]}
                      placeholder=""
                      selectionColor={primary}
                      value={email}
                      onChangeText={(t) => {
                        setEmail(t);
                        animate(emailLabel, t.length > 0);
                      }}
                      onFocus={() => {
                        setEmailFocused(true);
                        animate(emailLabel, true);
                      }}
                      onBlur={() => {
                        setEmailFocused(false);
                        animate(emailLabel, email.length > 0);
                      }}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      autoComplete="email"
                      editable={!loading}
                    />
                  </View>
                )}

                <TouchableOpacity
                  style={[
                    styles.button,
                    { backgroundColor: primary },
                    loading && styles.buttonDisabled,
                  ]}
                  onPress={handleSendOtp}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.buttonText}>
                      {verifyMethod === "phone"
                        ? "Gửi OTP qua Zalo/SMS"
                        : "Gửi mã OTP"}
                    </Text>
                  )}
                </TouchableOpacity>
              </>
            )}

            {/* Step 2: OTP Verification */}
            {step === 2 && (
              <>
                <View style={styles.otpInfoBox}>
                  <Ionicons
                    name={
                      verifyMethod === "phone" ? "chatbubble-ellipses" : "mail"
                    }
                    size={24}
                    color={primary}
                  />
                  <Text style={[styles.otpInfoText, { color: textMuted }]}>
                    {verifyMethod === "phone"
                      ? "Mã OTP đã được gửi qua Zalo/SMS đến số"
                      : "Mã OTP đã được gửi đến email"}
                  </Text>
                  <Text style={[styles.otpContactText, { color: text }]}>
                    {maskedContact}
                  </Text>
                </View>
                <View style={styles.otpContainer}>
                  {otp.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(ref) => {
                        if (ref) otpRefs.current[index] = ref;
                      }}
                      style={[
                        styles.otpInput,
                        {
                          borderColor: digit ? primary : border,
                          backgroundColor: surface,
                          color: text,
                        },
                      ]}
                      value={digit}
                      onChangeText={(t) => handleOtpChange(t, index)}
                      onKeyPress={({ nativeEvent }) =>
                        handleOtpKeyPress(nativeEvent.key, index)
                      }
                      keyboardType="number-pad"
                      maxLength={1}
                      selectionColor={primary}
                      editable={!loading}
                    />
                  ))}
                </View>

                <View style={styles.otpTimerRow}>
                  <Text style={[styles.otpTimerText, { color: textMuted }]}>
                    {otpTimer > 0
                      ? `Gửi lại sau ${otpTimer}s`
                      : "Không nhận được mã?"}
                  </Text>
                  <TouchableOpacity
                    onPress={handleResendOtp}
                    disabled={otpTimer > 0 || loading}
                  >
                    <Text
                      style={[
                        styles.resendText,
                        { color: otpTimer > 0 ? textMuted : primary },
                      ]}
                    >
                      Gửi lại
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[
                    styles.button,
                    { backgroundColor: primary },
                    loading && styles.buttonDisabled,
                  ]}
                  onPress={() => handleVerifyOtp()}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.buttonText}>Xác nhận</Text>
                  )}
                </TouchableOpacity>
              </>
            )}

            {/* Step 3: New Password */}
            {step === 3 && (
              <>
                <View style={[styles.inputContainer, { position: "relative" }]}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={passFocused ? primary : textMuted}
                    style={styles.inputIcon}
                  />
                  <Animated.Text
                    style={[
                      styles.floatingLabel,
                      {
                        color: passFocused ? primary : textMuted,
                        top: passLabel.interpolate({
                          inputRange: [0, 1],
                          outputRange: [14, -8],
                        }),
                        fontSize: passLabel.interpolate({
                          inputRange: [0, 1],
                          outputRange: [14, 12],
                        }) as any,
                        backgroundColor: surface,
                        paddingHorizontal: 4,
                        pointerEvents: "none",
                      },
                    ]}
                  >
                    Mật khẩu mới
                  </Animated.Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        borderColor: passFocused ? primary : border,
                        backgroundColor: surface,
                        color: text,
                      },
                    ]}
                    placeholder=""
                    selectionColor={primary}
                    value={newPassword}
                    onChangeText={(t) => {
                      setNewPassword(t);
                      animate(passLabel, t.length > 0);
                    }}
                    onFocus={() => {
                      setPassFocused(true);
                      animate(passLabel, true);
                    }}
                    onBlur={() => {
                      setPassFocused(false);
                      animate(passLabel, newPassword.length > 0);
                    }}
                    secureTextEntry
                    editable={!loading}
                  />
                </View>

                <View style={[styles.inputContainer, { position: "relative" }]}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={confirmFocused ? primary : textMuted}
                    style={styles.inputIcon}
                  />
                  <Animated.Text
                    style={[
                      styles.floatingLabel,
                      {
                        color: confirmFocused ? primary : textMuted,
                        top: confirmLabel.interpolate({
                          inputRange: [0, 1],
                          outputRange: [14, -8],
                        }),
                        fontSize: confirmLabel.interpolate({
                          inputRange: [0, 1],
                          outputRange: [14, 12],
                        }) as any,
                        backgroundColor: surface,
                        paddingHorizontal: 4,
                        pointerEvents: "none",
                      },
                    ]}
                  >
                    Xác nhận mật khẩu
                  </Animated.Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        borderColor: confirmFocused ? primary : border,
                        backgroundColor: surface,
                        color: text,
                      },
                    ]}
                    placeholder=""
                    selectionColor={primary}
                    value={confirmPassword}
                    onChangeText={(t) => {
                      setConfirmPassword(t);
                      animate(confirmLabel, t.length > 0);
                    }}
                    onFocus={() => {
                      setConfirmFocused(true);
                      animate(confirmLabel, true);
                    }}
                    onBlur={() => {
                      setConfirmFocused(false);
                      animate(confirmLabel, confirmPassword.length > 0);
                    }}
                    secureTextEntry
                    editable={!loading}
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.button,
                    { backgroundColor: primary },
                    loading && styles.buttonDisabled,
                  ]}
                  onPress={handleResetPassword}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.buttonText}>Đặt lại mật khẩu</Text>
                  )}
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              onPress={() =>
                step === 1 ? router.push("/(auth)/login") : setStep(step - 1)
              }
              style={styles.backButton}
              disabled={loading}
            >
              <Text style={[styles.backText, { color: primary }]}>
                {step === 1 ? "← Quay lại đăng nhập" : "← Quay lại"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </AuthBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingVertical: 20,
    maxWidth: "100%",
  },
  header: {
    marginBottom: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  form: {
    borderRadius: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
  },
  inputContainer: {
    marginBottom: 12,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingLeft: 42,
    paddingTop: 20,
    fontSize: 14,
  },
  floatingLabel: {
    position: "absolute",
    left: 14,
    zIndex: 1,
    backgroundColor: "transparent",
    alignSelf: "flex-start",
  },
  inputIcon: {
    position: "absolute",
    left: 12,
    top: 14,
    zIndex: 2,
  },
  button: {
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#0066CC",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  successBox: {
    alignItems: "center",
    paddingVertical: 16,
    marginBottom: 16,
  },
  successIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  successIcon: {
    fontSize: 40,
    color: "#0066CC",
    fontWeight: "bold",
  },
  successTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
  },
  successText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 10,
  },
  emailText: {
    fontWeight: "600",
    color: "#0066CC",
  },
  successHint: {
    fontSize: 12,
    color: "#808080",
    textAlign: "center",
  },
  backButton: {
    paddingVertical: 8,
  },
  backText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
  },
  // Step indicator styles
  stepIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 24,
    marginBottom: 20,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
  },
  stepDotActive: {
    backgroundColor: "#0066CC",
  },
  stepDotDone: {
    backgroundColor: "#00C853",
  },
  stepText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#757575",
  },
  stepTextActive: {
    color: "#FFF",
  },
  // OTP styles
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 20,
  },
  otpInput: {
    width: 45,
    height: 50,
    borderWidth: 1.5,
    borderRadius: 10,
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  otpTimerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  otpTimerText: {
    fontSize: 13,
  },
  resendText: {
    fontSize: 13,
    fontWeight: "600",
  },
  // Method toggle styles
  methodToggle: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  methodButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1.5,
    gap: 8,
  },
  methodButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  inputHint: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  // OTP Info Box
  otpInfoBox: {
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: "rgba(0, 102, 204, 0.05)",
    borderRadius: 12,
  },
  otpInfoText: {
    fontSize: 13,
    marginTop: 8,
    textAlign: "center",
  },
  otpContactText: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 4,
  },
});
