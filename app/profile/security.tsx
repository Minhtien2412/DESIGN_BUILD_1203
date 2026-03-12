/**
 * Security & Privacy Screen
 * Password change, 2FA, privacy settings
 * @route /profile/security
 */

import { useAuth } from "@/context/AuthContext";
import { changePassword } from "@/services/userApi";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, router } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const STATUS_H = StatusBar.currentHeight ?? 44;

export default function SecurityScreen() {
  const { user } = useAuth();

  // Password form
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Switches
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);

  const handleChangePassword = async () => {
    if (!oldPassword.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập mật khẩu hiện tại");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu mới tối thiểu 6 ký tự");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);
    try {
      await changePassword(Number(user?.id) || 0, oldPassword, newPassword);
      Alert.alert("Thành công", "Đã đổi mật khẩu thành công");
      setShowPasswordForm(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      Alert.alert(
        "Lỗi",
        err?.message || "Không thể đổi mật khẩu. Vui lòng thử lại.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleToggle2FA = (val: boolean) => {
    if (val) {
      Alert.alert(
        "Xác thực 2 lớp",
        "Tính năng xác thực 2 lớp sẽ sớm được hỗ trợ. Bạn sẽ nhận thông báo khi tính năng sẵn sàng.",
        [{ text: "Đã hiểu" }],
      );
    } else {
      setTwoFactorEnabled(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Header */}
      <LinearGradient
        colors={["#1E3A5F", "#8B5CF6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bảo mật & Quyền riêng tư</Text>
          <View style={styles.backBtn} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Password Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MẬT KHẨU</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.row}
              onPress={() => setShowPasswordForm(!showPasswordForm)}
              activeOpacity={0.6}
            >
              <View style={[styles.iconWrap, { backgroundColor: "#EDE9FE" }]}>
                <Ionicons name="key-outline" size={20} color="#8B5CF6" />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Đổi mật khẩu</Text>
                <Text style={styles.rowSub}>Cập nhật mật khẩu đăng nhập</Text>
              </View>
              <Ionicons
                name={showPasswordForm ? "chevron-up" : "chevron-down"}
                size={18}
                color="#94A3B8"
              />
            </TouchableOpacity>

            {showPasswordForm && (
              <View style={styles.passwordForm}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Mật khẩu hiện tại</Text>
                  <View style={styles.inputRow}>
                    <TextInput
                      style={styles.input}
                      value={oldPassword}
                      onChangeText={setOldPassword}
                      secureTextEntry={!showOld}
                      placeholder="Nhập mật khẩu hiện tại"
                      placeholderTextColor="#94A3B8"
                    />
                    <TouchableOpacity
                      onPress={() => setShowOld(!showOld)}
                      style={styles.eyeBtn}
                    >
                      <Ionicons
                        name={showOld ? "eye-off-outline" : "eye-outline"}
                        size={20}
                        color="#64748B"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Mật khẩu mới</Text>
                  <View style={styles.inputRow}>
                    <TextInput
                      style={styles.input}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={!showNew}
                      placeholder="Tối thiểu 6 ký tự"
                      placeholderTextColor="#94A3B8"
                    />
                    <TouchableOpacity
                      onPress={() => setShowNew(!showNew)}
                      style={styles.eyeBtn}
                    >
                      <Ionicons
                        name={showNew ? "eye-off-outline" : "eye-outline"}
                        size={20}
                        color="#64748B"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Xác nhận mật khẩu mới</Text>
                  <View style={styles.inputRow}>
                    <TextInput
                      style={styles.input}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirm}
                      placeholder="Nhập lại mật khẩu mới"
                      placeholderTextColor="#94A3B8"
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirm(!showConfirm)}
                      style={styles.eyeBtn}
                    >
                      <Ionicons
                        name={showConfirm ? "eye-off-outline" : "eye-outline"}
                        size={20}
                        color="#64748B"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.saveBtn, loading && { opacity: 0.6 }]}
                  onPress={handleChangePassword}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={["#8B5CF6", "#7C3AED"]}
                    style={styles.saveBtnGradient}
                  >
                    <Text style={styles.saveBtnText}>
                      {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Authentication Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>XÁC THỰC</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={[styles.iconWrap, { backgroundColor: "#DBEAFE" }]}>
                <Ionicons
                  name="phone-portrait-outline"
                  size={20}
                  color="#3B82F6"
                />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Xác thực 2 lớp (2FA)</Text>
                <Text style={styles.rowSub}>Bảo vệ tài khoản bằng OTP</Text>
              </View>
              <Switch
                value={twoFactorEnabled}
                onValueChange={handleToggle2FA}
                trackColor={{ false: "#E2E8F0", true: "#8B5CF6" }}
                thumbColor="#fff"
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <View style={[styles.iconWrap, { backgroundColor: "#D1FAE5" }]}>
                <Ionicons
                  name="finger-print-outline"
                  size={20}
                  color="#10B981"
                />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Đăng nhập sinh trắc học</Text>
                <Text style={styles.rowSub}>Face ID / Vân tay</Text>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={setBiometricEnabled}
                trackColor={{ false: "#E2E8F0", true: "#10B981" }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>QUYỀN RIÊNG TƯ</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={[styles.iconWrap, { backgroundColor: "#FEF3C7" }]}>
                <Ionicons
                  name="alert-circle-outline"
                  size={20}
                  color="#F59E0B"
                />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Cảnh báo đăng nhập lạ</Text>
                <Text style={styles.rowSub}>
                  Thông báo khi có đăng nhập mới
                </Text>
              </View>
              <Switch
                value={loginAlerts}
                onValueChange={setLoginAlerts}
                trackColor={{ false: "#E2E8F0", true: "#F59E0B" }}
                thumbColor="#fff"
              />
            </View>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.row} activeOpacity={0.6}>
              <View style={[styles.iconWrap, { backgroundColor: "#FEE2E2" }]}>
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
              </View>
              <View style={styles.rowContent}>
                <Text style={[styles.rowTitle, { color: "#EF4444" }]}>
                  Xóa tài khoản
                </Text>
                <Text style={styles.rowSub}>
                  Xóa vĩnh viễn tài khoản và dữ liệu
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    paddingTop: STATUS_H + 8,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
    }),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  rowContent: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },
  rowSub: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginLeft: 64,
  },
  passwordForm: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  inputGroup: {
    marginTop: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#0F172A",
  },
  eyeBtn: {
    padding: 12,
  },
  saveBtn: {
    marginTop: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  saveBtnGradient: {
    paddingVertical: 14,
    alignItems: "center",
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
});
