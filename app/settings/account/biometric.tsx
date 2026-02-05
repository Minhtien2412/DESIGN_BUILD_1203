/**
 * Biometric Login Settings Screen
 * @route /profile/biometric
 */

import { Ionicons } from "@expo/vector-icons";
import * as LocalAuthentication from "expo-local-authentication";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  primary: "#10B981",
  bg: "#F8FAFC",
  card: "#FFFFFF",
  text: "#0F172A",
  textSecondary: "#64748B",
  border: "#E2E8F0",
  warning: "#F59E0B",
  info: "#3B82F6",
};

type BiometricType = "fingerprint" | "facial" | "iris" | "none";

export default function BiometricSettingsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isEnabled, setIsEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState<BiometricType>("none");
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const types =
        await LocalAuthentication.supportedAuthenticationTypesAsync();

      setIsEnrolled(enrolled);

      if (!compatible) {
        setBiometricType("none");
      } else if (
        types.includes(
          LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
        )
      ) {
        setBiometricType("facial");
      } else if (
        types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)
      ) {
        setBiometricType("fingerprint");
      } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        setBiometricType("iris");
      }

      // Check stored preference (would use AsyncStorage in real app)
      setIsEnabled(false);
    } catch (error) {
      console.error("Biometric check error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (value: boolean) => {
    if (value) {
      // Enable biometric - verify first
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Xác thực để bật đăng nhập sinh trắc học",
        cancelLabel: "Hủy",
        disableDeviceFallback: false,
      });

      if (result.success) {
        setIsEnabled(true);
        Alert.alert("Thành công", "Đã bật đăng nhập sinh trắc học");
      } else {
        Alert.alert("Lỗi", "Xác thực thất bại. Vui lòng thử lại.");
      }
    } else {
      setIsEnabled(false);
      Alert.alert("Đã tắt", "Đăng nhập sinh trắc học đã được tắt");
    }
  };

  const getBiometricIcon = (): string => {
    switch (biometricType) {
      case "facial":
        return "scan-outline";
      case "fingerprint":
        return "finger-print-outline";
      case "iris":
        return "eye-outline";
      default:
        return "lock-closed-outline";
    }
  };

  const getBiometricName = (): string => {
    switch (biometricType) {
      case "facial":
        return Platform.OS === "ios" ? "Face ID" : "Nhận diện khuôn mặt";
      case "fingerprint":
        return Platform.OS === "ios" ? "Touch ID" : "Vân tay";
      case "iris":
        return "Quét mống mắt";
      default:
        return "Sinh trắc học";
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Đăng nhập sinh trắc học</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Main Card */}
        <View style={styles.mainCard}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={getBiometricIcon() as any}
              size={48}
              color={COLORS.primary}
            />
          </View>
          <Text style={styles.biometricTitle}>{getBiometricName()}</Text>
          <Text style={styles.biometricDesc}>
            Sử dụng {getBiometricName()} để đăng nhập nhanh chóng và an toàn
          </Text>
        </View>

        {/* Status */}
        {biometricType === "none" ? (
          <View style={styles.warningCard}>
            <Ionicons name="warning" size={24} color={COLORS.warning} />
            <Text style={styles.warningText}>
              Thiết bị của bạn không hỗ trợ đăng nhập sinh trắc học
            </Text>
          </View>
        ) : !isEnrolled ? (
          <View style={styles.warningCard}>
            <Ionicons name="information-circle" size={24} color={COLORS.info} />
            <Text style={styles.warningText}>
              Bạn chưa thiết lập {getBiometricName()} trên thiết bị. Vui lòng
              vào Cài đặt để thiết lập.
            </Text>
          </View>
        ) : (
          <>
            {/* Toggle */}
            <View style={styles.settingCard}>
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <View style={styles.settingIconBg}>
                    <Ionicons
                      name={getBiometricIcon() as any}
                      size={22}
                      color={COLORS.primary}
                    />
                  </View>
                  <View>
                    <Text style={styles.settingTitle}>
                      Bật {getBiometricName()}
                    </Text>
                    <Text style={styles.settingSubtitle}>
                      {isEnabled ? "Đang bật" : "Đang tắt"}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={isEnabled}
                  onValueChange={handleToggle}
                  trackColor={{
                    false: COLORS.border,
                    true: COLORS.primary + "50",
                  }}
                  thumbColor={isEnabled ? COLORS.primary : "#f4f3f4"}
                />
              </View>
            </View>

            {/* Info Cards */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Lợi ích</Text>

              <View style={styles.infoCard}>
                <View style={styles.infoIconBg}>
                  <Ionicons name="flash" size={20} color="#F59E0B" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>Đăng nhập nhanh</Text>
                  <Text style={styles.infoDesc}>
                    Không cần nhập mật khẩu mỗi lần
                  </Text>
                </View>
              </View>

              <View style={styles.infoCard}>
                <View style={styles.infoIconBg}>
                  <Ionicons name="shield-checkmark" size={20} color="#10B981" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>Bảo mật cao</Text>
                  <Text style={styles.infoDesc}>
                    Dữ liệu sinh trắc chỉ lưu trên thiết bị
                  </Text>
                </View>
              </View>

              <View style={styles.infoCard}>
                <View style={styles.infoIconBg}>
                  <Ionicons name="person" size={20} color="#6366F1" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>Riêng tư</Text>
                  <Text style={styles.infoDesc}>
                    Chỉ bạn mới có thể đăng nhập
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  centered: { justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: "600", color: COLORS.text },
  content: { padding: 20 },
  mainCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  biometricTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },
  biometricDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  warningCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.warning + "15",
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  warningText: { flex: 1, fontSize: 14, color: COLORS.text, lineHeight: 20 },
  settingCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  settingIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primary + "15",
    justifyContent: "center",
    alignItems: "center",
  },
  settingTitle: { fontSize: 16, fontWeight: "600", color: COLORS.text },
  settingSubtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  infoSection: { gap: 12 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoIconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.bg,
    justifyContent: "center",
    alignItems: "center",
  },
  infoContent: { flex: 1 },
  infoTitle: { fontSize: 15, fontWeight: "600", color: COLORS.text },
  infoDesc: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
});
