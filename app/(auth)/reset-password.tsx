/**
 * Reset Password Screen - Premium Dark Theme
 *
 * Token-based password reset from email link.
 *
 * @redesigned 2026-02-25
 */

import { AUTH_THEME as T } from "@/constants/auth-theme";
import { apiFetch } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
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
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string }>();

  const [token, setToken] = useState(params.token || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!token) {
      Alert.alert("Lỗi", "Token không hợp lệ. Vui lòng sử dụng link từ email.");
      return;
    }
    if (!password || password.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);
    try {
      const response = await apiFetch<{ success: boolean; message: string }>(
        "/auth/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, newPassword: password }),
        },
      );
      if (response.success) {
        Alert.alert("Thành công", "Mật khẩu đã được đặt lại.", [
          { text: "Đăng nhập", onPress: () => router.replace("/(auth)/login") },
        ]);
      }
    } catch (error: any) {
      let errorMessage = "Không thể đặt lại mật khẩu. Token có thể đã hết hạn.";
      if (error?.message) {
        const msg = error.message.toLowerCase();
        if (msg.includes("expired") || msg.includes("hết hạn")) {
          errorMessage =
            "Link đặt lại mật khẩu đã hết hạn. Vui lòng yêu cầu link mới.";
        } else if (msg.includes("invalid") || msg.includes("không hợp lệ")) {
          errorMessage = "Link đặt lại mật khẩu không hợp lệ.";
        } else if (msg.includes("weak") || msg.includes("yếu")) {
          errorMessage = "Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn.";
        } else if (msg.includes("network") || msg.includes("timeout")) {
          errorMessage = "Lỗi kết nối mạng.";
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
            <Pressable style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} color={T.white} />
            </Pressable>
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
                <Ionicons name="lock-open" size={28} color={T.primary} />
              </View>
              <Text style={styles.title}>Đặt lại mật khẩu</Text>
              <Text style={styles.subtitle}>
                Nhập mật khẩu mới cho tài khoản của bạn
              </Text>
            </Animated.View>

            {/* Card */}
            <Animated.View
              entering={FadeInDown.delay(100).duration(350)}
              style={styles.card}
            >
              {/* Token input (only if not from URL) */}
              {!params.token && (
                <View style={{ marginBottom: T.gap.lg }}>
                  <Text style={styles.label}>Token (từ email)</Text>
                  <View
                    style={[
                      styles.inputRow,
                      focusedField === "token" && styles.inputRowFocused,
                    ]}
                  >
                    <Ionicons
                      name="key-outline"
                      size={20}
                      color={focusedField === "token" ? T.primary : T.textMuted}
                      style={{ marginRight: T.gap.md }}
                    />
                    <TextInput
                      style={styles.inputText}
                      placeholder="Nhập token từ email"
                      placeholderTextColor={T.textDim}
                      value={token}
                      onChangeText={setToken}
                      autoCapitalize="none"
                      editable={!loading}
                      selectionColor={T.primaryLight}
                      onFocus={() => setFocusedField("token")}
                      onBlur={() => setFocusedField(null)}
                    />
                  </View>
                </View>
              )}

              {/* New Password */}
              <View style={{ marginBottom: T.gap.lg }}>
                <Text style={styles.label}>Mật khẩu mới</Text>
                <View
                  style={[
                    styles.inputRow,
                    focusedField === "password" && styles.inputRowFocused,
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={
                      focusedField === "password" ? T.primary : T.textMuted
                    }
                    style={{ marginRight: T.gap.md }}
                  />
                  <TextInput
                    style={styles.inputText}
                    placeholder="Ít nhất 6 ký tự"
                    placeholderTextColor={T.textDim}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPass}
                    editable={!loading}
                    selectionColor={T.primaryLight}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
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
              </View>

              {/* Confirm Password */}
              <View style={{ marginBottom: T.gap.xl }}>
                <Text style={styles.label}>Xác nhận mật khẩu</Text>
                <View
                  style={[
                    styles.inputRow,
                    focusedField === "confirm" && styles.inputRowFocused,
                  ]}
                >
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={20}
                    color={focusedField === "confirm" ? T.primary : T.textMuted}
                    style={{ marginRight: T.gap.md }}
                  />
                  <TextInput
                    style={styles.inputText}
                    placeholder="Nhập lại mật khẩu mới"
                    placeholderTextColor={T.textDim}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPass}
                    editable={!loading}
                    selectionColor={T.primaryLight}
                    onFocus={() => setFocusedField("confirm")}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>

              {/* Submit */}
              <Pressable
                style={[styles.ctaBtn, loading && { opacity: 0.6 }]}
                onPress={handleSubmit}
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

              {/* Back link */}
              <Pressable onPress={() => router.back()} style={styles.backLink}>
                <Ionicons name="arrow-back" size={16} color={T.primaryLight} />
                <Text style={styles.backLinkTxt}>Quay lại</Text>
              </Pressable>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

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

  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  headerWrap: { alignItems: "center", marginTop: 8, marginBottom: 28 },
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(139,92,246,0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: T.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: T.textSecondary,
    textAlign: "center",
    lineHeight: 20,
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

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: T.textSecondary,
    marginBottom: 8,
    marginLeft: 4,
  },

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
  inputText: { flex: 1, fontSize: 15, color: T.text },

  ctaBtn: { borderRadius: T.radius.md, overflow: "hidden" },
  ctaGrad: { height: T.btnH, justifyContent: "center", alignItems: "center" },
  ctaTxt: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.3,
  },

  backLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: T.gap.lg,
    paddingVertical: T.gap.sm,
  },
  backLinkTxt: {
    fontSize: 14,
    fontWeight: "600",
    color: T.primaryLight,
  },
});
