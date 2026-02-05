import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/features/auth";
import { ApiError, apiFetch } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

type PasswordStrength = "weak" | "medium" | "strong";

export default function SecurityScreen() {
  const { user } = useAuth();

  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<PasswordErrors>({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] =
    useState<PasswordStrength>("weak");

  // Security settings
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loginNotifications, setLoginNotifications] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  // Active sessions
  const [sessions, setSessions] = useState([
    {
      id: "1",
      device: "iPhone 13 Pro",
      location: "TP. Hồ Chí Minh",
      ip: "118.69.xxx.xxx",
      lastActive: "5 phút trước",
      current: true,
    },
    {
      id: "2",
      device: "Chrome on Windows",
      location: "Hà Nội",
      ip: "171.244.xxx.xxx",
      lastActive: "2 giờ trước",
      current: false,
    },
    {
      id: "3",
      device: "Safari on MacBook",
      location: "Đà Nẵng",
      ip: "14.177.xxx.xxx",
      lastActive: "1 ngày trước",
      current: false,
    },
  ]);

  // Calculate security score (0-100)
  const calculateSecurityScore = (): number => {
    let score = 30; // Base score

    if (twoFactorEnabled) score += 30;
    if (biometricEnabled) score += 20;
    if (loginNotifications) score += 10;
    if (passwordStrength === "strong") score += 10;

    return Math.min(score, 100);
  };

  const securityScore = calculateSecurityScore();

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#0066CC";
    if (score >= 50) return "#0066CC";
    return "#000000";
  };

  const getScoreText = (score: number) => {
    if (score >= 80) return "Tốt";
    if (score >= 50) return "Trung bình";
    return "Yếu";
  };

  // Password strength checker
  const checkPasswordStrength = (password: string): PasswordStrength => {
    if (!password) return "weak";

    let strength = 0;

    // Length
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;

    // Contains uppercase
    if (/[A-Z]/.test(password)) strength++;

    // Contains lowercase
    if (/[a-z]/.test(password)) strength++;

    // Contains number
    if (/[0-9]/.test(password)) strength++;

    // Contains special char
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength >= 5) return "strong";
    if (strength >= 3) return "medium";
    return "weak";
  };

  const getStrengthColor = (strength: PasswordStrength) => {
    switch (strength) {
      case "strong":
        return "#0066CC";
      case "medium":
        return "#0066CC";
      case "weak":
        return "#000000";
    }
  };

  const getStrengthText = (strength: PasswordStrength) => {
    switch (strength) {
      case "strong":
        return "Mạnh";
      case "medium":
        return "Trung bình";
      case "weak":
        return "Yếu";
    }
  };

  const getStrengthWidth = (strength: PasswordStrength) => {
    switch (strength) {
      case "strong":
        return "100%";
      case "medium":
        return "66%";
      case "weak":
        return "33%";
    }
  };

  useEffect(() => {
    setPasswordStrength(checkPasswordStrength(passwordForm.newPassword));
  }, [passwordForm.newPassword]);

  const validatePassword = (): boolean => {
    const newErrors: PasswordErrors = {};

    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
    }

    if (!passwordForm.newPassword) {
      newErrors.newPassword = "Vui lòng nhập mật khẩu mới";
    } else if (passwordForm.newPassword.length < 6) {
      newErrors.newPassword = "Mật khẩu phải có ít nhất 6 ký tự";
    } else if (passwordForm.newPassword === passwordForm.currentPassword) {
      newErrors.newPassword = "Mật khẩu mới phải khác mật khẩu hiện tại";
    }

    if (!passwordForm.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu mới";
    } else if (passwordForm.confirmPassword !== passwordForm.newPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) {
      return;
    }

    setChangingPassword(true);
    try {
      // API endpoint: POST /users/change-password (per API docs)
      await apiFetch("/users/change-password", {
        method: "POST",
        data: {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        },
      });

      Alert.alert("Thành công", "Đổi mật khẩu thành công", [
        {
          text: "OK",
          onPress: () => {
            setPasswordForm({
              currentPassword: "",
              newPassword: "",
              confirmPassword: "",
            });
            setErrors({});
          },
        },
      ]);
    } catch (error) {
      const detail =
        (error as ApiError)?.data?.message ||
        (error as Error)?.message ||
        "Không thể đổi mật khẩu";
      Alert.alert("Lỗi", detail);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleToggle2FA = (value: boolean) => {
    if (value) {
      Alert.alert(
        "Kích hoạt xác thực 2 bước",
        "Bạn sẽ cần mã xác thực từ ứng dụng Authenticator mỗi khi đăng nhập.",
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "Tiếp tục",
            onPress: () => {
              setTwoFactorEnabled(true);
            },
          },
        ],
      );
    } else {
      Alert.alert(
        "Tắt xác thực 2 bước",
        "Tài khoản của bạn sẽ kém bảo mật hơn nếu tắt tính năng này.",
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "Tắt",
            onPress: () => setTwoFactorEnabled(false),
            style: "destructive",
          },
        ],
      );
    }
  };

  const handleEndSession = (sessionId: string) => {
    Alert.alert(
      "Kết thúc phiên",
      "Bạn có chắc muốn đăng xuất khỏi thiết bị này?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đăng xuất",
          style: "destructive",
          onPress: () => {
            setSessions(sessions.filter((s) => s.id !== sessionId));
          },
        },
      ],
    );
  };

  const handleEndAllSessions = () => {
    Alert.alert(
      "Đăng xuất tất cả",
      "Bạn sẽ bị đăng xuất khỏi tất cả thiết bị khác (trừ thiết bị hiện tại).",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đăng xuất",
          style: "destructive",
          onPress: () => {
            setSessions(sessions.filter((s) => s.current));
          },
        },
      ],
    );
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: "Bảo mật",
          headerBackTitle: "Quay lại",
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Security Score Card */}
          <View style={styles.scoreCard}>
            <View style={styles.scoreHeader}>
              <Ionicons
                name="shield-checkmark"
                size={32}
                color={getScoreColor(securityScore)}
              />
              <View style={styles.scoreTextContainer}>
                <Text style={styles.scoreLabel}>Điểm bảo mật</Text>
                <View style={styles.scoreRow}>
                  <Text
                    style={[
                      styles.scoreValue,
                      { color: getScoreColor(securityScore) },
                    ]}
                  >
                    {securityScore}/100
                  </Text>
                  <View
                    style={[
                      styles.scoreBadge,
                      { backgroundColor: getScoreColor(securityScore) + "20" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.scoreBadgeText,
                        { color: getScoreColor(securityScore) },
                      ]}
                    >
                      {getScoreText(securityScore)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${securityScore}%`,
                    backgroundColor: getScoreColor(securityScore),
                  },
                ]}
              />
            </View>

            {/* Recommendations */}
            {securityScore < 100 && (
              <View style={styles.recommendations}>
                <Text style={styles.recommendTitle}>Khuyến nghị:</Text>
                {!twoFactorEnabled && (
                  <View style={styles.recommendItem}>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color="#6B7280"
                    />
                    <Text style={styles.recommendText}>
                      Bật xác thực 2 bước (+30 điểm)
                    </Text>
                  </View>
                )}
                {!biometricEnabled && (
                  <View style={styles.recommendItem}>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color="#6B7280"
                    />
                    <Text style={styles.recommendText}>
                      Bật sinh trắc học (+20 điểm)
                    </Text>
                  </View>
                )}
                {passwordStrength !== "strong" && (
                  <View style={styles.recommendItem}>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color="#6B7280"
                    />
                    <Text style={styles.recommendText}>
                      Dùng mật khẩu mạnh hơn (+10 điểm)
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Change Password Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="lock-closed" size={24} color="#0891B2" />
              <Text style={styles.sectionTitle}>Đổi mật khẩu</Text>
            </View>

            <View style={styles.card}>
              {/* Current Password */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>
                  Mật khẩu hiện tại <Text style={styles.required}>*</Text>
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    errors.currentPassword && styles.inputError,
                  ]}
                >
                  <TextInput
                    style={styles.input}
                    value={passwordForm.currentPassword}
                    onChangeText={(text) => {
                      setPasswordForm({
                        ...passwordForm,
                        currentPassword: text,
                      });
                      if (errors.currentPassword)
                        setErrors({ ...errors, currentPassword: undefined });
                    }}
                    placeholder="Nhập mật khẩu hiện tại"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showCurrentPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    <Ionicons
                      name={
                        showCurrentPassword ? "eye-off-outline" : "eye-outline"
                      }
                      size={22}
                      color="#6B7280"
                    />
                  </TouchableOpacity>
                </View>
                {errors.currentPassword && (
                  <Text style={styles.errorText}>{errors.currentPassword}</Text>
                )}
              </View>

              {/* New Password */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>
                  Mật khẩu mới <Text style={styles.required}>*</Text>
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    errors.newPassword && styles.inputError,
                  ]}
                >
                  <TextInput
                    style={styles.input}
                    value={passwordForm.newPassword}
                    onChangeText={(text) => {
                      setPasswordForm({ ...passwordForm, newPassword: text });
                      if (errors.newPassword)
                        setErrors({ ...errors, newPassword: undefined });
                    }}
                    placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showNewPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowNewPassword(!showNewPassword)}
                  >
                    <Ionicons
                      name={showNewPassword ? "eye-off-outline" : "eye-outline"}
                      size={22}
                      color="#6B7280"
                    />
                  </TouchableOpacity>
                </View>
                {errors.newPassword && (
                  <Text style={styles.errorText}>{errors.newPassword}</Text>
                )}

                {/* Password Strength Indicator */}
                {passwordForm.newPassword.length > 0 && (
                  <View style={styles.strengthContainer}>
                    <View style={styles.strengthBar}>
                      <View
                        style={[
                          styles.strengthFill,
                          {
                            width: getStrengthWidth(passwordStrength),
                            backgroundColor: getStrengthColor(passwordStrength),
                          },
                        ]}
                      />
                    </View>
                    <Text
                      style={[
                        styles.strengthText,
                        { color: getStrengthColor(passwordStrength) },
                      ]}
                    >
                      Độ mạnh: {getStrengthText(passwordStrength)}
                    </Text>
                  </View>
                )}
              </View>

              {/* Confirm Password */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>
                  Xác nhận mật khẩu <Text style={styles.required}>*</Text>
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    errors.confirmPassword && styles.inputError,
                  ]}
                >
                  <TextInput
                    style={styles.input}
                    value={passwordForm.confirmPassword}
                    onChangeText={(text) => {
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: text,
                      });
                      if (errors.confirmPassword)
                        setErrors({ ...errors, confirmPassword: undefined });
                    }}
                    placeholder="Nhập lại mật khẩu mới"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Ionicons
                      name={
                        showConfirmPassword ? "eye-off-outline" : "eye-outline"
                      }
                      size={22}
                      color="#6B7280"
                    />
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword && (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  changingPassword && styles.buttonDisabled,
                ]}
                onPress={handleChangePassword}
                disabled={changingPassword}
                activeOpacity={0.8}
              >
                {changingPassword ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                    <Text style={styles.primaryButtonText}>Đổi mật khẩu</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Security Settings */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="settings" size={24} color="#0066CC" />
              <Text style={styles.sectionTitle}>Cài đặt bảo mật</Text>
            </View>

            <View style={styles.card}>
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View
                    style={[
                      styles.settingIconContainer,
                      { backgroundColor: "#E8F4FF" },
                    ]}
                  >
                    <Ionicons name="finger-print" size={24} color="#3B82F6" />
                  </View>
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Xác thực 2 bước</Text>
                    <Text style={styles.settingDescription}>
                      Bảo vệ tài khoản bằng mã xác thực
                    </Text>
                  </View>
                </View>
                <Switch
                  value={twoFactorEnabled}
                  onValueChange={handleToggle2FA}
                  trackColor={{ false: "#D1D5DB", true: "#0891B2" }}
                  thumbColor="#fff"
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View
                    style={[
                      styles.settingIconContainer,
                      { backgroundColor: "#FEF3C7" },
                    ]}
                  >
                    <Ionicons name="notifications" size={24} color="#0066CC" />
                  </View>
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Thông báo đăng nhập</Text>
                    <Text style={styles.settingDescription}>
                      Nhận thông báo khi có đăng nhập mới
                    </Text>
                  </View>
                </View>
                <Switch
                  value={loginNotifications}
                  onValueChange={setLoginNotifications}
                  trackColor={{ false: "#D1D5DB", true: "#0891B2" }}
                  thumbColor="#fff"
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View
                    style={[
                      styles.settingIconContainer,
                      { backgroundColor: "#D1FAE5" },
                    ]}
                  >
                    <Ionicons name="scan" size={24} color="#0066CC" />
                  </View>
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Sinh trắc học</Text>
                    <Text style={styles.settingDescription}>
                      Đăng nhập bằng vân tay/Face ID
                    </Text>
                  </View>
                </View>
                <Switch
                  value={biometricEnabled}
                  onValueChange={setBiometricEnabled}
                  trackColor={{ false: "#D1D5DB", true: "#0891B2" }}
                  thumbColor="#fff"
                />
              </View>
            </View>
          </View>

          {/* Active Sessions */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="phone-portrait" size={24} color="#0066CC" />
              <Text style={styles.sectionTitle}>
                Phiên đăng nhập ({sessions.length})
              </Text>
            </View>

            <View style={styles.card}>
              {sessions.map((session, index) => (
                <View key={session.id}>
                  <View style={styles.sessionItem}>
                    <View
                      style={[
                        styles.sessionIconContainer,
                        {
                          backgroundColor: session.current
                            ? "#E8F4FF"
                            : "#F3F4F6",
                        },
                      ]}
                    >
                      <Ionicons
                        name={
                          session.device.includes("iPhone")
                            ? "phone-portrait"
                            : "desktop"
                        }
                        size={24}
                        color={session.current ? "#3B82F6" : "#6B7280"}
                      />
                    </View>
                    <View style={styles.sessionInfo}>
                      <View style={styles.sessionHeader}>
                        <Text style={styles.sessionDevice}>
                          {session.device}
                        </Text>
                        {session.current && (
                          <View style={styles.currentBadge}>
                            <View style={styles.currentDot} />
                            <Text style={styles.currentBadgeText}>
                              Hiện tại
                            </Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.sessionMeta}>
                        <Ionicons name="location" size={14} color="#9CA3AF" />
                        <Text style={styles.sessionLocation}>
                          {session.location}
                        </Text>
                      </View>
                      <View style={styles.sessionMeta}>
                        <Ionicons name="globe" size={14} color="#9CA3AF" />
                        <Text style={styles.sessionIP}>{session.ip}</Text>
                      </View>
                      <View style={styles.sessionMeta}>
                        <Ionicons name="time" size={14} color="#9CA3AF" />
                        <Text style={styles.sessionTime}>
                          {session.lastActive}
                        </Text>
                      </View>
                    </View>
                    {!session.current && (
                      <TouchableOpacity
                        onPress={() => handleEndSession(session.id)}
                        style={styles.sessionEndButton}
                      >
                        <Ionicons
                          name="close-circle"
                          size={28}
                          color="#000000"
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                  {index < sessions.length - 1 && (
                    <View style={styles.divider} />
                  )}
                </View>
              ))}

              {sessions.length > 1 && (
                <>
                  <View style={styles.divider} />
                  <TouchableOpacity
                    style={styles.dangerButton}
                    onPress={handleEndAllSessions}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="log-out-outline"
                      size={20}
                      color="#000000"
                    />
                    <Text style={styles.dangerButtonText}>
                      Đăng xuất tất cả thiết bị khác
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>

          {/* Security Tips */}
          <View style={styles.tipsCard}>
            <View style={styles.tipsHeader}>
              <Ionicons name="bulb" size={20} color="#0066CC" />
              <Text style={styles.tipsTitle}>Mẹo bảo mật</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#0066CC" />
              <Text style={styles.tipText}>
                Sử dụng mật khẩu mạnh với ít nhất 8 ký tự
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#0066CC" />
              <Text style={styles.tipText}>
                Bật xác thực 2 bước để tăng cường bảo mật
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#0066CC" />
              <Text style={styles.tipText}>
                Không chia sẻ mật khẩu với bất kỳ ai
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#0066CC" />
              <Text style={styles.tipText}>
                Đổi mật khẩu định kỳ mỗi 3-6 tháng
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  scoreCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  scoreHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 16,
  },
  scoreTextContainer: {
    flex: 1,
  },
  scoreLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: "700",
  },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scoreBadgeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 16,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  recommendations: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
  },
  recommendTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  recommendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  recommendText: {
    fontSize: 13,
    color: "#6B7280",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  required: {
    color: "#000000",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  inputError: {
    borderColor: "#000000",
    backgroundColor: "#FEF2F2",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
    paddingVertical: 12,
  },
  errorText: {
    fontSize: 13,
    color: "#000000",
    marginTop: 6,
  },
  strengthContainer: {
    marginTop: 8,
  },
  strengthBar: {
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 6,
  },
  strengthFill: {
    height: "100%",
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: "600",
  },
  primaryButton: {
    backgroundColor: "#0891B2",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  settingIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: "#6B7280",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
  },
  sessionItem: {
    flexDirection: "row",
    paddingVertical: 12,
    gap: 12,
  },
  sessionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  sessionInfo: {
    flex: 1,
  },
  sessionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  sessionDevice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  currentBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F4FF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
  },
  currentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#3B82F6",
  },
  currentBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1E40AF",
  },
  sessionMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 3,
  },
  sessionLocation: {
    fontSize: 13,
    color: "#6B7280",
  },
  sessionIP: {
    fontSize: 13,
    color: "#6B7280",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  sessionTime: {
    fontSize: 13,
    color: "#6B7280",
  },
  sessionEndButton: {
    padding: 4,
  },
  dangerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 8,
  },
  dangerButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000000",
  },
  tipsCard: {
    backgroundColor: "#FFFBEB",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#92400E",
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: "#78350F",
    lineHeight: 20,
    flex: 1,
  },
});
