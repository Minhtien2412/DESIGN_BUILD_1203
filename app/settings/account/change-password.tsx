/**
 * Change Password Screen
 * @route /profile/change-password
 */

import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
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
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  primary: "#10B981",
  bg: "#F8FAFC",
  card: "#FFFFFF",
  text: "#0F172A",
  textSecondary: "#64748B",
  border: "#E2E8F0",
  error: "#EF4444",
  success: "#10B981",
};

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "Vui lòng nhập mật khẩu mới";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Mật khẩu phải có ít nhất 8 ký tự";
    } else if (!/[A-Z]/.test(formData.newPassword)) {
      newErrors.newPassword = "Mật khẩu phải có ít nhất 1 chữ hoa";
    } else if (!/[0-9]/.test(formData.newPassword)) {
      newErrors.newPassword = "Mật khẩu phải có ít nhất 1 số";
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = "Mật khẩu mới phải khác mật khẩu hiện tại";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      // API endpoint: POST /users/change-password
      await apiFetch("/users/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });
      Alert.alert("Thành công", "Đã đổi mật khẩu thành công", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      if (
        error?.message?.includes("incorrect") ||
        error?.message?.includes("401")
      ) {
        setErrors({ currentPassword: "Mật khẩu hiện tại không đúng" });
      } else {
        Alert.alert("Lỗi", error?.message || "Không thể đổi mật khẩu");
      }
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { level: "Yếu", color: COLORS.error };
    if (score <= 3) return { level: "Trung bình", color: "#F59E0B" };
    if (score <= 4) return { level: "Mạnh", color: "#06B6D4" };
    return { level: "Rất mạnh", color: COLORS.success };
  };

  const strength = getPasswordStrength(formData.newPassword);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Đổi mật khẩu</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          {/* Info Card */}
          <View style={styles.infoCard}>
            <Ionicons
              name="shield-checkmark"
              size={24}
              color={COLORS.primary}
            />
            <Text style={styles.infoText}>
              Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm chữ hoa và số
            </Text>
          </View>

          {/* Current Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mật khẩu hiện tại</Text>
            <View
              style={[
                styles.inputWrapper,
                errors.currentPassword && styles.inputError,
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={COLORS.textSecondary}
              />
              <TextInput
                style={styles.input}
                placeholder="Nhập mật khẩu hiện tại"
                placeholderTextColor={COLORS.textSecondary}
                secureTextEntry={!showPasswords.current}
                value={formData.currentPassword}
                onChangeText={(text) => {
                  setFormData({ ...formData, currentPassword: text });
                  if (errors.currentPassword)
                    setErrors({ ...errors, currentPassword: "" });
                }}
              />
              <Pressable
                onPress={() =>
                  setShowPasswords({
                    ...showPasswords,
                    current: !showPasswords.current,
                  })
                }
              >
                <Ionicons
                  name={
                    showPasswords.current ? "eye-off-outline" : "eye-outline"
                  }
                  size={20}
                  color={COLORS.textSecondary}
                />
              </Pressable>
            </View>
            {errors.currentPassword && (
              <Text style={styles.errorText}>{errors.currentPassword}</Text>
            )}
          </View>

          {/* New Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mật khẩu mới</Text>
            <View
              style={[
                styles.inputWrapper,
                errors.newPassword && styles.inputError,
              ]}
            >
              <Ionicons
                name="key-outline"
                size={20}
                color={COLORS.textSecondary}
              />
              <TextInput
                style={styles.input}
                placeholder="Nhập mật khẩu mới"
                placeholderTextColor={COLORS.textSecondary}
                secureTextEntry={!showPasswords.new}
                value={formData.newPassword}
                onChangeText={(text) => {
                  setFormData({ ...formData, newPassword: text });
                  if (errors.newPassword)
                    setErrors({ ...errors, newPassword: "" });
                }}
              />
              <Pressable
                onPress={() =>
                  setShowPasswords({
                    ...showPasswords,
                    new: !showPasswords.new,
                  })
                }
              >
                <Ionicons
                  name={showPasswords.new ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={COLORS.textSecondary}
                />
              </Pressable>
            </View>
            {formData.newPassword && (
              <View style={styles.strengthRow}>
                <View style={styles.strengthBars}>
                  {[1, 2, 3, 4].map((i) => (
                    <View
                      key={i}
                      style={[
                        styles.strengthBar,
                        {
                          backgroundColor:
                            (strength.level === "Rất mạnh" && i <= 4) ||
                            (strength.level === "Mạnh" && i <= 3) ||
                            (strength.level === "Trung bình" && i <= 2) ||
                            (strength.level === "Yếu" && i <= 1)
                              ? strength.color
                              : COLORS.border,
                        },
                      ]}
                    />
                  ))}
                </View>
                <Text style={[styles.strengthText, { color: strength.color }]}>
                  {strength.level}
                </Text>
              </View>
            )}
            {errors.newPassword && (
              <Text style={styles.errorText}>{errors.newPassword}</Text>
            )}
          </View>

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
            <View
              style={[
                styles.inputWrapper,
                errors.confirmPassword && styles.inputError,
              ]}
            >
              <Ionicons
                name="shield-outline"
                size={20}
                color={COLORS.textSecondary}
              />
              <TextInput
                style={styles.input}
                placeholder="Nhập lại mật khẩu mới"
                placeholderTextColor={COLORS.textSecondary}
                secureTextEntry={!showPasswords.confirm}
                value={formData.confirmPassword}
                onChangeText={(text) => {
                  setFormData({ ...formData, confirmPassword: text });
                  if (errors.confirmPassword)
                    setErrors({ ...errors, confirmPassword: "" });
                }}
              />
              <Pressable
                onPress={() =>
                  setShowPasswords({
                    ...showPasswords,
                    confirm: !showPasswords.confirm,
                  })
                }
              >
                <Ionicons
                  name={
                    showPasswords.confirm ? "eye-off-outline" : "eye-outline"
                  }
                  size={20}
                  color={COLORS.textSecondary}
                />
              </Pressable>
            </View>
            {errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}
          </View>

          {/* Submit Button */}
          <Pressable
            style={[
              styles.submitButton,
              loading && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Đổi mật khẩu</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
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
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10B98115",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  infoText: { flex: 1, fontSize: 14, color: COLORS.text, lineHeight: 20 },
  inputGroup: { marginBottom: 20 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    gap: 12,
  },
  inputError: { borderColor: COLORS.error },
  input: { flex: 1, fontSize: 16, color: COLORS.text },
  errorText: { fontSize: 12, color: COLORS.error, marginTop: 4 },
  strengthRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  strengthBars: { flexDirection: "row", gap: 4 },
  strengthBar: { width: 40, height: 4, borderRadius: 2 },
  strengthText: { fontSize: 12, fontWeight: "500" },
  submitButton: {
    backgroundColor: COLORS.primary,
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  submitButtonDisabled: { opacity: 0.7 },
  submitButtonText: { fontSize: 16, fontWeight: "600", color: "#fff" },
});
