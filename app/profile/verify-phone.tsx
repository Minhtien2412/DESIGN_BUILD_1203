/**
 * Phone Verification Screen
 * Màn hình xác thực số điện thoại sử dụng OTP
 */

import { OTPVerification } from "@/components/auth";
import ModernButton from "@/components/ui/modern-button";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Step = "phone" | "otp";

export default function PhoneVerificationScreen() {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  // Theme
  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "card");
  const textColor = useThemeColor({}, "text");
  const primaryColor = useThemeColor({}, "tint");
  const secondaryText = useThemeColor({}, "tabIconDefault");
  const errorColor = "#ef4444";

  // Validate phone number (Vietnam format)
  const validatePhone = (value: string): boolean => {
    // Remove spaces and dashes
    const cleaned = value.replace(/[\s-]/g, "");
    // Vietnam phone: 10 digits starting with 0 or +84
    const vnPhoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
    return vnPhoneRegex.test(cleaned);
  };

  // Handle send OTP
  const handleSendOTP = async () => {
    if (!validatePhone(phone)) {
      Alert.alert(
        "Lỗi",
        "Vui lòng nhập số điện thoại hợp lệ (10 số, bắt đầu bằng 0)",
      );
      return;
    }

    setLoading(true);

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setStep("otp");
    } catch (error) {
      Alert.alert("Lỗi", "Không thể gửi mã OTP. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verified
  const handleOTPVerified = (code: string) => {
    Alert.alert(
      "Xác thực thành công",
      `Số điện thoại ${phone} đã được xác thực thành công!`,
      [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ],
    );
  };

  // Handle OTP error
  const handleOTPError = (error: string) => {
    Alert.alert("Lỗi", error);
  };

  // Render phone input step
  const renderPhoneStep = () => (
    <ScrollView
      style={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Icon */}
      <View
        style={[styles.iconContainer, { backgroundColor: primaryColor + "15" }]}
      >
        <Ionicons
          name="phone-portrait-outline"
          size={48}
          color={primaryColor}
        />
      </View>

      {/* Title */}
      <Text style={[styles.title, { color: textColor }]}>
        Xác thực số điện thoại
      </Text>
      <Text style={[styles.subtitle, { color: secondaryText }]}>
        Nhập số điện thoại của bạn để nhận mã xác thực OTP
      </Text>

      {/* Phone Input */}
      <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, { color: textColor }]}>
          Số điện thoại <Text style={{ color: errorColor }}>*</Text>
        </Text>
        <View
          style={[
            styles.inputWrapper,
            { backgroundColor: cardColor, borderColor: "#e5e7eb" },
          ]}
        >
          <View style={styles.countryCode}>
            <Text style={[styles.countryCodeText, { color: textColor }]}>
              +84
            </Text>
          </View>
          <TextInput
            style={[styles.input, { color: textColor }]}
            placeholder="0912 345 678"
            placeholderTextColor={secondaryText}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            maxLength={15}
            autoFocus
          />
        </View>
        <Text style={[styles.inputHint, { color: secondaryText }]}>
          Ví dụ: 0912345678 hoặc 0987654321
        </Text>
      </View>

      {/* Benefits */}
      <View style={[styles.benefitsCard, { backgroundColor: cardColor }]}>
        <Text style={[styles.benefitsTitle, { color: textColor }]}>
          Lợi ích khi xác thực số điện thoại:
        </Text>
        <View style={styles.benefitItem}>
          <Ionicons name="checkmark-circle" size={20} color="#10b981" />
          <Text style={[styles.benefitText, { color: textColor }]}>
            Bảo mật tài khoản tốt hơn
          </Text>
        </View>
        <View style={styles.benefitItem}>
          <Ionicons name="checkmark-circle" size={20} color="#10b981" />
          <Text style={[styles.benefitText, { color: textColor }]}>
            Nhận thông báo quan trọng qua SMS
          </Text>
        </View>
        <View style={styles.benefitItem}>
          <Ionicons name="checkmark-circle" size={20} color="#10b981" />
          <Text style={[styles.benefitText, { color: textColor }]}>
            Khôi phục mật khẩu dễ dàng
          </Text>
        </View>
      </View>

      {/* Submit Button */}
      <ModernButton
        variant="primary"
        size="large"
        onPress={handleSendOTP}
        loading={loading}
        disabled={!phone || phone.length < 10}
        icon="paper-plane-outline"
        iconPosition="right"
        fullWidth
        style={{ marginTop: 24 }}
      >
        Gửi mã OTP
      </ModernButton>
    </ScrollView>
  );

  // Render OTP step
  const renderOTPStep = () => (
    <OTPVerification
      recipient={phone}
      channel="sms"
      length={6}
      resendTimeout={60}
      autoSend={false}
      title="Nhập mã xác thực"
      subtitle={`Mã OTP đã được gửi đến số điện thoại ${phone}`}
      onVerified={handleOTPVerified}
      onError={handleOTPError}
      onBack={() => setStep("phone")}
    />
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle="dark-content" />
      <Stack.Screen
        options={{
          title: "Xác thực số điện thoại",
          headerShown: true,
          headerStyle: { backgroundColor },
          headerTitleStyle: styles.headerTitle,
        }}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {step === "phone" ? renderPhoneStep() : renderOTPStep()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  countryCode: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: "500",
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  inputHint: {
    fontSize: 12,
    marginTop: 8,
  },
  benefitsCard: {
    borderRadius: 12,
    padding: 16,
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 10,
  },
  benefitText: {
    fontSize: 14,
    flex: 1,
  },
});
