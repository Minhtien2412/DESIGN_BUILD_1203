/**
 * Two-Factor Authentication Settings Screen
 * ==========================================
 *
 * Manage 2FA settings:
 * - Enable/disable TOTP 2FA
 * - View/regenerate backup codes
 * - QR code setup wizard
 *
 * @author ThietKeResort Team
 * @created 2026-01-22
 */

import { useThemeColor } from "@/hooks/use-theme-color";
import { useTotpSetup } from "@/hooks/use-totp-setup";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Clipboard,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// ============================================================================
// Component
// ============================================================================

export default function TwoFactorSettingsScreen() {
  const colors = useThemeColor();
  const {
    step,
    status,
    setupData,
    backupCodes,
    code,
    error,
    loading,
    remainingAttempts,
    setCode,
    checkStatus,
    startSetup,
    verifyAndEnable,
    disable,
    regenerateBackupCodes,
    reset,
  } = useTotpSetup();

  // Local state for disable flow
  const [disableCode, setDisableCode] = useState("");
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [regenerateCode, setRegenerateCode] = useState("");
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  // Check status on mount
  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // ============================================
  // Handlers
  // ============================================

  const handleStartSetup = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await startSetup();
  }, [startSetup]);

  const handleVerify = useCallback(async () => {
    if (code.length !== 6) {
      Alert.alert("Lỗi", "Vui lòng nhập mã 6 số");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const success = await verifyAndEnable();

    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Thành công!",
        "Xác thực 2 yếu tố đã được bật. Hãy lưu mã dự phòng ở nơi an toàn.",
        [{ text: "OK", onPress: () => setShowBackupCodes(true) }],
      );
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [code, verifyAndEnable]);

  const handleDisable = useCallback(async () => {
    if (disableCode.length !== 6) {
      Alert.alert("Lỗi", "Vui lòng nhập mã 6 số");
      return;
    }

    const success = await disable(disableCode);

    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowDisableModal(false);
      setDisableCode("");
      Alert.alert("Thành công", "Xác thực 2 yếu tố đã được tắt");
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [disableCode, disable]);

  const handleRegenerateBackupCodes = useCallback(async () => {
    if (regenerateCode.length !== 6) {
      Alert.alert("Lỗi", "Vui lòng nhập mã 6 số");
      return;
    }

    const newCodes = await regenerateBackupCodes(regenerateCode);

    if (newCodes) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowRegenerateModal(false);
      setRegenerateCode("");
      setShowBackupCodes(true);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [regenerateCode, regenerateBackupCodes]);

  const copySecret = useCallback(() => {
    if (setupData?.secret) {
      Clipboard.setString(setupData.secret);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Alert.alert("Đã sao chép", "Secret key đã được sao chép");
    }
  }, [setupData]);

  const copyBackupCodes = useCallback(() => {
    if (backupCodes) {
      Clipboard.setString(backupCodes.join("\n"));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Alert.alert("Đã sao chép", "Mã dự phòng đã được sao chép");
    }
  }, [backupCodes]);

  // ============================================
  // Render Helpers
  // ============================================

  const renderStatusCard = () => {
    if (loading && step === "idle") {
      return (
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <ActivityIndicator color={colors.primary} />
        </View>
      );
    }

    const isEnabled = status?.enabled;

    return (
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusIcon,
              {
                backgroundColor: isEnabled
                  ? colors.success + "20"
                  : colors.warning + "20",
              },
            ]}
          >
            <Ionicons
              name={isEnabled ? "shield-checkmark" : "shield-outline"}
              size={28}
              color={isEnabled ? colors.success : colors.warning}
            />
          </View>
          <View style={styles.statusInfo}>
            <Text style={[styles.statusTitle, { color: colors.text }]}>
              Xác thực 2 yếu tố
            </Text>
            <Text
              style={[
                styles.statusSubtitle,
                { color: isEnabled ? colors.success : colors.warning },
              ]}
            >
              {isEnabled ? "Đã bật" : "Chưa bật"}
            </Text>
          </View>
        </View>

        {isEnabled && status?.backupCodesRemaining !== undefined && (
          <View style={styles.backupInfo}>
            <Text style={[styles.backupLabel, { color: colors.textSecondary }]}>
              Mã dự phòng còn lại:
            </Text>
            <Text
              style={[
                styles.backupCount,
                {
                  color:
                    status.backupCodesRemaining < 3
                      ? colors.error
                      : colors.text,
                },
              ]}
            >
              {status.backupCodesRemaining} / 10
            </Text>
          </View>
        )}

        {/* Action button */}
        {isEnabled ? (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: colors.primary + "15" },
              ]}
              onPress={() => setShowBackupCodes(true)}
            >
              <Ionicons name="key-outline" size={18} color={colors.primary} />
              <Text style={[styles.actionText, { color: colors.primary }]}>
                Xem mã dự phòng
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: colors.error + "15" },
              ]}
              onPress={() => setShowDisableModal(true)}
            >
              <Ionicons
                name="close-circle-outline"
                size={18}
                color={colors.error}
              />
              <Text style={[styles.actionText, { color: colors.error }]}>
                Tắt 2FA
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.enableButton, { backgroundColor: colors.primary }]}
            onPress={handleStartSetup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color="#FFF"
                />
                <Text style={styles.enableButtonText}>
                  Bật xác thực 2 yếu tố
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderSetupWizard = () => {
    if (step !== "setup" && step !== "verify") return null;

    return (
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Thiết lập xác thực 2 yếu tố
        </Text>

        {/* Step 1: QR Code */}
        {setupData && (
          <>
            <Text style={[styles.stepTitle, { color: colors.text }]}>
              Bước 1: Quét mã QR
            </Text>
            <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
              Mở ứng dụng xác thực (Google Authenticator, Authy, ...) và quét mã
              QR này:
            </Text>

            {setupData.qrCodeDataUrl && (
              <View style={styles.qrContainer}>
                <Image
                  source={{ uri: setupData.qrCodeDataUrl }}
                  style={styles.qrImage}
                  resizeMode="contain"
                />
              </View>
            )}

            {/* Manual entry */}
            <View style={styles.manualEntry}>
              <Text
                style={[styles.manualLabel, { color: colors.textSecondary }]}
              >
                Hoặc nhập thủ công:
              </Text>
              <TouchableOpacity
                style={[
                  styles.secretBox,
                  { backgroundColor: colors.background },
                ]}
                onPress={copySecret}
              >
                <Text style={[styles.secretText, { color: colors.text }]}>
                  {setupData.secret}
                </Text>
                <Ionicons
                  name="copy-outline"
                  size={18}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>

            {/* Step 2: Verify */}
            <Text
              style={[styles.stepTitle, { color: colors.text, marginTop: 24 }]}
            >
              Bước 2: Nhập mã xác thực
            </Text>
            <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
              Nhập mã 6 số từ ứng dụng xác thực:
            </Text>

            <TextInput
              style={[
                styles.codeInput,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: error ? colors.error : colors.border,
                },
              ]}
              value={code}
              onChangeText={setCode}
              placeholder="000000"
              placeholderTextColor={colors.textSecondary}
              keyboardType="number-pad"
              maxLength={6}
              textAlign="center"
            />

            {error && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {error}
                {remainingAttempts !== null &&
                  ` (Còn ${remainingAttempts} lần thử)`}
              </Text>
            )}

            <View style={styles.wizardActions}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: colors.border }]}
                onPress={reset}
              >
                <Text
                  style={[
                    styles.cancelBtnText,
                    { color: colors.textSecondary },
                  ]}
                >
                  Hủy
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.verifyBtn,
                  {
                    backgroundColor:
                      code.length === 6 ? colors.primary : colors.border,
                  },
                ]}
                onPress={handleVerify}
                disabled={code.length !== 6 || loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.verifyBtnText}>Xác nhận</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    );
  };

  const renderBackupCodesModal = () => {
    if (!showBackupCodes || !backupCodes) return null;

    return (
      <View style={styles.modalOverlay}>
        <View style={[styles.modal, { backgroundColor: colors.surface }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            Mã dự phòng
          </Text>
          <Text style={[styles.modalDesc, { color: colors.textSecondary }]}>
            Lưu các mã này ở nơi an toàn. Bạn có thể dùng để đăng nhập khi không
            có ứng dụng xác thực.
          </Text>

          <View
            style={[
              styles.codesContainer,
              { backgroundColor: colors.background },
            ]}
          >
            {backupCodes.map((backupCode, index) => (
              <Text
                key={index}
                style={[styles.backupCode, { color: colors.text }]}
              >
                {backupCode}
              </Text>
            ))}
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[
                styles.copyCodesBtn,
                { backgroundColor: colors.primary + "15" },
              ]}
              onPress={copyBackupCodes}
            >
              <Ionicons name="copy-outline" size={18} color={colors.primary} />
              <Text
                style={[styles.copyCodesBtnText, { color: colors.primary }]}
              >
                Sao chép tất cả
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.closeModalBtn,
                { backgroundColor: colors.primary },
              ]}
              onPress={() => setShowBackupCodes(false)}
            >
              <Text style={styles.closeModalBtnText}>Đã lưu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderDisableModal = () => {
    if (!showDisableModal) return null;

    return (
      <View style={styles.modalOverlay}>
        <View style={[styles.modal, { backgroundColor: colors.surface }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            Tắt xác thực 2 yếu tố
          </Text>
          <Text style={[styles.modalDesc, { color: colors.textSecondary }]}>
            Nhập mã từ ứng dụng xác thực để xác nhận:
          </Text>

          <TextInput
            style={[
              styles.codeInput,
              {
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            value={disableCode}
            onChangeText={setDisableCode}
            placeholder="000000"
            placeholderTextColor={colors.textSecondary}
            keyboardType="number-pad"
            maxLength={6}
            textAlign="center"
          />

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.cancelBtn, { borderColor: colors.border }]}
              onPress={() => {
                setShowDisableModal(false);
                setDisableCode("");
              }}
            >
              <Text
                style={[styles.cancelBtnText, { color: colors.textSecondary }]}
              >
                Hủy
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.verifyBtn,
                {
                  backgroundColor:
                    disableCode.length === 6 ? colors.error : colors.border,
                },
              ]}
              onPress={handleDisable}
              disabled={disableCode.length !== 6 || loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.verifyBtnText}>Tắt 2FA</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // ============================================
  // Main Render
  // ============================================

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Info banner */}
        <View
          style={[styles.infoBanner, { backgroundColor: colors.info + "15" }]}
        >
          <Ionicons name="information-circle" size={20} color={colors.info} />
          <Text style={[styles.infoBannerText, { color: colors.info }]}>
            Xác thực 2 yếu tố thêm lớp bảo mật cho tài khoản của bạn
          </Text>
        </View>

        {/* Status card */}
        {renderStatusCard()}

        {/* Setup wizard */}
        {renderSetupWizard()}
      </ScrollView>

      {/* Modals */}
      {renderBackupCodesModal()}
      {renderDisableModal()}
    </View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 10,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  statusIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  backupInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  backupLabel: {
    fontSize: 14,
  },
  backupCount: {
    fontSize: 14,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 12,
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  enableButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  enableButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
  },
  stepDesc: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  qrContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  qrImage: {
    width: 200,
    height: 200,
    backgroundColor: "#FFF",
    borderRadius: 12,
  },
  manualEntry: {
    marginBottom: 8,
  },
  manualLabel: {
    fontSize: 13,
    marginBottom: 8,
  },
  secretBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 8,
  },
  secretText: {
    fontSize: 14,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    flex: 1,
  },
  codeInput: {
    height: 56,
    borderWidth: 2,
    borderRadius: 12,
    fontSize: 28,
    fontWeight: "600",
    letterSpacing: 8,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 13,
    marginBottom: 12,
    textAlign: "center",
  },
  wizardActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: "500",
  },
  verifyBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  verifyBtnText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "600",
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modal: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  modalDesc: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  codesContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
  },
  backupCode: {
    fontSize: 14,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontWeight: "600",
  },
  modalActions: {
    gap: 12,
  },
  copyCodesBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  copyCodesBtnText: {
    fontSize: 15,
    fontWeight: "500",
  },
  closeModalBtn: {
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  closeModalBtnText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "600",
  },
});
